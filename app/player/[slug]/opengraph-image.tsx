import { ImageResponse } from 'next/og'

export const alt = 'Diamond IQ Baseball Player Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  // Parse name from slug as reliable fallback
  const slugParts = params.slug.split('-').filter((p: string) => !/^\d{4}$/.test(p))
  const playerName = slugParts.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Attempt DB fetch
  let diq = '—'
  let positions = ''
  let school = ''
  let gradYear = ''

  try {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    const url = 'https://mqrqtsjzzhlarpurjmmr.supabase.co'
    const r = await fetch(
      `${url}/rest/v1/player_profiles?public_slug=eq.${params.slug}&select=diq_score,positions,grad_year,high_school,state&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
    const d = await r.json()
    if (Array.isArray(d) && d[0]) {
      const p = d[0]
      if (p.diq_score) diq = Number(p.diq_score).toFixed(1)
      if (p.positions) positions = p.positions.join(' · ')
      if (p.grad_year) gradYear = `Class of ${p.grad_year}`
      if (p.high_school) school = p.high_school + (p.state ? `, ${p.state}` : '')
    }
  } catch (_) {}

  return new ImageResponse(
    (
      <div style={{ width: '1200px', height: '630px', display: 'flex', flexDirection: 'column', backgroundColor: '#042C53', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '40px 60px 0', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#C9A227', letterSpacing: '1px', display: 'flex' }}>DIAMOND IQ BASEBALL</div>
          <div style={{ fontSize: '14px', color: 'rgba(181,212,244,0.5)', display: 'flex' }}>iqbio.io</div>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '20px 60px 40px', gap: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
            <div style={{ fontSize: playerName.length > 20 ? '52px' : '64px', fontWeight: '800', color: '#ffffff', lineHeight: '1.0', display: 'flex' }}>{playerName}</div>
            {positions ? <div style={{ fontSize: '26px', fontWeight: '600', color: '#C9A227', marginTop: '8px', display: 'flex' }}>{positions}</div> : null}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', alignItems: 'center' }}>
              {school ? <div style={{ fontSize: '20px', color: 'rgba(181,212,244,0.8)', display: 'flex' }}>{school}</div> : null}
              {gradYear ? <div style={{ fontSize: '20px', color: 'rgba(181,212,244,0.6)', display: 'flex' }}>· {gradYear}</div> : null}
            </div>
          </div>

          {/* DIQ Score box */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,162,39,0.12)', border: '2px solid rgba(201,162,39,0.4)', borderRadius: '20px', padding: '30px 40px', minWidth: '200px' }}>
            <div style={{ fontSize: '80px', fontWeight: '800', color: '#C9A227', lineHeight: '1', display: 'flex' }}>{diq}</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(201,162,39,0.7)', marginTop: '8px', letterSpacing: '2px', display: 'flex' }}>DIQ SCORE</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 60px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '14px', color: 'rgba(181,212,244,0.5)', display: 'flex' }}>Verified Athlete Intelligence for Baseball Recruiting</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
