export default function Legal() {
  const items = [
    { label: '販売業者', value: '野口絵未' },
    { label: '代表者', value: '野口絵未' },
    { label: '所在地', value: '〒104-0061 東京都中央区銀座1丁目21番2号 ギンザヨシダビルⅡ 3階' },
    { label: 'メール', value: 'wannyancall24@gmail.com' },
    { label: '販売価格', value: '各サービスページに記載の価格（税込）' },
    { label: '支払方法', value: 'クレジットカード（Stripe）' },
    { label: 'サービス提供', value: '予約確定後、即時提供' },
    { label: 'キャンセルポリシー', value: '24時間前まで全額返金・24時間以内50%返金・無断キャンセルの場合は返金なし' },
  ]

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '28px 20px', color: '#fff' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>📄 特定商取引法に基づく表記</h1>
        <p style={{ fontSize: '0.83rem', opacity: 0.85, marginTop: 6 }}>WanNyanCall24 サービスに関する法的表記</p>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card">
          {items.map((item, i) => (
            <div key={item.label} style={{
              display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0',
              borderBottom: i < items.length - 1 ? '1px solid #e5e7eb' : 'none',
            }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '0.9rem', color: '#264653', lineHeight: 1.6 }}>{item.value}</span>
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
      </div>
    </div>
  )
}
