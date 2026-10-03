import { useEffect, useState } from 'react'
import './App.css'
import basketballImage from '../../public/img/basketball.jpg'
import basketballCourtImage from '../../public/img/basketball-court.jpg'
import connectedCitiesImage from '../../public/img/connected-cities.jpeg'
import ballImage from '../../public/img/fifa-world-cup-ball.avif'
import footballImage from '../../public/img/football-stadium.jpg'
import footballStandImage from '../../public/img/football-stadium1.jpg'
import logoMark from '../../public/img/logo-mark.svg'
import { supabase } from './lib/supabase'

const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
const sections = [
  { id: 'players', label: 'Players' },
  { id: 'jobs', label: 'Opportunities' },
]
const roles = [
  { icon: 'bi-person-arms-up', accountRole: 'player', mark: '01', title: 'For players', short: 'Players', description: 'Create a free profile with photos, highlight videos and your CV. Go public and get discovered, no academy required.' },
  { icon: 'bi-building', accountRole: 'academy', mark: '02', title: 'For clubs & academies', short: 'Clubs & Academies', description: 'Build player profiles, manage teams, and post coaching or scouting vacancies to reach the right people.' },
  { icon: 'bi-binoculars', accountRole: 'agent', mark: '03', title: 'For agents & scouts', short: 'Agents & Scouts', description: 'Search players by position, age and nationality, build a watchlist, and request access to full profiles.' },
  { icon: 'bi-briefcase', accountRole: 'coach', mark: '04', title: 'For coaches & sporting directors', short: 'Coaches', description: 'Browse open roles across academies and clubs, and apply directly with your CV and badges.' },
]

function App() {
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

  const openSignup = (role = 'player') => {
    setSignupRole(role)
    setAuthOpen(true)
    setAuthMode('signup')
    setAuthMessage('')
  }

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
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
    }
  }

  return (
    <div className="site-shell">
      <header className="topbar" id="home">
        <a className="wordmark" href="#home" aria-label="SportBridge home"><img alt="" height="28" src={logoMark} width="28" /><span>Sport<span>Bridge</span></span></a>
        <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} type="button"><span /><span /><span /></button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <a href="#players" onClick={() => setMenuOpen(false)}>Players</a>
          <a href="#opportunities" onClick={() => { setSection('jobs'); setMenuOpen(false) }}>Jobs</a>
          <a href="#roles" onClick={() => setMenuOpen(false)}>Who it’s for</a>
        </nav>
        <div className="account-actions">
          {user
            ? <button className="button button-quiet" onClick={() => supabase?.auth.signOut()} type="button">Sign out</button>
            : <button className="button button-outline" onClick={() => { setAuthOpen(true); setAuthMode('signin'); setAuthMessage('') }} type="button">Sign in</button>}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-photo" role="img" aria-label="Connected sports cities" style={{ backgroundImage: `url(${connectedCitiesImage})` }} />
          <div className="hero-content">
            <div className="hero-copy">
              <p className="hero-badge"><span aria-hidden="true">◎</span> Trusted by clubs, academies and agencies worldwide</p>
              <h1>Connecting Sports talent with the people who build careers.</h1>
              <p className="hero-text">Players build a free profile. Academies and clubs showcase squads and post jobs. Agents and scouts discover talent. Coaches and sporting directors find their next move. Every stakeholder in the game, connected.</p>
              <div className="hero-actions">
                <button className="button button-gold" onClick={() => openSignup()} type="button">Get started <span aria-hidden="true">→</span></button>
                <a className="button button-outline" href="#players">Browse players</a>
              </div>
              <div className="hero-stats">
                <div><strong>500+</strong><span>Player profiles</span></div>
                <div><strong>120+</strong><span>Academies & clubs</span></div>
                <div><strong>40+</strong><span>Countries reached</span></div>
              </div>
            </div>
            <div className="hero-roles" aria-label="Who SportBridge connects">
              {roles.map((role) => <article className="hero-role-card" key={role.mark}><span className={`role-icon ${role.mark === '01' ? 'gold' : ''}`}><i aria-hidden="true" className={`bi ${role.icon}`} /></span><span className="hero-role-copy"><strong>{role.short}</strong><small>{role.mark === '01' ? 'Free profile. Get discovered.' : role.mark === '02' ? 'Showcase your squad to the world.' : role.mark === '03' ? 'Scout the next generation.' : 'Land your next role.'}</small></span></article>)}
            </div>
          </div>
        </section>

        <section className="roles-section" id="roles">
          <div className="section-heading"><div><p className="eyebrow">One platform, every side of the game</p><h2>One platform, every side of the game</h2></div><p>Purpose-built tools for players, clubs, agents, scouts, coaches and sporting directors alike.</p></div>
          <div className="role-grid">{roles.map((role) => <article className="role-item" key={role.mark}><span className={`role-icon ${role.mark === '01' ? 'gold' : ''}`}><i aria-hidden="true" className={`bi ${role.icon}`} /></span><h3>{role.title}</h3><p>{role.description}</p><button className="role-action" onClick={() => openSignup(role.accountRole)} type="button">{role.mark === '01' ? 'Create your player profile' : role.mark === '02' ? 'Register your academy' : role.mark === '03' ? 'Register as an agent' : 'Register as a coach'} <span aria-hidden="true">↗</span></button></article>)}</div>
        </section>

        <section className="visual-section" aria-labelledby="visual-heading">
          <div className="section-heading"><div><p className="eyebrow">Built for the game</p><h2 id="visual-heading">A connected sporting world</h2></div><p>From the pitch to the next opportunity.</p></div>
          <div className="visual-grid">
            <figure className="visual-main"><img src={footballImage} alt="Football stadium ready for a match" loading="lazy" /><figcaption>Find your next stage</figcaption></figure>
            <figure><img src={footballStandImage} alt="Football stadium viewed from the stands" loading="lazy" /><figcaption>Make your move</figcaption></figure>
            <figure><img src={ballImage} alt="Football ready for kickoff" loading="lazy" /><figcaption>Every level. Every ambition.</figcaption></figure>
          </div>
          <div className="sport-strip"><img src={basketballImage} alt="Basketball on court" loading="lazy" /><img src={basketballCourtImage} alt="Basketball court" loading="lazy" /></div>
        </section>

        <section className="directory" id="players" aria-labelledby="directory-heading">
          <div className="directory-heading">
            <div><p className="eyebrow">Explore SportBridge</p><h2 id="directory-heading">{section === 'players' ? 'Player directory' : 'Open opportunities'}</h2></div>
            <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search listings" onChange={(event) => setSearch(event.target.value)} placeholder={section === 'players' ? 'Name, position, country' : 'Role, club, keyword'} type="search" value={search} /></label>
          </div>
          <div className="directory-tabs" id="opportunities" role="tablist" aria-label="Browse listings">
            {sections.map((item) => <button aria-selected={section === item.id} className={section === item.id ? 'directory-tab selected' : 'directory-tab'} key={item.id} onClick={() => { setSection(item.id); setSearch(''); setRecords([]); setRecordError(''); setLoading(Boolean(supabase)) }} role="tab" type="button">{item.label}</button>)}
            <span className="connection-state"><span className={`connection-dot ${connection}`} />{connection === 'ready' ? 'Live listings' : connection === 'checking' ? 'Connecting' : 'Listings unavailable'}</span>
          </div>

          {recordError && <p className="inline-error" role="status">Could not load listings: {recordError}</p>}
          {loading
            ? <div className="empty-state">Loading {section === 'players' ? 'players' : 'opportunities'}...</div>
            : visibleRecords.length
              ? <div className="listing-grid">{visibleRecords.map((record) => <article className="listing" key={record.id}>
                  <div className="listing-topline"><span className="listing-kind">{section === 'players' ? record.position || 'Player' : 'Open role'}</span><span aria-hidden="true">↗</span></div>
                  <h3>{section === 'players' ? record.display_name || 'Player profile' : record.title}</h3>
                  <p className="listing-meta">{section === 'players' ? [record.country, record.age ? `${record.age} years` : null].filter(Boolean).join(' · ') || 'Profile available' : record.clubs?.name || 'Club opportunity'}</p>
                  <p className="listing-description">{record.bio || record.description || 'More details will be shared by the profile owner.'}</p>
                </article>)}</div>
              : <div className="empty-state"><span className="empty-index">{connection === 'missing' || connection === 'error' ? '01' : '02'}</span><div>
                  <h3>{connection === 'missing' ? 'Connect the live directory' : recordError ? 'The directory needs attention' : 'The next opportunity starts here'}</h3>
                  <p>{connection === 'missing' ? 'Add the Supabase project URL and public anon key to Netlify to load live SportBridge listings.' : recordError ? 'Check the Supabase project key, database schema and public read policies.' : 'There are no listings here yet. Sign in to create your profile and make your next move.'}</p>
                </div></div>}
        </section>

        <section className="closing-band"><div><p className="eyebrow">Your next move starts here</p><h2>Talent deserves a bridge.</h2><p>Join the network connecting ambition with opportunity across the game.</p></div><button className="button button-gold" onClick={() => openSignup()} type="button">Create your free account <span aria-hidden="true">→</span></button></section>
        <footer className="site-footer"><a className="footer-brand" href="#home">SportBridge</a><span>Football · Basketball · Opportunity</span><span className="footer-year">© 2026 SportBridge</span></footer>
      </main>

      {authOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false) }}>
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