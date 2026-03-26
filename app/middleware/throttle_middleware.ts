import type { HttpContext } from '@adonisjs/core/http'

// Store IPs and their request counts
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>()

export default class ThrottleMiddleware {
  async handle({ request, response, session }: HttpContext, next: () => Promise<void>) {
    const ip = request.ip()
    const now = Date.now()
    
    const record = rateLimitMap.get(ip)
    
    // 5 requests per minute allowed (strict brute force protection for joining)
    const MAX_REQUESTS = 5
    const WINDOW_MS = 60000 
    
    if (record && now < record.expiresAt) {
      if (record.count >= MAX_REQUESTS) {
        session.flash('error', 'Too many join attempts. Please wait a minute.')
        return response.redirect().back()
      }
      record.count++
    } else {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + WINDOW_MS })
    }

    // Clean up old entries randomly (10% chance per request) to prevent memory leak
    if (Math.random() < 0.1) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.expiresAt) {
          rateLimitMap.delete(key)
        }
      }
    }

    await next()
  }
}
