'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: 'https://iqbio.io/auth/callback' }
      )
      if (resetError) throw resetError
      setSent(true)
    } catch (e: unknown) {
      // Don't reveal whether the email exists in the system — show the
      // same success state regardless, but log real errors for debugging.
      console.error('resetPasswordForEmail error:', e)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f3ef',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>
      <header style={{ background: '#042C53', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="https://iqbio.io" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/icon.png" width={32} height={32} style={{ borderRadius: 7 }} alt="DIQ" />
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Diamond IQ</span>
          <span style={{ color: '#C9A227', fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #C9A227', padding: '1px 5px', borderRadius: 3, marginLeft: 4 }}>Baseball</span>
        </a>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

          {!sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', letterSpacing: '-0.5px' }}>Forgot Password</div>
                <div style={{ fontSize: 13, color: '#73726c', marginTop: 4 }}>Enter your email and we'll send you a reset link</div>
              </div>

              {error && (
                <div style={{ background: '#FFEBEE', color: '#B71C1C', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Email</label>
                <input
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
              </div>

              <button
                style={{
                  width: '100%', padding: 12, background: loading ? '#73726c' : '#042C53',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#73726c' }}>
                <Link href="/login" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>
                  ← Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', marginBottom: 8 }}>
                Check Your Email
              </div>
              <div style={{ fontSize: 14, color: '#73726c', lineHeight: 1.5 }}>
                If an account exists for that email, a password reset link is on its way. It may take a few minutes to arrive.
              </div>
              <Link href="/login" style={{
                display: 'inline-block', marginTop: 24, padding: '12px 28px',
                background: '#042C53', color: '#fff', borderRadius: 8,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Back to Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
