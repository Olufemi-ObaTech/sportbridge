/**
 * VerifyForm.jsx — Verification request forms for all roles.
 *
 * Player (Nigerian):       NIN + selfie/NIN slip + release letter
 * Player (International):  International Passport scan + release letter
 * Academy / Club:          CAC registration doc + company reg number +
 *                           3 facility photos + player contracts (optional)
 * Agent / Scout:           FIFA Agents ID + International Passport OR
 *                           FA Verification letter
 * Coach / Manager:         International Passport OR FA Verification letter
 *
 * CV upload is available to ALL roles from this form.
 *
 * Uploads → Supabase Storage (private-documents bucket).
 * Row inserted into verification_requests table.
 * Admin reviews at AdminDashboard → Verification Queue tab.
 */

import { useState } from 'react'
import { validateCV, validateImage, guardedUpload } from './lib/uploadGuards'

// ─── shared helpers ───────────────────────────────────────────────────────────
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
    <div className="d-flex align-items-start gap-2 p-3 rounded-3 mb-4"
      style={{ background: 'rgba(47,125,240,.06)', border: '1px solid rgba(47,125,240,.18)' }}>
      <i className="bi bi-shield-lock-fill text-primary flex-shrink-0 mt-1" aria-hidden="true" />
      <span className="small" style={{ color: 'var(--fc-blue-700)' }}>{children}</span>
    </div>
  )
}

function FileRow({ state, error }) {
  if (!state) return null
  return (
    <div className={`mt-1 small d-flex align-items-center gap-1 ${error || state.error ? 'text-danger' : 'text-success'}`}>
      <i className={`bi ${(error || state.error) ? 'bi-exclamation-circle' : 'bi-check-circle'}`} />
      {state.error ?? state.name}
    </div>
  )
}

// ─── CV section (shared by all roles) ────────────────────────────────────────
function CvSection({ cv, setCv }) {
  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setCv(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }
  return (
    <Field label="CV / Résumé (optional)" hint="PDF only · max 2 MB · stored privately, only shared with parties you approve">
      <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pick} />
      <FileRow state={cv} />
    </Field>
  )
}

// ─── 1. Player verification form ─────────────────────────────────────────────
function PlayerVerifyForm({ supabase, user, onDone }) {
  const [idType,    setIdType]   = useState('nin')   // 'nin' | 'passport'
  const [nin,       setNin]      = useState('')
  const [passport,  setPassport] = useState('')
  const [idDoc,     setIdDoc]    = useState(null)    // selfie (NIN) or passport scan
  const [letter,    setLetter]   = useState(null)    // release letter PDF
  const [cv,        setCv]       = useState(null)
  const [saving,    setSaving]   = useState(false)
  const [error,     setError]    = useState('')
  const [notice,    setNotice]   = useState('')

  const pickIdDoc = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = validateImage(file, 0)
    setIdDoc(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }
  const pickLetter = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setLetter(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (idType === 'nin') {
      if (!nin.trim() || nin.trim().length < 11) { setError('NIN must be 11 digits.'); return }
    } else {
      if (!passport.trim()) { setError('Passport number is required.'); return }
    }
    if (!idDoc?.file) { setError(`${idType === 'nin' ? 'Selfie / NIN slip' : 'Passport scan'} is required.`); return }
    if (!letter?.file) { setError('Release letter is required.'); return }

    setSaving(true); setError('')

    const idPath = `verification/${idType === 'nin' ? 'selfie' : 'passport'}/${user.id}/`
    const idRes = await guardedUpload(supabase, idDoc.file, 'private-documents', idPath, 'image', user.id, 0)
    if (!idRes.ok) { setError(idRes.error); setSaving(false); return }

    const letRes = await guardedUpload(supabase, letter.file, 'private-documents', `verification/release/${user.id}/`, 'cv', user.id, 0)
    if (!letRes.ok) { setError(letRes.error); setSaving(false); return }

    let cvUrl = null
    if (cv?.file) {
      const cvRes = await guardedUpload(supabase, cv.file, 'private-documents', `cv/${user.id}/`, 'cv', user.id, 0)
      if (!cvRes.ok) { setError(cvRes.error); setSaving(false); return }
      cvUrl = cvRes.url
      await supabase.from('player_private').upsert({ player_id: user.id, cv_storage_path: cvUrl, updated_at: new Date().toISOString() }, { onConflict: 'player_id' })
    }

    const payload = {
      user_id:              user.id,
      role:                 'player',
      id_type:              idType,
      nin_number:           idType === 'nin'      ? nin.trim()      : null,
      passport_number:      idType === 'passport' ? passport.trim() : null,
      nin_selfie_path:      idType === 'nin'      ? idRes.url       : null,
      id_document_path:     idRes.url,
      release_letter_path:  letRes.url,
      cv_path:              cvUrl,
      status:               'pending',
    }
    const { error: dbErr } = await supabase.from('verification_requests').insert(payload)
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    setNotice('Verification submitted! Our team reviews within 48 hours.')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        Your documents are stored securely and never shown publicly. They are used solely to confirm your identity.
      </SecurityNote>
      {error  && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}
      <div className="row g-3">
        {/* ID type toggle */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Identity document type <span className="text-danger ms-1">*</span></label>
          <div className="d-flex gap-2">
            {[['nin','🇳🇬 Nigerian NIN'],['passport','🌍 International Passport']].map(([v, l]) => (
              <button key={v} type="button"
                className={`btn btn-sm flex-fill fw-semibold ${idType === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setIdType(v)}>{l}</button>
            ))}
          </div>
        </div>

        {idType === 'nin' ? (
          <Field label="NIN (National Identification Number)" required hint="11-digit Nigerian NIN">
            <input className="form-control" type="text" maxLength={11} value={nin}
              onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 12345678901" />
          </Field>
        ) : (
          <Field label="International Passport Number" required hint="As printed on your passport data page">
            <input className="form-control" type="text" value={passport}
              onChange={(e) => setPassport(e.target.value.toUpperCase())} placeholder="e.g. A12345678" />
          </Field>
        )}

        <Field label={idType === 'nin' ? 'Selfie or NIN slip photo' : 'Passport data page scan'} required
          hint={idType === 'nin' ? 'Clear face photo holding your NIN slip. JPG/PNG/WebP · max 3 MB.' : 'Clear scan/photo of the passport page showing your photo and details. JPG/PNG/WebP · max 3 MB.'}>
          <input className="form-control" type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            capture={idType === 'nin' ? 'user' : undefined}
            onChange={pickIdDoc} />
          <FileRow state={idDoc} />
        </Field>

        <Field label="Last club release letter" required
          hint="Official letter confirming you are no longer contracted. PDF · max 2 MB.">
          <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickLetter} />
          <FileRow state={letter} />
        </Field>

        <CvSection cv={cv} setCv={setCv} />

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── 2. Academy / Club verification form ─────────────────────────────────────
function AcademyVerifyForm({ supabase, user, onDone }) {
  const [cac,        setCac]      = useState(null)
  const [regNumber,  setRegNumber]= useState('')
  const [email,      setEmail]    = useState('')
  const [pics,       setPics]     = useState([])
  const [contracts,  setContracts]= useState([])   // player contract PDFs (optional)
  const [cv,         setCv]       = useState(null)
  const [saving,     setSaving]   = useState(false)
  const [error,      setError]    = useState('')
  const [notice,     setNotice]   = useState('')

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
  const pickContracts = async (e) => {
    const files = Array.from(e.target.files ?? [])
    const next = [...contracts]
    for (const file of files) {
      const r = await validateCV(file)
      next.push(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
      if (next.length >= 5) break
    }
    setContracts(next); e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!cac?.file)        { setError('CAC / company registration document is required.'); return }
    if (!regNumber.trim()) { setError('Company registration number is required.'); return }
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

    const contractUrls = []
    for (const con of contracts) {
      if (!con.file) continue
      const r = await guardedUpload(supabase, con.file, 'private-documents', `verification/contracts/${user.id}/`, 'cv', user.id, contractUrls.length)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      contractUrls.push(r.url)
    }

    let cvUrl = null
    if (cv?.file) {
      const cvRes = await guardedUpload(supabase, cv.file, 'private-documents', `cv/${user.id}/`, 'cv', user.id, 0)
      if (!cvRes.ok) { setError(cvRes.error); setSaving(false); return }
      cvUrl = cvRes.url
    }

    const { error: dbErr } = await supabase.from('verification_requests').insert({
      user_id:            user.id,
      role:               'academy',
      cac_document_path:  cacRes.url,
      company_reg_number: regNumber.trim(),
      official_email:     email.trim() || null,
      facility_pictures:  picUrls,
      player_contracts:   contractUrls,
      cv_path:            cvUrl,
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
        CAC document and contracts are stored privately and never shown publicly.
        Facility photos appear on your verified public club profile.
      </SecurityNote>
      {error  && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}
      <div className="row g-3">
        <Field label="CAC / Company registration document" required hint="PDF · max 2 MB. Corporate Affairs Commission certificate.">
          <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickCac} />
          <FileRow state={cac} />
        </Field>

        <Field label="Company registration number" required hint="RC number as shown on your CAC certificate" col="col-12 col-md-6">
          <input className="form-control" type="text" value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)} placeholder="e.g. RC1234567" />
        </Field>

        <Field label="Official club email (optional)" hint="Club domain email helps expedite verification. Not required for amateur clubs." col="col-12 col-md-6">
          <input className="form-control" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourclub.org" />
        </Field>

        <Field label="Facility pictures (min 3)" required
          hint="Pitch, changing rooms, training ground. JPG/PNG/WebP · 3 MB each.">
          <input className="form-control" type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple onChange={pickPics} disabled={pics.length >= 3} />
          {pics.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {pics.map((p, i) => (
                <div key={i} style={{ width: 80, height: 80 }}>
                  {p.error
                    ? <div className="w-100 h-100 border border-danger rounded d-flex align-items-center justify-content-center small text-danger" style={{ fontSize: 9 }}>{p.error}</div>
                    : <img src={p.preview} alt="" className="rounded" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="Player contracts (optional · up to 5)"
          hint="Upload signed player contracts to fast-track club verification. PDF · 2 MB each.">
          <input className="form-control" type="file" accept=".pdf,application/pdf"
            multiple onChange={pickContracts} disabled={contracts.length >= 5} />
          {contracts.length > 0 && (
            <ul className="list-group list-group-flush mt-2">
              {contracts.map((c, i) => (
                <li key={i} className={`list-group-item px-0 py-1 small ${c.error ? 'text-danger' : 'text-success'}`}>
                  <i className={`bi ${c.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
                  {c.error ?? c.name}
                </li>
              ))}
            </ul>
          )}
        </Field>

        <CvSection cv={cv} setCv={setCv} />

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── 3. Agent / Scout verification form ──────────────────────────────────────
function AgentVerifyForm({ supabase, user, onDone }) {
  const [method,     setMethod]   = useState('fifa')  // 'fifa' | 'fa'
  const [fifaId,     setFifaId]   = useState('')
  const [passport,   setPassport] = useState(null)    // passport scan
  const [faBody,     setFaBody]   = useState('')      // e.g. "NFF", "CAF"
  const [faLetter,   setFaLetter] = useState(null)    // FA verification letter
  const [cv,         setCv]       = useState(null)
  const [saving,     setSaving]   = useState(false)
  const [error,      setError]    = useState('')
  const [notice,     setNotice]   = useState('')

  const pickPassport = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = validateImage(file, 0)
    setPassport(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }
  const pickFaLetter = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setFaLetter(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (method === 'fifa') {
      if (!fifaId.trim()) { setError('FIFA Agents ID is required.'); return }
      if (!passport?.file) { setError('International Passport scan is required.'); return }
    } else {
      if (!faBody.trim())   { setError('FA / federation name is required.'); return }
      if (!faLetter?.file)  { setError('FA verification letter is required.'); return }
    }

    setSaving(true); setError('')

    let passportUrl = null
    if (passport?.file) {
      const r = await guardedUpload(supabase, passport.file, 'private-documents', `verification/agent-passport/${user.id}/`, 'image', user.id, 0)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      passportUrl = r.url
    }

    let faLetterUrl = null
    if (faLetter?.file) {
      const r = await guardedUpload(supabase, faLetter.file, 'private-documents', `verification/agent-fa/${user.id}/`, 'cv', user.id, 0)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      faLetterUrl = r.url
    }

    let cvUrl = null
    if (cv?.file) {
      const cvRes = await guardedUpload(supabase, cv.file, 'private-documents', `cv/${user.id}/`, 'cv', user.id, 0)
      if (!cvRes.ok) { setError(cvRes.error); setSaving(false); return }
      cvUrl = cvRes.url
    }

    const { error: dbErr } = await supabase.from('verification_requests').insert({
      user_id:              user.id,
      role:                 'agent',
      fifa_agent_id:        method === 'fifa' ? fifaId.trim() : null,
      agent_passport_path:  passportUrl,
      fa_verification_body: method === 'fa'   ? faBody.trim() : null,
      license_path:         faLetterUrl,
      cv_path:              cvUrl,
      status:               'pending',
    })
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    setNotice('Agent verification submitted. Our team reviews within 48 hours.')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        Documents are stored securely and never shown publicly.
        A Verified Agent badge increases trust and player response rates significantly.
      </SecurityNote>
      {error  && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}
      <div className="row g-3">
        {/* Method toggle */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Verification method <span className="text-danger ms-1">*</span></label>
          <div className="d-flex gap-2">
            {[['fifa','⚽ FIFA Agents ID + Passport'],['fa','🏛 FA / Federation Verification']].map(([v, l]) => (
              <button key={v} type="button"
                className={`btn btn-sm flex-fill fw-semibold ${method === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setMethod(v)}>{l}</button>
            ))}
          </div>
        </div>

        {method === 'fifa' ? (<>
          <Field label="FIFA Agents ID" required hint="Your registered FIFA intermediary / agents licence number">
            <input className="form-control" type="text" value={fifaId}
              onChange={(e) => setFifaId(e.target.value)} placeholder="e.g. FIFA-AG-12345" />
          </Field>
          <Field label="International Passport scan" required
            hint="Clear scan of the passport data page showing photo and details. JPG/PNG/WebP · max 3 MB.">
            <input className="form-control" type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={pickPassport} />
            <FileRow state={passport} />
          </Field>
        </>) : (<>
          <Field label="FA / Federation name" required hint="e.g. NFF, CAF, UEFA, FA (England), CONMEBOL" col="col-12 col-md-6">
            <input className="form-control" type="text" value={faBody}
              onChange={(e) => setFaBody(e.target.value)} placeholder="e.g. NFF" />
          </Field>
          <Field label="FA verification letter" required
            hint="Official letter from the federation confirming your registered agent status. PDF · max 2 MB." col="col-12">
            <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickFaLetter} />
            <FileRow state={faLetter} />
          </Field>
        </>)}

        <CvSection cv={cv} setCv={setCv} />

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── 4. Coach / Manager verification form ────────────────────────────────────
function CoachVerifyForm({ supabase, user, onDone }) {
  const [method,    setMethod]   = useState('passport')  // 'passport' | 'fa'
  const [passport,  setPassport] = useState(null)        // passport scan
  const [faBody,    setFaBody]   = useState('')          // federation name
  const [faLetter,  setFaLetter] = useState(null)        // FA letter
  const [cv,        setCv]       = useState(null)
  const [saving,    setSaving]   = useState(false)
  const [error,     setError]    = useState('')
  const [notice,    setNotice]   = useState('')

  const pickPassport = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = validateImage(file, 0)
    setPassport(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }
  const pickFaLetter = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setFaLetter(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (method === 'passport' && !passport?.file) { setError('Passport scan is required.'); return }
    if (method === 'fa') {
      if (!faBody.trim())  { setError('FA / federation name is required.'); return }
      if (!faLetter?.file) { setError('FA verification letter is required.'); return }
    }

    setSaving(true); setError('')

    let passportUrl = null
    if (passport?.file) {
      const r = await guardedUpload(supabase, passport.file, 'private-documents', `verification/coach-passport/${user.id}/`, 'image', user.id, 0)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      passportUrl = r.url
    }

    let faLetterUrl = null
    if (faLetter?.file) {
      const r = await guardedUpload(supabase, faLetter.file, 'private-documents', `verification/coach-fa/${user.id}/`, 'cv', user.id, 0)
      if (!r.ok) { setError(r.error); setSaving(false); return }
      faLetterUrl = r.url
    }

    let cvUrl = null
    if (cv?.file) {
      const cvRes = await guardedUpload(supabase, cv.file, 'private-documents', `cv/${user.id}/`, 'cv', user.id, 0)
      if (!cvRes.ok) { setError(cvRes.error); setSaving(false); return }
      cvUrl = cvRes.url
    }

    const { error: dbErr } = await supabase.from('verification_requests').insert({
      user_id:             user.id,
      role:                'coach',
      coach_passport_path: passportUrl,
      coach_fa_body:       method === 'fa' ? faBody.trim() : null,
      coach_licence_path:  faLetterUrl,
      cv_path:             cvUrl,
      status:              'pending',
    })
    setSaving(false)
    if (dbErr) { setError(dbErr.message); return }
    await supabase.from('profiles').update({ verification_status: 'pending' }).eq('id', user.id)
    setNotice('Coach verification submitted. Our team reviews within 48 hours.')
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        Documents are stored securely and never shown publicly.
        A Verified Coach badge is shown on your public profile and job applications.
      </SecurityNote>
      {error  && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice && <div className="alert alert-success mb-3" role="status">{notice}</div>}
      <div className="row g-3">
        {/* Method toggle */}
        <div className="col-12">
          <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Verification method <span className="text-danger ms-1">*</span></label>
          <div className="d-flex gap-2">
            {[['passport','🪪 International Passport'],['fa','🏛 FA / Federation Verification']].map(([v, l]) => (
              <button key={v} type="button"
                className={`btn btn-sm flex-fill fw-semibold ${method === v ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setMethod(v)}>{l}</button>
            ))}
          </div>
        </div>

        {method === 'passport' ? (
          <Field label="Passport data page scan" required
            hint="Clear photo or scan of the page showing your photo, name and passport number. JPG/PNG/WebP · max 3 MB.">
            <input className="form-control" type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={pickPassport} />
            <FileRow state={passport} />
          </Field>
        ) : (<>
          <Field label="FA / Federation name" required hint="e.g. NFF, CAF, UEFA, FA (England)" col="col-12 col-md-6">
            <input className="form-control" type="text" value={faBody}
              onChange={(e) => setFaBody(e.target.value)} placeholder="e.g. NFF" />
          </Field>
          <Field label="FA verification letter" required
            hint="Official letter confirming your registered coaching licence. PDF · max 2 MB." col="col-12">
            <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pickFaLetter} />
            <FileRow state={faLetter} />
          </Field>
        </>)}

        <CvSection cv={cv} setCv={setCv} />

        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit for Verification'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── 5. CV-only upload (for roles that are already verified or want to upload CV separately) ──
function CvOnlyForm({ supabase, user, onDone }) {
  const [cv,     setCv]    = useState(null)
  const [saving, setSaving]= useState(false)
  const [error,  setError] = useState('')
  const [notice, setNotice]= useState('')

  const pick = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    const r = await validateCV(file)
    setCv(r.ok ? { file, name: file.name, error: null } : { file: null, name: file.name, error: r.error })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!cv?.file) { setError('Please select a CV PDF.'); return }
    setSaving(true); setError('')
    const r = await guardedUpload(supabase, cv.file, 'private-documents', `cv/${user.id}/`, 'cv', user.id, 0)
    if (!r.ok) { setError(r.error); setSaving(false); return }
    // Update verification_requests cv_path if a pending request exists
    await supabase.from('verification_requests')
      .update({ cv_path: r.url })
      .eq('user_id', user.id)
      .eq('status', 'pending')
    setSaving(false)
    setNotice('CV uploaded successfully.')
    setCv(null)
    onDone?.()
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="row g-3">
        <Field label="Upload CV / Résumé" required hint="PDF only · max 2 MB · stored privately">
          <input className="form-control" type="file" accept=".pdf,application/pdf" onChange={pick} />
          <FileRow state={cv} />
        </Field>
        {error  && <div className="col-12"><div className="alert alert-danger  mb-0" role="alert">{error}</div></div>}
        {notice && <div className="col-12"><div className="alert alert-success mb-0" role="status">{notice}</div></div>}
        <div className="col-12">
          <button className="btn btn-primary" type="submit" disabled={saving || !cv?.file}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Uploading…</> : <><i className="bi bi-upload me-2" />Upload CV</>}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export { CvOnlyForm }

export default function VerifyForm({ supabase, user, role, verificationStatus, onDone }) {
  if (verificationStatus === 'verified') {
    return (
      <div className="alert alert-success d-flex gap-3 align-items-center">
        <i className="bi bi-patch-check-fill fs-4 flex-shrink-0" aria-hidden="true" />
        <div>
          <div className="fw-bold">Your account is verified ✓</div>
          <div className="small">Your verified badge is visible on your public profile.</div>
          <hr className="my-2" />
          <div className="fw-semibold small mb-2">Upload / update your CV:</div>
          <CvOnlyForm supabase={supabase} user={user} />
        </div>
      </div>
    )
  }

  if (verificationStatus === 'pending') {
    return (
      <div className="alert alert-warning d-flex gap-3 align-items-start">
        <i className="bi bi-hourglass-split fs-4 flex-shrink-0 mt-1" aria-hidden="true" />
        <div className="w-100">
          <div className="fw-bold">Verification in review</div>
          <div className="small mb-3">Our team is reviewing your documents. You&apos;ll be notified within 48 hours.</div>
          <div className="fw-semibold small mb-2">Upload / update your CV while you wait:</div>
          <CvOnlyForm supabase={supabase} user={user} />
        </div>
      </div>
    )
  }

  // Descriptions per role
  const descriptions = {
    player:  'Players with a Verified badge get 3× more views from clubs and scouts.',
    academy: 'Verified clubs appear at the top of searches and attract serious talent.',
    agent:   'A Verified Agent badge builds trust with players and families.',
    coach:   'Verified coaches get priority placement in job applications.',
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="h5 fw-bold mb-1">Get your Verified ✓ badge</h3>
        <p className="text-muted small mb-0">{descriptions[role] ?? ''}</p>
      </div>

      {/* Requirements summary */}
      <div className="card p-3 mb-4" style={{ background: 'rgba(18,63,174,.04)', border: '1px solid rgba(18,63,174,.12)' }}>
        <p className="fw-semibold small mb-2">Documents required for {role === 'academy' ? 'Club / Academy' : role} verification:</p>
        {role === 'player'  && <ul className="small mb-0 ps-3"><li>Nigerian NIN <em>or</em> International Passport</li><li>Selfie / passport data page scan</li><li>Last club release letter (PDF)</li><li>CV (optional)</li></ul>}
        {role === 'academy' && <ul className="small mb-0 ps-3"><li>CAC / company registration document (PDF)</li><li>Company registration number</li><li>3 facility photos (pitch, changing room, training ground)</li><li>Player contracts (optional, speeds up verification)</li><li>CV (optional)</li></ul>}
        {role === 'agent'   && <ul className="small mb-0 ps-3"><li><strong>Option A:</strong> FIFA Agents ID + International Passport scan</li><li><strong>Option B:</strong> FA / Federation verification letter</li><li>CV (optional)</li></ul>}
        {role === 'coach'   && <ul className="small mb-0 ps-3"><li><strong>Option A:</strong> International Passport scan</li><li><strong>Option B:</strong> FA / Federation verification letter</li><li>CV (optional)</li></ul>}
      </div>

      {role === 'player'  && <PlayerVerifyForm  supabase={supabase} user={user} onDone={onDone} />}
      {role === 'academy' && <AcademyVerifyForm supabase={supabase} user={user} onDone={onDone} />}
      {role === 'agent'   && <AgentVerifyForm   supabase={supabase} user={user} onDone={onDone} />}
      {role === 'coach'   && <CoachVerifyForm   supabase={supabase} user={user} onDone={onDone} />}
    </div>
  )
}
