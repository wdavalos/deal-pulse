import crypto from 'crypto'
import { prisma } from './prisma'

const TOKEN_EXPIRY_MINUTES = 15

/**
 * Generate a random magic link token (32 bytes hex = 64 characters)
 */
export function generateMagicLinkToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token using SHA256
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Create a magic link for an email address
 * Returns the raw token that can be used in the URL
 */
export async function createMagicLink(email: string): Promise<string> {
  const token = generateMagicLinkToken()
  const hashedToken = hashToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

  await prisma.magicLink.create({
    data: {
      email: email.toLowerCase().trim(),
      token: hashedToken,
      expiresAt,
    },
  })

  return token
}

/**
 * Verify a magic link token
 * Returns userId if valid, null otherwise
 * Creates user if they don't exist yet
 */
export async function verifyMagicLink(rawToken: string): Promise<string | null> {
  const hashedToken = hashToken(rawToken)

  const magicLink = await prisma.magicLink.findUnique({
    where: { token: hashedToken },
  })

  if (!magicLink) {
    return null
  }

  // Check if expired
  if (new Date() > magicLink.expiresAt) {
    return null
  }

  // Check if already used
  if (magicLink.usedAt) {
    return null
  }

  // Mark as used
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  })

  // Find or create user by email
  let user = await prisma.user.findUnique({
    where: { email: magicLink.email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: magicLink.email,
      },
    })
  }

  return user.id
}