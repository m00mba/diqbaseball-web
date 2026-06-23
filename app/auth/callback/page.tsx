'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Status = 'processing' | 'success' | 'error'

const MESSAGES: Record<string, { title: string; body: string }> = {
  email_change: {
    title: 'Email Updated',
    body: 'Your email address has been successfully changed. You can now sign in with your new email.',
  },
  recovery: {
    title: "You're Signed In",
    body: 'Your identity has been verified. Head back to the app to set a new password in Account Settings.',
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

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      // Supabase sends the token in the URL hash fragment, e.g.
      // #access_token=...&refresh_token=...&type=email_change&expires_at=...
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
      setStatus('success')

      // Clear the sensitive tokens from the URL bar once handled.
      window.history.replaceState(null, '', window.location.pathname)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'This link is invalid or has expired.')
      setStatus('error')
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
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>

          {status === 'processing' && (
            <>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', marginBottom: 8 }}>
                Confirming...
              </div>
              <div style={{ fontSize: 13, color: '#73726c' }}>
                One moment while we verify your link.
              </div>
            </>
          )}

          {status === 'success' && (
            <>
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
            </>
          )}

          {status === 'error' && (
            <>
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
            </>
          )}

        </div>
      </div>
    </div>
  )
}
