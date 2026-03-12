const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'メールアドレスが必要です' })

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const RESEND_FROM = process.env.RESEND_FROM || 'WanNyanCall24 <onboarding@resend.dev>'
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wannyancall24@gmail.com'
  const SITE_URL = process.env.SITE_URL || 'https://wannyancall24.com'

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'サーバーのSupabase設定が未完了です' })
  }
  if (!RESEND_API_KEY) {
    return res.status(503).json({ error: 'RESEND_API_KEY が未設定です' })
  }

  // Supabase Admin でリカバリーリンクを生成
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${SITE_URL}/auth` },
  })

  if (linkError) {
    console.error('generateLink error:', linkError)
    return res.status(400).json({ error: linkError.message })
  }

  const resetUrl = data?.properties?.action_link
  if (!resetUrl) {
    return res.status(500).json({ error: 'リセットリンクの生成に失敗しました' })
  }

  // Resend でメール送信
  const resend = new Resend(RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: RESEND_FROM,
      to: [email],
      subject: '【WanNyanCall24】パスワードリセットのご案内',
      html: `
        <div style="font-family:-apple-system,'Hiragino Sans','Noto Sans JP',Meiryo,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="font-size:2.5rem;">🐾</div>
            <h1 style="color:#2a9d8f;font-size:1.3rem;margin:8px 0;">パスワードリセット</h1>
          </div>
          <p>WanNyanCall24をご利用いただきありがとうございます。</p>
          <p>以下のボタンからパスワードの再設定を行ってください。</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="background:#2a9d8f;color:#fff;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:1rem;display:inline-block;">
              パスワードを再設定する
            </a>
          </div>
          <div style="background:#f9fafb;border-radius:10px;padding:14px;margin:20px 0;font-size:0.83rem;color:#6b7280;line-height:1.7;">
            <p style="margin:0 0 6px;font-weight:600;color:#264653;">ご注意</p>
            <ul style="margin:0;padding-left:18px;">
              <li>このリンクは<strong>1時間</strong>で有効期限が切れます</li>
              <li>このメールに心当たりのない場合は無視してください</li>
            </ul>
          </div>
          <p style="font-size:0.82rem;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">
            WanNyanCall24 運営事務局<br>
            <a href="mailto:${ADMIN_EMAIL}" style="color:#2a9d8f;">${ADMIN_EMAIL}</a>
          </p>
        </div>
      `,
    })
  } catch (mailErr) {
    console.error('Resend error:', mailErr)
    return res.status(500).json({ error: `メール送信エラー: ${mailErr.message}` })
  }

  res.json({ ok: true })
}
