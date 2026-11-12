/**
 * PlayerProfile.jsx — Full player profile: 6 tabs, right sidebar.
 * Upgraded with Overview tab, Career Timeline, Stats bars, Profile completeness.
 */

import { useEffect, useRef, useState } from 'react'
import ReportProfileButton from './ReportProfileButton.jsx'
import VerifiedBadge from './VerifiedBadge.jsx'

// ─── helpers ──────────────────────────────────────────────────────────────────

function AvailabilityBadge({ availability }) {
  const map = {
    available_now:      { cls: 'text-bg-success',   label: 'Available Now',       icon: 'bi-circle-fill' },
    available_jan_2026: { cls: 'text-bg-warning',   label: 'Available Jan 2026',  icon: 'bi-clock' },
    available_jul_2026: { cls: 'text-bg-warning',   label: 'Available Jul 2026',  icon: 'bi-clock' },
    under_contract:     { cls: 'text-bg-danger',    label: 'Under Contract',      icon: 'bi-lock-fill' },
    free_agent:         { cls: 'text-bg-info',      label: 'Free Agent',          icon: 'bi-circle' },
    on_loan:            { cls: 'text-bg-secondary', label: 'On Loan',             icon: 'bi-arrow-left-right' },
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
        <div key={i} className="rounded mb-3"
          style={{ height: i === 0 ? 24 : 14, width: `${w}%`, background: 'var(--bs-border-color)' }} />
      ))}
    </div>
  )
}

function StatRow({ label, value, bar, barMax }) {
  if (value == null || value === '') return null
  return (
    <div className="py-2" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="small text-muted">{label}</span>
        <span className="fw-bold small">{value}</span>
      </div>
      {bar != null && barMax > 0 && (
        <div className="progress" style={{ height: 5, borderRadius: 3 }}>
          <div className="progress-bar"
            style={{ width: `${Math.min(100, (bar / barMax) * 100)}%`, background: 'var(--fc-blue-500)' }} />
        </div>
      )}
    </div>
  )
}

function VideoPlayer({ src, title, hash, watermark }) {
  const ref = useRef(null)
  return (
    <div className="position-relative rounded overflow-hidden mb-3"
      style={{ background: '#000', aspectRatio: '16/9' }}>
      <video ref={ref} src={src} controls playsInline preload="metadata"
        className="w-100 h-100" style={{ objectFit: 'contain' }} aria-label={title} />
      {watermark && (
        <div className="position-absolute bottom-0 end-0 px-2 py-1 small"
          style={{ background: 'rgba(0,0,0,.55)', color: 'rgba(255,255,255,.7)', fontSize: 10, pointerEvents: 'none', userSelect: 'none' }}>
          SportBridge Verified · {watermark}
        </div>
      )}
      {hash && (
        <div className="small text-muted mt-1" style={{ fontFamily: 'monospace', fontSize: 10 }}>
          SHA-256: {hash.slice(0, 16)}…
        </div>
      )}
    </div>
  )
}

function ImageGallery({ images, playerName }) {
  const [idx, setIdx] = useState(0)
  const touchStart = useRef(null)
  if (!images?.length) return null
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setIdx((i) => (i + 1) % images.length)
  return (
    <div className="position-relative rounded overflow-hidden mb-3"
      style={{ aspectRatio: '4/3', background: '#000' }}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return
        const diff = touchStart.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 40) { if (diff > 0) next(); else prev() }
        touchStart.current = null
      }}>
      <img src={images[idx]} alt={`${playerName} — photo ${idx + 1}`}
        className="w-100 h-100" style={{ objectFit: 'cover' }} loading="lazy" />
      {images.length > 1 && (
        <>
          <button type="button" onClick={prev} aria-label="Previous photo"
            className="btn btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
            style={{ background: 'rgba(0,0,0,.5)', color: '#fff', border: 0, borderRadius: 20, width: 36, height: 36 }}>‹</button>
          <button type="button" onClick={next} aria-label="Next photo"
            className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
            style={{ background: 'rgba(0,0,0,.5)', color: '#fff', border: 0, borderRadius: 20, width: 36, height: 36 }}>›</button>
          <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-1 pb-2">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`Photo ${i + 1}`}
                style={{ width: i === idx ? 16 : 8, height: 8, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,.5)', border: 0, padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function QuickStat({ icon, value, label, colour = 'var(--fc-blue-500)' }) {
  if (value == null) return null
  return (
    <div className="text-center p-3 rounded" style={{ background: colour + '14', border: `1px solid ${colour}33` }}>
      <i className={`bi ${icon} d-block mb-1`} style={{ color: colour, fontSize: 20 }} />
      <div style={{ fontSize: 22, fontWeight: 800, color: colour, lineHeight: 1 }}>{value}</div>
      <div className="small text-muted mt-1" style={{ fontSize: 11 }}>{label}</div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlayerProfile({ playerId, supabase, user, onBack, onSignup }) {
  const [player,         setPlayer]         = useState(null)
  const [profile,        setProfile]        = useState(null)
  const [history,        setHistory]        = useState([])
  const [media,          setMedia]          = useState([])
  const [activeTab,      setActiveTab]      = useState('overview')
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [unlocked,       setUnlocked]       = useState(false)
  const [unlocking,      setUnlocking]      = useState(false)
  const [viewerVerified, setViewerVerified] = useState(false)
  const [unlockError,    setUnlockError]    = useState('')

  useEffect(() => {
    if (!supabase || !playerId) { setLoading(false); return }
    let alive = true

    const FIELDS = `id, display_name, position, secondary_position, age, country, nationality,
      bio, is_public, sport, gender, foot, preferred_foot, dominant_hand,
      height_cm, weight_kg, current_club, achievements, achievements_data,
      linkedin, views_count, availability, region, age_group, stats,
      primary_photo_path, profile_id,
      facebook_url, instagram_url, twitter_url, youtube_url, tiktok_url, website_url`

    const load = async () => {
      let { data: p, error: pe } = await supabase.from('players').select(FIELDS).eq('id', playerId).maybeSingle()
      if (!p && !pe) {
        const r = await supabase.from('players').select(FIELDS).eq('profile_id', playerId).maybeSingle()
        p = r.data; pe = r.error
      }
      if (!alive) return
      if (pe) { setError(pe.message); setLoading(false); return }
      if (!p)  { setError('Player profile not found.'); setLoading(false); return }

      const [{ data: ph }, { data: m }, { data: pb }] = await Promise.all([
        supabase.from('player_history').select('*').eq('player_id', p.id).order('sort_order'),
        supabase.from('media_assets').select('*').eq('player_id', p.id).order('sort_order'),
        p.profile_id
          ? supabase.from('profiles').select('role,verification_status,verification_badge,avatar_path').eq('id', p.profile_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ])
      if (!alive) return
      setPlayer(p); setProfile(pb ?? null); setHistory(ph ?? []); setMedia(m ?? [])

      if (user) {
        const [{ data: uc }, { data: vp }] = await Promise.all([
          supabase.from('contact_unlocks').select('id').eq('unlocker_id', user.id).eq('player_id', p.id).maybeSingle(),
          supabase.from('profiles').select('verification_status').eq('id', user.id).maybeSingle(),
        ])
        if (alive) {
          setUnlocked(Boolean(uc))
          setViewerVerified(vp?.verification_status === 'verified')
        }
      }
      // Only increment view count when someone else views the profile
      if (!user || user.id !== p.profile_id) {
        supabase.from('players').update({ views_count: (p.views_count ?? 0) + 1 }).eq('id', p.id)
      }
      setLoading(false)
    }
    load()
    return () => { alive = false }
  }, [supabase, playerId, user])

  const handleUnlock = async () => {
    if (!user) { onSignup?.('player'); return }
    if (!supabase) { setUnlockError('Database not configured.'); return }
    if (player?.profile_id === user.id) { setUnlockError('You cannot unlock your own profile.'); return }
    if (!viewerVerified) { setUnlockError('Complete identity verification before requesting contact access.'); return }
    setUnlocking(true); setUnlockError('')
    try {
      const { error: ue } = await supabase.from('contact_unlocks').upsert(
        { unlocker_id: user.id, player_id: player.id },
        { onConflict: 'unlocker_id,player_id', ignoreDuplicates: true },
      )
      if (ue) { setUnlockError(`Unlock failed: ${ue.message}`); return }
      setUnlocked(true)
    } catch (e) { setUnlockError(e.message || 'Unexpected error.') }
    finally { setUnlocking(false) }
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

  const stats     = player.stats ?? {}
  const achList   = player.achievements_data ?? []
  const photoUrls = media.filter((m) => m.asset_type === 'image').map((m) => m.storage_path || m.external_url).filter(Boolean)
  const videos    = media.filter((m) => m.asset_type === 'video' || m.asset_type === 'youtube')
  const cvAsset   = media.find((m) => m.asset_type === 'document')
  const vsStatus  = profile?.verification_status ?? 'unverified'
  const fullName  = player.display_name || 'Player'
  const foot      = player.preferred_foot || player.foot

  const completeFields = [
    player.position, player.age, player.nationality, player.height_cm,
    player.weight_kg, player.bio, player.current_club, player.availability,
    player.achievements, videos.length > 0, history.length > 0, player.primary_photo_path,
  ]
  const completePct = Math.round((completeFields.filter(Boolean).length / completeFields.length) * 100)

  const TABS = [
    { id: 'overview',     icon: 'bi-person-lines-fill', label: 'Overview' },
    { id: 'history',      icon: 'bi-clock-history',     label: 'Career' },
    { id: 'stats',        icon: 'bi-bar-chart-fill',    label: 'Statistics' },
    { id: 'videos',       icon: 'bi-play-circle-fill',  label: 'Videos' },
    { id: 'achievements', icon: 'bi-trophy-fill',       label: 'Achievements' },
    { id: 'documents',    icon: 'bi-file-earmark-pdf',  label: 'Documents' },
  ]

  return (
    <div className="container py-4">
      <button className="btn btn-link ps-0 mb-3 text-muted" onClick={onBack} type="button">
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4 align-items-start">
        {/* ── Main column ── */}
        <div className="col-12 col-lg-8">

          {/* Top card */}
          <div className="card p-4 mb-4">
            <div className="d-flex flex-wrap gap-4 align-items-start">
              <div className="flex-shrink-0">
                {(player.primary_photo_path || profile?.avatar_path)
                  ? <img src={player.primary_photo_path || profile?.avatar_path} alt={fullName} className="rounded"
                      style={{ width: 100, height: 100, objectFit: 'cover' }} loading="lazy" />
                  : <div className="rounded d-flex align-items-center justify-content-center"
                      style={{ width: 100, height: 100, background: 'var(--fc-gradient-primary)' }}>
                      <i className="bi bi-person-fill" style={{ fontSize: 40, color: '#fff' }} />
                    </div>}
              </div>

              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h1 className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>{fullName}</h1>
                  <VerifiedBadge status={vsStatus} role={profile?.role} label={profile?.verification_badge} className="px-2 py-1" />
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <AvailabilityBadge availability={player.availability} />
                  {player.age_group && <span className="badge text-bg-light border"><i className="bi bi-people-fill me-1" style={{ fontSize: 10 }} />{player.age_group}</span>}
                  {player.sport    && <span className="badge text-bg-light border"><i className="bi bi-dribbble me-1" style={{ fontSize: 10 }} />{player.sport}</span>}
                </div>

                <div className="row g-2 small">
                  {[
                    { icon: 'bi-person-arms-up', label: 'Position',       value: player.position },
                    { icon: 'bi-star',           label: '2nd Position',   value: player.secondary_position },
                    { icon: 'bi-activity',       label: 'Preferred Foot', value: foot ? foot.charAt(0).toUpperCase() + foot.slice(1) : null },
                    { icon: 'bi-calendar3',      label: 'Age',            value: player.age ? `${player.age} yrs` : null },
                    { icon: 'bi-globe2',         label: 'Nationality',    value: player.nationality || player.country },
                    { icon: 'bi-geo-alt-fill',   label: 'Region',         value: player.region },
                    { icon: 'bi-rulers',         label: 'Height',         value: player.height_cm ? `${player.height_cm} cm` : null },
                    { icon: 'bi-lightning-fill', label: 'Weight',         value: player.weight_kg ? `${player.weight_kg} kg` : null },
                    { icon: 'bi-building',       label: 'Current club',   value: player.current_club },
                  ].filter((r) => r.value).map(({ icon, label, value }) => (
                    <div key={label} className="col-6 col-md-4 d-flex align-items-center gap-1">
                      <i className={`bi ${icon} text-primary flex-shrink-0`} style={{ fontSize: 13 }} />
                      <span className="text-muted me-1">{label}:</span>
                      <span className="fw-semibold text-truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {player.bio && (
                  <p className="mt-3 mb-0 small" style={{ color: 'var(--fc-muted)', maxWidth: '60ch' }}>{player.bio}</p>
                )}
              </div>
            </div>

            {(stats.total_appearances || stats.total_goals || stats.total_assists || stats.total_clean_sheets) && (
              <div className="row g-2 mt-4">
                <div className="col-6 col-sm-3"><QuickStat icon="bi-calendar-check" value={stats.total_appearances} label="Appearances" colour="#2F7DF0" /></div>
                <div className="col-6 col-sm-3"><QuickStat icon="bi-dribbble" value={stats.total_goals} label="Goals" colour="#198754" /></div>
                <div className="col-6 col-sm-3"><QuickStat icon="bi-arrow-up-right" value={stats.total_assists} label="Assists" colour="#F5B301" /></div>
                <div className="col-6 col-sm-3"><QuickStat icon="bi-shield-fill-check" value={stats.total_clean_sheets ?? stats.clean_sheets} label="Clean Sheets" colour="#6f42c1" /></div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4" role="tablist"
            style={{ overflowX: 'auto', flexWrap: 'nowrap', scrollbarWidth: 'none' }}>
            {TABS.map((tab) => (
              <li className="nav-item flex-shrink-0" key={tab.id}>
                <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab.id ? ' active' : ''}`}
                  type="button" role="tab" aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)} style={{ whiteSpace: 'nowrap' }}>
                  <i className={`bi ${tab.icon}`} aria-hidden="true" />{tab.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="d-grid gap-4">
              {player.bio && (
                <div className="card p-4">
                  <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                    <i className="bi bi-person-lines-fill me-2 text-primary" />About
                  </h2>
                  <p className="mb-0" style={{ lineHeight: 1.8, color: 'var(--fc-muted)' }}>{player.bio}</p>
                </div>
              )}

              <div className="card p-4">
                <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-rulers me-2 text-primary" />Physical &amp; Technical Profile
                </h2>
                <div className="row g-3">
                  {[
                    { label: 'Height',         value: player.height_cm  ? `${player.height_cm} cm`  : null, icon: 'bi-arrows-vertical' },
                    { label: 'Weight',         value: player.weight_kg  ? `${player.weight_kg} kg`  : null, icon: 'bi-lightning-fill' },
                    { label: 'Preferred Foot', value: foot ? foot.charAt(0).toUpperCase() + foot.slice(1) : null, icon: 'bi-activity' },
                    { label: 'Age Group',      value: player.age_group, icon: 'bi-people-fill' },
                    { label: 'Gender',         value: player.gender,    icon: 'bi-gender-ambiguous' },
                  ].filter((r) => r.value).map(({ label, value, icon }) => (
                    <div key={label} className="col-6 col-md-4">
                      <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                        <i className={`bi ${icon} text-primary flex-shrink-0`} style={{ fontSize: 16 }} />
                        <div>
                          <div className="small text-muted" style={{ fontSize: 11 }}>{label}</div>
                          <div className="fw-semibold small">{value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4">
                <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-file-earmark-text me-2 text-primary" />Contract &amp; Availability
                </h2>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                      <div className="small text-muted mb-1">Availability Status</div>
                      <AvailabilityBadge availability={player.availability} />
                    </div>
                  </div>
                  {player.current_club && (
                    <div className="col-12 col-sm-6">
                      <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                        <div className="small text-muted mb-1">Current Club</div>
                        <div className="fw-semibold d-flex align-items-center gap-2">
                          <i className="bi bi-building text-primary" />{player.current_club}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {player.achievements && (
                <div className="card p-4">
                  <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                    <i className="bi bi-trophy-fill me-2 text-warning" />Key Achievements
                  </h2>
                  <p className="mb-0 small" style={{ lineHeight: 1.8, color: 'var(--fc-muted)', whiteSpace: 'pre-line' }}>
                    {player.achievements}
                  </p>
                </div>
              )}

              {player.linkedin && (
                <div className="card p-4">
                  <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                    <i className="bi bi-linkedin me-2 text-primary" />Professional Profile
                  </h2>
                  <a href={player.linkedin} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2">
                    <i className="bi bi-box-arrow-up-right" />View LinkedIn Profile
                  </a>
                </div>
              )}

              {/* Social media links */}
              {[
                { key: 'website_url',   label: 'Website',    icon: 'bi-globe2',    colour: '#2F7DF0', url: player.website_url },
                { key: 'facebook_url',  label: 'Facebook',   icon: 'bi-facebook',  colour: '#1877F2', url: player.facebook_url },
                { key: 'instagram_url', label: 'Instagram',  icon: 'bi-instagram', colour: '#E4405F', url: player.instagram_url },
                { key: 'twitter_url',   label: 'X / Twitter',icon: 'bi-twitter-x', colour: '#000',    url: player.twitter_url },
                { key: 'youtube_url',   label: 'YouTube',    icon: 'bi-youtube',   colour: '#FF0000', url: player.youtube_url },
                { key: 'tiktok_url',    label: 'TikTok',     icon: 'bi-tiktok',    colour: '#000',    url: player.tiktok_url },
              ].filter(s => s.url).length > 0 && (
                <div className="card p-4">
                  <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                    <i className="bi bi-share-fill me-2 text-primary" />Social Media &amp; Links
                  </h2>
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      { label: 'Website',    icon: 'bi-globe2',    colour: '#2F7DF0', url: player.website_url },
                      { label: 'Facebook',   icon: 'bi-facebook',  colour: '#1877F2', url: player.facebook_url },
                      { label: 'Instagram',  icon: 'bi-instagram', colour: '#E4405F', url: player.instagram_url },
                      { label: 'X / Twitter',icon: 'bi-twitter-x', colour: '#000',    url: player.twitter_url },
                      { label: 'YouTube',    icon: 'bi-youtube',   colour: '#FF0000', url: player.youtube_url },
                      { label: 'TikTok',     icon: 'bi-tiktok',    colour: '#010101', url: player.tiktok_url },
                    ].filter(s => s.url).map(({ label, icon, colour, url }) => (
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm d-inline-flex align-items-center gap-2 fw-semibold"
                        style={{ background: colour + '14', color: colour, border: `1px solid ${colour}44` }}>
                        <i className={`bi ${icon}`} />{label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Career */}
          {activeTab === 'history' && (
            <div>
              {history.length === 0 ? (
                <div className="card p-5 text-center text-muted">
                  <i className="bi bi-clock-history fs-1 d-block mb-3" style={{ opacity: 0.3 }} />
                  <p className="fw-semibold mb-1">No club history added yet</p>
                </div>
              ) : (
                <>
                  <div className="card p-4 mb-4">
                    <h2 className="h6 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>
                      <i className="bi bi-diagram-3 me-2 text-primary" />Career Timeline
                    </h2>
                    {history.map((h, idx) => (
                      <div key={h.id} className="d-flex gap-3 mb-4 position-relative">
                        {idx < history.length - 1 && (
                          <div className="position-absolute"
                            style={{ left: 17, top: 36, bottom: -16, width: 2, background: 'var(--bs-border-color)' }} />
                        )}
                        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{ width: 36, height: 36, background: 'var(--fc-blue-500)', color: '#fff', fontSize: 16, zIndex: 1 }}>
                          <i className="bi bi-building" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                            <div>
                              <div className="fw-bold" style={{ color: 'var(--fc-blue-700)' }}>{h.club_name}</div>
                              <div className="small text-muted">
                                {h.season_from}{h.season_to ? ` – ${h.season_to}` : ' – Present'}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex flex-wrap gap-3">
                            {[
                              { label: 'Apps',    value: h.appearances,  icon: 'bi-calendar-check',   colour: '#2F7DF0' },
                              { label: 'Goals',   value: h.goals,        icon: 'bi-dribbble',          colour: '#198754' },
                              { label: 'Assists', value: h.assists,      icon: 'bi-arrow-up-right',    colour: '#F5B301' },
                              { label: 'CS',      value: h.clean_sheets, icon: 'bi-shield-fill-check', colour: '#6f42c1' },
                            ].filter((s) => s.value != null).map(({ label, value, icon, colour }) => (
                              <div key={label} className="text-center px-3 py-2 rounded"
                                style={{ background: colour + '12', minWidth: 58 }}>
                                <i className={`bi ${icon} d-block mb-1`} style={{ color: colour, fontSize: 14 }} />
                                <div style={{ fontSize: 18, fontWeight: 800, color: colour, lineHeight: 1 }}>{value}</div>
                                <div className="text-muted" style={{ fontSize: 10 }}>{label}</div>
                              </div>
                            ))}
                          </div>
                          {h.notes && <p className="small text-muted mt-2 mb-0 fst-italic">{h.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card p-4">
                    <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                      <i className="bi bi-table me-2 text-primary" />Season Summary
                    </h2>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Club</th><th>Season</th>
                            <th className="text-center">Apps</th>
                            <th className="text-center">Goals</th>
                            <th className="text-center">Assists</th>
                            <th className="text-center">CS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.map((h) => (
                            <tr key={h.id}>
                              <td className="fw-semibold">{h.club_name}</td>
                              <td className="text-muted small">{h.season_from}{h.season_to ? `–${h.season_to}` : ''}</td>
                              <td className="text-center">{h.appearances ?? '—'}</td>
                              <td className="text-center fw-bold" style={{ color: '#198754' }}>{h.goals ?? '—'}</td>
                              <td className="text-center" style={{ color: '#F5B301' }}>{h.assists ?? '—'}</td>
                              <td className="text-center" style={{ color: '#6f42c1' }}>{h.clean_sheets ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Statistics */}
          {activeTab === 'stats' && (
            <div className="d-grid gap-4">
              <div className="card p-4">
                <h2 className="h6 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-bar-chart-fill me-2 text-primary" />Career Statistics
                </h2>
                <p className="small text-muted mb-4">Player-reported figures — not independently verified by SportBridge.</p>
                <div className="row g-2 mb-4">
                  <div className="col-6 col-sm-3"><QuickStat icon="bi-calendar-check" value={stats.total_appearances} label="Appearances" colour="#2F7DF0" /></div>
                  <div className="col-6 col-sm-3"><QuickStat icon="bi-dribbble" value={stats.total_goals} label="Goals" colour="#198754" /></div>
                  <div className="col-6 col-sm-3"><QuickStat icon="bi-arrow-up-right" value={stats.total_assists} label="Assists" colour="#F5B301" /></div>
                  <div className="col-6 col-sm-3"><QuickStat icon="bi-shield-fill-check" value={stats.total_clean_sheets ?? stats.clean_sheets} label="Clean Sheets" colour="#6f42c1" /></div>
                </div>
                <StatRow label="Total Appearances" value={stats.total_appearances} />
                <StatRow label="Total Goals"       value={stats.total_goals}       bar={stats.total_goals}       barMax={200} />
                <StatRow label="Total Assists"     value={stats.total_assists}     bar={stats.total_assists}     barMax={150} />
                <StatRow label="Clean Sheets"      value={stats.total_clean_sheets ?? stats.clean_sheets} />
                <StatRow label="Minutes Played"    value={stats.minutes_played ? `${Number(stats.minutes_played).toLocaleString()} min` : null} />
                <StatRow label="Pass Accuracy"     value={stats.pass_accuracy     ? `${stats.pass_accuracy}%`    : null} bar={stats.pass_accuracy}     barMax={100} />
                <StatRow label="Dribble Success"   value={stats.dribble_success   ? `${stats.dribble_success}%`  : null} bar={stats.dribble_success}   barMax={100} />
                <StatRow label="Shots on Target"   value={stats.shots_on_target   ? `${stats.shots_on_target}%`  : null} bar={stats.shots_on_target}   barMax={100} />
                <StatRow label="Aerial Duels Won"  value={stats.aerial_duels_won  ? `${stats.aerial_duels_won}%` : null} bar={stats.aerial_duels_won}  barMax={100} />
                <StatRow label="Tackles Won"       value={stats.tackles_won       ? `${stats.tackles_won}%`      : null} bar={stats.tackles_won}       barMax={100} />
                {stats.total_goals && stats.total_appearances
                  ? <StatRow label="Goals per Match" value={(stats.total_goals / stats.total_appearances).toFixed(2)} />
                  : null}
                {Object.keys(stats).length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-bar-chart fs-2 d-block mb-2" style={{ opacity: 0.3 }} />
                    <p className="mb-0">No statistics recorded yet.</p>
                  </div>
                )}
              </div>
              <div className="card p-4">
                <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-rulers me-2 text-primary" />Physical Attributes
                </h2>
                <StatRow label="Height"         value={player.height_cm ? `${player.height_cm} cm` : null} />
                <StatRow label="Weight"         value={player.weight_kg ? `${player.weight_kg} kg` : null} />
                <StatRow label="Preferred Foot" value={foot ? foot.charAt(0).toUpperCase() + foot.slice(1) : null} />
                <StatRow label="Age Group"      value={player.age_group} />
              </div>
            </div>
          )}

          {/* Tab: Videos */}
          {activeTab === 'videos' && (
            <div>
              {['highlight', 'full_match', 'training'].map((vtype) => {
                const vtLabel = { highlight: '90 sec Highlights', full_match: 'Full Match (uncut)', training: 'Training Clip' }[vtype]
                const vtVids  = videos.filter((v) => v.video_kind === vtype)
                const list    = vtVids.length ? vtVids : (vtype === 'highlight' ? videos : [])
                return (
                  <div key={vtype} className="mb-4">
                    <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                      <i className="bi bi-play-circle text-primary" />{vtLabel}
                      {vtype === 'full_match' && <span className="badge text-bg-primary" style={{ fontSize: 10 }}>Required for Verification</span>}
                    </h3>
                    {list.length === 0
                      ? <p className="text-muted small">No {vtLabel.toLowerCase()} uploaded yet.</p>
                      : list.map((v) => (
                        <VideoPlayer key={v.id} src={v.storage_path || v.external_url}
                          title={v.title || vtLabel} hash={v.file_hash}
                          watermark={v.created_at ? new Date(v.created_at).toLocaleDateString() : null} />
                      ))}
                  </div>
                )
              })}
              {videos.length === 0 && (
                <div className="card p-5 text-center text-muted">
                  <i className="bi bi-camera-video fs-1 d-block mb-3" style={{ opacity: 0.3 }} />
                  <p className="fw-semibold mb-1">No videos uploaded yet</p>
                  <p className="small">At least one full-match video is required for verification.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Achievements */}
          {activeTab === 'achievements' && (
            <div>
              {achList.length > 0 && (
                <div className="card p-4 mb-4">
                  <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                    <i className="bi bi-trophy-fill me-2 text-warning" />Honours &amp; Awards
                  </h2>
                  {achList.map((a, i) => (
                    <div key={i} className="d-flex align-items-center gap-3 py-2"
                      style={{ borderBottom: i < achList.length - 1 ? '1px solid var(--bs-border-color)' : 'none' }}>
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: 36, height: 36, background: '#F5B30120', color: '#F5B301' }}>
                        <i className="bi bi-trophy-fill" />
                      </div>
                      <div>
                        <div className="fw-semibold">{a.title}</div>
                        {a.year && <div className="small text-muted">{a.year}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {player.achievements && (
                <div className="card p-4">
                  <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                    <i className="bi bi-star-fill me-2 text-warning" />Career Highlights
                  </h2>
                  <p className="mb-0" style={{ whiteSpace: 'pre-line', lineHeight: 1.8, color: 'var(--fc-muted)' }}>
                    {player.achievements}
                  </p>
                </div>
              )}
              {!achList.length && !player.achievements && (
                <div className="card p-5 text-center text-muted">
                  <i className="bi bi-trophy fs-1 d-block mb-3" style={{ opacity: 0.3 }} />
                  <p className="mb-0">No achievements listed yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Documents */}
          {activeTab === 'documents' && (
            <div className="card p-4">
              <h3 className="h5 fw-bold mb-3">CV / Resume</h3>
              {!user ? (
                <div className="alert alert-info d-flex gap-3 align-items-start">
                  <i className="bi bi-lock-fill flex-shrink-0 mt-1 text-primary" />
                  <div>
                    <div className="fw-semibold">Login required to view documents</div>
                    <div className="small text-muted">Create a free account to access player CVs.</div>
                    <button className="btn btn-sm btn-primary mt-2" type="button" onClick={() => onSignup?.()}>Create account</button>
                  </div>
                </div>
              ) : !unlocked ? (
                <div className="alert alert-warning d-flex gap-3 align-items-start">
                  <i className="bi bi-lock-fill flex-shrink-0 mt-1" />
                  <div>
                    <div className="fw-semibold">Contact unlock required</div>
                    <div className="small text-muted">Unlock this profile to download the full CV.</div>
                    {unlockError && <div className="alert alert-danger py-2 mt-2 small">{unlockError}</div>}
                    <button className="btn btn-sm btn-warning mt-2" type="button"
                      onClick={handleUnlock} disabled={unlocking || !viewerVerified}>
                      {unlocking ? 'Unlocking…' : 'Unlock Profile (Test Mode)'}
                    </button>
                  </div>
                </div>
              ) : cvAsset ? (
                <a href={cvAsset.storage_path || cvAsset.external_url} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary d-inline-flex align-items-center gap-2" download>
                  <i className="bi bi-file-earmark-pdf" />Download CV (PDF)
                </a>
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-file-earmark fs-1 d-block mb-2" style={{ opacity: 0.3 }} />
                  <p className="mb-0">CV not uploaded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-12 col-lg-4">
          {photoUrls.length > 0 && (
            <div className="card p-3 mb-3">
              <h3 className="h6 fw-bold mb-3">Photos</h3>
              <ImageGallery images={photoUrls} playerName={fullName} />
            </div>
          )}

          {/* Profile completeness */}
          <div className="card p-4 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h3 className="h6 fw-bold mb-0">Profile completeness</h3>
              <span className="fw-bold small"
                style={{ color: completePct >= 80 ? '#198754' : completePct >= 50 ? '#F5B301' : '#dc3545' }}>
                {completePct}%
              </span>
            </div>
            <div className="progress mb-2" style={{ height: 6 }}>
              <div className="progress-bar" style={{
                width: `${completePct}%`,
                background: completePct >= 80 ? '#198754' : completePct >= 50 ? '#F5B301' : '#dc3545'
              }} />
            </div>
            <div className="small text-muted">
              {completePct >= 80 ? 'Strong profile' : 'Add more details to improve visibility'}
            </div>
          </div>

          {/* Contact */}
          <div className="card p-4 mb-3">
            <h3 className="h6 fw-bold mb-2">Contact player</h3>
            {!user ? (
              <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                type="button" onClick={() => onSignup?.()}>
                <i className="bi bi-lock-fill" />Login to contact
              </button>
            ) : unlocked ? (
              <div className="alert alert-success py-2 mb-0 small d-flex gap-2 align-items-center">
                <i className="bi bi-check-circle-fill" />Contact unlocked — send a message via inbox.
              </div>
            ) : (
              <div>
                <p className="small text-muted mb-3">Identity verification is required. Phone numbers and email addresses are never shown publicly.</p>
                {unlockError && <div className="alert alert-danger py-2 small mb-2">{unlockError}</div>}
                {!viewerVerified && (
                  <div className="alert alert-warning py-2 small mb-2">
                    <i className="bi bi-exclamation-triangle me-1" />Complete identity verification to unlock contact.
                  </div>
                )}
                <button className="btn btn-warning w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                  type="button" onClick={handleUnlock} disabled={unlocking || !viewerVerified}>
                  <i className="bi bi-unlock-fill" />
                  {unlocking ? 'Unlocking…' : 'Unlock Profile (Test Mode)'}
                </button>
              </div>
            )}
          </div>

          {/* Apply */}
          <div className="card p-4 mb-3">
            <h3 className="h6 fw-bold mb-2">Are you a club or agent?</h3>
            <p className="small text-muted mb-3">Apply with your verified SportBridge profile — no CV email needed.</p>
            <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              type="button" onClick={() => user ? null : onSignup?.('academy')}>
              <i className="bi bi-send-check-fill" />Apply with My Verified Profile
            </button>
          </div>

          {/* Report */}
          <div className="card p-3 mb-3">
            <ReportProfileButton supabase={supabase} user={user}
              reportedUserId={player.profile_id} reportedName={player.display_name} onSignup={onSignup} />
          </div>

          {/* Verification */}
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

      {/* Mobile sticky bar */}
      <div className="d-lg-none position-fixed bottom-0 start-0 end-0 p-3 d-flex gap-2"
        style={{ background: 'var(--bs-body-bg)', borderTop: '1px solid var(--bs-border-color)', zIndex: 1040 }}>
        <button className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2 fw-bold"
          type="button" onClick={() => user ? null : onSignup?.('academy')}>
          <i className="bi bi-send-check-fill" />Apply with Profile
        </button>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-1"
          type="button" onClick={() => user ? null : onSignup?.()}>
          <i className="bi bi-chat-dots" />Message
        </button>
      </div>
      <div className="d-lg-none" style={{ height: 72 }} />
    </div>
  )
}
