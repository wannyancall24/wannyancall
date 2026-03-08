const Stripe = require('stripe')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { paymentIntentId, amount } = req.body
  try {
    const captured = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amount,
    })
    res.json({ status: captured.status })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
