const Stripe = require('stripe')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { amount, paymentMethodId, customerId } = req.body
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      payment_method: paymentMethodId,
      customer: customerId,
      capture_method: 'manual',
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    })
    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
