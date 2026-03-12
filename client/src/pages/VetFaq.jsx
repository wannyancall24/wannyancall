import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '獣医師の副業は勤務先にバレますか？',
      acceptedAnswer: { '@type': 'Answer', text: '業務委託契約のため、確定申告で住民税を「普通徴収（自分で納付）」に設定すれば、給与に合算されず勤務先にバレる可能性を大幅に下げられます。ただし就業規則で副業が禁止されている場合は事前にご確認ください。' },
    },
    {
      '@type': 'Question',
      name: '獣医師の副業で確定申告は必要ですか？',
      acceptedAnswer: { '@type': 'Answer', text: '副業収入が年間20万円を超える場合は確定申告が必要です。WanNyanCall24での報酬は「雑所得」として申告します。経費（通信費・機材費など）も控除できます。' },
    },
    {
      '@type': 'Question',
      name: '獣医師免許があれば副業の許可は必要ですか？',
      acceptedAnswer: { '@type': 'Answer', text: 'WanNyanCall24はオンライン相談サービスのため、診断・処方は行いません。獣医師法上の問題はありませんが、勤務先の就業規則に副業禁止規定がある場合は事前に確認が必要です。' },
    },
    {
      '@type': 'Question',
      name: 'オンライン獣医師相談で医療行為はできますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'WanNyanCall24は「相談・アドバイスサービス」です。診断・処方・治療指示は行いません。「病院に行くべきか」「様子を見てよいか」などの判断アドバイスが中心です。' },
    },
    {
      '@type': 'Question',
      name: '獣医師副業の月収はどのくらいですか？',
      acceptedAnswer: { '@type': 'Answer', text: '月10件で約15,000〜20,000円、月30件で約40,000〜60,000円が目安です。夜間・深夜対応や指名が増えるとさらに高くなります。' },
    },
  ],
}

const FAQ_CATEGORIES = [
  {
    category: '副業・バレる？',
    icon: '🤫',
    items: [
      {
        q: '副業は勤務先の動物病院にバレますか？',
        a: `バレるリスクを下げることは可能です。\n\n最も重要なのが「確定申告時の住民税の納付方法」の選択です。\n\n✅ バレにくくする方法\n確定申告書の住民税欄で「普通徴収」を選択します。\nこれにより、副業分の住民税が給与から天引きされず、自分で直接納付する形になるため、勤務先に副収入の存在が伝わりにくくなります。\n\n⚠️ 注意点\n• 就業規則で副業が禁止されている場合は、事前に確認が必要です\n• 同僚への口コミは自分でコントロールしてください\n• 完全に「バレない」とは言い切れません`,
      },
      {
        q: '勤務先の許可なく副業できますか？',
        a: `就業規則によって異なります。\n\nWanNyanCall24は業務委託契約のため、法律上は問題ありません。ただし勤務先の就業規則で「副業禁止」の規定がある場合は事前に確認・申請が必要な場合があります。\n\n最近は副業を認める動物病院が増えています。「副業解禁」の流れは医療業界にも広がっています。`,
      },
      {
        q: '在宅でオンライン相談をしているのが上司にわかりますか？',
        a: `SNSや口コミ以外では、勤務先が把握する手段はほとんどありません。\n\nWanNyanCall24は個人情報保護の観点から、登録情報を第三者に開示しません。ただし、SNSで自身の活動を公開したり、患者さんから同僚に口コミが伝わる可能性はゼロではありません。`,
      },
    ],
  },
  {
    category: '確定申告・税金',
    icon: '📝',
    items: [
      {
        q: '副業収入の確定申告は必要ですか？',
        a: `年間の副業収入が20万円を超える場合は確定申告が必要です。\n\nWanNyanCall24での報酬は「雑所得」として申告します。\n\n💡 確定申告のポイント\n• 収入 − 経費 = 課税所得（経費が多いほど節税に）\n• 住民税は「普通徴収」を選択（バレ防止）\n• 毎月の報酬明細を保管しておくと便利\n\n年間20万円以下でも、住民税の申告は必要な場合があります（市区町村により異なる）。`,
      },
      {
        q: '副業で経費にできるものはありますか？',
        a: `オンライン相談に関連する経費は控除できます。\n\n✅ 経費になりやすいもの\n• 通信費（インターネット代の一部）\n• スマートフォン代（業務使用割合分）\n• PCやウェブカメラ\n• 医学書・専門書\n• 自宅の一室を使用する場合の家賃・光熱費（按分）\n\n経費の判断が難しい場合は、税理士への相談をおすすめします。`,
      },
      {
        q: '源泉徴収はされますか？',
        a: `WanNyanCall24は業務委託契約のため、原則として源泉徴収は行いません。\n\n報酬は全額お受け取りいただき、確定申告で所得税・住民税をご自身で納付いただく形になります。`,
      },
    ],
  },
  {
    category: '法律・資格',
    icon: '⚖️',
    items: [
      {
        q: 'オンライン獣医師相談は法律的に問題ありませんか？',
        a: `WanNyanCall24は「診断・処方を行わない相談サービス」のため、獣医師法・獣医療法上の問題はありません。\n\n提供できるサービス（OK）:\n• 症状についての一般的なアドバイス\n• 「今すぐ病院へ行くべきか」の判断サポート\n• 日常的な健康管理・予防の相談\n• セカンドオピニオン的な情報提供\n\n提供できないサービス:\n• 診断（病名を確定すること）\n• 薬の処方\n• 「病院に行かなくていい」という断定的な治療指示`,
      },
      {
        q: '獣医師免許の更新に影響しますか？',
        a: `影響はありません。WanNyanCall24での活動は任意のオンライン相談サービスへの参加であり、獣医師免許の更新手続きとは無関係です。`,
      },
    ],
  },
  {
    category: '報酬・支払い',
    icon: '💰',
    items: [
      {
        q: '報酬はいくらになりますか？',
        a: `相談料の50%が基本報酬です。\n\n💴 報酬の計算例（基本相談15分3,000円の場合）\n• 基本報酬: 1,500円\n• 夜間加算（20〜22時）: +500円 → 合計2,000円\n• 深夜加算（22〜8時）: +750円 → 合計2,250円\n• 指名料（500円）: 全額獣医師へ → +500円\n\n月20件対応（夜間中心）で 約35,000〜50,000円 が目安です。`,
      },
      {
        q: '報酬の支払いはいつですか？',
        a: `毎月末日締め、翌月末日払いです。銀行振込でお支払いいたします。\n\n振込手数料はWanNyanCall24が負担します（一定金額以上の場合）。`,
      },
      {
        q: '最低対応件数はありますか？',
        a: `ありません。1件から対応いただけます。\n\n月に1件だけ、週末だけ、深夜だけなど、完全に自分のペースで対応できます。ノルマ・最低件数は一切ありません。`,
      },
    ],
  },
  {
    category: '働き方・環境',
    icon: '🏠',
    items: [
      {
        q: 'どんな機材が必要ですか？',
        a: `スマートフォンまたはPCと、安定したインターネット環境があれば始められます。\n\n✅ 推奨環境\n• スマートフォン（iOS / Android）または PC\n• 有線LAN またはWi-Fi（10Mbps以上推奨）\n• 静かな環境（ビデオ通話のため）\n• ヘッドセット（あると通話品質が向上）\n\n特別なソフトウェアのインストールは不要です。`,
      },
      {
        q: '育休中・産休中でも登録できますか？',
        a: `はい、ご登録・活動いただけます。\n\n育休・産休中は時間に余裕ができるため、短時間での副業に最適です。対応時間は完全に自由に設定できるため、育児の合間に対応される先生も多くいます。`,
      },
      {
        q: '開業前の待機期間中に登録できますか？',
        a: `はい、ご登録いただけます。\n\n開業準備期間中の収入確保として活用される先生もいます。また、オンライン相談の経験はコミュニケーション能力の向上にもつながり、開業後にも役立ちます。`,
      },
    ],
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', borderRadius: 12, marginBottom: 8, boxShadow: '0 2px 8px rgba(42,157,143,0.07)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, textAlign: 'left' }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
          <span style={{ color: '#2a9d8f', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>Q.</span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#264653', lineHeight: 1.55 }}>{q}</span>
        </div>
        <span style={{ color: '#9ca3af', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '1rem' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px 42px', display: 'flex', gap: 10 }}>
          <span style={{ color: '#f4a261', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>A.</span>
          <span style={{ fontSize: '0.84rem', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{a}</span>
        </div>
      )}
    </div>
  )
}

export default function VetFaq() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState(null)

  const displayed = activeCategory
    ? FAQ_CATEGORIES.filter(c => c.category === activeCategory)
    : FAQ_CATEGORIES

  return (
    <>
      <SEOHead
        title="獣医師副業FAQ｜副業はバレる？確定申告は？法律は？"
        description="獣医師の副業に関するよくある質問。「副業は病院にバレる？」「確定申告はどうする？」「獣医師法上問題ない？」「報酬はいくら？」など疑問をすべて解決。在宅オンライン相談で副収入を得たい獣医師向け。"
        keywords="獣医師 副業 バレる,獣医師 副業 確定申告,獣医師 副業 法律,獣医師 在宅 副業,オンライン獣医師相談 収入,獣医師 副業 住民税,獣医師 副業 税金,獣医師 副業 経費"
        canonical="/vet-faq"
        jsonLd={JSON_LD}
      />

      <div style={{ minHeight: '100vh', background: '#f8fffe', paddingBottom: 80 }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #264653, #2a9d8f)', color: '#fff', padding: '36px 24px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🐾</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.4, marginBottom: 10 }}>
            獣医師副業FAQ
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
            「副業はバレる？」「確定申告は？」<br />
            獣医師の副業に関する疑問をすべて解決します
          </p>
        </div>

        <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
          {/* カテゴリフィルター */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '7px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0,
                background: activeCategory === null ? '#2a9d8f' : '#e8f6f5',
                color: activeCategory === null ? '#fff' : '#2a9d8f',
              }}
            >すべて</button>
            {FAQ_CATEGORIES.map(c => (
              <button
                key={c.category}
                onClick={() => setActiveCategory(activeCategory === c.category ? null : c.category)}
                style={{
                  padding: '7px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0,
                  background: activeCategory === c.category ? '#2a9d8f' : '#e8f6f5',
                  color: activeCategory === c.category ? '#fff' : '#2a9d8f',
                }}
              >{c.icon} {c.category}</button>
            ))}
          </div>

          {/* FAQリスト */}
          {displayed.map(cat => (
            <div key={cat.category} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#264653', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{cat.icon}</span>
                {cat.category}
              </h2>
              {cat.items.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          ))}

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, #264653, #2a9d8f)', borderRadius: 16, padding: '24px 20px', textAlign: 'center', color: '#fff', marginTop: 8 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>🐾</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>疑問が解決したら登録へ</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginBottom: 20, lineHeight: 1.6 }}>
              登録無料・審査あり・いつでも退会可
            </p>
            <button
              onClick={() => navigate('/vet-recruit')}
              style={{ background: '#f4a261', color: '#fff', border: 'none', borderRadius: 50, padding: '14px 28px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', width: '100%' }}
            >
              無料で獣医師登録する →
            </button>
            <button
              onClick={() => navigate('/vet-recruit')}
              style={{ background: 'none', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 50, padding: '12px 20px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', color: '#fff', marginTop: 10, width: '100%' }}
            >
              詳細・報酬を見る
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
