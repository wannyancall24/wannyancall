import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import SEOHead from '../../components/SEOHead'
import { SYMPTOM_ARTICLES } from '../../data/symptomArticles'

const BASE_URL = 'https://wannyancall24.com'

function buildJsonLd(article) {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.h1,
    description: article.description,
    dateModified: article.lastUpdated,
    author: {
      '@type': 'Organization',
      name: 'WanNyanCall24',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'WanNyanCall24',
      url: BASE_URL,
    },
    url: `${BASE_URL}${article.canonical}`,
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return [articleSchema, faqSchema]
}

function ShareButtons({ url, title }) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const shares = [
    {
      label: 'X',
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: '#000',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: 'LINE',
      href: `https://line.me/R/msg/text/?${encodedTitle}%0A${encodedUrl}`,
      bg: '#06c755',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
      ),
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encodedTitle}%0A${encodedUrl}`,
      bg: '#101010',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.353 1.315-3.18.942-.862 2.288-1.361 3.793-1.434.764-.036 1.494.006 2.178.122-.134-.926-.522-1.509-1.162-1.754-.498-.191-1.142-.228-1.827-.108-.661.116-1.298.395-1.742.77l-1.26-1.57c.73-.588 1.719-.993 2.793-1.177 1.05-.18 2.108-.115 2.983.185 1.846.621 2.776 2.1 2.918 4.3.178.07.355.145.527.224 1.288.59 2.257 1.519 2.805 2.687.842 1.79.822 4.555-1.501 6.826-1.803 1.767-3.997 2.56-7.179 2.584zM14.67 14.3c-.988.056-1.817.343-2.33.81-.432.394-.638.923-.603 1.534.03.544.298 1.02.756 1.314.546.355 1.31.519 2.158.473.98-.054 1.776-.445 2.31-1.132.516-.665.787-1.618.79-2.822-.705-.154-1.433-.23-2.08-.177z"/>
        </svg>
      ),
    },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {shares.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: s.bg, color: '#fff',
            padding: '7px 14px', borderRadius: 50,
            fontSize: '0.8rem', fontWeight: 700,
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          {s.icon}{s.label}
        </a>
      ))}
    </div>
  )
}

export default function SymptomArticle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const article = SYMPTOM_ARTICLES[slug]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!article) return <Navigate to="/" replace />

  const jsonLd = buildJsonLd(article)

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.description}
        keywords={article.keywords}
        canonical={article.canonical}
        ogType="article"
        jsonLd={jsonLd}
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* パンくず */}
        <nav style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 20 }}>
          <span
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', color: '#2a9d8f' }}
          >
            ホーム
          </span>
          {' › '}
          <span>症状から調べる</span>
          {' › '}
          <span style={{ color: '#374151' }}>{article.animalType}の{article.symptom}</span>
        </nav>

        {/* タイトル */}
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1f2937', lineHeight: 1.4, marginBottom: 8 }}>
          {article.emoji} {article.h1}
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 12 }}>
          最終更新：{article.lastUpdated} ／ WanNyanCall24 編集部
        </p>

        {/* シェアボタン（タイトル下） */}
        <div style={{ marginBottom: 24 }}>
          <ShareButtons url={`${BASE_URL}${article.canonical}`} title={article.h1} />
        </div>

        {/* イントロ */}
        <p style={{
          fontSize: '0.95rem',
          color: '#374151',
          lineHeight: 1.75,
          background: '#f0faf8',
          borderLeft: '4px solid #2a9d8f',
          padding: '14px 16px',
          borderRadius: '0 8px 8px 0',
          marginBottom: 32,
        }}>
          {article.intro}
        </p>

        {/* 免責事項 */}
        <div style={{
          fontSize: '0.78rem',
          color: '#6b7280',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 32,
        }}>
          ⚠️ 本記事は一般的な情報提供を目的としており、医学的診断・治療の代替となるものではありません。ペットの健康状態が心配な場合は獣医師への受診をご検討ください。
        </div>

        {/* セクション */}
        {article.sections.map((section, i) => (
          <section key={i} style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1f2937',
              borderBottom: '2px solid #2a9d8f',
              paddingBottom: 8,
              marginBottom: 16,
            }}>
              {section.icon} {section.heading}
            </h2>

            {/* content: label+text items */}
            {section.content && (
              <dl style={{ margin: 0, padding: 0 }}>
                {section.content.map((item, j) => (
                  <div key={j} style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <dt style={{
                      minWidth: 130,
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#2a9d8f',
                      flexShrink: 0,
                    }}>
                      {item.label}
                    </dt>
                    <dd style={{ fontSize: '0.9rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>
                      {item.text}
                      {item.note && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
                          {item.note}
                        </div>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* danger items */}
            {section.type === 'danger' && section.items && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {section.items.map((item, j) => {
                  const text = typeof item === 'string' ? item : item.text
                  const note = typeof item === 'object' ? item.note : null
                  return (
                    <li key={j} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 12px',
                      marginBottom: 6,
                      background: '#fff5f5',
                      border: '1px solid #fecaca',
                      borderRadius: 8,
                      fontSize: '0.9rem',
                      color: '#374151',
                    }}>
                      <span style={{ color: '#ef4444', fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                      <div>
                        {text}
                        {note && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
                            {note}
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* watch items */}
            {section.type === 'watch' && section.items && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {section.items.map((item, j) => {
                  const text = typeof item === 'string' ? item : item.text
                  const note = typeof item === 'object' ? item.note : null
                  return (
                    <li key={j} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 12px',
                      marginBottom: 6,
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 8,
                      fontSize: '0.9rem',
                      color: '#374151',
                    }}>
                      <span style={{ color: '#22c55e', fontSize: '1rem', flexShrink: 0 }}>✅</span>
                      <div>
                        {text}
                        {note && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
                            {note}
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* checks: label+text */}
            {section.checks && (
              <dl style={{ margin: 0, padding: 0 }}>
                {section.checks.map((item, j) => (
                  <div key={j} style={{
                    display: 'flex',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid #f3f4f6',
                  }}>
                    <dt style={{
                      minWidth: 130,
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#2a9d8f',
                      flexShrink: 0,
                    }}>
                      □ {item.label}
                    </dt>
                    <dd style={{ fontSize: '0.9rem', color: '#374151', margin: 0, lineHeight: 1.65 }}>
                      {item.text}
                      {item.note && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4, lineHeight: 1.5 }}>
                          {item.note}
                        </div>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* night section */}
            {section.type === 'night' && (
              <div style={{
                background: '#eef6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                padding: '16px',
              }}>
                {section.lead && (
                  <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.7, marginBottom: 12 }}>
                    {section.lead}
                  </p>
                )}
                {section.items && (
                  <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0 }}>
                    {section.items.map((item, j) => (
                      <li key={j} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '6px 0',
                        fontSize: '0.9rem',
                        color: '#374151',
                        borderBottom: '1px solid #dbeafe',
                      }}>
                        <span style={{ color: '#3b82f6', flexShrink: 0 }}>🌙</span>
                        {typeof item === 'string' ? item : item.text}
                      </li>
                    ))}
                  </ul>
                )}
                {section.outro && (
                  <p style={{ fontSize: '0.88rem', color: '#1d4ed8', fontWeight: 600, margin: 0, lineHeight: 1.65 }}>
                    {section.outro}
                  </p>
                )}
              </div>
            )}

            {section.note && section.type !== 'night' && (
              <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 10, marginBottom: 0 }}>
                {section.note}
              </p>
            )}
          </section>
        ))}

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
          borderRadius: 16,
          padding: '28px 24px',
          marginBottom: 40,
          color: '#fff',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 20 }}>
            🐾 {article.ctaText}
          </p>
          <button
            onClick={() => navigate('/find')}
            style={{
              background: '#fff',
              color: '#2a9d8f',
              border: 'none',
              borderRadius: 50,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              maxWidth: 320,
              margin: '0 auto',
            }}
          >
            獣医師に今すぐ相談する →
          </button>
          <p style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 10, marginBottom: 0 }}>
            24時間対応・スマホで完結・初回相談無料
          </p>
          {/* シェアボタン（CTA内） */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <ShareButtons url={`${BASE_URL}${article.canonical}`} title={article.h1} />
          </div>
        </div>

        {/* FAQ */}
        {article.faqItems && article.faqItems.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1f2937',
              borderBottom: '2px solid #2a9d8f',
              paddingBottom: 8,
              marginBottom: 16,
            }}>
              ❓ よくある質問
            </h2>
            {article.faqItems.map((item, i) => (
              <details key={i} style={{
                marginBottom: 10,
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <summary style={{
                  padding: '14px 16px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: '#1f2937',
                  cursor: 'pointer',
                  background: '#f9fafb',
                  listStyle: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}>
                  <span style={{ color: '#2a9d8f', flexShrink: 0 }}>Q.</span>
                  {item.q}
                </summary>
                <p style={{
                  padding: '14px 16px',
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#374151',
                  lineHeight: 1.7,
                  background: '#fff',
                  borderTop: '1px solid #e5e7eb',
                }}>
                  <strong style={{ color: '#2a9d8f' }}>A.</strong> {item.a}
                </p>
              </details>
            ))}
          </section>
        )}

        {/* 関連記事 */}
        {(() => {
          const keywords = (article.h1 + ' ' + (article.symptom || '')).match(/[^\s、。「」（）()]+/g) || []
          const related = Object.values(SYMPTOM_ARTICLES)
            .filter((a) => a.slug !== slug)
            .map((a) => {
              let score = 0
              if (a.animalType === article.animalType) score += 10
              const titleAndSymptom = a.h1 + ' ' + (a.symptom || '')
              keywords.forEach((kw) => {
                if (kw.length >= 2 && titleAndSymptom.includes(kw)) score += 3
              })
              return { ...a, score }
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)
          return (
            <section>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: 12,
              }}>
                関連記事
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {related.map((a) => (
                  <button
                    key={a.slug}
                    type="button"
                    onClick={() => navigate(`/article/${a.slug}`)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      color: '#2a9d8f',
                      fontWeight: 600,
                    }}
                  >
                    {a.emoji} {a.h1}
                  </button>
                ))}
              </div>
            </section>
          )
        })()}
      </div>
    </>
  )
}
