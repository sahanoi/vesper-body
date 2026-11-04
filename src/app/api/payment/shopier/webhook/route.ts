import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { safeCompare } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get('shopier-signature') ||
      req.headers.get('x-shopier-signature');
    const webhookSecret = process.env.SHOPIER_WEBHOOK_SECRET;

    // If SHOPIER_WEBHOOK_SECRET is configured, strictly verify HMAC-SHA256 signature on raw body
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { ok: false, error: 'Eksik Shopier-Signature başlığı (401).' },
          { status: 401 }
        );
      }

      const computedHex = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      const computedB64 = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('base64');

      const isValid =
        safeCompare(signature, computedHex) ||
        safeCompare(signature, computedB64);

      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: 'Geçersiz Webhook imzası (403).' },
          { status: 403 }
        );
      }
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      params.forEach((value, key) => {
        payload[key] = value;
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
    status: 'Shopier Webhook & OSB Dinleyicisi Aktif (HMAC-SHA256 Korumalı)',
  });
}
