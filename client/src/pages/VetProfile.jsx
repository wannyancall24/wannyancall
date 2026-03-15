import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase, supabaseReady } from '../lib/supabase'

const StarRating = ({ rating, size = '1rem' }) => (
  <span style={{ color: '#fbbf24', fontSize: size }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
  </span>
)

export default function VetProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vet, setVet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return }
    async function fetchVet() {
      const { data, error } = await supabase
        .from('vets')
        .select('id,name,specialty,photo,rating,review_count,available_animals,night_ok,is_online,avg_response_min,experience,hospital,bio,career,specialties')
        .eq('id', id)
        .single()
      if (error || !data) { setNotFound(true); setLoading(false); return }
      setVet(data)
      setLoading(false)
    }
    fetchVet()
  }, [id])

  if (loading) return (
    <div className="page" style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
      読み込み中...
    </div>
  )

  if (notFound || !vet) return (
    <div className="page" style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
      <p style={{ fontWeight: 600, color: '#264653' }}>獣医師が見つかりませんでした</p>
      <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/find')}>
        獣医師一覧へ
      </button>
    </div>
  )

  const animals = vet.available_animals || []
  const hasExotic = animals.some(a => !['犬', '猫'].includes(a))
  const basePrice = hasExotic ? 4500 : 3000

  const stats = [
    { label: '評価', value: vet.rating ?? '-', unit: '/5.0' },
    { label: '相談件数', value: vet.review_count ?? 0, unit: '件' },
    vet.experience ? { label: '経験年数', value: vet.experience, unit: '年' } : null,
    vet.avg_response_min ? { label: '平均応答', value: vet.avg_response_min, unit: '分' } : null,
  ].filter(Boolean)

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(150deg, #2a9d8f 0%, #21867a 100%)',
        padding: '32px 20px 48px', color: '#fff', textAlign: 'center', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: vet.is_online ? '#22c55e' : 'rgba(255,255,255,0.2)',
            padding: '5px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            {vet.is_online ? 'オンライン' : 'オフライン'}
          </span>
        </div>

        <div style={{
          width: 104, height: 104, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3.8rem', margin: '0 auto 16px',
          border: '3px solid rgba(255,255,255,0.45)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>{vet.photo || '👨‍⚕️'}</div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{vet.name} 獣医師</h1>
        <p style={{ opacity: 0.9, marginBottom: 6, fontSize: '0.95rem' }}>{vet.specialty}</p>
        {vet.hospital && (
          <p style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: 14 }}>元 {vet.hospital}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
          {animals.map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 50, fontSize: '0.8rem' }}>{t}</span>
          ))}
          {vet.night_ok && (
            <span style={{ background: '#f4a261', padding: '4px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700 }}>🌙 夜間OK</span>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center', padding: '14px 4px',
            borderRight: i < stats.length - 1 ? '1px solid #e5e7eb' : 'none',
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
      {vet.bio && (
        <section className="section">
          <h2 className="section-title">💬 自己紹介</h2>
          <div className="card">
            <p style={{ fontSize: '0.93rem', lineHeight: 1.85, color: '#264653' }}>{vet.bio}</p>
          </div>
        </section>
      )}

      {/* Specialties */}
      {vet.specialties && (
        <section className="section" style={{ paddingTop: vet.bio ? 0 : undefined }}>
          <h2 className="section-title">🏅 得意分野</h2>
          <div className="card">
            <p style={{ fontSize: '0.93rem', lineHeight: 1.85, color: '#264653' }}>{vet.specialties}</p>
          </div>
        </section>
      )}

      {/* Career */}
      {vet.career && (
        <section className="section" style={{ paddingTop: (vet.bio || vet.specialties) ? 0 : undefined }}>
          <h2 className="section-title">📋 経歴</h2>
          <div className="card">
            <p style={{ fontSize: '0.9rem', color: '#264653', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{vet.career}</p>
          </div>
        </section>
      )}

      {/* Rating Summary */}
      <section className="section" style={{ paddingTop: (vet.bio || vet.specialties || vet.career) ? 0 : undefined }}>
        <h2 className="section-title">⭐ 評価</h2>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2a9d8f' }}>{vet.rating ?? '-'}</div>
            <StarRating rating={vet.rating ?? 0} size="1rem" />
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{vet.review_count ?? 0}件の評価</div>
          </div>
          <div style={{ flex: 1, fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7 }}>
            累計{vet.review_count ?? 0}件の相談を担当。<br />
            飼い主からの評価平均{vet.rating ?? '-'}点（5点満点）
          </div>
        </div>
      </section>

      {/* 免責文 */}
      <div style={{
        margin: '0 16px 16px',
        padding: '10px 14px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        fontSize: '0.75rem',
        color: '#6b7280',
        lineHeight: 1.6,
      }}>
        ※本サービスは診断・治療ではなく一般的なアドバイスを提供する相談サービスです。
      </div>

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
              {vet.is_online ? '🟢 現在オンライン' : '⚪ 現在オフライン'}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 1 }}>先払い・キャンセル24時間前まで全額返金</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1.1rem' }}>¥{basePrice.toLocaleString()}</div>
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
