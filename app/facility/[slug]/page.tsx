'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

const EQUIPMENT_INFO: Record<string, { icon: string; description: string }> = {
  'HitTrax': { icon: '⚾', description: 'Bat speed, exit velocity, launch angle, ball flight simulation' },
  'Rapsodo': { icon: '📡', description: 'Pitch velocity, spin rate, spin axis, movement profile' },
  'Blast Motion': { icon: '💥', description: 'Swing mechanics, attack angle, time to contact, on-plane efficiency' },
  'Diamond Kinetics': { icon: '💎', description: 'Bat speed, smash factor, peak hand speed, connection at impact' },
  'TrackMan': { icon: '📊', description: 'Advanced pitch and hit analytics, launch conditions' },
  'Edgertronic': { icon: '🎥', description: 'High-speed video analysis up to 2000fps' },
  'K-Vest': { icon: '🏃', description: 'Kinematic sequencing, body movement, mechanical efficiency' },
  'Driveline Plyo': { icon: '🎯', description: 'Arm care protocols, velocity development programs' },
  'Force Plates': { icon: '⚡', description: 'Rotational power, ground reaction force measurement' },
}

export default function FacilityPublicProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [facility, setFacility] = useState<any>(null)
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadFacility()
  }, [slug])

  async function loadFacility() {
    setLoading(true)
    const { data, error } = await supabase
      .from('facility_profiles')
      .select('*, owner:users(name)')
      .eq('public_slug', slug)
      .single()

    if (error || !data) { setNotFound(true); setLoading(false); return }
    setFacility(data)

    // Load recent verified sessions count and player count
    const { data: sessions } = await supabase
      .from('verified_measurables')
      .select('id, player_id, verified_at, equipment')
      .eq('facility_id', data.id)
      .order('verified_at', { ascending: false })
      .limit(50)

    setRecentSessions(sessions ?? [])
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f3ef' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e5e5', borderTopColor: '#185FA5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f3ef', textAlign: 'center', padding: 32, fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏟</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#042C53', margin: '0 0 8px' }}>Facility not found</h2>
      <p style={{ fontSize: 14, color: '#73726c' }}>This facility profile may have been removed or the link is incorrect.</p>
    </div>
  )

  const uniquePlayers = new Set(recentSessions.map(s => s.player_id)).size
  const totalSessions = recentSessions.length
  const equipment = facility.equipment ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#042C53', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Diamond IQ</div>
          <div style={{ color: '#B5D4F4', fontSize: 11 }}>Verified Athlete Intelligence</div>
        </div>
        <button
          onClick={copyLink}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          {copied ? '✓ Copied!' : '🔗 Share'}
        </button>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

        {/* Facility hero */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#042C53', margin: 0, letterSpacing: '-0.5px' }}>{facility.name}</h1>
                {facility.verified && (
                  <span style={{ background: '#E8F5E9', color: '#27500A', padding: '2px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>✅ Verified Partner</span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: '#73726c', marginBottom: facility.bio ? 14 : 0 }}>
                {(facility.city || facility.state) && <span>📍 {[facility.city, facility.state].filter(Boolean).join(', ')}</span>}
                {facility.phone && <span>📞 {facility.phone}</span>}
                {facility.website && (
                  <a href={facility.website} target="_blank" rel="noopener noreferrer" style={{ color: '#185FA5', textDecoration: 'none' }}>
                    🌐 {facility.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              {facility.bio && <p style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.7, margin: 0 }}>{facility.bio}</p>}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
              <div style={{ background: '#042C53', borderRadius: 12, padding: '14px 20px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{totalSessions}</div>
                <div style={{ fontSize: 10, color: '#B5D4F4', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Sessions</div>
              </div>
              <div style={{ background: '#042C53', borderRadius: 12, padding: '14px 20px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{uniquePlayers}</div>
                <div style={{ fontSize: 10, color: '#B5D4F4', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Players</div>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment */}
        {equipment.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#042C53', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>
              Technology & Equipment
            </h3>
            <p style={{ fontSize: 12, color: '#73726c', margin: '0 0 16px' }}>
              Sessions verified with this technology are available on player profiles.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {equipment.map((eq: string) => {
                const info = EQUIPMENT_INFO[eq] ?? { icon: '🔧', description: '' }
                return (
                  <div key={eq} style={{ background: '#F0F7FF', borderRadius: 10, padding: '12px 14px', border: '0.5px solid #B5D4F4' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#042C53', marginBottom: 3 }}>{info.icon} {eq}</div>
                    {info.description && <div style={{ fontSize: 11, color: '#73726c', lineHeight: 1.5 }}>{info.description}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recentSessions.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#042C53', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {Object.entries(
                recentSessions.reduce((acc: Record<string, number>, s) => {
                  const eq = s.equipment ?? 'Manual'
                  acc[eq] = (acc[eq] ?? 0) + 1
                  return acc
                }, {})
              ).map(([eq, count]) => (
                <div key={eq} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#042C53' }}>{count}</div>
                  <div style={{ fontSize: 11, color: '#73726c' }}>{eq} sessions</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ background: '#042C53', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Get Your Data Verified by {facility.name}
          </div>
          <p style={{ fontSize: 13, color: '#B5D4F4', margin: '0 0 16px', lineHeight: 1.6 }}>
            Book a session to get verified metrics on your Diamond IQ profile — visible to college coaches and scouts.
          </p>
          {facility.phone && (
            <a href={`tel:${facility.phone}`}
              style={{ display: 'inline-block', background: '#185FA5', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', marginRight: 8 }}>
              📞 Call Now
            </a>
          )}
          {facility.website && (
            <a href={facility.website} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)' }}>
              🌐 Visit Website
            </a>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#042C53', marginBottom: 4 }}>Diamond IQ</div>
          <p style={{ fontSize: 12, color: '#B4B2A9', margin: 0 }}>
            Verified athlete intelligence for baseball recruiting.
            <a href="https://www.iqbio.io" style={{ color: '#185FA5', textDecoration: 'none', marginLeft: 4 }}>iqbio.io →</a>
          </p>
        </div>
      </div>
    </div>
  )
}
