import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReportModal from '../components/ReportModal'
import BlockModal from '../components/BlockModal'
import { useAuth } from '../contexts/AuthContext'
import { supabase, queryWithRetry } from '../lib/supabase'
import { getCached, setCache } from '../lib/cache'

const STATUS_MAP = {
  completed: '完了',
  reserved: '予約済み',
  cancelled: 'キャンセル',
  in_progress: '相談中',
}

const STATUS_STYLE = {
  '完了':   { bg: '#e8f6f5', color: '#2a9d8f' },
  '予約済み': { bg: '#fef3c7', color: '#d97706' },
  'キャンセル': { bg: '#fee2e2', color: '#dc2626' },
  '相談中': { bg: '#ede9fe', color: '#7c3aed' },
}

function getTimeType(startedAt) {
  if (!startedAt) return null
  const hour = new Date(startedAt).getHours()
  if (hour >= 0 && hour < 6) return '深夜'
  if (hour >= 20 || hour >= 22) return '夜間'
  return null
}

const TIME_TYPE_STYLE = {
  '深夜': { bg: '#ede9fe', color: '#7c3aed', label: '🌙深夜' },
  '夜間': { bg: '#fef3c7', color: '#d97706', label: '🌆夜間' },
}

export default function History() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [reportTarget, setReportTarget] = useState(null)
  const [blockTarget, setBlockTarget] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    // キャッシュがあれば即表示
    const cached = getCached(`history-${user.id}`)
    if (cached) {
      setHistory(cached)
      setLoading(false)
    }
    async function fetchHistory() {
      if (!cached) setLoading(true)
      setFetchError(null)
      const { data, error } = await queryWithRetry(
        () => supabase
          .from('consultations')
          .select('id,vet_id,status,symptoms,pet,started_at,created_at,duration,total_amount,base_amount,vets(id,name,specialty,photo)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        { retries: 2, timeoutMs: 15000 }
      )
      if (error) {
        setFetchError(`consultations: ${error}`)
      } else {
        setHistory(data || [])
        setCache(`history-${user.id}`, data || [], 60000)
      }
      setLoading(false)
    }
    fetchHistory()
  }, [user])

  const displayHistory = history.map(h => {
    const statusLabel = STATUS_MAP[h.status] || h.status
    const startDate = h.started_at ? new Date(h.started_at) : (h.created_at ? new Date(h.created_at) : null)
    const date = startDate ? startDate.toISOString().slice(0, 10) : ''
    const time = startDate ? startDate.toTimeString().slice(0, 5) : ''
    const timeType = getTimeType(h.started_at)
    return {
      id: h.id,
      vetId: h.vet_id,
      vet: h.vets?.name || '獣医師',
      photo: h.vets?.photo || '👨‍⚕️',
      specialty: h.vets?.specialty || '',
      date,
      time,
      duration: h.duration || 0,
      price: h.total_amount || h.base_amount || 0,
      status: statusLabel,
      topic: h.symptoms || '相談',
      pet: h.pet || '',
      timeType,
    }
  })

  const filtered = filter === 'all' ? displayHistory : displayHistory.filter(h => h.status === filter)
  const completedList = displayHistory.filter(h => h.status === '完了')
  const totalSpent = completedList.reduce((s, h) => s + h.price, 0)

  if (fetchError) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>データ取得エラー</p>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, textAlign: 'center', wordBreak: 'break-all' }}>{fetchError}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#9ca3af' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Summary Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '20px 16px', color: '#fff' }}>
        <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: 4 }}>これまでの相談</p>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{completedList.length}<span style={{ fontSize: '1rem' }}>件</span></div>
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
            const tt = h.timeType ? TIME_TYPE_STYLE[h.timeType] : null
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
                  {h.pet && <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 3 }}>🐾 {h.pet}</p>}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>📅 {h.date} {h.time}〜</span>
                  {h.duration > 0 && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>⏱ {h.duration}分</span>}
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
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setBlockTarget({ name: h.vet })}
                      style={{ background: 'none', border: 'none', padding: '2px 0', fontSize: '0.72rem', color: '#b0b7c3', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#d1d5db' }}
                    >ブロック</button>
                    <button
                      onClick={() => setReportTarget({ name: h.vet, consultationId: h.id })}
                      style={{ background: 'none', border: 'none', padding: '2px 0', fontSize: '0.72rem', color: '#b0b7c3', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: '#d1d5db' }}
                    >通報</button>
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
