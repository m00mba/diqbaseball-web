'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './sessions.module.css'

const METRIC_LABELS: Record<string, string> = {
  exit_velo: 'Max Exit Velo',
  avg_exit_velo: 'Avg Exit Velo',
  launch_angle: 'Launch Angle',
  hard_hit_avg: 'Hard Hit Avg',
  distance: 'Avg Distance',
  max_distance: 'Max Distance',
  bat_speed: 'Bat Speed',
  hittrax_avg: 'Sim AVG',
  hittrax_slg: 'Sim SLG',
  ld_pct: 'Line Drive %',
  gb_pct: 'Ground Ball %',
  fb_pct: 'Fly Ball %',
  lph: 'Line Drives/Hit',
  arm_velo: 'Arm Velo',
  sixty_time: '60 Time',
  fb_velo: 'FB Velo',
  fb_spin_rate: 'FB Spin',
}

const METRIC_UNITS: Record<string, string> = {
  exit_velo: 'mph', avg_exit_velo: 'mph', launch_angle: '°',
  hard_hit_avg: '%', distance: 'ft', max_distance: 'ft',
  bat_speed: 'mph', hittrax_avg: '', hittrax_slg: '',
  ld_pct: '%', gb_pct: '%', fb_pct: '%', lph: '',
  arm_velo: 'mph', sixty_time: 's', fb_velo: 'mph', fb_spin_rate: 'rpm',
}

interface Session {
  id: string
  player_id: string
  verified_at: string
  equipment: string
  notes: string | null
  player_name?: string
  [key: string]: any
}

export default function FacilitySessions() {
  const router = useRouter()
  const [facilityProfile, setFacilityProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [compareSession, setCompareSession] = useState<Session | null>(null)
  const [playerSessions, setPlayerSessions] = useState<Session[]>([])
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [aiReportDate, setAiReportDate] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [searchName, setSearchName] = useState('')
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [editSessionType, setEditSessionType] = useState<string>('tee')
  const [editPitchSpeed, setEditPitchSpeed] = useState<string>('')
  const [savingSessionType, setSavingSessionType] = useState(false)

  const canRegenerate = currentUserEmail === 'kod@42labs.org'

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/facility/login'); return }
      const userId = data.user.id
      setCurrentUserEmail(data.user.email ?? null)

      // Check staff first
      const { data: staffLink } = await supabase
        .from('facility_users')
        .select('*, facility:facility_profiles(*)')
        .eq('user_id', userId)
        .single()

      let fp: any = staffLink?.facility ?? null

      // Fall back to owner
      if (!fp) {
        const { data: owned } = await supabase
          .from('facility_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        fp = owned
      }

      if (!fp) { router.push('/facility/login'); return }
      setFacilityProfile(fp)
      loadSessions(fp.id)
    })
  }, [router])

  async function loadSessions(facilityId: string) {
    setLoading(true)
    const { data } = await supabase
      .from('verified_measurables')
      .select(`
        *,
        player:player_profiles(
          id,
          user:users(name)
        )
      `)
      .eq('facility_id', facilityId)
      .order('verified_at', { ascending: false })
      .limit(100)

    const mapped = (data ?? []).map((s: any) => ({
      ...s,
      player_name: s.player?.user?.name ?? 'Unknown Player',
    }))
    setSessions(mapped)
    setLoading(false)
  }

  async function openSession(session: Session) {
    setSelectedSession(session)
    setAiReport(null)
    setAiReportDate(null)
    setEditNotes(session.notes ?? '')
    setEditSessionType(session.session_type ?? 'tee')
    setEditPitchSpeed(session.avg_pitch_speed ? String(session.avg_pitch_speed) : '')

    // Load other sessions for this player at this facility
    const { data } = await supabase
      .from('verified_measurables')
      .select('*')
      .eq('player_id', session.player_id)
      .eq('facility_id', facilityProfile.id)
      .neq('id', session.id)
      .order('verified_at', { ascending: false })

    setPlayerSessions(data ?? [])
    setCompareSession(null)

    // Load saved AI report for this session
    if (session.ai_report) {
      setAiReport(session.ai_report)
      setAiReportDate(session.ai_report_generated_at)
    }
  }

  async function saveSessionType() {
    if (!selectedSession) return
    setSavingSessionType(true)
    const updates: any = { session_type: editSessionType }
    if (editSessionType !== 'tee' && editPitchSpeed) {
      updates.avg_pitch_speed = parseFloat(editPitchSpeed)
    } else {
      updates.avg_pitch_speed = null
    }
    await supabase.from('verified_measurables')
      .update(updates)
      .eq('id', selectedSession.id)
    setSelectedSession(prev => prev ? { ...prev, ...updates } : null)
    setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, ...updates } : s))
    setSavingSessionType(false)
    setSuccessMsg('✅ Session type saved')
    setTimeout(() => setSuccessMsg(''), 2000)
  }

  async function saveNotes() {
    if (!selectedSession) return
    setSavingNotes(true)
    await supabase.from('verified_measurables')
      .update({ notes: editNotes })
      .eq('id', selectedSession.id)
    setSelectedSession(prev => prev ? { ...prev, notes: editNotes } : null)
    setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, notes: editNotes } : s))
    setSavingNotes(false)
    setSuccessMsg('✅ Notes saved')
    setTimeout(() => setSuccessMsg(''), 2000)
  }

  async function deleteSession() {
    if (!selectedSession) return
    if (!confirm(`Delete this session for ${selectedSession.player_name}? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('verified_measurables').delete().eq('id', selectedSession.id)
    setSessions(prev => prev.filter(s => s.id !== selectedSession.id))
    setSelectedSession(null)
    setDeleting(false)
  }

  async function generateAI() {
    if (!selectedSession) return
    setAiLoading(true)
    setAiReport(null)
    setAiReportDate(null)

    const metrics = Object.entries(METRIC_LABELS)
      .filter(([key]) => selectedSession[key] != null)
      .map(([key, label]) => `${label}: ${selectedSession[key]}${METRIC_UNITS[key] ?? ''}`)
      .join(', ')

    let compareText = ''
    if (compareSession) {
      const prev = Object.entries(METRIC_LABELS)
        .filter(([key]) => compareSession[key] != null)
        .map(([key, label]) => `${label}: ${compareSession[key]}${METRIC_UNITS[key] ?? ''}`)
        .join(', ')
      compareText = `\n\nPrevious session (${new Date(compareSession.verified_at).toLocaleDateString()}):\n${prev}`
    }

    const sessionContext = selectedSession.session_type
      ? `Session type: ${selectedSession.session_type === 'tee' ? 'Off Tee' : selectedSession.session_type === 'front_toss' ? 'Front Toss' : selectedSession.session_type === 'machine' ? 'Pitching Machine' : 'Live Pitching'}${selectedSession.avg_pitch_speed ? ` at ${selectedSession.avg_pitch_speed} mph avg` : ''}`
      : 'Session type: Unknown'

    const prompt = compareSession
      ? `You are a professional baseball development coach analyzing HitTrax session data for ${selectedSession.player_name} at ${facilityProfile?.name}.

Compare these two sessions and respond in exactly three sections:

STRENGTHS: In 2-3 sentences, highlight what is strong or has improved between the two sessions. Be specific with numbers. Celebrate genuine wins.

OPPORTUNITIES: In 2-3 sentences, identify what metrics are weak or regressing and what that means for this player's development. Be honest and specific with numbers.

RECOMMENDED DRILLS: For each opportunity identified above, prescribe one specific drill that directly targets that weakness. Name the drill, state which metric it addresses, and briefly describe it. Only prescribe drills tied to actual weaknesses in the data.

Current session (${new Date(selectedSession.verified_at).toLocaleDateString()}) — ${sessionContext}:
${metrics}${compareText}`
      : `You are a professional baseball development coach analyzing HitTrax session data for ${selectedSession.player_name} at ${facilityProfile?.name}.

Respond in exactly three sections:

STRENGTHS: In 2-3 sentences, highlight what this player is doing well based on the metrics. Be specific with numbers. Celebrate genuine wins — do not manufacture praise for weak metrics.

OPPORTUNITIES: In 2-3 sentences, identify the weakest metrics and what they reveal about this player's development gaps. Be honest and specific with numbers.

RECOMMENDED DRILLS: For each opportunity identified above, prescribe one specific drill that directly targets that weakness. Name the drill, state which metric it addresses and why that number indicates a weakness, and briefly describe the drill. Only prescribe drills tied to actual weaknesses — do not pad with generic advice.

Session (${new Date(selectedSession.verified_at).toLocaleDateString()}) — ${sessionContext}:
${metrics}
${selectedSession.notes ? `\nCoach notes: ${selectedSession.notes}` : ''}`

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      const reportText = data.content?.[0]?.text ?? 'Could not generate report.'
      const generatedAt = new Date().toISOString()

      setAiReport(reportText)
      setAiReportDate(generatedAt)

      // Save report to this session row
      await supabase
        .from('verified_measurables')
        .update({
          ai_report: reportText,
          ai_report_generated_at: generatedAt,
        })
        .eq('id', selectedSession.id)

      // Update local session state
      setSessions(prev => prev.map(s =>
        s.id === selectedSession.id
          ? { ...s, ai_report: reportText, ai_report_generated_at: generatedAt }
          : s
      ))

    } catch {
      setAiReport('Error generating report. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const filteredSessions = searchName
    ? sessions.filter(s => s.player_name?.toLowerCase().includes(searchName.toLowerCase()))
    : sessions

  const sessionMetrics = (s: Session) => Object.entries(METRIC_LABELS)
    .filter(([key]) => s[key] != null)
    .map(([key, label]) => ({ key, label, value: s[key], unit: METRIC_UNITS[key] ?? '' }))

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/facility/login')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLogo}>Diamond IQ</span>
          <span className={styles.headerSub}>{facilityProfile?.name ?? 'Facility Portal'}</span>
        </div>
        <div className={styles.headerNav}>
          <a href="/facility/dashboard" className={styles.navLink}>📂 Upload</a>
          <a href="/facility/settings" className={styles.navLink}>⚙️ Settings</a>
          <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Session History</h2>
            <input
              className={styles.searchInput}
              placeholder="Search player..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className={styles.empty}>No sessions found</div>
          ) : (
            <div className={styles.sessionList}>
              {filteredSessions.map(s => (
                <button
                  key={s.id}
                  className={`${styles.sessionRow} ${selectedSession?.id === s.id ? styles.sessionRowActive : ''}`}
                  onClick={() => openSession(s)}
                >
                  <div className={styles.sessionName}>{s.player_name}</div>
                  <div className={styles.sessionMeta}>
                    {new Date(s.verified_at).toLocaleDateString()} · {s.equipment ?? 'Manual'}
                    {s.exit_velo ? ` · ${s.exit_velo} mph` : ''}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.main}>
          {!selectedSession ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <div className={styles.emptyTitle}>Select a session</div>
              <div className={styles.emptySub}>Click any session on the left to view details, edit notes, or generate an AI analysis.</div>
            </div>
          ) : (
            <div className={styles.detail}>
              {successMsg && <div className={styles.success}>{successMsg}</div>}

              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailName}>{selectedSession.player_name}</h2>
                  <p className={styles.detailMeta}>
                    {new Date(selectedSession.verified_at).toLocaleDateString()} · {selectedSession.equipment ?? 'Manual entry'}
                    {selectedSession.session_type && ` · ${selectedSession.session_type === 'tee' ? 'Off Tee' : selectedSession.session_type === 'front_toss' ? 'Front Toss' : selectedSession.session_type === 'machine' ? 'Machine' : 'Live Pitching'}`}
                    {selectedSession.avg_pitch_speed && ` @ ${selectedSession.avg_pitch_speed} mph`}
                  </p>
                </div>
                <button className={styles.deleteBtn} onClick={deleteSession} disabled={deleting}>
                  {deleting ? 'Deleting...' : '🗑️ Delete'}
                </button>
              </div>

              <div className={styles.metricsGrid}>
                {sessionMetrics(selectedSession).map(({ key, label, value, unit }) => (
                  <div key={key} className={styles.metricCard}>
                    <div className={styles.metricValue}>{value}{unit}</div>
                    <div className={styles.metricLabel}>{label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Session Type</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {[
                    { value: 'tee', label: '🟡 Off Tee' },
                    { value: 'front_toss', label: '🤾 Front Toss' },
                    { value: 'machine', label: '⚙️ Machine' },
                    { value: 'live_pitching', label: '⚾ Live Pitching' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEditSessionType(opt.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: `1.5px solid ${editSessionType === opt.value ? '#185FA5' : '#ddd'}`,
                        background: editSessionType === opt.value ? '#185FA5' : '#fff',
                        color: editSessionType === opt.value ? '#fff' : '#73726c',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {editSessionType !== 'tee' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: '#73726c', whiteSpace: 'nowrap' }}>Avg Pitch Speed (mph):</label>
                    <input
                      type="number"
                      value={editPitchSpeed}
                      onChange={e => setEditPitchSpeed(e.target.value)}
                      placeholder="e.g. 65"
                      style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: 90 }}
                    />
                  </div>
                )}
                <button className={styles.saveNotesBtn} onClick={saveSessionType} disabled={savingSessionType}>
                  {savingSessionType ? 'Saving...' : 'Save Session Type'}
                </button>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Session Notes</h3>
                <textarea
                  className={styles.notesInput}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add notes about this session..."
                  rows={3}
                />
                <button className={styles.saveNotesBtn} onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              <div className={styles.section}>
                <div className={styles.aiHeader}>
                  <h3 className={styles.sectionTitle}>⚡ AI Analysis</h3>
                  {playerSessions.length > 0 && (
                    <select
                      className={styles.compareSelect}
                      value={compareSession?.id ?? ''}
                      onChange={e => {
                        const s = playerSessions.find(p => p.id === e.target.value)
                        setCompareSession(s ?? null)
                        setAiReport(null)
                        setAiReportDate(null)
                      }}
                    >
                      <option value="">Single session analysis</option>
                      {playerSessions.map(s => (
                        <option key={s.id} value={s.id}>
                          Compare with {new Date(s.verified_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {compareSession && (
                  <div className={styles.compareBar}>
                    Comparing current session with {new Date(compareSession.verified_at).toLocaleDateString()}
                  </div>
                )}

                {!aiReport ? (
                  <button
                    className={styles.aiBtn}
                    onClick={generateAI}
                    disabled={aiLoading}
                  >
                    {aiLoading
                      ? 'Generating...'
                      : compareSession ? '⚡ Compare Sessions' : '⚡ Analyze Session'
                    }
                  </button>
                ) : canRegenerate && (
                  <button
                    className={styles.aiBtn}
                    onClick={generateAI}
                    disabled={aiLoading}
                    style={{ opacity: 0.7 }}
                  >
                    {aiLoading ? 'Regenerating...' : '🔄 Regenerate (Test Only)'}
                  </button>
                )}

                {aiReport && (
                  <div className={styles.aiReport}>
                    {aiReportDate && (
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
                        Generated {new Date(aiReportDate).toLocaleDateString()}
                      </div>
                    )}
                    {(() => {
                      // Normalize both markdown (## STRENGTHS) and plain (STRENGTHS:) formats
                      const normalized = aiReport
                        .replace(/^#{1,3}\s*STRENGTHS\s*/im, 'STRENGTHS:')
                        .replace(/^#{1,3}\s*OPPORTUNITIES\s*/im, 'OPPORTUNITIES:')
                        .replace(/^#{1,3}\s*RECOMMENDED DRILLS\s*/im, 'RECOMMENDED DRILLS:')
                        // Also handle "# PLAYER NAME — HITTRAX SESSION ANALYSIS" style headers
                        .replace(/^#[^#\n]*\n/m, '')

                      const strengthsMatch = normalized.match(/STRENGTHS:([\s\S]*?)(?=OPPORTUNITIES:|$)/i)
                      const opportunitiesMatch = normalized.match(/OPPORTUNITIES:([\s\S]*?)(?=RECOMMENDED DRILLS:|$)/i)
                      const drillsMatch = normalized.match(/RECOMMENDED DRILLS:([\s\S]*?)$/i)

                      // If no sections found, just render as plain text (old format fallback)
                      if (!strengthsMatch && !opportunitiesMatch && !drillsMatch) {
                        return <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{aiReport}</p>
                      }

                      return (
                        <>
                          {strengthsMatch && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#27500A', marginBottom: 6 }}>
                                ✅ Strengths
                              </div>
                              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{strengthsMatch[1].replace(/\*\*/g, '').trim()}</p>
                            </div>
                          )}
                          {opportunitiesMatch && (
                            <div style={{ marginBottom: 14, paddingTop: 14, borderTop: '1px solid #e5e5e5' }}>
                              <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7A5200', marginBottom: 6 }}>
                                🎯 Opportunities
                              </div>
                              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{opportunitiesMatch[1].replace(/\*\*/g, '').trim()}</p>
                            </div>
                          )}
                          {drillsMatch && (
                            <div style={{ paddingTop: 14, borderTop: '1px solid #e5e5e5' }}>
                              <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#185FA5', marginBottom: 8 }}>
                                🏋️ Recommended Drills
                              </div>
                              {drillsMatch[1].trim().split('\n').filter(l => l.trim()).map((line, j) => (
                                <p key={j} style={{ margin: '0 0 6px 0', fontSize: 13, lineHeight: 1.6 }}>{line.replace(/\*\*/g, '').trim()}</p>
                              ))}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
