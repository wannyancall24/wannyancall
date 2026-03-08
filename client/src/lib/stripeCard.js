const KEY = 'stripeCard'

export function getStoredCard() {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}

export function saveCard(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function clearCard() {
  localStorage.removeItem(KEY)
}

export function getBrandLabel(brand) {
  const map = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', jcb: 'JCB', discover: 'Discover' }
  return map[brand] || brand
}
