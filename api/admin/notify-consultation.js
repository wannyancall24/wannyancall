const { Resend } = require('resend')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { vetName, ownerEmail, pet, symptoms, totalAmount } = req.body

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const RESEND_FROM = process.env.RESEND_FROM || 'WanNyanCall24 <onboarding@resend.dev>'
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wannyancall24@gmail.com'

  if (!RESEND_API_KEY) {
    return res.json({ ok: true, emailSent: false, reason: 'APIキー未設定' })
  }

  const resend = new Resend(RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: [ADMIN_EMAIL],
      subject: `【相談開始】獣医師：${vetName || '不明'}、飼い主：${ownerEmail || '不明'}`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:20px;color:#222;">
        <h2 style="color:#2a9d8f;">🐾 新しい相談が開始されました</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px;font-weight:700;color:#264653;width:35%;">獣医師</td>
            <td style="padding:8px;">${vetName || '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;">
            <td style="padding:8px;font-weight:700;color:#264653;">飼い主メール</td>
            <td style="padding:8px;">${ownerEmail || '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px;font-weight:700;color:#264653;">ペット</td>
            <td style="padding:8px;">${pet || '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;">
            <td style="padding:8px;font-weight:700;color:#264653;">相談内容</td>
            <td style="padding:8px;">${symptoms || '—'}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:700;color:#264653;">金額</td>
            <td style="padding:8px;">¥${Number(totalAmount || 0).toLocaleString()}</td>
          </tr>
        </table>
        <p style="font-size:0.8rem;color:#9ca3af;margin-top:16px;">開始日時：${new Date().toLocaleString('ja-JP')}</p>
        <p style="font-size:0.8rem;color:#9ca3af;">※ このメールは自動送信です。</p>
      </div>`,
    })
    res.json({ ok: true, emailSent: true })
  } catch (err) {
    console.error('consultation notify error:', err)
    res.json({ ok: true, emailSent: false, reason: err.message })
  }
}
