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

// ─── Avatar component (role-colour circle with icon — falls back to real photo) ─
function RoleAvatar({ role, size = 64, name, photoUrl }) {
  const m = ROLE_META[role] ?? { icon: 'bi-person', colour: '#6c757d' }
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || 'Profile photo'}
        className="rounded-circle flex-shrink-0"
        style={{ width: size, height: size, objectFit: 'cover', flexShrink: 0 }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }

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
  const photo = member.photo_path || member.avatar_path || member.primary_photo_path || null

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
        <RoleAvatar role={role} size={52} name={name} photoUrl={photo} />
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
function CoachProfile({ supabase, member, profile, user, onBack, onSignup, role }) {
  const m = ROLE_META[role] ?? ROLE_META.coach
  const verified = profile?.verification_status === 'verified'
  const badges = Array.isArray(member.badges) ? member.badges : []

  // Group licences vs general badges for display
  const LICENCE_KEYWORDS = ['licence','license','diploma','certificate','certified','pro','uefa','caf','fifa','fa level','nsca','cscs']
  const licences = badges.filter(b => LICENCE_KEYWORDS.some(k => b.toLowerCase().includes(k)))
  const otherBadges = badges.filter(b => !LICENCE_KEYWORDS.some(k => b.toLowerCase().includes(k)))

  // Map preferred_role to a category colour
  const ROLE_CATEGORY = {
    'Head Coach': '#2F7DF0', 'First Team Manager': '#2F7DF0', 'Caretaker Manager': '#2F7DF0',
    'Interim Manager': '#2F7DF0', 'Player-Manager': '#2F7DF0', 'Under-23 Manager': '#2F7DF0',
    'Under-18 Manager': '#2F7DF0',
    'Assistant Head Coach': '#20c997', 'Assistant Coach': '#20c997', 'Goalkeeping Coach': '#20c997',
    'Set-Piece Coach': '#20c997', 'Fitness Coach': '#20c997', 'Strength & Conditioning Coach': '#20c997',
    'Sports Scientist': '#20c997', 'Physio / Sports Therapist': '#20c997', 'Team Doctor': '#20c997',
    'Nutritionist': '#20c997', 'Sport Psychologist': '#20c997',
    'Sporting Director': '#F5B301', 'Technical Director': '#F5B301', 'Director of Football': '#F5B301',
    'Academy Director': '#F5B301', 'Head of Recruitment': '#F5B301', 'Head of Player Development': '#F5B301',
    'Head of Analysis': '#F5B301', 'Chief Executive Officer (CEO)': '#F5B301', 'General Manager': '#F5B301',
    'Club Secretary': '#F5B301', 'Operations Manager': '#F5B301',
    'Scout': '#0dcaf0', 'Chief Scout': '#0dcaf0', 'Regional Scout': '#0dcaf0',
    'International Scout': '#0dcaf0', 'Performance Analyst': '#0dcaf0', 'Video Analyst': '#0dcaf0',
    'Data Analyst': '#0dcaf0', 'Opposition Analyst': '#0dcaf0', 'Recruitment Analyst': '#0dcaf0',
    'Tactical Analyst': '#0dcaf0', 'Head of Data Science': '#0dcaf0',
    'Reserve Team Coach': '#fd7e14', 'U23 / U21 Coach': '#fd7e14', 'U18 Coach': '#fd7e14',
    'U16 Coach': '#fd7e14', 'U14 Coach': '#fd7e14', 'Youth Academy Coach': '#fd7e14',
    'Elite Development Coach': '#fd7e14', 'Loan Manager': '#fd7e14', 'Player Liaison': '#fd7e14',
    'Community Coach': '#fd7e14', "Women's Team Coach": '#fd7e14', 'Futsal Coach': '#fd7e14',
  }
  const roleColour = ROLE_CATEGORY[member.preferred_role] ?? m.colour

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <button className="btn btn-link p-0 mb-4 text-decoration-none" type="button" onClick={onBack}>
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4">
        {/* ── Left ── */}
        <div className="col-12 col-md-8">

          {/* Profile header card */}
          <div className="card p-4 mb-4">
            <div className="d-flex gap-4 align-items-start mb-4">
              <RoleAvatar role={role} size={88} name={member.full_name} photoUrl={member.photo_path || profile?.avatar_path || null} />
              <div className="flex-grow-1 min-w-0">
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  {member.full_name}
                  {verified && <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: 20 }} aria-label="Verified" />}
                </h1>

                {/* Role + sub-role badges */}
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <span className="badge" style={{ background: m.colour, color: m.darkText ? '#212529' : '#fff' }}>
                    <i className={`bi ${m.icon} me-1`} />{m.label}
                  </span>
                  {member.preferred_role && (
                    <span className="badge fw-semibold" style={{ background: roleColour + '22', color: roleColour, border: `1px solid ${roleColour}55` }}>
                      {member.preferred_role}
                    </span>
                  )}
                  {member.open_to_work && (
                    <span className="badge text-bg-success">
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }} />Open to work
                    </span>
                  )}
                </div>

                {/* Quick info grid */}
                <div className="row g-2 small">
                  {[
                    { icon: 'bi-globe2',           label: 'Nationality',   value: member.nationality },
                    { icon: 'bi-briefcase',         label: 'Experience',    value: member.experience_years ? `${member.experience_years} years` : null },
                    { icon: 'bi-building',          label: 'Current club',  value: member.current_club },
                    { icon: 'bi-dribbble',          label: 'Sport',         value: member.sport },
                    { icon: 'bi-gender-ambiguous',  label: 'Gender',        value: member.gender },
                  ].filter(r => r.value).map(({ icon, label, value }) => (
                    <div key={label} className="col-6 d-flex align-items-center gap-1">
                      <i className={`bi ${icon} text-primary flex-shrink-0`} style={{ fontSize: 13 }} />
                      <span className="text-muted me-1">{label}:</span>
                      <span className="fw-semibold text-truncate">{value}</span>
                    </div>
                  ))}
                </div>

                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm mt-3 d-inline-flex align-items-center gap-2">
                    <i className="bi bi-linkedin" />LinkedIn profile
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* About */}
          {member.about && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-person-lines-fill me-2 text-primary" />About
              </h2>
              <p className="mb-0" style={{ lineHeight: 1.8, color: 'var(--fc-muted)' }}>{member.about}</p>
            </div>
          )}

          {/* Key achievements + Track Record */}
          {member.achievements && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-trophy-fill me-2 text-warning" />Track Record &amp; Key Achievements
              </h2>
              {member.achievements.split('\n').filter(Boolean).length > 1 ? (
                <ul className="list-unstyled mb-0 d-grid gap-2">
                  {member.achievements.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} className="d-flex align-items-start gap-2">
                      <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-1" style={{ fontSize: 13 }} />
                      <span className="small" style={{ lineHeight: 1.7, color: 'var(--fc-muted)' }}>{line.replace(/^[-•·]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 small" style={{ lineHeight: 1.8, color: 'var(--fc-muted)', whiteSpace: 'pre-line' }}>{member.achievements}</p>
              )}
            </div>
          )}

          {/* Licences & Qualifications */}
          {licences.length > 0 && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-award-fill me-2 text-primary" />Licences &amp; Qualifications
              </h2>
              <div className="d-flex flex-wrap gap-2">
                {licences.map((b, i) => (
                  <span key={i} className="badge d-inline-flex align-items-center gap-1 px-3 py-2"
                    style={{ background: 'var(--fc-blue-500)', color: '#fff', fontSize: 12 }}>
                    <i className="bi bi-award-fill" style={{ fontSize: 10 }} />{b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Other badges / tools */}
          {otherBadges.length > 0 && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-patch-check me-2 text-success" />
                {role === 'sports_analyst' ? 'Tools & Software' : 'Additional Badges'}
              </h2>
              <div className="d-flex flex-wrap gap-2">
                {otherBadges.map((b, i) => (
                  <span key={i} className="badge text-bg-light border fw-normal px-3 py-2" style={{ fontSize: 12 }}>{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Role-specific detail sections — Analyst specialisation */}
          {role === 'sports_analyst' && member.preferred_role && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-graph-up-arrow me-2 text-primary" />Analyst Specialisation
              </h2>
              <div className="p-3 rounded d-flex align-items-center gap-3"
                style={{ background: '#fd7e1412', border: '1px solid #fd7e1433' }}>
                <i className="bi bi-graph-up-arrow" style={{ color: '#fd7e14', fontSize: 24 }} />
                <div>
                  <div className="small text-muted mb-1">Specialisation</div>
                  <div className="fw-bold" style={{ color: '#fd7e14' }}>{member.preferred_role}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-12 col-md-4">

          {/* Role info card */}
          <div className="card p-4 mb-3" style={{ background: roleColour + '0a', border: `1px solid ${roleColour}22` }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 48, height: 48, background: roleColour, color: '#fff', fontSize: 20 }}>
                <i className={`bi ${m.icon}`} />
              </div>
              <div>
                <div className="fw-bold small" style={{ color: roleColour }}>{member.preferred_role || m.label}</div>
                <div className="small text-muted">
                  {member.experience_years ? `${member.experience_years} yrs experience` : 'Experience not listed'}
                </div>
              </div>
            </div>
            {member.open_to_work && (
              <div className="alert alert-success py-2 mb-0 small d-flex align-items-center gap-2">
                <i className="bi bi-circle-fill" style={{ fontSize: 8 }} />
                Available for new opportunities
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Contact</h2>
            <VerifiedGate user={user} profile={profile} onSignup={onSignup}>
              <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                <p className="small text-muted mb-2">
                  <i className="bi bi-shield-check text-success me-1" />
                  Contact details are protected. All communication goes through the secure SportBridge inbox.
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

          {/* Verification */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Verification</h2>
            <VerifiedBadge status={profile?.verification_status} />
            {!verified && (
              <p className="small text-muted mt-2 mb-0">
                This member has not yet completed identity verification.
              </p>
            )}
            {verified && licences.length > 0 && (
              <div className="mt-2 small text-success d-flex align-items-center gap-1">
                <i className="bi bi-award-fill" />Licences verified by SportBridge
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Quick Stats</h2>
            <div className="d-grid gap-2">
              {member.experience_years && (
                <div className="d-flex justify-content-between align-items-center py-1"
                  style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-briefcase me-1" />Experience</span>
                  <span className="fw-bold small">{member.experience_years} years</span>
                </div>
              )}
              {licences.length > 0 && (
                <div className="d-flex justify-content-between align-items-center py-1"
                  style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-award me-1" />Licences</span>
                  <span className="fw-bold small">{licences.length}</span>
                </div>
              )}
              {badges.length > 0 && (
                <div className="d-flex justify-content-between align-items-center py-1">
                  <span className="small text-muted"><i className="bi bi-patch-check me-1" />Total badges</span>
                  <span className="fw-bold small">{badges.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Report */}
          <div className="card p-4">
            <ReportProfileButton supabase={supabase} user={user}
              reportedUserId={profile?.id} reportedName={member.full_name} onSignup={onSignup} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Agent full profile ────────────────────────────────────────────────────────
function AgentProfile({ supabase, member, profile, user, onBack, onSignup }) {
  const verified = profile?.verification_status === 'verified'
  const regions  = Array.isArray(member.regions) ? member.regions : []

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <button className="btn btn-link p-0 mb-4 text-decoration-none" type="button" onClick={onBack}>
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4">
        <div className="col-12 col-md-8">

          {/* Header card */}
          <div className="card p-4 mb-4">
            <div className="d-flex gap-4 align-items-start mb-4">
              <RoleAvatar role="agent" size={88} name={member.agency_name} photoUrl={member.photo_path || profile?.avatar_path || null} />
              <div className="flex-grow-1 min-w-0">
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  {member.agency_name || 'Agency'}
                  {verified && <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: 20 }} aria-label="Verified" />}
                </h1>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <span className="badge" style={{ background: '#198754', color: '#fff' }}>
                    <i className="bi bi-binoculars me-1" />Agent / Scout
                  </span>
                  {verified && <span className="badge text-bg-success"><i className="bi bi-award-fill me-1" />FIFA Agent Verified</span>}
                </div>
                <div className="row g-2 small">
                  {[
                    { icon: 'bi-globe2',    label: 'Nationality',  value: member.nationality },
                    { icon: 'bi-briefcase', label: 'Experience',   value: member.experience_years ? `${member.experience_years} years` : null },
                    { icon: 'bi-dribbble',  label: 'Sport',        value: member.sport },
                    { icon: 'bi-gender-ambiguous', label: 'Gender', value: member.gender },
                  ].filter(r => r.value).map(({ icon, label, value }) => (
                    <div key={label} className="col-6 d-flex align-items-center gap-1">
                      <i className={`bi ${icon} text-primary flex-shrink-0`} style={{ fontSize: 13 }} />
                      <span className="text-muted me-1">{label}:</span>
                      <span className="fw-semibold text-truncate">{value}</span>
                    </div>
                  ))}
                </div>
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm mt-3 d-inline-flex align-items-center gap-2">
                    <i className="bi bi-linkedin" />LinkedIn profile
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Operating regions */}
          {regions.length > 0 && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-geo-alt-fill me-2 text-primary" />Operating Regions
              </h2>
              <div className="d-flex flex-wrap gap-2">
                {regions.map((r, i) => (
                  <span key={i} className="badge px-3 py-2"
                    style={{ background: '#19875420', color: '#198754', border: '1px solid #19875455', fontSize: 12 }}>
                    <i className="bi bi-geo-alt me-1" />{r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {member.about && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-person-lines-fill me-2 text-primary" />About the Agency
              </h2>
              <p className="mb-0" style={{ lineHeight: 1.8, color: 'var(--fc-muted)' }}>{member.about}</p>
            </div>
          )}

          {/* Achievements */}
          {member.achievements && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-trophy-fill me-2 text-warning" />Track Record &amp; Achievements
              </h2>
              {member.achievements.split('\n').filter(Boolean).length > 1 ? (
                <ul className="list-unstyled mb-0 d-grid gap-2">
                  {member.achievements.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} className="d-flex align-items-start gap-2">
                      <i className="bi bi-check-circle-fill text-success flex-shrink-0 mt-1" style={{ fontSize: 13 }} />
                      <span className="small" style={{ lineHeight: 1.7, color: 'var(--fc-muted)' }}>{line.replace(/^[-•·]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 small" style={{ lineHeight: 1.8, color: 'var(--fc-muted)', whiteSpace: 'pre-line' }}>{member.achievements}</p>
              )}
            </div>
          )}

          {/* Safety notice for agents */}
          <div className="alert d-flex gap-2 align-items-start"
            style={{ background: 'rgba(220,53,69,.06)', border: '1.5px solid rgba(220,53,69,.25)' }}>
            <i className="bi bi-shield-exclamation text-danger flex-shrink-0 mt-1" />
            <div className="small">
              <strong>SportBridge Safety:</strong> Legitimate agents never charge players fees to arrange trials or introductions.
              Always check the Verified ✓ badge before engaging. Report any fee requests immediately.
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-12 col-md-4">

          {/* Agency summary card */}
          <div className="card p-4 mb-3" style={{ background: '#19875408', border: '1px solid #19875422' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 48, height: 48, background: '#198754', color: '#fff', fontSize: 20 }}>
                <i className="bi bi-binoculars" />
              </div>
              <div>
                <div className="fw-bold small text-success">Agent / Scout Agency</div>
                <div className="small text-muted">
                  {member.experience_years ? `${member.experience_years} yrs experience` : 'Agency'}
                </div>
              </div>
            </div>
            {verified && (
              <div className="alert alert-success py-2 mb-0 small d-flex align-items-center gap-2">
                <i className="bi bi-award-fill" />FIFA Agents Licence Verified
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Agency Stats</h2>
            <div className="d-grid gap-2">
              {member.experience_years && (
                <div className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-briefcase me-1" />Experience</span>
                  <span className="fw-bold small">{member.experience_years} years</span>
                </div>
              )}
              {regions.length > 0 && (
                <div className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-geo-alt me-1" />Regions covered</span>
                  <span className="fw-bold small">{regions.length}</span>
                </div>
              )}
              <div className="d-flex justify-content-between py-1">
                <span className="small text-muted"><i className="bi bi-shield-check me-1" />Verified</span>
                <span className="fw-bold small" style={{ color: verified ? '#198754' : '#6c757d' }}>
                  {verified ? 'Yes ✓' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Contact agency</h2>
            <VerifiedGate user={user} profile={profile} onSignup={onSignup}>
              <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                <p className="small text-muted mb-2">
                  <i className="bi bi-shield-check text-success me-1" />
                  All contact goes through the secure SportBridge inbox.
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

          {/* Verification */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Verification</h2>
            <VerifiedBadge status={profile?.verification_status} />
          </div>

          {/* Report */}
          <div className="card p-4">
            <ReportProfileButton supabase={supabase} user={user}
              reportedUserId={profile?.id} reportedName={member.agency_name || 'Agency'} onSignup={onSignup} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Club / Academy full profile ───────────────────────────────────────────────
function ClubProfile({ supabase, member, academy, user, profile, onBack, onSignup }) {
  const verified = member.verified_badge || profile?.verification_status === 'verified'
  const sports   = Array.isArray(academy?.sports) ? academy.sports : (academy?.sports ? [academy.sports] : [])
  const leagues  = Array.isArray(academy?.leagues) ? academy.leagues : []

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <button className="btn btn-link p-0 mb-4 text-decoration-none" type="button" onClick={onBack}>
        <i className="bi bi-arrow-left me-1" />Back to directory
      </button>

      <div className="row g-4">
        {/* ── Left ── */}
        <div className="col-12 col-md-8">

          {/* Header card */}
          <div className="card p-4 mb-4">
            <div className="d-flex gap-4 align-items-start mb-4">
              <RoleAvatar role="academy" size={88} name={member.name} photoUrl={member.logo_path || null} />
              <div className="flex-grow-1 min-w-0">
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>
                  {member.name}
                  {verified && <i className="bi bi-patch-check-fill text-primary ms-2" style={{ fontSize: 20 }} aria-label="Verified" />}
                </h1>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge" style={{ background: '#6f42c1', color: '#fff' }}>
                    <i className="bi bi-building me-1" />Club / Academy
                  </span>
                  {verified && (
                    <span className="badge text-bg-success">
                      <i className="bi bi-award-fill me-1" />Verified Club
                    </span>
                  )}
                  {member.verified_badge && (
                    <span className="badge" style={{ background: '#0d6efd', color: '#fff' }}>
                      <i className="bi bi-trophy-fill me-1" />FIFA TMS Verified
                    </span>
                  )}
                  {sports.map((s, i) => (
                    <span key={i} className="badge text-bg-light border">
                      <i className="bi bi-dribbble me-1" />{s}
                    </span>
                  ))}
                </div>

                {/* Quick info grid */}
                <div className="row g-2 small">
                  {[
                    { icon: 'bi-geo-alt-fill', label: 'Country',      value: member.country },
                    { icon: 'bi-pin-map',      label: 'City/State',   value: academy?.state },
                    { icon: 'bi-calendar3',    label: 'Founded',      value: academy?.year_founded },
                    { icon: 'bi-people-fill',  label: 'Languages',    value: Array.isArray(academy?.languages) ? academy.languages.join(', ') : academy?.languages },
                  ].filter(r => r.value).map(({ icon, label, value }) => (
                    <div key={label} className="col-6 d-flex align-items-center gap-1">
                      <i className={`bi ${icon} text-primary flex-shrink-0`} style={{ fontSize: 13 }} />
                      <span className="text-muted me-1">{label}:</span>
                      <span className="fw-semibold text-truncate">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex gap-2 mt-3 flex-wrap">
                  {member.website && /^https?:\/\//i.test(member.website) && (
                    <a href={member.website} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2">
                      <i className="bi bi-globe2" />{member.website.replace(/^https?:\/\//i, '').replace(/\/$/, '').slice(0, 30)}
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2">
                      <i className="bi bi-linkedin" />LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          {member.about && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-2" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-building me-2 text-primary" />About the Club
              </h2>
              <p className="mb-0" style={{ lineHeight: 1.8, color: 'var(--fc-muted)' }}>{member.about}</p>
            </div>
          )}

          {/* Location & Address */}
          {(academy?.address || academy?.state || member.country) && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-geo-alt-fill me-2 text-primary" />Location
              </h2>
              <div className="d-flex align-items-start gap-3">
                <div className="d-flex align-items-center justify-content-center rounded"
                  style={{ width: 44, height: 44, background: '#6f42c118', color: '#6f42c1', fontSize: 20, flexShrink: 0 }}>
                  <i className="bi bi-geo-alt-fill" />
                </div>
                <div>
                  {academy?.address && <div className="fw-semibold">{academy.address}</div>}
                  {academy?.state && <div className="text-muted small">{academy.state}{member.country ? `, ${member.country}` : ''}</div>}
                  {!academy?.state && member.country && <div className="text-muted small">{member.country}</div>}
                  {academy?.phone && (
                    <div className="small mt-1 text-muted">
                      <i className="bi bi-telephone me-1" />Contact via SportBridge secure inbox only
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Club Details */}
          <div className="card p-4 mb-4">
            <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
              <i className="bi bi-info-circle-fill me-2 text-primary" />Club Details
            </h2>
            <div className="row g-3">
              {academy?.year_founded && (
                <div className="col-6 col-sm-4">
                  <div className="p-3 rounded text-center" style={{ background: '#6f42c10a', border: '1px solid #6f42c122' }}>
                    <i className="bi bi-calendar3 d-block mb-1" style={{ color: '#6f42c1', fontSize: 20 }} />
                    <div className="fw-bold" style={{ color: '#6f42c1', fontSize: 20 }}>{academy.year_founded}</div>
                    <div className="small text-muted">Year Founded</div>
                  </div>
                </div>
              )}
              {sports.length > 0 && (
                <div className="col-6 col-sm-4">
                  <div className="p-3 rounded text-center" style={{ background: '#2F7DF010', border: '1px solid #2F7DF022' }}>
                    <i className="bi bi-dribbble d-block mb-1" style={{ color: '#2F7DF0', fontSize: 20 }} />
                    <div className="fw-bold" style={{ color: '#2F7DF0', fontSize: 18 }}>{sports.join(', ')}</div>
                    <div className="small text-muted">Sport{sports.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              {verified && (
                <div className="col-6 col-sm-4">
                  <div className="p-3 rounded text-center" style={{ background: '#19875410', border: '1px solid #19875422' }}>
                    <i className="bi bi-patch-check-fill d-block mb-1" style={{ color: '#198754', fontSize: 20 }} />
                    <div className="fw-bold" style={{ color: '#198754', fontSize: 14 }}>Verified</div>
                    <div className="small text-muted">SportBridge</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leagues */}
          {leagues.length > 0 && (
            <div className="card p-4 mb-4">
              <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-trophy-fill me-2 text-warning" />Leagues &amp; Competitions
              </h2>
              <div className="d-flex flex-wrap gap-2">
                {leagues.map((l, i) => (
                  <span key={i} className="badge px-3 py-2"
                    style={{ background: '#F5B30120', color: '#b45309', border: '1px solid #F5B30155', fontSize: 12 }}>
                    <i className="bi bi-trophy me-1" />{l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          <div className="card p-4 mb-4">
            <h2 className="h6 fw-bold mb-3" style={{ color: 'var(--fc-blue-700)' }}>
              <i className="bi bi-briefcase-fill me-2 text-primary" />How to Work with This Club
            </h2>
            <div className="row g-3">
              {[
                { icon: 'bi-person-arms-up', colour: '#2F7DF0', title: 'Player Trials', desc: 'Express interest in tryout opportunities posted by this club on the Tryouts board.' },
                { icon: 'bi-clipboard2-pulse', colour: '#F5B301', title: 'Staff Positions', desc: 'Coaches and analysts can apply for roles posted by this club on the Jobs board.' },
                { icon: 'bi-send-check', colour: '#198754', title: 'Player Recommendations', desc: 'Agents can send player recommendations directly to this club via the inbox.' },
              ].map(({ icon, colour, title, desc }) => (
                <div key={title} className="col-12 col-sm-4">
                  <div className="p-3 rounded h-100" style={{ background: colour + '0a', border: `1px solid ${colour}22` }}>
                    <i className={`bi ${icon} d-block mb-2`} style={{ color: colour, fontSize: 22 }} />
                    <div className="fw-semibold small mb-1" style={{ color: colour }}>{title}</div>
                    <div className="small text-muted" style={{ lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety notice */}
          <div className="alert d-flex gap-2 align-items-start"
            style={{ background: 'rgba(47,125,240,.06)', border: '1.5px solid rgba(47,125,240,.2)' }}>
            <i className="bi bi-shield-check text-primary flex-shrink-0 mt-1" />
            <div className="small">
              <strong>SportBridge Safety:</strong> This club communicates through the secure SportBridge inbox only.
              Phone numbers, email addresses and payment requests are never shown publicly.
              Always verify club registration documents before signing contracts.
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="col-12 col-md-4">

          {/* Club summary card */}
          <div className="card p-4 mb-3" style={{ background: '#6f42c10a', border: '1px solid #6f42c122' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 48, height: 48, background: '#6f42c1', color: '#fff', fontSize: 20 }}>
                <i className="bi bi-building" />
              </div>
              <div>
                <div className="fw-bold small" style={{ color: '#6f42c1' }}>Club / Academy</div>
                <div className="small text-muted">
                  {academy?.year_founded ? `Est. ${academy.year_founded}` : 'Established club'}
                  {member.country ? ` · ${member.country}` : ''}
                </div>
              </div>
            </div>
            {verified && (
              <div className="alert alert-success py-2 mb-0 small d-flex align-items-center gap-2">
                <i className="bi bi-patch-check-fill" />CAC / FA Registered &amp; Verified
              </div>
            )}
          </div>

          {/* Club stats */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Club Stats</h2>
            <div className="d-grid gap-1">
              {academy?.year_founded && (
                <div className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-calendar3 me-1" />Founded</span>
                  <span className="fw-bold small">{academy.year_founded}</span>
                </div>
              )}
              {sports.length > 0 && (
                <div className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-dribbble me-1" />Sports</span>
                  <span className="fw-bold small">{sports.join(' · ')}</span>
                </div>
              )}
              {member.country && (
                <div className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-geo-alt me-1" />Country</span>
                  <span className="fw-bold small">{member.country}</span>
                </div>
              )}
              {leagues.length > 0 && (
                <div className="d-flex justify-content-between py-1" style={{ borderBottom: '1px solid var(--bs-border-color)' }}>
                  <span className="small text-muted"><i className="bi bi-trophy me-1" />Leagues</span>
                  <span className="fw-bold small">{leagues.length}</span>
                </div>
              )}
              <div className="d-flex justify-content-between py-1">
                <span className="small text-muted"><i className="bi bi-shield-check me-1" />Verified</span>
                <span className="fw-bold small" style={{ color: verified ? '#198754' : '#6c757d' }}>
                  {verified ? 'Yes ✓' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Contact club</h2>
            <VerifiedGate user={user} profile={profile} onSignup={onSignup}>
              <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                <p className="small text-muted mb-2">
                  <i className="bi bi-shield-check text-success me-1" />
                  All contact via the secure SportBridge inbox. Phone numbers are never shown.
                </p>
                {user ? (
                  <button className="btn btn-primary w-100 btn-sm" type="button">
                    <i className="bi bi-chat-dots me-2" />Send message
                  </button>
                ) : (
                  <button className="btn btn-primary w-100 btn-sm" type="button" onClick={() => onSignup('agent')}>
                    <i className="bi bi-person-plus me-2" />Join to connect
                  </button>
                )}
              </div>
            </VerifiedGate>
          </div>

          {/* Verification */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Verification</h2>
            <VerifiedBadge status={verified ? 'verified' : 'unverified'} />
            {verified && member.verified_badge && (
              <div className="mt-2">
                <span className="badge px-3 py-2" style={{ background: '#0d6efd', color: '#fff', fontSize: 11 }}>
                  <i className="bi bi-trophy-fill me-1" />FIFA TMS Verified
                </span>
              </div>
            )}
            {verified && (
              <div className="mt-2 small text-success d-flex align-items-center gap-1">
                <i className="bi bi-award-fill" />CAC / FA registration verified by SportBridge
              </div>
            )}
            {!verified && (
              <p className="small text-muted mt-2 mb-0">Verification pending or not yet submitted.</p>
            )}
          </div>

          {/* Quick links */}
          <div className="card p-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Find opportunities</h2>
            <div className="d-grid gap-2">
              <a href="#jobs" className="btn btn-outline-primary btn-sm text-start d-flex align-items-center gap-2">
                <i className="bi bi-briefcase" />View jobs from this club
              </a>
              <a href="#tryouts" className="btn btn-outline-success btn-sm text-start d-flex align-items-center gap-2">
                <i className="bi bi-calendar2-plus" />View tryouts from this club
              </a>
            </div>
          </div>

          {/* Report */}
          <div className="card p-4">
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
        .select('id,user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,linkedin,is_public,photo_path,facebook_url,instagram_url,twitter_url,youtube_url,tiktok_url,website_url')        .eq('is_public', true)
        .order('full_name'),

      // Agent profiles
      supabase.from('agent_profiles')
        .select('id,user_id,agency_name,sport,nationality,experience_years,regions,about,achievements,linkedin,is_public,verified_badge,photo_path,facebook_url,instagram_url,twitter_url,youtube_url,tiktok_url,website_url')
        .eq('is_public', true)
        .order('agency_name'),

      // Clubs
      supabase.from('clubs')
        .select('id,name,country,about,website,sports,status,verified_badge,owner_id')
        .eq('status', 'active')
        .order('name'),

      // Profiles for verification status + avatar_path
      supabase.from('profiles')
        .select('id,email,role,verification_status,status,avatar_path')
        .eq('status', 'active')
        .neq('role', 'super_admin'),

      // Academy profiles (for club address/phone details)
      supabase.from('academy_profiles')
        .select('id,user_id,club_id,country,state,address,phone,year_founded,sports,leagues,languages'),
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
    supabase.from('profiles').select('id, role, verification_status, status, avatar_path')
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
          supabase={supabase}
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
          supabase={supabase}
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
          supabase={supabase}
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
  // ── Visibility rule ────────────────────────────────────────────────────────
  // Verified members see ALL profiles. Unverified members see only unverified profiles.
  // Guests (not logged in) also see only unverified profiles as a teaser.
  const viewerIsVerified = user ? (profiles[user.id]?.verification_status === 'verified') : false

  const applyVisibility = (list) => {
    if (viewerIsVerified) return list
    // Unverified viewer: only show unverified members (hide verified ones)
    return list.filter((item) => {
      const profId = item.user_id || item.owner_id || item.id
      const prof = profiles[profId]
      const memberVerified = prof?.verification_status === 'verified' || item.verified_badge === true
      return !memberVerified
    })
  }

  const tabData = {
    coach:          applyVisibility(filterCoaches(coaches)),
    agent:          applyVisibility(filterAgents(agents)),
    academy:        applyVisibility(filterClubs(clubs)),
    sports_analyst: applyVisibility(filterCoaches(analysts)),
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

      {/* Verified-only notice for unverified viewers */}
      {!viewerIsVerified && (
        <div className="alert d-flex gap-3 align-items-start mb-4"
          style={{ background: 'rgba(47,125,240,.07)', border: '1.5px solid rgba(47,125,240,.2)', borderRadius: 10 }}>
          <i className="bi bi-patch-check-fill text-primary flex-shrink-0 mt-1" style={{ fontSize: 20 }} />
          <div>
            <div className="fw-bold small mb-1" style={{ color: 'var(--fc-blue-700)' }}>
              {user ? 'Get verified to see all members' : 'Join to see all members'}
            </div>
            <div className="small text-muted mb-0">
              {user
                ? 'You are currently seeing unverified members only. Complete identity verification in your dashboard to unlock all verified coaches, agents, clubs and analysts.'
                : 'Verified SportBridge members can see all profiles. Create a free account and complete verification to access the full directory.'}
            </div>
          </div>
        </div>
      )}

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
            : !viewerIsVerified
              ? <p className="small mb-3">Verified profiles are only visible to verified members.{' '}
                  {user ? 'Complete identity verification in your dashboard to unlock the full directory.'
                        : 'Create a free account and complete verification to see all members.'}</p>
              : <p className="small mb-3">Be the first to join SportBridge as a {TABS.find((t) => t.key === activeTab)?.label ?? 'member'}!</p>
          }
          {!user && (
            <button className="btn btn-primary btn-sm" type="button" onClick={() => onSignup(activeTab)}>
              <i className="bi bi-person-plus me-2" />Join free
            </button>
          )}
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
