/**
 * Client-side upload validation and security guards.
 *
 * All checks run in the browser before the file is sent to Supabase Storage.
 * Server-side re-validation should be added for production, but these guards
 * cover the demo and investor meeting requirements.
 */

import { containsContactInfo } from './features'

// ─── limits ──────────────────────────────────────────────────────────────────
export const CV_MAX_BYTES        = 2 * 1024 * 1024   // 2 MB
export const IMAGE_MAX_BYTES     = 3 * 1024 * 1024   // 3 MB
export const VIDEO_MAX_BYTES     = 100 * 1024 * 1024 // 100 MB
export const MAX_IMAGES_PER_PROFILE = 5
export const MAX_VIDEOS_PER_PROFILE = 3

// ─── allowed MIME types ───────────────────────────────────────────────────────
const CV_MIME        = 'application/pdf'
const IMAGE_MIMES    = new Set(['image/jpeg', 'image/png', 'image/webp'])
const VIDEO_MIMES    = new Set(['video/mp4', 'video/quicktime'])  // mp4 / mov

// ─── PDF magic bytes: first 4 bytes must be %PDF ─────────────────────────────
async function isPdf(file) {
  const buf = await file.slice(0, 4).arrayBuffer()
  const bytes = new Uint8Array(buf)
  // %PDF = 0x25 0x50 0x44 0x46
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
}

// ─── Path traversal check ─────────────────────────────────────────────────────
function isSafeFilename(name) {
  return !/(\.\.[\\/]|[\\/])/.test(name)
}

// ─── SHA-256 hash ─────────────────────────────────────────────────────────────
/**
 * Returns a hex SHA-256 hash of the file contents.
 * Used to detect duplicate uploads across different users.
 */
export async function hashFile(file) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('SHA-256 is unavailable. Open SportBridge over HTTPS or localhost and try again.')
  }

  const buf    = await file.arrayBuffer()
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── CV validation ────────────────────────────────────────────────────────────
/**
 * Validates a CV file.
 * @returns {{ ok: true, file: File } | { ok: false, error: string }}
 */
export async function validateCV(file) {
  if (!file) return { ok: false, error: 'No file selected.' }

  if (!isSafeFilename(file.name)) {
    return { ok: false, error: 'Filename contains invalid characters.' }
  }

  // Extension check
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'pdf') {
    return { ok: false, error: 'Only PDF files are accepted for CVs. Please convert your CV to PDF and try again.' }
  }

  // MIME check
  if (file.type !== CV_MIME) {
    return { ok: false, error: `File type "${file.type}" is not allowed. Only application/pdf is accepted.` }
  }

  // Size check
  if (file.size > CV_MAX_BYTES) {
    return { ok: false, error: `CV must be under 2 MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.` }
  }

  // Magic bytes check
  const magic = await isPdf(file)
  if (!magic) {
    return { ok: false, error: 'This file does not appear to be a valid PDF (magic bytes check failed). Please upload a genuine PDF.' }
  }

  return { ok: true, file }
}

// ─── Image validation ─────────────────────────────────────────────────────────
/**
 * Validates a profile / facility image.
 * @param {File}   file
 * @param {number} currentCount  How many images this user already has
 * @returns {{ ok: true, file: File } | { ok: false, error: string }}
 */
export function validateImage(file, currentCount = 0) {
  if (!file) return { ok: false, error: 'No file selected.' }

  if (!isSafeFilename(file.name)) {
    return { ok: false, error: 'Filename contains invalid characters.' }
  }

  if (currentCount >= MAX_IMAGES_PER_PROFILE) {
    return { ok: false, error: `You can upload a maximum of ${MAX_IMAGES_PER_PROFILE} images. Remove an existing image first.` }
  }

  if (!IMAGE_MIMES.has(file.type)) {
    return { ok: false, error: 'Only JPEG, PNG, or WebP images are accepted. Please convert your file and try again.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return { ok: false, error: 'File extension must be .jpg, .jpeg, .png, or .webp.' }
  }

  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false, error: `Image must be under 3 MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.` }
  }

  return { ok: true, file }
}

// ─── Video validation ─────────────────────────────────────────────────────────
/**
 * Validates a highlight video.
 * @param {File}   file
 * @param {number} currentCount  How many videos this user already has
 * @returns {{ ok: true, file: File } | { ok: false, error: string }}
 */
export function validateVideo(file, currentCount = 0) {
  if (!file) return { ok: false, error: 'No file selected.' }

  if (!isSafeFilename(file.name)) {
    return { ok: false, error: 'Filename contains invalid characters.' }
  }

  if (currentCount >= MAX_VIDEOS_PER_PROFILE) {
    return { ok: false, error: `You can upload a maximum of ${MAX_VIDEOS_PER_PROFILE} videos. Remove an existing video first.` }
  }

  if (!VIDEO_MIMES.has(file.type)) {
    return { ok: false, error: 'Only MP4 and MOV videos are accepted.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['mp4', 'mov'].includes(ext)) {
    return { ok: false, error: 'File extension must be .mp4 or .mov.' }
  }

  if (file.size > VIDEO_MAX_BYTES) {
    return { ok: false, error: `Video must be under 100 MB. Your file is ${(file.size / 1024 / 1024).toFixed(0)} MB.` }
  }

  return { ok: true, file }
}

// ─── Contact-info guard for text fields ──────────────────────────────────────
/**
 * Returns an error string if the text contains a phone number or email address,
 * or null if clean.
 */
export function blockContactInfo(text, fieldLabel = 'This field') {
  if (!text) return null
  if (containsContactInfo(text)) {
    return `${fieldLabel} must not contain phone numbers or email addresses. Use the secure message system to share contact details.`
  }
  return null
}

// ─── Duplicate check via a privacy-safe Supabase function ─────────────────────
/**
 * Checks whether another account has registered this file hash without
 * exposing the uploader's identity or storage path.
 * Returns a duplicate result, or an error when the lookup cannot be completed.
 *
 * @param {object} supabase   Supabase client
 * @param {string} hash       SHA-256 hex hash
 */
export async function checkDuplicate(supabase, hash) {
  if (!supabase) return { isDuplicate: false, error: 'Upload service is unavailable.' }

  const { data, error } = await supabase.rpc('upload_hash_exists_for_other_user', {
    p_file_hash: hash,
  })

  if (error) return { isDuplicate: false, error: error.message }
  if (typeof data !== 'boolean') {
    return { isDuplicate: false, error: 'The duplicate-check service returned an invalid response.' }
  }
  return { isDuplicate: data }
}

// ─── Record upload in uploads table ──────────────────────────────────────────
/**
 * Inserts a row into the uploads table after a successful upload.
 */
export async function recordUpload(supabase, { fileHash, fileType, url }) {
  if (!supabase) return 'Upload service is unavailable.'
  const { data, error } = await supabase.rpc('register_upload_record', {
    p_file_hash: fileHash,
    p_file_type: fileType,
    p_url: url,
  })
  if (error) return error.message
  if (data !== true) {
    return 'This file was registered by another account while the upload was in progress.'
  }
  return null
}

// ─── Upload to Supabase Storage with guards ───────────────────────────────────
/**
 * Full guarded upload pipeline:
 * 1. Validate the file (type, size, extension, magic bytes for PDF)
 * 2. Hash it and check for duplicates
 * 3. Upload to Supabase Storage
 * 4. Record in uploads table
 *
 * @param {object}  supabase
 * @param {File}    file
 * @param {string}  bucket       e.g. 'private-documents' | 'public-media' | 'private-media'
 * @param {string}  pathPrefix   e.g. `cv/${userId}/`
 * @param {'cv'|'image'|'video'} type
 * @param {string}  userId
 * @param {number}  currentCount Number of existing files of this type
 * @returns {{ ok: true, url: string, hash: string } | { ok: false, error: string }}
 */
export async function guardedUpload(supabase, file, bucket, pathPrefix, type, userId, currentCount = 0) {
  if (!supabase) return { ok: false, error: 'Upload service is unavailable.' }

  // Step 1: validate
  let validation
  if (type === 'cv')    validation = await validateCV(file)
  else if (type === 'image') validation = validateImage(file, currentCount)
  else if (type === 'video') validation = validateVideo(file, currentCount)
  else return { ok: false, error: 'Unknown file type.' }

  if (!validation.ok) return validation

  // Step 2: hash + duplicate check
  let hash
  try {
    hash = await hashFile(file)
  } catch (error) {
    return { ok: false, error: `Could not calculate the file's SHA-256 hash: ${error.message}` }
  }

  const dupCheck = await checkDuplicate(supabase, hash)
  if (dupCheck.error) {
    return { ok: false, error: `Could not check for duplicate uploads: ${dupCheck.error}` }
  }
  if (dupCheck.isDuplicate) {
    return {
      ok: false,
      error: 'This file has already been uploaded by another account. Duplicate uploads are not allowed. If you believe this is an error, contact support.',
    }
  }

  // Step 3: upload
  const ext      = file.name.split('.').pop()?.toLowerCase()
  const normalizedPrefix = pathPrefix.replace(/^\/+|\/+$/g, '')
  const safePrefix = normalizedPrefix.startsWith(`${userId}/`)
    ? normalizedPrefix
    : `${userId}/${normalizedPrefix}`
  const filename = `${safePrefix}/${hash.slice(0, 16)}.${ext}`

  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { upsert: false, contentType: file.type })

  if (uploadError) {
    return { ok: false, error: `Upload failed: ${uploadError.message}` }
  }

  // Step 4: get public/signed URL and record
  const url = bucket === 'private-documents'
    ? data.path
    : supabase.storage.from(bucket).getPublicUrl(data.path).data?.publicUrl ?? data.path

  const recordError = await recordUpload(supabase, { fileHash: hash, fileType: file.type, url })
  if (recordError) {
    const { error: cleanupError } = await supabase.storage.from(bucket).remove([data.path])
    const cleanupMessage = cleanupError ? ` Uploaded file cleanup also failed: ${cleanupError.message}` : ''
    return {
      ok: false,
      error: `Upload succeeded but could not be recorded for duplicate protection: ${recordError}.${cleanupMessage}`,
    }
  }

  return { ok: true, url, hash }
}
