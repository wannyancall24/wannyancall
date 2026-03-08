import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { saveCard } from '../lib/stripeCard'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#264653',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#e05555' },
  },
}

function CardForm({ clientSecret, customerId, onSuccess, onClose }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError('')

    const { error: setupError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    })

    if (setupError) {
      setError(setupError.message)
      setLoading(false)
      return
    }

    // カード詳細（last4・brand）を取得
    try {
      const res = await fetch('/api/stripe/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: setupIntent.payment_method }),
      })
      const pm = await res.json()
      saveCard({
        customerId,
        paymentMethodId: setupIntent.payment_method,
        last4: pm.last4 || '----',
        brand: pm.brand || 'card',
        expMonth: pm.expMonth,
        expYear: pm.expYear,
      })
    } catch {
      // payment-method取得失敗でも登録自体は成功
      saveCard({ customerId, paymentMethodId: setupIntent.payment_method, last4: '----', brand: 'card' })
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ border: '1.5px solid #d1d5db', borderRadius: 10, padding: '14px 12px', background: '#fff', marginBottom: 6 }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && (
        <div style={{ background: '#fee2e2', borderRadius: 8, padding: '8px 12px', fontSize: '0.82rem', color: '#dc2626', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="btn-primary"
        style={{ marginTop: 16, opacity: loading || !stripe ? 0.6 : 1 }}
      >
        {loading ? '登録中...' : 'カードを登録する'}
      </button>
      <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', width: '100%', marginTop: 8, padding: 10, color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer' }}>
        キャンセル
      </button>
    </form>
  )
}

export default function CardRegistration({ onSuccess, onClose }) {
  const [clientSecret, setClientSecret] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/stripe/setup-intent', { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setClientSecret(data.clientSecret)
        setCustomerId(data.customerId)
      })
      .catch(err => setFetchError(err.message))
  }, [])

  function handleSuccess() {
    setDone(true)
    setTimeout(() => onSuccess(), 1200)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: '24px 20px 48px' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#264653' }}>カードを登録しました</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#264653' }}>💳 カードを登録する</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>✕</button>
            </div>

            <div style={{ background: '#e8f6f5', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '0.82rem', color: '#2a9d8f', lineHeight: 1.6 }}>
              🔒 カード情報はStripeで安全に管理されます。当サービスには保存されません。
            </div>

            {fetchError ? (
              <div style={{ background: '#fee2e2', borderRadius: 10, padding: '12px 14px', fontSize: '0.85rem', color: '#dc2626' }}>
                エラーが発生しました：{fetchError}
              </div>
            ) : !clientSecret ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '0.88rem' }}>読み込み中...</div>
            ) : (
              <Elements stripe={stripePromise}>
                <CardForm clientSecret={clientSecret} customerId={customerId} onSuccess={handleSuccess} onClose={onClose} />
              </Elements>
            )}
          </>
        )}
      </div>
    </div>
  )
}
