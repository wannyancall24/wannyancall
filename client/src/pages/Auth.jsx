import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const navigate = useNavigate()

  return (
    <div className="page" style={{ padding: '0 20px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1.5rem' }}>WanNyanCall24</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>深夜でも、田舎でも獣医師に相談できる</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#e8f6f5', borderRadius: 50, padding: 4, marginBottom: 24 }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '10px', borderRadius: 50, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
            background: mode === m ? '#2a9d8f' : 'transparent',
            color: mode === m ? '#fff' : '#2a9d8f'
          }}>{m === 'login' ? 'ログイン' : '会員登録'}</button>
        ))}
      </div>

      {mode === 'login' ? (
        <>
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input className="form-input" type="email" placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード</label>
            <input className="form-input" type="password" placeholder="••••••••" />
          </div>
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('/')}>ログイン</button>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginTop: 16, cursor: 'pointer' }}>パスワードをお忘れですか？</p>
        </>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">お名前</label>
            <input className="form-input" type="text" placeholder="山田 花子" />
          </div>
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input className="form-input" type="email" placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">電話番号</label>
            <input className="form-input" type="tel" placeholder="090-XXXX-XXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード</label>
            <input className="form-input" type="password" placeholder="8文字以上" />
          </div>
          <div className="form-group">
            <label className="form-label">パスワード（確認）</label>
            <input className="form-input" type="password" placeholder="もう一度入力" />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 }}>
            登録することで<span style={{ color: '#2a9d8f' }}>利用規約</span>・<span style={{ color: '#2a9d8f' }}>プライバシーポリシー</span>に同意したものとみなします。
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>会員登録する</button>
        </>
      )}

      <div className="divider" />

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 12 }}>または</p>
        <button style={{ width: '100%', padding: '12px', borderRadius: 50, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span>G</span> Googleで{mode === 'login' ? 'ログイン' : '登録'}
        </button>
      </div>
    </div>
  )
}
