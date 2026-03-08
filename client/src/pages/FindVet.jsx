import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VETS = [
  { id: 1, name: '田中 健一', specialty: '内科・皮膚科', rating: 4.9, count: 312, photo: '👨‍⚕️', tags: ['犬', '猫'], available: true, nightOk: true, price: 2200 },
  { id: 2, name: '鈴木 麻衣', specialty: '外科・整形外科', rating: 4.8, count: 208, photo: '👩‍⚕️', tags: ['犬', '猫', '小動物'], available: true, nightOk: true, price: 2200 },
  { id: 3, name: '佐藤 雄太', specialty: '眼科・耳鼻科', rating: 4.7, count: 156, photo: '👨‍⚕️', tags: ['猫'], available: false, nightOk: false, price: 2200 },
  { id: 4, name: '伊藤 さくら', specialty: '内科・腫瘍科', rating: 4.9, count: 421, photo: '👩‍⚕️', tags: ['犬', '猫'], available: true, nightOk: false, price: 2200 },
  { id: 5, name: '渡辺 拓也', specialty: '神経科・リハビリ', rating: 4.6, count: 89, photo: '👨‍⚕️', tags: ['犬'], available: false, nightOk: true, price: 2200 },
]

export default function FindVet() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ animal: 'all', specialty: 'all', nightOnly: false })

  const filtered = VETS.filter(v => {
    if (filters.animal !== 'all' && !v.tags.includes(filters.animal === 'dog' ? '犬' : '猫')) return false
    if (filters.nightOnly && !v.nightOk) return false
    return true
  })

  return (
    <div className="page">
      {/* Filter */}
      <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: '🐾 すべて' },
            { key: 'dog', label: '🐕 犬' },
            { key: 'cat', label: '🐈 猫' },
          ].map(a => (
            <button key={a.key} onClick={() => setFilters(f => ({ ...f, animal: a.key }))}
              style={{
                padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                background: filters.animal === a.key ? '#2a9d8f' : '#e8f6f5',
                color: filters.animal === a.key ? '#fff' : '#2a9d8f'
              }}>{a.label}</button>
          ))}
          <button onClick={() => setFilters(f => ({ ...f, nightOnly: !f.nightOnly }))}
            style={{
              padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              background: filters.nightOnly ? '#2a9d8f' : '#e8f6f5',
              color: filters.nightOnly ? '#fff' : '#2a9d8f'
            }}>🌙 夜間対応</button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>{filtered.length}名の獣医師が見つかりました</p>

        {filtered.map(v => (
          <div key={v.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/vet/${v.id}`)}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: '#e8f6f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0, position: 'relative'
              }}>
                {v.photo}
                <div style={{
                  position: 'absolute', bottom: 2, right: 2, width: 12, height: 12,
                  borderRadius: '50%', background: v.available ? '#22c55e' : '#9ca3af',
                  border: '2px solid #fff'
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }}>{v.specialty}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1rem' }}>¥{v.price.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>15分〜</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span className="stars">{'★'.repeat(Math.floor(v.rating))}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{v.rating}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>({v.count}件)</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {v.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  {v.nightOk && <span className="tag" style={{ background: '#fef3c7', color: '#d97706' }}>🌙夜間OK</span>}
                </div>
                <button className="btn-primary" style={{ padding: '10px', fontSize: '0.9rem' }}
                  onClick={(e) => { e.stopPropagation(); navigate(`/booking/${v.id}`) }}>
                  相談する
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
