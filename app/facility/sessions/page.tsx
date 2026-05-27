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

const MANUAL_FIELDS: Record<string, { key: string; label: string; unit: string }[]> = {
  blast: [
    { key: 'bat_speed', label: 'Bat Speed', unit: 'mph' },
    { key: 'attack_angle', label: 'Attack Angle', unit: '°' },
    { key: 'time_to_contact', label: 'Time to Contact', unit: 's' },
    { key: 'on_plane_efficiency', label: 'On-Plane Efficiency', unit: '%' },
    { key: 'power_index', label: 'Power Index', unit: '' },
    { key: 'exit_velo', label: 'Exit Velo', unit: 'mph' },
  ],
  diamond_kinetics: [
    { key: 'bat_speed', label: 'Bat Speed', unit: 'mph' },
    { key: 'smash_factor', label: 'Smash Factor', unit: '' },
    { key: 'peak_hand_speed', label: 'Peak Hand Speed', unit: 'mph' },
    { key: 'connection_at_impact', label: 'Connection at Impact', unit: '°' },
    { key: 'exit_velo', label: 'Exit Velo', unit: 'mph' },
  ],
  trackman: [
    { key: 'fb_velo', label: 'Pitch Velo', unit: 'mph' },
    { key: 'pitch_spin_rate', label: 'Spin Rate', unit: 'rpm' },
    { key: 'pitch_extension', label: 'Extension', unit: 'ft' },
    { key: 'vertical_break', label: 'Vertical Break', unit: 'in' },
    { key: 'horizontal_break', label: 'Horizontal Break', unit: 'in' },
  ],
  manual: [
    { key: 'exit_velo', label: 'Exit Velo', unit: 'mph' },
    { key: 'bat_speed', label: 'Bat Speed', unit: 'mph' },
    { key: 'arm_velo', label: 'Arm Velo', unit: 'mph' },
    { key: 'sixty_time', label: '60 Time', unit: 's' },
    { key: 'fb_velo', label: 'FB Velo', unit: 'mph' },
  ],
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

  // Manual session form
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualEquipment, setManualEquipment] = useState('blast')
  const [manualPlayer, setManualPlayer] = useState('')
  const [manualPlayerResults, setManualPlayerResults] = useState<any[]>([])
  const [manualPlayerId, setManualPlayerId] = useState('')
  const [manualPlayerName, setManualPlayerName] = useState('')
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10))
  const [manualSessionType, setManualSessionType] = useState('tee')
  const [manualPitchSpeed, setManualPitchSpeed] = useState('')
  const [manualMetrics, setManualMetrics] = useState<Record<string, string>>({})
  const [manualNotes, setManualNotes] = useState('')
  const [savingManual, setSavingManual] = useState(false)

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

  async function searchManualPlayer(q: string) {
    setManualPlayer(q)
    if (q.length < 2) { setManualPlayerResults([]); return }
    const { data } = await supabase
      .from('users')
      .select('id, name, player_profile:player_profiles(id)')
      .ilike('name', `%${q}%`)
      .eq('role', 'player')
      .limit(5)
    setManualPlayerResults(data ?? [])
  }

  async function saveManualSession() {
    if (!manualPlayerId) { alert('Please select a player'); return }
    setSavingManual(true)
    try {
      const insert: any = {
        facility_id: facilityProfile.id,
        player_id: manualPlayerId,
        verified_at: new Date(manualDate).toISOString(),
        equipment: manualEquipment,
        session_type: manualSessionType,
        avg_pitch_speed: manualSessionType !== 'tee' && manualPitchSpeed ? parseFloat(manualPitchSpeed) : null,
        notes: manualNotes || null,
      }
      // Add metrics
      Object.entries(manualMetrics).forEach(([key, val]) => {
        if (val !== '') insert[key] = parseFloat(val)
      })
      const { error } = await supabase.from('verified_measurables').insert(insert)
      if (error) throw error
      setShowManualForm(false)
      setManualPlayer(''); setManualPlayerId(''); setManualPlayerName('')
      setManualMetrics({}); setManualNotes(''); setManualPitchSpeed('')
      setManualDate(new Date().toISOString().slice(0, 10))
      loadSessions(facilityProfile.id)
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    } finally {
      setSavingManual(false)
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
            <button
              className={styles.addSessionBtn}
              onClick={() => setShowManualForm(true)}
            >
              + Add Session
            </button>
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

      {/* Manual Session Modal */}
      {showManualForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24, overflowY: 'auto',
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 32,
            width: '100%', maxWidth: 560, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#042C53' }}>
              Add Manual Session
            </h3>

            {/* Equipment type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Technology</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'blast', label: '💥 Blast Motion' },
                  { value: 'diamond_kinetics', label: '💎 Diamond Kinetics' },
                  { value: 'trackman', label: '📡 TrackMan' },
                  { value: 'manual', label: '📝 Manual Entry' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { setManualEquipment(opt.value); setManualMetrics({}) }}
                    style={{
                      padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      border: `1.5px solid ${manualEquipment === opt.value ? '#185FA5' : '#ddd'}`,
                      background: manualEquipment === opt.value ? '#185FA5' : '#fff',
                      color: manualEquipment === opt.value ? '#fff' : '#73726c',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Player search */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Player</label>
              {manualPlayerName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#E6F1FB', borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#042C53' }}>{manualPlayerName}</span>
                  <button onClick={() => { setManualPlayerId(''); setManualPlayerName(''); setManualPlayer('') }}
                    style={{ background: 'none', border: 'none', color: '#CC2E2E', cursor: 'pointer', fontSize: 16 }}>✕</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                    value={manualPlayer}
                    onChange={e => searchManualPlayer(e.target.value)}
                    placeholder="Search player name..."
                  />
                  {manualPlayerResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                      {manualPlayerResults.map((p: any) => (
                        <button key={p.id} onClick={() => {
                          setManualPlayerId(p.player_profile?.[0]?.id ?? p.id)
                          setManualPlayerName(p.name)
                          setManualPlayerResults([])
                          setManualPlayer('')
                        }}
                          style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                        >{p.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date and session type */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Date</label>
                <input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Session Type</label>
                <select value={manualSessionType} onChange={e => setManualSessionType(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                  <option value="tee">Off Tee</option>
                  <option value="front_toss">Front Toss</option>
                  <option value="machine">Machine</option>
                  <option value="live_pitching">Live Pitching</option>
                </select>
              </div>
            </div>

            {manualSessionType !== 'tee' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Avg Pitch Speed (mph)</label>
                <input type="number" value={manualPitchSpeed} onChange={e => setManualPitchSpeed(e.target.value)}
                  placeholder="e.g. 65"
                  style={{ width: 120, padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
              </div>
            )}

            {/* Dynamic metrics */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 8 }}>Metrics</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {(MANUAL_FIELDS[manualEquipment] ?? []).map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 11, color: '#73726c', display: 'block', marginBottom: 3 }}>
                      {field.label} {field.unit && `(${field.unit})`}
                    </label>
                    <input
                      type="number"
                      value={manualMetrics[field.key] ?? ''}
                      onChange={e => setManualMetrics(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder="—"
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 6 }}>Notes</label>
              <textarea
                value={manualNotes}
                onChange={e => setManualNotes(e.target.value)}
                placeholder="Session notes..."
                rows={3}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowManualForm(false)}
                style={{ flex: 1, padding: 11, background: '#f4f3ef', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#73726c' }}
              >Cancel</button>
              <button
                onClick={saveManualSession}
                disabled={savingManual}
                style={{ flex: 2, padding: 11, background: savingManual ? '#73726c' : '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: savingManual ? 'not-allowed' : 'pointer' }}
              >{savingManual ? 'Saving...' : 'Save Session'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
