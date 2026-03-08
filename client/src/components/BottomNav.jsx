import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav({ userMode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const ownerItems = [
    { path: '/', icon: '🏠', label: 'ホーム' },
    { path: '/find', icon: '🔍', label: '獣医師を探す' },
    { path: '/history', icon: '📋', label: '相談履歴' },
    { path: '/mypage', icon: '👤', label: 'マイページ' },
  ]
  const vetItems = [
    { path: '/', icon: '🏠', label: 'ホーム' },
    { path: '/history', icon: '📋', label: '相談一覧' },
    { path: '/mypage', icon: '👤', label: 'マイページ' },
  ]

  const items = userMode === 'vet' ? vetItems : ownerItems

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: '#fff', borderTop: '1px solid #e5e7eb',
      display: 'flex', height: 64, zIndex: 100,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.07)'
    }}>
      {items.map((item) => {
        const active = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 2, border: 'none', background: 'none',
              cursor: 'pointer', padding: '8px 0'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
            <span style={{
              fontSize: '0.68rem', fontWeight: active ? 700 : 500,
              color: active ? '#2a9d8f' : '#9ca3af'
            }}>{item.label}</span>
            {active && (
              <div style={{
                position: 'absolute', bottom: 0, width: 32, height: 3,
                background: '#2a9d8f', borderRadius: '3px 3px 0 0'
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}
