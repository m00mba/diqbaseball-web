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
    const { facilityId, verified } = await req.json()
    if (!facilityId || typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'facilityId and verified (true/false) required' }, { status: 400 })
    }

    const { error } = await adminClient
      .from('facility_profiles')
      .update({ verified })
      .eq('id', facilityId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
