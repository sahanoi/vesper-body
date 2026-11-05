import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'vesper_admin_session';

function getServerSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SHOPIER_PAT ||
    'vesper-luxury-internal-hmac-secret-2026'
  );
}

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a), 'utf-8');
  const bufB = Buffer.from(String(b), 'utf-8');
  if (bufA.length !== bufB.length) {
    // Compare against itself to keep constant time before returning false
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash password with SHA-256 HMAC so plaintext passwords are not needed
 */
export function hashPassword(plain: string): string {
  return crypto
    .createHmac('sha256', getServerSecret())
    .update(plain)
    .digest('hex');
}

/**
 * Verify password against either hashed or legacy format in timing-safe manner
 */
export function verifyUserPassword(inputPassword: string, storedPassword?: string): boolean {
  if (!storedPassword || !inputPassword) return false;
  if (storedPassword.startsWith('sha256:')) {
    const expectedHash = storedPassword.slice(7);
    const actualHash = hashPassword(inputPassword);
    return safeCompare(actualHash, expectedHash);
  }
  return safeCompare(inputPassword, storedPassword);
}

/**
 * Create a cryptographically signed Admin Session token (valid for 24 hours)
 */
export function createAdminSessionToken(email: string): string {
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const payloadB64 = Buffer.from(payload, 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getServerSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify Admin Session token from HttpOnly cookie
 */
export function verifyAdminSessionFromRequest(req: NextRequest): boolean {
  try {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', getServerSecret())
      .update(payloadB64)
      .digest('base64url');

    if (!safeCompare(signature, expectedSig)) return false;

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );
    if (payload.role !== 'admin' || typeof payload.exp !== 'number') {
      return false;
    }
    if (Date.now() > payload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * In-memory sliding-window Rate Limiter per IP + Action
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  req: NextRequest,
  bucket: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const key = `${bucket}:${ip}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Sanitize user-supplied strings to prevent Stored XSS injection
 */
export function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

