const COACH_BADGES = [
  { match: /goal.?keep/i, label: 'Verified Goalkeeper Coach' },
  { match: /fitness|physio/i, label: 'Verified Fitness Coach' },
  { match: /team manager/i, label: 'Verified Team Manager' },
  { match: /sporting director/i, label: 'Verified Sporting Director' },
]

function getVerifiedLabel({ role, specialty, fifaAgent = false, fifaTms = false }) {
  if (role === 'player') return 'Verified Player'
  if (role === 'academy') return fifaTms ? 'FIFA TMS Verified Academy / Club' : 'Verified Academy / Club'
  if (role === 'agent') {
    if (fifaAgent) return 'FIFA Agent Verified'
    return /scout/i.test(specialty ?? '') ? 'Verified Scout' : 'Verified Agent / Scout'
  }
  if (role === 'coach') {
    const badge = COACH_BADGES.find(({ match }) => match.test(specialty ?? ''))
    return badge?.label ?? 'Verified Coach'
  }
  return 'Verified'
}

export default function VerifiedBadge({
  status,
  role,
  specialty,
  fifaAgent = false,
  fifaTms = false,
  label: verifiedLabel,
  className = '',
}) {
  const isVerified = status === 'verified'
  const labels = {
    pending: 'Verification Pending',
    rejected: 'Verification Rejected',
    unverified: 'Unverified',
  }
  const label = isVerified
    ? verifiedLabel || getVerifiedLabel({ role, specialty, fifaAgent, fifaTms })
    : labels[status] ?? labels.unverified

  return (
    <span className={`badge d-inline-flex align-items-center gap-1 ${isVerified ? 'text-bg-success' : status === 'pending' ? 'text-bg-warning' : 'text-bg-secondary'} ${className}`}>
      <i className={`bi ${isVerified ? 'bi-patch-check-fill' : status === 'pending' ? 'bi-hourglass-split' : 'bi-patch-question'}`} aria-hidden="true" />
      {label}
    </span>
  )
}
