const { Resend } = require('resend')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, role } = req.body
  if (!email) return res.status(400).json({ error: 'メールアドレスが必要です' })

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const RESEND_FROM = process.env.RESEND_FROM || 'WanNyanCall24 <onboarding@resend.dev>'
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wannyancall24@gmail.com'
  const SITE_URL = process.env.SITE_URL || 'https://wannyancall.vercel.app'

  if (!RESEND_API_KEY) {
    return res.json({ ok: true, emailSent: false, reason: 'APIキー未設定' })
  }

  const resend = new Resend(RESEND_API_KEY)
  const isVet = role === 'vet'
  const displayName = name || (isVet ? '先生' : 'お客様')

  // ── 管理者通知（fire-and-forget）──
  const adminSubject = isVet
    ? `【新規獣医師登録】${name || '（名前未入力）'}`
    : `【新規飼い主登録】${email}`
  const adminBody = isVet
    ? `<p>新しい獣医師が登録されました。</p><ul><li>名前：${name || '（未入力）'}</li><li>メール：${email}</li></ul><p>登録日時：${new Date().toLocaleString('ja-JP')}</p>`
    : `<p>新しい飼い主が登録されました。</p><ul><li>メール：${email}</li></ul><p>登録日時：${new Date().toLocaleString('ja-JP')}</p>`

  resend.emails.send({
    from: RESEND_FROM,
    to: [ADMIN_EMAIL],
    subject: adminSubject,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:20px;color:#222;">
      <h2 style="color:#2a9d8f;">🐾 WanNyanCall24 管理者通知</h2>
      ${adminBody}
      <p style="font-size:0.8rem;color:#9ca3af;">※ このメールは自動送信です。</p>
    </div>`,
  }).catch(err => console.error('admin notify error:', err))

  // ── ユーザーへウェルカムメール ──
  try {
    const { data: mailData, error: mailError } = await resend.emails.send({
      from: RESEND_FROM,
      to: [email],
      subject: '【WanNyanCall24】ご登録ありがとうございます',
      html: `
        <div style="font-family:-apple-system,'Hiragino Sans','Noto Sans JP',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="font-size:2.5rem;">🐾</div>
            <h1 style="color:#2a9d8f;font-size:1.3rem;margin:8px 0;">ご登録ありがとうございます！</h1>
          </div>
          <p>${displayName}、WanNyanCall24へのご登録ありがとうございます。</p>
          ${isVet ? `
          <div style="background:#e8f6f5;border-radius:12px;padding:16px;margin:20px 0;">
            <h3 style="color:#2a9d8f;margin:0 0 10px;">📋 次のステップ</h3>
            <ol style="margin:0;padding-left:20px;line-height:2;font-size:0.9rem;">
              <li>ダッシュボードから獣医師免許証をアップロード</li>
              <li>運営による審査（1〜3営業日）</li>
              <li>承認後、オンライン相談を開始できます</li>
            </ol>
          </div>
          ` : `
          <div style="background:#e8f6f5;border-radius:12px;padding:16px;margin:20px 0;">
            <h3 style="color:#2a9d8f;margin:0 0 10px;">🐾 WanNyanCall24でできること</h3>
            <ul style="margin:0;padding-left:20px;line-height:2;font-size:0.9rem;">
              <li>獣医師へのオンライン相談（チャット・ビデオ通話）</li>
              <li>24時間・夜間深夜も対応</li>
              <li>犬・猫・小動物・鳥・エキゾチックに対応</li>
            </ul>
          </div>
          `}
          <div style="text-align:center;margin:28px 0;">
            <a href="${SITE_URL}"
              style="background:#2a9d8f;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">
              ダッシュボードを開く
            </a>
          </div>
          <p style="font-size:0.82rem;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">
            WanNyanCall24 運営事務局<br>
            <a href="mailto:${ADMIN_EMAIL}" style="color:#2a9d8f;">${ADMIN_EMAIL}</a>
          </p>
        </div>
      `,
    })
    if (mailError) {
      console.error('welcome email error:', mailError)
      return res.json({ ok: true, emailSent: false, reason: mailError.message })
    }
    console.log('welcome email sent:', mailData?.id)
    res.json({ ok: true, emailSent: true })
  } catch (err) {
    console.error('welcome email exception:', err)
    res.json({ ok: true, emailSent: false, reason: err.message })
  }
}
