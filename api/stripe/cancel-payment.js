const Stripe = require('stripe')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { paymentIntentId } = req.body
  try {
    const cancelled = await stripe.paymentIntents.cancel(paymentIntentId)
    res.json({ status: cancelled.status })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
