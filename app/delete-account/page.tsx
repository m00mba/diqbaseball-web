export default function DeleteAccountPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F7', padding: '40px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', backgroundColor: '#fff', borderRadius: 16, padding: '40px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#042C53' }}>Diamond IQ</span>
          <span style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #C9A227', padding: '2px 6px', borderRadius: 3 }}>
            Baseball
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
          Delete Your Account
        </h1>
        <p style={{ fontSize: 14, color: '#73726c', lineHeight: 1.6, marginBottom: 32 }}>
          You can permanently delete your Diamond IQ Baseball account and all associated data at any time, using either of the methods below.
        </p>

        <div style={{ backgroundColor: '#F0F7FF', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#042C53', marginBottom: 8 }}>
            Option 1 — In the app
          </h2>
          <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.7 }}>
            Open Diamond IQ Baseball, go to your <strong>Settings</strong> tab, and select <strong>Delete My Account</strong>. This immediately and permanently removes your account.
          </p>
        </div>

        <div style={{ backgroundColor: '#F8F8F7', borderRadius: 12, padding: 24, marginBottom: 32, border: '1px solid rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#042C53', marginBottom: 8 }}>
            Option 2 — Without the app
          </h2>
          <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.7, marginBottom: 12 }}>
            Email <a href="mailto:kelly@iqbio.io?subject=Account%20Deletion%20Request" style={{ color: '#185FA5', fontWeight: 600 }}>kelly@iqbio.io</a> from the email address associated with your account, with the subject line "Account Deletion Request." We'll process your request within 7 days and confirm by email once it's complete.
          </p>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#042C53', marginBottom: 12 }}>
          What gets deleted
        </h2>
        <ul style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.8, paddingLeft: 20, marginBottom: 24 }}>
          <li>Your profile information (name, email, photos, bio, and stats)</li>
          <li>Your posts, messages, and any content you've shared</li>
          <li>Your roster, team, and parent/player link associations</li>
        </ul>

        <p style={{ fontSize: 12, color: '#73726c', lineHeight: 1.6 }}>
          Deletion is permanent and cannot be undone. Some information may be retained where required by law, or where it's part of another user's own records (for example, a team's game log a coach recorded, which isn't solely your own data).
        </p>
      </div>
    </div>
  )
}
