/**
 * InboxPage.jsx — Direct messaging inbox
 *
 * Loads all conversations for the current user.
 * Click a conversation to view messages.
 * Reply inline.
 *
 * Tables used: conversations, messages, profiles
 */

import { useEffect, useRef, useState } from 'react'

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function InboxPage({ supabase, user, onSignup }) {
  const [conversations, setConversations] = useState([])
  const [activeConv,    setActiveConv]    = useState(null)
  const [messages,      setMessages]      = useState([])
  const [newMsg,        setNewMsg]        = useState('')
  const [loading,       setLoading]       = useState(true)
  const [sending,       setSending]       = useState(false)
  const [error,         setError]         = useState('')
  const msgEndRef = useRef(null)

  // ── Load conversations ──────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return }
    let alive = true

    supabase
      .from('conversations')
      .select(`
        id, subject, last_message_at, created_at,
        initiator:profiles!initiator_id (id, full_name, role, verification_status),
        recipient:profiles!recipient_id (id, full_name, role, verification_status)
      `)
      .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50)
      .then(({ data }) => {
        if (alive) { setConversations(data ?? []); setLoading(false) }
      })

    return () => { alive = false }
  }, [supabase, user])

  // ── Load messages for active conversation ──────────────────────────────
  useEffect(() => {
    if (!supabase || !activeConv) return
    let alive = true

    supabase
      .from('messages')
      .select('id, content, sender_id, created_at, is_read')
      .eq('conversation_id', activeConv.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (alive) setMessages(data ?? [])
      })

    // Mark messages as read
    supabase.from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', activeConv.id)
      .neq('sender_id', user.id)
      .then(() => {})

    return () => { alive = false }
  }, [supabase, activeConv, user])

  // Scroll to bottom on new messages
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getOther = (conv) => conv.initiator?.id === user.id ? conv.recipient : conv.initiator

  const sendMessage = async (e) => {
    e.preventDefault()
    const content = newMsg.trim()
    if (!content || !activeConv) return
    setSending(true); setError('')

    const { data, error: err } = await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id:       user.id,
      content,
    }).select('id, content, sender_id, created_at').single()

    setSending(false)
    if (err) { setError(err.message); return }

    setMessages((prev) => [...prev, data])
    setNewMsg('')
    // Update last_message_at
    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConv.id)
  }

  // ── Not signed in ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-chat-dots fs-1 text-muted d-block mb-3" aria-hidden="true" />
        <h2 className="h4 fw-bold mb-2">Your Inbox</h2>
        <p className="text-muted mb-4">Sign in to view and send messages to clubs, agents, and players.</p>
        <button className="btn btn-primary" type="button" onClick={() => onSignup?.('player')}>
          <i className="bi bi-person-plus me-2" />Create account
        </button>
      </div>
    )
  }

  return (
    <div className="container-fluid py-0" style={{ maxWidth: 1100 }}>
      <div className="row g-0" style={{ height: 'calc(100vh - 72px)', minHeight: 500 }}>

        {/* ── Conversation list ─────────────────────────────────────────── */}
        <div className={`col-12 col-md-4 border-end ${activeConv ? 'd-none d-md-flex' : 'd-flex'} flex-column`}>
          <div className="px-3 py-3 border-bottom">
            <h1 className="h5 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
              <i className="bi bi-chat-dots me-2" aria-hidden="true" />Inbox
            </h1>
          </div>

          {loading ? (
            <div className="p-4 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted">
              <i className="bi bi-chat-square-dots fs-3 d-block mb-2" />
              <p className="small mb-0">No messages yet. Start a conversation by visiting a player or agent profile.</p>
            </div>
          ) : (
            <div className="overflow-auto flex-grow-1">
              {conversations.map((conv) => {
                const other = getOther(conv)
                const isActive = activeConv?.id === conv.id
                return (
                  <button
                    key={conv.id}
                    type="button"
                    className={`w-100 text-start border-0 border-bottom px-3 py-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary bg-opacity-10' : 'bg-transparent'}`}
                    style={{ transition: 'background .15s' }}
                    onClick={() => setActiveConv(conv)}
                  >
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 40, height: 40, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: 16 }}
                    >
                      <i className="bi bi-person" />
                    </span>
                    <div className="min-w-0 flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold small text-truncate" style={{ color: 'var(--fc-blue-700)' }}>
                          {other?.full_name || 'SportBridge member'}
                          {other?.verification_status === 'verified' && (
                            <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: 11 }} />
                          )}
                        </span>
                        <span className="text-muted flex-shrink-0 ms-1" style={{ fontSize: 11 }}>{timeAgo(conv.last_message_at)}</span>
                      </div>
                      <div className="small text-muted text-truncate">{conv.subject || 'No subject'}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Message thread ────────────────────────────────────────────── */}
        <div className={`col-12 col-md-8 d-flex flex-column ${!activeConv ? 'd-none d-md-flex' : 'd-flex'}`}>
          {!activeConv ? (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
              <div className="text-center">
                <i className="bi bi-chat-square-text fs-2 d-block mb-2" />
                <p className="small">Select a conversation to read messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-3 py-3 border-bottom d-flex align-items-center gap-2">
                <button className="btn btn-link p-0 d-md-none me-1 text-muted" type="button" onClick={() => setActiveConv(null)}>
                  <i className="bi bi-arrow-left" />
                </button>
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{ width: 36, height: 36, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: 14 }}>
                  <i className="bi bi-person" />
                </span>
                <div>
                  <div className="fw-bold small" style={{ color: 'var(--fc-blue-700)' }}>
                    {getOther(activeConv)?.full_name || 'SportBridge member'}
                  </div>
                  {activeConv.subject && <div className="text-muted" style={{ fontSize: 12 }}>{activeConv.subject}</div>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-grow-1 overflow-auto px-3 py-3 d-flex flex-column gap-2">
                {messages.map((msg) => {
                  const mine = msg.sender_id === user.id
                  return (
                    <div key={msg.id} className={`d-flex ${mine ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div
                        className="px-3 py-2 rounded-3"
                        style={{
                          maxWidth: '75%',
                          background: mine ? 'var(--fc-gradient-primary)' : 'var(--bs-secondary-bg)',
                          color: mine ? '#fff' : 'var(--bs-body-color)',
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        <div style={{ fontSize: 11, opacity: .7, textAlign: 'right', marginTop: 2 }}>
                          {timeAgo(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={msgEndRef} />
              </div>

              {/* Reply box */}
              <div className="px-3 py-3 border-top">
                {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
                <form onSubmit={sendMessage} className="d-flex gap-2">
                  <input
                    className="form-control"
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Write a message…"
                    maxLength={10000}
                    required
                    style={{ fontSize: 14 }}
                  />
                  <button className="btn btn-primary flex-shrink-0" type="submit" disabled={sending || !newMsg.trim()}>
                    {sending ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send-fill" />}
                  </button>
                </form>
                <p className="form-text mt-1">Never share personal details — use verified profiles to arrange meetings.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
