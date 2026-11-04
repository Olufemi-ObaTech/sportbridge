import { useEffect, useRef, useState } from 'react'
import './Auth.css'
import Dashboard from './Dashboard.jsx'
import FeedPage from './FeedPage.jsx'
import InboxPage from './InboxPage.jsx'
import MembersDirectory from './MembersDirectory.jsx'
import PaymentPage from './PaymentPage.jsx'
import PlayerProfile from './PlayerProfile.jsx'
import PlayerSearch from './PlayerSearch.jsx'
import JobsPage from './JobsPage.jsx'
import TryoutsPage from './TryoutsPage.jsx'
import RegisterForm from './RegisterForm.jsx'
import ballImage from '../../public/img/fifa-world-cup-ball.avif'
import footballImage from '../../public/img/football-stadium.jpg'
import footballStandImage from '../../public/img/football-stadium1.jpg'
import logoMark from '../../public/img/logo-mark.svg'
import worldCupBallImage from '../../public/img/world-cup-ball.avif'
import { supabase } from './lib/supabase'
import { BASKETBALL_ENABLED } from './lib/features'
import { getPreferredLanguage, observeLocalization, SUPPORTED_LANGUAGES } from './lib/i18n.js'

const _ROLES = [
  { value: 'player',  label: 'Player',          icon: 'bi-person-arms-up'   },
  { value: 'academy', label: 'Academy / Club',   icon: 'bi-building'         },
  { value: 'agent',   label: 'Agent / Scout',    icon: 'bi-binoculars'       },
  { value: 'coach',   label: 'Coach / Manager',  icon: 'bi-clipboard2-pulse' },
  { value: 'sports_analyst', label: 'Sports Analyst', icon: 'bi-graph-up-arrow' },
]

const _SPORTS = BASKETBALL_ENABLED
  ? [
      { value: 'football',   label: 'Football',   icon: 'bi-dribbble' },
      { value: 'basketball', label: 'Basketball', icon: 'bi-circle'   },
    ]
  : [
      { value: 'football', label: 'Football', icon: 'bi-dribbble' },
    ]

const roleCards = [
  {
    accountRole: 'player',
    cardIcon: 'bi-person-arms-up',
    heroIcon: 'bi-person-arms-up',
    title: 'For Players',
    heroTitle: 'Players',
    heroCopy: 'Free profile. Get discovered.',
    copy: 'Create a free profile with photos, full-match videos and your CV. Go public and get discovered by verified clubs, academies and agents — no middleman required.',
    action: 'Create your player profile',
  },
  {
    accountRole: 'academy',
    cardIcon: 'bi-person-badge',
    heroIcon: 'bi-building',
    title: 'For Clubs & Academies',
    heroTitle: 'Clubs ✓ Verified',
    heroCopy: 'Showcase your squad to the world.',
    copy: 'Create players, build your squad roster, post Player Needed & Staff Needed jobs, and showcase your verified club to scouts and agents worldwide.',
    action: 'Register your club / academy',
  },
  {
    accountRole: 'agent',
    cardIcon: 'bi-search',
    heroIcon: 'bi-binoculars',
    title: 'For Agents & Scouts',
    heroTitle: 'Agents',
    heroCopy: 'Scout the next generation.',
    copy: 'Search verified players by position, age and region. Build a watchlist, post Player Positions Needed on behalf of clubs, and run verified tryout opportunities.',
    action: 'Register as an agent / scout',
  },
  {
    accountRole: 'coach',
    cardIcon: 'bi-briefcase',
    heroIcon: 'bi-clipboard2-pulse',
    title: 'For Coaches & Sporting Directors',
    heroTitle: 'Coaches',
    heroCopy: 'Land your next role.',
    copy: 'Browse coaching and management roles, apply with your verified profile, and recommend talented players directly to agents and clubs from your dashboard.',
    action: 'Register as a coach / manager',
  },
  {
    accountRole: 'sports_analyst',
    cardIcon: 'bi-graph-up-arrow',
    heroIcon: 'bi-graph-up-arrow',
    title: 'For Sports Analysts',
    heroTitle: 'Sports Analysts',
    heroCopy: 'Share your expertise.',
    copy: 'Build a professional profile, add courses and achievements, recommend players, and share analysis with the SportBridge community.',
    action: 'Register as a sports analyst',
  },
]

const worldClocks = [
  ['London',   'Europe/London'   ],
  ['New York', 'America/New_York'],
  ['Tokyo',    'Asia/Tokyo'      ],
  ['Lagos',    'Africa/Lagos'    ],
  ['Qatar',    'Asia/Qatar'      ],
]

// ——— password strength ————————————————————————————————————————————————————————

function passwordStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw))   score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const _strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const _strengthClass = ['', 'weak', 'fair', 'good', 'strong']

// ─── CommunityProfilesSection — visible to ALL users (including guests) ───────
// Replaces the old "Scout the next generation / Player Directory" section.
// Shows profiles from ALL roles pulled from Supabase, with role tabs.
// Players tab also shows the full PlayerSearch component below the cards.

const PROFILE_ROLE_META = {
  player:         { icon: 'bi-person-arms-up',  label: 'Player',         colour: '#2F7DF0' },
  coach:          { icon: 'bi-clipboard2-pulse', label: 'Coach',          colour: '#F5B301' },
  agent:          { icon: 'bi-binoculars',       label: 'Agent / Scout',  colour: '#198754' },
  academy:        { icon: 'bi-building',         label: 'Club / Academy', colour: '#6f42c1' },
  sports_analyst: { icon: 'bi-graph-up-arrow',   label: 'Sports Analyst', colour: '#fd7e14' },
}

function CommunityProfilesSection({ supabase, onSignup, onPlayerClick, onMemberClick }) {
  const [profiles,   setProfiles]   = useState([])
  const [players,    setPlayers]    = useState([])
  const [coaches,    setCoaches]    = useState([])
  const [agents,     setAgents]     = useState([])
  const [academies,  setAcademies]  = useState([])
  const [analysts,   setAnalysts]   = useState([])
  const [activeRole, setActiveRole] = useState('all')
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    Promise.all([
      // All active profiles (for the "All" tab cards)
      supabase.from('profiles')
        .select('id, full_name, role, verification_status, created_at, sport')
        .neq('role', 'super_admin')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(48),

      // Public players with position/country
      supabase.from('players')
        .select('id, display_name, position, country, nationality, is_public, views_count, profile_id, current_club')
        .eq('is_public', true)
        .order('views_count', { ascending: false })
        .limit(48),

      // Public coaches
      supabase.from('coach_profiles')
        .select('id, full_name, preferred_role, nationality, current_club, is_public, user_id')
        .eq('is_public', true)
        .limit(24),

      // Public agents
      supabase.from('agent_profiles')
        .select('id, agency_name, nationality, experience_years, is_public, user_id')
        .eq('is_public', true)
        .limit(24),

      // Public academies via clubs
      supabase.from('clubs')
        .select('id, name, country, verified_badge, owner_id')
        .eq('status', 'active')
        .limit(24),
    ]).then(([
      { data: prof },
      { data: play },
      { data: coa },
      { data: ag },
      { data: acad },
    ]) => {
      setProfiles(prof ?? [])
      setPlayers(play ?? [])
      setCoaches(coa ?? [])
      setAgents(ag ?? [])
      setAcademies(acad ?? [])

      // Extract analysts from profiles (role = sports_analyst)
      setAnalysts((prof ?? []).filter((p) => p.role === 'sports_analyst'))
      setLoading(false)
    }).catch(() => {
      // If any table doesn't exist yet, fail gracefully
      setLoading(false)
    })
  }, [supabase])

  const roleTabs = [
    { key: 'all',            label: 'All members',  count: profiles.length },
    { key: 'player',         label: 'Players',      count: players.length },
    { key: 'coach',          label: 'Coaches',      count: coaches.length },
    { key: 'agent',          label: 'Agents',       count: agents.length },
    { key: 'academy',        label: 'Clubs',        count: academies.length },
    { key: 'sports_analyst', label: 'Analysts',     count: analysts.length },
  ]

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
  const playerMap  = Object.fromEntries((players  ?? []).map((p) => [p.profile_id, p]))

  const meta = (role) => PROFILE_ROLE_META[role] ?? { icon: 'bi-person', label: role ?? 'Member', colour: '#6c757d' }

  // Build cards for each tab
  const getCards = () => {
    switch (activeRole) {
      case 'player':
        return players.slice(0, 12).map((p) => ({
          id:       p.id,
          name:     p.display_name,
          sub1:     p.position,
          sub2:     p.country || p.nationality,
          sub3:     p.current_club || null,
          role:     'player',
          verified: profileMap[p.profile_id]?.verification_status === 'verified',
          onClick:  onPlayerClick ? () => onPlayerClick(p.profile_id) : null,
          cta:      'View profile →',
        }))

      case 'coach':
        return coaches.slice(0, 12).map((c) => ({
          id:       c.id,
          name:     c.full_name,
          sub1:     c.preferred_role || 'Coach / Manager',
          sub2:     c.nationality,
          sub3:     c.current_club || null,
          role:     'coach',
          verified: profileMap[c.user_id]?.verification_status === 'verified',
          onClick:  onMemberClick ? () => onMemberClick('coach', c) : null,
          cta:      'View profile →',
        }))

      case 'agent':
        return agents.slice(0, 12).map((a) => ({
          id:       a.id,
          name:     a.agency_name || 'Agent',
          sub1:     `${a.experience_years ?? '?'} yrs experience`,
          sub2:     a.nationality,
          sub3:     null,
          role:     'agent',
          verified: profileMap[a.user_id]?.verification_status === 'verified',
          onClick:  onMemberClick ? () => onMemberClick('agent', a) : null,
          cta:      'View profile →',
        }))

      case 'academy':
        return academies.slice(0, 12).map((ac) => ({
          id:       ac.id,
          name:     ac.name,
          sub1:     ac.country,
          sub2:     null,
          sub3:     null,
          role:     'academy',
          verified: ac.verified_badge,
          onClick:  onMemberClick ? () => onMemberClick('academy', ac) : null,
          cta:      'View profile →',
        }))

      case 'sports_analyst':
        return analysts.slice(0, 12).map((a) => ({
          id:       a.id,
          name:     a.full_name || 'Analyst',
          sub1:     'Sports Analyst',
          sub2:     null,
          sub3:     null,
          role:     'sports_analyst',
          verified: a.verification_status === 'verified',
          onClick:  onMemberClick ? () => onMemberClick('sports_analyst', a) : null,
          cta:      'View profile →',
        }))

      default: // 'all'
        return profiles.slice(0, 12).map((p) => {
          const pl = playerMap[p.id]
          const isPlayer = p.role === 'player'
          return {
            id:       p.id,
            name:     p.full_name || 'Member',
            sub1:     pl?.position ?? (p.role === 'coach' ? 'Coach / Manager' : null),
            sub2:     pl?.country  ?? null,
            sub3:     pl?.current_club ?? null,
            role:     p.role,
            verified: p.verification_status === 'verified',
            // Players: open full player profile. Others: navigate to Members Directory
            // (we don't pass the item for profiles rows since they lack user_id field)
            onClick:  isPlayer && onPlayerClick
                        ? () => onPlayerClick(p.id)
                        : (onMemberClick ? () => onMemberClick(null, null) : null),
            cta:      isPlayer ? 'View profile →' : 'View in directory →',
          }
        })
    }
  }

  const cards = getCards()

  if (!supabase) return null

  return (
    <>
      {/* ── Section header ── */}
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div>
          <span className="text-uppercase small fw-semibold text-muted">Who's on SportBridge</span>
          <h2 id="directory-heading" className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
            Meet the community
          </h2>
          <p className="text-muted mb-0">
            Verified players, coaches, agents, clubs and analysts from around the world.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={onMemberClick}>
            <i className="bi bi-people me-1" />Browse directory
          </button>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => onSignup('player')}>
            <i className="bi bi-person-plus me-1" />Join free
          </button>
        </div>
      </div>

      {/* ── Role filter tabs ── */}
      <ul className="nav nav-pills mb-4 flex-wrap gap-1" role="tablist" aria-label="Filter community by role">
        {roleTabs.map(({ key, label, count }) => (
          <li className="nav-item" key={key}>
            <button
              className={`nav-link py-1 px-3 d-flex align-items-center gap-1${activeRole === key ? ' active' : ''}`}
              type="button" role="tab"
              aria-selected={activeRole === key}
              onClick={() => setActiveRole(key)}
              style={{ fontSize: 13 }}
            >
              {label}
              {count > 0 && (
                <span className={`badge rounded-pill ms-1 ${activeRole === key ? 'bg-white text-primary' : 'text-bg-secondary'}`}
                  style={{ fontSize: 10 }}>
                  {count}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Profile cards ── */}
      {loading ? (
        <div className="py-5 text-center text-muted">
          <span className="spinner-border spinner-border-sm me-2" />Loading community profiles…
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-people fs-1 d-block mb-3" style={{ opacity: 0.25 }} />
          <p className="fw-semibold mb-1">No {activeRole === 'all' ? '' : activeRole} profiles yet</p>
          <p className="small mb-3">Be the first to join SportBridge!</p>
          <button className="btn btn-primary btn-sm" type="button"
            onClick={() => onSignup(activeRole === 'all' ? 'player' : activeRole)}>
            <i className="bi bi-person-plus me-2" />Join free
          </button>
        </div>
      ) : (
        <>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3 mb-4">
            {cards.map((card) => {
              const m = meta(card.role)
              return (
                <div className="col" key={card.id}>
                  <div
                    className={`card h-100 text-center p-3${card.onClick ? ' fc-profile-card-hover' : ''}`}
                    style={{
                      border: 'none',
                      boxShadow: '0 1px 6px rgba(0,0,0,.08)',
                      cursor: card.onClick ? 'pointer' : 'default',
                      transition: 'transform .15s, box-shadow .15s',
                    }}
                    onClick={card.onClick || undefined}
                    role={card.onClick ? 'button' : undefined}
                    tabIndex={card.onClick ? 0 : undefined}
                    onKeyDown={card.onClick ? (e) => e.key === 'Enter' && card.onClick() : undefined}
                  >
                    {/* Role avatar */}
                    <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2"
                      style={{ width: 52, height: 52, background: m.colour, color: '#fff', fontSize: '1.25rem', flexShrink: 0 }}>
                      <i className={`bi ${m.icon}`} aria-hidden="true" />
                    </div>

                    {/* Name + verified badge */}
                    <div className="fw-semibold lh-sm text-truncate" style={{ fontSize: 13, color: 'var(--fc-blue-700)' }}>
                      {card.name}
                      {card.verified && (
                        <i className="bi bi-patch-check-fill text-primary ms-1" style={{ fontSize: 11 }} aria-label="Verified" />
                      )}
                    </div>

                    {/* Sub info */}
                    {card.sub1 && <div className="small text-muted text-truncate mt-1">{card.sub1}</div>}
                    {card.sub2 && <div className="small text-muted text-truncate">{card.sub2}</div>}
                    {card.sub3 && <div className="small text-muted text-truncate fst-italic">{card.sub3}</div>}

                    {/* Role badge */}
                    <span className="badge mt-2" style={{ background: m.colour, color: '#fff', fontSize: 10 }}>
                      {m.label}
                    </span>

                    {/* Action hint */}
                    {card.onClick && (
                      <div className="small text-primary mt-1" style={{ fontSize: 11 }}>
                        {card.cta || 'View profile →'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* View all in Members Directory */}
          <div className="text-center mt-2 mb-4">
            <button
              className="btn btn-outline-primary btn-sm"
              type="button"
              onClick={onMemberClick}
            >
              <i className="bi bi-people me-2" />View all members in directory
            </button>
          </div>
        </>
      )}

      {/* ── Full player search (always visible below cards) ── */}
      <div className="border-top pt-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div>
            <span className="text-uppercase small fw-semibold text-muted">Advanced search</span>
            <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>Search all players</h3>
            <p className="text-muted small mb-0">Filter by position, age group, region and foot.</p>
          </div>
        </div>
        <PlayerSearch
          supabase={supabase}
          onPlayerClick={(id) => { if (onPlayerClick) { onPlayerClick(id); window.scrollTo(0, 0) } }}
        />
      </div>
    </>
  )
}

// ─── AuthModal ───────────────────────────────────────────────────———————————————————————————————————————————————————————————————

function AuthModal({ onClose, initialMode, initialRole }) {
  const [mode, setMode]               = useState(initialMode)   // 'signin' | 'signup' | 'forgot' | 'confirmed' | 'reset-sent'
  const [_role, _setRole]            = useState(initialRole)
  const [_sport, _setSport]           = useState('football')
  const [message, setMessage]         = useState('')
  const [msgType, setMsgType]         = useState('error')       // 'error' | 'info'
  const [busy, setBusy]               = useState(false)
  const [showPw, setShowPw]           = useState(false)
  const [pwValue, setPwValue]         = useState('')
  const [confirmedEmail, _setConfirmedEmail] = useState('')
  const backdropRef                   = useRef(null)
  const firstInputRef                 = useRef(null)

  const _strength = passwordStrength(pwValue)

  // trap focus on open
  useEffect(() => {
    firstInputRef.current?.focus()
  }, [mode])

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const showMsg = (text, type = 'error') => {
    setMessage(text)
    setMsgType(type)
  }

  const clearMsg = () => setMessage('')

  const switchMode = (next) => {
    clearMsg()
    setPwValue('')
    setShowPw(false)
    setMode(next)
  }

  // —— sign in ——————————————————————————————————————————————————————————————————
  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!supabase) {
      showMsg('Connection error. Please try refreshing the page.', 'info')
      return
    }
    setBusy(true)
    clearMsg()
    const fd    = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const pw    = String(fd.get('password') ?? '')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
      if (error) {
        showMsg('Unable to sign in. Check your email and password, confirm your email if needed, and try again.')
      }
    } catch {
      showMsg('Unable to sign in. Check your connection and try again.')
    } finally {
      setBusy(false)
    }

    // Success — onAuthStateChange fires SIGNED_IN and closes modal automatically
    // The parent App's onAuthStateChange handler calls setAuthOpen(false)
  }

  // —— sign up is now handled by the RegisterForm component ─────────────────

  // —— forgot password ———————————————————————————————————————————————————————————
  const handleForgot = async (e) => {
    e.preventDefault()
    if (!supabase) {
      showMsg('Connection error. Please try refreshing the page.', 'info')
      return
    }
    setBusy(true)
    clearMsg()
    const fd    = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset=1`,
      })
      if (error) {
        showMsg('If an account matches that email, password reset instructions will be sent. Please try again later if the request does not arrive.')
      } else {
        setMode('reset-sent')
      }
    } catch {
      showMsg('Could not request a password reset. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  // ───  ────────────────────────────────────────────────────────────—————————————————————————————————————————————————————————————————————————

  const panelContent = () => {

    // —— email confirmed screen ———————————————————————————————————————————————
    if (mode === 'confirmed') {
      return (
        <div className="auth-confirm">
          <div className="auth-confirm-icon">
            <i className="bi bi-envelope-check" aria-hidden="true" />
          </div>
          <h3>Check your inbox</h3>
          <p>
            We sent a confirmation link to <strong>{confirmedEmail}</strong>.
            Click the link in that email to activate your account, then come back here to sign in.
          </p>
          <p style={{ fontSize: 12, color: 'var(--fc-muted)' }}>
            Can&apos;t find it? Check your spam / junk folder.
          </p>
          <button
            className="auth-submit mt-2"
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!supabase) {
                showMsg('Connection error. Please try refreshing the page.', 'info')
                return
              }
              setBusy(true)
              try {
                const { error } = await supabase.auth.resend({ type: 'signup', email: confirmedEmail })
                showMsg(error
                  ? 'Could not resend the confirmation email. Please try again later.'
                  : 'If the address can receive a confirmation email, it will arrive shortly. Check your inbox and spam folder.',
                'info')
              } catch {
                showMsg('Could not resend the confirmation email. Check your connection and try again.')
              } finally {
                setBusy(false)
              }
            }}
            style={{ background: 'var(--fc-gradient-gold)', color: 'var(--fc-navy-900)' }}
          >
            {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : 'Resend confirmation email'}
          </button>
          <button
            className="auth-submit mt-2"
            type="button"
            onClick={() => switchMode('signin')}
            style={{ background: 'transparent', border: '1.5px solid var(--bs-border-color)', color: 'var(--bs-body-color)' }}
          >
            Back to sign in
          </button>
          {message && (
            <p className={`auth-message mt-2 ${msgType === 'error' ? 'is-error' : 'is-info'}`} role="status">
              {message}
            </p>
          )}
        </div>
      )
    }

    // —— password reset sent ——————————————————————————————————————————————————
    if (mode === 'reset-sent') {
      return (
        <div className="auth-confirm">
          <div className="auth-confirm-icon">
            <i className="bi bi-lock" aria-hidden="true" />
          </div>
          <h3>Reset link sent</h3>
          <p>
            Check your inbox for a password reset link. It expires in 1 hour.
          </p>
          <button
            className="auth-submit mt-3"
            type="button"
            onClick={() => switchMode('signin')}
          >
            Back to sign in
          </button>
        </div>
      )
    }

    // —— forgot password form —————————————————————————————————————————————————
    if (mode === 'forgot') {
      return (
        <>
          <p className="eyebrow">Account recovery</p>
          <h2 id="auth-heading">Reset your password</h2>
          <form className="auth-form" onSubmit={handleForgot} noValidate>
            <label className="auth-label">
              <span>Email address</span>
              <input
                ref={firstInputRef}
                className="auth-input"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>
            {message && (
              <p className={`auth-message ${msgType === 'error' ? 'is-error' : 'is-info'}`} role="status">
                {message}
              </p>
            )}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : 'Send reset link'}
            </button>
          </form>
          <p className="auth-switch">
            Remembered it?{' '}
            <button type="button" onClick={() => switchMode('signin')}>Sign in</button>
          </p>
        </>
      )
    }

    // —— sign in form —————————————————————————————————————————————————————————
    if (mode === 'signin') {
      return (
        <>
          <p className="eyebrow">Welcome back</p>
          <h2 id="auth-heading">Sign in to SportBridge</h2>
          <form className="auth-form" onSubmit={handleSignIn} noValidate>
            <label className="auth-label">
              <span>Email address</span>
              <input
                ref={firstInputRef}
                className="auth-input"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <div>
              <label className="auth-label">
                <span>Password</span>
                <div className="auth-password-wrap">
                  <input
                    className="auth-input"
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    placeholder="Your password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw(!showPw)}
                  >
                    <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
                  </button>
                </div>
              </label>
              <div className="auth-forgot">
                <button type="button" onClick={() => switchMode('forgot')}>
                  Forgot password?
                </button>
              </div>
            </div>

            {message && (
              <p className={`auth-message ${msgType === 'error' ? 'is-error' : 'is-info'}`} role="status">
                {message}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy
                ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
                : <><i className="bi bi-box-arrow-in-right me-2" aria-hidden="true" />Sign in</>}
            </button>
          </form>

          <p className="auth-switch">
            New to SportBridge?{' '}
            <button type="button" onClick={() => switchMode('signup')}>Create an account</button>
          </p>
        </>
      )
    }

    // —— sign up form — uses RegisterForm component ────────────────────────────
    return (
      <RegisterForm
        initialRole={_role}
        onSuccess={() => {
          // session present: onAuthStateChange fires SIGNED_IN → modal closes
        }}
        onSwitchToSignIn={() => switchMode('signin')}
      />
    )
  }

  return (
    <div
      className="sb-auth-backdrop"
      ref={backdropRef}
      onMouseDown={(e) => { if (e.target === backdropRef.current) onClose() }}
      role="presentation"
    >
      <section
        aria-labelledby="auth-heading"
        aria-modal="true"
        className="auth-panel"
        role="dialog"
      >
        {mode !== 'confirmed' && mode !== 'reset-sent' && (
          <button
            aria-label="Close sign in panel"
            className="modal-close"
            onClick={onClose}
            type="button"
          >
            <i className="bi bi-x" aria-hidden="true" />
          </button>
        )}
        {panelContent()}
      </section>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────—————————————————————————————————————————————————————————————————————

function App() {
  const [view,            setView]            = useState('home')
  const [selectedPlayerId,setSelectedPlayerId]= useState(null)
  const [selectedMember,  setSelectedMember]  = useState(null) // { type, item } for Members Directory
  const [user,            setUser]            = useState(null)
  const [accountStatus,   setAccountStatus]   = useState(null)
  const [statusCheckKey,  setStatusCheckKey]  = useState(0)
  const [authOpen,        setAuthOpen]        = useState(false)
  const [authInitMode,    setAuthInitMode]    = useState('signin')
  const [authInitRole,    setAuthInitRole]    = useState('player')
  const [menuOpen,        setMenuOpen]        = useState(false)
  const [darkTheme,       setDarkTheme]       = useState(false)
  const [sport,           setSport]           = useState('football')
  const [sportMenuOpen,   setSportMenuOpen]   = useState(false)
  const [exploreOpen,     setExploreOpen]     = useState(false)
  const [language,        setLanguage]        = useState(getPreferredLanguage)
  const [languageMenuOpen,setLanguageMenuOpen]= useState(false)
  const [clockNow,        setClockNow]        = useState(() => new Date())
  const appRootRef = useRef(null)

  const openSignup = (role = 'player') => {
    setAuthInitRole(role)
    setAuthInitMode('signup')
    setAuthOpen(true)
  }

  const openSignin = () => {
    setAuthInitMode('signin')
    setAuthOpen(false) // force re-mount if already open
    requestAnimationFrame(() => setAuthOpen(true))
  }

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  // Language — update HTML lang attribute and direction (Arabic is RTL)
  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
    try {
      window.localStorage.setItem('sportbridge-language', language)
    } catch (error) {
      console.warn('Could not save the language preference.', error)
    }

    const appRoot = appRootRef.current
    if (!appRoot) return
    return observeLocalization(appRoot, language)
  }, [language])

  useEffect(() => {
    const dismissMenus = (event) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('.navbar .dropdown')) return
      setExploreOpen(false)
      setSportMenuOpen(false)
      setLanguageMenuOpen(false)
      if (!event.target.closest('.navbar')) setMenuOpen(false)
    }
    const dismissMenusOnEscape = (event) => {
      if (event.key !== 'Escape') return
      setExploreOpen(false)
      setSportMenuOpen(false)
      setLanguageMenuOpen(false)
      setMenuOpen(false)
    }
    document.addEventListener('pointerdown', dismissMenus)
    document.addEventListener('keydown', dismissMenusOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissMenus)
      document.removeEventListener('keydown', dismissMenusOnEscape)
    }
  }, [])

  const closeDropdownMenus = () => {
    setExploreOpen(false)
    setSportMenuOpen(false)
    setLanguageMenuOpen(false)
  }

  // World clock tick
  useEffect(() => {
    const t = window.setInterval(() => setClockNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  // Auth state — restore session on mount and subscribe to future changes.
  // eslint-disable-next-line react/set-state-in-effect -- getSession is async external I/O; setState here is correct.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      setAccountStatus(u ? 'checking' : null)
      if (u) setView('dashboard')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      setAccountStatus(u ? 'checking' : null)
      if (event === 'SIGNED_IN')  { setView('dashboard'); setAuthOpen(false) }
      if (event === 'SIGNED_OUT') { setView('home') }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !user?.id) {
      setAccountStatus(null)
      return
    }
    let alive = true
    const checkStatus = async () => {
      const { data, error } = await supabase.from('profiles').select('status').eq('id', user.id).single()
      if (alive) setAccountStatus(error ? 'unavailable' : data?.status ?? 'unavailable')
    }
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkStatus()
    }
    checkStatus()
    const interval = window.setInterval(checkStatus, 60_000)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      alive = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [user?.id, statusCheckKey])

  return (
    <div ref={appRootRef} data-bs-theme={darkTheme ? 'dark' : 'light'}>
      {/* Skip link */}
      <a className="visually-hidden-focusable btn btn-primary position-absolute top-0 start-0 m-2" href="#main-content">
        Skip to main content
      </a>

      {/* —— Navbar ——————————————————————————————————————————————————————————— */}
      <nav className="navbar navbar-expand-lg sticky-top shadow-sm" data-bs-theme="dark" id="home">
        <div className="container">
          <a className="navbar-brand" href="#home" aria-label="SportBridge home">
            <span className="d-inline-flex align-items-center gap-2">
              <img src={logoMark} alt="" width="24" height="24" />
              <span className="fw-bold" style={{ fontFamily: 'var(--fc-font-heading)' }}>
                Sport<span className="fc-gradient-text">Bridge</span>
              </span>
            </span>
          </a>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="mainNavbar"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="mainNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#home" onClick={() => { setView('home'); setMenuOpen(false); closeDropdownMenus() }}>Home</a>
              </li>
              {user && (
                <li className="nav-item">
                  <button
                    className={`btn btn-link nav-link${view === 'dashboard' ? ' active' : ''}`}
                    type="button"
                    onClick={() => { setView('dashboard'); setMenuOpen(false); closeDropdownMenus() }}
                  >
                    Dashboard
                  </button>
                </li>
              )}
              <li className="nav-item">
                <a className="nav-link" href="#players" onClick={() => { setMenuOpen(false); closeDropdownMenus() }}>Players</a>
              </li>
              {/* Explore dropdown — React-state controlled (no Bootstrap JS dependency) */}
              <li className={`nav-item dropdown${exploreOpen ? ' show' : ''}`}>
                <button
                  className={`btn btn-link nav-link d-flex align-items-center gap-1${exploreOpen ? ' show' : ''}${['jobs','tryouts','feed'].includes(view) ? ' active' : ''}`}
                  type="button"
                  aria-haspopup="true"
                  aria-controls="explore-menu"
                  aria-expanded={exploreOpen}
                  onClick={() => { setExploreOpen((open) => !open); setSportMenuOpen(false); setLanguageMenuOpen(false) }}
                >
                  Explore <i className="bi bi-chevron-down" style={{ fontSize: 11 }} aria-hidden="true" />
                </button>
                <ul id="explore-menu" className={`dropdown-menu${exploreOpen ? ' show' : ''}`}>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" type="button"
                    onClick={() => { setView('jobs'); setMenuOpen(false); closeDropdownMenus(); window.scrollTo(0,0) }}>
                    <i className="bi bi-briefcase text-primary" />Jobs</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" type="button"
                    onClick={() => { setView('tryouts'); setMenuOpen(false); closeDropdownMenus(); window.scrollTo(0,0) }}>
                    <i className="bi bi-calendar-event text-primary" />Tryouts</button></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" type="button"
                    onClick={() => { setView('feed'); setMenuOpen(false); closeDropdownMenus(); window.scrollTo(0,0) }}>
                    <i className="bi bi-newspaper text-primary" />Community Feed</button></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item d-flex align-items-center gap-2" type="button"
                    onClick={() => { setView('members'); setMenuOpen(false); closeDropdownMenus(); window.scrollTo(0,0) }}>
                    <i className="bi bi-people text-primary" />Members Directory</button></li>
                </ul>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              {/* Sport switcher / badge */}
              {BASKETBALL_ENABLED ? (
                <li className="nav-item dropdown">
                  <button
                    className="btn btn-sm btn-outline-light dropdown-toggle d-inline-flex align-items-center gap-1"
                    type="button"
                    aria-expanded={sportMenuOpen}
                    aria-label="Switch sport"
                    onClick={() => { setSportMenuOpen((open) => !open); setExploreOpen(false); setLanguageMenuOpen(false) }}
                  >
                    <i className={`bi ${sport === 'football' ? 'bi-dribbble' : 'bi-circle'}`} aria-hidden="true" />
                    <span>{sport === 'football' ? 'Football' : 'Basketball'}</span>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end${sportMenuOpen ? ' show' : ''}`}>
                    {['football', 'basketball'].map((s) => (
                      <li key={s}>
                        <button
                          className={`dropdown-item d-flex align-items-center justify-content-between${sport === s ? ' active' : ''}`}
                          type="button"
                          onClick={() => { setSport(s); setSportMenuOpen(false) }}
                        >
                          {s === 'football' ? 'Football' : 'Basketball'}
                          {sport === s && <i className="bi bi-check-lg" aria-hidden="true" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <span
                    className="badge d-inline-flex align-items-center gap-1 px-3 py-2"
                    style={{ background: 'var(--fc-gradient-gold)', color: 'var(--fc-navy-900)', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', borderRadius: 'var(--fc-radius-pill)', cursor: 'default' }}
                    title="Basketball coming soon"
                  >
                    <i className="bi bi-dribbble" aria-hidden="true" />
                    FOOTBALL <span style={{ opacity: .65, fontWeight: 400 }}></span>
                  </span>
                </li>
              )}

              {/* Language switcher */}
              <li className="nav-item dropdown">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle d-inline-flex align-items-center gap-1"
                  type="button"
                  aria-expanded={languageMenuOpen}
                  aria-controls="language-menu"
                  aria-label="Switch language"
                  onClick={() => { setLanguageMenuOpen((open) => !open); setExploreOpen(false); setSportMenuOpen(false) }}
                >
                  <i className="bi bi-globe2" aria-hidden="true" />
                  <span className="text-uppercase">{language}</span>
                </button>
                <ul id="language-menu" className={`dropdown-menu dropdown-menu-end${languageMenuOpen ? ' show' : ''}`}>
                  {SUPPORTED_LANGUAGES.map(({ code, label }) => (
                    <li key={code}>
                      <button
                        className={`dropdown-item d-flex align-items-center justify-content-between${language === code ? ' active' : ''}`}
                        type="button"
                        lang={code}
                        onClick={() => { setLanguage(code); setLanguageMenuOpen(false); setMenuOpen(false) }}
                      >
                        {label}
                        {language === code && <i className="bi bi-check-lg" aria-hidden="true" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>

              {/* Dark mode */}
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-link nav-link"
                  aria-pressed={darkTheme}
                  aria-label="Toggle dark mode"
                  onClick={() => setDarkTheme(!darkTheme)}
                >
                  <i className={`bi ${darkTheme ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
                </button>
              </li>

              {/* Auth */}
              {user ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link d-none d-lg-inline" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-link nav-link"
                      type="button"
                      onClick={() => supabase?.auth.signOut()}
                    >
                      <i className="bi bi-box-arrow-right me-1" aria-hidden="true" />Log out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <button className="btn btn-link nav-link" type="button" onClick={openSignin}>
                      Log in
                    </button>
                  </li>
                  {/* Desktop: Create Account Profile + Find Players */}
                  <li className="nav-item d-none d-lg-flex gap-2 align-items-center ms-lg-1">
                    <button
                      className="btn btn-secondary btn-sm"
                      type="button"
                      onClick={() => openSignup('player')}
                    >
                      <i className="bi bi-person-plus me-1" aria-hidden="true" />
                      Create Account
                    </button>
                    <button
                      className="btn btn-outline-light btn-sm"
                      type="button"
                      onClick={() => document.getElementById('players')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <i className="bi bi-search me-1" aria-hidden="true" />
                      Find Players
                    </button>
                  </li>
                  {/* Mobile: single join button */}
                  <li className="nav-item d-lg-none">
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => openSignup()}>
                      Join SportBridge
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* —— Main content ————————————————————————————————————————————————————— */}
      <main id="main-content" className="flex-grow-1">
        {user && accountStatus !== 'active' ? (
          <div className="container py-5">
            {accountStatus === 'checking' ? (
              <div className="text-center text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Checking account access…</div>
            ) : (
              <div className="alert alert-warning mx-auto" style={{ maxWidth: 640 }} role="alert">
                <h1 className="h5">Account access unavailable</h1>
                <p className="mb-3">{accountStatus === 'unavailable'
                  ? 'We could not confirm your account status. Please retry or sign out and contact support.'
                  : `This account is ${accountStatus}. Account access is currently disabled.`}</p>
                <div className="d-flex gap-2">
                  {accountStatus === 'unavailable' && <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setStatusCheckKey((key) => key + 1)}>Retry</button>}
                  <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
                </div>
              </div>
            )}
          </div>
        ) : view === 'dashboard' && user ? (
          <Dashboard supabase={supabase} user={user} onBack={() => setView('home')} onCommunity={() => setView('feed')} />
        ) : view === 'player' && selectedPlayerId ? (
          <PlayerProfile
            playerId={selectedPlayerId}
            supabase={supabase}
            user={user}
            onBack={() => { setSelectedPlayerId(null); setView('home') }}
            onSignup={(role) => openSignup(role)}
          />
        ) : view === 'jobs' ? (
          <JobsPage supabase={supabase} user={user} onSignup={openSignup} />
        ) : view === 'tryouts' ? (
          <TryoutsPage supabase={supabase} user={user} onSignup={openSignup} />
        ) : view === 'feed' ? (
          <FeedPage supabase={supabase} user={user} onSignup={openSignup} />
        ) : view === 'inbox' ? (
          <InboxPage supabase={supabase} user={user} onSignup={openSignup} />
        ) : view === 'members' ? (
          <MembersDirectory
            supabase={supabase}
            user={user}
            onSignup={openSignup}
            initialSelection={selectedMember}
            onBack={() => { setSelectedMember(null); setView('home'); window.scrollTo(0,0) }}
          />
        ) : view === 'pricing' ? (
          <PaymentPage user={user} onSignup={openSignup} onBack={() => setView('home')} />
        ) : (
          <>
            {/* spacer */}
            <div className="container py-4" aria-hidden="true" />

            {/* —— Hero ———————————————————————————————————————————————————— */}
            <section className="fc-hero px-3 px-md-5 py-5 mb-0" aria-labelledby="home-heading">
              <img src={worldCupBallImage} alt="" className="fc-hero-ball d-none d-md-block" />
              <div className="container py-4">
                <div className="row align-items-center g-5">
                  <div className="col-12 col-lg-7">

                    {/* Badge */}
                    <span className="fc-hero-badge fc-animate-in">
                      <i className="bi bi-shield-check me-1" aria-hidden="true" />
                      The World&apos;s #1 Verified Football Network
                    </span>

                    {/* Headline */}
                    <h1 id="home-heading" className="display-4 fw-bold mt-3 mb-3 fc-animate-in fc-delay-1">
                      Stop Chasing Fake Agents.{' '}
                      <span className="fc-gradient-text">Get Verified.</span>
                    </h1>

                    {/* Sub-headline */}
                    <p className="lead fc-animate-in fc-delay-2" style={{ color: 'rgba(247,249,248,.84)', maxWidth: '56ch' }}>
                      SportBridge connects <strong style={{ color: '#fff' }}>Verified Players</strong> with{' '}
                      <strong style={{ color: '#fff' }}>Verified Clubs, Academies, Agents &amp; Managers</strong>{' '}
                      <span>across The World.</span>{' '}
                      <span>Full CV + Full-Match Video + Highlights + Stats + Secure Unlock —</span>{' '}
                      <em>not just highlights.</em>
                    </p>

                    {/* Comparison pills */}
                    <div className="d-flex flex-wrap gap-2 mt-4 fc-animate-in fc-delay-2" role="list" aria-label="SportBridge vs other platforms">
                      {[
                        { vs: 'Social Media', vsText: 'Edited highlights only',          sbText: 'Verified CV + Full Match Video + Availability', icon: 'bi-camera-video' },
                        { vs: 'Job sites',  vsText: 'Corporate jobs only',            sbText: 'Football jobs by position · age group · region',  icon: 'bi-briefcase' },
                        { vs: 'Groups',        vsText: 'Scams & phone number leaks',    sbText: 'NIN verified · video hash · no leaked contacts',   icon: 'bi-shield-lock' },
                      ].map(({ vs, vsText, sbText, icon }) => (
                        <div
                          key={vs}
                          role="listitem"
                          className="d-flex align-items-start gap-2 rounded-3 px-3 py-2"
                          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)', maxWidth: 360, fontSize: 12 }}
                        >
                          <i className={`bi ${icon} mt-1 flex-shrink-0`} style={{ color: 'var(--fc-gold-400)', fontSize: 14 }} aria-hidden="true" />
                          <div>
                            <span style={{ color: 'rgba(247,249,248,.76)' }}>{vs}: <span style={{ textDecoration: 'line-through' }}>{vsText}</span></span>
                            <br />
                            <span style={{ color: '#fff', fontWeight: 700 }}>SportBridge: {sbText}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div className="d-flex flex-wrap gap-2 mt-4 fc-animate-in fc-delay-3">
                      <button type="button" className="btn btn-secondary btn-lg" onClick={() => openSignup('player')}>
                        <i className="bi bi-person-plus me-2" aria-hidden="true" />
                        Create Player Profile
                      </button>
                      <a href="#players" className="btn btn-outline-light btn-lg">
                        <i className="bi bi-search me-2" aria-hidden="true" />
                        Find Players
                      </a>
                    </div>

                    {/* Stats */}
                    <div className="row g-4 mt-4 fc-animate-in fc-delay-3">
                      <div className="col-4"><div className="fc-stat-value fc-gradient-text">500+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Player profiles</div></div>
                      <div className="col-4"><div className="fc-stat-value fc-gradient-text">120+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Verified clubs</div></div>
                      <div className="col-4"><div className="fc-stat-value fc-gradient-text">40+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Countries reached</div></div>
                    </div>
                  </div>

                  {/* Right: role cards */}
                  <div className="col-12 col-lg-5">
                    <div className="d-flex flex-column gap-3">
                      {roleCards.map((role) => (
                        <button
                          key={role.accountRole}
                          type="button"
                          className="btn text-start p-0 border-0"
                          onClick={() => openSignup(role.accountRole)}
                          style={{ background: 'none' }}
                        >
                          <div
                            className="d-flex align-items-center gap-3 rounded-3 px-3 py-3"
                            style={{
                              background: 'rgba(255,255,255,.06)',
                              border: '1px solid rgba(255,255,255,.12)',
                              transition: 'background .2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
                          >
                            <span className={`fc-icon-badge flex-shrink-0${role.accountRole === 'player' ? ' fc-icon-badge-gold' : ''}`}
                              style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                              <i className={`bi ${role.heroIcon}`} aria-hidden="true" />
                            </span>
                            <div>
                              <div className="fw-bold text-white" style={{ fontSize: 14 }}>{role.heroTitle}</div>
                              <div style={{ fontSize: 12, color: 'rgba(247,249,248,.65)' }}>{role.heroCopy}</div>
                            </div>
                            <i className="bi bi-arrow-right ms-auto text-white opacity-50" aria-hidden="true" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* —— Problem / Solution bar (answers "why not WhatsApp/Instagram") —— */}
            <div className="mb-5" style={{ background: 'var(--fc-navy-900)', borderBottom: '1px solid rgba(245,179,1,.15)' }}>
              <div className="container">
                <div className="row g-0">
                  {[
                    {
                      problem: 'Fake agents collecting fees',
                      solution: 'Verified Agent badge + fee warning on every post',
                      problemIcon: 'bi-person-x',
                      solutionIcon: 'bi-patch-check-fill',
                    },
                    {
                      problem: 'Edited highlight clips',
                      solution: 'Full-match video required + SHA-256 duplicate detector',
                      problemIcon: 'bi-camera-video-off',
                      solutionIcon: 'bi-film',
                    },
                    {
                      problem: 'Phone numbers scraped from WhatsApp',
                      solution: 'Contact unlock only after identity verification',
                      problemIcon: 'bi-telephone-x',
                      solutionIcon: 'bi-lock-fill',
                    },
                  ].map(({ problem, solution, problemIcon, solutionIcon }, i) => (
                    <div key={i} className="col-12 col-md-4 sb-trust-comparison-cell">
                      <div className="px-4 py-4">
                        {/* Problem */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className={`bi ${problemIcon}`} style={{ color: '#dc3545', fontSize: 15 }} aria-hidden="true" />
                          <span className="small sb-trust-comparison-copy" style={{ color: 'rgba(247,249,248,.78)', textDecoration: 'line-through' }}>{problem}</span>
                        </div>
                        {/* Solution */}
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${solutionIcon}`} style={{ color: 'var(--fc-gold-400)', fontSize: 15 }} aria-hidden="true" />
                          <span className="small fw-semibold sb-trust-comparison-copy" style={{ color: '#fff' }}>{solution}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="container">
              {/* —— Role cards —————————————————————————————————————————— */}
              <div className="text-center mb-5" id="roles">
                <h2 className="h3 fw-bold" style={{ color: 'var(--fc-blue-700)' }}>One platform, every side of the game</h2>
                <p className="text-muted">Purpose-built tools for players, clubs, agents, scouts, coaches and sporting directors alike.</p>
              </div>

              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 pb-5">
                {roleCards.map((role) => (
                  <div className="col" key={role.accountRole}>
                    <div className="card h-100 p-4" style={{ border: 'none' }}>
                      <span className={`fc-icon-badge mb-3${role.accountRole === 'player' ? ' fc-icon-badge-gold' : ''}`}>
                        <i className={`bi ${role.cardIcon}`} aria-hidden="true" />
                      </span>
                      <h2 className="h5">{role.title}</h2>
                      <p className="text-muted">{role.copy}</p>
                      <button
                        type="button"
                        className="fw-semibold btn btn-link p-0 justify-content-start"
                        onClick={() => openSignup(role.accountRole)}
                      >
                        {role.action} <i className="bi bi-arrow-right" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* —— Visual showcase ————————————————————————————————————— */}
              <section className="mb-5" aria-labelledby="sportbridge-visuals-title">
                <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
                  <div>
                    <span className="text-uppercase small fw-semibold text-muted">Built for the game</span>
                    <h2 id="sportbridge-visuals-title" className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>
                      A connected sporting world
                    </h2>
                  </div>
                  <p className="text-muted mb-0">From the pitch to the next opportunity.</p>
                </div>
                <div className="fc-visual-showcase mb-3">
                  <figure><img src={footballImage}      alt="Football stadium ready for a match" /><figcaption>Find your next stage</figcaption></figure>
                  <figure><img src={footballStandImage} alt="Football stadium from the stands"   loading="lazy" /><figcaption>Make your move</figcaption></figure>
                  <figure><img src={ballImage}          alt="FIFA World Cup football"            loading="lazy" /><figcaption>Every level. Every ambition.</figcaption></figure>
                </div>
                {BASKETBALL_ENABLED && (
                  <div className="fc-sport-strip">
                    <img src="/img/basketball.jpg"         alt="Basketball on court"  loading="lazy" />
                    <img src="/img/basketball-court.jpg"   alt="Basketball court"     loading="lazy" />
                    <img src="/img/basketball-journal.jpg" alt="Basketball journal"   loading="lazy" />
                  </div>
                )}
              </section>

              {/* ── Meet the community — public profiles ──────────────────── */}
              {/* Moved below as the main directory section */}

              {/* —— CTA band ———————————————————————————————————————————— */}
              <div className="rounded-4 p-5 mb-5 text-center fc-band-photo">
                <h2 className="h3 fw-bold text-white mb-2">Ready to make your next move?</h2>
                <p className="mb-4" style={{ color: 'rgba(255,255,255,.85)' }}>
                  Join SportBridge today, free for players. Takes one minute.
                </p>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => openSignup()}>
                  Create your free account
                </button>
              </div>
            </div>

            {/* ── Who's on SportBridge — replaces old Player Directory header ── */}
            <section className="container py-5" id="players" aria-labelledby="directory-heading">
              <CommunityProfilesSection
                supabase={supabase}
                onSignup={openSignup}
                onPlayerClick={(id) => { setSelectedPlayerId(id); setView('player'); window.scrollTo(0, 0) }}
                onMemberClick={(type, item) => { setSelectedMember(type && item ? { type, item } : null); setView('members'); window.scrollTo(0, 0) }}
              />
            </section>
          </>
        )}
      </main>

      {/* —— Footer ——————————————————————————————————————————————————————————— */}
      <footer
        className="mt-auto py-5"
        style={{ background: 'linear-gradient(160deg, var(--fc-navy-800) 0%, var(--fc-blue-900) 100%)', color: 'rgba(247,249,248,.82)' }}
        data-bs-theme="dark"
      >
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <a className="navbar-brand d-inline-flex align-items-center gap-2 mb-2" href="#home">
                <img src={logoMark} alt="" width="22" height="22" />
                <span className="fw-bold">Sport<span className="fc-gradient-text">Bridge</span></span>
              </a>
              <p className="small mb-0">
                Connecting players, clubs, academies, agents, scouts, coaches and sporting directors across the world.
              </p>
            </div>
            <div className="col-6 col-sm-6 col-lg-3">
              <h2 className="h6 text-uppercase text-white-50">Explore</h2>
              <ul className="list-unstyled small">
                <li><a className="link-light link-underline-opacity-0" href="#players">Players</a></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('jobs'); window.scrollTo(0,0) }}>Jobs</button></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('tryouts'); window.scrollTo(0,0) }}>Tryouts</button></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('feed'); window.scrollTo(0,0) }}>Feed</button></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('members'); window.scrollTo(0,0) }}>Members Directory</button></li>
                <li><button className="btn btn-link link-light link-underline-opacity-0 p-0 small" type="button" onClick={() => { setView('pricing'); window.scrollTo(0,0) }}>Pricing</button></li>
              </ul>
            </div>
            <div className="col-6 col-sm-6 col-lg-3">
              <h2 className="h6 text-uppercase text-white-50">Join</h2>
              <ul className="list-unstyled small">
                {roleCards.map((role) => (
                  <li key={role.accountRole}>
                    <button
                      className="btn btn-link link-light link-underline-opacity-0 p-0"
                      type="button"
                      onClick={() => openSignup(role.accountRole)}
                    >
                      {role.title.replace('For ', '')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <h2 className="h6 text-uppercase text-white-50">World Clock</h2>
              <div className="d-flex flex-column gap-1 small">
                {worldClocks.map(([city, zone]) => (
                  <div className="d-flex justify-content-between gap-2" key={zone}>
                    <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{city}</span>
                    <span className="fw-semibold font-monospace">
                      {new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(clockNow)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr className="border-light opacity-25" />
          <p className="small mb-2 fw-bold" style={{ maxWidth: '70ch' }}>
            SportBridge connects players, academies, agents, scouts and coaches, but is not a party to any agreement between them and does not process payments between users. Credentials shown on profiles are self-reported unless marked with a Verified badge. Always independently verify who you are dealing with, and never send money to arrange a trial or introduction.
          </p>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <p className="small mb-0 text-white-50">&copy; {new Date().getFullYear()} SportBridge. All rights reserved.</p>
            <a href="#home" className="small link-light link-underline-opacity-0">
              Back to top <i className="bi bi-arrow-up-short" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>

      {/* —— Auth modal ——————————————————————————————————————————————————————— */}
      {authOpen && (
        <AuthModal
          key={`${authInitMode}-${authInitRole}`}
          initialMode={authInitMode}
          initialRole={authInitRole}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </div>
  )
}

export default App
