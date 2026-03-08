import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import BottomNav from './components/BottomNav'
import Header from './components/Header'
import Home from './pages/Home'
import FindVet from './pages/FindVet'
import VetProfile from './pages/VetProfile'
import Booking from './pages/Booking'
import History from './pages/History'
import MyPage from './pages/MyPage'
import VetDashboard from './pages/VetDashboard'
import Auth from './pages/Auth'
import Legal from './pages/Legal'
import Admin from './pages/Admin'

// 獣医師専用ルートのガード
function VetRoute({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af' }}>読み込み中...</div>
  if (!user) return <Navigate to="/auth" replace />
  if (role !== 'vet') return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#264653', marginBottom: 8 }}>獣医師アカウント専用ページです</div>
      <div style={{ fontSize: '0.88rem', color: '#6b7280', marginBottom: 24 }}>このページは獣医師アカウントでログインした場合のみ閲覧できます。</div>
      <button className="btn-secondary" onClick={() => window.history.back()} style={{ width: 'auto', padding: '10px 24px' }}>戻る</button>
    </div>
  )
  return children
}

// ログイン済みユーザーのルートのガード（未ログインなら /auth へ）
function AuthRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af' }}>読み込み中...</div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppInner() {
  const { role, loading } = useAuth()
  const [userMode, setUserMode] = useState('owner')
  const location = useLocation()
  const navigate = useNavigate()

  // ログイン後、ロールに応じて自動切り替え
  useEffect(() => {
    if (!loading) {
      if (role === 'vet') setUserMode('vet')
      else setUserMode('owner')
    }
  }, [role, loading])

  // ヘッダーのタブ切り替え（獣医師タブは獣医師アカウントのみ）
  function handleSetUserMode(mode) {
    if (mode === 'vet' && role !== 'vet') {
      navigate('/auth')
      return
    }
    setUserMode(mode)
  }

  return (
    <>
      <Header userMode={userMode} setUserMode={handleSetUserMode} />
      <Routes>
        <Route path="/" element={
          userMode === 'vet'
            ? <VetRoute><VetDashboard /></VetRoute>
            : <Home />
        } />
        <Route path="/find" element={<FindVet />} />
        <Route path="/vet/:id" element={<VetProfile />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/history" element={<History />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav userMode={userMode} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}
