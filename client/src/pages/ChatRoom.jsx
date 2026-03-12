import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, supabaseReady, queryWithRetry } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import VideoCall from '../components/VideoCall'
import ReportModal from '../components/ReportModal'
import BlockModal from '../components/BlockModal'

export default function ChatRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const timerRef = useRef(null)

  // チャットルーム取得
  useEffect(() => {
    if (!supabaseReady || !user || !roomId) {
      setLoading(false)
      return
    }
    async function fetchRoom() {
      const { data, error } = await queryWithRetry(
        () => supabase
          .from('chat_rooms')
          .select('id,consultation_id,user_id,vet_id,status,payment_intent_id,total_amount,created_at,completed_at,vets(id,name,specialty,photo,auth_id)')
          .eq('id', roomId)
          .single(),
        { retries: 2, timeoutMs: 15000 }
      )
      if (error) {
        setError('チャットルームが見つかりません')
        setLoading(false)
        return
      }
      setRoom(data)
      setLoading(false)
    }
    fetchRoom()
  }, [user, roomId])

  // メッセージ取得 + リアルタイム購読
  useEffect(() => {
    if (!supabaseReady || !roomId) return

    async function fetchMessages() {
      const { data } = await queryWithRetry(
        () => supabase
          .from('messages')
          .select('id,sender_id,sender_role,content,image_url,video_url,created_at')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true }),
        { retries: 2, timeoutMs: 15000 }
      )
      setMessages(data || [])
    }
    fetchMessages()

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  // 経過時間タイマー
  useEffect(() => {
    if (room?.status === 'active') {
      const start = new Date(room.created_at).getTime()
      timerRef.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [room])

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function formatElapsed(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // メッセージ送信
  async function handleSend(e) {
    e?.preventDefault()
    const text = newMsg.trim()
    if (!text || sending) return
    setSending(true)
    setNewMsg('')
    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      sender_role: role === 'vet' ? 'vet' : 'user',
      content: text,
    })
    if (error) {
      setNewMsg(text)
      showToast('送信に失敗しました', true)
    }
    setSending(false)
  }

  // 画像・動画送信
  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      showToast('画像または動画ファイルを選択してください', true)
      return
    }
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      showToast(isVideo ? '50MB以下の動画を選択してください' : '5MB以下の画像を選択してください', true)
      return
    }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `chat/${roomId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('chat-images')
      .upload(path, file)
    if (uploadError) {
      showToast('ファイルのアップロードに失敗しました', true)
      setUploading(false)
      return
    }
    const { data: urlData } = supabase.storage
      .from('chat-images')
      .getPublicUrl(path)
    const msgData = {
      room_id: roomId,
      sender_id: user.id,
      sender_role: role === 'vet' ? 'vet' : 'user',
    }
    if (isVideo) {
      msgData.video_url = urlData.publicUrl
    } else {
      msgData.image_url = urlData.publicUrl
    }
    await supabase.from('messages').insert(msgData)
    setUploading(false)
    fileInputRef.current.value = ''
  }

  // 相談完了（獣医師のみ）
  async function handleComplete() {
    if (completing) return
    setCompleting(true)
    try {
      // Stripe決済確定
      if (room.payment_intent_id && room.total_amount) {
        const res = await fetch('/api/stripe/capture-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: room.payment_intent_id,
            amount: room.total_amount,
          }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
      }
      // チャットルーム完了
      await supabase
        .from('chat_rooms')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', roomId)
      // consultation も完了に
      if (room.consultation_id) {
        await supabase
          .from('consultations')
          .update({ status: 'completed', duration: Math.ceil(elapsedSec / 60) })
          .eq('id', room.consultation_id)
      }
      clearInterval(timerRef.current)
      setRoom(prev => ({ ...prev, status: 'completed' }))
      showToast('相談を完了しました')
    } catch (err) {
      showToast(`完了処理エラー: ${err.message}`, true)
    }
    setCompleting(false)
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 3000)
  }

  const isVetUser = role === 'vet'
  const isCompleted = room?.status === 'completed'

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#9ca3af' }}>読み込み中...</p>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
        <p style={{ fontWeight: 600, color: '#dc2626', marginBottom: 16 }}>{error || 'ルームが見つかりません'}</p>
        <button className="btn-secondary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => navigate(-1)}>戻る</button>
      </div>
    )
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      {/* ヘッダー */}
      <div style={{
        background: isCompleted
          ? 'linear-gradient(135deg, #6b7280, #4b5563)'
          : 'linear-gradient(135deg, #2a9d8f, #21867a)',
        padding: '14px 16px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
          borderRadius: '50%', width: 34, height: 34, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
        }}>←</button>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
        }}>{room.vets?.photo || '👨‍⚕️'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{room.vets?.name || '獣医師'} 獣医師</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{room.vets?.specialty}</div>
        </div>
        {!isCompleted && (
          <button onClick={() => setShowVideo(true)} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            borderRadius: '50%', width: 38, height: 38, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
        )}
        {/* 通報・ブロックメニュー */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >⋮</button>
          {showMenu && (
            <div style={{ position: 'absolute', top: 44, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 160, zIndex: 100, overflow: 'hidden' }}>
              <button onClick={() => { setShowMenu(false); setShowReport(true) }}
                style={{ display: 'block', width: '100%', padding: '13px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.88rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>🚨 通報する</button>
              <button onClick={() => { setShowMenu(false); setShowBlock(true) }}
                style={{ display: 'block', width: '100%', padding: '13px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.88rem', fontWeight: 600, color: '#264653', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}>🚫 ブロックする</button>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {isCompleted ? (
            <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 50 }}>完了</span>
          ) : (
            <>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{formatElapsed(elapsedSec)}</div>
              <div style={{ fontSize: '0.68rem', opacity: 0.7 }}>経過時間</div>
            </>
          )}
        </div>
      </div>

      {/* 仮押さえバナー */}
      {!isCompleted && room.total_amount > 0 && (
        <div style={{
          background: '#fef3c7', padding: '8px 16px', fontSize: '0.78rem',
          color: '#92400e', textAlign: 'center', flexShrink: 0,
        }}>
          💳 ¥{room.total_amount.toLocaleString()} を仮押さえ中
        </div>
      )}

      {/* メッセージエリア */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 16px',
        background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* 開始メッセージ */}
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '0.75rem', color: '#9ca3af' }}>
          相談が開始されました
        </div>

        {messages.map(m => {
          const isMine = m.sender_id === user.id
          return (
            <div key={m.id} style={{
              display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ maxWidth: '75%' }}>
                {!isMine && (
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 2, paddingLeft: 4 }}>
                    {m.sender_role === 'vet' ? `${room.vets?.name || '獣医師'}` : '飼い主'}
                  </div>
                )}
                {m.video_url ? (
                  <video
                    src={m.video_url}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      maxWidth: '100%', borderRadius: 12,
                      border: '1px solid #e5e7eb', background: '#000',
                    }}
                  />
                ) : m.image_url ? (
                  <img
                    src={m.image_url}
                    alt="送信画像"
                    style={{
                      maxWidth: '100%', borderRadius: 12,
                      border: '1px solid #e5e7eb',
                    }}
                    onClick={() => window.open(m.image_url, '_blank')}
                  />
                ) : (
                  <div style={{
                    background: isMine ? '#2a9d8f' : '#fff',
                    color: isMine ? '#fff' : '#264653',
                    padding: '10px 14px', borderRadius: 16,
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius: isMine ? 16 : 4,
                    fontSize: '0.9rem', lineHeight: 1.6,
                    boxShadow: isMine ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                    wordBreak: 'break-word',
                  }}>
                    {m.content}
                  </div>
                )}
                <div style={{
                  fontSize: '0.65rem', color: '#9ca3af', marginTop: 2,
                  textAlign: isMine ? 'right' : 'left', paddingLeft: 4, paddingRight: 4,
                }}>
                  {new Date(m.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 獣医師: 相談完了ボタン */}
      {isVetUser && !isCompleted && (
        <div style={{ padding: '8px 16px', background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              width: '100%', background: completing ? '#9ca3af' : '#ef4444', color: '#fff',
              border: 'none', borderRadius: 50, padding: '12px', fontWeight: 800,
              fontSize: '0.9rem', cursor: completing ? 'default' : 'pointer',
            }}
          >
            {completing ? '処理中...' : '相談を完了する（決済確定）'}
          </button>
        </div>
      )}

      {/* 完了メッセージ */}
      {isCompleted && (
        <div style={{
          padding: '16px', background: '#e8f6f5', textAlign: 'center',
          flexShrink: 0, borderTop: '1px solid #c8ece9',
        }}>
          <p style={{ fontWeight: 700, color: '#2a9d8f', fontSize: '0.9rem' }}>
            ✅ この相談は完了しました
          </p>
          {room.total_amount > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>
              お支払い: ¥{room.total_amount.toLocaleString()}（確定済み）
            </p>
          )}
        </div>
      )}

      {/* 入力エリア */}
      {!isCompleted && (
        <form onSubmit={handleSend} style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          background: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0,
          alignItems: 'flex-end',
        }}>
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              background: '#e8f6f5', border: 'none', borderRadius: 10,
              width: 42, height: 42, cursor: 'pointer', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, opacity: uploading ? 0.5 : 1,
            }}
          >
            {uploading ? '...' : '📎'}
          </button>
          <input
            className="form-input"
            type="text"
            placeholder="メッセージを入力..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            type="submit"
            disabled={!newMsg.trim() || sending}
            style={{
              background: newMsg.trim() ? '#2a9d8f' : '#d1d5db',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '0 18px', height: 42, fontWeight: 700,
              cursor: newMsg.trim() ? 'pointer' : 'default',
              fontSize: '0.88rem', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            送信
          </button>
        </form>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: toast.isError ? '#ef4444' : '#2a9d8f', color: '#fff',
          padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: '0.88rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 9999,
          animation: 'toastIn 0.3s ease-out',
        }}>
          {toast.isError ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}

      {/* ビデオ通話 */}
      {showVideo && !isCompleted && (
        <VideoCall
          roomId={roomId}
          userId={user.id}
          onClose={() => setShowVideo(false)}
        />
      )}

      {/* 通報モーダル */}
      {showReport && (
        <ReportModal
          targetId={isVetUser ? room.user_id : (room.vets?.auth_id || room.vet_id)}
          targetName={isVetUser ? '飼い主' : (room.vets?.name || '獣医師')}
          targetType={isVetUser ? 'user' : 'vet'}
          consultationId={room.consultation_id}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* ブロックモーダル */}
      {showBlock && (
        <BlockModal
          targetId={isVetUser ? room.user_id : (room.vets?.auth_id || room.vet_id)}
          targetName={isVetUser ? '飼い主' : (room.vets?.name || '獣医師')}
          targetType={isVetUser ? 'user' : 'vet'}
          onClose={() => setShowBlock(false)}
        />
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
