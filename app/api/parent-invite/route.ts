import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { playerProfileId, parentEmail, playerName } = await req.json()
    if (!playerProfileId || !parentEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the parent token for this player
    const { data: profile, error } = await adminClient
      .from('player_profiles')
      .select('parent_token, public_slug')
      .eq('id', playerProfileId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Save parent email to player profile
    await adminClient
      .from('player_profiles')
      .update({ parent_email: parentEmail })
      .eq('id', playerProfileId)

    const parentLink = `${process.env.NEXT_PUBLIC_SITE_URL}/parent/${profile.parent_token}`

    // Send email via Supabase (uses configured SMTP)
    // For now return the link — when SMTP is configured this will send email
    return NextResponse.json({ 
      success: true, 
      parentLink,
      message: 'Parent link generated'
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
