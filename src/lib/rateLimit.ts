/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window approach with per-IP tracking.
 * Suitable for serverless / single-instance deployments.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60 seconds
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
}

interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  resetTime: number;
  /** Total limit per window */
  limit: number;
}

/**
 * Check rate limit for a given identifier (typically IP address).
 * Returns whether the request is allowed and remaining quota info.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupStaleEntries();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  // Existing window
  entry.count++;

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      limit: config.maxRequests,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

/**
 * Extract client IP from request headers.
 * Checks x-forwarded-for, x-real-ip, then falls back to 'unknown'.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Create a rate-limited JSON response with proper headers.
 */
export function rateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result.resetTime),
        'Retry-After': String(retryAfter),
      },
    }
  );
}

// Pre-configured rate limit configs for different API types
export const RATE_LIMITS = {
  /** Image generation - expensive operation */
  imageGeneration: { windowMs: 60_000, maxRequests: 10 },
  /** Text-to-speech */
  textToSpeech: { windowMs: 60_000, maxRequests: 20 },
  /** Video analysis */
  videoAnalysis: { windowMs: 60_000, maxRequests: 10 },
  /** Voice studio */
  voiceStudio: { windowMs: 60_000, maxRequests: 15 },
  /** MEI assistant */
  meiAssistant: { windowMs: 60_000, maxRequests: 30 },
  /** KOL generation */
  kolGeneration: { windowMs: 60_000, maxRequests: 10 },
} as const;
