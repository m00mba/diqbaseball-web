// admin-auth-lock
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '../admin-auth'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin.ok) return admin.response

  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Never let the admin delete their own account by accident.
    if (userId === admin.userId) {
      return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 })
    }

    // Delete from auth (cascades to public.users if FK set up, otherwise delete manually)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
    if (authError) throw authError

    // Clean up public.users row (in case no cascade)
    await adminClient.from('users').delete().eq('id', userId)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
