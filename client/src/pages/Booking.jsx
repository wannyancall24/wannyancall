import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStoredCard, getBrandLabel } from '../lib/stripeCard'

const VETS = {
  1: { name: '田中 健一', specialty: '内科・皮膚科', photo: '👨‍⚕️', rating: 4.9 },
  2: { name: '鈴木 麻衣', specialty: '外科・整形外科', photo: '👩‍⚕️', rating: 4.8 },
  3: { name: '佐藤 雄太', specialty: '眼科・耳鼻科', photo: '👨‍⚕️', rating: 4.7 },
  4: { name: '伊藤 さくら', specialty: '内科・腫瘍科', photo: '👩‍⚕️', rating: 4.9 },
  5: { name: '渡辺 拓也', specialty: '神経科・リハビリ', photo: '👨‍⚕️', rating: 4.6 },
  6: { name: '中村 あおい', specialty: '小動物・エキゾチック', photo: '👩‍⚕️', rating: 4.8 },
}

const STEPS = ['入力', '確認', '相談中', '完了']

function StepBar({ step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0 20px' }}>
      {STEPS.map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
              background: step > i + 1 ? '#2a9d8f' : step === i + 1 ? '#2a9d8f' : '#e5e7eb',
              color: step >= i + 1 ? '#fff' : '#9ca3af',
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.62rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? '#2a9d8f' : '#9ca3af', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 1, background: step > i + 1 ? '#2a9d8f' : '#e5e7eb', margin: '0 4px', marginBottom: 18 }} />
          )}
        </div>
      ))}
    </div>
  )
}

function formatElapsed(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function calcTotal({ animalType, duration, hour }) {
  const base = animalType === 'exotic' ? 4500 : 3000
  const extPer5 = animalType === 'exotic' ? 1500 : 1000
  const ext = Math.max(0, Math.floor((duration - 15) / 5)) * extPer5
  const systemFee = 800
  const timeFee = hour >= 22 || hour < 8 ? 1500 : hour >= 20 ? 1000 : 0
  const timeLabel = hour >= 22 || hour < 8 ? '深夜加算' : hour >= 20 ? '夜間加算' : null
  const total = base + ext + systemFee + timeFee
  return { base, ext, systemFee, timeFee, timeLabel, total }
}

export default function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vet = VETS[id] || VETS[1]

  const [step, setStep] = useState(1)
  const [pet, setPet] = useState('ポチ（トイプードル）')
  const [animalType, setAnimalType] = useState('dogcat')
  const [duration, setDuration] = useState(15)
  const [symptoms, setSymptoms] = useState('')
  const [symptomsError, setSymptomsError] = useState('')
  const [apiError, setApiError] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [elapsedSec, setElapsedSec] = useState(0)
  const timerRef = useRef(null)

  const card = getStoredCard()
  const nowHour = new Date().getHours()
  const { base, ext, systemFee, timeFee, timeLabel, total } = calcTotal({ animalType, duration, hour: nowHour })

  // 相談中タイマー
  useEffect(() => {
    if (step === 3) {
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [step])

  async function handleStartConsultation() {
    if (!card) { setApiError('カードが登録されていません'); return }
    setApiLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/stripe/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, paymentMethodId: card.paymentMethodId, customerId: card.customerId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.status !== 'requires_capture') throw new Error(`予期しないステータス: ${data.status}`)
      setPaymentIntentId(data.paymentIntentId)
      setStep(3)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  async function handleEndConsultation() {
    setApiLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/stripe/capture-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, amount: total }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      clearInterval(timerRef.current)
      setStep(4)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setApiLoading(false)
    }
  }

  // ── Step 1: 入力 ──
  if (step === 1) {
    return (
      <div className="page">
        <div style={{ padding: 16 }}>
          <StepBar step={1} />

          {/* Vet Info */}
          <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>{vet.photo}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{vet.name} 獣医師</div>
              <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>{vet.specialty}</div>
              <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>★ {vet.rating}</span>
            </div>
          </div>

          {/* ペット */}
          <div className="form-group">
            <label className="form-label">🐾 相談するペット</label>
            <select className="form-select" value={pet} onChange={e => setPet(e.target.value)}>
              <option>ポチ（トイプードル）</option>
              <option>みけ（スコティッシュフォールド）</option>
              <option>＋ 新しいペットを追加</option>
            </select>
          </div>

          {/* 動物種別 */}
          <div className="form-group">
            <label className="form-label">動物の種類</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { key: 'dogcat', label: '🐕 犬・猫', price: '¥3,000〜' },
                { key: 'exotic', label: '🐹 小動物・鳥・その他', price: '¥4,500〜' },
              ].map(t => (
                <button key={t.key} onClick={() => setAnimalType(t.key)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                  border: animalType === t.key ? '2px solid #2a9d8f' : '2px solid #e5e7eb',
                  background: animalType === t.key ? '#e8f6f5' : '#fff',
                  color: animalType === t.key ? '#2a9d8f' : '#6b7280',
                }}>
                  <div>{t.label}</div>
                  <div style={{ fontSize: '0.72rem', marginTop: 2, opacity: 0.8 }}>{t.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 相談時間 */}
          <div className="form-group">
            <label className="form-label">⏱ 相談時間</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { val: 15, label: '15分', sub: `¥${(animalType === 'exotic' ? 4500 : 3000).toLocaleString()}`, recommended: true },
                { val: 20, label: '20分', sub: `+¥${(animalType === 'exotic' ? 1500 : 1000).toLocaleString()}` },
                { val: 30, label: '30分', sub: `+¥${(animalType === 'exotic' ? 4500 : 3000).toLocaleString()}` },
              ].map(d => (
                <button key={d.val} onClick={() => setDuration(d.val)} style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: duration === d.val ? '#2a9d8f' : '#f3f4f6',
                  color: duration === d.val ? '#fff' : '#264653',
                  fontWeight: 700, fontSize: '0.85rem', position: 'relative', transition: 'all 0.15s',
                }}>
                  {d.recommended && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: '#f4a261', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 50, fontWeight: 700, whiteSpace: 'nowrap' }}>おすすめ</div>}
                  <div>{d.label}</div>
                  <div style={{ fontSize: '0.72rem', marginTop: 3, opacity: 0.85 }}>{d.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 症状 */}
          <div className="form-group">
            <label className="form-label">💬 相談内容・症状 <span style={{ color: '#e05555' }}>*</span></label>
            <textarea
              className="form-input"
              rows={4}
              style={{ resize: 'none', borderColor: symptomsError ? '#e05555' : undefined }}
              placeholder="例：昨日から食欲がなく、元気がありません。いつ頃からどんな症状か、できるだけ詳しく教えてください。"
              value={symptoms}
              onChange={e => { setSymptoms(e.target.value); setSymptomsError('') }}
            />
            {symptomsError && <div style={{ color: '#e05555', fontSize: '0.78rem', marginTop: 4 }}>{symptomsError}</div>}
          </div>

          {/* 料金プレビュー */}
          <div className="card" style={{ background: '#e8f6f5', border: '1.5px solid #2a9d8f33', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.9rem', color: '#264653' }}>💴 料金内訳（予定）</h3>
            {[
              { label: `相談料（${duration}分）`, amount: base + ext },
              { label: 'システム利用料', amount: systemFee },
              timeFee > 0 && { label: timeLabel, amount: timeFee },
            ].filter(Boolean).map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < arr.length - 1 ? '1px solid #c8ece9' : 'none', fontSize: '0.88rem' }}>
                <span style={{ color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>¥{r.amount.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 800, fontSize: '1.05rem', borderTop: '2px solid #2a9d8f', marginTop: 8 }}>
              <span style={{ color: '#264653' }}>合計（税込）</span>
              <span style={{ color: '#2a9d8f' }}>¥{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '16px' }}
            onClick={() => {
              if (!symptoms.trim()) { setSymptomsError('相談内容を入力してください'); return }
              setStep(2)
            }}
          >
            内容を確認する →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: 確認 ──
  if (step === 2) {
    return (
      <div className="page">
        <div style={{ padding: 16 }}>
          <StepBar step={2} />

          <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{vet.photo}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{vet.name} 獣医師</div>
              <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>{vet.specialty}</div>
            </div>
          </div>

          {/* 相談内容確認 */}
          <div className="card" style={{ marginBottom: 14 }}>
            {[
              { label: 'ペット', value: pet },
              { label: '動物種別', value: animalType === 'dogcat' ? '犬・猫' : '小動物・鳥・その他' },
              { label: '相談時間', value: `${duration}分` },
              { label: '相談内容', value: symptoms },
            ].map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem' }}>
                <span style={{ color: '#6b7280', flexShrink: 0, marginRight: 12 }}>{r.label}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', color: '#264653' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* 料金内訳 */}
          <div className="card" style={{ marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>💴 料金内訳</h3>
            {[
              { label: `相談料（${duration}分）`, amount: base + ext },
              { label: 'システム利用料', amount: systemFee },
              timeFee > 0 && { label: `${timeLabel}（現在の時間帯）`, amount: timeFee },
            ].filter(Boolean).map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem' }}>
                <span style={{ color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>¥{r.amount.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 800, fontSize: '1.15rem', borderTop: '2px solid #2a9d8f', marginTop: 8 }}>
              <span>合計（税込）</span>
              <span style={{ color: '#2a9d8f' }}>¥{total.toLocaleString()}</span>
            </div>
          </div>

          {/* 仮押さえ説明 */}
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: '0.83rem', color: '#92400e' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠️ 決済のしくみ</div>
            <ul style={{ paddingLeft: 16, lineHeight: 1.8, margin: 0 }}>
              <li>相談開始時に <strong>¥{total.toLocaleString()} を仮押さえ</strong>します</li>
              <li>相談終了後に実際の金額で <strong>確定決済</strong> されます</li>
              <li>対応不可の場合は <strong>全額返金</strong> されます</li>
            </ul>
          </div>

          {/* カード確認 */}
          {card ? (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>💳</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#264653' }}>{getBrandLabel(card.brand)} **** {card.last4}</div>
                {card.expMonth && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>有効期限 {String(card.expMonth).padStart(2, '0')}/{card.expYear}</div>}
              </div>
              <button
                onClick={() => navigate('/mypage')}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '0.78rem', color: '#2a9d8f', cursor: 'pointer', fontWeight: 600 }}
              >
                変更
              </button>
            </div>
          ) : (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#dc2626', marginBottom: 6 }}>💳 カードが登録されていません</div>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 10 }}>相談を開始するには事前にカードを登録してください。</p>
              <button
                className="btn-primary"
                style={{ background: '#2a9d8f', padding: '10px' }}
                onClick={() => navigate('/mypage')}
              >
                マイページでカードを登録する →
              </button>
            </div>
          )}

          {apiError && (
            <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
              {apiError}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ fontSize: '1.05rem', padding: '16px', marginBottom: 10, opacity: !card || apiLoading ? 0.5 : 1 }}
            disabled={!card || apiLoading}
            onClick={handleStartConsultation}
          >
            {apiLoading ? '処理中...' : `🔒 相談を開始する（¥${total.toLocaleString()} 仮押さえ）`}
          </button>
          <button className="btn-secondary" onClick={() => setStep(1)}>← 戻る</button>
        </div>
      </div>
    )
  }

  // ── Step 3: 相談中 ──
  if (step === 3) {
    return (
      <div className="page">
        <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '20px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', opacity: 0.8, marginBottom: 4 }}>相談中</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{formatElapsed(elapsedSec)}</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: 4 }}>経過時間</div>
        </div>

        <div style={{ padding: 16 }}>
          {/* Vet info */}
          <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', flexShrink: 0 }}>{vet.photo}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{vet.name} 獣医師</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{vet.specialty}</div>
            </div>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: '#22c55e', fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              接続中
            </span>
          </div>

          {/* 仮押さえ中バナー */}
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: '#92400e' }}>
            💳 ¥{total.toLocaleString()} を仮押さえ中。相談終了後に確定決済されます。
          </div>

          {/* チャットエリア（プレースホルダー） */}
          <div className="card" style={{ minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: '#f9fafb', marginBottom: 14 }}>
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
              チャット・ビデオ通話エリア<br />（実装予定）
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" type="text" placeholder="メッセージを入力..." style={{ flex: 1, margin: 0 }} />
              <button style={{ background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>送信</button>
            </div>
          </div>

          {apiError && (
            <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>
              {apiError}
            </div>
          )}

          <button
            onClick={handleEndConsultation}
            disabled={apiLoading}
            style={{
              width: '100%', background: apiLoading ? '#9ca3af' : '#ef4444', color: '#fff',
              border: 'none', borderRadius: 50, padding: '16px', fontWeight: 800,
              fontSize: '1rem', cursor: apiLoading ? 'default' : 'pointer',
            }}
          >
            {apiLoading ? '処理中...' : '相談を終了する'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: 8 }}>
            終了すると決済が確定されます
          </p>
        </div>
      </div>
    )
  }

  // ── Step 4: 完了 ──
  return (
    <div className="page" style={{ padding: '40px 24px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', marginBottom: 20 }}>✅</div>
      <h2 style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1.4rem', marginBottom: 8 }}>相談が完了しました</h2>
      <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: 20 }}>
        {vet.name}獣医師との相談を終了しました。<br />決済が確定されました。
      </p>
      <div style={{ background: '#e8f6f5', borderRadius: 14, padding: '16px 20px', marginBottom: 28, width: '100%', maxWidth: 360, textAlign: 'left' }}>
        {[
          { label: '獣医師', value: `${vet.name} 獣医師` },
          { label: '相談時間', value: `${duration}分（${formatElapsed(elapsedSec)}）` },
          { label: 'お支払い', value: `¥${total.toLocaleString()}（確定）` },
          { label: 'カード', value: card ? `**** ${card.last4}` : '登録カード' },
        ].map((r, i, arr) => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid #c8ece9' : 'none', fontSize: '0.88rem' }}>
            <span style={{ color: '#6b7280' }}>{r.label}</span>
            <span style={{ fontWeight: 600, color: '#264653' }}>{r.value}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={() => navigate('/')}>ホームへ戻る</button>
      <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => navigate('/history')}>相談履歴を見る</button>
    </div>
  )
}
