'use client'
import { useState, useEffect } from 'react'
import { use } from 'react'
import { supabase } from '@/lib/supabase'

const POSITION_COLORS: Record<string, string> = {
  P: '#B71C1C', C: '#1565C0', '1B': '#2E7D32', '2B': '#2E7D32',
  '3B': '#2E7D32', SS: '#2E7D32', LF: '#E65100', CF: '#E65100',
  RF: '#E65100', DH: '#6A1B9A', EH: '#00695C',
}

export default function LineupPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [lineup, setLineup] = useState<any>(null)
  const [coach, setCoach] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadLineup()
  }, [id])

  async function loadLineup() {
    const { data, error } = await supabase
      .from('lineups')
      .select(`
        *,
        coach:coach_profiles(
          id, title, program_tier,
          user:users(name)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setLineup(data)
    setCoach(data.coach)
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f7' }}>
      <div style={{ color: '#73726c', fontSize: 14 }}>Loading lineup...</div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f7' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚾</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#042C53', marginBottom: 8 }}>Lineup Not Found</div>
        <p style={{ color: '#73726c', fontSize: 14 }}>This lineup may have been deleted or the link is invalid.</p>
      </div>
    </div>
  )

  const slots: any[] = lineup.slots ?? []
  const filledSlots = slots.filter((s: any) => s.player_name)

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f7', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#042C53', padding: '24px 20px 20px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Diamond IQ · Lineup Card
            </div>
            <button onClick={copyLink} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
              color: '#fff', fontSize: 12, padding: '4px 10px', cursor: 'pointer'
            }}>
              {copied ? '✓ Copied' : '🔗 Copy Link'}
            </button>
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{lineup.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {lineup.opponent && <span>vs {lineup.opponent}</span>}
            {lineup.game_date && (
              <span>{new Date(lineup.game_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            )}
            {lineup.use_dh && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '1px 6px' }}>DH</span>}
            {lineup.use_eh && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '1px 6px' }}>EH</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>

        {/* Coach info */}
        {coach && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: '#042C53', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 16 }}>⚾</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#042C53' }}>{coach.user?.name}</div>
              <div style={{ fontSize: 12, color: '#73726c' }}>{coach.title ?? 'Coach'}</div>
            </div>
          </div>
        )}

        {/* Batting Order */}
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 }}>
          <div style={{ background: '#042C53', padding: '10px 16px' }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Batting Order · {filledSlots.length} Players
            </div>
          </div>
          {slots.map((slot: any, index: number) => (
            <div key={index} style={{
              display: 'flex', alignItems: 'center', padding: '12px 16px',
              borderBottom: index < slots.length - 1 ? '1px solid #f0f0f0' : 'none',
              background: index % 2 === 0 ? '#fff' : '#fafafa'
            }}>
              {/* Order number */}
              <div style={{
                width: 30, height: 30, borderRadius: 15,
                background: slot.player_name ? '#042C53' : '#e5e5e5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: 14, flexShrink: 0
              }}>
                <span style={{ color: slot.player_name ? '#fff' : '#aaa', fontSize: 13, fontWeight: 700 }}>{index + 1}</span>
              </div>

              {/* Player name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: slot.player_name ? 600 : 400, color: slot.player_name ? '#1a1a1a' : '#B4B2A9' }}>
                  {slot.player_name ?? '—'}
                </div>
                {slot.is_dh && (
                  <div style={{ fontSize: 11, color: '#6A1B9A', fontWeight: 600, marginTop: 1 }}>Designated Hitter</div>
                )}
              </div>

              {/* Position badge */}
              {slot.position && (
                <div style={{
                  background: (POSITION_COLORS[slot.position] ?? '#042C53') + '18',
                  color: POSITION_COLORS[slot.position] ?? '#042C53',
                  borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                }}>
                  {slot.position}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {lineup.notes && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
              Game Notes
            </div>
            <div style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{lineup.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#B4B2A9' }}>Powered by</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#042C53', marginTop: 2 }}>Diamond IQ</div>
          <div style={{ fontSize: 11, color: '#B4B2A9', marginTop: 2 }}>iqbio.io</div>
        </div>
      </div>
    </div>
  )
}
