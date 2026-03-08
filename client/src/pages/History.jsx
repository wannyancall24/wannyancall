const HISTORY = [
  { id: 1, vet: '田中 健一', specialty: '内科・皮膚科', date: '2024-12-10', time: '21:30', duration: 15, price: 4200, status: '完了', topic: '皮膚のかゆみについて' },
  { id: 2, vet: '鈴木 麻衣', specialty: '外科・整形外科', date: '2024-11-25', time: '14:00', duration: 20, price: 3800, status: '完了', topic: '足を引きずる件' },
  { id: 3, vet: '伊藤 さくら', specialty: '内科・腫瘍科', date: '2024-11-10', time: '10:00', duration: 15, price: 3000, status: '完了', topic: '食欲不振について' },
]

export default function History() {
  return (
    <div className="page">
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700 }}>相談履歴</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>全{HISTORY.length}件</span>
        </div>

        {HISTORY.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
            <p>相談履歴がありません</p>
          </div>
        ) : (
          HISTORY.map(h => (
            <div key={h.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>{h.vet} 獣医師</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{h.specialty}</div>
                </div>
                <span style={{
                  background: '#e8f6f5', color: '#2a9d8f', padding: '3px 10px',
                  borderRadius: 50, fontSize: '0.78rem', fontWeight: 700
                }}>{h.status}</span>
              </div>

              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                <p style={{ fontSize: '0.88rem', color: '#264653', fontWeight: 600 }}>💬 {h.topic}</p>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.83rem', color: '#6b7280' }}>
                <span>📅 {h.date} {h.time}</span>
                <span>⏱ {h.duration}分</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#264653' }}>¥{h.price.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
