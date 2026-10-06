/**
 * PlayerProfile.jsx — The heart of the platform.
 * Full player profile: top card, 5 tabs, right sidebar.
 * Loaded when user clicks a player card from the directory.
 *
 * Props:
 *   playerId  — Supabase players.id UUID
 *   supabase  — Supabase client (may be null if not configured)
 *   user      — authenticated Supabase user or null
 *   onBack    — callback to return to directory
 *   onSignup  — callback to open signup modal
 */

import { useEffect, useRef, useState } from 'react'

// ─── helpers ──────────────────────────────────────────────────────────────────

function VerifiedBadge({ status, size = 'sm' }) {
  if (status === 'verified') {
    return (
      <span className={`badge text-bg-success d-inline-flex align-items-center gap-1 ${size === 'lg' ? 'px-3 py-2 fs-6' : 'px-2 py-1'}`}>
        <i className="bi bi-patch-check-fill" aria-hidden="true" />
        Verified Player
      </span>
    )
  }
  return (
    <span className={`badge text-bg-secondary d-inline-flex align-items-center gap-1 ${size === 'lg' ? 'px-3 py-2 fs-6' : 'px-2 py-1'}`}
      style={{ opacity: .7 }}>
      <i className="bi bi-patch-question" aria-hidden="true" />
      Unverified
    </span>
  )
}

function AvailabilityBadge({ availability }) {
  const map = {
    available_now:      { cls: 'text-bg-success',  label: 'Available Now',       icon: 'bi-circle-fill' },
    available_jan_2026: { cls: 'text-bg-warning',  label: 'Available Jan 2026',  icon: 'bi-clock' },
    available_jul_2026: { cls: 'text-bg-warning',  label: 'Available Jul 2026',  icon: 'bi-clock' },
    under_contract:     { cls: 'text-bg-danger',   label: 'Under Contract',      icon: 'bi-lock-fill' },
  }
  const v = map[availability] ?? { cls: 'text-bg-secondary', label: availability ?? 'Unknown', icon: 'bi-question' }
  return (
    <span className={`badge d-inline-flex align-items-center gap-1 px-2 py-1 ${v.cls}`}>
      <i className={`bi ${v.icon}`} style={{ fontSize: 9 }} aria-hidden="true" />
      {v.label}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 mb-4" aria-label="Loading profile…">
      {[80, 60, 100, 45, 70].map((w, i) => (
        <div key={i} className="rounded mb-3" style={{ height: i === 0 ? 24 : 14, width: `${w}%`, background: 'var(--bs-border-color)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

// Stat item for statistics tab
function StatRow({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
      <span className="small text-muted">{label}</span>
      <span className="fw-bold">{value}</span>
    </div>
  )
}

// Video player with watermark overlay + inline play
function VideoPlayer({ src, title, hash, watermark }) {
  const ref = useRef(null)
  return (
    <div className="position-relative rounded overflow-hidden mb-3" style={{ background: '#000', aspectRatio: '16/9' }}>
      <video
        ref={ref}
        src={src}
        controls
        playsInline
        preload="metadata"
        className="w-100 h-100"
        style={{ objectFit: 'contain' }}
        aria-label={title}
      />
      {/* Watermark overlay */}
      {watermark && (
        <div
          className="position-absolute bottom-0 end-0 px-2 py-1 small"
          style={{ background: 'rgba(0,0,0,.55)', color: 'rgba(255,255,255,.7)', fontSize: 10, pointerEvents: 'none', userSelect: 'none' }}
          aria-hidden="true"
        >
          SportBridge Verified · {watermark}
        </div>
      )}
      {hash && (
        <div className="mt-1 small text-muted font-monospace" style={{ fontSize: 10 }}>
          SHA-256: {hash.slice(0, 16)}…
        </div>
      )}
    </div>
  )
}

// Swipeable image gallery (mobile-first: touch swipe + dot indicators)
function ImageGallery({ images, playerName }) {
  const [idx, setIdx] = useState(0)
  const touchStart = useRef(null)

  if (!images?.length) return null

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setIdx((i) => (i + 1) % images.length)

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStart.current == null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev() }
    touchStart.current = null
  }

  return (
    <div className="position-relative rounded overflow-hidden mb-3" style={{ aspectRatio: '4/3', background: '#000' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <img
        src={images[idx]}
        alt={`${playerName} — photo ${idx + 1} of ${images.length}`}
        className="w-100 h-100"
        style={{ objectFit: 'cover', transition: 'opacity .2s' }}
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button
            type="button" className="btn btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
            style={{ background: 'rgba(0,0,0,.5)', color: '#fff', border: 0, borderRadius: 20, width: 36, height: 36 }}
            onClick={prev} aria-label="Previous photo">‹</button>
          <button
            type="button" className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
            style={{ background: 'rgba(0,0,0,.5)', color: '#fff', border: 0, borderRadius: 20, width: 36, height: 36 }}
            onClick={next} aria-label="Next photo">›</button>
          <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-1 pb-2">
            {images.map((_, i) => (
              <button key={i} type="button"
                style={{ width: i === idx ? 16 : 8, height: 8, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,.5)', border: 0, padding: 0, transition: 'width .2s' }}
                onClick={() => setIdx(i)} aria-label={`Photo ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PlayerProfile({ playerId, supabase, user, onBack, onSignup }) {
  const [player,      setPlayer]      = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [history,     setHistory]     = useState([])
  const [media,       setMedia]       = useState([])
  const [activeTab,   setActiveTab]   = useState('history')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [unlocked,    setUnlocked]    = useState(false)
  const [unlocking,   setUnlocking]   = useState(false)
  const [reported,    setReported]    = useState(false)
  const [reporting,   setReporting]   = useState(false)
  const [reportDone,  setReportDone]  = useState(false)

  useEffect(() => {
    if (!supabase || !playerId) { setLoading(false); return }
    let alive = true

    const load = async () => {
      const [{ data: p, error: pe }, { data: ph }, { data: m }] = await Promise.all([
        supabase.from('players')
          .select(`id, display_name, position, secondary_position, age, country, nationality,
                   bio, is_public, sport, gender, foot, preferred_foot, dominant_hand,
                   height_cm, weight_kg, current_club, achievements, achievements_data,
                   linkedin, views_count, availability, region, age_group, stats,
                   primary_photo_path, profile_id,
                   profiles!inner(id, full_name, email, verification_status)`)
          .eq('id', playerId)
          .single(),
        supabase.from('player_history')
          .select('*')
          .eq('player_id', playerId)
          .order('sort_order'),
        supabase.from('media_assets')
          .select('*')
          .eq('player_id', playerId)
          .order('sort_order'),
      ])

      if (!alive) return
      if (pe) { setError(pe.message); setLoading(false); return }

      setPlayer(p)
      setProfile(p.profiles)
      setHistory(ph ?? [])
      setMedia(m ?? [])

      // Check if current user has unlocked contact
      if (user && supabase) {
        const { data: uc } = await supabase.from('contact_unlocks')
          .select('id').eq('unlocker_id', user.id).eq('player_id', playerId).maybeSingle()
        if (alive) setUnlocked(Boolean(uc))
      }

      // Increment view count (fire-and-forget, no await needed)
      supabase.from('players').update({ views_count: (p.views_count ?? 0) + 1 }).eq('id', playerId)

      setLoading(false)
    }

    load()
    return () => { alive = false }
  }, [supabase, playerId, user])

  const handleUnlock = async () => {
    if (!user) { onSignup?.('player'); return }
    setUnlocking(true)
    // In production: integrate payment. For demo, free unlock for verified users.
    const { error: ue } = await supabase.from('contact_unlocks').insert({ unlocker_id: user.id, player_id: playerId })
    setUnlocking(false)
    if (!ue) setUnlocked(true)
  }

  const handleReport = async () => {
    if (!user) { onSignup?.(); return }
    setReporting(true)
    await supabase.from('reports').insert({
      reporter_id:      user.id,
      reported_user_id: player.profile_id,
      reason:           'fake_profile',
      details:          'Reported via player profile page.',
    })
    setReporting(false)
    setReported(true)
    setTimeout(() => setReportDone(true), 100)
  }

  if (loading) return (
    <div className="container py-5">
      <button className="btn btn-link ps-0 mb-4" onClick={onBack} type="button">
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>
      <SkeletonCard /><SkeletonCard />
    </div>
  )

  if (error || !player) return (
    <div className="container py-5">
      <div className="alert alert-danger">{error || 'Player not found.'}</div>
      <button className="btn btn-outline-primary" onClick={onBack} type="button">Back</button>
    </div>
  )

  const stats      = player.stats ?? {}
  const achList    = player.achievements_data ?? []
  const photoUrls  = media.filter((m) => m.asset_type === 'image').map((m) => m.storage_path || m.external_url).filter(Boolean)
  const videos     = media.filter((m) => m.asset_type === 'video' || m.asset_type === 'youtube')
  const cvAsset    = media.find((m) => m.asset_type === 'document')
  const vsStatus   = profile?.verification_status ?? 'unverified'
  const fullName   = player.display_name || profile?.full_name || 'Player'
  const foot       = player.preferred_foot || player.foot

  const TABS = [
    { id: 'history',      icon: 'bi-clock-history',    label: 'Playing History' },
    { id: 'stats',        icon: 'bi-bar-chart-fill',   label: 'Statistics' },
    { id: 'videos',       icon: 'bi-play-circle-fill', label: 'Videos' },
    { id: 'achievements', icon: 'bi-trophy-fill',      label: 'Achievements' },
    { id: 'documents',    icon: 'bi-file-earmark-pdf', label: 'Documents' },
  ]

  return (
    <div className="container py-4">
      {/* Back */}
      <button className="btn btn-link ps-0 mb-3 text-muted" onClick={onBack} type="button">
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4 align-items-start">
        {/* ── Main column ────────────────────────────────────────────────── */}
        <div className="col-12 col-lg-8">

          {/* ── Top card ─────────────────────────────────────────────────── */}
          <div className="card p-4 mb-4">
            <div className="d-flex flex-wrap gap-4 align-items-start">
              {/* Photo */}
              <div className="flex-shrink-0">
                {player.primary_photo_path
                  ? <img src={player.primary_photo_path} alt={fullName} className="rounded"
                      style={{ width: 100, height: 100, objectFit: 'cover' }} loading="lazy" />
                  : <div className="rounded d-flex align-items-center justify-content-center"
                      style={{ width: 100, height: 100, background: 'var(--fc-gradient-primary)' }}>
                      <i className="bi bi-person-fill" style={{ fontSize: 40, color: '#fff' }} aria-hidden="true" />
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h1 className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>{fullName}</h1>
                  <VerifiedBadge status={vsStatus} size="sm" />
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <AvailabilityBadge availability={player.availability} />
                </div>

                {/* Key attributes grid */}
                <div className="row g-2 small">
                  {[
                    { icon: 'bi-person-arms-up',  label: 'Position',    value: player.position },
                    { icon: 'bi-star',            label: '2nd Position', value: player.secondary_position },
                    { icon: 'bi-activity',        label: 'Preferred Foot', value: foot ? foot.charAt(0).toUpperCase() + foot.slice(1) : null },
                    { icon: 'bi-calendar3',       label: 'Age',         value: player.age ? `${player.age} yrs` : null },
                    { icon: 'bi-globe2',          label: 'Nationality', value: player.nationality || player.country },
                    { icon: 'bi-geo-alt-fill',    label: 'Region',      value: player.region },
                    { icon: 'bi-rulers',          label: 'Height',      value: player.height_cm ? `${player.height_cm} cm` : null },
                    { icon: 'bi-lightning-fill',  label: 'Weight',      value: player.weight_kg ? `${player.weight_kg} kg` : null },
                    { icon: 'bi-building',        label: 'Current club',value: player.current_club },
                  ].filter((r) => r.value).map(({ icon, label, value }) => (
                    <div key={label} className="col-6 col-md-4 d-flex align-items-center gap-1">
                      <i className={`bi ${icon} text-primary flex-shrink-0`} aria-hidden="true" style={{ fontSize: 13 }} />
                      <span className="text-muted me-1">{label}:</span>
                      <span className="fw-semibold text-truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {player.bio && (
                  <p className="mt-3 mb-0 small" style={{ color: 'var(--fc-muted)', maxWidth: '60ch' }}>
                    {player.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <ul className="nav nav-tabs mb-4" role="tablist" aria-label="Player profile sections" style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none' }}>
            {TABS.map((tab) => (
              <li className="nav-item flex-shrink-0" key={tab.id} role="presentation">
                <button
                  className={`nav-link d-flex align-items-center gap-2${activeTab === tab.id ? ' active' : ''}`}
                  type="button" role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <i className={`bi ${tab.icon}`} aria-hidden="true" />{tab.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab 1: Playing History */}
          {activeTab === 'history' && (
            <div>
              {history.length === 0
                ? <p className="text-muted">No club history added yet.</p>
                : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Club</th>
                          <th>Season</th>
                          <th className="text-center">Apps</th>
                          <th className="text-center">Goals</th>
                          <th className="text-center">Assists</th>
                          <th className="text-center">Clean Sheets</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id}>
                            <td className="fw-semibold">{h.club_name}</td>
                            <td className="text-muted small">
                              {h.season_from}{h.season_to ? ` – ${h.season_to}` : ''}
                            </td>
                            <td className="text-center">{h.appearances}</td>
                            <td className="text-center">{h.goals}</td>
                            <td className="text-center">{h.assists}</td>
                            <td className="text-center">{h.clean_sheets}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}

          {/* Tab 2: Statistics */}
          {activeTab === 'stats' && (
            <div className="card p-4">
              <StatRow label="Height"           value={player.height_cm ? `${player.height_cm} cm` : null} />
              <StatRow label="Weight"           value={player.weight_kg ? `${player.weight_kg} kg` : null} />
              <StatRow label="Preferred Foot"   value={foot ? foot.charAt(0).toUpperCase() + foot.slice(1) : null} />
              <StatRow label="Age Group"        value={player.age_group} />
              <StatRow label="Total Appearances" value={stats.total_appearances} />
              <StatRow label="Total Goals"      value={stats.total_goals} />
              <StatRow label="Total Assists"    value={stats.total_assists} />
              <StatRow label="Clean Sheets"     value={stats.total_clean_sheets} />
              <StatRow label="Pass Accuracy"    value={stats.pass_accuracy ? `${stats.pass_accuracy}%` : null} />
              <StatRow label="Dribble Success"  value={stats.dribble_success ? `${stats.dribble_success}%` : null} />
              <StatRow label="Minutes Played"   value={stats.minutes_played} />
              {Object.keys(stats).length === 0 && <p className="text-muted mb-0">No statistics recorded yet.</p>}
            </div>
          )}

          {/* Tab 3: Videos */}
          {activeTab === 'videos' && (
            <div>
              {/* Video sub-tabs */}
              {['highlights', 'full_match', 'training'].map((vtype) => {
                const vtLabel = { highlights: '90 sec Highlights', full_match: 'Full Match (5 min uncut)', training: 'Training Clip' }[vtype]
                const vtVids  = videos.filter((v) => (v.title ?? '').toLowerCase().includes(vtype.replace('_', ' ')) || v.asset_type === vtype)
                const allVids = videos // fallback: show all if no sub-type match
                const list    = vtVids.length ? vtVids : (vtype === 'highlights' ? allVids : [])
                return (
                  <div key={vtype} className="mb-4">
                    <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-play-circle text-primary" aria-hidden="true" />{vtLabel}
                      {vtype === 'full_match' && (
                        <span className="badge text-bg-primary ms-1" style={{ fontSize: 10 }}>Required for Verification</span>
                      )}
                    </h3>
                    {list.length === 0
                      ? <p className="text-muted small">No {vtLabel.toLowerCase()} uploaded yet.</p>
                      : list.map((v) => (
                        <VideoPlayer
                          key={v.id}
                          src={v.storage_path || v.external_url}
                          title={v.title || vtLabel}
                          hash={v.file_hash}
                          watermark={v.created_at ? new Date(v.created_at).toLocaleDateString() : null}
                        />
                      ))}
                  </div>
                )
              })}
              {videos.length === 0 && <p className="text-muted">No videos uploaded yet.</p>}
            </div>
          )}

          {/* Tab 4: Achievements */}
          {activeTab === 'achievements' && (
            <div>
              {/* Structured achievements */}
              {achList.length > 0 && (
                <ul className="list-group list-group-flush mb-4">
                  {achList.map((a, i) => (
                    <li key={i} className="list-group-item d-flex align-items-center gap-3 px-0">
                      <i className="bi bi-trophy-fill text-warning flex-shrink-0" aria-hidden="true" />
                      <div>
                        <div className="fw-semibold">{a.title}</div>
                        {a.year && <div className="small text-muted">{a.year}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {/* Free-text achievements */}
              {player.achievements && (
                <div className="card p-4" style={{ whiteSpace: 'pre-wrap' }}>
                  <p className="mb-0">{player.achievements}</p>
                </div>
              )}
              {!achList.length && !player.achievements && (
                <p className="text-muted">No achievements listed yet.</p>
              )}
            </div>
          )}

          {/* Tab 5: Documents (CV) */}
          {activeTab === 'documents' && (
            <div className="card p-4">
              <h3 className="h5 fw-bold mb-3">CV / Resume</h3>
              {!user ? (
                <div className="alert alert-info d-flex gap-3 align-items-start">
                  <i className="bi bi-lock-fill flex-shrink-0 mt-1 text-primary" aria-hidden="true" />
                  <div>
                    <div className="fw-semibold">Login required to view documents</div>
                    <div className="small text-muted">Create a free account to access player CVs.</div>
                    <button className="btn btn-sm btn-primary mt-2" type="button" onClick={() => onSignup?.()}>
                      Create account
                    </button>
                  </div>
                </div>
              ) : !unlocked ? (
                <div className="alert alert-warning d-flex gap-3 align-items-start">
                  <i className="bi bi-lock-fill flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <div className="fw-semibold">Contact unlock required</div>
                    <div className="small text-muted">Unlock this profile to download the full CV.</div>
                    <button className="btn btn-sm btn-warning mt-2" type="button" onClick={handleUnlock} disabled={unlocking}>
                      {unlocking ? 'Unlocking…' : 'Unlock Profile (Free for Demo)'}
                    </button>
                  </div>
                </div>
              ) : cvAsset ? (
                <a
                  href={cvAsset.storage_path || cvAsset.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary d-inline-flex align-items-center gap-2"
                  download
                >
                  <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                  Download CV (PDF)
                </a>
              ) : (
                <p className="text-muted">CV not uploaded yet.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ──────────────────────────────────────────────── */}
        <div className="col-12 col-lg-4">

          {/* Photo grid (max 5) */}
          {photoUrls.length > 0 && (
            <div className="card p-3 mb-3">
              <h3 className="h6 fw-bold mb-3">Photos</h3>
              <ImageGallery images={photoUrls} playerName={fullName} />
              {photoUrls.length > 1 && (
                <div
                  className="row g-1 mt-1"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}
                >
                  {photoUrls.slice(0, 5).map((url, i) => (
                    <img key={i} src={url} alt="" loading="lazy" className="rounded"
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', cursor: 'pointer' }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Unlock */}
          <div className="card p-4 mb-3">
            <h3 className="h6 fw-bold mb-2">Contact player</h3>
            {!user ? (
              <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2" type="button" onClick={() => onSignup?.()}>
                <i className="bi bi-lock-fill" aria-hidden="true" />
                Login to contact
              </button>
            ) : unlocked ? (
              <div>
                <div className="alert alert-success py-2 mb-2 small d-flex gap-2 align-items-center">
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  Contact unlocked — send a message via inbox.
                </div>
                <button className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2" type="button">
                  <i className="bi bi-chat-dots-fill" aria-hidden="true" />
                  Send Message
                </button>
              </div>
            ) : (
              <div>
                <p className="small text-muted mb-3">
                  Phone numbers and emails are never shown publicly.
                  Unlock to access full contact via secure inbox.
                </p>
                <button
                  className="btn btn-warning w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  type="button" onClick={handleUnlock} disabled={unlocking}
                >
                  <i className="bi bi-unlock-fill" aria-hidden="true" />
                  {unlocking ? 'Unlocking…' : 'Unlock Profile (Free for Demo)'}
                </button>
              </div>
            )}
          </div>

          {/* Apply with Verified Profile (sticky on mobile via CSS) */}
          <div className="card p-4 mb-3 d-none d-lg-block">
            <h3 className="h6 fw-bold mb-2">Are you a club or agent?</h3>
            <p className="small text-muted mb-3">Apply with your verified SportBridge profile — no CV email needed.</p>
            <button
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              type="button"
              onClick={() => user ? null : onSignup?.('academy')}
            >
              <i className="bi bi-send-check-fill" aria-hidden="true" />
              Apply with My Verified Profile
            </button>
          </div>

          {/* Report Fake Profile */}
          <div className="card p-3 mb-3">
            {reportDone
              ? <div className="small text-success d-flex gap-2"><i className="bi bi-check-circle-fill" />Report submitted. Our team will review within 24 hours.</div>
              : reported
                ? <div className="small text-muted d-flex gap-2"><span className="spinner-border spinner-border-sm" />Submitting…</div>
                : (
                  <button
                    className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                    type="button" onClick={handleReport} disabled={reporting}
                  >
                    <i className="bi bi-flag-fill" aria-hidden="true" />
                    Report Fake Profile
                  </button>
                )}
          </div>

          {/* Verification status card */}
          <div className="card p-3">
            <h3 className="h6 fw-bold mb-2">Verification</h3>
            <VerifiedBadge status={vsStatus} size="sm" />
            {vsStatus !== 'verified' && (
              <p className="small text-muted mt-2 mb-0">
                This profile has not completed NIN + face + history verification.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ─────────────────────────────────────── */}
      <div
        className="d-lg-none position-fixed bottom-0 start-0 end-0 p-3 d-flex gap-2"
        style={{ background: 'var(--bs-body-bg)', borderTop: '1px solid var(--bs-border-color)', zIndex: 1040 }}
        role="toolbar" aria-label="Player actions"
      >
        <button
          className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2 fw-bold"
          type="button"
          onClick={() => user ? null : onSignup?.('academy')}
        >
          <i className="bi bi-send-check-fill" aria-hidden="true" />
          Apply with My Verified Profile
        </button>
        {!unlocked && (
          <button
            className="btn btn-warning d-flex align-items-center justify-content-center gap-2"
            type="button" onClick={handleUnlock} disabled={unlocking}
            style={{ minWidth: 44 }}
          >
            <i className="bi bi-unlock-fill" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="d-lg-none" style={{ height: 80 }} aria-hidden="true" />
    </div>
  )
}
