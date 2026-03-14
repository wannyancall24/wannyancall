import { useParams, Navigate, useNavigate } from 'react-router-dom'
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

export default function SymptomArticle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const article = SYMPTOM_ARTICLES[slug]

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
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 20 }}>
          最終更新：{article.lastUpdated} ／ WanNyanCall24 編集部
        </p>

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
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {/* danger items */}
            {section.type === 'danger' && section.items && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {section.items.map((item, j) => (
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
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {/* watch items */}
            {section.type === 'watch' && section.items && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {section.items.map((item, j) => (
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
                    {item}
                  </li>
                ))}
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
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {section.note && (
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
            {Object.values(SYMPTOM_ARTICLES)
              .filter((a) => a.slug !== slug)
              .slice(0, 4)
              .map((a) => (
                <button
                  key={a.slug}
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
      </div>
    </>
  )
}
