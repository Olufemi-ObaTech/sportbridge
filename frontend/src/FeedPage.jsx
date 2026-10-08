/**
 * FeedPage.jsx — Community Feed
 *
 * All authenticated users can post and comment.
 * Public posts (visibility = 'public', status = 'published') are visible to
 * everyone including signed-out visitors.
 *
 * Features:
 *  - Compose box (text + optional sport tag + Live / Training toggles)
 *  - Infinite-scroll style pagination (Load more button)
 *  - Sport filter: All | Football | Basketball
 *  - Like / unlike (toggles via post_likes table)
 *  - Inline comment thread per post
 *  - Delete own post
 *  - Pinned post badge (admin-only to pin, but badge shows for all)
 *  - Verified author badge pulled from profiles.verification_status
 *  - Relative timestamps (updated every 60 s)
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { containsContactInfo, containsFraudKeywords } from './lib/features'

// ─── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const SPORT_OPTIONS = [
  { value: '', label: 'All Sports', icon: 'bi-globe2' },
  { value: 'football', label: 'Football', icon: 'bi-dribbble' },
  { value: 'basketball', label: 'Basketball', icon: 'bi-circle' },
]

const PAGE_SIZE = 10

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post, user, supabase, onDelete, onLikeToggle, onCommentAdded }) {
  const [showComments, setShowComments]     = useState(false)
  const [commentBody,  setCommentBody]      = useState('')
  const [submitting,   setSubmitting]       = useState(false)
  const [commentError, setCommentError]     = useState('')
  const [liking,       setLiking]           = useState(false)
  const [localLikes,   setLocalLikes]       = useState(post.likes_count ?? 0)
  const [liked,        setLiked]            = useState(post.user_has_liked ?? false)
  const [deleting,     setDeleting]         = useState(false)

  const isOwn    = user && (user.id === post.author_id)
  const isAdmin  = user && post.author_profile?.role === 'super_admin'
  const canDelete = isOwn || isAdmin

  // ── like toggle ────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!user || !supabase || liking) return
    setLiking(true)
    if (liked) {
      await supabase.from('post_likes').delete().eq('feed_post_id', post.id).eq('user_id', user.id)
      const newCount = Math.max(0, localLikes - 1)
      await supabase.from('feed_posts').update({ likes_count: newCount }).eq('id', post.id)
      setLocalLikes(newCount)
      setLiked(false)
    } else {
      await supabase.from('post_likes').insert({ feed_post_id: post.id, user_id: user.id })
      const newCount = localLikes + 1
      await supabase.from('feed_posts').update({ likes_count: newCount }).eq('id', post.id)
      setLocalLikes(newCount)
      setLiked(true)
    }
    onLikeToggle?.(post.id)
    setLiking(false)
  }

  // ── delete post ───────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return
    setDeleting(true)
    await supabase.from('feed_posts').update({ status: 'removed', deleted_at: new Date().toISOString() }).eq('id', post.id)
    onDelete?.(post.id)
  }

  // ── submit comment ────────────────────────────────────────────────────────
  const submitComment = async (e) => {
    e.preventDefault()
    const body = commentBody.trim()
    if (!body) return
    if (body.length > 5000) { setCommentError('Comment must be under 5,000 characters.'); return }
    if (containsContactInfo(body)) { setCommentError('Comments must not contain phone numbers or email addresses.'); return }
    setSubmitting(true); setCommentError('')
    const { data, error } = await supabase.from('post_comments').insert({
      feed_post_id: post.id,
      user_id:      user.id,
      body,
    }).select('id, body, created_at, user_id').single()
    setSubmitting(false)
    if (error) { setCommentError(error.message); return }
    await supabase.from('feed_posts').update({ comments_count: (post.comments_count ?? 0) + 1 }).eq('id', post.id)
    setCommentBody('')
    onCommentAdded?.(post.id, { ...data, author_name: user.email?.split('@')[0] })
    setShowComments(true)
  }

  const authorName    = post.author_profile?.full_name || post.author_email?.split('@')[0] || 'SportBridge member'
  const isVerified    = post.author_profile?.verification_status === 'verified'
  const authorRole    = post.author_profile?.role ?? ''

  const roleIcon = {
    player:      'bi-person-arms-up',
    academy:     'bi-building',
    agent:       'bi-binoculars',
    coach:       'bi-clipboard2-pulse',
    super_admin: 'bi-shield-check',
  }[authorRole] || 'bi-person-circle'

  return (
    <article className="card mb-3" id={`post-${post.id}`}>
      <div className="card-body">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
              style={{ width: 42, height: 42, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: 18 }}
              aria-hidden="true"
            >
              <i className={`bi ${roleIcon}`} />
            </span>
            <div>
              <div className="fw-semibold d-flex align-items-center gap-1" style={{ fontSize: 14 }}>
                {authorName}
                {isVerified && (
                  <i className="bi bi-patch-check-fill text-primary" style={{ fontSize: 13 }} title="Verified" aria-label="Verified account" />
                )}
              </div>
              <div className="small text-muted" style={{ fontSize: 12 }}>{timeAgo(post.created_at)}</div>
            </div>
          </div>

          {/* Badges */}
          <div className="d-flex flex-wrap gap-1 align-items-center">
            {post.sport && (
              <span className="badge text-bg-light border" style={{ fontSize: 11 }}>{post.sport === 'football' ? '⚽ Football' : '🏀 Basketball'}</span>
            )}
            {post.is_pinned && (
              <span className="badge text-bg-warning" style={{ fontSize: 11 }}><i className="bi bi-pin-angle-fill me-1" aria-hidden="true" />Pinned</span>
            )}
            {post.is_live && (
              <span className="badge text-bg-danger" style={{ fontSize: 11 }}><i className="bi bi-broadcast me-1" aria-hidden="true" />Live</span>
            )}
            {post.is_training && (
              <span className="badge text-bg-primary" style={{ fontSize: 11 }}><i className="bi bi-camera-video-fill me-1" aria-hidden="true" />Training</span>
            )}
            {canDelete && (
              <button
                type="button"
                className="btn btn-link btn-sm text-danger p-0 ms-1"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete post"
                style={{ fontSize: 13 }}
              >
                <i className="bi bi-trash" />
              </button>
            )}
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────── */}
        <p className="mb-2" style={{ whiteSpace: 'pre-line', fontSize: 15 }}>{post.content}</p>

        {/* ── Live banner ─────────────────────────────────────────── */}
        {post.is_live && post.live_link && (
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 rounded-3 p-3 mb-2"
            style={{ background: 'rgba(220,53,69,.06)', border: '1px solid rgba(220,53,69,.2)' }}>
            <div>
              <div className="fw-semibold small text-danger"><i className="bi bi-broadcast me-1" />LIVE</div>
              {post.live_at && (
                <div className="small text-muted">{new Date(post.live_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              )}
            </div>
            <a href={post.live_link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-danger">
              <i className="bi bi-box-arrow-up-right me-1" />Watch Live
            </a>
          </div>
        )}

        {/* ── Training banner ─────────────────────────────────────── */}
        {post.is_training && post.training_link && (
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 rounded-3 p-3 mb-2"
            style={{ background: 'rgba(47,125,240,.06)', border: '1px solid rgba(47,125,240,.18)' }}>
            <div>
              <div className="fw-semibold small text-primary"><i className="bi bi-camera-video-fill me-1" />Training Session</div>
              {post.training_at && (
                <div className="small text-muted">{new Date(post.training_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              )}
            </div>
            <a href={post.training_link} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
              <i className="bi bi-box-arrow-up-right me-1" />Join Training
            </a>
          </div>
        )}

        {/* ── Media grid ──────────────────────────────────────────── */}
        {Array.isArray(post.media_urls) && post.media_urls.length > 0 && (
          <div className={`row g-2 mb-2 ${post.media_urls.length === 1 ? '' : 'row-cols-2'}`}>
            {post.media_urls.map((item, i) => (
              <div className="col" key={i}>
                {item.type === 'video'
                  ? <video src={item.url} className="w-100 rounded" style={{ aspectRatio: '16/9', objectFit: 'cover' }} controls />
                  : item.type === 'youtube'
                  ? <div className="ratio ratio-16x9 rounded overflow-hidden">
                      <iframe src={`https://www.youtube.com/embed/${item.url}`} title="YouTube video" allowFullScreen />
                    </div>
                  : <img src={item.url} alt="" className="w-100 rounded" style={{ aspectRatio: '4/3', objectFit: 'cover' }} loading="lazy" />}
              </div>
            ))}
          </div>
        )}

        {/* ── Action bar ──────────────────────────────────────────── */}
        <div className="d-flex align-items-center gap-3 border-top pt-2 mt-1" style={{ fontSize: 13 }}>
          {user ? (
            <button
              type="button"
              className={`btn btn-link btn-sm text-decoration-none p-0 d-flex align-items-center gap-1 ${liked ? 'text-primary fw-bold' : 'text-muted'}`}
              onClick={handleLike}
              disabled={liking}
              aria-label={liked ? 'Unlike post' : 'Like post'}
            >
              <i className={`bi ${liked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`} />
              <span>{localLikes}</span>
            </button>
          ) : (
            <span className="text-muted d-flex align-items-center gap-1">
              <i className="bi bi-hand-thumbs-up" /><span>{localLikes}</span>
            </span>
          )}

          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none p-0 text-muted d-flex align-items-center gap-1"
            onClick={() => setShowComments(!showComments)}
            aria-expanded={showComments}
          >
            <i className="bi bi-chat" />
            <span>{post.comments?.length ?? post.comments_count ?? 0}</span>
            {!showComments && post.comments_count > 0 && <span className="text-muted" style={{ fontSize: 11 }}>— view</span>}
          </button>
        </div>

        {/* ── Comments ────────────────────────────────────────────── */}
        {showComments && (
          <div className="mt-2 border-top pt-2">
            {(post.comments ?? []).map((c, i) => (
              <div key={c.id ?? i} className="d-flex gap-2 mb-2">
                <span className="text-muted" style={{ fontSize: 18 }}><i className="bi bi-person-circle" /></span>
                <div style={{ fontSize: 13 }}>
                  <strong>{c.author_name ?? c.user?.full_name ?? 'Member'}</strong>
                  {' '}<span className="text-muted">{timeAgo(c.created_at)}</span>
                  <div>{c.body}</div>
                </div>
              </div>
            ))}

            {user ? (
              <form onSubmit={submitComment} className="d-flex gap-2 mt-2">
                <input
                  className="form-control form-control-sm"
                  type="text"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a comment…"
                  maxLength={5000}
                  required
                  style={{ fontSize: 13 }}
                />
                <button className="btn btn-sm btn-outline-primary" type="submit" disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm" /> : 'Post'}
                </button>
              </form>
            ) : (
              <p className="small text-muted mt-1">Sign in to comment.</p>
            )}
            {commentError && <div className="small text-danger mt-1">{commentError}</div>}
          </div>
        )}
      </div>
    </article>
  )
}

// ─── ComposeBox ───────────────────────────────────────────────────────────────
function ComposeBox({ user, supabase, currentSport, onPosted }) {
  const [content,      setContent]      = useState('')
  const [sport,        setSport]        = useState(currentSport || '')
  const [isLive,       setIsLive]       = useState(false)
  const [liveLink,     setLiveLink]     = useState('')
  const [liveAt,       setLiveAt]       = useState('')
  const [isTraining,   setIsTraining]   = useState(false)
  const [trainingLink, setTrainingLink] = useState('')
  const [trainingAt,   setTrainingAt]   = useState('')
  const [busy,         setBusy]         = useState(false)
  const [error,        setError]        = useState('')
  const textRef = useRef(null)

  const toggleLive = () => {
    setIsLive(!isLive)
    if (!isLive) setIsTraining(false) // mutually exclusive
  }
  const toggleTraining = () => {
    setIsTraining(!isTraining)
    if (!isTraining) setIsLive(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    const body = content.trim()
    if (!body) return
    if (body.length > 10000) { setError('Post must be under 10,000 characters.'); return }
    if (containsContactInfo(body)) { setError('Posts must not contain phone numbers or email addresses. Use the secure inbox for private contact.'); return }
    if (containsFraudKeywords(body)) { setError('Post contains language associated with fraudulent tryout fees. Please remove these phrases.'); return }
    if (isLive && !liveLink.trim())     { setError('A live stream link is required for Live posts.'); return }
    if (isTraining && !trainingLink.trim()) { setError('A training link is required for Training posts.'); return }

    setBusy(true); setError('')

    const payload = {
      author_id:     user.id,
      content:       body,
      sport:         sport || null,
      visibility:    'public',
      status:        'published',
      is_live:       isLive,
      live_link:     isLive      ? liveLink.trim()     : null,
      live_at:       isLive && liveAt      ? new Date(liveAt).toISOString()     : null,
      is_training:   isTraining,
      training_link: isTraining  ? trainingLink.trim() : null,
      training_at:   isTraining && trainingAt ? new Date(trainingAt).toISOString() : null,
      media_urls:    [],
    }

    const { data, error: dbErr } = await supabase.from('feed_posts').insert(payload).select('*').single()
    setBusy(false)

    if (dbErr) { setError(dbErr.message); return }

    // Reset form
    setContent(''); setSport(currentSport || ''); setIsLive(false); setLiveLink(''); setLiveAt('')
    setIsTraining(false); setTrainingLink(''); setTrainingAt('')
    textRef.current?.focus()
    onPosted?.(data)
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <form onSubmit={submit} noValidate>
          <textarea
            ref={textRef}
            className="form-control mb-2"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, highlight, opportunity or training session…"
            maxLength={10000}
            required
            style={{ resize: 'vertical', fontSize: 14 }}
          />

          <div className="row g-2 mb-2">
            {/* Sport selector */}
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold mb-1" htmlFor="compose-sport">Sport</label>
              <select id="compose-sport" className="form-select form-select-sm" value={sport} onChange={(e) => setSport(e.target.value)}>
                <option value="">General / All Sports</option>
                <option value="football">⚽ Football</option>
                <option value="basketball">🏀 Basketball</option>
              </select>
            </div>
          </div>

          {/* Live toggle */}
          <div className="form-check mb-1">
            <input className="form-check-input" type="checkbox" id="compose-live" checked={isLive} onChange={toggleLive} />
            <label className="form-check-label small fw-semibold" htmlFor="compose-live">
              <i className="bi bi-broadcast me-1 text-danger" />This is a live video stream
            </label>
          </div>
          {isLive && (
            <div className="row g-2 mb-2 ms-1">
              <div className="col-12 col-sm-7">
                <label className="form-label small" htmlFor="compose-live-link">Live stream URL *</label>
                <input id="compose-live-link" className="form-control form-control-sm" type="url"
                  value={liveLink} onChange={(e) => setLiveLink(e.target.value)} placeholder="https://youtube.com/live/…" />
              </div>
              <div className="col-12 col-sm-5">
                <label className="form-label small" htmlFor="compose-live-at">Starts at (optional)</label>
                <input id="compose-live-at" className="form-control form-control-sm" type="datetime-local"
                  value={liveAt} onChange={(e) => setLiveAt(e.target.value)} />
              </div>
            </div>
          )}

          {/* Training toggle */}
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="compose-training" checked={isTraining} onChange={toggleTraining} />
            <label className="form-check-label small fw-semibold" htmlFor="compose-training">
              <i className="bi bi-camera-video-fill me-1 text-primary" />This is an online training session
            </label>
          </div>
          {isTraining && (
            <div className="row g-2 mb-2 ms-1">
              <div className="col-12 col-sm-7">
                <label className="form-label small" htmlFor="compose-training-link">Training / meeting link *</label>
                <input id="compose-training-link" className="form-control form-control-sm" type="url"
                  value={trainingLink} onChange={(e) => setTrainingLink(e.target.value)} placeholder="https://zoom.us/j/…" />
              </div>
              <div className="col-12 col-sm-5">
                <label className="form-label small" htmlFor="compose-training-at">Date & time</label>
                <input id="compose-training-at" className="form-control form-control-sm" type="datetime-local"
                  value={trainingAt} onChange={(e) => setTrainingAt(e.target.value)} />
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger py-2 small mb-2" role="alert">{error}</div>}

          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="small text-muted">{content.length}/10,000</span>
            <button className="btn btn-primary btn-sm px-4" type="submit" disabled={busy || !content.trim()}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</> : <><i className="bi bi-send me-2" />Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── FeedPage ─────────────────────────────────────────────────────────────────
export default function FeedPage({ supabase, user, onSignup }) {
  const [posts,        setPosts]        = useState([])
  const [sport,        setSport]        = useState('')     // '' = all
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [hasMore,      setHasMore]      = useState(false)
  const [offset,       setOffset]       = useState(0)
  const [likedIds,     setLikedIds]     = useState(new Set())

  // ── fetch posts ─────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (sportFilter, from, replace) => {
    if (!supabase) return
    if (replace) { setLoading(true) } else { setLoadingMore(true) }

    // Authenticated users get the author profile join.
    // Anon users get posts without the profiles join (anon has no SELECT on profiles).
    const profileJoin = user
      ? `, author_profile:profiles!author_id (full_name, role, verification_status)`
      : ''
    const commentAuthorJoin = user
      ? `, author:profiles!user_id (full_name)`
      : ''

    let q = supabase
      .from('feed_posts')
      .select(`
        id, author_id, content, sport, media_urls,
        visibility, status, is_pinned, is_live, live_link, live_at,
        is_training, training_link, training_at,
        likes_count, comments_count, created_at
        ${profileJoin}
        ${user ? `, comments:post_comments (id, body, created_at, user_id ${commentAuthorJoin})` : ''}
      `)
      .eq('visibility', 'public')
      .eq('status', 'published')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (sportFilter) q = q.eq('sport', sportFilter)

    const { data, error } = await q
    if (replace) { setLoading(false) } else { setLoadingMore(false) }
    if (error || !data) return

    // Attach author_name to comments for display
    const enriched = (data ?? []).map((p) => ({
      ...p,
      comments: (p.comments ?? []).map((c) => ({
        ...c,
        author_name: c.author?.full_name || 'Member',
      })),
    }))

    if (replace) {
      setPosts(enriched)
    } else {
      setPosts((prev) => [...prev, ...enriched])
    }
    setHasMore(data.length === PAGE_SIZE)
    setOffset(from + data.length)
  }, [supabase, user])

  // ── initial load + sport filter change ──────────────────────────────────
  useEffect(() => {
    setOffset(0)
    fetchPosts(sport, 0, true)
  }, [sport, fetchPosts])

  // ── fetch liked IDs for current user ────────────────────────────────────
  useEffect(() => {
    if (!supabase || !user) return
    supabase
      .from('post_likes')
      .select('feed_post_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((r) => r.feed_post_id)))
      })
  }, [supabase, user])

  const handlePosted = (newPost) => {
    setPosts((prev) => [{ ...newPost, comments: [], author_profile: null }, ...prev])
  }

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const handleLikeToggle = (postId) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) { next.delete(postId) } else { next.add(postId) }
      return next
    })
  }

  const handleCommentAdded = (postId, comment) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId
        ? { ...p, comments_count: (p.comments_count || 0) + 1, comments: [...(p.comments || []), comment] }
        : p
    ))
  }

  const loadMore = () => fetchPosts(sport, offset, false)

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-7 col-xl-6">

          {/* ── Page header ─────────────────────────────────── */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
            <div>
              <h1 className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-newspaper me-2" aria-hidden="true" />Community Feed
              </h1>
              <p className="text-muted small mb-0">Updates, highlights and opportunities from the SportBridge community.</p>
            </div>

            {/* Sport filter pills */}
            <div className="btn-group btn-group-sm" role="group" aria-label="Filter by sport">
              {SPORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`btn ${sport === s.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSport(s.value)}
                >
                  <i className={`bi ${s.icon} me-1`} aria-hidden="true" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Compose box — authenticated users only ─────── */}
          {user ? (
            <ComposeBox
              user={user}
              supabase={supabase}
              currentSport={sport}
              onPosted={handlePosted}
            />
          ) : (
            <div className="card mb-4 p-4 text-center"
              style={{ background: 'rgba(47,125,240,.04)', border: '1px solid rgba(47,125,240,.15)' }}>
              <i className="bi bi-pencil-square fs-3 text-primary mb-2" aria-hidden="true" />
              <p className="mb-2 fw-semibold">Want to post to the feed?</p>
              <p className="small text-muted mb-3">Create a free SportBridge account to share updates, highlights and opportunities with the community.</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button className="btn btn-primary btn-sm" type="button" onClick={() => onSignup?.('player')}>
                  <i className="bi bi-person-plus me-1" />Create account
                </button>
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => onSignup?.()}>
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* ── Posts ─────────────────────────────────────────── */}
          {loading ? (
            <div className="py-5 text-center text-muted">
              <span className="spinner-border spinner-border-sm me-2" />
              Loading feed…
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-newspaper fs-2 d-block mb-2" aria-hidden="true" />
              <p className="mb-1 fw-semibold">No posts yet.</p>
              <p className="small">Be the first to share something with the community.</p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{ ...post, user_has_liked: likedIds.has(post.id) }}
                  user={user}
                  supabase={supabase}
                  onDelete={handleDelete}
                  onLikeToggle={handleLikeToggle}
                  onCommentAdded={handleCommentAdded}
                />
              ))}

              {hasMore && (
                <div className="text-center py-3">
                  <button className="btn btn-outline-primary" type="button" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <><span className="spinner-border spinner-border-sm me-2" />Loading…</> : 'Load more posts'}
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
