import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'session'
const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required')
}

const sessionSecret: string = SESSION_SECRET

/**
 * Verify a session token and return userId
 */
function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [userId, signature] = decoded.split(':')
    const payload = userId
    const expectedSignature = crypto
      .createHmac('sha256', sessionSecret)
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

/**
 * Get authenticated user from session cookie
 */
function getAuthenticatedUser(request: NextRequest): string | null {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!sessionToken) return null
  return verifySessionToken(sessionToken)
}

const checkoutSchema = z.object({
  tier: z.enum(['pro', 'agency']),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user via session cookie
    const authenticatedUserId = getAuthenticatedUser(request)
    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = checkoutSchema.parse(body)

    // Validate user exists and matches authenticated user
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate tier has a price
    const priceId = STRIPE_PRICES[tier]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: authenticatedUserId,
        tier,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}