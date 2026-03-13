const Stripe = require('stripe')

function calcExpectedTotal({ animalType, duration, hour, nominated, hasPlan }) {
  const extPer5 = animalType === 'exotic' ? 1500 : 1000
  const base    = animalType === 'exotic' ? 4500 : 3000
  const ext     = Math.max(0, Math.floor((duration - 15) / 5)) * extPer5
  const systemFee    = hasPlan ? 0 : 800
  const nominationFee = nominated ? 500 : 0
  const timeFee = (hour >= 22 || hour < 8) ? 1500 : hour >= 20 ? 1000 : 0
  return base + ext + systemFee + nominationFee + timeFee
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { amount, animalType, duration, hour, nominated, hasPlan } = req.body

  // サーバー側で金額検証
  if (animalType != null && duration != null && hour != null) {
    const expected = calcExpectedTotal({ animalType, duration, hour, nominated: !!nominated, hasPlan: !!hasPlan })
    if (Math.abs(amount - expected) > 100) {
      return res.status(400).json({ error: `金額が一致しません（期待値: ¥${expected}, 受信値: ¥${amount}）` })
    }
  }

  try {
    // capture_method: manual で仮押さえ用 PaymentIntent を作成
    // confirm はブラウザ側（Stripe Elements）で行う
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      capture_method: 'manual',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    })
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
