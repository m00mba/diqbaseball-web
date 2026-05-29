'use client'
import { useState } from 'react'
import styles from './page.module.css'
import Link from 'next/link'

export default function Home() {
  return (
    <main className={styles.main}>

      {/* NAV */}
      <nav className={styles.nav}>
        <a href="https://diqbaseball.com" className={styles.navLogo} style={{textDecoration:"none"}}> 
          <span className={styles.navLogoText}>Diamond IQ</span>
          <span className={styles.navLogoBadge}>BASEBALL</span>
        </a>
        <div className={styles.navLinks}>
          <Link href="/facilities" className={styles.navLink}>Find Facilities</Link>
          <a href="https://player.iqbio.io/login" className={styles.navLink}>Player Login</a>
          <Link href="/facility/login" className={styles.navLink}>Facility Portal</Link>
          <Link href="#access" className={styles.navCta}>Request Access</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Verified Recruiting Platform</div>
          <h1 className={styles.heroTitle}>
            Your Numbers.<br />
            <span className={styles.heroTitleAccent}>Verified.</span>
          </h1>
          <p className={styles.heroSub}>
            Diamond IQ connects players with coaches, scouts, and facilities through verified measurables — not self-reported stats. Every number in your profile is confirmed by a certified facility.
          </p>
          <div className={styles.heroCtas}>
            <Link href="#access" className={styles.btnPrimary}>Request Access</Link>
            <Link href="/facilities" className={styles.btnSecondary}>Find a Facility</Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>100%</span>
            <span className={styles.heroStatLbl}>Verified Data</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>4</span>
            <span className={styles.heroStatLbl}>User Roles</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>DIQ</span>
            <span className={styles.heroStatLbl}>Score System</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how} id="how">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>How It Works</div>
          <h2 className={styles.sectionTitle}>Built for the Recruiting Process</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>01</div>
              <div className={styles.stepIcon}>⚾</div>
              <h3 className={styles.stepTitle}>Player Creates Profile</h3>
              <p className={styles.stepBody}>Players build their profile with positions, stats, highlights, and contact info. Every account starts with a DIQ score.</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNum}>02</div>
              <div className={styles.stepIcon}>🏟️</div>
              <h3 className={styles.stepTitle}>Facility Verifies Measurables</h3>
              <p className={styles.stepBody}>Certified facilities log verified sessions — HitTrax, Rapsodo, Trackman. Metrics are locked and can't be edited by the player.</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNum}>03</div>
              <div className={styles.stepIcon}>🎓</div>
              <h3 className={styles.stepTitle}>Coaches & Scouts Discover</h3>
              <p className={styles.stepBody}>College coaches and scouts browse verified profiles, filter by position and metrics, and connect directly with players.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FIND A FACILITY */}
      <section className={styles.facilities} id="facilities">
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Get Verified</div>
          <h2 className={styles.sectionTitle}>Find a Verified Facility Near You</h2>
          <p className={styles.facilitiesSub}>
            Diamond IQ Verified Partners have the technology and expertise to verify your measurables — giving your recruiting profile the credibility college coaches trust.
          </p>
          <div className={styles.facilityFeatures}>
            {[
              { icon: '⚾', label: 'HitTrax', desc: 'Exit velo, bat speed, launch angle' },
              { icon: '📡', label: 'Rapsodo', desc: 'Pitch velocity, spin rate, movement' },
              { icon: '💥', label: 'Blast Motion', desc: 'Swing mechanics, attack angle' },
              { icon: '📊', label: 'TrackMan', desc: 'Advanced pitch & hit analytics' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className={styles.facilityFeatureCard}>
                <div className={styles.facilityFeatureIcon}>{icon}</div>
                <div className={styles.facilityFeatureLabel}>{label}</div>
                <div className={styles.facilityFeatureDesc}>{desc}</div>
              </div>
            ))}
          </div>
          <Link href="/facilities" className={styles.btnFindFacility}>
            🏟 Find a Facility Near You →
          </Link>
        </div>
      </section>

      {/* ROLES */}
      <section className={styles.roles}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Who It's For</div>
          <h2 className={styles.sectionTitle}>One Platform. Every Role.</h2>
          <div className={styles.roleGrid}>
            {[
              { icon: '⚾', role: 'Players', desc: 'Build a verified profile, track your DIQ score, get discovered by college programs.' },
              { icon: '🎓', role: 'Coaches', desc: 'Discover verified talent, manage your roster, log game stats, verify player performance.' },
              { icon: '🔭', role: 'Scouts', desc: 'Browse the marketplace, verify measurables, build your pipeline of verified prospects.' },
              { icon: '🏟️', role: 'Facilities', desc: 'Log verified sessions from HitTrax, Rapsodo, Trackman, and Blast. Upload directly from your PC.' },
            ].map(({ icon, role, desc }) => (
              <div key={role} className={styles.roleCard}>
                <div className={styles.roleIcon}>{icon}</div>
                <h3 className={styles.roleTitle}>{role}</h3>
                <p className={styles.roleDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUEST ACCESS */}
      <section className={styles.download} id="access">
        <div className={styles.downloadInner}>
          <div className={styles.sectionLabel} style={{ color: 'var(--gold)' }}>Invite Only</div>
          <h2 className={styles.downloadTitle}>Request Access</h2>
          <p className={styles.downloadSub}>
            Diamond IQ is currently invite-only as we onboard our founding facilities and players. 
            Request access and we'll reach out within 24 hours.
          </p>
          <RequestAccessForm />
          <p className={styles.downloadNote}>Players, coaches, scouts, and facilities welcome.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>Diamond IQ Baseball</div>
          <div className={styles.footerLinks}>
            <Link href="/facilities">Find Facilities</Link>
            <a href="https://player.iqbio.io/login">Player Login</a>
            <Link href="/facility/login">Facility Portal</Link>
            <a href="mailto:kelly@iqbio.io">Contact</a>
          </div>
          <div className={styles.footerCopy}>© 2026 Diamond IQ Baseball. All rights reserved.</div>
        </div>
      </footer>

    </main>
  )
}

function RequestAccessForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !role) return
    setSubmitting(true)
    // Send via mailto as a simple solution until email is configured
    window.location.href = `mailto:kelly@iqbio.io?subject=Diamond IQ Access Request&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0ARole: ${encodeURIComponent(role)}%0A%0APlease grant me access to Diamond IQ Baseball.`
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 24px', maxWidth: 400, margin: '0 auto 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Request sent!</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>We'll be in touch within 24 hours.</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 400, margin: '0 auto 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        style={{ padding: '12px 16px', borderRadius: 8, border: 'none', fontSize: 14, outline: 'none' }}
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email"
        type="email"
        style={{ padding: '12px 16px', borderRadius: 8, border: 'none', fontSize: 14, outline: 'none' }}
      />
      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        style={{ padding: '12px 16px', borderRadius: 8, border: 'none', fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' }}
      >
        <option value="">I am a...</option>
        <option value="Player">Player</option>
        <option value="Coach">Coach</option>
        <option value="Scout">Scout</option>
        <option value="Facility">Facility / Training Center</option>
        <option value="Parent">Parent</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={submitting || !name || !email || !role}
        style={{
          padding: '13px', borderRadius: 8, border: 'none',
          background: (!name || !email || !role) ? 'rgba(255,255,255,0.3)' : '#fff',
          color: '#042C53', fontSize: 14, fontWeight: 700,
          cursor: (!name || !email || !role) ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Sending...' : 'Request Access →'}
      </button>
    </div>
  )
}
