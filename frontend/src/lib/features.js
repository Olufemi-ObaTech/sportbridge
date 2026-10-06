/**
 * SportBridge feature flags.
 * Change BASKETBALL_ENABLED to true when basketball goes live.
 * All basketball-gated UI checks this file — no other code to touch.
 */

export const BASKETBALL_ENABLED = false

// ─── Football positions (full list including Left Full Back for job posts) ────
export const FOOTBALL_POSITIONS = [
  'Goalkeeper',
  'Right Back',
  'Left Back',       // Left Full Back
  'Centre Back',
  'Sweeper',
  'Defensive Mid',
  'Central Mid',
  'Attacking Mid',
  'Right Wing',
  'Left Wing',
  'Second Striker',
  'Striker',
  'Centre Forward',
]

export const BASKETBALL_POSITIONS = [
  'Point Guard',
  'Shooting Guard',
  'Small Forward',
  'Power Forward',
  'Centre',
]

/** Returns positions for the active sport */
export function getPositions(sport = 'football') {
  return sport === 'basketball' ? BASKETBALL_POSITIONS : FOOTBALL_POSITIONS
}

// ─── Age groups ───────────────────────────────────────────────────────────────
export const AGE_GROUPS = ['U13', 'U15', 'U17', 'U20', 'U23', 'Senior']

// ─── Nigerian + International regions ────────────────────────────────────────
export const REGIONS = [
  // Nigeria (primary market)
  'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City',
  'Kaduna', 'Enugu', 'Owerri', 'Warri', 'Calabar', 'Uyo',
  // West Africa
  'Accra', 'Dakar', 'Abidjan', 'Lomé', 'Cotonou', 'Conakry',
  // Other Africa
  'Cairo', 'Nairobi', 'Johannesburg', 'Cape Town',
  // Europe
  'London', 'Paris', 'Madrid', 'Lisbon', 'Amsterdam', 'Brussels',
  // Other
  'Middle East', 'Asia', 'Americas', 'Other',
]

// ─── Staff roles for job posts ────────────────────────────────────────────────
export const STAFF_ROLES = [
  'Head Coach',
  'Assistant Coach',
  'Goalkeeping Coach',
  'Fitness Coach / Physio',
  'Team Manager',
  'Interim Manager',
  'Sporting Director',
  'Technical Director',
  'Scout',
  'Analyst / Data Analyst',
]

// ─── Tryout fee watchdog ──────────────────────────────────────────────────────
export const FRAUD_KEYWORDS = [
  'guaranteed selection',
  'guaranteed trial',
  '100% selection',
  '100% guaranteed',
  'pay before trial',
  'pay to be selected',
  'must pay',
  'payment required',
  'pay to play',
  'pay for trial',
]

// ─── Contact-info regex (blocks phone numbers & emails in public fields) ──────
// Nigerian formats: 0801..., +2348..., 08..., 070..., 090...
export const PHONE_REGEX = /(\+?234|0)?[789][01]\d{8}/
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

export function containsContactInfo(text) {
  if (!text) return false
  return PHONE_REGEX.test(text) || EMAIL_REGEX.test(text)
}

export function containsFraudKeywords(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return FRAUD_KEYWORDS.some((kw) => lower.includes(kw))
}

// ─── Countries list (used by PlayerSearch and dashboard forms) ────────────────
export const COUNTRIES = [
  'Nigeria','Ghana','South Africa','Kenya','Egypt','Senegal',"Côte d'Ivoire",
  'Cameroon','Morocco','England','France','Germany','Spain','Portugal','Italy',
  'Brazil','Argentina','USA','Japan','South Korea','Saudi Arabia','Qatar','UAE','Other',
]
