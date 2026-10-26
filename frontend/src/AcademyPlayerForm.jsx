import { useState } from 'react'
import { FOOTBALL_POSITIONS } from './lib/features'
import { guardedUpload, validateCV, validateImage } from './lib/uploadGuards'

function validateDocument(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    ? validateCV(file)
    : validateImage(file)
}

function DocumentPicker({ label, value, onChange }) {
  const [error, setError] = useState('')

  const pick = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = await validateDocument(file)
    if (!result.ok) {
      setError(result.error)
      onChange(null)
      return
    }
    setError('')
    onChange({ file, name: file.name })
  }

  return (
    <div className="col-12 col-md-6">
      <label className="form-label fw-semibold">{label}</label>
      <input className="form-control" type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        onChange={pick} required />
      <div className={`form-text ${error ? 'text-danger' : ''}`}>
        {error || value?.name || 'PDF (max 2 MB) or JPEG/PNG/WebP (max 3 MB)'}
      </div>
    </div>
  )
}

export default function AcademyPlayerForm({ supabase, user, profile, academyId, onSaved, onVerify }) {
  const [form, setForm] = useState({ name: '', position: '', age: '', nationality: '', country: '' })
  const [ownershipProof, setOwnershipProof] = useState(null)
  const [identityDocument, setIdentityDocument] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (profile?.verification_status !== 'verified') {
    return (
      <div className="alert alert-warning d-flex justify-content-between align-items-center gap-3">
        <span>Complete club verification before adding players to the roster.</span>
        <button className="btn btn-sm btn-primary flex-shrink-0" type="button" onClick={onVerify}>
          Verify club
        </button>
      </div>
    )
  }

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!academyId) {
      setError('Save your academy profile before adding roster players.')
      return
    }
    const age = Number(form.age)
    if (!form.name.trim() || !form.position || !Number.isInteger(age) || age < 13 || age > 50
      || !form.nationality.trim() || !form.country.trim()) {
      setError('Enter the player name, position, a valid age from 13 to 50, nationality, and current country.')
      return
    }
    if (!ownershipProof?.file || !identityDocument?.file) {
      setError('Upload both player ownership/contract proof and an identity document.')
      return
    }

    setSaving(true)
    const uploadedPaths = []
    const cleanupUploads = async () => {
      if (!uploadedPaths.length) return ''
      const { error: cleanupError } = await supabase.storage.from('private-documents').remove(uploadedPaths)
      return cleanupError ? ` Storage cleanup failed: ${cleanupError.message}` : ''
    }

    try {
      const ownershipResult = await guardedUpload(
        supabase, ownershipProof.file, 'private-documents',
        'academy-player/ownership/', 'cv', user.id, 0,
      )
      if (!ownershipResult.ok) {
        setError(ownershipResult.error)
        return
      }
      uploadedPaths.push(ownershipResult.url)

      const identityResult = await guardedUpload(
        supabase, identityDocument.file, 'private-documents',
        'academy-player/identity/', identityDocument.file.type === 'application/pdf' ? 'cv' : 'image', user.id, 0,
      )
      if (!identityResult.ok) {
        setError(`${identityResult.error}${await cleanupUploads()}`)
        return
      }
      uploadedPaths.push(identityResult.url)

      const { data: player, error: playerError } = await supabase.from('players').insert({
        profile_id: null,
        academy_id: academyId,
        display_name: form.name.trim(),
        position: form.position,
        age,
        nationality: form.nationality.trim(),
        country: form.country.trim(),
        is_public: false,
      }).select('id').single()

      if (playerError) {
        setError(`${playerError.message}${await cleanupUploads()}`)
        return
      }

      const { error: verificationError } = await supabase.from('academy_player_verifications').insert({
        player_id: player.id,
        academy_id: academyId,
        submitted_by: user.id,
        ownership_proof_path: ownershipResult.url,
        identity_document_path: identityResult.url,
      })
      if (verificationError) {
        const { error: cleanupError } = await supabase.from('players').delete().eq('id', player.id)
        const rowCleanupMessage = cleanupError ? ` Player cleanup failed: ${cleanupError.message}` : ''
        setError(`${verificationError.message}${rowCleanupMessage}${await cleanupUploads()}`)
        return
      }

      setForm({ name: '', position: '', age: '', nationality: '', country: '' })
      setOwnershipProof(null)
      setIdentityDocument(null)
      setNotice('Player added privately and submitted for document review. The roster entry will become visible after approval.')
      onSaved?.()
    } catch (uploadError) {
      setError(uploadError.message || 'Could not submit the player documents. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="alert alert-info small">
        Player entries remain private until an administrator reviews the ownership/contract proof and the player&apos;s passport or NIN evidence.
        Documents are stored in private storage.
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Player full name</label>
          <input className="form-control" value={form.name} onChange={update('name')} required maxLength={120} />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold">Position</label>
          <select className="form-select" value={form.position} onChange={update('position')} required>
            <option value="">Select position</option>
            {FOOTBALL_POSITIONS.map((position) => <option key={position} value={position}>{position}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold">Age</label>
          <input className="form-control" type="number" min="13" max="50" value={form.age} onChange={update('age')} required />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold">Nationality</label>
          <input className="form-control" value={form.nationality} onChange={update('nationality')} required maxLength={80} />
        </div>
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold">Current country</label>
          <input className="form-control" value={form.country} onChange={update('country')} required maxLength={80} />
        </div>
        <DocumentPicker label="Ownership proof or signed player contract" value={ownershipProof} onChange={setOwnershipProof} />
        <DocumentPicker label="Player international passport or NIN document" value={identityDocument} onChange={setIdentityDocument} />
        <div className="col-12">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</> : 'Submit player for review'}
          </button>
        </div>
      </div>
    </form>
  )
}
