'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Status = 'processing' | 'success' | 'set_password' | 'password_updated' | 'error'

const MESSAGES: Record<string, { title: string; body: string }> = {
  email_change: {
    title: 'Email Updated',
    body: 'Your email address has been successfully changed. You can now sign in with your new email.',
  },
  signup: {
    title: 'Email Confirmed',
    body: 'Your account is now verified. You can sign in to the app.',
  },
  default: {
    title: 'Confirmed',
    body: 'This link has been processed successfully.',
  },
}

export default function AuthCallback() {
  const [status, setStatus] = useState<Status>('processing')
  const [linkType, setLinkType] = useState<string>('default')
  const [errorMsg, setErrorMsg] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      // Supabase sends the token in the URL hash fragment, e.g.
      // #access_token=...&refresh_token=...&type=recovery&expires_at=...
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const params = new URLSearchParams(hash)

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type') ?? 'default'
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        throw new Error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')))
      }

      if (!accessToken || !refreshToken) {
        throw new Error('This link is missing required information. It may have expired — please request a new one.')
      }

      // Establishing the session is what actually completes the
      // email-change / recovery / signup confirmation on Supabase's side.
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (sessionError) throw sessionError

      setLinkType(type)

      // Clear the sensitive tokens from the URL bar once handled.
      window.history.replaceState(null, '', window.location.pathname)

      // Recovery links need an actual new-password form — every other
      // link type just confirms and sends the user on their way.
      setStatus(type === 'recovery' ? 'set_password' : 'success')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'This link is invalid or has expired.')
      setStatus('error')
    }
  }

  async function handleSetNewPassword() {
    setPasswordError('')
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setStatus('password_updated')
    } catch (e: unknown) {
      setPasswordError(e instanceof Error ? e.message : 'Could not update password. Please try again.')
    } finally {
      setSavingPassword(false)
    }
  }

  const message = MESSAGES[linkType] ?? MESSAGES.default

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

          {status === 'processing' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', marginBottom: 8 }}>
                Confirming...
              </div>
              <div style={{ fontSize: 13, color: '#73726c' }}>
                One moment while we verify your link.
              </div>
            </div>
          )}

          {status === 'set_password' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', letterSpacing: '-0.5px' }}>Set a New Password</div>
                <div style={{ fontSize: 13, color: '#73726c', marginTop: 4 }}>Choose a new password for your account</div>
              </div>

              {passwordError && (
                <div style={{ background: '#FFEBEE', color: '#B71C1C', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                  {passwordError}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>New Password</label>
                <input
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleSetNewPassword()}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleSetNewPassword()}
                />
              </div>

              <button
                style={{
                  width: '100%', padding: 12, background: savingPassword ? '#73726c' : '#042C53',
                  color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, cursor: savingPassword ? 'not-allowed' : 'pointer',
                }}
                onClick={handleSetNewPassword}
                disabled={savingPassword}
              >
                {savingPassword ? 'Saving...' : 'Save New Password'}
              </button>
            </>
          )}

          {status === 'password_updated' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', marginBottom: 8 }}>
                Password Updated
              </div>
              <div style={{ fontSize: 14, color: '#73726c', lineHeight: 1.5 }}>
                Your password has been changed. You can now sign in with your new password.
              </div>
              <Link href="/login" style={{
                display: 'inline-block', marginTop: 24, padding: '12px 28px',
                background: '#042C53', color: '#fff', borderRadius: 8,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Go to Sign In
              </Link>
            </div>
          )}

          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', marginBottom: 8 }}>
                {message.title}
              </div>
              <div style={{ fontSize: 14, color: '#73726c', lineHeight: 1.5 }}>
                {message.body}
              </div>
              <Link href="/login" style={{
                display: 'inline-block', marginTop: 24, padding: '12px 28px',
                background: '#042C53', color: '#fff', borderRadius: 8,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Go to Sign In
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', marginBottom: 8 }}>
                Link Issue
              </div>
              <div style={{ fontSize: 14, color: '#73726c', lineHeight: 1.5 }}>
                {errorMsg}
              </div>
              <Link href="/login" style={{
                display: 'inline-block', marginTop: 24, padding: '12px 28px',
                background: '#185FA5', color: '#fff', borderRadius: 8,
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
