import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SYMPTOM_ARTICLES } from '../data/symptomArticles'

export default function ArticleList() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const all = Object.values(SYMPTOM_ARTICLES)
  const q = query.trim()
  const filtered = q
    ? all.filter((a) =>
        a.h1.includes(q) ||
        a.symptom.includes(q) ||
        a.description.includes(q)
      )
    : all

  const dogs = filtered.filter((a) => a.animalType === '犬')
  const cats = filtered.filter((a) => a.animalType === '猫')

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
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1f2937', marginBottom: 16 }}>
          🐾 犬・猫の症状ガイド
        </h1>

        <div style={{ marginBottom: 24, position: 'relative' }}>
          <input
            type="text"
            placeholder="症状名で検索（例：嘔吐、下痢）"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 40px 11px 16px',
              fontSize: '0.95rem',
              border: '1px solid #e5e7eb',
              borderRadius: 50,
              outline: 'none',
              boxSizing: 'border-box',
              color: '#1f2937',
            }}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '1rem',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {q && dogs.length === 0 && cats.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontSize: '0.9rem' }}>
            「{q}」に一致する症状は見つかりませんでした
          </div>
        )}

        {dogs.length > 0 && (
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
        )}

        {cats.length > 0 && (
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
        )}
      </div>
    </div>
  )
}
