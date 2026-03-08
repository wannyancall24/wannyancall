import { useState } from 'react'
import { useParams } from 'react-router-dom'

const VET_NAMES = { 1: '田中 健一', 2: '鈴木 麻衣', 3: '佐藤 雄太', 4: '伊藤 さくら', 5: '渡辺 拓也' }

export default function Booking() {
  const { id } = useParams()
  const [duration, setDuration] = useState(15)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [step, setStep] = useState(1)

  const basePrice = 2200
  const systemFee = 800
  const nightFee = time >= '20:00' && time < '22:00' ? 800 : 0
  const midnightFee = time >= '22:00' || time < '08:00' ? 1200 : 0
  const extFee = duration === 20 ? 800 : duration === 30 ? 2500 : 0
  const total = basePrice + systemFee + nightFee + midnightFee + extFee

  if (step === 2) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
        <h2 style={{ fontWeight: 800, color: '#2a9d8f', marginBottom: 8 }}>予約が完了しました！</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>確認メールをお送りしました。<br />相談当日にGoogle MeetのURLをお送りします。</p>
        <button className="btn-primary" onClick={() => setStep(1)}>トップへ戻る</button>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="section">
        {/* Vet Info */}
        <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>👨‍⚕️</div>
          <div>
            <div style={{ fontWeight: 700 }}>{VET_NAMES[id] || '田中 健一'} 獣医師</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>内科・皮膚科</div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="form-group">
          <label className="form-label">📅 相談日</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">🕐 相談時間</label>
          <select className="form-select" value={time} onChange={e => setTime(e.target.value)}>
            <option value="">時間を選択</option>
            {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00', '21:00', '22:00', '23:00'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="form-group">
          <label className="form-label">⏱ 相談時間</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: 15, label: '15分', price: '¥2,200' },
              { val: 20, label: '20分', price: '+¥800' },
              { val: 30, label: '30分', price: '+¥2,500' },
            ].map(d => (
              <button key={d.val} onClick={() => setDuration(d.val)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: duration === d.val ? '#2a9d8f' : '#e8f6f5',
                color: duration === d.val ? '#fff' : '#2a9d8f',
                fontWeight: 700, fontSize: '0.85rem'
              }}>
                <div>{d.label}</div>
                <div style={{ fontSize: '0.75rem', marginTop: 2 }}>{d.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>💴 料金確認</h3>
          {[
            { label: '相談料（15分）', amount: basePrice },
            { label: 'システム利用料', amount: systemFee },
            nightFee > 0 && { label: '夜間割増（20〜22時）', amount: nightFee },
            midnightFee > 0 && { label: '深夜割増（22〜8時）', amount: midnightFee },
            extFee > 0 && { label: `延長料金（+${duration - 15}分）`, amount: extFee },
          ].filter(Boolean).map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem'
            }}>
              <span style={{ color: '#6b7280' }}>{row.label}</span>
              <span style={{ fontWeight: 600 }}>¥{row.amount.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 800, fontSize: '1.1rem', borderTop: '2px solid #2a9d8f', marginTop: 8 }}>
            <span>合計</span>
            <span style={{ color: '#2a9d8f' }}>¥{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Cancel Policy */}
        <div className="card" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>⚠️ キャンセルポリシー</h3>
          {[
            { label: '24時間前まで', value: '全額返金' },
            { label: '24時間以内', value: '50%返金' },
            { label: '無断キャンセルの場合は', value: '返金なし' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '4px 0' }}>
              <span style={{ color: '#6b7280' }}>{p.label}</span>
              <span style={{ fontWeight: 700, color: '#d97706' }}>{p.value}</span>
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: 8 }}>※先払い制です。相談後に自動的に決済が確定します。</p>
        </div>

        {/* Payment */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>💳 お支払い情報</h3>
          <div className="form-group">
            <label className="form-label">カード番号</label>
            <input className="form-input" type="text" placeholder="1234 5678 9012 3456" maxLength={19} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">有効期限</label>
              <input className="form-input" type="text" placeholder="MM/YY" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">CVV</label>
              <input className="form-input" type="text" placeholder="123" maxLength={3} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: '0.8rem', marginBottom: 4 }}>
            <span>🔒</span>
            <span>Stripeによる安全な決済</span>
          </div>
        </div>

        <button className="btn-primary" style={{ fontSize: '1.05rem', padding: 16 }} onClick={() => setStep(2)}>
          ¥{total.toLocaleString()} で予約を確定する
        </button>
      </section>
    </div>
  )
}
