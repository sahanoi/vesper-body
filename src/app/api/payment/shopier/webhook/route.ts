import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: Record<string, unknown> = {};

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        payload[key] = String(value);
      });
    }

    return NextResponse.json({
      ok: true,
      receivedAt: new Date().toISOString(),
      event: payload.event || 'shopier.order.notification',
    });
  } catch (err) {
    console.error('Shopier webhook error:', err);
    return NextResponse.json(
      { ok: false, error: 'Webhook işlenemedi' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/payment/shopier/webhook',
    status: 'Shopier Webhook & OSB Dinleyicisi Aktif (Anahtar: osman)',
  });
}

