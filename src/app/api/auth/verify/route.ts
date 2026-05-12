import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicLink } from '@/lib/auth'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'session'
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-me'

/**
 * Create a session token for a user
 */
function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}`
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64')
}

/**
 * Verify a session token and return userId
 */
function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId, timestamp, signature] = decoded.split(':')
    const payload = `${userId}:${timestamp}`
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex')
    if (signature === expectedSignature) {
      return userId
    }
    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    )
  }

  const userId = await verifyMagicLink(token)

  if (!userId) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }

  // Create session token
  const sessionToken = createSessionToken(userId)

  // Set HTTP-only cookie
  const response = NextResponse.redirect(
    new URL('/dashboard', request.nextUrl.origin)
  )
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return response
}