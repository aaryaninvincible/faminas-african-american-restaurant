import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

interface OrderLineItemPayload {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstructions?: string;
}

interface OrderPayload {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  specialInstructions?: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  itemsSummary: string;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAtIso?: string;
}

interface NotificationConfigPayload {
  ownerEmail: string;
  ownerPhone: string;
  additionalEmails: string[];
  additionalPhones: string[];
  smsEnabled: boolean;
  emailEnabled: boolean;
  customerNotificationsEnabled: boolean;
}

interface ChannelDispatchResult {
  channel: 'sms' | 'email';
  provider: string;
  providerConfigured: boolean;
  success: boolean;
  status: 'delivered' | 'failed' | 'unconfigured' | 'disabled' | 'duplicate_skipped';
  recipients: string[];
  subject?: string;
  messagePreview: string;
  htmlBody?: string;
  errorMessage?: string;
  externalMessageId?: string;
  attempts: number;
  dispatchedAtIso: string;
}

// Server-side idempotency store to prevent duplicate notifications for the same order + event + channel
const deliveredEventKeys = new Set<string>();

function sanitizePhone(phone: string): string {
  const trimmed = (phone || '').trim();
  const digits = trimmed.replace(/[^0-9+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) return digits;
  const cleanDigits = digits.replace(/[^0-9]/g, '');
  if (cleanDigits.length === 10) return `+1${cleanDigits}`;
  if (cleanDigits.length === 11 && cleanDigits.startsWith('1')) return `+${cleanDigits}`;
  return `+${cleanDigits}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

function getProviderConfigStatus() {
  const twilioSid = (
    process.env.TWILIO_ACCOUNT_SID || ''
  ).trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioFrom = (process.env.TWILIO_FROM_PHONE || '').trim();
  const smsConfigured = Boolean(twilioSid && twilioToken && twilioFrom);

  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const sendgridKey = (process.env.SENDGRID_API_KEY || '').trim();
  const emailConfigured = Boolean(resendKey || sendgridKey);
  const emailProvider = resendKey ? 'Resend' : sendgridKey ? 'SendGrid' : 'Unconfigured (Resend / SendGrid)';

  return {
    smsConfigured,
    smsProvider: smsConfigured ? 'Twilio SMS' : 'Twilio SMS (Credentials Pending in Secrets)',
    twilioFromPhone: twilioFrom ? `${twilioFrom.slice(0, 5)}***${twilioFrom.slice(-2)}` : null,
    emailConfigured,
    emailProvider,
    fromEmail:
      (process.env.NOTIFICATION_FROM_EMAIL || '').trim() ||
      'FAMINAS Restaurant <orders@faminasrestaurant.com>',
    defaultOwnerPhone: (process.env.OWNER_NOTIFICATION_PHONE || '+18565223029').trim(),
    defaultOwnerEmail: (process.env.OWNER_NOTIFICATION_EMAIL || 'swaraysheku12@gmail.com').trim(),
  };
}

function formatPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'cash_on_pickup':
      return 'Cash on Pickup';
    case 'cash_on_delivery':
      return 'Cash on Delivery';
    case 'online_card':
      return 'Online Card Payment';
    case 'whatsapp_order':
      return 'WhatsApp Order';
    default:
      return method.replace(/_/g, ' ');
  }
}

function buildOwnerNewOrderSmsBody(order: OrderPayload, items: OrderLineItemPayload[]): string {
  const cleanRef = order.orderReference.startsWith('#')
    ? order.orderReference
    : `#${order.orderReference}`;
  const orderType = order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup';
  const itemsText =
    items && items.length > 0
      ? items.map((i) => (i.quantity > 1 ? `${i.quantity}x ${i.name}` : i.name)).join(', ')
      : order.itemsSummary;

  return [
    `NEW FAMINAS FOOD ORDER!`,
    ``,
    `Order Number: ${cleanRef}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Order Total: $${Number(order.totalAmount || 0).toFixed(2)}`,
    `Order Type: ${orderType}`,
    `Items: ${itemsText}`,
    ``,
    `Please log in to the FAMINAS Admin Dashboard to view and process this order.`,
  ].join('\n');
}

function buildOwnerNewOrderEmail(
  order: OrderPayload,
  items: OrderLineItemPayload[]
): { subject: string; textBody: string; htmlBody: string } {
  const cleanRef = order.orderReference.startsWith('#')
    ? order.orderReference
    : `#${order.orderReference}`;
  const subject = `NEW FOOD ORDER RECEIVED – FAMINAS RESTAURANT – ORDER ${cleanRef}`;
  const orderDateStr = order.createdAtIso
    ? new Date(order.createdAtIso).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
  const orderTypeLabel =
    order.fulfillmentType === 'delivery'
      ? `Delivery (${order.deliveryAddress || 'Address provided'})`
      : 'In-Restaurant Pickup (577 Blackwood-Clementon Rd, Lindenwold, NJ 08021)';
  const paymentMethodLabel = formatPaymentMethodLabel(order.paymentMethod);
  const paymentStatusLabel = (order.paymentStatus || 'pending').toUpperCase();

  const itemLinesText =
    items && items.length > 0
      ? items
          .map(
            (item) =>
              `• ${item.quantity}x ${item.name} (@ $${Number(item.unitPrice).toFixed(2)} each) = $${Number(
                item.lineTotal
              ).toFixed(2)}${item.specialInstructions ? ` [Note: ${item.specialInstructions}]` : ''}`
          )
          .join('\n')
      : `• ${order.itemsSummary}`;

  const textBody = [
    `NEW FOOD ORDER RECEIVED – FAMINAS RESTAURANT`,
    `============================================================`,
    `Order Number: ${cleanRef}`,
    `Order Date & Time: ${orderDateStr}`,
    `Customer Name: ${order.customerName}`,
    `Customer Phone: ${order.customerPhone}`,
    `Customer Email: ${order.customerEmail || 'Not provided'}`,
    `Fulfillment Type: ${orderTypeLabel}`,
    `Payment Method: ${paymentMethodLabel}`,
    `Payment Status: ${paymentStatusLabel}`,
    `Customer Instructions: ${order.specialInstructions || 'None'}`,
    ``,
    `ORDERED ITEMS:`,
    itemLinesText,
    `------------------------------------------------------------`,
    `Subtotal: $${Number(order.subtotal || 0).toFixed(2)}`,
    `Tax: $${Number(order.taxAmount || 0).toFixed(2)}`,
    `Delivery Fee: $${Number(order.deliveryFee || 0).toFixed(2)}`,
    `TOTAL AMOUNT: $${Number(order.totalAmount || 0).toFixed(2)} USD`,
    `============================================================`,
    `FAMINAS AFRICAN AND AMERICANS RESTAURANT`,
    `577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA`,
    `Phone: +1 (856) 522-3029 · faminasrestaurant.com`,
  ].join('\n');

  const itemRowsHtml =
    items && items.length > 0
      ? items
          .map(
            (item) => `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #E6DEC8;color:#21150F;font-weight:600;">
                ${item.name}
                ${
                  item.specialInstructions
                    ? `<div style="font-size:12px;color:#3B3029;font-weight:400;margin-top:3px;">Note: ${item.specialInstructions}</div>`
                    : ''
                }
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid #E6DEC8;text-align:center;color:#21150F;font-family:monospace;">
                ${item.quantity}
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid #E6DEC8;text-align:right;color:#3B3029;font-family:monospace;">
                $${Number(item.unitPrice).toFixed(2)}
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid #E6DEC8;text-align:right;color:#21150F;font-weight:700;font-family:monospace;">
                $${Number(item.lineTotal).toFixed(2)}
              </td>
            </tr>`
          )
          .join('')
      : `
        <tr>
          <td colspan="4" style="padding:12px;border-bottom:1px solid #E6DEC8;color:#21150F;">
            ${order.itemsSummary}
          </td>
        </tr>`;

  const htmlBody = `
  <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:660px;margin:0 auto;background:#F7F3EA;border:2px solid #C9A45C;border-radius:14px;overflow:hidden;color:#21150F;">
    <div style="background:#21150F;padding:24px 28px;border-bottom:3px solid #C9A45C;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#C9A45C;font-weight:700;">
        FAMINAS AFRICAN AND AMERICANS RESTAURANT · NEW ORDER ALERT
      </div>
      <h1 style="margin:6px 0 4px;font-size:24px;color:#F7F3EA;font-family:Georgia,serif;">
        Order ${cleanRef} — $${Number(order.totalAmount || 0).toFixed(2)}
      </h1>
      <div style="font-size:13px;color:#C9A45C;">
        Received ${orderDateStr} · ${order.fulfillmentType === 'delivery' ? 'DELIVERY ORDER' : 'PICKUP ORDER'}
      </div>
    </div>

    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#FFFFFF;border:1px solid #C9A45C;border-radius:10px;">
        <tbody>
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#3B3029;width:38%;"><strong>Order Number</strong></td>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:14px;color:#21150F;font-weight:700;font-family:monospace;">${cleanRef}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#3B3029;"><strong>Customer Name</strong></td>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:14px;color:#21150F;font-weight:600;">${order.customerName}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#3B3029;"><strong>Customer Phone</strong></td>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:14px;color:#21150F;font-weight:600;">${order.customerPhone}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#3B3029;"><strong>Customer Email</strong></td>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:14px;color:#21150F;">${order.customerEmail || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#3B3029;"><strong>Order Type &amp; Address</strong></td>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:14px;color:#254B37;font-weight:700;">${orderTypeLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#3B3029;"><strong>Payment Method &amp; Status</strong></td>
            <td style="padding:10px 14px;border-bottom:1px solid #EFE9DC;font-size:13px;color:#21150F;">
              <strong>${paymentMethodLabel}</strong> · Status: <span style="background:#FFF3CD;color:#7A4F01;padding:2px 8px;border-radius:4px;font-weight:700;">${paymentStatusLabel}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 14px;font-size:13px;color:#3B3029;"><strong>Customer Instructions</strong></td>
            <td style="padding:10px 14px;font-size:13px;color:#21150F;">${order.specialInstructions || 'None provided'}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="margin:0 0 10px;font-size:15px;text-transform:uppercase;letter-spacing:1px;color:#21150F;">
        Complete Food Item List
      </h3>
      <table style="width:100%;border-collapse:collapse;background:#FFFFFF;border:1px solid #C9A45C;border-radius:10px;overflow:hidden;margin-bottom:18px;">
        <thead>
          <tr style="background:#21150F;color:#C9A45C;font-size:12px;text-transform:uppercase;">
            <th style="padding:10px 12px;text-align:left;">Dish</th>
            <th style="padding:10px 12px;text-align:center;">Qty</th>
            <th style="padding:10px 12px;text-align:right;">Unit Price</th>
            <th style="padding:10px 12px;text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
        </tbody>
      </table>

      <div style="background:#21150F;color:#F7F3EA;padding:18px 20px;border-radius:10px;border:1px solid #C9A45C;">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
          <span>Subtotal:</span>
          <strong style="font-family:monospace;">$${Number(order.subtotal || 0).toFixed(2)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
          <span>Applicable Tax:</span>
          <strong style="font-family:monospace;">$${Number(order.taxAmount || 0).toFixed(2)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;">
          <span>Delivery Fee:</span>
          <strong style="font-family:monospace;">$${Number(order.deliveryFee || 0).toFixed(2)}</strong>
        </div>
        <div style="border-top:1px solid #C9A45C;padding-top:10px;display:flex;justify-content:space-between;font-size:18px;color:#C9A45C;font-weight:700;">
          <span>TOTAL AMOUNT:</span>
          <span style="font-family:monospace;">$${Number(order.totalAmount || 0).toFixed(2)} USD</span>
        </div>
      </div>
    </div>

    <div style="background:#3B3029;color:#F7F3EA;padding:16px 28px;font-size:12px;text-align:center;">
      <strong>FAMINAS AFRICAN AND AMERICANS RESTAURANT</strong><br/>
      577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA · Phone: +1 (856) 522-3029 · faminasrestaurant.com
    </div>
  </div>`;

  return { subject, textBody, htmlBody };
}

async function sendTwilioSmsWithRetry(
  recipients: string[],
  body: string,
  maxAttempts = 2
): Promise<ChannelDispatchResult> {
  const cleanRecipients = Array.from(new Set(recipients.map(sanitizePhone).filter(Boolean)));
  const nowIso = new Date().toISOString();
  const twilioSid = (
    process.env.TWILIO_ACCOUNT_SID || ''
  ).trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioFrom = (process.env.TWILIO_FROM_PHONE || '').trim();

  if (cleanRecipients.length === 0) {
    return {
      channel: 'sms',
      provider: 'Twilio SMS',
      providerConfigured: Boolean(twilioSid && twilioToken && twilioFrom),
      success: false,
      status: 'failed',
      recipients: [],
      messagePreview: body,
      errorMessage: 'No valid recipient phone number provided.',
      attempts: 0,
      dispatchedAtIso: nowIso,
    };
  }

  if (!twilioSid || !twilioToken || !twilioFrom) {
    return {
      channel: 'sms',
      provider: 'Twilio SMS',
      providerConfigured: false,
      success: false,
      status: 'unconfigured',
      recipients: cleanRecipients,
      messagePreview: body,
      errorMessage:
        'Twilio SMS environment secrets (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE) are not configured on the server yet. SMS payload logged for immediate retry once secrets are added.',
      attempts: 1,
      dispatchedAtIso: nowIso,
    };
  }

  let attempts = 0;
  let lastError = '';
  const messageSids: string[] = [];

  for (const toPhone of cleanRecipients) {
    let sentToRecipient = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attempts++;
      try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
          twilioSid
        )}/Messages.json`;
        const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
        const formData = new URLSearchParams();
        formData.append('To', toPhone);
        formData.append('From', twilioFrom);
        formData.append('Body', body);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const data = (await response.json()) as { sid?: string; message?: string };
        if (response.ok && data.sid) {
          messageSids.push(data.sid);
          sentToRecipient = true;
          break;
        } else {
          lastError = data.message || `Twilio HTTP ${response.status}`;
        }
      } catch (err: any) {
        lastError = err?.message || 'Twilio network request error';
      }
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }
    if (!sentToRecipient && !lastError) {
      lastError = `Failed to send SMS to ${toPhone}`;
    }
  }

  const allSucceeded = messageSids.length === cleanRecipients.length;
  return {
    channel: 'sms',
    provider: 'Twilio SMS',
    providerConfigured: true,
    success: allSucceeded,
    status: allSucceeded ? 'delivered' : 'failed',
    recipients: cleanRecipients,
    messagePreview: body,
    externalMessageId: messageSids.join(', ') || undefined,
    errorMessage: allSucceeded ? undefined : lastError,
    attempts,
    dispatchedAtIso: nowIso,
  };
}

async function sendTransactionalEmailWithRetry(
  recipients: string[],
  subject: string,
  textBody: string,
  htmlBody: string,
  maxAttempts = 2
): Promise<ChannelDispatchResult> {
  const cleanRecipients = Array.from(
    new Set(recipients.map((e) => (e || '').trim()).filter(isValidEmail))
  );
  const nowIso = new Date().toISOString();
  const resendKey = (process.env.RESEND_API_KEY || '').trim();
  const sendgridKey = (process.env.SENDGRID_API_KEY || '').trim();
  const fromEmail =
    (process.env.NOTIFICATION_FROM_EMAIL || '').trim() ||
    'FAMINAS Restaurant <orders@faminasrestaurant.com>';

  if (cleanRecipients.length === 0) {
    return {
      channel: 'email',
      provider: resendKey ? 'Resend' : sendgridKey ? 'SendGrid' : 'Transactional Email',
      providerConfigured: Boolean(resendKey || sendgridKey),
      success: false,
      status: 'failed',
      recipients: [],
      subject,
      messagePreview: textBody,
      htmlBody,
      errorMessage: 'No valid recipient email address provided.',
      attempts: 0,
      dispatchedAtIso: nowIso,
    };
  }

  if (!resendKey && !sendgridKey) {
    return {
      channel: 'email',
      provider: 'Resend / SendGrid',
      providerConfigured: false,
      success: false,
      status: 'unconfigured',
      recipients: cleanRecipients,
      subject,
      messagePreview: textBody,
      htmlBody,
      errorMessage:
        'Transactional email API key (RESEND_API_KEY or SENDGRID_API_KEY) is not configured in server environment secrets yet. Full HTML email logged for immediate retry.',
      attempts: 1,
      dispatchedAtIso: nowIso,
    };
  }

  let attempts = 0;
  let lastError = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts++;
    try {
      if (resendKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: cleanRecipients,
            subject,
            text: textBody,
            html: htmlBody,
          }),
        });
        const data = (await response.json()) as { id?: string; message?: string };
        if (response.ok && data.id) {
          return {
            channel: 'email',
            provider: 'Resend',
            providerConfigured: true,
            success: true,
            status: 'delivered',
            recipients: cleanRecipients,
            subject,
            messagePreview: textBody,
            htmlBody,
            externalMessageId: data.id,
            attempts,
            dispatchedAtIso: nowIso,
          };
        }
        lastError = data.message || `Resend HTTP ${response.status}`;
      } else if (sendgridKey) {
        const cleanFromAddress = fromEmail.includes('<')
          ? fromEmail.split('<')[1].replace('>', '').trim()
          : fromEmail;
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: cleanRecipients.map((email) => ({ email })) }],
            from: { email: cleanFromAddress, name: 'FAMINAS Restaurant' },
            subject,
            content: [
              { type: 'text/plain', value: textBody },
              { type: 'text/html', value: htmlBody },
            ],
          }),
        });
        if (response.ok || response.status === 202) {
          return {
            channel: 'email',
            provider: 'SendGrid',
            providerConfigured: true,
            success: true,
            status: 'delivered',
            recipients: cleanRecipients,
            subject,
            messagePreview: textBody,
            htmlBody,
            externalMessageId: response.headers.get('x-message-id') || `sg_${Date.now()}`,
            attempts,
            dispatchedAtIso: nowIso,
          };
        }
        const errText = await response.text();
        lastError = errText || `SendGrid HTTP ${response.status}`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Email provider network error';
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }

  return {
    channel: 'email',
    provider: resendKey ? 'Resend' : 'SendGrid',
    providerConfigured: true,
    success: false,
    status: 'failed',
    recipients: cleanRecipients,
    subject,
    messagePreview: textBody,
    htmlBody,
    errorMessage: lastError || 'Email dispatch failed',
    attempts,
    dispatchedAtIso: nowIso,
  };
}

// 1. Check Provider Status
app.get('/api/notifications/provider-status', (_req, res) => {
  res.json(getProviderConfigStatus());
});

// 2. Trigger Automatic New Order Notifications (SMS + Email)
app.post('/api/notifications/new-order', async (req, res) => {
  try {
    const {
      order,
      items = [],
      config,
      forceRetry = false,
      retryChannel,
    } = req.body as {
      order?: OrderPayload;
      items?: OrderLineItemPayload[];
      config?: NotificationConfigPayload;
      forceRetry?: boolean;
      retryChannel?: 'sms' | 'email';
    };

    if (!order || !order.id || !order.orderReference || !order.customerName) {
      res.status(400).json({
        error: 'Invalid order payload. Order must be saved in database with id and orderReference.',
      });
      return;
    }

    const defaultOwnerPhone =
      (process.env.OWNER_NOTIFICATION_PHONE || '').trim() || '+18565223029';
    const defaultOwnerEmail =
      (process.env.OWNER_NOTIFICATION_EMAIL || '').trim() || 'swaraysheku12@gmail.com';

    const ownerPhone = config?.ownerPhone || defaultOwnerPhone;
    const ownerEmail = config?.ownerEmail || defaultOwnerEmail;
    const smsRecipients = [ownerPhone, ...(config?.additionalPhones || [])].filter(Boolean);
    const emailRecipients = [ownerEmail, ...(config?.additionalEmails || [])].filter(Boolean);

    const smsEnabled = config?.smsEnabled !== false;
    const emailEnabled = config?.emailEnabled !== false;

    const results: ChannelDispatchResult[] = [];

    // Dispatch SMS
    if (!retryChannel || retryChannel === 'sms') {
      const smsDedupeKey = `new_order_sms_${order.id}`;
      const smsBody = buildOwnerNewOrderSmsBody(order, items);

      if (!smsEnabled) {
        results.push({
          channel: 'sms',
          provider: 'Twilio SMS',
          providerConfigured: getProviderConfigStatus().smsConfigured,
          success: false,
          status: 'disabled',
          recipients: smsRecipients,
          messagePreview: smsBody,
          errorMessage: 'SMS notifications are disabled in Admin Notification Settings.',
          attempts: 0,
          dispatchedAtIso: new Date().toISOString(),
        });
      } else if (!forceRetry && deliveredEventKeys.has(smsDedupeKey)) {
        results.push({
          channel: 'sms',
          provider: 'Twilio SMS',
          providerConfigured: getProviderConfigStatus().smsConfigured,
          success: true,
          status: 'duplicate_skipped',
          recipients: smsRecipients,
          messagePreview: smsBody,
          attempts: 0,
          dispatchedAtIso: new Date().toISOString(),
        });
      } else {
        const smsResult = await sendTwilioSmsWithRetry(smsRecipients, smsBody);
        if (smsResult.success) {
          deliveredEventKeys.add(smsDedupeKey);
        }
        results.push(smsResult);
      }
    }

    // Dispatch Email
    if (!retryChannel || retryChannel === 'email') {
      const emailDedupeKey = `new_order_email_${order.id}`;
      const { subject, textBody, htmlBody } = buildOwnerNewOrderEmail(order, items);

      if (!emailEnabled) {
        results.push({
          channel: 'email',
          provider: getProviderConfigStatus().emailProvider,
          providerConfigured: getProviderConfigStatus().emailConfigured,
          success: false,
          status: 'disabled',
          recipients: emailRecipients,
          subject,
          messagePreview: textBody,
          htmlBody,
          errorMessage: 'Email notifications are disabled in Admin Notification Settings.',
          attempts: 0,
          dispatchedAtIso: new Date().toISOString(),
        });
      } else if (!forceRetry && deliveredEventKeys.has(emailDedupeKey)) {
        results.push({
          channel: 'email',
          provider: getProviderConfigStatus().emailProvider,
          providerConfigured: getProviderConfigStatus().emailConfigured,
          success: true,
          status: 'duplicate_skipped',
          recipients: emailRecipients,
          subject,
          messagePreview: textBody,
          htmlBody,
          attempts: 0,
          dispatchedAtIso: new Date().toISOString(),
        });
      } else {
        const emailResult = await sendTransactionalEmailWithRetry(
          emailRecipients,
          subject,
          textBody,
          htmlBody
        );
        if (emailResult.success) {
          deliveredEventKeys.add(emailDedupeKey);
        }
        results.push(emailResult);
      }
    }

    res.json({
      orderId: order.id,
      orderReference: order.orderReference,
      providerStatus: getProviderConfigStatus(),
      results,
    });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Internal error dispatching new order notifications.',
    });
  }
});

// 3. Customer Order Status Update Notification (Email + Optional SMS)
app.post('/api/notifications/order-status', async (req, res) => {
  try {
    const { order, nextStatus, config } = req.body as {
      order?: OrderPayload;
      nextStatus?: string;
      config?: NotificationConfigPayload;
    };

    if (!order || !order.id || !nextStatus) {
      res.status(400).json({ error: 'Missing order or nextStatus.' });
      return;
    }

    const statusHeadlineMap: Record<string, string> = {
      'New Order': 'We have received your order and our kitchen is reviewing it.',
      Accepted: 'Great news! FAMINAS Kitchen has accepted your order and queued it for preparation.',
      Confirmed: 'Your order has been confirmed by FAMINAS Kitchen.',
      Preparing: 'Our chefs are now freshly cooking and plating your dishes.',
      'Ready for Pickup':
        'Your order is hot, packed, and ready for pickup at 577 Blackwood-Clementon Road, Lindenwold, NJ 08021.',
      'Out for Delivery': `Your delivery order is on the way to ${order.deliveryAddress || 'your address'}.`,
      Completed: 'Your order is complete. Thank you for dining with FAMINAS!',
      Cancelled:
        'Your order has been cancelled. Please call +1 (856) 522-3029 if you have any questions.',
    };

    const headline = statusHeadlineMap[nextStatus] || `Your order status is now: ${nextStatus}`;
    const cleanRef = order.orderReference.startsWith('#')
      ? order.orderReference
      : `#${order.orderReference}`;
    const subject = `FAMINAS RESTAURANT – ORDER ${cleanRef} UPDATE: ${nextStatus.toUpperCase()}`;

    const textBody = [
      `Hello ${order.customerName},`,
      ``,
      headline,
      ``,
      `Order Number: ${cleanRef}`,
      `Current Status: ${nextStatus}`,
      `Fulfillment: ${
        order.fulfillmentType === 'delivery'
          ? `Delivery to ${order.deliveryAddress}`
          : 'In-Restaurant Pickup (577 Blackwood-Clementon Rd, Lindenwold, NJ 08021)'
      }`,
      `Items Ordered: ${order.itemsSummary}`,
      `Order Total: $${Number(order.totalAmount || 0).toFixed(2)}`,
      ``,
      `FAMINAS AFRICAN AND AMERICANS RESTAURANT`,
      `577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA`,
      `Phone: +1 (856) 522-3029 · faminasrestaurant.com`,
    ].join('\n');

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F7F3EA;border:2px solid #C9A45C;border-radius:12px;overflow:hidden;color:#21150F;">
        <div style="background:#21150F;padding:20px 24px;border-bottom:2px solid #C9A45C;">
          <div style="color:#C9A45C;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
            FAMINAS AFRICAN AND AMERICANS RESTAURANT
          </div>
          <h2 style="color:#F7F3EA;margin:6px 0 0;font-family:Georgia,serif;">
            Order ${cleanRef} Update: ${nextStatus}
          </h2>
        </div>
        <div style="padding:22px 24px;font-size:14px;line-height:1.6;">
          <p>Hello <strong>${order.customerName}</strong>,</p>
          <p style="background:#FFFFFF;padding:14px;border-left:4px solid #C9A45C;border-radius:6px;font-weight:600;">
            ${headline}
          </p>
          <p><strong>Items Ordered:</strong> ${order.itemsSummary}</p>
          <p><strong>Order Total:</strong> $${Number(order.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div style="background:#3B3029;color:#F7F3EA;padding:14px 24px;font-size:12px;text-align:center;">
          577 Blackwood-Clementon Road, Lindenwold, NJ 08021 · +1 (856) 522-3029 · faminasrestaurant.com
        </div>
      </div>
    `;

    const results: ChannelDispatchResult[] = [];

    if (config?.customerNotificationsEnabled !== false) {
      if (order.customerEmail && isValidEmail(order.customerEmail)) {
        const emailRes = await sendTransactionalEmailWithRetry(
          [order.customerEmail],
          subject,
          textBody,
          htmlBody
        );
        results.push(emailRes);
      }

      if (
        config?.smsEnabled !== false &&
        order.customerPhone &&
        ['Accepted', 'Confirmed', 'Ready for Pickup', 'Out for Delivery', 'Cancelled'].includes(
          nextStatus
        )
      ) {
        const smsText = `FAMINAS RESTAURANT: Order ${cleanRef} is now ${nextStatus.toUpperCase()}. ${headline} Questions? Call +1 (856) 522-3029.`;
        const smsRes = await sendTwilioSmsWithRetry([order.customerPhone], smsText);
        results.push(smsRes);
      }
    }

    res.json({
      orderId: order.id,
      nextStatus,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to send status notification.' });
  }
});

// 4. Send Test SMS or Test Email from Admin Notification Settings
app.post('/api/notifications/test', async (req, res) => {
  try {
    const { channel, recipient, config } = req.body as {
      channel: 'sms' | 'email';
      recipient?: string;
      config?: NotificationConfigPayload;
    };

    const sampleOrder: OrderPayload = {
      id: `test_ord_${Date.now()}`,
      orderReference: 'FM1025',
      customerName: 'John Smith (Test Order)',
      customerPhone: '+1 (856) 522-3029',
      customerEmail: config?.ownerEmail || 'swaraysheku12@gmail.com',
      fulfillmentType: 'pickup',
      deliveryAddress: 'In-Restaurant Pickup (577 Blackwood-Clementon Rd, Lindenwold, NJ 08021)',
      specialInstructions: 'Extra pepper sauce on the side, please.',
      paymentMethod: 'online_card',
      paymentStatus: 'pending',
      status: 'New Order',
      itemsSummary: '1x Achecke with Grill Fish and Plantain, 1x Chicken Wings and Fries',
      subtotal: 38.98,
      taxAmount: 2.58,
      deliveryFee: 0,
      totalAmount: 41.56,
      createdAtIso: new Date().toISOString(),
    };

    const sampleItems: OrderLineItemPayload[] = [
      {
        name: 'Achecke with Grill Fish and Plantain',
        quantity: 1,
        unitPrice: 22.99,
        lineTotal: 22.99,
        specialInstructions: 'Well seasoned grilled fish',
      },
      {
        name: 'Chicken Wings and Fries',
        quantity: 1,
        unitPrice: 15.99,
        lineTotal: 15.99,
      },
    ];

    if (channel === 'sms') {
      const targetPhone =
        recipient ||
        config?.ownerPhone ||
        process.env.OWNER_NOTIFICATION_PHONE ||
        '+18565223029';
      const smsBody = buildOwnerNewOrderSmsBody(sampleOrder, sampleItems);
      const result = await sendTwilioSmsWithRetry([targetPhone], smsBody);
      res.json({ result, providerStatus: getProviderConfigStatus() });
      return;
    }

    const targetEmail =
      recipient ||
      config?.ownerEmail ||
      process.env.OWNER_NOTIFICATION_EMAIL ||
      'swaraysheku12@gmail.com';
    const { subject, textBody, htmlBody } = buildOwnerNewOrderEmail(sampleOrder, sampleItems);
    const result = await sendTransactionalEmailWithRetry(
      [targetEmail],
      `[TEST] ${subject}`,
      textBody,
      htmlBody
    );
    res.json({ result, providerStatus: getProviderConfigStatus() });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Test notification error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FAMINAS Restaurant full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
