import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const { userId, name, email, password, role } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Update public users table
    const publicUpdates: { name?: string; email?: string; role?: string } = {}
    if (name) publicUpdates.name = name
    if (email) publicUpdates.email = email
    if (role) publicUpdates.role = role

    if (Object.keys(publicUpdates).length > 0) {
      const { error: userError } = await adminClient
        .from('users')
        .update(publicUpdates)
        .eq('id', userId)
      if (userError) return NextResponse.json({ error: `users table: ${userError.message}` }, { status: 500 })
    }

    // Update email in auth if provided
    if (email) {
      const { error } = await adminClient.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true
      })
      if (error) return NextResponse.json({ error: `email update: ${error.message}` }, { status: 500 })
    }

    // For password - generate a recovery link instead of direct update
    if (password && password.length >= 8) {
      // Get the user's current email
      const { data: userData } = await adminClient
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()

      if (userData?.email) {
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: 'recovery',
          email: userData.email,
        })
        if (linkError) return NextResponse.json({ error: `link gen: ${linkError.message}` }, { status: 500 })
        
        // Return the recovery link so admin can open it and set password
        return NextResponse.json({ 
          success: true, 
          recoveryLink: linkData?.properties?.action_link,
          message: 'Open the recovery link to set the password'
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `caught: ${msg}` }, { status: 500 })
  }
}
