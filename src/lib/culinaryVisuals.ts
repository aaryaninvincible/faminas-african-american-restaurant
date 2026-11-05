/**
 * Authentic Culinary Photography & Visual Resolver
 * Maps every menu item and gallery item to real, natural, high-resolution local photographs
 * of Sierra Leonean, West African, and American dishes from the official FAMINAS menu.
 */

const CACHE_VER = '?v=natural3';

export const MENU_REF_PHOTOS: Record<string, string> = {
  achecke_grilled_fish: `/assets/menu_ref/achecke_grill_fish.jpg${CACHE_VER}`,
  achecke_fried_fish: `/assets/menu_ref/achecke_fry_fish.jpg${CACHE_VER}`,
  grilled_fish: `/assets/menu_ref/grill_fish_salad.jpg${CACHE_VER}`,
  dibi_achecke: `/assets/menu_ref/lamb_grill_plantain.jpg${CACHE_VER}`,
  kankakan_suya: `/assets/menu_ref/kankakan_suya.jpg${CACHE_VER}`,
  cassava_leaves: `/assets/menu_ref/cassava_leaf.jpg${CACHE_VER}`,
  potato_leaves: `/assets/menu_ref/potato_leaf.jpg${CACHE_VER}`,
  okra_soup: `/assets/menu_ref/okra_soup.jpg${CACHE_VER}`,
  fufu: `/assets/menu_ref/foofoo_sawa.jpg${CACHE_VER}`,
  palava_sauce: `/assets/menu_ref/kran_kran_palava.jpg${CACHE_VER}`,
  egusi_soup: `/assets/menu_ref/egusi_foofoo.jpg${CACHE_VER}`,
  groundnut_soup: `/assets/menu_ref/roast_beef_peanut.jpg${CACHE_VER}`,
  grilled_lamb: `/assets/menu_ref/lamb_grill_plantain.jpg${CACHE_VER}`,
  lamb_grill_plantain: `/assets/menu_ref/lamb_grill_plantain.jpg${CACHE_VER}`,
  pepper_soup: `/assets/menu_ref/pepper_soup.jpg${CACHE_VER}`,
  goat_meat: `/assets/menu_ref/pepper_soup.jpg${CACHE_VER}`,
  grilled_chicken: `/assets/menu_ref/pepper_chicken.jpg${CACHE_VER}`,
  pepper_chicken: `/assets/menu_ref/pepper_chicken.jpg${CACHE_VER}`,
  chicken_wings: `/assets/menu_ref/chicken_wings_fries.jpg${CACHE_VER}`,
  jollof_rice: `/assets/menu_ref/jollof_rice_stew.jpg${CACHE_VER}`,
  waakye: `/assets/menu_ref/rice_beans_oxtail.jpg${CACHE_VER}`,
  rice_beans_oxtail: `/assets/menu_ref/rice_beans_oxtail.jpg${CACHE_VER}`,
  rice_and_beans: `/assets/menu_ref/black_eye_beans_oil.jpg${CACHE_VER}`,
  bambara_beans: `/assets/menu_ref/black_eye_beans_palm.jpg${CACHE_VER}`,
  cheeseburger: `/assets/menu_ref/hamburger_fries.jpg${CACHE_VER}`,
  hamburger_fries: `/assets/menu_ref/hamburger_fries.jpg${CACHE_VER}`,
  cheesesteak_fries: `/assets/menu_ref/cheesesteak_fries.jpg${CACHE_VER}`,
  mac_and_cheese: `/assets/menu_ref/mac_and_cheese.jpg${CACHE_VER}`,
  mashed_potatoes: `/assets/menu_ref/mashed_potatoes.jpg${CACHE_VER}`,
  meat_pie: `/assets/menu_ref/meat_pie.jpg${CACHE_VER}`,
  fish_pie: `/assets/menu_ref/fish_pie.jpg${CACHE_VER}`,
  puff_puff: `/assets/menu_ref/puff_puff.jpg${CACHE_VER}`,
  spring_roll: `/assets/menu_ref/spring_roll.jpg${CACHE_VER}`,
  ginger_beer: `/assets/menu_ref/ginger_beer.jpg${CACHE_VER}`,
  bissab_drink: `/assets/menu_ref/bissab.jpg${CACHE_VER}`,
};

export function getCulinaryVisualUrl(
  imageKey: string,
  title: string,
  categoryLabel = 'Faminas Signature',
  customImageUrl?: string
): string {
  const normalizedKey = (imageKey || '').trim().toLowerCase();
  const searchStr = `${normalizedKey} ${title} ${categoryLabel}`.toLowerCase();

  // Priority distinct matches for video-sourced natural dishes
  if (searchStr.includes('sawa')) {
    return `/assets/menu_ref/foofoo_sawa.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('pepper chicken')) {
    return `/assets/menu_ref/pepper_chicken.jpg${CACHE_VER}`;
  }
  if ((searchStr.includes('grill fish') || searchStr.includes('grilled fish')) && searchStr.includes('salad')) {
    return `/assets/menu_ref/grill_fish_salad.jpg${CACHE_VER}`;
  }

  // Respect /assets/menu_ref/ path if already set (with fresh cache version)
  if (customImageUrl && customImageUrl.startsWith('/assets/menu_ref/')) {
    const clean = customImageUrl.split('?')[0];
    return `${clean}${CACHE_VER}`;
  }

  // Priority match to real Faminas menu photos
  if (MENU_REF_PHOTOS[normalizedKey]) {
    return MENU_REF_PHOTOS[normalizedKey];
  }

  if (searchStr.includes('achecke') && (searchStr.includes('fry') || searchStr.includes('fried'))) {
    return `/assets/menu_ref/achecke_fry_fish.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('achecke') && searchStr.includes('fish')) {
    return `/assets/menu_ref/achecke_grill_fish.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('grill fish') || searchStr.includes('grilled fish')) {
    return `/assets/menu_ref/grill_fish_salad.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('dibi')) {
    return `/assets/menu_ref/lamb_grill_plantain.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('kankakan') || searchStr.includes('suya')) {
    return `/assets/menu_ref/kankakan_suya.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('cassava') && searchStr.includes('leaf')) {
    return `/assets/menu_ref/cassava_leaf.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('potato') && searchStr.includes('leaf')) {
    return `/assets/menu_ref/potato_leaf.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('kran kran') || searchStr.includes('jute') || searchStr.includes('palava')) {
    return `/assets/menu_ref/kran_kran_palava.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('okra') || searchStr.includes('okro')) {
    return `/assets/menu_ref/okra_soup.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('egusi')) {
    return `/assets/menu_ref/egusi_foofoo.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('peanut') || searchStr.includes('groundnut')) {
    return `/assets/menu_ref/roast_beef_peanut.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('lamb')) {
    return `/assets/menu_ref/lamb_grill_plantain.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('pepper soup')) {
    return `/assets/menu_ref/pepper_soup.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('wing')) {
    return `/assets/menu_ref/chicken_wings_fries.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('oxtail')) {
    return `/assets/menu_ref/rice_beans_oxtail.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('palm oil') && searchStr.includes('bean')) {
    return `/assets/menu_ref/black_eye_beans_palm.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('bean')) {
    return `/assets/menu_ref/black_eye_beans_oil.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('jollof')) {
    return `/assets/menu_ref/jollof_rice_stew.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('cheese steak') || searchStr.includes('cheesesteak')) {
    return `/assets/menu_ref/cheesesteak_fries.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('hamburger') || searchStr.includes('burger')) {
    return `/assets/menu_ref/hamburger_fries.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('mac and cheese')) {
    return `/assets/menu_ref/mac_and_cheese.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('mash') && searchStr.includes('potato')) {
    return `/assets/menu_ref/mashed_potatoes.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('meat pie')) {
    return `/assets/menu_ref/meat_pie.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('fish pie')) {
    return `/assets/menu_ref/fish_pie.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('puff puff')) {
    return `/assets/menu_ref/puff_puff.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('spring roll') || searchStr.includes('vegetable roll')) {
    return `/assets/menu_ref/spring_roll.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('ginger beer') || searchStr.includes('ginger')) {
    return `/assets/menu_ref/ginger_beer.jpg${CACHE_VER}`;
  }
  if (searchStr.includes('bissab') || searchStr.includes('sorrel') || searchStr.includes('hibiscus')) {
    return `/assets/menu_ref/bissab.jpg${CACHE_VER}`;
  }

  return `/assets/menu_ref/achecke_grill_fish.jpg${CACHE_VER}`;
}
