'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './admin.module.css'

const ADMIN_EMAIL = 'kelly@destroyersbaseball.org'

type Tab = 'users' | 'facilities' | 'create'
type Role = 'player' | 'coach' | 'scout' | 'facility'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  verified: boolean
  created_at: string
}

interface FacilityRecord {
  id: string
  name: string
  city: string
  state: string
  verified: boolean
  user_id: string
  user?: { name: string; email: string }
}

export default function AdminPortal() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('users')
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  // Users tab
  const [users, setUsers] = useState<UserRecord[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Facilities tab
  const [facilities, setFacilities] = useState<FacilityRecord[]>([])
  const [facilitiesLoading, setFacilitiesLoading] = useState(false)

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Create account
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState<Role>('player')
  const [creating, setCreating] = useState(false)
  const [facilityName, setFacilityName] = useState('')
  const [facilityCity, setFacilityCity] = useState('')
  const [facilityState, setFacilityState] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.push('/facility/login')
        return
      }
      setCurrentUserEmail(data.user.email)
      setLoading(false)
      loadUsers()
    })
  }, [router])

  function flash(msg: string, isError = false) {
    if (isError) setErrorMsg(msg)
    else setSuccessMsg(msg)
    setTimeout(() => { setSuccessMsg(''); setErrorMsg('') }, 4000)
  }

  async function loadUsers() {
    setUsersLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, verified, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    setUsers(data ?? [])
    setUsersLoading(false)
  }

  async function loadFacilities() {
    setFacilitiesLoading(true)
    const { data } = await supabase
      .from('facility_profiles')
      .select('id, name, city, state, verified, user_id, user:users(name, email)')
      .order('name')
    setFacilities((data as unknown as FacilityRecord[]) ?? [])
    setFacilitiesLoading(false)
  }

  useEffect(() => {
    if (tab === 'facilities') loadFacilities()
    if (tab === 'users') loadUsers()
  }, [tab])

  async function handleResetPassword(email: string, userId: string) {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(`✅ Password reset email sent to ${email}`)
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to send reset email', true)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteUser(userId: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(`✅ ${name} deleted`)
      await loadUsers()
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to delete user', true)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleToggleVerified(facility: FacilityRecord) {
    setActionLoading(facility.id)
    const { error } = await supabase
      .from('facility_profiles')
      .update({ verified: !facility.verified })
      .eq('id', facility.id)
    if (error) {
      flash(error.message, true)
    } else {
      flash(`✅ ${facility.name} ${!facility.verified ? 'verified' : 'unverified'}`)
      await loadFacilities()
    }
    setActionLoading(null)
  }

  async function handleCreateAccount() {
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      flash('Name, email, and password are required', true)
      return
    }
    if (createRole === 'facility' && !facilityName.trim()) {
      flash('Facility name is required', true)
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim().toLowerCase(),
          password: createPassword.trim(),
          role: createRole,
          facilityName: facilityName.trim(),
          facilityCity: facilityCity.trim(),
          facilityState: facilityState.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(`✅ Account created for ${createName}`)
      setCreateName(''); setCreateEmail(''); setCreatePassword('')
      setFacilityName(''); setFacilityCity(''); setFacilityState('')
      setCreateRole('player')
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to create account', true)
    } finally {
      setCreating(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) return <div className={styles.loading}>Checking access...</div>

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLogo}>Diamond IQ</span>
          <span className={styles.headerSub}>Admin Portal</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.adminBadge}>🔑 {currentUserEmail}</span>
          <button className={styles.signOutBtn} onClick={async () => {
            await supabase.auth.signOut()
            router.push('/facility/login')
          }}>Sign Out</button>
        </div>
      </header>

      {successMsg && <div className={styles.successBar}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBar}>{errorMsg}</div>}

      <div className={styles.tabs}>
        {(['users', 'facilities', 'create'] as Tab[]).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'users' ? '👥 Users' : t === 'facilities' ? '🏟 Facilities' : '➕ Create Account'}
          </button>
        ))}
      </div>

      <div className={styles.content}>

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div>
            <div className={styles.toolbar}>
              <input
                className={styles.searchInput}
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <select
                className={styles.select}
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="player">Players</option>
                <option value="coach">Coaches</option>
                <option value="scout">Scouts</option>
                <option value="facility">Facilities</option>
              </select>
              <button className={styles.refreshBtn} onClick={loadUsers}>↻ Refresh</button>
            </div>

            <div className={styles.countBar}>{filteredUsers.length} users</div>

            {usersLoading ? (
              <div className={styles.loading}>Loading users...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.name ?? '—'}</td>
                      <td className={styles.emailCell}>{u.email}</td>
                      <td><span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>{u.role}</span></td>
                      <td>{u.verified ? '✅' : '—'}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.resetBtn}
                            onClick={() => handleResetPassword(u.email, u.id)}
                            disabled={actionLoading === u.id}
                          >
                            {actionLoading === u.id ? '...' : '🔑 Reset PW'}
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            disabled={actionLoading === u.id}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Facilities Tab ── */}
        {tab === 'facilities' && (
          <div>
            <div className={styles.toolbar}>
              <button className={styles.refreshBtn} onClick={loadFacilities}>↻ Refresh</button>
            </div>

            {facilitiesLoading ? (
              <div className={styles.loading}>Loading facilities...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Location</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Verified Partner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map(f => (
                    <tr key={f.id}>
                      <td>{f.name}</td>
                      <td>{[f.city, f.state].filter(Boolean).join(', ') || '—'}</td>
                      <td>{f.user?.name ?? '—'}</td>
                      <td className={styles.emailCell}>{f.user?.email ?? '—'}</td>
                      <td>{f.verified ? <span style={{ color: '#27500A' }}>✅ Verified</span> : '—'}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={f.verified ? styles.deleteBtn : styles.resetBtn}
                            onClick={() => handleToggleVerified(f)}
                            disabled={actionLoading === f.id}
                          >
                            {actionLoading === f.id ? '...' : f.verified ? 'Unverify' : '✅ Verify'}
                          </button>
                          <button
                            className={styles.resetBtn}
                            onClick={() => f.user?.email && handleResetPassword(f.user.email, f.id)}
                            disabled={actionLoading === f.id || !f.user?.email}
                          >
                            🔑 Reset PW
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Create Account Tab ── */}
        {tab === 'create' && (
          <div className={styles.createForm}>
            <h2 className={styles.formTitle}>Create New Account</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Account Type</label>
              <div className={styles.roleSelector}>
                {(['player', 'coach', 'scout', 'facility'] as Role[]).map(r => (
                  <button
                    key={r}
                    className={`${styles.roleBtn} ${createRole === r ? styles.roleBtnActive : ''}`}
                    onClick={() => setCreateRole(r)}
                  >
                    {r === 'player' ? '⚾ Player' : r === 'coach' ? '📋 Coach' : r === 'scout' ? '🔭 Scout' : '🏟 Facility'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input className={styles.input} value={createName} onChange={e => setCreateName(e.target.value)} placeholder="John Smith" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input className={styles.input} value={createEmail} onChange={e => setCreateEmail(e.target.value)} placeholder="john@example.com" type="email" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Temporary Password</label>
              <input className={styles.input} value={createPassword} onChange={e => setCreatePassword(e.target.value)} placeholder="Min 8 characters" type="password" />
            </div>

            {createRole === 'facility' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Facility Name</label>
                  <input className={styles.input} value={facilityName} onChange={e => setFacilityName(e.target.value)} placeholder="Triple Crown Baseball" />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <input className={styles.input} value={facilityCity} onChange={e => setFacilityCity(e.target.value)} placeholder="Charlotte" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>State</label>
                    <input className={styles.input} value={facilityState} onChange={e => setFacilityState(e.target.value)} placeholder="NC" />
                  </div>
                </div>
              </>
            )}

            <button
              className={styles.createBtn}
              onClick={handleCreateAccount}
              disabled={creating}
            >
              {creating ? 'Creating...' : `Create ${createRole.charAt(0).toUpperCase() + createRole.slice(1)} Account`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
