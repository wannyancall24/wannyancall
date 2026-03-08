import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const VETS = {
  1: { name: '田中 健一', specialty: '内科・皮膚科', photo: '👨‍⚕️', rating: 4.9 },
  2: { name: '鈴木 麻衣', specialty: '外科・整形外科', photo: '👩‍⚕️', rating: 4.8 },
  3: { name: '佐藤 雄太', specialty: '眼科・耳鼻科', photo: '👨‍⚕️', rating: 4.7 },
  4: { name: '伊藤 さくら', specialty: '内科・腫瘍科', photo: '👩‍⚕️', rating: 4.9 },
  5: { name: '渡辺 拓也', specialty: '神経科・リハビリ', photo: '👨‍⚕️', rating: 4.6 },
  6: { name: '中村 あおい', specialty: '小動物・エキゾチック', photo: '👩‍⚕️', rating: 4.8 },
}

const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00', '21:00', '22:00', '23:00']

function getTimeLabel(t) {
  if (!t) return null
  if (t >= '22:00' || t < '08:00') return { label: '深夜帯', fee: 1200, color: '#7c3aed' }
  if (t >= '20:00') return { label: '夜間帯', fee: 800, color: '#d97706' }
  return null
}

export default function Booking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const vet = VETS[id] || VETS[1]

  const [step, setStep] = useState(1)   // 1:入力 2:確認 3:完了
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(15)
  const [pet, setPet] = useState('ポチ（トイプードル）')

  const basePrice = 2200
  const systemFee = 800
  const timeMeta = getTimeLabel(time)
  const timeFee = timeMeta ? timeMeta.fee : 0
  const extFee = duration === 20 ? 800 : duration === 30 ? 2500 : 0
  const total = basePrice + systemFee + timeFee + extFee

  const priceRows = [
    { label: `相談料（${duration}分）`, amount: basePrice + extFee },
    { label: 'システム利用料', amount: systemFee },
    timeFee > 0 && { label: `${timeMeta.label}割増`, amount: timeFee },
  ].filter(Boolean)

  const canProceed = date && time

  // Step 3: 完了
  if (step === 3) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center', minHeight: '80vh' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', marginBottom: 20 }}>✅</div>
        <h2 style={{ fontWeight: 800, color: '#2a9d8f', fontSize: '1.4rem', marginBottom: 8 }}>予約が完了しました！</h2>
        <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: 8 }}>
          {vet.name}獣医師との相談を予約しました。<br />
          確認メールをお送りしました。
        </p>
        <div style={{ background: '#e8f6f5', borderRadius: 14, padding: '16px 20px', marginBottom: 28, width: '100%', textAlign: 'left' }}>
          {[
            { label: '日時', value: `${date} ${time}〜` },
            { label: '獣医師', value: `${vet.name} 獣医師` },
            { label: '相談時間', value: `${duration}分` },
            { label: 'お支払い', value: `¥${total.toLocaleString()}（決済済み）` },
            { label: '相談方法', value: 'Google Meet（当日URLをメール送付）' },
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

  // Step 2: 確認画面
  if (step === 2) {
    return (
      <div className="page">
        <div style={{ padding: 16 }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {['日時選択', '内容確認', '決済'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 2 ? 1 : 0 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, background: i < 2 ? '#2a9d8f' : '#e5e7eb', color: i < 2 ? '#fff' : '#9ca3af' }}>{i + 1}</div>
                <span style={{ fontSize: '0.75rem', color: i < 2 ? '#2a9d8f' : '#9ca3af', fontWeight: i < 2 ? 700 : 400 }}>{s}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />}
              </div>
            ))}
          </div>

          <h2 style={{ fontWeight: 800, marginBottom: 16, fontSize: '1.1rem' }}>内容を確認してください</h2>

          {/* Vet */}
          <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{vet.photo}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{vet.name} 獣医師</div>
              <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>{vet.specialty}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ color: '#fbbf24', fontSize: '0.8rem' }}>★</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{vet.rating}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            {[
              { label: '相談日時', value: `${date}（${time}〜）` },
              { label: '相談時間', value: `${duration}分` },
              { label: 'ペット', value: pet },
              { label: '相談方法', value: 'Google Meet' },
            ].map((r, i, arr) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem' }}>
                <span style={{ color: '#6b7280' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>💴 料金内訳</h3>
            {priceRows.map((row, i) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < priceRows.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem' }}>
                <span style={{ color: '#6b7280' }}>{row.label}</span>
                <span style={{ fontWeight: 600 }}>¥{row.amount.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 800, fontSize: '1.15rem', borderTop: '2px solid #2a9d8f', marginTop: 8 }}>
              <span>合計（税込）</span>
              <span style={{ color: '#2a9d8f' }}>¥{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Cancel Policy */}
          <div className="card" style={{ background: '#fef3c7', border: '1px solid #fcd34d', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.9rem' }}>⚠️ キャンセルポリシー</h3>
            {[
              { label: '24時間前まで', value: '全額返金', color: '#16a34a' },
              { label: '24時間以内', value: '50%返金', color: '#d97706' },
              { label: '無断キャンセルの場合は', value: '返金なし', color: '#dc2626' },
            ].map(p => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px 0' }}>
                <span style={{ color: '#6b7280' }}>{p.label}</span>
                <span style={{ fontWeight: 700, color: p.color }}>{p.value}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.78rem', color: '#92400e', marginTop: 8 }}>※先払い制です。予約確定後に決済されます。</p>
          </div>

          {/* Stripe CTA */}
          <div style={{ background: '#f9fafb', borderRadius: 14, padding: '16px', marginBottom: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#264653' }}>🔒 Stripeによる安全な決済</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>
              「Webで支払い」ボタンを押すとStripeの安全な決済画面に移動します。カード情報は当サービスには保存されません。
            </p>
          </div>

          <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px', marginBottom: 10 }} onClick={() => setStep(3)}>
            🔒 Webで支払い（¥{total.toLocaleString()}）
          </button>
          <button className="btn-secondary" onClick={() => setStep(1)}>← 戻る</button>
        </div>
      </div>
    )
  }

  // Step 1: 入力
  return (
    <div className="page">
      <div style={{ padding: 16 }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {['日時選択', '内容確認', '決済'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 2 ? 1 : 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, background: i === 0 ? '#2a9d8f' : '#e5e7eb', color: i === 0 ? '#fff' : '#9ca3af' }}>{i + 1}</div>
              <span style={{ fontSize: '0.75rem', color: i === 0 ? '#2a9d8f' : '#9ca3af', fontWeight: i === 0 ? 700 : 400 }}>{s}</span>
              {i < 2 && <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />}
            </div>
          ))}
        </div>

        {/* Vet Info */}
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{vet.photo}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{vet.name} 獣医師</div>
            <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>{vet.specialty}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, color: '#2a9d8f' }}>¥2,200〜</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>15分〜</div>
          </div>
        </div>

        {/* Pet */}
        <div className="form-group">
          <label className="form-label">🐾 相談するペット</label>
          <select className="form-select" value={pet} onChange={e => setPet(e.target.value)}>
            <option>ポチ（トイプードル）</option>
            <option>みけ（スコティッシュフォールド）</option>
            <option>+ 新しいペットを追加</option>
          </select>
        </div>

        {/* Date */}
        <div className="form-group">
          <label className="form-label">📅 相談日</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </div>

        {/* Time */}
        <div className="form-group">
          <label className="form-label">🕐 開始時間</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {TIMES.map(t => {
              const meta = getTimeLabel(t)
              const selected = time === t
              return (
                <button key={t} onClick={() => setTime(t)} style={{
                  padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
                  background: selected ? '#2a9d8f' : meta ? '#fef3c7' : '#f3f4f6',
                  color: selected ? '#fff' : meta ? '#d97706' : '#264653',
                  boxShadow: selected ? '0 2px 8px rgba(42,157,143,0.3)' : 'none',
                }}>
                  {t}
                  {meta && !selected && <div style={{ fontSize: '0.6rem', color: '#d97706' }}>{meta.label}</div>}
                </button>
              )
            })}
          </div>
          {timeMeta && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef3c7', borderRadius: 8, fontSize: '0.82rem', color: '#92400e' }}>
              ⚠️ {timeMeta.label}のため +¥{timeMeta.fee.toLocaleString()} の割増が適用されます
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="form-group">
          <label className="form-label">⏱ 相談時間</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: 15, label: '15分', sub: '¥2,200', recommended: true },
              { val: 20, label: '20分', sub: '+¥800', recommended: false },
              { val: 30, label: '30分', sub: '+¥2,500', recommended: false },
            ].map(d => (
              <button key={d.val} onClick={() => setDuration(d.val)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: duration === d.val ? '#2a9d8f' : '#f3f4f6',
                color: duration === d.val ? '#fff' : '#264653',
                fontWeight: 700, fontSize: '0.88rem', position: 'relative',
                boxShadow: duration === d.val ? '0 2px 8px rgba(42,157,143,0.3)' : 'none',
                transition: 'all 0.15s',
              }}>
                {d.recommended && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: '#f4a261', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 50, fontWeight: 700, whiteSpace: 'nowrap' }}>おすすめ</div>}
                <div>{d.label}</div>
                <div style={{ fontSize: '0.72rem', marginTop: 3, opacity: 0.85 }}>{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="card" style={{ background: '#e8f6f5', border: '1.5px solid #2a9d8f33' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.9rem', color: '#264653' }}>💴 料金内訳</h3>
          {priceRows.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < priceRows.length - 1 ? '1px solid #c8ece9' : 'none', fontSize: '0.88rem' }}>
              <span style={{ color: '#6b7280' }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: '#264653' }}>¥{row.amount.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontWeight: 800, fontSize: '1.1rem', borderTop: '2px solid #2a9d8f', marginTop: 8 }}>
            <span style={{ color: '#264653' }}>合計（税込）</span>
            <span style={{ color: '#2a9d8f' }}>¥{total.toLocaleString()}</span>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ fontSize: '1.05rem', padding: '16px', opacity: canProceed ? 1 : 0.5 }}
          onClick={() => canProceed && setStep(2)}
          disabled={!canProceed}
        >
          内容を確認する →
        </button>
        {!canProceed && (
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af', marginTop: 8 }}>日付と時間を選択してください</p>
        )}
      </div>
    </div>
  )
}
