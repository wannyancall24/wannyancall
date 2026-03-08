import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VETS = [
  { id: 1, name: '田中 健一', specialty: '内科・皮膚科', specialtyKey: '内科', rating: 4.9, count: 312, photo: '👨‍⚕️', tags: ['犬', '猫'], available: true, nightOk: true, price: 2200, responseTime: '平均5分以内' },
  { id: 2, name: '鈴木 麻衣', specialty: '外科・整形外科', specialtyKey: '外科', rating: 4.8, count: 208, photo: '👩‍⚕️', tags: ['犬', '猫', '小動物'], available: true, nightOk: true, price: 2200, responseTime: '平均10分以内' },
  { id: 3, name: '佐藤 雄太', specialty: '眼科・耳鼻科', specialtyKey: '眼科', rating: 4.7, count: 156, photo: '👨‍⚕️', tags: ['猫'], available: false, nightOk: false, price: 2200, responseTime: '平均15分以内' },
  { id: 4, name: '伊藤 さくら', specialty: '内科・腫瘍科', specialtyKey: '内科', rating: 4.9, count: 421, photo: '👩‍⚕️', tags: ['犬', '猫'], available: true, nightOk: false, price: 2200, responseTime: '平均8分以内' },
  { id: 5, name: '渡辺 拓也', specialty: '神経科・リハビリ', specialtyKey: '神経科', rating: 4.6, count: 89, photo: '👨‍⚕️', tags: ['犬'], available: false, nightOk: true, price: 2200, responseTime: '平均20分以内' },
  { id: 6, name: '中村 あおい', specialty: '小動物・エキゾチック', specialtyKey: '小動物', rating: 4.8, count: 174, photo: '👩‍⚕️', tags: ['小動物', '猫'], available: true, nightOk: true, price: 2200, responseTime: '平均7分以内' },
]

const SPECIALTIES = ['すべて', '内科', '外科', '眼科', '神経科', '小動物']

const FilterChip = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
    background: active ? '#2a9d8f' : '#e8f6f5',
    color: active ? '#fff' : '#2a9d8f',
    boxShadow: active ? '0 2px 8px rgba(42,157,143,0.3)' : 'none',
  }}>{children}</button>
)

export default function FindVet() {
  const navigate = useNavigate()
  const [animal, setAnimal] = useState('all')
  const [specialty, setSpecialty] = useState('すべて')
  const [nightOnly, setNightOnly] = useState(false)
  const [sortBy, setSortBy] = useState('rating')

  const filtered = VETS
    .filter(v => {
      if (animal === 'dog' && !v.tags.includes('犬')) return false
      if (animal === 'cat' && !v.tags.includes('猫')) return false
      if (animal === 'small' && !v.tags.includes('小動物')) return false
      if (specialty !== 'すべて' && v.specialtyKey !== specialty) return false
      if (nightOnly && !v.nightOk) return false
      return true
    })
    .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : b.count - a.count)

  return (
    <div className="page">
      {/* Search Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        {/* Animal Filter */}
        <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[
            { key: 'all', label: '🐾 すべて' },
            { key: 'dog', label: '🐕 犬' },
            { key: 'cat', label: '🐈 猫' },
            { key: 'small', label: '🐹 小動物' },
          ].map(a => (
            <FilterChip key={a.key} active={animal === a.key} onClick={() => setAnimal(a.key)}>
              {a.label}
            </FilterChip>
          ))}
          <FilterChip active={nightOnly} onClick={() => setNightOnly(v => !v)}>
            🌙 夜間対応
          </FilterChip>
        </div>

        {/* Specialty Filter */}
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {SPECIALTIES.map(s => (
            <FilterChip key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
              {s}
            </FilterChip>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Result Count + Sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            <span style={{ fontWeight: 700, color: '#264653' }}>{filtered.length}名</span> の獣医師
          </p>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 10px',
              fontSize: '0.82rem', color: '#264653', background: '#fff', cursor: 'pointer',
            }}
          >
            <option value="rating">評価順</option>
            <option value="count">相談件数順</option>
          </select>
        </div>

        {/* Vet Cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600 }}>条件に合う獣医師が見つかりませんでした</p>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>絞り込みを変えてお試しください</p>
          </div>
        ) : (
          filtered.map(v => (
            <div
              key={v.id}
              className="card"
              style={{ cursor: 'pointer', marginBottom: 14 }}
              onClick={() => navigate(`/vet/${v.id}`)}
            >
              <div style={{ display: 'flex', gap: 14 }}>
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e8f6f5, #d1f0ec)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.3rem', border: '2px solid #2a9d8f22',
                  }}>{v.photo}</div>
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: v.available ? '#22c55e' : '#9ca3af',
                    border: '2.5px solid #fff',
                  }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#264653' }}>{v.name} 獣医師</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 1 }}>{v.specialty}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1rem' }}>¥{v.price.toLocaleString()}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>15分〜</div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '6px 0' }}>
                    <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                      {'★'.repeat(Math.floor(v.rating))}{'☆'.repeat(5 - Math.floor(v.rating))}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#264653' }}>{v.rating}</span>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>（{v.count}件）</span>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {v.tags.map(t => <span key={t} className="tag">{t}</span>)}
                    {v.nightOk && (
                      <span className="tag" style={{ background: '#fef3c7', color: '#d97706' }}>🌙夜間OK</span>
                    )}
                  </div>

                  {/* Response time + CTA */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', flex: 1 }}>
                      ⚡ {v.responseTime}
                    </span>
                    <button
                      className="btn-primary"
                      style={{ padding: '9px 20px', fontSize: '0.85rem', width: 'auto' }}
                      onClick={e => { e.stopPropagation(); navigate(`/booking/${v.id}`) }}
                    >
                      相談する
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
