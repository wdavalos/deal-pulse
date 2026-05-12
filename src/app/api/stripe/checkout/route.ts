import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
  tier: z.enum(['pro', 'agency']),
  userId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier, userId } = checkoutSchema.parse(body)

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        userId,
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