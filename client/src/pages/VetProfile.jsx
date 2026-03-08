import { useNavigate, useParams } from 'react-router-dom'

const VETS = {
  1: {
    name: '田中 健一', specialty: '内科・皮膚科', rating: 4.9, count: 312,
    photo: '👨‍⚕️', tags: ['犬', '猫'], available: true, nightOk: true,
    experience: 12, price: 2200,
    hospital: '元 東京大学付属動物病院',
    bio: '12年以上の臨床経験を持ち、皮膚疾患・消化器内科を専門としています。「飼い主さんが安心できる説明」を大切にしており、オンラインでも対面と変わらない丁寧なアドバイスを心がけています。深夜のご相談も歓迎です。',
    career: [
      { year: '2012年', desc: '日本獣医生命科学大学 卒業' },
      { year: '2012〜2018年', desc: '東京大学付属動物病院 内科・皮膚科勤務' },
      { year: '2018〜2022年', desc: '都内動物病院 副院長' },
      { year: '2022年〜', desc: 'WanNyanCall24 専属獣医師' },
    ],
    specialties: ['皮膚疾患', 'アレルギー', '消化器内科', '定期健康アドバイス'],
    reviews: [
      { user: 'たろうのパパ', date: '2024-12-10', rating: 5, text: '深夜にも関わらず丁寧にアドバイスいただきました。愛犬の様子を細かく聞いてくれて安心しました。' },
      { user: 'ももちゃんの飼い主', date: '2024-12-05', rating: 5, text: '的確なアドバイスで翌日には元気になりました！本当にありがとうございました。' },
      { user: 'しろくまさん', date: '2024-11-28', rating: 4, text: 'わかりやすく説明してくださいました。また相談したいです。' },
      { user: 'くろねこ母', date: '2024-11-15', rating: 5, text: '猫の皮膚トラブルを相談しました。写真を見てすぐに原因を教えてもらえて助かりました。' },
    ],
  },
  2: {
    name: '鈴木 麻衣', specialty: '外科・整形外科', rating: 4.8, count: 208,
    photo: '👩‍⚕️', tags: ['犬', '猫', '小動物'], available: true, nightOk: true,
    experience: 8, price: 2200,
    hospital: '元 大阪府立動物医療センター',
    bio: '外科・整形外科を専門に、骨折・関節疾患のアドバイスを得意としています。小動物のエキゾチック種にも対応しており、「見てもらえる先生が近くにいない」という飼い主さんのお力になりたいと考えています。',
    career: [
      { year: '2016年', desc: '大阪府立大学 獣医学部 卒業' },
      { year: '2016〜2020年', desc: '大阪府立動物医療センター 外科勤務' },
      { year: '2020〜2022年', desc: '兵庫県内クリニック 外科担当' },
      { year: '2023年〜', desc: 'WanNyanCall24 専属獣医師' },
    ],
    specialties: ['骨折・関節', '術後アドバイス', '小動物', 'エキゾチック種'],
    reviews: [
      { user: 'ゴールデン好き', date: '2024-12-08', rating: 5, text: '足を引きずる件で相談しました。すぐに対処法を教えていただき助かりました。' },
      { user: 'うさぎ飼い', date: '2024-11-30', rating: 5, text: 'うさぎの専門の先生を探していたので本当に助かりました。丁寧でした。' },
      { user: 'チワワ親', date: '2024-11-20', rating: 4, text: '膝の脱臼について相談しました。わかりやすく説明いただけました。' },
    ],
  },
  3: {
    name: '佐藤 雄太', specialty: '眼科・耳鼻科', rating: 4.7, count: 156,
    photo: '👨‍⚕️', tags: ['猫'], available: false, nightOk: false,
    experience: 9, price: 2200,
    hospital: '元 名古屋市立動物病院',
    bio: '眼科・耳鼻科を専門とし、特に猫の目の疾患に豊富な経験を持ちます。「様子がおかしい」と感じたら早めにご相談ください。',
    career: [
      { year: '2015年', desc: '岐阜大学 応用生物科学部 獣医学科 卒業' },
      { year: '2015〜2022年', desc: '名古屋市立動物病院 眼科・耳鼻科担当' },
      { year: '2023年〜', desc: 'WanNyanCall24 専属獣医師' },
    ],
    specialties: ['白内障', '角膜疾患', '外耳炎', '結膜炎'],
    reviews: [
      { user: 'みけ大好き', date: '2024-12-01', rating: 5, text: '目やにが増えて心配していました。すぐに原因を教えてもらえてほっとしました。' },
      { user: 'くろ飼い主', date: '2024-11-10', rating: 4, text: '耳の件で相談。ていねいに答えてもらえました。ありがとうございます。' },
    ],
  },
}

const StarRating = ({ rating, size = '1rem' }) => (
  <span style={{ color: '#fbbf24', fontSize: size }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
  </span>
)

export default function VetProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vet = VETS[id] || VETS[1]

  const avgRating = (vet.reviews.reduce((s, r) => s + r.rating, 0) / vet.reviews.length).toFixed(1)

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(150deg, #2a9d8f 0%, #21867a 100%)',
        padding: '32px 20px 48px', color: '#fff', textAlign: 'center', position: 'relative',
      }}>
        {/* Online badge */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: vet.available ? '#22c55e' : 'rgba(255,255,255,0.2)',
            padding: '5px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            {vet.available ? 'オンライン' : 'オフライン'}
          </span>
        </div>

        {/* Avatar */}
        <div style={{
          width: 104, height: 104, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3.8rem', margin: '0 auto 16px',
          border: '3px solid rgba(255,255,255,0.45)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>{vet.photo}</div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{vet.name} 獣医師</h1>
        <p style={{ opacity: 0.9, marginBottom: 6, fontSize: '0.95rem' }}>{vet.specialty}</p>
        <p style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: 14 }}>{vet.hospital}</p>

        {/* Tags */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
          {vet.tags.map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 50, fontSize: '0.8rem' }}>{t}</span>
          ))}
          {vet.nightOk && (
            <span style={{ background: '#f4a261', padding: '4px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>🌙 夜間OK</span>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { label: '評価', value: vet.rating, unit: '/5.0' },
          { label: '相談件数', value: vet.count, unit: '件' },
          { label: '経験年数', value: vet.experience, unit: '年' },
          { label: 'レビュー', value: vet.reviews.length, unit: '件' },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center', padding: '14px 4px',
            borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
          }}>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#2a9d8f' }}>
              {s.value}
              <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <section className="section">
        <h2 className="section-title">👨‍⚕️ プロフィール</h2>
        <div className="card">
          <p style={{ fontSize: '0.93rem', lineHeight: 1.85, color: '#264653' }}>{vet.bio}</p>
        </div>

        {/* Specialties */}
        <h2 className="section-title" style={{ marginTop: 4 }}>🔬 得意分野</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {vet.specialties.map(s => (
            <span key={s} style={{
              background: '#e8f6f5', color: '#2a9d8f', padding: '7px 16px',
              borderRadius: 50, fontSize: '0.85rem', fontWeight: 600,
              border: '1px solid #2a9d8f33',
            }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Career */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">📋 経歴</h2>
        <div className="card" style={{ padding: '16px 20px' }}>
          {vet.career.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < vet.career.length - 1 ? 16 : 0, marginBottom: i < vet.career.length - 1 ? 16 : 0, borderBottom: i < vet.career.length - 1 ? '1px dashed #e5e7eb' : 'none' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2a9d8f', marginTop: 5 }} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#2a9d8f', fontWeight: 700, marginBottom: 2 }}>{c.year}</div>
                <div style={{ fontSize: '0.9rem', color: '#264653' }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>⭐ レビュー</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating rating={Number(avgRating)} size="0.9rem" />
            <span style={{ fontWeight: 800, color: '#264653' }}>{avgRating}</span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>({vet.reviews.length}件)</span>
          </div>
        </div>

        {vet.reviews.map((r, i) => (
          <div key={i} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e8f6f5, #d1f0ec)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                }}>🐾</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.user}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{r.date}</div>
                </div>
              </div>
              <StarRating rating={r.rating} size="0.85rem" />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#264653', lineHeight: 1.7 }}>{r.text}</p>
          </div>
        ))}
      </section>

      {/* Sticky CTA */}
      <div style={{
        position: 'sticky', bottom: 68, left: 0, right: 0,
        padding: '12px 16px',
        background: 'rgba(248,255,254,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#e8f6f5', borderRadius: 12, padding: '10px 16px', marginBottom: 10,
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#2a9d8f', fontWeight: 700 }}>
              {vet.available ? '🟢 現在オンライン' : '⚪ 現在オフライン'}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 1 }}>先払い・キャンセル24時間前まで全額返金</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1.1rem' }}>¥{vet.price.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>15分〜</div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate(`/booking/${id}`)}>
          予約する
        </button>
      </div>
    </div>
  )
}
