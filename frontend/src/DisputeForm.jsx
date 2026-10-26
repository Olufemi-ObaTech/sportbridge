/**
 * DisputeForm.jsx — User dispute / report submission form
 *
 * Allows any authenticated user to file a dispute or report with:
 *  - Reason selection
 *  - Detailed text description
 *  - Supporting evidence: PDF documents, images, videos
 *
 * Submissions go to: public.reports table
 * Evidence files: public-media / private-documents buckets
 */

import { useState } from 'react'
import { validateCV, validateImage, validateVideo, guardedUpload } from './lib/uploadGuards'
import { blockContactInfo } from './lib/uploadGuards'

const REASONS = [
  { value: 'fraud_or_payment_request', label: '💰 Agent demanding payment / fraud' },
  { value: 'fake_profile',             label: '🎭 Fake profile or impersonation'   },
  { value: 'harassment',               label: '🚫 Harassment or threats'           },
  { value: 'inappropriate_content',    label: '⚠️ Inappropriate content'           },
  { value: 'other',                    label: '❓ Other'                           },
]

export default function DisputeForm({ supabase, user, reportedUserId, reportedUserName, onClose, onSubmitted }) {
  const [reason,      setReason]      = useState('')
  const [details,     setDetails]     = useState('')
  const [docs,        setDocs]        = useState([])   // PDF files
  const [images,      setImages]      = useState([])   // image files
  const [videos,      setVideos]      = useState([])   // video files
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [notice,      setNotice]      = useState('')
  const [progress,    setProgress]    = useState('')

  if (!user) {
    return (
      <div className="text-center py-4">
        <i className="bi bi-lock fs-2 text-muted d-block mb-2" />
        <p className="text-muted">Sign in to file a dispute.</p>
      </div>
    )
  }

  const pickDocs = async (e) => {
    const files = Array.from(e.target.files ?? []); e.target.value = ''
    const next = [...docs]
    for (const file of files) {
      const r = await validateCV(file)
      next.push(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
      if (next.length >= 5) break
    }
    setDocs(next)
  }

  const pickImages = (e) => {
    const files = Array.from(e.target.files ?? []); e.target.value = ''
    const next = [...images]
    for (const file of files) {
      const r = validateImage(file, next.length)
      next.push(r.ok ? { file, preview: URL.createObjectURL(file), error: null } : { file: null, preview: null, error: r.error })
      if (next.length >= 5) break
    }
    setImages(next)
  }

  const pickVideos = (e) => {
    const files = Array.from(e.target.files ?? []); e.target.value = ''
    const next = [...videos]
    for (const file of files) {
      const r = validateVideo(file, next.length)
      next.push(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
      if (next.length >= 3) break
    }
    setVideos(next)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!reason)          { setError('Please select a reason.'); return }
    if (!details.trim())  { setError('Please describe the issue.'); return }
    if (details.length > 5000) { setError('Details must be under 5,000 characters.'); return }
    const ciErr = blockContactInfo(details, 'Details')
    if (ciErr) { setError(ciErr); return }
    if (user.id === reportedUserId) { setError('You cannot report yourself.'); return }

    setSaving(true); setError(''); setNotice('')

    // Upload evidence files
    const evidenceUrls = []

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      if (!doc.file) continue
      setProgress(`Uploading document ${i + 1} of ${docs.filter((d) => d.file).length}…`)
      const r = await guardedUpload(supabase, doc.file, 'private-documents', `disputes/${user.id}/docs/`, 'cv', user.id, i)
      if (!r.ok) { setError(r.error); setSaving(false); setProgress(''); return }
      evidenceUrls.push({ type: 'document', url: r.url, name: doc.name })
    }

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      if (!img.file) continue
      setProgress(`Uploading image ${i + 1} of ${images.filter((im) => im.file).length}…`)
      const r = await guardedUpload(supabase, img.file, 'public-media', `disputes/${user.id}/images/`, 'image', user.id, i)
      if (!r.ok) { setError(r.error); setSaving(false); setProgress(''); return }
      evidenceUrls.push({ type: 'image', url: r.url })
    }

    for (let i = 0; i < videos.length; i++) {
      const vid = videos[i]
      if (!vid.file) continue
      setProgress(`Uploading video ${i + 1} of ${videos.filter((v) => v.file).length}…`)
      const r = await guardedUpload(supabase, vid.file, 'public-media', `disputes/${user.id}/videos/`, 'video', user.id, i)
      if (!r.ok) { setError(r.error); setSaving(false); setProgress(''); return }
      evidenceUrls.push({ type: 'video', url: r.url, name: vid.name })
    }

    setProgress('')

    // Insert report
    const { error: dbErr } = await supabase.from('reports').insert({
      reporter_id:      user.id,
      reported_user_id: reportedUserId,
      reason,
      details:          details.trim() + (evidenceUrls.length > 0 ? `\n\n[Evidence: ${evidenceUrls.length} file(s) attached]` : ''),
      status:           'pending',
    })

    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }

    setNotice('Your dispute has been submitted. Our team will review it within 48 hours. Thank you for helping keep SportBridge safe.')
    setReason(''); setDetails(''); setDocs([]); setImages([]); setVideos([])
    onSubmitted?.()
  }

  return (
    <div>
      <div className="d-flex align-items-start gap-3 p-3 rounded-3 mb-4"
        style={{ background: 'rgba(220,53,69,.06)', border: '1.5px solid rgba(220,53,69,.22)' }}>
        <i className="bi bi-shield-exclamation text-danger fs-4 flex-shrink-0 mt-1" />
        <div>
          <div className="fw-bold small">You are reporting: <span className="text-danger">{reportedUserName || 'this user'}</span></div>
          <div className="small text-muted mt-1">
            All reports are reviewed by the SportBridge team within 48 hours.
            False reports may result in account action. Never share personal details in report descriptions.
          </div>
        </div>
      </div>

      {error   && <div className="alert alert-danger  py-2 mb-3" role="alert">{error}</div>}
      {notice  && <div className="alert alert-success py-2 mb-3" role="status">{notice}</div>}
      {progress && (
        <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
          <span className="spinner-border spinner-border-sm" />{progress}
        </div>
      )}

      {!notice && (
        <form onSubmit={submit} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="dispute-reason">
              Reason for report <span className="text-danger">*</span>
            </label>
            <select id="dispute-reason" className="form-select" value={reason} onChange={(e) => setReason(e.target.value)} required>
              <option value="">— Select a reason —</option>
              {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="dispute-details">
              Describe what happened <span className="text-danger">*</span>
            </label>
            <textarea
              id="dispute-details"
              className="form-control"
              rows={5}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide as much detail as possible. What happened? When? Do not include phone numbers or email addresses."
              maxLength={5000}
              required
            />
            <div className="form-text d-flex justify-content-between">
              <span>Be specific. Include dates, amounts, messages if relevant.</span>
              <span>{details.length}/5,000</span>
            </div>
          </div>

          {/* Evidence section */}
          <div className="card p-3 mb-3" style={{ background: 'rgba(47,125,240,.04)', border: '1px solid rgba(47,125,240,.15)' }}>
            <h3 className="h6 fw-bold mb-3">
              <i className="bi bi-paperclip me-2 text-primary" />Supporting evidence (optional)
            </h3>

            {/* Documents */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Documents / Certificates (PDF · max 2 MB each · up to 5)</label>
              <input className="form-control form-control-sm" type="file" accept=".pdf,application/pdf" multiple
                onChange={pickDocs} disabled={docs.length >= 5} />
              {docs.length > 0 && (
                <ul className="list-group list-group-flush mt-1">
                  {docs.map((d, i) => (
                    <li key={i} className={`list-group-item px-0 py-1 small ${d.error ? 'text-danger' : 'text-success'}`}>
                      <i className={`bi ${d.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
                      {d.error ?? d.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Images */}
            <div className="mb-3">
              <label className="form-label small fw-semibold">Screenshots / Images (JPG/PNG/WebP · max 3 MB each · up to 5)</label>
              <input className="form-control form-control-sm" type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple
                onChange={pickImages} disabled={images.length >= 5} />
              {images.length > 0 && (
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {images.map((img, i) => (
                    <div key={i} style={{ width: 64, height: 64 }}>
                      {img.error
                        ? <div className="w-100 h-100 border border-danger rounded d-flex align-items-center justify-content-center" style={{ fontSize: 9, color: 'red', padding: 2 }}>{img.error}</div>
                        : <img src={img.preview} alt="" className="rounded" style={{ width: 64, height: 64, objectFit: 'cover' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div>
              <label className="form-label small fw-semibold">Video evidence (MP4/MOV · max 100 MB · up to 3)</label>
              <input className="form-control form-control-sm" type="file"
                accept=".mp4,.mov,video/mp4,video/quicktime" multiple
                onChange={pickVideos} disabled={videos.length >= 3} />
              {videos.length > 0 && (
                <ul className="list-group list-group-flush mt-1">
                  {videos.map((v, i) => (
                    <li key={i} className={`list-group-item px-0 py-1 small ${v.error ? 'text-danger' : 'text-success'}`}>
                      <i className={`bi ${v.error ? 'bi-exclamation-circle' : 'bi-film'} me-1`} />
                      {v.error ?? v.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-danger px-5" type="submit" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : <><i className="bi bi-send me-2" />Submit Report</>}
            </button>
            {onClose && (
              <button className="btn btn-outline-secondary" type="button" onClick={onClose}>Cancel</button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
