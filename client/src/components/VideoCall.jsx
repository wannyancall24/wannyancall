import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export default function VideoCall({ roomId, userId, onClose }) {
  const [callState, setCallState] = useState('idle') // idle | calling | connected | ended
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [error, setError] = useState(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const channelRef = useRef(null)

  // クリーンアップ
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    pcRef.current?.close()
    pcRef.current = null
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  // シグナリングチャンネル設定
  function setupSignaling(pc) {
    const channel = supabase.channel(`videocall-${roomId}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      if (payload.from === userId) return
      try {
        if (payload.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          channel.send({
            type: 'broadcast',
            event: 'signal',
            payload: { from: userId, type: 'answer', sdp: pc.localDescription },
          })
        } else if (payload.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp))
        } else if (payload.type === 'ice-candidate' && payload.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
        } else if (payload.type === 'hangup') {
          setCallState('ended')
          cleanup()
        }
      } catch (err) {
        console.error('Signaling error:', err)
      }
    })

    channel.subscribe()
    channelRef.current = channel
    return channel
  }

  // PeerConnection作成
  function createPeerConnection(stream) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    stream.getTracks().forEach(track => pc.addTrack(track, stream))

    pc.onicecandidate = (e) => {
      if (e.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'signal',
          payload: { from: userId, type: 'ice-candidate', candidate: e.candidate },
        })
      }
    }

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0]
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected')
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallState('ended')
        cleanup()
      }
    }

    pcRef.current = pc
    return pc
  }

  // 通話開始（発信側）
  async function startCall() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      const pc = createPeerConnection(stream)
      const channel = setupSignaling(pc)

      setCallState('calling')

      // 少し待ってからオファー送信（相手がsubscribeする時間を確保）
      setTimeout(async () => {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        channel.send({
          type: 'broadcast',
          event: 'signal',
          payload: { from: userId, type: 'offer', sdp: pc.localDescription },
        })
      }, 1000)
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('カメラ・マイクへのアクセスを許可してください')
      } else {
        setError(`通話開始エラー: ${err.message}`)
      }
    }
  }

  // 着信応答（受信側 — シグナリングチャンネルで自動処理）
  async function answerCall() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream

      const pc = createPeerConnection(stream)
      setupSignaling(pc)
      setCallState('calling')
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('カメラ・マイクへのアクセスを許可してください')
      } else {
        setError(`応答エラー: ${err.message}`)
      }
    }
  }

  // 通話終了
  function hangUp() {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'signal',
        payload: { from: userId, type: 'hangup' },
      })
    }
    setCallState('ended')
    cleanup()
  }

  // ミュート
  function toggleMute() {
    const audioTracks = localStreamRef.current?.getAudioTracks()
    if (audioTracks?.length) {
      audioTracks[0].enabled = !audioTracks[0].enabled
      setIsMuted(!audioTracks[0].enabled)
    }
  }

  // カメラオン/オフ
  function toggleCamera() {
    const videoTracks = localStreamRef.current?.getVideoTracks()
    if (videoTracks?.length) {
      videoTracks[0].enabled = !videoTracks[0].enabled
      setIsCameraOff(!videoTracks[0].enabled)
    }
  }

  // idle 状態: 開始ボタンのみ
  if (callState === 'idle') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: 24,
      }} onClick={e => { if (e.target === e.currentTarget) onClose?.() }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '28px 24px',
          width: '100%', maxWidth: 360,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📹</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#264653', marginBottom: 4 }}>ビデオ通話</h3>
            <p style={{ fontSize: '0.82rem', color: '#6b7280' }}>カメラとマイクへのアクセスを許可してください</p>
          </div>
          {error && (
            <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: '#dc2626', fontWeight: 600 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={startCall}
              style={{
                width: '100%', background: '#2a9d8f', color: '#fff', border: 'none',
                borderRadius: 50, padding: '14px', fontWeight: 700, fontSize: '0.92rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              ビデオ通話を開始
            </button>
            <button
              onClick={answerCall}
              style={{
                width: '100%', background: '#e8f6f5', color: '#2a9d8f', border: '2px solid #2a9d8f',
                borderRadius: 50, padding: '14px', fontWeight: 700, fontSize: '0.92rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" />
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 1.05 3.18 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L7.09 8.31" />
              </svg>
              着信応答
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: 'none', border: 'none', padding: '10px',
                color: '#9ca3af', fontSize: '0.88rem', cursor: 'pointer',
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 通話終了後
  if (callState === 'ended') {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: 24,
      }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '28px 24px',
          width: '100%', maxWidth: 340, textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📞</div>
          <p style={{ fontWeight: 700, color: '#6b7280', fontSize: '0.95rem', marginBottom: 16 }}>
            通話が終了しました
          </p>
          <button
            onClick={() => { setCallState('idle'); onClose?.() }}
            style={{
              width: '100%', background: '#2a9d8f', color: '#fff', border: 'none',
              borderRadius: 50, padding: '14px', fontWeight: 700,
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    )
  }

  // calling / connected: ビデオ表示
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: '#000', zIndex: 10000,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* リモート映像（全画面） */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {callState === 'calling' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            color: '#fff', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 12, animation: 'pulse 1.5s infinite' }}>📞</div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>接続中...</p>
            <p style={{ fontSize: '0.82rem', opacity: 0.7, marginTop: 4 }}>相手の応答を待っています</p>
          </div>
        )}

        {/* ステータスバー */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
          padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>
            {callState === 'connected' ? '🟢 通話中' : '📡 接続中...'}
          </span>
        </div>

        {/* ローカル映像（小窓） */}
        <div style={{
          position: 'absolute', top: 60, right: 12,
          width: 120, height: 160, borderRadius: 14,
          overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />
          {isCameraOff && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: '#264653', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.78rem', fontWeight: 700,
            }}>
              カメラOFF
            </div>
          )}
        </div>
      </div>

      {/* コントロールバー */}
      <div style={{
        background: 'rgba(0,0,0,0.85)', padding: '20px 0 36px',
        display: 'flex', justifyContent: 'center', gap: 20,
      }}>
        {/* ミュート */}
        <button onClick={toggleMute} style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 2,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMuted ? (
              <>
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .67-.1 1.32-.27 1.93" />
                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
              </>
            ) : (
              <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
              </>
            )}
          </svg>
          <span style={{ fontSize: '0.55rem', fontWeight: 600 }}>{isMuted ? 'ミュート中' : 'ミュート'}</span>
        </button>

        {/* カメラ */}
        <button onClick={toggleCamera} style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: isCameraOff ? '#ef4444' : 'rgba(255,255,255,0.15)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 2,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCameraOff ? (
              <>
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
              </>
            ) : (
              <>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </>
            )}
          </svg>
          <span style={{ fontSize: '0.55rem', fontWeight: 600 }}>{isCameraOff ? 'カメラOFF' : 'カメラ'}</span>
        </button>

        {/* 通話終了 */}
        <button onClick={hangUp} style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: '#ef4444', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 2,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 5.18 2 2 0 0 1 4.11 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 10.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
          <span style={{ fontSize: '0.55rem', fontWeight: 600 }}>終了</span>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
