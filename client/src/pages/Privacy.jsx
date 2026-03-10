import { Link } from 'react-router-dom'

export default function Privacy() {
  const section = { marginBottom: 24 }
  const h2 = { fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #e8f6f5' }
  const p = { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.85, marginBottom: 8 }
  const ol = { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.85, paddingLeft: 20, marginBottom: 8 }
  const table = { width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', marginBottom: 8 }
  const th = { background: '#f3f4f6', padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#264653', border: '1px solid #e5e7eb' }
  const td = { padding: '8px 10px', color: '#4b5563', border: '1px solid #e5e7eb', lineHeight: 1.6 }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '28px 20px', color: '#fff' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>🔒 プライバシーポリシー</h1>
        <p style={{ fontSize: '0.83rem', opacity: 0.85, marginTop: 6 }}>WanNyanCall 個人情報の取り扱いについて</p>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={p}>野口絵未（以下「当社」）は、オンラインペット相談サービス「WanNyanCall」（以下「本サービス」）における個人情報の取り扱いについて、以下の通りプライバシーポリシーを定めます。</p>
        </div>

        <div className="card">
          <div style={section}>
            <h2 style={h2}>第1条（収集する個人情報）</h2>
            <p style={p}>当社は、本サービスの提供にあたり、以下の個人情報を収集します。</p>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>情報の種類</th>
                  <th style={th}>具体例</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={td}>アカウント情報</td><td style={td}>氏名、メールアドレス、電話番号、住所</td></tr>
                <tr><td style={td}>ペット情報</td><td style={td}>ペット名、種類、品種、年齢、体重、健康状態</td></tr>
                <tr><td style={td}>決済情報</td><td style={td}>クレジットカード情報（Stripeが安全に管理）</td></tr>
                <tr><td style={td}>相談履歴</td><td style={td}>相談日時、相談内容、担当獣医師</td></tr>
                <tr><td style={td}>利用情報</td><td style={td}>アクセスログ、端末情報、IPアドレス</td></tr>
              </tbody>
            </table>
          </div>

          <div style={section}>
            <h2 style={h2}>第2条（利用目的）</h2>
            <p style={p}>収集した個人情報は、以下の目的で利用します。</p>
            <ol style={ol}>
              <li>本サービスの提供・運営・改善</li>
              <li>利用者のアカウント管理・本人確認</li>
              <li>相談予約の管理・獣医師とのマッチング</li>
              <li>料金の請求・決済処理</li>
              <li>お問い合わせへの対応・サポート</li>
              <li>サービスに関するお知らせ・キャンペーン情報の配信</li>
              <li>利用状況の分析・統計データの作成（個人を特定しない形式）</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第3条（第三者提供）</h2>
            <p style={p}>当社は、以下の場合を除き、利用者の個人情報を第三者に提供しません。</p>
            <ol style={ol}>
              <li>利用者の同意がある場合</li>
              <li>相談サービス提供のため、担当獣医師に必要な情報を共有する場合</li>
              <li>決済処理のため、Stripe社に決済情報を送信する場合</li>
              <li>法令に基づき開示が求められた場合</li>
              <li>人の生命・身体または財産の保護に必要な場合</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第4条（情報の管理・安全対策）</h2>
            <ol style={ol}>
              <li>個人情報はSupabase（クラウドデータベース）により安全に管理されます。</li>
              <li>通信はSSL/TLSにより暗号化されています。</li>
              <li>クレジットカード情報は当社サーバーに保存されず、Stripe社が PCI DSS に準拠して管理します。</li>
              <li>Row Level Security（RLS）により、利用者は自身のデータのみアクセスできます。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第5条（個人情報の開示・訂正・削除）</h2>
            <ol style={ol}>
              <li>利用者は、マイページから自身の登録情報を確認・変更できます。</li>
              <li>アカウント削除（退会）を行った場合、個人情報は速やかに削除されます。</li>
              <li>その他の開示・訂正・削除の請求は、下記のお問い合わせ先までご連絡ください。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第6条（Cookieの使用）</h2>
            <p style={p}>本サービスでは、利用者の認証状態の維持およびサービス改善のためにCookieを使用する場合があります。ブラウザの設定によりCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。</p>
          </div>

          <div style={section}>
            <h2 style={h2}>第7条（未成年の利用者）</h2>
            <p style={p}>18歳未満の方が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。</p>
          </div>

          <div style={{ marginBottom: 0 }}>
            <h2 style={h2}>第8条（ポリシーの変更）</h2>
            <p style={p}>当社は、必要に応じて本ポリシーを変更できるものとします。変更後のポリシーは本ページに掲載した時点で効力を生じます。</p>
          </div>
        </div>

        <div className="card" style={{ background: '#f9fafb', marginTop: 4 }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
            制定日：2025年1月1日<br />
            最終更新日：2025年1月1日
          </p>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
              <span style={{ fontWeight: 600 }}>お問い合わせ先</span><br />
              野口絵未（WanNyanCall 運営）<br />
              <span style={{ color: '#2a9d8f', fontWeight: 600 }}>wannyancall24@gmail.com</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Link to="/terms" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>利用規約</Link>
          <Link to="/legal" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>特定商取引法</Link>
        </div>
      </div>
    </div>
  )
}
