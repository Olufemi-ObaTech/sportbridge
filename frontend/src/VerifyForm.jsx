/**
 * VerifyForm.jsx — Verification request forms for all roles.
 * Player:  NIN + selfie + last club release letter
 * Academy: CAC document + official email domain + 3 facility pictures
 * Agent:   License OR 2 reference clubs + NIN
 *
 * Uploads go to Supabase Storage (private-documents bucket).
 * A row is inserted into verification_requests table.
 * Admin reviews at /admin → Verification Queue tab.
 */

import { useState } from 'react'
import { validateCV, validateImage, guardedUpload } from './lib/uploadGuards'

// ─── helpers ──────────────────────────────────────────────────────────────────
function Field({ label, required, hint, col = 'col-12', children }) {
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

function SecurityNote({ children }) {
  return (
    <div className="d-flex align-items-start gap-2 p-3 rounded mb-4"
      style={{ background: 'rgba(47,125,240,.06)', border: '1px solid rgba(47,125,240,.18)' }}>
      <i className="bi bi-shield-lock-fill text-primary flex-shrink-0 mt-1" aria-hidden="true" />
      <span className="small" style={{ color: 'var(--fc-blue-700)' }}>{children}</span>
    </div>
  )
}

// ─── Player verification form ─────────────────────────────────────────────────
function PlayerVerifyForm({ supabase, user, onDone }) {
  const [nin,          setNin]         = useState('')
  const [selfie,       setSelfie]      = useState(null)
  const [letter,       setLetter]      = useState(null)
  const [saving,       setSaving]      = useState(false)
  const [error,        setError]       = useState('')
  const [notice,       setNotice]      = useState('')

  const pickSelfie = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = validateImage(file, 0)
    setSelfie(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const pickLetter = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setLetter(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!nin.trim()) { setError('NIN is required.'); return }
    if (nin.trim().length < 11) { setError('NIN must be 11 digits.'); return }
    if (!selfie?.file) { setError('Selfie photo is required.'); return }
    if (!letter?.file) { setError('Release letter PDF is required.'); return }
    setSaving(true); setError('')

    // Upload selfie
    const selfieRes = await guardedUpload(supabase, selfie.file, 'private-documents', `verification/selfie/${user.id}/`, 'image', user.id, 0)
    if (!selfieRes.ok) { setError(selfieRes.error); setSaving(false); return }

    // Upload release letter
    const letterRes = await guardedUpload(supabase, letter.file, 'private-documents', `verification/release/${user.id}/`, 'cv', user.id, 0)
    if (!letterRes.ok) { setError(letterRes.error); setSaving(false); return }

    // Insert verification request
    const { error: dbErr } = await supabase.from('verification_requests').insert({
      user_id:             user.id,
      role:                'player',
      nin_number:          nin.trim(),
      nin_selfie_path:     selfieRes.url,
      release_letter_path: letterRes.url,
      status:              'pending',
    })

    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }

    // Mark profile verification as pending
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)

    setNotice('Verification submitted! Our team will review within 48 hours. You will receive a notification once verified.')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        Your NIN and documents are stored securely and never shared publicly.
        They are used only to verify your identity and match your face to your club history.
      </SecurityNote>

      {error  && <div className="alert alert-danger mb-3"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}

      <div className="row g-3">
        <Field label="NIN (National Identification Number)" required hint="11-digit Nigerian NIN">
          <input className="form-control" type="text" maxLength={11} value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 12345678901" />
        </Field>

        <Field label="Selfie photo" required hint="Clear face photo. JPG/PNG/WebP, max 3 MB.">
          <input className="form-control" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            capture="user" onChange={pickSelfie} />
          {selfie && (
            <div className={`mt-1 small ${selfie.error ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${selfie.error ? 'bi-exclamation-circle' : 'bi-check-circle'} me-1`} />
              {selfie.error ?? selfie.name}
            </div>
          )}
        </Field>

        <Field label="Last club release letter" required
          hint="Official letter confirming you are no longer contracted. PDF, max 2 MB.">
          <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickLetter} />
          {letter && (
            <div className={`mt-1 small ${letter.error ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${letter.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
              {letter.error ?? letter.name}
            </div>
          )}
        </Field>

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving || !supabase}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Academy/Club verification form ──────────────────────────────────────────
function AcademyVerifyForm({ supabase, user, onDone }) {
  const [cac,          setCac]         = useState(null)
  const [email,        setEmail]       = useState('')
  const [pics,         setPics]        = useState([])
  const [saving,       setSaving]      = useState(false)
  const [error,        setError]       = useState('')
  const [notice,       setNotice]      = useState('')

  const pickCac = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setCac(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const pickPics = (e) => {
    const files = Array.from(e.target.files ?? [])
    const next = [...pics]
    for (const file of files) {
      const r = validateImage(file, next.length)
      next.push(r.ok ? { file, preview: URL.createObjectURL(file), error: null } : { file: null, preview: null, error: r.error })
      if (next.length >= 3) break
    }
    setPics(next); e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!cac?.file) { setError('CAC document is required.'); return }
    if (!email.trim()) { setError('Official email is required.'); return }
    if (email.toLowerCase().includes('@gmail') || email.toLowerCase().includes('@yahoo') || email.toLowerCase().includes('@hotmail')) {
      setError('Please use an official club/academy email domain — not Gmail, Yahoo, or Hotmail.'); return
    }
    if (pics.filter((p) => p.file).length < 3) { setError('Please upload at least 3 facility pictures.'); return }

    setSaving(true); setError('')

    const cacRes = await guardedUpload(supabase, cac.file, 'private-documents', `verification/cac/${user.id}/`, 'cv', user.id, 0)
    if (!cacRes.ok) { setError(cacRes.error); setSaving(false); return }

    const picUrls = []
    for (const pic of pics) {
      if (!pic.file) continue
      const r = await guardedUpload(supabase, pic.file, 'public-media', `verification/facility/${user.id}/`, 'image', user.id, picUrls.length)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      picUrls.push(r.url)
    }

    const { error: dbErr } = await supabase.from('verification_requests').insert({
      user_id:            user.id,
      role:               'academy',
      cac_document_path:  cacRes.url,
      official_email:     email.trim(),
      facility_pictures:  picUrls,
      status:             'pending',
    })
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }

    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    setNotice('Club verification submitted. Our team reviews within 48 hours.')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        CAC document is stored privately and never shown publicly. Facility photos
        will appear on your public club profile once verified.
      </SecurityNote>

      {error  && <div className="alert alert-danger mb-3"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}

      <div className="row g-3">
        <Field label="CAC registration document" required hint="PDF, max 2 MB. Corporate Affairs Commission registration.">
          <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickCac} />
          {cac && (
            <div className={`mt-1 small ${cac.error ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${cac.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
              {cac.error ?? cac.name}
            </div>
          )}
        </Field>

        <Field label="Official club email" required hint="Must use your club's domain — not Gmail/Yahoo.">
          <input className="form-control" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yourclub.org" />
        </Field>

        <Field label="Facility pictures (min 3)" required hint="Pitch, changing rooms, training ground. JPG/PNG/WebP, 3 MB each.">
          <input className="form-control" type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple onChange={pickPics} disabled={pics.length >= 3} />
          {pics.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {pics.map((p, i) => (
                <div key={i} style={{ width: 80, height: 80 }}>
                  {p.error
                    ? <div className="w-100 h-100 border border-danger rounded d-flex align-items-center justify-content-center" style={{ fontSize: 10, color: 'red' }}>{p.error}</div>
                    : <img src={p.preview} alt="" className="rounded" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </Field>

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving || !supabase}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Agent/Scout verification form ───────────────────────────────────────────
function AgentVerifyForm({ supabase, user, onDone }) {
  const [nin,      setNin]      = useState('')
  const [license,  setLicense]  = useState(null)
  const [ref1,     setRef1]     = useState('')
  const [ref2,     setRef2]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [notice,   setNotice]   = useState('')

  const pickLicense = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setLicense(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const submit = async (e) => {
    e.preventDefault()
    const hasLicense = Boolean(license?.file)
    const hasRefs    = ref1.trim() && ref2.trim()
    if (!hasLicense && !hasRefs) {
      setError('Please upload a license OR provide 2 reference clubs.'); return
    }
    if (!nin.trim()) { setError('NIN is required.'); return }

    setSaving(true); setError('')

    let licenseUrl = null
    if (license?.file) {
      const r = await guardedUpload(supabase, license.file, 'private-documents', `verification/agent-license/${user.id}/`, 'cv', user.id, 0)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      licenseUrl = r.url
    }

    const { error: dbErr } = await supabase.from('verification_requests').insert({
      user_id:          user.id,
      role:             'agent',
      nin_number:       nin.trim(),
      license_path:     licenseUrl,
      reference_club_1: ref1.trim() || null,
      reference_club_2: ref2.trim() || null,
      status:           'pending',
    })
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }

    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    setNotice('Agent verification submitted. Our team will review within 48 hours.')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        License and NIN are stored securely and never shown publicly.
        Reference clubs will receive a confirmation ping from SportBridge.
      </SecurityNote>

      {error  && <div className="alert alert-danger mb-3"  role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}

      <div className="row g-3">
        <Field label="NIN" required>
          <input className="form-control" type="text" maxLength={11} value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} placeholder="11-digit NIN" />
        </Field>

        <Field label="Agent / Scout license" hint="PDF, max 2 MB. FIFA, CAF, or national federation licence.">
          <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickLicense} />
          {license && (
            <div className={`mt-1 small ${license.error ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${license.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
              {license.error ?? license.name}
            </div>
          )}
        </Field>

        <div className="col-12">
          <p className="small fw-semibold mb-2">— OR — provide 2 reference clubs you have worked with</p>
        </div>

        <Field label="Reference Club 1" col="col-12 col-md-6">
          <input className="form-control" value={ref1} onChange={(e) => setRef1(e.target.value)}
            placeholder="e.g. Lagos FC" />
        </Field>
        <Field label="Reference Club 2" col="col-12 col-md-6">
          <input className="form-control" value={ref2} onChange={(e) => setRef2(e.target.value)}
            placeholder="e.g. Eko Football Academy" />
        </Field>

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving || !supabase}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Main export: routes to correct form by role ──────────────────────────────
export default function VerifyForm({ supabase, user, role, verificationStatus, onDone }) {
  if (verificationStatus === 'verified') {
    return (
      <div className="alert alert-success d-flex gap-3 align-items-center">
        <i className="bi bi-patch-check-fill fs-4 flex-shrink-0" aria-hidden="true" />
        <div>
          <div className="fw-bold">Your account is verified ✓</div>
          <div className="small">Your verified badge is visible on your public profile.</div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="alert alert-warning d-flex gap-3 align-items-center">
        <i className="bi bi-hourglass-split fs-4 flex-shrink-0" aria-hidden="true" />
        <div>
          <div className="fw-bold">Verification in review</div>
          <div className="small">Our team is reviewing your documents. You&apos;ll be notified within 48 hours.</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="h5 fw-bold mb-1">Get your Verified badge</h3>
        <p className="text-muted small mb-0">
          Verified profiles get{' '}
          <strong>3× more views</strong> from clubs and scouts.
          {role === 'player' && ' Requires NIN + selfie + release letter.'}
          {role === 'academy' && ' Requires CAC document + official email + 3 facility pictures.'}
          {role === 'agent' && ' Requires NIN + license OR 2 reference clubs.'}
        </p>
      </div>

      {role === 'player'  && <PlayerVerifyForm  supabase={supabase} user={user} onDone={onDone} />}
      {role === 'academy' && <AcademyVerifyForm supabase={supabase} user={user} onDone={onDone} />}
      {role === 'agent'   && <AgentVerifyForm   supabase={supabase} user={user} onDone={onDone} />}
      {(role === 'coach' || role === 'super_admin') && (
        <p className="text-muted">Verification for {role} accounts is managed by the SportBridge team. Contact support.</p>
      )}
    </div>
  )
}
