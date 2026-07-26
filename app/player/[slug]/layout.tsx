import type { Metadata } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params

  const res = await fetch(
    `${supabaseUrl}/rest/v1/player_profiles?public_slug=eq.${slug}&select=diq_score,positions,grad_year,high_school,state,bio,photo_url,user:users(name)&limit=1`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  )
  const data = await res.json()
  const profile = Array.isArray(data) ? data[0] : null

  if (!profile) {
    return {
      title: 'Player Not Found — Diamond IQ Baseball',
      description: 'Diamond IQ Baseball — Verified athlete intelligence for baseball recruiting.',
    }
  }

  const name = (profile.user as any)?.name ?? 'Unknown Player'
  const positions = profile.positions?.join(', ') ?? ''
  const gradYear = profile.grad_year ? `Class of ${profile.grad_year}` : ''
  const school = profile.high_school ?? ''
  const state = profile.state ?? ''
  const diq = profile.diq_score ? profile.diq_score.toFixed(1) : null
  const bio = profile.bio ?? ''

  const title = `${name} — Diamond IQ Baseball`

  const descParts = [
    positions && `${positions}`,
    gradYear,
    school && state ? `${school} · ${state}` : school || state,
    diq ? `DIQ Score: ${diq}` : null,
    bio ? bio.slice(0, 100) + (bio.length > 100 ? '...' : '') : null,
  ].filter(Boolean)

  const description = descParts.join(' · ') || 'Verified recruiting profile on Diamond IQ Baseball.'

  const profileUrl = `https://iqbio.io/player/${slug}`

  // Use player photo if available, otherwise use a branded fallback
  const imageUrl = profile.photo_url
    ? profile.photo_url
    : `https://iqbio.io/og-default.png`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: profileUrl,
      siteName: 'Diamond IQ Baseball',
      type: 'profile',
      images: [
        {
          url: imageUrl,
          width: 400,
          height: 400,
          alt: `${name} — Diamond IQ Baseball`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [imageUrl],
      site: '@DIQBaseball',
    },
    alternates: {
      canonical: profileUrl,
    },
  }
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
