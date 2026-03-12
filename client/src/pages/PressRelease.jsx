import SEOHead from '../components/SEOHead'
import { useNavigate } from 'react-router-dom'

const PRESS_RELEASES = [
  {
    id: 1,
    date: '2024年12月01日',
    category: 'サービス開始',
    title: 'WanNyanCall24、24時間対応オンライン獣医師相談サービスを正式ローンチ',
    summary: '株式会社WanNyanCall24は、ペットオーナーが24時間365日、獣医師にオンラインで相談できるサービス「WanNyanCall24」を正式ローンチしました。',
    body: `株式会社WanNyanCall24（所在地：日本）は、2024年12月1日より、ペットオーナーと獣医師をオンラインでつなぐビデオ通話型獣医師相談サービス「WanNyanCall24」を正式ローンチいたしました。

■ サービス概要
WanNyanCall24は、犬・猫・小動物などのペットオーナーが、深夜・休日を含む24時間365日、資格を持った獣医師にビデオ通話でオンライン相談できるサービスです。

■ 開発の背景
「深夜にペットの体調が急変したが、かかりつけ医が休診で対応できなかった」というペットオーナーの声が多く寄せられており、夜間・深夜の獣医師不足という社会課題の解決を目指してサービスを開発しました。

■ サービスの主な特長
・24時間365日対応（夜間・深夜・休日も）
・1相談3,000円〜（15分）
・犬・猫・小動物・エキゾチックアニマルに対応
・スマートフォンのみで完結
・獣医師の副業・在宅ワークの場としても提供

■ 今後の展開
2025年中に登録獣医師数100名突破、月間相談件数1,000件を目指します。

■ サービスURL
https://wannyancall24.com

■ お問い合わせ
WanNyanCall24 広報担当
Email: wannyancall24@gmail.com`,
  },
  {
    id: 2,
    date: '2024年12月15日',
    category: '獣医師募集',
    title: 'WanNyanCall24、獣医師パートナー募集を本格開始——副業・在宅ワークで月最大30万円の報酬',
    summary: '24時間対応オンライン獣医師相談サービス「WanNyanCall24」は、獣医師免許をお持ちの方を対象とした獣医師パートナーの本格募集を開始しました。',
    body: `24時間対応オンライン獣医師相談サービス「WanNyanCall24」（運営：株式会社WanNyanCall24）は、獣医師免許をお持ちの方を対象とした獣医師パートナーの本格募集を開始いたしました。

■ 獣医師パートナー制度の概要
WanNyanCall24では、動物病院勤務の傍ら副業・在宅ワークとしてオンライン相談に対応いただける獣医師を業務委託契約で募集しています。

■ 報酬体系
・1相談（15分）: 相談料の50%（基本1,500円〜）
・指名料: 100%全額獣医師へ
・夜間加算（20〜22時）: +500円
・深夜加算（22〜8時）: +750円
・月30件対応の場合: 約40,000〜60,000円の副収入（目安）

■ 登録条件
・日本の獣医師免許をお持ちの方
・スマートフォンまたはPCをお持ちの方
・安定したインターネット環境をお持ちの方

■ 特長
・登録費用・月額費用完全無料
・最低対応件数なし（1件から）
・完全在宅・フルリモート
・いつでも退会可能

■ 獣医師登録ページ
https://wannyancall24.com/vet-recruit

■ お問い合わせ
WanNyanCall24 獣医師採用担当
Email: wannyancall24@gmail.com`,
  },
]

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'プレスリリース | WanNyanCall24',
  url: 'https://wannyancall24.com/press',
  description: 'WanNyanCall24のプレスリリース・お知らせ一覧',
  publisher: {
    '@type': 'Organization',
    name: 'WanNyanCall24',
    url: 'https://wannyancall24.com',
  },
}

export default function PressRelease() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  return (
    <>
      <SEOHead
        title="プレスリリース・お知らせ"
        description="WanNyanCall24のプレスリリース・最新ニュース一覧。24時間対応オンライン獣医師相談サービスの最新情報をお届けします。"
        keywords="WanNyanCall24 プレスリリース,オンライン獣医師相談 ニュース,獣医師副業 サービス"
        canonical="/press"
        jsonLd={JSON_LD}
      />

      <div style={{ minHeight: '100vh', background: '#f8fffe', paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #264653, #2a9d8f)', color: '#fff', padding: '32px 24px 28px' }}>
          <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>📰</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, lineHeight: 1.4 }}>プレスリリース</h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            WanNyanCall24 最新ニュース・お知らせ
          </p>
        </div>

        <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
          {selected ? (
            /* 記事詳細 */
            <div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: '#2a9d8f', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', marginBottom: 16, padding: 0 }}
              >
                ← 一覧に戻る
              </button>
              <div style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', boxShadow: '0 2px 12px rgba(42,157,143,0.08)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{ background: '#e8f6f5', color: '#2a9d8f', borderRadius: 50, padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700 }}>{selected.category}</span>
                  <span style={{ fontSize: '0.78rem', color: '#9ca3af', paddingTop: 3 }}>{selected.date}</span>
                </div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#264653', lineHeight: 1.5, marginBottom: 16 }}>{selected.title}</h2>
                <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  {selected.body}
                </div>

                {/* SNSシェア */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: 10 }}>この記事をシェア</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selected.title + '\n\nhttps://wannyancall24.com/press\n\n#WanNyanCall24 #獣医師副業 #オンライン獣医師')}`}
                      target="_blank" rel="noreferrer"
                      style={{ background: '#000', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
                    >X でシェア</a>
                    <a
                      href={`https://line.me/R/msg/text/?${encodeURIComponent(selected.title + '\n' + 'https://wannyancall24.com/press')}`}
                      target="_blank" rel="noreferrer"
                      style={{ background: '#06C755', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
                    >LINEでシェア</a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 一覧 */
            <div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>
                {PRESS_RELEASES.length}件のプレスリリース
              </div>
              {PRESS_RELEASES.map(pr => (
                <div
                  key={pr.id}
                  onClick={() => setSelected(pr)}
                  style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', marginBottom: 12, boxShadow: '0 2px 12px rgba(42,157,143,0.08)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2a9d8f'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ background: '#e8f6f5', color: '#2a9d8f', borderRadius: 50, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{pr.category}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{pr.date}</span>
                  </div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#264653', lineHeight: 1.5, marginBottom: 8 }}>{pr.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>{pr.summary}</p>
                  <div style={{ marginTop: 10, fontSize: '0.8rem', color: '#2a9d8f', fontWeight: 600 }}>続きを読む →</div>
                </div>
              ))}

              {/* 取材・掲載依頼 */}
              <div style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', marginTop: 8, boxShadow: '0 2px 12px rgba(42,157,143,0.08)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 8 }}>📮 取材・掲載のご依頼</h3>
                <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7, marginBottom: 12 }}>
                  メディア関係者様からの取材・掲載依頼は下記までお気軽にご連絡ください。
                </p>
                <a
                  href="mailto:wannyancall24@gmail.com?subject=取材のご依頼"
                  style={{ display: 'block', background: '#2a9d8f', color: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}
                >
                  wannyancall24@gmail.com
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
