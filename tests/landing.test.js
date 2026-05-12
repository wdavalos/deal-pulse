const fs = require('fs')

test('landing page has indie hacker hero content', () => {
  const page = fs.readFileSync('src/app/page.tsx', 'utf8')

  // Single-screen focused: min-height 90vh
  expect(page).toContain('min-h-[90vh]')

  // Space Mono for logo/brand via inline style
  expect(page).toContain('Space Mono')

  // Earth primary amber color
  expect(page).toContain('earth-primary')

  // CTA button
  expect(page).toContain('Start for free')

  // No features grid
  expect(page).not.toContain('Real-time Monitoring')
  expect(page).not.toContain('Features')

  // No how-it-works
  expect(page).not.toContain('Add your deal')
})
