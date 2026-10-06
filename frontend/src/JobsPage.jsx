/**
 * JobsPage.jsx — Public jobs board with full filter bar.
 * Desktop: sticky top filter bar.
 * Mobile: "Filters" button opens bottom-sheet drawer.
 */

import { useEffect, useRef, useState } from 'react'
import { FOOTBALL_POSITIONS, AGE_GROUPS, REGIONS, STAFF_ROLES } from './lib/features'

// ─── helpers ──────────────────────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <span className="badge text-bg-success d-inline-flex align-items-center gap-1" style={{ fontSize: 11 }}>
      <i className="bi bi-patch-check-fill" aria-hidden="true" />Verified Club
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {[60, 40, 80, 50].map((w, i) => (
        <div key={i} className="rounded mb-2" style={{ height: i === 0 ? 18 : 12, width: `${w}%`, background: 'var(--bs-border-color)' }} />
      ))}
    </div>
  )
}

const BLANK = {
  q:          '',
  jobType:    '',   // player_needed | staff_needed
  position:   '',
  staffRole:  '',
  ageGroup:   '',
  region:     '',
  verifiedOnly: false,
}

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest first'   },
  { value: 'salary',   label: 'Highest salary'  },
  { value: 'verified', label: 'Verified clubs first' },
]

// ─── component ────────────────────────────────────────────────────────────────
export default function JobsPage({ supabase, user, onSignup }) {
  const [jobs,        setJobs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [total,       setTotal]       = useState(null)
  const [filters,     setFilters]     = useState(BLANK)
  const [sort,        setSort]        = useState('newest')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const drawerRef = useRef(null)

  // close drawer on outside click / Escape
  useEffect(() => {
    const click = (e) => { if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) setDrawerOpen(false) }
    const key   = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('mousedown', click)
    window.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', click); window.removeEventListener('keydown', key) }
  }, [drawerOpen])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let alive = true
    setLoading(true)

    const run = async () => {
      let q = supabase
        .from('jobs')
        .select('id, title, description, job_type, player_position, staff_role, age_group, region, budget, salary, free_agent_only, is_verified, status, created_at, club_id, clubs(id, name, verified_badge, country, state, logo_path)', { count: 'exact' })
        .eq('status', 'open')

      if (filters.jobType)   q = q.eq('job_type', filters.jobType)
      if (filters.position)  q = q.eq('player_position', filters.position)
      if (filters.staffRole) q = q.eq('staff_role', filters.staffRole)
      if (filters.ageGroup)  q = q.eq('age_group', filters.ageGroup)
      if (filters.region)    q = q.ilike('region', `%${filters.region}%`)
      if (filters.verifiedOnly) q = q.eq('clubs.verified_badge', true)
      if (filters.q)         q = q.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)

      if (sort === 'newest')   q = q.order('created_at', { ascending: false })
      else if (sort === 'salary') q = q.order('salary', { ascending: false, nullsFirst: false })

      q = q.limit(60)
      const { data, count, error } = await q
      if (!alive) return
      if (!error) { setJobs(data ?? []); setTotal(count ?? data?.length ?? 0) }
      setLoading(false)
    }
    run()
    return () => { alive = false }
  }, [filters, sort, supabase])

  const upd = (field) => (val) => setFilters((f) => ({ ...f, [field]: val }))
  const reset = () => setFilters(BLANK)
  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'verifiedOnly' ? Boolean(v) : v).length

  const filterPanel = (
    <div className="row g-2">
      <div className="col-12 col-md-4 col-lg-3">
        <div className="input-group input-group-sm">
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input className="form-control" type="search" placeholder="Search jobs…" value={filters.q} onChange={(e) => upd('q')(e.target.value)} />
        </div>
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <select className="form-select form-select-sm" value={filters.jobType} onChange={(e) => upd('jobType')(e.target.value)} aria-label="Job type">
          <option value="">All types</option>
          <option value="player_needed">Player Needed</option>
          <option value="staff_needed">Staff Needed</option>
        </select>
      </div>
      {filters.jobType !== 'staff_needed' && (
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select form-select-sm" value={filters.position} onChange={(e) => upd('position')(e.target.value)} aria-label="Position">
            <option value="">All positions</option>
            {FOOTBALL_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      )}
      {filters.jobType === 'staff_needed' && (
        <div className="col-6 col-md-3 col-lg-2">
          <select className="form-select form-select-sm" value={filters.staffRole} onChange={(e) => upd('staffRole')(e.target.value)} aria-label="Staff role">
            <option value="">All roles</option>
            {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}
      <div className="col-6 col-md-2 col-lg-2">
        <select className="form-select form-select-sm" value={filters.ageGroup} onChange={(e) => upd('ageGroup')(e.target.value)} aria-label="Age group">
          <option value="">All ages</option>
          {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-2 col-lg-2">
        <select className="form-select form-select-sm" value={filters.region} onChange={(e) => upd('region')(e.target.value)} aria-label="Region">
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-2 col-lg-1">
        <select className="form-select form-select-sm" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="col-auto d-flex align-items-center gap-3">
        <div className="form-check form-switch mb-0">
          <input className="form-check-input" type="checkbox" id="jobs-verified" checked={filters.verifiedOnly} onChange={(e) => upd('verifiedOnly')(e.target.checked)} />
          <label className="form-check-label small fw-semibold" htmlFor="jobs-verified">Verified clubs</label>
        </div>
        {activeCount > 0 && (
          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={reset}>Reset</button>
        )}
      </div>
    </div>
  )

  return (
    <div className="container py-5" id="jobs-page">
      {/* Header */}
      <div className="mb-4">
        <span className="text-uppercase small fw-semibold text-muted">Opportunities</span>
        <h1 className="h2 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>Football Job Board</h1>
        <p className="text-muted mb-0">Player positions and staff roles posted by verified clubs and academies across Nigeria.</p>
      </div>

      {/* Desktop sticky filter bar */}
      <div className="d-none d-md-block sb-filter-bar mb-4 py-3 px-0">
        {filterPanel}
      </div>

      {/* Mobile filter controls */}
      <div className="d-md-none mb-3">
        <div className="d-flex gap-2">
          <div className="flex-grow-1">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-search" /></span>
              <input className="form-control" type="search" placeholder="Search jobs…" value={filters.q} onChange={(e) => upd('q')(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 flex-shrink-0" type="button" onClick={() => setDrawerOpen(true)}>
            <i className="bi bi-sliders" />
            Filters
            {activeCount > 0 && <span className="badge text-bg-primary ms-1" style={{ fontSize: 10 }}>{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile bottom-sheet */}
      {drawerOpen && <div className="sb-drawer-overlay d-md-none" onClick={() => setDrawerOpen(false)} />}
      <div ref={drawerRef} className={`sb-drawer d-md-none${drawerOpen ? '' : ' is-closed'}`} role="dialog" aria-label="Job filters">
        <div className="sb-drawer-handle" />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 fw-bold mb-0">Filter Jobs</h2>
          <button className="btn btn-link p-0 text-muted" type="button" onClick={() => setDrawerOpen(false)}><i className="bi bi-x-lg" /></button>
        </div>
        {filterPanel}
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary flex-fill" type="button" onClick={() => setDrawerOpen(false)}>
            Show {total ?? ''} results
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={reset}>Reset</button>
        </div>
      </div>

      {/* Results count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="small text-muted">
          {loading ? 'Loading…' : `${total ?? 0} job${total !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {!supabase && <div className="alert alert-warning">Database not configured — job board unavailable.</div>}

      {/* Job cards */}
      {loading ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {Array.from({ length: 6 }).map((_, i) => <div className="col" key={i}><SkeletonCard /></div>)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="fc-empty-state">
          <i className="bi bi-briefcase display-4 text-muted d-block mb-3" />
          <h3 className="h5">No jobs match your filters</h3>
          <p className="text-muted">Try adjusting position, region or removing the verified-only filter.</p>
          <button className="btn btn-outline-primary" type="button" onClick={reset}>Clear filters</button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {jobs.map((job) => {
            const isPlayer = job.job_type === 'player_needed'
            const roleText = isPlayer ? job.player_position : job.staff_role
            const pay      = isPlayer ? job.budget : job.salary
            const club     = job.clubs

            return (
              <div className="col" key={job.id}>
                <article className="card h-100 p-4 fc-hover" style={{ cursor: 'default' }}>
                  {/* Club header */}
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40, background: 'var(--fc-gradient-primary)' }}>
                      <i className="bi bi-building text-white" style={{ fontSize: 18 }} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="fw-bold small text-truncate" style={{ color: 'var(--fc-blue-700)' }}>
                        {club?.name ?? 'Club'}
                      </div>
                      {club?.verified_badge && <VerifiedBadge />}
                    </div>
                  </div>

                  {/* Job type badge */}
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    <span className={`badge ${isPlayer ? 'text-bg-primary' : 'text-bg-secondary'}`} style={{ fontSize: 10 }}>
                      {isPlayer ? 'Player Needed' : 'Staff Needed'}
                    </span>
                    {job.age_group && <span className="badge text-bg-light text-dark" style={{ fontSize: 10 }}>{job.age_group}</span>}
                    {job.free_agent_only && <span className="badge text-bg-warning text-dark" style={{ fontSize: 10 }}>Free agents only</span>}
                  </div>

                  <h2 className="h5 mb-1">{job.title}</h2>

                  {roleText && (
                    <div className="small fw-semibold text-primary mb-1">
                      <i className="bi bi-person-arms-up me-1" aria-hidden="true" />{roleText}
                    </div>
                  )}

                  <div className="d-flex flex-wrap gap-2 small text-muted mb-3">
                    {job.region && <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{job.region}</span>}
                    {pay > 0 && <span><i className="bi bi-cash me-1" aria-hidden="true" />₦{pay.toLocaleString()}/mo</span>}
                    <span><i className="bi bi-clock me-1" aria-hidden="true" />{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="small text-muted mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {job.description}
                  </p>

                  <div className="mt-auto">
                    <button
                      className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                      type="button"
                      onClick={() => user ? null : onSignup?.('player')}
                    >
                      <i className="bi bi-send-check-fill" aria-hidden="true" />
                      {user ? 'Apply with my profile' : 'Sign in to apply'}
                    </button>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
