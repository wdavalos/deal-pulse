import { NextResponse } from 'next/server'
import { STRIPE_PRICES } from '@/lib/stripe'

export async function GET() {
  return NextResponse.json({ prices: STRIPE_PRICES })
}