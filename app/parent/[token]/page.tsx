'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './parent.module.css'

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
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    loadProfile()
  }, [token])

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

    setLoading(false)
  }

  async function handleLogGame() {
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
          opponent: opponent.trim(),
          game_date: gameDate,
          ab: parseInt(ab) || 0,
          h: parseInt(h) || 0,
          hr: parseInt(hr) || 0,
          rbi: parseInt(rbi) || 0,
          bb: parseInt(bb) || 0,
          so: parseInt(so) || 0,
          logged_by: null,
          season_type: 'regular',
        })
      if (error) throw error
      setSuccessMsg('✅ Game logged successfully!')
      setShowLogGame(false)
      setOpponent(''); setAb(''); setH(''); setHr(''); setRbi(''); setBb(''); setSo('')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e: unknown) {
      setSuccessMsg('Error saving game. Please try again.')
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
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <span className={styles.logoText}>Diamond IQ</span>
          <span className={styles.logoTagline}>Parent View</span>
        </div>
      </header>

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

              <div className={styles.statsGrid}>
                {[
                  { label: 'AB', value: ab, setter: setAb },
                  { label: 'H', value: h, setter: setH },
                  { label: 'HR', value: hr, setter: setHr },
                  { label: 'RBI', value: rbi, setter: setRbi },
                  { label: 'BB', value: bb, setter: setBb },
                  { label: 'SO', value: so, setter: setSo },
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

        <div className={styles.footer}>
          <p className={styles.footerText}>Diamond IQ — Verified Athlete Intelligence</p>
        </div>
      </div>
    </div>
  )
}
