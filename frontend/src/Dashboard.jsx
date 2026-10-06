import { useEffect, useState } from 'react'
import JobPostForm from './JobPostForm.jsx'
import PlayerUploadForm from './PlayerUploadForm.jsx'
import TryoutForm from './TryoutForm.jsx'
import { blockContactInfo } from './lib/uploadGuards'
import { FOOTBALL_POSITIONS, REGIONS, STAFF_ROLES } from './lib/features'

// ─── constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  player:      'Player',
  coach:       'Coach / Manager',
  agent:       'Agent / Scout',
  academy:     'Academy / Club',
  super_admin: 'Super Admin',
}

const ROLE_ICONS = {
  player:      'bi-person-arms-up',
  coach:       'bi-clipboard2-pulse',
  agent:       'bi-binoculars',
  academy:     'bi-building',
  super_admin: 'bi-shield-check',
}

const ALL_ROLES = ['player', 'coach', 'agent', 'academy', 'super_admin']

const POSITIONS_FOOTBALL = FOOTBALL_POSITIONS
const COUNTRIES = [
  'Nigeria','Ghana','South Africa','Kenya','Egypt','Senegal',"Côte d'Ivoire",'Cameroon',
  'Morocco','England','France','Germany','Spain','Portugal','Italy','Brazil',
  'Argentina','USA','Japan','South Korea','Saudi Arabia','Qatar','UAE','Other',
]

// ─── shared UI helpers ────────────────────────────────────────────────────────

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

// ─── Verification badge ───────────────────────────────────────────────────────

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

// ─── Profile completeness bar ─────────────────────────────────────────────────

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

// ─── Player dashboard ─────────────────────────────────────────────────────────

function PlayerDashboard({ supabase, user, profile }) {
  const [player,      setPlayer]   = useState(null)
  const [draft,       setDraft]    = useState(null)
  const [saving,      setSaving]   = useState(false)
  const [notice,      setNotice]   = useState('')
  const [error,       setError]    = useState('')
  const [loading,     setLoading]  = useState(true)
  const [activeTab,   setActiveTab]= useState('profile')  // 'profile' | 'uploads'

  useEffect(() => {
    let alive = true
    supabase.from('players')
      .select('id, display_name, position, secondary_position, age, country, nationality, bio, is_public, sport, gender, foot, dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin, views_count')
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
      dominant_hand:      draft.dominant_hand || null,
      height_cm:          draft.height_cm ? Number(draft.height_cm) : null,
      weight_kg:          draft.weight_kg ? Number(draft.weight_kg) : null,
      current_club:       draft.current_club.trim() || null,
      achievements:       draft.achievements.trim() || null,
      linkedin:           draft.linkedin.trim() || null,
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
        {[['profile','bi-person-vcard','My Profile'],['uploads','bi-cloud-upload','Upload CV & Media']].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`}
              type="button" role="tab"
              onClick={() => setActiveTab(tab)}
            >
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
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
        </form>
      )}

      {activeTab === 'uploads' && (
        <SectionCard title="Upload CV & Media">
          <PlayerUploadForm supabase={supabase} user={user} player={player} onSaved={() => setNotice('Files uploaded.')} />
        </SectionCard>
      )}
    </>
  )
}

// ─── Coach dashboard ──────────────────────────────────────────────────────────

function CoachDashboard({ supabase, user, profile }) {
  const [coach,   setCoach]  = useState(null)
  const [draft,   setDraft]  = useState(null)
  const [saving,  setSaving] = useState(false)
  const [notice,  setNotice] = useState('')
  const [error,   setError]  = useState('')
  const [loading, setLoading]= useState(true)

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
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

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
      {draft && (
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
        </form>
      )}
    </>
  )
}

// ─── Agent dashboard ──────────────────────────────────────────────────────────

function AgentDashboard({ supabase, user }) {
  const [agent,          setAgent]        = useState(null)
  const [draft,          setDraft]        = useState(null)
  const [saving,         setSaving]       = useState(false)
  const [notice,         setNotice]       = useState('')
  const [error,          setError]        = useState('')
  const [loading,        setLoading]      = useState(true)
  const [watchlistCount, setWatchlistCount]= useState(null)
  const [activeTab,      setActiveTab]    = useState('profile') // 'profile' | 'post-tryout'

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
        {[['profile','bi-person-vcard','Agency Profile'],['post-tryout','bi-calendar2-plus','Post Tryout']].map(([tab, icon, label]) => (
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
        </form>
      )}

      {/* ── Demo Flow 3: Agent posts Tryout ──────────────────────────────── */}
      {activeTab === 'post-tryout' && (
        <SectionCard title="Post a Tryout Opportunity">
          <TryoutForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setNotice('Tryout posted.') }} />
        </SectionCard>
      )}
    </>
  )
}

// ─── Academy dashboard ────────────────────────────────────────────────────────

function AcademyDashboard({ supabase, user, profile }) {
  const [academy, setAcademy] = useState(null)
  const [club,    setClub]    = useState(null)
  const [draft,   setDraft]   = useState(null)
  const [stats,   setStats]   = useState({ players: null, jobs: null })
  const [saving,  setSaving]  = useState(false)
  const [notice,  setNotice]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'post-job'

  useEffect(() => {
    let alive = true
    supabase.from('academy_profiles')
      .select('id, club_id, sports, country, state, address, phone, year_founded, linkedin')
      .eq('user_id', user.id).maybeSingle()
      .then(async ({ data: ac, error: ae }) => {
        if (!alive) return
        if (ae) { setError(ae.message); setLoading(false); return }
        let clubData = null, playerCount = null, jobCount = null
        if (ac?.club_id) {
          const [{ data: cl }, { count: pc }, { count: jc }] = await Promise.all([
            supabase.from('clubs').select('id, name, country, about, website, sports, status').eq('id', ac.club_id).single(),
            supabase.from('players').select('id', { count: 'exact', head: true }).eq('academy_id', ac.id),
            supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('posted_by', user.id).eq('status', 'active'),
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
        {[['profile','bi-building','Club Profile'],['post-job','bi-briefcase-fill','Post a Job']].map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`} type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
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
        </form>
      )}

      {/* ── Demo Flow 1: Club posts Player / Staff job ────────────────────── */}
      {activeTab === 'post-job' && (
        <SectionCard title="Post a Job">
          <JobPostForm supabase={supabase} user={user} onSaved={() => { setActiveTab('profile'); setStats((s) => ({ ...s, jobs: (s.jobs ?? 0) + 1 })); setNotice('Job posted.') }} />
        </SectionCard>
      )}
    </>
  )
}

// ─── Super Admin dashboard ────────────────────────────────────────────────────

function AdminDashboard({ supabase, user }) {
  const [users,        setUsers]       = useState([])
  const [accountCount, setAccountCount]= useState(0)
  const [roleDrafts,   setRoleDrafts]  = useState({})
  const [saving,       setSaving]      = useState(false)
  const [notice,       setNotice]      = useState('')
  const [error,        setError]       = useState('')
  const [loading,      setLoading]     = useState(true)
  const [search,       setSearch]      = useState('')
  const [activeTab,    setActiveTab]   = useState('users') // 'users' | 'duplicates' | 'flagged'
  const [duplicates,   setDuplicates]  = useState([])
  const [flagged,      setFlagged]     = useState([])

  useEffect(() => {
    let alive = true
    supabase.from('profiles').select('id, email, full_name, role, created_at, status, verification_status', { count: 'exact' }).order('created_at', { ascending: false }).limit(300)
      .then(({ data, count, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        setUsers(data ?? []); setAccountCount(count ?? data?.length ?? 0)
        setRoleDrafts(Object.fromEntries((data ?? []).map((u) => [u.id, u.role])))
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase])

  // Load duplicates + flagged tryouts lazily
  useEffect(() => {
    if (activeTab === 'duplicates' && duplicates.length === 0) {
      supabase.from('uploads').select('id, user_id, file_hash, file_type, url, is_duplicate, created_at').eq('is_duplicate', true).order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => setDuplicates(data ?? []))
    }
    if (activeTab === 'flagged' && flagged.length === 0) {
      supabase.from('opportunities').select('id, title, region, fee_amount, fee_breakdown, description, status, is_fee_flagged, created_at').eq('is_fee_flagged', true).order('created_at', { ascending: false }).limit(100)
        .then(({ data }) => setFlagged(data ?? []))
    }
  }, [activeTab, supabase, duplicates.length, flagged.length])

  const approveOpp = async (id) => {
    await supabase.from('opportunities').update({ status: 'open', is_fee_flagged: false }).eq('id', id)
    setFlagged((f) => f.filter((o) => o.id !== id))
    setNotice('Tryout approved.')
  }

  const rejectOpp = async (id) => {
    await supabase.from('opportunities').update({ status: 'rejected' }).eq('id', id)
    setFlagged((f) => f.filter((o) => o.id !== id))
    setNotice('Tryout rejected.')
  }

  const saveRole = async (uid) => {
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase.from('profiles').update({ role: roleDrafts[uid], updated_at: new Date().toISOString() }).eq('id', uid).select('id, email, full_name, role, created_at, status').single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setUsers((cur) => cur.map((u) => u.id === data.id ? data : u))
    setNotice(`Updated ${data.email}.`)
  }

  const roleCounts = ALL_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {})
  const filtered   = users.filter((u) => !search || [u.full_name, u.email, u.role].some((f) => f?.toLowerCase().includes(search.toLowerCase())))

  const TABS = [
    ['users',      'bi-people',        'Users'],
    ['duplicates', 'bi-files',         'Duplicate Files'],
    ['flagged',    'bi-flag-fill',     'Fee-Flagged Tryouts'],
  ]

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-people"         label="Total accounts"   value={accountCount}            colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-person-arms-up" label="Players"          value={roleCounts.player}       colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-building"       label="Academies"        value={roleCounts.academy}      colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-binoculars"     label="Agents / Coaches" value={(roleCounts.agent ?? 0) + (roleCounts.coach ?? 0)} colour="linear-gradient(135deg,#198754,#20c997)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <ul className="nav nav-tabs mb-4" role="tablist">
        {TABS.map(([tab, icon, label]) => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link d-flex align-items-center gap-2${activeTab === tab ? ' active' : ''}`} type="button" role="tab" onClick={() => setActiveTab(tab)}>
              <i className={`bi ${icon}`} aria-hidden="true" />{label}
            </button>
          </li>
        ))}
      </ul>

      {/* Users table */}
      {activeTab === 'users' && (
        <section className="card p-4" aria-labelledby="admin-users-heading">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <h2 className="h5 fw-bold mb-0" id="admin-users-heading" style={{ color: 'var(--fc-blue-700)' }}>User accounts</h2>
            <input className="form-control form-control-sm" style={{ maxWidth: 280 }} type="search" placeholder="Filter…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loading ? <div className="py-4 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div> : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Verified</th><th>Joined</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.full_name || <span className="text-muted fst-italic">Unnamed</span>}</td>
                      <td className="small">{u.email}</td>
                      <td>
                        <select aria-label={`Role for ${u.email}`} className="form-select form-select-sm" disabled={u.id === user.id || saving} value={roleDrafts[u.id] ?? u.role} onChange={(e) => setRoleDrafts((cur) => ({ ...cur, [u.id]: e.target.value }))}>
                          {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                      </td>
                      <td><span className={`badge ${u.status === 'active' ? 'text-bg-success' : u.status === 'suspended' ? 'text-bg-danger' : 'text-bg-warning'}`}>{u.status ?? 'active'}</span></td>
                      <td><VerificationBadge status={u.verification_status} /></td>
                      <td className="small text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td><button className="btn btn-sm btn-outline-primary" disabled={u.id === user.id || saving || (roleDrafts[u.id] ?? u.role) === u.role} onClick={() => saveRole(u.id)} type="button">Save</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-muted py-4 mb-0">No users match your search.</p>}
            </div>
          )}
        </section>
      )}

      {/* Duplicate files */}
      {activeTab === 'duplicates' && (
        <section className="card p-4">
          <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>Duplicate file detector</h2>
          {duplicates.length === 0
            ? <p className="text-muted">No duplicate uploads detected.</p>
            : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead><tr><th>File hash (SHA-256)</th><th>Type</th><th>User</th><th>Uploaded</th><th>URL</th></tr></thead>
                  <tbody>
                    {duplicates.map((d) => (
                      <tr key={d.id}>
                        <td className="font-monospace small">{d.file_hash?.slice(0, 16)}…</td>
                        <td className="small">{d.file_type}</td>
                        <td className="small text-muted">{d.user_id?.slice(0, 8)}…</td>
                        <td className="small text-muted">{new Date(d.created_at).toLocaleDateString()}</td>
                        <td><a href={d.url} target="_blank" rel="noopener noreferrer" className="small">View</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      )}

      {/* Fee-flagged tryouts */}
      {activeTab === 'flagged' && (
        <section className="card p-4">
          <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>Fee-flagged tryouts</h2>
          {flagged.length === 0
            ? <p className="text-muted">No tryouts pending review.</p>
            : flagged.map((opp) => (
              <div key={opp.id} className="card p-3 mb-3" style={{ borderLeft: '4px solid var(--fc-gold-500)' }}>
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                  <div>
                    <h3 className="h6 fw-bold mb-1">{opp.title}</h3>
                    <span className="badge text-bg-warning me-2">₦{(opp.fee_amount ?? 0).toLocaleString()}</span>
                    <span className="small text-muted">{opp.region} · {opp.status}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-success" type="button" onClick={() => approveOpp(opp.id)}>
                      <i className="bi bi-check-lg me-1" />Approve
                    </button>
                    <button className="btn btn-sm btn-danger" type="button" onClick={() => rejectOpp(opp.id)}>
                      <i className="bi bi-x-lg me-1" />Reject
                    </button>
                  </div>
                </div>
                {opp.fee_breakdown && <p className="small mb-1"><strong>Fee breakdown:</strong> {opp.fee_breakdown}</p>}
                <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'hidden' }}>{opp.description}</p>
              </div>
            ))}
        </section>
      )}
    </>
  )
}

// ─── Account details sidebar ──────────────────────────────────────────────────

function AccountDetails({ supabase, user, profile, onProfileSaved }) {
  const [name,   setName]   = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error,  setError]  = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase.from('profiles').update({ full_name: name.trim() || null, updated_at: new Date().toISOString() }).eq('id', user.id).select('id, email, full_name, role').single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setNotice('Saved.'); onProfileSaved(data)
  }

  return (
    <section className="card p-4 mb-3">
      <h2 className="h6 fw-bold mb-3">Account details</h2>
      {error  && <div className="alert alert-danger  py-2 small" role="alert">{error}</div>}
      {notice && <div className="alert alert-success py-2 small" role="status">{notice}</div>}
      <form onSubmit={save} className="d-grid gap-3">
        <div>
          <label className="form-label small fw-semibold" htmlFor="acct-name">Display name</label>
          <input id="acct-name" className="form-control form-control-sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="form-label small fw-semibold">Email</label>
          <input className="form-control form-control-sm" readOnly value={profile?.email ?? user.email ?? ''} />
        </div>
        <button className="btn btn-sm btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </section>
  )
}

// ─── Main Dashboard shell ─────────────────────────────────────────────────────

function Dashboard({ supabase, user, onBack }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

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

  if (loading) return <div className="container py-5 text-center text-muted" role="status"><span className="spinner-border me-2" />Loading your dashboard…</div>
  if (error || !profile) return <div className="container py-5"><div className="alert alert-danger">{error || 'Could not load your profile. Please try refreshing.'}</div></div>

  const role      = profile.role
  const roleLabel = ROLE_LABELS[role] ?? role
  const roleIcon  = ROLE_ICONS[role]  ?? 'bi-person'

  const roleContent = () => {
    if (role === 'super_admin') return <AdminDashboard   supabase={supabase} user={user} />
    if (role === 'player')      return <PlayerDashboard  supabase={supabase} user={user} profile={profile} />
    if (role === 'coach')       return <CoachDashboard   supabase={supabase} user={user} profile={profile} />
    if (role === 'agent')       return <AgentDashboard   supabase={supabase} user={user} />
    if (role === 'academy')     return <AcademyDashboard supabase={supabase} user={user} profile={profile} />
    return <div className="alert alert-warning">Unknown account role <strong>{role}</strong>. Please contact support.</div>
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span className="text-uppercase small fw-semibold text-muted">SportBridge account</span>
          <h1 className="h2 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--fc-blue-700)' }}>
            <span className="fc-icon-badge" style={{ width: 40, height: 40, fontSize: '1rem', flexShrink: 0 }}>
              <i className={`bi ${roleIcon}`} aria-hidden="true" />
            </span>
            {role === 'super_admin' ? 'Admin dashboard' : `${roleLabel} dashboard`}
          </h1>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="text-muted small">{user.email}</span>
            <VerificationBadge status={profile.verification_status} />
          </div>
        </div>
        <button className="btn btn-outline-primary" onClick={onBack} type="button">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />Back to home
        </button>
      </div>

      {/* Two-column layout */}
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-8 col-xl-9">
          {roleContent()}
        </div>
        <div className="col-12 col-lg-4 col-xl-3">
          <AccountDetails supabase={supabase} user={user} profile={profile} onProfileSaved={(u) => setProfile((p) => ({ ...p, ...u }))} />
          <div className="card p-4">
            <h2 className="h6 fw-bold mb-3">Quick links</h2>
            <ul className="list-unstyled small mb-0 d-grid gap-2">
              {role !== 'super_admin' && (
                <>
                  <li><a href="#roles"         className="text-decoration-none"><i className="bi bi-newspaper me-2 text-primary"          />Community feed</a></li>
                  <li><a href="#opportunities" className="text-decoration-none"><i className="bi bi-briefcase me-2 text-primary"           />Job board</a></li>
                  <li><a href="#players"       className="text-decoration-none"><i className="bi bi-person-lines-fill me-2 text-primary"   />Player directory</a></li>
                </>
              )}
              <li>
                <button className="btn btn-link p-0 text-danger small" type="button" onClick={() => supabase.auth.signOut()}>
                  <i className="bi bi-box-arrow-right me-2" />Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
