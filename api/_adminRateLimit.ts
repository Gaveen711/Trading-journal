export type AdminRateLimitResult = {
  available: true
  allowed: boolean
  remaining: number
  retryAfter: number
}

type LimitWindow = { count: number; resetAt: number }

export function localAdminRateLimitFallbackAllowed(
  launcherFlag: string | undefined,
  vercelEnvironment: string | undefined,
): boolean {
  return launcherFlag === '1' && vercelEnvironment !== 'production'
}

export class ProcessLocalAdminRateLimiter {
  private readonly windows = new Map<string, LimitWindow>()

  consume(key: string, limit: number, windowSeconds: number, currentTime = Date.now()): AdminRateLimitResult {
    const existing = this.windows.get(key)
    const window = !existing || existing.resetAt <= currentTime
      ? { count: 1, resetAt: currentTime + windowSeconds * 1000 }
      : { count: existing.count + 1, resetAt: existing.resetAt }
    this.windows.set(key, window)
    return {
      available: true,
      allowed: window.count <= limit,
      remaining: Math.max(0, limit - window.count),
      retryAfter: Math.max(1, Math.ceil((window.resetAt - currentTime) / 1000)),
    }
  }
}
