import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function BlockModal({ targetId, targetName, targetType, onClose }) {
  const { user } = useAuth()
  const [done, setDone] = useState(false)
  const [blocking, setBlocking] = useState(false)

  async function handleBlock() {
    setBlocking(true)
    await supabase.from('blocked_users').upsert({ blocker_id: user.id, blocked_id: targetId }, { onConflict: 'blocker_id,blocked_id' })
    setBlocking(false)
    setDone(true)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 360, padding: '28px 24px' }}>
        {!done ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🚫</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#264653', marginBottom: 8 }}>{targetName} をブロックしますか？</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6 }}>ブロックすると以後この{targetType === 'vet' ? '獣医師' : 'ユーザー'}とマッチングされなくなります。</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer', color: '#6b7280' }}>キャンセル</button>
              <button onClick={handleBlock} disabled={blocking} style={{ background: '#264653', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', opacity: blocking ? 0.7 : 1 }}>
                {blocking ? '処理中...' : 'ブロックする'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#264653', marginBottom: 8 }}>ブロックしました</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 20 }}>{targetName} とは今後マッチングされません。</div>
            <button className="btn-primary" onClick={onClose} style={{ background: '#2a9d8f' }}>閉じる</button>
          </div>
        )}
      </div>
    </div>
  )
}
