import { useNavigate } from 'react-router-dom'
import { SYMPTOM_ARTICLES } from '../data/symptomArticles'

export default function ArticleList() {
  const navigate = useNavigate()

  const dogs = Object.values(SYMPTOM_ARTICLES).filter((a) => a.animalType === '犬')
  const cats = Object.values(SYMPTOM_ARTICLES).filter((a) => a.animalType === '猫')

  function ArticleCard({ article }) {
    return (
      <div
        onClick={() => navigate(`/article/${article.slug}`)}
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '14px 16px',
          cursor: 'pointer',
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937', marginBottom: 4 }}>
          {article.emoji} {article.h1}
        </div>
        <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5 }}>
          {article.description}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1f2937', marginBottom: 24 }}>
          🐾 犬・猫の症状ガイド
        </h1>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#1f2937',
            borderBottom: '2px solid #2a9d8f',
            paddingBottom: 8,
            marginBottom: 14,
          }}>
            🐶 犬の症状
          </h2>
          {dogs.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </section>

        <section>
          <h2 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#1f2937',
            borderBottom: '2px solid #2a9d8f',
            paddingBottom: 8,
            marginBottom: 14,
          }}>
            🐱 猫の症状
          </h2>
          {cats.map((a) => <ArticleCard key={a.slug} article={a} />)}
        </section>
      </div>
    </div>
  )
}
