import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseReady, supabaseDebugInfo, queryWithRetry } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
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

// === DEBUG: 画面表示デバッグログ ===
const debugStartTime = Date.now()
function ts() { return ((Date.now() - debugStartTime) / 1000).toFixed(2) + 's' }

export default function FindVet() {
  const navigate = useNavigate()
  const { user, loading: authLoading, authError } = useAuth()
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [animal, setAnimal] = useState('全て')
  const [specialty, setSpecialty] = useState('すべて')
  const [nightOnly, setNightOnly] = useState(false)
  const [sortBy, setSortBy] = useState('評価順')
  const fetchingRef = useRef(false)
  const [debugLog, setDebugLog] = useState([`[${ts()}] component mounted`])
  const [debugTick, setDebugTick] = useState(0)
  const addLog = (msg) => setDebugLog(prev => [...prev, `[${ts()}] ${msg}`])

  // AuthContextログを反映するため定期更新
  useEffect(() => {
    const iv = setInterval(() => setDebugTick(t => t + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    addLog(`useEffect: supabaseReady=${supabaseReady}, authLoading=${authLoading}, user=${user?.id?.slice(0,8) || 'null'}`)
    if (!supabaseReady) {
      setFetchError('Supabase未設定: 環境変数を確認してください')
      setLoading(false)
      addLog('supabaseReady=false, abort')
      return
    }
    // キャッシュがあれば即表示
    const cached = getCached('vets')
    if (cached) {
      setVets(cached)
      setLoading(false)
      addLog(`cache hit: ${cached.length} vets`)
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

  // Auth状態変化をログ
  useEffect(() => {
    addLog(`auth changed: authLoading=${authLoading}, user=${user?.id?.slice(0,8) || 'null'}, authError=${authError || 'none'}`)
  }, [authLoading, user, authError])

  async function fetchVets() {
    if (fetchingRef.current) {
      addLog('fetchVets: skipped (already fetching)')
      return
    }
    fetchingRef.current = true
    if (!getCached('vets')) setLoading(true)
    setFetchError(null)
    addLog('fetchVets: START (queryWithRetry)')

    // まずSupabaseに直接fetchしてみてタイミングを計測
    try {
      addLog('fetchVets: calling supabase.from(vets).select()...')
      const t0 = Date.now()
      const { data, error } = await queryWithRetry(
        () => supabase
          .from('vets')
          .select('id,name,specialty,photo,rating,review_count,available_animals,night_ok,is_online,avg_response_min'),
        { retries: 2, timeoutMs: 15000 }
      )
      const elapsed = Date.now() - t0
      if (error) {
        addLog(`fetchVets: ERROR after ${elapsed}ms: ${error}`)
        setFetchError(`vets: ${error}`)
      } else {
        addLog(`fetchVets: OK after ${elapsed}ms, rows=${data?.length ?? 0}`)
        setVets(data || [])
        if (data && data.length > 0) {
          setCache('vets', data, 120000)
        }
      }
    } catch (e) {
      addLog(`fetchVets: EXCEPTION: ${e.message}`)
      setFetchError(`vets exception: ${e.message}`)
    }
    setLoading(false)
    fetchingRef.current = false
    addLog('fetchVets: END')
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
      {/* === DEBUG PANEL === */}
      <div style={{
        background: '#1a1a2e', color: '#0f0', padding: '10px 12px', fontSize: '0.68rem',
        fontFamily: 'monospace', lineHeight: 1.6, maxHeight: 220, overflowY: 'auto',
        borderBottom: '2px solid #f00', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      }}>
        <div style={{ color: '#ff0', fontWeight: 700, marginBottom: 4 }}>DEBUG (FindVet)</div>
        <div style={{ color: '#aaa' }}>
          supabaseReady: {String(supabaseReady)} | URL: {supabaseDebugInfo.urlPrefix} | Key: {supabaseDebugInfo.keyLength}chars{'\n'}
          authLoading: {String(authLoading)} | user: {user?.id?.slice(0,8) || 'null'} | authError: {authError || 'none'}{'\n'}
          loading: {String(loading)} | fetchError: {fetchError || 'none'} | vets: {vets.length}{'\n'}
          UA: {navigator.userAgent.slice(0, 80)}
        </div>
        <div style={{ borderTop: '1px solid #333', marginTop: 4, paddingTop: 4, color: '#0cf' }}>
          <div style={{ color: '#ff0', fontSize: '0.65rem' }}>--- AuthContext ---</div>
          {(window.__authDebugLog || []).map((line, i) => <div key={'a'+i}>{line}</div>)}
        </div>
        <div style={{ borderTop: '1px solid #333', marginTop: 4, paddingTop: 4, color: '#0f0' }}>
          <div style={{ color: '#ff0', fontSize: '0.65rem' }}>--- FindVet ---</div>
          {debugLog.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      </div>
      {/* === END DEBUG === */}

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
