import { useNavigate, useParams } from 'react-router-dom'

const VETS = {
  1: { name: '田中 健一', specialty: '内科・皮膚科', rating: 4.9, count: 312, photo: '👨‍⚕️', tags: ['犬', '猫'], available: true, nightOk: true, experience: 12, hospital: '元 東京大学付属動物病院', bio: '12年以上の臨床経験を持ち、皮膚疾患や消化器内科を専門としています。オンラインでも丁寧なアドバイスを心がけています。' },
  2: { name: '鈴木 麻衣', specialty: '外科・整形外科', rating: 4.8, count: 208, photo: '👩‍⚕️', tags: ['犬', '猫', '小動物'], available: true, nightOk: true, experience: 8, hospital: '元 大阪府立動物医療センター', bio: '外科と整形外科を専門に、骨折・関節疾患のアドバイスを得意としています。' },
}

const REVIEWS = [
  { user: 'たろうのパパ', date: '2024-12-10', rating: 5, text: '深夜にも関わらず丁寧にアドバイスいただきました。安心しました。' },
  { user: 'もも飼い主', date: '2024-12-05', rating: 5, text: '的確なアドバイスで、翌日には元気になりました。ありがとうございました！' },
  { user: 'しろくまさん', date: '2024-11-28', rating: 4, text: 'わかりやすく説明してくださいました。また相談したいです。' },
]

export default function VetProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vet = VETS[id] || VETS[1]

  return (
    <div className="page">
      {/* Profile Hero */}
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '32px 20px 40px', color: '#fff', textAlign: 'center' }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem',
          margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.5)'
        }}>{vet.photo}</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{vet.name} 獣医師</h1>
        <p style={{ opacity: 0.9, marginBottom: 8 }}>{vet.specialty}</p>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: 12 }}>{vet.hospital}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {vet.tags.map(t => <span key={t} style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 50, fontSize: '0.8rem' }}>{t}</span>)}
          {vet.nightOk && <span style={{ background: '#f4a261', padding: '3px 12px', borderRadius: 50, fontSize: '0.8rem' }}>🌙夜間OK</span>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#fff', display: 'flex', padding: '16px', gap: 16, borderBottom: '1px solid #e5e7eb' }}>
        {[
          { label: '評価', value: vet.rating, unit: '/ 5.0' },
          { label: '相談件数', value: vet.count, unit: '件' },
          { label: '経験年数', value: vet.experience, unit: '年' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#2a9d8f' }}>{s.value}<span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.unit}</span></div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <section className="section">
        <h2 className="section-title">👨‍⚕️ プロフィール</h2>
        <div className="card">
          <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#264653' }}>{vet.bio}</p>
        </div>
      </section>

      {/* Reviews */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">⭐ レビュー</h2>
        {REVIEWS.map((r, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🐾</div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.user}</span>
              </div>
              <div>
                <span className="stars">{'★'.repeat(r.rating)}</span>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right' }}>{r.date}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#264653', lineHeight: 1.6 }}>{r.text}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#e8f6f5', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
          <span style={{ fontSize: '0.9rem', color: '#2a9d8f', fontWeight: 600 }}>
            {vet.available ? '🟢 現在オンライン' : '⚪ 現在オフライン'}
          </span>
          <span style={{ fontWeight: 800, color: '#2a9d8f' }}>¥2,200〜</span>
        </div>
        <button className="btn-primary" onClick={() => navigate(`/booking/${id}`)}>
          予約する
        </button>
      </div>
    </div>
  )
}
