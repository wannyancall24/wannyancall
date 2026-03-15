import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ResetPassword() {
  const { loading, recoveryMode, clearRecoveryMode, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
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
    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    clearRecoveryMode()
    setDone(true)
    setTimeout(async () => {
      await signOut()
      navigate('/auth', { replace: true })
    }, 2000)
  }

  // Still waiting for auth to initialize
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af' }}>
        読み込み中...
      </div>
    )
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

          {/* Invalid / expired link */}
          {!recoveryMode && !done && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#264653', marginBottom: 10 }}>
                リンクが無効または期限切れです
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
                パスワードリセットのリンクが無効または期限切れです。<br />
                もう一度パスワードリセットをリクエストしてください。
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary"
                style={{ maxWidth: 280, margin: '0 auto', display: 'block' }}
              >
                ログイン画面へ戻る
              </button>
            </div>
          )}

          {/* Success state */}
          {done && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#2a9d8f', marginBottom: 10 }}>
                パスワードを変更しました
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
                新しいパスワードでログインしてください。
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="btn-primary"
                style={{ maxWidth: 280, margin: '0 auto', display: 'block' }}
              >
                ログイン画面へ
              </button>
            </div>
          )}

          {/* New password form */}
          {recoveryMode && !done && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🔑</div>
                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#264653', marginBottom: 6 }}>
                  新しいパスワードを設定
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#6b7280', lineHeight: 1.7 }}>
                  8文字以上の新しいパスワードを入力してください。
                </p>
              </div>

              {error && (
                <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">新しいパスワード（8文字以上）</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">パスワード（確認）</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="もう一度入力"
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {submitting && (
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                  )}
                  {submitting ? '変更中...' : 'パスワードを変更する'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
