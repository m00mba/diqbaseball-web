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

    // Update auth email and/or password if provided
    const authUpdates: { email?: string; password?: string } = {}
    if (email) authUpdates.email = email
    if (password) authUpdates.password = password

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await adminClient.auth.admin.updateUserById(userId, authUpdates)
      if (authError) throw authError
    }

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
      if (userError) throw userError
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
