'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PlayerLogin() {
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

      // Check role
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (user?.role !== 'player') {
        await supabase.auth.signOut()
        setError('This portal is for players only. Facilities can log in at facility.diqbaseball.com')
        return
      }

      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed')
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
      {/* Header */}
      <header style={{ background: '#042C53', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <a href="https://iqbio.io" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}><img src="/icon.png" width={32} height={32} style={{ borderRadius: "7px" }} alt="DIQ" /><span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Diamond IQ Baseball</span></a>
        </Link>
        <Link href="/facilities" style={{ color: '#B5D4F4', fontSize: 13, textDecoration: 'none' }}>Find Facilities</Link>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#042C53', letterSpacing: '-0.5px' }}>Player Login</div>
            <div style={{ fontSize: 13, color: '#73726c', marginTop: 4 }}>Sign in to your Diamond IQ profile</div>
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#B71C1C', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Password</label>
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
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#73726c' }}>
            Don't have an account?{' '}
            <Link href="/" style={{ color: '#185FA5', textDecoration: 'none', fontWeight: 500 }}>
              Download the app →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
