import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  const [userMode, setUserMode] = useState('owner') // 'owner' | 'vet'

  return (
    <BrowserRouter>
      <Header userMode={userMode} setUserMode={setUserMode} />
      <Routes>
        <Route path="/" element={userMode === 'owner' ? <Home /> : <VetDashboard />} />
        <Route path="/find" element={<FindVet />} />
        <Route path="/vet/:id" element={<VetProfile />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/history" element={<History />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav userMode={userMode} />
    </BrowserRouter>
  )
}
