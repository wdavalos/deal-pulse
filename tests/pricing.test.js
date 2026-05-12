const fs = require('fs')

test('pricing has only Free and Pro tiers', () => {
  const pricing = fs.readFileSync('src/components/PricingTable.tsx', 'utf8')

  // Has Free and Pro
  expect(pricing).toContain("name: 'Free'")
  expect(pricing).toContain("name: 'Pro'")

  // No Agency tier
  expect(pricing).not.toContain("name: 'Agency'")

  // Pro uses earth-primary/amber border
  expect(pricing).toContain('earth-primary')
})
