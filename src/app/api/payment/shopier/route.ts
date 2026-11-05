import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/database';
import { checkRateLimit, sanitizeText } from '@/lib/security';

const SHOPIER_API_BASE = 'https://api.shopier.com/v1';
const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING_COST = 89;
const SHOPIER_SHOP_SLUG = process.env.SHOPIER_SHOP_SLUG || 'VesperBody';

// Public GitHub raw mirror of our repository's /public folder so localhost:3000 sends the EXACT real product photo to Shopier!
const GITHUB_RAW_PUBLIC_BASE =
  'https://raw.githubusercontent.com/sahanoi/vesper-body/main/public';
const FALLBACK_BRAND_IMAGE_URL = `${GITHUB_RAW_PUBLIC_BASE}/images/brand/vesper-body-logo.jpg`;

function getShopierToken(): string {
  return (process.env.SHOPIER_PAT || '').trim();
}

export async function GET() {
  const token = getShopierToken();
  const keyName = process.env.SHOPIER_KEY_NAME || 'osman';

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: 'SHOPIER_PAT ortam değişkeni tanımlanmamış.',
      },
      { status: 400 }
    );
  }

  let shopId: number | string | null = null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );
      shopId = payload.sub || null;
    }
  } catch {
    // ignore decode error
  }

  return NextResponse.json({
    ok: true,
    configured: true,
    keyName,
    shopId,
    shopSlug: SHOPIER_SHOP_SLUG,
  });
}

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, 'shopier_checkout', 15, 5 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Çok fazla ödeme isteği. Lütfen ${rl.retryAfterSec} saniye bekleyin.`,
        },
        { status: 429 }
      );
    }

    const token = getShopierToken();
    const keyName = process.env.SHOPIER_KEY_NAME || 'osman';

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Shopier PAT anahtarı (.env.local) bulunamadı.',
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const orderNumber = sanitizeText(body.orderNumber, 40);
    const giftNote = sanitizeText(body.giftNote || '', 200);
    const clientItems: Array<{
      productId: string;
      size: string;
      quantity: number;
    }> = Array.isArray(body.items) ? body.items : [];

    if (!orderNumber || clientItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Sepet bilgisi zorunludur.' },
        { status: 400 }
      );
    }

    // ZERO-TRUST SERVER-SIDE PRICE & PRODUCT IMAGE RESOLUTION
    const db = await readDatabase();
    let subtotal = 0;
    let hasCustomShipping = false;
    let maxCustomShipping = 0;
    let allExplicitlyFree = true;
    const summaryParts: string[] = [];
    let primaryProductTitle = '';
    let coverImagePath = '';

    for (const item of clientItems) {
      const dbProd = db.products.find((p) => p.id === item.productId);
      if (!dbProd) {
        return NextResponse.json(
          { ok: false, error: 'Sepette geçersiz ürün tespit edildi.' },
          { status: 400 }
        );
      }
      const qty = Math.max(
        1,
        Math.min(20, Math.floor(Number(item.quantity) || 1))
      );
      subtotal += dbProd.price * qty;
      summaryParts.push(`${dbProd.name} (${item.size} Beden x${qty})`);

      if (dbProd.freeShipping || dbProd.shippingCost === 0) {
        hasCustomShipping = true;
      } else if (
        typeof dbProd.shippingCost === 'number' &&
        dbProd.shippingCost > 0
      ) {
        hasCustomShipping = true;
        allExplicitlyFree = false;
        if (dbProd.shippingCost > maxCustomShipping) {
          maxCustomShipping = dbProd.shippingCost;
        }
      } else {
        allExplicitlyFree = false;
      }

      if (!primaryProductTitle) {
        primaryProductTitle =
          clientItems.length === 1
            ? `${dbProd.name} (${item.size} Beden)`
            : `${dbProd.name} + ${clientItems.length - 1} Ürün (${orderNumber})`;
      }

      if (!coverImagePath) {
        const firstImage = dbProd.media.find((m) => m.type === 'image');
        if (firstImage?.url) {
          coverImagePath = firstImage.url;
        }
      }
    }

    let shipping =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
    if (hasCustomShipping && allExplicitlyFree) {
      shipping = 0;
    } else if (maxCustomShipping > 0) {
      shipping = maxCustomShipping;
    }

    const authoritativeTotal = subtotal + shipping;
    const itemsSummary = summaryParts.join(' | ');

    const origin = req.headers.get('origin') || '';
    const isPublicHttpsOrigin =
      origin.startsWith('https://') && !origin.includes('localhost');

    // Resolve the REAL product photo URL (works both on Vercel production AND on localhost:3000!)
    let shopierMediaUrl = FALLBACK_BRAND_IMAGE_URL;
    if (coverImagePath) {
      if (coverImagePath.startsWith('https://')) {
        shopierMediaUrl = coverImagePath;
      } else if (isPublicHttpsOrigin) {
        shopierMediaUrl = `${origin}${coverImagePath}`;
      } else {
        // On localhost:3000, use our GitHub raw public URL for the exact same product image!
        shopierMediaUrl = `${GITHUB_RAW_PUBLIC_BASE}${coverImagePath}`;
      }
    }

    const descriptionText = [
      `Sipariş Kodu: ${orderNumber}`,
      `İçerik: ${itemsSummary}`,
      giftNote ? `Gizli Zarf Notu: ${giftNote}` : null,
      `%100 Gizli Mat Siyah Kutu ile Gönderim`,
    ]
      .filter(Boolean)
      .join(' • ');

    const shopierPayload = {
      title: primaryProductTitle.slice(0, 95),
      description: descriptionText,
      type: 'physical',
      priceData: {
        currency: 'TRY',
        price: Number(authoritativeTotal).toFixed(2),
      },
      shippingPayer: 'sellerPays',
      stockQuantity: 1,
      media: [
        {
          type: 'image',
          url: shopierMediaUrl,
          placement: 1,
        },
      ],
    };

    const response = await fetch(`${SHOPIER_API_BASE}/products`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shopierPayload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data && data.id) {
      return NextResponse.json({
        ok: true,
        mode: 'fast_checkout',
        keyName,
        verifiedAmount: authoritativeTotal,
        shopierProductId: String(data.id),
        shopSlug: SHOPIER_SHOP_SLUG,
        directCheckoutActionUrl: `https://www.shopier.com/s/shipping/${encodeURIComponent(
          SHOPIER_SHOP_SLUG
        )}`,
        paymentUrl: data.url,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          data?.message ||
          'Shopier ödeme sayfası oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      },
      { status: 502 }
    );
  } catch (err) {
    console.error('Shopier POST error:', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Shopier sunucusuna bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.',
      },
      { status: 500 }
    );
  }
}
