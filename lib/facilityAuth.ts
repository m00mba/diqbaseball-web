import { supabase } from '@/lib/supabase'

/**
 * Get the facility profile for the currently logged in user.
 * Checks facility_profiles.user_id first (owner), then facility_users (staff).
 */
export async function getFacilityProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if owner
  const { data: owned } = await supabase
    .from('facility_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (owned) return { ...owned, staff_role: 'owner' }

  // Check if staff member
  const { data: staffLink } = await supabase
    .from('facility_users')
    .select('*, facility:facility_profiles(*)')
    .eq('user_id', user.id)
    .single()

  if (staffLink?.facility) return { ...staffLink.facility, staff_role: staffLink.role }

  return null
}
