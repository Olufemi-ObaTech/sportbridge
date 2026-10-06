import { useEffect, useState } from 'react'

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

const POSITIONS_FOOTBALL   = ['Goalkeeper','Right Back','Centre Back','Left Back','Defensive Mid','Central Mid','Attacking Mid','Right Wing','Left Wing','Striker','Centre Forward']
const POSITIONS_BASKETBALL = ['Point Guard','Shooting Guard','Small Forward','Power Forward','Centre']
const COUNTRIES = ['Nigeria','Ghana','South Africa','Kenya','Egypt','Senegal','Côte d\'Ivoire','Cameroon','Morocco','England','France','Germany','Spain','Portugal','Italy','Brazil','Argentina','USA','Japan','South Korea','Saudi Arabia','Qatar','UAE','Other']

// ─── helpers ──────────────────────────────────────────────────────────────────

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

function SectionCard({ title, children }) {
  return (
    <section className="card p-4 mb-4">
      <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>{title}</h2>
      {children}
    </section>
  )
}

function FormRow({ children }) {
  return <div className="row g-3">{children}</div>
}

function Field({ label, col = 'col-12 col-md-6', children }) {
  return (
    <div className={col}>
      <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{label}</label>
      {children}
    </div>
  )
}

// ─── Player dashboard ─────────────────────────────────────────────────────────

function PlayerDashboard({ supabase, user, profile }) {
  const [player,      setPlayer]      = useState(null)
  const [draft,       setDraft]       = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [notice,      setNotice]      = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    let alive = true
    supabase.from('players')
      .select('id, display_name, position, secondary_position, age, country, nationality, bio, is_public, sport, gender, foot, dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin')
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
          age:                p.age                != null ? String(p.age) : '',
          country:            p.country            ?? '',
          nationality:        p.nationality        ?? '',
          bio:                p.bio                ?? '',
          is_public:          p.is_public          ?? false,
          sport:              p.sport              ?? 'football',
          gender:             p.gender             ?? '',
          foot:               p.foot               ?? '',
          dominant_hand:      p.dominant_hand      ?? '',
          height_cm:          p.height_cm          != null ? String(p.height_cm) : '',
          weight_kg:          p.weight_kg          != null ? String(p.weight_kg) : '',
          current_club:       p.current_club       ?? '',
          achievements:       p.achievements       ?? '',
          linkedin:           p.linkedin           ?? '',
        })
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id, profile.full_name])

  const upd = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const payload = {
      profile_id:         user.id,
      display_name:       draft.display_name.trim()       || profile.full_name || 'Player',
      position:           draft.position                  || null,
      secondary_position: draft.secondary_position        || null,
      age:                draft.age     ? Number(draft.age)       : null,
      country:            draft.country.trim()            || null,
      nationality:        draft.nationality.trim()        || null,
      bio:                draft.bio.trim()                || null,
      is_public:          draft.is_public,
      sport:              draft.sport,
      gender:             draft.gender                    || null,
      foot:               draft.foot                      || null,
      dominant_hand:      draft.dominant_hand             || null,
      height_cm:          draft.height_cm ? Number(draft.height_cm) : null,
      weight_kg:          draft.weight_kg ? Number(draft.weight_kg) : null,
      current_club:       draft.current_club.trim()       || null,
      achievements:       draft.achievements.trim()       || null,
      linkedin:           draft.linkedin.trim()           || null,
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

  const positions = draft?.sport === 'basketball' ? POSITIONS_BASKETBALL : POSITIONS_FOOTBALL

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading your profile…</div>

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-eye"           label="Profile views"   value={player?.views_count ?? 0}    colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-images"        label="Media items"     value="—"                            colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-bookmark-star" label="Watchlisted by"  value="—"                            colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-globe2"        label="Profile status"  value={draft?.is_public ? 'Public' : 'Private'} colour={draft?.is_public ? 'linear-gradient(135deg,#198754,#20c997)' : 'linear-gradient(135deg,#6c757d,#adb5bd)'} />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {draft && (
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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </Field>
              {draft.sport === 'football' && (
                <Field label="Preferred foot">
                  <select className="form-select" value={draft.foot} onChange={upd('foot')}>
                    <option value="">— Select —</option>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="both">Both</option>
                  </select>
                </Field>
              )}
              {draft.sport === 'basketball' && (
                <Field label="Dominant hand">
                  <select className="form-select" value={draft.dominant_hand} onChange={upd('dominant_hand')}>
                    <option value="">— Select —</option>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                    <option value="both">Both</option>
                  </select>
                </Field>
              )}
              <Field label="Age">
                <input className="form-control" type="number" min="1" max="100" value={draft.age} onChange={upd('age')} placeholder="e.g. 22" />
              </Field>
              <Field label="Height (cm)">
                <input className="form-control" type="number" min="100" max="250" value={draft.height_cm} onChange={upd('height_cm')} placeholder="e.g. 180" />
              </Field>
              <Field label="Weight (kg)">
                <input className="form-control" type="number" min="30" max="200" value={draft.weight_kg} onChange={upd('weight_kg')} placeholder="e.g. 75" />
              </Field>
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
              <Field label="Current club">
                <input className="form-control" value={draft.current_club} onChange={upd('current_club')} placeholder="e.g. FC Academy Lagos" />
              </Field>
              <Field label="LinkedIn URL" col="col-12">
                <input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} placeholder="https://linkedin.com/in/yourname" />
              </Field>
              <Field label="About / Bio" col="col-12">
                <textarea className="form-control" rows={4} value={draft.bio} onChange={upd('bio')} placeholder="Describe your playing style, experience and goals…" />
              </Field>
              <Field label="Achievements" col="col-12">
                <textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} placeholder="Honours, caps, notable clubs, tournaments…" />
              </Field>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="player-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="player-public">
                    Show my profile in the public player directory
                  </label>
                  <div className="small text-muted">Agents and scouts can discover you when this is on.</div>
                </div>
              </div>
            </FormRow>
          </SectionCard>

          <div className="d-flex gap-3">
            <button className="btn btn-primary px-5" type="submit" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

// ─── Coach dashboard ──────────────────────────────────────────────────────────

function CoachDashboard({ supabase, user, profile }) {
  const [coach,   setCoach]   = useState(null)
  const [draft,   setDraft]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [notice,  setNotice]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    supabase.from('coach_profiles')
      .select('id, full_name, sport, preferred_role, experience_years, current_club, nationality, gender, about, achievements, badges, photo_path, open_to_work, linkedin, is_public')
      .eq('user_id', user.id)
      .maybeSingle()
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

  const upd = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const payload = {
      user_id:          user.id,
      full_name:        draft.full_name.trim()        || profile.full_name,
      sport:            draft.sport,
      preferred_role:   draft.preferred_role          || null,
      experience_years: draft.experience_years ? Number(draft.experience_years) : null,
      current_club:     draft.current_club.trim()     || null,
      nationality:      draft.nationality             || null,
      gender:           draft.gender                  || null,
      about:            draft.about.trim()            || null,
      achievements:     draft.achievements.trim()     || null,
      badges:           draft.badges ? draft.badges.split(',').map((b) => b.trim()).filter(Boolean) : [],
      open_to_work:     draft.open_to_work,
      linkedin:         draft.linkedin.trim()         || null,
      is_public:        draft.is_public,
      updated_at:       new Date().toISOString(),
    }
    const q = coach
      ? supabase.from('coach_profiles').update(payload).eq('id', coach.id)
      : supabase.from('coach_profiles').insert(payload)
    const { data, error: err } = await q.select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setCoach(data)
    setNotice('Coach profile saved.')
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading your profile…</div>

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-briefcase"      label="Applications sent"  value="—" colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-star"           label="Shortlisted"        value="—" colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-trophy"         label="Hired"              value="—" colour="linear-gradient(135deg,#198754,#20c997)" />
        <StatCard icon="bi-eye"            label="Profile visibility" value={draft?.is_public ? 'Public' : 'Private'} colour={draft?.is_public ? 'linear-gradient(135deg,#198754,#20c997)' : 'linear-gradient(135deg,#6c757d,#adb5bd)'} />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {draft && (
        <form onSubmit={save}>
          <SectionCard title="Coaching profile">
            <FormRow>
              <Field label="Full name">
                <input className="form-control" value={draft.full_name} onChange={upd('full_name')} placeholder="Your name" />
              </Field>
              <Field label="Sport">
                <select className="form-select" value={draft.sport} onChange={upd('sport')}>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                </select>
              </Field>
              <Field label="Preferred role">
                <select className="form-select" value={draft.preferred_role} onChange={upd('preferred_role')}>
                  <option value="">— Select —</option>
                  {['Head Coach','Assistant Coach','Goalkeeping Coach','Fitness Coach','Sporting Director','Technical Director','Scout','Analyst'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Years of experience">
                <input className="form-control" type="number" min="0" max="60" value={draft.experience_years} onChange={upd('experience_years')} placeholder="e.g. 8" />
              </Field>
              <Field label="Current club / organisation">
                <input className="form-control" value={draft.current_club} onChange={upd('current_club')} placeholder="e.g. Lagos FC Academy" />
              </Field>
              <Field label="Nationality">
                <select className="form-select" value={draft.nationality} onChange={upd('nationality')}>
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select className="form-select" value={draft.gender} onChange={upd('gender')}>
                  <option value="">— Select —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </Field>
              <Field label="LinkedIn URL">
                <input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} placeholder="https://linkedin.com/in/yourname" />
              </Field>
              <Field label="Badges / Licences (comma-separated)" col="col-12">
                <input className="form-control" value={draft.badges} onChange={upd('badges')} placeholder="e.g. UEFA B, CAF A Licence, FIBA Level 2" />
              </Field>
              <Field label="About" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} placeholder="Your coaching philosophy, style and approach…" />
              </Field>
              <Field label="Key achievements" col="col-12">
                <textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} placeholder="Trophies, promotions, player development highlights…" />
              </Field>
              <div className="col-12 d-flex gap-4 flex-wrap">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="coach-open" checked={draft.open_to_work} onChange={upd('open_to_work')} />
                  <label className="form-check-label fw-semibold" htmlFor="coach-open">Open to work</label>
                  <div className="small text-muted">Shows a badge on your public profile.</div>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="coach-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="coach-public">Public profile</label>
                  <div className="small text-muted">Visible to academies and clubs.</div>
                </div>
              </div>
            </FormRow>
          </SectionCard>

          <div className="d-flex gap-3">
            <button className="btn btn-primary px-5" type="submit" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

// ─── Agent dashboard ──────────────────────────────────────────────────────────

function AgentDashboard({ supabase, user }) {
  const [agent,   setAgent]   = useState(null)
  const [draft,   setDraft]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [notice,  setNotice]  = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(true)
  const [watchlistCount, setWatchlistCount] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('agent_profiles')
        .select('id, agency_name, sport, nationality, gender, experience_years, regions, about, achievements, linkedin, is_public')
        .eq('user_id', user.id)
        .maybeSingle(),
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

  const upd = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const payload = {
      user_id:          user.id,
      agency_name:      draft.agency_name.trim()      || null,
      sport:            draft.sport,
      nationality:      draft.nationality             || null,
      gender:           draft.gender                  || null,
      experience_years: draft.experience_years ? Number(draft.experience_years) : null,
      regions:          draft.regions ? draft.regions.split(',').map((r) => r.trim()).filter(Boolean) : [],
      about:            draft.about.trim()            || null,
      achievements:     draft.achievements.trim()     || null,
      linkedin:         draft.linkedin.trim()         || null,
      is_public:        draft.is_public,
      updated_at:       new Date().toISOString(),
    }
    const q = agent
      ? supabase.from('agent_profiles').update(payload).eq('id', agent.id)
      : supabase.from('agent_profiles').insert(payload)
    const { data, error: err } = await q.select().single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setAgent(data)
    setNotice('Agency profile saved.')
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading your profile…</div>

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-bookmark-star"  label="Watchlisted players"    value={watchlistCount ?? '—'} colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-shield-check"   label="Access granted"         value="—"                     colour="linear-gradient(135deg,#198754,#20c997)" />
        <StatCard icon="bi-hourglass-split" label="Pending requests"      value="—"                     colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-star"           label="Average rating"         value="—"                     colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {draft && (
        <form onSubmit={save}>
          <SectionCard title="Agency profile">
            <FormRow>
              <Field label="Agency / company name">
                <input className="form-control" value={draft.agency_name} onChange={upd('agency_name')} placeholder="e.g. Elite Sports Management" />
              </Field>
              <Field label="Primary sport">
                <select className="form-select" value={draft.sport} onChange={upd('sport')}>
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                </select>
              </Field>
              <Field label="Years of experience">
                <input className="form-control" type="number" min="0" max="60" value={draft.experience_years} onChange={upd('experience_years')} placeholder="e.g. 10" />
              </Field>
              <Field label="Nationality">
                <select className="form-select" value={draft.nationality} onChange={upd('nationality')}>
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Gender">
                <select className="form-select" value={draft.gender} onChange={upd('gender')}>
                  <option value="">— Select —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </Field>
              <Field label="LinkedIn URL">
                <input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} placeholder="https://linkedin.com/in/yourname" />
              </Field>
              <Field label="Operating regions (comma-separated)" col="col-12">
                <input className="form-control" value={draft.regions} onChange={upd('regions')} placeholder="e.g. West Africa, Europe, Middle East" />
              </Field>
              <Field label="About your agency" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} placeholder="Experience, specialist areas, how you work with players and clubs…" />
              </Field>
              <Field label="Key achievements" col="col-12">
                <textarea className="form-control" rows={3} value={draft.achievements} onChange={upd('achievements')} placeholder="Notable transfers, club partnerships, player placements…" />
              </Field>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="agent-public" checked={draft.is_public} onChange={upd('is_public')} />
                  <label className="form-check-label fw-semibold" htmlFor="agent-public">Public profile</label>
                  <div className="small text-muted">Players and academies can find and rate you.</div>
                </div>
              </div>
            </FormRow>
          </SectionCard>

          <div className="d-flex gap-3">
            <button className="btn btn-primary px-5" type="submit" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
            </button>
          </div>
        </form>
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

  useEffect(() => {
    let alive = true
    supabase.from('academy_profiles')
      .select('id, club_id, sports, country, state, address, phone, year_founded, linkedin')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(async ({ data: ac, error: ae }) => {
        if (!alive) return
        if (ae) { setError(ae.message); setLoading(false); return }

        let clubData = null
        let playerCount = null
        let jobCount = null

        if (ac?.club_id) {
          const [{ data: cl }, { count: pc }, { count: jc }] = await Promise.all([
            supabase.from('clubs').select('id, name, country, about, website, sports, status').eq('id', ac.club_id).single(),
            supabase.from('players').select('id', { count: 'exact', head: true }).eq('academy_id', ac.id),
            supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('academy_id', ac.id).eq('status', 'open'),
          ])
          clubData = cl
          playerCount = pc ?? 0
          jobCount    = jc ?? 0
        }

        if (!alive) return
        setAcademy(ac)
        setClub(clubData)
        setStats({ players: playerCount, jobs: jobCount })

        const a = ac   ?? {}
        const c = clubData ?? {}
        setDraft({
          club_name:    c.name           ?? profile.full_name ?? '',
          country:      a.country        ?? '',
          state:        a.state          ?? '',
          address:      a.address        ?? '',
          phone:        a.phone          ?? '',
          year_founded: a.year_founded   != null ? String(a.year_founded) : '',
          linkedin:     a.linkedin       ?? '',
          about:        c.about          ?? '',
          website:      c.website        ?? '',
          sports:       Array.isArray(a.sports) ? a.sports : ['football'],
        })
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id, profile.full_name])

  const upd = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const toggleSport = (s) => setDraft((d) => {
    const has = d.sports.includes(s)
    if (has && d.sports.length === 1) return d  // keep at least one
    return { ...d, sports: has ? d.sports.filter((x) => x !== s) : [...d.sports, s] }
  })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')

    // Update club name/about/website
    if (club) {
      const { error: ce } = await supabase.from('clubs')
        .update({ name: draft.club_name.trim() || profile.full_name, about: draft.about.trim() || null, website: draft.website.trim() || null, sports: draft.sports, updated_at: new Date().toISOString() })
        .eq('id', club.id)
      if (ce) { setError(ce.message); setSaving(false); return }
    }

    // Update academy profile
    const apPayload = {
      user_id:      user.id,
      sports:       draft.sports,
      country:      draft.country      || null,
      state:        draft.state.trim() || null,
      address:      draft.address.trim() || null,
      phone:        draft.phone.trim()   || null,
      year_founded: draft.year_founded ? Number(draft.year_founded) : null,
      linkedin:     draft.linkedin.trim() || null,
      updated_at:   new Date().toISOString(),
    }
    const q = academy
      ? supabase.from('academy_profiles').update(apPayload).eq('id', academy.id)
      : supabase.from('academy_profiles').insert(apPayload)
    const { data, error: ae } = await q.select().single()
    setSaving(false)
    if (ae) { setError(ae.message); return }
    setAcademy(data)
    setNotice('Academy profile saved.')
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading your profile…</div>

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-people"          label="Players"           value={stats.players ?? '—'} colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-briefcase"       label="Open jobs"         value={stats.jobs    ?? '—'} colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-shield-check"    label="Access requests"   value="—"                    colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-calendar-event"  label="Active trials"     value="—"                    colour="linear-gradient(135deg,#198754,#20c997)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {draft && (
        <form onSubmit={save}>
          <SectionCard title="Club / academy profile">
            <FormRow>
              <Field label="Club / academy name" col="col-12 col-md-8">
                <input className="form-control" value={draft.club_name} onChange={upd('club_name')} placeholder="e.g. Lagos Sports Academy" required />
              </Field>
              <Field label="Year founded" col="col-12 col-md-4">
                <input className="form-control" type="number" min="1800" max={new Date().getFullYear()} value={draft.year_founded} onChange={upd('year_founded')} placeholder="e.g. 2005" />
              </Field>
              <Field label="Country">
                <select className="form-select" value={draft.country} onChange={upd('country')}>
                  <option value="">— Select —</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="State / Region">
                <input className="form-control" value={draft.state} onChange={upd('state')} placeholder="e.g. Lagos State" />
              </Field>
              <Field label="Address" col="col-12">
                <input className="form-control" value={draft.address} onChange={upd('address')} placeholder="Street address" />
              </Field>
              <Field label="Phone">
                <input className="form-control" type="tel" value={draft.phone} onChange={upd('phone')} placeholder="+234 800 000 0000" />
              </Field>
              <Field label="Website">
                <input className="form-control" type="url" value={draft.website} onChange={upd('website')} placeholder="https://youracademy.com" />
              </Field>
              <Field label="LinkedIn URL">
                <input className="form-control" type="url" value={draft.linkedin} onChange={upd('linkedin')} placeholder="https://linkedin.com/company/yourclub" />
              </Field>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Sports</label>
                <div className="d-flex gap-3">
                  {['football', 'basketball'].map((s) => (
                    <div className="form-check" key={s}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`academy-sport-${s}`}
                        checked={draft.sports.includes(s)}
                        onChange={() => toggleSport(s)}
                      />
                      <label className="form-check-label text-capitalize" htmlFor={`academy-sport-${s}`}>{s}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Field label="About the club / academy" col="col-12">
                <textarea className="form-control" rows={4} value={draft.about} onChange={upd('about')} placeholder="History, mission, facilities, coaching staff…" />
              </Field>
            </FormRow>
          </SectionCard>

          <div className="d-flex gap-3">
            <button className="btn btn-primary px-5" type="submit" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check2 me-2" />Save profile</>}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

// ─── Super Admin dashboard ────────────────────────────────────────────────────

function AdminDashboard({ supabase, user }) {
  const [users,        setUsers]        = useState([])
  const [accountCount, setAccountCount] = useState(0)
  const [roleDrafts,   setRoleDrafts]   = useState({})
  const [saving,       setSaving]       = useState(false)
  const [notice,       setNotice]       = useState('')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')

  useEffect(() => {
    let alive = true
    supabase.from('profiles')
      .select('id, email, full_name, role, created_at, status', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data, count, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        setUsers(data ?? [])
        setAccountCount(count ?? data?.length ?? 0)
        setRoleDrafts(Object.fromEntries((data ?? []).map((u) => [u.id, u.role])))
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase])

  const saveRole = async (uid) => {
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ role: roleDrafts[uid], updated_at: new Date().toISOString() })
      .eq('id', uid)
      .select('id, email, full_name, role, created_at, status')
      .single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setUsers((cur) => cur.map((u) => u.id === data.id ? data : u))
    setNotice(`Updated ${data.email}.`)
  }

  const roleCounts = ALL_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }), {})
  const filtered   = users.filter((u) =>
    !search || [u.full_name, u.email, u.role].some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-people"       label="Total accounts"  value={accountCount}            colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-person-arms-up" label="Players"       value={roleCounts.player}       colour="var(--fc-gradient-gold)" />
        <StatCard icon="bi-building"     label="Academies"       value={roleCounts.academy}      colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-binoculars"   label="Agents / Scouts" value={roleCounts.agent + roleCounts.coach} colour="linear-gradient(135deg,#198754,#20c997)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <section className="card p-4" aria-labelledby="admin-users-heading">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h2 className="h5 fw-bold mb-0" id="admin-users-heading" style={{ color: 'var(--fc-blue-700)' }}>
            User accounts
          </h2>
          <div style={{ maxWidth: 280, width: '100%' }}>
            <input
              className="form-control form-control-sm"
              type="search"
              placeholder="Filter by name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-4 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading users…</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Joined</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.full_name || <span className="text-muted fst-italic">Unnamed</span>}</td>
                    <td className="small">{u.email}</td>
                    <td>
                      <select
                        aria-label={`Role for ${u.email}`}
                        className="form-select form-select-sm"
                        disabled={u.id === user.id || saving}
                        value={roleDrafts[u.id] ?? u.role}
                        onChange={(e) => setRoleDrafts((cur) => ({ ...cur, [u.id]: e.target.value }))}
                      >
                        {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'text-bg-success' : u.status === 'suspended' ? 'text-bg-danger' : 'text-bg-warning'}`}>
                        {u.status ?? 'active'}
                      </span>
                    </td>
                    <td className="small text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        disabled={u.id === user.id || saving || (roleDrafts[u.id] ?? u.role) === u.role}
                        onClick={() => saveRole(u.id)}
                        type="button"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted py-4 mb-0">No users match your search.</p>
            )}
          </div>
        )}
      </section>
    </>
  )
}

// ─── Account details (shared sidebar) ────────────────────────────────────────

function AccountDetails({ supabase, user, profile, onProfileSaved }) {
  const [name,    setName]    = useState(profile?.full_name ?? '')
  const [saving,  setSaving]  = useState(false)
  const [notice,  setNotice]  = useState('')
  const [error,   setError]   = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select('id, email, full_name, role')
      .single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setNotice('Saved.')
    onProfileSaved(data)
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
        <button className="btn btn-sm btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </section>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard({ supabase, user, onBack }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    let alive = true
    supabase.from('profiles')
      .select('id, email, full_name, role, created_at, status, sport')
      .eq('id', user.id)
      .single()
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        setProfile(data)
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, user.id])

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted" role="status">
        <span className="spinner-border me-2" />Loading your dashboard…
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error || 'Could not load your profile. Please try refreshing.'}
        </div>
      </div>
    )
  }

  const role      = profile.role
  const roleLabel = ROLE_LABELS[role] ?? role
  const roleIcon  = ROLE_ICONS[role]  ?? 'bi-person'

  const roleContent = () => {
    if (role === 'super_admin') return <AdminDashboard  supabase={supabase} user={user} />
    if (role === 'player')      return <PlayerDashboard supabase={supabase} user={user} profile={profile} />
    if (role === 'coach')       return <CoachDashboard  supabase={supabase} user={user} profile={profile} />
    if (role === 'agent')       return <AgentDashboard  supabase={supabase} user={user} />
    if (role === 'academy')     return <AcademyDashboard supabase={supabase} user={user} profile={profile} />
    return (
      <div className="alert alert-warning">
        Unknown account role <strong>{role}</strong>. Please contact support.
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-5">
        <div>
          <span className="text-uppercase small fw-semibold text-muted">SportBridge account</span>
          <h1 className="h2 fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--fc-blue-700)' }}>
            <span className="fc-icon-badge" style={{ width: 40, height: 40, fontSize: '1rem', flexShrink: 0 }}>
              <i className={`bi ${roleIcon}`} aria-hidden="true" />
            </span>
            {role === 'super_admin' ? 'Admin dashboard' : `${roleLabel} dashboard`}
          </h1>
          <p className="text-muted mb-0">{user.email}</p>
        </div>
        <button className="btn btn-outline-primary" onClick={onBack} type="button">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />Back to home
        </button>
      </div>

      {/* Two-column layout: main content left, account card right */}
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-8 col-xl-9">
          {roleContent()}
        </div>
        <div className="col-12 col-lg-4 col-xl-3">
          <AccountDetails
            supabase={supabase}
            user={user}
            profile={profile}
            onProfileSaved={(updated) => setProfile((p) => ({ ...p, ...updated }))}
          />
          <div className="card p-4">
            <h2 className="h6 fw-bold mb-3">Quick links</h2>
            <ul className="list-unstyled small mb-0 d-grid gap-2">
              {role !== 'super_admin' && (
                <>
                  <li><a href="#roles" className="text-decoration-none"><i className="bi bi-newspaper me-2 text-primary" />Community feed</a></li>
                  <li><a href="#opportunities" className="text-decoration-none"><i className="bi bi-briefcase me-2 text-primary" />Job board</a></li>
                  <li><a href="#players" className="text-decoration-none"><i className="bi bi-person-lines-fill me-2 text-primary" />Player directory</a></li>
                </>
              )}
              <li>
                <button
                  className="btn btn-link p-0 text-danger small"
                  type="button"
                  onClick={() => supabase.auth.signOut()}
                >
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
