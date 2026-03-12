import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ADMIN_PASSWORD = 'wannyan2024admin'
const STORAGE_KEY = 'vetApplication'
const EMAIL_LOG_KEY = 'emailCampaignLog'
const EMAIL_SETTINGS_KEY = 'emailCampaignSettings'

const DEFAULT_TEMPLATE_HTML = `<div style="font-family:-apple-system,'Hiragino Sans','Noto Sans JP','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;line-height:1.7;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:2.5rem;">🐾</div>
    <h1 style="color:#2a9d8f;font-size:1.4rem;margin:8px 0;">WanNyanCall24 獣医師パートナーご招待</h1>
  </div>

  <p>{{clinicName}} {{name}} 先生</p>

  <p>突然のご連絡失礼いたします。<br>
  私どもは、ペットオーナーと獣医師をオンラインでつなぐ獣医師遠隔相談サービス<strong>「WanNyanCall24」</strong>を運営しております。</p>

  <div style="background:#e8f6f5;border-radius:12px;padding:16px;margin:20px 0;">
    <h3 style="color:#2a9d8f;margin:0 0 12px;">📋 サービスの特長</h3>
    <ul style="margin:0;padding-left:20px;line-height:2;">
      <li>スキマ時間を活用して副業収入を獲得</li>
      <li>在宅でのオンライン相談対応（スマホ・パソコン対応）</li>
      <li>１相談あたり1,500円〜（相談料3,000円の50％）</li>
      <li>夜間・深夜加算あり、指名料は全額獣医師へ</li>
      <li>登録・月額費用 <strong>完全無料</strong></li>
    </ul>
  </div>

  <p>先生のご専門知識を活かし、深夜に困るペットオーナーのお役に立てればと思いご連絡いたしました。</p>
  <p>ご興味をお持ちいただけましたら、下記よりご登録をお願いいたします。</p>

  <div style="text-align:center;margin:28px 0;">
    <a href="https://wannyancall24.com/vet-recruit" style="background:#2a9d8f;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">
      無料で獣医師登録する
    </a>
  </div>

  <p style="font-size:0.85rem;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">
    このメールにお心当たりのない場合は、お手数ですが破棄いただきますようお願い申し上げます。<br>
    WanNyanCall24 運営事務局
  </p>
  <p style="font-size:0.82rem;color:#9ca3af;margin-top:8px;">
    ※ 本メールの配信停止をご希望の場合は、wannyancall24@gmail.comまでご連絡ください。
  </p>
</div>`

function loadEmailLog() {
  try { return JSON.parse(localStorage.getItem(EMAIL_LOG_KEY)) || [] } catch { return [] }
}
function loadEmailSettings() {
  try {
    return JSON.parse(localStorage.getItem(EMAIL_SETTINGS_KEY)) || {
      apiKey: '',
      from: 'WanNyanCall24 <onboarding@resend.dev>',
      subject: '【WanNyanCall24】獣医師パートナー募集のご案内',
      templateHtml: DEFAULT_TEMPLATE_HTML,
    }
  } catch {
    return {
      apiKey: '',
      from: 'WanNyanCall24 <onboarding@resend.dev>',
      subject: '【WanNyanCall24】獣医師パートナー募集のご案内',
      templateHtml: DEFAULT_TEMPLATE_HTML,
    }
  }
}

// CSVテキストをパース → [{name, email, clinicName}]
function parseCsv(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return []

  // ヘッダー行を検出
  const firstLine = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
  const headers = firstLine.map(h => h.toLowerCase())
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('名前') || h.includes('氏名') || h.includes('担当'))
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('メール') || h.includes('mail'))
  const clinicIdx = headers.findIndex(h => h.includes('clinic') || h.includes('hospital') || h.includes('病院') || h.includes('医院') || h.includes('クリニック'))

  const hasHeader = emailIdx !== -1
  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines.map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    if (hasHeader) {
      return {
        name: nameIdx !== -1 ? (cols[nameIdx] || '') : '',
        email: emailIdx !== -1 ? (cols[emailIdx] || '') : (cols[0] || ''),
        clinicName: clinicIdx !== -1 ? (cols[clinicIdx] || '') : '',
      }
    } else {
      // ヘッダーなし: email,name,clinicName の順と仮定
      return { email: cols[0] || '', name: cols[1] || '', clinicName: cols[2] || '' }
    }
  }).filter(r => r.email && r.email.includes('@'))
}

export default function Admin() {
  const navigate = useNavigate()
  const { user, isAdmin, loading: authLoading } = useAuth()

  // パスワード認証（isAdmin=falseのときのフォールバック）
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const [activeTab, setActiveTab] = useState('applications')

  // applications tab
  const [applications, setApplications] = useState([])
  const [selected, setSelected] = useState(null)

  // chats tab
  const [chatRooms, setChatRooms] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [roomMessages, setRoomMessages] = useState({})
  const [forceCompleting, setForceCompleting] = useState(null)

  // reports tab
  const [dbReports, setDbReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportNote, setReportNote] = useState({})
  const [updatingReport, setUpdatingReport] = useState(null)

  // users tab
  const [dbUsers, setDbUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)
  const [blockingUser, setBlockingUser] = useState(null)

  // 営業メール関連
  const [emailSettings, setEmailSettings] = useState(loadEmailSettings())
  const [recipients, setRecipients] = useState([])
  const [csvText, setCsvText] = useState('')
  const [csvError, setCsvError] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [emailLog, setEmailLog] = useState(loadEmailLog())
  const [emailSubTab, setEmailSubTab] = useState('compose') // compose | log | help
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const fileInputRef = useRef(null)

  const isFullyAuthed = isAdmin || authed

  // Redirect to auth if no user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth')
    }
  }, [authLoading, user, navigate])

  // Load data when fully authed
  useEffect(() => {
    if (isFullyAuthed) {
      loadApplications()
      setEmailLog(loadEmailLog())
      setEmailSettings(loadEmailSettings())
    }
  }, [isFullyAuthed])

  useEffect(() => {
    if (isFullyAuthed && activeTab === 'chats') fetchChats()
  }, [isFullyAuthed, activeTab])

  useEffect(() => {
    if (isFullyAuthed && activeTab === 'reports') fetchReports()
  }, [isFullyAuthed, activeTab])

  useEffect(() => {
    if (isFullyAuthed && activeTab === 'users') fetchUsers()
  }, [isFullyAuthed, activeTab])

  // ── Applications (localStorage) ──
  function loadApplications() {
    const all = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key === STORAGE_KEY || key.startsWith(STORAGE_KEY + '_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          if (data && data.status) all.push({ key, ...data })
        } catch {}
      }
    }
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

  function updateStatus(key, newStatus) {
    const raw = localStorage.getItem(key)
    if (!raw) return
    const data = JSON.parse(raw)
    data.status = newStatus
    data.reviewedAt = new Date().toISOString()
    localStorage.setItem(key, JSON.stringify(data))
    window.dispatchEvent(new Event('vetApplicationUpdated'))
    loadApplications()
    if (selected && selected.key === key) setSelected({ ...selected, status: newStatus })
  }

  // ── Chats (Supabase) ──
  async function fetchChats() {
    setChatLoading(true)
    const { data } = await supabase
      .from('chat_rooms')
      .select('id,status,created_at,completed_at,total_amount,user_id,vet_id,vets(name),profiles(name)')
      .order('created_at', { ascending: false })
      .limit(50)
    setChatRooms(data || [])
    setChatLoading(false)
  }

  async function fetchRoomMessages(roomId) {
    if (roomMessages[roomId]) return
    const { data } = await supabase
      .from('messages')
      .select('id,sender_id,sender_role,content,created_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
    setRoomMessages(prev => ({ ...prev, [roomId]: data || [] }))
  }

  async function handleForceComplete(roomId) {
    if (!confirm('このチャットを強制終了しますか？')) return
    setForceCompleting(roomId)
    await supabase.rpc('admin_force_complete', { room_id: roomId })
    setForceCompleting(null)
    fetchChats()
  }

  // ── Reports (Supabase) ──
  async function fetchReports() {
    setReportsLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    setDbReports(data || [])
    setReportsLoading(false)
  }

  async function updateReportStatus(id, status) {
    setUpdatingReport(id)
    await supabase
      .from('reports')
      .update({ status, admin_note: reportNote[id] || null, updated_at: new Date().toISOString() })
      .eq('id', id)
    setUpdatingReport(null)
    fetchReports()
  }

  // ── Users (Supabase) ──
  async function fetchUsers() {
    setUsersLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id,name,email,role,is_admin,is_blocked,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    setDbUsers(data || [])
    setUsersLoading(false)
  }

  async function handleToggleBlock(userId, currentBlocked) {
    setBlockingUser(userId)
    await supabase.from('profiles').update({ is_blocked: !currentBlocked }).eq('id', userId)
    setBlockingUser(null)
    fetchUsers()
  }

  async function handleDeleteUser(userId) {
    if (!confirm('このユーザーを強制退会させますか？この操作は取り消せません。')) return
    setDeletingUser(userId)
    await supabase.rpc('admin_delete_user', { target_user_id: userId })
    setDeletingUser(null)
    fetchUsers()
  }

  // ── Email ──
  function saveEmailSettings(settings) {
    localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings))
    setEmailSettings(settings)
  }

  function handleCsvPaste(text) {
    setCsvText(text)
    setCsvError('')
    try {
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setCsvError('有効なメールアドレスが見つかりませんでした')
        setRecipients([])
      } else {
        setRecipients(parsed)
      }
    } catch {
      setCsvError('CSVの解析に失敗しました')
      setRecipients([])
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result || ''
      handleCsvPaste(text)
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handlePreview() {
    const sample = recipients[0] || { name: 'ご担当者', clinicName: '〇〇動物病院', email: 'sample@example.com' }
    try {
      const res = await fetch('http://localhost:4000/api/admin/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: emailSettings.templateHtml,
          subject: emailSettings.subject,
          sampleRecipient: sample,
        }),
      })
      const data = await res.json()
      setPreviewHtml(data.html)
      setShowPreview(true)
    } catch {
      // サーバーが起動していない場合はフロントで置換
      const preview = emailSettings.templateHtml
        .replace(/\{\{name\}\}/g, sample.name || 'ご担当者')
        .replace(/\{\{clinicName\}\}/g, sample.clinicName || '〇〇動物病院')
      setPreviewHtml(preview)
      setShowPreview(true)
    }
  }

  async function handleSendBulk() {
    if (!emailSettings.apiKey) {
      alert('Resend APIキーを設定してください')
      return
    }
    if (recipients.length === 0) {
      alert('送信先リストが空です')
      return
    }
    if (!confirm(`${recipients.length}件のメールを送信しますか？\n\n送信先例: ${recipients[0]?.email}`)) return

    setSending(true)
    setSendResult(null)

    try {
      const res = await fetch('http://localhost:4000/api/admin/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: emailSettings.apiKey,
          from: emailSettings.from,
          subject: emailSettings.subject,
          html: emailSettings.templateHtml,
          recipients,
        }),
      })
      const data = await res.json()
      setSendResult(data)

      // ログを保存
      const logEntry = {
        id: Date.now(),
        sentAt: new Date().toISOString(),
        subject: emailSettings.subject,
        total: data.total,
        successCount: data.successCount,
        failCount: data.failCount,
        results: data.results,
      }
      const newLog = [logEntry, ...loadEmailLog()].slice(0, 50)
      localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(newLog))
      setEmailLog(newLog)
    } catch (err) {
      setSendResult({ error: `サーバーエラー: ${err.message}\nサーバーが起動しているか確認してください（npm run dev:server）` })
    } finally {
      setSending(false)
    }
  }

  const statusLabel = {
    pending: { text: '審査中', bg: '#fff8e1', color: '#f59e0b' },
    approved: { text: '承認済み', bg: '#e8f5e9', color: '#22c55e' },
    rejected: { text: '否認', bg: '#fce4ec', color: '#e05555' },
  }

  // ── Loading state ──
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>読み込み中...</p>
      </div>
    )
  }

  // ── Not user → redirected in useEffect ──
  if (!user) return null

  // ── User exists but not isAdmin → show password form ──
  if (!isFullyAuthed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fffe', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(42,157,143,0.12)', padding: '40px 32px', width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🐾</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#264653' }}>管理者ページ</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 6 }}>WanNyanCall24 Admin</div>
          </div>
          <form onSubmit={e => {
            e.preventDefault()
            if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
            else setPwError(true)
          }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>パスワード</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(false) }}
                style={{ width: '100%', border: `1.5px solid ${pwError ? '#e05555' : '#e5e7eb'}`, borderRadius: 8, padding: '12px 14px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
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

  // ── Stats ──
  const pendingReportsCount = dbReports.filter(r => r.status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: '#f8fffe', padding: '20px 16px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#264653' }}>🐾 管理者ダッシュボード</div>
          <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 2 }}>
            {isAdmin ? 'Supabase管理者' : 'パスワード認証'}
          </div>
        </div>
        <button onClick={() => { setAuthed(false); setPw('') }} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: '0.85rem', color: '#6b7280', cursor: 'pointer' }}>
          ログアウト
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: '申請全件', count: applications.length, color: '#2a9d8f' },
          { label: '審査中', count: applications.filter(a => a.status === 'pending').length, color: '#f59e0b' },
          { label: '通報', count: pendingReportsCount, color: '#e05555' },
          { label: 'ユーザー', count: dbUsers.length, color: '#6b7280' },
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
          { key: 'chats', label: 'チャット一覧' },
          { key: 'reports', label: `通報${pendingReportsCount > 0 ? ` (${pendingReportsCount})` : ''}` },
          { key: 'users', label: 'ユーザー管理' },
          { key: 'email', label: '📧 営業メール' },
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
      {activeTab !== 'email' && (
        <button onClick={() => {
          loadApplications()
          if (activeTab === 'chats') fetchChats()
          if (activeTab === 'reports') fetchReports()
          if (activeTab === 'users') fetchUsers()
        }}
          style={{ background: 'none', border: '1.5px solid #2a9d8f', borderRadius: 8, padding: '6px 14px', fontSize: '0.85rem', color: '#2a9d8f', cursor: 'pointer', marginBottom: 16 }}>
          ↻ 更新
        </button>
      )}

      {/* ══════════════════════════════════════════
          獣医師審査タブ
      ══════════════════════════════════════════ */}
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
                  <button
                    onClick={() => setSelected(selected?.key === app.key ? null : app)}
                    style={{ marginTop: 12, background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: '0.82rem', color: '#6b7280', cursor: 'pointer', width: '100%' }}
                  >
                    {selected?.key === app.key ? '▲ 詳細を閉じる' : '▼ 詳細を見る'}
                  </button>
                </div>
                {selected?.key === app.key && (
                  <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 20px', background: '#fafafa' }}>
                    {app.licenseImage && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 8 }}>獣医師免許証</div>
                        <img src={app.licenseImage} alt="免許証" style={{ width: '100%', borderRadius: 10, border: '1px solid #e5e7eb', maxHeight: 260, objectFit: 'contain', background: '#fff' }} />
                      </div>
                    )}
                    {app.career && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>経歴</div>
                        <div style={{ fontSize: '0.85rem', color: '#374151', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{app.career}</div>
                      </div>
                    )}
                    {app.specialties && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>専門分野</div>
                        <div style={{ fontSize: '0.85rem', color: '#374151' }}>{app.specialties}</div>
                      </div>
                    )}
                    {app.licenseNumber && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#264653', marginBottom: 4 }}>免許番号</div>
                        <div style={{ fontSize: '0.85rem', color: '#374151' }}>{app.licenseNumber}</div>
                      </div>
                    )}
                    {app.status === 'pending' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                        <button onClick={() => updateStatus(app.key, 'approved')} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>✓ 承認</button>
                        <button onClick={() => updateStatus(app.key, 'rejected')} style={{ background: '#e05555', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>✗ 否認</button>
                      </div>
                    )}
                    {app.status === 'approved' && (
                      <button onClick={() => updateStatus(app.key, 'rejected')} style={{ background: '#e05555', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}>承認を取り消す</button>
                    )}
                    {app.status === 'rejected' && (
                      <button onClick={() => updateStatus(app.key, 'approved')} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', width: '100%' }}>承認に変更する</button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      {/* ══════════════════════════════════════════
          チャット一覧タブ
      ══════════════════════════════════════════ */}
      {activeTab === 'chats' && (
        <div>
          {chatLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>読み込み中...</div>
          ) : chatRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
              <div>チャットルームはありません</div>
            </div>
          ) : (
            chatRooms.map(room => {
              const isExpanded = expandedRoom === room.id
              const msgs = roomMessages[room.id] || []
              const statusColors = {
                active: { bg: '#e8f6f5', color: '#2a9d8f', label: '進行中' },
                completed: { bg: '#f3f4f6', color: '#6b7280', label: '完了' },
                pending: { bg: '#fff8e1', color: '#f59e0b', label: '待機中' },
              }
              const sc = statusColors[room.status] || statusColors.pending
              return (
                <div key={room.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#264653' }}>
                        {room.vets?.name || '獣医師'} ↔ {room.profiles?.name || '飼い主'}
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 10 }}>
                      開始: {new Date(room.created_at).toLocaleString('ja-JP')}
                      {room.total_amount > 0 && ` / ¥${room.total_amount.toLocaleString()}`}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={async () => {
                          if (!isExpanded) await fetchRoomMessages(room.id)
                          setExpandedRoom(isExpanded ? null : room.id)
                        }}
                        style={{ background: '#e8f6f5', color: '#2a9d8f', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                      >{isExpanded ? '▲ 閉じる' : '▼ メッセージ確認'}</button>
                      {room.status === 'active' && (
                        <button
                          onClick={() => handleForceComplete(room.id)}
                          disabled={forceCompleting === room.id}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', opacity: forceCompleting === room.id ? 0.7 : 1 }}
                        >{forceCompleting === room.id ? '処理中...' : '強制終了'}</button>
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 18px', background: '#f9fafb', maxHeight: 300, overflowY: 'auto' }}>
                      {msgs.length === 0 ? (
                        <div style={{ color: '#9ca3af', fontSize: '0.82rem', textAlign: 'center' }}>メッセージなし</div>
                      ) : (
                        msgs.map(m => (
                          <div key={m.id} style={{ marginBottom: 8 }}>
                            <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginRight: 6 }}>
                              {m.sender_role === 'vet' ? '獣医師' : '飼い主'} {new Date(m.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#374151' }}>{m.content}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          通報管理タブ
      ══════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div>
          {reportsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>読み込み中...</div>
          ) : dbReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <div>通報はありません</div>
            </div>
          ) : (
            dbReports.map(r => {
              const isPending = r.status === 'pending'
              const statusInfo = {
                pending: { bg: '#fee2e2', color: '#e05555', label: '未対応' },
                resolved: { bg: '#e8f6f5', color: '#2a9d8f', label: '対応済み' },
                dismissed: { bg: '#f3f4f6', color: '#6b7280', label: '却下' },
              }
              const si = statusInfo[r.status] || statusInfo.pending
              return (
                <div key={r.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', marginBottom: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653' }}>
                      🚨 {r.target_name}（{r.target_type === 'vet' ? '獣医師' : '飼い主'}）
                    </div>
                    <span style={{ background: si.bg, color: si.color, padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{si.label}</span>
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
                    {new Date(r.created_at).toLocaleString('ja-JP')}
                  </div>
                  {isPending && (
                    <div>
                      <textarea
                        placeholder="管理者メモ（任意）"
                        value={reportNote[r.id] || ''}
                        onChange={e => setReportNote(prev => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2}
                        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: '0.8rem', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button
                          onClick={() => updateReportStatus(r.id, 'resolved')}
                          disabled={updatingReport === r.id}
                          style={{ background: '#e8f6f5', color: '#2a9d8f', border: 'none', borderRadius: 8, padding: '9px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', opacity: updatingReport === r.id ? 0.7 : 1 }}
                        >対応済みにする</button>
                        <button
                          onClick={() => updateReportStatus(r.id, 'dismissed')}
                          disabled={updatingReport === r.id}
                          style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, padding: '9px', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', opacity: updatingReport === r.id ? 0.7 : 1 }}
                        >却下する</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          ユーザー管理タブ
      ══════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div>
          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>読み込み中...</div>
          ) : dbUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
              <div>ユーザーはいません</div>
            </div>
          ) : (
            dbUsers.map(u => (
              <div key={u.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', marginBottom: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#264653' }}>
                      {u.name || '(名前なし)'}
                    </div>
                    {u.is_admin && <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>管理者</span>}
                    {u.is_blocked && <span style={{ background: '#fee2e2', color: '#e05555', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700 }}>ブロック中</span>}
                    <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem' }}>{u.role || 'user'}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    {u.email && <div>📧 {u.email}</div>}
                    <div>登録: {new Date(u.created_at).toLocaleDateString('ja-JP')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleBlock(u.id, u.is_blocked)}
                    disabled={blockingUser === u.id}
                    style={{
                      background: u.is_blocked ? '#e8f6f5' : '#fee2e2',
                      color: u.is_blocked ? '#2a9d8f' : '#e05555',
                      border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                      opacity: blockingUser === u.id ? 0.7 : 1,
                    }}
                  >{blockingUser === u.id ? '...' : u.is_blocked ? '解除' : 'ブロック'}</button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={deletingUser === u.id || u.is_admin}
                    style={{
                      background: '#264653', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: u.is_admin ? 'not-allowed' : 'pointer',
                      opacity: deletingUser === u.id || u.is_admin ? 0.5 : 1,
                    }}
                  >{deletingUser === u.id ? '...' : '強制退会'}</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          営業メールタブ
      ══════════════════════════════════════════ */}
      {activeTab === 'email' && (
        <div>
          {/* サブタブ */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { key: 'compose', label: '✉️ 作成・送信' },
              { key: 'log', label: `📊 送信ログ ${emailLog.length > 0 ? `(${emailLog.length})` : ''}` },
              { key: 'help', label: '❓ 使い方' },
            ].map(t => (
              <button key={t.key} onClick={() => setEmailSubTab(t.key)} style={{
                padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap',
                background: emailSubTab === t.key ? '#2a9d8f' : '#e8f6f5',
                color: emailSubTab === t.key ? '#fff' : '#2a9d8f',
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── 作成・送信サブタブ ── */}
          {emailSubTab === 'compose' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* STEP 1: API設定 */}
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', padding: '18px 20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 14 }}>
                  STEP 1: メール送信設定
                </h3>
                <div className="form-group">
                  <label className="form-label">Resend APIキー <span style={{ color: '#e05555' }}>*</span></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      className="form-input"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                      value={emailSettings.apiKey}
                      onChange={e => saveEmailSettings({ ...emailSettings, apiKey: e.target.value })}
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                    />
                    <button
                      onClick={() => setShowApiKey(v => !v)}
                      style={{ background: '#f3f4f6', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '0 12px', cursor: 'pointer', fontSize: '0.85rem', color: '#6b7280', flexShrink: 0 }}
                    >{showApiKey ? '隠す' : '表示'}</button>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>
                    <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#2a9d8f' }}>resend.com</a> で無料取得できます
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">送信元アドレス</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="WanNyanCall24 <noreply@yourdomain.com>"
                    value={emailSettings.from}
                    onChange={e => saveEmailSettings({ ...emailSettings, from: e.target.value })}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>
                    テスト時は <code>onboarding@resend.dev</code> が使えます（自分のメールのみ送信可）
                  </div>
                </div>
              </div>

              {/* STEP 2: 送信先リスト */}
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', padding: '18px 20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 6 }}>
                  STEP 2: 送信先リスト
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: 12, background: '#f0f9f8', borderRadius: 8, padding: '8px 12px' }}>
                  📋 CSV形式: <code>email,name,clinicName</code>（ヘッダー行があれば自動認識）<br/>
                  例: <code>tanaka@example.com,田中健一,たなか動物病院</code>
                </div>

                {/* ファイルアップロード */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: '#e8f6f5', border: '1.5px dashed #2a9d8f', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: '0.85rem', color: '#2a9d8f', fontWeight: 600 }}
                  >
                    📁 CSVファイルを選択
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleFileUpload} />
                  {recipients.length > 0 && (
                    <button
                      onClick={() => { setRecipients([]); setCsvText('') }}
                      style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontSize: '0.82rem', color: '#9ca3af' }}
                    >クリア</button>
                  )}
                </div>

                {/* テキストエリアで直接入力も可 */}
                <textarea
                  placeholder={`直接入力も可能です:\nemail,name,clinicName\ntanaka@example.com,田中健一,たなか動物病院\nsuzuki@example.com,鈴木麻衣,すずき動物病院`}
                  value={csvText}
                  onChange={e => handleCsvPaste(e.target.value)}
                  style={{
                    width: '100%', minHeight: 100, border: '1.5px solid #e5e7eb', borderRadius: 8,
                    padding: '10px 12px', fontSize: '0.8rem', fontFamily: 'monospace',
                    resize: 'vertical', boxSizing: 'border-box', color: '#374151',
                  }}
                />
                {csvError && <div style={{ color: '#e05555', fontSize: '0.8rem', marginTop: 6 }}>⚠ {csvError}</div>}

                {recipients.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#264653', marginBottom: 8 }}>
                      ✅ {recipients.length}件 読み込み済み
                    </div>
                    <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                      <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb' }}>
                            {['#', 'メールアドレス', '名前', '病院名'].map(h => (
                              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recipients.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '5px 10px', color: '#9ca3af' }}>{i + 1}</td>
                              <td style={{ padding: '5px 10px', color: '#374151' }}>{r.email}</td>
                              <td style={{ padding: '5px 10px', color: '#374151' }}>{r.name || '—'}</td>
                              <td style={{ padding: '5px 10px', color: '#374151' }}>{r.clinicName || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: メールテンプレート */}
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', padding: '18px 20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 6 }}>
                  STEP 3: メールテンプレート
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 12, background: '#fefaf0', borderRadius: 8, padding: '8px 12px' }}>
                  💡 変数: <code style={{ color: '#d97706' }}>{'{{name}}'}</code>（担当者名）・<code style={{ color: '#d97706' }}>{'{{clinicName}}'}</code>（病院名）が自動置換されます
                </div>
                <div className="form-group">
                  <label className="form-label">件名</label>
                  <input
                    className="form-input"
                    type="text"
                    value={emailSettings.subject}
                    onChange={e => saveEmailSettings({ ...emailSettings, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">本文 (HTML)</label>
                  <textarea
                    value={emailSettings.templateHtml}
                    onChange={e => saveEmailSettings({ ...emailSettings, templateHtml: e.target.value })}
                    style={{
                      width: '100%', minHeight: 260, border: '1.5px solid #e5e7eb', borderRadius: 8,
                      padding: '10px 12px', fontSize: '0.78rem', fontFamily: 'monospace',
                      resize: 'vertical', boxSizing: 'border-box', color: '#374151', lineHeight: 1.5,
                    }}
                  />
                </div>
                <button
                  onClick={handlePreview}
                  style={{ background: '#f0f9f8', border: '1.5px solid #2a9d8f', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: '0.85rem', color: '#2a9d8f', fontWeight: 600 }}
                >
                  👁 プレビュー表示
                </button>
                <button
                  onClick={() => saveEmailSettings({ ...emailSettings, templateHtml: DEFAULT_TEMPLATE_HTML })}
                  style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontSize: '0.82rem', color: '#9ca3af', marginLeft: 8 }}
                >
                  デフォルトに戻す
                </button>
              </div>

              {/* STEP 4: 送信 */}
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', padding: '18px 20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 14 }}>
                  STEP 4: 一括送信
                </h3>

                {/* チェックリスト */}
                <div style={{ marginBottom: 16, fontSize: '0.85rem' }}>
                  {[
                    { ok: !!emailSettings.apiKey, label: 'APIキーが設定されている' },
                    { ok: !!emailSettings.from, label: '送信元アドレスが設定されている' },
                    { ok: recipients.length > 0, label: `送信先リストが読み込まれている (${recipients.length}件)` },
                    { ok: !!emailSettings.subject, label: '件名が入力されている' },
                    { ok: !!emailSettings.templateHtml, label: 'メール本文が入力されている' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: item.ok ? '#22c55e' : '#9ca3af' }}>
                      <span style={{ fontSize: '1rem' }}>{item.ok ? '✅' : '⬜'}</span>
                      <span style={{ fontWeight: item.ok ? 600 : 400 }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSendBulk}
                  disabled={sending || !emailSettings.apiKey || recipients.length === 0}
                  style={{
                    background: sending ? '#9ca3af' : '#2a9d8f',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '14px', width: '100%', fontWeight: 700,
                    fontSize: '1rem', cursor: sending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? '⏳ 送信中...' : `📧 ${recipients.length}件に一括送信する`}
                </button>

                {/* 送信結果 */}
                {sendResult && (
                  <div style={{ marginTop: 16, borderRadius: 10, padding: '14px 16px', background: sendResult.error ? '#fce4ec' : '#e8f5e9' }}>
                    {sendResult.error ? (
                      <div style={{ color: '#e05555', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                        ❌ {sendResult.error}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontWeight: 700, color: '#264653', marginBottom: 10 }}>
                          送信完了: ✅ {sendResult.successCount}件成功 / ❌ {sendResult.failCount}件失敗
                        </div>
                        {sendResult.results && (
                          <div style={{ maxHeight: 120, overflowY: 'auto', fontSize: '0.75rem' }}>
                            {sendResult.results.map((r, i) => (
                              <div key={i} style={{ color: r.status === '送信済み' ? '#22c55e' : '#e05555', marginBottom: 2 }}>
                                {r.status === '送信済み' ? '✓' : '✗'} {r.email} {r.message ? `— ${r.message}` : ''}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── 送信ログサブタブ ── */}
          {emailSubTab === 'log' && (
            <div>
              {emailLog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
                  <div>送信履歴はまだありません</div>
                </div>
              ) : (
                emailLog.map(log => (
                  <div key={log.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', marginBottom: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#264653' }}>{log.subject}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>
                        {new Date(log.sentAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem' }}>
                      <span style={{ color: '#6b7280' }}>計 {log.total}件</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>✅ {log.successCount}件</span>
                      {log.failCount > 0 && <span style={{ color: '#e05555', fontWeight: 600 }}>❌ {log.failCount}件</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── 使い方サブタブ ── */}
          {emailSubTab === 'help' && (
            <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', padding: '20px' }}>
              <h3 style={{ fontWeight: 700, color: '#264653', marginBottom: 16 }}>📚 営業メール機能の使い方</h3>
              <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8 }}>
                <h4 style={{ color: '#2a9d8f', marginBottom: 8 }}>1. Resend APIキーの取得</h4>
                <ol style={{ paddingLeft: 20, marginBottom: 16 }}>
                  <li><a href="https://resend.com" target="_blank" rel="noreferrer" style={{ color: '#2a9d8f' }}>resend.com</a> で無料アカウントを作成</li>
                  <li>「API Keys」→「Create API Key」</li>
                  <li>発行されたキー（<code>re_...</code>）をコピーして設定欄に入力</li>
                </ol>

                <h4 style={{ color: '#2a9d8f', marginBottom: 8 }}>2. 送信元アドレスの設定</h4>
                <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                  <li>テスト時: <code>onboarding@resend.dev</code>（自分のメールアドレスのみ送信可）</li>
                  <li>本番時: Resendでドメイン認証を行い、自社ドメインのアドレスを使用</li>
                </ul>

                <h4 style={{ color: '#2a9d8f', marginBottom: 8 }}>3. 送信先CSVの形式</h4>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: 16 }}>
                  email,name,clinicName<br/>
                  tanaka@example.com,田中健一,たなか動物病院<br/>
                  suzuki@example.com,鈴木麻衣,すずき動物病院
                </div>

                <h4 style={{ color: '#2a9d8f', marginBottom: 8 }}>4. テンプレート変数</h4>
                <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                  <li><code style={{ color: '#d97706' }}>{'{{name}}'}</code> → 担当者名に自動置換</li>
                  <li><code style={{ color: '#d97706' }}>{'{{clinicName}}'}</code> → 病院名に自動置換</li>
                </ul>

                <h4 style={{ color: '#2a9d8f', marginBottom: 8 }}>5. サーバーの起動が必要</h4>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: 16 }}>
                  npm run dev:server
                </div>

                <div style={{ background: '#fff8e1', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', color: '#92400e', marginTop: 8 }}>
                  ⚠️ <strong>法的注意事項</strong><br/>
                  日本の「特定電子メール法」により、受信者の同意のない広告メールの送信は規制されています。
                  送信前に受信者リストが適切な同意を得ていることをご確認ください。
                  送受信解除の手段を必ずメール内に記載してください。
                </div>
              </div>
            </div>
          )}

          {/* プレビューモーダル */}
          {showPreview && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
              onClick={() => setShowPreview(false)}
            >
              <div
                style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 700, color: '#264653' }}>メールプレビュー</div>
                  <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  <iframe
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: '500px', border: 'none' }}
                    title="メールプレビュー"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
