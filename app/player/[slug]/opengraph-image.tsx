import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Diamond IQ Baseball Player Profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function Image({ params }: { params: { slug: string } }) {
  let profile: any = null
  let playerName = 'Diamond IQ Player'

  const SUPABASE_URL = 'https://mqrqtsjzzhlarpurjmmr.supabase.co'
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  try {
    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/player_profiles?public_slug=eq.${encodeURIComponent(params.slug)}&select=id,user_id,diq_score,positions,grad_year,high_school,state,exit_velo,arm_velo,sixty_time,fb_velo&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        cache: 'no-store',
      }
    )
    const profileData = await profileRes.json()
    profile = Array.isArray(profileData) && profileData.length > 0 ? profileData[0] : null

    if (profile?.user_id) {
      const userRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?id=eq.${profile.user_id}&select=name&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          cache: 'no-store',
        }
      )
      const userData = await userRes.json()
      if (Array.isArray(userData) && userData[0]?.name) {
        playerName = userData[0].name
      }
    }
  } catch (e) {
    console.error('OG image fetch error:', e)
  }
  const positions = profile?.positions?.join(' · ') ?? ''
  const gradYear = profile?.grad_year ? `Class of ${profile.grad_year}` : ''
  const school = profile?.high_school ?? ''
  const state = profile?.state ?? ''
  const diq = profile?.diq_score ? profile.diq_score.toFixed(1) : '—'
  const schoolLine = [school, state].filter(Boolean).join(', ')

  const measurables = [
    profile?.exit_velo ? `${profile.exit_velo} mph EV` : null,
    profile?.arm_velo ? `${profile.arm_velo} mph Arm` : null,
    profile?.sixty_time ? `${profile.sixty_time}s 60` : null,
    profile?.fb_velo ? `${profile.fb_velo} mph FB` : null,
  ].filter(Boolean).slice(0, 3)

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#042C53',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201, 162, 39, 0.08)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: 'rgba(24, 95, 165, 0.15)',
            display: 'flex',
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 60px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#C9A227',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              DIAMOND IQ BASEBALL
            </div>
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(181, 212, 244, 0.6)',
              display: 'flex',
            }}
          >
            iqbio.io
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            padding: '20px 60px 40px',
            gap: '60px',
          }}
        >
          {/* Left: Player info */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
            {/* Name */}
            <div
              style={{
                fontSize: playerName.length > 20 ? '52px' : '64px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.0',
                display: 'flex',
              }}
            >
              {playerName}
            </div>

            {/* Positions */}
            {positions && (
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: '600',
                  color: '#C9A227',
                  marginTop: '8px',
                  display: 'flex',
                }}
              >
                {positions}
              </div>
            )}

            {/* School + Grad Year */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '12px',
                alignItems: 'center',
              }}
            >
              {schoolLine && (
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(181, 212, 244, 0.8)',
                    display: 'flex',
                  }}
                >
                  {schoolLine}
                </div>
              )}
              {gradYear && (
                <div
                  style={{
                    fontSize: '20px',
                    color: 'rgba(181, 212, 244, 0.6)',
                    display: 'flex',
                  }}
                >
                  · {gradYear}
                </div>
              )}
            </div>

            {/* Measurables */}
            {measurables.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  marginTop: '24px',
                }}
              >
                {measurables.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '16px',
                      color: 'rgba(181, 212, 244, 0.9)',
                      display: 'flex',
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: DIQ Score */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(201, 162, 39, 0.12)',
              border: '2px solid rgba(201, 162, 39, 0.4)',
              borderRadius: '20px',
              padding: '30px 40px',
              minWidth: '200px',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                fontWeight: '800',
                color: '#C9A227',
                lineHeight: '1',
                display: 'flex',
              }}
            >
              {diq}
            </div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'rgba(201, 162, 39, 0.7)',
                marginTop: '8px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              DIQ Score
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 60px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(181, 212, 244, 0.5)',
              display: 'flex',
            }}
          >
            Verified Athlete Intelligence for Baseball Recruiting
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
