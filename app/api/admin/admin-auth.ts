// admin-auth-lock
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Only this signed-in account may use the admin API routes.
const ADMIN_EMAILS = ['kelly@destroyersbaseball.org']

const authClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export type AdminCheck =
  | { ok: true; userId: string; email: string }
  | { ok: false; response: NextResponse }

export async function requireAdmin(req: NextRequest): Promise<AdminCheck> {
  const header = req.headers.get('authorization') || ''
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Ask Supabase Auth who this token belongs to (verifies signature and expiry).
  const { data, error } = await authClient.auth.getUser(token)
  const user = data?.user
  if (error || !user || !user.email || !user.email_confirmed_at) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, userId: user.id, email: user.email }
}
