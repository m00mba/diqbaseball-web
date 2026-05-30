import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const ADMIN_EMAILS = ['kelly@destroyersbaseball.org', 'kelly@iqbio.io']

export async function POST(req: NextRequest) {
  try {
    const { facilityId, verified, adminEmail } = await req.json()

    if (!ADMIN_EMAILS.includes(adminEmail?.toLowerCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
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
