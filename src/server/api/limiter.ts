import { type NextRequest, NextResponse } from "next/server";

// Simple in-memory store for rate limiting
type RateLimitStore = Record<
  string,
  {
    count: number;
    resetAt: number;
  }
>;

const store: RateLimitStore = {};

// Configuration
const MAX_REQUESTS = 5; // Maximum requests allowed
const WINDOW_MS = 60 * 1000; // Time window in milliseconds (1 minute)

/**
 * Basic rate limiter middleware for Next.js API routes
 * Limits requests based on IP address from X-Forwarded-For header
 *
 * @param req The Next.js request object
 * @returns A response if rate limit is exceeded, undefined otherwise
 */
export function rateLimit(req: NextRequest): NextResponse | undefined {
  // Get the IP address from the request headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0] ?? "127.0.0.1";

  // Get the current timestamp
  const now = Date.now();

  // Initialize or reset the store entry if needed
  if (!store[ip] || store[ip].resetAt < now) {
    store[ip] = {
      count: 0,
      resetAt: now + WINDOW_MS,
    };
  }

  // Increment the request count
  store[ip].count++;

  // Check if the rate limit has been exceeded
  if (store[ip].count > MAX_REQUESTS) {
    // Return a 429 Too Many Requests response
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  // If the rate limit hasn't been exceeded, return undefined to allow the request to proceed
  return undefined;
}

// Cleanup function to prevent memory leaks
// Call this periodically to remove expired entries
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const ip of Object.keys(store)) {
    const entry = store[ip];
    if (entry && entry.resetAt < now) {
      delete store[ip];
    }
  }
}

// Set up an interval to clean up the store every minute
if (typeof window === "undefined") {
  // Only run on server
  setInterval(cleanupRateLimitStore, WINDOW_MS);
}
