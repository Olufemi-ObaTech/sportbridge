/**
 * PlayerUploadForm — Demo Flow 2
 * Free player uploads their CV, highlight videos, and profile pictures.
 *
 * Security applied:
 * - CV: PDF only, 2 MB max, magic-bytes check, SHA-256 duplicate detection
 * - Videos: MP4/MOV only, 100 MB max, 3-video limit, duplicate hash check
 * - Images: JPG/PNG/WebP, 3 MB each, 5-image limit, duplicate hash check
 * - All text fields: phone/email contact-info regex block
 * - Watermark note displayed to user (actual server-side watermarking
 *   happens via Supabase Edge Function / Cloudinary in production)
 */

import { useState } from 'react'
import { blockContactInfo, validateCV, validateImage, validateVideo, guardedUpload } from './lib/uploadGuards'

// ─── helpers ──────────────────────────────────────────────────────────────────
function Field({ label, col = 'col-12', hint, children }) {
  return (
    <div className={col}>
      <label className="form-label fw-semibold" style={{ fontSize: 13 }}>{label}</label>
      {children}
      {hint && <div className="form-text">{hint}</div>}
    </div>
  )
}

function SecurityNote({ children }) {
  return (
    <div className="d-flex align-items-start gap-2 p-3 rounded mb-3"
      style={{ background: 'rgba(47,125,240,.06)', border: '1px solid rgba(47,125,240,.18)' }}>
      <i className="bi bi-shield-check text-primary flex-shrink-0 mt-1" aria-hidden="true" />
      <span className="small" style={{ color: 'var(--fc-blue-700)' }}>{children}</span>
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────
export default function PlayerUploadForm({ supabase, user, player, onSaved }) {
  const [cv,      setCv]      = useState(null)    // { file, name, error }
  const [videos,  setVideos]  = useState([])      // { file, name, error }
  const [images,  setImages]  = useState([])      // { file, preview, error }
  const [caption, setCaption] = useState('')      // video caption / description
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [notice,  setNotice]  = useState('')
  const [progress,setProgress]= useState('')

  // ── CV picker ─────────────────────────────────────────────────────────────
  const pickCv = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const result = await validateCV(file)
    setCv({ file: result.ok ? file : null, name: file.name, error: result.ok ? null : result.error })
  }

  // ── Video picker ──────────────────────────────────────────────────────────
  const pickVideo = (e) => {
    const files = Array.from(e.target.files ?? [])
    const next = [...videos]
    for (const file of files) {
      const result = validateVideo(file, next.length)
      next.push({ file: result.ok ? file : null, name: file.name, error: result.ok ? null : result.error })
      if (next.length >= 3) break
    }
    setVideos(next)
    e.target.value = ''
  }

  const removeVideo = (i) => setVideos((v) => v.filter((_, idx) => idx !== i))

  // ── Image picker ──────────────────────────────────────────────────────────
  const pickImages = (e) => {
    const files = Array.from(e.target.files ?? [])
    const next = [...images]
    for (const file of files) {
      const result = validateImage(file, next.length)
      next.push({
        file: result.ok ? file : null,
        preview: result.ok ? URL.createObjectURL(file) : null,
        error: result.ok ? null : result.error,
      })
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

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    const ciErr = blockContactInfo(caption, 'Caption')
    if (ciErr) { setError(ciErr); return }

    if (cv?.error)                              { setError(`CV error: ${cv.error}`); return }
    if (videos.some((v) => v.error))            { setError(`Video error: ${videos.find((v) => v.error).error}`); return }
    if (images.some((i) => i.error))            { setError(`Image error: ${images.find((i) => i.error).error}`); return }
    if (!cv?.file && videos.length === 0 && images.length === 0) {
      setError('Please select at least one file to upload.')
      return
    }

    setSaving(true)

    try {
      const results = []

      // Upload CV
      if (cv?.file) {
        setProgress('Uploading CV…')
        const res = await guardedUpload(supabase, cv.file, 'private-documents', `cv/${user.id}/`, 'cv', user.id, 0)
        if (!res.ok) { setError(res.error); setSaving(false); setProgress(''); return }
        results.push({ type: 'cv', url: res.url })

        // Upsert the cv_storage_path on the player_private table
        await supabase.from('player_private').upsert({
          player_id:       player?.id,
          cv_storage_path: res.url,
          updated_at:      new Date().toISOString(),
        }, { onConflict: 'player_id' })
      }

      // Upload videos
      for (let i = 0; i < videos.length; i++) {
        const vid = videos[i]
        if (!vid.file) continue
        setProgress(`Uploading video ${i + 1} of ${videos.filter((v) => v.file).length}…`)
        const res = await guardedUpload(supabase, vid.file, 'public-media', `videos/${user.id}/`, 'video', user.id, i)
        if (!res.ok) { setError(res.error); setSaving(false); setProgress(''); return }

        await supabase.from('media_assets').insert({
          owner_id:       user.id,
          player_id:      player?.id ?? null,
          asset_type:     'video',
          storage_bucket: 'public-media',
          storage_path:   res.url,
          title:          caption.trim() || null,
          visibility:     'public',
          sort_order:     i,
        })

        results.push({ type: 'video', url: res.url })
      }

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (!img.file) continue
        setProgress(`Uploading image ${i + 1} of ${images.filter((im) => im.file).length}…`)
        const res = await guardedUpload(supabase, img.file, 'public-media', `photos/${user.id}/`, 'image', user.id, i)
        if (!res.ok) { setError(res.error); setSaving(false); setProgress(''); return }

        await supabase.from('media_assets').insert({
          owner_id:       user.id,
          player_id:      player?.id ?? null,
          asset_type:     'image',
          storage_bucket: 'public-media',
          storage_path:   res.url,
          visibility:     'public',
          is_featured:    i === 0 && images.length > 0,
          sort_order:     i,
        })

        results.push({ type: 'image', url: res.url })
      }

      setProgress('')
      setNotice(`Upload complete! ${results.length} file${results.length !== 1 ? 's' : ''} uploaded successfully.`)
      setCv(null)
      setVideos([])
      setImages([])
      setCaption('')
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setProgress('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <SecurityNote>
        All uploaded files are hashed to detect duplicates. Videos will receive a
        &ldquo;SportBridge Verified&rdquo; watermark. Contact info (phone numbers, emails) in
        captions is automatically blocked — use the secure inbox instead.
      </SecurityNote>

      {error   && <div className="alert alert-danger  mb-3" role="alert">{error}</div>}
      {notice  && <div className="alert alert-success mb-3" role="status">{notice}</div>}
      {progress && (
        <div className="d-flex align-items-center gap-2 mb-3 small text-muted">
          <span className="spinner-border spinner-border-sm" />
          {progress}
        </div>
      )}

      <div className="row g-4">
        {/* ── CV ────────────────────────────────────────────────────────── */}
        <Field label="CV (PDF only · 2 MB max)" hint="Stored privately — only shared with verified clubs and agents you approve.">
          <input
            className="form-control"
            type="file"
            accept=".pdf,application/pdf"
            onChange={pickCv}
          />
          {cv && (
            <div className={`mt-1 small ${cv.error ? 'text-danger' : 'text-success'}`}>
              <i className={`bi ${cv.error ? 'bi-exclamation-circle' : 'bi-file-earmark-check'} me-1`} />
              {cv.error ?? `${cv.name} — ready to upload`}
            </div>
          )}
        </Field>

        {/* ── Videos ───────────────────────────────────────────────────── */}
        <Field
          label="Highlight videos (MP4 or MOV · 100 MB each · max 3)"
          hint="30-second preview shown publicly. Full video unlocked for verified viewers."
          col="col-12"
        >
          <input
            className="form-control mb-2"
            type="file"
            accept=".mp4,.mov,video/mp4,video/quicktime"
            multiple
            onChange={pickVideo}
            disabled={videos.length >= 3}
          />
          {videos.length > 0 && (
            <ul className="list-group list-group-flush mb-2">
              {videos.map((v, i) => (
                <li key={i} className="list-group-item d-flex align-items-center justify-content-between px-0 py-1">
                  <span className={`small ${v.error ? 'text-danger' : 'text-success'}`}>
                    <i className={`bi ${v.error ? 'bi-exclamation-circle' : 'bi-film'} me-2`} />
                    {v.error ?? v.name}
                  </span>
                  <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => removeVideo(i)} aria-label="Remove">
                    <i className="bi bi-x-lg" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label className="form-label fw-semibold mt-1" style={{ fontSize: 12 }}>Video caption / description</label>
          <textarea
            className="form-control"
            rows={2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe what's shown in the video… (no phone numbers or emails)"
          />
          {blockContactInfo(caption) && (
            <div className="small text-danger mt-1">
              <i className="bi bi-exclamation-circle me-1" />
              {blockContactInfo(caption)}
            </div>
          )}
        </Field>

        {/* ── Images ───────────────────────────────────────────────────── */}
        <Field
          label="Profile photos (JPEG / PNG / WebP · 3 MB each · max 5)"
          hint="EXIF data stripped on upload. First image becomes your featured photo."
          col="col-12"
        >
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
                <div key={i} className="position-relative" style={{ width: 90, height: 90 }}>
                  {img.error ? (
                    <div className="w-100 h-100 bg-danger bg-opacity-10 border border-danger rounded d-flex align-items-center justify-content-center p-1" style={{ fontSize: 10, color: 'var(--bs-danger)', textAlign: 'center' }}>
                      {img.error}
                    </div>
                  ) : (
                    <>
                      <img src={img.preview} alt="" className="rounded" style={{ width: 90, height: 90, objectFit: 'cover' }} />
                      {i === 0 && (
                        <span className="position-absolute bottom-0 start-0 badge bg-primary" style={{ fontSize: 9 }}>Featured</span>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 lh-1"
                    style={{ width: 20, height: 20, fontSize: 12 }}
                    onClick={() => removeImage(i)}
                    aria-label="Remove"
                  >
                    <i className="bi bi-x" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="col-12 pt-2">
          <button className="btn btn-primary px-5" type="submit" disabled={saving || !supabase}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-2" />{progress || 'Uploading…'}</>
              : <><i className="bi bi-cloud-upload me-2" />Upload files</>}
          </button>
          {!supabase && (
            <div className="alert alert-warning mt-3 mb-0">
              Supabase is not configured. File upload is unavailable.
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
