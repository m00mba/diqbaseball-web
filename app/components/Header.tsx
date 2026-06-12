'use client'
import Link from 'next/link'

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
      <a href="https://iqbio.io" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/icon.png"
          alt="Diamond IQ Baseball"
          width={36}
          height={36}
          style={{ borderRadius: 8 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', lineHeight: 1 }}>Diamond IQ</span>
          <span style={{
            color: '#C9A227',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: '1px solid #C9A227',
            padding: '1px 5px',
            borderRadius: 3,
            alignSelf: 'flex-start',
            lineHeight: 1.4,
          }}>Baseball</span>
        </div>
      </a>
    </header>
  )
}
