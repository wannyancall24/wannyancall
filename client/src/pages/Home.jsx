import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, supabaseReady } from '../lib/supabase'
import { SYMPTOM_ARTICLES } from '../data/symptomArticles'

const REQUESTS_KEY = 'exoticRequests'
function loadRequests() {
  try { return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [] } catch { return [] }
}
function saveRequests(reqs) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs))
}

const DOG_CAT_PRICES = [
  { label: '基本相談 15分', price: '3,000円', bold: true },
  { label: '延長 +5分', price: '+1,000円' },
  { label: '延長 +15分', price: '+3,000円' },
  { label: '夜間加算（20〜22時）', price: '+1,000円', dim: true },
  { label: '深夜加算（22〜8時）', price: '+1,500円', dim: true },
  { label: '指名料', price: '+500円', note: '全額獣医師へ' },
  { label: 'システム利用料', price: '800円', dim: true },
]

const EXOTIC_PRICES = [
  { label: '基本相談 15分', price: '4,500円', bold: true },
  { label: '延長 +5分', price: '+1,500円' },
  { label: '延長 +15分', price: '+4,500円' },
  { label: '夜間加算（20〜22時）', price: '+1,000円', dim: true },
  { label: '深夜加算（22〜8時）', price: '+1,500円', dim: true },
  { label: '指名料', price: '+500円', note: '全額獣医師へ' },
  { label: 'システム利用料', price: '800円', dim: true },
]

const ANIMAL_TYPES = [
  'うさぎ', 'ハムスター', 'モルモット', 'フェレット',
  'チンチラ', 'デグー', 'セキセイインコ', 'オカメインコ',
  '文鳥', 'コザクラインコ', 'ヘビ', 'トカゲ', 'カメ', 'カエル', 'その他',
]

function PriceTable({ items }) {
  return (
    <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14 }}>
      {items.map((item, i) => (
        <div key={item.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 0',
          borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', opacity: item.dim ? 0.7 : 0.95 }}>{item.label}</span>
            {item.note && <span style={{ fontSize: '0.72rem', opacity: 0.65, marginLeft: 6 }}>({item.note})</span>}
          </div>
          <span style={{ fontWeight: item.bold ? 800 : 600, fontSize: item.bold ? '1rem' : '0.9rem' }}>{item.price}</span>
        </div>
      ))}
    </div>
  )
}

// Modal for exotic animal consultation request
function ExoticModal({ onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'sent' | 'approved' | 'rejected'
  const [requestId, setRequestId] = useState(null)
  const [animalType, setAnimalType] = useState('')
  const [animalName, setAnimalName] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [imageData, setImageData] = useState(null)
  const [imageName, setImageName] = useState('')
  const [videoName, setVideoName] = useState('')
  const [errors, setErrors] = useState({})
  const imageRef = useRef()
  const videoRef = useRef()

  // 獣医師が承諾/お断りしたら更新
  useEffect(() => {
    if (!requestId) return
    const handler = () => {
      const reqs = loadRequests()
      const req = reqs.find(r => r.id === requestId)
      if (req?.status === 'approved') setStep('approved')
      if (req?.status === 'rejected') setStep('rejected')
    }
    window.addEventListener('exoticRequestUpdated', handler)
    return () => window.removeEventListener('exoticRequestUpdated', handler)
  }, [requestId])

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageName(file.name)
    const reader = new FileReader()
    reader.onload = ev => setImageData(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleVideoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setVideoName(file.name)
  }

  function validate() {
    const e = {}
    if (!animalType) e.animalType = '動物の種類を選択してください'
    if (!symptoms.trim()) e.symptoms = '症状・状況を入力してください'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    const id = Date.now()
    const newReq = {
      id, animalType, animalName, symptoms,
      imageData, imageName, videoName,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
    const reqs = loadRequests()
    saveRequests([...reqs, newReq])
    window.dispatchEvent(new Event('exoticRequestUpdated'))
    setRequestId(id)
    setStep('sent')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0',
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        padding: '24px 20px 40px'
      }}>
        {step === 'form' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#264653' }}>🐹 相談内容の入力</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 3 }}>獣医師が確認・承諾後に相談を開始します</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>✕</button>
            </div>

            <div style={{ background: '#e8f6f5', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '0.82rem', color: '#2a9d8f', lineHeight: 1.6 }}>
              小動物・鳥・エキゾチックアニマルは専門知識が必要なため、獣医師が対応可否を確認してから相談を開始します。
            </div>

            <div className="form-group">
              <label className="form-label">動物の種類 <span style={{ color: '#e05555' }}>*</span></label>
              <select className="form-select" value={animalType}
                onChange={e => { setAnimalType(e.target.value); setErrors(v => ({ ...v, animalType: '' })) }}
                style={{ border: errors.animalType ? '1.5px solid #e05555' : undefined }}>
                <option value="">選択してください</option>
                {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.animalType && <div style={{ color: '#e05555', fontSize: '0.78rem', marginTop: 4 }}>{errors.animalType}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">動物の名前（任意）</label>
              <input className="form-input" type="text" placeholder="例：ぴょん" value={animalName} onChange={e => setAnimalName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">症状・状況 <span style={{ color: '#e05555' }}>*</span></label>
              <textarea className="form-input" rows={4}
                placeholder="例：昨日から食欲がなく元気がありません。いつ頃からどんな症状か、できるだけ詳しく教えてください。"
                value={symptoms}
                onChange={e => { setSymptoms(e.target.value); setErrors(v => ({ ...v, symptoms: '' })) }}
                style={{ resize: 'none', border: errors.symptoms ? '1.5px solid #e05555' : undefined }} />
              {errors.symptoms && <div style={{ color: '#e05555', fontSize: '0.78rem', marginTop: 4 }}>{errors.symptoms}</div>}
            </div>

            {/* 画像アップロード */}
            <div className="form-group">
              <label className="form-label">画像を送る（任意）</label>
              <input ref={imageRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <div onClick={() => imageRef.current.click()} style={{
                border: '1.5px dashed #2a9d8f', borderRadius: 10, padding: '14px',
                textAlign: 'center', cursor: 'pointer', background: imageData ? '#e8f6f5' : '#f9fafb'
              }}>
                {imageData ? (
                  <>
                    <img src={imageData} alt="プレビュー" style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 8, marginBottom: 4 }} />
                    <div style={{ fontSize: '0.78rem', color: '#2a9d8f' }}>✅ {imageName}（タップして変更）</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '1.6rem' }}>🖼️</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>タップして画像を選択</div>
                  </>
                )}
              </div>
            </div>

            {/* 動画アップロード */}
            <div className="form-group">
              <label className="form-label">動画を送る（任意）</label>
              <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoChange} />
              <div onClick={() => videoRef.current.click()} style={{
                border: '1.5px dashed #2a9d8f', borderRadius: 10, padding: '14px',
                textAlign: 'center', cursor: 'pointer', background: videoName ? '#e8f6f5' : '#f9fafb'
              }}>
                {videoName ? (
                  <div style={{ fontSize: '0.82rem', color: '#2a9d8f' }}>✅ {videoName}（タップして変更）</div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.6rem' }}>🎥</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: 4 }}>タップして動画を選択</div>
                  </>
                )}
              </div>
            </div>

            <button className="btn-primary" onClick={handleSubmit} style={{ background: '#2a9d8f' }}>
              獣医師に確認を依頼する →
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', width: '100%', marginTop: 10, padding: 10, color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer' }}>
              キャンセル
            </button>
          </>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#264653', marginBottom: 10 }}>
              承諾待ちです
            </div>
            <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
              獣医師が内容を確認しています。<br />
              承諾後に相談を開始できます。<br />
              <span style={{ color: '#2a9d8f', fontWeight: 600 }}>通常15〜30分以内に返答</span>いたします。
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px', textAlign: 'left', marginBottom: 20, fontSize: '0.85rem', color: '#264653' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>送信内容</div>
              <div>動物の種類：{animalType}</div>
              {animalName && <div>名前：{animalName}</div>}
              <div style={{ marginTop: 6, color: '#6b7280', whiteSpace: 'pre-wrap', fontSize: '0.82rem' }}>{symptoms}</div>
              {imageData && <div style={{ marginTop: 6 }}><img src={imageData} alt="送信画像" style={{ width: '100%', borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} /></div>}
              {videoName && <div style={{ marginTop: 6, color: '#6b7280', fontSize: '0.78rem' }}>🎥 {videoName}</div>}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: 20 }}>
              対応できない場合は近くの動物病院をご案内・自動返金されます。
            </div>
            <button className="btn-primary" onClick={onClose} style={{ background: '#2a9d8f' }}>閉じる</button>
          </div>
        )}

        {step === 'approved' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2a9d8f', marginBottom: 10 }}>承諾されました！</div>
            <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
              獣医師が相談を承諾しました。<br />そのまま相談を開始してください。
            </div>
            <button className="btn-primary" onClick={onClose} style={{ background: '#2a9d8f' }}>相談を開始する →</button>
          </div>
        )}

        {step === 'rejected' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>😔</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#264653', marginBottom: 10 }}>お断りされました</div>
            <div style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
              大変申し訳ありません。今回の相談は対応できませんでした。<br />
              <span style={{ color: '#2a9d8f', fontWeight: 600 }}>自動返金</span>いたします。
            </div>
            <div style={{ background: '#e8f6f5', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: '0.85rem', color: '#2a9d8f' }}>
              近くの動物病院を探す場合は「獣医師を探す」からご確認ください。
            </div>
            <button className="btn-primary" onClick={onClose} style={{ background: '#2a9d8f' }}>閉じる</button>
          </div>
        )}
      </div>
    </div>
  )
}

function ConsultConfirmDialog({ onConfirm, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 360, padding: '28px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#264653', marginBottom: 12, lineHeight: 1.5 }}>
            ご確認ください
          </div>
          <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>
            本サービスは獣医療行為ではありません。<br />
            緊急の場合は必ず動物病院を受診してください。
          </div>
        </div>
        <button
          onClick={onConfirm}
          style={{ width: '100%', background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: 50, padding: '13px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginBottom: 10 }}
        >
          確認しました
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', width: '100%', padding: 8, color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer' }}>
          キャンセル
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [expandDogCat, setExpandDogCat] = useState(false)
  const [expandExotic, setExpandExotic] = useState(false)
  const [showExoticModal, setShowExoticModal] = useState(false)
  const [consultConfirm, setConsultConfirm] = useState(null) // null | 'dogcat' | 'exotic'
  const [vets, setVets] = useState([])

  useEffect(() => {
    if (!supabaseReady) return
    supabase
      .from('vets')
      .select('id,name,specialty,photo,rating,review_count,available_animals,is_online')
      .order('rating', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setVets(data) })
  }, [])

  function handleConsultClick(type) {
    setConsultConfirm(type)
  }

  function handleConsultConfirm() {
    const type = consultConfirm
    setConsultConfirm(null)
    if (type === 'dogcat') navigate('/find')
    if (type === 'exotic') setShowExoticModal(true)
  }

  return (
    <div className="page">
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
        padding: '20px 20px 24px', color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)'
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              background: '#22c55e', color: '#fff',
              padding: '4px 12px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              オンライン獣医師 12名
            </span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.35, marginBottom: 8 }}>
            深夜でも、田舎でも<br />獣医師に相談できる
          </h1>
          <p style={{ fontSize: '0.88rem', opacity: 0.9, marginBottom: 16, lineHeight: 1.5 }}>
            24時間365日、自宅から獣医師に相談。最短でつながる。
          </p>
          <button className="btn-primary" style={{ background: '#f4a261', fontSize: '1rem', padding: '13px' }}
            onClick={() => navigate('/find')}>
            今すぐ獣医師を探す →
          </button>
        </div>
      </section>

      {/* Symptom Articles */}
      <section className="section">
        <h2 className="section-title">🔎 症状から調べる</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.values(SYMPTOM_ARTICLES).map((a) => (
            <button
              key={a.slug}
              onClick={() => navigate(`/article/${a.slug}`)}
              style={{
                background: '#e8f6f5',
                color: '#2a9d8f',
                border: '1px solid #b2dfd9',
                borderRadius: 50,
                padding: '7px 14px',
                fontSize: '0.83rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {a.emoji} {a.animalType}の{a.symptom}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <h2 className="section-title">🐾 すべて込みのサービス</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '💬', title: 'チャット', desc: 'テキストでいつでも' },
            { icon: '🖼️', title: '画像送信', desc: '症状の写真を共有' },
            { icon: '🎥', title: '動画送信', desc: '歩き方・様子を確認' },
            { icon: '📹', title: 'ビデオ通話', desc: 'リアルタイムで相談' },
          ].map((s) => (
            <div key={s.title} className="card" style={{ margin: 0, textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Guarantees */}
        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {[
            { icon: '⚡', text: '事前審査なし・最短でつながる', sub: '登録後すぐに獣医師に相談できます' },
            { icon: '💰', text: '対応不可なら全額返金', sub: '獣医師が対応できない場合は全額返金＋近くの動物病院をご案内' },
          ].map(g => (
            <div key={g.icon} style={{ background: '#e8f6f5', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{g.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2a9d8f' }}>{g.text}</div>
                <div style={{ fontSize: '0.8rem', color: '#5a8fa3', marginTop: 2 }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Area Cards */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">💴 料金・今すぐ相談する</h2>

        {/* 犬・猫 */}
        <div style={{
          background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
          borderRadius: 16, padding: 20, color: '#fff', marginBottom: 14, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>🐕 犬・猫</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>基本料金</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>3,000円〜</div>
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ background: '#f4a261', marginTop: 12, fontSize: '0.95rem', padding: '11px' }}
            onClick={() => handleConsultClick('dogcat')}
          >
            今すぐ相談する →
          </button>
          <button
            onClick={() => setExpandDogCat(v => !v)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, color: '#fff', width: '100%', marginTop: 10, padding: '8px', fontSize: '0.83rem', cursor: 'pointer' }}
          >
            {expandDogCat ? '▲ 料金詳細を閉じる' : '▼ 料金詳細を見る'}
          </button>
          {expandDogCat && <PriceTable items={DOG_CAT_PRICES} />}
        </div>

        {/* 小動物・鳥・エキゾチック */}
        <div style={{
          background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
          borderRadius: 16, padding: 20, color: '#fff', marginBottom: 14, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>🐹 小動物・鳥・エキゾチック</div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>基本料金</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>4,500円〜</div>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.8, marginBottom: 2 }}>
            ※ 獣医師が症状を確認後に相談開始
          </div>
          <button
            className="btn-primary"
            style={{ background: '#f4a261', marginTop: 10, fontSize: '0.95rem', padding: '11px' }}
            onClick={() => handleConsultClick('exotic')}
          >
            今すぐ相談する →
          </button>
          <button
            onClick={() => setExpandExotic(v => !v)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 8, color: '#fff', width: '100%', marginTop: 10, padding: '8px', fontSize: '0.83rem', cursor: 'pointer' }}
          >
            {expandExotic ? '▲ 料金詳細を閉じる' : '▼ 料金詳細を見る'}
          </button>
          {expandExotic && <PriceTable items={EXOTIC_PRICES} />}
        </div>

        {/* 買い切りプラン */}
        <div style={{
          background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
          borderRadius: 16, padding: 20, color: '#fff', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ background: '#f4a261', padding: '2px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>期間限定</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.65, textDecoration: 'line-through' }}>¥19,800</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>¥14,800 <span style={{ fontSize: '1rem', fontWeight: 600 }}>買い切り</span></div>
          <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>システム利用料（毎回¥800）が無料になるプラン</p>
          <button className="btn-primary" style={{ marginTop: 14, background: '#f4a261' }}>このプランを購入する</button>
        </div>

        {/* Emergency note */}
        <p style={{ fontSize: '0.78rem', color: '#6b7280', textAlign: 'center', marginTop: 14 }}>
          緊急の場合は必ず動物病院を受診してください。
        </p>
      </section>

      {/* Time Comparison */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">⚡ 時間削減効果</h2>
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 4px', color: '#6b7280', fontWeight: 600, borderBottom: '2px solid #e5e7eb', width: '40%' }}>項目</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', color: '#2a9d8f', fontWeight: 700, borderBottom: '2px solid #e5e7eb', width: '30%' }}>🏥 対面</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', color: '#2a9d8f', fontWeight: 700, borderBottom: '2px solid #e5e7eb', width: '30%' }}>💻 オンライン</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '移動時間（往路）', face: '20〜40分', online: '0分' },
                { label: '受付待ち時間', face: '30〜40分', online: '予約制のため短縮' },
                { label: '相談時間', face: '20〜30分', online: '15分〜' },
                { label: '会計待ち時間', face: '10分', online: 'オンライン決済' },
                { label: '移動時間（復路）', face: '20〜40分', online: '0分' },
              ].map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                  <td style={{ padding: '10px 4px', color: '#264653' }}>{row.label}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'left', color: '#2a9d8f', fontWeight: 600 }}>{row.face}</td>
                  <td style={{ padding: '10px 4px', textAlign: 'left', color: '#2a9d8f', fontWeight: 700 }}>{row.online}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #2a9d8f', background: '#e8f6f5' }}>
                <td style={{ padding: '12px 4px', fontWeight: 800, color: '#264653' }}>合計</td>
                <td style={{ padding: '12px 4px', textAlign: 'left', fontWeight: 800, color: '#2a9d8f' }}>115〜180分</td>
                <td style={{ padding: '12px 4px', textAlign: 'left', fontWeight: 800, color: '#2a9d8f' }}>
                  <span style={{ display: 'inline-block' }}>
                    <div>大幅短縮</div>
                    <div style={{ width: '100%', height: 2, background: '#ff9966', marginTop: 4 }} />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 16, background: '#e8f6f5', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, color: '#5a85a0', fontSize: '0.95rem' }}>
              移動・待ち時間を大幅に削減。<br />ペットのそばで相談できます。
            </p>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">📋 相談の流れ</h2>
        <div className="card">
          {[
            { step: 1, icon: '👨‍⚕️', title: '獣医師を選ぶ', desc: '空いている獣医師に最短でつながる（指名する場合は+500円）' },
            { step: 2, icon: '💬', title: '相談方法を選ぶ', desc: 'チャット／画像・動画送信／ビデオ通話' },
            { step: 3, icon: '🐾', title: '相談する', descLines: [
              '犬・猫：相談する（獣医師が応答次第つながる）',
              '小動物・鳥・エキゾチック：相談する（獣医師が承諾後につながる）',
            ]},
            { step: 4, icon: '✅', title: '決済完了', desc: '相談後に自動決済' },
          ].map((f, i) => (
            <div key={f.step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: i < 3 ? 16 : 0, marginBottom: i < 3 ? 16 : 0, borderBottom: i < 3 ? '1px dashed #e5e7eb' : 'none' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#2a9d8f',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
              }}>{f.step}</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{f.icon} {f.title}</div>
                {f.descLines ? (
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {f.descLines.map((line, li) => <div key={li}>{line}</div>)}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{f.desc}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vet List */}
      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">👨‍⚕️ 在籍獣医師</h2>
        {vets.map((v) => (
          <div key={v.id} className="card" onClick={() => navigate(`/vet/${v.id}`)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#e8f6f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0
              }}>{v.photo || '👨‍⚕️'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{v.name}</span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.is_online ? '#22c55e' : '#9ca3af', display: 'inline-block' }} />
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 6 }}>{v.specialty}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className="stars">{'★'.repeat(Math.floor(v.rating ?? 0))}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.rating ?? '-'}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>({v.review_count ?? 0}件)</span>
                </div>
                <div>{(v.available_animals || []).map(t => <span key={t} className="tag">{t}</span>)}</div>
              </div>
            </div>
          </div>
        ))}
        <button className="btn-secondary" onClick={() => navigate('/find')}>すべての獣医師を見る</button>
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

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e5e7eb', padding: '20px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 10 }}>© 2024 WanNyanCall24</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/tokushoho" style={{ fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none' }}>
            📄 特定商取引法に基づく表記
          </Link>
          <Link to="/terms" style={{ fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none' }}>
            利用規約
          </Link>
          <Link to="/privacy" style={{ fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none' }}>
            プライバシーポリシー
          </Link>
        </div>
      </footer>

      {/* Exotic Modal */}
      {showExoticModal && <ExoticModal onClose={() => setShowExoticModal(false)} />}

      {/* Consult Confirm Dialog */}
      {consultConfirm && (
        <ConsultConfirmDialog
          onConfirm={handleConsultConfirm}
          onClose={() => setConsultConfirm(null)}
        />
      )}
    </div>
  )
}
