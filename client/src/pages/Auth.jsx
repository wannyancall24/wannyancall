import { useState, useEffect } from 'react'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'reset'
  const [userType, setUserType] = useState('owner')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const { user, role } = useAuth()

  // ログイン済みなら自動リダイレクト（roleがnullでもリダイレクト）
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません')
      return
    }
    // onAuthStateChange → user更新 → useEffectでリダイレクト
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }
    setLoading(true)

    // Supabase Auth でユーザー作成
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    // profiles テーブルにロール保存
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, role: userType, name })
      if (profileError) {
        setLoading(false)
        setError('プロフィール作成に失敗しました。もう一度お試しください。')
        return
      }
    }

    setLoading(false)
    setMessage('確認メールを送信しました。メールを確認してください。')
  }

  const handleGoogleLogin = async () => {
    setError('')
    // Googleログイン時はロールを後で設定する必要があるため、
    // 現在はメール/パスワード認証のみ対応
    setError('現在はメール/パスワードでの登録のみ対応しています。')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('メールアドレスを入力してください')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    })
    setLoading(false)
    if (error) {
      setError('送信に失敗しました。メールアドレスを確認してください。')
    } else {
      setMessage('パスワードリセット用のメールを送信しました。メールをご確認ください。')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fffe', paddingBottom: 80 }}>
      {/* Top gradient */}
      <div style={{
        background: 'linear-gradient(150deg, #2a9d8f 0%, #21867a 100%)',
        padding: '14px 20px 28px', textAlign: 'center', color: '#fff',
        clipPath: 'ellipse(120% 100% at 50% 0%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: '1.4rem' }}>🐾</span>
          <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>WanNyanCall24</span>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: -12 }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(42,157,143,0.12)', padding: '24px 20px' }}>

          {/* Login / Register Tabs */}
          {mode !== 'reset' && (
            <div style={{ display: 'flex', background: '#e8f6f5', borderRadius: 50, padding: 4, marginBottom: 20 }}>
              {[{ key: 'login', label: 'ログイン' }, { key: 'register', label: '会員登録' }].map(m => (
                <button key={m.key} onClick={() => { setMode(m.key); setError(''); setMessage('') }} style={{
                  flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
                  background: mode === m.key ? '#2a9d8f' : 'transparent',
                  color: mode === m.key ? '#fff' : '#2a9d8f',
                }}>{m.label}</button>
              ))}
            </div>
          )}

          {/* ── パスワードリセット画面 ── */}
          {mode === 'reset' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🔑</div>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#264653', marginBottom: 6 }}>パスワードをお忘れですか？</h2>
                <p style={{ fontSize: '0.84rem', color: '#6b7280', lineHeight: 1.7 }}>
                  登録済みのメールアドレスを入力してください。<br />パスワード再設定用のリンクをお送りします。
                </p>
              </div>

              {error && (
                <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>{error}</div>
              )}
              {message ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ background: '#e8f6f5', borderRadius: 12, padding: '16px 14px', marginBottom: 20, fontSize: '0.88rem', color: '#2a9d8f', fontWeight: 600, lineHeight: 1.7 }}>
                    ✅ {message}
                  </div>
                  <button
                    onClick={() => { setMode('login'); setError(''); setMessage(''); setEmail('') }}
                    className="btn-secondary"
                    style={{ marginTop: 4 }}
                  >ログイン画面に戻る</button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label className="form-label">メールアドレス</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {loading && (
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    )}
                    {loading ? '送信中...' : 'リセットメールを送信する'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setMessage('') }}
                    style={{ width: '100%', marginTop: 12, padding: '12px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600 }}
                  >← ログイン画面に戻る</button>
                </form>
              )}
            </>
          )}

          {/* User Type Toggle */}
          {mode !== 'reset' && <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>アカウント種別</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { key: 'owner', icon: '🐕', label: '飼い主', sub: 'ペットの相談をする' },
                { key: 'vet', icon: '🩺', label: '獣医師', sub: '相談を受け付ける' },
              ].map(t => (
                <button key={t.key} onClick={() => setUserType(t.key)} style={{
                  flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.88rem', transition: 'all 0.15s',
                  border: userType === t.key ? '2px solid #2a9d8f' : '2px solid #e5e7eb',
                  background: userType === t.key ? '#e8f6f5' : '#fff',
                  color: userType === t.key ? '#2a9d8f' : '#6b7280',
                }}>
                  <span style={{ fontSize: '1.1rem', filter: 'saturate(2) brightness(0.85)' }}>{t.icon}</span>
                  {' '}{t.label}
                  {userType === t.key && <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 2 }}>{t.sub}</div>}
                </button>
              ))}
            </div>
          </div>}

          {/* Google Login */}
          {mode !== 'reset' && <button onClick={handleGoogleLogin} style={{
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
          </button>}

          {mode !== 'reset' && <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>または</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>}

          {/* Error / Message (login/register) */}
          {mode !== 'reset' && error && (
            <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
              {error}
            </div>
          )}
          {mode !== 'reset' && message && (
            <div style={{ background: '#e8f6f5', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#2a9d8f', fontWeight: 600 }}>
              {message}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">メールアドレス</label>
                <input className="form-input" type="email" placeholder="example@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">パスワード</label>
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              <p onClick={() => { setMode('reset'); setError(''); setMessage('') }} style={{ textAlign: 'right', color: '#2a9d8f', fontSize: '0.82rem', marginBottom: 20, cursor: 'pointer', fontWeight: 600 }}>
                パスワードを忘れた方はこちら
              </p>
              <button type="submit" className="btn-primary" disabled={loading} style={{
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {loading && (
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                )}
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">お名前{userType === 'vet' ? '（本名）' : ''}</label>
                <input className="form-input" type="text" placeholder={userType === 'vet' ? '田中 健一' : '山田 花子'}
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">メールアドレス</label>
                <input className="form-input" type="email" placeholder="example@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">パスワード（8文字以上）</label>
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: 36, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">パスワード（確認）</label>
                <input className="form-input" type="password" placeholder="もう一度入力"
                  value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
              </div>

              {userType === 'vet' && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, fontSize: '0.83rem', color: '#92400e' }}>
                  ⚠️ 獣医師登録は登録後にダッシュボードから免許証を提出し、審査を経て承認されます（1〜3営業日）。
                </div>
              )}

              <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 16, lineHeight: 1.7 }}>
                登録することで
                <span style={{ color: '#2a9d8f', cursor: 'pointer' }}>利用規約</span>・
                <span style={{ color: '#2a9d8f', cursor: 'pointer' }}>プライバシーポリシー</span>
                に同意したものとみなします。
              </p>
              <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? '登録中...' : userType === 'vet' ? '獣医師として登録する' : '会員登録する'}
              </button>
            </form>
          )}
        </div>

        {mode !== 'reset' && (
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', marginTop: 20 }}>
            {mode === 'login' ? 'アカウントをお持ちでない方は' : 'すでにアカウントをお持ちの方は'}
            <span style={{ color: '#2a9d8f', fontWeight: 700, cursor: 'pointer', marginLeft: 4 }}
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage('') }}>
              {mode === 'login' ? '会員登録' : 'ログイン'}
            </span>
          </p>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#2a9d8f', color: '#fff', padding: '12px 24px', borderRadius: 50,
          fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(42,157,143,0.4)',
          zIndex: 9999, animation: 'toastIn 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>&#10003;</span> {toast}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
