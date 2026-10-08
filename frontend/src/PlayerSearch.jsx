/**
 * PlayerSearch.jsx
 * Sticky filter bar for scouts/clubs with mobile bottom-sheet drawer.
 * Emits { filters, sort } via onFilter(filters, sort) callback.
 * Renders live results if supabase prop provided.
 */

import { useEffect, useRef, useState } from 'react'
import { FOOTBALL_POSITIONS, AGE_GROUPS, REGIONS } from './lib/features'

// ─── constants ────────────────────────────────────────────────────────────────
const NATIONALITIES = [
  'Nigerian','Ghanaian','South African','Kenyan','Egyptian','Senegalese',
  "Ivorian",'Cameroonian','Moroccan','English','French','German','Spanish',
  'Portuguese','Italian','Brazilian','Argentine','American','Japanese','Other',
]
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest'             },
  { value: 'most_viewed',label: 'Most Viewed'        },
  { value: 'verified',   label: 'Verified First'     },
  { value: 'complete',   label: 'Most Complete Profile'},
]
const BLANK_FILTERS = {
  position:     '',
  ageGroup:     '',
  nationality:  '',
  foot:         '',
  region:       '',
  availability: '',
  verifiedOnly: true,
  minApps:      '',
  minGoals:     '',
  q:            '',
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function FilterSelect({ id, label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="form-label small fw-semibold mb-1" htmlFor={id}>{label}</label>
      <select id={id} className="form-select form-select-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder ?? `All ${label}s`}</option>
        {options.map((o) => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SkeletonPlayerCard() {
  return (
    <div className="card p-3" aria-hidden="true" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
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

// ─── Active filter pills ───────────────────────────────────────────────────────
function ActiveFilters({ filters, onRemove }) {
  const entries = Object.entries(filters).filter(([k, v]) => {
    if (k === 'verifiedOnly') return v === true
    if (k === 'q') return Boolean(v)
    return Boolean(v)
  })
  if (!entries.length) return null
  return (
    <div className="d-flex flex-wrap gap-1 mt-2" aria-label="Active filters">
      {entries.map(([k, v]) => (
        <button
          key={k} type="button"
          className="btn btn-sm d-inline-flex align-items-center gap-1 px-2 py-1"
          style={{ background: 'var(--fc-blue-100)', color: 'var(--fc-blue-700)', border: '1px solid rgba(27,84,214,.25)', fontSize: 12, borderRadius: 20 }}
          onClick={() => onRemove(k)}
          aria-label={`Remove filter: ${k}`}
        >
          {k === 'verifiedOnly' ? 'Verified Only' : k === 'q' ? `"${v}"` : v}
          <i className="bi bi-x" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function PlayerSearch({ supabase, onPlayerClick }) {
  const [filters,       setFilters]       = useState(BLANK_FILTERS)
  const [sort,          setSort]          = useState('verified')
  const [players,       setPlayers]       = useState([])
  const [loading,       setLoading]       = useState(false)
  const [totalCount,    setTotalCount]    = useState(null)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const drawerRef = useRef(null)

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [drawerOpen])

  // Close drawer on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Fetch players whenever filters/sort change
  useEffect(() => {
    if (!supabase) return
    let alive = true
    setLoading(true)

    const run = async () => {
      let q = supabase
        .from('players')
        .select('id, display_name, position, age, country, nationality, region, availability, preferred_foot, foot, height_cm, current_club, age_group, stats, primary_photo_path, profiles!inner(verification_status)', { count: 'exact' })
        .eq('is_public', true)
        .eq('status', 'active')

      if (filters.position)     q = q.eq('position', filters.position)
      if (filters.ageGroup)     q = q.eq('age_group', filters.ageGroup)
      if (filters.nationality)  q = q.ilike('nationality', `%${filters.nationality}%`)
      if (filters.foot)         q = q.eq('preferred_foot', filters.foot)
      if (filters.region)       q = q.ilike('region', `%${filters.region}%`)
      if (filters.availability) q = q.eq('availability', filters.availability)
      if (filters.verifiedOnly) q = q.eq('profiles.verification_status', 'verified')
      if (filters.q)            q = q.or(`display_name.ilike.%${filters.q}%,current_club.ilike.%${filters.q}%`)

      // Sort
      if (sort === 'newest')      q = q.order('created_at', { ascending: false })
      else if (sort === 'most_viewed') q = q.order('views_count', { ascending: false })
      else if (sort === 'verified')    q = q.order('profiles(verification_status)', { ascending: true })
      else                             q = q.order('created_at', { ascending: false })

      q = q.limit(60)
      const { data, count, error } = await q
      if (!alive) return
      if (!error) { setPlayers(data ?? []); setTotalCount(count ?? data?.length ?? 0) }
      setLoading(false)
    }
    run()
    return () => { alive = false }
  }, [filters, sort, supabase])

  const upd = (field) => (val) => setFilters((f) => ({ ...f, [field]: val }))
  const removeFilter = (key) => setFilters((f) => ({ ...f, [key]: key === 'verifiedOnly' ? false : '' }))
  const resetAll = () => setFilters(BLANK_FILTERS)

  // Count active (non-default) filters for the badge on the mobile Filters button
  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'verifiedOnly') return v === true  // default is true so it counts
    if (k === 'q') return Boolean(v)
    return Boolean(v)
  }).length

  const filterPanel = (
    <div className="row g-3">
      {/* Text search */}
      <div className="col-12 col-md-6 col-lg-3">
        <label className="form-label small fw-semibold mb-1" htmlFor="player-search-q">Search</label>
        <div className="input-group input-group-sm">
          <span className="input-group-text"><i className="bi bi-search" /></span>
          <input
            id="player-search-q" className="form-control" type="search"
            placeholder="Name or former club"
            value={filters.q}
            onChange={(e) => upd('q')(e.target.value)}
          />
        </div>
      </div>

      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-position" label="Position" value={filters.position} onChange={upd('position')}
          options={FOOTBALL_POSITIONS} />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-agegroup" label="Age Group" value={filters.ageGroup} onChange={upd('ageGroup')}
          options={AGE_GROUPS} />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-nationality" label="Nationality" value={filters.nationality} onChange={upd('nationality')}
          options={NATIONALITIES} />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-foot" label="Preferred Foot" value={filters.foot} onChange={upd('foot')}
          options={[{ value:'left',label:'Left'},{ value:'right',label:'Right'},{ value:'both',label:'Both'}]} />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-region" label="Region" value={filters.region} onChange={upd('region')}
          options={REGIONS} />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-avail" label="Availability" value={filters.availability} onChange={upd('availability')}
          options={[
            { value:'available_now',      label:'Available Now'     },
            { value:'available_jan_2026', label:'Available Jan 2026'},
            { value:'available_jul_2026', label:'Available Jul 2026'},
            { value:'under_contract',     label:'Under Contract'    },
          ]} />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <label className="form-label small fw-semibold mb-1" htmlFor="f-minapps">Min Apps</label>
        <input id="f-minapps" className="form-control form-control-sm" type="number" min="0"
          value={filters.minApps} onChange={(e) => upd('minApps')(e.target.value)} placeholder="0" />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <label className="form-label small fw-semibold mb-1" htmlFor="f-mingoals">Min Goals</label>
        <input id="f-mingoals" className="form-control form-control-sm" type="number" min="0"
          value={filters.minGoals} onChange={(e) => upd('minGoals')(e.target.value)} placeholder="0" />
      </div>
      <div className="col-6 col-md-3 col-lg-2">
        <FilterSelect id="f-sort" label="Sort by" value={sort} onChange={setSort} options={SORT_OPTIONS} placeholder="Sort by…" />
      </div>

      {/* Verified Only toggle */}
      <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">
        <div className="form-check form-switch mb-0">
          <input
            className="form-check-input" type="checkbox" id="f-verified"
            checked={filters.verifiedOnly}
            onChange={(e) => upd('verifiedOnly')(e.target.checked)}
          />
          <label className="form-check-label fw-semibold small" htmlFor="f-verified">
            <i className="bi bi-patch-check-fill text-success me-1" aria-hidden="true" />
            Verified Only
          </label>
        </div>
      </div>

      {/* Reset */}
      <div className="col-12 col-md-auto d-flex align-items-end">
        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={resetAll}>
          Reset filters
        </button>
      </div>
    </div>
  )

  return (
    <div>
      {/* ── Desktop sticky filter bar ─────────────────────────────────── */}
      <div
        className="d-none d-md-block bg-body border-bottom mb-4 py-3 px-0"
        style={{ position: 'sticky', top: 64, zIndex: 900 }}
        aria-label="Player search filters"
      >
        {filterPanel}
        <ActiveFilters filters={filters} onRemove={removeFilter} />
      </div>

      {/* ── Mobile: Filters button + bottom-sheet drawer ──────────────── */}
      <div className="d-md-none mb-3">
        <div className="d-flex gap-2 align-items-center">
          <div className="flex-grow-1">
            <div className="input-group input-group-sm">
              <span className="input-group-text"><i className="bi bi-search" /></span>
              <input className="form-control" type="search" placeholder="Search players…"
                value={filters.q} onChange={(e) => upd('q')(e.target.value)} />
            </div>
          </div>
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 flex-shrink-0"
            type="button" onClick={() => setDrawerOpen(true)}
          >
            <i className="bi bi-sliders" aria-hidden="true" />
            Filters
            {activeCount > 0 && <span className="badge text-bg-primary ms-1" style={{ fontSize: 10 }}>{activeCount}</span>}
          </button>
          <select className="form-select form-select-sm flex-shrink-0" style={{ width: 'auto' }}
            value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort players">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <ActiveFilters filters={filters} onRemove={removeFilter} />
      </div>

      {/* ── Bottom-sheet drawer (mobile) ──────────────────────────────── */}
      {drawerOpen && (
        <div
          className="position-fixed inset-0 d-md-none"
          style={{ top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.55)', zIndex: 1050 }}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        ref={drawerRef}
        className="d-md-none position-fixed start-0 end-0 bottom-0 bg-body p-4"
        style={{
          zIndex: 1060,
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -4px 32px rgba(0,0,0,.22)',
          maxHeight: '85vh',
          overflowY: 'auto',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Player filters"
      >
        {/* Drag handle */}
        <div className="d-flex justify-content-center mb-3">
          <div style={{ width: 40, height: 4, background: 'var(--bs-border-color)', borderRadius: 2 }} />
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 fw-bold mb-0">Filter Players</h2>
          <button className="btn btn-link p-0 text-muted" type="button" onClick={() => setDrawerOpen(false)}>
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>
        {filterPanel}
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary flex-fill" type="button" onClick={() => setDrawerOpen(false)}>
            Show {totalCount ?? ''} results
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={resetAll}>Reset</button>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="small text-muted">
          {loading ? 'Searching…' : totalCount != null ? `${totalCount} player${totalCount !== 1 ? 's' : ''} found` : ''}
        </span>
        {filters.verifiedOnly && (
          <span className="small d-flex align-items-center gap-1" style={{ color: 'var(--fc-blue-700)' }}>
            <i className="bi bi-patch-check-fill text-success" aria-hidden="true" />
            Showing verified players only
          </span>
        )}
      </div>

      {!supabase && (
        <div className="alert alert-warning">
          Supabase is not configured — player search is unavailable.
        </div>
      )}

      {loading ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {Array.from({ length: 6 }).map((_, i) => <div className="col" key={i}><SkeletonPlayerCard /></div>)}
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-person-lines-fill display-4 text-muted d-block mb-3" aria-hidden="true" />
          <h3 className="h5">No players match your filters</h3>
          <p className="text-muted">Try adjusting the position, region, or turning off &ldquo;Verified Only&rdquo;.</p>
          <button className="btn btn-outline-primary" type="button" onClick={resetAll}>Clear all filters</button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {players.map((p) => {
            const verified = p.profiles?.verification_status === 'verified'
            const foot     = p.preferred_foot || p.foot
            const avail    = {
              available_now:      { cls: 'text-bg-success', label: 'Available' },
              available_jan_2026: { cls: 'text-bg-warning', label: 'Jan 2026' },
              available_jul_2026: { cls: 'text-bg-warning', label: 'Jul 2026' },
              under_contract:     { cls: 'text-bg-danger',  label: 'Contracted' },
            }[p.availability] ?? { cls: 'text-bg-secondary', label: p.availability }

            return (
              <div className="col" key={p.id}>
                <article
                  className="card h-100 p-3 fc-hover"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPlayerClick?.(p.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View profile: ${p.display_name}`}
                  onKeyDown={(e) => e.key === 'Enter' && onPlayerClick?.(p.id)}
                >
                  <div className="d-flex align-items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {p.primary_photo_path
                        ? <img src={p.primary_photo_path} alt="" className="rounded-circle"
                            style={{ width: 52, height: 52, objectFit: 'cover' }} loading="lazy" />
                        : (
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 52, height: 52, background: 'var(--fc-gradient-primary)' }}>
                            <i className="bi bi-person-fill" style={{ color: '#fff', fontSize: 22 }} aria-hidden="true" />
                          </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center gap-1 flex-wrap mb-1">
                        <span className="fw-bold text-truncate" style={{ color: 'var(--fc-blue-700)' }}>{p.display_name}</span>
                        {verified && (
                          <i className="bi bi-patch-check-fill text-success flex-shrink-0" aria-label="Verified" style={{ fontSize: 14 }} />
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {p.position && (
                          <span className="badge text-bg-primary" style={{ fontSize: 10 }}>{p.position}</span>
                        )}
                        <span className={`badge ${avail.cls}`} style={{ fontSize: 10 }}>{avail.label}</span>
                        {p.age_group && (
                          <span className="badge text-bg-secondary" style={{ fontSize: 10 }}>{p.age_group}</span>
                        )}
                      </div>

                      <div className="small text-muted d-flex flex-wrap gap-2">
                        {p.nationality && (
                          <span><i className="bi bi-globe2 me-1" aria-hidden="true" />{p.nationality}</span>
                        )}
                        {p.region && (
                          <span><i className="bi bi-geo-alt me-1" aria-hidden="true" />{p.region}</span>
                        )}
                        {foot && (
                          <span><i className="bi bi-activity me-1" aria-hidden="true" />{foot.charAt(0).toUpperCase() + foot.slice(1)} foot</span>
                        )}
                        {p.current_club && (
                          <span><i className="bi bi-building me-1" aria-hidden="true" />{p.current_club}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mini stats bar */}
                  {p.stats && Object.keys(p.stats).length > 0 && (
                    <div className="d-flex gap-3 mt-2 pt-2 border-top" style={{ fontSize: 12 }}>
                      {p.stats.total_appearances != null && (
                        <span className="text-muted"><strong className="text-body">{p.stats.total_appearances}</strong> apps</span>
                      )}
                      {p.stats.total_goals != null && (
                        <span className="text-muted"><strong className="text-body">{p.stats.total_goals}</strong> goals</span>
                      )}
                      {p.stats.total_assists != null && (
                        <span className="text-muted"><strong className="text-body">{p.stats.total_assists}</strong> assists</span>
                      )}
                    </div>
                  )}
                </article>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
