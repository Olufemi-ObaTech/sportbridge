/**
 * ReportProfileButton.jsx
 * "Report this profile" button + modal form for all users.
 * Used on PlayerProfile, MembersDirectory profile views.
 *
 * Props:
 *   supabase         — Supabase client
 *   user             — authenticated user (null if guest)
 *   reportedUserId   — profiles.id of the profile being reported
 *   reportedName     — display name of the profile being reported
 *   onSignup         — function to open signup modal (for guests)
 */

import { useState } from 'react'

const REPORT_REASONS = [
  { value: 'fraud_or_payment_request', label: 'Scam / Fraud / Fake payment request' },
  { value: 'fake_profile',             label: 'Fake or impersonation profile' },
  { value: 'harassment',               label: 'Harassment or threatening behaviour' },
  { value: 'inappropriate_content',    label: 'Inappropriate or offensive content' },
  { value: 'other',                    label: 'Other — please describe below' },
]

export default function ReportProfileButton({ supabase, user, reportedUserId, reportedName, onSignup }) {
  const [open,      setOpen]      = useState(false)
  const [reason,    setReason]    = useState('')
  const [details,   setDetails]   = useState('')
  const [submitting,setSubmitting]= useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  const handleOpen = () => {
    if (!user) { onSignup?.('player'); return }
    setOpen(true)
    setDone(false)
    setError('')
    setReason('')
    setDetails('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) { setError('Please select a reason.'); return }
    if (!user) { setError('You must be signed in to report a profile.'); return }
    setSubmitting(true); setError('')

    const { error: err } = await supabase.from('reports').insert({
      reporter_id:      user.id,
      reported_user_id: reportedUserId,
      reason,
      details:          details.trim() || null,
      status:           'pending',
    })

    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }

    // Send notifications to all parties
    try {
      const notificationsToInsert = []

      // 1. Notify all super_admin users
      const { data: admins } = await supabase.from('profiles')
        .select('id').eq('role', 'super_admin')
      if (admins && admins.length > 0) {
        admins.forEach((admin) => {
          notificationsToInsert.push({
            user_id:           admin.id,
            notification_type: 'new_report',
            data: {
              message:       `New report filed against ${reportedName || 'a user'}: ${reason.replace(/_/g, ' ')}`,
              reporter_id:   user.id,
              reported_id:   reportedUserId,
              reason,
            },
          })
        })
      }

      // 2. Notify the REPORTED user (so they are aware a report was filed)
      if (reportedUserId && reportedUserId !== user.id) {
        notificationsToInsert.push({
          user_id:           reportedUserId,
          notification_type: 'report_received',
          data: {
            message: 'A report has been filed against your profile and is under review by the SportBridge team. No action has been taken yet.',
          },
        })
      }

      // 3. Notify the REPORTER so they know it was received
      notificationsToInsert.push({
        user_id:           user.id,
        notification_type: 'report_submitted',
        data: {
          message: `Your report about ${reportedName || 'a user'} has been received. Our team will review it within 48 hours.`,
          reported_id:   reportedUserId,
          reason,
        },
      })

      if (notificationsToInsert.length > 0) {
        await supabase.from('notifications').insert(notificationsToInsert)
      }
    } catch {
      // Notification failure is non-critical — report was still filed
    }

    setDone(true)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={handleOpen}
      >
        <i className="bi bi-flag" aria-hidden="true" />
        Report this profile
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(0,0,0,.55)', zIndex: 1055 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="card p-4"
            style={{ maxWidth: 520, width: '100%', margin: 16, maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 id="report-modal-title" className="h5 fw-bold mb-0 d-flex align-items-center gap-2"
                style={{ color: 'var(--fc-blue-700)' }}>
                <i className="bi bi-flag-fill text-danger" />
                Report profile
              </h2>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setOpen(false)} />
            </div>

            {done ? (
              /* Success state */
              <div className="text-center py-4">
                <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-3" />
                <h3 className="h5 fw-bold mb-2">Report submitted</h3>
                <p className="text-muted mb-4">
                  Thank you. Our team will review this report within 48 hours.
                  If confirmed, appropriate action will be taken.
                </p>
                <button className="btn btn-primary" type="button" onClick={() => setOpen(false)}>
                  Close
                </button>
              </div>
            ) : (
              /* Form */
              <>
                <div className="alert alert-warning py-2 small mb-3 d-flex gap-2">
                  <i className="bi bi-shield-exclamation flex-shrink-0 mt-1" />
                  <span>
                    Reporting <strong>{reportedName || 'this profile'}</strong>.
                    False reports may result in action against your account.
                    All reports are reviewed by the SportBridge team within 48 hours.
                  </span>
                </div>

                {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

                <form onSubmit={handleSubmit} className="d-grid gap-3">
                  <div>
                    <label className="form-label fw-semibold">Reason for report <span className="text-danger">*</span></label>
                    {REPORT_REASONS.map((r) => (
                      <div className="form-check" key={r.value}>
                        <input
                          className="form-check-input"
                          type="radio"
                          id={`reason-${r.value}`}
                          name="report-reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                        />
                        <label className="form-check-label" htmlFor={`reason-${r.value}`}>
                          {r.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="form-label fw-semibold" htmlFor="report-details">
                      Describe what happened <span className="text-muted fw-normal">(optional but helpful)</span>
                    </label>
                    <textarea
                      id="report-details"
                      className="form-control"
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="What did this profile do? Include dates, amounts or messages if relevant. Do NOT include phone numbers or email addresses."
                      maxLength={2000}
                    />
                    <div className="form-text">{details.length}/2000 characters</div>
                  </div>

                  <div className="alert alert-light py-2 small">
                    <i className="bi bi-lock me-1" />
                    Your identity is kept confidential. The reported user will not see who filed the report.
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-danger flex-grow-1" type="submit" disabled={submitting || !reason}>
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                        : <><i className="bi bi-flag me-2" />Submit report</>}
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
