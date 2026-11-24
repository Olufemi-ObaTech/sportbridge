/**
 * VerifiedBadge.jsx
 * Shows verification status badge with optional Verification ID.
 * Verified members get: ✓ Verified Player · SB-XXXX-XXXX
 */

import { generateVerificationId } from './lib/verificationId'

const COACH_BADGES = [
  { match: /goal.?keep/i,        label: 'Verified Goalkeeper Coach'  },
  { match: /fitness|physio/i,    label: 'Verified Fitness Coach'     },
  { match: /team manager/i,      label: 'Verified Team Manager'      },
  { match: /sporting director/i, label: 'Verified Sporting Director' },
]

function getVerifiedLabel({ role, specialty, fifaAgent = false, fifaTms = false }) {
  if (role === 'player')         return 'Verified Player'
  if (role === 'academy')        return fifaTms ? 'FIFA TMS Verified Club' : 'Verified Club / Academy'
  if (role === 'agent')          return fifaAgent ? 'FIFA Agent Verified' : (/scout/i.test(specialty ?? '') ? 'Verified Scout' : 'Verified Agent')
  if (role === 'coach') {
    const badge = COACH_BADGES.find(({ match }) => match.test(specialty ?? ''))
    return badge?.label ?? 'Verified Coach'
  }
  if (role === 'sports_analyst') return 'Verified Sports Analyst'
  if (role === 'super_admin')    return 'SportBridge Admin'
  return 'Verified Member'
}

export default function VerifiedBadge({
  status,
  role,
  specialty,
  fifaAgent  = false,
  fifaTms    = false,
  label: verifiedLabel,
  userId,          // optional — if provided, shows SB-XXXX-XXXX ID
  showId = false,  // set true to show the ID inline
  className = '',
}) {
  const isVerified = status === 'verified'
  const isPending  = status === 'pending'
  const isRejected = status === 'rejected'

  const labels = {
    pending:   'Verification Pending',
    rejected:  'Verification Rejected',
    unverified:'Unverified',
  }

  const verifiedText = verifiedLabel || getVerifiedLabel({ role, specialty, fifaAgent, fifaTms })
  const label = isVerified ? verifiedText : (labels[status] ?? labels.unverified)

  const verifId = isVerified && userId && showId ? generateVerificationId(userId) : null

  const cls = isVerified ? 'text-bg-success'
            : isPending  ? 'text-bg-warning'
            : isRejected ? 'text-bg-danger'
            : 'text-bg-secondary'

  const icon = isVerified ? 'bi-patch-check-fill'
             : isPending  ? 'bi-hourglass-split'
             : isRejected ? 'bi-x-circle-fill'
             : 'bi-patch-question'

  return (
    <span className={`badge d-inline-flex align-items-center gap-1 ${cls} ${className}`}>
      <i className={`bi ${icon}`} aria-hidden="true" />
      {label}
      {verifId && (
        <span className="ms-1 opacity-75" style={{ fontSize: '0.85em', fontFamily: 'monospace' }}>
          · {verifId}
        </span>
      )}
    </span>
  )
}
