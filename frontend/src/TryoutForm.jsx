/**
 * TryoutForm — Demo Flow 3
 * Agent / Scout (or any verified user) posts a Tryout Opportunity.
 *
 * Security applied:
 * - Phone/email contact-info blocked in description and venue fields
 * - Fee watchdog: if fee_amount > 0, fee_breakdown is required
 * - Fraud keyword detection on description → auto-flags for admin review
 * - Flyer images: validated (jpg/png/webp, 3 MB, max 3)
 * - Venue pictures: same guard
 * - Flagged posts get status 'pending_approval' and push to admin queue
 */

import { useState } from 'react'
import {
  FOOTBALL_POSITIONS,
  AGE_GROUPS,
  REGIONS,
  containsFraudKeywords,
} from './lib/features'
import { blockContactInfo, validateImage, guardedUpload } from './lib/uploadGuards'

// ─── helpers ──────────────────────────────────────────────────────────────────
function Field({ label, col = 'col-12 col-md-6', required, hint, children }) {
  return (
    <div className={col}>
      <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
        {label}{required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && <div className="form-text">{hint}</div>}
    </div>
  )
}

const BLANK = {
  title:        '',
  position:     '',
  ageGroup:     '',
  region:       '',
  venue:        '',
  tryoutDate:   '',
  gender:       '',
  description:  '',
  feeAmount:    '',
  feeBreakdown: '',
}

export default function TryoutForm({ supabase, user, onSaved }) {
  const [form,      setForm]      = useState(BLANK)
  const [flyers,    setFlyers]    = useState([])  // { file, preview, error }
  const [venuePics, setVenuePics] = useState([])  // { file, preview, error }
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [notice,    setNotice]    = useState('')
  const [flagged,   setFlagged]   = useState(false)

  const upd = (f) => (e) => setForm((d) => ({ ...d, [f]: e.target.value }))

  const pickImages = (setter, currentList) => (e) => {
    const files = Array.from(e.target.files ?? [])
    const next = [...currentList]
    for (const file of files) {
      const result = validateImage(file, next.length)
      next.push({
        file: result.ok ? file : null,
        preview: result.ok ? URL.createObjectURL(file) : null,
        error: result.ok ? null : result.error,
      })
      if (next.length >= 3) break
    }
    setter(next)
    e.target.value = ''
  }

  const removeImg = (setter) => (i) => {
    setter((prev) => {
      if (prev[i]?.preview) URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  // live fraud-keyword indicator
  const hasFraud = containsFraudKeywords(form.description)
  const hasFee   = Number(form.feeAmount) > 0

  // ── submit ────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setFlagged(false)

    // Required
    if (!form.title.trim())    { setError('Title is required.'); return }
    if (!form.region)          { setError('Region is required.'); return }
    if (!form.description.trim()) { setError('Description is required.'); return }

    // Contact info guard
    const ciDesc  = blockContactInfo(form.description, 'Description')
    const ciVenue = blockContactInfo(form.venue, 'Venue')
    if (ciDesc)  { setError(ciDesc); return }
    if (ciVenue) { setError(ciVenue); return }

    // Fee watchdog
    if (hasFee && !form.feeBreakdown.trim()) {
      setError('A fee breakdown is required when charging a tryout fee. Please explain what the fee covers (e.g. pitch hire, referees, equipment).')
      return
    }

    // Image errors
    if (flyers.some((f) => f.error))    { setError(`Flyer error: ${flyers.find((f) => f.error).error}`); return }
    if (venuePics.some((f) => f.error)) { setError(`Venue image error: ${venuePics.find((f) => f.error).error}`); return }

    setSaving(true)

    try {
      // Upload flyers
      const flyerUrls = []
      for (const img of flyers) {
        if (!img.file) continue
        const res = await guardedUpload(supabase, img.file, 'public-media', `tryouts/flyers/${user.id}/`, 'image', user.id, flyerUrls.length)
        if (!res.ok) { setError(res.error); setSaving(false); return }
        flyerUrls.push(res.url)
      }

      // Upload venue pictures
      const venueUrls = []
      for (const img of venuePics) {
        if (!img.file) continue
        const res = await guardedUpload(supabase, img.file, 'public-media', `tryouts/venues/${user.id}/`, 'image', user.id, venueUrls.length)
        if (!res.ok) { setError(res.error); setSaving(false); return }
        venueUrls.push(res.url)
      }

      // Determine status — flag if fraud keywords or fee present
      const isFlagged    = hasFraud || hasFee
      const status       = isFlagged ? 'pending_approval' : 'open'

      const payload = {
        posted_by:       user.id,
        type:            'tryout',
        sport:           'football',
        title:           form.title.trim(),
        position:        form.position || null,
        age_group:       form.ageGroup || null,
        region:          form.region,
        venue:           form.venue.trim() || null,
        tryout_date:     form.tryoutDate || null,
        gender:          form.gender || null,
        description:     form.description.trim(),
        fee_amount:      hasFee ? Number(form.feeAmount) : 0,
        fee_breakdown:   hasFee ? form.feeBreakdown.trim() : null,
        flyer_pictures:  flyerUrls,
        venue_pictures:  venueUrls,
        status,
        is_fee_flagged:  isFlagged,
        created_at:      new Date().toISOString(),
      }

      const { error: dbErr } = await supabase.from('opportunities').insert(payload)
      if (dbErr) { setError(dbErr.message); setSaving(false); return }

      if (isFlagged) {
        setFlagged(true)
        setNotice('Your tryout has been submitted and is pending admin review. This is normal for tryouts with fees or specific wording — we\'ll approve it quickly.')
      } else {
        setNotice('Tryout posted successfully! It\'s now live on the board.')
      }

      setForm(BLANK)
      setFlyers([])
      setVenuePics([])
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {error  && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice && (
        <div className={`alert mb-3 ${flagged ? 'alert-warning' : 'alert-success'}`} role="status">
          <i className={`bi ${flagged ? 'bi-hourglass-split' : 'bi-check-circle'} me-2`} />
          {notice}
        </div>
      )}

      {/* Live fraud keyword warning */}
      {hasFraud && (
        <div className="alert alert-warning mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          <strong>Warning:</strong> Your description contains phrases associated with fraudulent tryouts.
          This post will be held for admin review. Remove language like &ldquo;guaranteed selection&rdquo; or &ldquo;must pay to be selected&rdquo; to avoid delays.
        </div>
      )}

      <div className="row g-3">
        <Field label="Tryout title" required col="col-12">
          <input
            className="form-control"
            value={form.title}
            onChange={upd('title')}
            placeholder="e.g. Lagos FC U17 Open Tryout 2025"
            required
          />
        </Field>

        <Field label="Position" col="col-12 col-md-4">
          <select className="form-select" value={form.position} onChange={upd('position')}>
            <option value="">— All positions —</option>
            {FOOTBALL_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="Age group" col="col-12 col-md-4">
          <select className="form-select" value={form.ageGroup} onChange={upd('ageGroup')}>
            <option value="">— Any —</option>
            {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>

        <Field label="Gender" col="col-12 col-md-4">
          <select className="form-select" value={form.gender} onChange={upd('gender')}>
            <option value="">— Any —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="mixed">Mixed</option>
          </select>
        </Field>

        <Field label="Region" required>
          <select className="form-select" value={form.region} onChange={upd('region')} required>
            <option value="">— Select region —</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        <Field label="Tryout date">
          <input className="form-control" type="date" value={form.tryoutDate} onChange={upd('tryoutDate')} min={new Date().toISOString().split('T')[0]} />
        </Field>

        <Field label="Venue" hint="Do not include phone numbers or contact details here." col="col-12">
          <input
            className="form-control"
            value={form.venue}
            onChange={upd('venue')}
            placeholder="e.g. Teslim Balogun Stadium, Surulere, Lagos"
          />
          {blockContactInfo(form.venue) && (
            <div className="small text-danger mt-1">
              <i className="bi bi-exclamation-circle me-1" />{blockContactInfo(form.venue)}
            </div>
          )}
        </Field>

        <Field label="Description" required col="col-12"
          hint="No phone numbers or emails. Use the secure inbox for contact.">
          <textarea
            className="form-control"
            rows={5}
            value={form.description}
            onChange={upd('description')}
            placeholder="What players should expect, what to bring, selection criteria…&#10;&#10;⚠️ Do not include contact details — use the secure inbox."
            required
          />
          {blockContactInfo(form.description) && (
            <div className="small text-danger mt-1">
              <i className="bi bi-exclamation-circle me-1" />{blockContactInfo(form.description)}
            </div>
          )}
        </Field>

        {/* ── Fee section ──────────────────────────────────────────────── */}
        <div className="col-12">
          <div className="card p-3" style={{ borderColor: hasFee ? 'var(--fc-gold-500)' : undefined }}>
            <h3 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cash-coin text-primary" aria-hidden="true" />
              Tryout fee
            </h3>
            <div className="row g-3">
              <Field label="Fee amount (NGN)" col="col-12 col-md-5"
                hint="Enter 0 for a free tryout. Any fee requires a breakdown.">
                <div className="input-group">
                  <span className="input-group-text">₦</span>
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    value={form.feeAmount}
                    onChange={upd('feeAmount')}
                    placeholder="0"
                  />
                </div>
              </Field>
              {hasFee && (
                <Field label="Fee breakdown" required col="col-12"
                  hint="Required for all paid tryouts. Explain what the fee covers.">
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.feeBreakdown}
                    onChange={upd('feeBreakdown')}
                    placeholder="e.g. ₦3,000 covers: pitch hire (₦1,500), referee fees (₦1,000), refreshments (₦500). No selection is guaranteed."
                    required={hasFee}
                  />
                  <div className="form-text text-warning">
                    <i className="bi bi-exclamation-triangle-fill me-1" />
                    Paid tryouts are reviewed by our team before going live. Posts that suggest &ldquo;guaranteed selection&rdquo; or &ldquo;pay to be selected&rdquo; are automatically rejected.
                  </div>
                </Field>
              )}
            </div>
          </div>
        </div>

        {/* ── Flyers ───────────────────────────────────────────────────── */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
            Tryout flyer / poster <span className="text-muted fw-normal">(optional · max 3 · JPEG/PNG/WebP · 3 MB)</span>
          </label>
          <input
            className="form-control"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={pickImages(setFlyers, flyers)}
            disabled={flyers.length >= 3}
          />
          {flyers.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {flyers.map((img, i) => (
                <div key={i} className="position-relative" style={{ width: 90, height: 90 }}>
                  {img.error
                    ? <div className="w-100 h-100 bg-danger bg-opacity-10 border border-danger rounded d-flex align-items-center justify-content-center p-1" style={{ fontSize: 9, color: 'var(--bs-danger)', textAlign: 'center' }}>{img.error}</div>
                    : <img src={img.preview} alt="" className="rounded" style={{ width: 90, height: 90, objectFit: 'cover' }} />}
                  <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1" style={{ width: 20, height: 20, fontSize: 12 }} onClick={removeImg(setFlyers)(i)} aria-label="Remove"><i className="bi bi-x" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Venue pictures ───────────────────────────────────────────── */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
            Venue pictures <span className="text-muted fw-normal">(optional · max 3 · JPEG/PNG/WebP · 3 MB)</span>
          </label>
          <input
            className="form-control"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={pickImages(setVenuePics, venuePics)}
            disabled={venuePics.length >= 3}
          />
          {venuePics.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {venuePics.map((img, i) => (
                <div key={i} className="position-relative" style={{ width: 90, height: 90 }}>
                  {img.error
                    ? <div className="w-100 h-100 bg-danger bg-opacity-10 border border-danger rounded d-flex align-items-center justify-content-center p-1" style={{ fontSize: 9, color: 'var(--bs-danger)', textAlign: 'center' }}>{img.error}</div>
                    : <img src={img.preview} alt="" className="rounded" style={{ width: 90, height: 90, objectFit: 'cover' }} />}
                  <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1" style={{ width: 20, height: 20, fontSize: 12 }} onClick={removeImg(setVenuePics)(i)} aria-label="Remove"><i className="bi bi-x" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving || !supabase}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />Posting…</>
              : <><i className="bi bi-calendar2-plus me-2" />Post tryout</>}
          </button>
          {hasFee && (
            <span className="ms-3 small text-warning">
              <i className="bi bi-hourglass-split me-1" />Paid tryouts go to admin review first
            </span>
          )}
          {!supabase && (
            <div className="alert alert-warning mt-3 mb-0">
              Supabase is not configured. Tryout posting is unavailable.
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
