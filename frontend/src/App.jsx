import { useEffect, useState } from 'react'
import './Auth.css'
import Dashboard from './Dashboard.jsx'
import basketballImage from '../../public/img/basketball.jpg'
import basketballCourtImage from '../../public/img/basketball-court.jpg'
import basketballJournalImage from '../../public/img/basketball-journal.jpg'
import ballImage from '../../public/img/fifa-world-cup-ball.avif'
import footballImage from '../../public/img/football-stadium.jpg'
import footballStandImage from '../../public/img/football-stadium1.jpg'
import logoMark from '../../public/img/logo-mark.svg'
import worldCupBallImage from '../../public/img/world-cup-ball.avif'
import { supabase, hasSupabaseConfig } from './lib/supabase'
const sections = [
  { id: 'players', label: 'Players' },
  { id: 'jobs', label: 'Opportunities' },
]
const roles = [
  { accountRole: 'player', cardIcon: 'bi-person-arms-up', heroIcon: 'bi-person-arms-up', title: 'For Players', heroTitle: 'Players', heroCopy: 'Free profile. Get discovered.', copy: 'Create a free profile with photos, highlight videos and your CV. Go public and get discovered - no academy required.', action: 'Create your player profile' },
  { accountRole: 'academy', cardIcon: 'bi-person-badge', heroIcon: 'bi-building', title: 'For Clubs & Academies', heroTitle: 'Clubs', heroCopy: 'Showcase your squad to the world.', copy: 'Build player profiles, manage teams, and post coaching or scouting vacancies to reach the right people.', action: 'Register your academy' },
  { accountRole: 'agent', cardIcon: 'bi-search', heroIcon: 'bi-binoculars', title: 'For Agents & Scouts', heroTitle: 'Agents', heroCopy: 'Scout the next generation.', copy: 'Search players by position, age, and nationality, build a watchlist, and request access to full profiles.', action: 'Register as an agent' },
  { accountRole: 'coach', cardIcon: 'bi-briefcase', heroIcon: 'bi-clipboard2-pulse', title: 'For Coaches & Sporting Directors', heroTitle: 'Coaches', heroCopy: 'Land your next role.', copy: 'Browse open roles across academies and clubs, and apply directly with your CV and badges.', action: 'Register as a coach' },
]
const worldClocks = [
  ['London', 'Europe/London'],
  ['New York', 'America/New_York'],
  ['Tokyo', 'Asia/Tokyo'],
  ['Lagos', 'Africa/Lagos'],
  ['Qatar', 'Asia/Qatar'],
]

function App() {
  const [view, setView] = useState('home')
  const [section, setSection] = useState('players')
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [connection, setConnection] = useState(hasSupabaseConfig ? 'checking' : 'missing')
  const [loading, setLoading] = useState(hasSupabaseConfig)
  const [recordError, setRecordError] = useState('')
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [signupRole, setSignupRole] = useState('player')
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [darkTheme, setDarkTheme] = useState(false)
  const [sport, setSport] = useState('football')
  const [sportMenuOpen, setSportMenuOpen] = useState(false)
  const [language, setLanguage] = useState('en')
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [clockNow, setClockNow] = useState(() => new Date())

  const openSignup = (role = 'player') => {
    setSignupRole(role)
    setAuthOpen(true)
    setAuthMode('signup')
    setAuthMessage('')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', darkTheme ? 'dark' : 'light')
  }, [darkTheme])

  useEffect(() => {
    const clockTimer = window.setInterval(() => setClockNow(new Date()), 1000)
    return () => window.clearInterval(clockTimer)
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    let current = true
    const loadRecords = async () => {
      const query = section === 'players'
        ? supabase.from('players').select('id, display_name, position, age, country, bio').order('created_at', { ascending: false }).limit(60)
        : supabase.from('jobs').select('id, title, description, created_at, clubs(name)').order('created_at', { ascending: false }).limit(60)
      const { data, error } = await query

      if (!current) return
      if (error) {
        setRecordError(error.message)
        setConnection('error')
        setRecords([])
      } else {
        setConnection('ready')
        setRecords(data ?? [])
      }
      setLoading(false)
    }

    loadRecords()
    return () => { current = false }
  }, [section])

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') setView('dashboard')
      if (event === 'SIGNED_OUT') setView('home')
    })
    return () => subscription.unsubscribe()
  }, [])

  const visibleRecords = records.filter((record) => {
    const fields = section === 'players'
      ? [record.display_name, record.position, record.country, record.bio]
      : [record.title, record.description, record.clubs?.name]
    return fields.some((value) => value?.toLowerCase().includes(search.toLowerCase()))
  })

  const submitAuth = async (event) => {
    event.preventDefault()
    if (!supabase) return
    setAuthBusy(true)
    setAuthMessage('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const result = authMode === 'signup'
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: String(form.get('full_name') ?? '').trim(), role: String(form.get('role') ?? 'player') } },
        })
      : await supabase.auth.signInWithPassword({ email, password })
    setAuthBusy(false)

    if (result.error) {
      setAuthMessage(result.error.message)
    } else if (authMode === 'signup' && !result.data.session) {
      setAuthMessage('Check your email to confirm your account, then sign in.')
    } else {
      setAuthOpen(false)
      setAuthMessage('')
      setView('dashboard')
    }
  }

  return (
    <div data-bs-theme={darkTheme ? 'dark' : 'light'}>
      <a className="visually-hidden-focusable btn btn-primary position-absolute top-0 start-0 m-2" href="#main-content">Skip to main content</a>
      <nav className="navbar navbar-expand-lg sticky-top shadow-sm" data-bs-theme="dark" id="home">
        <div className="container">
          <a className="navbar-brand" href="#home" aria-label="SportBridge home">
            <span className="d-inline-flex align-items-center gap-2">
              <img src={logoMark} alt="" width="24" height="24" />
              <span className="fw-bold" style={{ fontFamily: 'var(--fc-font-heading)' }}>Sport<span className="fc-gradient-text">Bridge</span></span>
            </span>
          </a>
          <button className="navbar-toggler" type="button" aria-controls="mainNavbar" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse${menuOpen ? ' show' : ''}`} id="mainNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="#home" onClick={() => { setView('home'); setMenuOpen(false) }}>Home</a></li>
              {user && <li className="nav-item"><button className={`btn btn-link nav-link${view === 'dashboard' ? ' active' : ''}`} type="button" onClick={() => { setView('dashboard'); setMenuOpen(false) }}>Dashboard</button></li>}
              <li className="nav-item"><a className="nav-link" href="#players" onClick={() => setMenuOpen(false)}>Players</a></li>
              <li className="nav-item"><a className="nav-link" href="#opportunities" onClick={() => { setSection('jobs'); setMenuOpen(false) }}>Jobs</a></li>
              <li className="nav-item"><a className="nav-link" href="#roles" onClick={() => setMenuOpen(false)}>Feed</a></li>
            </ul>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li className="nav-item dropdown">
                <button className="btn btn-sm btn-outline-light dropdown-toggle d-inline-flex align-items-center gap-1" type="button" aria-expanded={sportMenuOpen} aria-label="Sport" onClick={() => setSportMenuOpen(!sportMenuOpen)}>
                  <i className={`bi ${sport === 'football' ? 'bi-dribbble' : 'bi-circle'}`} aria-hidden="true" />
                  <span>{sport === 'football' ? 'Football' : 'Basketball'}</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end${sportMenuOpen ? ' show' : ''}`}>
                  {['football', 'basketball'].map((item) => <li key={item}><button className={`dropdown-item d-flex align-items-center justify-content-between${sport === item ? ' active' : ''}`} type="button" onClick={() => { setSport(item); setSportMenuOpen(false) }}>{item === 'football' ? 'Football' : 'Basketball'}{sport === item && <i className="bi bi-check-lg" aria-hidden="true" />}</button></li>)}
                </ul>
              </li>
              <li className="nav-item dropdown">
                <button className="btn btn-sm btn-outline-light dropdown-toggle d-inline-flex align-items-center gap-1" type="button" aria-expanded={languageMenuOpen} aria-label="Language" onClick={() => setLanguageMenuOpen(!languageMenuOpen)}>
                  <i className="bi bi-globe2" aria-hidden="true" /><span className="text-uppercase">{language}</span>
                </button>
                <ul className={`dropdown-menu dropdown-menu-end${languageMenuOpen ? ' show' : ''}`}>
                  {[['en', 'English'], ['fr', 'Français'], ['pt', 'Português'], ['ar', 'العربية'], ['es', 'Español']].map(([code, label]) => <li key={code}><button className={`dropdown-item d-flex align-items-center justify-content-between${language === code ? ' active' : ''}`} type="button" onClick={() => { setLanguage(code); setLanguageMenuOpen(false) }}>{label}{language === code && <i className="bi bi-check-lg" aria-hidden="true" />}</button></li>)}
                </ul>
              </li>
              <li className="nav-item">
                <button type="button" className="btn btn-link nav-link" aria-pressed={darkTheme} aria-label="Toggle dark mode" onClick={() => setDarkTheme(!darkTheme)}>
                  <i className={`bi ${darkTheme ? 'bi-sun' : 'bi-moon-stars'}`} aria-hidden="true" />
                </button>
              </li>
              {user ? <>
                <li className="nav-item"><span className="nav-link">{user.email}</span></li>
                <li className="nav-item"><button className="btn btn-link nav-link" type="button" onClick={() => supabase?.auth.signOut()}>Log out</button></li>
              </> : <>
                <li className="nav-item"><button className="btn btn-link nav-link" type="button" onClick={() => { setAuthOpen(true); setAuthMode('signin'); setAuthMessage('') }}>Log in</button></li>
                <li className="nav-item"><button className="btn btn-secondary btn-sm ms-lg-2" type="button" onClick={() => openSignup()}>Join SportBridge</button></li>
              </>}
            </ul>
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow-1">
        {view === 'dashboard' && user ? <Dashboard supabase={supabase} user={user} onBack={() => setView('home')} /> : <>
        <div className="container py-4" aria-hidden="true" />
        <section className="fc-hero px-3 px-md-5 py-5 mb-5" aria-labelledby="home-heading">
          <img src={worldCupBallImage} alt="" className="fc-hero-ball d-none d-md-block" />
          <div className="container py-4">
            <div className="row align-items-center g-5">
              <div className="col-12 col-lg-7">
                <span className="fc-hero-badge fc-animate-in"><i className="bi bi-globe-americas" aria-hidden="true" />Trusted by clubs, academies and agencies worldwide</span>
                <h1 id="home-heading" className="display-4 fw-bold mt-3 mb-3 fc-animate-in fc-delay-1">Connecting Sports talent with the people who build careers.</h1>
                <p className="lead fc-animate-in fc-delay-2" style={{ color: 'rgba(247,249,248,.78)' }}>Players build a free profile. Academies and clubs showcase squads and post jobs. Agents and scouts discover talent. Coaches and sporting directors find their next move. Every stakeholder in the game, connected.</p>
                <div className="d-flex flex-wrap gap-2 mt-4 fc-animate-in fc-delay-3">
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => openSignup()}>Get started <i className="bi bi-arrow-right ms-1" aria-hidden="true" /></button>
                  <a href="#players" className="btn btn-outline-light btn-lg">Browse players</a>
                </div>
                <div className="row g-4 mt-4 fc-animate-in fc-delay-3">
                  <div className="col-4"><div className="fc-stat-value fc-gradient-text">500+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Player profiles</div></div>
                  <div className="col-4"><div className="fc-stat-value fc-gradient-text">120+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Academies & clubs</div></div>
                  <div className="col-4"><div className="fc-stat-value fc-gradient-text">40+</div><div className="small" style={{ color: 'rgba(247,249,248,.65)' }}>Countries reached</div></div>
                </div>
              </div>
              <div className="col-12 col-lg-5">
                <div className="row row-cols-2 row-cols-lg-1 g-3 text-center text-lg-start">
                  {roles.map((role) => <div className="col" key={role.accountRole}>
                    <div className="card h-100 p-3 p-md-4 d-flex flex-row align-items-center gap-3 justify-content-center justify-content-lg-start" style={{ border: 'none' }}>
                      <span className={`fc-icon-badge flex-shrink-0${role.accountRole === 'player' ? ' fc-icon-badge-gold' : ''}`}><i className={`bi ${role.heroIcon}`} aria-hidden="true" /></span>
                      <div className="d-none d-lg-block"><h2 className="h6 mb-1">{role.heroTitle}</h2><p className="small text-muted mb-0">{role.heroCopy}</p></div>
                      <h2 className="h6 mb-0 d-lg-none">{role.heroTitle}</h2>
                    </div>
                  </div>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="text-center mb-5" id="roles">
            <h2 className="h3 fw-bold" style={{ color: 'var(--fc-blue-700)' }}>One platform, every side of the game</h2>
            <p className="text-muted">Purpose-built tools for players, clubs, agents, scouts, coaches and sporting directors alike.</p>
          </div>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 pb-5">
            {roles.map((role) => <div className="col" key={role.accountRole}>
              <div className="card h-100 p-4" style={{ border: 'none' }}>
                <span className={`fc-icon-badge mb-3${role.accountRole === 'player' ? ' fc-icon-badge-gold' : ''}`}><i className={`bi ${role.cardIcon}`} aria-hidden="true" /></span>
                <h2 className="h5">{role.title}</h2>
                <p className="text-muted">{role.copy}</p>
                <button type="button" className="fw-semibold btn btn-link p-0 justify-content-start" onClick={() => openSignup(role.accountRole)}>{role.action} <i className="bi bi-arrow-right" aria-hidden="true" /></button>
              </div>
            </div>)}
          </div>

          <section className="mb-5" aria-labelledby="sportbridge-visuals-title">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
              <div>
                <span className="text-uppercase small fw-semibold text-muted">Built for the game</span>
                <h2 id="sportbridge-visuals-title" className="h3 fw-bold mb-0" style={{ color: 'var(--fc-blue-700)' }}>A connected sporting world</h2>
              </div>
              <p className="text-muted mb-0">From the pitch to the next opportunity.</p>
            </div>
            <div className="fc-visual-showcase mb-3">
              <figure><img src={footballImage} alt="Football stadium ready for a match" loading="lazy" /><figcaption>Find your next stage</figcaption></figure>
              <figure><img src={footballStandImage} alt="Football stadium viewed from the stands" loading="lazy" /><figcaption>Make your move</figcaption></figure>
              <figure><img src={ballImage} alt="FIFA World Cup football" loading="lazy" /><figcaption>Every level. Every ambition.</figcaption></figure>
            </div>
            <div className="fc-sport-strip">
              <img src={basketballImage} alt="Basketball on court" loading="lazy" />
              <img src={basketballCourtImage} alt="Basketball court" loading="lazy" />
              <img src={basketballJournalImage} alt="Basketball journal" loading="lazy" />
            </div>
          </section>

          <div className="rounded-4 p-5 mb-5 text-center fc-band-photo">
            <h2 className="h3 fw-bold text-white mb-2">Ready to make your next move?</h2>
            <p className="mb-4" style={{ color: 'rgba(255,255,255,.85)' }}>Join SportBridge today, free for players - it only takes a minute to get started.</p>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => openSignup()}>Create your free account</button>
          </div>
        </div>

        <section className="container py-5" id="players" aria-labelledby="directory-heading">
          <div className="row align-items-end g-3 mb-4">
            <div className="col-12 col-md-6"><span className="text-uppercase small fw-semibold text-muted">Explore SportBridge</span><h2 className="h3 fw-bold mb-0" id="directory-heading" style={{ color: 'var(--fc-blue-700)' }}>{section === 'players' ? 'Player directory' : 'Open opportunities'}</h2></div>
            <div className="col-12 col-md-6"><label className="visually-hidden" htmlFor="directory-search">Search listings</label><input className="form-control" id="directory-search" onChange={(event) => setSearch(event.target.value)} placeholder={section === 'players' ? 'Name, position, country' : 'Role, club, keyword'} type="search" value={search} /></div>
          </div>
          <ul className="nav nav-tabs mb-4" id="opportunities" role="tablist" aria-label="Browse listings">
            {sections.map((item) => <li className="nav-item" key={item.id} role="presentation"><button aria-selected={section === item.id} className={`nav-link${section === item.id ? ' active' : ''}`} onClick={() => { setSection(item.id); setSearch(''); setRecords([]); setRecordError(''); setLoading(Boolean(supabase)) }} role="tab" type="button">{item.label}</button></li>)}
            <li className="nav-item ms-auto d-flex align-items-center"><span className="small text-muted"><i className={`bi ${connection === 'ready' ? 'bi-check-circle-fill text-success' : connection === 'checking' ? 'bi-arrow-repeat' : 'bi-exclamation-circle text-warning'} me-1`} aria-hidden="true" />{connection === 'ready' ? 'Live listings' : connection === 'checking' ? 'Connecting' : 'Listings unavailable'}</span></li>
          </ul>
          {recordError && <div className="alert alert-warning" role="status">Could not load listings: {recordError}</div>}
          {loading ? <div className="py-5 text-center text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Loading {section === 'players' ? 'players' : 'opportunities'}...</div>
            : visibleRecords.length ? <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">{visibleRecords.map((record) => <div className="col" key={record.id}><article className="card h-100 p-4">
                <span className="small fw-semibold text-uppercase text-primary">{section === 'players' ? record.position || 'Player' : 'Open role'}</span>
                <h3 className="h5 mt-3">{section === 'players' ? record.display_name || 'Player profile' : record.title}</h3>
                <p className="small text-primary mb-2">{section === 'players' ? [record.country, record.age ? `${record.age} years` : null].filter(Boolean).join(' · ') || 'Profile available' : record.clubs?.name || 'Club opportunity'}</p>
                <p className="text-muted mb-0">{record.bio || record.description || 'More details will be shared by the profile owner.'}</p>
              </article></div>)}</div>
              : <div className="fc-empty-state">{connection === 'missing' || connection === 'error' ? <i className="bi bi-cloud-slash" aria-hidden="true" /> : <i className="bi bi-person-lines-fill" aria-hidden="true" />}<h3 className="h5">{connection === 'missing' ? 'Connect the live directory' : recordError ? 'The directory needs attention' : 'The next opportunity starts here'}</h3><p>{connection === 'missing' ? 'Add the Supabase project URL and public anon key to Netlify to load live SportBridge listings.' : recordError ? 'Check the Supabase project key, database schema and public read policies.' : 'There are no listings here yet. Sign in to create your profile and make your next move.'}</p></div>}
        </section>
        </>}
      </main>

      <footer className="mt-auto py-5" style={{ background: 'linear-gradient(160deg, var(--fc-navy-800) 0%, var(--fc-blue-900) 100%)', color: 'rgba(247,249,248,.82)' }} data-bs-theme="dark">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <a className="navbar-brand d-inline-flex align-items-center gap-2 mb-2" href="#home"><img src={logoMark} alt="" width="22" height="22" /><span className="fw-bold">Sport<span className="fc-gradient-text">Bridge</span></span></a>
              <p className="small mb-0">Connecting players, clubs, academies, agents, scouts, coaches and sporting directors across the world.</p>
            </div>
            <div className="col-6 col-sm-6 col-lg-3"><h2 className="h6 text-uppercase text-white-50">Explore</h2><ul className="list-unstyled small"><li><a className="link-light link-underline-opacity-0" href="#players">Players</a></li><li><a className="link-light link-underline-opacity-0" href="#opportunities" onClick={() => setSection('jobs')}>Jobs</a></li><li><a className="link-light link-underline-opacity-0" href="#roles">Feed</a></li></ul></div>
            <div className="col-6 col-sm-6 col-lg-3"><h2 className="h6 text-uppercase text-white-50">Join</h2><ul className="list-unstyled small">{roles.map((role) => <li key={role.accountRole}><button className="btn btn-link link-light link-underline-opacity-0 p-0" type="button" onClick={() => openSignup(role.accountRole)}>{role.accountRole === 'academy' ? 'Academy / Club' : role.accountRole === 'agent' ? 'Agent / Scout' : role.accountRole === 'coach' ? 'Coach / Manager' : 'Player'}</button></li>)}</ul></div>
            <div className="col-12 col-sm-6 col-lg-3"><h2 className="h6 text-uppercase text-white-50">World Clock</h2><div className="d-flex flex-column gap-1 small">{worldClocks.map(([city, zone]) => <div className="d-flex justify-content-between gap-2" key={zone}><span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{city}</span><span className="fw-semibold font-monospace">{new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(clockNow)}</span></div>)}</div></div>
          </div>
          <hr className="border-light opacity-25" />
          <p className="small mb-2 fw-bold" style={{ maxWidth: '70ch' }}>SportBridge connects players, academies, agents, scouts and coaches, but is not a party to any agreement between them and does not process payments between users. License numbers, verifying bodies and other credentials shown on profiles are self-reported unless marked with a Verified badge. Always independently verify who you are dealing with, and never send money to arrange a trial or introduction.</p>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2"><p className="small mb-0 text-white-50">&copy; {new Date().getFullYear()} SportBridge. All rights reserved.</p><a href="#home" className="small link-light link-underline-opacity-0">Back to top <i className="bi bi-arrow-up-short" aria-hidden="true" /></a></div>
        </div>
      </footer>

      {authOpen && <div className="sb-auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false) }}>
        <section aria-labelledby="auth-heading" aria-modal="true" className="auth-panel" role="dialog">
          <button aria-label="Close" className="modal-close" onClick={() => setAuthOpen(false)} type="button">×</button>
          <p className="eyebrow">Join the network</p><h2 id="auth-heading">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === 'signup' && <><label>Full name<input autoComplete="name" name="full_name" required /></label><label>Your role<select defaultValue={signupRole} name="role"><option value="player">Player</option><option value="coach">Coach</option><option value="agent">Agent / Scout</option><option value="academy">Academy / Club</option></select></label></>}
            <label>Email<input autoComplete="email" name="email" required type="email" /></label>
            <label>Password<input autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength="8" name="password" required type="password" /></label>
            {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
            <button className="button button-dark button-wide" disabled={authBusy || !hasSupabaseConfig} type="submit">{authBusy ? 'Please wait...' : authMode === 'signup' ? 'Create account' : 'Sign in'}</button>
          </form>
          <p className="auth-switch">{authMode === 'signup' ? 'Already part of the network?' : 'New to SportBridge?'} <button onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setAuthMessage('') }} type="button">{authMode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>
        </section>
      </div>}
    </div>
  )
}

export default App