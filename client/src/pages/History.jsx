import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportModal from '../components/ReportModal'
import BlockModal from '../components/BlockModal'

const HISTORY = [
  { id: 1, vetId: 1, vet: '田中 健一', photo: '👨‍⚕️', specialty: '内科・皮膚科', date: '2024-12-10', time: '21:30', duration: 15, price: 4200, status: '完了', topic: '皮膚のかゆみについて', pet: 'ポチ', timeType: '深夜' },
  { id: 2, vetId: 2, vet: '鈴木 麻衣', photo: '👩‍⚕️', specialty: '外科・整形外科', date: '2024-11-25', time: '14:00', duration: 20, price: 3800, status: '完了', topic: '足を引きずる件', pet: 'ポチ', timeType: '通常' },
  { id: 3, vetId: 4, vet: '伊藤 さくら', photo: '👩‍⚕️', specialty: '内科・腫瘍科', date: '2024-11-10', time: '10:00', duration: 15, price: 3000, status: '完了', topic: '食欲不振について', pet: 'みけ', timeType: '通常' },
  { id: 4, vetId: 1, vet: '田中 健一', photo: '👨‍⚕️', specialty: '内科・皮膚科', date: '2024-12-20', time: '15:00', duration: 15, price: 3000, status: '予約済み', topic: '定期健康チェック', pet: 'ポチ', timeType: '通常' },
]

const STATUS_STYLE = {
  '完了':   { bg: '#e8f6f5', color: '#2a9d8f' },
  '予約済み': { bg: '#fef3c7', color: '#d97706' },
  'キャンセル': { bg: '#fee2e2', color: '#dc2626' },
}

const TIME_TYPE_STYLE = {
  '深夜': { bg: '#ede9fe', color: '#7c3aed', label: '🌙深夜' },
  '夜間': { bg: '#fef3c7', color: '#d97706', label: '🌆夜間' },
  '通常': null,
}

export default function History() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [reportTarget, setReportTarget] = useState(null) // { name, consultationId }
  const [blockTarget, setBlockTarget] = useState(null)   // { name }

  const filtered = filter === 'all' ? HISTORY : HISTORY.filter(h => h.status === filter)
  const totalSpent = HISTORY.filter(h => h.status === '完了').reduce((s, h) => s + h.price, 0)

  return (
    <div className="page">
      {/* Summary Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '20px 16px', color: '#fff' }}>
        <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: 4 }}>これまでの相談</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{HISTORY.filter(h => h.status === '完了').length}<span style={{ fontSize: '1rem' }}>件</span></div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>完了した相談</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }} />
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>¥{totalSpent.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>累計お支払い</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'all', label: 'すべて' },
            { key: '完了', label: '完了' },
            { key: '予約済み', label: '予約済み' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '7px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.15s',
              background: filter === f.key ? '#2a9d8f' : '#e8f6f5',
              color: filter === f.key ? '#fff' : '#2a9d8f',
            }}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600 }}>該当する相談がありません</p>
          </div>
        ) : (
          filtered.map(h => {
            const st = STATUS_STYLE[h.status] || STATUS_STYLE['完了']
            const tt = TIME_TYPE_STYLE[h.timeType]
            return (
              <div key={h.id} className="card" style={{ marginBottom: 12 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{h.photo}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{h.vet} 獣医師</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{h.specialty}</div>
                    </div>
                  </div>
                  <span style={{ background: st.bg, color: st.color, padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{h.status}</span>
                </div>

                {/* Topic */}
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                  <p style={{ fontSize: '0.88rem', color: '#264653', fontWeight: 600 }}>💬 {h.topic}</p>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 3 }}>🐾 {h.pet}</p>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>📅 {h.date} {h.time}〜</span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>⏱ {h.duration}分</span>
                  {tt && (
                    <span style={{ background: tt.bg, color: tt.color, padding: '2px 8px', borderRadius: 50, fontSize: '0.73rem', fontWeight: 700 }}>{tt.label}</span>
                  )}
                  <span style={{ marginLeft: 'auto', fontWeight: 800, color: '#264653', fontSize: '0.95rem' }}>¥{h.price.toLocaleString()}</span>
                </div>

                {/* Actions */}
                {h.status === '完了' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 0' }}
                      onClick={() => navigate(`/booking/${h.vetId}`)}>再度相談する</button>
                    <button className="btn-outline" style={{ fontSize: '0.82rem', padding: '8px 0' }}
                      onClick={() => navigate(`/vet/${h.vetId}`)}>プロフィール</button>
                  </div>
                )}

                {/* 通報・ブロック */}
                {h.status === '完了' && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setBlockTarget({ name: h.vet })}
                      style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer' }}
                    >🚫 ブロック</button>
                    <button
                      onClick={() => setReportTarget({ name: h.vet, consultationId: h.id })}
                      style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 8, padding: '5px 10px', fontSize: '0.75rem', color: '#e05555', cursor: 'pointer' }}
                    >🚨 通報</button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {reportTarget && (
        <ReportModal
          targetName={reportTarget.name}
          targetType="vet"
          consultationId={reportTarget.consultationId}
          onClose={() => setReportTarget(null)}
        />
      )}
      {blockTarget && (
        <BlockModal
          targetName={blockTarget.name}
          targetType="vet"
          onClose={() => setBlockTarget(null)}
        />
      )}
    </div>
  )
}
