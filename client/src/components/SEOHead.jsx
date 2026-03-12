import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'WanNyanCall24'
const BASE_URL = 'https://wannyancall24.com'
const DEFAULT_OGP = `${BASE_URL}/ogp.png`

export default function SEOHead({
  title,
  description,
  keywords,
  ogType = 'website',
  ogImage = DEFAULT_OGP,
  canonical,
  jsonLd,
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | 24時間対応オンライン獣医師相談`
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
      <link rel="canonical" href={url} />

      {/* OGP */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ja_JP" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD 構造化データ */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
