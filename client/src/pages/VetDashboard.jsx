import { useState } from 'react'

const SHIFTS = [
  { date: '2024-12-11 (水)', time: '20:00〜23:00', bookings: 2, status: '受付中' },
  { date: '2024-12-12 (木)', time: '10:00〜13:00', bookings: 1, status: '受付中' },
  { date: '2024-12-14 (土)', time: '09:00〜12:00', bookings: 3, status: '満員' },
]

export default function VetDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #264653, #2a9d8f)', padding: '28px 20px', color: '#fff' }}>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 4 }}>獣医師向けダッシュボード</p>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 16 }}>WanNyanCall24 で<br />副業・在宅相談を始めよう</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: '今月の相談数', value: '24件' },
            { label: '今月の報酬', value: '¥26,400' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '16px 16px 0', gap: 8, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        {[
          { key: 'overview', label: '報酬・概要' },
          { key: 'register', label: '登録' },
          { key: 'shift', label: 'シフト管理' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            background: 'none', color: activeTab === t.key ? '#2a9d8f' : '#9ca3af',
            borderBottom: activeTab === t.key ? '2px solid #2a9d8f' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {activeTab === 'overview' && (
          <>
            {/* Revenue */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #e8f6f5, #d1f0ec)', border: '1px solid #2a9d8f' }}>
              <h3 style={{ fontWeight: 800, color: '#2a9d8f', marginBottom: 16 }}>💰 報酬の仕組み</h3>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2a9d8f' }}>50%</div>
                <div style={{ color: '#264653', fontWeight: 700 }}>相談料を獣医師がもらえます</div>
              </div>
              {[
                { label: '相談料（15分）', vet: '¥1,100', platform: '¥1,100' },
                { label: '延長料金（+5分）', vet: '¥400', platform: '¥400' },
                { label: '延長料金（+15分）', vet: '¥1,250', platform: '¥1,250' },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.85rem',
                  borderBottom: i < 2 ? '1px solid rgba(42,157,143,0.2)' : 'none'
                }}>
                  <span style={{ color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: '#2a9d8f' }}>あなた {row.vet}</span>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>✨ 在籍のメリット</h3>
              {[
                { icon: '🏠', title: '完全在宅', desc: '自宅から相談対応できます' },
                { icon: '⏰', title: '自由なシフト', desc: '空き時間を有効活用' },
                { icon: '💳', title: '毎月末払い', desc: '銀行振込で確実にお支払い' },
                { icon: '📈', title: '評価UP', desc: 'レビューで指名数が増加' },
              ].map(b => (
                <div key={b.title} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
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

        {activeTab === 'register' && (
          <>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 16 }}>獣医師登録はかんたん3分で完了します。</p>
            <div className="card">
              {[
                { label: 'お名前', type: 'text', placeholder: '田中 健一' },
                { label: 'メールアドレス', type: 'email', placeholder: 'vet@example.com' },
                { label: '電話番号', type: 'tel', placeholder: '090-XXXX-XXXX' },
                { label: '獣医師免許番号', type: 'text', placeholder: '第XXXXX号' },
                { label: '専門分野', type: 'text', placeholder: '例：内科・皮膚科' },
                { label: '経験年数', type: 'number', placeholder: '10' },
                { label: '対応可能動物', type: 'text', placeholder: '犬、猫、小動物' },
              ].map(f => (
                <div key={f.label} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input className="form-input" type={f.type} placeholder={f.placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">自己紹介</label>
                <textarea className="form-input" rows={4} placeholder="相談者へのメッセージを記入してください" style={{ resize: 'none' }} />
              </div>
              <div className="form-group">
                <label className="form-label">夜間対応可否</label>
                <select className="form-select">
                  <option>対応可能</option>
                  <option>不可</option>
                </select>
              </div>
            </div>
            <button className="btn-primary">登録申請する</button>
          </>
        )}

        {activeTab === 'shift' && (
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
                <span style={{
                  padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700,
                  background: s.status === '満員' ? '#fee2e2' : '#e8f6f5',
                  color: s.status === '満員' ? '#dc2626' : '#2a9d8f'
                }}>{s.status}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
