import { useState, useEffect } from 'react'

const ADMIN_PASSWORD = 'wannyan2024admin'
const STORAGE_KEY = 'vetApplication'
const REPORTS_KEY = 'userReports'
const BANNED_KEY = 'bannedUsers'

function loadReports() {
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY)) || [] } catch { return [] }
}
function loadBanned() {
  try { return JSON.parse(localStorage.getItem(BANNED_KEY)) || [] } catch { return [] }
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [activeTab, setActiveTab] = useState('applications')
  const [applications, setApplications] = useState([])
  const [selected, setSelected] = useState(null)
  const [reports, setReports] = useState([])
  const [banned, setBanned] = useState([])
  const [banTarget, setBanTarget] = useState('')
  const [banReason, setBanReason] = useState('')

  useEffect(() => {
    if (authed) {
      loadApplications()
      setReports(loadReports())
      setBanned(loadBanned())
    }
  }, [authed])

  useEffect(() => {
    const handler = () => { setReports(loadReports()); setBanned(loadBanned()) }
    window.addEventListener('reportUpdated', handler)
    return () => window.removeEventListener('reportUpdated', handler)
  }, [])

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: '申請全件', count: counts.all, color: '#2a9d8f' },
          { label: '審査中', count: counts.pending, color: '#f59e0b' },
          { label: '通報', count: reports.filter(r => r.status === 'pending').length, color: '#e05555' },
          { label: '停止中', count: banned.length, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(42,157,143,0.08)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        {[
          { key: 'applications', label: '獣医師審査' },
          { key: 'reports', label: `通報${reports.filter(r=>r.status==='pending').length > 0 ? ` (${reports.filter(r=>r.status==='pending').length})` : ''}` },
          { key: 'users', label: 'ユーザー管理' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
            background: 'none', whiteSpace: 'nowrap',
            color: activeTab === t.key ? '#2a9d8f' : '#9ca3af',
            borderBottom: activeTab === t.key ? '2px solid #2a9d8f' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Refresh */}
      <button onClick={() => { loadApplications(); setReports(loadReports()); setBanned(loadBanned()) }}
        style={{ background: 'none', border: '1.5px solid #2a9d8f', borderRadius: 8, padding: '6px 14px', fontSize: '0.85rem', color: '#2a9d8f', cursor: 'pointer', marginBottom: 16 }}>
        ↻ 更新
      </button>

      {/* Reports tab */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <div>通報はありません</div>
            </div>
          ) : (
            reports.slice().reverse().map((r, i) => {
              const isPending = r.status === 'pending'
              return (
                <div key={r.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', marginBottom: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653' }}>
                      🚨 {r.targetName}（{r.targetType === 'vet' ? '獣医師' : '飼い主'}）
                    </div>
                    <span style={{
                      background: isPending ? '#fee2e2' : '#e8f6f5',
                      color: isPending ? '#e05555' : '#2a9d8f',
                      padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0
                    }}>{isPending ? '未対応' : '対応済み'}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: 4 }}>
                    <strong>理由：</strong>{r.reason}
                  </div>
                  {r.detail && (
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', background: '#f9fafb', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                      {r.detail}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: isPending ? 10 : 0 }}>
                    {new Date(r.timestamp).toLocaleString('ja-JP')}
                  </div>
                  {isPending && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        onClick={() => {
                          const updated = reports.map(rep => rep.id === r.id ? { ...rep, status: 'reviewed' } : rep)
                          localStorage.setItem(REPORTS_KEY, JSON.stringify(updated))
                          setReports(updated)
                        }}
                        style={{ background: '#e8f6f5', color: '#2a9d8f', border: 'none', borderRadius: 8, padding: '9px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                      >対応済みにする</button>
                      <button
                        onClick={() => {
                          setBanTarget(r.targetName)
                          setActiveTab('users')
                        }}
                        style={{ background: '#264653', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
                      >ユーザー停止へ</button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div>
          {/* Ban form */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', padding: '16px 20px', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 12 }}>⛔ ユーザーを強制停止</h3>
            <div className="form-group">
              <label className="form-label">ユーザー名・メールアドレス</label>
              <input className="form-input" type="text" placeholder="例：田中 健一 / vet@example.com"
                value={banTarget} onChange={e => setBanTarget(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">停止理由</label>
              <input className="form-input" type="text" placeholder="例：利用規約違反・通報対応"
                value={banReason} onChange={e => setBanReason(e.target.value)} />
            </div>
            <button
              onClick={() => {
                if (!banTarget.trim()) return
                const entry = { id: Date.now(), userName: banTarget.trim(), reason: banReason.trim() || '—', bannedAt: new Date().toISOString() }
                const updated = [...loadBanned(), entry]
                localStorage.setItem(BANNED_KEY, JSON.stringify(updated))
                setBanned(updated)
                setBanTarget('')
                setBanReason('')
              }}
              style={{ background: '#264653', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', width: '100%', fontWeight: 700, cursor: 'pointer' }}
            >停止する</button>
          </div>

          {/* Banned list */}
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 10 }}>停止中ユーザー一覧</h3>
          {banned.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#9ca3af', fontSize: '0.85rem' }}>停止中のユーザーはいません</div>
          ) : (
            banned.slice().reverse().map(b => (
              <div key={b.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '14px 16px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#264653' }}>⛔ {b.userName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>理由：{b.reason}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{new Date(b.bannedAt).toLocaleString('ja-JP')}</div>
                </div>
                <button
                  onClick={() => {
                    const updated = banned.filter(u => u.id !== b.id)
                    localStorage.setItem(BANNED_KEY, JSON.stringify(updated))
                    setBanned(updated)
                  }}
                  style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer', flexShrink: 0 }}
                >停止解除</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Application list */}
      {activeTab === 'applications' && (applications.length === 0 ? (
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
      ))}
    </div>
  )
}
