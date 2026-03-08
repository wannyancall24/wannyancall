import { useNavigate } from 'react-router-dom'

const VETS = [
  { id: 1, name: '田中 健一', specialty: '内科・皮膚科', rating: 4.9, count: 312, photo: '👨‍⚕️', tags: ['犬', '猫'], available: true },
  { id: 2, name: '鈴木 麻衣', specialty: '外科・整形外科', rating: 4.8, count: 208, photo: '👩‍⚕️', tags: ['犬', '猫', '小動物'], available: true },
  { id: 3, name: '佐藤 雄太', specialty: '眼科・耳鼻科', rating: 4.7, count: 156, photo: '👨‍⚕️', tags: ['猫'], available: false },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page">
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
        padding: '36px 20px 40px', color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{
              background: '#22c55e', color: '#fff',
              padding: '4px 12px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              オンライン獣医師 12名
            </span>
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, lineHeight: 1.4, marginBottom: 12 }}>
            深夜でも、田舎でも<br />獣医師に相談できる
          </h1>
          <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: 24, lineHeight: 1.6 }}>
            24時間365日、自宅から獣医師に<br />オンラインで相談。すぐつながる。
          </p>
          <button className="btn-primary" style={{ background: '#f4a261', fontSize: '1.05rem', padding: '16px' }}
            onClick={() => navigate('/find')}>
            今すぐ獣医師を探す →
          </button>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: 10, textAlign: 'center' }}>
            ※初回相談 システム利用料のみ
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <h2 className="section-title">🐾 提供サービス</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '💬', title: 'オンライン相談', desc: '獣医師によるビデオ相談' },
            { icon: '🌙', title: '24時間対応', desc: '深夜・早朝も安心サポート' },
            { icon: '📊', title: '健康管理', desc: 'アドバイスと記録管理' },
            { icon: '📅', title: '定期チェック', desc: '定期的な健康チェック' },
          ].map((s) => (
            <div key={s.title} className="card" style={{ margin: 0, textAlign: 'center', padding: 16 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation Time */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">⏱ 相談時間を選ぶ</h2>
        {[
          { time: '15分', price: '2,200円', note: '基本プラン', highlight: false },
          { time: '延長 +5分', price: '+800円', note: '途中で追加可能', highlight: false },
          { time: '延長 +15分', price: '+2,500円', note: 'まとめてお得', highlight: true },
        ].map((t) => (
          <div key={t.time} className="card" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderLeft: t.highlight ? '4px solid #f4a261' : '4px solid #2a9d8f',
            padding: '14px 16px', marginBottom: 10
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.time}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{t.note}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: t.highlight ? '#f4a261' : '#2a9d8f' }}>{t.price}</div>
          </div>
        ))}
      </section>

      {/* Pricing Plans */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">💴 料金プラン</h2>
        <div className="card">
          {[
            { label: 'システム利用料', price: '800円', icon: '📱' },
            { label: '夜間（20〜22時）', price: '+800円', icon: '🌆' },
            { label: '深夜（22〜8時）', price: '+1,200円', icon: '🌙' },
          ].map((p, i) => (
            <div key={p.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: i < 2 ? '1px solid #e5e7eb' : 'none'
            }}>
              <span style={{ fontSize: '0.95rem' }}>{p.icon} {p.label}</span>
              <span style={{ fontWeight: 700, color: '#264653' }}>{p.price}</span>
            </div>
          ))}
        </div>
        {/* 買い切りプラン */}
        <div style={{
          background: 'linear-gradient(135deg, #264653, #2a9d8f)',
          borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.1)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ background: '#f4a261', padding: '2px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>期間限定</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.8, textDecoration: 'line-through' }}>¥19,800</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>¥14,800 <span style={{ fontSize: '1rem' }}>買い切り</span></div>
          <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>システム利用料・夜間・深夜割増 すべて込み</p>
          <button className="btn-primary" style={{ marginTop: 16, background: '#f4a261' }}>このプランを購入する</button>
        </div>
      </section>

      {/* Time Comparison */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">⚡ 時間削減効果</h2>
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 4px', color: '#6b7280', fontWeight: 600, borderBottom: '2px solid #e5e7eb', width: '40%' }}>項目</th>
                <th style={{ textAlign: 'center', padding: '8px 4px', color: '#dc2626', fontWeight: 700, borderBottom: '2px solid #e5e7eb', width: '30%' }}>🏥 対面</th>
                <th style={{ textAlign: 'center', padding: '8px 4px', color: '#2a9d8f', fontWeight: 700, borderBottom: '2px solid #e5e7eb', width: '30%' }}>💻 オンライン</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '移動時間（往路）', face: '20〜40分', online: '0分', highlight: true },
                { label: '受付待ち時間', face: '30〜40分', online: '予約制のため短縮', highlight: false },
                { label: '相談時間', face: '20〜30分', online: '15分〜', highlight: false },
                { label: '会計待ち時間', face: '10分', online: 'オンライン決済', highlight: true },
                { label: '移動時間（復路）', face: '20〜40分', online: '0分', highlight: true },
              ].map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  <td style={{ padding: '10px 4px', color: '#264653' }}>{row.label}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{row.face}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center', color: '#2a9d8f', fontWeight: 700 }}>{row.online}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #2a9d8f', background: '#e8f6f5' }}>
                <td style={{ padding: '12px 4px', fontWeight: 800, color: '#264653' }}>合計</td>
                <td style={{ padding: '12px 4px', textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>115〜180分</td>
                <td style={{ padding: '12px 4px', textAlign: 'center', fontWeight: 800, color: '#2a9d8f' }}>大幅短縮</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 16, background: '#e8f6f5', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: '#2a9d8f', fontSize: '0.95rem' }}>
              移動・待ち時間ゼロで、ペットのそばで相談できます
            </p>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">📋 相談の流れ</h2>
        <div className="card">
          {[
            { step: 1, icon: '📅', title: '予約する', desc: '獣医師を選んで日時を予約' },
            { step: 2, icon: '📩', title: '確定通知', desc: '予約確認メールが届きます' },
            { step: 3, icon: '🔗', title: 'リンク発行', desc: 'Google MeetのURLが届きます' },
            { step: 4, icon: '💬', title: 'オンライン相談', desc: 'ビデオ通話で獣医師に相談' },
            { step: 5, icon: '✅', title: '決済完了', desc: '相談後に自動決済されます' },
          ].map((f, i) => (
            <div key={f.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: i < 4 ? 16 : 0, marginBottom: i < 4 ? 16 : 0, borderBottom: i < 4 ? '1px dashed #e5e7eb' : 'none' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#2a9d8f',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
              }}>{f.step}</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{f.icon} {f.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vet List */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">👨‍⚕️ 在籍獣医師</h2>
        {VETS.map((v) => (
          <div key={v.id} className="card" onClick={() => {}} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#e8f6f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0
              }}>{v.photo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{v.name}</span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.available ? '#22c55e' : '#9ca3af', display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 6 }}>{v.specialty}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="stars">{'★'.repeat(Math.floor(v.rating))}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.rating}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>({v.count}件)</span>
                </div>
                <div>{v.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              </div>
            </div>
          </div>
        ))}
        <button className="btn-secondary" onClick={() => {}}>すべての獣医師を見る</button>
      </section>

      {/* Contact */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">📬 お問い合わせ</h2>
        <div className="card">
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 16 }}>
            サービスに関するご質問・ご不明点はお気軽にお問い合わせください。
          </p>
          <div className="form-group">
            <label className="form-label">お名前</label>
            <input className="form-input" type="text" placeholder="山田 太郎" />
          </div>
          <div className="form-group">
            <label className="form-label">メールアドレス</label>
            <input className="form-input" type="email" placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">内容</label>
            <textarea className="form-input" rows={4} placeholder="お問い合わせ内容をご記入ください" style={{ resize: 'none' }} />
          </div>
          <button className="btn-primary">送信する</button>
        </div>
      </section>

      {/* Legal */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">📄 特定商取引法に基づく表記</h2>
        <div className="card">
          {[
            { label: '販売業者', value: '株式会社WanNyan' },
            { label: '代表者', value: '山田 次郎' },
            { label: '所在地', value: '東京都渋谷区〇〇1-2-3' },
            { label: '電話番号', value: '03-XXXX-XXXX（平日10〜18時）' },
            { label: 'メール', value: 'support@wannyancall24.jp' },
            { label: '販売価格', value: '各サービスページに記載の価格' },
            { label: '支払方法', value: 'クレジットカード（Stripe）' },
            { label: 'サービス提供', value: '予約確定後、即時提供' },
            { label: 'キャンセル', value: '24時間前まで全額返金' },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', gap: 8, padding: '10px 0',
              borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#6b7280', minWidth: 100, flexShrink: 0 }}>{item.label}</span>
              <span style={{ color: '#264653' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 16 }} />
    </div>
  )
}
