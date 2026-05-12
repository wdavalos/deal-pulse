const fs = require('fs')

test('globals.css has earth palette CSS variables', () => {
  const css = fs.readFileSync('src/app/globals.css', 'utf8')
  expect(css).toContain('--earth-bg: #0a0a0f')
  expect(css).toContain('--earth-primary: #b45309')
  expect(css).toContain('--earth-primary-hover: #92400e')
})
