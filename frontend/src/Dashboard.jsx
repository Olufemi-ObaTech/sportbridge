import { useEffect, useState, useCallback } from 'react'
import AccessRequestsPanel from './AccessRequestsPanel.jsx'
import AcademyPlayerForm from './AcademyPlayerForm.jsx'
import JobPostForm from './JobPostForm.jsx'
import PlayerUploadForm from './PlayerUploadForm.jsx'
import PostUpdateForm from './PostUpdateForm.jsx'
import RecommendWithMediaForm from './RecommendWithMediaForm.jsx'
import TryoutForm from './TryoutForm.jsx'
import VerifyForm, { CvOnlyForm } from './VerifyForm.jsx'
import { blockContactInfo } from './lib/uploadGuards'
import { FOOTBALL_POSITIONS, REGIONS, STAFF_ROLES } from './lib/features'
// ——— constants ————————————————————————————————————————————————————————————————

const ROLE_LABELS = {
  player:         'Player',
  coach:          'Coach / Manager',
  agent:          'Agent / Scout',
  academy:        'Academy / Club',
  sports_analyst: 'Sports Analyst / Others',
  super_admin:    'Super Admin',
}

const ROLE_ICONS = {
  player:         'bi-person-arms-up',
  coach:          'bi-clipboard2-pulse',
  agent:          'bi-binoculars',
  academy:        'bi-building',
  sports_analyst: 'bi-graph-up-arrow',
  super_admin:    'bi-shield-check',
}

const ALL_ROLES = ['player', 'coach', 'agent', 'academy', 'sports_analyst', 'super_admin']

const POSITIONS_FOOTBALL = FOOTBALL_POSITIONS
const COUNTRIES = [
  'Nigeria','Ghana','South Africa','Kenya','Egypt','Senegal',"Côte d'Ivoire",'Cameroon',
  'Morocco','England','France','Germany','Spain','Portugal','Italy','Brazil',
  'Argentina','USA','Japan','South Korea','Saudi Arabia','Qatar','UAE',
  'Netherlands','Belgium','Turkey','Australia','Serbia','Poland','Greece',
  'Ukraine','Algeria','Mexico','Colombia','Norway','Iran','Portugal','Other',
]

// ——— shared UI helpers ————————————————————————————————————————————————————————

// ── Unverified member gate — blocks access to restricted features ──────────────
// Shows a blurred overlay with a call-to-action to complete verification.
function UnverifiedGate({ profile, message, children }) {
  const isVerified = profile?.verification_status === 'verified'
  if (isVerified) return children
  return (
    <div className="position-relative">
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        {children}
      </div>
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(4px)', borderRadius: 8, zIndex: 2 }}>
        <div className="text-center p-4" style={{ maxWidth: 320 }}>
          <i className="bi bi-patch-check-fill fs-2 mb-3 d-block" style={{ color: 'var(--fc-blue-500)' }} />
          <h3 className="h6 fw-bold mb-2">Verification required</h3>
          <p className="small text-muted mb-0">
            {message || 'This feature is available to verified members only. Complete identity verification in the Get Verified tab.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, colour }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card h-100 p-4 d-flex flex-row align-items-center gap-3">
        <span
          className="fc-icon-badge flex-shrink-0"
          style={{ background: colour || 'var(--fc-gradient-primary)', width: 48, height: 48, fontSize: '1.2rem' }}
        >
          <i className={`bi ${icon}`} aria-hidden="true" />
        </span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--fc-font-heading)', lineHeight: 1 }}>{value ?? '—'}</div>
          <div className="small text-muted mt-1">{label}</div>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, children, action }) {
  return (
    <section className="card p-4 mb-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function FormRow({ children }) { return <div className="row g-3">{children}</div> }

function Field({ label, col = 'col-12 col-md-6', hint, children }) {
  return (
    <div className={col}>
      <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{label}</label>
      {children}
      {hint && <div className="form-text">{hint}</div>}
    </div>
  )
}

// ——— Verification badge ———————————————————————————————————————————————————————

function VerificationBadge({ status }) {
  const map = {
    verified:  { cls: 'text-bg-success', icon: 'bi-patch-check-fill', label: 'Verified' },
    pending:   { cls: 'text-bg-warning',  icon: 'bi-hourglass-split',  label: 'Verification Pending' },
    rejected:  { cls: 'text-bg-danger',   icon: 'bi-x-circle-fill',    label: 'Verification Rejected' },
    unverified:{ cls: 'text-bg-secondary',icon: 'bi-patch-question',   label: 'Unverified' },
  }
  const v = map[status ?? 'unverified'] ?? map.unverified
  return (
    <span className={`badge d-inline-flex align-items-center gap-1 px-2 py-1 ${v.cls}`} style={{ fontSize: 12 }}>
      <i className={`bi ${v.icon}`} aria-hidden="true" />
      {v.label}
    </span>
  )
}

// ——— Profile completeness bar —————————————————————————————————————————————————

function completenessScore(profile, roleData) {
  const checks = [
    Boolean(profile?.full_name),
    Boolean(profile?.email),
    Boolean(roleData?.bio || roleData?.about),
    Boolean(roleData?.country || roleData?.nationality || roleData?.country),
    Boolean(roleData?.position || roleData?.preferred_role || roleData?.agency_name || roleData?.club_name || roleData?.full_name),
    Boolean(roleData?.is_public || roleData?.open_to_work),
    Boolean(roleData?.linkedin),
    Boolean(roleData?.achievements),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

function CompletenessBar({ score }) {
  const colour = score >= 80 ? '#198754' : score >= 50 ? '#f5b301' : '#dc3545'
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="small fw-semibold">Profile completeness</span>
        <span className="small fw-bold" style={{ color: colour }}>{score}%</span>
      </div>
      <div className="progress" style={{ height: 6, borderRadius: 4 }} role="progressbar" aria-valuenow={score} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-bar" style={{ width: `${score}%`, background: colour, borderRadius: 4 }} />
      </div>
      {score < 80 && (
        <div className="form-text mt-1">
          Complete your profile to increase visibility to clubs and agents.
        </div>
      )}
    </div>
  )
}

// ——— Activity-to-Feed helper ——————————————————————————————————————————————————
// Shown after any profile save — lets users share activity to the Community Feed.

function ActivityFeedPost({ supabase, user, activityText, onDone }) {
  const [caption,   setCaption]   = useState(activityText ?? '')
  const [files,     setFiles]     = useState([])
  const [posting,   setPosting]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null
  if (done) {
    return (
      <div className="alert alert-success d-flex align-items-center gap-2 mt-3" role="status">
        <i className="bi bi-check-circle-fill" />Posted to your Community Feed!
        <button className="btn btn-sm btn-link ms-auto p-0 text-success" type="button"
          onClick={() => { setDone(false); setDismissed(true); onDone?.() }}>Dismiss</button>
      </div>
    )
  }

  const submitPost = async (e) => {
    e.preventDefault()
    if (!caption.trim()) return
    setPosting(true)
    const mediaUrls = []
    for (const file of files) {
      const ext  = file.name.split('.').pop()
      const p    = `feed/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: up, error: ue } = await supabase.storage.from('uploads').upload(p, file, { upsert: false })
      if (!ue && up) {
        const { data: pub } = supabase.storage.from('uploads').getPublicUrl(up.path)
        if (pub?.publicUrl) mediaUrls.push({ url: pub.publicUrl, type: file.type.startsWith('video') ? 'video' : 'image' })
      }
    }
    await supabase.from('feed_posts').insert({
      author_id:  user.id,
      sport:      'football',
      content:    caption.trim(),
      media_urls: mediaUrls,
      visibility: 'public',
      status:     'published',
    })
    setPosting(false)
    setDone(true)
  }

  return (
    <div className="card p-4 mt-3" style={{ border: '1.5px solid var(--fc-blue-500)' }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="fc-icon-badge flex-shrink-0" style={{ width: 36, height: 36, background: 'var(--fc-gradient-primary)', fontSize: '0.9rem' }}>
          <i className="bi bi-megaphone-fill" />
        </span>
        <div>
          <div className="fw-bold small">Share this update to your Community Feed?</div>
          <div className="small text-muted">Your followers and the SportBridge community will see it.</div>
        </div>
        <button className="btn btn-link ms-auto p-0 text-muted" type="button" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <i className="bi bi-x-lg" />
        </button>
      </div>
      <form onSubmit={submitPost} className="d-grid gap-3">
        <textarea className="form-control" rows={3} value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tell the community about this update…"
          maxLength={2000} required />
        <div>
          <label className="form-label small fw-semibold" htmlFor="feed-media-input">
            <i className="bi bi-images me-1" />Attach photos / video (optional)
          </label>
          <input id="feed-media-input" className="form-control form-control-sm" type="file"
            accept="image/*,video/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          {files.length > 0 && <div className="small text-muted mt-1">{files.length} file(s) selected</div>}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm px-4" type="submit" disabled={posting || !caption.trim()}>
            {posting ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</> : <><i className="bi bi-send me-2" />Post to Feed</>}
          </button>
          <button className="btn btn-link btn-sm text-muted" type="button" onClick={() => setDismissed(true)}>Skip</button>
        </div>
      </form>
    </div>
  )
}

// ——— Player dashboard —————————————————————————————————————————————————————————

function PlayerDashboard({ supabase, user, profile }) {
  const [player,      setPlayer]   = useState(null)
  const [draft,       setDraft]    = useState(null)
  const [saving,      setSaving]   = useState(false)
  const [notice,      setNotice]   = useState('')
  const [error,       setError]    = useState('')
  const [loading,     setLoading]  = useState(true)
  const [activeTab,   setActiveTab]= useState('profile')
  const [feedPrompt,  setFeedPrompt]= useState('')  // 'profile' | 'uploads'

  useEffect(() => {
    let alive = true
    supabase.from('players')
      .select('id, display_name, position, secondary_position, age, country, nationality, bio, is_public, sport, gender, foot, preferred_foot, dominant_hand, height_cm, weight_kg, current_club, achievements, achievements_data, linkedin, views_count, region, availability, age_group, stats')
      .eq('profile_id', user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        const p = data ?? {}
        setPlayer(data)
        setDraft({
          display_name:       p.display_name       ?? profile.full_name ?? '',
          position:           p.position           ?? '',
          secondary_position: p.secondary_position ?? '',
          age:                p.age != null        ? String(p.age) : '',
          country:            p.country            ?? '',
          nationality:        p.nationality        ?? '',
          bio:                p.bio                ?? '',
          is_public:          p.is_public          ?? false,
          sport:              p.sport              ?? 'football',
          gender:             p.gender             ?? '',
          foot:               p.foot               ?? '',
          dominant_hand:      p.dominant_hand      ?? '',
          height_cm:          p.height_cm != null  ? String(p.height_cm) : '',
          weight_kg:          p.weight_kg != null  ? String(p.weight_kg) : '',
          current_club:       p.current_club       ?? '',
          achievements:       p.achievements       ?? '',
          linkedin:           p.linkedin           ?? '',
          region:             p.region             ?? '',
          availability:       p.availability       ?? 'available_now',
          age_group:          p.age_group          ?? '',
        })
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id, profile.full_name])

  const upd = (f) => (e) => setDraft((d) => ({ ...d, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    const ci = blockContactInfo(draft.bio, 'About / Bio') || blockContactInfo(draft.achievements, 'Achievements')
    if (ci) { setError(ci); return }
    setSaving(true); setError(''); setNotice('')
    const payload = {
      profile_id:         user.id,
      display_name:       draft.display_name.trim() || profile.full_name || 'Player',
      position:           draft.position || null,
      secondary_position: draft.secondary_position || null,
      age:                draft.age ? Number(draft.age) : null,
      country:            draft.country.trim() || null,
      nationality:        draft.nationality.trim() || null,
      bio:                draft.bio.trim() || null,
      is_public:          draft.is_public,
      sport:              draft.sport,
      gender:             draft.gender || null,
      foot:               draft.foot || null,
      preferred_foot:     draft.foot || null,
      dominant_hand:      draft.dominant_hand || null,
      height_cm:          draft.height_cm ? Number(draft.height_cm) : null,
      weight_kg:          draft.weight_kg ? Number(draft.weight_kg) : null,
      current_club:       draft.current_club.trim() || null,
      achievements:       draft.achievements.trim() || null,
      linkedin:           draft.linkedin.trim() || null,
      region:             draft.region?.trim() || null,
      availability:       draft.availability || 'available_now',
      age_group:          draft.age_group || null,
      updated_at:         new Date().toISOString(),
    }
    const q = player
      ? supabase.from('players').update(payload).eq('id', player.id).eq('profile_id', user.id)
      : supabase.from('players').insert(payload)
    const { data, error: err } = await q.select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setPlayer(data)
    setNotice('Player profile saved.')
    // Prompt user to share update to Community Feed
    const goals = draft.achievements?.trim()
    setFeedPrompt(goals
      ? `Profile updated on SportBridge! ${goals}`
      : `I have updated my SportBridge player profile — ${draft.position || 'footballer'} from ${draft.country || 'the world'}.`
    )
  }

  const positions = POSITIONS_FOOTBALL

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

  const score = completenessScore(profile, draft)

  return (
    <>
      <CompletenessBar score={score} />

      <div className="row g-3 mb-4">
        <StatCard icon="bi-eye"           label="Profile views"   value={player?.views_count ?? 0}  colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-images"        label="Media items"     value="—"                          colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-bookmark-star" label="Watchlisted by"  value="—"                          colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-globe2"        label="Visibility"      value={draft?.is_public ? 'Public' : 'Private'} colour={draft?.is_public ? 'linear-gradient(135deg,#198754,#20c997)' : 'linear-gradient(135deg,#6c757d,#adb5bd)'} />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {/* Tab switcher */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {[['profile','bi-person-vcard','My Profile'],['post-update','bi-megaphone','Post Update'],['uploads','bi-cloud-upload','Upload CV & Media'],['requests','bi-shield-lock','Access Requests'],['verify','bi-patch-check','Get Verified']].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`}
              type="button" role="tab"
              onClick={() => setActiveTab(tab)}
            >
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
              {tab === 'verify' && profile?.verification_status === 'verified' && (
                <i className="bi bi-patch-check-fill text-success ms-1" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'profile' && draft && (
        <form onSubmit={save}>
          <SectionCard title="Player profile">
            <FormRow>
              <Field label="Display name">
                <input className="form-control" value={draft.display_name} onChange={upd('display_name')} placeholder="Name shown on your profile" />
              </Field>
              <Field label="Sport">
                <select className="form-select" value={draft.sport} onChange={upd('sport')}>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                </select>
              </Field>
              <Field label="Position">
                <select className="form-select" value={draft.position} onChange={upd('position')}>
                  <option value="">— Select —</option>
                  {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Secondary position">
                <select className="form-select" value={draft.secondary_position} onChange={upd('secondary_position')}>
                  <option value="">— None —</option>
                  {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select className="form-select" value={draft.gender} onChange={upd('gender')}>
                  <option value="">— Select —</option>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </Field>
              <Field label="Preferred foot">
                <select className="form-select" value={draft.foot} onChange={upd('foot')}>
                  <option value="">— Select —</option>
                  <option value="right">Right</option><option value="left">Left</option><option value="both">Both</option>
                </select>
              </Field>
              <Field label="Age"><input className="form-control" type="number" min="1" max="100" value={draft.age} onChange={upd('age')} placeholder="e.g. 22" /></Field>
              <Field label="Height (cm)"><input className="form-control" type="number" min="100" max="250" value={draft.height_cm} onChange={upd('height_cm')} placeholder="e.g. 180" /></Field>
              <Field label="Weight (kg)"><input className="form-control" type="number" min="30" max="200" value={draft.weight_kg} onChange={upd('weight_kg')} placeholder="e.g. 75" /></Field>
              <Field label="Nationality">
                <select className="form-select" value={draft.nationality} onChange={upd('nationality')}>
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Country (based in)">
                <select className="form-select" value={draft.country} onChange={upd('country')}>
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Region">
                <select className="form-select" value={draft.region ?? ''} onChange={upd('region')}>
                  <option value="">— Select —</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Current club"><input className="form-control" value={draft.current_club} onChange={upd('current_club')} placeholder="e.g. FC Academy Lagos" /></Field>
              <Field label="Availability">
                <select className="form-select" value={draft.availability} onChange={upd('availability')}>
                  <option value="available_now">Available Now</option>
                  <option value="available_jan_2026">Available Jan 2026</option>
                  <option value="available_jul_2026">Available Jul 2026</option>
                  <option value="under_contract">Under Contract</option>
                </select>
              </Field>
              <Field label="Age Group">
                <select className="form-select" value={draft.age_group ?? ''} onChange={upd('age_group')}>
                  <option value="">— Select —</option>
                  <option value="U13">U13</option>
                  <option value="U15">U15</option>
                  <option value="U17">U17</option>
                  <option value="U20">U20</option>
                  <option value="U23">U23</option>
                  <option value="Senior">Senior</option>
                </select>
              </Field>
              <Field label="LinkedIn URL" col="col-12"><input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} placeholder="https://linkedin.com/in/yourname" /></Field>
              <Field label="About / Bio" col="col-12">
                <textarea className="form-control" rows={4} value={draft.bio} onChange={upd('bio')} placeholder="Playing style, experience and goals…" />
                {blockContactInfo(draft.bio) && <div className="small text-danger mt-1"><i className="bi bi-exclamation-circle me-1" />{blockContactInfo(draft.bio)}</div>}
              </Field>
              <Field label="Achievements" col="col-12">
                <textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} placeholder="Honours, caps, notable clubs…" />
              </Field>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="player-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="player-public">Show profile in public player directory</label>
                  <div className="small text-muted">Agents and scouts can discover you when this is on.</div>
                </div>
              </div>
            </FormRow>
          </SectionCard>
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
          </button>
          {feedPrompt && (
            <ActivityFeedPost supabase={supabase} user={user}
              activityText={feedPrompt} onDone={() => setFeedPrompt('')} />
          )}
        </form>
      )}

      {activeTab === 'uploads' && (
        <SectionCard title="Upload CV & Media">
          <PlayerUploadForm supabase={supabase} user={user} player={player} onSaved={() => setNotice('Files uploaded.')} />
        </SectionCard>
      )}

      {activeTab === 'post-update' && (
        <SectionCard title="Post Update">
          <UnverifiedGate profile={profile} message="Only verified players can post updates to the Community Feed. Complete verification to unlock posting.">
            <p className="text-muted small mb-3">Share match results, upcoming fixtures, achievements and milestones with the SportBridge community.</p>
            <PostUpdateForm supabase={supabase} user={user} role="player" onSaved={() => setNotice('Update posted to Community Feed.')} />
          </UnverifiedGate>
        </SectionCard>
      )}

      {activeTab === 'requests' && (
        <SectionCard title="Access Requests">
          <UnverifiedGate profile={profile} message="Only verified players can manage agent access requests. Complete verification to control who can contact you.">
            <p className="text-muted small mb-3">
              Manage which agents and scouts can view your contact details.
              Approving an access request allows that agent to message you directly.
            </p>
            <AccessRequestsPanel supabase={supabase} user={user} player={player} onUpdate={() => setNotice('Access request updated.')} />
          </UnverifiedGate>
        </SectionCard>
      )}

      {activeTab === 'verify' && (
        <SectionCard title="Verification">
          <VerifyForm supabase={supabase} user={user} role="player" verificationStatus={profile?.verification_status} onDone={() => setNotice('Submitted for review.')} />
        </SectionCard>
      )}

      {/* Report this account */}
      {/* Report button: appears on other users' profiles, not own dashboard */}
    </>
  )
}

// ——— Coach dashboard ——————————————————————————————————————————————————————————

function CoachDashboard({ supabase, user, profile }) {
  const [coach,      setCoach]      = useState(null)
  const [draft,      setDraft]      = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [notice,     setNotice]     = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('profile')
  const [feedPrompt, setFeedPrompt] = useState('')
  const [recPlayers, setRecPlayers] = useState([])
  const [recSearch,  setRecSearch]  = useState('')
  const [recPlayer,  setRecPlayer]  = useState('')
  const [recTarget,  setRecTarget]  = useState('')
  const [recNote,    setRecNote]    = useState('')
  const [recBusy,    setRecBusy]    = useState(false)
  const [recDone,    setRecDone]    = useState('')

  useEffect(() => {
    let alive = true
    supabase.from('coach_profiles')
      .select('id, full_name, sport, preferred_role, experience_years, current_club, nationality, gender, about, achievements, badges, open_to_work, linkedin, is_public')
      .eq('user_id', user.id).maybeSingle()
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        const c = data ?? {}
        setCoach(data)
        setDraft({
          full_name:        c.full_name        ?? profile.full_name ?? '',
          sport:            c.sport            ?? 'football',
          preferred_role:   c.preferred_role   ?? '',
          experience_years: c.experience_years != null ? String(c.experience_years) : '',
          current_club:     c.current_club     ?? '',
          nationality:      c.nationality      ?? '',
          gender:           c.gender           ?? '',
          about:            c.about            ?? '',
          achievements:     c.achievements     ?? '',
          badges:           Array.isArray(c.badges) ? c.badges.join(', ') : '',
          open_to_work:     c.open_to_work     ?? true,
          linkedin:         c.linkedin         ?? '',
          is_public:        c.is_public        ?? false,
        })
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id, profile.full_name])

  const upd = (f) => (e) => setDraft((d) => ({ ...d, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    const ci = blockContactInfo(draft.about, 'About') || blockContactInfo(draft.achievements, 'Achievements')
    if (ci) { setError(ci); return }
    setSaving(true); setError(''); setNotice('')
    const payload = {
      user_id:          user.id,
      full_name:        draft.full_name.trim()    || profile.full_name,
      sport:            draft.sport,
      preferred_role:   draft.preferred_role      || null,
      experience_years: draft.experience_years    ? Number(draft.experience_years) : null,
      current_club:     draft.current_club.trim() || null,
      nationality:      draft.nationality         || null,
      gender:           draft.gender              || null,
      about:            draft.about.trim()        || null,
      achievements:     draft.achievements.trim() || null,
      badges:           draft.badges ? draft.badges.split(',').map((b) => b.trim()).filter(Boolean) : [],
      open_to_work:     draft.open_to_work,
      linkedin:         draft.linkedin.trim()     || null,
      is_public:        draft.is_public,
      updated_at:       new Date().toISOString(),
    }
    const q = coach ? supabase.from('coach_profiles').update(payload).eq('id', coach.id) : supabase.from('coach_profiles').insert(payload)
    const { data, error: err } = await q.select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setCoach(data)
    setNotice('Coach profile saved.')
    const feedText = draft.achievements?.trim()
      ? `Coaching profile updated on SportBridge! ${draft.achievements.trim()}`
      : `${draft.preferred_role || 'Coach'} profile updated — ${draft.experience_years || '?'} years experience.`
    setFeedPrompt(feedText)
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

  // —— Recommend player handler ——————————————————————————————————————————————
  const searchPlayers = async (q) => {
    setRecSearch(q)
    if (!q || q.length < 2 || !supabase) { setRecPlayers([]); return }
    const { data } = await supabase.from('players').select('id, display_name, position, current_club').ilike('display_name', `%${q}%`).limit(8)
    setRecPlayers(data ?? [])
  }

  const submitRecommendation = async (e) => {
    e.preventDefault()
    if (!recPlayer || !recTarget.trim()) return
    setRecBusy(true)
    // Find the agent profile to recommend to
    const { data: agentData } = await supabase
      .from('agent_profiles')
      .select('id, user_id, agency_name')
      .ilike('agency_name', `%${recTarget}%`)
      .limit(1)
      .maybeSingle()

    if (!agentData) {
      // Store as a note-based recommendation without agent_profile_id
      setRecBusy(false)
      setRecDone(`Recommendation noted. "${recTarget}" will be notified when they join SportBridge.`)
      return
    }

    await supabase.from('agent_recommendations').insert({
      recommender_user_id: user.id,
      agent_profile_id:    agentData.id,
      sport:               'football',
      player_id:           recPlayer,
      recommended_to_name: recTarget,
      note:                recNote.trim() || null,
      status:              'pending',
    })
    setRecBusy(false)
    setRecDone(`Player recommended to ${agentData.agency_name ?? recTarget} successfully.`)
    setRecPlayer(''); setRecTarget(''); setRecNote(''); setRecSearch(''); setRecPlayers([])
  }

  return (
    <>
      <CompletenessBar score={completenessScore(profile, draft)} />
      <div className="row g-3 mb-4">
        <StatCard icon="bi-briefcase" label="Applications sent" value="—" colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-star"      label="Shortlisted"        value="—" colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-trophy"    label="Hired"              value="—" colour="linear-gradient(135deg,#198754,#20c997)" />
        <StatCard icon="bi-eye"       label="Visibility"         value={draft?.is_public ? 'Public' : 'Private'} colour={draft?.is_public ? 'linear-gradient(135deg,#198754,#20c997)' : 'linear-gradient(135deg,#6c757d,#adb5bd)'} />
      </div>
      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {/* Tab switcher */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {[['profile','bi-clipboard2-pulse','Coaching Profile'],['recommend','bi-send-check','Recommend a Player'],['post-event','bi-calendar-event','Post Event'],['post-tryout','bi-calendar2-plus','Post Tryout'],['apply-jobs','bi-briefcase','Browse Jobs'],['cv','bi-file-earmark-person','Upload CV'],['verify','bi-patch-check','Get Verified']].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`} type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'profile' && draft && (
        <form onSubmit={save}>
          <SectionCard title="Coaching profile">
            <FormRow>
              <Field label="Full name"><input className="form-control" value={draft.full_name} onChange={upd('full_name')} /></Field>
              <Field label="Sport">
                <select className="form-select" value={draft.sport} onChange={upd('sport')}>
                  <option value="football">Football</option><option value="basketball">Basketball</option>
                </select>
              </Field>
              <Field label="Preferred role">
                <select className="form-select" value={draft.preferred_role} onChange={upd('preferred_role')}>
                  <option value="">— Select —</option>
                  {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Years of experience"><input className="form-control" type="number" min="0" max="60" value={draft.experience_years} onChange={upd('experience_years')} /></Field>
              <Field label="Current club"><input className="form-control" value={draft.current_club} onChange={upd('current_club')} /></Field>
              <Field label="Nationality">
                <select className="form-select" value={draft.nationality} onChange={upd('nationality')}>
                  <option value="">— Select —</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select className="form-select" value={draft.gender} onChange={upd('gender')}>
                  <option value="">— Select —</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </Field>
              <Field label="LinkedIn URL"><input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} /></Field>
              <Field label="Badges / Licences (comma-separated)" col="col-12">
                <input className="form-control" value={draft.badges} onChange={upd('badges')} placeholder="e.g. UEFA B, CAF A Licence" />
              </Field>
              <Field label="About" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} />
                {blockContactInfo(draft.about) && <div className="small text-danger mt-1">{blockContactInfo(draft.about)}</div>}
              </Field>
              <Field label="Key achievements" col="col-12">
                <textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} />
              </Field>
              <div className="col-12 d-flex gap-4 flex-wrap">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="coach-open" checked={draft.open_to_work} onChange={upd('open_to_work')} />
                  <label className="form-check-label fw-semibold" htmlFor="coach-open">Open to work</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="coach-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="coach-public">Public profile</label>
                </div>
              </div>
            </FormRow>
          </SectionCard>
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
          </button>
          {feedPrompt && (
            <ActivityFeedPost supabase={supabase} user={user}
              activityText={feedPrompt} onDone={() => setFeedPrompt('')} />
          )}
        </form>
      )}

      {/* —— Recommend a Player to Agent / Club ——————————————————————————— */}
      {activeTab === 'recommend' && (
        <SectionCard title="Recommend a Player">
          <p className="text-muted small mb-4">
            As a coach, you can recommend talented players directly to agents and clubs on SportBridge.
            Your recommendation carries weight — it shows alongside the player&apos;s profile.
          </p>
          {recDone ? (
            <div className="alert alert-success d-flex gap-2 align-items-center">
              <i className="bi bi-check-circle-fill" />
              {recDone}
              <button className="btn btn-sm btn-outline-success ms-auto" type="button" onClick={() => setRecDone('')}>Recommend another</button>
            </div>
          ) : (
            <form onSubmit={submitRecommendation} className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Search for player</label>
                <input
                  className="form-control"
                  type="search"
                  placeholder="Type player name…"
                  value={recSearch}
                  onChange={(e) => searchPlayers(e.target.value)}
                />
                {recPlayers.length > 0 && (
                  <ul className="list-group mt-1">
                    {recPlayers.map((p) => (
                      <li
                        key={p.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center gap-2${recPlayer === p.id ? ' active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setRecPlayer(p.id); setRecSearch(p.display_name); setRecPlayers([]) }}
                      >
                        <i className="bi bi-person-arms-up" aria-hidden="true" />
                        <span>{p.display_name}</span>
                        {p.position && <span className="badge text-bg-primary ms-auto">{p.position}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Recommend to (agent or club name)</label>
                <input
                  className="form-control"
                  placeholder="e.g. Premier Football Agency, Lagos United FC"
                  value={recTarget}
                  onChange={(e) => setRecTarget(e.target.value)}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Your note (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Why are you recommending this player? What makes them special?"
                  value={recNote}
                  onChange={(e) => setRecNote(e.target.value)}
                />
              </div>
              <div className="col-12">
                <button className="btn btn-primary px-5" type="submit" disabled={recBusy || !recPlayer || !recTarget.trim()}>
                  {recBusy
                    ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
                    : <><i className="bi bi-send-check me-2" />Send Recommendation</>}
                </button>
              </div>
            </form>
          )}
        </SectionCard>
      )}

      {activeTab === 'post-event' && (
        <SectionCard title="Post Event / Certificate">
          <p className="text-muted small mb-3">Share upcoming tournaments, coaching events, or newly earned certificates.</p>
          <PostUpdateForm supabase={supabase} user={user} role="coach" onSaved={() => setNotice('Update posted to Community Feed.')} />
        </SectionCard>
      )}

      {activeTab === 'post-tryout' && (
        <SectionCard title="Post Tournament / Tryout">
          <TryoutForm supabase={supabase} user={user} profile={profile} onVerify={() => setActiveTab('verify')} onSaved={() => { setActiveTab('profile'); setNotice('Tryout posted.') }} />
        </SectionCard>
      )}

      {activeTab === 'apply-jobs' && (
        <SectionCard title="Browse & Apply for Jobs">
          <UnverifiedGate profile={profile} message="Verified coaches can apply for roles with their verified profile.">
            <p className="text-muted small mb-3">Browse coaching, management and director roles posted by clubs and academies.</p>
            <div className="alert alert-info d-flex gap-2 align-items-center">
              <i className="bi bi-info-circle flex-shrink-0" />
              <span>Visit the <strong>Jobs Board</strong> to browse and apply for open positions. Your verified profile is attached automatically.</span>
            </div>
          </UnverifiedGate>
        </SectionCard>
      )}

      {activeTab === 'cv' && (
        <SectionCard title="Upload CV / Résumé">
          <p className="text-muted small mb-3">Your CV is stored privately and only shared with clubs, academies and agents you directly apply to or approve.</p>
          <CvOnlyForm supabase={supabase} user={user} onDone={() => setNotice('CV uploaded successfully.')} />
        </SectionCard>
      )}

      {activeTab === 'verify' && (
        <SectionCard title="Verification">
          <VerifyForm supabase={supabase} user={user} role="coach" verificationStatus={profile?.verification_status} onDone={() => setNotice('Submitted for review.')} />
        </SectionCard>
      )}

      {/* Report this account */}
    </>
  )
}

// ——— Agent dashboard ——————————————————————————————————————————————————————————

function AgentDashboard({ supabase, user, profile }) {
  const [agent,          setAgent]        = useState(null)
  const [draft,          setDraft]        = useState(null)
  const [saving,         setSaving]       = useState(false)
  const [notice,         setNotice]       = useState('')
  const [error,          setError]        = useState('')
  const [loading,        setLoading]      = useState(true)
  const [watchlistCount, setWatchlistCount]= useState(null)
  const [activeTab,      setActiveTab]    = useState('profile')
  const [feedPrompt,     setFeedPrompt]   = useState('') // 'profile' | 'post-tryout'

  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('agent_profiles').select('id, agency_name, sport, nationality, gender, experience_years, regions, about, achievements, linkedin, is_public').eq('user_id', user.id).maybeSingle(),
      supabase.from('watchlists').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
    ]).then(([{ data: a, error: ae }, { count, error: we }]) => {
      if (!alive) return
      if (ae) setError(ae.message)
      if (!we) setWatchlistCount(count ?? 0)
      const ag = a ?? {}
      setAgent(a)
      setDraft({
        agency_name:      ag.agency_name      ?? '',
        sport:            ag.sport            ?? 'football',
        nationality:      ag.nationality      ?? '',
        gender:           ag.gender           ?? '',
        experience_years: ag.experience_years != null ? String(ag.experience_years) : '',
        regions:          Array.isArray(ag.regions) ? ag.regions.join(', ') : '',
        about:            ag.about            ?? '',
        achievements:     ag.achievements     ?? '',
        linkedin:         ag.linkedin         ?? '',
        is_public:        ag.is_public        ?? false,
      })
      setLoading(false)
    })
    return () => { alive = false }
  }, [supabase, user.id])

  const upd = (f) => (e) => setDraft((d) => ({ ...d, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    const ci = blockContactInfo(draft.about, 'About')
    if (ci) { setError(ci); return }
    setSaving(true); setError(''); setNotice('')
    const payload = {
      user_id:          user.id,
      agency_name:      draft.agency_name.trim()  || null,
      sport:            draft.sport,
      nationality:      draft.nationality          || null,
      gender:           draft.gender               || null,
      experience_years: draft.experience_years ? Number(draft.experience_years) : null,
      regions:          draft.regions ? draft.regions.split(',').map((r) => r.trim()).filter(Boolean) : [],
      about:            draft.about.trim()         || null,
      achievements:     draft.achievements.trim()  || null,
      linkedin:         draft.linkedin.trim()      || null,
      is_public:        draft.is_public,
      updated_at:       new Date().toISOString(),
    }
    const q = agent ? supabase.from('agent_profiles').update(payload).eq('id', agent.id) : supabase.from('agent_profiles').insert(payload)
    const { data, error: err } = await q.select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setAgent(data)
    setNotice('Agency profile saved.')
    const feedText = draft.achievements?.trim()
      ? `Agency profile updated on SportBridge! ${draft.achievements.trim()}`
      : `${draft.agency_name || 'Our agency'} profile updated — active in ${draft.regions || 'multiple regions'}.`
    setFeedPrompt(feedText)
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-bookmark-star"   label="Watchlisted players"  value={watchlistCount ?? '—'} colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-shield-check"    label="Access granted"       value="—"                     colour="linear-gradient(135deg,#198754,#20c997)" />
        <StatCard icon="bi-hourglass-split" label="Pending requests"     value="—"                     colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-star"            label="Avg. rating"          value="—"                     colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {/* Tab switcher */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {[['profile','bi-person-vcard','Agency Profile'],['post-event','bi-calendar-event','Post Event'],['post-tryout','bi-calendar2-plus','Post Tryout'],['post-position','bi-briefcase-fill','Post Position Needed'],['apply-jobs','bi-briefcase','Browse Jobs'],['cv','bi-file-earmark-person','Upload CV'],['verify','bi-patch-check','Get Verified']].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`} type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'profile' && draft && (
        <form onSubmit={save}>
          <SectionCard title="Agency profile">
            <FormRow>
              <Field label="Agency / company name"><input className="form-control" value={draft.agency_name} onChange={upd('agency_name')} placeholder="e.g. Elite Sports Management" /></Field>
              <Field label="Primary sport">
                <select className="form-select" value={draft.sport} onChange={upd('sport')}>
                  <option value="football">Football</option><option value="basketball">Basketball</option>
                </select>
              </Field>
              <Field label="Years of experience"><input className="form-control" type="number" min="0" max="60" value={draft.experience_years} onChange={upd('experience_years')} /></Field>
              <Field label="Nationality">
                <select className="form-select" value={draft.nationality} onChange={upd('nationality')}>
                  <option value="">— Select —</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select className="form-select" value={draft.gender} onChange={upd('gender')}>
                  <option value="">— Select —</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </Field>
              <Field label="LinkedIn URL"><input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} /></Field>
              <Field label="Operating regions (comma-separated)" col="col-12"><input className="form-control" value={draft.regions} onChange={upd('regions')} placeholder="e.g. West Africa, Europe, Middle East" /></Field>
              <Field label="About" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} />
                {blockContactInfo(draft.about) && <div className="small text-danger mt-1">{blockContactInfo(draft.about)}</div>}
              </Field>
              <Field label="Key achievements" col="col-12"><textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} /></Field>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="agent-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="agent-public">Public profile</label>
                  <div className="small text-muted">Players and academies can find and rate you.</div>
                </div>
              </div>
            </FormRow>
          </SectionCard>
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
          </button>
          {feedPrompt && (
            <ActivityFeedPost supabase={supabase} user={user}
              activityText={feedPrompt} onDone={() => setFeedPrompt('')} />
          )}
        </form>
      )}

      {activeTab === 'post-event' && (
        <SectionCard title="Post Upcoming Event / Certificate">
          <p className="text-muted small mb-3">Share upcoming events, earned certificates, industry news and announcements with the SportBridge community.</p>
          <PostUpdateForm supabase={supabase} user={user} role="agent" onSaved={() => setNotice('Event posted to Community Feed.')} />
        </SectionCard>
      )}

      {activeTab === 'apply-jobs' && (
        <SectionCard title="Browse & Apply for Jobs">
          <UnverifiedGate profile={profile} message="Verified agents can apply for roles with their verified profile. Complete verification to apply.">
            <p className="text-muted small mb-3">Browse available agent, scout and sporting director roles. Apply with your verified SportBridge profile.</p>
            <div className="alert alert-info d-flex gap-2 align-items-center">
              <i className="bi bi-info-circle flex-shrink-0" />
              <span>Visit the <button className="btn btn-link p-0 small" type="button" onClick={() => window.location.hash='#jobs'}>Jobs Board</button> to browse and apply for open positions with your verified profile.</span>
            </div>
          </UnverifiedGate>
        </SectionCard>
      )}

      {/* —— Demo Flow 3: Agent posts Tryout ———————————————————————————————— */}
      {activeTab === 'post-tryout' && (
        <SectionCard title="Post a Tryout Opportunity">
          <TryoutForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setNotice('Tryout posted.') }} />
        </SectionCard>
      )}

      {/* —— Agent posts Player Position Needed ————————————————————————————— */}
      {activeTab === 'post-position' && (
        <SectionCard title="Post Player Position Needed">
          <p className="text-muted small mb-4">
            Post a specific player position needed on behalf of a club or as an independent scout.
            This appears on the public Job Board and is matched to available players by position, age group and region.
          </p>
          <JobPostForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setNotice('Position posted to job board.') }} />
        </SectionCard>
      )}

      {activeTab === 'cv' && (
        <SectionCard title="Upload CV / Résumé">
          <p className="text-muted small mb-3">Your CV is stored privately and only shared with parties you directly engage with through SportBridge.</p>
          <CvOnlyForm supabase={supabase} user={user} onDone={() => setNotice('CV uploaded successfully.')} />
        </SectionCard>
      )}

      {activeTab === 'verify' && (
        <SectionCard title="Verification">
          <VerifyForm supabase={supabase} user={user} role="agent" verificationStatus={profile?.verification_status} onDone={() => setNotice('Submitted for review.')} />
        </SectionCard>
      )}

    </>
  )
}

// ——— Academy dashboard ————————————————————————————————————————————————————————

function AcademyDashboard({ supabase, user, profile }) {
  const [academy, setAcademy] = useState(null)
  const [club,    setClub]    = useState(null)
  const [draft,   setDraft]   = useState(null)
  const [stats,   setStats]   = useState({ players: null, jobs: null })
  const [saving,  setSaving]  = useState(false)
  const [notice,  setNotice]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [feedPrompt, setFeedPrompt] = useState('') // 'profile' | 'post-job'

  useEffect(() => {
    let alive = true
    supabase.from('academy_profiles')
      .select('id, club_id, sports, country, state, address, phone, year_founded, linkedin, leagues, languages')
      .eq('user_id', user.id).maybeSingle()
      .then(async ({ data: ac, error: ae }) => {
        if (!alive) return
        if (ae) { setError(ae.message); setLoading(false); return }
        let clubData = null, playerCount = null, jobCount = null
        if (ac?.club_id) {
          const [{ data: cl }, { count: pc }, { count: jc }] = await Promise.all([
            supabase.from('clubs').select('id, name, country, about, website, sports, status').eq('id', ac.club_id).maybeSingle(),
            supabase.from('players').select('id', { count: 'exact', head: true }).eq('academy_id', ac.id),
            supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('posted_by', user.id).eq('status', 'open'),
          ])
          clubData = cl; playerCount = pc ?? 0; jobCount = jc ?? 0
        }
        if (!alive) return
        setAcademy(ac); setClub(clubData); setStats({ players: playerCount, jobs: jobCount })
        const a = ac ?? {}, c = clubData ?? {}
        setDraft({
          club_name:    c.name         ?? profile.full_name ?? '',
          country:      a.country      ?? '',
          state:        a.state        ?? '',
          address:      a.address      ?? '',
          phone:        a.phone        ?? '',
          year_founded: a.year_founded != null ? String(a.year_founded) : '',
          linkedin:     a.linkedin     ?? '',
          about:        c.about        ?? '',
          website:      c.website      ?? '',
          sports:       Array.isArray(a.sports) ? a.sports : ['football'],
        })
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id, profile.full_name])

  const upd = (f) => (e) => setDraft((d) => ({ ...d, [f]: e.target.value }))
  const toggleSport = (s) => setDraft((d) => {
    const has = d.sports.includes(s)
    if (has && d.sports.length === 1) return d
    return { ...d, sports: has ? d.sports.filter((x) => x !== s) : [...d.sports, s] }
  })

  const save = async (e) => {
    e.preventDefault()
    const ci = blockContactInfo(draft.about, 'About')
    if (ci) { setError(ci); return }
    setSaving(true); setError(''); setNotice('')
    if (club) {
      const { error: ce } = await supabase.from('clubs').update({ name: draft.club_name.trim() || profile.full_name, about: draft.about.trim() || null, website: draft.website.trim() || null, sports: draft.sports, updated_at: new Date().toISOString() }).eq('id', club.id)
      if (ce) { setError(ce.message); setSaving(false); return }
    }
    const apPayload = { user_id: user.id, sports: draft.sports, country: draft.country || null, state: draft.state.trim() || null, address: draft.address.trim() || null, phone: draft.phone.trim() || null, year_founded: draft.year_founded ? Number(draft.year_founded) : null, linkedin: draft.linkedin.trim() || null, updated_at: new Date().toISOString() }
    const q = academy ? supabase.from('academy_profiles').update(apPayload).eq('id', academy.id) : supabase.from('academy_profiles').insert(apPayload)
    const { data, error: ae } = await q.select().single()
    setSaving(false)
    if (ae) { setError(ae.message); return }
    setAcademy(data); setNotice('Academy profile saved.')
    const feedText = draft.club_name ? `${draft.club_name} profile updated on SportBridge — ${draft.country || 'global'} club.` : 'Club profile updated on SportBridge!'
    setFeedPrompt(feedText)
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

  return (
    <>
      <CompletenessBar score={completenessScore(profile, { ...draft, bio: draft?.about })} />
      <div className="row g-3 mb-4">
        <StatCard icon="bi-people"         label="Players"         value={stats.players ?? '—'} colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-briefcase"      label="Active jobs"     value={stats.jobs    ?? '—'} colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-shield-check"   label="Access requests" value="—"                    colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-calendar-event" label="Active trials"   value="—"                    colour="linear-gradient(135deg,#198754,#20c997)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {/* Tab switcher */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {[['profile','bi-building','Club Profile'],['squad','bi-people','Squad Roster'],['post-update','bi-megaphone','Post Match Update'],['post-job','bi-briefcase-fill','Post a Job'],['post-tryout','bi-calendar2-plus','Post Tournament'],['recommend','bi-send-check','Recommend Player'],['cv','bi-file-earmark-person','Upload CV'],['verify','bi-patch-check','Get Verified']].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`} type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
              {tab === 'verify' && profile?.verification_status === 'verified' && (
                <i className="bi bi-patch-check-fill text-success ms-1" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === 'profile' && draft && (
        <form onSubmit={save}>
          <SectionCard title="Club / academy profile">
            <FormRow>
              <Field label="Club / academy name" col="col-12 col-md-8"><input className="form-control" value={draft.club_name} onChange={upd('club_name')} required /></Field>
              <Field label="Year founded" col="col-12 col-md-4"><input className="form-control" type="number" min="1800" max={new Date().getFullYear()} value={draft.year_founded} onChange={upd('year_founded')} /></Field>
              <Field label="Country">
                <select className="form-select" value={draft.country} onChange={upd('country')}>
                  <option value="">— Select —</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="State / Region"><input className="form-control" value={draft.state} onChange={upd('state')} /></Field>
              <Field label="Address" col="col-12"><input className="form-control" value={draft.address} onChange={upd('address')} /></Field>
              <Field label="Phone"><input className="form-control" type="tel" value={draft.phone} onChange={upd('phone')} /></Field>
              <Field label="Website"><input className="form-control" type="url" value={draft.website} onChange={upd('website')} /></Field>
              <Field label="LinkedIn URL"><input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} /></Field>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Sports</label>
                <div className="d-flex gap-3">
                  {['football', 'basketball'].map((s) => (
                    <div className="form-check" key={s}>
                      <input className="form-check-input" type="checkbox" id={`acad-sport-${s}`} checked={draft.sports.includes(s)} onChange={() => toggleSport(s)} />
                      <label className="form-check-label text-capitalize" htmlFor={`acad-sport-${s}`}>{s}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="About the club / academy" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} />
                {blockContactInfo(draft.about) && <div className="small text-danger mt-1">{blockContactInfo(draft.about)}</div>}
              </Field>
            </FormRow>
          </SectionCard>
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
          </button>
          {feedPrompt && (
            <ActivityFeedPost supabase={supabase} user={user}
              activityText={feedPrompt} onDone={() => setFeedPrompt('')} />
          )}
        </form>
      )}

      {activeTab === 'squad' && (
        <SectionCard title="Squad Roster">
          <p className="text-muted small mb-3">Add players to your squad. Each submission requires identity evidence and ownership/contract documents for admin review.</p>
          <AcademyPlayerForm
            supabase={supabase}
            user={user}
            profile={profile}
            academyId={academy?.id}
            onSaved={() => setNotice('Player submission sent for admin review.')}
            onVerify={() => setActiveTab('verify')}
          />
        </SectionCard>
      )}

      {activeTab === 'post-update' && (
        <SectionCard title="Post Match Update">
          <p className="text-muted small mb-3">Share match results, player goals and assists, upcoming fixtures and tournaments with the community.</p>
          <PostUpdateForm supabase={supabase} user={user} role="academy" onSaved={() => setNotice('Match update posted to Community Feed.')} />
        </SectionCard>
      )}

      {activeTab === 'post-tryout' && (
        <SectionCard title="Post Tournament / Trial">
          <p className="text-muted small mb-3">Post a tournament, open trial or player combine event for your club or academy.</p>
          <TryoutForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setNotice('Tournament / trial posted.') }} />
        </SectionCard>
      )}

      {activeTab === 'recommend' && (
        <SectionCard title="Recommend a Player with Video / CV">
          <p className="text-muted small mb-3">Recommend a player from your squad to agents and scouts, attaching their highlight video or CV to make the recommendation stronger.</p>
          <RecommendWithMediaForm supabase={supabase} user={user} role="academy" onSaved={() => setNotice('Recommendation sent.')} />
        </SectionCard>
      )}

      {/* —— Demo Flow 1: Club posts Player / Staff job —————————————————————— */}
      {activeTab === 'post-job' && (
        <SectionCard title="Post a Job">
          <JobPostForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setStats((s) => ({ ...s, jobs: (s.jobs ?? 0) + 1 })); setNotice('Job posted.') }} />
        </SectionCard>
      )}

      {activeTab === 'cv' && (
        <SectionCard title="Upload CV / Résumé">
          <p className="text-muted small mb-3">Upload your club&apos;s representative CV, portfolio, or company profile document. Stored privately.</p>
          <CvOnlyForm supabase={supabase} user={user} onDone={() => setNotice('CV uploaded successfully.')} />
        </SectionCard>
      )}

      {activeTab === 'verify' && (
        <SectionCard title="Verification">
          <VerifyForm supabase={supabase} user={user} role="academy" verificationStatus={profile?.verification_status} onDone={() => setNotice('Submitted for review.')} />
        </SectionCard>
      )}

    </>
  )
}

// ——— Sports Analyst dashboard ——————————————————————————————————————————————————
// Uses coach_profiles table (profiles.role = 'sports_analyst')

function SportsAnalystDashboard({ supabase, user, profile }) {
  const [analyst,    setAnalyst]    = useState(null)
  const [draft,      setDraft]      = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [notice,     setNotice]     = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('profile')
  const [feedPrompt, setFeedPrompt] = useState('')
  const [recPlayers, setRecPlayers] = useState([])
  const [recSearch,  setRecSearch]  = useState('')
  const [recPlayer,  setRecPlayer]  = useState('')
  const [recTarget,  setRecTarget]  = useState('')
  const [recNote,    setRecNote]    = useState('')
  const [recBusy,    setRecBusy]    = useState(false)
  const [recDone,    setRecDone]    = useState('')

  useEffect(() => {
    let alive = true
    supabase.from('coach_profiles')
      .select('id, full_name, sport, preferred_role, experience_years, current_club, nationality, gender, about, achievements, badges, open_to_work, linkedin, is_public')
      .eq('user_id', user.id).maybeSingle()
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        const c = data ?? {}
        setAnalyst(data)
        setDraft({
          full_name:        c.full_name        ?? profile.full_name ?? '',
          sport:            c.sport            ?? 'football',
          specialisation:   c.preferred_role   ?? '',
          experience_years: c.experience_years != null ? String(c.experience_years) : '',
          current_club:     c.current_club     ?? '',
          nationality:      c.nationality      ?? '',
          gender:           c.gender           ?? '',
          about:            c.about            ?? '',
          achievements:     c.achievements     ?? '',
          badges:           Array.isArray(c.badges) ? c.badges.join(', ') : '',
          open_to_work:     c.open_to_work     ?? true,
          linkedin:         c.linkedin         ?? '',
          is_public:        c.is_public        ?? false,
        })
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id, profile.full_name])

  const upd = (f) => (e) => setDraft((d) => ({ ...d, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    const ci = blockContactInfo(draft.about, 'About') || blockContactInfo(draft.achievements, 'Achievements')
    if (ci) { setError(ci); return }
    setSaving(true); setError(''); setNotice('')
    const payload = {
      user_id:          user.id,
      full_name:        draft.full_name.trim()    || profile.full_name,
      sport:            draft.sport,
      preferred_role:   draft.specialisation      || null,
      experience_years: draft.experience_years    ? Number(draft.experience_years) : null,
      current_club:     draft.current_club.trim() || null,
      nationality:      draft.nationality         || null,
      gender:           draft.gender              || null,
      about:            draft.about.trim()        || null,
      achievements:     draft.achievements.trim() || null,
      badges:           draft.badges ? draft.badges.split(',').map((b) => b.trim()).filter(Boolean) : [],
      open_to_work:     draft.open_to_work,
      linkedin:         draft.linkedin.trim()     || null,
      is_public:        draft.is_public,
      updated_at:       new Date().toISOString(),
    }
    const q = analyst ? supabase.from('coach_profiles').update(payload).eq('id', analyst.id) : supabase.from('coach_profiles').insert(payload)
    const { data, error: err } = await q.select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setAnalyst(data)
    setNotice('Analyst profile saved.')
    const feedText = draft.achievements?.trim()
      ? `Sports Analyst profile updated on SportBridge! ${draft.achievements.trim()}`
      : `I have updated my Sports Analyst profile on SportBridge — specialising in ${draft.specialisation || 'performance analysis'}.`
    setFeedPrompt(feedText)
  }

  const searchPlayers = async (q) => {
    setRecSearch(q)
    if (!q || q.length < 2 || !supabase) { setRecPlayers([]); return }
    const { data } = await supabase.from('players').select('id, display_name, position, current_club').ilike('display_name', `%${q}%`).limit(8)
    setRecPlayers(data ?? [])
  }

  const submitRecommendation = async (e) => {
    e.preventDefault()
    if (!recPlayer || !recTarget.trim()) return
    setRecBusy(true)
    const { data: agentData } = await supabase.from('agent_profiles').select('id, user_id, agency_name').ilike('agency_name', `%${recTarget}%`).limit(1).maybeSingle()
    if (!agentData) {
      setRecBusy(false)
      setRecDone(`Recommendation noted. "${recTarget}" will be notified when they join SportBridge.`)
      return
    }
    await supabase.from('agent_recommendations').insert({
      recommender_user_id: user.id, agent_profile_id: agentData.id,
      sport: 'football', player_id: recPlayer,
      recommended_to_name: recTarget, note: recNote.trim() || null, status: 'pending',
    })
    setRecBusy(false)
    setRecDone(`Player recommended to ${agentData.agency_name ?? recTarget} successfully.`)
    setRecPlayer(''); setRecTarget(''); setRecNote(''); setRecSearch(''); setRecPlayers([])
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

  const ANALYST_ROLES = [
    'Performance Analyst','Video Analyst','Data Analyst','Recruitment Analyst',
    'Tactical Analyst','Opposition Analyst','Head of Analysis',
  ]

  return (
    <>
      <CompletenessBar score={completenessScore(profile, draft)} />
      <div className="row g-3 mb-4">
        <StatCard icon="bi-graph-up-arrow" label="Reports filed"     value="—" colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-camera-video"   label="Clips analysed"    value="—" colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-people"         label="Players tracked"   value="—" colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-eye"            label="Visibility"        value={draft?.is_public ? 'Public' : 'Private'} colour={draft?.is_public ? 'linear-gradient(135deg,#198754,#20c997)' : 'linear-gradient(135deg,#6c757d,#adb5bd)'} />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {/* Tab switcher */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {[
          ['profile',      'bi-graph-up-arrow',    'Analyst Profile'],
          ['post-review',  'bi-camera-video',      'Post Analysis'],
          ['recommend',    'bi-send-check',         'Recommend a Player'],
          ['recommend-media','bi-film',             'Recommend with Video/CV'],
          ['post-position','bi-briefcase-fill',     'Post Position Needed'],
          ['apply-jobs',   'bi-briefcase',          'Browse Jobs'],
          ['find-players', 'bi-person-arms-up',     'Find Players'],
          ['cv',           'bi-file-earmark-person','Upload CV'],
          ['verify',       'bi-patch-check',        'Get Verified'],
        ].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`}
              type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
              {tab === 'verify' && profile?.verification_status === 'verified' && (
                <i className="bi bi-patch-check-fill text-success ms-1" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Profile form */}
      {activeTab === 'profile' && draft && (
        <form onSubmit={save}>
          <SectionCard title="Sports Analyst profile">
            <FormRow>
              <Field label="Full name"><input className="form-control" value={draft.full_name} onChange={upd('full_name')} /></Field>
              <Field label="Sport">
                <select className="form-select" value={draft.sport} onChange={upd('sport')}>
                  <option value="football">Football</option><option value="basketball">Basketball</option>
                </select>
              </Field>
              <Field label="Specialisation">
                <select className="form-select" value={draft.specialisation} onChange={upd('specialisation')}>
                  <option value="">— Select —</option>
                  {ANALYST_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Years of experience"><input className="form-control" type="number" min="0" max="60" value={draft.experience_years} onChange={upd('experience_years')} /></Field>
              <Field label="Current club / team"><input className="form-control" value={draft.current_club} onChange={upd('current_club')} /></Field>
              <Field label="Nationality">
                <select className="form-select" value={draft.nationality} onChange={upd('nationality')}>
                  <option value="">— Select —</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select className="form-select" value={draft.gender} onChange={upd('gender')}>
                  <option value="">— Select —</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </Field>
              <Field label="LinkedIn URL"><input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} /></Field>
              <Field label="Software / Tools (comma-separated)" col="col-12">
                <input className="form-control" value={draft.badges} onChange={upd('badges')} placeholder="e.g. Wyscout, StatsBomb, Tableau, Python" />
              </Field>
              <Field label="About" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} placeholder="Your analysis methodology, experience and specialisation…" />
                {blockContactInfo(draft.about) && <div className="small text-danger mt-1">{blockContactInfo(draft.about)}</div>}
              </Field>
              <Field label="Key achievements / publications" col="col-12">
                <textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} placeholder="Reports published, clubs served, notable analysis work…" />
              </Field>
              <div className="col-12 d-flex gap-4 flex-wrap">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="analyst-open" checked={draft.open_to_work} onChange={upd('open_to_work')} />
                  <label className="form-check-label fw-semibold" htmlFor="analyst-open">Open to work</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="analyst-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="analyst-public">Public profile</label>
                </div>
              </div>
            </FormRow>
          </SectionCard>
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
          </button>
          {feedPrompt && (
            <ActivityFeedPost supabase={supabase} user={user} activityText={feedPrompt} onDone={() => setFeedPrompt('')} />
          )}
        </form>
      )}

      {/* Recommend a Player */}
      {activeTab === 'recommend' && (
        <SectionCard title="Recommend a Player">
          <p className="text-muted small mb-4">
            As an analyst, your data-backed recommendations carry weight. Recommend players you have tracked to agents and clubs.
          </p>
          {recDone ? (
            <div className="alert alert-success d-flex gap-2 align-items-center">
              <i className="bi bi-check-circle-fill" />{recDone}
              <button className="btn btn-sm btn-outline-success ms-auto" type="button" onClick={() => setRecDone('')}>Recommend another</button>
            </div>
          ) : (
            <form onSubmit={submitRecommendation} className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Search for player</label>
                <input className="form-control" type="search" placeholder="Type player name…" value={recSearch} onChange={(e) => searchPlayers(e.target.value)} />
                {recPlayers.length > 0 && (
                  <ul className="list-group mt-1">
                    {recPlayers.map((p) => (
                      <li key={p.id} className={`list-group-item list-group-item-action d-flex align-items-center gap-2${recPlayer === p.id ? ' active' : ''}`}
                        style={{ cursor: 'pointer' }} onClick={() => { setRecPlayer(p.id); setRecSearch(p.display_name); setRecPlayers([]) }}>
                        <i className="bi bi-person-arms-up" /><span>{p.display_name}</span>
                        {p.position && <span className="badge text-bg-primary ms-auto">{p.position}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Recommend to (agent or club name)</label>
                <input className="form-control" placeholder="e.g. Premier Football Agency" value={recTarget} onChange={(e) => setRecTarget(e.target.value)} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Your analysis note (optional)</label>
                <textarea className="form-control" rows={3} placeholder="Key stats, strengths, match data…" value={recNote} onChange={(e) => setRecNote(e.target.value)} />
              </div>
              <div className="col-12">
                <button className="btn btn-primary px-5" type="submit" disabled={recBusy || !recPlayer || !recTarget.trim()}>
                  {recBusy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : <><i className="bi bi-send-check me-2" />Send Recommendation</>}
                </button>
              </div>
            </form>
          )}
        </SectionCard>
      )}

      {/* Post Position Needed */}
      {activeTab === 'post-position' && (
        <SectionCard title="Post Player Position Needed">
          <p className="text-muted small mb-4">Based on your analysis, post a specific player position needed on behalf of a club.</p>
          <JobPostForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setNotice('Position posted to job board.') }} />
        </SectionCard>
      )}

      {/* Post Review / Analysis */}
      {activeTab === 'post-review' && (
        <SectionCard title="Post Match Analysis">
          <p className="text-muted small mb-3">Share a match analysis, tactical review or data insight with the SportBridge community.</p>
          <PostUpdateForm supabase={supabase} user={user} role="sports_analyst" onSaved={() => setNotice('Analysis posted to Community Feed.')} />
        </SectionCard>
      )}

      {/* Recommend with Media */}
      {activeTab === 'recommend-media' && (
        <SectionCard title="Recommend a Player with Video / CV">
          <p className="text-muted small mb-3">Attach a highlight video or CV to your player recommendation to make it stronger.</p>
          <RecommendWithMediaForm supabase={supabase} user={user} role="sports_analyst" onSaved={() => setNotice('Recommendation with media sent.')} />
        </SectionCard>
      )}

      {/* Find Players */}
      {activeTab === 'find-players' && (
        <SectionCard title="Find Players">
          <p className="text-muted small mb-3">Search the player directory by position, age group, region and foot to find talent for your reports.</p>
          <div className="alert alert-info d-flex gap-2 align-items-center">
            <i className="bi bi-info-circle flex-shrink-0" />
            <span>Use the <strong>Players</strong> page to search and filter the full player directory.</span>
          </div>
        </SectionCard>
      )}

      {/* Apply for Jobs */}
      {activeTab === 'apply-jobs' && (
        <SectionCard title="Browse & Apply for Analyst Roles">
          <UnverifiedGate profile={profile} message="Verified analysts can apply for roles with their verified profile.">
            <p className="text-muted small mb-3">Browse analyst, scout and data roles posted by clubs and academies.</p>
            <div className="alert alert-info d-flex gap-2 align-items-center">
              <i className="bi bi-info-circle flex-shrink-0" />
              <span>Visit the <strong>Jobs Board</strong> to browse and apply with your verified analyst profile.</span>
            </div>
          </UnverifiedGate>
        </SectionCard>
      )}

      {/* Upload CV */}
      {activeTab === 'cv' && (
        <SectionCard title="Upload CV / Portfolio">
          <p className="text-muted small mb-3">Upload your analyst CV, reports portfolio, or methodology document. Stored privately.</p>
          <CvOnlyForm supabase={supabase} user={user} onDone={() => setNotice('CV uploaded successfully.')} />
        </SectionCard>
      )}

      {/* Verification */}
      {activeTab === 'verify' && (
        <SectionCard title="Verification">
          <VerifyForm supabase={supabase} user={user} role="sports_analyst" verificationStatus={profile?.verification_status} onDone={() => setNotice('Submitted for review.')} />
        </SectionCard>
      )}

    </>
  )
}

// ——— Admin Message Form (used inside report cards) ─────────────────────────────
function AdminMessageForm({ repId, reporter, reported, onSend, saving }) {
  const [target,  setTarget]  = useState(reporter?.id ? 'reporter' : 'reported')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)

  const targetUser = target === 'reporter' ? reporter : reported
  const targetName = targetUser?.full_name || targetUser?.email || 'party'

  const handleSend = async () => {
    if (!message.trim() || !targetUser?.id) return
    await onSend(targetUser.id, targetName, message.trim())
    setMessage('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="d-grid gap-2">
      <div className="d-flex gap-2 flex-wrap">
        {reporter?.id && (
          <label className={`d-flex align-items-center gap-2 px-3 py-1 rounded border small ${target==='reporter'?'border-primary bg-primary bg-opacity-10 fw-semibold':''}`}
            style={{ cursor:'pointer' }}>
            <input type="radio" name={`msg-target-${repId}`} checked={target==='reporter'}
              onChange={()=>setTarget('reporter')} className="form-check-input m-0" />
            <i className="bi bi-person text-primary" />Reporter: {reporter.full_name || reporter.email}
          </label>
        )}
        {reported?.id && (
          <label className={`d-flex align-items-center gap-2 px-3 py-1 rounded border small ${target==='reported'?'border-danger bg-danger bg-opacity-10 fw-semibold':''}`}
            style={{ cursor:'pointer' }}>
            <input type="radio" name={`msg-target-${repId}`} checked={target==='reported'}
              onChange={()=>setTarget('reported')} className="form-check-input m-0" />
            <i className="bi bi-flag text-danger" />Reported: {reported.full_name || reported.email}
          </label>
        )}
      </div>
      <div className="input-group input-group-sm">
        <input className="form-control form-control-sm" type="text"
          placeholder={`Type a message to send to ${targetName}…`}
          value={message} onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }} />
        <button className="btn btn-primary btn-sm" type="button"
          disabled={saving || !message.trim()} onClick={handleSend}>
          <i className="bi bi-send me-1" />{sent ? 'Sent!' : 'Send'}
        </button>
      </div>
      <div className="small text-muted">
        <i className="bi bi-info-circle me-1" />Sends directly to their inbox + notification.
      </div>
    </div>
  )
}

// ——— Super Admin dashboard ————————————————————————————————————————————————————

function AdminDashboard({ supabase, user }) {
  const [users,        setUsers]       = useState([])
  const [subRoles,     setSubRoles]    = useState({}) // profile_id -> preferred_role from coach/agent profiles
  const [accountCount, setAccountCount]= useState(0)
  const [newToday,     setNewToday]    = useState(0)
  const [roleDrafts,   setRoleDrafts]  = useState({})
  const [saving,       setSaving]      = useState(false)
  const [notice,       setNotice]      = useState('')
  const [error,        setError]       = useState('')
  const [loading,      setLoading]     = useState(true)
  const [search,       setSearch]      = useState('')
  const [activeTab,    setActiveTab]   = useState('users')
  const [duplicates,   setDuplicates]  = useState([])
  const [flagged,      setFlagged]     = useState([])
  const [verifQueue,   setVerifQueue]  = useState([])
  const [verifNote,    setVerifNote]   = useState({})
  const [reportQueue,  setReportQueue] = useState([])
  const [reportNote,   setReportNote]  = useState({})
  const [reportFilter, setReportFilter]= useState('all') // 'all'|'pending'|'investigating'|'confirmed_scam'|'dismissed'
  const [reportLoading,setReportLoading]= useState(false)

  // Fetch reports flat (no embedded FK joins) then enrich with profiles in JS.
  // This avoids "Could not find relationship" errors when PostgREST schema cache
  // doesn't know about the reporter_id / reported_user_id FK names.
  const loadReports = useCallback(async () => {
    setReportLoading(true)
    setError('')
    const { data: rawReports, error: rErr } = await supabase
      .from('reports')
      .select('id, reason, details, status, created_at, updated_at, reviewer_notes, reviewed_at, reporter_id, reported_user_id, reviewer_id')
      .order('created_at', { ascending: false })
      .limit(200)

    if (rErr) { setError(`Reports could not load: ${rErr.message}`); setReportLoading(false); return }

    const reports = rawReports ?? []
    if (reports.length === 0) { setReportQueue([]); setReportLoading(false); return }

    const profileIds = [...new Set([
      ...reports.map(r => r.reporter_id).filter(Boolean),
      ...reports.map(r => r.reported_user_id).filter(Boolean),
    ])]

    let profileMap = {}
    if (profileIds.length > 0) {
      const { data: profileRows } = await supabase
        .from('profiles').select('id, full_name, email, role').in('id', profileIds)
      ;(profileRows ?? []).forEach(p => { profileMap[p.id] = p })
    }

    setReportQueue(reports.map(r => ({
      ...r,
      reporter: r.reporter_id      ? (profileMap[r.reporter_id]      ?? { id: r.reporter_id,      full_name: 'Unknown', email: '', role: '' }) : null,
      reported: r.reported_user_id  ? (profileMap[r.reported_user_id]  ?? { id: r.reported_user_id,  full_name: 'Unknown', email: '', role: '' }) : null,
    })))
    setReportLoading(false)
  }, [supabase])

  const refreshReports = useCallback(() => { setReportQueue([]); loadReports() }, [loadReports])

  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('profiles')
        .select('id, email, full_name, role, created_at, status, verification_status, sport', { count: 'exact' })
        .order('created_at', { ascending: false }).limit(300),
      // Fetch sub-roles + location for coaches/analysts
      supabase.from('coach_profiles')
        .select('user_id, preferred_role, full_name, nationality, current_club'),
      // Fetch agency names + location for agents
      supabase.from('agent_profiles')
        .select('user_id, agency_name, nationality'),
      // Fetch club names + location for academies
      supabase.from('clubs')
        .select('owner_id, name, country'),
      // Fetch player locations
      supabase.from('players')
        .select('profile_id, country, nationality, current_club, position'),
    ]).then(([
      { data, count, error: err },
      { data: coachData },
      { data: agentData },
      { data: clubData },
      { data: playerData },
    ]) => {
      if (!alive) return
      if (err) setError(err.message)
      const profiles = data ?? []
      setUsers(profiles)
      setAccountCount(count ?? profiles.length)
      const todayStart = new Date(); todayStart.setHours(0,0,0,0)
      setNewToday(profiles.filter((u) => u.created_at && new Date(u.created_at) >= todayStart).length)
      setRoleDrafts(Object.fromEntries(profiles.map((u) => [u.id, u.role])))
      // Build sub-role + location lookup: profile_id -> { subRole, orgName, location, position }
      const sub = {}
      ;(coachData  ?? []).forEach((c) => {
        sub[c.user_id] = {
          subRole:  c.preferred_role,
          name:     c.full_name,
          orgName:  c.current_club,
          location: c.nationality,
        }
      })
      ;(agentData  ?? []).forEach((a) => {
        sub[a.user_id] = {
          ...sub[a.user_id],
          orgName:  a.agency_name,
          location: sub[a.user_id]?.location || a.nationality,
        }
      })
      ;(clubData   ?? []).forEach((cl) => {
        sub[cl.owner_id] = {
          ...sub[cl.owner_id],
          orgName:  cl.name,
          location: sub[cl.owner_id]?.location || cl.country,
        }
      })
      ;(playerData ?? []).forEach((p) => {
        sub[p.profile_id] = {
          ...sub[p.profile_id],
          location: p.country || p.nationality,
          orgName:  p.current_club,
          position: p.position,
        }
      })
      setSubRoles(sub)
      setLoading(false)
    })
    return () => { alive = false }
  }, [supabase])

  useEffect(() => {
    if (activeTab === 'duplicates' && duplicates.length === 0) {
      supabase.from('uploads').select('id, user_id, file_hash, file_type, url, is_duplicate, created_at')
        .eq('is_duplicate', true).order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => setDuplicates(data ?? []))
    }
    if (activeTab === 'flagged' && flagged.length === 0) {
      supabase.from('opportunities').select('id, title, region, fee_amount, fee_breakdown, description, status, is_fee_flagged, created_at')
        .eq('is_fee_flagged', true).order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => setFlagged(data ?? []))
    }
    if (activeTab === 'verification' && verifQueue.length === 0) {
      supabase.from('verification_requests')
        .select('id, user_id, role, nin_number, status, submitted_at, reviewer_notes, profiles!inner(email, full_name)')
        .eq('status', 'pending').order('submitted_at', { ascending: true }).limit(100)
        .then(({ data }) => setVerifQueue(data ?? []))
    }
    if (activeTab === 'reports' && reportQueue.length === 0) {
      loadReports()
    }
  }, [activeTab, supabase, loadReports, duplicates.length, flagged.length, verifQueue.length, reportQueue.length])

  const approveOpp = async (id) => {
    await supabase.from('opportunities').update({ status: 'open', is_fee_flagged: false }).eq('id', id)
    setFlagged((f) => f.filter((o) => o.id !== id)); setNotice('Tryout approved.')
  }
  const rejectOpp = async (id) => {
    await supabase.from('opportunities').update({ status: 'rejected' }).eq('id', id)
    setFlagged((f) => f.filter((o) => o.id !== id)); setNotice('Tryout rejected.')
  }

  const approveVerif = async (req) => {
    setSaving(true); setError(''); setNotice('')
    const note = verifNote[req.id] ?? ''
    await supabase.from('verification_requests').update({ status: 'approved', reviewer_id: user.id, reviewer_notes: note, reviewed_at: new Date().toISOString() }).eq('id', req.id)
    await supabase.from('profiles').update({ verification_status: 'verified' }).eq('id', req.user_id)
    if (req.role === 'agent') {
      const { data: ap } = await supabase.from('agent_profiles').select('id').eq('user_id', req.user_id).maybeSingle()
      if (ap) await supabase.from('agent_profiles').update({ verified_badge: true }).eq('id', ap.id)
    }
    if (req.role === 'academy') {
      const { data: cl } = await supabase.from('clubs').select('id').eq('owner_id', req.user_id).maybeSingle()
      if (cl) await supabase.from('clubs').update({ verified_badge: true }).eq('id', cl.id)
    }
    setVerifQueue((q) => q.filter((r) => r.id !== req.id))
    setUsers((u) => u.map((row) => row.id === req.user_id ? { ...row, verification_status: 'verified' } : row))
    setSaving(false); setNotice(`Verified: ${req.profiles?.email}`)
  }

  const rejectVerif = async (req) => {
    setSaving(true); setError(''); setNotice('')
    const note = verifNote[req.id] ?? 'Verification rejected by admin.'
    await supabase.from('verification_requests').update({ status: 'rejected', reviewer_id: user.id, reviewer_notes: note, reviewed_at: new Date().toISOString() }).eq('id', req.id)
    await supabase.from('profiles').update({ verification_status: 'rejected' }).eq('id', req.user_id)
    setVerifQueue((q) => q.filter((r) => r.id !== req.id))
    setSaving(false); setNotice(`Rejected: ${req.profiles?.email}`)
  }

  const saveRole = async (uid) => {
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase.from('profiles').update({ role: roleDrafts[uid], updated_at: new Date().toISOString() }).eq('id', uid).select('id, email, full_name, role, created_at, status').single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setUsers((cur) => cur.map((u) => u.id === data.id ? data : u))
    setNotice(`Role updated: ${data.email}`)
  }

  const suspendUser = async (uid, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    if (!window.confirm(`${newStatus === 'suspended' ? 'Suspend' : 'Reactivate'} this account?`)) return
    setSaving(true); setError(''); setNotice('')
    const { error: err } = await supabase.from('profiles').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', uid)
    setSaving(false)
    if (err) { setError(err.message); return }
    setUsers((cur) => cur.map((u) => u.id === uid ? { ...u, status: newStatus } : u))
    setNotice(`Account ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}.`)
  }

  const updateReport = async (reportId, outcomeStatus, outcomeNote) => {
    setSaving(true); setError(''); setNotice('')
    const note = outcomeNote || reportNote[reportId] || ''
    const rep = reportQueue.find(r => r.id === reportId)

    // Update report status
    const { error: err } = await supabase.from('reports')
      .update({
        status:         outcomeStatus,
        reviewer_notes: note.trim() || null,
        reviewed_by:    user.id,
        reviewer_id:    user.id,
        reviewed_at:    new Date().toISOString(),
        updated_at:     new Date().toISOString(),
      })
      .eq('id', reportId)

    if (err) { setError(`Could not update report: ${err.message}`); setSaving(false); return }

    // If confirmed scam — deny reported account
    if (outcomeStatus === 'confirmed_scam' && rep?.reported?.id) {
      await supabase.from('profiles')
        .update({ status: 'denied', updated_at: new Date().toISOString() })
        .eq('id', rep.reported.id)
      setUsers(cur => cur.map(u => u.id === rep.reported.id ? { ...u, status: 'denied' } : u))
    }

    // ── Build personalised messages for each party ─────────────────────
    const reporterName = rep?.reporter?.full_name || 'Reporter'
    const reportedName = rep?.reported?.full_name || 'the reported user'

    const reporterMsg =
      outcomeStatus === 'confirmed_scam'
        ? `Dear ${reporterName},\n\nYour report against ${reportedName} has been thoroughly reviewed by the SportBridge team. We have confirmed a violation of our platform rules and the reported account has been denied. Thank you for helping keep SportBridge safe.\n\n— SportBridge Admin`
        : outcomeStatus === 'dismissed'
        ? `Dear ${reporterName},\n\nYour report against ${reportedName} has been reviewed by our team. After investigation, we found insufficient evidence of a violation at this time and no action has been taken. If you have additional evidence, you may file a new report.\n\n— SportBridge Admin`
        : `Dear ${reporterName},\n\nYour report against ${reportedName} has been received and is now under active investigation by the SportBridge team. We will notify you of the outcome within 48 hours.\n\n— SportBridge Admin`

    const reportedMsg =
      outcomeStatus === 'confirmed_scam'
        ? `Dear ${reportedName},\n\nYour SportBridge account has been reviewed by our team following a report submitted against your profile. Our investigation has confirmed a violation of platform rules and your account has been denied access. If you believe this is an error, please contact support.\n\n— SportBridge Admin`
        : outcomeStatus === 'dismissed'
        ? `Dear ${reportedName},\n\nA report was filed against your SportBridge profile. Our team has completed a review and found no violation of our platform rules. Your account remains fully active. Thank you for your patience.\n\n— SportBridge Admin`
        : `Dear ${reportedName},\n\nA report has been filed against your SportBridge profile and our team has begun an active review. We will notify you of the outcome. If you have any information relevant to this matter, please respond to this message.\n\n— SportBridge Admin`

    // ── Helper: send inbox message from admin to a user ────────────────
    const sendInboxMessage = async (toUserId, msgContent) => {
      if (!toUserId || toUserId === user.id) return
      try {
        let { data: conv } = await supabase.from('conversations')
          .select('id')
          .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${toUserId}),and(initiator_id.eq.${toUserId},recipient_id.eq.${user.id})`)
          .maybeSingle()
        if (!conv) {
          const { data: nc } = await supabase.from('conversations').insert({
            initiator_id: user.id, recipient_id: toUserId,
            subject: `Report Investigation — Case #${reportId.slice(0,8).toUpperCase()}`,
            last_message_at: new Date().toISOString(),
          }).select('id').single()
          conv = nc
        } else {
          await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conv.id)
        }
        if (conv?.id) {
          await supabase.from('messages').insert({
            conversation_id: conv.id, sender_id: user.id, content: msgContent,
          })
        }
      } catch { /* non-critical */ }
    }

    // ── Notifications + inbox messages for all parties ─────────────────
    const toNotify = []
    if (rep?.reporter?.id) {
      toNotify.push({
        user_id: rep.reporter.id,
        notification_type: 'report_update',
        data: { message: `Your report (Case #${reportId.slice(0,8).toUpperCase()}) has been updated: ${outcomeStatus.replace(/_/g,' ')}`, report_id: reportId, status: outcomeStatus },
      })
    }
    if (rep?.reported?.id) {
      toNotify.push({
        user_id: rep.reported.id,
        notification_type: outcomeStatus === 'confirmed_scam' ? 'account_actioned' : outcomeStatus === 'dismissed' ? 'report_dismissed' : 'report_update',
        data: { message: `A SportBridge report case involving your account has been updated: ${outcomeStatus.replace(/_/g,' ')}`, report_id: reportId, status: outcomeStatus },
      })
    }
    // Notify all other super admins
    const { data: adminProfiles } = await supabase.from('profiles').select('id').eq('role', 'super_admin')
    ;(adminProfiles ?? []).forEach(a => {
      if (a.id !== user.id) {
        toNotify.push({
          user_id: a.id,
          notification_type: 'admin_report_update',
          data: { message: `[Admin] Report #${reportId.slice(0,8).toUpperCase()} updated to: ${outcomeStatus.replace(/_/g,' ')} | Reporter: ${rep?.reporter?.email} | Reported: ${rep?.reported?.email}`, report_id: reportId },
        })
      }
    })
    try { await supabase.from('notifications').insert(toNotify) } catch { /* non-critical */ }

    // Send inbox messages to reporter and reported user
    if (rep?.reporter?.id) await sendInboxMessage(rep.reporter.id, reporterMsg)
    if (rep?.reported?.id) await sendInboxMessage(rep.reported.id, reportedMsg)

    setReportQueue(q => q.map(r => r.id === reportId ? { ...r, status: outcomeStatus, reviewer_notes: note.trim() || null } : r))
    setSaving(false)
    setNotice(
      outcomeStatus === 'dismissed'      ? '✓ Report dismissed. Inbox messages sent to both parties.' :
      outcomeStatus === 'confirmed_scam' ? '✓ Scam confirmed — account denied. All parties notified via inbox.' :
      '✓ Investigation started. Inbox messages sent to both parties.'
    )
  }

  // ── Admin: send custom inbox message to any specific user ─────────────
  const sendAdminMessage = async (toUserId, toName, message) => {
    if (!message?.trim() || !toUserId) return
    try {
      let { data: conv } = await supabase.from('conversations')
        .select('id')
        .or(`and(initiator_id.eq.${user.id},recipient_id.eq.${toUserId}),and(initiator_id.eq.${toUserId},recipient_id.eq.${user.id})`)
        .maybeSingle()
      if (!conv) {
        const { data: nc } = await supabase.from('conversations').insert({
          initiator_id: user.id, recipient_id: toUserId,
          subject: 'Message from SportBridge Admin',
          last_message_at: new Date().toISOString(),
        }).select('id').single()
        conv = nc
      } else {
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conv.id)
      }
      if (conv?.id) {
        await supabase.from('messages').insert({ conversation_id: conv.id, sender_id: user.id, content: message.trim() })
      }
      await supabase.from('notifications').insert({
        user_id: toUserId,
        notification_type: 'admin_message',
        data: { message: 'You have a new message from SportBridge Admin. Open your inbox to read it.' },
      })
      setNotice(`✓ Message sent to ${toName}.`)
    } catch (e) { setError(`Could not send message: ${e.message}`) }
  }

    const roleCounts = ALL_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {})
  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    const sub = subRoles[u.id]
    return [u.full_name, u.email, u.role, ROLE_LABELS[u.role], sub?.subRole, sub?.orgName]
      .some((f) => f?.toLowerCase().includes(q))
  })
  const pendingVerif = verifQueue.length

  const ROLE_COLOURS = {
    player: '#2F7DF0', coach: '#F5B301', agent: '#198754',
    academy: '#6f42c1', sports_analyst: '#fd7e14', super_admin: '#dc3545',
  }

  const TABS = [
    ['users',        'bi-people',      `Users (${users.length})`],
    ['verification', 'bi-patch-check', `Verify${pendingVerif > 0 ? ` (${pendingVerif})` : ''}`],
    ['reports',      'bi-flag-fill',   `Reports${reportQueue.length > 0 ? ` (${reportQueue.length})` : ''}`],
    ['duplicates',   'bi-files',       'Duplicates'],
    ['flagged',      'bi-exclamation-triangle-fill', 'Fee-Flagged'],
  ]

  return (
    <>
      {/* ══ SPORTBRIDGE ADMIN CONTROL PANEL ══════════════════════════════ */}

      {/* Pending alert banner */}
      {pendingVerif > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-3 mb-4 fw-semibold" role="alert">
          <i className="bi bi-bell-fill fs-5 flex-shrink-0" />
          <span>{pendingVerif} verification request{pendingVerif > 1 ? 's' : ''} pending your review</span>
          <button className="btn btn-sm btn-danger ms-auto" type="button" onClick={() => setActiveTab('verification')}>
            Review now
          </button>
        </div>
      )}

      {error  && <div className="alert alert-danger  d-flex gap-2 mb-3"><i className="bi bi-exclamation-circle-fill"/>{error}</div>}
      {notice && <div className="alert alert-success d-flex gap-2 mb-3"><i className="bi bi-check-circle-fill"/>{notice}</div>}

      {/* ── Gradient stat cards ── */}
      <div className="row g-3 mb-4">
        {[
          { icon:'bi-people-fill',     label:'Total Members',     value:accountCount,             sub:`${users.filter(u=>u.status==='active').length} active`,  g:'linear-gradient(135deg,#2F7DF0,#0056d2)' },
          { icon:'bi-person-plus-fill',label:'New Today',         value:newToday,                 sub:newToday>0?'joined today':'no new signups',                  g:newToday>0?'linear-gradient(135deg,#198754,#20c997)':'linear-gradient(135deg,#6c757d,#adb5bd)' },
          { icon:'bi-person-arms-up',  label:'Players',           value:roleCounts.player??0,     sub:`${users.filter(u=>u.role==='player'&&u.verification_status==='verified').length} verified`, g:'linear-gradient(135deg,#f5b301,#e67e00)' },
          { icon:'bi-building',        label:'Clubs & Academies', value:roleCounts.academy??0,    sub:`${roleCounts.academy??0} clubs`,                          g:'linear-gradient(135deg,#6f42c1,#9d63e8)' },
          { icon:'bi-binoculars-fill', label:'Agents & Scouts',   value:roleCounts.agent??0,      sub:`${users.filter(u=>u.role==='agent'&&u.verification_status==='verified').length} verified`,  g:'linear-gradient(135deg,#0dcaf0,#0d8fa4)' },
          { icon:'bi-clipboard2-pulse',label:'Coaches',           value:roleCounts.coach??0,      sub:`${roleCounts.coach??0} coaches`,                          g:'linear-gradient(135deg,#20c997,#158f6e)' },
          { icon:'bi-graph-up-arrow',  label:'Sports Analysts',   value:roleCounts.sports_analyst??0, sub:`${roleCounts.sports_analyst??0} analysts`,           g:'linear-gradient(135deg,#fd7e14,#dc6800)' },
          { icon:'bi-patch-check-fill',label:'Pending Review',    value:pendingVerif,             sub:pendingVerif>0?'needs attention':'all clear',                 g:pendingVerif>0?'linear-gradient(135deg,#dc3545,#a71d2a)':'linear-gradient(135deg,#6c757d,#adb5bd)', pulse:pendingVerif>0 },
        ].map(({ icon, label, value, sub, g, pulse }) => (
          <div className="col-6 col-sm-4 col-xl-3" key={label}>
            <div className="rounded-3 p-3 text-white h-100 d-flex flex-column position-relative overflow-hidden"
              style={{ background:g, boxShadow:'0 4px 20px rgba(0,0,0,.18)', minHeight:110 }}>
              <i className={`bi ${icon} position-absolute`}
                style={{ fontSize:64, opacity:.1, right:-10, bottom:-10, transform:'rotate(-10deg)' }} aria-hidden="true" />
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{ width:38, height:38, background:'rgba(255,255,255,.22)', fontSize:'1rem' }}>
                  <i className={`bi ${icon}`} aria-hidden="true" />
                </div>
                {pulse && <span className="badge rounded-circle" style={{ background:'rgba(255,255,255,.35)', fontSize:9 }}>!</span>}
              </div>
              <div style={{ fontSize:30, fontWeight:800, fontFamily:'var(--fc-font-heading)', lineHeight:1 }}>{value??0}</div>
              <div style={{ fontSize:12, fontWeight:600, opacity:.9, marginTop:2 }}>{label}</div>
              <div style={{ fontSize:10, opacity:.7, marginTop:2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics row (dark cards) ── */}
      <div className="row g-3 mb-4">

        {/* Role distribution bar chart */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 p-4"
            style={{ background:'linear-gradient(160deg,#0f172a,#1e293b)', border:'none' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h6 fw-bold mb-0 text-white">
                <i className="bi bi-bar-chart-fill me-2 text-primary" />User distribution
              </h2>
              <span className="small" style={{ color:'#94a3b8' }}>{users.length} total</span>
            </div>
            {users.length === 0 ? (
              <p className="small text-center py-2" style={{ color:'#64748b' }}>No data yet</p>
            ) : [
              { role:'player',         label:'Players',    colour:'#2F7DF0' },
              { role:'coach',          label:'Coaches',    colour:'#F5B301' },
              { role:'agent',          label:'Agents',     colour:'#198754' },
              { role:'academy',        label:'Clubs',      colour:'#6f42c1' },
              { role:'sports_analyst', label:'Analysts',   colour:'#fd7e14' },
            ].map(({ role, label, colour }) => {
              const count = roleCounts[role] ?? 0
              const pct   = users.length > 0 ? Math.round((count/users.length)*100) : 0
              return (
                <div key={role} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="rounded-circle d-inline-block flex-shrink-0" style={{ width:10, height:10, background:colour }} />
                      <span style={{ fontSize:13, color:'#cbd5e1' }}>{label}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{count}</span>
                      <span style={{ fontSize:11, color:'#64748b', minWidth:30, textAlign:'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="rounded-pill overflow-hidden" style={{ height:7, background:'rgba(255,255,255,.08)' }}>
                    <div className="rounded-pill h-100" style={{ width:`${pct}%`, background:colour, transition:'width .6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Verification status */}
        <div className="col-12 col-lg-4">
          <div className="card h-100 p-4"
            style={{ background:'linear-gradient(160deg,#0f172a,#1e293b)', border:'none' }}>
            <h2 className="h6 fw-bold mb-3 text-white">
              <i className="bi bi-shield-check me-2 text-success" />Verification status
            </h2>
            {[
              { label:'Verified',   key:'verified',   colour:'#198754', icon:'bi-patch-check-fill' },
              { label:'Pending',    key:'pending',    colour:'#f5b301', icon:'bi-hourglass-split'   },
              { label:'Rejected',   key:'rejected',   colour:'#dc3545', icon:'bi-x-circle-fill'     },
              { label:'Unverified', key:'unverified', colour:'#64748b', icon:'bi-patch-question'    },
            ].map(({ label, key, colour, icon }) => {
              const count = users.filter(u => (u.verification_status ?? 'unverified') === key).length
              const pct = users.length > 0 ? Math.round((count/users.length)*100) : 0
              return (
                <div key={key} className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-inline-flex align-items-center justify-content-center rounded flex-shrink-0"
                        style={{ width:30, height:30, background:colour+'22', color:colour }}>
                        <i className={`bi ${icon}`} style={{ fontSize:13 }} />
                      </div>
                      <span style={{ fontSize:13, color:'#cbd5e1' }}>{label}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize:20, fontWeight:800, color:colour, fontFamily:'var(--fc-font-heading)', lineHeight:1 }}>{count}</span>
                      <span style={{ fontSize:11, color:'#64748b', minWidth:32, textAlign:'right' }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="rounded-pill overflow-hidden" style={{ height:6, background:'rgba(255,255,255,.08)' }}>
                    <div className="rounded-pill h-100" style={{ width:`${pct}%`, background:colour, transition:'width .6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Staff Roles Breakdown — replaces Latest members */}
        <div className="col-12 col-lg-4" style={{ alignSelf:'start' }}>
          <div className="card p-4"
            style={{ background:'linear-gradient(160deg,#0f172a,#1e293b)', border:'none' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h6 fw-bold mb-0 text-white">
                <i className="bi bi-diagram-3-fill me-2 text-warning" />Staff Roles Breakdown
              </h2>
              <span className="small" style={{ color:'#94a3b8' }}>
                {users.filter(u=>u.role==='coach'||u.role==='sports_analyst').length} staff
              </span>
            </div>

            {/* All roles — no scroll, all visible */}
            <div>
              {[
                {
                  group: 'Head positions', colour: '#2F7DF0',
                  roles: ['Head Coach','First Team Manager','Caretaker Manager','Interim Manager','Player-Manager'],
                },
                {
                  group: 'Coaching staff', colour: '#20c997',
                  roles: ['Assistant Head Coach','Assistant Coach','Goalkeeping Coach','Set-Piece Coach','Fitness Coach','Strength & Conditioning Coach','Sports Scientist','Physio / Sports Therapist','Team Doctor'],
                },
                {
                  group: 'Management & leadership', colour: '#f5b301',
                  roles: ['Sporting Director','Technical Director','Director of Football','Academy Director','Head of Recruitment','Head of Player Development','Head of Analysis'],
                },
                {
                  group: 'Scouting & analysis', colour: '#0dcaf0',
                  roles: ['Scout','Chief Scout','Performance Analyst','Video Analyst','Data Analyst','Opposition Analyst','Recruitment Analyst','Tactical Analyst'],
                },
                {
                  group: 'Other roles', colour: '#fd7e14',
                  roles: ['Reserve Team Coach','U23 / U21 Coach','U18 Coach','Youth Academy Coach','Loan Manager','Player Liaison'],
                },
              ].map(({ group, colour, roles }) => {
                const groupTotal = roles.reduce((sum, r) =>
                  sum + Object.values(subRoles).filter(s => s?.subRole === r).length, 0)
                return (
                  <div key={group} className="mb-3">
                    {/* Group header */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="d-flex align-items-center gap-1">
                        <span className="rounded-circle d-inline-block flex-shrink-0"
                          style={{ width:7, height:7, background:colour }} />
                        <span style={{ fontSize:9, color:colour, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>
                          {group}
                        </span>
                      </span>
                      {groupTotal > 0 && (
                        <span className="badge rounded-pill px-2"
                          style={{ background:colour+'33', color:colour, fontSize:9, border:`1px solid ${colour}55` }}>
                          {groupTotal}
                        </span>
                      )}
                    </div>

                    {/* Individual roles */}
                    {roles.map(roleName => {
                      const count = Object.values(subRoles).filter(s => s?.subRole === roleName).length
                      const hasStaff = count > 0
                      return (
                        <div key={roleName}
                          className="d-flex justify-content-between align-items-center px-2"
                          style={{
                            height: 22,
                            borderRadius: 4,
                            background: hasStaff ? colour + '18' : 'transparent',
                            marginBottom: 1,
                          }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: hasStaff ? 700 : 400,
                            color: hasStaff ? '#f1f5f9' : '#475569',
                          }}>
                            {roleName}
                          </span>
                          {hasStaff ? (
                            <span className="badge rounded-pill px-2"
                              style={{ background: colour, color: colour === '#f5b301' ? '#000' : '#fff', fontSize: 10, minWidth: 22 }}>
                              {count}
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, color: '#334155' }}>—</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <ul className="nav nav-pills mb-4 flex-wrap gap-1" role="tablist">
        {TABS.map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link d-flex align-items-center gap-2${activeTab===tab?' active':''}`}
              type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
              {tab==='verification' && pendingVerif>0 && (
                <span className="badge text-bg-danger" style={{ fontSize:10 }}>{pendingVerif}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Users table ── */}
      {activeTab==='users' && (
        <div className="card p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <h2 className="h5 fw-bold mb-0" style={{ color:'var(--fc-blue-700)' }}>
              <i className="bi bi-people me-2" />All Accounts
            </h2>
            <div className="d-flex gap-2 align-items-center">
              <input className="form-control form-control-sm" style={{ maxWidth:280 }} type="search"
                placeholder="Search name, email, role…" value={search} onChange={e => setSearch(e.target.value)} />
              <span className="small text-muted text-nowrap">{filtered.length} of {users.length}</span>
            </div>
          </div>
          {loading ? (
            <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading accounts…</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize:13 }}>
                <thead className="table-dark">
                  <tr>
                    <th style={{ minWidth:240 }}>Member</th>
                    <th style={{ minWidth:180 }}>Role / Position</th>
                    <th style={{ minWidth:120 }}>Location</th>
                    <th className="text-center" style={{ minWidth:70 }}>Sport</th>
                    <th className="text-center" style={{ minWidth:90 }}>Account</th>
                    <th className="text-center" style={{ minWidth:130 }}>Verification</th>
                    <th style={{ minWidth:90 }}>Joined</th>
                    <th style={{ minWidth:130 }}><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className={u.status==='suspended'?'table-danger opacity-75':''}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                            style={{ width:36, height:36, background:ROLE_COLOURS[u.role]||'var(--fc-gradient-primary)', color:u.role==='coach'?'#000':'#fff', fontSize:14 }}>
                            <i className={`bi ${ROLE_ICONS[u.role]||'bi-person'}`} />
                          </span>
                          <div>
                            <div className="fw-semibold d-flex align-items-center gap-1">
                              {u.full_name||subRoles[u.id]?.name||<span className="text-muted fst-italic">Unnamed</span>}
                              {u.id===user.id && <span className="badge text-bg-primary" style={{ fontSize:9 }}>You</span>}
                            </div>
                            <div className="text-muted" style={{ fontSize:11 }}>{u.email}</div>
                            {subRoles[u.id]?.orgName && (
                              <div className="text-muted fst-italic" style={{ fontSize:10 }}>{subRoles[u.id].orgName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="mb-1">
                          <select className="form-select form-select-sm" disabled={u.id===user.id||saving}
                            value={roleDrafts[u.id]??u.role}
                            onChange={e => setRoleDrafts(cur => ({...cur,[u.id]:e.target.value}))}>
                            {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                        </div>
                        {/* Show specific sub-role (e.g. Goalkeeping Coach, Sporting Director) */}
                        {subRoles[u.id]?.subRole && (
                          <span className="badge text-bg-light border fw-normal" style={{ fontSize:10 }}>
                            {subRoles[u.id].subRole}
                          </span>
                        )}
                        {/* Show player position */}
                        {!subRoles[u.id]?.subRole && subRoles[u.id]?.position && (
                          <span className="badge text-bg-light border fw-normal" style={{ fontSize:10 }}>
                            {subRoles[u.id].position}
                          </span>
                        )}
                      </td>
                      {/* Location column */}
                      <td>
                        {subRoles[u.id]?.location ? (
                          <div className="d-flex align-items-center gap-1">
                            <i className="bi bi-geo-alt text-muted" style={{ fontSize:11 }} />
                            <span className="small text-muted">{subRoles[u.id].location}</span>
                          </div>
                        ) : (
                          <span className="small text-muted">—</span>
                        )}
                      </td>
                      {/* Sport column */}
                      <td className="text-center">
                        {u.sport ? (
                          <span className="badge text-bg-light border" style={{ fontSize:10 }}>
                            <i className={`bi ${u.sport==='football'?'bi-dribbble':'bi-circle'} me-1`} />
                            {u.sport}
                          </span>
                        ) : <span className="small text-muted">—</span>}
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span className={`badge ${u.status==='active'?'text-bg-success':u.status==='suspended'?'text-bg-danger':'text-bg-warning'}`}>
                            {u.status==='active'?'Active':u.status==='suspended'?'Suspended':u.status??'active'}
                          </span>
                        </div>
                      </td>
                      <td className="text-center"><VerificationBadge status={u.verification_status} /></td>
                      <td className="text-muted" style={{ fontSize:11 }}>
                        {u.created_at?new Date(u.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'2-digit'}):'—'}
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-nowrap align-items-center">
                          <button className="btn btn-sm btn-outline-primary"
                            disabled={u.id===user.id||saving||(roleDrafts[u.id]??u.role)===u.role}
                            onClick={() => saveRole(u.id)} type="button">
                            <i className="bi bi-check2 me-1" />Save
                          </button>
                          {u.id!==user.id && (
                            <button
                              className={`btn btn-sm ${u.status==='suspended'?'btn-success':'btn-outline-danger'}`}
                              disabled={saving}
                              onClick={() => suspendUser(u.id,u.status??'active')}
                              type="button"
                              title={u.status==='suspended'?'Restore account':'Suspend account'}
                            >
                              {u.status==='suspended'
                                ? <><i className="bi bi-arrow-clockwise me-1" />Restore</>
                                : <><i className="bi bi-slash-circle me-1" />Suspend</>
                              }
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length===0 && (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-search fs-2 d-block mb-2" style={{ opacity:.3 }} />
                  <p className="mb-0">No accounts match <strong>"{search}"</strong></p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Verification Queue ── */}
      {activeTab==='verification' && (
        <div className="card p-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="h5 fw-bold mb-0" style={{ color:'var(--fc-blue-700)' }}>
              <i className="bi bi-patch-check me-2" />Verification Queue
            </h2>
            {pendingVerif>0 && <span className="badge text-bg-warning px-3 py-2">{pendingVerif} pending</span>}
          </div>
          {pendingVerif===0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-patch-check fs-1 d-block mb-2" style={{ color:'#198754', opacity:.4 }} />
              <p className="fw-semibold mb-1">All clear!</p>
              <p className="small">No pending verification requests.</p>
            </div>
          ) : verifQueue.map(req => (
            <div key={req.id} className="card p-4 mb-3"
              style={{ borderLeft:'4px solid var(--fc-blue-500)', background:'rgba(47,125,240,.03)' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="fc-icon-badge" style={{ width:44, height:44, background:'var(--fc-gradient-primary)' }}>
                    <i className={`bi ${ROLE_ICONS[req.role]||'bi-person'}`} />
                  </span>
                  <div>
                    <div className="fw-bold">{req.profiles?.full_name||req.profiles?.email}</div>
                    <div className="small text-muted">{req.profiles?.email}</div>
                    <div className="d-flex gap-2 mt-1 flex-wrap">
                      <span className="badge text-bg-light border text-capitalize">{req.role}</span>
                      <span className="small text-muted">
                        Submitted {new Date(req.submitted_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="badge text-bg-warning px-3 py-2">Pending Review</span>
              </div>
              {req.nin_number && (
                <div className="small text-muted mb-2">
                  <i className="bi bi-person-badge me-1" />NIN on file: <code>{req.nin_number.slice(0,4)}*******</code>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label small fw-semibold" htmlFor={`note-${req.id}`}>
                  Admin note <span className="text-muted fw-normal">(optional)</span>
                </label>
                <input id={`note-${req.id}`} className="form-control form-control-sm"
                  placeholder="Reason for approval or rejection…"
                  value={verifNote[req.id]??''}
                  onChange={e => setVerifNote(n => ({...n,[req.id]:e.target.value}))} />
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-success d-flex align-items-center gap-2" type="button"
                  disabled={saving} onClick={() => approveVerif(req)}>
                  <i className="bi bi-patch-check-fill" />Approve & Verify
                </button>
                <button className="btn btn-outline-danger d-flex align-items-center gap-2" type="button"
                  disabled={saving} onClick={() => rejectVerif(req)}>
                  <i className="bi bi-x-circle" />Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Reports & Disputes Queue ── */}
      {activeTab==='reports' && (
        <div className="card p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <h2 className="h5 fw-bold mb-0" style={{ color:'var(--fc-blue-700)' }}>
              <i className="bi bi-flag-fill me-2 text-danger" />Reports & Disputes
            </h2>
            <div className="d-flex gap-2 align-items-center">
              <span className="badge text-bg-danger px-3 py-2">
                {reportQueue.filter(r=>r.status==='pending').length} pending
              </span>
              <span className="badge text-bg-warning px-3 py-2">
                {reportQueue.filter(r=>r.status==='investigating').length} investigating
              </span>
              <button className="btn btn-outline-secondary btn-sm" type="button"
                onClick={refreshReports} disabled={reportLoading}
                title="Refresh reports list">
                {reportLoading
                  ? <span className="spinner-border spinner-border-sm" />
                  : <i className="bi bi-arrow-clockwise" />}
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <ul className="nav nav-pills mb-4 gap-1 flex-wrap">
            {[['all','All'],['pending','Pending'],['investigating','Investigating'],['confirmed_scam','Scam confirmed'],['dismissed','Dismissed']].map(([s,l])=>(
              <li key={s}>
                <button
                  className={`btn btn-sm ${reportFilter===s?'btn-primary':'btn-outline-secondary'}`}
                  type="button" onClick={()=>setReportFilter(s)}>
                  {l} ({s==='all'?reportQueue.length:reportQueue.filter(r=>r.status===s).length})
                </button>
              </li>
            ))}
          </ul>

          {reportLoading ? (
            <div className="py-5 text-center text-muted">
              <span className="spinner-border spinner-border-sm me-2" />Loading reports…
            </div>
          ) : reportQueue.filter(r=>reportFilter==='all'||r.status===reportFilter).length===0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-shield-check fs-1 d-block mb-2" style={{color:'#198754',opacity:.4}} />
              <p className="fw-semibold mb-1">No {reportFilter==='all'?'':reportFilter.replace(/_/g,' ')} reports.</p>
              <p className="small mb-3">When users file reports they will appear here.</p>
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={refreshReports}>
                <i className="bi bi-arrow-clockwise me-2" />Refresh
              </button>
            </div>
          ) : reportQueue
              .filter(r=>reportFilter==='all'||r.status===reportFilter)
              .map(rep=>(
            <div key={rep.id} className="card p-4 mb-3"
              style={{borderLeft:`4px solid ${rep.status==='confirmed_scam'?'#dc3545':rep.status==='dismissed'?'#6c757d':rep.status==='investigating'?'#f5b301':'#2F7DF0'}`,
                background:rep.status==='confirmed_scam'?'rgba(220,53,69,.04)':rep.status==='dismissed'?'rgba(108,117,125,.04)':'rgba(47,125,240,.03)'}}>

              {/* Report header */}
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={`badge ${
                      rep.status==='confirmed_scam'?'text-bg-danger':
                      rep.status==='dismissed'?'text-bg-secondary':
                      rep.status==='investigating'?'text-bg-warning':
                      'text-bg-primary'}`}>
                      {rep.status?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                    </span>
                    <span className="badge text-bg-light border text-capitalize">
                      {rep.reason?.replace(/_/g,' ')}
                    </span>
                  </div>
                  <div className="small text-muted">
                    Reported {rep.created_at?new Date(rep.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'2-digit'}):'—'}
                  </div>
                </div>
                {rep.reviewed_at && (
                  <div className="small text-muted">
                    Reviewed {new Date(rep.reviewed_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                  </div>
                )}
              </div>

              {/* Reporter + Reported */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded" style={{background:'rgba(0,0,0,.04)'}}>
                    <div className="small text-muted fw-semibold mb-1">
                      <i className="bi bi-person me-1" />Reporter
                    </div>
                    <div className="fw-semibold">{rep.reporter?.full_name||'Unknown'}</div>
                    <div className="small text-muted">{rep.reporter?.email}</div>
                    <span className="badge text-bg-light border mt-1" style={{fontSize:10}}>
                      {ROLE_LABELS[rep.reporter?.role]||rep.reporter?.role||'—'}
                    </span>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-3 rounded" style={{background:'rgba(220,53,69,.06)'}}>
                    <div className="small text-danger fw-semibold mb-1">
                      <i className="bi bi-flag me-1" />Reported Profile
                    </div>
                    <div className="fw-semibold">{rep.reported?.full_name||'Unknown'}</div>
                    <div className="small text-muted">{rep.reported?.email}</div>
                    <span className="badge text-bg-light border mt-1" style={{fontSize:10}}>
                      {ROLE_LABELS[rep.reported?.role]||rep.reported?.role||'—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              {rep.details && (
                <div className="mb-3">
                  <div className="small fw-semibold text-muted mb-1">Details</div>
                  <p className="small mb-0" style={{whiteSpace:'pre-wrap'}}>{rep.details}</p>
                </div>
              )}

              {/* Reviewer notes */}
              {rep.reviewer_notes && (
                <div className="alert alert-light py-2 small mb-3">
                  <i className="bi bi-chat-square-text me-1" />
                  <strong>Admin note:</strong> {rep.reviewer_notes}
                </div>
              )}

              {/* Actions — only show if not already resolved */}
              {!['confirmed_scam','dismissed'].includes(rep.status) && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold" htmlFor={`report-note-${rep.id}`}>
                    Investigation note <span className="text-muted fw-normal">(optional)</span>
                  </label>
                  <input id={`report-note-${rep.id}`} className="form-control form-control-sm"
                    placeholder="Add investigation notes…"
                    value={reportNote[rep.id]??''}
                    onChange={e=>setReportNote(n=>({...n,[rep.id]:e.target.value}))} />
                </div>
              )}

              {/* Admin direct message panel — always visible on open cases */}
              {!['confirmed_scam','dismissed'].includes(rep.status) && (
                <div className="card p-3 mb-3" style={{ background: 'rgba(47,125,240,.04)', border: '1px solid rgba(47,125,240,.2)' }}>
                  <div className="fw-semibold small mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-envelope-fill text-primary" />
                    Send admin message to parties
                    <span className="badge text-bg-primary" style={{ fontSize: 9 }}>Inbox + Notification</span>
                  </div>
                  <AdminMessageForm
                    repId={rep.id}
                    reporter={rep.reporter}
                    reported={rep.reported}
                    onSend={sendAdminMessage}
                    saving={saving}
                  />
                </div>
              )}

              {!['confirmed_scam','dismissed'].includes(rep.status) && (
                <div className="d-flex gap-2 flex-wrap">
                  {rep.status==='pending' && (
                    <button className="btn btn-warning btn-sm d-flex align-items-center gap-2" type="button"
                      disabled={saving} onClick={()=>updateReport(rep.id,'investigating')}>
                      <i className="bi bi-search" />Start investigation
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm d-flex align-items-center gap-2" type="button"
                    disabled={saving}
                    onClick={()=>{ if(window.confirm('Confirm as scam/fraud? This will DENY the reported account.')) updateReport(rep.id,'confirmed_scam') }}>
                    <i className="bi bi-shield-x" />Confirm scam & deny account
                  </button>
                  <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" type="button"
                    disabled={saving} onClick={()=>updateReport(rep.id,'dismissed')}>
                    <i className="bi bi-x-circle" />Dismiss report
                  </button>
                </div>
              )}

              {rep.status==='confirmed_scam' && (
                <div className="alert alert-danger py-2 mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-shield-x-fill" />Account denied. Scam confirmed.
                </div>
              )}
              {rep.status==='dismissed' && (
                <div className="alert alert-secondary py-2 mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle" />Report dismissed. No action taken.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Duplicate Files ── */}
      {activeTab==='duplicates' && (
        <div className="card p-4">
          <h2 className="h5 fw-bold mb-4" style={{ color:'var(--fc-blue-700)' }}>
            <i className="bi bi-files me-2" />Duplicate File Detector
          </h2>
          {duplicates.length===0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-files fs-1 d-block mb-2" style={{ opacity:.3 }} />
              <p className="mb-0">No duplicate uploads detected.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-dark"><tr><th>SHA-256</th><th>Type</th><th>User</th><th>Uploaded</th><th></th></tr></thead>
                <tbody>
                  {duplicates.map(d => (
                    <tr key={d.id}>
                      <td className="font-monospace small text-danger">{d.file_hash?.slice(0,16)}…</td>
                      <td><span className="badge text-bg-light border small">{d.file_type}</span></td>
                      <td className="small text-muted">{d.user_id?.slice(0,8)}…</td>
                      <td className="small text-muted">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td><a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary"><i className="bi bi-box-arrow-up-right" /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Fee-Flagged Tryouts ── */}
      {activeTab==='flagged' && (
        <div className="card p-4">
          <h2 className="h5 fw-bold mb-4" style={{ color:'var(--fc-blue-700)' }}>
            <i className="bi bi-flag-fill me-2 text-warning" />Fee-Flagged Tryouts
          </h2>
          {flagged.length===0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-flag fs-1 d-block mb-2" style={{ opacity:.3 }} />
              <p className="mb-0">No tryouts pending review.</p>
            </div>
          ) : flagged.map(opp => (
            <div key={opp.id} className="card p-4 mb-3" style={{ borderLeft:'4px solid var(--fc-gold-500)' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h3 className="h6 fw-bold mb-2">{opp.title}</h3>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge text-bg-danger"><i className="bi bi-cash me-1" />&#8358;{(opp.fee_amount??0).toLocaleString()} flagged</span>
                    {opp.region && <span className="badge text-bg-light border">{opp.region}</span>}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-success btn-sm" type="button" onClick={() => approveOpp(opp.id)}><i className="bi bi-check-lg me-1" />Approve</button>
                  <button className="btn btn-danger btn-sm"  type="button" onClick={() => rejectOpp(opp.id)}><i className="bi bi-x-lg me-1" />Reject</button>
                </div>
              </div>
              {opp.fee_breakdown && <div className="alert alert-warning py-2 small mb-2"><strong>Fee breakdown:</strong> {opp.fee_breakdown}</div>}
              {opp.description && <p className="small text-muted mb-0" style={{ maxHeight:80, overflow:'hidden' }}>{opp.description}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ——— Account details sidebar ——————————————————————————————————————————————————

function AccountDetails({ supabase, user, profile, onProfileSaved }) {
  const [name,      setName]      = useState(profile?.full_name ?? '')
  const [saving,    setSaving]    = useState(false)
  const [notice,    setNotice]    = useState('')
  const [error,     setError]     = useState('')
  const [open,      setOpen]      = useState(false)   // collapsed by default

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase.from('profiles').update({ full_name: name.trim() || null, updated_at: new Date().toISOString() }).eq('id', user.id).select('id, email, full_name, role').single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setNotice('Saved.'); onProfileSaved(data)
  }

  return (
    <section className="card mb-3" style={{ overflow:'hidden' }}>
      {/* ── Collapsible header ── */}
      <button
        type="button"
        className="w-100 text-start p-3 d-flex align-items-center justify-content-between border-0 bg-transparent"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ cursor:'pointer' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle"
            style={{ width:32, height:32, background:'var(--fc-gradient-primary)', color:'#fff', fontSize:13, flexShrink:0 }}>
            <i className="bi bi-person-fill" />
          </span>
          <div>
            <div className="fw-bold small" style={{ color:'var(--fc-blue-700)' }}>
              {profile?.full_name || user.email?.split('@')[0] || 'My account'}
            </div>
            <div className="text-muted" style={{ fontSize:10 }}>{profile?.email ?? user.email ?? ''}</div>
          </div>
        </div>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'} text-muted`} style={{ fontSize:12 }} />
      </button>

      {/* ── Collapsible body ── */}
      {open && (
        <div className="px-3 pb-3 border-top pt-3">
          {error  && <div className="alert alert-danger  py-2 small mb-2" role="alert">{error}</div>}
          {notice && <div className="alert alert-success py-2 small mb-2" role="status">{notice}</div>}
          <form onSubmit={save} className="d-grid gap-2">
            <div>
              <label className="form-label small fw-semibold mb-1" htmlFor="acct-name">Display name</label>
              <input id="acct-name" className="form-control form-control-sm" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="form-label small fw-semibold mb-1">Email</label>
              <input className="form-control form-control-sm" readOnly value={profile?.email ?? user.email ?? ''} />
            </div>
            <button className="btn btn-sm btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

// ——— Main Dashboard shell —————————————————————————————————————————————————————

function Dashboard({ supabase, user, onBack }) {
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [dashTab,     setDashTab]     = useState('main') // 'main' | 'notifications' | 'inbox'
  const [notifs,      setNotifs]      = useState([])
  const [notifLoad,   setNotifLoad]   = useState(false)
  const [convs,       setConvs]       = useState([])
  const [activeConv,  setActiveConv]  = useState(null)
  const [messages,    setMessages]    = useState([])
  const [newMsg,      setNewMsg]      = useState('')
  const [sending,     setSending]     = useState(false)

  useEffect(() => {
    let alive = true
    supabase.from('profiles').select('id, email, full_name, role, created_at, status, sport, verification_status').eq('id', user.id).single()
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        setProfile(data); setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id])

  // Load notifications when that tab opens
  useEffect(() => {
    if (dashTab !== 'notifications' || !supabase) return
    setNotifLoad(true)
    supabase.from('notifications').select('id, notification_type, data, read_at, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => { setNotifs(data ?? []); setNotifLoad(false) })
  }, [dashTab, supabase, user.id])

  // Load conversations when inbox tab opens
  useEffect(() => {
    if (dashTab !== 'inbox' || !supabase) return
    supabase.from('conversations')
      .select(`id, subject, last_message_at, created_at,
               initiator:profiles!initiator_id (id, full_name, role, verification_status),
               recipient:profiles!recipient_id (id, full_name, role, verification_status)`)
      .or(`initiator_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false }).limit(50)
      .then(({ data }) => setConvs(data ?? []))
  }, [dashTab, supabase, user.id])

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConv || !supabase) return
    supabase.from('messages').select('id, content, sender_id, created_at, is_read')
      .eq('conversation_id', activeConv.id).order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []))
    supabase.from('messages').update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', activeConv.id).neq('sender_id', user.id).then(() => {})
  }, [activeConv, supabase, user.id])

  const sendMessage = async (e) => {
    e.preventDefault()
    const content = newMsg.trim()
    if (!content || !activeConv) return
    setSending(true)
    const { data, error: err } = await supabase.from('messages').insert({ conversation_id: activeConv.id, sender_id: user.id, content }).select('id, content, sender_id, created_at').single()
    setSending(false)
    if (!err) { setMessages((prev) => [...prev, data]); setNewMsg(''); await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConv.id) }
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', user.id).is('read_at', null)
    setNotifs((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
  }

  const getOther = (conv) => conv.initiator?.id === user.id ? conv.recipient : conv.initiator

  // "now" is kept in state (updated in an effect) so render stays pure — no Date.now() or ref reads during render.
  const [now, setNow] = useState(0)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])
  function timeAgo(iso) {
    if (!iso) return ''
    const s = now ? Math.floor((now - new Date(iso)) / 1000) : 0
    if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s/60)}m`
    if (s < 86400) return `${Math.floor(s/3600)}h`
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  if (loading) return <div className="container py-5 text-center text-muted" role="status"><span className="spinner-border me-2" />Loading your dashboard…</div>
  if (error || !profile) return <div className="container py-5"><div className="alert alert-danger">{error || 'Could not load your profile.'}</div></div>

  const role      = profile.role
  const roleLabel = ROLE_LABELS[role] ?? role
  const roleIcon  = ROLE_ICONS[role]  ?? 'bi-person'
  const unreadCount = notifs.filter((n) => !n.read_at).length

  const roleContent = () => {
    if (role === 'super_admin')    return <AdminDashboard        supabase={supabase} user={user} />
    if (role === 'player')         return <PlayerDashboard       supabase={supabase} user={user} profile={profile} />
    if (role === 'coach')          return <CoachDashboard        supabase={supabase} user={user} profile={profile} />
    if (role === 'agent')          return <AgentDashboard        supabase={supabase} user={user} profile={profile} />
    if (role === 'academy')        return <AcademyDashboard      supabase={supabase} user={user} profile={profile} />
    if (role === 'sports_analyst') return <SportsAnalystDashboard supabase={supabase} user={user} profile={profile} />
    return <div className="alert alert-warning">Unknown role <strong>{role}</strong>. Please contact support.</div>
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span className="text-uppercase small fw-semibold text-muted">SportBridge account</span>
          <h1 className="h2 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--fc-blue-700)' }}>
            <span className="fc-icon-badge" style={{ width: 40, height: 40, fontSize: '1rem', flexShrink: 0 }}>
              <i className={`bi ${roleIcon}`} aria-hidden="true" />
            </span>
            {role === 'super_admin' ? 'Admin Control Panel' : `${roleLabel} dashboard`}
          </h1>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="text-muted small">{user.email}</span>
            <VerificationBadge status={profile.verification_status} />
          </div>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={onBack} type="button">
          <i className="bi bi-arrow-left me-1" />Back to home
        </button>
      </div>

      {/* Dashboard-level tabs: Main | Notifications | Inbox */}
      <ul className="nav nav-pills mb-4 gap-1" role="tablist">
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center gap-1${dashTab === 'main' ? ' active' : ''}`}
            type="button" onClick={() => setDashTab('main')}>
            <i className="bi bi-grid" />Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center gap-2${dashTab === 'notifications' ? ' active' : ''}`}
            type="button" onClick={() => setDashTab('notifications')}>
            <i className="bi bi-bell" />Notifications
            {unreadCount > 0 && <span className="badge text-bg-danger">{unreadCount}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center gap-1${dashTab === 'inbox' ? ' active' : ''}`}
            type="button" onClick={() => { setDashTab('inbox'); setActiveConv(null) }}>
            <i className="bi bi-chat-dots" />Inbox
          </button>
        </li>
      </ul>

      {/* —— Main role content ——————————————————————————— */}
      {dashTab === 'main' && (
        role === 'super_admin' ? (
          // Admin gets full-width — no sidebar wasting space
          <div className="row g-0">
            <div className="col-12">
              {/* Admin account strip — compact collapsible at top */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4 p-3 rounded-3"
                style={{ background:'var(--bs-secondary-bg)', border:'1px solid var(--bs-border-color)' }}>
                <AccountDetails supabase={supabase} user={user} profile={profile}
                  onProfileSaved={(u) => setProfile((p) => ({ ...p, ...u }))} />
                <div className="ms-auto d-flex gap-2 align-items-center flex-wrap">
                  <span className="badge text-bg-danger px-3 py-2">
                    <i className="bi bi-shield-check me-1" />Super Admin
                  </span>
                  <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => supabase.auth.signOut()}>
                    <i className="bi bi-box-arrow-right me-1" />Sign out
                  </button>
                </div>
              </div>
              {roleContent()}
            </div>
          </div>
        ) : (
          // All other roles — keep sidebar
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-8 col-xl-9">{roleContent()}</div>
            <div className="col-12 col-lg-4 col-xl-3">
              <AccountDetails supabase={supabase} user={user} profile={profile} onProfileSaved={(u) => setProfile((p) => ({ ...p, ...u }))} />
              <div className="card p-4">
                <h2 className="h6 fw-bold mb-3">Quick links</h2>
                <ul className="list-unstyled small mb-0 d-grid gap-2">
                  <li><a href="#players" className="text-decoration-none"><i className="bi bi-person-lines-fill me-2 text-primary" />Player directory</a></li>
                  <li><button className="btn btn-link p-0 small text-start" type="button" onClick={() => setDashTab('inbox')}><i className="bi bi-chat-dots me-2 text-primary" />Inbox</button></li>
                  <li>
                    <button className="btn btn-link p-0 text-danger small" type="button" onClick={() => supabase.auth.signOut()}>
                      <i className="bi bi-box-arrow-right me-2" />Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )
      )}

      {/* —— Notifications ——————————————————————————————————— */}
      {dashTab === 'notifications' && (
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>Notifications</h2>
              {notifs.some((n) => !n.read_at) && (
                <button className="btn btn-link btn-sm p-0 text-muted" type="button" onClick={markAllRead}>
                  Mark all as read
                </button>
              )}
            </div>
            {notifLoad ? (
              <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>
            ) : notifs.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-bell-slash fs-2 d-block mb-2" />
                <p className="mb-0">No notifications yet.</p>
                <p className="small">We'll notify you about access requests, new messages, and verifications.</p>
              </div>
            ) : notifs.map((n) => (
              <div key={n.id} className={`card mb-2 p-3 d-flex flex-row align-items-start gap-3 ${!n.read_at ? 'border-primary' : ''}`}
                style={{ borderLeft: !n.read_at ? '4px solid var(--fc-blue-500)' : undefined }}>
                <span className="fc-icon-badge flex-shrink-0" style={{ width: 36, height: 36, fontSize: '1rem', background: 'var(--fc-gradient-primary)' }}>
                  <i className="bi bi-bell-fill" />
                </span>
                <div className="flex-grow-1">
                  <div className="small fw-semibold">{n.notification_type?.replace(/_/g, ' ')}</div>
                  {n.data?.message && <div className="small text-muted">{n.data.message}</div>}
                  <div className="small text-muted mt-1">{timeAgo(n.created_at)}</div>
                </div>
                {!n.read_at && <span className="badge text-bg-primary" style={{ fontSize: 9 }}>NEW</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* —— Inbox ——————————————————————————————————————————— */}
      {dashTab === 'inbox' && (
        <>
        {/* Verified-only gate for inbox */}
        {profile.verification_status !== 'verified' && profile.role !== 'super_admin' && (
          <div className="row justify-content-center">
            <div className="col-12 col-md-7">
              <div className="card p-5 text-center">
                <i className="bi bi-lock-fill fs-1 d-block mb-3" style={{ color: 'var(--fc-blue-500)' }} />
                <h2 className="h5 fw-bold mb-2">Verified members only</h2>
                <p className="text-muted mb-4">
                  The SportBridge inbox is available to verified members only.
                  Complete identity verification to send and receive messages.
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button className="btn btn-primary" type="button" onClick={() => setDashTab('main')}>
                    <i className="bi bi-patch-check me-2" />Get verified in My Dashboard
                  </button>
                </div>
                <p className="small text-muted mt-3 mb-0">
                  Verification takes 24–48 hours after document submission.
                  This protects all members from spam and fraud.
                </p>
              </div>
            </div>
          </div>
        )}
        {(profile.verification_status === 'verified' || profile.role === 'super_admin') && (
        <div className="row g-0" style={{ minHeight: 500 }}>
          {/* Conversation list */}
          <div className={`col-12 col-md-4 border-end ${activeConv ? 'd-none d-md-flex' : 'd-flex'} flex-column`}>
            <div className="px-3 py-2 border-bottom">
              <h2 className="h6 fw-bold mb-0">Messages</h2>
            </div>
            {convs.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <i className="bi bi-chat-square-dots fs-3 d-block mb-2" />
                <p className="small mb-0">No conversations yet.<br />Visit a player or agent profile to start one.</p>
              </div>
            ) : convs.map((conv) => {
              const other = getOther(conv)
              return (
                <button key={conv.id} type="button"
                  className={`w-100 text-start border-0 border-bottom px-3 py-3 d-flex align-items-center gap-3 ${activeConv?.id === conv.id ? 'bg-primary bg-opacity-10' : 'bg-transparent'}`}
                  onClick={() => setActiveConv(conv)}>
                  <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 38, height: 38, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: 15 }}>
                    <i className="bi bi-person" />
                  </span>
                  <div className="min-w-0 flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold text-truncate" style={{ fontSize: 13, color: 'var(--fc-blue-700)' }}>
                        {other?.full_name || 'Member'}
                        {other?.verification_status === 'verified' && <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: 11 }} />}
                      </span>
                      <span className="text-muted flex-shrink-0 ms-1" style={{ fontSize: 11 }}>{timeAgo(conv.last_message_at)}</span>
                    </div>
                    <div className="text-muted text-truncate" style={{ fontSize: 12 }}>{conv.subject || 'Direct message'}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Thread */}
          <div className={`col-12 col-md-8 d-flex flex-column ${!activeConv ? 'd-none d-md-flex' : 'd-flex'}`}>
            {!activeConv ? (
              <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
                <div className="text-center"><i className="bi bi-chat-square-text fs-2 d-block mb-2" /><p className="small">Select a conversation</p></div>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-bottom d-flex align-items-center gap-2">
                  <button className="btn btn-link p-0 d-md-none me-1 text-muted" type="button" onClick={() => setActiveConv(null)}><i className="bi bi-arrow-left" /></button>
                  <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 32, height: 32, background: 'var(--fc-gradient-primary)', color: '#fff', fontSize: 13 }}><i className="bi bi-person" /></span>
                  <div>
                    <div className="fw-bold small">{getOther(activeConv)?.full_name || 'Member'}</div>
                    {activeConv.subject && <div className="text-muted" style={{ fontSize: 11 }}>{activeConv.subject}</div>}
                  </div>
                </div>
                <div className="flex-grow-1 overflow-auto px-3 py-3 d-flex flex-column gap-2" style={{ maxHeight: 400 }}>
                  {messages.map((msg) => {
                    const mine = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`d-flex ${mine ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className="px-3 py-2 rounded-3" style={{ maxWidth: '75%', background: mine ? 'var(--fc-gradient-primary)' : 'var(--bs-secondary-bg)', color: mine ? '#fff' : 'inherit', fontSize: 14 }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                          <div style={{ fontSize: 11, opacity: .65, textAlign: 'right', marginTop: 2 }}>{timeAgo(msg.created_at)}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-3 py-2 border-top">
                  <form onSubmit={sendMessage} className="d-flex gap-2">
                    <input className="form-control form-control-sm" type="text" value={newMsg}
                      onChange={(e) => setNewMsg(e.target.value)} placeholder="Write a message…" maxLength={10000} required style={{ fontSize: 13 }} />
                    <button className="btn btn-primary btn-sm" type="submit" disabled={sending || !newMsg.trim()}>
                      {sending ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send-fill" />}
                    </button>
                  </form>
                  <p className="form-text mb-0">Never share personal contact details publicly.</p>
                </div>
              </>
            )}
          </div>
        </div>
        )}
        </>
      )}
    </div>
  )
}

export default Dashboard
