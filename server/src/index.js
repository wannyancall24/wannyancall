import express from 'express'
import cors from 'cors'
import { Resend } from 'resend'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/hello', (req, res) => {
  res.json({ message: 'WanNyanCall24 へようこそ！' })
})

// 報酬分配計算エンドポイント
// 相談完了時に呼ばれ、報酬額を計算してconsultationsテーブルを更新する
app.post('/api/rewards/calculate', async (req, res) => {
  const { consultationId, baseAmount, nominationFee, timeFee } = req.body
  if (!consultationId) return res.status(400).json({ error: 'consultationId is required' })

  const base = baseAmount || 0
  const nomination = nominationFee || 0
  const time = timeFee || 0

  // 報酬計算: 相談料（基本+延長+夜間/深夜加算）の50% + 指名料100%
  const consultationReward = Math.round((base + time) * 0.5)
  const vetReward = consultationReward + nomination

  // プラットフォーム取り分: 残り50% + システム利用料800円（ある場合）
  const platformShare = (base + time) - consultationReward

  res.json({
    consultationId,
    vetReward,
    platformShare,
    breakdown: {
      consultationBase: base,
      timeFee: time,
      nominationFee: nomination,
      consultationReward,
      nominationReward: nomination,
      totalVetReward: vetReward,
    }
  })
})

// ──────────────────────────────────────────────────────────────────────
// 営業メール一括送信 API
// POST /api/admin/email/send-bulk
// Body: { apiKey, from, subject, html, recipients: [{name, email, clinicName}] }
// ──────────────────────────────────────────────────────────────────────
app.post('/api/admin/email/send-bulk', async (req, res) => {
  const { apiKey, from, subject, html, recipients } = req.body

  if (!apiKey) return res.status(400).json({ error: 'Resend APIキーが必要です' })
  if (!from) return res.status(400).json({ error: '送信元メールアドレスが必要です' })
  if (!subject) return res.status(400).json({ error: '件名が必要です' })
  if (!html) return res.status(400).json({ error: 'メール本文が必要です' })
  if (!recipients || recipients.length === 0) return res.status(400).json({ error: '送信先リストが空です' })

  const resend = new Resend(apiKey)
  const results = []
  let successCount = 0
  let failCount = 0

  for (const recipient of recipients) {
    if (!recipient.email) {
      results.push({ email: '(不明)', status: 'skip', message: 'メールアドレスなし' })
      failCount++
      continue
    }

    // テンプレート変数を置換
    const personalizedHtml = html
      .replace(/\{\{name\}\}/g, recipient.name || 'ご担当者')
      .replace(/\{\{clinicName\}\}/g, recipient.clinicName || '貴院')

    const personalizedSubject = subject
      .replace(/\{\{name\}\}/g, recipient.name || 'ご担当者')
      .replace(/\{\{clinicName\}\}/g, recipient.clinicName || '貴院')

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [recipient.email],
        subject: personalizedSubject,
        html: personalizedHtml,
      })

      if (error) {
        results.push({ email: recipient.email, status: 'error', message: error.message })
        failCount++
      } else {
        results.push({ email: recipient.email, status: 'ok', id: data?.id })
        successCount++
      }
    } catch (err) {
      results.push({ email: recipient.email, status: 'error', message: err.message })
      failCount++
    }

    // レート制限対策: 100ms 待機
    await new Promise(r => setTimeout(r, 100))
  }

  res.json({ successCount, failCount, total: recipients.length, results })
})

// ──────────────────────────────────────────────────────────────────────
// メールプレビュー（実際には送信しない）
// POST /api/admin/email/preview
// Body: { html, subject, sampleRecipient: {name, email, clinicName} }
// ──────────────────────────────────────────────────────────────────────
app.post('/api/admin/email/preview', (req, res) => {
  const { html, subject, sampleRecipient } = req.body
  const r = sampleRecipient || { name: 'ご担当者', clinicName: '〇〇動物病院', email: 'sample@example.com' }

  const previewHtml = (html || '')
    .replace(/\{\{name\}\}/g, r.name)
    .replace(/\{\{clinicName\}\}/g, r.clinicName)

  const previewSubject = (subject || '')
    .replace(/\{\{name\}\}/g, r.name)
    .replace(/\{\{clinicName\}\}/g, r.clinicName)

  res.json({ html: previewHtml, subject: previewSubject })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
