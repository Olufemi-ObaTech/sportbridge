/**
 * AccessRequestsPanel.jsx
 * Shows a player their incoming access requests from agents/scouts.
 * Player can approve or deny each request.
 *
 * Props:
 *   supabase  — Supabase client
 *   user      — authenticated user
 *   player    — player record (players table row)
 *   onUpdate  — callback after approve/deny
 */

import { useEffect, useState } from 'react'

const STATUS_MAP = {
  pending:   { cls: 'text-bg-warning',   label: 'Pending',   icon: 'bi-hourglass-split'   },
  granted:   { cls: 'text-bg-success',   label: 'Approved',  icon: 'bi-check-circle-fill' },
  denied:    { cls: 'text-bg-danger',    label: 'Denied',    icon: 'bi-x-circle-fill'     },
  cancelled: { cls: 'text-bg-secondary', label: 'Cancelled', icon: 'bi-dash-circle'       },
}

export default function AccessRequestsPanel({ supabase, _user, player, onUpdate }) {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [busy,     setBusy]     = useState(null) // id of request being acted on
  const [error,    setError]    = useState('')

  useEffect(() => {
    if (!supabase || !player?.id) { setLoading(false); return }
    supabase.from('access_requests')
      .select(`id, status, created_at, responded_at, message,
               unlocker:profiles!agent_user_id(id, full_name, role, verification_status)`)
      .eq('player_id', player.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        setRequests(data ?? [])
        setLoading(false)
      })
  }, [supabase, player?.id])

  const respond = async (reqId, newStatus) => {
    setBusy(reqId); setError('')
    const { error: err } = await supabase.from('access_requests')
      .update({ status: newStatus, responded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', reqId)
    if (err) { setError(err.message); setBusy(null); return }
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: newStatus } : r))
    setBusy(null)
    onUpdate?.()

    // Send notification to the requester
    const req = requests.find((r) => r.id === reqId)
    if (req?.unlocker?.id) {
      await supabase.from('notifications').insert({
        user_id:           req.unlocker.id,
        notification_type: `access_request_${newStatus}`,
        data: {
          message: newStatus === 'granted'
            ? `Your access request has been approved. You can now message ${player.display_name || 'the player'} via the secure inbox.`
            : `Your access request has been denied by ${player.display_name || 'the player'}.`,
          player_id: player.id,
        },
      }).catch(() => {}) // non-critical
    }
  }

  if (loading) {
    return <div className="py-4 text-center text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading requests…</div>
  }

  if (error) {
    return <div className="alert alert-danger py-2 small">{error}</div>
  }

  const pending  = requests.filter((r) => r.status === 'pending')
  const previous = requests.filter((r) => r.status !== 'pending')

  return (
    <div>
      {/* Stats summary */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending', count: requests.filter(r=>r.status==='pending').length,  colour: '#f5b301', icon: 'bi-hourglass-split' },
          { label: 'Approved', count: requests.filter(r=>r.status==='granted').length, colour: '#198754', icon: 'bi-check-circle-fill' },
          { label: 'Denied',  count: requests.filter(r=>r.status==='denied').length,   colour: '#dc3545', icon: 'bi-x-circle-fill' },
          { label: 'Total',   count: requests.length,                                  colour: '#2F7DF0', icon: 'bi-shield-lock' },
        ].map(({ label, count, colour, icon }) => (
          <div className="col-6 col-sm-3" key={label}>
            <div className="card p-3 text-center h-100">
              <i className={`bi ${icon} fs-4 mb-1`} style={{ color: colour }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: colour }}>{count}</div>
              <div className="small text-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending requests */}
      {pending.length === 0 && previous.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-shield-lock fs-2 d-block mb-2" style={{ opacity: .3 }} />
          <p className="fw-semibold mb-1">No access requests yet</p>
          <p className="small">When agents or scouts request access to your profile, they will appear here. You control who can see your CV and contact details.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-4">
          <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
            <span className="badge text-bg-warning">{pending.length}</span> Pending requests
          </h3>
          {pending.map((req) => (
            <div key={req.id} className="card p-4 mb-3"
              style={{ borderLeft: '4px solid #f5b301', background: 'rgba(245,179,1,.04)' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 44, height: 44, background: '#198754', color: '#fff', fontSize: 18 }}>
                    <i className="bi bi-binoculars" />
                  </span>
                  <div>
                    <div className="fw-bold d-flex align-items-center gap-2">
                      {req.unlocker?.full_name || 'Agent / Scout'}
                      {req.unlocker?.verification_status === 'verified' && (
                        <i className="bi bi-patch-check-fill text-primary" style={{ fontSize: 14 }} />
                      )}
                    </div>
                    <div className="small text-muted text-capitalize">{req.unlocker?.role?.replace(/_/g, ' ')}</div>
                    <div className="small text-muted">
                      Requested {req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-success d-flex align-items-center gap-2"
                    type="button" disabled={busy === req.id}
                    onClick={() => respond(req.id, 'granted')}>
                    {busy === req.id ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check-lg" />}
                    Approve
                  </button>
                  <button
                    className="btn btn-outline-danger d-flex align-items-center gap-2"
                    type="button" disabled={busy === req.id}
                    onClick={() => respond(req.id, 'denied')}>
                    <i className="bi bi-x-lg" />Deny
                  </button>
                </div>
              </div>
              {req.message && (
                <div className="mt-3 p-3 rounded small" style={{ background: 'var(--bs-secondary-bg)' }}>
                  <i className="bi bi-chat-quote me-1 text-muted" />
                  <em>{req.message}</em>
                </div>
              )}
              <div className="mt-2">
                <div className="alert alert-info py-2 small mb-0 d-flex gap-2">
                  <i className="bi bi-shield-lock flex-shrink-0" />
                  Approving gives this agent access to message you through the secure inbox. Your phone number and email are never revealed.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Previous requests */}
      {previous.length > 0 && (
        <div>
          <h3 className="h6 fw-bold mb-3 text-muted">Previous requests</h3>
          <div className="table-responsive">
            <table className="table table-sm align-middle" style={{ fontSize: 13 }}>
              <thead className="table-light">
                <tr>
                  <th>Agent / Scout</th>
                  <th>Requested</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {previous.map((req) => {
                  const s = STATUS_MAP[req.status] ?? STATUS_MAP.pending
                  return (
                    <tr key={req.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="d-inline-flex align-items-center justify-content-center rounded-circle"
                            style={{ width: 30, height: 30, background: '#198754', color: '#fff', fontSize: 12 }}>
                            <i className="bi bi-binoculars" />
                          </span>
                          <div>
                            <div className="fw-semibold">{req.unlocker?.full_name || 'Agent'}</div>
                            <div className="text-muted" style={{ fontSize: 11 }}>{req.unlocker?.role?.replace(/_/g,' ')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">
                        {req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${s.cls} d-inline-flex align-items-center gap-1`}>
                          <i className={`bi ${s.icon}`} style={{ fontSize: 10 }} />{s.label}
                        </span>
                      </td>
                      <td className="text-center">
                        {req.status === 'granted' && (
                          <button className="btn btn-sm btn-outline-danger" type="button"
                            disabled={busy === req.id}
                            onClick={() => respond(req.id, 'denied')}>
                            Revoke
                          </button>
                        )}
                        {req.status === 'denied' && (
                          <button className="btn btn-sm btn-outline-success" type="button"
                            disabled={busy === req.id}
                            onClick={() => respond(req.id, 'granted')}>
                            Re-approve
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
