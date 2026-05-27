'use client'
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
          <Link href="/facility/login" className={styles.navLink}>Facility Portal</Link>
          <Link href="#download" className={styles.navCta}>Download App</Link>
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
            <a href="#download" className={styles.btnPrimary}>Get the App</a>
            <Link href="/facility/login" className={styles.btnSecondary}>Facility Portal</Link>
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

      {/* DOWNLOAD */}
      <section className={styles.download} id="download">
        <div className={styles.downloadInner}>
          <div className={styles.sectionLabel} style={{ color: 'var(--gold)' }}>Available Now</div>
          <h2 className={styles.downloadTitle}>Get Diamond IQ Baseball</h2>
          <p className={styles.downloadSub}>Download on iOS and start building your verified recruiting profile today.</p>
          <a
            href="https://testflight.apple.com/join/kywhWyDg"
            className={styles.btnDownload}
            target="_blank"
            rel="noopener noreferrer"
          >
            🍎 Download on TestFlight
          </a>
          <p className={styles.downloadNote}>Currently in beta. Android coming soon.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>Diamond IQ Baseball</div>
          <div className={styles.footerLinks}>
            <Link href="/facility/login">Facility Portal</Link>
            <a href="mailto:kelly@iqbio.io">Contact</a>
          </div>
          <div className={styles.footerCopy}>© 2026 Diamond IQ Baseball. All rights reserved.</div>
        </div>
      </footer>

    </main>
  )
}
