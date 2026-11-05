import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/database';
import { checkRateLimit, sanitizeText } from '@/lib/security';

const SHOPIER_API_BASE = 'https://api.shopier.com/v1';
const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING_COST = 89;

// Guaranteed HTTPS .png image URL so Shopier media[0].url regex validation succeeds even from localhost:3000
const FALLBACK_PUBLIC_IMAGE_URL =
  'https://raw.githubusercontent.com/github/explore/main/topics/javascript/javascript.png';

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
  });
}

export async function POST(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, 'shopier_checkout', 10, 5 * 60 * 1000);
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
    const customerName = sanitizeText(body.customerName || '', 100);
    const clientItems: Array<{
      productId: string;
      size: string;
      quantity: number;
    }> = Array.isArray(body.items) ? body.items : [];

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: 'Sipariş numarası zorunludur.' },
        { status: 400 }
      );
    }

    // ZERO-TRUST SERVER-SIDE PRICE CALCULATION
    const db = await readDatabase();
    let authoritativeTotal = 0;
    let itemsSummary = '';
    let coverImagePath = '';

    const existingOrder = db.orders.find(
      (o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
    );

    if (existingOrder && existingOrder.totalAmount > 0) {
      authoritativeTotal = existingOrder.totalAmount;
      itemsSummary = existingOrder.items
        .map((i) => `${i.name} (${i.size} x${i.quantity})`)
        .join(', ');
      if (existingOrder.items[0]?.imageUrl) {
        coverImagePath = existingOrder.items[0].imageUrl;
      }
    } else if (clientItems.length > 0) {
      let subtotal = 0;
      const summaryParts: string[] = [];

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
        summaryParts.push(`${dbProd.name} (${item.size} x${qty})`);
        if (!coverImagePath && dbProd.media[0]?.url) {
          coverImagePath = dbProd.media[0].url;
        }
      }

      const shipping =
        subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
      authoritativeTotal = subtotal + shipping;
      itemsSummary = summaryParts.join(', ');
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: 'Doğrulanabilir sepet bilgisi bulunamadı.',
        },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || '';
    const isPublicHttpsOrigin =
      origin.startsWith('https://') && !origin.includes('localhost');

    // Shopier strictly validates that media[0].url is a public https:// URL ending in .jpg/.jpeg/.png
    let shopierMediaUrl = FALLBACK_PUBLIC_IMAGE_URL;
    if (
      coverImagePath &&
      isPublicHttpsOrigin &&
      /\.(jpg|jpeg|png)$/i.test(coverImagePath)
    ) {
      shopierMediaUrl = `${origin}${coverImagePath}`;
    } else if (
      coverImagePath.startsWith('https://') &&
      /\.(jpg|jpeg|png)$/i.test(coverImagePath)
    ) {
      shopierMediaUrl = coverImagePath;
    }

    const shopierPayload = {
      title: `VESPER BODY Siparis ${orderNumber}`,
      description: `Alici: ${customerName} | Paket: ${itemsSummary} | %100 Gizli Paketleme`,
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

    if (response.ok && data && data.url) {
      return NextResponse.json({
        ok: true,
        mode: 'live_redirect',
        keyName,
        verifiedAmount: authoritativeTotal,
        shopierProductId: data.id,
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
