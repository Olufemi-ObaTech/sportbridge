/**
 * PostUpdateForm.jsx
 * Reusable form for posting updates to the Community Feed.
 * Used by: Player (match updates, goals), Coach (events, certs),
 *          Agent (events, certs), Academy (match updates, tournaments),
 *          Sports Analyst (match reviews, courses, certs)
 *
 * Props:
 *   supabase  — Supabase client
 *   user      — authenticated user
 *   role      — 'player' | 'coach' | 'agent' | 'academy' | 'sports_analyst'
 *   onSaved   — callback after successful post
 */

import { useState } from 'react'
import { blockContactInfo } from './lib/uploadGuards'

// Post type options per role
const POST_TYPES = {
  player: [
    { value: 'match_result',   label: '⚽ Match Result / Stats',           hint: 'Share goals, assists, clean sheets and match details' },
    { value: 'upcoming_match', label: '📅 Upcoming Match / Tournament',    hint: 'Let clubs and agents know about upcoming fixtures' },
    { value: 'achievement',    label: '🏆 Achievement / Milestone',        hint: 'Caps, awards, goals milestone, contract news' },
    { value: 'update',         label: '📢 General Update',                 hint: 'Any other update for your followers' },
  ],
  coach: [
    { value: 'upcoming_event', label: '📅 Upcoming Event / Tournament',    hint: 'Share upcoming competitions, clinics or coaching events' },
    { value: 'certificate',    label: '🎓 Certificate / Licence Earned',   hint: 'UEFA, CAF, FIFA or other coaching qualifications' },
    { value: 'match_result',   label: '⚽ Match Result',                   hint: 'Share results from matches you coached' },
    { value: 'update',         label: '📢 General Update',                 hint: 'Any other career update' },
  ],
  agent: [
    { value: 'upcoming_event', label: '📅 Upcoming Event / Showcase',      hint: 'Share upcoming player showcases, events or networking' },
    { value: 'certificate',    label: '🎓 Certificate / Licence Earned',   hint: 'FIFA Agent licence renewal, industry certifications' },
    { value: 'player_placed',  label: '✅ Player Placed / Transfer Done',   hint: 'Announce a successful player placement or transfer' },
    { value: 'update',         label: '📢 Agency Update',                  hint: 'Any other agency announcement' },
  ],
  academy: [
    { value: 'match_result',   label: '⚽ Match Result / Goals',           hint: 'Share match results, scorers and assists from your squad' },
    { value: 'upcoming_match', label: '📅 Upcoming Match / Tournament',    hint: 'Share upcoming fixtures, cup draws or tournaments' },
    { value: 'player_update',  label: '👤 Player Highlight',               hint: 'Highlight a player\'s goals, assists or performance' },
    { value: 'update',         label: '📢 Club Announcement',              hint: 'Any other club news or announcement' },
  ],
  sports_analyst: [
    { value: 'match_review',   label: '🎬 Match Analysis / Review',        hint: 'Share tactical analysis, data insights or match breakdowns' },
    { value: 'upcoming_event', label: '📅 Upcoming Course / Training',     hint: 'Share upcoming analysis courses, workshops or webinars' },
    { value: 'certificate',    label: '🎓 Certificate / Qualification',    hint: 'Wyscout, StatsBomb, UEFA or other analysis certifications' },
    { value: 'publication',    label: '📊 Report / Publication',           hint: 'Share a scouting report, data study or analysis article' },
    { value: 'update',         label: '📢 General Update',                 hint: 'Any other professional update' },
  ],
}

// Stats fields shown for match-related post types
const STATS_FIELDS = {
  player: [
    { key: 'goals',    label: 'Goals scored',      type: 'number', min: 0, max: 20 },
    { key: 'assists',  label: 'Assists',           type: 'number', min: 0, max: 20 },
    { key: 'rating',   label: 'Match rating (1-10)', type: 'number', min: 1, max: 10 },
    { key: 'minutes',  label: 'Minutes played',    type: 'number', min: 0, max: 120 },
    { key: 'opponent', label: 'Opponent',           type: 'text'   },
    { key: 'result',   label: 'Result (e.g. 3-1)', type: 'text'   },
  ],
  academy: [
    { key: 'goals',    label: 'Goals scored',      type: 'number', min: 0 },
    { key: 'result',   label: 'Final score',        type: 'text'   },
    { key: 'opponent', label: 'Opponent',           type: 'text'   },
    { key: 'scorers',  label: 'Goal scorers',       type: 'text'   },
    { key: 'assists',  label: 'Assists',           type: 'text'   },
  ],
}

export default function PostUpdateForm({ supabase, user, role, onSaved }) {
  const types = POST_TYPES[role] || POST_TYPES.player
  const [postType,   setPostType]   = useState(types[0].value)
  const [caption,    setCaption]    = useState('')
  const [stats,      setStats]      = useState({})
  const [files,      setFiles]      = useState([])
  const [posting,    setPosting]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState('')

  const selectedType = types.find((t) => t.value === postType)
  const showStats = ['match_result','upcoming_match','player_update'].includes(postType)
  const statsFields = STATS_FIELDS[role] || []

  const updStat = (k) => (e) => setStats((prev) => ({ ...prev, [k]: e.target.value }))

  const buildCaption = () => {
    // Auto-build caption from stats if caption is empty
    if (caption.trim()) return caption.trim()
    if (role === 'player' && postType === 'match_result') {
      const parts = []
      if (stats.result) parts.push(`Result: ${stats.result}`)
      if (stats.opponent) parts.push(`vs ${stats.opponent}`)
      if (stats.goals) parts.push(`${stats.goals} goal${stats.goals>1?'s':''}`)
      if (stats.assists) parts.push(`${stats.assists} assist${stats.assists>1?'s':''}`)
      if (stats.minutes) parts.push(`${stats.minutes} minutes played`)
      if (stats.rating) parts.push(`Rating: ${stats.rating}/10`)
      return parts.length > 0 ? parts.join(' · ') : ''
    }
    if (role === 'academy' && postType === 'match_result') {
      const parts = []
      if (stats.result) parts.push(`Score: ${stats.result}`)
      if (stats.opponent) parts.push(`vs ${stats.opponent}`)
      if (stats.scorers) parts.push(`Scorers: ${stats.scorers}`)
      if (stats.assists) parts.push(`Assists: ${stats.assists}`)
      return parts.length > 0 ? parts.join(' · ') : ''
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const finalCaption = buildCaption()
    if (!finalCaption) { setError('Please add a caption or fill in the details.'); return }
    const ci = blockContactInfo(finalCaption)
    if (ci) { setError(ci); return }

    setPosting(true); setError('')

    // Upload media files
    const mediaUrls = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const p = `feed/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('uploads').upload(p, file, { upsert: false })
      if (!ue && up) {
        const { data: pub } = supabase.storage.from('uploads').getPublicUrl(up.path)
        if (pub?.publicUrl) mediaUrls.push({ url: pub.publicUrl, type: file.type.startsWith('video') ? 'video' : 'image' })
      }
    }

    // Build post content with stats data embedded
    const contentParts = [finalCaption]
    if (postType === 'match_result' || postType === 'player_update') {
      const statLines = Object.entries(stats).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`)
      if (statLines.length > 0) contentParts.push('\n📊 ' + statLines.join(' · '))
    }
    const content = contentParts.join('\n').trim()

    const { error: err } = await supabase.from('feed_posts').insert({
      author_id:  user.id,
      sport:      'football',
      content,
      media_urls: mediaUrls,
      visibility: 'public',
      status:     'published',
    })

    setPosting(false)
    if (err) { setError(err.message); return }
    setDone(true)
    onSaved?.()
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-check-circle-fill text-success fs-2 d-block mb-3" />
        <h3 className="h5 fw-bold mb-2">Posted to Community Feed!</h3>
        <p className="text-muted mb-4">Your update is live and visible to your followers.</p>
        <button className="btn btn-primary btn-sm" type="button"
          onClick={() => { setDone(false); setCaption(''); setStats({}); setFiles([]); setPostType(types[0].value) }}>
          Post another update
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="d-grid gap-4">
      {/* Post type selector */}
      <div>
        <label className="form-label fw-semibold">What are you posting?</label>
        <div className="row g-2">
          {types.map((t) => (
            <div className="col-12 col-sm-6" key={t.value}>
              <label
                className={`d-flex align-items-start gap-3 p-3 rounded-3 cursor-pointer ${postType === t.value ? 'border border-primary bg-primary bg-opacity-10' : 'border'}`}
                style={{ cursor:'pointer', transition:'all .15s' }}
              >
                <input type="radio" name="post-type" value={t.value} checked={postType===t.value}
                  onChange={() => setPostType(t.value)} className="mt-1 flex-shrink-0" />
                <div>
                  <div className="fw-semibold small">{t.label}</div>
                  <div className="text-muted" style={{fontSize:11}}>{t.hint}</div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Stats fields for match-related posts */}
      {showStats && statsFields.length > 0 && (
        <div>
          <label className="form-label fw-semibold">Match details <span className="text-muted fw-normal">(optional — auto-fills caption)</span></label>
          <div className="row g-2">
            {statsFields.map((f) => (
              <div className="col-6 col-md-4" key={f.key}>
                <label className="form-label small mb-1">{f.label}</label>
                <input
                  className="form-control form-control-sm"
                  type={f.type}
                  min={f.min} max={f.max}
                  value={stats[f.key] ?? ''}
                  onChange={updStat(f.key)}
                  placeholder={f.type === 'number' ? '0' : ''}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caption */}
      <div>
        <label className="form-label fw-semibold" htmlFor="post-caption">
          Caption
          {showStats && statsFields.length > 0 && <span className="text-muted fw-normal ms-1">(auto-generated from stats above, or write your own)</span>}
        </label>
        <textarea
          id="post-caption"
          className="form-control"
          rows={4}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={selectedType?.hint || 'What do you want to share?'}
          maxLength={2000}
        />
        {blockContactInfo(caption) && (
          <div className="small text-danger mt-1">
            <i className="bi bi-exclamation-circle me-1" />Phone numbers and email addresses are not allowed in public posts.
          </div>
        )}
        <div className="form-text">{caption.length}/2000 — never include phone numbers or email addresses</div>
      </div>

      {/* Media upload */}
      <div>
        <label className="form-label fw-semibold" htmlFor="post-media">
          <i className="bi bi-images me-1" />Attach photos / video <span className="text-muted fw-normal">(optional)</span>
        </label>
        <input
          id="post-media"
          className="form-control"
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        {files.length > 0 && (
          <div className="small text-muted mt-1">{files.length} file(s) selected</div>
        )}
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="d-flex gap-3 align-items-center">
        <button className="btn btn-primary px-5" type="submit" disabled={posting}>
          {posting
            ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</>
            : <><i className="bi bi-send me-2" />Post to Community Feed</>}
        </button>
        <span className="small text-muted">
          <i className="bi bi-globe2 me-1" />Visible to all SportBridge members
        </span>
      </div>
    </form>
  )
}
