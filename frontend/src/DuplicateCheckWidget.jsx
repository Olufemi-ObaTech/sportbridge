/**
 * DuplicateCheckWidget
 *
 * Reusable UI widget that shows the SHA-256 duplicate-check result
 * for a file before it is uploaded.
 *
 * NOTE: The hash is computed entirely in the browser via
 * crypto.subtle.digest (SubtleCrypto API). No file data is sent anywhere
 * during the check. The hash (not the file) is compared against the
 * uploads table via the `upload_hash_exists_for_other_user` RPC.
 *
 * Usage:
 *   <DuplicateCheckWidget supabase={supabase} file={file} />
 *
 * Props:
 *   supabase  — Supabase client (required for RPC call)
 *   file      — File object to hash (required)
 *   onResult  — optional callback(isDuplicate: boolean, hash: string)
 */

import { useEffect, useState } from 'react'
import { hashFile, checkDuplicate } from './lib/uploadGuards'

export default function DuplicateCheckWidget({ supabase, file, onResult }) {
  const [status, setStatus] = useState('idle') // idle | hashing | checking | clean | duplicate | error
  const [hash,   setHash]   = useState('')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    if (!file) {
      setStatus('idle')
      setHash('')
      setErrMsg('')
      return
    }

    let cancelled = false

    const run = async () => {
      setStatus('hashing')
      setHash('')
      setErrMsg('')

      // Step 1: compute SHA-256 hash in browser
      let h
      try {
        h = await hashFile(file)
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setErrMsg(err.message ?? 'Could not compute hash. Make sure you are on HTTPS or localhost.')
        }
        return
      }

      if (cancelled) return
      setHash(h)

      if (!supabase) {
        // No server check possible, but hash is available
        setStatus('clean')
        onResult?.(false, h)
        return
      }

      // Step 2: check against database
      setStatus('checking')
      const { isDuplicate, error } = await checkDuplicate(supabase, h)

      if (cancelled) return

      if (error) {
        setStatus('error')
        setErrMsg(`Server check failed: ${error}. You can still upload, but duplicate protection is unavailable.`)
        onResult?.(false, h)
        return
      }

      setStatus(isDuplicate ? 'duplicate' : 'clean')
      onResult?.(isDuplicate, h)
    }

    run()
    return () => { cancelled = true }
  }, [file, supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'idle') return null

  return (
    <div
      className={`d-flex align-items-start gap-2 mt-2 p-2 rounded small ${
        status === 'duplicate' ? 'text-danger bg-danger bg-opacity-10 border border-danger'
        : status === 'error'   ? 'text-warning bg-warning bg-opacity-10 border border-warning'
        : status === 'clean'   ? 'text-success bg-success bg-opacity-10 border border-success'
        : 'text-muted bg-light border'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <i
        className={`bi flex-shrink-0 mt-1 ${
          status === 'hashing'   ? 'bi-cpu'
          : status === 'checking'? 'bi-cloud-check'
          : status === 'duplicate'? 'bi-exclamation-octagon-fill'
          : status === 'error'   ? 'bi-exclamation-triangle-fill'
          : 'bi-shield-check'
        }`}
        aria-hidden="true"
      />

      <div className="flex-grow-1">
        {/* Main message */}
        <div className="fw-semibold">
          {status === 'hashing'    && 'Computing SHA-256 hash…'}
          {status === 'checking'   && 'Checking for duplicates…'}
          {status === 'clean'      && 'No duplicates found — file is unique'}
          {status === 'duplicate'  && 'Duplicate detected — this file was already uploaded by another account'}
          {status === 'error'      && (errMsg || 'Duplicate check unavailable')}
        </div>

        {/* Hash display (only when available) */}
        {hash && (
          <div className="mt-1" style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all', opacity: 0.7 }}>
            SHA-256: {hash}
          </div>
        )}

        {/* Browser-only note */}
        {(status === 'clean' || status === 'hashing' || status === 'checking') && (
          <div className="mt-1 opacity-75" style={{ fontSize: 10 }}>
            Hash computed locally in your browser — no file data is sent during this check.
          </div>
        )}

        {status === 'duplicate' && (
          <div className="mt-1">
            Uploading the same file under multiple accounts is not allowed.
            If you believe this is an error, contact SportBridge support.
          </div>
        )}
      </div>

      {/* Spinner for in-progress states */}
      {(status === 'hashing' || status === 'checking') && (
        <span className="spinner-border spinner-border-sm flex-shrink-0 mt-1" role="status" aria-hidden="true" />
      )}
    </div>
  )
}
