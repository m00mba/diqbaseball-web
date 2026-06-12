'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './admin.module.css'

const ADMIN_EMAILS = ['kelly@destroyersbaseball.org', 'kelly@iqbio.io']

type Tab = 'users' | 'facilities' | 'create'
type Role = 'player' | 'coach' | 'scout' | 'facility'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  verified: boolean
  created_at: string
  player_profile?: {
    parent_token: string | null
    public_slug: string | null
  }
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

  // Edit user modal
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState('')
  const [saving, setSaving] = useState(false)

  // Set password modal
  const [setPasswordUser, setSetPasswordUser] = useState<UserRecord | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)

  // Create account
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [createRole, setCreateRole] = useState<Role>('player')
  const [creating, setCreating] = useState(false)
  const [facilityName, setFacilityName] = useState('')
  const [facilityCity, setFacilityCity] = useState('')
  const [facilityState, setFacilityState] = useState('')

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email?.toLowerCase() ?? '')) {
        router.push('/facility/login')
        return
      }
      setCurrentUserEmail(data.user.email ?? null)
      setLoading(false)
      loadUsers()
      loadStats()
    })
  }, [router])

  async function loadStats() {
    const { data } = await supabase
      .from('users')
      .select('role')
    if (!data) return
    const counts: Record<string, number> = {}
    data.forEach((u: any) => {
      counts[u.role] = (counts[u.role] ?? 0) + 1
    })
    setStats(counts)
  }

  function flash(msg: string, isError = false) {
    if (isError) setErrorMsg(msg)
    else setSuccessMsg(msg)
    setTimeout(() => { setSuccessMsg(''); setErrorMsg('') }, 4000)
  }

  async function loadUsers() {
    setUsersLoading(true)
    const { data } = await supabase
      .from('users')
      .select('id, name, email, role, verified, created_at, player_profile:player_profiles(parent_token, public_slug)')
      .order('created_at', { ascending: false })
      .limit(200)
    setUsers((data ?? []).map((u: any) => ({
      ...u,
      player_profile: Array.isArray(u.player_profile) ? u.player_profile[0] : u.player_profile
    })) as UserRecord[])
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

  async function handleSetPassword() {
    if (!setPasswordUser) return
    if (!newPassword || newPassword.length < 8) {
      flash('Password must be at least 8 characters', true)
      return
    }
    setSettingPassword(true)
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: setPasswordUser.id,
          password: newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      if (data.recoveryLink) {
        // Open recovery link in new tab — admin sets password there
        window.open(data.recoveryLink, '_blank')
        flash(`✅ Recovery link opened for ${setPasswordUser.name} — set the password in the new tab`)
      } else {
        flash(`✅ Password set for ${setPasswordUser.name}`)
      }
      setSetPasswordUser(null)
      setNewPassword('')
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to set password', true)
    } finally {
      setSettingPassword(false)
    }
  }

  function openEdit(user: UserRecord) {
    setEditingUser(user)
    setEditName(user.name ?? '')
    setEditEmail(user.email ?? '')
    setEditPassword('')
    setEditRole(user.role ?? '')
  }

  async function handleSaveEdit() {
    if (!editingUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editName,
          email: editEmail,
          password: editPassword || undefined,
          role: editRole,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(`✅ ${editName} updated`)
      setEditingUser(null)
      await loadUsers()
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to update user', true)
    } finally {
      setSaving(false)
    }
  }

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
    try {
      const res = await fetch('/api/admin/toggle-facility-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityId: facility.id,
          verified: !facility.verified,
          adminEmail: currentUserEmail,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(`✅ ${facility.name} ${!facility.verified ? 'verified' : 'unverified'}`)
      await loadFacilities()
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to update facility', true)
    }
    setActionLoading(null)
  }

  async function handleCreateAccount() {
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      flash('Name, email, and password are required', true)
      return
    }
    if (createPassword.trim().length < 8) {
      flash('Password must be at least 8 characters', true)
      return
    }
    if (createPassword.trim() !== createPasswordConfirm.trim()) {
      flash('Passwords do not match', true)
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
      setCreateName(''); setCreateEmail(''); setCreatePassword(''); setCreatePasswordConfirm('')
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
          <a href="https://iqbio.io" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}><img src="/icon.png" width={32} height={32} style={{ borderRadius: "7px" }} alt="DIQ" /><span className={styles.headerLogo}>Diamond IQ Baseball</span></a>
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

      {/* Stats bar */}
      <div className={styles.statsBar}>
        {[
          { label: 'Total Users', value: Object.values(stats).reduce((a, b) => a + b, 0), color: '#042C53' },
          { label: 'Players', value: stats['player'] ?? 0, color: '#185FA5' },
          { label: 'Coaches', value: stats['coach'] ?? 0, color: '#27500A' },
          { label: 'Scouts', value: stats['scout'] ?? 0, color: '#7A5200' },
          { label: 'Facilities', value: stats['facility'] ?? 0, color: '#6A1B9A' },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statCardVal} style={{ color }}>{value}</div>
            <div className={styles.statCardLabel}>{label}</div>
          </div>
        ))}
      </div>

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
                            className={styles.editBtn}
                            onClick={() => openEdit(u)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.pwBtn}
                            onClick={() => { setSetPasswordUser(u); setNewPassword('') }}
                          >
                            🔐 Set PW
                          </button>
                          {u.role === 'player' && u.player_profile?.parent_token && (
                            <button
                              className={styles.parentBtn}
                              onClick={() => {
                                const link = `https://www.iqbio.io/parent/${u.player_profile!.parent_token}`
                                navigator.clipboard.writeText(link)
                                flash(`✅ Parent link copied for ${u.name}`)
                              }}
                            >
                              👨‍👦 Parent Link
                            </button>
                          )}
                          {u.role === 'player' && u.player_profile?.public_slug && (
                            <button
                              className={styles.profileBtn}
                              onClick={() => window.open(`https://www.iqbio.io/player/${u.player_profile!.public_slug}`, '_blank')}
                            >
                              👤 Profile
                            </button>
                          )}
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

            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Password</label>
              <input
                className={styles.input}
                value={createPasswordConfirm}
                onChange={e => setCreatePasswordConfirm(e.target.value)}
                placeholder="Re-enter password"
                type="password"
                style={{ borderColor: createPasswordConfirm && createPassword !== createPasswordConfirm ? '#CC2E2E' : undefined }}
              />
              {createPasswordConfirm && createPassword !== createPasswordConfirm && (
                <div style={{ fontSize: 11, color: '#CC2E2E', marginTop: 4 }}>Passwords do not match</div>
              )}
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

      {/* ── Set Password Modal ── */}
      {setPasswordUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 32,
            width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#042C53' }}>
              Set Password
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#73726c' }}>
              {setPasswordUser.name} · {setPasswordUser.email}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>
                New Password (min 8 characters)
              </label>
              <input
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{ flex: 1, padding: 11, background: '#f4f3ef', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#73726c' }}
                onClick={() => { setSetPasswordUser(null); setNewPassword('') }}
              >
                Cancel
              </button>
              <button
                style={{ flex: 2, padding: 11, background: settingPassword ? '#73726c' : '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: settingPassword ? 'not-allowed' : 'pointer' }}
                onClick={handleSetPassword}
                disabled={settingPassword}
              >
                {settingPassword ? 'Setting...' : 'Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 32,
            width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#042C53' }}>
              Edit User
            </h3>

            {[
              { label: 'Full Name', value: editName, setter: setEditName, type: 'text', placeholder: 'John Smith' },
              { label: 'Email', value: editEmail, setter: setEditEmail, type: 'email', placeholder: 'john@example.com' },
              { label: 'New Password (leave blank to keep current)', value: editPassword, setter: setEditPassword, type: 'password', placeholder: '••••••••' },
            ].map(({ label, value, setter, type, placeholder }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>
                  {label}
                </label>
                <input
                  style={{ width: '100%', padding: '9px 13px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                  type={type}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>
                Role
              </label>
              <select
                style={{ width: '100%', padding: '9px 13px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' }}
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
              >
                {['player', 'coach', 'scout', 'facility'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{ flex: 1, padding: 11, background: '#f4f3ef', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#73726c' }}
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </button>
              <button
                style={{ flex: 2, padding: 11, background: saving ? '#73726c' : '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
