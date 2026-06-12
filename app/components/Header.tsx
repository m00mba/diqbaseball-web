'use client'
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header style={{
      background: '#042C53',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    }}>
      <Link href="https://iqbio.io" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/icon.png"
          alt="Diamond IQ Baseball"
          width={36}
          height={36}
          style={{ borderRadius: 8 }}
        />
        <div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>Diamond IQ Baseball</div>
          <div style={{ color: '#9BC4E2', fontSize: 10, fontWeight: 500 }}>Verified Athlete Intelligence</div>
        </div>
      </Link>
    </header>
  )
}
