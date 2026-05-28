'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import styles from './dashboard.module.css'

const POSITIONS = ['C','1B','2B','3B','SS','LF','CF','RF','OF','DH','RHP','LHP','UTIL']
const SEASON_TYPES = [
  { key: 'hs_varsity', label: 'HS Varsity' },
  { key: 'hs_jv', label: 'HS JV' },
  { key: 'travel', label: 'Travel Ball' },
  { key: 'showcase', label: 'Showcase' },
  { key: 'college', label: 'College' },
  { key: 'other', label: 'Other' },
]

type Tab = 'overview' | 'stats' | 'verified' | 'profile' | 'settings'

export default function PlayerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!userData || userData.role !== 'player') {
      await supabase.auth.signOut()
      router.push('/login')
      return
    }

    setUser(userData)

    const { data: profileData } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    setProfile(profileData)
    setLoading(false)
  }

  function flash(msg: string, isError = false) {
    if (isError) setErrorMsg(msg)
    else setSuccessMsg(msg)
    setTimeout(() => { setSuccessMsg(''); setErrorMsg('') }, 3000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.spinner} />
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.headerLogo}>Diamond IQ</Link>
          <span className={styles.headerName}>{user?.name}</span>
        </div>
        <div className={styles.headerRight}>
          {profile?.public_slug && (
            <Link href={`/player/${profile.public_slug}`} target="_blank" className={styles.headerProfileLink}>
              👤 Public Profile
            </Link>
          )}
          <button className={styles.signOutBtn} onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      {successMsg && <div className={styles.successBar}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBar}>{errorMsg}</div>}

      {/* Tabs */}
      <div className={styles.tabs}>
        {([
          { key: 'overview', label: '📊 Overview' },
          { key: 'stats', label: '⚾ Game Stats' },
          { key: 'verified', label: '✅ Verified' },
          { key: 'profile', label: '👤 Profile' },
          { key: 'settings', label: '⚙️ Settings' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && <OverviewTab user={user} profile={profile} flash={flash} />}
        {activeTab === 'stats' && <StatsTab profile={profile} flash={flash} />}
        {activeTab === 'verified' && <VerifiedTab profile={profile} />}
        {activeTab === 'profile' && <ProfileTab user={user} profile={profile} flash={flash} onSave={loadData} />}
        {activeTab === 'settings' && <SettingsTab user={user} profile={profile} flash={flash} />}
      </div>
    </div>
  )
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ user, profile, flash }: any) {
  const [sessions, setSessions] = useState<any[]>([])
  const [recentGames, setRecentGames] = useState<any[]>([])

  useEffect(() => {
    if (!profile) return
    supabase.from('verified_measurables')
      .select('*, facility:facility_profiles(name)')
      .eq('player_id', profile.id)
      .order('verified_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setSessions(data ?? []))

    supabase.from('game_stats')
      .select('*')
      .eq('player_id', profile.id)
      .order('game_date', { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentGames(data ?? []))
  }, [profile])

  const latestSession = sessions[0]

  return (
    <div className={styles.tabContent}>
      {/* DIQ Score + quick stats */}
      <div className={styles.overviewHero}>
        <div className={styles.diqScoreCard}>
          <div className={styles.diqScoreVal}>{(profile?.diq_score ?? 0).toFixed(1)}</div>
          <div className={styles.diqScoreLabel}>DIQ Score</div>
        </div>
        <div className={styles.overviewStats}>
          <div className={styles.overviewStat}>
            <div className={styles.overviewStatVal}>{sessions.length}</div>
            <div className={styles.overviewStatLabel}>Verified Sessions</div>
          </div>
          <div className={styles.overviewStat}>
            <div className={styles.overviewStatVal}>{recentGames.length}</div>
            <div className={styles.overviewStatLabel}>Games Logged</div>
          </div>
          <div className={styles.overviewStat}>
            <div className={styles.overviewStatVal}>{Math.round(profile?.profile_pct ?? 0)}%</div>
            <div className={styles.overviewStatLabel}>Profile Complete</div>
          </div>
        </div>
      </div>

      {/* Latest verified session */}
      {latestSession && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Latest Verified Session</h3>
          <p className={styles.cardMeta}>{latestSession.facility?.name} · {new Date(latestSession.verified_at).toLocaleDateString()}</p>
          <div className={styles.metricsGrid}>
            {[
              ['exit_velo', 'Max EV', 'mph'],
              ['avg_exit_velo', 'Avg EV', 'mph'],
              ['bat_speed', 'Bat Speed', 'mph'],
              ['launch_angle', 'LA', '°'],
              ['fb_velo', 'FB Velo', 'mph'],
              ['arm_velo', 'Arm Velo', 'mph'],
            ].filter(([key]) => latestSession[key] != null).map(([key, label, unit]) => (
              <div key={key} className={styles.metricCard}>
                <div className={styles.metricVal}>{latestSession[key]}{unit}</div>
                <div className={styles.metricLbl}>{label}</div>
              </div>
            ))}
          </div>
          {latestSession.ai_report && (
            <div className={styles.aiBox}>
              <div className={styles.aiBoxTitle}>🏟 Facility Analysis</div>
              <p className={styles.aiBoxText}>
                {latestSession.ai_report.replace(/^#{1,3}\s*(STRENGTHS|OPPORTUNITIES|RECOMMENDED DRILLS)[:\s]*/gim, '').replace(/\*\*/g, '').trim().substring(0, 400)}
                {latestSession.ai_report.length > 400 ? '...' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profile completion nudge */}
      {(profile?.profile_pct ?? 0) < 80 && (
        <div className={styles.nudgeCard}>
          <div className={styles.nudgeTitle}>Complete Your Profile</div>
          <p className={styles.nudgeText}>A complete profile gets more visibility from coaches and scouts. Add your bio, academic info, and highlight videos.</p>
          <button className={styles.nudgeBtn} onClick={() => {}}>Complete Profile →</button>
        </div>
      )}
    </div>
  )
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────
function StatsTab({ profile, flash }: any) {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10))
  const [opponent, setOpponent] = useState('')
  const [seasonType, setSeasonType] = useState('')
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear().toString())
  const [result, setResult] = useState('W')
  const [ab, setAb] = useState(''); const [h, setH] = useState(''); const [hr, setHr] = useState('')
  const [rbi, setRbi] = useState(''); const [bb, setBb] = useState(''); const [so, setSo] = useState('')
  const [sb, setSb] = useState(''); const [doubles, setDoubles] = useState(''); const [triples, setTriples] = useState('')
  const [hbp, setHbp] = useState(''); const [runs, setRuns] = useState('')
  // Pitcher stats
  const [ip, setIp] = useState(''); const [er, setEr] = useState(''); const [kP, setKP] = useState('')
  const [bbP, setBbP] = useState(''); const [peakVelo, setPeakVelo] = useState('')
  const [isPitcher, setIsPitcher] = useState(false)

  useEffect(() => {
    if (profile) loadGames()
    const positions = profile?.positions ?? []
    setIsPitcher(positions.some((p: string) => ['RHP', 'LHP'].includes(p)))
  }, [profile])

  async function loadGames() {
    setLoading(true)
    const { data } = await supabase
      .from('game_stats')
      .select('*')
      .eq('player_id', profile.id)
      .order('game_date', { ascending: false })
    setGames(data ?? [])
    setLoading(false)
  }

  function clearForm() {
    setOpponent(''); setAb(''); setH(''); setDoubles(''); setTriples('')
    setHr(''); setRbi(''); setBb(''); setSo(''); setSb(''); setHbp(''); setRuns('')
    setIp(''); setEr(''); setKP(''); setBbP(''); setPeakVelo('')
    setGameDate(new Date().toISOString().slice(0, 10))
    setSeasonType(''); setSeasonYear(new Date().getFullYear().toString())
    setResult('W'); setEditingGame(null)
  }

  function startEdit(game: any) {
    setEditingGame(game)
    setOpponent(game.opponent ?? ''); setGameDate(game.game_date ?? '')
    setSeasonType(game.season_type ?? ''); setSeasonYear(game.season_year?.toString() ?? '')
    setResult(game.result ?? 'W')
    setAb(game.ab?.toString() ?? ''); setH(game.h?.toString() ?? '')
    setDoubles(game.doubles?.toString() ?? ''); setTriples(game.triples?.toString() ?? '')
    setHr(game.hr?.toString() ?? ''); setRbi(game.rbi?.toString() ?? '')
    setBb(game.bb?.toString() ?? ''); setSo(game.so?.toString() ?? '')
    setSb(game.sb?.toString() ?? ''); setHbp(game.hbp?.toString() ?? '')
    setRuns(game.runs?.toString() ?? '')
    setIp(game.ip?.toString() ?? ''); setEr(game.er?.toString() ?? '')
    setKP(game.k_p?.toString() ?? ''); setBbP(game.bb_p?.toString() ?? '')
    setPeakVelo(game.peak_velo?.toString() ?? '')
    setShowForm(true)
  }

  async function handleSave() {
    if (!opponent.trim() || !seasonType) {
      flash('Opponent and season type are required', true); return
    }
    setSaving(true)
    try {
      const payload: any = {
        player_id: profile.id,
        opponent: opponent.trim(),
        game_date: gameDate,
        season_type: seasonType,
        season_year: parseInt(seasonYear) || new Date().getFullYear(),
        result,
        ab: parseInt(ab) || 0,
        h: parseInt(h) || 0,
        doubles: parseInt(doubles) || 0,
        triples: parseInt(triples) || 0,
        hr: parseInt(hr) || 0,
        rbi: parseInt(rbi) || 0,
        bb: parseInt(bb) || 0,
        so: parseInt(so) || 0,
        sb: parseInt(sb) || 0,
        hbp: parseInt(hbp) || 0,
        runs: parseInt(runs) || 0,
      }
      if (isPitcher) {
        payload.ip = parseFloat(ip) || 0
        payload.er = parseInt(er) || 0
        payload.k_p = parseInt(kP) || 0
        payload.bb_p = parseInt(bbP) || 0
        payload.peak_velo = parseInt(peakVelo) || null
      }

      if (editingGame) {
        await supabase.from('game_stats').update(payload).eq('id', editingGame.id)
        flash('✅ Game updated')
      } else {
        await supabase.from('game_stats').insert(payload)
        flash('✅ Game logged')
      }
      clearForm(); setShowForm(false); await loadGames()
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to save', true)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this game?')) return
    setDeleting(id)
    await supabase.from('game_stats').delete().eq('id', id)
    await loadGames()
    setDeleting(null)
  }

  // Group by season
  const seasons: Record<string, any[]> = {}
  games.forEach(g => {
    const year = g.season_year ?? new Date(g.game_date).getFullYear()
    const type = SEASON_TYPES.find(s => s.key === g.season_type)?.label ?? g.season_type ?? 'Season'
    const key = `${year} ${type}`
    if (!seasons[key]) seasons[key] = []
    seasons[key].push(g)
  })

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2 className={styles.tabTitle}>Game Statistics</h2>
        <button className={styles.addBtn} onClick={() => { clearForm(); setShowForm(true) }}>+ Log Game</button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>{editingGame ? 'Edit Game' : 'Log Game'}</h3>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date</label>
              <input type="date" className={styles.input} value={gameDate} onChange={e => setGameDate(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Opponent</label>
              <input className={styles.input} value={opponent} onChange={e => setOpponent(e.target.value)} placeholder="Team name" />
            </div>
          </div>

          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Season Type <span style={{ color: '#CC2E2E' }}>*</span></label>
              <select className={styles.select} value={seasonType} onChange={e => setSeasonType(e.target.value)}>
                <option value="">Select season type...</option>
                {SEASON_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Season Year</label>
              <input className={styles.input} value={seasonYear} onChange={e => setSeasonYear(e.target.value)} placeholder="2026" type="number" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Result</label>
            <div className={styles.resultBtns}>
              {['W', 'L', 'T'].map(r => (
                <button key={r} className={`${styles.resultBtn} ${result === r ? styles.resultBtnActive : ''}`}
                  onClick={() => setResult(r)}>{r}</button>
              ))}
            </div>
          </div>

          <h4 className={styles.formSectionTitle}>Batting</h4>
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
              { label: 'SO', value: so, setter: setSo },
              { label: 'SB', value: sb, setter: setSb },
              { label: 'HBP', value: hbp, setter: setHbp },
            ].map(({ label, value, setter }) => (
              <div key={label} className={styles.statInputGroup}>
                <label className={styles.statLabel}>{label}</label>
                <input type="number" min="0" className={styles.statInput}
                  value={value} onChange={e => setter(e.target.value)} placeholder="0" />
              </div>
            ))}
          </div>

          {isPitcher && (
            <>
              <h4 className={styles.formSectionTitle}>Pitching</h4>
              <div className={styles.statsGrid}>
                {[
                  { label: 'IP', value: ip, setter: setIp },
                  { label: 'ER', value: er, setter: setEr },
                  { label: 'K', value: kP, setter: setKP },
                  { label: 'BB', value: bbP, setter: setBbP },
                  { label: 'Peak Velo', value: peakVelo, setter: setPeakVelo },
                ].map(({ label, value, setter }) => (
                  <div key={label} className={styles.statInputGroup}>
                    <label className={styles.statLabel}>{label}</label>
                    <input type="number" min="0" className={styles.statInput}
                      value={value} onChange={e => setter(e.target.value)} placeholder="0" />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => { clearForm(); setShowForm(false) }}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingGame ? 'Update Game' : 'Save Game'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading stats...</div>
      ) : games.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyTitle}>No games logged yet</div>
          <p className={styles.emptyText}>Start logging your game stats to track your progress and show coaches your performance.</p>
        </div>
      ) : (
        Object.entries(seasons).map(([seasonKey, seasonGames]) => {
          const totals = seasonGames.reduce((acc, g) => ({
            ab: acc.ab + (g.ab ?? 0), h: acc.h + (g.h ?? 0),
            hr: acc.hr + (g.hr ?? 0), rbi: acc.rbi + (g.rbi ?? 0),
            bb: acc.bb + (g.bb ?? 0), so: acc.so + (g.so ?? 0),
            sb: acc.sb + (g.sb ?? 0), doubles: acc.doubles + (g.doubles ?? 0),
          }), { ab: 0, h: 0, hr: 0, rbi: 0, bb: 0, so: 0, sb: 0, doubles: 0 })

          const avg = totals.ab > 0 ? (totals.h / totals.ab).toFixed(3).replace('0.', '.') : '.000'
          const obp = totals.ab > 0 ? ((totals.h + totals.bb) / (totals.ab + totals.bb)).toFixed(3).replace('0.', '.') : '.000'
          const slg = totals.ab > 0 ? ((totals.h + totals.doubles + totals.doubles + (totals.hr * 3)) / totals.ab).toFixed(3).replace('0.', '.') : '.000'

          return (
            <div key={seasonKey} className={styles.seasonCard}>
              <div className={styles.seasonCardHeader}>
                <h3 className={styles.seasonCardTitle}>{seasonKey}</h3>
                <span className={styles.seasonCardGames}>{seasonGames.length} games</span>
              </div>

              {/* Season totals */}
              <div className={styles.seasonTotals}>
                {[
                  { label: 'AVG', value: avg },
                  { label: 'OBP', value: obp },
                  { label: 'SLG', value: slg },
                  { label: 'AB', value: totals.ab },
                  { label: 'H', value: totals.h },
                  { label: 'HR', value: totals.hr },
                  { label: 'RBI', value: totals.rbi },
                  { label: 'BB', value: totals.bb },
                  { label: 'SO', value: totals.so },
                  { label: 'SB', value: totals.sb },
                ].map(({ label, value }) => (
                  <div key={label} className={styles.totalStat}>
                    <div className={styles.totalStatVal}>{value}</div>
                    <div className={styles.totalStatLbl}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Individual games */}
              <table className={styles.gamesTable}>
                <thead>
                  <tr>
                    <th>Date</th><th>Opponent</th><th>Result</th>
                    <th>AB</th><th>H</th><th>HR</th><th>RBI</th><th>BB</th><th>SO</th><th>SB</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {seasonGames.map(g => (
                    <tr key={g.id}>
                      <td>{new Date(g.game_date).toLocaleDateString()}</td>
                      <td>{g.opponent ?? '—'}</td>
                      <td><span className={`${styles.resultBadge} ${g.result === 'W' ? styles.resultW : g.result === 'L' ? styles.resultL : styles.resultT}`}>{g.result}</span></td>
                      <td>{g.ab ?? 0}</td><td>{g.h ?? 0}</td><td>{g.hr ?? 0}</td>
                      <td>{g.rbi ?? 0}</td><td>{g.bb ?? 0}</td><td>{g.so ?? 0}</td><td>{g.sb ?? 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className={styles.editGameBtn} onClick={() => startEdit(g)}>✏️</button>
                          <button className={styles.deleteGameBtn} onClick={() => handleDelete(g.id)}
                            disabled={deleting === g.id}>{deleting === g.id ? '...' : '🗑'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Verified Tab ──────────────────────────────────────────────────────────────
function VerifiedTab({ profile }: any) {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    supabase.from('verified_measurables')
      .select('*, facility:facility_profiles(name)')
      .eq('player_id', profile.id)
      .order('verified_at', { ascending: false })
      .then(({ data }) => { setSessions(data ?? []); setLoading(false) })
  }, [profile])

  if (loading) return <div className={styles.loading}>Loading sessions...</div>

  if (sessions.length === 0) return (
    <div className={styles.tabContent}>
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>✅</div>
        <div className={styles.emptyTitle}>No verified sessions yet</div>
        <p className={styles.emptyText}>Visit a Diamond IQ verified facility to get your metrics verified.</p>
        <Link href="/facilities" className={styles.findFacilityBtn}>Find a Facility →</Link>
      </div>
    </div>
  )

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Verified Sessions</h2>
      {sessions.map(s => (
        <div key={s.id} className={styles.sessionCard}>
          <div className={styles.sessionCardHeader}>
            <div>
              <div className={styles.sessionCardFacility}>{s.facility?.name ?? 'Facility'}</div>
              <div className={styles.sessionCardMeta}>
                {new Date(s.verified_at).toLocaleDateString()}
                {s.equipment && ` · ${s.equipment}`}
                {s.session_type && ` · ${s.session_type === 'tee' ? 'Off Tee' : s.session_type === 'front_toss' ? 'Front Toss' : s.session_type === 'machine' ? 'Machine' : 'Live Pitching'}`}
                {s.avg_pitch_speed && ` @ ${s.avg_pitch_speed} mph`}
              </div>
            </div>
          </div>
          <div className={styles.metricsGrid}>
            {[
              ['exit_velo', 'Max EV', 'mph'], ['avg_exit_velo', 'Avg EV', 'mph'],
              ['bat_speed', 'Bat Speed', 'mph'], ['launch_angle', 'LA', '°'],
              ['hard_hit_avg', 'Hard Hit', '%'], ['fb_velo', 'FB Velo', 'mph'],
              ['arm_velo', 'Arm Velo', 'mph'], ['sixty_time', '60 Time', 's'],
            ].filter(([key]) => s[key] != null).map(([key, label, unit]) => (
              <div key={key} className={styles.metricCard}>
                <div className={styles.metricVal}>{s[key]}{unit}</div>
                <div className={styles.metricLbl}>{label}</div>
              </div>
            ))}
          </div>
          {s.ai_report && (
            <div className={styles.aiBox}>
              <div className={styles.aiBoxTitle}>🏟 Facility Analysis</div>
              {(() => {
                const normalized = s.ai_report
                  .replace(/^#{1,3}\s*STRENGTHS\s*/im, 'STRENGTHS:')
                  .replace(/^#{1,3}\s*OPPORTUNITIES\s*/im, 'OPPORTUNITIES:')
                  .replace(/^#{1,3}\s*RECOMMENDED DRILLS\s*/im, 'RECOMMENDED DRILLS:')
                const strengthsMatch = normalized.match(/STRENGTHS:([\s\S]*?)(?=OPPORTUNITIES:|$)/i)
                const opportunitiesMatch = normalized.match(/OPPORTUNITIES:([\s\S]*?)(?=RECOMMENDED DRILLS:|$)/i)
                const drillsMatch = normalized.match(/RECOMMENDED DRILLS:([\s\S]*?)$/i)

                if (!strengthsMatch) return <p className={styles.aiBoxText}>{s.ai_report}</p>

                return (
                  <>
                    {strengthsMatch && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#27500A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>✅ Strengths</div><p className={styles.aiBoxText}>{strengthsMatch[1].replace(/\*\*/g, '').trim()}</p></div>}
                    {opportunitiesMatch && <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#7A5200', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>🎯 Opportunities</div><p className={styles.aiBoxText}>{opportunitiesMatch[1].replace(/\*\*/g, '').trim()}</p></div>}
                    {drillsMatch && <div><div style={{ fontSize: 11, fontWeight: 700, color: '#185FA5', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>🏋️ Drills</div><p className={styles.aiBoxText}>{drillsMatch[1].replace(/\*\*/g, '').trim()}</p></div>}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, profile, flash, onSave }: any) {
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [gradYear, setGradYear] = useState(profile?.grad_year?.toString() ?? '')
  const [positions, setPositions] = useState<string[]>(profile?.positions ?? [])
  const [state, setState] = useState(profile?.state ?? '')
  const [bats, setBats] = useState(profile?.bats ?? '')
  const [throws, setThrows] = useState(profile?.throws ?? '')
  const [heightIn, setHeightIn] = useState(profile?.height_in?.toString() ?? '')
  const [weightLbs, setWeightLbs] = useState(profile?.weight_lbs?.toString() ?? '')
  const [gpa, setGpa] = useState(profile?.gpa?.toString() ?? '')
  const [sat, setSat] = useState(profile?.sat?.toString() ?? '')
  const [act, setAct] = useState(profile?.act?.toString() ?? '')
  const [saving, setSaving] = useState(false)

  function togglePosition(pos: string) {
    setPositions(prev => prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await supabase.from('users').update({ name }).eq('id', user.id)
      await supabase.from('player_profiles').update({
        bio, grad_year: parseInt(gradYear) || null,
        positions, state, bats, throws,
        height_in: parseInt(heightIn) || null,
        weight_lbs: parseInt(weightLbs) || null,
        gpa: parseFloat(gpa) || null,
        sat: parseInt(sat) || null,
        act: parseInt(act) || null,
      }).eq('id', profile.id)
      flash('✅ Profile saved')
      onSave()
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Failed to save', true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2 className={styles.tabTitle}>Edit Profile</h2>
      </div>

      <div className={styles.formCard}>
        <h3 className={styles.formSectionTitle}>Basic Info</h3>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Grad Year</label>
            <input className={styles.input} value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="2026" type="number" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>State</label>
            <input className={styles.input} value={state} onChange={e => setState(e.target.value)} placeholder="NC" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Bats / Throws</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className={styles.select} value={bats} onChange={e => setBats(e.target.value)}>
                <option value="">Bats</option>
                {['R','L','S'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className={styles.select} value={throws} onChange={e => setThrows(e.target.value)}>
                <option value="">Throws</option>
                {['R','L'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Height (inches)</label>
            <input className={styles.input} value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="72" type="number" />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Weight (lbs)</label>
            <input className={styles.input} value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="185" type="number" />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Positions</label>
          <div className={styles.positionGrid}>
            {POSITIONS.map(pos => (
              <button key={pos}
                className={`${styles.posBtn} ${positions.includes(pos) ? styles.posBtnActive : ''}`}
                onClick={() => togglePosition(pos)}
              >{pos}</button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Bio</label>
          <textarea className={styles.textarea} value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Tell coaches and scouts about yourself..." rows={4} />
        </div>

        <h3 className={styles.formSectionTitle}>Academics</h3>
        <div className={styles.formGrid3}>
          {[
            { label: 'GPA', value: gpa, setter: setGpa, placeholder: '3.8' },
            { label: 'SAT', value: sat, setter: setSat, placeholder: '1200' },
            { label: 'ACT', value: act, setter: setAct, placeholder: '26' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} className={styles.formGroup}>
              <label className={styles.label}>{label}</label>
              <input className={styles.input} value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} />
            </div>
          ))}
        </div>

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ user, profile, flash }: any) {
  const [hittraxVisible, setHittraxVisible] = useState(profile?.hittrax_visible ?? true)
  const [savingHittrax, setSavingHittrax] = useState(false)
  const [parentEmail, setParentEmail] = useState(profile?.parent_email ?? '')
  const [savingParent, setSavingParent] = useState(false)
  const [parentLink, setParentLink] = useState(
    profile?.parent_token ? `https://www.iqbio.io/parent/${profile.parent_token}` : ''
  )
  const [newPassword, setNewPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  async function handleHittraxToggle() {
    setSavingHittrax(true)
    const newVal = !hittraxVisible
    setHittraxVisible(newVal)
    await supabase.from('player_profiles').update({ hittrax_visible: newVal }).eq('id', profile.id)
    setSavingHittrax(false)
    flash(`✅ Verified metrics ${newVal ? 'visible' : 'hidden'}`)
  }

  async function handleSaveParent() {
    if (!parentEmail.includes('@')) { flash('Invalid email', true); return }
    setSavingParent(true)
    await supabase.from('player_profiles').update({ parent_email: parentEmail }).eq('id', profile.id)
    setParentLink(`https://www.iqbio.io/parent/${profile.parent_token}`)
    setSavingParent(false)
    flash('✅ Parent email saved')
  }

  async function handlePasswordChange() {
    if (newPassword.length < 8) { flash('Password must be at least 8 characters', true); return }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPw(false)
    if (error) flash(error.message, true)
    else { flash('✅ Password updated'); setNewPassword('') }
  }

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>Settings</h2>

      {/* HitTrax visibility */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsRow}>
          <div>
            <div className={styles.settingsLabel}>Show Verified Metrics</div>
            <div className={styles.settingsSub}>Allow coaches and scouts to see your facility-verified data on your public profile.</div>
          </div>
          <button
            className={`${styles.toggle} ${hittraxVisible ? styles.toggleOn : styles.toggleOff}`}
            onClick={handleHittraxToggle}
            disabled={savingHittrax}
          >
            {hittraxVisible ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Parent access */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsLabel}>Parent Access</div>
        <div className={styles.settingsSub} style={{ marginBottom: 10 }}>Give your parent a private link to view your profile and log game stats.</div>
        <input className={styles.input} value={parentEmail} onChange={e => setParentEmail(e.target.value)}
          placeholder="Parent email address" type="email" style={{ marginBottom: 8 }} />
        <button className={styles.saveBtn} onClick={handleSaveParent} disabled={savingParent}>
          {savingParent ? 'Saving...' : 'Save & Generate Link'}
        </button>
        {parentLink && (
          <div className={styles.parentLinkBox}>
            <div className={styles.parentLinkLabel}>Parent Link:</div>
            <div className={styles.parentLinkUrl}>{parentLink}</div>
            <button className={styles.copyBtn} onClick={() => { navigator.clipboard.writeText(parentLink); flash('✅ Link copied') }}>
              Copy Link
            </button>
          </div>
        )}
      </div>

      {/* Password */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsLabel}>Change Password</div>
        <input className={styles.input} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
          placeholder="New password (min 8 characters)" style={{ margin: '8px 0' }} />
        <button className={styles.saveBtn} onClick={handlePasswordChange} disabled={savingPw}>
          {savingPw ? 'Updating...' : 'Update Password'}
        </button>
      </div>

      {/* Public profile link */}
      {profile?.public_slug && (
        <div className={styles.settingsCard}>
          <div className={styles.settingsLabel}>Your Public Profile</div>
          <div className={styles.settingsSub} style={{ marginBottom: 10 }}>Share this link with coaches, scouts, and parents.</div>
          <div className={styles.parentLinkBox}>
            <div className={styles.parentLinkUrl}>iqbio.io/player/{profile.public_slug}</div>
            <button className={styles.copyBtn} onClick={() => { navigator.clipboard.writeText(`https://www.iqbio.io/player/${profile.public_slug}`); flash('✅ Link copied') }}>
              Copy Link
            </button>
          </div>
          <Link href={`/player/${profile.public_slug}`} target="_blank" className={styles.viewProfileBtn}>
            View Public Profile →
          </Link>
        </div>
      )}
    </div>
  )
}
