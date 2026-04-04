import { RateLimiterMemory } from 'rate-limiter-flexible';

// Configuration: 5 login attempts per 15 minutes per IP address.
// After 5 failures, the IP is blocked for 15 minutes.
const loginLimiter = new RateLimiterMemory({
  points: 5,           // 5 attempts allowed
  duration: 900,       // per 15-minute window (900 seconds)
  blockDuration: 900,  // block for 15 minutes after exceeding
});

export async function checkLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining?: number;
  retryAfter?: number;
}> {
  try {
    const result = await loginLimiter.consume(ip);
    return { allowed: true, remaining: result.remainingPoints };
  } catch (rateLimiterRes: any) {
    return {
      allowed: false,
      retryAfter: Math.ceil(rateLimiterRes.msBeforeNext / 1000),
    };
  }
}
