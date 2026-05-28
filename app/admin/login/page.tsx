'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_EMAILS = ['kelly@destroyersbaseball.org', 'kelly@iqbio.io']

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required')
      return
    }
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })
      if (authError) throw authError
      if (!data.user?.email || !ADMIN_EMAILS.includes(data.user.email.toLowerCase())) {
        await supabase.auth.signOut()
        setError('Access denied.')
        return
      }
      router.push('/admin')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f4f3ef',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, padding: 40,
        width: '100%', maxWidth: 400, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', letterSpacing: '-0.5px' }}>
            Diamond IQ
          </div>
          <div style={{ fontSize: 13, color: '#73726c', marginTop: 4 }}>Admin Portal</div>
        </div>

        {error && (
          <div style={{
            background: '#FFEBEE', color: '#B71C1C', padding: '10px 14px',
            borderRadius: 8, fontSize: 13, marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
            Email
          </label>
          <input
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@diqbaseball.com"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          style={{
            width: '100%', padding: 12, background: loading ? '#73726c' : '#042C53',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
