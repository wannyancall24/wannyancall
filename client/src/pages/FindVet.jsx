import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseReady, supabaseDebugInfo } from '../lib/supabase'
import { getCached, setCache } from '../lib/cache'

const SPECIALTIES = ['すべて', '内科', '外科', '眼科', '神経科', '小動物']

const FilterChip = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '7px 16px', borderRadius: '50%', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
    background: active ? '#2a9d8f' : '#e8f6f5',
    color: active ? '#fff' : '#2a9d8f',
    boxShadow: active ? '0 2px 8px rgba(42,157,143,0.3)' : 'none',
  }}>{children}</button>
)

export default function FindVet() {
  const navigate = useNavigate()
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [animal, setAnimal] = useState('全て')
  const [specialty, setSpecialty] = useState('すべて')
  const [nightOnly, setNightOnly] = useState(false)
  const [sortBy, setSortBy] = useState('評価順')
  const fetchingRef = useRef(false)

  useEffect(() => {
    if (!supabaseReady) {
      setFetchError('Supabase未設定: 環境変数を確認してください')
      setLoading(false)
      return
    }
    // キャッシュがあれば即表示
    const cached = getCached('vets')
    if (cached) {
      setVets(cached)
      setLoading(false)
    }
    fetchVets()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !fetchingRef.current) {
        fetchVets()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  async function fetchVets(retryCount = 0) {
    if (fetchingRef.current) return
    fetchingRef.current = true
    if (!getCached('vets')) setLoading(true)
    setFetchError(null)
    try {
      console.log(`[FindVet] fetching vets (attempt ${retryCount + 1})...`)
      const { data, error, status, statusText } = await supabase
        .from('vets')
        .select('id,name,specialty,photo,rating,review_count,available_animals,night_ok,is_online,avg_response_min')
      console.log(`[FindVet] response: status=${status}, rows=${data?.length ?? 0}, error=${error?.message || 'none'}`)
      if (error) {
        throw new Error(`${error.message} (code: ${error.code})`)
      }
      setVets(data || [])
      if (data && data.length > 0) {
        setCache('vets', data, 120000)
      }
      setLoading(false)
      fetchingRef.current = false
    } catch (e) {
      console.error(`[FindVet] fetch error (attempt ${retryCount + 1}):`, e.message)
      // 最大2回リトライ（初回 + 2回 = 計3回試行）
      if (retryCount < 2) {
        const delay = (retryCount + 1) * 2000
        fetchingRef.current = false
        setTimeout(() => fetchVets(retryCount + 1), delay)
      } else {
        setFetchError(`vets: ${e.message}`)
        setLoading(false)
        fetchingRef.current = false
      }
    }
  }

  const filtered = vets
    .filter(v => {
      if (animal === '犬' && !v.available_animals?.includes('犬')) return false
      if (animal === '猫' && !v.available_animals?.includes('猫')) return false
      if (animal === '小動物' && !v.available_animals?.includes('小動物')) return false
      if (specialty !== 'すべて' && !v.specialty?.includes(specialty)) return false
      if (nightOnly && !v.night_ok) return false
      return true
    })
    .sort((a, b) => sortBy === '評価順'
      ? b.rating - a.rating
      : b.review_count - a.review_count
    )

  return (
    <div className="page">
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[
            { key: '全て', label: '🐾すべて' },
            { key: '犬', label: '🐶犬' },
            { key: '猫', label: '🐱猫' },
            { key: '小動物', label: '🐹小動物' },
          ].map(t => (
            <FilterChip key={t.key} active={animal === t.key} onClick={() => setAnimal(t.key)}>
              {t.label}
            </FilterChip>
          ))}
          <FilterChip active={nightOnly} onClick={() => setNightOnly(v => !v)}>
            🌙夜間対応
          </FilterChip>
        </div>
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {SPECIALTIES.map(s => (
            <FilterChip key={s} active={specialty === s} onClick={() => setSpecialty(s)}>
              {s}
            </FilterChip>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            <span style={{ fontWeight: 700, color: '#264653' }}>{filtered.length}</span>名の獣医師
          </p>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: '0.82rem', color: '#264653', background: '#fff', cursor: 'pointer' }}>
            <option value="評価順">評価順</option>
            <option value="カウント">相談数順</option>
          </select>
        </div>

        {fetchError ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
            <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>データ取得エラー</p>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, wordBreak: 'break-all' }}>{fetchError}</p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 8, lineHeight: 1.8 }}>
              supabaseReady: {String(supabaseReady)}<br/>
              URL設定: {String(supabaseDebugInfo.urlSet)} ({supabaseDebugInfo.urlPrefix})<br/>
              Key設定: {String(supabaseDebugInfo.keySet)} (長さ: {supabaseDebugInfo.keyLength})
            </p>
            <button onClick={fetchVets} className="btn-secondary" style={{ marginTop: 12, width: 'auto', padding: '8px 20px' }}>再試行</button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <p>読み込み中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🐾</div>
            <p style={{ fontWeight: 600 }}>条件に合う獣医師が見つかりませんでした</p>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>絞り込みを変更してみてください</p>
            {vets.length === 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: 8 }}>
                  データ取得数: {vets.length}件（RLSでブロックされている可能性があります）
                </p>
                <button onClick={() => fetchVets()} className="btn-secondary" style={{ width: 'auto', padding: '8px 20px' }}>再取得</button>
              </div>
            )}
          </div>
        ) : (
          filtered.map(v => (
            <div key={v.id} className="card" style={{ cursor: 'pointer', marginBottom: 14 }}
              onClick={() => navigate(`/booking/${v.id}`)}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e8f6f5, #d1f0ec)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.3rem', border: '2px solid #2a9d8f22',
                  }}>{v.photo || '👨‍⚕️'}</div>
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: v.is_online ? '#22c55e' : '#9ca3af',
                    border: '2.5px solid #fff',
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#264653' }}>{v.name}獣医師</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 1 }}>{v.specialty}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1rem' }}>¥3,000</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>15分〜</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '6px 0' }}>
                    <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                      {'★'.repeat(Math.floor(v.rating))}{'☆'.repeat(5 - Math.floor(v.rating))}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#264653' }}>{v.rating}</span>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>({v.review_count}件)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {v.available_animals?.map(t => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                    {v.night_ok && <span className="tag" style={{ background: '#fef3c7', color: '#d97706' }}>🌙夜間OK</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', flex: 1 }}>⚡ 平均{v.avg_response_min}分以内</span>
                    <button className="btn-primary"
                      style={{ padding: '9px 20px', fontSize: '0.85rem', width: 'auto' }}
                      onClick={e => { e.stopPropagation(); navigate(`/booking/${v.id}`) }}>
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
