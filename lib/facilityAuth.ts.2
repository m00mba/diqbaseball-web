import { supabase } from '@/lib/supabase'

/**
 * Get the facility profile for the currently logged in user.
 * Checks facility_users (staff) first, then facility_profiles.user_id (owner).
 * Staff-first ensures users linked to multiple facilities via facility_users
 * are not blocked by an owned profile with no data.
 */
export async function getFacilityProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if staff member first
  const { data: staffLink } = await supabase
    .from('facility_users')
    .select('*, facility:facility_profiles(*)')
    .eq('user_id', user.id)
    .single()

  if (staffLink?.facility) return { ...staffLink.facility, staff_role: staffLink.role }

  // Fall back to owner
  const { data: owned } = await supabase
    .from('facility_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (owned) return { ...owned, staff_role: 'owner' }

  return null
}
