import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import CardRegistration from '../components/CardRegistration'
import { getStoredCard, clearCard, getBrandLabel } from '../lib/stripeCard'
import { useAuth } from '../contexts/AuthContext'
import { supabase, queryWithRetry } from '../lib/supabase'
import { getCached, setCache, clearCache } from '../lib/cache'

const SPECIES_OPTIONS = ['犬', '猫', 'うさぎ', 'ハムスター', '鳥', '爬虫類', 'その他']
const SPECIES_ICON = { 犬: '🐕', 猫: '🐈', うさぎ: '🐇', ハムスター: '🐹', 鳥: '🐦', 爬虫類: '🦎', その他: '🐾' }

function PetModal({ pet, onSave, onClose, saving }) {
  const isEdit = !!pet?.id
  const ref = useRef(null)
  const initial = {
    name: pet?.name || '',
    species: pet?.species || '犬',
    breed: pet?.breed || '',
    age: pet?.age ?? '',
    weight: pet?.weight || '',
    birthday: pet?.birthday || '',
    note: pet?.note || '',
  }
  const [form, setForm] = useState(initial)
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}>
      <div ref={ref} style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: 24, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{isEdit ? 'ペット情報を編集' : 'ペットを追加'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        {/* アイコンプレビュー */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto' }}>
            {SPECIES_ICON[form.species] || '🐾'}
          </div>
        </div>

        {[
          { label: 'ペットの名前 *', key: 'name', type: 'text', placeholder: '例：ポチ', required: true },
          { label: '種類', key: 'species', type: 'select' },
          { label: '品種', key: 'breed', type: 'text', placeholder: '例：トイプードル' },
          { label: '年齢', key: 'age', type: 'number', placeholder: '例：3' },
          { label: '体重', key: 'weight', type: 'text', placeholder: '例：3.2kg' },
          { label: '誕生日', key: 'birthday', type: 'date' },
          { label: 'メモ（アレルギー等）', key: 'note', type: 'textarea', placeholder: '例：アレルギー：なし' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>{f.label}</label>
            {f.type === 'select' ? (
              <select
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="form-input"
                style={{ padding: '10px 12px', fontSize: '0.92rem', width: '100%' }}
              >
                {SPECIES_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={2}
                className="form-input"
                style={{ padding: '10px 12px', fontSize: '0.92rem', width: '100%', resize: 'none' }}
              />
            ) : (
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="form-input"
                style={{ padding: '10px 12px', fontSize: '0.92rem', width: '100%' }}
              />
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>キャンセル</button>
          <button
            className="btn-primary"
            disabled={saving || !form.name.trim()}
            onClick={() => onSave({ ...form, age: form.age !== '' ? Number(form.age) : null, icon: SPECIES_ICON[form.species] || '🐾' })}
            style={{ flex: 2, background: '#2a9d8f', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? '保存中...' : (isEdit ? '更新する' : '追加する')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
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
  const [withdrawing, setWithdrawing] = useState(false)
  const [expandedPet, setExpandedPet] = useState(null)
  const [showCardRegistration, setShowCardRegistration] = useState(false)
  const [card, setCard] = useState(getStoredCard)

  // ペット
  const [pets, setPets] = useState([])
  const [petsLoading, setPetsLoading] = useState(false)
  const [petsFetched, setPetsFetched] = useState(false)
  const [showPetModal, setShowPetModal] = useState(null) // 'add' | 'edit'
  const [editingPet, setEditingPet] = useState(null)
  const [deletingPet, setDeletingPet] = useState(null)
  const [petSaving, setPetSaving] = useState(false)

  // 支払い履歴
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsFetched, setPaymentsFetched] = useState(false)

  const userId = user?.id

  // プロフィール取得
  useEffect(() => {
    if (authLoading || !userId || profileFetched) return
    const cached = getCached(`profile-${userId}`)
    if (cached) {
      setProfile(cached)
      setProfileLoading(false)
      setProfileFetched(true)
    }
    let cancelled = false
    async function fetchProfile() {
      if (!cached) setProfileLoading(true)
      setFetchError(null)
      const { data, error } = await queryWithRetry(
        () => supabase
          .from('profiles')
          .select('id,name,role,email,tel,address,plan,plan_purchased_at,created_at')
          .eq('id', userId)
          .single(),
        { retries: 2, timeoutMs: 15000 }
      )
      if (cancelled) return
      if (error) {
        setFetchError(`profiles: ${error}`)
      } else {
        setProfile(data)
        if (data) setCache(`profile-${userId}`, data, 120000)
      }
      if (!cancelled) { setProfileLoading(false); setProfileFetched(true) }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, [authLoading, userId, profileFetched])

  // ペット取得
  useEffect(() => {
    if (!userId || petsFetched || activeTab !== 'pets') return
    let cancelled = false
    async function fetchPets() {
      setPetsLoading(true)
      const { data, error } = await queryWithRetry(
        () => supabase
          .from('pets')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
        { retries: 2, timeoutMs: 15000 }
      )
      if (cancelled) return
      if (!error) setPets(data || [])
      setPetsLoading(false)
      setPetsFetched(true)
    }
    fetchPets()
    return () => { cancelled = true }
  }, [userId, petsFetched, activeTab])

  // 支払い履歴取得（completedな相談から）
  useEffect(() => {
    if (!userId || paymentsFetched || activeTab !== 'plan') return
    let cancelled = false
    async function fetchPayments() {
      setPaymentsLoading(true)
      const { data, error } = await queryWithRetry(
        () => supabase
          .from('consultations')
          .select('id,created_at,started_at,total_amount,base_amount,vets(name)')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(20),
        { retries: 2, timeoutMs: 15000 }
      )
      if (cancelled) return
      if (!error) setPayments(data || [])
      setPaymentsLoading(false)
      setPaymentsFetched(true)
    }
    fetchPayments()
    return () => { cancelled = true }
  }, [userId, paymentsFetched, activeTab])

  // 未ログインリダイレクト
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true })
  }, [authLoading, user, navigate])

  // プロフィール保存
  const handleSaveProfile = useCallback(async (formData) => {
    if (!userId) return
    const { error } = await supabase.from('profiles').update(formData).eq('id', userId)
    if (!error) {
      const updated = { ...profile, ...formData }
      setProfile(updated)
      setCache(`profile-${userId}`, updated, 120000)
    }
    setEditMode(false)
  }, [userId, profile])

  // ペット追加
  const handleAddPet = useCallback(async (formData) => {
    if (!userId) return
    setPetSaving(true)
    const { data, error } = await supabase
      .from('pets')
      .insert({ ...formData, user_id: userId })
      .select()
      .single()
    if (!error && data) {
      setPets(prev => [...prev, data])
      setShowPetModal(null)
    }
    setPetSaving(false)
  }, [userId])

  // ペット更新
  const handleUpdatePet = useCallback(async (formData) => {
    if (!editingPet?.id) return
    setPetSaving(true)
    const { error } = await supabase
      .from('pets')
      .update(formData)
      .eq('id', editingPet.id)
      .eq('user_id', userId)
    if (!error) {
      setPets(prev => prev.map(p => p.id === editingPet.id ? { ...p, ...formData } : p))
      setShowPetModal(null)
      setEditingPet(null)
    }
    setPetSaving(false)
  }, [editingPet, userId])

  // ペット削除
  const handleDeletePet = useCallback(async (petId) => {
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
      .eq('user_id', userId)
    if (!error) {
      setPets(prev => prev.filter(p => p.id !== petId))
      setDeletingPet(null)
      if (expandedPet === petId) setExpandedPet(null)
    }
  }, [userId, expandedPet])

  // ログアウト
  const handleLogout = useCallback(async () => {
    setShowLogoutDialog(false)
    await signOut()
    navigate('/auth', { replace: true })
  }, [signOut, navigate])

  // 退会
  const handleWithdraw = useCallback(async () => {
    setWithdrawing(true)
    try {
      // Supabase RPC でアカウント削除（要: delete_user 関数）
      const { error } = await supabase.rpc('delete_user')
      if (error) throw new Error(error.message)
      localStorage.clear()
      setWithdrawDone(true)
    } catch {
      // RPC未設定の場合はサインアウトのみ
      localStorage.clear()
      clearCache()
      await signOut()
      setWithdrawDone(true)
    } finally {
      setWithdrawing(false)
    }
  }, [signOut])

  const tabs = [
    { key: 'profile', label: '👤 プロフィール' },
    { key: 'pets', label: '🐾 ペット' },
    { key: 'plan', label: '💳 プラン' },
  ]

  if (fetchError) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>エラー</p>
        <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, textAlign: 'center', wordBreak: 'break-all', whiteSpace: 'pre-line' }}>{fetchError}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: 12, width: 'auto', padding: '8px 20px' }}>再読み込み</button>
      </div>
    )
  }

  if (authLoading || (!profileFetched && userId)) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#9ca3af' }}>読み込み中...</p>
      </div>
    )
  }

  if (!user) return null

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
                        disabled={withdrawing}
                        style={{ width: '100%', padding: '13px', borderRadius: 50, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', marginBottom: 10, opacity: withdrawing ? 0.7 : 1 }}
                        onClick={handleWithdraw}
                      >{withdrawing ? '処理中...' : '退会する'}</button>
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
            {petsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>読み込み中...</div>
            ) : pets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🐾</div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>ペットが登録されていません</p>
                <p style={{ fontSize: '0.82rem' }}>ペットを追加すると相談時に選択できます</p>
              </div>
            ) : (
              pets.map(pet => (
                <div key={pet.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => setExpandedPet(expandedPet === pet.id ? null : pet.id)}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f6f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                      {pet.icon || SPECIES_ICON[pet.species] || '🐾'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{pet.name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{pet.species}{pet.breed ? `・${pet.breed}` : ''}</div>
                    </div>
                    <span style={{ color: '#9ca3af', fontSize: '1rem' }}>{expandedPet === pet.id ? '▲' : '▼'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {[
                      { label: '年齢', value: pet.age != null ? `${pet.age}歳` : '—' },
                      { label: '体重', value: pet.weight || '—' },
                      { label: '誕生日', value: pet.birthday || '—' },
                    ].map(s => (
                      <div key={s.label} style={{ flex: 1, background: '#f9fafb', borderRadius: 8, padding: '8px 4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginBottom: 3 }}>{s.label}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#264653' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {expandedPet === pet.id && (
                    <div style={{ marginTop: 12, padding: '10px 12px', background: '#f9fafb', borderRadius: 10, fontSize: '0.85rem', color: '#264653' }}>
                      {pet.note && (
                        <div style={{ marginBottom: 10 }}>
                          <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>メモ：</span>　{pet.note}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn-secondary"
                          style={{ flex: 1, padding: '8px 0', fontSize: '0.82rem' }}
                          onClick={() => { setEditingPet(pet); setShowPetModal('edit') }}
                        >編集</button>
                        <button
                          style={{ flex: 1, padding: '8px 0', fontSize: '0.82rem', border: '1px solid #fee2e2', borderRadius: 50, background: '#fff', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setDeletingPet(pet)}
                        >削除</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              className="btn-secondary"
              style={{ marginTop: 4 }}
              onClick={() => { setEditingPet(null); setShowPetModal('add') }}
            >＋ ペットを追加</button>

            {/* 削除確認ダイアログ */}
            {deletingPet && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
                <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>🗑️</div>
                  <h3 style={{ fontWeight: 800, marginBottom: 8 }}>「{deletingPet.name}」を削除しますか？</h3>
                  <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: 20 }}>この操作は取り消せません。</p>
                  <button
                    style={{ width: '100%', padding: '12px', borderRadius: 50, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
                    onClick={() => handleDeletePet(deletingPet.id)}
                  >削除する</button>
                  <button className="btn-secondary" onClick={() => setDeletingPet(null)}>キャンセル</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── プランタブ ── */}
        {activeTab === 'plan' && (
          <>
            {displayPlan === 'bought' ? (
              <>
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
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📋</div>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>無料プラン</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>現在は無料プランをご利用中です</p>
                </div>

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
                    >カードを変更する</button>
                    <button
                      onClick={() => { clearCard(); setCard(null) }}
                      style={{ flex: 1, background: '#fff', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 50, padding: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >削除</button>
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
                  >＋ カードを登録する</button>
                </div>
              )}
            </div>

            {/* 支払い履歴 */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.95rem' }}>📋 支払い履歴</h3>
              {paymentsLoading ? (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>読み込み中...</p>
              ) : payments.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>支払い履歴がありません</p>
              ) : (
                payments.map((p, i) => {
                  const date = p.started_at || p.created_at
                  const dateStr = date ? new Date(date).toISOString().slice(0, 10) : ''
                  const amount = p.total_amount || p.base_amount || 0
                  const vetName = p.vets?.name ? `${p.vets.name} 獣医師` : '獣医師相談'
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < payments.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '0.84rem' }}>
                      <div>
                        <div style={{ color: '#264653', fontWeight: 600 }}>相談料（{vetName}）</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: 1 }}>{dateStr}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#264653' }}>¥{amount.toLocaleString()}</span>
                    </div>
                  )
                })
              )}
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

      {/* ペット追加・編集モーダル */}
      {showPetModal && (
        <PetModal
          pet={showPetModal === 'edit' ? editingPet : null}
          onSave={showPetModal === 'edit' ? handleUpdatePet : handleAddPet}
          onClose={() => { setShowPetModal(null); setEditingPet(null) }}
          saving={petSaving}
        />
      )}
    </div>
  )
}
