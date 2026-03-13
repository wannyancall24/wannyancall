import { Link } from 'react-router-dom'
import SEOHead from '../components/SEOHead'

const s = {
  section: { marginBottom: 28 },
  h2: { fontWeight: 700, fontSize: '0.95rem', color: '#264653', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #e8f6f5' },
  p: { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.9, marginBottom: 8 },
  li: { fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.9, paddingLeft: 20, marginBottom: 8 },
}

const Article = ({ no, title, children }) => (
  <div style={s.section}>
    <h2 style={s.h2}>第{no}条（{title}）</h2>
    {children}
  </div>
)

const Ol = ({ children }) => (
  <ol style={{ ...s.li, paddingLeft: 20 }}>{children}</ol>
)

const Ul = ({ children }) => (
  <ul style={{ ...s.li, paddingLeft: 20, listStyleType: 'disc' }}>{children}</ul>
)

const P = ({ children }) => <p style={s.p}>{children}</p>

export default function Terms() {
  return (
    <>
      <SEOHead
        title="利用規約"
        description="WanNyanCall24の利用規約です。ペットオーナー・獣医師パートナー双方の利用条件、禁止事項、免責事項、報酬規定などを定めています。"
        canonical="/terms"
        noIndex={false}
      />

      <div className="page" style={{ paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #2a9d8f, #21867a)', padding: '28px 20px', color: '#fff' }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.2rem' }}>📋 利用規約</h1>
          <p style={{ fontSize: '0.83rem', opacity: 0.85, marginTop: 6 }}>WanNyanCall24 サービス利用規約</p>
        </div>

        <div style={{ padding: 16 }}>
          {/* 前文 */}
          <div className="card" style={{ marginBottom: 12 }}>
            <P>
              この利用規約（以下「本規約」）は、野口絵未（以下「当社」）が提供するオンラインペット相談サービス「WanNyanCall24」（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく全てのユーザー（ペットオーナー・獣医師パートナーを含む。以下「利用者」）に適用されます。本サービスのご利用をもって、本規約に同意したものとみなします。
            </P>
          </div>

          <div className="card">
            <Article no="1" title="サービスの内容">
              <Ol>
                <li>本サービスは、ペットオーナーがスマートフォン・パソコンを通じて、獣医師免許を有する獣医師（以下「獣医師パートナー」）にオンラインビデオ通話でペットの健康に関する相談ができるサービスです。</li>
                <li>本サービスは情報提供・アドバイスを目的としており、獣医療法に定める診断・処方・治療行為を行うものではありません。</li>
                <li>緊急を要するペットの症状（意識消失・呼吸困難・大量出血等）については、直ちに最寄りの動物病院を受診してください。</li>
                <li>当社は、ペットオーナーと獣医師パートナーとの相談の場を提供するプラットフォームであり、相談内容に関する医療的責任は負いません。</li>
              </Ol>
            </Article>

            <Article no="2" title="利用登録">
              <Ol>
                <li>本サービスの利用には、当社所定の方法による利用登録が必要です。</li>
                <li>登録情報は正確かつ最新の状態を保つものとします。虚偽の情報で登録した場合、当社はアカウントを停止または削除できます。</li>
                <li>アカウントの管理責任は利用者にあります。第三者への貸与・譲渡・売買は禁止します。</li>
                <li>未成年者が本サービスを利用する場合は、保護者の同意を得たうえでご利用ください。</li>
                <li>当社は、利用者が以下に該当すると判断した場合、登録を拒否できます。
                  <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                    <li>過去に本規約違反によりアカウントを停止された者</li>
                    <li>反社会的勢力に関係する者</li>
                    <li>その他当社が不適切と判断した者</li>
                  </ul>
                </li>
              </Ol>
            </Article>

            <Article no="3" title="料金・支払い">
              <Ol>
                <li>ペットオーナーが支払う相談料金は、各獣医師パートナーのプロフィールページおよび予約画面に表示される金額とします。</li>
                <li>基本相談料は15分3,000円（犬・猫）、15分4,500円（小動物・鳥・エキゾチック）を標準とし、時間延長・夜間加算・深夜加算・指名料が別途加算される場合があります。</li>
                <li>支払いはクレジットカード（Stripe決済）により行われます。</li>
                <li>相談開始時に仮押さえ（オーソリゼーション）を行い、相談終了後に確定決済します。</li>
                <li>システム利用料（800円）は別途申し受けます。</li>
                <li>決済に関するトラブルはStripe社の規約に準じます。</li>
              </Ol>
            </Article>

            <Article no="4" title="キャンセル・返金">
              <Ol>
                <li>相談予約の24時間前まで：全額返金</li>
                <li>相談予約の24時間以内：50%返金</li>
                <li>無断キャンセル・連絡なし不参加：返金なし</li>
                <li>獣医師パートナー側の都合によるキャンセル：全額返金</li>
                <li>通信障害・システム障害による相談中断については、相談時間に応じて按分返金します。</li>
                <li>返金はStripe経由でクレジットカードへの返金処理となります。処理には3〜7営業日かかる場合があります。</li>
              </Ol>
            </Article>

            <Article no="5" title="獣医師パートナーの登録・報酬">
              <Ol>
                <li>獣医師パートナーとしての登録には、日本の獣医師免許の保有が必須条件です。</li>
                <li>登録申請後、当社が免許証の確認・審査を行います。審査通過後に本登録が完了します。</li>
                <li>獣医師パートナーは業務委託契約に基づきサービスを提供します。雇用関係は生じません。</li>
                <li>獣医師パートナーへの報酬は以下の通りです。
                  <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                    <li>相談料（基本料金＋延長料金＋夜間・深夜加算）の50%</li>
                    <li>指名料：100%全額獣医師パートナーへ</li>
                  </ul>
                </li>
                <li>報酬は毎月2回払いとします。1日〜15日分は15日締め・22日払い、16日〜末日分は末日締め・翌月7日払い。</li>
                <li>獣医師パートナーは、副業・兼業が自身の勤務先の就業規則に反しないことを自ら確認する責任を負います。</li>
                <li>獣医師パートナーは確定申告・税務処理を自己の責任において行うものとします。</li>
              </Ol>
            </Article>

            <Article no="6" title="禁止事項">
              <P>利用者（ペットオーナー・獣医師パートナー双方）は、以下の行為を行ってはなりません。</P>
              <Ol>
                <li>法令・公序良俗に反する行為</li>
                <li>相手方への嫌がらせ・誹謗中傷・脅迫・ハラスメント行為</li>
                <li>相談内容の無断録音・録画・第三者への公開・SNS投稿</li>
                <li>本サービス外での直接取引・連絡先交換の強要</li>
                <li>虚偽の情報・資格を詐称した利用登録</li>
                <li>他の利用者の個人情報の不正収集・利用</li>
                <li>当社のシステムへの不正アクセス・改ざん・妨害</li>
                <li>本サービスを商業目的・営利目的で利用する行為（当社が別途認めた場合を除く）</li>
                <li>反社会的勢力への利益供与その他の協力行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </Ol>
            </Article>

            <Article no="7" title="免責事項">
              <Ol>
                <li>本サービスで提供されるアドバイスは参考情報であり、獣医療行為に代わるものではありません。アドバイスに基づく利用者の判断・行動に生じた損害について、当社は責任を負いません。</li>
                <li>通信環境・端末・ブラウザの不具合による相談の中断・品質低下について、当社は最善を尽くしますが完全な稼働を保証しません。</li>
                <li>獣医師パートナーと利用者間のトラブルについて、当社は仲介に努めますが、当事者間の責任に属する事項については責任を負いません。</li>
                <li>当社の責に帰さない事由による損害（天災・感染症・インフラ障害等）については責任を負いません。</li>
                <li>当社が損害賠償責任を負う場合、その範囲は利用者が当社に支払った直近3ヶ月分の料金を上限とします。</li>
              </Ol>
            </Article>

            <Article no="8" title="知的財産権">
              <P>本サービスに関するコンテンツ、デザイン、ロゴ、ソースコード等の知的財産権は当社または正当な権利者に帰属します。利用者は当社の書面による事前承諾なく、複製・転用・改変・二次利用することはできません。</P>
            </Article>

            <Article no="9" title="個人情報の取り扱い">
              <P>当社は、利用者の個人情報を別途定める「プライバシーポリシー」に従って適切に取り扱います。</P>
            </Article>

            <Article no="10" title="アカウントの停止・退会">
              <Ol>
                <li>当社は、利用者が本規約に違反した場合または違反のおそれがある場合、事前の通知なくアカウントを停止または削除できます。</li>
                <li>利用者は、マイページの退会手続きよりいつでも退会できます。退会後のアカウント情報の復元はできません。</li>
                <li>退会後も、法令・本規約上の義務は退会後も継続して適用されます。</li>
              </Ol>
            </Article>

            <Article no="11" title="サービスの変更・終了">
              <Ol>
                <li>当社は、事前の通知なく本サービスの内容を変更・中断・終了できます。</li>
                <li>本サービスの終了により利用者に生じた損害について、当社は責任を負いません。</li>
              </Ol>
            </Article>

            <Article no="12" title="規約の変更">
              <P>当社は必要に応じて本規約を変更できます。重要な変更がある場合はメールまたはアプリ内通知でお知らせします。変更後も継続して本サービスを利用した場合、変更後の規約に同意したものとみなします。</P>
            </Article>

            <div style={{ marginBottom: 0 }}>
              <h2 style={s.h2}>第13条（準拠法・管轄裁判所）</h2>
              <Ol>
                <li>本規約は日本法に準拠します。</li>
                <li>本サービスに関する一切の紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
              </Ol>
            </div>
          </div>

          {/* 制定日 */}
          <div className="card" style={{ background: '#f9fafb', marginTop: 8 }}>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.8 }}>
              制定日：2024年12月1日<br />
              最終更新日：2026年3月13日
            </p>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                <span style={{ fontWeight: 600 }}>お問い合わせ</span><br />
                野口絵未（WanNyanCall24 運営）<br />
                <a href="mailto:wannyancall24@gmail.com" style={{ color: '#2a9d8f', fontWeight: 600 }}>wannyancall24@gmail.com</a>
              </p>
            </div>
          </div>

          {/* ナビ */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Link to="/privacy" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>プライバシーポリシー</Link>
            <Link to="/legal" style={{ flex: 1, textAlign: 'center', fontSize: '0.82rem', color: '#2a9d8f', fontWeight: 600, textDecoration: 'none', background: '#e8f6f5', padding: '10px', borderRadius: 50 }}>特定商取引法</Link>
          </div>
        </div>
      </div>
    </>
  )
}
