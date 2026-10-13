/**
 * FeedPage.jsx — Community Feed
 * Better UI: card-based posts, prominent Live Training section,
 * ALL users can post when signed in, public read for everyone.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { containsContactInfo, containsFraudKeywords } from './lib/features'

const PAGE_SIZE = 12

// ─── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)     return 'just now'
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const ROLE_ICONS = {
  player: 'bi-person-arms-up', academy: 'bi-building',
  agent: 'bi-binoculars', coach: 'bi-clipboard2-pulse', super_admin: 'bi-shield-check',
}
const ROLE_COLORS = {
  player: 'var(--fc-gradient-primary)', academy: 'linear-gradient(135deg,#6f42c1,#9d63e8)',
  agent: 'linear-gradient(135deg,#198754,#20c997)', coach: 'var(--fc-gradient-gold)',
  super_admin: 'linear-gradient(135deg,#dc3545,#e85d73)',
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, user, supabase, onDelete, onLikeToggle, onCommentAdded }) {
  const [showComments, setShowComments] = useState(false)
  const [commentBody, setCommentBody]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [liking, setLiking]             = useState(false)
  const [localLikes, setLocalLikes]     = useState(post.likes_count ?? 0)
  const [liked, setLiked]               = useState(post.user_has_liked ?? false)

  const canDelete = user && (user.id === post.author_id || post.author_profile?.role === 'super_admin')
  const authorName = post.author_profile?.full_name || 'SportBridge member'
  const role = post.author_profile?.role || 'player'
  const isVerified = post.author_profile?.verification_status === 'verified'

  const handleLike = async () => {
    if (!user || liking) return
    setLiking(true)
    const newCount = liked ? Math.max(0, localLikes - 1) : localLikes + 1
    if (liked) {
      await supabase.from('post_likes').delete().eq('feed_post_id', post.id).eq('user_id', user.id)
    } else {
      await supabase.from('post_likes').insert({ feed_post_id: post.id, user_id: user.id })
    }
    await supabase.from('feed_posts').update({ likes_count: newCount }).eq('id', post.id)
    setLocalLikes(newCount); setLiked(!liked)
    onLikeToggle?.(post.id); setLiking(false)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    await supabase.from('feed_posts').update({ status: 'removed', deleted_at: new Date().toISOString() }).eq('id', post.id)
    onDelete?.(post.id)
  }

  const submitComment = async (e) => {
    e.preventDefault()
    const body = commentBody.trim()
    if (!body || body.length > 5000) return
    if (containsContactInfo(body)) return
    setSubmitting(true)
    const { data, error } = await supabase.from('post_comments').insert({ feed_post_id: post.id, user_id: user.id, body })
      .select('id, body, created_at, user_id').single()
    setSubmitting(false)
    if (!error) {
      await supabase.from('feed_posts').update({ comments_count: (post.comments_count ?? 0) + 1 }).eq('id', post.id)
      setCommentBody('')
      onCommentAdded?.(post.id, { ...data, author_name: user.email?.split('@')[0] })
      setShowComments(true)
    }
  }

  return (
    <article className="card mb-3 overflow-hidden" style={{ borderRadius: 'var(--fc-radius)' }}>
      {/* Live/Training banner strip */}
      {post.is_live && (
        <div className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ background: 'linear-gradient(90deg,#dc3545,#e85d73)', color: '#fff' }}>
          <span className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
            <span className="badge bg-white text-danger" style={{ fontSize: 10, animation: 'pulse 1.5s infinite' }}>● LIVE</span>
            {post.live_at && new Date(post.live_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          {post.live_link && (
            <a href={post.live_link} target="_blank" rel="noopener noreferrer"
              className="btn btn-sm btn-light text-danger fw-bold">
              <i className="bi bi-play-circle-fill me-1" />Watch Live
            </a>
          )}
        </div>
      )}
      {post.is_training && (
        <div className="d-flex align-items-center justify-content-between px-3 py-2"
          style={{ background: 'linear-gradient(90deg,var(--fc-blue-700),var(--fc-blue-500))', color: '#fff' }}>
          <span className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: 13 }}>
            <i className="bi bi-camera-video-fill" />Training Session
            {post.training_at && ' · ' + new Date(post.training_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          {post.training_link && (
            <a href={post.training_link} target="_blank" rel="noopener noreferrer"
              className="btn btn-sm btn-light text-primary fw-bold">
              <i className="bi bi-box-arrow-up-right me-1" />Join
            </a>
          )}
        </div>
      )}

      <div className="card-body p-3">
        {/* Author row */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
              style={{ width: 40, height: 40, background: ROLE_COLORS[role] || 'var(--fc-gradient-primary)', color: role === 'coach' ? '#000' : '#fff', fontSize: 16 }}>
              <i className={`bi ${ROLE_ICONS[role] || 'bi-person-circle'}`} />
            </span>
            <div>
              <div className="fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 14, lineHeight: 1.3 }}>
                {authorName}
                {isVerified && <i className="bi bi-patch-check-fill text-primary" style={{ fontSize: 12 }} title="Verified" />}
              </div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                {role !== 'player' && <span className="text-capitalize me-1">{role} · </span>}
                {timeAgo(post.created_at)}
                {post.sport && <span className="ms-1">{post.sport === 'football' ? ' ⚽' : ' 🏀'}</span>}
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-1">
            {post.is_pinned && <span className="badge text-bg-warning" style={{ fontSize: 10 }}><i className="bi bi-pin-angle-fill" /></span>}
            {canDelete && (
              <button type="button" className="btn btn-link btn-sm text-muted p-1" onClick={handleDelete} aria-label="Delete">
                <i className="bi bi-x-lg" style={{ fontSize: 12 }} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="mb-2" style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.6 }}>{post.content}</p>

        {/* Media */}
        {Array.isArray(post.media_urls) && post.media_urls.length > 0 && (
          <div className={`row g-1 mb-2 ${post.media_urls.length === 1 ? '' : 'row-cols-2'}`}>
            {post.media_urls.map((item, i) => (
              <div className="col" key={i}>
                {item.type === 'video'
                  ? <video src={item.url} className="w-100 rounded" style={{ maxHeight: 280, objectFit: 'cover' }} controls />
                  : item.type === 'youtube'
                  ? <div className="ratio ratio-16x9 rounded overflow-hidden">
                      <iframe src={`https://www.youtube.com/embed/${item.url}`} title="YouTube" allowFullScreen />
                    </div>
                  : <img src={item.url} alt="" className="w-100 rounded" style={{ maxHeight: 280, objectFit: 'cover' }} loading="lazy" />}
              </div>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="d-flex align-items-center gap-3 pt-2 mt-1" style={{ borderTop: '1px solid var(--bs-border-color)', fontSize: 13 }}>
          <button type="button"
            className={`btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center gap-1 ${liked ? 'text-primary fw-bold' : 'text-muted'}`}
            onClick={handleLike} disabled={!user || liking}>
            <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`} />
            <span>{localLikes}</span>
          </button>
          <button type="button"
            className="btn btn-link btn-sm text-decoration-none p-0 text-muted d-flex align-items-center gap-1"
            onClick={() => setShowComments(!showComments)}>
            <i className="bi bi-chat" />
            <span>{post.comments?.length ?? post.comments_count ?? 0}</span>
          </button>
          {!user && <span className="text-muted ms-auto" style={{ fontSize: 11 }}>Sign in to like or comment</span>}
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--bs-border-color)' }}>
            {(post.comments ?? []).map((c, i) => (
              <div key={c.id ?? i} className="d-flex gap-2 mb-2">
                <span className="rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 28, height: 28, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: 12 }}>
                  <i className="bi bi-person" />
                </span>
                <div className="rounded-3 px-2 py-1 flex-grow-1" style={{ background: 'var(--bs-secondary-bg)', fontSize: 13 }}>
                  <strong style={{ fontSize: 12 }}>{c.author_name ?? 'Member'}</strong>
                  <span className="text-muted ms-1" style={{ fontSize: 11 }}>{timeAgo(c.created_at)}</span>
                  <div>{c.body}</div>
                </div>
              </div>
            ))}
            {user ? (
              <form onSubmit={submitComment} className="d-flex gap-2 mt-2">
                <input className="form-control form-control-sm" type="text" value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)} placeholder="Write a comment…" maxLength={5000} required style={{ fontSize: 13 }} />
                <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send-fill" />}
                </button>
              </form>
            ) : (
              <p className="small text-muted mt-1 mb-0">Sign in to comment.</p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

// ─── ComposeBox ───────────────────────────────────────────────────────────────
function ComposeBox({ user, supabase, onPosted }) {
  const [content, setContent]           = useState('')
  const [sport, setSport]               = useState('')
  const [postType, setPostType]         = useState('update') // update | live | training
  const [liveLink, setLiveLink]         = useState('')
  const [liveAt, setLiveAt]             = useState('')
  const [trainingLink, setTrainingLink] = useState('')
  const [trainingAt, setTrainingAt]     = useState('')
  const [busy, setBusy]                 = useState(false)
  const [error, setError]               = useState('')
  const textRef = useRef(null)

  const submit = async (e) => {
    e.preventDefault()
    const body = content.trim()
    if (!body) return
    if (body.length > 10000) { setError('Post must be under 10,000 characters.'); return }
    if (containsContactInfo(body)) { setError('Posts must not contain phone numbers or email addresses. Use the secure inbox instead.'); return }
    if (containsFraudKeywords(body)) { setError('Post contains language associated with payment scams. Remove those phrases.'); return }
    if (postType === 'live' && !liveLink.trim()) { setError('A live stream link is required.'); return }
    if (postType === 'training' && !trainingLink.trim()) { setError('A training/meeting link is required.'); return }

    setBusy(true); setError('')
    const { data, error: dbErr } = await supabase.from('feed_posts').insert({
      author_id:     user.id,
      content:       body,
      sport:         sport || null,
      visibility:    'public',
      status:        'published',
      is_live:       postType === 'live',
      live_link:     postType === 'live' ? liveLink.trim() : null,
      live_at:       postType === 'live' && liveAt ? new Date(liveAt).toISOString() : null,
      is_training:   postType === 'training',
      training_link: postType === 'training' ? trainingLink.trim() : null,
      training_at:   postType === 'training' && trainingAt ? new Date(trainingAt).toISOString() : null,
      media_urls:    [],
    }).select('*').single()
    setBusy(false)
    if (dbErr) { setError(dbErr.message); return }
    setContent(''); setSport(''); setPostType('update'); setLiveLink(''); setLiveAt(''); setTrainingLink(''); setTrainingAt('')
    textRef.current?.focus()
    onPosted?.(data)
  }

  return (
    <div className="card mb-4" style={{ border: '2px solid var(--fc-blue-100)' }}>
      <div className="card-body p-3">
        {/* Post type tabs */}
        <div className="d-flex gap-1 mb-3">
          {[
            { v: 'update',   icon: 'bi-pencil',              label: 'Update'   },
            { v: 'live',     icon: 'bi-broadcast',           label: 'Go Live'  },
            { v: 'training', icon: 'bi-camera-video-fill',   label: 'Training' },
          ].map(({ v, icon, label }) => (
            <button key={v} type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 ${postType === v ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setPostType(v)}>
              <i className={`bi ${icon}`} />{label}
            </button>
          ))}
          <select className="form-select form-select-sm ms-auto" style={{ width: 'auto', maxWidth: 140 }}
            value={sport} onChange={(e) => setSport(e.target.value)}>
            <option value="">All Sports</option>
            <option value="football">⚽ Football</option>
            <option value="basketball">🏀 Basketball</option>
          </select>
        </div>

        <form onSubmit={submit} noValidate>
          <textarea ref={textRef} className="form-control mb-2" rows={postType === 'update' ? 3 : 2}
            value={content} onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'live' ? 'Tell the community about your live session…' :
              postType === 'training' ? 'Describe this training session — topic, level, what to expect…' :
              'Share an update, highlight, opportunity or result…'
            }
            maxLength={10000} required style={{ fontSize: 14, resize: 'vertical' }} />

          {/* Live fields */}
          {postType === 'live' && (
            <div className="rounded-3 p-3 mb-2" style={{ background: 'rgba(220,53,69,.06)', border: '1.5px solid rgba(220,53,69,.2)' }}>
              <div className="row g-2">
                <div className="col-12 col-sm-7">
                  <label className="form-label small fw-bold text-danger mb-1"><i className="bi bi-broadcast me-1" />Live stream URL *</label>
                  <input className="form-control form-control-sm" type="url" value={liveLink}
                    onChange={(e) => setLiveLink(e.target.value)} placeholder="YouTube Live, Zoom, Facebook Live…" />
                </div>
                <div className="col-12 col-sm-5">
                  <label className="form-label small fw-bold text-danger mb-1">Starts at (optional)</label>
                  <input className="form-control form-control-sm" type="datetime-local" value={liveAt}
                    onChange={(e) => setLiveAt(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Training fields */}
          {postType === 'training' && (
            <div className="rounded-3 p-3 mb-2" style={{ background: 'rgba(47,125,240,.06)', border: '1.5px solid rgba(47,125,240,.2)' }}>
              <div className="row g-2">
                <div className="col-12 col-sm-7">
                  <label className="form-label small fw-bold text-primary mb-1"><i className="bi bi-camera-video-fill me-1" />Meeting / training link *</label>
                  <input className="form-control form-control-sm" type="url" value={trainingLink}
                    onChange={(e) => setTrainingLink(e.target.value)} placeholder="Zoom, Google Meet, Teams…" />
                </div>
                <div className="col-12 col-sm-5">
                  <label className="form-label small fw-bold text-primary mb-1">Date & time</label>
                  <input className="form-control form-control-sm" type="datetime-local" value={trainingAt}
                    onChange={(e) => setTrainingAt(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}

          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">{content.length > 0 ? `${content.length}/10,000` : ''}</span>
            <button className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-2"
              type="submit" disabled={busy || !content.trim()}>
              {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send-fill" />}
              {postType === 'live' ? 'Go Live' : postType === 'training' ? 'Post Training' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonPost() {
  return (
    <div className="card mb-3 p-3" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="rounded-circle" style={{ width: 40, height: 40, background: 'var(--bs-border-color)' }} />
        <div>
          <div className="rounded mb-1" style={{ width: 120, height: 12, background: 'var(--bs-border-color)' }} />
          <div className="rounded" style={{ width: 80, height: 10, background: 'var(--bs-border-color)' }} />
        </div>
      </div>
      {[90, 70, 50].map((w, i) => (
        <div key={i} className="rounded mb-2" style={{ width: `${w}%`, height: 12, background: 'var(--bs-border-color)' }} />
      ))}
    </div>
  )
}

// ─── FeedPage ─────────────────────────────────────────────────────────────────
export default function FeedPage({ supabase, user, onSignup }) {
  const [posts, setPosts]         = useState([])
  const [sport, setSport]         = useState('')
  const [filter, setFilter]       = useState('all') // all | live | training
  const [loading, setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]     = useState(false)
  const [offset, setOffset]       = useState(0)
  const [likedIds, setLikedIds]   = useState(new Set())

  const fetchPosts = useCallback(async (sportFilter, filterType, from, replace) => {
    if (!supabase) return
    if (replace) { setLoading(true) } else { setLoadingMore(true) }

    const profileJoin = user ? `, author_profile:profiles!author_id (full_name, role, verification_status)` : ''
    const commentJoin = user ? `, author:profiles!user_id (full_name)` : ''

    let q = supabase.from('feed_posts')
      .select(`id, author_id, content, sport, media_urls, visibility, status, is_pinned,
               is_live, live_link, live_at, is_training, training_link, training_at,
               likes_count, comments_count, created_at
               ${profileJoin}
               ${user ? `, comments:post_comments (id, body, created_at, user_id ${commentJoin})` : ''}`)
      .eq('visibility', 'public').eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (sportFilter) q = q.eq('sport', sportFilter)
    if (filterType === 'live') q = q.eq('is_live', true)
    if (filterType === 'training') q = q.eq('is_training', true)

    const { data, error } = await q
    if (replace) { setLoading(false) } else { setLoadingMore(false) }
    if (error || !data) return

    const enriched = data.map((p) => ({
      ...p,
      comments: (p.comments ?? []).map((c) => ({ ...c, author_name: c.author?.full_name || 'Member' })),
    }))
    if (replace) { setPosts(enriched) } else { setPosts((prev) => [...prev, ...enriched]) }
    setHasMore(data.length === PAGE_SIZE)
    setOffset(from + data.length)
  }, [supabase, user])

  useEffect(() => { setOffset(0); fetchPosts(sport, filter, 0, true) }, [sport, filter, fetchPosts])

  useEffect(() => {
    if (!supabase || !user) return
    supabase.from('post_likes').select('feed_post_id').eq('user_id', user.id)
      .then(({ data }) => { if (data) setLikedIds(new Set(data.map((r) => r.feed_post_id))) })
  }, [supabase, user])

  const handlePosted = (p) => setPosts((prev) => [{ ...p, comments: [], author_profile: null }, ...prev])
  const handleDelete = (id) => setPosts((prev) => prev.filter((p) => p.id !== id))
  const handleLikeToggle = (id) => setLikedIds((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id) } else { n.add(id) } return n })
  const handleCommentAdded = (id, c) => setPosts((prev) => prev.map((p) => p.id === id ? { ...p, comments_count: (p.comments_count || 0) + 1, comments: [...(p.comments || []), c] } : p))

  // Live & training counts for badges
  const liveCount     = posts.filter((p) => p.is_live).length
  const trainingCount = posts.filter((p) => p.is_training).length

  return (
    <div className="container-xl py-4">
      <div className="row g-4">

        {/* ── Left sidebar (desktop) ─────────────────────────────── */}
        <div className="col-12 col-lg-3 d-none d-lg-block">
          <div className="card p-3 mb-3 sticky-top" style={{ top: 80 }}>
            <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>Filter Feed</h2>
            {[
              { v: 'all',      label: 'All Posts',         icon: 'bi-grid-3x3-gap', count: null },
              { v: 'live',     label: 'Live Now',           icon: 'bi-broadcast',     count: liveCount,     color: 'text-danger' },
              { v: 'training', label: 'Training Sessions',  icon: 'bi-camera-video',  count: trainingCount, color: 'text-primary' },
            ].map(({ v, label, icon, count, color }) => (
              <button key={v} type="button"
                className={`btn text-start d-flex align-items-center justify-content-between w-100 mb-1 ${filter === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter(v)}>
                <span className="d-flex align-items-center gap-2">
                  <i className={`bi ${icon} ${color ?? ''}`} />
                  {label}
                </span>
                {count > 0 && <span className="badge text-bg-danger">{count}</span>}
              </button>
            ))}
            <hr />
            <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>Sport</h2>
            {[['', 'All Sports'], ['football', '⚽ Football'], ['basketball', '🏀 Basketball']].map(([v, l]) => (
              <button key={v} type="button"
                className={`btn btn-sm text-start w-100 mb-1 ${sport === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSport(v)}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── Main feed ──────────────────────────────────────────── */}
        <div className="col-12 col-lg-6">

          {/* Page header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-newspaper me-2" />Community Feed
              </h1>
              <p className="text-muted small mb-0">Updates, highlights and opportunities from SportBridge.</p>
            </div>
            {/* Mobile filter pills */}
            <div className="d-flex gap-1 d-lg-none">
              {[['all','bi-grid'],['live','bi-broadcast'],['training','bi-camera-video']].map(([v, ic]) => (
                <button key={v} type="button"
                  className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(v)}>
                  <i className={`bi ${ic}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Compose box */}
          {user ? (
            <ComposeBox user={user} supabase={supabase} onPosted={handlePosted} />
          ) : (
            <div className="card mb-4 text-center py-4 px-3"
              style={{ background: 'var(--fc-gradient-primary)', color: '#fff', borderRadius: 'var(--fc-radius)' }}>
              <i className="bi bi-pencil-square fs-2 mb-2" />
              <p className="fw-bold mb-1">Join the conversation</p>
              <p className="small mb-3" style={{ opacity: .85 }}>Share updates, highlights, live sessions and opportunities with the community.</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button className="btn btn-secondary btn-sm fw-bold" type="button" onClick={() => onSignup?.('player')}>
                  <i className="bi bi-person-plus me-1" />Create account
                </button>
                <button className="btn btn-outline-light btn-sm" type="button" onClick={() => onSignup?.()}>Sign in</button>
              </div>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <>{[1,2,3].map((i) => <SkeletonPost key={i} />)}</>
          ) : posts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-newspaper fs-1 d-block mb-3" style={{ opacity: .3 }} />
              <p className="fw-semibold mb-1">No posts yet</p>
              <p className="small">Be the first to share something with the community.</p>
              {filter !== 'all' && (
                <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => setFilter('all')}>
                  Show all posts
                </button>
              )}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id}
                  post={{ ...post, user_has_liked: likedIds.has(post.id) }}
                  user={user} supabase={supabase}
                  onDelete={handleDelete} onLikeToggle={handleLikeToggle} onCommentAdded={handleCommentAdded} />
              ))}
              {hasMore && (
                <div className="text-center py-3">
                  <button className="btn btn-outline-primary" type="button" onClick={() => fetchPosts(sport, filter, offset, false)} disabled={loadingMore}>
                    {loadingMore ? <><span className="spinner-border spinner-border-sm me-2" />Loading…</> : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right sidebar (desktop) ─────────────────────────────── */}
        <div className="col-12 col-lg-3 d-none d-lg-block">
          <div className="card p-3 mb-3 sticky-top" style={{ top: 80 }}>
            <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
              <i className="bi bi-shield-exclamation me-1 text-danger" />Safety Notice
            </h2>
            <p className="small text-muted mb-0">
              <strong className="text-danger">Never pay</strong> an agent or scout to arrange a trial or introduction.
              Legitimate agents never charge players. Always check the Verified ✓ badge before engaging.
            </p>
          </div>
          {!user && (
            <div className="card p-3" style={{ background: 'var(--fc-gradient-primary)', color: '#fff', borderRadius: 'var(--fc-radius)' }}>
              <h2 className="h6 fw-bold mb-2">Join free today</h2>
              <p className="small mb-3" style={{ opacity: .85 }}>Your profile takes 5 minutes. Your opportunity starts today.</p>
              <button className="btn btn-secondary btn-sm w-100 fw-bold" type="button" onClick={() => onSignup?.('player')}>
                <i className="bi bi-person-plus me-1" />Create account
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
