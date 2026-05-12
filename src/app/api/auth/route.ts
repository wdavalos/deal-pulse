import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink } from '@/lib/auth'
import { resend } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const token = await createMagicLink(email)
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`

    // Send email via Resend
    await resend.emails.send({
      from: 'DealPulse <noreply@dealPulse.io>',
      to: email,
      subject: 'Your DealPulse Login Link',
      html: `
        <h1>Welcome to DealPulse</h1>
        <p>Click the link below to sign in to your account:</p>
        <a href="${loginUrl}">${loginUrl}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this link, you can safely ignore this email.</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    )
  }
}