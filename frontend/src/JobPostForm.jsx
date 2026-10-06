/**
 * JobPostForm — Demo Flow 1
 * Club / Academy posts either a "Player Needed" or "Staff Needed" job.
 *
 * Security applied:
 * - Phone/email contact-info blocked in all text areas
 * - Facility pictures: validated (jpg/png/webp, 3 MB, max 5)
 * - Club CV / presentation: validated (pdf, 2 MB)
 * - All files hashed + duplicate-checked before upload
 */

import { useState } from 'react'
import {
  FOOTBALL_POSITIONS,
  AGE_GROUPS,
  REGIONS,
  STAFF_ROLES,
  containsFraudKeywords,
} from './lib/features'
import { blockContactInfo, validateImage, validateCV, guardedUpload } from './lib/uploadGuards'

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
  jobType:     'player_needed',  // 'player_needed' | 'staff_needed'
  // Player needed
  position:    '',
  ageGroup:    '',
  region:      '',
  budget:      '',
  freeAgentOnly: false,
  // Staff needed
  staffRole:   '',
  licenseRequired: false,
  ageGroupToCoach: '',
  salary:      '',
  // Common
  description: '',
}

export default function JobPostForm({ supabase, user, onSaved }) {
  const [form,      setForm]      = useState(BLANK)
  const [images,    setImages]    = useState([])  // { file, preview, error }
  const [clubCv,    setClubCv]    = useState(null) // { file, name, error }
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [notice,    setNotice]    = useState('')

  const upd = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  // ── image picker ─────────────────────────────────────────────────────────────
  const pickImages = (e) => {
    const files = Array.from(e.target.files ?? [])
    const next = [...images]
    for (const file of files) {
      const result = validateImage(file, next.length)
      if (!result.ok) {
        next.push({ file, preview: null, error: result.error })
      } else {
        next.push({ file, preview: URL.createObjectURL(file), error: null })
      }
      if (next.length >= 5) break
    }
    setImages(next)
    e.target.value = ''
  }

  const removeImage = (i) => {
    setImages((prev) => {
      if (prev[i]?.preview) URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  // ── club CV picker ────────────────────────────────────────────────────────────
  const pickClubCv = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const result = await validateCV(file)  // async — checks magic bytes
    setClubCv({ file: result.ok ? file : null, name: file.name, error: result.ok ? null : result.error })
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    // Contact-info guard on description
    const ciErr = blockContactInfo(form.description, 'Description')
    if (ciErr) { setError(ciErr); return }

    // Fraud keyword guard on description
    if (containsFraudKeywords(form.description)) {
      setError('Your description contains language associated with fraudulent tryout fees ("guaranteed selection", "pay to be selected", etc.). Please remove these phrases and resubmit.')
      return
    }

    // Block any images with validation errors
    const badImg = images.find((i) => i.error)
    if (badImg) { setError(`Image error: ${badImg.error}`); return }

    if (clubCv?.error) { setError(`Club CV error: ${clubCv.error}`); return }

    // Required fields
    if (form.jobType === 'player_needed' && !form.position) { setError('Position is required for a Player Needed job.'); return }
    if (form.jobType === 'staff_needed'  && !form.staffRole)  { setError('Staff role is required for a Staff Needed job.'); return }
    if (!form.region) { setError('Region is required.'); return }
    if (!form.description.trim()) { setError('Description is required.'); return }

    setSaving(true)

    try {
      // Upload facility images
      const imageUrls = []
      for (const img of images) {
        if (!img.file || img.error) continue
        const result = await guardedUpload(
          supabase, img.file, 'public-media',
          `jobs/${user.id}/`, 'image', user.id, imageUrls.length
        )
        if (!result.ok) { setError(result.error); setSaving(false); return }
        imageUrls.push(result.url)
      }

      // Upload club CV
      let clubCvUrl = null
      if (clubCv?.file) {
        const result = await guardedUpload(
          supabase, clubCv.file, 'private-documents',
          `club-cv/${user.id}/`, 'cv', user.id, 0
        )
        if (!result.ok) { setError(result.error); setSaving(false); return }
        clubCvUrl = result.url
      }

      // Insert job
      const payload = {
        posted_by:           user.id,
        sport:               'football',
        job_type:            form.jobType,
        player_position:     form.jobType === 'player_needed' ? form.position     : null,
        staff_role:          form.jobType === 'staff_needed'  ? form.staffRole    : null,
        age_group:           form.jobType === 'player_needed' ? form.ageGroup     : form.ageGroupToCoach,
        region:              form.region,
        budget:              form.jobType === 'player_needed' && form.budget ? Number(form.budget)   : null,
        salary:              form.jobType === 'staff_needed'  && form.salary ? Number(form.salary)   : null,
        free_agent_only:     form.jobType === 'player_needed' ? form.freeAgentOnly : false,
        license_required:    form.jobType === 'staff_needed'  ? form.licenseRequired : false,
        description:         form.description.trim(),
        facility_pictures:   imageUrls,
        club_cv_url:         clubCvUrl,
        status:              'active',
        is_verified:         false,
        created_at:          new Date().toISOString(),
      }

      const { error: dbErr } = await supabase.from('jobs').insert(payload)
      if (dbErr) { setError(dbErr.message); setSaving(false); return }

      setNotice('Job posted successfully! It will appear in the job board shortly.')
      setForm(BLANK)
      setImages([])
      setClubCv(null)
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {/* Job type toggle */}
      <div className="d-flex gap-2 mb-4">
        {[
          { v: 'player_needed', label: 'Player Needed', icon: 'bi-person-arms-up' },
          { v: 'staff_needed',  label: 'Staff Needed',  icon: 'bi-clipboard2-pulse' },
        ].map(({ v, label, icon }) => (
          <button
            key={v}
            type="button"
            className={`btn flex-fill d-flex align-items-center justify-content-center gap-2 ${form.jobType === v ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setForm((f) => ({ ...f, jobType: v }))}
            aria-pressed={form.jobType === v}
          >
            <i className={`bi ${icon}`} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {error  && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}

      <div className="row g-3">
        {/* ── Player Needed fields ─────────────────────────────────────────── */}
        {form.jobType === 'player_needed' && (<>
          <Field label="Position" required>
            <select className="form-select" value={form.position} onChange={upd('position')} required>
              <option value="">— Select position —</option>
              {FOOTBALL_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Age group">
            <select className="form-select" value={form.ageGroup} onChange={upd('ageGroup')}>
              <option value="">— Any —</option>
              {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Budget / fee (USD/month)" hint="Leave blank if not disclosed">
            <input className="form-control" type="number" min="0" value={form.budget} onChange={upd('budget')} placeholder="e.g. 500" />
          </Field>
          <Field label="Region" required>
            <select className="form-select" value={form.region} onChange={upd('region')} required>
              <option value="">— Select region —</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div className="col-12">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="free-agent" checked={form.freeAgentOnly} onChange={upd('freeAgentOnly')} />
              <label className="form-check-label fw-semibold" htmlFor="free-agent">Free agents only</label>
              <div className="form-text">Only show this job to players without a current club.</div>
            </div>
          </div>
        </>)}

        {/* ── Staff Needed fields ──────────────────────────────────────────── */}
        {form.jobType === 'staff_needed' && (<>
          <Field label="Staff role" required>
            <select className="form-select" value={form.staffRole} onChange={upd('staffRole')} required>
              <option value="">— Select role —</option>
              {STAFF_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Age group to coach">
            <select className="form-select" value={form.ageGroupToCoach} onChange={upd('ageGroupToCoach')}>
              <option value="">— Any —</option>
              {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Region" required>
            <select className="form-select" value={form.region} onChange={upd('region')} required>
              <option value="">— Select region —</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Salary (USD/month)" hint="Leave blank if not disclosed">
            <input className="form-control" type="number" min="0" value={form.salary} onChange={upd('salary')} placeholder="e.g. 1200" />
          </Field>
          <div className="col-12">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" id="license-req" checked={form.licenseRequired} onChange={upd('licenseRequired')} />
              <label className="form-check-label fw-semibold" htmlFor="license-req">Coaching licence required</label>
            </div>
          </div>
        </>)}

        {/* ── Common: description ──────────────────────────────────────────── */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
            Description <span className="text-danger" aria-hidden="true">*</span>
          </label>
          <textarea
            className="form-control"
            rows={5}
            value={form.description}
            onChange={upd('description')}
            placeholder={
              form.jobType === 'player_needed'
                ? 'Describe the position, club setup, training schedule and requirements…\n\n⚠️ Do not include phone numbers or emails — use the secure message system.'
                : 'Describe the role, responsibilities, working conditions and requirements…\n\n⚠️ Do not include phone numbers or emails — use the secure message system.'
            }
            required
          />
          <div className="form-text">
            <i className="bi bi-shield-check text-success me-1" />
            Phone numbers and email addresses are automatically blocked. Use the secure inbox to share contact details.
          </div>
        </div>

        {/* ── Facility pictures ────────────────────────────────────────────── */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
            Facility pictures <span className="text-muted fw-normal">(optional, max 5 · JPEG/PNG/WebP · 3 MB each)</span>
          </label>
          <input
            className="form-control"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={pickImages}
            disabled={images.length >= 5}
          />
          {images.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {images.map((img, i) => (
                <div key={i} className="position-relative" style={{ width: 80, height: 80 }}>
                  {img.error ? (
                    <div className="w-100 h-100 bg-danger bg-opacity-10 border border-danger rounded d-flex align-items-center justify-content-center p-1" style={{ fontSize: 10, color: 'var(--bs-danger)', textAlign: 'center' }}>
                      {img.error}
                    </div>
                  ) : (
                    <img src={img.preview} alt="" className="rounded" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                  )}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1"
                    style={{ width: 20, height: 20, fontSize: 12 }}
                    onClick={() => removeImage(i)}
                    aria-label="Remove image"
                  >
                    <i className="bi bi-x" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Club CV / presentation ───────────────────────────────────────── */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
            Club CV / presentation <span className="text-muted fw-normal">(optional · PDF · 2 MB max)</span>
          </label>
          <input
            className="form-control"
            type="file"
            accept=".pdf,application/pdf"
            onChange={pickClubCv}
          />
          {clubCv && (
            <div className={`mt-1 small ${clubCv.error ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${clubCv.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
              {clubCv.error ?? `${clubCv.name} — ready to upload`}
            </div>
          )}
          <div className="form-text">
            <i className="bi bi-lock me-1" />
            Club CV is stored securely and never shown publicly. Only shared with candidates you approve.
          </div>
        </div>

        {/* ── Submit ───────────────────────────────────────────────────────── */}
        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving || !supabase}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />Posting job…</>
              : <><i className="bi bi-send me-2" />Post job</>}
          </button>
          {!supabase && (
            <div className="alert alert-warning mt-3 mb-0">
              Supabase is not configured. Job posting is unavailable.
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
