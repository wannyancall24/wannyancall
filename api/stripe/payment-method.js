const Stripe = require('stripe')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const { paymentMethodId } = req.body
  try {
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
    res.json({
      last4: pm.card.last4,
      brand: pm.card.brand,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
