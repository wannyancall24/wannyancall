import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/hello', (req, res) => {
  res.json({ message: 'WanNyanCall24 へようこそ！' })
})

// 報酬分配計算エンドポイント
// 相談完了時に呼ばれ、報酬額を計算してconsultationsテーブルを更新する
app.post('/api/rewards/calculate', async (req, res) => {
  const { consultationId, baseAmount, nominationFee, timeFee } = req.body
  if (!consultationId) return res.status(400).json({ error: 'consultationId is required' })

  const base = baseAmount || 0
  const nomination = nominationFee || 0
  const time = timeFee || 0

  // 報酬計算: 相談料（基本+延長+夜間/深夜加算）の50% + 指名料100%
  const consultationReward = Math.round((base + time) * 0.5)
  const vetReward = consultationReward + nomination

  // プラットフォーム取り分: 残り50% + システム利用料800円（ある場合）
  const platformShare = (base + time) - consultationReward

  res.json({
    consultationId,
    vetReward,
    platformShare,
    breakdown: {
      consultationBase: base,
      timeFee: time,
      nominationFee: nomination,
      consultationReward,
      nominationReward: nomination,
      totalVetReward: vetReward,
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
