'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Papa from 'papaparse'

type Tab = 'upload' | 'games' | 'roster'

export default function CoachDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { loadUser() }, [])

  async function loadUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/coach/login'); return }
    const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single()
    if (!data || data.role !== 'coach') { await supabase.auth.signOut(); router.push('/coach/login'); return }
    setUser(data)
    setLoading(false)
  }

  function flash(msg: string, isError = false) {
    if (isError) setErrorMsg(msg)
    else setSuccessMsg(msg)
    setTimeout(() => { setSuccessMsg(''); setErrorMsg('') }, 4000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f3ef' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e5e5', borderTopColor: '#185FA5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      <header style={{ background: '#042C53', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Diamond IQ</span>
          <span style={{ color: '#B5D4F4', fontSize: 13 }}>{user?.name}</span>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/coach/login') }}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
        >Sign Out</button>
      </header>

      {successMsg && <div style={{ background: '#E8F5E9', color: '#1B5E20', padding: '12px 32px', fontSize: 13, fontWeight: 500 }}>{successMsg}</div>}
      {errorMsg && <div style={{ background: '#FFEBEE', color: '#B71C1C', padding: '12px 32px', fontSize: 13, fontWeight: 500 }}>{errorMsg}</div>}

      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', display: 'flex', padding: '0 32px', gap: 4 }}>
        {([
          { key: 'upload', label: '⬆️ Upload Game Stats' },
          { key: 'games', label: '📋 Game History' },
          { key: 'roster', label: '👥 Roster' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '14px 16px', fontSize: 13, fontWeight: 500, background: 'none', border: 'none',
              borderBottom: activeTab === t.key ? '2px solid #185FA5' : '2px solid transparent',
              color: activeTab === t.key ? '#042C53' : '#73726c', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
        {activeTab === 'upload' && <UploadTab user={user} flash={flash} />}
        {activeTab === 'games' && <GamesTab user={user} />}
        {activeTab === 'roster' && <RosterTab user={user} />}
      </div>
    </div>
  )
}

// ── Upload Tab ────────────────────────────────────────────────────────────────
function UploadTab({ user, flash }: any) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [gameDate, setGameDate] = useState(new Date().toISOString().slice(0, 10))
  const [opponent, setOpponent] = useState('')
  const [seasonType, setSeasonType] = useState('travel')
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear().toString())
  const [result, setResult] = useState('W')
  const [parsedRows, setParsedRows] = useState<any[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParsedRows([])
    setImportResults(null)

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data as string[][]
        
        // Find the header row - it contains 'Last' and 'First'
        const headerRowIndex = allRows.findIndex(row => 
          row.some(cell => cell?.trim() === 'Last') && 
          row.some(cell => cell?.trim() === 'First')
        )
        
        if (headerRowIndex === -1) {
          flash('Could not find player data in this CSV. Make sure you exported from GameChanger Stats.', true)
          return
        }

        const headers = allRows[headerRowIndex].map(h => h?.trim())
        const dataRows = allRows.slice(headerRowIndex + 1)

        // Convert to objects
        const parsed = dataRows
          .map(row => {
            const obj: Record<string, string> = {}
            headers.forEach((h, i) => { obj[h] = row[i]?.trim() ?? '' })
            return obj
          })
          .filter(row =>
            row['Last'] && row['First'] &&
            row['Last'] !== '' &&
            row['Last']?.toLowerCase() !== 'totals' &&
            !row['Last']?.toLowerCase().startsWith('glossary') &&
            !row['Last']?.toLowerCase().startsWith('teamname')
          )

        setParsedRows(parsed)
      }
    })
  }

  async function handleImport() {
    if (!opponent.trim()) { flash('Please enter the opponent name', true); return }
    if (parsedRows.length === 0) { flash('Please upload a GameChanger CSV first', true); return }

    setImporting(true)
    const matched: string[] = []
    const unmatched: string[] = []
    const duplicates: string[] = []

    for (const row of parsedRows) {
      const firstName = row['First']?.trim()
      const lastName = row['Last']?.trim()
      if (!firstName || !lastName) continue

      const fullName = `${firstName} ${lastName}`

      // Find player by name
      const { data: users } = await supabase
        .from('users')
        .select('id, name, player_profile:player_profiles(id)')
        .ilike('name', `%${firstName}%`)
        .ilike('name', `%${lastName}%`)
        .eq('role', 'player')

      if (!users || users.length === 0) {
        unmatched.push(fullName)
        continue
      }

      const playerUser = users[0]
      const playerProfile = Array.isArray(playerUser.player_profile)
        ? playerUser.player_profile[0]
        : playerUser.player_profile

      if (!playerProfile?.id) {
        unmatched.push(fullName)
        continue
      }

      // Check for duplicate - same player, same date, same opponent
      const gameId = `gc_${playerProfile.id}_${gameDate}_${opponent.toLowerCase().replace(/\s+/g, '_')}`
      const { data: existing } = await supabase
        .from('game_stats')
        .select('id')
        .eq('player_id', playerProfile.id)
        .eq('game_date', gameDate)
        .eq('gamechanger_game_id', gameId)
        .single()

      if (existing) {
        duplicates.push(fullName)
        continue
      }

      // Parse batting stats
      const ab = parseInt(row['AB']) || 0
      const h = parseInt(row['H']) || 0
      const doubles = parseInt(row['2B']) || 0
      const triples = parseInt(row['3B']) || 0
      const hr = parseInt(row['HR']) || 0
      const rbi = parseInt(row['RBI']) || 0
      const runs = parseInt(row['R']) || 0
      const bb = parseInt(row['BB']) || 0
      const so = parseInt(row['SO']) || 0
      const hbp = parseInt(row['HBP']) || 0
      const sb = parseInt(row['SB']) || 0

      // Parse pitching stats
      const ip = parseFloat(row['IP']) || 0
      const er = parseInt(row['ER']) || 0
      const wins = parseInt(row['W']) || 0
      const losses = parseInt(row['L']) || 0
      const kP = parseInt(row['SO.1'] ?? row['SO']) || 0  // pitching SO
      const bbP = parseInt(row['BB.1'] ?? row['BB']) || 0  // pitching BB

      const payload: any = {
        player_id: playerProfile.id,
        game_date: gameDate,
        opponent: opponent.trim(),
        season_type: seasonType,
        season_year: parseInt(seasonYear),
        result,
        ab, h, doubles, triples, hr, rbi, runs, bb, so, hbp, sb,
        source: 'gamechanger',
        verified_by_coach: user.id,
        gamechanger_game_id: gameId,
      }

      if (ip > 0) {
        payload.ip = ip
        payload.er = er
        payload.k_p = kP
        payload.bb_p = bbP
        if (wins > 0) payload.result = 'W'
        if (losses > 0) payload.result = 'L'
      }

      const { error } = await supabase.from('game_stats').insert(payload)
      if (!error) matched.push(fullName)
      else unmatched.push(`${fullName} (error)`)
    }

    setImportResults({ matched, unmatched, duplicates })
    setImporting(false)

    if (matched.length > 0) {
      flash(`✅ Imported stats for ${matched.length} players`)
      setParsedRows([])
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#042C53', margin: '0 0 6px' }}>Upload GameChanger Stats</h2>
        <p style={{ fontSize: 13, color: '#73726c', margin: '0 0 24px', lineHeight: 1.6 }}>
          Export a single-game stats CSV from GameChanger, fill in the game details below, and upload to automatically log stats for all matched players.
        </p>

        {/* Game details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>Game Date *</label>
            <input type="date" value={gameDate} onChange={e => setGameDate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>Opponent *</label>
            <input value={opponent} onChange={e => setOpponent(e.target.value)}
              placeholder="e.g. Carolina Hawks 15U"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>Season Type</label>
            <select value={seasonType} onChange={e => setSeasonType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' }}>
              <option value="hs_varsity">HS Varsity</option>
              <option value="hs_jv">HS JV</option>
              <option value="travel">Travel Ball</option>
              <option value="showcase">Showcase</option>
              <option value="college">College</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>Season Year</label>
            <input value={seasonYear} onChange={e => setSeasonYear(e.target.value)} type="number"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>Result</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['W', 'L', 'T'].map(r => (
              <button key={r} onClick={() => setResult(r)}
                style={{
                  padding: '8px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  border: `1.5px solid ${result === r ? '#185FA5' : '#ddd'}`,
                  background: result === r ? '#185FA5' : '#fff',
                  color: result === r ? '#fff' : '#73726c',
                }}>{r}</button>
            ))}
          </div>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #ddd', borderRadius: 12, padding: 32, textAlign: 'center',
            cursor: 'pointer', marginBottom: 20, background: fileName ? '#F0F7FF' : '#fafafa',
            transition: 'all 0.15s',
          }}
        >
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          {fileName ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#185FA5' }}>{fileName}</div>
              <div style={{ fontSize: 12, color: '#73726c', marginTop: 4 }}>{parsedRows.length} players found — click to change file</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#042C53' }}>Click to upload GameChanger CSV</div>
              <div style={{ fontSize: 12, color: '#73726c', marginTop: 4 }}>Export single-game stats from GameChanger → Season Stats → filter to 1 game</div>
            </>
          )}
        </div>

        {/* Preview */}
        {parsedRows.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
              Preview — {parsedRows.length} players
            </div>
            <div style={{ background: '#f8f8f7', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f0f0ee' }}>
                    {['Player', 'AB', 'H', '2B', '3B', 'HR', 'RBI', 'R', 'BB', 'SO', 'SB', 'IP'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#73726c', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 500 }}>{row['First']} {row['Last']}</td>
                      {['AB', 'H', '2B', '3B', 'HR', 'RBI', 'R', 'BB', 'SO', 'SB', 'IP'].map(col => (
                        <td key={col} style={{ padding: '8px 10px', color: '#73726c' }}>{row[col] || '0'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={importing || parsedRows.length === 0 || !opponent.trim()}
          style={{
            width: '100%', padding: 14,
            background: (importing || parsedRows.length === 0 || !opponent.trim()) ? '#73726c' : '#185FA5',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: (importing || parsedRows.length === 0 || !opponent.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {importing ? 'Importing...' : `Import Stats for ${parsedRows.length} Players`}
        </button>
      </div>

      {/* Import results */}
      {importResults && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#042C53', margin: '0 0 16px' }}>Import Results</h3>

          {importResults.matched.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#27500A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                ✅ Imported ({importResults.matched.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {importResults.matched.map((name: string) => (
                  <span key={name} style={{ background: '#E8F5E9', color: '#27500A', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>{name}</span>
                ))}
              </div>
            </div>
          )}

          {importResults.duplicates.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#7A5200', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                ⚠️ Already imported ({importResults.duplicates.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {importResults.duplicates.map((name: string) => (
                  <span key={name} style={{ background: '#FFF3E0', color: '#7A5200', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>{name}</span>
                ))}
              </div>
            </div>
          )}

          {importResults.unmatched.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#B71C1C', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
                ❌ Not found in system ({importResults.unmatched.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {importResults.unmatched.map((name: string) => (
                  <span key={name} style={{ background: '#FFEBEE', color: '#B71C1C', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>{name}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#73726c', margin: '8px 0 0', lineHeight: 1.5 }}>
                These players don't have Diamond IQ accounts yet. Once they sign up, you can re-import this game or ask them to log it manually.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Games Tab ─────────────────────────────────────────────────────────────────
function GamesTab({ user }: any) {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames()
  }, [user])

  async function loadGames() {
    // Get all games uploaded by this coach
    const { data } = await supabase
      .from('game_stats')
      .select('*, player:player_profiles(id, user:users(name))')
      .eq('verified_by_coach', user.id)
      .eq('source', 'gamechanger')
      .order('game_date', { ascending: false })
    setGames(data ?? [])
    setLoading(false)
  }

  // Group by game (date + opponent)
  const gameGroups: Record<string, any[]> = {}
  games.forEach(g => {
    const key = `${g.game_date}_${g.opponent}`
    if (!gameGroups[key]) gameGroups[key] = []
    gameGroups[key].push(g)
  })

  if (loading) return <div style={{ textAlign: 'center', color: '#73726c', padding: 40 }}>Loading...</div>

  if (Object.keys(gameGroups).length === 0) return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#042C53', marginBottom: 6 }}>No games uploaded yet</div>
      <p style={{ fontSize: 13, color: '#73726c', margin: 0 }}>Upload your first GameChanger export to get started.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {Object.entries(gameGroups).map(([key, players]) => {
        const game = players[0]
        return (
          <div key={key} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#042C53' }}>vs {game.opponent}</div>
                <div style={{ fontSize: 12, color: '#73726c', marginTop: 2 }}>
                  {new Date(game.game_date).toLocaleDateString()} · {players.length} players
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: game.result === 'W' ? '#E8F5E9' : game.result === 'L' ? '#FFEBEE' : '#FFF3E0',
                color: game.result === 'W' ? '#27500A' : game.result === 'L' ? '#B71C1C' : '#7A5200',
              }}>{game.result}</span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8f8f7' }}>
                  {['Player', 'AB', 'H', 'HR', 'RBI', 'R', 'BB', 'SO', 'SB'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: '#73726c', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>{p.player?.user?.name ?? '—'}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.ab}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.h}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.hr}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.rbi}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.runs}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.bb}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.so}</td>
                    <td style={{ padding: '8px 10px', color: '#73726c' }}>{p.sb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

// ── Roster Tab ────────────────────────────────────────────────────────────────
function RosterTab({ user }: any) {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadRoster() }, [user])

  async function loadRoster() {
    // Find all players this coach has uploaded stats for
    const { data } = await supabase
      .from('game_stats')
      .select('player_id, player:player_profiles(id, user:users(name, email), grad_year, positions, diq_score)')
      .eq('verified_by_coach', user.id)
    
    // Deduplicate by player_id
    const seen = new Set()
    const unique: any[] = []
    ;(data ?? []).forEach((g: any) => {
      if (!seen.has(g.player_id)) {
        seen.add(g.player_id)
        unique.push(g.player)
      }
    })
    setPlayers(unique.filter(Boolean))
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', color: '#73726c', padding: 40 }}>Loading...</div>

  if (players.length === 0) return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#042C53', marginBottom: 6 }}>No roster yet</div>
      <p style={{ fontSize: 13, color: '#73726c', margin: 0 }}>Players will appear here after you upload their game stats.</p>
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8f8f7' }}>
            {['Player', 'Positions', 'Grad Year', 'DIQ Score', 'Profile'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #e5e5e5' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p: any) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f4f3ef' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#042C53' }}>{p.user?.name ?? '—'}</td>
              <td style={{ padding: '12px 16px', color: '#73726c' }}>{(p.positions ?? []).join(', ') || '—'}</td>
              <td style={{ padding: '12px 16px', color: '#73726c' }}>{p.grad_year ?? '—'}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ fontWeight: 700, color: '#042C53' }}>{(p.diq_score ?? 0).toFixed(1)}</span>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <Link href={`/player/${p.id}`} target="_blank"
                  style={{ color: '#185FA5', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
