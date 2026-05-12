import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const runtime = 'nodejs'

// Valid tiers for upgrade
const VALID_TIERS = ['pro', 'agency'] as const
type ValidTier = typeof VALID_TIERS[number]

// Helper to check if event was already processed (idempotency)
async function isEventProcessed(eventId: string): Promise<boolean> {
  const event = await prisma.webhookEvent.findUnique({
    where: { id: eventId },
  })
  return event !== null
}

// Helper to mark event as processed
async function markEventProcessed(eventId: string): Promise<void> {
  await prisma.webhookEvent.create({
    data: { id: eventId },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check: skip already processed events
  try {
    const alreadyProcessed = await isEventProcessed(event.id)
    if (alreadyProcessed) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true, skipped: true })
    }
  } catch (err) {
    console.error('Error checking event idempotency:', err)
    // If we can't check, fail safely and let Stripe retry
    return NextResponse.json({ error: 'Idempotency check failed' }, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const tier = session.metadata?.tier as string

        // Validate tier against allowed values before DB write
        if (!userId || !tier || !VALID_TIERS.includes(tier as ValidTier)) {
          console.error(`Invalid tier or missing userId: tier=${tier}, userId=${userId}`)
          // Return error so Stripe retries with corrected metadata
          return NextResponse.json({ error: 'Invalid tier or userId' }, { status: 400 })
        }

        // Update user tier and stripeCustomerId
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier,
            stripeCustomerId: session.customer as string,
          },
        })
        console.log(`User ${userId} upgraded to ${tier}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by stripeCustomerId and revert to free
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { tier: 'free' },
          })
          console.log(`User ${user.id} reverted to free tier`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error('Error processing webhook:', err)
    // Return error so Stripe retries if DB operation failed
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  // Only mark as processed and return success after all DB operations succeed
  try {
    await markEventProcessed(event.id)
  } catch (err) {
    console.error('Error marking event as processed:', err)
    // If we can't mark it processed, fail and let Stripe retry
    return NextResponse.json({ error: 'Failed to mark event processed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}