/**
 * fetch-vet-clinics.js
 *
 * Google Places API を使って動物病院リストを取得し、
 * 各病院のウェブサイトからメールアドレスを抽出して CSV を生成するスクリプト。
 *
 * 使い方:
 *   node fetch-vet-clinics.js --key=YOUR_API_KEY --area=東京都 [options]
 *
 * オプション:
 *   --key=<APIキー>       Google Places API キー（必須）
 *   --area=<エリア>       検索エリア（例: 東京都, 大阪市, 神奈川県）デフォルト: 東京都
 *   --query=<検索ワード>  追加キーワード（デフォルト: 動物病院）
 *   --max=<件数>          最大取得件数（デフォルト: 60、最大180）
 *   --out=<ファイル名>    出力CSVファイル名（デフォルト: vet-clinics-<エリア>-<日付>.csv）
 *   --no-email            メールアドレス抽出をスキップ（高速化）
 *   --delay=<ms>          リクエスト間隔ms（デフォルト: 300）
 *
 * 出力CSV形式（Admin営業メール機能と互換）:
 *   email,name,clinicName,phone,address,website
 */

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── 引数パース ──────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, ...v] = a.replace(/^--/, '').split('=')
    return [k, v.join('=') || true]
  })
)

const API_KEY   = args.key
const AREA      = args.area    || '東京都'
const QUERY     = args.query   || '動物病院'
const MAX       = Math.min(parseInt(args.max || '60', 10), 180)
const SKIP_EMAIL = args['no-email'] === true
const DELAY_MS  = parseInt(args.delay || '300', 10)
const DATE_STR  = new Date().toISOString().slice(0, 10)
const OUT_FILE  = args.out || path.join(__dirname, `vet-clinics-${AREA}-${DATE_STR}.csv`)

if (!API_KEY) {
  console.error('エラー: --key=YOUR_API_KEY が必要です')
  console.error('')
  console.error('使い方例:')
  console.error('  node fetch-vet-clinics.js --key=AIzaSy... --area=東京都 --max=60')
  console.error('  node fetch-vet-clinics.js --key=AIzaSy... --area=大阪市 --no-email')
  process.exit(1)
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Places API: Text Search ──────────────────────────────────
async function textSearch(query, pageToken = null) {
  const params = new URLSearchParams({
    query,
    language: 'ja',
    region: 'jp',
    key: API_KEY,
  })
  if (pageToken) params.set('pagetoken', pageToken)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API エラー: ${data.status} — ${data.error_message || ''}`)
  }
  return data
}

// ── Places API: Place Details ────────────────────────────────
async function placeDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,formatted_address,formatted_phone_number,website,business_status',
    language: 'ja',
    key: API_KEY,
  })
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK') return null
  return data.result
}

// ── ウェブサイトからメールアドレスを抽出 ─────────────────────
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const IGNORE_EMAIL_DOMAINS = ['example.com', 'sentry.io', 'google.com', 'w3.org', 'schema.org', 'jquery.com']

async function extractEmailFromWebsite(url) {
  if (!url) return ''
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WanNyanCall24-Bot/1.0)',
        'Accept-Language': 'ja,en;q=0.9',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return ''
    const html = await res.text()
    const $ = cheerio.load(html)

    // 1. mailto: リンクを優先
    const mailtoEmails = []
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const email = href.replace('mailto:', '').split('?')[0].trim()
      if (email && isValidEmail(email)) mailtoEmails.push(email)
    })
    if (mailtoEmails.length > 0) return mailtoEmails[0]

    // 2. テキスト内からメールアドレスを正規表現で検索
    const bodyText = $('body').text()
    const found = bodyText.match(EMAIL_REGEX) || []
    const valid = found.filter(isValidEmail)
    if (valid.length > 0) return valid[0]

    // 3. /contact や /inquiry ページも試みる
    const contactPaths = ['/contact', '/inquiry', '/お問い合わせ', '/toiawase', '/contact.html', '/inquiry.html']
    for (const p of contactPaths) {
      try {
        const contactUrl = new URL(p, url).href
        const cr = await fetch(contactUrl, {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WanNyanCall24-Bot/1.0)' },
        })
        if (!cr.ok) continue
        const cHtml = await cr.text()
        const $c = cheerio.load(cHtml)
        const mailtos = []
        $c('a[href^="mailto:"]').each((_, el) => {
          const href = $c(el).attr('href') || ''
          const email = href.replace('mailto:', '').split('?')[0].trim()
          if (email && isValidEmail(email)) mailtos.push(email)
        })
        if (mailtos.length > 0) return mailtos[0]
        const cText = $c('body').text()
        const cFound = (cText.match(EMAIL_REGEX) || []).filter(isValidEmail)
        if (cFound.length > 0) return cFound[0]
      } catch { /* ignore */ }
    }

    return ''
  } catch {
    return ''
  }
}

function isValidEmail(email) {
  if (!email || !email.includes('@')) return false
  const domain = email.split('@')[1]?.toLowerCase() || ''
  if (IGNORE_EMAIL_DOMAINS.some(d => domain.includes(d))) return false
  if (domain.endsWith('.png') || domain.endsWith('.jpg') || domain.endsWith('.gif')) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── CSV エスケープ ────────────────────────────────────────────
function csvEscape(val) {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

// ── メイン処理 ────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(55))
  console.log(' WanNyanCall24 動物病院リスト自動取得スクリプト')
  console.log('='.repeat(55))
  console.log(`検索クエリ : ${QUERY} ${AREA}`)
  console.log(`最大件数   : ${MAX}件`)
  console.log(`メール抽出 : ${SKIP_EMAIL ? 'スキップ' : 'あり（各サイトを確認）'}`)
  console.log(`出力ファイル: ${OUT_FILE}`)
  console.log('')

  // ── STEP 1: Places TextSearch で病院リスト取得 ──
  console.log('STEP 1: Google Places API で病院リストを取得中...')
  const searchQuery = `${QUERY} ${AREA}`
  const placeIds = []
  let pageToken = null
  let page = 1

  do {
    process.stdout.write(`  ページ ${page} 取得中...`)
    if (pageToken) await sleep(2000) // next_page_token は2秒待機が必要
    const data = await textSearch(searchQuery, pageToken)
    const results = data.results || []
    for (const r of results) {
      if (!placeIds.includes(r.place_id)) placeIds.push(r.place_id)
      if (placeIds.length >= MAX) break
    }
    console.log(` ${results.length}件取得 (累計: ${placeIds.length}件)`)
    pageToken = data.next_page_token || null
    page++
  } while (pageToken && placeIds.length < MAX)

  console.log(`\n合計 ${placeIds.length}件の病院IDを取得しました\n`)

  // ── STEP 2: 各病院の詳細情報を取得 ──
  console.log('STEP 2: 各病院の詳細情報を取得中...')
  const clinics = []

  for (let i = 0; i < placeIds.length; i++) {
    const placeId = placeIds[i]
    process.stdout.write(`  [${i + 1}/${placeIds.length}] 詳細取得中...`)
    await sleep(DELAY_MS)
    const detail = await placeDetails(placeId)
    if (!detail) { console.log(' スキップ'); continue }

    clinics.push({
      clinicName: detail.name || '',
      address: detail.formatted_address || '',
      phone: detail.formatted_phone_number || '',
      website: detail.website || '',
      email: '',
    })
    console.log(` ${detail.name}`)
  }

  console.log(`\n${clinics.length}件の詳細情報を取得しました\n`)

  // ── STEP 3: ウェブサイトからメールアドレスを抽出 ──
  if (!SKIP_EMAIL) {
    console.log('STEP 3: 各ウェブサイトからメールアドレスを抽出中...')
    console.log('（時間がかかる場合があります。--no-email でスキップ可）\n')
    let emailFound = 0

    for (let i = 0; i < clinics.length; i++) {
      const clinic = clinics[i]
      if (!clinic.website) {
        process.stdout.write(`  [${i + 1}/${clinics.length}] ${clinic.clinicName} — ウェブサイトなし\n`)
        continue
      }
      process.stdout.write(`  [${i + 1}/${clinics.length}] ${clinic.clinicName} 確認中...`)
      await sleep(DELAY_MS)
      const email = await extractEmailFromWebsite(clinic.website)
      clinic.email = email
      if (email) {
        emailFound++
        console.log(` ✅ ${email}`)
      } else {
        console.log(' — メールなし')
      }
    }

    console.log(`\nメールアドレス取得: ${emailFound}/${clinics.length}件\n`)
  }

  // ── STEP 4: CSV 出力 ──
  console.log('STEP 4: CSV ファイルを出力中...')
  const header = 'email,name,clinicName,phone,address,website'
  const rows = clinics.map(c => [
    csvEscape(c.email),
    csvEscape(''), // name（担当者名は空 → テンプレートで「ご担当者」になる）
    csvEscape(c.clinicName),
    csvEscape(c.phone),
    csvEscape(c.address),
    csvEscape(c.website),
  ].join(','))

  const csv = [header, ...rows].join('\n') + '\n'
  fs.writeFileSync(OUT_FILE, '\uFEFF' + csv, 'utf8') // BOM付きUTF-8（Excelで開ける）

  console.log(`\n✅ 完了！ ${clinics.length}件 → ${path.basename(OUT_FILE)}`)
  console.log('')

  // ── サマリー ──
  const withEmail = clinics.filter(c => c.email).length
  const withWebsite = clinics.filter(c => c.website).length
  console.log('─'.repeat(40))
  console.log(`総件数          : ${clinics.length}件`)
  console.log(`ウェブサイトあり: ${withWebsite}件`)
  console.log(`メールアドレスあり: ${withEmail}件`)
  console.log(`出力ファイル    : ${OUT_FILE}`)
  console.log('─'.repeat(40))
  console.log('')
  console.log('次のステップ:')
  console.log('  管理画面 /admin → 「📧 営業メール」タブ → CSVファイルを選択')
  console.log('')
}

main().catch(err => {
  console.error('\n❌ エラーが発生しました:', err.message)
  process.exit(1)
})
