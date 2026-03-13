import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const s = {
  section: { marginBottom: 28 },
  h2: { fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #e8f6f5' },
  p: { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.9, marginBottom: 8 },
  li: { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.9, paddingLeft: 20, marginBottom: 8 },
  th: { background: '#f3f4f6', padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#264653', border: '1px solid #e5e7eb', fontSize: '0.82rem' },
  td: { padding: '8px 10px', color: '#4b5563', border: '1px solid #e5e7eb', lineHeight: 1.65, fontSize: '0.82rem' },
}

const Article = ({ no, title, children }) => (
  <div style={s.section}>
    <h2 style={s.h2}>第{no}条（{title}）</h2>
    {children}
  </div>
)

const Ol = ({ children }) => <ol style={{ ...s.li, paddingLeft: 20 }}>{children}</ol>
const P = ({ children }) => <p style={s.p}>{children}</p>

export default function Privacy() {
  return (
    <>
      <SEOHead
        title="プライバシーポリシー"
        description="WanNyanCall24の個人情報の取り扱いについて定めたプライバシーポリシーです。収集情報・利用目的・第三者提供・安全管理措置・開示請求対応などを規定しています。"
        canonical="/privacy"
        noIndex={false}
      />

      <div className="page" style={{ paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '28px 20px', color: '#fff' }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>🔒 プライバシーポリシー</h1>
          <p style={{ fontSize: '0.83rem', opacity: 0.85, marginTop: 6 }}>WanNyanCall24 個人情報の取り扱いについて</p>
        </div>

        <div style={{ padding: 16 }}>
          {/* 前文 */}
          <div className="card" style={{ marginBottom: 12 }}>
            <P>
              野口絵未（以下「当社」）は、オンラインペット相談サービス「WanNyanCall24」（以下「本サービス」）における個人情報の取り扱いについて、個人情報の保護に関する法律（個人情報保護法）その他関連法令を遵守し、以下のプライバシーポリシーを定めます。
            </P>
          </div>

          <div className="card">
            <Article no="1" title="取得する個人情報">
              <P>当社は、本サービスの提供にあたり、以下の個人情報を取得します。</P>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                <thead>
                  <tr>
                    <th style={s.th}>情報の種類</th>
                    <th style={s.th}>具体的な項目</th>
                    <th style={s.th}>取得方法</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={s.td}>アカウント情報</td>
                    <td style={s.td}>氏名、メールアドレス、電話番号</td>
                    <td style={s.td}>登録時に直接入力</td>
                  </tr>
                  <tr>
                    <td style={s.td}>獣医師情報</td>
                    <td style={s.td}>獣医師免許番号、免許証画像、専門分野、経歴</td>
                    <td style={s.td}>獣医師登録時</td>
                  </tr>
                  <tr>
                    <td style={s.td}>ペット情報</td>
                    <td style={s.td}>ペット名、種類・品種、年齢、健康状態</td>
                    <td style={s.td}>プロフィール設定時</td>
                  </tr>
                  <tr>
                    <td style={s.td}>決済情報</td>
                    <td style={s.td}>クレジットカード情報（Stripeが管理・当社非保持）</td>
                    <td style={s.td}>決済時</td>
                  </tr>
                  <tr>
                    <td style={s.td}>相談履歴</td>
                    <td style={s.td}>相談日時、相談内容、担当獣医師、評価</td>
                    <td style={s.td}>相談利用時に自動記録</td>
                  </tr>
                  <tr>
                    <td style={s.td}>利用ログ</td>
                    <td style={s.td}>アクセスログ、端末情報、IPアドレス、Cookie</td>
                    <td style={s.td}>サービス利用時に自動取得</td>
                  </tr>
                  <tr>
                    <td style={s.td}>お問い合わせ内容</td>
                    <td style={s.td}>問い合わせ内容、連絡先</td>
                    <td style={s.td}>問い合わせ時</td>
                  </tr>
                </tbody>
              </table>
            </Article>

            <Article no="2" title="利用目的">
              <P>取得した個人情報は、以下の目的のために利用します。</P>
              <Ol>
                <li>本サービスの提供・運営・維持・改善</li>
                <li>利用者のアカウント管理・本人確認・認証</li>
                <li>獣医師パートナーの資格審査・登録管理</li>
                <li>相談予約の管理・獣医師とのマッチング</li>
                <li>料金の請求・決済処理・報酬の支払い</li>
                <li>カスタマーサポート・お問い合わせ対応</li>
                <li>サービスに関するお知らせ・重要情報のメール配信</li>
                <li>マーケティング・獣医師募集のメール配信（配信停止可）</li>
                <li>利用状況の分析・統計データの作成（個人を特定しない形式）</li>
                <li>不正利用の検知・防止・セキュリティ対策</li>
                <li>法令上の義務の履行</li>
              </Ol>
            </Article>

            <Article no="3" title="第三者提供">
              <P>当社は、以下の場合を除き、利用者の個人情報を第三者に提供しません。</P>
              <Ol>
                <li>利用者の事前の同意がある場合</li>
                <li>相談サービス提供のため、担当獣医師パートナーにペット情報・相談内容を共有する場合</li>
                <li>決済処理のため、Stripe, Inc.に決済情報を提供する場合</li>
                <li>メール配信のため、Resend（メール送信サービス）に氏名・メールアドレスを提供する場合</li>
                <li>アクセス解析のため、Google LLC（Google Analytics）に利用ログを提供する場合</li>
                <li>データベース管理のため、Supabase, Inc.にアカウント情報を保管する場合</li>
                <li>法令に基づく開示請求があった場合</li>
                <li>人の生命・身体または財産の保護のために必要な場合</li>
                <li>公衆衛生の向上または児童の健全な育成のために特に必要な場合</li>
              </Ol>
            </Article>

            <Article no="4" title="外部サービスの利用">
              <P>本サービスでは以下の外部サービスを使用しており、各サービスの利用規約・プライバシーポリシーが適用される場合があります。</P>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                <thead>
                  <tr>
                    <th style={s.th}>サービス</th>
                    <th style={s.th}>用途</th>
                    <th style={s.th}>提供会社</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={s.td}>Supabase</td>
                    <td style={s.td}>データベース・認証管理</td>
                    <td style={s.td}>Supabase, Inc.（米国）</td>
                  </tr>
                  <tr>
                    <td style={s.td}>Stripe</td>
                    <td style={s.td}>決済処理</td>
                    <td style={s.td}>Stripe, Inc.（米国）</td>
                  </tr>
                  <tr>
                    <td style={s.td}>Resend</td>
                    <td style={s.td}>メール送信</td>
                    <td style={s.td}>Resend, Inc.（米国）</td>
                  </tr>
                  <tr>
                    <td style={s.td}>Google Analytics</td>
                    <td style={s.td}>アクセス解析</td>
                    <td style={s.td}>Google LLC（米国）</td>
                  </tr>
                </tbody>
              </table>
              <P>これらのサービスへの情報提供は、各社との間の個人情報の取り扱いに関する契約に基づいて行います。</P>
            </Article>

            <Article no="5" title="安全管理措置">
              <Ol>
                <li>個人情報はSupabase（クラウドデータベース）により、アクセス制御・暗号化のもとで安全に管理します。</li>
                <li>通信はTLS/SSLにより暗号化されています。</li>
                <li>クレジットカード情報は当社サーバーに保存せず、Stripe社がPCI DSSに準拠して管理します。</li>
                <li>Row Level Security（行レベルセキュリティ）により、利用者は自身のデータのみにアクセスできます。</li>
                <li>従業員・業務委託先への個人情報開示は業務上必要な範囲に限定し、適切な管理体制のもとで行います。</li>
              </Ol>
            </Article>

            <Article no="6" title="Cookieおよびアクセス解析">
              <Ol>
                <li>本サービスでは、認証状態の維持・セキュリティ・サービス改善のためにCookieおよびローカルストレージを使用します。</li>
                <li>Google Analytics 4を使用してサービスの利用状況を分析します。収集したデータは個人を特定しない形式で集計・分析します。</li>
                <li>Google Analyticsによるデータ収集を拒否する場合は、<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" style={{ color: '#2a9d8f' }}>Googleアナリティクスオプトアウトアドオン</a>をご利用ください。</li>
                <li>ブラウザの設定によりCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。</li>
              </Ol>
            </Article>

            <Article no="7" title="個人情報の保存期間">
              <Ol>
                <li>アカウント情報：退会後1年間保存後、削除します。</li>
                <li>相談履歴：相談終了後3年間保存します。</li>
                <li>決済情報：法令上の保存義務に従い管理します。</li>
                <li>アクセスログ：取得後1年間保存後、削除します。</li>
              </Ol>
            </Article>

            <Article no="8" title="個人情報の開示・訂正・削除・利用停止">
              <P>利用者は、当社が保有する自己の個人情報について、以下の権利を有します。</P>
              <Ol>
                <li><strong>開示：</strong>保有する個人情報の開示を求めることができます。</li>
                <li><strong>訂正・追加・削除：</strong>内容に誤りがある場合、訂正・追加・削除を求めることができます。</li>
                <li><strong>利用停止・消去：</strong>利用目的の達成に必要な範囲を超えた利用停止・消去を求めることができます。</li>
                <li><strong>第三者提供の停止：</strong>第三者への提供の停止を求めることができます。</li>
              </Ol>
              <P>上記の請求は、下記お問い合わせ先までメールにてご連絡ください。本人確認のうえ、法令に従い対応いたします。通常2週間以内にご回答します。</P>
            </Article>

            <Article no="9" title="未成年者の利用">
              <P>18歳未満の方が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。当社は、保護者の同意なく18歳未満の方から個人情報を意図的に収集することはありません。</P>
            </Article>

            <div style={{ marginBottom: 0 }}>
              <h2 style={s.h2}>第10条（プライバシーポリシーの変更）</h2>
              <P>当社は、必要に応じて本ポリシーを変更できます。重要な変更がある場合はメールまたはサービス内でお知らせします。変更後のポリシーは本ページに掲載した時点で効力を生じます。</P>
            </div>
          </div>

          {/* フッター */}
          <div className="card" style={{ background: '#f9fafb', marginTop: 8 }}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.8 }}>
              制定日：2024年12月1日<br />
              最終更新日：2026年3月13日
            </p>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.8 }}>
                <span style={{ fontWeight: 600 }}>個人情報に関するお問い合わせ先</span><br />
                野口絵未（WanNyanCall24 個人情報保護担当）<br />
                <a href="mailto:wannyancall24@gmail.com" style={{ color: '#2a9d8f', fontWeight: 600 }}>wannyancall24@gmail.com</a><br />
                受付時間：平日10:00〜18:00（土日祝・年末年始を除く）
              </p>
            </div>
          </div>

          {/* ナビ */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Link to="/terms" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>利用規約</Link>
            <Link to="/legal" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>特定商取引法</Link>
          </div>
        </div>
      </div>
    </>
  )
}
