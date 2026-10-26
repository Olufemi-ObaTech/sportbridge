/**
 * PaymentPage.jsx — Payment / Premium Plans
 *
 * STATUS: INACTIVE — checkout is intentionally unavailable until payments
 * are configured and explicitly enabled.
 *
 * Plans:
 *  - Player Free     — always free, basic profile
 *  - Player Pro      — ₦2,500/mo — contact unlock, priority in search
 *  - Club Standard   — ₦10,000/mo — unlimited job posts, verified badge priority
 *  - Club Pro        — ₦25,000/mo — everything + featured placement
 *  - Agent Standard  — ₦15,000/mo — unlimited watchlist, direct contact
 *
 * When ready to activate:
 *  1. Set PAYMENTS_ENABLED = true in features.js
 *  2. Add VITE_STRIPE_PUBLISHABLE_KEY to Netlify env vars
 *  3. Create a Netlify Function (create-checkout-session.mjs) that calls
 *     Stripe's checkout.sessions.create with the selected price ID
 *  4. Add STRIPE_SECRET_KEY to Netlify env vars (server-side only)
 *  5. Set up Stripe webhook → Netlify Function to update profiles.plan
 */

import { PAYMENTS_ENABLED } from './lib/features'

const CURRENCY = '₦'
const PLANS = [
  {
    id:          'player_free',
    role:        'player',
    name:        'Player Free',
    price:       0,
    period:      'forever',
    colour:      'linear-gradient(135deg,#6c757d,#adb5bd)',
    icon:        'bi-person-arms-up',
    features: [
      'Public profile in player directory',
      'Upload CV + 3 highlight videos',
      'Apply to open jobs',
      'Express interest in tryouts',
      'Community feed access',
    ],
    cta:         'Current plan',
    disabled:    true,
    priceId:     null,
  },
  {
    id:          'player_pro',
    role:        'player',
    name:        'Player Pro',
    price:       2500,
    period:      '/month',
    colour:      'linear-gradient(135deg,#2F7DF0,#123FAE)',
    icon:        'bi-patch-check-fill',
    badge:       'Most Popular',
    features: [
      'Everything in Free',
      '⚡ Priority placement in search',
      '🔓 Unlock agent contact details',
      '📊 Full match stats + video archive',
      '🏆 Verified badge fast-track',
      '📩 Direct message clubs & agents',
    ],
    cta:         'Start free trial',
    disabled:    false,
    priceId:     'price_player_pro_ngn',
  },
  {
    id:          'club_standard',
    role:        'academy',
    name:        'Club Standard',
    price:       10000,
    period:      '/month',
    colour:      'linear-gradient(135deg,#6f42c1,#9d63e8)',
    icon:        'bi-building',
    features: [
      'Unlimited job posts',
      'Up to 50 player profiles',
      'Verified Club badge',
      'Access request management',
      'Club analytics dashboard',
    ],
    cta:         'Start free trial',
    disabled:    false,
    priceId:     'price_club_standard_ngn',
  },
  {
    id:          'club_pro',
    role:        'academy',
    name:        'Club Pro',
    price:       25000,
    period:      '/month',
    colour:      'linear-gradient(135deg,#F5B301,#C98A0A)',
    icon:        'bi-building-check',
    badge:       'Best Value',
    features: [
      'Everything in Club Standard',
      '🌟 Featured placement on homepage',
      'Unlimited player profiles',
      'FIFA TMS integration support',
      'Priority verification review (48h)',
      'Dedicated support',
    ],
    cta:         'Contact sales',
    disabled:    false,
    priceId:     'price_club_pro_ngn',
  },
  {
    id:          'agent_standard',
    role:        'agent',
    name:        'Agent Standard',
    price:       15000,
    period:      '/month',
    colour:      'linear-gradient(135deg,#198754,#20c997)',
    icon:        'bi-binoculars',
    features: [
      'Unlimited watchlist',
      'Direct contact with players',
      'Post jobs for clubs',
      'Verified Agent badge',
      'Access request priority',
    ],
    cta:         'Start free trial',
    disabled:    false,
    priceId:     'price_agent_standard_ngn',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaymentPage({ user, onSignup, onBack }) {
  // Filter plans relevant to the user's role (show all if not logged in)
  // const _userRole = null // will come from profile when payments enabled

  if (!PAYMENTS_ENABLED) {
    return (
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="badge text-bg-warning px-3 py-2 mb-3" style={{ fontSize: 13 }}>Coming Soon</span>
          <h1 className="h2 fw-bold" style={{ color: 'var(--fc-blue-700)' }}>
            SportBridge Premium Plans
          </h1>
          <p className="text-muted lead mb-0">
            Pro plans for players, clubs and agents are coming. Early members get locked-in pricing.
          </p>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center mb-5">
          {PLANS.map((plan) => (
            <div className="col" key={plan.id}>
              <div className="card h-100 p-4 position-relative overflow-hidden">
                {plan.badge && (
                  <span
                    className="badge position-absolute top-0 end-0 m-3"
                    style={{ background: plan.colour, color: plan.role === 'academy' && plan.id === 'club_pro' ? '#000' : '#fff', fontSize: 11 }}
                  >
                    {plan.badge}
                  </span>
                )}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="fc-icon-badge" style={{ background: plan.colour, width: 48, height: 48, fontSize: '1.2rem' }}>
                    <i className={`bi ${plan.icon}`} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="fw-bold" style={{ color: 'var(--fc-blue-700)' }}>{plan.name}</div>
                    <div className="small text-muted text-capitalize">{plan.role === 'academy' ? 'Club / Academy' : plan.role}</div>
                  </div>
                </div>

                <div className="mb-3">
                  {plan.price === 0 ? (
                    <span className="fw-bold" style={{ fontSize: 28, color: 'var(--fc-blue-700)' }}>Free</span>
                  ) : (
                    <span className="fw-bold" style={{ fontSize: 28, color: 'var(--fc-blue-700)' }}>
                      {CURRENCY}{plan.price.toLocaleString()}
                      <span className="text-muted fw-normal" style={{ fontSize: 14 }}>{plan.period}</span>
                    </span>
                  )}
                </div>

                <ul className="list-unstyled small text-muted mb-4 flex-grow-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="d-flex align-items-start gap-2 mb-1">
                      <i className="bi bi-check-lg text-success flex-shrink-0 mt-1" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="btn w-100 fw-bold"
                  style={{ background: plan.colour, color: plan.id === 'club_pro' ? '#000' : '#fff', border: 'none' }}
                  disabled
                  type="button"
                >
                  <i className="bi bi-lock me-2" aria-hidden="true" />
                  Coming soon
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted small mb-3">
            All prices in Nigerian Naira (NGN). Billed monthly. Cancel any time.
            Players are always free — forever.
          </p>
          {!user && (
            <button className="btn btn-primary" type="button" onClick={() => onSignup?.('player')}>
              Create a free account
            </button>
          )}
          {onBack && (
            <button className="btn btn-link text-muted ms-3" type="button" onClick={onBack}>
              ← Back
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Active payment flow (Stripe) — only reached when PAYMENTS_ENABLED = true ──
  // TODO: implement Stripe Checkout redirect
  return (
    <div className="container py-5 text-center">
      <p>Payment processing not yet implemented.</p>
    </div>
  )
}
