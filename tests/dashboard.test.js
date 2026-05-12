const fs = require('fs')

test('dashboard uses Space Mono for headings', () => {
  const dashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8')
  expect(dashboard).toContain('Space Mono')
})
