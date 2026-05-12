import { prisma } from '@/lib/prisma'

describe('Prisma connection', () => {
  it('should connect and count users', async () => {
    const count = await prisma.user.count()
    expect(typeof count).toBe('number')
    expect(count).toBeGreaterThanOrEqual(0)
  })
})