import { Link } from 'react-router-dom'

export default function Terms() {
  const section = { marginBottom: 24 }
  const h2 = { fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #e8f6f5' }
  const p = { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.85, marginBottom: 8 }
  const ol = { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.85, paddingLeft: 20, marginBottom: 8 }

  return (
    <div className="page">
      <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '28px 20px', color: '#fff' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>📋 利用規約</h1>
        <p style={{ fontSize: '0.83rem', opacity: 0.85, marginTop: 6 }}>WanNyanCall サービス利用規約</p>
      </div>

      <div style={{ padding: 16 }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={p}>この利用規約（以下「本規約」）は、野口絵未（以下「当社」）が提供するオンラインペット相談サービス「WanNyanCall」（以下「本サービス」）の利用に関する条件を定めるものです。本サービスをご利用いただく全てのユーザー（以下「利用者」）に適用されます。</p>
        </div>

        <div className="card">
          <div style={section}>
            <h2 style={h2}>第1条（サービスの内容）</h2>
            <ol style={ol}>
              <li>本サービスは、オンラインビデオ通話を通じて獣医師にペットの健康に関する相談ができるサービスです。</li>
              <li>本サービスは獣医療行為（診断・処方・治療）を行うものではなく、情報提供およびアドバイスを目的としています。</li>
              <li>緊急を要する場合は、最寄りの動物病院を受診してください。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第2条（利用登録）</h2>
            <ol style={ol}>
              <li>利用者は、当社所定の方法により利用登録を行うものとします。</li>
              <li>登録情報は正確かつ最新の状態を保つものとし、虚偽の情報で登録した場合、当社はアカウントを停止できるものとします。</li>
              <li>アカウントの管理責任は利用者にあり、第三者への貸与・譲渡はできません。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第3条（料金・支払い）</h2>
            <ol style={ol}>
              <li>相談料金は各獣医師のプロフィールページおよび予約画面に表示される金額とします。</li>
              <li>支払いはクレジットカード（Stripe決済）により行われます。</li>
              <li>相談開始時に仮押さえ（オーソリ）を行い、相談終了後に確定決済されます。</li>
              <li>買い切りプランを購入した場合、システム利用料が無料となります。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第4条（キャンセル・返金）</h2>
            <ol style={ol}>
              <li>相談予約の24時間前まで：全額返金</li>
              <li>相談予約の24時間以内：50%返金</li>
              <li>無断キャンセル：返金なし</li>
              <li>獣医師側の都合によるキャンセルの場合は全額返金されます。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第5条（禁止事項）</h2>
            <p style={p}>利用者は以下の行為を行ってはなりません。</p>
            <ol style={ol}>
              <li>法令または公序良俗に反する行為</li>
              <li>獣医師への嫌がらせ、誹謗中傷、脅迫行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他の利用者の個人情報を不正に収集する行為</li>
              <li>相談内容を無断で録音・録画・公開する行為</li>
              <li>本サービスを商業目的で利用する行為（当社が認めた場合を除く）</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第6条（免責事項）</h2>
            <ol style={ol}>
              <li>本サービスで提供されるアドバイスは参考情報であり、獣医療行為に代わるものではありません。</li>
              <li>相談内容に基づく利用者の判断・行動について、当社は責任を負いません。</li>
              <li>通信環境やシステム障害による中断について、当社は最善を尽くしますが完全な稼働を保証するものではありません。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第7条（知的財産権）</h2>
            <p style={p}>本サービスに関するコンテンツ、デザイン、ロゴ等の知的財産権は当社または権利者に帰属します。利用者は当社の書面による事前承諾なく、これらを複製・転用することはできません。</p>
          </div>

          <div style={section}>
            <h2 style={h2}>第8条（アカウントの停止・退会）</h2>
            <ol style={ol}>
              <li>当社は、利用者が本規約に違反した場合、事前の通知なくアカウントを停止または削除できます。</li>
              <li>利用者は、マイページから退会手続きを行うことができます。退会後、アカウント情報は削除されます。</li>
            </ol>
          </div>

          <div style={section}>
            <h2 style={h2}>第9条（規約の変更）</h2>
            <p style={p}>当社は必要に応じて本規約を変更できるものとします。変更後の規約は本ページに掲載した時点で効力を生じます。重要な変更がある場合は、メールまたはアプリ内通知でお知らせします。</p>
          </div>

          <div style={{ marginBottom: 0 }}>
            <h2 style={h2}>第10条（準拠法・管轄裁判所）</h2>
            <ol style={ol}>
              <li>本規約は日本法に準拠します。</li>
              <li>本サービスに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
            </ol>
          </div>
        </div>

        <div className="card" style={{ background: '#f9fafb', marginTop: 4 }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6 }}>
            制定日：2025年1月1日<br />
            最終更新日：2025年1月1日
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Link to="/privacy" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>プライバシーポリシー</Link>
          <Link to="/legal" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>特定商取引法</Link>
        </div>
      </div>
    </div>
  )
}
