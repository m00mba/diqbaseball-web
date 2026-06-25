'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from './login.module.css'

export default function FacilityLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    const userId = data.user.id

    // Check if facility owner
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userRecord?.role === 'facility') {
      router.push('/facility/dashboard')
      return
    }

    // Check if staff member linked to a facility
    const { data: staffLink } = await supabase
      .from('facility_users')
      .select('facility_id')
      .eq('user_id', userId)
      .single()

    if (staffLink?.facility_id) {
      router.push('/facility/dashboard')
      return
    }

    setError('This portal is for facility accounts only.')
    await supabase.auth.signOut()
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Diamond IQ</span>
          <span className={styles.logoBadge}>FACILITY PORTAL</span>
        </div>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.sub}>Upload HitTrax sessions and verify player measurables.</p>
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.input} placeholder="you@facility.com" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} placeholder="••••••••" required />
          </div>
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
