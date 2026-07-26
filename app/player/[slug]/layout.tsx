import type { Metadata } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://mqrqtsjzzhlarpurjmmr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/player_profiles?public_slug=eq.${slug}&select=user_id,diq_score,positions,grad_year,high_school,state,bio&limit=1`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    const data = await res.json()
    const profile = Array.isArray(data) && data[0] ? data[0] : null

    let playerName = slug.split('-').filter((p: string) => !/^\d{4}$/.test(p)).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

    if (profile?.user_id) {
      const userRes = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${profile.user_id}&select=name&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      const userData = await userRes.json()
      if (Array.isArray(userData) && userData[0]?.name) playerName = userData[0].name
    }

    const positions = profile?.positions?.join(', ') ?? ''
    const gradYear = profile?.grad_year ? `Class of ${profile.grad_year}` : ''
    const school = profile?.high_school ?? ''
    const state = profile?.state ?? ''
    const diq = profile?.diq_score ? Number(profile.diq_score).toFixed(1) : null

    const descParts = [positions, gradYear, [school, state].filter(Boolean).join(' · '), diq ? `DIQ Score: ${diq}` : null].filter(Boolean)
    const description = descParts.join(' · ') || 'Verified recruiting profile on Diamond IQ Baseball.'
    const title = `${playerName} — Diamond IQ Baseball`
    const profileUrl = `https://iqbio.io/player/${slug}`
    const imageUrl = `https://iqbio.io/player/${slug}/opengraph-image`

    return {
      title,
      description,
      openGraph: { title, description, url: profileUrl, siteName: 'Diamond IQ Baseball', type: 'profile', images: [{ url: imageUrl, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
      alternates: { canonical: profileUrl },
    }
  } catch (_) {
    return {
      title: 'Diamond IQ Baseball',
      description: 'Verified athlete intelligence for baseball recruiting.',
    }
  }
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
