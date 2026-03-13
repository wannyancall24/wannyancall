import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const INQUIRY_KEY = 'vetRecruitInquiries'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://wannyancall24.com/vet-recruit',
      url: 'https://wannyancall24.com/vet-recruit',
      name: '獣医師パートナー募集 | WanNyanCall24',
      description: '獣医師の副業・在宅ワーク。オンライン相談で月5〜20万円の副収入。夜間・深夜対応で高単価。登録・月額費用完全無料。',
      isPartOf: { '@id': 'https://wannyancall24.com/' },
    },
    {
      '@type': 'JobPosting',
      title: 'オンライン獣医師（副業・業務委託）',
      description: 'ペットオーナーとオンラインビデオ通話で相談対応。在宅・スキマ時間OK。夜間・深夜対応で高単価報酬。登録無料。',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'WanNyanCall24',
        sameAs: 'https://wannyancall24.com',
      },
      jobLocation: {
        '@type': 'Place',
        address: { '@type': 'PostalAddress', addressCountry: 'JP' },
      },
      jobLocationType: 'TELECOMMUTE',
      employmentType: 'CONTRACTOR',
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'JPY',
        value: { '@type': 'QuantitativeValue', minValue: 1500, maxValue: 3500, unitText: 'HOUR' },
      },
      qualifications: '獣医師免許保持者',
      datePosted: '2024-01-01',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '登録・月額費用はかかりますか？',
          acceptedAnswer: { '@type': 'Answer', text: '完全無料です。登録費用・月額費用は一切かかりません。稼いだ分だけ報酬が入ります。' },
        },
        {
          '@type': 'Question',
          name: '副業として兼業できますか？',
          acceptedAnswer: { '@type': 'Answer', text: 'はい。動物病院勤務の傍らスキマ時間に対応できます。対応時間は自分で設定できます。' },
        },
        {
          '@type': 'Question',
          name: '報酬はどのくらいになりますか？',
          acceptedAnswer: { '@type': 'Answer', text: '1相談（15分）あたり1,500円〜（相談料の50%）。夜間・深夜は加算あり。指名料は全額獣医師へ。月10〜20件対応で約15,000〜30,000円の副収入が目安です。' },
        },
        {
          '@type': 'Question',
          name: 'どんな相談が来ますか？',
          acceptedAnswer: { '@type': 'Answer', text: '犬・猫の体調不良、食欲不振、受診すべきか否かの判断、手術後のケア方法など、日常的なペットの健康相談が中心です。' },
        },
      ],
    },
  ],
}

const MERITS = [
  { icon: '💰', title: '1相談1,500円〜', sub: '相談料50%＋指名料100%', desc: '15分相談で1,500円〜。夜間・深夜は加算あり。指名料は全額あなたへ。' },
  { icon: '🏠', title: '完全在宅・フルリモート', sub: '自宅・好きな場所から対応', desc: 'スマホ・PCで対応可能。通勤ゼロ。白衣不要。自分のペースで働けます。' },
  { icon: '⏰', title: 'スキマ時間でOK', sub: '1日30分からでも稼げる', desc: '勤務時間は自由設定。動物病院の休憩時間や帰宅後の時間を有効活用。' },
  { icon: '🌙', title: '夜間・深夜対応で高単価', sub: '需要が高い時間帯に集中', desc: '夜間（20〜22時）+500円、深夜（22〜8時）+750円の加算。需要が高い時間帯に稼げます。' },
  { icon: '📋', title: '登録・月額費用 完全無料', sub: 'ノーリスクで始められる', desc: '初期費用・月額費用ゼロ。稼いだ分だけ報酬が入るシンプルな仕組みです。' },
  { icon: '🐾', title: '専門知識を社会貢献に', sub: '深夜に困るペットオーナーを救う', desc: '夜中に「どうしよう」と不安なオーナーに寄り添えるのは獣医師だけです。' },
]

const STEPS = [
  { step: '01', title: '無料登録', desc: '氏名・メール・獣医師免許番号を入力して仮登録。審査は通常1〜3営業日。' },
  { step: '02', title: '審査・本登録', desc: '獣医師免許証画像をアップロード。審査通過後、プロフィールを設定して本登録完了。' },
  { step: '03', title: 'オンライン対応スタート', desc: 'ステータスを「対応中」にすると相談リクエストが届きます。ビデオ通話で相談対応。' },
  { step: '04', title: '報酬受け取り', desc: '毎月2回払い（1〜15日分は15日締め22日払い、16〜末日分は末日締め翌月7日払い）。銀行振込で報酬をお受け取りいただけます。' },
]

const FAQS = [
  { q: '現在、動物病院で勤務中ですが副業できますか？', a: 'はい。業務委託契約のため、勤務先の就業規則で副業が禁止されていなければ問題なく兼業できます。対応時間は完全に自由に設定できます。' },
  { q: '獣医師免許さえあれば応募できますか？', a: 'はい、日本の獣医師免許をお持ちであれば、経験年数・専門分野問わずご応募いただけます。' },
  { q: '月にどのくらい稼げますか？', a: '週末に1日5件×4週で月20件対応した場合、約30,000〜50,000円の副収入が目安です。夜間・深夜対応や指名が増えるとさらに高くなります。' },
  { q: '相談対応に必要な機材は何ですか？', a: 'スマートフォンまたはPCとインターネット環境があれば始められます。特別な機材は不要です。' },
  { q: '診断書や処方箋の発行は必要ですか？', a: 'WanNyanCall24はオンライン相談サービスです。診断・処方は行いません。「受診すべきか」「様子を見てよいか」などのアドバイスが中心です。' },
  { q: '解約・退会はいつでもできますか？', a: 'はい、いつでも無料で退会できます。違約金等は一切ありません。' },
]

const VOICES = [
  { name: '田中 健一 先生', spec: '内科・皮膚科 / 動物病院勤務10年', body: '夜間の2〜3時間で月3〜4万円の副収入になっています。深夜帯は加算もあって効率がいいです。', rating: 5 },
  { name: '鈴木 麻衣 先生', spec: '外科・整形外科 / フリーランス', body: '在宅で自分のペースで対応できるのが最高です。育休中も続けられています。', rating: 5 },
  { name: '中村 あおい 先生', spec: '小動物・エキゾチック / 開業医', body: '専門のエキゾチック動物の相談が多く、自分の得意分野を活かせています。', rating: 5 },
]

export default function VetRecruit() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialty: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = '氏名を入力してください'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = '正しいメールアドレスを入力してください'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    const entry = { ...form, id: Date.now(), submittedAt: new Date().toISOString(), status: 'new' }
    const existing = (() => { try { return JSON.parse(localStorage.getItem(INQUIRY_KEY)) || [] } catch { return [] } })()
    localStorage.setItem(INQUIRY_KEY, JSON.stringify([entry, ...existing]))
    // 通知メール送信（サーバーが起動していれば）
    try {
      await fetch('http://localhost:4000/api/vet/notify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch { /* サーバー未起動でも登録は成功 */ }
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputStyle = err => ({
    width: '100%', border: `1.5px solid ${err ? '#e05555' : '#e5e7eb'}`, borderRadius: 8,
    padding: '12px 14px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', background: '#fff',
  })

  return (
    <>
      <SEOHead
        title="獣医師パートナー募集｜副業・在宅・オンライン相談"
        description="獣医師の副業・在宅ワークならWanNyanCall24。1相談1,500円〜、夜間加算あり、登録無料。スキマ時間に在宅でオンライン相談対応。月5〜30万円の副収入実績あり。獣医師免許をお持ちの方は今すぐ無料登録を。"
        keywords="獣医師 副業,獣医師 在宅ワーク,獣医師 オンライン,獣医師 アルバイト,獣医師 フリーランス,獣医師 副業 在宅,オンライン獣医師相談 獣医師側,夜間 獣医師 副業,獣医師 スキマ時間"
        canonical="/vet-recruit"
        ogType="website"
        ogImage="https://wannyancall24.com/ogp-vet-recruit.svg"
        jsonLd={JSON_LD}
      />

      <div style={{ minHeight: '100vh', background: '#f8fffe', paddingBottom: 80 }}>

        {/* ── HERO ── */}
        <div style={{ background: 'linear-gradient(135deg, #264653 0%, #2a9d8f 100%)', color: '#fff', padding: '48px 24px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🐾</div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 50, padding: '4px 16px', fontSize: '0.8rem', fontWeight: 700, marginBottom: 16, letterSpacing: '0.05em' }}>
            獣医師パートナー募集
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 900, lineHeight: 1.35, marginBottom: 16 }}>
            獣医師免許を活かして<br />
            <span style={{ color: '#f4a261' }}>在宅で副収入</span>を得よう
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.88)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
            スキマ時間にオンライン相談対応。<br />
            登録・月額費用<strong style={{ color: '#fff' }}>完全無料</strong>。夜間加算あり。<br />
            1,500円〜 / 相談（15分）
          </p>
          <button
            onClick={() => document.getElementById('recruit-form').scrollIntoView({ behavior: 'smooth' })}
            style={{ background: '#f4a261', color: '#fff', border: 'none', borderRadius: 50, padding: '16px 36px', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(244,162,97,0.5)' }}
          >
            無料で獣医師登録する →
          </button>
          <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
            審査あり・登録無料・いつでも退会可
          </div>
        </div>

        {/* ── SNSシェアボタン ── */}
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 440, margin: '0 auto' }}>
            <span style={{ fontSize: '0.78rem', color: '#9ca3af', flexShrink: 0 }}>シェア：</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('獣医師の副業・在宅ワークに最適！\nWanNyanCall24で1相談1,500円〜の副収入を。登録無料。\nhttps://wannyancall24.com/vet-recruit\n\n#獣医師副業 #獣医師在宅ワーク #オンライン獣医師 #獣医師募集 #WanNyanCall24')}`}
              target="_blank" rel="noreferrer"
              style={{ background: '#000', color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
            >𝕏 X</a>
            <a
              href={`https://line.me/R/msg/text/?${encodeURIComponent('獣医師の副業・在宅ワークに！WanNyanCall24\nhttps://wannyancall24.com/vet-recruit')}`}
              target="_blank" rel="noreferrer"
              style={{ background: '#06C755', color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
            >LINE</a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://wannyancall24.com/vet-recruit')}`}
              target="_blank" rel="noreferrer"
              style={{ background: '#1877F2', color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
            >Facebook</a>
            <a
              href={`https://www.threads.net/intent/post?text=${encodeURIComponent('獣医師の副業・在宅ワークに最適！WanNyanCall24で1相談1,500円〜\nhttps://wannyancall24.com/vet-recruit\n#獣医師副業 #獣医師在宅ワーク')}`}
              target="_blank" rel="noreferrer"
              style={{ background: '#101010', color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
            >Threads</a>
          </div>
        </div>

        {/* ── 数字で見る ── */}
        <div style={{ background: '#fff', padding: '24px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 440, margin: '0 auto' }}>
            {[
              { num: '1,500円〜', label: '1相談あたりの報酬', sub: '15分〜' },
              { num: '24時間', label: '対応可能時間帯', sub: '夜間加算あり' },
              { num: '0円', label: '登録・月額費用', sub: '完全無料' },
            ].map(s => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#2a9d8f' }}>{s.num}</div>
                <div style={{ fontSize: '0.72rem', color: '#264653', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 16px', maxWidth: 480, margin: '0 auto' }}>

          {/* ── メリット ── */}
          <section style={{ padding: '36px 0 24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#264653', textAlign: 'center', marginBottom: 6 }}>
              WanNyanCall24で働く6つのメリット
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginBottom: 24 }}>
              獣医師の副業・在宅ワークに最適な理由
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {MERITS.map(m => (
                <div key={m.title} style={{ background: '#fff', borderRadius: 14, padding: '16px 14px', boxShadow: '0 2px 12px rgba(42,157,143,0.08)', border: '1px solid #e8f6f5' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#264653', marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#2a9d8f', fontWeight: 600, marginBottom: 6 }}>{m.sub}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 報酬シミュレーション ── */}
          <section style={{ background: 'linear-gradient(135deg, #264653, #2a9d8f)', borderRadius: 16, padding: '24px 20px', marginBottom: 32, color: '#fff' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, textAlign: 'center' }}>
              💴 報酬シミュレーション
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: '週末のみ・月10件', amount: '約15,000円〜', note: '土日に5件ずつ' },
                { label: '平日夜間・月20件', amount: '約35,000円〜', note: '夜間加算込み' },
                { label: '深夜対応中心・月30件', amount: '約55,000円〜', note: '深夜加算＋指名料込み' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.note}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#f4a261' }}>{s.amount}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: 12, textAlign: 'center' }}>
              ※ 相談料（15分3,000円）の50%を報酬として計算。実際の報酬は対応内容により異なります。
            </div>
          </section>

          {/* ── 登録ステップ ── */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#264653', textAlign: 'center', marginBottom: 20 }}>
              登録から稼ぐまで4ステップ
            </h2>
            <div style={{ position: 'relative' }}>
              {STEPS.map((s, i) => (
                <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2a9d8f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>
                      {s.step}
                    </div>
                    {i < STEPS.length - 1 && <div style={{ width: 2, flex: 1, background: '#e8f6f5', minHeight: 32, margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 4, marginTop: 8 }}>{s.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.65 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 先生の声 ── */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#264653', textAlign: 'center', marginBottom: 20 }}>
              活躍中の獣医師の声
            </h2>
            {VOICES.map(v => (
              <div key={v.name} style={{ background: '#fff', borderRadius: 14, padding: '18px 16px', marginBottom: 12, boxShadow: '0 2px 12px rgba(42,157,143,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #e8f6f5, #d1f0ec)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#264653' }}>{v.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{v.spec}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#fbbf24', fontSize: '0.85rem' }}>{'★'.repeat(v.rating)}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }}>
                  「{v.body}」
                </div>
              </div>
            ))}
          </section>

          {/* ── よくある質問 ── */}
          <section style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#264653', textAlign: 'center', marginBottom: 20 }}>
              よくある質問
            </h2>
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </section>

          {/* ── 登録フォーム ── */}
          <section id="recruit-form" style={{ background: '#fff', borderRadius: 20, padding: '28px 20px', boxShadow: '0 4px 24px rgba(42,157,143,0.12)', marginBottom: 32, border: '2px solid #e8f6f5' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#264653', marginBottom: 12 }}>お申し込みを受け付けました！</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 24 }}>
                  担当者よりメールにてご連絡いたします。<br />
                  （通常1〜3営業日以内）
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  style={{ background: '#2a9d8f', color: '#fff', border: 'none', borderRadius: 50, padding: '14px 28px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  アカウント登録へ進む →
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>📝</div>
                  <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#264653', marginBottom: 6 }}>
                    無料登録フォーム
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                    審査後、担当者よりご連絡いたします
                  </p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#264653', marginBottom: 6 }}>
                      お名前（先生名） <span style={{ color: '#e05555' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例：田中 健一"
                      value={form.name}
                      onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })) }}
                      style={inputStyle(errors.name)}
                    />
                    {errors.name && <div style={{ color: '#e05555', fontSize: '0.78rem', marginTop: 4 }}>{errors.name}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#264653', marginBottom: 6 }}>
                      メールアドレス <span style={{ color: '#e05555' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="例：tanaka@example.com"
                      value={form.email}
                      onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })) }}
                      style={inputStyle(errors.email)}
                    />
                    {errors.email && <div style={{ color: '#e05555', fontSize: '0.78rem', marginTop: 4 }}>{errors.email}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#264653', marginBottom: 6 }}>
                      電話番号
                    </label>
                    <input
                      type="tel"
                      placeholder="例：090-1234-5678"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      style={inputStyle(false)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#264653', marginBottom: 6 }}>
                      専門分野・得意分野
                    </label>
                    <select
                      value={form.specialty}
                      onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                      style={{ ...inputStyle(false), color: form.specialty ? '#264653' : '#9ca3af' }}
                    >
                      <option value="">選択してください</option>
                      <option value="内科">内科・一般診療</option>
                      <option value="外科">外科・整形外科</option>
                      <option value="皮膚科">皮膚科・アレルギー</option>
                      <option value="眼科">眼科・耳鼻科</option>
                      <option value="腫瘍科">腫瘍科・がん治療</option>
                      <option value="神経科">神経科・リハビリ</option>
                      <option value="小動物">小動物・エキゾチック</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#264653', marginBottom: 6 }}>
                      メッセージ・ご質問（任意）
                    </label>
                    <textarea
                      placeholder="ご質問・現在の勤務状況など自由にご記入ください"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={3}
                      style={{ ...inputStyle(false), resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.6 }}>
                    送信することで<span style={{ color: '#2a9d8f', cursor: 'pointer' }} onClick={() => navigate('/legal')}>利用規約・プライバシーポリシー</span>に同意したものとみなします。
                  </div>

                  <button
                    type="submit"
                    style={{ background: '#f4a261', color: '#fff', border: 'none', borderRadius: 50, padding: '16px', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(244,162,97,0.4)' }}
                  >
                    無料で登録する →
                  </button>
                </form>
              </>
            )}
          </section>

          {/* ── CTA ── */}
          <div style={{ textAlign: 'center', padding: '0 0 24px' }}>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: 12 }}>
              すでにアカウントをお持ちの場合
            </p>
            <button
              onClick={() => navigate('/auth')}
              style={{ background: 'none', border: '2px solid #2a9d8f', borderRadius: 50, padding: '12px 28px', fontSize: '0.95rem', fontWeight: 700, color: '#2a9d8f', cursor: 'pointer' }}
            >
              ログイン・会員登録へ
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', borderRadius: 12, marginBottom: 8, boxShadow: '0 2px 8px rgba(42,157,143,0.07)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, textAlign: 'left' }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
          <span style={{ color: '#2a9d8f', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>Q.</span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#264653', lineHeight: 1.55 }}>{q}</span>
        </div>
        <span style={{ color: '#9ca3af', flexShrink: 0, fontSize: '1.1rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px 16px', display: 'flex', gap: 10 }}>
          <span style={{ color: '#f4a261', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>A.</span>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.7 }}>{a}</span>
        </div>
      )}
    </div>
  )
}
