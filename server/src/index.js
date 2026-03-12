import express from 'express'
import cors from 'cors'
import { Resend } from 'resend'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const app = express()
const PORT = process.env.PORT || 4000
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM || 'WanNyanCall24 <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wannyancall24@gmail.com'
const ZAPIER_SECRET = process.env.ZAPIER_WEBHOOK_SECRET || 'wannyan_zapier_2024'

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/hello', (req, res) => {
  res.json({ message: 'WanNyanCall24 へようこそ！' })
})

// ─────────────────────────────────────────────────────────────
// 報酬分配計算エンドポイント
// ─────────────────────────────────────────────────────────────
app.post('/api/rewards/calculate', async (req, res) => {
  const { consultationId, baseAmount, nominationFee, timeFee } = req.body
  if (!consultationId) return res.status(400).json({ error: 'consultationId is required' })

  const base = baseAmount || 0
  const nomination = nominationFee || 0
  const time = timeFee || 0

  const consultationReward = Math.round((base + time) * 0.5)
  const vetReward = consultationReward + nomination
  const platformShare = (base + time) - consultationReward

  res.json({
    consultationId, vetReward, platformShare,
    breakdown: {
      consultationBase: base, timeFee: time, nominationFee: nomination,
      consultationReward, nominationReward: nomination, totalVetReward: vetReward,
    }
  })
})

// ─────────────────────────────────────────────────────────────
// 獣医師登録通知メール
// POST /api/vet/notify-registration
// Body: { name, email, phone, specialty, message }
// → 管理者通知メール + 獣医師へウェルカムメール
// ─────────────────────────────────────────────────────────────
app.post('/api/vet/notify-registration', async (req, res) => {
  const { name, email, phone, specialty, message } = req.body
  if (!email) return res.status(400).json({ error: 'メールアドレスが必要です' })

  if (!RESEND_API_KEY || RESEND_API_KEY === 'your_resend_api_key_here') {
    // APIキー未設定でも登録自体は成功扱い（メール送信はスキップ）
    return res.json({ ok: true, emailSent: false, reason: 'APIキー未設定のためメール送信をスキップしました' })
  }

  const resend = new Resend(RESEND_API_KEY)
  const results = {}

  // ── 管理者通知メール ──
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: [ADMIN_EMAIL],
      subject: `【新規獣医師登録申請】${name || '（名前未入力）'} 先生`,
      html: `
        <div style="font-family:-apple-system,'Hiragino Sans','Noto Sans JP','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;">
          <h2 style="color:#2a9d8f;">🐾 新規獣医師登録申請が届きました</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px;font-weight:700;color:#264653;width:30%;">氏名</td>
              <td style="padding:10px;">${name || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;">
              <td style="padding:10px;font-weight:700;color:#264653;">メール</td>
              <td style="padding:10px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;">
              <td style="padding:10px;font-weight:700;color:#264653;">電話</td>
              <td style="padding:10px;">${phone || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;">
              <td style="padding:10px;font-weight:700;color:#264653;">専門分野</td>
              <td style="padding:10px;">${specialty || '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:700;color:#264653;">メッセージ</td>
              <td style="padding:10px;">${message || '—'}</td>
            </tr>
          </table>
          <div style="margin-top:24px;">
            <a href="https://wannyancall24.com/admin" style="background:#2a9d8f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
              管理画面で確認する →
            </a>
          </div>
          <p style="font-size:0.8rem;color:#9ca3af;margin-top:24px;">
            登録日時: ${new Date().toLocaleString('ja-JP')}
          </p>
        </div>
      `,
    })
    results.adminEmail = '送信済み'
  } catch (err) {
    results.adminEmail = `送信失敗: ${err.message}`
  }

  // ── 獣医師へウェルカムメール ──
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: [email],
      subject: '【WanNyanCall24】ご登録ありがとうございます！審査のご案内',
      html: `
        <div style="font-family:-apple-system,'Hiragino Sans','Noto Sans JP','Hiragino Kaku Gothic ProN',Meiryo,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:2.5rem;">🐾</div>
            <h1 style="color:#2a9d8f;font-size:1.4rem;margin:8px 0;">ご登録ありがとうございます！</h1>
          </div>

          <p>${name || '先生'}</p>

          <p>WanNyanCall24 獣医師パートナーへのご登録申請をいただき、誠にありがとうございます。</p>

          <div style="background:#e8f6f5;border-radius:12px;padding:16px;margin:20px 0;">
            <h3 style="color:#2a9d8f;margin:0 0 12px;">📋 今後の流れ</h3>
            <ol style="margin:0;padding-left:20px;line-height:2;">
              <li>担当者が内容を確認いたします（1〜3営業日）</li>
              <li>審査通過後、本登録のご案内メールをお送りします</li>
              <li>獣医師免許証のアップロードで本登録完了</li>
              <li>プロフィール設定後、オンライン相談がスタートできます</li>
            </ol>
          </div>

          <div style="background:#fff8e1;border-radius:12px;padding:16px;margin:20px 0;">
            <h3 style="color:#d97706;margin:0 0 8px;">💴 報酬の仕組み</h3>
            <ul style="margin:0;padding-left:20px;line-height:1.9;font-size:0.9rem;">
              <li>基本相談（15分）: 相談料の<strong>50%</strong>をお受け取り</li>
              <li>指名料: <strong>100%全額</strong>獣医師へ</li>
              <li>夜間（20〜22時）: +500円加算</li>
              <li>深夜（22〜8時）: +750円加算</li>
            </ul>
          </div>

          <p>ご不明な点がございましたら、いつでもご返信ください。</p>
          <p>どうぞよろしくお願いいたします。</p>

          <p style="font-size:0.85rem;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">
            WanNyanCall24 運営事務局<br>
            <a href="mailto:${ADMIN_EMAIL}" style="color:#2a9d8f;">${ADMIN_EMAIL}</a><br>
            <a href="https://wannyancall24.com" style="color:#2a9d8f;">https://wannyancall24.com</a>
          </p>
          <p style="font-size:0.75rem;color:#9ca3af;margin-top:8px;">
            ※ 本メールの配信停止をご希望の場合は、${ADMIN_EMAIL}までご連絡ください。
          </p>
        </div>
      `,
    })
    results.welcomeEmail = '送信済み'
  } catch (err) {
    results.welcomeEmail = `送信失敗: ${err.message}`
  }

  res.json({ ok: true, emailSent: true, results })
})

// ─────────────────────────────────────────────────────────────
// Zapier 連携 — SNS自動投稿用Webhook
// GET /api/zapier/social-post?secret=xxx
// → Zapierの「Schedule」→「Webhooks GET」→「Twitter/Threads投稿」フローで使用
// レスポンス: { text, hashtags, fullText, template }
// ─────────────────────────────────────────────────────────────

const SOCIAL_TEMPLATES = [
  {
    id: 1,
    text: '🐾 獣医師の先生へ｜在宅でスキマ時間に副収入を得ませんか？\n\nWanNyanCall24では、オンライン相談に対応していただける獣医師パートナーを募集中です。\n\n✅ 1相談1,500円〜\n✅ 夜間・深夜加算あり\n✅ 登録・月額費用 完全無料\n✅ スマホ1台でOK\n\n👇 詳細・無料登録はこちら\nhttps://wannyancall24.com/vet-recruit',
  },
  {
    id: 2,
    text: '💡 獣医師免許を活かして副業しませんか？\n\n深夜に「うちの子どうしよう」と不安なペットオーナーに、あなたの知識で安心を届けられます。\n\n🏠 完全在宅・フルリモート\n⏰ 好きな時間だけ対応\n💰 月10〜30万円の実績あり\n\n獣医師パートナー募集中\nhttps://wannyancall24.com/vet-recruit',
  },
  {
    id: 3,
    text: '🌙 夜間対応で高単価！獣医師副業のご案内\n\nWanNyanCall24では、夜間・深夜のオンライン相談に強いニーズがあります。\n\n通常料金+500〜750円の夜間深夜加算で、効率よく稼げます。\n\n📱 応募条件：獣医師免許のみ\n💸 登録無料・いつでも退会可\n\nhttps://wannyancall24.com/vet-recruit',
  },
  {
    id: 4,
    text: '🐕🐈 ペットオーナーが24時間相談できるサービスを運営中\n\n一緒にペットの命を守る獣医師パートナーを募集しています。\n\n育休中・開業待ち・副業希望の先生に特におすすめです。\n\n▶️ WanNyanCall24 獣医師登録\nhttps://wannyancall24.com/vet-recruit\n\n#獣医師募集 #獣医師副業',
  },
  {
    id: 5,
    text: '✨ 獣医師の新しい働き方\n\n「動物病院勤務だけじゃない選択肢」を増やしませんか？\n\nWanNyanCall24はオンライン獣医師相談サービス。\nスキマ時間に自宅から対応でき、副収入として月5〜30万円の実績があります。\n\n詳細・無料登録👇\nhttps://wannyancall24.com/vet-recruit',
  },
  {
    id: 6,
    text: '📣 獣医師パートナー募集中！\n\n✅ 獣医師免許をお持ちの方\n✅ 在宅・副業希望の方\n✅ 動物が好きな方\n\nWanNyanCall24のオンライン獣医師相談に参加しませんか？\n登録費用0円・月額0円・いつでも退会可。\n\nhttps://wannyancall24.com/vet-recruit',
  },
  {
    id: 7,
    text: '💊 専門知識を社会貢献に活かす副業\n\n深夜に動物病院に行けず困っているペットオーナーは多い。\nそんな時、オンラインで相談できる獣医師がいれば安心ですよね。\n\nあなたの専門知識で、困っているオーナーとペットを救いませんか？\n\n👉 https://wannyancall24.com/vet-recruit',
  },
]

const HASHTAGS = '#獣医師副業 #獣医師在宅ワーク #獣医師募集 #オンライン獣医師 #獣医師フリーランス #在宅副業 #WanNyanCall24 #ペット相談 #獣医師 #副業'

// ローテーションカウンタ（プロセス再起動でリセット）
let templateIndex = 0

app.get('/api/zapier/social-post', (req, res) => {
  if (req.query.secret !== ZAPIER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const template = SOCIAL_TEMPLATES[templateIndex % SOCIAL_TEMPLATES.length]
  templateIndex++

  res.json({
    templateId: template.id,
    text: template.text,
    hashtags: HASHTAGS,
    fullText: `${template.text}\n\n${HASHTAGS}`,
    charCount: template.text.length,
    postedAt: new Date().toISOString(),
  })
})

// 全テンプレート一覧確認用（管理者向け）
app.get('/api/zapier/social-post/all', (req, res) => {
  if (req.query.secret !== ZAPIER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  res.json({ templates: SOCIAL_TEMPLATES, hashtags: HASHTAGS, count: SOCIAL_TEMPLATES.length })
})

// ─────────────────────────────────────────────────────────────
// 営業メール一括送信
// ─────────────────────────────────────────────────────────────
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
      results.push({ email: '(不明)', status: 'スキップ', message: 'メールアドレスなし' })
      failCount++
      continue
    }

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
        results.push({ email: recipient.email, status: 'エラー', message: error.message })
        failCount++
      } else {
        results.push({ email: recipient.email, status: '送信済み', id: data?.id })
        successCount++
      }
    } catch (err) {
      results.push({ email: recipient.email, status: 'エラー', message: err.message })
      failCount++
    }

    await new Promise(r => setTimeout(r, 100))
  }

  res.json({ successCount, failCount, total: recipients.length, results })
})

// ─────────────────────────────────────────────────────────────
// メールプレビュー
// ─────────────────────────────────────────────────────────────
app.post('/api/admin/email/preview', (req, res) => {
  const { html, subject, sampleRecipient } = req.body
  const r = sampleRecipient || { name: 'ご担当者', clinicName: '〇〇動物病院', email: 'sample@example.com' }

  const previewHtml = (html || '').replace(/\{\{name\}\}/g, r.name).replace(/\{\{clinicName\}\}/g, r.clinicName)
  const previewSubject = (subject || '').replace(/\{\{name\}\}/g, r.name).replace(/\{\{clinicName\}\}/g, r.clinicName)

  res.json({ html: previewHtml, subject: previewSubject })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
