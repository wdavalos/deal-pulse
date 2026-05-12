/** @type {import('tailwindcss').Config} */
const config = require('../tailwind.config.js')

describe('Tailwind config', () => {
  it('has custom earth palette', () => {
    expect(config.theme.extend.colors.earth).toBeDefined()
    expect(config.theme.extend.colors.earth.primary).toBe('#b45309')
    expect(config.theme.extend.colors.earth['primary-hover']).toBe('#92400e')
  })

  it('has Space Mono font family', () => {
    expect(config.theme.extend.fontFamily).toBeDefined()
    expect(config.theme.extend.fontFamily.mono.join(' ')).toContain('Space Mono')
  })
})
