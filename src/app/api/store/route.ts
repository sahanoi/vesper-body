import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRODUCTS } from '@/data/initial-catalog';
import { Order, Product, StoreUser } from '@/types/commerce';
import {
  getAdminExpectedPassword,
  readDatabase,
  stripPasswords,
  writeDatabase,
} from '@/lib/database';
import {
  ADMIN_COOKIE_NAME,
  checkRateLimit,
  createAdminSessionToken,
  hashPassword,
  safeCompare,
  sanitizeText,
  verifyAdminSessionFromRequest,
  verifyUserPassword,
} from '@/lib/security';

const FREE_SHIPPING_THRESHOLD = 1500;
const STANDARD_SHIPPING_COST = 89;

export async function GET(req: NextRequest) {
  const db = await readDatabase();
  const isAdminVerified = verifyAdminSessionFromRequest(req);

  return NextResponse.json({
    products: db.products,
    orders: db.orders,
    users: stripPasswords(db.users),
    isAdminSessionValid: isAdminVerified,
    updatedAt: db.updatedAt,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await readDatabase();
    const isAdminVerified = verifyAdminSessionFromRequest(req);

    // 1. Server-Side Authentication (Login for Member or Admin)
    if (body.action === 'authenticate_user') {
      const rl = checkRateLimit(req, 'auth_login', 10, 5 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json(
          {
            ok: false,
            error: `Çok fazla başarısız giriş denemesi. Lütfen ${rl.retryAfterSec} saniye sonra tekrar deneyin.`,
          },
          { status: 429 }
        );
      }

      const email = String(body.email || '')
        .trim()
        .toLowerCase();
      const password = String(body.password || '');

      const expectedAdminPass = getAdminExpectedPassword();
      if (
        (email === 'admin@vesperbody.com' || email === 'admin') &&
        safeCompare(password, expectedAdminPass)
      ) {
        const adminUser: StoreUser = {
          id: 'usr-admin-1',
          email: 'admin@vesperbody.com',
          fullName: 'VESPER Mağaza Yöneticisi',
          phone: '0532 100 00 00',
          isAdmin: true,
        };
        const token = createAdminSessionToken(adminUser.email);
        const res = NextResponse.json({ ok: true, user: adminUser });
        res.cookies.set(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 24 * 60 * 60,
        });
        return res;
      }

      const found = db.users.find((u) => u.email.toLowerCase() === email);
      if (!found || !verifyUserPassword(password, found.password)) {
        return NextResponse.json(
          {
            ok: false,
            error: 'E-posta adresi veya şifre hatalı.',
          },
          { status: 401 }
        );
      }

      const { password: _pwd, ...safeUser } = found;
      const res = NextResponse.json({ ok: true, user: safeUser });
      if (safeUser.isAdmin) {
        const token = createAdminSessionToken(safeUser.email);
        res.cookies.set(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 24 * 60 * 60,
        });
      }
      return res;
    }

    // 2. Logout (Clears HttpOnly Admin Cookie)
    if (body.action === 'logout_user') {
      const res = NextResponse.json({ ok: true });
      res.cookies.delete(ADMIN_COOKIE_NAME);
      return res;
    }

    // 3. Admin-Only Protected Actions (Requires Verified HttpOnly Session Cookie)
    const adminActions = [
      'reset_catalog',
      'sync_products',
      'add_product',
      'update_product',
      'delete_product',
      'update_orders',
    ];

    if (adminActions.includes(body.action) && !isAdminVerified) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Yetkisiz işlem (401): Bu işlemi yapmak için Yönetici girişi yapmalısınız.',
        },
        { status: 401 }
      );
    }

    if (body.action === 'reset_catalog') {
      db.products = INITIAL_PRODUCTS;
      await writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'sync_products' && Array.isArray(body.products)) {
      db.products = body.products;
      await writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'add_product' && body.product) {
      db.products = [body.product, ...db.products];
      await writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'update_product' && body.product) {
      const updatedProd: Product = body.product;
      db.products = db.products.map((p) =>
        p.id === updatedProd.id ? updatedProd : p
      );
      await writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'delete_product' && body.productId) {
      db.products = db.products.filter((p) => p.id !== body.productId);
      await writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'update_orders' && Array.isArray(body.orders)) {
      db.orders = body.orders;
      await writeDatabase(db);
      return NextResponse.json({ ok: true, orders: db.orders });
    }

    // 4. Customer Order Creation (Server-Side Authoritative Price & Stock Calculation)
    if (body.action === 'create_order' && body.order) {
      const rl = checkRateLimit(req, 'create_order', 15, 5 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json(
          { ok: false, error: 'Çok fazla sipariş isteği gönderildi.' },
          { status: 429 }
        );
      }

      const incomingOrder: Order = body.order;
      if (
        !Array.isArray(incomingOrder.items) ||
        incomingOrder.items.length === 0
      ) {
        return NextResponse.json(
          { ok: false, error: 'Sipariş sepeti boş olamaz.' },
          { status: 400 }
        );
      }

      let verifiedSubtotal = 0;
      const verifiedItems = [];

      for (const item of incomingOrder.items) {
        const dbProd = db.products.find((p) => p.id === item.productId);
        const dbVariant = dbProd?.variants.find((v) => v.size === item.size);
        const qty = Math.max(
          1,
          Math.min(20, Math.floor(Number(item.quantity) || 1))
        );

        if (!dbProd || !dbVariant || dbVariant.stock < qty) {
          return NextResponse.json(
            {
              ok: false,
              error: `${item.name} (${item.size}) için sunucuda yeterli stok kalmadı.`,
            },
            { status: 400 }
          );
        }

        dbVariant.stock -= qty;
        verifiedSubtotal += dbProd.price * qty;
        verifiedItems.push({
          ...item,
          name: dbProd.name,
          price: dbProd.price,
          quantity: qty,
        });
      }

      const verifiedShipping =
        verifiedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
      const verifiedTotal = verifiedSubtotal + verifiedShipping;

      const safeOrder: Order = {
        ...incomingOrder,
        customer: {
          ...incomingOrder.customer,
          fullName: sanitizeText(incomingOrder.customer?.fullName, 120),
          email: sanitizeText(incomingOrder.customer?.email, 150),
          phone: sanitizeText(incomingOrder.customer?.phone, 40),
          city: sanitizeText(incomingOrder.customer?.city, 60),
          district: sanitizeText(incomingOrder.customer?.district, 60),
          addressLine: sanitizeText(incomingOrder.customer?.addressLine, 350),
          giftMysteryNote: incomingOrder.customer?.giftMysteryNote
            ? sanitizeText(incomingOrder.customer.giftMysteryNote, 250)
            : undefined,
        },
        items: verifiedItems,
        subtotal: verifiedSubtotal,
        shippingCost: verifiedShipping,
        totalAmount: verifiedTotal,
      };

      db.orders = [safeOrder, ...db.orders];
      await writeDatabase(db);
      return NextResponse.json({
        ok: true,
        order: safeOrder,
        products: db.products,
        orders: db.orders,
      });
    }

    // 5. Public Customer Registration (Prevents Admin Escalation + Hashes Password)
    if (body.action === 'register_user' && body.user) {
      const rl = checkRateLimit(req, 'register_user', 8, 10 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json(
          { ok: false, error: 'Çok fazla kayıt denemesi. Lütfen bekleyin.' },
          { status: 429 }
        );
      }

      const rawUser: StoreUser = body.user;
      const cleanEmail = sanitizeText(rawUser.email, 150).toLowerCase();

      if (cleanEmail === 'admin@vesperbody.com' || cleanEmail === 'admin') {
        return NextResponse.json(
          {
            ok: false,
            error: 'Bu e-posta adresi sistem tarafından korunmaktadır.',
          },
          { status: 403 }
        );
      }

      const exists = db.users.some(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      if (exists) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var.',
          },
          { status: 400 }
        );
      }

      const plainPassword = String(rawUser.password || '');
      if (plainPassword.length < 6) {
        return NextResponse.json(
          { ok: false, error: 'Şifreniz en az 6 karakter olmalıdır.' },
          { status: 400 }
        );
      }

      const newUser: StoreUser = {
        id: `usr-${Date.now()}`,
        fullName: sanitizeText(rawUser.fullName, 120),
        email: cleanEmail,
        phone: sanitizeText(rawUser.phone, 40),
        password: `sha256:${hashPassword(plainPassword)}`,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };

      db.users = [newUser, ...db.users];
      await writeDatabase(db);
      const { password: _pwd, ...safeUser } = newUser;
      return NextResponse.json({
        ok: true,
        users: stripPasswords(db.users),
        user: safeUser,
      });
    }

    // 6. Password Reset (Blocks Admin Account Takeover)
    if (body.action === 'reset_password' && body.email && body.newPassword) {
      const rl = checkRateLimit(req, 'reset_password', 5, 10 * 60 * 1000);
      if (!rl.allowed) {
        return NextResponse.json(
          { ok: false, error: 'Çok fazla şifre sıfırlama denemesi.' },
          { status: 429 }
        );
      }

      const emailLower = String(body.email).trim().toLowerCase();
      const idx = db.users.findIndex(
        (u) => u.email.toLowerCase() === emailLower
      );
      if (idx === -1) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Bu e-posta adresine ait kayıtlı bir kullanıcı bulunamadı.',
          },
          { status: 404 }
        );
      }

      if (
        (db.users[idx].isAdmin || emailLower === 'admin@vesperbody.com') &&
        !isAdminVerified
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Yönetici hesabı şifresi genel ekrandan sıfırlanamaz.',
          },
          { status: 403 }
        );
      }

      db.users[idx] = {
        ...db.users[idx],
        password: `sha256:${hashPassword(String(body.newPassword))}`,
      };
      await writeDatabase(db);
      return NextResponse.json({ ok: true, users: stripPasswords(db.users) });
    }

    return NextResponse.json(
      { ok: false, error: 'Geçersiz işlem' },
      { status: 400 }
    );
  } catch (err) {
    console.error('POST /api/store error:', err);
    return NextResponse.json(
      { ok: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
