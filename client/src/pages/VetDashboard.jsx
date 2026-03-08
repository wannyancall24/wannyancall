import { useState, useRef, useEffect } from 'react'

const SHIFTS = [
  { date: '2024-12-11 (水)', time: '20:00〜23:00', bookings: 2, status: '受付中' },
  { date: '2024-12-12 (木)', time: '10:00〜13:00', bookings: 1, status: '受付中' },
  { date: '2024-12-14 (土)', time: '09:00〜12:00', bookings: 3, status: '満員' },
]

const STORAGE_KEY = 'vetApplication'
const REQUESTS_KEY = 'exoticRequests'

function loadApplication() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}
function saveApplication(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
function loadRequests() {
  try { return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [] } catch { return [] }
}
function saveRequests(reqs) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs))
}

function StatusBadge({ status }) {
  const map = {
    pending:  { label: '審査中', bg: '#fef3c7', color: '#d97706' },
    approved: { label: '承認済み ✅', bg: '#e8f6f5', color: '#2a9d8f' },
    rejected: { label: '否認', bg: '#fee2e2', color: '#dc2626' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ background: s.bg, color: s.color, padding: '5px 14px', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem' }}>
      {s.label}
    </span>
  )
}

// 報酬テーブル
function RewardTable({ title, emoji, items, note }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '1.3rem' }}>{emoji}</span>
        <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#264653' }}>{title}</h3>
      </div>
      {note && (
        <div style={{ background: '#e8f6f5', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem', color: '#2a9d8f', marginBottom: 12, lineHeight: 1.6 }}>
          {note}
        </div>
      )}
      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 10, textAlign: 'right' }}>
        ※ 相談料の50%が獣医師の報酬です
      </div>
      {items.map((row, i) => (
        <div key={row.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 0', borderBottom: i < items.length - 1 ? '1px solid #e5e7eb' : 'none'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#264653', fontWeight: 600 }}>{row.label}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>¥{row.base.toLocaleString()}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2a9d8f' }}>
              → ¥{row.vet.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function VetDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [application, setApplication] = useState(loadApplication)
  const [requests, setRequests] = useState(loadRequests)

  const [form, setForm] = useState({
    name: '', email: '', tel: '', licenseNo: '',
    specialty: '', experience: '', animals: '',
    hospital: '', career: '', bio: '', nightOk: '対応可能',
  })
  const [licenseImage, setLicenseImage] = useState(null)
  const [licenseFileName, setLicenseFileName] = useState('')
  const [formStep, setFormStep] = useState(1)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef()

  useEffect(() => {
    const handler = () => {
      setApplication(loadApplication())
      setRequests(loadRequests())
    }
    window.addEventListener('vetApplicationUpdated', handler)
    window.addEventListener('exoticRequestUpdated', handler)
    return () => {
      window.removeEventListener('vetApplicationUpdated', handler)
      window.removeEventListener('exoticRequestUpdated', handler)
    }
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLicenseFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => setLicenseImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const validate = (step) => {
    const e = {}
    if (step === 1) {
      if (!form.name) e.name = '必須です'
      if (!form.email) e.email = '必須です'
      if (!form.tel) e.tel = '必須です'
      if (!form.licenseNo) e.licenseNo = '必須です'
      if (!form.specialty) e.specialty = '必須です'
    }
    if (step === 2) {
      if (!licenseImage) e.licenseImage = '免許証画像をアップロードしてください'
    }
    if (step === 3) {
      if (!form.hospital) e.hospital = '必須です'
      if (!form.career) e.career = '必須です'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => { if (validate(formStep)) setFormStep(s => s + 1) }

  const handleSubmit = () => {
    const app = {
      ...form, licenseImage, licenseFileName,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      id: Date.now(),
    }
    saveApplication(app)
    setApplication(app)
  }

  // エキゾチック相談リクエストの承諾/お断り
  const handleRequestAction = (id, action) => {
    const updated = requests.map(r =>
      r.id === id ? { ...r, status: action, reviewedAt: new Date().toISOString() } : r
    )
    saveRequests(updated)
    setRequests(updated)
    window.dispatchEvent(new Event('exoticRequestUpdated'))
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const stepLabels = ['基本情報', '免許証', '経歴', '確認・申請']

  const DOG_CAT_ITEMS = [
    { label: '基本相談 15分', base: 3000, vet: 1500 },
    { label: '延長 +5分', base: 1000, vet: 500 },
    { label: '延長 +15分', base: 3000, vet: 1500 },
    { label: '夜間加算（20〜22時）', base: 1000, vet: 500 },
    { label: '深夜加算（22〜8時）', base: 1500, vet: 750 },
    { label: '指名料', base: 500, vet: 250 },
  ]

  const EXOTIC_ITEMS = [
    { label: '基本相談 15分', base: 4500, vet: 2250 },
    { label: '延長 +5分', base: 1500, vet: 750 },
    { label: '延長 +15分', base: 4500, vet: 2250 },
    { label: '夜間加算（20〜22時）', base: 1000, vet: 500 },
    { label: '深夜加算（22〜8時）', base: 1500, vet: 750 },
    { label: '指名料', base: 500, vet: 250 },
  ]

  const renderApplicationStatus = () => (
    <div>
      <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>
          {application.status === 'approved' ? '🎉' : application.status === 'rejected' ? '😔' : '⏳'}
        </div>
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>
          {application.status === 'approved' ? '登録が承認されました！' :
           application.status === 'rejected' ? '登録が否認されました' : '審査中です'}
        </h2>
        <StatusBadge status={application.status} />
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 16, lineHeight: 1.7 }}>
          {application.status === 'pending' && '管理者が内容を確認しています。承認まで1〜3営業日お待ちください。'}
          {application.status === 'approved' && 'シフト管理タブからシフトを登録して相談を受け付けましょう。'}
          {application.status === 'rejected' && '内容に不備がありました。お問い合わせください。'}
        </p>
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>申請内容</h3>
        {[
          { label: 'お名前', value: application.name },
          { label: 'メール', value: application.email },
          { label: '獣医師免許番号', value: application.licenseNo },
          { label: '専門分野', value: application.specialty },
          { label: '勤務先', value: application.hospital },
          { label: '申請日時', value: new Date(application.submittedAt).toLocaleString('ja-JP') },
        ].map((r, i, arr) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.88rem' }}>
            <span style={{ color: '#6b7280' }}>{r.label}</span>
            <span style={{ fontWeight: 600, color: '#264653', textAlign: 'right', maxWidth: '55%' }}>{r.value}</span>
          </div>
        ))}
        {application.licenseImage && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 6 }}>獣医師免許証</div>
            <img src={application.licenseImage} alt="免許証" style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </div>
        )}
      </div>
      {application.status === 'rejected' && (
        <button className="btn-secondary" onClick={() => { localStorage.removeItem(STORAGE_KEY); setApplication(null); setFormStep(1) }}>
          再申請する
        </button>
      )}
    </div>
  )

  const renderRegisterForm = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {stepLabels.map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', flex: i < stepLabels.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700,
                background: formStep >= i + 1 ? '#2a9d8f' : '#e5e7eb',
                color: formStep >= i + 1 ? '#fff' : '#9ca3af',
              }}>{formStep > i + 1 ? '✓' : i + 1}</div>
              <span style={{ fontSize: '0.62rem', color: formStep === i + 1 ? '#2a9d8f' : '#9ca3af', fontWeight: formStep === i + 1 ? 700 : 400, whiteSpace: 'nowrap' }}>{l}</span>
            </div>
            {i < stepLabels.length - 1 && <div style={{ flex: 1, height: 1, background: formStep > i + 1 ? '#2a9d8f' : '#e5e7eb', margin: '0 4px', marginBottom: 18 }} />}
          </div>
        ))}
      </div>

      {formStep === 1 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>基本情報</h3>
          {[
            { key: 'name', label: 'お名前（本名）', type: 'text', placeholder: '田中 健一' },
            { key: 'email', label: 'メールアドレス', type: 'email', placeholder: 'vet@example.com' },
            { key: 'tel', label: '電話番号', type: 'tel', placeholder: '090-XXXX-XXXX' },
            { key: 'licenseNo', label: '獣医師免許番号', type: 'text', placeholder: '第XXXXX号' },
            { key: 'specialty', label: '専門分野', type: 'text', placeholder: '例：内科・皮膚科' },
            { key: 'experience', label: '経験年数', type: 'number', placeholder: '10' },
            { key: 'animals', label: '対応可能動物', type: 'text', placeholder: '犬、猫、小動物' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label} <span style={{ color: '#ef4444' }}>*</span></label>
              <input className="form-input" type={f.type} placeholder={f.placeholder}
                value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                style={{ borderColor: errors[f.key] ? '#ef4444' : '' }} />
              {errors[f.key] && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors[f.key]}</p>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">夜間対応</label>
            <select className="form-select" value={form.nightOk} onChange={e => set('nightOk', e.target.value)}>
              <option>対応可能</option><option>不可</option>
            </select>
          </div>
          <button className="btn-primary" onClick={nextStep}>次へ →</button>
        </div>
      )}

      {formStep === 2 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>獣医師免許証のアップロード</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
            獣医師免許証の写真またはスキャン画像をアップロードしてください。<br />ファイル形式：JPG・PNG・PDF
          </p>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleImageUpload} />
          <div onClick={() => fileInputRef.current.click()} style={{
            border: `2px dashed ${errors.licenseImage ? '#ef4444' : '#2a9d8f'}`,
            borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
            background: licenseImage ? '#e8f6f5' : '#f9fafb', marginBottom: 16,
          }}>
            {licenseImage ? (
              <>
                <img src={licenseImage} alt="免許証プレビュー" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 8 }} />
                <p style={{ fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600 }}>✅ {licenseFileName}</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>タップして変更</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📷</div>
                <p style={{ fontWeight: 600, color: '#264653', marginBottom: 4 }}>タップして画像を選択</p>
                <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>JPG / PNG / PDF</p>
              </>
            )}
          </div>
          {errors.licenseImage && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: 12 }}>{errors.licenseImage}</p>}
          <div style={{ background: '#fef3c7', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: '#92400e' }}>
            🔒 アップロードされた画像は審査目的のみに使用し、第三者に開示しません。
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setFormStep(1)}>← 戻る</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={nextStep}>次へ →</button>
          </div>
        </div>
      )}

      {formStep === 3 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>勤務先・経歴</h3>
          <div className="form-group">
            <label className="form-label">現在（または直近）の勤務先 <span style={{ color: '#ef4444' }}>*</span></label>
            <input className="form-input" type="text" placeholder="例：東京動物病院"
              value={form.hospital} onChange={e => set('hospital', e.target.value)}
              style={{ borderColor: errors.hospital ? '#ef4444' : '' }} />
            {errors.hospital && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors.hospital}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">経歴・職歴 <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea className="form-input" rows={5} style={{ resize: 'none', borderColor: errors.career ? '#ef4444' : '' }}
              placeholder={'例：\n2015年 〇〇大学獣医学部卒業\n2015〜2020年 △△動物病院 内科担当\n2020年〜 □□クリニック 副院長'}
              value={form.career} onChange={e => set('career', e.target.value)} />
            {errors.career && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{errors.career}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">自己紹介・飼い主へのメッセージ</label>
            <textarea className="form-input" rows={4} style={{ resize: 'none' }}
              placeholder="相談者へのメッセージを自由に記入してください"
              value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setFormStep(2)}>← 戻る</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={nextStep}>確認画面へ →</button>
          </div>
        </div>
      )}

      {formStep === 4 && (
        <div>
          <div style={{ background: '#e8f6f5', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: '0.88rem', color: '#2a9d8f', fontWeight: 600 }}>
            📋 以下の内容で申請します。内容をご確認ください。
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>基本情報</h3>
            {[
              { label: 'お名前', value: form.name },
              { label: 'メール', value: form.email },
              { label: '電話番号', value: form.tel },
              { label: '免許番号', value: form.licenseNo },
              { label: '専門分野', value: form.specialty },
              { label: '経験年数', value: form.experience + '年' },
              { label: '対応動物', value: form.animals },
              { label: '夜間対応', value: form.nightOk },
            ].map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.87rem' }}>
                <span style={{ color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>免許証</h3>
            {licenseImage && <img src={licenseImage} alt="免許証" style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb' }} />}
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>勤務先・経歴</h3>
            <p style={{ fontSize: '0.88rem', color: '#264653', marginBottom: 8 }}><strong>勤務先：</strong>{form.hospital}</p>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{form.career}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setFormStep(3)}>← 戻る</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleSubmit}>申請する</button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
            申請後、管理者が内容を確認します（1〜3営業日）。<br />承認後にシフト登録・相談受付が可能になります。
          </p>
        </div>
      )}
    </div>
  )

  const renderRequests = () => {
    if (requests.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <p style={{ fontWeight: 600 }}>相談リクエストはありません</p>
          <p style={{ fontSize: '0.82rem', marginTop: 6 }}>小動物・鳥・エキゾチックの相談依頼が届くとここに表示されます</p>
        </div>
      )
    }
    return (
      <div>
        {requests.slice().reverse().map(req => {
          const isPending = req.status === 'pending'
          const isApproved = req.status === 'approved'
          return (
            <div key={req.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#264653' }}>
                    🐹 {req.animalType}{req.animalName ? `（${req.animalName}）` : ''}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>
                    {new Date(req.submittedAt).toLocaleString('ja-JP')}
                  </div>
                </div>
                <span style={{
                  background: isPending ? '#fef3c7' : isApproved ? '#e8f6f5' : '#fee2e2',
                  color: isPending ? '#d97706' : isApproved ? '#2a9d8f' : '#dc2626',
                  padding: '4px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                }}>
                  {isPending ? '承諾待ち' : isApproved ? '承諾済み ✅' : 'お断り済み'}
                </span>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>症状・状況</div>
                <p style={{ fontSize: '0.85rem', color: '#264653', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{req.symptoms}</p>
              </div>

              {req.imageData && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>送信画像</div>
                  <img src={req.imageData} alt="症状画像" style={{ width: '100%', borderRadius: 10, border: '1px solid #e5e7eb', maxHeight: 200, objectFit: 'contain', background: '#fff' }} />
                </div>
              )}

              {req.videoName && (
                <div style={{ marginBottom: 10, background: '#f0f0f0', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                  🎥 <span>{req.videoName}</span>
                </div>
              )}

              {isPending && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleRequestAction(req.id, 'approved')}
                    style={{ background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}
                  >
                    ✓ 承諾する
                  </button>
                  <button
                    onClick={() => handleRequestAction(req.id, 'rejected')}
                    style={{ background: '#fff', color: '#e05555', border: '1.5px solid #e05555', borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer' }}
                  >
                    ✗ お断りする
                  </button>
                </div>
              )}

              {isApproved && (
                <div style={{ background: '#e8f6f5', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>💬</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2a9d8f' }}>相談開始済み</div>
                    <div style={{ fontSize: '0.75rem', color: '#5a8fa3' }}>
                      {req.reviewedAt && new Date(req.reviewedAt).toLocaleString('ja-JP')}
                    </div>
                  </div>
                </div>
              )}

              {req.status === 'rejected' && (
                <div style={{ background: '#fff0f0', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: '#e05555', fontWeight: 600 }}>
                  お断り済み。飼い主へ通知・自動返金が行われます。
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)', padding: '28px 20px', color: '#fff' }}>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 4 }}>獣医師向けダッシュボード</p>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>WanNyanCall24 で<br />副業・在宅相談を始めよう</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: '今月の相談数', value: application?.status === 'approved' ? '24件' : '−' },
            { label: '今月の報酬', value: application?.status === 'approved' ? '¥26,400' : '−' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '16px 16px 0', gap: 4, borderBottom: '1px solid #e5e7eb', background: '#fff', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: '報酬・概要' },
          { key: 'requests', label: `相談リクエスト${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { key: 'register', label: application ? '登録状況' : '登録申請' },
          { key: 'shift', label: 'シフト管理' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
            background: 'none', whiteSpace: 'nowrap',
            color: activeTab === t.key ? '#2a9d8f' : '#9ca3af',
            borderBottom: activeTab === t.key ? '2px solid #2a9d8f' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {activeTab === 'overview' && (
          <>
            {/* 50% headline */}
            <div style={{ background: 'linear-gradient(135deg, #e8f6f5, #d1f0ec)', border: '1px solid #2a9d8f', borderRadius: 14, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2a9d8f' }}>50%</div>
              <div style={{ color: '#264653', fontWeight: 700 }}>相談料を獣医師がもらえます</div>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4 }}>※決済手数料3.6%を差し引いた金額</div>
            </div>

            <RewardTable
              title="犬・猫"
              emoji="🐕"
              items={DOG_CAT_ITEMS}
            />

            <RewardTable
              title="小動物・鳥・エキゾチック"
              emoji="🐹"
              items={EXOTIC_ITEMS}
              note="飼い主が動物の種類・症状の詳細・画像・動画を事前に送信します。内容を確認して承諾ボタンを押した場合のみ相談が開始されます。対応できない場合はお断りを選択してください。"
            />

            {/* 振込タイミング */}
            <div style={{ background: '#e8f6f5', borderRadius: 12, padding: '14px 16px', marginBottom: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>🏦</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2a9d8f', marginBottom: 2 }}>振込タイミング</div>
                <div style={{ fontSize: '0.85rem', color: '#264653', lineHeight: 1.6 }}>
                  毎月1日・15日締め、翌7日に登録口座へ振込されます。
                </div>
              </div>
            </div>

            {/* 手数料セクション */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#264653', marginBottom: 12 }}>📋 差し引かれる手数料</h3>
              {[
                { label: '決済手数料', value: '3.6%', note: '相談ごとに発生' },
                { label: '月額手数料', value: '¥220', note: '出金した月のみ' },
                { label: '振込手数料', value: '¥250', note: '出金のたびに' },
                { label: 'プラットフォーム手数料', value: '出金額の0.25%', note: '銀行振込時' },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none'
                }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', color: '#264653', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.note}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#6b7280' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>✨ 在籍のメリット</h3>
              {[
                { icon: '🏠', title: '完全在宅', desc: '自宅から相談対応できます' },
                { icon: '⏰', title: '自由なシフト', desc: '空き時間を有効活用' },
                { icon: '💳', title: '毎月末払い', desc: '銀行振込で確実にお支払い' },
                { icon: '📈', title: '評価UP', desc: 'レビューで指名数が増加' },
              ].map((b, i, arr) => (
                <div key={b.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'requests' && renderRequests()}

        {activeTab === 'register' && (application ? renderApplicationStatus() : renderRegisterForm())}

        {activeTab === 'shift' && (
          <>
            {!application || application.status !== 'approved' ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔒</div>
                <p style={{ fontWeight: 600 }}>登録審査が完了するとシフト管理が使えます</p>
                <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => setActiveTab('register')}>
                  登録申請へ
                </button>
              </div>
            ) : (
              <>
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>📅 シフトを追加</h3>
                  <div className="form-group">
                    <label className="form-label">日付</label>
                    <input className="form-input" type="date" />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">開始時間</label>
                      <input className="form-input" type="time" />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">終了時間</label>
                      <input className="form-input" type="time" />
                    </div>
                  </div>
                  <button className="btn-secondary">シフトを追加</button>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>登録済みシフト</h3>
                {SHIFTS.map((s, i) => (
                  <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.date}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{s.time}</div>
                      <div style={{ fontSize: '0.8rem', color: '#2a9d8f', marginTop: 2 }}>予約 {s.bookings}件</div>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, background: s.status === '満員' ? '#fee2e2' : '#e8f6f5', color: s.status === '満員' ? '#dc2626' : '#2a9d8f' }}>{s.status}</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
