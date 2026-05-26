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

    // Check env vars are present
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not set' }, { status: 500 })
    }

    // Update public users table first (safer, no email confirmation issues)
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

    // Update auth (email and/or password)
    const authUpdates: { email?: string; password?: string } = {}
    if (email) authUpdates.email = email
    if (password && password.length >= 8) authUpdates.password = password

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, authUpdates)
      if (authError) return NextResponse.json({ error: `auth update: ${authError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `caught: ${msg}` }, { status: 500 })
  }
}
