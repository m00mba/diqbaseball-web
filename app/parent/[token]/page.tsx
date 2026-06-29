'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './parent.module.css'
import Header from '@/app/components/Header'

import { use } from 'react'

export default function ParentView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [player, setPlayer] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Log game state
  const [showLogGame, setShowLogGame] = useState(false)
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10))
  const [opponent, setOpponent] = useState('')
  const [ab, setAb] = useState('')
  const [h, setH] = useState('')
  const [hr, setHr] = useState('')
  const [rbi, setRbi] = useState('')
  const [bb, setBb] = useState('')
  const [so, setSo] = useState('')
  const [runs, setRuns] = useState('')
  const [doubles, setDoubles] = useState('')
  const [triples, setTriples] = useState('')
  const [hbp, setHbp] = useState('')
  const [sb, setSb] = useState('')
  const [result, setResult] = useState('W')
  const [seasonType, setSeasonType] = useState('travel')
  const [gameStats, setGameStats] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Parent account state
  const [parentUser, setParentUser] = useState<any>(null)
  const [showSignup, setShowSignup] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [parentEmail, setParentEmail] = useState('')
  const [parentPassword, setParentPassword] = useState('')
  const [parentName, setParentName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    loadProfile()
    checkParentSession()
  }, [token])

  async function checkParentSession() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data?.role === 'parent') setParentUser(data)
    }
  }

  async function handleParentSignup() {
    if (!parentEmail || !parentPassword || !parentName) {
      setAuthError('Please fill in all fields')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      // Create auth account
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: parentEmail,
        password: parentPassword,
      })
      if (signupError) throw signupError

      // Create users record
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user!.id,
        email: parentEmail,
        name: parentName,
        role: 'parent',
      })
      if (userError) throw userError

      // Link to player
      if (player) {
        await supabase.from('player_parents').insert({
          player_id: player.id,
          parent_user_id: authData.user!.id,
          relationship: 'parent',
        })
      }

      setParentUser({ id: authData.user!.id, name: parentName, email: parentEmail, role: 'parent' })
      setShowSignup(false)
      setSuccessMsg("✅ Account created! You can now manage your player's profile.")
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (e: any) {
      setAuthError(e.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleParentLogin() {
    if (!parentEmail || !parentPassword) {
      setAuthError('Please enter email and password')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parentEmail,
        password: parentPassword,
      })
      if (error) throw error

      // Link to player if not already linked
      if (player) {
        await supabase.from('player_parents').upsert({
          player_id: player.id,
          parent_user_id: data.user.id,
        }, { onConflict: 'player_id,parent_user_id', ignoreDuplicates: true })
      }

      const { data: userData } = await supabase.from('users').select('*').eq('id', data.user.id).single()
      setParentUser(userData)
      setShowLogin(false)
    } catch (e: any) {
      setAuthError(e.message)
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleParentSignOut() {
    await supabase.auth.signOut()
    setParentUser(null)
  }

  async function loadProfile() {
    setLoading(true)

    const { data: profile, error } = await supabase
      .from('player_profiles')
      .select(`
        *,
        user:users(name),
        hs_team:teams!hs_team_id(name),
        travel_team:teams!travel_team_id(name)
      `)
      .eq('parent_token', token)
      .single()

    if (error || !profile) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setPlayer(profile)

    // Load verified sessions
    const { data: sessionData } = await supabase
      .from('verified_measurables')
      .select('*, facility:facility_profiles(name)')
      .eq('player_id', profile.id)
      .order('verified_at', { ascending: false })
    setSessions(sessionData ?? [])

    // Load recent game stats
    const { data: statsData } = await supabase
      .from('game_stats')
      .select('*')
      .eq('player_id', profile.id)
      .order('game_date', { ascending: false })
      .limit(10)
    setGameStats(statsData ?? [])

    setLoading(false)
  }

  async function handleLogGame() {
    if (!parentUser) {
      setSuccessMsg('Please sign in or create an account to log games.')
      return
    }
    if (!opponent.trim() || !ab) {
      setSuccessMsg('Please fill in opponent and at bats')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('game_stats')
        .insert({
          player_id: player.id,
          logged_by: parentUser.id,
          opponent: opponent.trim(),
          game_date: gameDate,
          result,
          level: seasonType === 'hs_varsity' ? 'hs_varsity' : 'travel',
          season_type: seasonType,
          season_year: new Date().getFullYear(),
          ab: parseInt(ab) || 0,
          h: parseInt(h) || 0,
          hr: parseInt(hr) || 0,
          rbi: parseInt(rbi) || 0,
          bb: parseInt(bb) || 0,
          k: parseInt(so) || 0,
          runs: parseInt(runs) || 0,
          doubles: parseInt(doubles) || 0,
          triples: parseInt(triples) || 0,
          hbp: parseInt(hbp) || 0,
          sb: parseInt(sb) || 0,
          source: 'player',
        })
      if (error) throw error
      setSuccessMsg('✅ Game logged successfully!')
      setShowLogGame(false)
      setOpponent(''); setAb(''); setH(''); setHr(''); setRbi(''); setBb(''); setSo('')
      setRuns(''); setDoubles(''); setTriples(''); setHbp(''); setSb('')
      // Reload stats
      const { data } = await supabase.from('game_stats').select('*')
        .eq('player_id', player.id).order('game_date', { ascending: false }).limit(10)
      setGameStats(data ?? [])
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e: any) {
      setSuccessMsg(`Error: ${e?.message ?? 'Please try again.'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingDot} />
    </div>
  )

  if (notFound) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>⚾</div>
      <h2>Link not found</h2>
      <p>This parent link may have expired or is incorrect.</p>
    </div>
  )

  const latestSession = sessions[0]

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>
        {successMsg && <div className={styles.successBar}>{successMsg}</div>}

        {/* Player hero */}
        <div className={styles.hero}>
          <div className={styles.avatar}>
            {player.photo_url
              ? <img src={player.photo_url} alt={player.user?.name} className={styles.avatarImg} />
              : <span className={styles.avatarInitial}>{(player.user?.name ?? '?').charAt(0)}</span>
            }
          </div>
          <div>
            <h1 className={styles.playerName}>{player.user?.name}</h1>
            <div className={styles.playerMeta}>
              {(player.positions ?? []).length > 0 && (
                <span className={styles.metaTag}>{player.positions.join(' / ')}</span>
              )}
              {player.grad_year && <span className={styles.metaTag}>Class of {player.grad_year}</span>}
            </div>
            <div className={styles.diqScore}>
              <span className={styles.diqValue}>{(player.diq_score ?? 0).toFixed(1)}</span>
              <span className={styles.diqLabel}> DIQ Score</span>
            </div>
          </div>
        </div>

        {/* Parent Account Section */}
        {!parentUser ? (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>📱 Parent Account</h3>
            <p style={{ fontSize: 13, color: '#73726c', marginBottom: 16 }}>
              Create an account to manage {player.user?.name?.split(' ')[0]}&apos;s profile, post highlights, and receive notifications.
            </p>
            {showSignup ? (
              <div>
                {authError && <div style={{ color: '#CC2E2E', fontSize: 13, marginBottom: 8 }}>{authError}</div>}
                <input className={styles.input} value={parentName} onChange={e => setParentName(e.target.value)}
                  placeholder="Your full name" style={{ marginBottom: 8 }} />
                <input className={styles.input} type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)}
                  placeholder="Your email" style={{ marginBottom: 8 }} />
                <input className={styles.input} type="password" value={parentPassword} onChange={e => setParentPassword(e.target.value)}
                  placeholder="Create password" style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.saveBtn} onClick={handleParentSignup} disabled={authLoading}>
                    {authLoading ? 'Creating...' : 'Create Account'}
                  </button>
                  <button className={styles.logGameBtn} onClick={() => { setShowSignup(false); setAuthError('') }}>Cancel</button>
                </div>
                <p style={{ fontSize: 12, color: '#73726c', marginTop: 12 }}>
                  Already have an account? <span style={{ color: '#185FA5', cursor: 'pointer' }} onClick={() => { setShowSignup(false); setShowLogin(true) }}>Sign in</span>
                </p>
              </div>
            ) : showLogin ? (
              <div>
                {authError && <div style={{ color: '#CC2E2E', fontSize: 13, marginBottom: 8 }}>{authError}</div>}
                <input className={styles.input} type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)}
                  placeholder="Your email" style={{ marginBottom: 8 }} />
                <input className={styles.input} type="password" value={parentPassword} onChange={e => setParentPassword(e.target.value)}
                  placeholder="Password" style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.saveBtn} onClick={handleParentLogin} disabled={authLoading}>
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <button className={styles.logGameBtn} onClick={() => { setShowLogin(false); setAuthError('') }}>Cancel</button>
                </div>
                <p style={{ fontSize: 12, color: '#73726c', marginTop: 12 }}>
                  No account? <span style={{ color: '#185FA5', cursor: 'pointer' }} onClick={() => { setShowLogin(false); setShowSignup(true) }}>Create one</span>
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.saveBtn} onClick={() => setShowSignup(true)}>Create Parent Account</button>
                <button className={styles.logGameBtn} onClick={() => setShowLogin(true)}>Sign In</button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.card} style={{ background: '#042C53' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>👋 {parentUser.name}</div>
                <div style={{ fontSize: 12, color: '#9BC4E2', marginTop: 2 }}>Linked to {player.user?.name}</div>
              </div>
              <button onClick={handleParentSignOut}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#9BC4E2', fontSize: 12, cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Latest verified session */}
        {latestSession && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Latest Verified Session</h3>
            <p className={styles.sessionMeta}>
              {latestSession.facility?.name} · {new Date(latestSession.verified_at).toLocaleDateString()}
            </p>
            <div className={styles.metricsGrid}>
              {latestSession.exit_velo && <div className={styles.metric}><span className={styles.metricVal}>{latestSession.exit_velo} mph</span><span className={styles.metricLbl}>Max Exit Velo</span></div>}
              {latestSession.avg_exit_velo && <div className={styles.metric}><span className={styles.metricVal}>{latestSession.avg_exit_velo} mph</span><span className={styles.metricLbl}>Avg Exit Velo</span></div>}
              {latestSession.bat_speed && <div className={styles.metric}><span className={styles.metricVal}>{latestSession.bat_speed} mph</span><span className={styles.metricLbl}>Bat Speed</span></div>}
              {latestSession.launch_angle && <div className={styles.metric}><span className={styles.metricVal}>{latestSession.launch_angle}°</span><span className={styles.metricLbl}>Launch Angle</span></div>}
              {latestSession.fb_velo && <div className={styles.metric}><span className={styles.metricVal}>{latestSession.fb_velo} mph</span><span className={styles.metricLbl}>FB Velo</span></div>}
              {latestSession.arm_velo && <div className={styles.metric}><span className={styles.metricVal}>{latestSession.arm_velo} mph</span><span className={styles.metricLbl}>Arm Velo</span></div>}
            </div>

            {latestSession.ai_report && (
              <div className={styles.aiBox}>
                <div className={styles.aiTitle}>🏟 Facility Analysis</div>
                <p className={styles.aiText}>
                  {latestSession.ai_report
                    .replace(/^#{1,3}\s*(STRENGTHS|OPPORTUNITIES|RECOMMENDED DRILLS)[:\s]*/gim, '')
                    .replace(/\*\*/g, '')
                    .trim()
                    .substring(0, 300)}
                  {latestSession.ai_report.length > 300 ? '...' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Session history */}
        {sessions.length > 1 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Session History ({sessions.length})</h3>
            {sessions.map(s => (
              <div key={s.id} className={styles.sessionRow}>
                <div>
                  <div className={styles.sessionFacility}>{s.facility?.name}</div>
                  <div className={styles.sessionDate}>{new Date(s.verified_at).toLocaleDateString()}</div>
                </div>
                <div className={styles.sessionMetrics}>
                  {s.exit_velo && <span className={styles.sessionBadge}>EV {s.exit_velo}</span>}
                  {s.bat_speed && <span className={styles.sessionBadge}>BS {s.bat_speed}</span>}
                  {s.fb_velo && <span className={styles.sessionBadge}>FB {s.fb_velo}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Log game section */}
        <div className={styles.card}>
          <div className={styles.logGameHeader}>
            <div>
              <h3 className={styles.cardTitle}>Log a Game</h3>
              <p className={styles.logGameSubtitle}>Help {player.user?.name?.split(' ')[0]} track their stats</p>
            </div>
            <button
              className={styles.logGameBtn}
              onClick={() => setShowLogGame(!showLogGame)}
            >
              {showLogGame ? 'Cancel' : '+ Log Game'}
            </button>
          </div>

          {showLogGame && (
            <div className={styles.logForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Date</label>
                  <input className={styles.input} type="date" value={gameDate} onChange={e => setGameDate(e.target.value)} />
                </div>
                <div className={styles.formGroup} style={{ flex: 2 }}>
                  <label className={styles.label}>Opponent</label>
                  <input className={styles.input} value={opponent} onChange={e => setOpponent(e.target.value)} placeholder="Team name" />
                </div>
              </div>

              {/* Result and Season Type */}
              <div className={styles.formRow} style={{ marginBottom: 12 }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Result</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['W', 'L', 'T'].map(r => (
                      <button key={r} onClick={() => setResult(r)}
                        style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid',
                          borderColor: result === r ? '#042C53' : '#ddd',
                          background: result === r ? '#042C53' : '#fff',
                          color: result === r ? '#fff' : '#73726c',
                          fontWeight: result === r ? 700 : 400, cursor: 'pointer' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Season Type</label>
                  <select className={styles.input} value={seasonType} onChange={e => setSeasonType(e.target.value)}>
                    <option value="travel">Travel</option>
                    <option value="hs_varsity">HS Varsity</option>
                    <option value="hs_jv">HS JV</option>
                    <option value="showcase">Showcase</option>
                  </select>
                </div>
              </div>

              <div className={styles.statsGrid}>
                {[
                  { label: 'AB', value: ab, setter: setAb },
                  { label: 'H', value: h, setter: setH },
                  { label: '2B', value: doubles, setter: setDoubles },
                  { label: '3B', value: triples, setter: setTriples },
                  { label: 'HR', value: hr, setter: setHr },
                  { label: 'RBI', value: rbi, setter: setRbi },
                  { label: 'R', value: runs, setter: setRuns },
                  { label: 'BB', value: bb, setter: setBb },
                  { label: 'K', value: so, setter: setSo },
                  { label: 'HBP', value: hbp, setter: setHbp },
                  { label: 'SB', value: sb, setter: setSb },
                ].map(({ label, value, setter }) => (
                  <div key={label} className={styles.statInput}>
                    <label className={styles.statLabel}>{label}</label>
                    <input
                      className={styles.statField}
                      type="number"
                      min="0"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              <button
                className={styles.saveBtn}
                onClick={handleLogGame}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Game'}
              </button>
            </div>
          )}
        </div>

        {/* Recent Game Stats */}
        {gameStats.length > 0 && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Recent Games ({gameStats.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8f8f7' }}>
                    {['Date', 'Opponent', 'AB', 'H', 'HR', 'RBI', 'BB', 'K', 'SB', 'Src'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#73726c', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameStats.map(g => (
                    <tr key={g.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 8px', color: '#73726c', whiteSpace: 'nowrap' }}>{new Date(g.game_date + 'T12:00:00').toLocaleDateString()}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.opponent}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.ab}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.h}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.hr}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.rbi}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.bb}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.k}</td>
                      <td style={{ padding: '6px 8px', color: '#73726c' }}>{g.sb}</td>
                      <td style={{ padding: '6px 8px' }}>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 5px', borderRadius: 4,
                          background: g.source === 'gamechanger' ? '#E6F1FB' : '#f0f0f0',
                          color: g.source === 'gamechanger' ? '#185FA5' : '#73726c' }}>
                          {g.source === 'gamechanger' ? 'Coach' : 'Self'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>Diamond IQ — Verified Athlete Intelligence</p>
        </div>
      </div>
    </div>
  )
}
