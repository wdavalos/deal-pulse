const fs = require('fs')

test('layout imports Space Mono from Google Fonts', () => {
  const layout = fs.readFileSync('src/app/layout.tsx', 'utf8')
  expect(layout).toContain('fonts.googleapis.com')
  expect(layout).toContain('Space+Mono')
})
