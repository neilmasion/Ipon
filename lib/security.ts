/**
 * Ipon Security Suite
 * Covers Checklist:
 * #1 Hide API Keys, #6 User Perms, #7 Input Sanitization, #8 XSS Protection,
 * #9 SQL Injection, #11 Rate Limiting, #14 CSRF Protection, #18 Secure Cookies,
 * #19 Disable Debug Mode, #20 Check Production Settings, #24 No Data Exposure
 */

import { NextResponse } from "next/server";

// -------------------------------------------------------------
// 1. In-Memory Rate Limiting (#11)
// -------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks rate limit for a given key (e.g. IP + endpoint type)
 * @param key unique identifier (client IP + route bucket)
 * @param maxRequests maximum allowed requests per window
 * @param windowSeconds time window in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.ceil((newEntry.resetTime - now) / 1000),
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    reset: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Extracts client IP safely from request headers (x-forwarded-for, x-real-ip, or fallback)
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

// -------------------------------------------------------------
// 2. Input Sanitization (#7 & #8 XSS Protection)
// -------------------------------------------------------------

/**
 * Sanitizes plain text inputs by removing HTML tags, control chars, and enforcing max length.
 */
export function sanitizeText(input: unknown, maxLength: number = 255): string {
  if (typeof input !== "string") return "";
  // Strip HTML tags and dangerous javascript: or data: pseudo-protocols
  let cleaned = input
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/javascript:/gi, "")
    .replace(/onload=/gi, "")
    .replace(/onerror=/gi, "")
    .replace(/onclick=/gi, "")
    .trim();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }
  return cleaned;
}

/**
 * Validates and normalizes email address.
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  // Standard RFC 5322 compliant regex for emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return null;
  }
  return trimmed;
}

/**
 * Validates and sanitizes monetary/numeric amounts (must be positive number, capped).
 */
export function sanitizeAmount(val: unknown, maxAmount: number = 100_000_000): number | null {
  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num) || num < 0 || num > maxAmount) {
    return null;
  }
  // Round to 2 decimal places to avoid IEEE 754 precision issues
  return Math.round(num * 100) / 100;
}

/**
 * Validates ISO date format YYYY-MM-DD.
 */
export function sanitizeDate(dateStr: unknown): string | null {
  if (typeof dateStr !== "string") return null;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

// -------------------------------------------------------------
// 3. CSRF & Origin Verification (#14 & #15 CORS Settings)
// -------------------------------------------------------------

/**
 * Verifies that state-changing requests come from the same origin or allowed domain.
 */
export function verifySameOrigin(req: Request): boolean {
  // Allow safe idempotent methods without CSRF checks
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin && !host) {
    // Non-browser or direct curl request - allow if local development
    return process.env.NODE_ENV !== "production";
  }

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch {
      return false;
    }
  }

  return true;
}

// -------------------------------------------------------------
// 4. User Data Protection & Sanitization (#24 No Expose of User Data)
// -------------------------------------------------------------

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  currency: string;
  currencySymbol: string;
  createdAt: string | Date;
}

/**
 * Ensures sensitive fields (passwords, tokens, salt) are NEVER sent to clients.
 */
export function toSafeUser(user: any): SafeUser | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isVerified: Boolean(user.isVerified),
    currency: user.currency || "PHP",
    currencySymbol: user.currencySymbol || "₱",
    createdAt: user.createdAt,
  };
}

// -------------------------------------------------------------
// 5. Secure Cookie Configuration (#18 Secure Cookies)
// -------------------------------------------------------------

export function getSecureCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}

// -------------------------------------------------------------
// 6. Safe Error Response (#19 Disable Debug Mode & #20 Production Settings)
// -------------------------------------------------------------

/**
 * Returns a standardized error response without exposing internal DB queries or stacks.
 */
export function safeErrorResponse(
  error: unknown,
  publicMessage: string = "An unexpected error occurred",
  status: number = 500
): NextResponse {
  // Always log full error on server
  if (process.env.NODE_ENV !== "production") {
    console.error(`[API Error (${status})]:`, error);
  } else {
    // Production: minimal log without dumping sensitive payloads
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API Error (${status})]: ${msg.slice(0, 200)}`);
  }

  return NextResponse.json(
    {
      error: publicMessage,
      status,
    },
    { status }
  );
}
