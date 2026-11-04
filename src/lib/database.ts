import fs from 'fs';
import os from 'os';
import path from 'path';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '@/data/initial-catalog';
import { Order, Product, StoreUser } from '@/types/commerce';
import { hashPassword } from '@/lib/security';

const LOCAL_DB_PATH = path.join(process.cwd(), 'src', 'data', 'database.json');
const TMP_DB_PATH = path.join(os.tmpdir(), 'vesper-database.json');
const CLOUD_KV_KEY = 'vesper_store_db_v1';

export interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: StoreUser[];
  updatedAt: string;
}

export function getAdminExpectedPassword(): string {
  return process.env.ADMIN_PASSWORD || 'vesper2026';
}

export const INITIAL_USERS: StoreUser[] = [
  {
    id: 'usr-admin-1',
    fullName: 'VESPER Mağaza Yöneticisi',
    email: 'admin@vesperbody.com',
    phone: '0532 100 00 00',
    password: `sha256:${hashPassword(getAdminExpectedPassword())}`,
    isAdmin: true,
    createdAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'usr-1',
    fullName: 'Ece Demir',
    email: 'ece.demir@example.com',
    phone: '0544 219 30 11',
    password: `sha256:${hashPassword('123456')}`,
    isAdmin: false,
    createdAt: '2026-10-29T14:00:00Z',
    savedAddress: {
      city: 'İzmir',
      district: 'Karşıyaka',
      addressLine: 'Bostanlı Mah. Cemal Gürsel Cad. No: 88 D: 12',
    },
  },
];

export function stripPasswords(users: StoreUser[]): StoreUser[] {
  return users.map(({ password: _password, ...safeUser }) => safeUser);
}

function getCloudKvConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
  if (url && token) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

async function readCloudKv(): Promise<DatabaseSchema | null> {
  const kv = getCloudKvConfig();
  if (!kv) return null;
  try {
    const res = await fetch(`${kv.url}/get/${CLOUD_KV_KEY}`, {
      headers: { Authorization: `Bearer ${kv.token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.result) return null;
    const parsed =
      typeof data.result === 'string'
        ? (JSON.parse(data.result) as DatabaseSchema)
        : (data.result as DatabaseSchema);
    if (Array.isArray(parsed.products) && parsed.products.length > 0) {
      if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = INITIAL_USERS;
      }
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeCloudKv(db: DatabaseSchema): Promise<void> {
  const kv = getCloudKvConfig();
  if (!kv) return;
  try {
    await fetch(`${kv.url}/set/${CLOUD_KV_KEY}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kv.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(db),
    });
  } catch (err) {
    console.error('Cloud KV write error:', err);
  }
}

let memoryCache: DatabaseSchema | null = null;

export async function readDatabase(): Promise<DatabaseSchema> {
  const cloudDb = await readCloudKv();
  if (cloudDb) {
    memoryCache = cloudDb;
    return cloudDb;
  }

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

  await writeDatabase(initialDb);
  return initialDb;
}

export async function writeDatabase(db: DatabaseSchema): Promise<void> {
  db.updatedAt = new Date().toISOString();
  memoryCache = db;
  const serialized = JSON.stringify(db, null, 2);

  await writeCloudKv(db);

  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, serialized, 'utf-8');
  } catch {
    try {
      fs.writeFileSync(TMP_DB_PATH, serialized, 'utf-8');
    } catch (tmpErr) {
      console.error('Fallback tmp write error:', tmpErr);
    }
  }
}
