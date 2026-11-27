/**
 * InboxPage.jsx — Direct messaging inbox
 *
 * Fixes:
 * - Removed ambiguous profiles!initiator_id FK joins (fails on new Supabase)
 * - Fetches profile data separately and merges in JS
 * - Added New Conversation button
 * - Real-time message refresh every 10 seconds
 * - Full 5-language support
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { sendNotification } from './lib/notify'

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const ROLE_ICONS = {
  player:         'bi-person-arms-up',
  coach:          'bi-clipboard2-pulse',
  agent:          'bi-binoculars',
  academy:        'bi-building',
  sports_analyst: 'bi-graph-up-arrow',
  super_admin:    'bi-shield-check',
}

const ROLE_COLOURS = {
  player:         '#2F7DF0',
  coach:          '#F5B301',
  agent:          '#198754',
  academy:        '#6f42c1',
  sports_analyst: '#fd7e14',
  super_admin:    '#dc3545',
}

export default function InboxPage({ supabase, user, onSignup, startConvWith, onConvStarted }) {
  const [conversations,  setConversations]  = useState([])
  const [profileMap,     setProfileMap]     = useState({}) // id -> { full_name, role, verification_status, avatar_path }
  const [activeConv,     setActiveConv]     = useState(null)
  const [messages,       setMessages]       = useState([])
  const [newMsg,         setNewMsg]         = useState('')
  const [loading,        setLoading]        = useState(true)
  const [sending,        setSending]        = useState(false)
  const [starting,       setStarting]       = useState(false)
  const [error,          setError]          = useState('')
  const [showNewConv,    setShowNewConv]    = useState(false)
  const [newRecipEmail,  setNewRecipEmail]  = useState('')
  const [newRecipResult, setNewRecipResult] = useState(null)
  const [searchingRecip, setSearchingRecip] = useState(false)
  const msgEndRef = useRef(null)

  // ── Load conversations (flat — no FK joins) ────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!supabase || !user) { setLoading(false); return }

    const { data: convs } = await supabase
      .from('conversations')
      .select('id, subject, last_message_at, created_at, initiator_id, recipient_id')
      .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50)

    if (!convs?.length) { setConversations([]); setLoading(false); return }

    // Collect all profile IDs we need
    const ids = [...new Set([
      ...convs.map(c => c.initiator_id),
      ...convs.map(c => c.recipient_id),
    ].filter(Boolean))]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role, verification_status, avatar_path')
      .in('id', ids)

    const pMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
    setProfileMap(pMap)
    setConversations(convs)
    setLoading(false)
  }, [supabase, user])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Auto-start conversation when navigated from a profile ──────────────
  useEffect(() => {
    if (!startConvWith || !user || !supabase || loading) return
    let alive = true

    const openOrCreate = async () => {
      setStarting(true)

      // Check for existing conversation (flat query — no FK join)
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id, subject, last_message_at, created_at, initiator_id, recipient_id')
        .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${startConvWith.id}),and(initiator_id.eq.${startConvWith.id},recipient_id.eq.${user.id})`)
        .limit(1)

      if (!alive) return
      const existing = existingConvs?.[0] ?? null

      if (existing) {
        setActiveConv(existing)
        setStarting(false)
        onConvStarted?.()
        return
      }

      // Create new conversation
      const { data: newConv, error: ce } = await supabase
        .from('conversations')
        .insert({
          initiator_id:    user.id,
          recipient_id:    startConvWith.id,
          subject:         startConvWith.name ? `Message to ${startConvWith.name}` : 'New conversation',
          last_message_at: new Date().toISOString(),
        })
        .select('id, subject, last_message_at, created_at, initiator_id, recipient_id')
        .single()

      if (!alive) return
      if (ce) { setError(`Could not start conversation: ${ce.message}`); setStarting(false); return }

      // Fetch the recipient's profile for display
      const { data: recipProf } = await supabase
        .from('profiles')
        .select('id, full_name, role, verification_status, avatar_path')
        .eq('id', startConvWith.id)
        .maybeSingle()

      if (recipProf) {
        setProfileMap(prev => ({ ...prev, [recipProf.id]: recipProf }))
      }

      setConversations(prev => [newConv, ...prev])
      setActiveConv(newConv)
      setStarting(false)
      onConvStarted?.()
    }

    openOrCreate()
    return () => { alive = false }
  }, [startConvWith, user, supabase, loading, onConvStarted])

  // ── Load messages ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase || !activeConv) return
    let alive = true

    const loadMessages = () => {
      supabase
        .from('messages')
        .select('id, content, sender_id, created_at, is_read')
        .eq('conversation_id', activeConv.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => { if (alive) setMessages(data ?? []) })

      supabase.from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', activeConv.id)
        .neq('sender_id', user.id)
        .then(() => {})
    }

    loadMessages()
    // Poll for new messages every 10 seconds
    const poll = setInterval(loadMessages, 10000)
    return () => { alive = false; clearInterval(poll) }
  }, [supabase, activeConv, user])

  // Auto-scroll to bottom
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getOther = (conv) => {
    if (!conv) return null
    const otherId = conv.initiator_id === user.id ? conv.recipient_id : conv.initiator_id
    return profileMap[otherId] ?? { id: otherId, full_name: 'SportBridge member', role: 'player' }
  }

  // ── Send message ───────────────────────────────────────────────────────
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

    setMessages(prev => [...prev, data])
    setNewMsg('')

    await supabase.from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', activeConv.id)

    // Email notification to other party (non-blocking)
    const other = getOther(activeConv)
    if (other?.id && other.id !== user.id) {
      const { data: recipProfile } = await supabase.from('profiles')
        .select('email, full_name').eq('id', other.id).maybeSingle()
      const myProfile = profileMap[user.id]
      if (recipProfile?.email) {
        sendNotification('new_message', {
          to:   recipProfile.email,
          name: recipProfile.full_name,
          data: { senderName: myProfile?.full_name || 'SportBridge member', preview: content },
        })
      }
    }
  }

  // ── Search recipient by email (new conversation) ───────────────────────
  const searchRecipient = async () => {
    if (!newRecipEmail.trim() || !supabase) return
    setSearchingRecip(true); setNewRecipResult(null)
    const { data } = await supabase.from('profiles')
      .select('id, full_name, role, verification_status')
      .ilike('email', newRecipEmail.trim())
      .maybeSingle()
    setSearchingRecip(false)
    setNewRecipResult(data ?? 'not_found')
  }

  const startNewConversation = async () => {
    if (!newRecipResult || newRecipResult === 'not_found') return
    setShowNewConv(false)
    setNewRecipEmail('')

    // Check for existing conv
    const { data: existingConvs } = await supabase.from('conversations')
      .select('id, subject, last_message_at, created_at, initiator_id, recipient_id')
      .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${newRecipResult.id}),and(initiator_id.eq.${newRecipResult.id},recipient_id.eq.${user.id})`)
      .limit(1)

    const existing = existingConvs?.[0]
    if (existing) { setActiveConv(existing); return }

    const { data: newConv } = await supabase.from('conversations').insert({
      initiator_id:    user.id,
      recipient_id:    newRecipResult.id,
      subject:         `Message to ${newRecipResult.full_name}`,
      last_message_at: new Date().toISOString(),
    }).select('id, subject, last_message_at, created_at, initiator_id, recipient_id').single()

    if (newConv) {
      setProfileMap(prev => ({ ...prev, [newRecipResult.id]: newRecipResult }))
      setConversations(prev => [newConv, ...prev])
      setActiveConv(newConv)
    }
  }

  // ── Not signed in ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-chat-dots fs-1 text-muted d-block mb-3" />
        <h2 className="h4 fw-bold mb-2">Your Inbox</h2>
        <p className="text-muted mb-4">Sign in to view and send messages to clubs, agents, and players.</p>
        <button className="btn btn-primary" type="button" onClick={() => onSignup?.('player')}>
          <i className="bi bi-person-plus me-2" />Create account
        </button>
      </div>
    )
  }

  // ── Main layout ────────────────────────────────────────────────────────
  return (
    <div className="container-fluid py-0" style={{ maxWidth: 1100 }}>
      <div className="row g-0" style={{ height: 'calc(100vh - 72px)', minHeight: 500 }}>

        {/* ── Conversation list ── */}
        <div className={`col-12 col-md-4 border-end d-flex flex-column ${activeConv ? 'd-none d-md-flex' : 'd-flex'}`}>
          {/* Header */}
          <div className="px-3 py-3 border-bottom d-flex align-items-center justify-content-between">
            <h1 className="h5 fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--fc-blue-700)' }}>
              <i className="bi bi-chat-dots" />Inbox
            </h1>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              type="button" onClick={() => setShowNewConv(true)}>
              <i className="bi bi-plus-lg" />New
            </button>
          </div>

          {/* New conversation panel */}
          {showNewConv && (
            <div className="px-3 py-3 border-bottom" style={{ background: 'var(--bs-secondary-bg)' }}>
              <div className="fw-semibold small mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-envelope-plus me-1" />New conversation
              </div>
              <div className="input-group input-group-sm mb-2">
                <input className="form-control" type="email"
                  placeholder="Recipient email address"
                  value={newRecipEmail}
                  onChange={e => { setNewRecipEmail(e.target.value); setNewRecipResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && searchRecipient()} />
                <button className="btn btn-outline-primary" type="button"
                  onClick={searchRecipient} disabled={searchingRecip}>
                  {searchingRecip ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
                </button>
              </div>
              {newRecipResult === 'not_found' && (
                <div className="small text-danger"><i className="bi bi-x-circle me-1" />No SportBridge member found with that email.</div>
              )}
              {newRecipResult && newRecipResult !== 'not_found' && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 32, height: 32, background: ROLE_COLOURS[newRecipResult.role] ?? '#6c757d', color: '#fff', fontSize: 14 }}>
                    <i className={`bi ${ROLE_ICONS[newRecipResult.role] ?? 'bi-person'}`} />
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-semibold small text-truncate">{newRecipResult.full_name}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{newRecipResult.role?.replace('_', ' ')}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" type="button" onClick={startNewConversation}>
                    Message
                  </button>
                </div>
              )}
              <button className="btn btn-link btn-sm text-muted mt-1 p-0" type="button" onClick={() => { setShowNewConv(false); setNewRecipEmail(''); setNewRecipResult(null) }}>
                Cancel
              </button>
            </div>
          )}

          {/* Conversation list */}
          {loading || starting ? (
            <div className="p-4 text-center text-muted">
              <span className="spinner-border spinner-border-sm me-2" />
              {starting ? 'Opening conversation…' : 'Loading…'}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted flex-grow-1 d-flex flex-column align-items-center justify-content-center">
              <i className="bi bi-chat-square-dots fs-2 d-block mb-2 opacity-50" />
              <p className="small mb-2">No messages yet.</p>
              <p className="small text-muted">Click <strong>+ New</strong> to start a conversation, or visit a member profile and click <strong>Send message</strong>.</p>
            </div>
          ) : (
            <div className="overflow-auto flex-grow-1">
              {conversations.map((conv) => {
                const other     = getOther(conv)
                const isActive  = activeConv?.id === conv.id
                const roleColour = ROLE_COLOURS[other?.role] ?? '#6c757d'
                const roleIcon   = ROLE_ICONS[other?.role]  ?? 'bi-person'
                const initials   = (other?.full_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                return (
                  <button key={conv.id} type="button"
                    className={`w-100 text-start border-0 border-bottom px-3 py-3 d-flex align-items-center gap-3 ${isActive ? 'bg-primary bg-opacity-10' : 'bg-transparent'}`}
                    style={{ transition: 'background .15s' }}
                    onClick={() => setActiveConv(conv)}>
                    {/* Avatar */}
                    {other?.avatar_path ? (
                      <img src={other.avatar_path} alt={other.full_name}
                        className="rounded-circle flex-shrink-0"
                        style={{ width: 40, height: 40, objectFit: 'cover' }} />
                    ) : (
                      <div className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold"
                        style={{ width: 40, height: 40, background: roleColour, color: '#fff', fontSize: 14 }}>
                        {initials || <i className={`bi ${roleIcon}`} />}
                      </div>
                    )}
                    <div className="min-w-0 flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold small text-truncate" style={{ color: 'var(--fc-blue-700)' }}>
                          {other?.full_name || 'SportBridge member'}
                          {other?.verification_status === 'verified' && (
                            <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: 10 }} />
                          )}
                        </span>
                        <span className="text-muted flex-shrink-0 ms-1" style={{ fontSize: 10 }}>
                          {timeAgo(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="small text-muted text-truncate">{conv.subject || 'No subject'}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Message thread ── */}
        <div className={`col-12 col-md-8 d-flex flex-column ${!activeConv ? 'd-none d-md-flex' : 'd-flex'}`}>
          {!activeConv ? (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
              <div className="text-center">
                <i className="bi bi-chat-square-text fs-2 d-block mb-2 opacity-50" />
                <p className="small mb-1">Select a conversation to read messages</p>
                <p className="small text-muted">Or click <strong>+ New</strong> to start one</p>
              </div>
            </div>
          ) : (() => {
            const other = getOther(activeConv)
            const roleColour = ROLE_COLOURS[other?.role] ?? '#6c757d'
            const roleIcon   = ROLE_ICONS[other?.role] ?? 'bi-person'
            const initials   = (other?.full_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
            return (
              <>
                {/* Thread header */}
                <div className="px-3 py-3 border-bottom d-flex align-items-center gap-3">
                  <button className="btn btn-link p-0 d-md-none me-1 text-muted" type="button"
                    onClick={() => setActiveConv(null)}>
                    <i className="bi bi-arrow-left" />
                  </button>
                  {other?.avatar_path ? (
                    <img src={other.avatar_path} alt={other.full_name}
                      className="rounded-circle flex-shrink-0"
                      style={{ width: 36, height: 36, objectFit: 'cover' }} />
                  ) : (
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold"
                      style={{ width: 36, height: 36, background: roleColour, color: '#fff', fontSize: 13 }}>
                      {initials || <i className={`bi ${roleIcon}`} />}
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <div className="fw-bold small d-flex align-items-center gap-1" style={{ color: 'var(--fc-blue-700)' }}>
                      {other?.full_name || 'SportBridge member'}
                      {other?.verification_status === 'verified' && (
                        <i className="bi bi-patch-check-fill text-primary" style={{ fontSize: 11 }} />
                      )}
                    </div>
                    {activeConv.subject && (
                      <div className="text-muted" style={{ fontSize: 11 }}>{activeConv.subject}</div>
                    )}
                  </div>
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    type="button" onClick={loadConversations} title="Refresh">
                    <i className="bi bi-arrow-clockwise" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 overflow-auto px-3 py-3 d-flex flex-column gap-2">
                  {messages.length === 0 && (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-chat fs-2 d-block mb-2 opacity-25" />
                      <p className="small">No messages yet. Say hello!</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const mine = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`d-flex ${mine ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className="px-3 py-2 rounded-3"
                          style={{
                            maxWidth: '75%',
                            background: mine ? 'var(--fc-gradient-primary)' : 'var(--bs-secondary-bg)',
                            color: mine ? '#fff' : 'var(--bs-body-color)',
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                          <div style={{ fontSize: 10, opacity: .65, textAlign: 'right', marginTop: 2 }}>
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
                  <form onSubmit={sendMessage} className="d-flex gap-2 align-items-end">
                    <textarea
                      className="form-control"
                      value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                      placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
                      maxLength={10000}
                      rows={2}
                      style={{ fontSize: 14, resize: 'none' }}
                    />
                    <button className="btn btn-primary flex-shrink-0 d-flex align-items-center justify-content-center"
                      type="submit"
                      disabled={sending || !newMsg.trim()}
                      style={{ width: 44, height: 44 }}>
                      {sending
                        ? <span className="spinner-border spinner-border-sm" />
                        : <i className="bi bi-send-fill" />}
                    </button>
                  </form>
                  <p className="form-text mt-1 mb-0">
                    <i className="bi bi-shield-lock me-1 text-success" />
                    Never share personal contact details outside SportBridge.
                  </p>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
