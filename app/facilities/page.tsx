'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const EQUIPMENT_COLORS: Record<string, string> = {
  'HitTrax': '#185FA5',
  'Rapsodo': '#27500A',
  'Blast Motion': '#7A5200',
  'Diamond Kinetics': '#6A1B9A',
  'TrackMan': '#1B5E20',
  'Edgertronic': '#B71C1C',
  'K-Vest': '#E65100',
  'Driveline Plyo': '#004D40',
  'Force Plates': '#1A237E',
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
]

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('')

  useEffect(() => {
    loadFacilities()
  }, [])

  async function loadFacilities() {
    setLoading(true)
    const { data } = await supabase
      .from('facility_profiles')
      .select(`
        id, name, city, state, bio, equipment, public_slug, verified, phone, website,
        sessions:verified_measurables(count)
      `)
      .eq('verified', true)
      .not('public_slug', 'is', null)
      .order('name')

    setFacilities(data ?? [])
    setLoading(false)
  }

  const filtered = facilities.filter(f => {
    const matchSearch = !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.city?.toLowerCase().includes(search.toLowerCase()) ||
      f.state?.toLowerCase().includes(search.toLowerCase())
    const matchState = !stateFilter || f.state === stateFilter
    const matchEquipment = !equipmentFilter || (f.equipment ?? []).includes(equipmentFilter)
    return matchSearch && matchState && matchEquipment
  })

  // Get all unique equipment across all facilities
  const allEquipment = Array.from(new Set(facilities.flatMap(f => f.equipment ?? []))).sort()

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#042C53', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Diamond IQ</div>
          <div style={{ color: '#B5D4F4', fontSize: 11 }}>Verified Athlete Intelligence</div>
        </div>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/facilities" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Find Facilities</Link>
          <Link href="/" style={{ color: '#B5D4F4', fontSize: 13, textDecoration: 'none' }}>Home</Link>
        </nav>
      </header>

      {/* Hero */}
      <div style={{ background: '#042C53', padding: '48px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
          Find a Diamond IQ Verified Facility
        </h1>
        <p style={{ fontSize: 15, color: '#B5D4F4', margin: '0 0 28px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Get your metrics verified by a certified facility and build your recruiting profile with data coaches and scouts trust.
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 10 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by facility name or city..."
            style={{
              flex: 1, padding: '12px 18px', borderRadius: 10, border: 'none',
              fontSize: 15, outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={stateFilter}
            onChange={e => setStateFilter(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}
          >
            <option value="">All States</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={equipmentFilter}
            onChange={e => setEquipmentFilter(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer' }}
          >
            <option value="">All Equipment</option>
            {allEquipment.map(eq => <option key={eq} value={eq}>{eq}</option>)}
          </select>

          {(stateFilter || equipmentFilter || search) && (
            <button
              onClick={() => { setSearch(''); setStateFilter(''); setEquipmentFilter('') }}
              style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fff', cursor: 'pointer', color: '#73726c' }}
            >
              ✕ Clear filters
            </button>
          )}

          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#73726c' }}>
            {filtered.length} {filtered.length === 1 ? 'facility' : 'facilities'}
          </span>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#73726c', fontSize: 14 }}>Loading facilities...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#042C53', marginBottom: 6 }}>No facilities found</div>
            <div style={{ fontSize: 13, color: '#73726c' }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(f => (
              <Link
                key={f.id}
                href={`/f/${f.public_slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#fff', borderRadius: 14, padding: 24,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  border: '1.5px solid transparent',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#185FA5')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#042C53', margin: 0 }}>{f.name}</h2>
                        <span style={{ background: '#E8F5E9', color: '#27500A', padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700 }}>
                          ✅ Verified Partner
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#73726c', marginBottom: f.bio ? 10 : 0, flexWrap: 'wrap' }}>
                        {(f.city || f.state) && <span>📍 {[f.city, f.state].filter(Boolean).join(', ')}</span>}
                        {f.phone && <span>📞 {f.phone}</span>}
                        {f.sessions?.[0]?.count > 0 && (
                          <span>⚾ {f.sessions[0].count} verified sessions</span>
                        )}
                      </div>

                      {f.bio && (
                        <p style={{ fontSize: 13, color: '#3a3a3a', lineHeight: 1.6, margin: '8px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {f.bio}
                        </p>
                      )}

                      {/* Equipment badges */}
                      {(f.equipment ?? []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                          {(f.equipment ?? []).map((eq: string) => (
                            <span key={eq} style={{
                              padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                              background: `${EQUIPMENT_COLORS[eq] ?? '#185FA5'}15`,
                              color: EQUIPMENT_COLORS[eq] ?? '#185FA5',
                              border: `1px solid ${EQUIPMENT_COLORS[eq] ?? '#185FA5'}30`,
                            }}>
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#185FA5', fontWeight: 600 }}>View Profile →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA for facilities */}
        <div style={{ marginTop: 40, background: '#042C53', borderRadius: 14, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Own a Training Facility?
          </div>
          <p style={{ fontSize: 13, color: '#B5D4F4', margin: '0 0 16px', lineHeight: 1.6 }}>
            Join Diamond IQ as a verified partner and showcase your technology to players and parents in your area.
          </p>
          <a
            href="mailto:kelly@iqbio.io?subject=Diamond IQ Facility Partner Inquiry"
            style={{ display: 'inline-block', background: '#185FA5', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Become a Verified Partner
          </a>
        </div>

        <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#042C53', marginBottom: 4 }}>Diamond IQ</div>
          <p style={{ fontSize: 12, color: '#B4B2A9', margin: 0 }}>Verified athlete intelligence for baseball recruiting.</p>
        </div>
      </div>
    </div>
  )
}
