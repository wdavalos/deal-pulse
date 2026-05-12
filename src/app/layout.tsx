import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AppSumo Deal Pulse',
  description: 'Monitor your AppSumo deals and get instant Discord alerts when prices change',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: '#0a0a0f', color: '#ffffff' }}>
        {children}
      </body>
    </html>
  )
}
