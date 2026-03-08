import { useState } from 'react'

const REPORT_REASONS = [
  '不適切な言動・ハラスメント',
  '虚偽の情報・詐欺行為',
  '個人情報の要求・プライバシー侵害',
  'スパム・宣伝行為',
  '誹謗中傷・差別的発言',
  'その他',
]

const REPORTS_KEY = 'userReports'

function loadReports() {
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY)) || [] } catch { return [] }
}

export default function ReportModal({ targetName, targetType, consultationId, onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'done'
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!reason) { setError('通報理由を選択してください'); return }
    const report = {
      id: Date.now(),
      targetName,
      targetType,
      consultationId,
      reason,
      detail: detail.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    }
    const existing = loadReports()
    localStorage.setItem(REPORTS_KEY, JSON.stringify([...existing, report]))
    window.dispatchEvent(new Event('reportUpdated'))
    setStep('done')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto',
        padding: '24px 20px 40px',
      }}>
        {step === 'form' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#264653' }}>🚨 通報する</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 3 }}>
                  {targetType === 'vet' ? '獣医師' : '飼い主'}：{targetName}
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#9ca3af', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#fff8e1', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '0.82rem', color: '#92400e' }}>
              虚偽の通報は利用停止の対象となります。
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#264653', marginBottom: 10 }}>通報理由を選択してください</div>
              {REPORT_REASONS.map(r => (
                <div key={r} onClick={() => { setReason(r); setError('') }}
                  style={{
                    padding: '12px 14px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                    border: `1.5px solid ${reason === r ? '#e05555' : '#e5e7eb'}`,
                    background: reason === r ? '#fff0f0' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${reason === r ? '#e05555' : '#d1d5db'}`,
                    background: reason === r ? '#e05555' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {reason === r && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#264653' }}>{r}</span>
                </div>
              ))}
              {error && <div style={{ color: '#e05555', fontSize: '0.78rem', marginTop: 4 }}>{error}</div>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#264653', marginBottom: 6 }}>詳細（任意）</div>
              <textarea
                className="form-input"
                rows={3}
                placeholder="具体的な状況をできるだけ詳しく記入してください"
                value={detail}
                onChange={e => setDetail(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              style={{ background: '#e05555', color: '#fff', border: 'none', borderRadius: 50, padding: '13px', width: '100%', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
            >
              通報する
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', width: '100%', marginTop: 10, padding: 10, color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer' }}>
              キャンセル
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#264653', marginBottom: 10 }}>通報を受け付けました</div>
            <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
              内容を確認し、適切に対応いたします。<br />
              ご協力ありがとうございました。
            </div>
            <button className="btn-primary" onClick={onClose} style={{ background: '#2a9d8f' }}>閉じる</button>
          </div>
        )}
      </div>
    </div>
  )
}
