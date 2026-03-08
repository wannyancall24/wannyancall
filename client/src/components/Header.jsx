import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'WanNyanCall24',
  '/find': '獣医師を探す',
  '/history': '相談履歴',
  '/mypage': 'マイページ',
  '/auth': 'ログイン / 会員登録',
}

export default function Header({ userMode, setUserMode }) {
  const location = useLocation()
  const isVetPage = location.pathname.startsWith('/vet/')
  const isBooking = location.pathname.startsWith('/booking/')
  const title = isVetPage ? '獣医師プロフィール' : isBooking ? '予約・決済' : (titles[location.pathname] || 'WanNyanCall24')
  const showTabs = location.pathname === '/'

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 8px rgba(42,157,143,0.08)'
    }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.4rem' }}>🐾</span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2a9d8f' }}>{title}</span>
        </div>
        <button style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>👤</button>
      </div>
      {showTabs && (
        <div style={{ display: 'flex', padding: '0 16px 12px', gap: 8 }}>
          <button
            onClick={() => setUserMode('owner')}
            style={{
              flex: 1, padding: '8px', borderRadius: 50, border: 'none', cursor: 'pointer',
              background: userMode === 'owner' ? '#2a9d8f' : '#e8f6f5',
              color: userMode === 'owner' ? '#fff' : '#2a9d8f',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s'
            }}
          >🐕 飼い主向け</button>
          <button
            onClick={() => setUserMode('vet')}
            style={{
              flex: 1, padding: '8px', borderRadius: 50, border: 'none', cursor: 'pointer',
              background: userMode === 'vet' ? '#2a9d8f' : '#e8f6f5',
              color: userMode === 'vet' ? '#fff' : '#2a9d8f',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s'
            }}
          >🩺 獣医師向け</button>
        </div>
      )}
    </header>
  )
}
