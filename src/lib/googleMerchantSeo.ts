import { Category, MenuItem, RestaurantSetting } from '../types/restaurant';
import { getCulinaryVisualUrl } from './culinaryVisuals';

const OFFICIAL_DOMAIN = 'https://faminasrestaurant.com';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function resolveAbsoluteImageUrl(item: MenuItem): string {
  const localPath = getCulinaryVisualUrl(
    item.imageKey,
    item.name,
    item.categoryName,
    item.imageUrl
  );
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) {
    return localPath;
  }
  if (localPath.startsWith('data:image/')) {
    return `${OFFICIAL_DOMAIN}/assets/menu_ref/achecke_grill_fish.jpg`;
  }
  return `${OFFICIAL_DOMAIN}${localPath.startsWith('/') ? '' : '/'}${localPath}`;
}

/**
 * Builds the combined Schema.org JSON-LD @graph containing:
 * 1. Restaurant (LocalBusiness + FoodEstablishment + Menu + MenuSection + MenuItem)
 * 2. ItemList of Product + Offer structured data for Google Merchant Center & Google Search Shopping Snippets
 */
export function buildGoogleMerchantAndRestaurantJsonLd(
  menuItems: MenuItem[],
  categories: Category[],
  settings: RestaurantSetting
): Record<string, unknown> {
  const menuSections = categories.map((cat) => {
    const itemsInSection = menuItems.filter((m) => m.categoryId === cat.id);
    return {
      '@type': 'MenuSection',
      name: cat.name,
      description: cat.description,
      hasMenuItem: itemsInSection.map((item) => ({
        '@type': 'MenuItem',
        '@id': `${OFFICIAL_DOMAIN}/#menuitem-${item.id}`,
        name: item.name,
        description: item.description,
        image: resolveAbsoluteImageUrl(item),
        offers: {
          '@type': 'Offer',
          price: item.price.toFixed(2),
          priceCurrency: 'USD',
          availability: item.isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `${OFFICIAL_DOMAIN}/?dish=${encodeURIComponent(item.id)}`,
        },
      })),
    };
  });

  const merchantProducts = menuItems.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    item: {
      '@type': 'Product',
      '@id': `${OFFICIAL_DOMAIN}/#product-${item.id}`,
      sku: item.id,
      mpn: `FAMINAS-${item.id.toUpperCase()}`,
      name: item.name,
      description: item.description,
      image: [resolveAbsoluteImageUrl(item)],
      category: item.categoryName,
      brand: {
        '@type': 'Brand',
        name: settings.restaurantName || 'FAMINAS AFRICAN AND AMERICANS RESTAURANT',
      },
      offers: {
        '@type': 'Offer',
        url: `${OFFICIAL_DOMAIN}/?dish=${encodeURIComponent(item.id)}`,
        priceCurrency: 'USD',
        price: item.price.toFixed(2),
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: item.isAvailable
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Restaurant',
          name: settings.restaurantName || 'FAMINAS AFRICAN AND AMERICANS RESTAURANT',
          telephone: '+1-856-522-3029',
        },
      },
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Restaurant', 'FoodEstablishment', 'LocalBusiness'],
        '@id': `${OFFICIAL_DOMAIN}/#restaurant`,
        name: settings.restaurantName || 'FAMINAS AFRICAN AND AMERICANS RESTAURANT',
        url: OFFICIAL_DOMAIN,
        telephone: '+1-856-522-3029',
        email: settings.email || 'info@faminasrestaurant.com',
        slogan: settings.tagline || 'Good Food Brings People Together.',
        priceRange: '$$',
        image: [
          `${OFFICIAL_DOMAIN}/assets/menu_ref/achecke_grill_fish.jpg`,
          `${OFFICIAL_DOMAIN}/assets/menu_ref/cassava_leaf.jpg`,
          `${OFFICIAL_DOMAIN}/assets/menu_ref/egusi_foofoo.jpg`,
          `${OFFICIAL_DOMAIN}/assets/menu_ref/rice_beans_oxtail.jpg`,
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: '577 Blackwood-Clementon Road',
          addressLocality: 'Lindenwold',
          addressRegion: 'NJ',
          postalCode: '08021',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 39.8221,
          longitude: -74.9968,
        },
        servesCuisine: [
          'Sierra Leonean',
          'West African',
          'African',
          'American',
        ],
        acceptsReservations: 'True',
        potentialAction: {
          '@type': 'OrderAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${OFFICIAL_DOMAIN}/?page=ordering`,
            inLanguage: 'en-US',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          deliveryMethod: [
            'http://purl.org/goodrelations/v1#DeliveryModePickUp',
            'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
          ],
        },
        hasMenu: {
          '@type': 'Menu',
          '@id': `${OFFICIAL_DOMAIN}/#menu`,
          name: 'FAMINAS AFRICAN AND AMERICANS RESTAURANT Official Menu',
          url: `${OFFICIAL_DOMAIN}/?page=menu`,
          hasMenuSection: menuSections,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${OFFICIAL_DOMAIN}/#google-merchant-catalog`,
        name: 'FAMINAS AFRICAN AND AMERICANS RESTAURANT – Google Merchant Product Catalog',
        numberOfItems: menuItems.length,
        itemListElement: merchantProducts,
      },
    ],
  };
}

/**
 * Generates a complete Google Merchant Center RSS 2.0 XML Product Feed from the live menu items.
 */
export function generateGoogleMerchantXmlFeed(
  menuItems: MenuItem[],
  settings: RestaurantSetting
): string {
  const brandName = settings.restaurantName || 'FAMINAS AFRICAN AND AMERICANS RESTAURANT';
  const itemsXml = menuItems
    .map((item) => {
      const availability = item.isAvailable ? 'in_stock' : 'out_of_stock';
      const productCategory =
        item.categoryId === 'cat-natural-drinks'
          ? 'Food, Beverages &amp; Tobacco &gt; Beverages'
          : 'Food, Beverages &amp; Tobacco &gt; Food Items &gt; Prepared Foods';
      const imgUrl = resolveAbsoluteImageUrl(item);

      return [
        '    <item>',
        `      <g:id>${escapeXml(item.id)}</g:id>`,
        `      <g:title>${escapeXml(item.name)}</g:title>`,
        `      <g:description>${escapeXml(item.description)}</g:description>`,
        `      <g:link>${OFFICIAL_DOMAIN}/?dish=${encodeURIComponent(item.id)}</g:link>`,
        `      <g:image_link>${escapeXml(imgUrl)}</g:image_link>`,
        `      <g:availability>${availability}</g:availability>`,
        `      <g:price>${item.price.toFixed(2)} USD</g:price>`,
        `      <g:brand>${escapeXml(brandName)}</g:brand>`,
        '      <g:condition>new</g:condition>',
        '      <g:identifier_exists>no</g:identifier_exists>',
        `      <g:google_product_category>${productCategory}</g:google_product_category>`,
        `      <g:custom_label_0>${escapeXml(item.categoryName)}</g:custom_label_0>`,
        `      <g:custom_label_1>${item.isFeatured ? 'Daily Special' : 'Standard Menu'}</g:custom_label_1>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    `    <title>${escapeXml(brandName)} – Official Google Merchant Product Feed</title>`,
    `    <link>${OFFICIAL_DOMAIN}</link>`,
    '    <description>Authentic Sierra Leonean, West African, and American dishes freshly prepared at 577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA. Phone: +1 (856) 522-3029.</description>',
    itemsXml,
    '  </channel>',
    '</rss>',
  ].join('\n');
}

/**
 * Generates a tab-separated values (TSV) file compatible with Google Merchant Center Google Sheets / file upload.
 */
export function generateGoogleMerchantTsvFeed(
  menuItems: MenuItem[],
  settings: RestaurantSetting
): string {
  const brandName = settings.restaurantName || 'FAMINAS AFRICAN AND AMERICANS RESTAURANT';
  const headers = [
    'id',
    'title',
    'description',
    'link',
    'image_link',
    'availability',
    'price',
    'brand',
    'condition',
    'identifier_exists',
    'google_product_category',
    'custom_label_0',
    'custom_label_1',
  ];

  const rows = menuItems.map((item) => {
    const cleanText = (val: string) => val.replace(/[\t\r\n]+/g, ' ').trim();
    return [
      cleanText(item.id),
      cleanText(item.name),
      cleanText(item.description),
      `${OFFICIAL_DOMAIN}/?dish=${encodeURIComponent(item.id)}`,
      resolveAbsoluteImageUrl(item),
      item.isAvailable ? 'in_stock' : 'out_of_stock',
      `${item.price.toFixed(2)} USD`,
      cleanText(brandName),
      'new',
      'no',
      item.categoryId === 'cat-natural-drinks'
        ? 'Food, Beverages & Tobacco > Beverages'
        : 'Food, Beverages & Tobacco > Food Items > Prepared Foods',
      cleanText(item.categoryName),
      item.isFeatured ? 'Daily Special' : 'Standard Menu',
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}
