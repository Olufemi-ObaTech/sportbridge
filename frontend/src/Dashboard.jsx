import { useEffect, useState } from 'react'
import JobPostForm from './JobPostForm.jsx'
import PlayerUploadForm from './PlayerUploadForm.jsx'
import TryoutForm from './TryoutForm.jsx'
import VerifyForm, { CvOnlyForm } from './VerifyForm.jsx'
import VerifiedBadge from './VerifiedBadge.jsx'
import AcademyPlayerForm from './AcademyPlayerForm.jsx'
import { blockContactInfo } from './lib/uploadGuards'
import { FOOTBALL_POSITIONS, REGIONS, STAFF_ROLES } from './lib/features'

async function attachEvidenceLinks(supabase, item, isRosterEntry = false) {
  const candidates = isRosterEntry
    ? [
        ['Ownership / contract proof', item.ownership_proof_path],
        ['Player identity document', item.identity_document_path],
      ]
    : [
        ['Identity document', item.id_document_path || item.nin_selfie_path],
        ['Player release letter', item.release_letter_path],
        ['Academy CAC document', item.cac_document_path],
        ['Agent passport', item.agent_passport_path],
        ['Agent federation letter', item.license_path],
        ['Coach passport', item.coach_passport_path],
        ['Coach federation letter', item.coach_licence_path],
        ['CV', item.cv_path],
        ...((item.player_contracts ?? []).map((path, index) => [`Player contract ${index + 1}`, path])),
        ...((item.facility_pictures ?? []).map((path, index) => [`Facility photo ${index + 1}`, path])),
      ]
  const links = []
  const errors = []

  for (const [label, path] of candidates) {
    if (typeof path !== 'string' || !path) continue
    const legacyMarker = '/storage/v1/object/public/private-documents/'
    const legacyPath = path.includes(legacyMarker)
      ? decodeURIComponent(path.slice(path.indexOf(legacyMarker) + legacyMarker.length))
      : path
    if (/^https?:\/\//i.test(legacyPath) && legacyPath === path) {
      links.push({ label, url: path })
      continue
    }
    if (label.startsWith('Facility photo') && /^https?:\/\//i.test(legacyPath)) {
      links.push({ label, url: legacyPath })
      continue
    }
    const { data, error } = await supabase.storage.from('private-documents').createSignedUrl(legacyPath, 600)
    if (error || !data?.signedUrl) {
      errors.push(`${label}: ${error?.message ?? 'signed link unavailable'}`)
      continue
    }
    links.push({ label, url: data.signedUrl })
  }
  return { links, errors }
}

// â”€â”€â”€ constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
const USERS_PAGE_SIZE = 50

const POSITIONS_FOOTBALL = FOOTBALL_POSITIONS
const PLAYER_STATS_FIELDS = [
  { key: 'total_appearances', label: 'Total appearances' },
  { key: 'total_goals', label: 'Total goals' },
  { key: 'total_assists', label: 'Total assists' },
  { key: 'total_clean_sheets', label: 'Clean sheets' },
  { key: 'pass_accuracy', label: 'Pass accuracy (%)', max: 100 },
  { key: 'dribble_success', label: 'Dribble success (%)', max: 100 },
  { key: 'minutes_played', label: 'Minutes played' },
]
const COUNTRIES = [
  'Nigeria','Ghana','South Africa','Kenya','Egypt','Senegal',"Côte d'Ivoire",'Cameroon',
  'Morocco','England','France','Germany','Spain','Portugal','Italy','Brazil',
  'Argentina','USA','Japan','South Korea','Saudi Arabia','Qatar','UAE','Other',
]

// â”€â”€â”€ shared UI helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Verification badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function VerificationBadge({ status, role, label }) {
  return <VerifiedBadge status={status} role={role} label={label} className="px-2 py-1" />
}

// â”€â”€â”€ Profile completeness bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Player dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      .select('id, display_name, position, secondary_position, age, country, nationality, bio, is_public, sport, gender, foot, dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin, views_count, region, stats')
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
          stats: Object.fromEntries(PLAYER_STATS_FIELDS.map(({ key }) => [
            key,
            p.stats?.[key] != null ? String(p.stats[key]) : '',
          ])),
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
    const stats = player?.stats && typeof player.stats === 'object' && !Array.isArray(player.stats)
      ? { ...player.stats }
      : {}
    for (const { key, label, max } of PLAYER_STATS_FIELDS) {
      const rawValue = draft.stats?.[key]?.trim() ?? ''
      if (!rawValue) {
        delete stats[key]
        continue
      }
      const value = Number(rawValue)
      if (!Number.isSafeInteger(value) || value < 0 || (max != null && value > max)) {
        setError(`${label} must be a whole number${max == null ? ' greater than or equal to 0' : ` between 0 and ${max}`}.`)
        setSaving(false)
        return
      }
      stats[key] = value
    }
    const payload = {
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
      stats,
      updated_at:         new Date().toISOString(),
    }
    const q = player
      ? supabase.from('players').update(payload).eq('id', player.id).eq('profile_id', user.id)
      : supabase.from('players').insert({ profile_id: user.id, ...payload })
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
        {[['profile','bi-person-vcard','My Profile'],['uploads','bi-cloud-upload','Upload CV & Media'],['verify','bi-patch-check','Get Verified']].map(([tab, icon, label]) => (
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
          <SectionCard title="Performance statistics">
            <p className="small text-muted">Add or update your football statistics. These figures are player-reported and are not independently verified by SportBridge.</p>
            <FormRow>
              {PLAYER_STATS_FIELDS.map(({ key, label, max }) => (
                <Field key={key} label={label}>
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    max={max}
                    step="1"
                    inputMode="numeric"
                    value={draft.stats?.[key] ?? ''}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      stats: { ...current.stats, [key]: event.target.value },
                    }))}
                  />
                </Field>
              ))}
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

      {activeTab === 'verify' && (
        <SectionCard title="Verification">
          <VerifyForm supabase={supabase} user={user} role="player" verificationStatus={profile?.verification_status} onDone={() => setNotice('Submitted for review.')} />
        </SectionCard>
      )}
    </>
  )
}

// â”€â”€â”€ Coach dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CoachDashboard({ supabase, user, profile }) {
  const [coach,      setCoach]      = useState(null)
  const [draft,      setDraft]      = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [notice,     setNotice]     = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [activeTab,  setActiveTab]  = useState('profile')
  const [recPlayers, setRecPlayers] = useState([])
  const [recSearch,  setRecSearch]  = useState('')
  const [recPlayer,  setRecPlayer]  = useState('')
  const [recTargetType, setRecTargetType] = useState('agent')
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
  }

  if (loading) return <div className="py-5 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div>

  // â”€â”€ Recommend player handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const searchPlayers = async (q) => {
    setRecSearch(q)
    if (!q || q.length < 2 || !supabase) { setRecPlayers([]); return }
    const { data } = await supabase.from('players').select('id, display_name, position, current_club').ilike('display_name', `%${q}%`).limit(8)
    setRecPlayers(data ?? [])
  }

  const submitRecommendation = async (e) => {
    e.preventDefault()
    if (!recPlayer || !recTarget.trim()) return
    if (profile?.verification_status !== 'verified') {
      setError('Complete verification before recommending players.')
      return
    }
    setRecBusy(true)
    let agentProfileId = null
    let academyProfileId = null
    let targetName = recTarget.trim()
    if (recTargetType === 'agent') {
      const { data, error: targetError } = await supabase.from('agent_profiles')
        .select('id, agency_name').ilike('agency_name', `%${targetName}%`).limit(1).maybeSingle()
      if (targetError) {
        setRecBusy(false); setError(targetError.message); return
      }
      agentProfileId = data?.id ?? null
      targetName = data?.agency_name ?? targetName
      if (!agentProfileId) {
        setRecBusy(false); setError('No matching public agent or scout profile was found.'); return
      }
    } else {
      const { data: club, error: clubError } = await supabase.from('clubs')
        .select('id, name').ilike('name', `%${targetName}%`).limit(1).maybeSingle()
      if (clubError) {
        setRecBusy(false); setError(clubError.message); return
      }
      if (club) {
        const { data: academy, error: academyError } = await supabase.from('academy_profiles')
          .select('id').eq('club_id', club.id).maybeSingle()
        if (academyError) {
          setRecBusy(false); setError(academyError.message); return
        }
        academyProfileId = academy?.id ?? null
        targetName = club.name
      }
      if (!academyProfileId) {
        setRecBusy(false); setError('No matching active academy or club profile was found.'); return
      }
    }

    const { error: recommendationError } = await supabase.from('agent_recommendations').insert({
      recommender_user_id: user.id,
      agent_profile_id:    agentProfileId,
      academy_profile_id:  academyProfileId,
      recommended_to_type: recTargetType,
      sport:               'football',
      player_id:           recPlayer,
      recommended_to_name: targetName,
      note:                recNote.trim() || null,
      status:              'pending',
    })
    setRecBusy(false)
    if (recommendationError) {
      setError(recommendationError.message)
      return
    }
    setRecDone(`Player recommendation sent to ${targetName}.`)
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
        {[
          ['profile','bi-clipboard2-pulse','Coaching Profile'],
          ...(profile?.verification_status === 'verified' ? [['recommend','bi-send-check','Recommend a Player']] : []),
          ['cv','bi-file-earmark-person','Upload CV'],
          ['verify','bi-patch-check','Get Verified'],
        ].map(([tab, icon, label]) => (
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
        </form>
      )}

      {/* â”€â”€ Recommend a Player to Agent / Club â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Recipient type</label>
                <select className="form-select" value={recTargetType} onChange={(event) => setRecTargetType(event.target.value)}>
                  <option value="agent">Agent / Scout</option>
                  <option value="academy">Academy / Club</option>
                </select>
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{recTargetType === 'agent' ? 'Agent or agency name' : 'Academy or club name'}</label>
                <input
                  className="form-control"
                  placeholder={recTargetType === 'agent' ? 'e.g. Premier Football Agency' : 'e.g. Lagos United FC'}
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
    </>
  )
}

// â”€â”€â”€ Agent dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AgentDashboard({ supabase, user, profile }) {
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
        {[
          ['profile','bi-person-vcard','Agency Profile'],
          ...(profile?.verification_status === 'verified' ? [
            ['post-tryout','bi-calendar2-plus','Post Tryout'],
            ['post-position','bi-briefcase-fill','Post Position Needed'],
          ] : []),
          ['cv','bi-file-earmark-person','Upload CV'],
          ['verify','bi-patch-check','Get Verified'],
        ].map(([tab, icon, label]) => (
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

      {/* â”€â”€ Demo Flow 3: Agent posts Tryout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'post-tryout' && (
        <SectionCard title="Post a Tryout Opportunity">
          <TryoutForm supabase={supabase} user={user} profile={profile} onVerify={() => setActiveTab('verify')} onSaved={() => { setActiveTab('profile'); setNotice('Tryout posted.') }} />
        </SectionCard>
      )}

      {/* â”€â”€ Agent posts Player Position Needed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'post-position' && (
        <SectionCard title="Post Player Position Needed">
          <p className="text-muted small mb-4">
            Post a specific player position needed on behalf of a club or as an independent scout.
            This appears on the public Job Board and is matched to available players by position, age group and region.
          </p>
          <JobPostForm supabase={supabase} user={user} profile={profile} onVerify={() => setActiveTab('verify')} onSaved={() => { setActiveTab('profile'); setNotice('Position posted to job board.') }} />
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

// â”€â”€â”€ Academy dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        {[
          ['profile','bi-building','Club Profile'],
          ...(profile?.verification_status === 'verified' ? [
            ['roster','bi-people-fill','Add Player to Roster'],
            ['post-job','bi-briefcase-fill','Post a Job'],
          ] : []),
          ['cv','bi-file-earmark-person','Upload CV'],
          ['verify','bi-patch-check','Get Verified'],
        ].map(([tab, icon, label]) => (
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
        </form>
      )}

      {/* â”€â”€ Demo Flow 1: Club posts Player / Staff job â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {activeTab === 'roster' && (
        <SectionCard title="Add a player to your roster">
          <AcademyPlayerForm
            supabase={supabase}
            user={user}
            profile={profile}
            academyId={academy?.id}
            onVerify={() => setActiveTab('verify')}
            onSaved={() => {
              setStats((current) => ({ ...current, players: (current.players ?? 0) + 1 }))
              setNotice('Player submitted for document review.')
            }}
          />
        </SectionCard>
      )}

      {activeTab === 'post-job' && (
        <SectionCard title="Post a Job">
          <JobPostForm supabase={supabase} user={user} profile={profile} onVerify={() => setActiveTab('verify')} onSaved={() => { setActiveTab('profile'); setStats((s) => ({ ...s, jobs: (s.jobs ?? 0) + 1 })); setNotice('Job posted.') }} />
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

// â”€â”€â”€ Super Admin dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AdminDashboard({ supabase, user }) {
  const [users,        setUsers]       = useState([])
  const [accountCount, setAccountCount]= useState(0)
  const [matchingUserCount, setMatchingUserCount] = useState(0)
  const [newToday,     setNewToday]    = useState(0)
  const [roleCounts,   setRoleCounts]  = useState({})
  const [userPage,     setUserPage]    = useState(0)
  const [roleDrafts,   setRoleDrafts]  = useState({})
  const [saving,       setSaving]      = useState(false)
  const [notice,       setNotice]      = useState('')
  const [error,        setError]       = useState('')
  const [loading,      setLoading]     = useState(true)
  const [search,       setSearch]      = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeTab,    setActiveTab]   = useState('users')
  const [duplicates,   setDuplicates]  = useState([])
  const [flagged,      setFlagged]     = useState([])
  const [verifQueue,   setVerifQueue]  = useState([])
  const [rosterQueue,  setRosterQueue] = useState([])
  const [verificationLoaded, setVerificationLoaded] = useState(false)
  const [disputes,     setDisputes]    = useState([])
  const [verifNote,    setVerifNote]   = useState({})
  const [reportNotes,  setReportNotes] = useState({})

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const safeSearch = debouncedSearch.replace(/[(),*%_+\\'"]/g, ' ').trim().replace(/\s+/g, ' ')
    const profilesQuery = supabase.from('profiles')
      .select('id, email, full_name, role, created_at, status, verification_status, verification_badge, country, region', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(userPage * USERS_PAGE_SIZE, (userPage + 1) * USERS_PAGE_SIZE - 1)
    if (safeSearch) {
      const pattern = `%${safeSearch}%`
      profilesQuery.or([
        `full_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `role.ilike.${pattern}`,
        `status.ilike.${pattern}`,
        `country.ilike.${pattern}`,
        `region.ilike.${pattern}`,
      ].join(','))
    } else if (debouncedSearch) {
      profilesQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }
    Promise.all([
      profilesQuery,
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
      ...ALL_ROLES.map((role) => supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', role)),
    ]).then(([profileResult, totalResult, todayResult, ...roleResults]) => {
        if (!alive) return
        const queryError = [profileResult, totalResult, todayResult, ...roleResults].find((result) => result.error)?.error
        if (queryError) setError(queryError.message)
        const profiles = profileResult.data ?? []
        setUsers(profiles)
        setMatchingUserCount(profileResult.count ?? profiles.length)
        setAccountCount(totalResult.count ?? 0)
        setNewToday(todayResult.count ?? 0)
        setRoleCounts(Object.fromEntries(ALL_ROLES.map((role, index) => [
          role,
          roleResults[index].count ?? 0,
        ])))
        setRoleDrafts(Object.fromEntries(profiles.map((u) => [u.id, u.role])))
        setLoading(false)
      }).catch((loadError) => {
        if (!alive) return
        setError(`Could not load admin user data: ${loadError.message}`)
        setLoading(false)
      })
    return () => { alive = false }
  }, [supabase, userPage, debouncedSearch])

  useEffect(() => {
    if (activeTab === 'duplicates' && duplicates.length === 0) {
      supabase.from('uploads').select('id, user_id, file_hash, file_type, url, is_duplicate, created_at').eq('is_duplicate', true).order('created_at', { ascending: false }).limit(100)
        .then(({ data, error: duplicateError }) => {
          if (duplicateError) setError(`Could not load duplicate uploads: ${duplicateError.message}`)
          else setDuplicates(data ?? [])
        })
    }
    if (activeTab === 'flagged' && flagged.length === 0) {
      supabase.from('opportunities').select('id, title, region, fee_amount, fee_breakdown, description, status, is_fee_flagged, created_at').eq('is_fee_flagged', true).order('created_at', { ascending: false }).limit(100)
        .then(({ data, error: flaggedError }) => {
          if (flaggedError) setError(`Could not load flagged tryouts: ${flaggedError.message}`)
          else setFlagged(data ?? [])
        })
    }
    if (activeTab === 'verification' && !verificationLoaded) {
      Promise.all([
        supabase.from('verification_requests')
          .select('id, user_id, role, id_type, nin_number, passport_number, id_document_path, nin_selfie_path, release_letter_path, player_contracts, cac_document_path, company_reg_number, official_email, facility_pictures, fifa_agent_id, fa_verification_body, agent_passport_path, license_path, coach_passport_path, coach_fa_body, coach_licence_path, cv_path, status, submitted_at, reviewer_notes, profiles!verification_requests_user_id_fkey!inner(email, full_name)')
          .eq('status', 'pending').order('submitted_at', { ascending: true }).limit(40),
        supabase.from('academy_player_verifications')
          .select('id, player_id, academy_id, submitted_by, ownership_proof_path, identity_document_path, status, submitted_at, reviewer_notes, players!inner(display_name, position, age, nationality, country), profiles!academy_player_verifications_submitted_by_fkey(full_name, email)')
          .eq('status', 'pending').order('submitted_at', { ascending: true }).limit(40),
      ]).then(async ([requests, roster]) => {
        if (requests.error) setError(`Verification queue: ${requests.error.message}`)
        if (roster.error) setError(`Academy player review queue: ${roster.error.message}`)
        const enrichedRequests = await Promise.all((requests.data ?? []).map(async (item) => {
          const evidence = await attachEvidenceLinks(supabase, item)
          if (evidence.errors.length) setError(`Some verification evidence could not be opened: ${evidence.errors.join('; ')}`)
          return { ...item, evidenceLinks: evidence.links }
        }))
        const enrichedRoster = await Promise.all((roster.data ?? []).map(async (item) => {
          const evidence = await attachEvidenceLinks(supabase, item, true)
          if (evidence.errors.length) setError(`Some academy player evidence could not be opened: ${evidence.errors.join('; ')}`)
          return { ...item, evidenceLinks: evidence.links }
        }))
        setVerifQueue(enrichedRequests)
        setRosterQueue(enrichedRoster)
        setVerificationLoaded(true)
      }).catch((queueError) => {
        setError(`Could not load verification evidence: ${queueError.message}`)
        setVerificationLoaded(true)
      })
    }
    if (activeTab === 'disputes' && disputes.length === 0) {
      supabase.from('reports')
        .select('id, reporter_id, reported_user_id, reason, details, status, reviewer_notes, created_at, reporter:profiles!reporter_id (email, full_name), reported:profiles!reported_user_id (id, email, full_name, status)')
        .order('created_at', { ascending: false }).limit(100)
        .then(({ data, error: reportError }) => {
          if (reportError) setError(reportError.message)
          else setDisputes(data ?? [])
        })
    }
  }, [activeTab, supabase, duplicates.length, flagged.length, verificationLoaded, disputes.length])

  const approveOpp = async (id) => {
    setSaving(true); setError(''); setNotice('')
    const { error: updateError } = await supabase.from('opportunities')
      .update({ status: 'open', is_fee_flagged: false }).eq('id', id).select('id').single()
    setSaving(false)
    if (updateError) { setError(updateError.message); return }
    setFlagged((current) => current.filter((opportunity) => opportunity.id !== id))
    setNotice('Tryout approved.')
  }
  const rejectOpp = async (id) => {
    setSaving(true); setError(''); setNotice('')
    const { error: updateError } = await supabase.from('opportunities')
      .update({ status: 'rejected' }).eq('id', id).select('id').single()
    setSaving(false)
    if (updateError) { setError(updateError.message); return }
    setFlagged((current) => current.filter((opportunity) => opportunity.id !== id))
    setNotice('Tryout rejected.')
  }

  const approveVerif = async (req) => {
    setSaving(true); setError(''); setNotice('')
    const note = verifNote[req.id] ?? ''
    const { data: badge, error: reviewError } = await supabase.rpc('review_verification_request', {
      p_request_id: req.id,
      p_approved: true,
      p_reviewer_notes: note || null,
    })
    if (reviewError) {
      setSaving(false)
      setError(reviewError.message)
      return
    }
    setVerifQueue((q) => q.filter((r) => r.id !== req.id))
    setUsers((u) => u.map((row) => row.id === req.user_id
      ? { ...row, verification_status: 'verified', verification_badge: badge }
      : row))
    setSaving(false); setNotice(`${req.profiles?.email} verified — ${badge} badge applied.`)
  }

  const rejectVerif = async (req) => {
    setSaving(true); setError(''); setNotice('')
    const note = verifNote[req.id] ?? 'Verification rejected by admin.'
    const { error: reviewError } = await supabase.rpc('review_verification_request', {
      p_request_id: req.id,
      p_approved: false,
      p_reviewer_notes: note,
    })
    if (reviewError) {
      setSaving(false)
      setError(reviewError.message)
      return
    }
    setVerifQueue((q) => q.filter((r) => r.id !== req.id))
    setUsers((u) => u.map((row) => row.id === req.user_id
      ? { ...row, verification_status: 'rejected', verification_badge: null }
      : row))
    setSaving(false); setNotice(`${req.profiles?.email} verification rejected.`)
  }

  const reviewAcademyPlayer = async (item, approved) => {
    setSaving(true); setError(''); setNotice('')
    const { error: reviewError } = await supabase.rpc('review_academy_player_verification', {
      p_verification_id: item.id,
      p_approved: approved,
      p_reviewer_notes: verifNote[item.id] || null,
    })
    setSaving(false)
    if (reviewError) {
      setError(reviewError.message)
      return
    }
    setRosterQueue((current) => current.filter((row) => row.id !== item.id))
    setNotice(approved
      ? `${item.players?.display_name ?? 'Player'} approved and added to the public academy roster.`
      : `${item.players?.display_name ?? 'Player'} submission rejected.`)
  }

  const saveRole = async (uid) => {
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase.from('profiles')
      .update({ role: roleDrafts[uid], updated_at: new Date().toISOString() })
      .eq('id', uid).select('id, email, full_name, role, created_at, status').single()
    setSaving(false)
    if (err) { setError(err.message); return }
    setUsers((cur) => cur.map((u) => u.id === data.id ? { ...u, ...data } : u))
    setNotice(`Updated ${data.email}.`)
  }

  const setUserStatus = async (uid, newStatus, action) => {
    if (!window.confirm(`${action} this account?`)) return
    setSaving(true); setError(''); setNotice('')
    const { error: err } = await supabase.from('profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', uid)
    if (err) { setSaving(false); setError(err.message); return }
    setUsers((cur) => cur.map((u) => u.id === uid ? { ...u, status: newStatus } : u))
    setSaving(false)
    setNotice(`${action} successfully.`)
  }

  const resolveDispute = async (report, outcome) => {
    setSaving(true); setError(''); setNotice('')
    const notes = reportNotes[report.id] ?? ''
    const { error: reportError } = await supabase.rpc('review_user_report', {
      p_report_id: report.id,
      p_outcome: outcome,
      p_reviewer_notes: notes,
    })
    setSaving(false)
    if (reportError) { setError(reportError.message); return }
    setDisputes((current) => current.map((item) => item.id === report.id
      ? { ...item, status: outcome, reviewer_notes: notes }
      : item))
    if (outcome === 'confirmed_scam') {
      setUsers((current) => current.map((item) => item.id === report.reported_user_id
        ? { ...item, status: 'denied' }
        : item))
    }
    setNotice(outcome === 'confirmed_scam'
      ? 'Scam confirmed after investigation. The account has been disabled and records retained.'
      : outcome === 'investigating' ? 'Report marked as under investigation.' : 'Report dismissed.')
  }

  const filtered   = users
  const pendingVerif = users.filter((u) => u.verification_status === 'pending').length

  const TABS = [
    ['users',         'bi-people',        'Users'],
    ['verification',  'bi-patch-check',   `Verification${pendingVerif > 0 ? ` (${pendingVerif})` : ''}`],
    ['disputes',      'bi-exclamation-triangle', 'Disputes'],
    ['duplicates',    'bi-files',         'Duplicate Files'],
    ['flagged',       'bi-flag-fill',     'Fee-Flagged'],
  ]

  return (
    <>
      <div className="row g-3 mb-4">
        <StatCard icon="bi-people"         label="Total accounts"   value={accountCount}       colour="var(--fc-gradient-primary)" />
        <StatCard icon="bi-person-plus"    label="New today"        value={newToday}           colour={newToday > 0 ? 'linear-gradient(135deg,#198754,#20c997)' : 'linear-gradient(135deg,#6c757d,#adb5bd)'} />
        <StatCard icon="bi-building"       label="Academies"        value={roleCounts.academy} colour="linear-gradient(135deg,#6f42c1,#9d63e8)" />
        <StatCard icon="bi-person-arms-up" label="Players"          value={roleCounts.player}  colour="var(--fc-gradient-gold)" />
      </div>

      {error  && <div className="alert alert-danger"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <ul className="nav nav-tabs mb-4 flex-wrap" role="tablist">
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
            <input className="form-control form-control-sm" style={{ maxWidth: 320 }} type="search"
              placeholder="Search all users by name, email, role or location…"
              aria-label="Search all user accounts"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setUserPage(0) }} />
          </div>
          {loading ? <div className="py-4 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading…</div> : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Location</th><th>Role</th><th>Status</th><th>Verified</th><th>Joined</th><th><span className="visually-hidden">Actions</span></th></tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id} className={u.status === 'suspended' ? 'table-danger' : ''}>
                      <td className="fw-semibold">{u.full_name || <span className="text-muted fst-italic">Unnamed</span>}</td>
                      <td className="small">{u.email}</td>
                      <td className="small">{[u.region, u.country].filter(Boolean).join(', ') || <span className="text-muted">Not provided</span>}</td>
                      <td>
                        <select aria-label={`Role for ${u.email}`} className="form-select form-select-sm" style={{ minWidth: 110 }}
                          disabled={u.id === user.id || saving}
                          value={roleDrafts[u.id] ?? u.role}
                          onChange={(e) => setRoleDrafts((cur) => ({ ...cur, [u.id]: e.target.value }))}>
                          {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                      </td>
                      <td><span className={`badge ${u.status === 'active' ? 'text-bg-success' : u.status === 'suspended' || u.status === 'denied' ? 'text-bg-danger' : 'text-bg-warning'}`}>{u.status ?? 'active'}</span></td>
                      <td><VerificationBadge status={u.verification_status} role={u.role} label={u.verification_badge} /></td>
                      <td className="small text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <button className="btn btn-sm btn-outline-primary"
                            disabled={u.id === user.id || saving || (roleDrafts[u.id] ?? u.role) === u.role}
                            onClick={() => saveRole(u.id)} type="button">Save role</button>
                          {u.id !== user.id && u.status === 'pending' && <>
                            <button className="btn btn-sm btn-success" disabled={saving}
                              onClick={() => setUserStatus(u.id, 'active', 'Approve')} type="button">Approve</button>
                            <button className="btn btn-sm btn-outline-danger" disabled={saving}
                              onClick={() => setUserStatus(u.id, 'denied', 'Deny')} type="button">Deny</button>
                          </>}
                          {u.id !== user.id && u.status === 'active' && (
                            <>
                              <button className="btn btn-sm btn-outline-danger" disabled={saving}
                                onClick={() => setUserStatus(u.id, 'suspended', 'Suspend')} type="button">Suspend</button>
                              <button className="btn btn-sm btn-danger" disabled={saving}
                                onClick={() => setUserStatus(u.id, 'denied', 'Deny')} type="button">Deny</button>
                            </>
                          )}
                          {u.id !== user.id && ['suspended', 'denied'].includes(u.status) && (
                            <button className="btn btn-sm btn-outline-success" disabled={saving}
                              onClick={() => setUserStatus(u.id, 'active', 'Reactivate')} type="button">Reactivate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="text-center text-muted py-4 mb-0">No accounts match your search.</p>}
            </div>
          )}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="small text-muted">
              Page {userPage + 1} of {Math.max(1, Math.ceil(matchingUserCount / USERS_PAGE_SIZE))}
              {' · '}{matchingUserCount} matching · {accountCount} total accounts
            </span>
            <div className="btn-group btn-group-sm" role="group" aria-label="User list pages">
              <button className="btn btn-outline-secondary" type="button" disabled={userPage === 0 || loading}
                onClick={() => setUserPage((page) => Math.max(0, page - 1))}>Previous</button>
              <button className="btn btn-outline-secondary" type="button" disabled={(userPage + 1) * USERS_PAGE_SIZE >= matchingUserCount || loading}
                onClick={() => setUserPage((page) => page + 1)}>Next</button>
            </div>
          </div>
        </section>
      )}

      {/* Verification queue */}
      {activeTab === 'verification' && (
        <section className="card p-4">
          <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>
            Verification Queue
            {verifQueue.length > 0 && <span className="badge text-bg-warning ms-2">{verifQueue.length} pending</span>}
          </h2>
          {verifQueue.length === 0 ? (
            <p className="text-muted">No pending verification requests.</p>
          ) : verifQueue.map((req) => (
            <div key={req.id} className="card p-3 mb-3" style={{ borderLeft: '4px solid var(--fc-blue-500)' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div className="fw-bold">{req.profiles?.full_name || req.profiles?.email}</div>
                  <div className="small text-muted">{req.profiles?.email} · <span className="text-capitalize">{req.role}</span></div>
                  <div className="small text-muted">Submitted: {new Date(req.submitted_at).toLocaleDateString()}</div>
                  {req.nin_number && <div className="small text-muted">NIN: {req.nin_number.slice(0,4)}*******</div>}
                </div>
                <span className="badge text-bg-warning">Pending</span>
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {(req.evidenceLinks ?? []).map((link) => (
                  <a key={link.label} className="btn btn-sm btn-outline-primary" href={link.url} target="_blank" rel="noopener noreferrer">
                    <i className="bi bi-file-earmark-check me-1" />{link.label}
                  </a>
                ))}
              </div>
              <div className="mb-2">
                <label className="form-label small fw-semibold mb-1" htmlFor={`note-${req.id}`}>Admin note (optional)</label>
                <input
                  id={`note-${req.id}`}
                  className="form-control form-control-sm"
                  placeholder="Reason for approval or rejection…"
                  value={verifNote[req.id] ?? ''}
                  onChange={(e) => setVerifNote((n) => ({ ...n, [req.id]: e.target.value }))}
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-success d-flex align-items-center gap-1" type="button"
                  disabled={saving} onClick={() => approveVerif(req)}>
                  <i className="bi bi-patch-check-fill" />Approve — Mark Verified
                </button>
                <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" type="button"
                  disabled={saving} onClick={() => rejectVerif(req)}>
                  <i className="bi bi-x-circle" />Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {activeTab === 'verification' && (
        <section className="card p-4 mt-4">
          <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>
            Academy player ownership review
            {rosterQueue.length > 0 && <span className="badge text-bg-warning ms-2">{rosterQueue.length} pending</span>}
          </h2>
          {rosterQueue.length === 0 ? <p className="text-muted mb-0">No academy player submissions are waiting for review.</p>
            : rosterQueue.map((item) => (
              <article key={item.id} className="card p-3 mb-3">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <div>
                    <h3 className="h6 fw-bold mb-1">{item.players?.display_name || 'Player submission'}</h3>
                    <p className="small text-muted mb-2">
                      {item.players?.position || 'Position not provided'} · {item.players?.age ?? 'Age not provided'} · {item.players?.nationality || item.players?.country || 'Nationality not provided'}
                    </p>
                    <p className="small text-muted mb-2">
                      Submitted by {item.profiles?.full_name || item.profiles?.email || 'Academy'} on {new Date(item.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="badge text-bg-warning align-self-start">Pending</span>
                </div>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {(item.evidenceLinks ?? []).map((link) => (
                    <a key={link.label} className="btn btn-sm btn-outline-primary" href={link.url} target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-file-earmark-check me-1" />{link.label}
                    </a>
                  ))}
                </div>
                <label className="form-label small fw-semibold" htmlFor={`note-${item.id}`}>Review note</label>
                <input id={`note-${item.id}`} className="form-control form-control-sm mb-2"
                  value={verifNote[item.id] ?? ''} onChange={(event) => setVerifNote((current) => ({ ...current, [item.id]: event.target.value }))} />
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-success" type="button" disabled={saving || !(item.evidenceLinks?.length)}
                    onClick={() => reviewAcademyPlayer(item, true)}>Approve ownership & publish</button>
                  <button className="btn btn-sm btn-outline-danger" type="button" disabled={saving}
                    onClick={() => reviewAcademyPlayer(item, false)}>Reject submission</button>
                </div>
              </article>
            ))}
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
                    <button className="btn btn-sm btn-success" type="button" disabled={saving} onClick={() => approveOpp(opp.id)}>
                      <i className="bi bi-check-lg me-1" />Approve
                    </button>
                    <button className="btn btn-sm btn-danger" type="button" disabled={saving} onClick={() => rejectOpp(opp.id)}>
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

      {/* Disputes */}
      {activeTab === 'disputes' && (
        <section className="card p-4">
          <h2 className="h5 fw-bold mb-4" style={{ color: 'var(--fc-blue-700)' }}>
            Disputes & Reports
            {disputes.filter((d) => d.status === 'pending').length > 0 && (
              <span className="badge text-bg-danger ms-2">{disputes.filter((d) => d.status === 'pending').length} open</span>
            )}
          </h2>
          {disputes.length === 0 ? (
            <p className="text-muted">No disputes or reports filed yet.</p>
          ) : disputes.map((d) => (
            <div key={d.id} className={`card p-3 mb-3 ${d.status === 'pending' ? 'border-danger' : ''}`}
              style={{ borderLeft: `4px solid ${d.status === 'pending' ? '#dc3545' : d.status === 'actioned' ? '#198754' : '#6c757d'}` }}>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div className="fw-bold small">Reported: {d.reported?.full_name || d.reported?.email || 'Unavailable account'}</div>
                  <div className="small text-muted">Reported by: {d.reporter?.full_name || d.reporter?.email || 'Unknown user'}</div>
                  <div className="small text-muted">
                    Reason: <strong className="text-capitalize">{d.reason?.replace(/_/g, ' ')}</strong>
                    {' · '}{new Date(d.created_at).toLocaleDateString()}
                  </div>
                  {d.details && <p className="small text-muted mt-1 mb-0">{d.details}</p>}
                </div>
                <span className={`badge ${d.status === 'pending' ? 'text-bg-danger' : d.status === 'actioned' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                  {d.status}
                </span>
              </div>
              {d.reviewer_notes && <p className="small mt-2 mb-0"><strong>Investigation notes:</strong> {d.reviewer_notes}</p>}
              {['pending', 'investigating'].includes(d.status) && (
                <div className="mt-3">
                  <label className="form-label small fw-semibold" htmlFor={`report-note-${d.id}`}>Investigation notes</label>
                  <textarea id={`report-note-${d.id}`} className="form-control form-control-sm mb-2" rows="2"
                    value={reportNotes[d.id] ?? ''} onChange={(event) => setReportNotes((current) => ({ ...current, [d.id]: event.target.value }))} />
                  <div className="d-flex gap-2 flex-wrap">
                    {d.status === 'pending' && <button className="btn btn-sm btn-outline-primary" type="button" disabled={saving}
                      onClick={() => resolveDispute(d, 'investigating')}>Investigate</button>}
                    <button className="btn btn-sm btn-success" type="button" disabled={saving || !reportNotes[d.id]?.trim()}
                      onClick={() => resolveDispute(d, 'confirmed_scam')}>
                      <i className="bi bi-shield-exclamation me-1" />Confirm scam & disable account
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" type="button" disabled={saving || !reportNotes[d.id]?.trim()}
                      onClick={() => resolveDispute(d, 'dismissed')}>
                      <i className="bi bi-x-circle me-1" />Dismiss report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </>
  )
}

// â”€â”€â”€ Account details sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AccountDetails({ supabase, user, profile, onProfileSaved }) {
  const [name,   setName]   = useState(profile?.full_name ?? '')
  const [country, setCountry] = useState(profile?.country ?? '')
  const [region, setRegion] = useState(profile?.region ?? '')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error,  setError]  = useState('')

  const save = async (e) => {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const { data, error: err } = await supabase.from('profiles').update({
      full_name: name.trim() || null,
      country: country.trim() || null,
      region: region.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id).select('id, email, full_name, role, country, region').single()
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
          <label className="form-label small fw-semibold" htmlFor="acct-country">Country</label>
          <input id="acct-country" className="form-control form-control-sm" value={country} maxLength={100}
            onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" />
        </div>
        <div>
          <label className="form-label small fw-semibold" htmlFor="acct-region">Region / city</label>
          <input id="acct-region" className="form-control form-control-sm" value={region} maxLength={100}
            onChange={(e) => setRegion(e.target.value)} autoComplete="address-level1" />
          <div className="form-text">Optional, self-reported location. No GPS or precise location is collected.</div>
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

// â”€â”€â”€ Main Dashboard shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const [now,         setNow]         = useState(null)

  useEffect(() => {
    const updateNow = () => setNow(Date.now())
    updateNow()
    const timer = window.setInterval(updateNow, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let alive = true
    supabase.from('profiles').select('id, email, full_name, role, created_at, status, sport, verification_status, verification_badge, country, region').eq('id', user.id).single()
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

  function timeAgo(iso) {
    if (!iso || now == null) return ''
    const timestamp = Date.parse(iso)
    if (!Number.isFinite(timestamp)) return ''
    const s = Math.max(0, Math.floor((now - timestamp) / 1000))
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
    if (role === 'super_admin') return <AdminDashboard   supabase={supabase} user={user} />
    if (role === 'player')      return <PlayerDashboard  supabase={supabase} user={user} profile={profile} />
    if (role === 'coach')       return <CoachDashboard   supabase={supabase} user={user} profile={profile} />
    if (role === 'agent')       return <AgentDashboard   supabase={supabase} user={user} profile={profile} />
    if (role === 'academy')     return <AcademyDashboard supabase={supabase} user={user} profile={profile} />
    return <div className="alert alert-warning">Unknown role <strong>{role}</strong>.</div>
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
            {role === 'super_admin' ? 'Admin dashboard' : `${roleLabel} dashboard`}
          </h1>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className="text-muted small">{user.email}</span>
            <VerificationBadge status={profile.verification_status} role={profile.role} label={profile.verification_badge} />
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

      {/* â”€â”€ Main role content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {dashTab === 'main' && (
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-8 col-xl-9">{roleContent()}</div>
          <div className="col-12 col-lg-4 col-xl-3">
            <AccountDetails supabase={supabase} user={user} profile={profile} onProfileSaved={(u) => setProfile((p) => ({ ...p, ...u }))} />
            <div className="card p-4">
              <h2 className="h6 fw-bold mb-3">Quick links</h2>
              <ul className="list-unstyled small mb-0 d-grid gap-2">
                {role !== 'super_admin' && (<>
                  <li><a href="#players" className="text-decoration-none"><i className="bi bi-person-lines-fill me-2 text-primary" />Player directory</a></li>
                  <li><button className="btn btn-link p-0 small text-start" type="button" onClick={() => setDashTab('inbox')}><i className="bi bi-chat-dots me-2 text-primary" />Inbox</button></li>
                </>)}
                <li>
                  <button className="btn btn-link p-0 text-danger small" type="button" onClick={() => supabase.auth.signOut()}>
                    <i className="bi bi-box-arrow-right me-2" />Sign out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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

      {/* â”€â”€ Inbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {dashTab === 'inbox' && (
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
    </div>
  )
}

export default Dashboard
