// 料金計算ユーティリティ
export const PRICING = {
  dogcat: { base: 3000, extPer5: 1000 },
  exotic:  { base: 4500, extPer5: 1500 },
  nightFee:    1000,  // 20〜22時
  midnightFee: 1500,  // 22〜8時
  nominationFee: 500,
  systemFee: 800,
}

/**
 * 合計金額を計算する
 * @param {Object} params
 * @param {'dogcat'|'exotic'} params.animalType
 * @param {number} params.duration - 分（15以上）
 * @param {number} params.hour - 時間（0〜23）
 * @param {boolean} params.nominated
 * @param {boolean} params.hasPlan - 買い切りプランあり
 */
export function calcTotal({ animalType, duration, hour, nominated, hasPlan }) {
  const p = PRICING[animalType] ?? PRICING.dogcat
  const base = p.base
  const ext = Math.max(0, Math.floor((duration - 15) / 5)) * p.extPer5
  const systemFee = hasPlan ? 0 : PRICING.systemFee
  const nominationFee = nominated ? PRICING.nominationFee : 0
  const timeFee = (hour >= 22 || hour < 8) ? PRICING.midnightFee
               : (hour >= 20)              ? PRICING.nightFee
               : 0
  const timeLabel = (hour >= 22 || hour < 8) ? '深夜加算'
                  : (hour >= 20)              ? '夜間加算'
                  : null
  const total = base + ext + systemFee + nominationFee + timeFee
  return { base, ext, systemFee, nominationFee, timeFee, timeLabel, total }
}
