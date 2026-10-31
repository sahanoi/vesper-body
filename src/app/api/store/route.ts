import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '@/data/initial-catalog';
import { Order, Product, StoreUser } from '@/types/commerce';

const LOCAL_DB_PATH = path.join(process.cwd(), 'src', 'data', 'database.json');
const TMP_DB_PATH = path.join(os.tmpdir(), 'vesper-database.json');

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: StoreUser[];
  updatedAt: string;
}

const INITIAL_USERS: StoreUser[] = [
  {
    id: 'usr-admin-1',
    fullName: 'VESPER Mağaza Yöneticisi',
    email: 'admin@vesperbody.com',
    phone: '0532 100 00 00',
    password: 'vesper2026',
    isAdmin: true,
    createdAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'usr-1',
    fullName: 'Ece Demir',
    email: 'ece.demir@example.com',
    phone: '0544 219 30 11',
    password: '123456',
    isAdmin: false,
    createdAt: '2026-10-29T14:00:00Z',
    savedAddress: {
      city: 'İzmir',
      district: 'Karşıyaka',
      addressLine: 'Bostanlı Mah. Cemal Gürsel Cad. No: 88 D: 12',
    },
  },
];

let memoryCache: DatabaseSchema | null = null;

function readDatabase(): DatabaseSchema {
  // 1. Check /tmp override first (for Vercel serverless runtime writes)
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        }
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore tmp read errors
  }

  // 2. Check local workspace src/data/database.json
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        }
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database.json, falling back:', err);
  }

  if (memoryCache) return memoryCache;

  const initialDb: DatabaseSchema = {
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    users: INITIAL_USERS,
    updatedAt: new Date().toISOString(),
  };

  writeDatabase(initialDb);
  return initialDb;
}

function writeDatabase(db: DatabaseSchema): void {
  db.updatedAt = new Date().toISOString();
  memoryCache = db;
  const serialized = JSON.stringify(db, null, 2);

  // Try writing to project src/data/database.json (works locally)
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, serialized, 'utf-8');
  } catch {
    // On Vercel (EROFS read-only file system), write to /tmp/vesper-database.json
    try {
      fs.writeFileSync(TMP_DB_PATH, serialized, 'utf-8');
    } catch (tmpErr) {
      console.error('Fallback tmp write error:', tmpErr);
    }
  }
}

export async function GET() {
  const db = readDatabase();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDatabase();

    if (body.action === 'reset_catalog') {
      db.products = INITIAL_PRODUCTS;
      writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'sync_products' && Array.isArray(body.products)) {
      db.products = body.products;
      writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'add_product' && body.product) {
      db.products = [body.product, ...db.products];
      writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'update_product' && body.product) {
      const updatedProd: Product = body.product;
      db.products = db.products.map((p) =>
        p.id === updatedProd.id ? updatedProd : p
      );
      writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'delete_product' && body.productId) {
      db.products = db.products.filter((p) => p.id !== body.productId);
      writeDatabase(db);
      return NextResponse.json({ ok: true, products: db.products });
    }

    if (body.action === 'create_order' && body.order && Array.isArray(body.products)) {
      db.products = body.products;
      db.orders = [body.order, ...db.orders];
      writeDatabase(db);
      return NextResponse.json({
        ok: true,
        products: db.products,
        orders: db.orders,
      });
    }

    if (body.action === 'update_orders' && Array.isArray(body.orders)) {
      db.orders = body.orders;
      writeDatabase(db);
      return NextResponse.json({ ok: true, orders: db.orders });
    }

    if (body.action === 'register_user' && body.user) {
      const newUser: StoreUser = body.user;
      const exists = db.users.some(
        (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
      );
      if (exists) {
        return NextResponse.json(
          { ok: false, error: 'Bu e-posta adresi ile kayıtlı bir hesap zaten var.' },
          { status: 400 }
        );
      }
      db.users = [newUser, ...db.users];
      writeDatabase(db);
      return NextResponse.json({ ok: true, users: db.users, user: newUser });
    }

    if (body.action === 'reset_password' && body.email && body.newPassword) {
      const emailLower = String(body.email).trim().toLowerCase();
      const idx = db.users.findIndex((u) => u.email.toLowerCase() === emailLower);
      if (idx === -1) {
        return NextResponse.json(
          { ok: false, error: 'Bu e-posta adresine ait kayıtlı bir kullanıcı bulunamadı.' },
          { status: 404 }
        );
      }
      db.users[idx] = {
        ...db.users[idx],
        password: String(body.newPassword),
      };
      writeDatabase(db);
      return NextResponse.json({ ok: true, users: db.users });
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
