# WanNyanCall24

24時間対応オンライン獣医師相談サービス

---

## 開発環境のセットアップ

```bash
npm run install:all   # 全依存関係をインストール
npm run dev           # フロント(3000) + サーバー(4000) 同時起動
```

---

## 環境変数

### サーバー (`server/.env`)

```env
RESEND_API_KEY=re_xxxxxxxxxxxx          # Resend APIキー
RESEND_FROM=WanNyanCall24 <onboarding@resend.dev>
ADMIN_EMAIL=wannyancall24@gmail.com
ZAPIER_WEBHOOK_SECRET=your_secret_here
```

### クライアント (`client/.env.local`)

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

### 獣医師リスト取得スクリプト (`scripts/.env`)

```env
GOOGLE_PLACES_API_KEY=AIzaSy...
```

---

## Google Search Console への登録手順

### 1. プロパティを追加

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. 「プロパティを追加」→「URLプレフィックス」を選択
3. `https://wannyancall24.com` を入力

### 2. 所有権の確認

1. 確認方法「HTMLタグ」を選択
2. 表示されたメタタグをコピー（例: `<meta name="google-site-verification" content="XXXXXXX" />`）
3. `client/index.html` の該当コメントを外してコードを貼り付け

```html
<!-- Before -->
<!-- <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" /> -->

<!-- After -->
<meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXX" />
```

4. デプロイ後「確認」ボタンをクリック

### 3. サイトマップを送信

1. Search Console 左メニュー「サイトマップ」
2. サイトマップURL `https://wannyancall24.com/sitemap.xml` を入力
3. 「送信」をクリック

---

## Google Analytics 4 の設定手順

### 1. GA4プロパティを作成

1. [Google Analytics](https://analytics.google.com) にアクセス
2. 「管理」→「プロパティを作成」
3. プロパティ名: `WanNyanCall24`、タイムゾーン: 日本、通貨: JPY

### 2. データストリームを追加

1. 「データストリーム」→「ウェブ」
2. URL: `https://wannyancall24.com`
3. 「測定ID」（`G-XXXXXXXXXX`）をコピー

### 3. タグをサイトに設置

`client/index.html` の GA4 コメントを外して測定IDを置き換え:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });
</script>
```

---

## Zapier SNS自動投稿の設定手順

### 概要
毎日自動でX（Twitter）とThreadsに獣医師募集投稿を行います。

### Zapierフローの作成

1. [Zapier](https://zapier.com) にアクセスしてアカウント作成
2. 「Create Zap」をクリック

**Trigger（トリガー）:**
- App: `Schedule by Zapier`
- Event: `Every Day`
- Time: 任意（例: 12:00 PM JST）

**Action 1 - 投稿文取得:**
- App: `Webhooks by Zapier`
- Event: `GET`
- URL: `https://wannyancall24.com/api/zapier/social-post?secret=YOUR_ZAPIER_SECRET`
- ※ `YOUR_ZAPIER_SECRET` は `server/.env` の `ZAPIER_WEBHOOK_SECRET` の値

**Action 2 - X（Twitter）投稿:**
- App: `X (formerly Twitter)`
- Event: `Create Tweet`
- Message: `{{1. fullText}}`（Webhookレスポンスの `fullText` フィールド）

**Action 3 - Threads投稿（オプション）:**
- App: `Threads`
- Event: `Create Thread`
- Text: `{{1.text}}`

### 投稿テンプレート
7種類のテンプレートがローテーションで返されます。全テンプレート確認:
```
GET /api/zapier/social-post/all?secret=YOUR_SECRET
```

---

## 営業メール一括送信

### Resend APIキーの設定

1. [resend.com](https://resend.com) で無料アカウント作成
2. 「API Keys」→「Create API Key」
3. キーを `server/.env` の `RESEND_API_KEY` に設定

### 獣医師リストの自動取得

```bash
cd scripts
node fetch-vet-clinics.js --area=東京都 --max=60
```

出力CSVを管理画面 `/admin` → 「📧 営業メール」タブでアップロード

---

## 主要URL

| パス | 説明 |
|------|------|
| `/` | ホーム |
| `/find` | 獣医師検索 |
| `/vet-recruit` | 獣医師募集LP |
| `/vet-faq` | 獣医師向けFAQ |
| `/press` | プレスリリース |
| `/admin` | 管理画面（パスワード: wannyan2024admin） |
| `/auth` | ログイン・会員登録 |

---

## SEO対策済みページ

- `/vet-recruit`: JobPosting・FAQPage・WebPage の JSON-LD構造化データ
- `/vet-faq`: FAQPage の JSON-LD構造化データ
- `sitemap.xml`: 全主要ページ収録
- `robots.txt`: Googlebot許可・サイトマップ参照
