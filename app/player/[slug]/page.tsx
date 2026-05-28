'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './player.module.css'

const METRIC_LABELS: Record<string, string> = {
  exit_velo: 'Max Exit Velo', avg_exit_velo: 'Avg Exit Velo',
  launch_angle: 'Launch Angle', hard_hit_avg: 'Hard Hit %',
  bat_speed: 'Bat Speed', distance: 'Avg Distance',
  max_distance: 'Max Distance', arm_velo: 'Arm Velo',
  sixty_time: '60 Time', fb_velo: 'FB Velo',
  hittrax_avg: 'Sim AVG', hittrax_slg: 'Sim SLG',
}

const METRIC_UNITS: Record<string, string> = {
  exit_velo: 'mph', avg_exit_velo: 'mph', launch_angle: '°',
  hard_hit_avg: '%', bat_speed: 'mph', distance: 'ft',
  max_distance: 'ft', arm_velo: 'mph', sixty_time: 's',
  fb_velo: 'mph', hittrax_avg: '', hittrax_slg: '',
}

import { use } from 'react'

export default function PlayerPublicProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [player, setPlayer] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [gameStats, setGameStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [slug])

  async function loadProfile() {
    setLoading(true)

    // Find player by slug
    const { data: profile, error } = await supabase
      .from('player_profiles')
      .select(`
        *,
        user:users(name, email)
      `)
      .eq('public_slug', slug)
      .single()

    if (error || !profile) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setPlayer(profile)

    // Load game stats
    const { data: stats } = await supabase
      .from('game_stats')
      .select('*')
      .eq('player_id', profile.id)
      .order('game_date', { ascending: false })
    setGameStats(stats ?? [])

    // Load verified sessions if hittrax_visible
    if (profile.hittrax_visible !== false) {
      const { data: sessionData } = await supabase
        .from('verified_measurables')
        .select('*, facility:facility_profiles(name)')
        .eq('player_id', profile.id)
        .order('verified_at', { ascending: false })
        .limit(5)
      setSessions(sessionData ?? [])
    }

    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingDot} />
    </div>
  )

  if (notFound) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>⚾</div>
      <h2>Player not found</h2>
      <p>This profile may have been removed or the link is incorrect.</p>
    </div>
  )

  const latestSession = sessions[0]
  const positions = player.positions ?? []
  const isHitter = positions.some((p: string) => !['RHP', 'LHP'].includes(p))
  const isPitcher = positions.some((p: string) => ['RHP', 'LHP'].includes(p))

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <span className={styles.logoText}>Diamond IQ</span>
          <span className={styles.logoTagline}>Verified Athlete Intelligence</span>
        </div>
        <button className={styles.shareBtn} onClick={copyLink}>
          {copied ? '✓ Copied!' : '🔗 Share Profile'}
        </button>
      </header>

      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.avatar}>
              {player.photo_url
                ? <img src={player.photo_url} alt={player.user?.name} className={styles.avatarImg} />
                : <span className={styles.avatarInitial}>{(player.user?.name ?? '?').charAt(0)}</span>
              }
            </div>
            <div>
              <h1 className={styles.playerName}>{player.user?.name ?? 'Player'}</h1>
              <div className={styles.playerMeta}>
                {positions.length > 0 && <span className={styles.metaTag}>{positions.join(' / ')}</span>}
                {player.grad_year && <span className={styles.metaTag}>Class of {player.grad_year}</span>}
                {player.bats && player.throws && <span className={styles.metaTag}>B/T: {player.bats}/{player.throws}</span>}
                {player.height_in && <span className={styles.metaTag}>{Math.floor(player.height_in / 12)}'{player.height_in % 12}"</span>}
                {player.weight_lbs && <span className={styles.metaTag}>{player.weight_lbs} lbs</span>}
              </div>
              <div className={styles.schoolInfo}>
                {player.high_school && <span>🏫 {player.high_school}</span>}
                {player.travel_team && <span>⚾ {player.travel_team}</span>}
                {player.state && <span>📍 {player.state}</span>}
              </div>
            </div>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.diqScore}>
              <div className={styles.diqScoreValue}>{(player.diq_score ?? 0).toFixed(1)}</div>
              <div className={styles.diqScoreLabel}>DIQ Score</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {player.bio && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>About</h3>
            <p className={styles.bio}>{player.bio}</p>
          </div>
        )}

        {/* Academic */}
        {(player.gpa || player.sat || player.act) && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Academics</h3>
            <div className={styles.academicRow}>
              {player.gpa && <div className={styles.acadStat}><span className={styles.acadValue}>{player.gpa}</span><span className={styles.acadLabel}>GPA</span></div>}
              {player.sat && <div className={styles.acadStat}><span className={styles.acadValue}>{player.sat}</span><span className={styles.acadLabel}>SAT</span></div>}
              {player.act && <div className={styles.acadStat}><span className={styles.acadValue}>{player.act}</span><span className={styles.acadLabel}>ACT</span></div>}
            </div>
          </div>
        )}

        {/* Verified Metrics */}
        {player.hittrax_visible !== false && sessions.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardTitleRow}>
              <h3 className={styles.cardTitle}>✅ Verified Metrics</h3>
              <span className={styles.verifiedBadge}>
                Verified by {latestSession?.facility?.name ?? 'Facility'}
              </span>
            </div>
            <p className={styles.verifiedDate}>
              Latest session: {new Date(latestSession.verified_at).toLocaleDateString()}
            </p>
            <div className={styles.metricsGrid}>
              {Object.entries(METRIC_LABELS)
                .filter(([key]) => latestSession[key] != null)
                .filter(([key]) => {
                  if (isHitter && !isPitcher) return !['fb_velo', 'fb_spin_rate'].includes(key)
                  if (isPitcher && !isHitter) return !['exit_velo', 'avg_exit_velo', 'bat_speed', 'hard_hit_avg', 'hittrax_avg', 'hittrax_slg'].includes(key)
                  return true
                })
                .map(([key, label]) => (
                  <div key={key} className={styles.metricCard}>
                    <div className={styles.metricValue}>{latestSession[key]}{METRIC_UNITS[key]}</div>
                    <div className={styles.metricLabel}>{label}</div>
                  </div>
                ))}
            </div>

            {/* AI Analysis from latest session */}
            {latestSession.ai_report && (
              <div className={styles.aiReport}>
                {(() => {
                  const normalized = latestSession.ai_report
                    .replace(/^#{1,3}\s*STRENGTHS\s*/im, 'STRENGTHS:')
                    .replace(/^#{1,3}\s*OPPORTUNITIES\s*/im, 'OPPORTUNITIES:')
                    .replace(/^#{1,3}\s*RECOMMENDED DRILLS\s*/im, 'RECOMMENDED DRILLS:')
                    .replace(/^#[^#\n]*\n/m, '')

                  const strengthsMatch = normalized.match(/STRENGTHS:([\s\S]*?)(?=OPPORTUNITIES:|$)/i)
                  const opportunitiesMatch = normalized.match(/OPPORTUNITIES:([\s\S]*?)(?=RECOMMENDED DRILLS:|$)/i)

                  if (!strengthsMatch && !opportunitiesMatch) {
                    return (
                      <>
                        <div className={styles.aiSectionTitle} style={{ color: '#042C53' }}>🏟 Facility Analysis</div>
                        <p className={styles.aiText}>{latestSession.ai_report}</p>
                      </>
                    )
                  }

                  return (
                    <>
                      <div className={styles.aiSectionTitle} style={{ color: '#042C53' }}>🏟 Facility Analysis</div>
                      {strengthsMatch && (
                        <div className={styles.aiSection}>
                          <div className={styles.aiSectionLabel} style={{ color: '#27500A' }}>✅ Strengths</div>
                          <p className={styles.aiText}>{strengthsMatch[1].replace(/\*\*/g, '').trim()}</p>
                        </div>
                      )}
                      {opportunitiesMatch && (
                        <div className={styles.aiSection}>
                          <div className={styles.aiSectionLabel} style={{ color: '#7A5200' }}>🎯 Development Areas</div>
                          <p className={styles.aiText}>{opportunitiesMatch[1].replace(/\*\*/g, '').trim()}</p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* Session history */}
            {sessions.length > 1 && (
              <div className={styles.sessionHistory}>
                <div className={styles.sessionHistoryTitle}>Session History</div>
                {sessions.map((s, i) => (
                  <div key={s.id} className={styles.sessionRow}>
                    <span className={styles.sessionDate}>{new Date(s.verified_at).toLocaleDateString()}</span>
                    <span className={styles.sessionFacility}>{s.facility?.name ?? '—'}</span>
                    {s.exit_velo && <span className={styles.sessionMetric}>EV {s.exit_velo} mph</span>}
                    {s.bat_speed && <span className={styles.sessionMetric}>BS {s.bat_speed} mph</span>}
                    {s.fb_velo && <span className={styles.sessionMetric}>FB {s.fb_velo} mph</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Game Stats by Season */}
        {gameStats.length > 0 && (() => {
          // Group by season_year + season_type
          const seasons: Record<string, any[]> = {}
          gameStats.forEach(g => {
            const year = g.season_year ?? new Date(g.game_date).getFullYear()
            const type = g.season_type ?? 'Season'
            const key = `${year} ${type}`
            if (!seasons[key]) seasons[key] = []
            seasons[key].push(g)
          })

          return (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Game Statistics</h3>
              {Object.entries(seasons).map(([seasonKey, games]) => {
                const totals = games.reduce((acc, g) => ({
                  ab: acc.ab + (g.ab ?? 0),
                  h: acc.h + (g.h ?? 0),
                  hr: acc.hr + (g.hr ?? 0),
                  rbi: acc.rbi + (g.rbi ?? 0),
                  bb: acc.bb + (g.bb ?? 0),
                  so: acc.so + (g.so ?? 0),
                  sb: acc.sb + (g.sb ?? 0),
                }), { ab: 0, h: 0, hr: 0, rbi: 0, bb: 0, so: 0, sb: 0 })

                const avg = totals.ab > 0 ? (totals.h / totals.ab).toFixed(3).replace('0.', '.') : '.000'
                const obp = totals.ab > 0 ? ((totals.h + totals.bb) / (totals.ab + totals.bb)).toFixed(3).replace('0.', '.') : '.000'

                return (
                  <div key={seasonKey} className={styles.seasonBlock}>
                    <div className={styles.seasonHeader}>
                      <span className={styles.seasonName}>{seasonKey}</span>
                      <span className={styles.seasonGames}>{games.length} games</span>
                    </div>
                    <div className={styles.seasonStats}>
                      {[
                        { label: 'AVG', value: avg },
                        { label: 'OBP', value: obp },
                        { label: 'AB', value: totals.ab },
                        { label: 'H', value: totals.h },
                        { label: 'HR', value: totals.hr },
                        { label: 'RBI', value: totals.rbi },
                        { label: 'BB', value: totals.bb },
                        { label: 'SO', value: totals.so },
                        { label: 'SB', value: totals.sb },
                      ].map(({ label, value }) => (
                        <div key={label} className={styles.seasonStat}>
                          <div className={styles.seasonStatVal}>{value}</div>
                          <div className={styles.seasonStatLbl}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLogo}>Diamond IQ</div>
          <p className={styles.footerText}>
            Verified athlete intelligence for baseball recruiting.
            <a href="https://diqbaseball.com" className={styles.footerLink}> Learn more →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
