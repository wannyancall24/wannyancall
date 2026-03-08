const Stripe = require('stripe')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  try {
    const customer = await stripe.customers.create()
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    })
    res.json({ clientSecret: setupIntent.client_secret, customerId: customer.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
