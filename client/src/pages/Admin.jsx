import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'wannyan2024admin'
const STORAGE_KEY = 'vetApplication'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [applications, setApplications] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (authed) loadApplications()
  }, [authed])

  function loadApplications() {
    const all = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key === STORAGE_KEY || key.startsWith(STORAGE_KEY + '_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          if (data && data.status) {
            all.push({ key, ...data })
          }
        } catch {}
      }
    }
    // Also check the main key without suffix
    const main = localStorage.getItem(STORAGE_KEY)
    if (main) {
      try {
        const data = JSON.parse(main)
        if (data && data.status && !all.find(a => a.key === STORAGE_KEY)) {
          all.push({ key: STORAGE_KEY, ...data })
        }
      } catch {}
    }
    setApplications(all)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  function updateStatus(key, newStatus) {
    const raw = localStorage.getItem(key)
    if (!raw) return
    const data = JSON.parse(raw)
    data.status = newStatus
    data.reviewedAt = new Date().toISOString()
    localStorage.setItem(key, JSON.stringify(data))
    window.dispatchEvent(new Event('vetApplicationUpdated'))
    loadApplications()
    if (selected && selected.key === key) {
      setSelected({ ...selected, status: newStatus })
    }
  }

  const statusLabel = {
    pending: { text: '審査中', bg: '#fff8e1', color: '#f59e0b' },
    approved: { text: '承認済み', bg: '#e8f5e9', color: '#22c55e' },
    rejected: { text: '否認', bg: '#fce4ec', color: '#e05555' },
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fffe', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(42,157,143,0.12)', padding: '40px 32px', width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#264653' }}>管理者ページ</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 6 }}>WanNyanCall24 Admin</div>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>パスワード</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(false) }}
                style={{ width: '100%', border: `1.5px solid ${pwError ? '#e05555' : '#e5e7eb'}`, borderRadius: 8, padding: '12px 14px', fontSize: '1rem', outline: 'none' }}
                placeholder="管理者パスワードを入力"
                autoFocus
              />
              {pwError && <div style={{ color: '#e05555', fontSize: '0.82rem', marginTop: 6 }}>パスワードが違います</div>}
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>ログイン</button>
          </form>
        </div>
      </div>
    )
  }

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fffe', padding: '20px 16px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#264653' }}>🐾 管理者ダッシュボード</div>
          <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>獣医師登録審査</div>
        </div>
        <button onClick={() => { setAuthed(false); setPw('') }} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: '0.85rem', color: '#6b7280', cursor: 'pointer' }}>
          ログアウト
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
        {[
          { label: '全件', count: counts.all, color: '#2a9d8f' },
          { label: '審査中', count: counts.pending, color: '#f59e0b' },
          { label: '承認済', count: counts.approved, color: '#22c55e' },
          { label: '否認', count: counts.rejected, color: '#e05555' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(42,157,143,0.08)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Refresh */}
      <button onClick={loadApplications} style={{ background: 'none', border: '1.5px solid #2a9d8f', borderRadius: 8, padding: '6px 14px', fontSize: '0.85rem', color: '#2a9d8f', cursor: 'pointer', marginBottom: 16 }}>
        ↻ 更新
      </button>

      {/* Application list */}
      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div>申請はまだありません</div>
          <div style={{ fontSize: '0.82rem', marginTop: 6 }}>獣医師が登録申請すると、ここに表示されます</div>
        </div>
      ) : (
        <div>
          {applications.map(app => {
            const s = statusLabel[app.status] || statusLabel.pending
            return (
              <div key={app.key} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#264653' }}>
                      {app.lastName || '—'} {app.firstName || ''}
                    </div>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 700 }}>{s.text}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'grid', gap: 4 }}>
                    <div>📧 {app.email || '—'}</div>
                    <div>📞 {app.phone || '—'}</div>
                    <div>🏥 {app.workplace || '—'}</div>
                    <div>📅 申請日: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('ja-JP') : '—'}</div>
                    {app.reviewedAt && <div>✅ 審査日: {new Date(app.reviewedAt).toLocaleDateString('ja-JP')}</div>}
                  </div>

                  {/* Detail toggle */}
                  <button
                    onClick={() => setSelected(selected?.key === app.key ? null : app)}
                    style={{ marginTop: 12, background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', color: '#6b7280', cursor: 'pointer', width: '100%' }}
                  >
                    {selected?.key === app.key ? '▲ 詳細を閉じる' : '▼ 詳細を見る'}
                  </button>
                </div>

                {/* Detail panel */}
                {selected?.key === app.key && (
                  <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 20px', background: '#fafafa' }}>
                    {/* License image */}
                    {app.licenseImage && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 8 }}>獣医師免許証</div>
                        <img src={app.licenseImage} alt="免許証" style={{ width: '100%', borderRadius: 10, border: '1px solid #e5e7eb', maxHeight: 260, objectFit: 'contain', background: '#fff' }} />
                      </div>
                    )}

                    {/* Career */}
                    {app.career && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>経歴</div>
                        <div style={{ fontSize: '0.85rem', color: '#374151', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{app.career}</div>
                      </div>
                    )}

                    {/* Specialties */}
                    {app.specialties && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>専門分野</div>
                        <div style={{ fontSize: '0.85rem', color: '#374151' }}>{app.specialties}</div>
                      </div>
                    )}

                    {/* License number */}
                    {app.licenseNumber && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 4 }}>免許番号</div>
                        <div style={{ fontSize: '0.85rem', color: '#374151' }}>{app.licenseNumber}</div>
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === 'pending' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                        <button
                          onClick={() => updateStatus(app.key, 'approved')}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                        >
                          ✓ 承認
                        </button>
                        <button
                          onClick={() => updateStatus(app.key, 'rejected')}
                          style={{ background: '#e05555', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                        >
                          ✗ 否認
                        </button>
                      </div>
                    )}
                    {app.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(app.key, 'rejected')}
                        style={{ background: '#e05555', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}
                      >
                        承認を取り消す
                      </button>
                    )}
                    {app.status === 'rejected' && (
                      <button
                        onClick={() => updateStatus(app.key, 'approved')}
                        style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}
                      >
                        承認に変更する
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
