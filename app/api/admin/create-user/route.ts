import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, facilityName, facilityCity, facilityState } = await req.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password and role are required' }, { status: 400 })
    }

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so they can log in immediately
    })

    if (authError) throw authError
    const userId = authData.user.id

    // Insert into users table
    const { error: userError } = await adminClient
      .from('users')
      .insert({ id: userId, name, email, role })

    if (userError) throw userError

    // If facility, create facility profile
    if (role === 'facility' && facilityName) {
      const { error: facilityError } = await adminClient
        .from('facility_profiles')
        .insert({
          user_id: userId,
          name: facilityName,
          city: facilityCity || null,
          state: facilityState || null,
          verified: false,
        })
      if (facilityError) throw facilityError
    }

    // If player, create player profile
    if (role === 'player') {
      const { error: profileError } = await adminClient
        .from('player_profiles')
        .insert({ user_id: userId })
      if (profileError) throw profileError
    }

    return NextResponse.json({ success: true, userId })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
