/**
 * TryoutsPage.jsx — Public tryouts/opportunities board.
 * Shows open tryouts with fee warnings, anti-scam banner.
 * Mobile: bottom-sheet filter drawer.
 */

import { useEffect, useRef, useState } from 'react'
import { FOOTBALL_POSITIONS, AGE_GROUPS, REGIONS } from './lib/features'

function SkeletonCard() {
  return (
    <div className="card p-4" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {[70, 40, 90, 55, 35].map((w, i) => (
        <div key={i} className="rounded mb-2" style={{ height: i === 0 ? 18 : 12, width: `${w}%`, background: 'var(--bs-border-color)' }} />
      ))}
    </div>
  )
}

const BLANK = { q: '', position: '', ageGroup: '', region: '', gender: '', freeOnly: false }

export default function TryoutsPage({ supabase, user, onSignup }) {
  const [tryouts,    setTryouts]   = useState([])
  const [loading,    setLoading]   = useState(true)
  const [total,      setTotal]     = useState(null)
  const [filters,    setFilters]   = useState(BLANK)
  const [drawerOpen, setDrawerOpen]= useState(false)
  const drawerRef = useRef(null)

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
        .from('opportunities')
        .select('id, title, position, age_group, region, venue, tryout_date, gender, description, fee_amount, fee_breakdown, status, is_fee_flagged, created_at, posted_by, profiles!inner(full_name, verification_status)', { count: 'exact' })
        .eq('status', 'open')
        .eq('is_fee_flagged', false)

      if (filters.position) q = q.eq('position', filters.position)
      if (filters.ageGroup) q = q.eq('age_group', filters.ageGroup)
      if (filters.region)   q = q.ilike('region', `%${filters.region}%`)
      if (filters.gender)   q = q.eq('gender', filters.gender)
      if (filters.freeOnly) q = q.eq('fee_amount', 0)
      if (filters.q)        q = q.ilike('title', `%${filters.q}%`)

      q = q.order('tryout_date', { ascending: true, nullsFirst: false }).limit(60)
      const { data, count, error } = await q
      if (!alive) return
      if (!error) { setTryouts(data ?? []); setTotal(count ?? data?.length ?? 0) }
      setLoading(false)
    }
    run()
    return () => { alive = false }
  }, [filters, supabase])

  const upd   = (f) => (v) => setFilters((d) => ({ ...d, [f]: v }))
  const reset = () => setFilters(BLANK)
  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'freeOnly' ? Boolean(v) : v).length

  const filterPanel = (
    <div className="row g-2">
      <div className="col-12 col-md-4 col-lg-3">
        <div className="input-group input-group-sm">
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input className="form-control" type="search" placeholder="Search tryouts…" value={filters.q} onChange={(e) => upd('q')(e.target.value)} />
        </div>
      </div>
      <div className="col-6 col-md-2">
        <select className="form-select form-select-sm" value={filters.position} onChange={(e) => upd('position')(e.target.value)}>
          <option value="">All positions</option>
          {FOOTBALL_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-2">
        <select className="form-select form-select-sm" value={filters.ageGroup} onChange={(e) => upd('ageGroup')(e.target.value)}>
          <option value="">All ages</option>
          {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-2">
        <select className="form-select form-select-sm" value={filters.region} onChange={(e) => upd('region')(e.target.value)}>
          <option value="">All regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-2">
        <select className="form-select form-select-sm" value={filters.gender} onChange={(e) => upd('gender')(e.target.value)}>
          <option value="">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>
      <div className="col-auto d-flex align-items-center gap-3">
        <div className="form-check form-switch mb-0">
          <input className="form-check-input" type="checkbox" id="tryout-free" checked={filters.freeOnly} onChange={(e) => upd('freeOnly')(e.target.checked)} />
          <label className="form-check-label small fw-semibold" htmlFor="tryout-free">Free only</label>
        </div>
        {activeCount > 0 && (
          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={reset}>Reset</button>
        )}
      </div>
    </div>
  )

  return (
    <div className="container py-5" id="tryouts-page">
      {/* Anti-scam banner — always visible */}
      <div className="alert d-flex gap-3 align-items-start mb-4"
        style={{ background: 'rgba(220,53,69,.08)', border: '1.5px solid rgba(220,53,69,.3)', borderRadius: 8 }}>
        <i className="bi bi-exclamation-triangle-fill text-danger flex-shrink-0 fs-5 mt-1" aria-hidden="true" />
        <div>
          <strong className="d-block mb-1">⚠️ SportBridge Anti-Scam Guarantee</strong>
          <span className="small">
            SportBridge <strong>never charges tryout fees</strong>. Any opportunity asking you to &ldquo;pay to be selected&rdquo; or offering &ldquo;guaranteed selection&rdquo; is a scam.
            All paid tryouts are reviewed by our team. Pay only at the venue, with a receipt.{' '}
            <button className="btn btn-link p-0 small" type="button" onClick={() => user ? null : onSignup?.()}>
              Report a suspicious post
            </button>
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <span className="text-uppercase small fw-semibold text-muted">Tryout Opportunities</span>
        <h1 className="h2 fw-bold mb-1" style={{ color: 'var(--fc-blue-700)' }}>Open Tryouts</h1>
        <p className="text-muted mb-0">Find tryouts by position, age group and region. All posts are reviewed. Free tryouts are marked clearly.</p>
      </div>

      {/* Desktop sticky filter bar */}
      <div className="d-none d-md-block sb-filter-bar mb-4 py-3">{filterPanel}</div>

      {/* Mobile filter button */}
      <div className="d-md-none mb-3">
        <div className="d-flex gap-2">
          <div className="flex-grow-1">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-search" /></span>
              <input className="form-control" type="search" placeholder="Search…" value={filters.q} onChange={(e) => upd('q')(e.target.value)} />
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
      <div ref={drawerRef} className={`sb-drawer d-md-none${drawerOpen ? '' : ' is-closed'}`} role="dialog" aria-label="Tryout filters">
        <div className="sb-drawer-handle" />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 fw-bold mb-0">Filter Tryouts</h2>
          <button className="btn btn-link p-0 text-muted" type="button" onClick={() => setDrawerOpen(false)}><i className="bi bi-x-lg" /></button>
        </div>
        {filterPanel}
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary flex-fill" type="button" onClick={() => setDrawerOpen(false)}>Show {total ?? ''} results</button>
          <button className="btn btn-outline-secondary" type="button" onClick={reset}>Reset</button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-3">
        <span className="small text-muted">{loading ? 'Loading…' : `${total ?? 0} tryout${total !== 1 ? 's' : ''} found`}</span>
      </div>

      {!supabase && <div className="alert alert-warning">Database not configured — tryouts unavailable.</div>}

      {loading ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {Array.from({ length: 6 }).map((_, i) => <div className="col" key={i}><SkeletonCard /></div>)}
        </div>
      ) : tryouts.length === 0 ? (
        <div className="fc-empty-state">
          <i className="bi bi-calendar2-week display-4 text-muted d-block mb-3" />
          <h3 className="h5">No tryouts match your filters</h3>
          <p className="text-muted">Try adjusting position, region or turning off free-only.</p>
          <button className="btn btn-outline-primary" type="button" onClick={reset}>Clear filters</button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {tryouts.map((t) => {
            const isFree     = (t.fee_amount ?? 0) === 0
            const daysAway   = t.tryout_date ? Math.ceil((new Date(t.tryout_date) - new Date()) / 86400000) : null
            const posterName = t.profiles?.full_name ?? 'Organiser'
            const verified   = t.profiles?.verification_status === 'verified'

            return (
              <div className="col" key={t.id}>
                <article className="card h-100 p-4 fc-hover">
                  {/* Date badge */}
                  {daysAway != null && (
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className={`badge ${daysAway <= 7 ? 'text-bg-danger' : daysAway <= 14 ? 'text-bg-warning' : 'text-bg-info'}`}>
                        {daysAway <= 0 ? 'Today!' : `${daysAway} days away`}
                      </span>
                      <span className="small text-muted">{new Date(t.tryout_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}

                  <h2 className="h5 mb-1">{t.title}</h2>

                  {/* Tags */}
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {t.position && <span className="badge text-bg-primary" style={{ fontSize: 10 }}>{t.position}</span>}
                    {t.age_group && <span className="badge text-bg-secondary" style={{ fontSize: 10 }}>{t.age_group}</span>}
                    {t.gender && t.gender !== 'mixed' && <span className="badge text-bg-light text-dark" style={{ fontSize: 10, textTransform: 'capitalize' }}>{t.gender}</span>}
                    <span className={`badge ${isFree ? 'text-bg-success' : 'text-bg-warning text-dark'}`} style={{ fontSize: 10 }}>
                      {isFree ? 'Free' : `₦${(t.fee_amount).toLocaleString()} fee`}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2 small text-muted mb-2">
                    {t.region && <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{t.region}</span>}
                    {t.venue  && <span><i className="bi bi-building me-1" aria-hidden="true" />{t.venue}</span>}
                  </div>

                  {/* Fee breakdown for paid tryouts */}
                  {!isFree && t.fee_breakdown && (
                    <div className="alert alert-warning py-2 small mb-2">
                      <i className="bi bi-info-circle me-1" />
                      <strong>Fee breakdown:</strong> {t.fee_breakdown}
                    </div>
                  )}

                  <p className="small text-muted mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.description}
                  </p>

                  {/* Organiser */}
                  <div className="d-flex align-items-center gap-2 mt-auto pt-2 border-top">
                    <i className="bi bi-person-circle text-muted" aria-hidden="true" />
                    <span className="small text-muted">{posterName}</span>
                    {verified && (
                      <span className="badge text-bg-success ms-auto" style={{ fontSize: 10 }}>
                        <i className="bi bi-patch-check-fill me-1" />Verified
                      </span>
                    )}
                  </div>

                  <button
                    className="btn btn-primary btn-sm w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
                    type="button"
                    onClick={() => user ? null : onSignup?.('player')}
                  >
                    <i className="bi bi-send-check-fill" aria-hidden="true" />
                    {user ? 'Express interest' : 'Sign in to apply'}
                  </button>
                </article>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
