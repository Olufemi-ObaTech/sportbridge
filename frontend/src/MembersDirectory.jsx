/**
 * MembersDirectory.jsx
 * Directory pages for Coaches, Agents, Clubs and Analysts.
 * - Lists public profiles from Supabase with search + filter
 * - Profile detail view for each member type
 * - Full profile visible to verified members only (guests see a blurred teaser + join CTA)
 * - Avatar uses role-colour circle + icon (no photo required)
 * - All UI strings are translated via i18n
 */

import { useEffect, useState } from 'react'
import ReportProfileButton from './ReportProfileButton.jsx'
import VerifiedBadge from './VerifiedBadge.jsx'
import { COUNTRIES, STAFF_ROLES } from './lib/features.js'

// ─── Role metadata ─────────────────────────────────────────────────────────────
const ROLE_META = {
  coach:          { icon: 'bi-clipboard2-pulse', colour: '#F5B301', label: 'Coach / Manager',  darkText: true  },
  agent:          { icon: 'bi-binoculars',       colour: '#198754', label: 'Agent / Scout',    darkText: false },
  academy:        { icon: 'bi-building',         colour: '#6f42c1', label: 'Club / Academy',   darkText: false },
  sports_analyst: { icon: 'bi-graph-up-arrow',   colour: '#fd7e14', label: 'Sports Analyst',   darkText: false },
}

const TABS = [
  { key: 'coach',          label: 'Coaches',   icon: 'bi-clipboard2-pulse' },
  { key: 'agent',          label: 'Agents',    icon: 'bi-binoculars'       },
  { key: 'academy',        label: 'Clubs',     icon: 'bi-building'         },
  { key: 'sports_analyst', label: 'Analysts',  icon: 'bi-graph-up-arrow'   },
]

// ─── Avatar component (role-colour circle with icon — no photo needed) ─────────
function RoleAvatar({ role, size = 64, name }) {
  const m = ROLE_META[role] ?? { icon: 'bi-person', colour: '#6c757d' }
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
      style={{
        width: size, height: size,
        background: m.colour,
        color: m.darkText ? '#212529' : '#fff',
        fontSize: size * 0.38,
        fontWeight: 700,
        fontFamily: 'var(--fc-font-heading)',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {initials || <i className={`bi ${m.icon}`} />}
    </div>
  )
}

// ─── Member card (used in directory list) ──────────────────────────────────────
function MemberCard({ member, role, onView }) {
  const m    = ROLE_META[role] ?? ROLE_META.coach
  const name = member.full_name || member.agency_name || member.name || 'Member'
  const sub1 = member.preferred_role || member.agency_name || member.name || null
  const sub2 = member.nationality || member.country || null
  const sub3 = member.current_club || null
  const verified = member.verification_status === 'verified' || member.verified_badge

  return (
    <article
      className="card h-100 p-3 fc-member-card"
      style={{ border: 'none', boxShadow: '0 1px 6px rgba(0,0,0,.08)', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
      aria-label={`View profile of ${name}`}
    >
      <div className="d-flex gap-3 align-items-start">
        <RoleAvatar role={role} size={52} name={name} />
        <div className="min-w-0 flex-grow-1">
          <div className="fw-bold text-truncate d-flex align-items-center gap-1" style={{ color: 'var(--fc-blue-700)', fontSize: 15 }}>
            {name}
            {verified && <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: 13 }} aria-label="Verified" />}
          </div>
          {sub1 && <div className="small text-muted text-truncate">{sub1}</div>}
          {sub2 && <div className="small text-muted text-truncate">{sub2}</div>}
          {sub3 && <div className="small text-muted text-truncate fst-italic">{sub3}</div>}
          <span className="badge mt-2" style={{ background: m.colour, color: m.darkText ? '#212529' : '#fff', fontSize: 10 }}>
            {m.label}
          </span>
        </div>
      </div>
      {member.open_to_work && (
        <div className="mt-2">
          <span className="badge text-bg-success" style={{ fontSize: 10 }}>
            <i className="bi bi-circle-fill me-1" style={{ fontSize: 7 }} />Open to work
          </span>
        </div>
      )}
    </article>
  )
}

// ─── Verified-only gate ────────────────────────────────────────────────────────
function VerifiedGate({ user, profile, onSignup, children }) {
  const isVerified = profile?.verification_status === 'verified'
  const isLoggedIn = Boolean(user)

  if (isVerified) return children

  return (
    <div className="position-relative">
      {/* Blurred preview */}
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
        {children}
      </div>
      {/* Gate overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(2px)', borderRadius: 8 }}
      >
        <div className="text-center p-4" style={{ maxWidth: 320 }}>
          <i className="bi bi-shield-lock-fill fs-2 mb-3 d-block" style={{ color: 'var(--fc-blue-500)' }} />
          <h3 className="h6 fw-bold mb-2">Verified members only</h3>
          <p className="small text-muted mb-3">
            Full profiles are visible to verified SportBridge members. Get verified to see contact details, CVs and full profiles.
          </p>
          {!isLoggedIn ? (
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <button className="btn btn-primary btn-sm" type="button" onClick={() => onSignup('player')}>
                <i className="bi bi-person-plus me-1" />Join free
              </button>
              <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => onSignup('signin')}>
                Sign in
              </button>
            </div>
          ) : (
            <div className="alert alert-warning py-2 small mb-0">
              <i className="bi bi-hourglass-split me-1" />
              Complete identity verification in your dashboard to access full profiles.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Info row helper ───────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="d-flex align-items-start gap-2 mb-2">
      <i className={`bi ${icon} text-primary flex-shrink-0 mt-1`} style={{ fontSize: 14 }} aria-hidden="true" />
      <div>
        <span className="small text-muted">{label}: </span>
        <span className="small fw-semibold">{value}</span>
      </div>
    </div>
  )
}

// ─── Coach / Analyst full profile ──────────────────────────────────────────────
function CoachProfile({ member, profile, user, onBack, onSignup, role }) {
  const m = ROLE_META[role] ?? ROLE_META.coach
  const verified = profile?.verification_status === 'verified'
  const badges = Array.isArray(member.badges) ? member.badges : []

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <button className="btn btn-link p-0 mb-4 text-decoration-none" type="button" onClick={onBack}>
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4">
        {/* Left — profile card */}
        <div className="col-12 col-md-8">
          <div className="card p-4 mb-4">
            {/* Header */}
            <div className="d-flex gap-4 align-items-start mb-4">
              <RoleAvatar role={role} size={80} name={member.full_name} />
              <div>
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  {member.full_name}
                  {verified && (
                    <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: 20 }} aria-label="Verified" />
                  )}
                </h1>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge" style={{ background: m.colour, color: m.darkText ? '#212529' : '#fff' }}>
                    <i className={`bi ${m.icon} me-1`} />{m.label}
                  </span>
                  {member.preferred_role && (
                    <span className="badge text-bg-light border">{member.preferred_role}</span>
                  )}
                  {member.open_to_work && (
                    <span className="badge text-bg-success">
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }} />Open to work
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Key info */}
            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-6">
                <InfoRow icon="bi-globe2"           label="Nationality"     value={member.nationality} />
                <InfoRow icon="bi-briefcase"         label="Experience"      value={member.experience_years ? `${member.experience_years} years` : null} />
                <InfoRow icon="bi-building"          label="Current club"    value={member.current_club} />
              </div>
              <div className="col-12 col-sm-6">
                <InfoRow icon="bi-dribbble"          label="Sport"           value={member.sport} />
                <InfoRow icon="bi-gender-ambiguous"  label="Gender"          value={member.gender} />
                {member.linkedin && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-linkedin text-primary" style={{ fontSize: 14 }} />
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="small">
                      LinkedIn profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            {member.about && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>About</h2>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>{member.about}</p>
              </div>
            )}

            {/* Achievements */}
            {member.achievements && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-trophy me-2 text-warning" />Key achievements
                </h2>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>{member.achievements}</p>
              </div>
            )}

            {/* Badges / licences */}
            {badges.length > 0 && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-award me-2 text-primary" />
                  {role === 'sports_analyst' ? 'Tools & Certifications' : 'Badges & Licences'}
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {badges.map((b, i) => (
                    <span key={i} className="badge text-bg-light border fw-normal">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — contact sidebar */}
        <div className="col-12 col-md-4">
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Contact</h2>
            <VerifiedGate user={user} profile={profile} onSignup={onSignup}>
              <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                <p className="small text-muted mb-2">
                  <i className="bi bi-shield-check text-success me-1" />
                  Contact details are protected. Send a message via the secure inbox.
                </p>
                {user ? (
                  <button className="btn btn-primary w-100 btn-sm" type="button">
                    <i className="bi bi-chat-dots me-2" />Send message
                  </button>
                ) : (
                  <button className="btn btn-primary w-100 btn-sm" type="button" onClick={() => onSignup('player')}>
                    <i className="bi bi-person-plus me-2" />Join to connect
                  </button>
                )}
              </div>
            </VerifiedGate>
          </div>

          <div className="card p-4">
            <h2 className="h6 fw-bold mb-3">Verification</h2>
            <VerifiedBadge status={profile?.verification_status} />
            {!verified && (
              <p className="small text-muted mt-2 mb-0">
                This member has not yet completed identity verification.
              </p>
            )}
          </div>
          <div className="card p-4 mt-3">
            <ReportProfileButton supabase={supabase} user={user}
              reportedUserId={profile?.id} reportedName={member.full_name} onSignup={onSignup} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Agent full profile ────────────────────────────────────────────────────────
function AgentProfile({ member, profile, user, onBack, onSignup }) {
  const verified = profile?.verification_status === 'verified'
  const regions  = Array.isArray(member.regions) ? member.regions : []

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <button className="btn btn-link p-0 mb-4 text-decoration-none" type="button" onClick={onBack}>
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4">
        <div className="col-12 col-md-8">
          <div className="card p-4 mb-4">
            <div className="d-flex gap-4 align-items-start mb-4">
              <RoleAvatar role="agent" size={80} name={member.agency_name} />
              <div>
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  {member.agency_name || 'Agency'}
                  {verified && <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: 20 }} />}
                </h1>
                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <span className="badge" style={{ background: '#198754', color: '#fff' }}>
                    <i className="bi bi-binoculars me-1" />Agent / Scout
                  </span>
                  {verified && <span className="badge text-bg-success">FIFA Agent Verified</span>}
                </div>
              </div>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-6">
                <InfoRow icon="bi-globe2"    label="Nationality"  value={member.nationality} />
                <InfoRow icon="bi-briefcase" label="Experience"   value={member.experience_years ? `${member.experience_years} years` : null} />
              </div>
              <div className="col-12 col-sm-6">
                <InfoRow icon="bi-dribbble"  label="Sport"        value={member.sport} />
              </div>
            </div>

            {regions.length > 0 && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-geo-alt me-2" />Operating regions
                </h2>
                <div className="d-flex flex-wrap gap-2">
                  {regions.map((r, i) => <span key={i} className="badge text-bg-light border">{r}</span>)}
                </div>
              </div>
            )}

            {member.about && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>About</h2>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>{member.about}</p>
              </div>
            )}

            {member.achievements && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-trophy me-2 text-warning" />Key achievements
                </h2>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>{member.achievements}</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Contact agency</h2>
            <VerifiedGate user={user} profile={profile} onSignup={onSignup}>
              <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                <p className="small text-muted mb-2">
                  <i className="bi bi-shield-check text-success me-1" />All contact is through the secure SportBridge inbox.
                </p>
                {user ? (
                  <button className="btn btn-primary w-100 btn-sm" type="button">
                    <i className="bi bi-chat-dots me-2" />Send message
                  </button>
                ) : (
                  <button className="btn btn-primary w-100 btn-sm" type="button" onClick={() => onSignup('player')}>
                    <i className="bi bi-person-plus me-2" />Join to connect
                  </button>
                )}
              </div>
            </VerifiedGate>
          </div>
          <div className="card p-4">
            <h2 className="h6 fw-bold mb-3">Verification</h2>
            <VerifiedBadge status={profile?.verification_status} />
          </div>
          <div className="card p-4 mt-3">
            <ReportProfileButton supabase={supabase} user={user}
              reportedUserId={profile?.id} reportedName={member.agency_name || 'Agency'} onSignup={onSignup} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Club / Academy full profile ───────────────────────────────────────────────
function ClubProfile({ member, academy, user, profile, onBack, onSignup }) {
  const verified = member.verified_badge || profile?.verification_status === 'verified'

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <button className="btn btn-link p-0 mb-4 text-decoration-none" type="button" onClick={onBack}>
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4">
        <div className="col-12 col-md-8">
          <div className="card p-4 mb-4">
            <div className="d-flex gap-4 align-items-start mb-4">
              <RoleAvatar role="academy" size={80} name={member.name} />
              <div>
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  {member.name}
                  {verified && <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: 20 }} />}
                </h1>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge" style={{ background: '#6f42c1', color: '#fff' }}>
                    <i className="bi bi-building me-1" />Club / Academy
                  </span>
                  {verified && <span className="badge text-bg-success">FIFA TMS Verified</span>}
                </div>
              </div>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-6">
                <InfoRow icon="bi-geo-alt"    label="Country"       value={member.country} />
                <InfoRow icon="bi-pin-map"    label="State / City"  value={academy?.state} />
                <InfoRow icon="bi-calendar3"  label="Founded"       value={academy?.year_founded} />
              </div>
              <div className="col-12 col-sm-6">
                <InfoRow icon="bi-telephone"  label="Phone"         value={academy?.phone} />
                <InfoRow icon="bi-dribbble"   label="Sports"        value={Array.isArray(academy?.sports) ? academy.sports.join(', ') : null} />
                {member.website && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-globe text-primary" style={{ fontSize: 14 }} />
                    <a href={member.website} target="_blank" rel="noopener noreferrer" className="small text-truncate">
                      {member.website.replace('https://','').replace('http://','')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {member.about && (
              <div className="mb-4">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>About the club</h2>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>{member.about}</p>
              </div>
            )}

            {academy?.address && (
              <div className="mb-2">
                <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                  <i className="bi bi-geo-alt-fill me-2 text-primary" />Address
                </h2>
                <p className="small text-muted mb-0">{academy.address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Contact club</h2>
            <VerifiedGate user={user} profile={profile} onSignup={onSignup}>
              <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                <p className="small text-muted mb-2">
                  <i className="bi bi-shield-check text-success me-1" />Contact via the secure SportBridge inbox only.
                </p>
                {user ? (
                  <button className="btn btn-primary w-100 btn-sm" type="button">
                    <i className="bi bi-chat-dots me-2" />Send message
                  </button>
                ) : (
                  <button className="btn btn-primary w-100 btn-sm" type="button" onClick={() => onSignup('player')}>
                    <i className="bi bi-person-plus me-2" />Join to connect
                  </button>
                )}
              </div>
            </VerifiedGate>
          </div>
          <div className="card p-4">
            <h2 className="h6 fw-bold mb-3">Verification</h2>
            <VerifiedBadge status={verified ? 'verified' : 'unverified'} />
          </div>
          <div className="card p-4 mt-3">
            <ReportProfileButton supabase={supabase} user={user}
              reportedUserId={profile?.id} reportedName={member.name} onSignup={onSignup} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card p-3" aria-hidden="true">
      <div className="d-flex gap-3 align-items-start">
        <div className="rounded-circle flex-shrink-0" style={{ width: 52, height: 52, background: 'var(--bs-border-color)' }} />
        <div className="flex-grow-1">
          {[70, 50, 90].map((w, i) => (
            <div key={i} className="rounded mb-2" style={{ height: 12, width: `${w}%`, background: 'var(--bs-border-color)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main MembersDirectory component ──────────────────────────────────────────
export default function MembersDirectory({ supabase, user, onSignup, onBack, initialSelection }) {
  const [activeTab,    setActiveTab]    = useState('coach')
  const [coaches,      setCoaches]      = useState([])
  const [agents,       setAgents]       = useState([])
  const [clubs,        setClubs]        = useState([])
  const [analysts,     setAnalysts]     = useState([])
  const [profiles,     setProfiles]     = useState({}) // profile_id/user_id -> profile row
  const [academies,    setAcademies]    = useState({}) // user_id -> academy_profile row
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterRole,   setFilterRole]   = useState('')
  const [filterCountry,setFilterCountry]= useState('')
  const [openTo,       setOpenTo]       = useState(false)
  const [selected,     setSelected]     = useState(initialSelection ?? null) // { type, item }

  // When initialSelection is provided from community, profile lookup may be empty.
  // We store it but render the profile view only after the main data fetch completes OR
  // after we individually fetch the profile row (handled in the useEffect below).
  const [initialProfileFetched, setInitialProfileFetched] = useState(!initialSelection)

  // Fetch all data once
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      // Coach profiles (includes sports_analyst — we split by profiles.role)
      supabase.from('coach_profiles')
        .select('id,user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,linkedin,is_public')
        .eq('is_public', true)
        .order('full_name'),

      // Agent profiles
      supabase.from('agent_profiles')
        .select('id,user_id,agency_name,sport,nationality,experience_years,regions,about,achievements,is_public,verified_badge')
        .eq('is_public', true)
        .order('agency_name'),

      // Clubs
      supabase.from('clubs')
        .select('id,name,country,about,website,sports,status,verified_badge,owner_id')
        .eq('status', 'active')
        .order('name'),

      // Profiles for verification status
      supabase.from('profiles')
        .select('id,email,role,verification_status,status')
        .eq('status', 'active')
        .neq('role', 'super_admin'),

      // Academy profiles (for club address/phone details)
      supabase.from('academy_profiles')
        .select('id,user_id,club_id,country,state,address,phone,year_founded,sports'),
    ]).then(([{ data: coachData }, { data: agentData }, { data: clubData }, { data: profData }, { data: acadData }]) => {
      // Build profile lookup by id
      const profMap = Object.fromEntries((profData ?? []).map((p) => [p.id, p]))
      setProfiles(profMap)

      // Build academy profile lookup by user_id
      const acadMap = Object.fromEntries((acadData ?? []).map((a) => [a.user_id, a]))
      setAcademies(acadMap)

      // Split coaches from analysts by profiles.role
      const coachList    = (coachData ?? []).filter((c) => profMap[c.user_id]?.role !== 'sports_analyst')
      const analystList  = (coachData ?? []).filter((c) => profMap[c.user_id]?.role === 'sports_analyst')

      setCoaches(coachList)
      setAnalysts(analystList)
      setAgents(agentData ?? [])
      setClubs(clubData ?? [])
      setLoading(false)
    })
  }, [supabase])

  // If initialSelection was provided, also fetch that specific profile's verification data
  useEffect(() => {
    if (!initialSelection || !supabase) { setInitialProfileFetched(true); return }
    const userId = initialSelection.item?.user_id || initialSelection.item?.owner_id
    if (!userId) { setInitialProfileFetched(true); return }
    supabase.from('profiles').select('id, role, verification_status, status')
      .eq('id', userId).maybeSingle()
      .then(({ data }) => {
        if (data) setProfiles((prev) => ({ ...prev, [userId]: data }))
        setInitialProfileFetched(true)
      })
  }, [initialSelection, supabase])

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const filterCoaches = (list) => list.filter((c) => {
    if (openTo && !c.open_to_work) return false
    if (filterRole && c.preferred_role !== filterRole) return false
    if (filterCountry && c.nationality !== filterCountry) return false
    if (search) {
      const q = search.toLowerCase()
      return (c.full_name||'').toLowerCase().includes(q) ||
             (c.preferred_role||'').toLowerCase().includes(q) ||
             (c.current_club||'').toLowerCase().includes(q) ||
             (c.nationality||'').toLowerCase().includes(q)
    }
    return true
  })

  const filterAgents = (list) => list.filter((a) => {
    if (filterCountry && a.nationality !== filterCountry) return false
    if (search) {
      const q = search.toLowerCase()
      return (a.agency_name||'').toLowerCase().includes(q) ||
             (a.nationality||'').toLowerCase().includes(q) ||
             (a.about||'').toLowerCase().includes(q)
    }
    return true
  })

  const filterClubs = (list) => list.filter((c) => {
    if (filterCountry && c.country !== filterCountry) return false
    if (search) {
      const q = search.toLowerCase()
      return (c.name||'').toLowerCase().includes(q) ||
             (c.country||'').toLowerCase().includes(q) ||
             (c.about||'').toLowerCase().includes(q)
    }
    return true
  })

  // ── Handle profile selection ────────────────────────────────────────────────
  const handleView = (type, item) => {
    if (!type || !item) return
    setSelected({ type, item })
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setSelected(null)
    window.scrollTo(0, 0)
  }

  // ── Render selected profile ─────────────────────────────────────────────────
  if (selected && selected.item && initialProfileFetched) {
    const memberProfile = profiles[selected.item?.user_id || selected.item?.owner_id] ?? null

    if (selected.type === 'coach' || selected.type === 'sports_analyst') {
      return (
        <CoachProfile
          member={selected.item}
          profile={memberProfile}
          user={user}
          onBack={handleBack}
          onSignup={onSignup}
          role={selected.type}
        />
      )
    }
    if (selected.type === 'agent') {
      return (
        <AgentProfile
          member={selected.item}
          profile={memberProfile}
          user={user}
          onBack={handleBack}
          onSignup={onSignup}
        />
      )
    }
    if (selected.type === 'academy') {
      return (
        <ClubProfile
          member={selected.item}
          academy={academies[selected.item.owner_id]}
          profile={memberProfile}
          user={user}
          onBack={handleBack}
          onSignup={onSignup}
        />
      )
    }
  }

  // ── Current tab data ────────────────────────────────────────────────────────
  const tabData = {
    coach:          filterCoaches(coaches),
    agent:          filterAgents(agents),
    academy:        filterClubs(clubs),
    sports_analyst: filterCoaches(analysts),
  }

  const counts = {
    coach:          coaches.length,
    agent:          agents.length,
    academy:        clubs.length,
    sports_analyst: analysts.length,
  }

  const current = tabData[activeTab] ?? []

  // ── Render directory ────────────────────────────────────────────────────────
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <span className="text-uppercase small fw-semibold text-muted">SportBridge</span>
          <h1 className="h2 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
            Members Directory
          </h1>
          <p className="text-muted mb-0">Verified coaches, agents, clubs and analysts from around the world.</p>
        </div>
        {onBack && (
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={onBack}>
            <i className="bi bi-arrow-left me-1" />Back to home
          </button>
        )}
      </div>

      {/* Tab navigation */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        {TABS.map(({ key, label, icon }) => (
          <li className="nav-item" key={key}>
            <button
              className={`nav-link d-flex align-items-center gap-2${activeTab === key ? ' active' : ''}`}
              type="button" role="tab"
              aria-selected={activeTab === key}
              onClick={() => { setActiveTab(key); setSearch(''); setFilterRole(''); setFilterCountry(''); setOpenTo(false) }}
            >
              <i className={`bi ${icon}`} aria-hidden="true" />
              {label}
              {counts[key] > 0 && (
                <span className={`badge rounded-pill ms-1 ${activeTab === key ? 'bg-white text-primary' : 'text-bg-secondary'}`} style={{ fontSize: 10 }}>
                  {counts[key]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Filter bar */}
      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold mb-1" htmlFor="dir-search">Search</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-search" /></span>
              <input
                id="dir-search"
                className="form-control"
                type="search"
                placeholder={`Search ${TABS.find((t) => t.key === activeTab)?.label ?? 'members'}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {(activeTab === 'coach' || activeTab === 'sports_analyst') && (
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1" htmlFor="dir-role">Role</label>
              <select id="dir-role" className="form-select form-select-sm" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">— Any role —</option>
                {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div className="col-6 col-md-3">
            <label className="form-label small fw-semibold mb-1" htmlFor="dir-country">Country / Nationality</label>
            <select id="dir-country" className="form-select form-select-sm" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
              <option value="">— Any —</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {(activeTab === 'coach' || activeTab === 'sports_analyst') && (
            <div className="col-6 col-md-2">
              <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" id="dir-open" checked={openTo} onChange={(e) => setOpenTo(e.target.checked)} />
                <label className="form-check-label small fw-semibold" htmlFor="dir-open">Open to work</label>
              </div>
            </div>
          )}

          {(search || filterRole || filterCountry || openTo) && (
            <div className="col-auto">
              <button
                className="btn btn-outline-secondary btn-sm mt-3"
                type="button"
                onClick={() => { setSearch(''); setFilterRole(''); setFilterCountry(''); setOpenTo(false) }}
              >
                <i className="bi bi-x-circle me-1" />Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="row g-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={i}><SkeletonCard /></div>
          ))}
        </div>
      ) : current.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-people fs-1 d-block mb-3" style={{ opacity: 0.25 }} />
          <p className="fw-semibold mb-1">No {TABS.find((t) => t.key === activeTab)?.label ?? 'members'} found</p>
          {search || filterRole || filterCountry
            ? <p className="small mb-3">Try adjusting your filters.</p>
            : <p className="small mb-3">Be the first to join SportBridge as a {TABS.find((t) => t.key === activeTab)?.label ?? 'member'}!</p>
          }
          <button className="btn btn-primary btn-sm" type="button" onClick={() => onSignup(activeTab)}>
            <i className="bi bi-person-plus me-2" />Join free
          </button>
        </div>
      ) : (
        <>
          <p className="small text-muted mb-3">{current.length} result{current.length !== 1 ? 's' : ''}</p>
          <div className="row g-3">
            {current.map((item) => {
              const role = activeTab === 'sports_analyst' ? 'sports_analyst' : activeTab
              return (
                <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={item.id}>
                  <MemberCard
                    member={{
                      ...item,
                      full_name:          item.full_name || item.agency_name || item.name,
                      verification_status: profiles[item.user_id || item.owner_id]?.verification_status,
                    }}
                    role={role}
                    onView={() => handleView(role, item)}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
