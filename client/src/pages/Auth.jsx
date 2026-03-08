import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [mode, setMode] = useState('login')       // 'login' | 'register'
  const [userType, setUserType] = useState('owner') // 'owner' | 'vet'
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = () => navigate('/')

  return (
    <div style={{ minHeight: '100vh', background: '#f8fffe', paddingBottom: 80 }}>
      {/* Top gradient */}
      <div style={{
        background: 'linear-gradient(150deg, #2a9d8f 0%, #21867a 100%)',
        padding: '40px 20px 60px', textAlign: 'center', color: '#fff',
        clipPath: 'ellipse(120% 100% at 50% 0%)',
      }}>
        <div style={{ fontSize: '3.2rem', marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 }}>WanNyanCall24</h1>
        <p style={{ opacity: 0.85, fontSize: '0.88rem' }}>深夜でも、田舎でも獣医師に相談できる</p>
      </div>

      <div style={{ padding: '0 20px', marginTop: -24 }}>
        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(42,157,143,0.12)',
          padding: '24px 20px',
        }}>
          {/* Login / Register Tabs */}
          <div style={{ display: 'flex', background: '#e8f6f5', borderRadius: 50, padding: 4, marginBottom: 20 }}>
            {[
              { key: 'login', label: 'ログイン' },
              { key: 'register', label: '会員登録' },
            ].map(m => (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
                background: mode === m.key ? '#2a9d8f' : 'transparent',
                color: mode === m.key ? '#fff' : '#2a9d8f',
              }}>{m.label}</button>
            ))}
          </div>

          {/* User Type Toggle */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>アカウント種別</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setUserType('owner')} style={{
                flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer', fontWeight: 700,
                fontSize: '0.88rem', transition: 'all 0.15s',
                border: userType === 'owner' ? '2px solid #2a9d8f' : '2px solid #e5e7eb',
                background: userType === 'owner' ? '#e8f6f5' : '#fff',
                color: userType === 'owner' ? '#2a9d8f' : '#9ca3af',
              }}>
                🐕 飼い主
                {userType === 'owner' && <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 2 }}>ペットの相談をする</div>}
              </button>
              <button onClick={() => setUserType('vet')} style={{
                flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer', fontWeight: 700,
                fontSize: '0.88rem', transition: 'all 0.15s',
                border: userType === 'vet' ? '2px solid #2a9d8f' : '2px solid #e5e7eb',
                background: userType === 'vet' ? '#e8f6f5' : '#fff',
                color: userType === 'vet' ? '#2a9d8f' : '#9ca3af',
              }}>
                🩺 獣医師
                {userType === 'vet' && <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 2 }}>相談を受け付ける</div>}
              </button>
            </div>
          </div>

          {/* Google Login */}
          <button style={{
            width: '100%', padding: '13px', borderRadius: 50,
            border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.92rem', color: '#264653',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 16,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Googleで{mode === 'login' ? 'ログイン' : '登録'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>または</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <>
              <div className="form-group">
                <label className="form-label">メールアドレス</label>
                <input className="form-input" type="email" placeholder="example@email.com" />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">パスワード</label>
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" />
                <button
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#9ca3af' }}
                >{showPass ? '🙈' : '👁'}</button>
              </div>
              <p style={{ textAlign: 'right', color: '#2a9d8f', fontSize: '0.82rem', marginBottom: 20, cursor: 'pointer', fontWeight: 600 }}>
                パスワードをお忘れですか？
              </p>
              <button className="btn-primary" onClick={handleSubmit}>ログイン</button>

              {userType === 'vet' && (
                <div style={{ marginTop: 14, padding: '12px', background: '#e8f6f5', borderRadius: 10, fontSize: '0.83rem', color: '#2a9d8f', textAlign: 'center' }}>
                  🩺 獣医師アカウントは審査制です。<br />登録後に運営が確認のご連絡をします。
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">お名前{userType === 'vet' ? '（本名）' : ''}</label>
                <input className="form-input" type="text" placeholder={userType === 'vet' ? '田中 健一' : '山田 花子'} />
              </div>
              <div className="form-group">
                <label className="form-label">メールアドレス</label>
                <input className="form-input" type="email" placeholder="example@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">電話番号</label>
                <input className="form-input" type="tel" placeholder="090-XXXX-XXXX" />
              </div>
              {userType === 'vet' && (
                <div className="form-group">
                  <label className="form-label">獣医師免許番号</label>
                  <input className="form-input" type="text" placeholder="第XXXXX号" />
                </div>
              )}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">パスワード（8文字以上）</label>
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" />
                <button
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: 36, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#9ca3af' }}
                >{showPass ? '🙈' : '👁'}</button>
              </div>
              <div className="form-group">
                <label className="form-label">パスワード（確認）</label>
                <input className="form-input" type="password" placeholder="もう一度入力" />
              </div>

              {userType === 'vet' && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, fontSize: '0.83rem', color: '#92400e' }}>
                  ⚠️ 獣医師登録は免許番号の確認後、審査を経て承認されます（1〜3営業日）。
                </div>
              )}

              <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16, lineHeight: 1.7 }}>
                登録することで
                <span style={{ color: '#2a9d8f', cursor: 'pointer' }}>利用規約</span>・
                <span style={{ color: '#2a9d8f', cursor: 'pointer' }}>プライバシーポリシー</span>
                に同意したものとみなします。
              </p>
              <button className="btn-primary" onClick={handleSubmit}>
                {userType === 'vet' ? '獣医師として登録申請する' : '会員登録する'}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: 20 }}>
          {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
          <span
            style={{ color: '#2a9d8f', fontWeight: 700, cursor: 'pointer', marginLeft: 4 }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? '会員登録' : 'ログイン'}
          </span>
        </p>
      </div>
    </div>
  )
}
