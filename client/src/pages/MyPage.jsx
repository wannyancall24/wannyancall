import { useState } from 'react'

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="page">
      {/* Tabs */}
      <div style={{ display: 'flex', padding: '16px 16px 0', gap: 8, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        {[
          { key: 'profile', label: 'プロフィール' },
          { key: 'pets', label: 'ペット情報' },
          { key: 'plan', label: 'プラン' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            background: 'none', color: activeTab === t.key ? '#2a9d8f' : '#9ca3af',
            borderBottom: activeTab === t.key ? '2px solid #2a9d8f' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {activeTab === 'profile' && (
          <>
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#e8f6f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', margin: '0 auto 12px'
              }}>🧑</div>
              <h2 style={{ fontWeight: 700, marginBottom: 4 }}>山田 花子</h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>hanako@example.com</p>
            </div>

            <div className="card">
              {[
                { label: '名前', value: '山田 花子' },
                { label: '電話番号', value: '090-1234-5678' },
                { label: 'メール', value: 'hanako@example.com' },
                { label: '住所', value: '東京都世田谷区〇〇' },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#6b7280' }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button className="btn-outline" style={{ marginTop: 8 }}>プロフィールを編集</button>
            <button style={{ width: '100%', padding: '12px', borderRadius: 50, border: 'none', cursor: 'pointer', color: '#ef4444', background: 'none', fontSize: '0.9rem', marginTop: 8 }}>ログアウト</button>
          </>
        )}

        {activeTab === 'pets' && (
          <>
            {[
              { name: 'ポチ', species: '犬', breed: 'トイプードル', age: 3, weight: '3.2kg', icon: '🐕' },
              { name: 'みけ', species: '猫', breed: 'スコティッシュフォールド', age: 5, weight: '4.1kg', icon: '🐈' },
            ].map(pet => (
              <div key={pet.name} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{pet.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{pet.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{pet.species}・{pet.breed}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>年齢</div>
                    <div style={{ fontWeight: 700 }}>{pet.age}歳</div>
                  </div>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>体重</div>
                    <div style={{ fontWeight: 700 }}>{pet.weight}</div>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-secondary" style={{ marginTop: 4 }}>+ ペットを追加</button>
          </>
        )}

        {activeTab === 'plan' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #264653, #2a9d8f)', borderRadius: 16, padding: 24, color: '#fff', marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: 8 }}>現在のプラン</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>買い切りプラン</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>¥14,800（購入済み）</div>
              <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: '0.85rem' }}>購入日：2024-11-01</div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>プラン特典</h3>
              {[
                '✅ システム利用料 永久無料',
                '✅ 夜間割増なし',
                '✅ 深夜割増なし',
                '✅ 優先予約',
              ].map(f => (
                <div key={f} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: '0.9rem' }}>{f}</div>
              ))}
            </div>

            <div className="card" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
              <p style={{ fontSize: '0.85rem', color: '#92400e', textAlign: 'center' }}>
                🎁 <strong>期間限定</strong>：買い切りプラン ¥19,800 → <strong>¥14,800</strong>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
