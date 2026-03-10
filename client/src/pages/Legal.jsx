import { Link } from 'react-router-dom'

export default function Legal() {
  const items = [
    { label: '販売業者', value: '野口絵未' },
    { label: '代表者', value: '野口絵未' },
    { label: '所在地', value: '〒104-0061 東京都中央区銀座1丁目21番2号 ギンザヨシダビルⅡ 3階' },
    { label: 'メール', value: 'wannyancall24@gmail.com' },
    { label: '電話番号', value: 'お問い合わせはメールにて受け付けております' },
    { label: 'サービス名', value: 'WanNyanCall（オンラインペット相談サービス）' },
    { label: '販売価格', value: '各サービスページに記載の価格（税込）\n・相談料：獣医師ごとに設定（1回あたり約3,000〜6,000円）\n・買い切りプラン：14,800円（税込）\n・時間帯加算：夜間＋500円、深夜＋1,000円' },
    { label: '支払方法', value: 'クレジットカード（Stripe決済）' },
    { label: '支払時期', value: '相談開始時に仮押さえ（オーソリ）、相談終了後に確定決済' },
    { label: 'サービス提供時期', value: '予約確定後、予約日時にオンラインにて即時提供' },
    { label: 'キャンセルポリシー', value: '・相談予約の24時間前まで：全額返金\n・相談予約の24時間以内：50%返金\n・無断キャンセル：返金不可\n・獣医師都合のキャンセル：全額返金' },
    { label: '動作環境', value: 'Google Meet対応のブラウザ（Chrome、Safari、Edge等）、インターネット接続環境' },
  ]

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '28px 20px', color: '#fff' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>📄 特定商取引法に基づく表記</h1>
        <p style={{ fontSize: '0.83rem', opacity: 0.85, marginTop: 6 }}>WanNyanCall サービスに関する法的表記</p>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card">
          {items.map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0',
              borderBottom: i < items.length - 1 ? '1px solid #e5e7eb' : 'none',
            }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '0.9rem', color: '#264653', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ background: '#f9fafb', marginTop: 4 }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.8 }}>
            本サービスはオンラインによる獣医師への相談サービスです。獣医師による診断・処方行為は行いません。ご相談内容はアドバイス・情報提供を目的としています。
          </p>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', marginTop: 16 }}>
          ご不明点はメールにてお問い合わせください。<br />
          <span style={{ color: '#2a9d8f', fontWeight: 600 }}>wannyancall24@gmail.com</span>
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Link to="/terms" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>利用規約</Link>
          <Link to="/privacy" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>プライバシーポリシー</Link>
        </div>
      </div>
    </div>
  )
}
