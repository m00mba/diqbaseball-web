'use client'
import Link from 'next/link'

export default function PrivacyPolicy() {
  const lastUpdated = 'May 29, 2026'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f3ef',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    }}>
      {/* Header */}
      <header style={{ background: '#042C53', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>Diamond IQ</span>
        </Link>
        <Link href="/" style={{ color: '#B5D4F4', fontSize: 13, textDecoration: 'none' }}>← Back to Home</Link>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '40px 48px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#042C53', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: '#73726c', margin: '0 0 40px' }}>
            Last updated: {lastUpdated}
          </p>

          <Section title="1. Introduction">
            <p>Diamond IQ Baseball ("Diamond IQ," "we," "us," or "our") operates the Diamond IQ Baseball mobile application and the IQBio.io website (collectively, the "Platform"). This Privacy Policy explains how we collect, use, disclose, and protect information about you when you use our Platform.</p>
            <p>By using the Platform, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Platform.</p>
          </Section>

          <Section title="2. Information We Collect">
            <SubTitle>2.1 Information You Provide</SubTitle>
            <ul>
              <li><strong>Account information:</strong> Name, email address, password, role (player, coach, scout, or facility)</li>
              <li><strong>Player profile:</strong> Positions, graduation year, high school, travel team, state, height, weight, batting/throwing hand, GPA, SAT/ACT scores, bio</li>
              <li><strong>Game statistics:</strong> At-bats, hits, home runs, RBIs, pitching stats, and other game performance data you choose to log</li>
              <li><strong>Contact information:</strong> Phone number, parent email (optional)</li>
              <li><strong>Photos and videos:</strong> Profile photos and highlight videos you upload</li>
            </ul>

            <SubTitle>2.2 Verified Measurables</SubTitle>
            <p>When you visit a Diamond IQ Verified Facility, the facility may collect and upload performance data on your behalf, including:</p>
            <ul>
              <li>Exit velocity, bat speed, launch angle, and other HitTrax metrics</li>
              <li>Pitch velocity, spin rate, and movement data from Rapsodo or TrackMan</li>
              <li>Swing mechanics data from Blast Motion or Diamond Kinetics</li>
              <li>60-yard dash time and arm velocity measurements</li>
            </ul>
            <p>This data is verified by the facility and locked — it cannot be edited by the player.</p>

            <SubTitle>2.3 Information Collected Automatically</SubTitle>
            <ul>
              <li>Device information (device type, operating system)</li>
              <li>Usage data (features used, pages viewed, time spent)</li>
              <li>IP address and general location</li>
            </ul>
          </Section>

          <Section title="3. Children's Privacy (COPPA)">
            <p>Diamond IQ Baseball is designed for use by baseball and softball players, including players under the age of 13. We comply with the Children's Online Privacy Protection Act (COPPA).</p>
            <p><strong>For users under 13:</strong> We require verifiable parental consent before collecting personal information from children under 13. If a player is under 13, a parent or guardian must:</p>
            <ul>
              <li>Create the account on behalf of the child, or</li>
              <li>Provide explicit consent via the parental consent flow in the app</li>
            </ul>
            <p><strong>What we collect from minors:</strong> We limit data collection from users under 13 to what is necessary to provide the service — name, performance metrics, game statistics, and profile information for recruiting purposes.</p>
            <p><strong>Parental rights:</strong> Parents or guardians may at any time:</p>
            <ul>
              <li>Review the personal information collected about their child</li>
              <li>Request deletion of their child's account and data</li>
              <li>Refuse to permit further collection of their child's information</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:kelly@iqbio.io" style={{ color: '#185FA5' }}>kelly@iqbio.io</a>.</p>
          </Section>

          <Section title="4. How We Use Your Information">
            <ul>
              <li>To provide and operate the Platform and its features</li>
              <li>To display your verified recruiting profile to coaches and scouts (based on your privacy settings)</li>
              <li>To generate AI-powered development analysis of your performance data</li>
              <li>To calculate and display your DIQ Score</li>
              <li>To enable facilities to verify and upload your measurables</li>
              <li>To allow parents to view their child's profile and log game statistics</li>
              <li>To communicate with you about your account and platform updates</li>
              <li>To improve the Platform and develop new features</li>
            </ul>
          </Section>

          <Section title="5. How We Share Your Information">
            <SubTitle>5.1 Public Profile</SubTitle>
            <p>By default, your player profile is visible to coaches, scouts, and other Platform users. You can control this in your Settings:</p>
            <ul>
              <li><strong>Verified metrics visibility:</strong> You can hide your HitTrax and verified measurable data from coaches and scouts at any time. Facilities can always see data they have verified.</li>
              <li><strong>Profile visibility:</strong> You can restrict your profile to coaches and scouts only, or make it fully public.</li>
            </ul>

            <SubTitle>5.2 Facilities</SubTitle>
            <p>Diamond IQ Verified Facilities can see all performance data they have uploaded for players who participate in sessions at their facility, regardless of the player's visibility settings.</p>

            <SubTitle>5.3 Service Providers</SubTitle>
            <p>We use the following third-party services to operate the Platform:</p>
            <ul>
              <li><strong>Supabase</strong> — database and authentication</li>
              <li><strong>Anthropic (Claude)</strong> — AI-powered performance analysis</li>
              <li><strong>Vercel</strong> — web hosting</li>
              <li><strong>Expo / EAS</strong> — mobile app distribution</li>
            </ul>
            <p>These providers access your information only as necessary to perform services on our behalf and are bound by confidentiality obligations.</p>

            <SubTitle>5.4 We Do Not Sell Your Data</SubTitle>
            <p>Diamond IQ does not sell, rent, or trade your personal information to third parties for their marketing purposes.</p>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your information for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it by law.</p>
            <p>Verified measurables uploaded by a facility are associated with both the facility's and player's records. Deleting your player account will remove your personal information but facility records of sessions may be retained by the facility.</p>
          </Section>

          <Section title="7. Data Security">
            <p>We implement industry-standard security measures to protect your information, including:</p>
            <ul>
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Row-level security on all database tables</li>
              <li>Secure authentication via Supabase Auth</li>
              <li>Access controls limiting who can view and modify data</li>
            </ul>
            <p>No method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your information.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal information</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Control visibility settings within the app</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:kelly@iqbio.io" style={{ color: '#185FA5' }}>kelly@iqbio.io</a>.</p>
          </Section>

          <Section title="9. California Privacy Rights (CCPA)">
            <p>California residents have the right to know what personal information we collect, the right to delete personal information, and the right to opt out of the sale of personal information. As stated above, we do not sell personal information. To exercise your California privacy rights, contact us at <a href="mailto:kelly@iqbio.io" style={{ color: '#185FA5' }}>kelly@iqbio.io</a>.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Platform or sending an email to the address associated with your account. Your continued use of the Platform after changes become effective constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
            <div style={{ background: '#f4f3ef', borderRadius: 10, padding: '16px 20px', marginTop: 12 }}>
              <div style={{ fontWeight: 700, color: '#042C53', marginBottom: 4 }}>Diamond IQ Baseball</div>
              <div style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.8 }}>
                Email: <a href="mailto:kelly@iqbio.io" style={{ color: '#185FA5' }}>kelly@iqbio.io</a><br />
                Website: <a href="https://www.iqbio.io" style={{ color: '#185FA5' }}>www.iqbio.io</a>
              </div>
            </div>
          </Section>

        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '24px', color: '#B4B2A9', fontSize: 12 }}>
        © 2026 Diamond IQ Baseball · <Link href="/" style={{ color: '#185FA5', textDecoration: 'none' }}>Home</Link>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#042C53', margin: '0 0 12px', paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 600, color: '#042C53', margin: '14px 0 6px', fontSize: 14 }}>{children}</div>
}
