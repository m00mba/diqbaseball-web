'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const EQUIPMENT_OPTIONS = [
  { value: 'HitTrax', label: '⚾ HitTrax', description: 'Bat speed, exit velo, launch angle, ball flight' },
  { value: 'Rapsodo', label: '📡 Rapsodo', description: 'Pitch velocity, spin rate, movement profile' },
  { value: 'Blast Motion', label: '💥 Blast Motion', description: 'Swing mechanics, attack angle, time to contact' },
  { value: 'Diamond Kinetics', label: '💎 Diamond Kinetics', description: 'Bat speed, smash factor, hand speed' },
  { value: 'TrackMan', label: '📊 TrackMan', description: 'Advanced pitch and hit analytics' },
  { value: 'Edgertronic', label: '🎥 Edgertronic', description: 'High-speed video analysis' },
  { value: 'K-Vest', label: '🏃 K-Vest', description: 'Kinematic sequencing, body movement' },
  { value: 'Driveline Plyo', label: '🎯 Driveline Plyo', description: 'Arm care, velocity development' },
  { value: 'Force Plates', label: '⚡ Force Plates', description: 'Rotational power, ground force' },
]

export default function FacilitySettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [facilityId, setFacilityId] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [address, setAddress] = useState('')
  const [equipment, setEquipment] = useState<string[]>([])
  const [publicSlug, setPublicSlug] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/facility/login'); return }

    // Check staff first
    const { data: staffLink } = await supabase
      .from('facility_users')
      .select('*, facility:facility_profiles(*)')
      .eq('user_id', user.id)
      .maybeSingle()

    let fp: any = staffLink?.facility ?? null

    if (!fp) {
      const { data: owned } = await supabase
        .from('facility_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      fp = owned
    }

    if (!fp) { router.push('/facility/login'); return }

    setFacilityId(fp.id)
    setName(fp.name ?? '')
    setBio(fp.bio ?? '')
    setPhone(fp.phone ?? '')
    setWebsite(fp.website ?? '')
    setCity(fp.city ?? '')
    setState(fp.state ?? '')
    setAddress(fp.address ?? '')
    setEquipment(fp.equipment ?? [])
    setPublicSlug(fp.public_slug ?? '')
    setLoading(false)
  }

  function toggleEquipment(val: string) {
    setEquipment(prev =>
      prev.includes(val) ? prev.filter(e => e !== val) : [...prev, val]
    )
  }

  async function handleSave() {
    setSaving(true)
    setErrorMsg('')
    try {
      const { error } = await supabase
        .from('facility_profiles')
        .update({
          name,
          bio,
          phone,
          website,
          city,
          state,
          address,
          equipment,
        })
        .eq('id', facilityId)

      if (error) throw error
      setSuccessMsg('✅ Profile saved')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f3ef', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e5e5', borderTopColor: '#185FA5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#042C53', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Diamond IQ</span>
          <span style={{ color: '#B5D4F4', fontSize: 13 }}>{name}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/facility/dashboard" style={{ color: '#B5D4F4', fontSize: 13, textDecoration: 'none' }}>📂 Upload</a>
          <a href="/facility/sessions" style={{ color: '#B5D4F4', fontSize: 13, textDecoration: 'none' }}>📊 Sessions</a>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/facility/login') }}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#042C53', margin: '0 0 24px' }}>Facility Profile</h1>

        {successMsg && <div style={{ background: '#E8F5E9', color: '#1B5E20', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>{successMsg}</div>}
        {errorMsg && <div style={{ background: '#FFEBEE', color: '#B71C1C', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{errorMsg}</div>}

        {/* Public profile link */}
        {publicSlug && (
          <div style={{ background: '#E6F1FB', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#185FA5', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>Your Public Profile</div>
              <div style={{ fontSize: 13, color: '#185FA5' }}>iqbio.io/facility/{publicSlug}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(`https://www.iqbio.io/facility/${publicSlug}`); setSuccessMsg('✅ Link copied!') }}
              style={{ padding: '6px 14px', background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Copy Link
            </button>
          </div>
        )}

        {/* Basic info */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#042C53', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 16px' }}>Basic Information</h3>

          {[
            { label: 'Facility Name', value: name, setter: setName, placeholder: 'Triple Crown Baseball' },
            { label: 'Phone Number', value: phone, setter: setPhone, placeholder: '(704) 555-0100' },
            { label: 'Website', value: website, setter: setWebsite, placeholder: 'https://yourfacility.com' },
            { label: 'Address', value: address, setter: setAddress, placeholder: '123 Main St' },
            { label: 'City', value: city, setter: setCity, placeholder: 'Denver' },
            { label: 'State', value: state, setter: setState, placeholder: 'NC' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>{label}</label>
              <input
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#73726c', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }}>About Your Facility</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell players and parents what makes your facility special — your coaching philosophy, specialties, training programs..."
              rows={4}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const, lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Equipment */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#042C53', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>Technology & Equipment</h3>
          <p style={{ fontSize: 12, color: '#73726c', margin: '0 0 16px', lineHeight: 1.5 }}>
            Select all equipment your facility has. This shows on your public profile and helps players find you when searching for specific technology.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {EQUIPMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleEquipment(opt.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${equipment.includes(opt.value) ? '#185FA5' : '#e5e5e5'}`,
                  background: equipment.includes(opt.value) ? '#F0F7FF' : '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: equipment.includes(opt.value) ? '#185FA5' : '#1a1a1a', marginBottom: 2 }}>
                  {equipment.includes(opt.value) ? '✓ ' : ''}{opt.label}
                </div>
                <div style={{ fontSize: 11, color: '#73726c' }}>{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: 14, background: saving ? '#73726c' : '#185FA5',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
            fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
