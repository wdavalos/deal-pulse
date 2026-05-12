'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--earth-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5"
        style={{ borderBottom: '1px solid var(--earth-border)' }}
      >
        <div
          className="text-lg font-bold text-white"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          AppSumo Deal Pulse
        </div>
        <Link
          href="/login"
          className="text-sm transition-colors"
          style={{ color: 'var(--earth-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--earth-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--earth-muted)')}
        >
          Sign in
        </Link>
      </header>

      {/* Hero — single screen, centered */}
      <main
        className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Tagline */}
        <div
          className="text-sm tracking-widest mb-6"
          style={{
            fontFamily: '"Space Mono", monospace',
            color: 'var(--earth-primary)',
            letterSpacing: '0.1em',
          }}
        >
          // for SaaS founders
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          Know when your{' '}
          <span style={{ color: 'var(--earth-primary)' }}>deal changes</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl mb-10 max-w-md"
          style={{ color: 'var(--earth-subtle)', lineHeight: 1.6 }}
        >
          Instant alerts when your AppSumo deal goes live, fills a tier, or expires.
          No dashboard scrolling — just notifications.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-block text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--earth-primary)',
            fontFamily: '"Space Mono", monospace',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--earth-primary-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--earth-primary)')
          }
        >
          Start for free
        </Link>

        {/* Divider */}
        <div
          className="flex items-center gap-4 w-full max-w-xs mt-10"
          style={{ color: 'var(--earth-border)' }}
        >
          <div className="flex-1 h-px" />
          <span className="text-xs" style={{ color: 'var(--earth-muted)' }}>
            or
          </span>
          <div className="flex-1 h-px" />
        </div>

        {/* Alt link */}
        <p className="mt-4 text-sm" style={{ color: 'var(--earth-muted)' }}>
          Already running a deal?{' '}
          <Link href="/login" style={{ color: 'var(--earth-primary)' }}>
            Sign in
          </Link>
        </p>
      </main>
    </div>
  )
}
