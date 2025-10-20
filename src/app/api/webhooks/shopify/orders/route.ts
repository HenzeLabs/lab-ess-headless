import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET || '';

// Verify Shopify webhook authenticity
function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  const hash = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}

// Shopify Order webhook payload types
interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  name: string;
  price: string;
  quantity: number;
  sku?: string;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email?: string;
  total_price: string;
  subtotal_price: string;
  total_tax?: string;
  currency: string;
  line_items: ShopifyLineItem[];
  customer?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  created_at: string;
}

// Send purchase event to Taboola S2S Conversion API
async function sendTaboolaPurchase(order: ShopifyOrder, request: NextRequest) {
  const TABOOLA_PIXEL_ID = '1759164';
  const TABOOLA_ADVERTISER_ID = process.env.TABOOLA_ADVERTISER_ID;

  if (!TABOOLA_ADVERTISER_ID) {
    console.warn(
      'TABOOLA_ADVERTISER_ID not configured - skipping Taboola S2S tracking',
    );
    return;
  }

  const taboolaPayload = {
    name: 'purchase',
    site_id: TABOOLA_PIXEL_ID,
    advertiser_id: TABOOLA_ADVERTISER_ID,
    value: parseFloat(order.total_price),
    currency: order.currency || 'USD',
    orderid: order.id.toString(),
    user_agent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  };

  try {
    const response = await fetch(
      'https://trc.taboola.com/actions-handler/log/3/s2s-action',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taboolaPayload),
      },
    );

    if (!response.ok) {
      console.error('Taboola S2S error:', await response.text());
    } else {
      console.log('✅ Taboola S2S purchase tracked:', order.order_number);
    }
  } catch (error) {
    console.error('❌ Taboola S2S error:', error);
  }
}

// Send purchase event to GA4 Measurement Protocol
async function sendGA4Purchase(order: ShopifyOrder) {
  const GA4_MEASUREMENT_ID = 'G-QCSHJ4TDMY';
  const GA4_API_SECRET = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET;

  if (!GA4_API_SECRET) {
    console.warn(
      'GA4_MEASUREMENT_PROTOCOL_SECRET not configured - skipping GA4 purchase tracking',
    );
    return;
  }

  const clientId = order.customer?.id
    ? `shopify_${order.customer.id}`
    : `order_${order.id}`;

  const items = order.line_items.map((item) => ({
    item_id: item.product_id.toString(),
    item_name: item.name,
    item_variant: item.variant_id.toString(),
    price: parseFloat(item.price),
    quantity: item.quantity,
  }));

  const payload = {
    client_id: clientId,
    user_id: order.customer?.id?.toString(),
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: order.order_number.toString(),
          value: parseFloat(order.total_price),
          tax: parseFloat(order.total_tax || '0'),
          currency: order.currency,
          items,
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      console.error('GA4 Measurement Protocol error:', await response.text());
    } else {
      console.log(
        'Successfully sent purchase event to GA4:',
        order.order_number,
      );
    }
  } catch (error) {
    console.error('Failed to send GA4 purchase event:', error);
  }
}

// POST handler for Shopify order webhooks
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    if (!hmacHeader) {
      console.error('Missing HMAC header');
      return NextResponse.json(
        { error: 'Missing HMAC header' },
        { status: 401 },
      );
    }

    // Verify webhook authenticity
    if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const order: ShopifyOrder = JSON.parse(rawBody);

    console.log('Received Shopify order webhook:', {
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total_price,
      currency: order.currency,
      itemCount: order.line_items.length,
    });

    // Send purchase events to analytics platforms
    await sendGA4Purchase(order);
    await sendTaboolaPurchase(order, request);

    // You can add more analytics platforms here:
    // - Meta Conversion API
    // - Other server-side tracking

    return NextResponse.json({
      success: true,
      orderId: order.order_number,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
