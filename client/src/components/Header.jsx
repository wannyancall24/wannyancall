import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

const titles = {
  '/': 'WanNyanCall24',
  '/find': '獣医師を探す',
  '/history': '相談履歴',
  '/mypage': 'マイページ',
  '/auth': 'ログイン / 会員登録',
}

export default function Header({ userMode, setUserMode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, role, loading, signOut } = useAuth()
  const isVetPage = location.pathname.startsWith('/vet/')
  const isBooking = location.pathname.startsWith('/booking/')
  const isResetPassword = location.pathname === '/reset-password'
  const title = isVetPage ? '獣医師プロフィール' : isBooking ? '予約・決済' : (titles[location.pathname] || 'WanNyanCall24')
  const showTabs = location.pathname === '/'

  async function handleSignOut() {
    await signOut()
    navigate('/auth', { replace: true })
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 8px rgba(42,157,143,0.08)'
    }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="logo" style={{ width: '1.4rem', height: '1.4rem', objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2a9d8f' }}>{title}</span>
        </div>
        {loading ? (
          <div style={{ width: 80 }} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isResetPassword && (
              <>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                  background: role === 'vet' ? '#e8f6f5' : '#f0f9f8',
                  color: '#2a9d8f'
                }}>
                  {role === 'vet' ? '🩺 獣医師' : '🐕 飼い主'}
                </span>
                <button onClick={handleSignOut} style={{
                  background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
                  padding: '4px 10px', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer'
                }}>
                  ログアウト
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <button onClick={() => navigate('/auth')} style={{
              background: '#2a9d8f', border: 'none', borderRadius: 8,
              padding: '6px 14px', fontSize: '0.82rem', color: '#fff', fontWeight: 700, cursor: 'pointer'
            }}>
              ログイン / 会員登録
            </button>
            <span style={{ fontSize: '0.62rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>登録不要ですぐ使える</span>
          </div>
        )}
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
