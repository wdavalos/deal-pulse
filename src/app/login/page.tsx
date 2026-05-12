'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to send login link')
        setStatus('error')
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-xl p-8"
          style={{
            backgroundColor: '#111111',
            border: '1px solid #222222',
          }}
        >
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: '"Space Mono", monospace', color: '#ffffff' }}
          >
            Welcome to DealPulse
          </h1>
          <p className="mb-8" style={{ color: '#888888' }}>
            Enter your email to receive a login link
          </p>

          {status === 'success' ? (
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="#b45309"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#ffffff' }}>
                Link sent!
              </h2>
              <p style={{ color: '#888888' }}>
                Check your email for a login link. It will expire in 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#888888' }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #222222',
                    color: '#ffffff',
                  }}
                  placeholder="you@example.com"
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div
                  className="rounded-lg p-3 text-sm"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: status === 'loading' ? '#92400e' : '#b45309',
                  color: 'white',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  fontFamily: '"Space Mono", monospace',
                }}
              >
                {status === 'loading' ? 'Sending...' : 'Send login link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
