import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CardRegistration from '../components/CardRegistration'
import { getStoredCard, clearCard, getBrandLabel } from '../lib/stripeCard'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const PETS = [
  { id: 1, name: 'ポチ', species: '犬', breed: 'トイプードル', age: 3, weight: '3.2kg', icon: '🐕', birthday: '2021-04-10', note: 'アレルギー：なし' },
  { id: 2, name: 'みけ', species: '猫', breed: 'スコティッシュフォールド', age: 5, weight: '4.1kg', icon: '🐈', birthday: '2019-08-22', note: 'アレルギー：魚類' },
]

export default function MyPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, authError, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileFetched, setProfileFetched] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [editMode, setEditMode] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawStep, setWithdrawStep] = useState(1)
  const [withdrawDone, setWithdrawDone] = useState(false)
  const [expandedPet, setExpandedPet] = useState(null)
  const [showCardRegistration, setShowCardRegistration] = useState(false)
  const [card, setCard] = useState(getStoredCard)

  const userId = user?.id

  // プロフィール取得 — userIdが確定したら1回だけ実行
  useEffect(() => {
    if (authLoading || !userId || profileFetched) return
    let cancelled = false
    async function fetchProfile() {
      setProfileLoading(true)
      setFetchError(null)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id,name,role,email,tel,address,plan,created_at')
          .eq('id', userId)
          .single()
        if (cancelled) return
        if (error) {
          setFetchError(`profiles: ${error.message} (code: ${error.code})`)
        }
        setProfile(data)
      } catch (e) {
        if (!cancelled) setFetchError(`profiles: ${e.message}`)
      }
      if (!cancelled) {
        setProfileLoading(false)
        setProfileFetched(true)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [authLoading, userId, profileFetched])

  // 未ログインリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true })
    }
  }, [authLoading, user, navigate])

  const handleSaveProfile = useCallback(async (formData) => {
    if (!userId) return
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', userId)
    if (!error) {
      setProfile(prev => ({ ...prev, ...formData }))
    }
    setEditMode(false)
  }, [userId])

  const handleLogout = useCallback(async () => {
    setShowLogoutDialog(false)
    await signOut()
    navigate('/auth', { replace: true })
  }, [signOut, navigate])

  const tabs = [
    { key: 'profile', label: '👤 プロフィール' },
    { key: 'pets', label: '🐾 ペット' },
    { key: 'plan', label: '💳 プラン' },
  ]

  // エラー表示
  if (authError || fetchError) {
    const errMsg = [authError, fetchError].filter(Boolean).join('\n')
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>エラー</p>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, textAlign: 'center', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{errMsg}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: 12, width: 'auto', padding: '8px 20px' }}>再読み込み</button>
      </div>
    )
  }

  // ローディング表示
  if (authLoading || (!profileFetched && userId)) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#9ca3af' }}>読み込み中...</p>
      </div>
    )
  }

  // 未ログイン（useEffectでリダイレクト中）
  if (!user) {
    return null
  }

  const displayName = profile?.name || user?.email || ''
  const displayEmail = user?.email || ''
  const displayTel = profile?.tel || ''
  const displayAddress = profile?.address || ''
  const displayPlan = profile?.plan || 'free'
  const displayPlanPurchasedAt = profile?.plan_purchased_at || ''

  return (
    <div className="page">
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '24px 20px 32px', color: '#fff', textAlign: 'center' }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.6rem', margin: '0 auto 12px',
          border: '2.5px solid rgba(255,255,255,0.45)',
        }}>🧑</div>
        <h2 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 4 }}>{displayName}</h2>
        <p style={{ opacity: 0.85, fontSize: '0.85rem', marginBottom: 10 }}>{displayEmail}</p>
        {displayPlan === 'bought' && (
          <span style={{ background: '#f4a261', padding: '4px 14px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
            ⭐ 買い切りプラン
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 5 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            flex: 1, padding: '12px 4px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.78rem', background: 'none',
            color: activeTab === t.key ? '#2a9d8f' : '#9ca3af',
            borderBottom: activeTab === t.key ? '2.5px solid #2a9d8f' : '2.5px solid transparent',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* ── プロフィールタブ ── */}
        {activeTab === 'profile' && (
          <>
            <div className="card" data-profile-form>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>基本情報</h3>
                <button onClick={() => {
                  if (editMode) {
                    const form = document.querySelector('[data-profile-form]')
                    const inputs = form.querySelectorAll('input[name]')
                    const formData = {}
                    inputs.forEach(input => { formData[input.name] = input.value })
                    handleSaveProfile(formData)
                  } else {
                    setEditMode(true)
                  }
                }} style={{
                  background: editMode ? '#2a9d8f' : '#e8f6f5',
                  color: editMode ? '#fff' : '#2a9d8f',
                  border: 'none', borderRadius: 50, padding: '5px 14px',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                }}>
                  {editMode ? '保存' : '編集'}
                </button>
              </div>
              {(() => {
                const fields = [
                  { label: 'お名前', key: 'name', value: displayName, type: 'text' },
                  { label: 'メール', key: 'email', value: displayEmail, type: 'email', disabled: true },
                  { label: '電話番号', key: 'tel', value: displayTel, type: 'tel' },
                  { label: '住所', key: 'address', value: displayAddress, type: 'text' },
                ]
                return fields.map((item, i, arr) => (
                  <div key={item.label} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>{item.label}</div>
                    {editMode && !item.disabled ? (
                      <input className="form-input" type={item.type} name={item.key} defaultValue={item.value} style={{ padding: '8px 12px', fontSize: '0.9rem' }} />
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#264653' }}>{item.value || '未設定'}</div>
                    )}
                  </div>
                ))
              })()}
            </div>

            {/* Notification settings */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 12 }}>🔔 通知設定</h3>
              {[
                { label: '予約確認メール', enabled: true },
                { label: 'Google Meetリンク通知', enabled: true },
                { label: 'キャンペーン・お知らせ', enabled: false },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.9rem',
                }}>
                  <span style={{ color: '#264653' }}>{item.label}</span>
                  <div style={{
                    width: 40, height: 22, borderRadius: 50, position: 'relative', cursor: 'pointer',
                    background: item.enabled ? '#2a9d8f' : '#e5e7eb', transition: 'background 0.2s',
                  }}>
                    <div style={{
                      position: 'absolute', top: 3, left: item.enabled ? 20 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutDialog(true)}
              style={{ width: '100%', padding: '14px', borderRadius: 50, border: '1.5px solid #fee2e2', background: '#fff', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginTop: 4 }}
            >ログアウト</button>

            <div style={{ marginTop: 32, borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 10 }}>アカウントを削除する場合は退会手続きを行ってください。</p>
              <button
                onClick={() => { setShowWithdrawDialog(true); setWithdrawStep(1); setWithdrawDone(false) }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >退会する</button>
            </div>

            {showLogoutDialog && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
                <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚪</div>
                  <h3 style={{ fontWeight: 800, marginBottom: 8 }}>ログアウトしますか？</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20 }}>ログアウトすると再度ログインが必要です。</p>
                  <button className="btn-primary" style={{ background: '#ef4444', marginBottom: 10 }} onClick={handleLogout}>ログアウト</button>
                  <button className="btn-secondary" onClick={() => setShowLogoutDialog(false)}>キャンセル</button>
                </div>
              </div>
            )}

            {showWithdrawDialog && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
                <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
                  {withdrawDone ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👋</div>
                      <h3 style={{ fontWeight: 800, marginBottom: 8 }}>退会が完了しました</h3>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
                        ご利用ありがとうございました。<br />アカウントデータは削除されました。
                      </p>
                      <button className="btn-primary" style={{ background: '#2a9d8f' }} onClick={() => navigate('/')}>トップへ戻る</button>
                    </div>
                  ) : withdrawStep === 1 ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
                      <h3 style={{ fontWeight: 800, marginBottom: 8 }}>退会しますか？</h3>
                      <div style={{ background: '#fee2e2', borderRadius: 10, padding: '12px 14px', marginBottom: 16, textAlign: 'left' }}>
                        <p style={{ fontSize: '0.83rem', color: '#dc2626', fontWeight: 600, marginBottom: 6 }}>退会すると以下のデータが削除されます：</p>
                        <ul style={{ fontSize: '0.82rem', color: '#dc2626', paddingLeft: 18, lineHeight: 1.8 }}>
                          <li>アカウント情報</li>
                          <li>ペット情報</li>
                          <li>相談履歴</li>
                          <li>プラン情報</li>
                        </ul>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 20 }}>この操作は取り消せません。</p>
                      <button
                        style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', marginBottom: 10 }}
                        onClick={() => setWithdrawStep(2)}
                      >次へ（最終確認）</button>
                      <button className="btn-secondary" onClick={() => setShowWithdrawDialog(false)}>キャンセル</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
                      <h3 style={{ fontWeight: 800, marginBottom: 8 }}>最終確認</h3>
                      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>
                        本当に退会しますか？<br />アカウントは完全に削除されます。
                      </p>
                      <button
                        style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', marginBottom: 10 }}
                        onClick={() => { localStorage.clear(); setWithdrawDone(true) }}
                      >退会する</button>
                      <button className="btn-secondary" onClick={() => setWithdrawStep(1)}>戻る</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── ペット情報タブ ── */}
        {activeTab === 'pets' && (
          <>
            {PETS.map(pet => (
              <div key={pet.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpandedPet(expandedPet === pet.id ? null : pet.id)}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>{pet.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pet.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{pet.species}・{pet.breed}</div>
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '1rem' }}>{expandedPet === pet.id ? '▲' : '▼'}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {[
                    { label: '年齢', value: `${pet.age}歳` },
                    { label: '体重', value: pet.weight },
                    { label: '誕生日', value: pet.birthday },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: '8px 4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#264653' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {expandedPet === pet.id && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: '#f9fafb', borderRadius: 10, fontSize: '0.85rem', color: '#264653' }}>
                    <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>メモ：</span>　{pet.note}
                    <div style={{ marginTop: 10 }}>
                      <button className="btn-secondary" style={{ padding: '8px 0', fontSize: '0.82rem' }}>ペット情報を編集</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button className="btn-secondary" style={{ marginTop: 4 }}>＋ ペットを追加</button>
          </>
        )}

        {/* ── プランタブ ── */}
        {activeTab === 'plan' && (
          <>
            {displayPlan === 'bought' ? (
              <>
                {/* Active plan card */}
                <div style={{ background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)', borderRadius: 20, padding: '24px 20px', color: '#fff', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 4 }}>現在のプラン</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>買い切りプラン</div>
                    </div>
                    <span style={{ background: '#f4a261', padding: '4px 12px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 800 }}>有効</span>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>¥14,800</div>
                  <div style={{ opacity: 0.8, fontSize: '0.82rem' }}>購入日：{displayPlanPurchasedAt}</div>
                  <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem' }}>
                    💡 システム利用料が無料
                  </div>
                </div>

                {/* Benefits */}
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>✨ プラン特典</h3>
                  {[
                    { icon: '💴', label: 'システム利用料', value: '無料', highlight: true },
                    { icon: '📞', label: '専用サポート', value: '対応', highlight: false },
                  ].map((b, i, arr) => (
                    <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <span style={{ fontSize: '0.9rem', color: '#264653' }}>{b.icon} {b.label}</span>
                      <span style={{ fontWeight: 700, color: b.highlight ? '#2a9d8f' : '#264653', fontSize: '0.88rem' }}>{b.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Free plan */}
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📋</div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>無料プラン</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>現在は無料プランをご利用中です</p>
                </div>

                {/* Upgrade */}
                <div style={{ background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)', borderRadius: 20, padding: '24px 20px', color: '#fff', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ background: '#f4a261', padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>期間限定</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.7, textDecoration: 'line-through' }}>¥19,800</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>¥14,800 <span style={{ fontSize: '1rem' }}>買い切り</span></div>
                  <p style={{ opacity: 0.85, fontSize: '0.85rem', marginBottom: 16 }}>システム利用料（毎回¥800）が無料になるプラン</p>
                  <button className="btn-primary" style={{ background: '#f4a261' }}>このプランを購入する</button>
                </div>
              </>
            )}

            {/* お支払い設定 */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: '0.95rem' }}>💳 お支払い設定</h3>
              {card ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #e5e7eb', marginBottom: 12 }}>
                    <span style={{ fontSize: '1.6rem' }}>💳</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#264653' }}>{getBrandLabel(card.brand)} **** {card.last4}</div>
                      {card.expMonth && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>有効期限 {String(card.expMonth).padStart(2, '0')}/{card.expYear}</div>}
                    </div>
                    <span style={{ marginLeft: 'auto', background: '#e8f6f5', color: '#2a9d8f', padding: '3px 10px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>登録済み</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setShowCardRegistration(true)}
                      style={{ flex: 1, background: '#e8f6f5', color: '#2a9d8f', border: 'none', borderRadius: 50, padding: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      カードを変更する
                    </button>
                    <button
                      onClick={() => { clearCard(); setCard(null) }}
                      style={{ flex: 1, background: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 50, padding: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 14, lineHeight: 1.6 }}>
                    カードを登録すると相談開始時に仮押さえ、終了後に確定決済されます。
                  </p>
                  <button
                    onClick={() => setShowCardRegistration(true)}
                    className="btn-primary"
                    style={{ background: '#2a9d8f', padding: '12px' }}
                  >
                    ＋ カードを登録する
                  </button>
                </div>
              )}
            </div>

            {/* Payment history */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>📋 支払い履歴</h3>
              {[
                { date: '2024-11-01', label: '買い切りプラン購入', amount: 14800 },
                { date: '2024-12-10', label: '相談料（田中 健一 獣医師）', amount: 4200 },
                { date: '2024-11-25', label: '相談料（鈴木 麻衣 獣医師）', amount: 3800 },
              ].map((p, i, arr) => (
                <div key={p.date + p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.84rem' }}>
                  <div>
                    <div style={{ color: '#264653', fontWeight: 600 }}>{p.label}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: 1 }}>{p.date}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#264653' }}>¥{p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showCardRegistration && (
        <CardRegistration
          onSuccess={() => { setCard(getStoredCard()); setShowCardRegistration(false) }}
          onClose={() => setShowCardRegistration(false)}
        />
      )}
    </div>
  )
}
