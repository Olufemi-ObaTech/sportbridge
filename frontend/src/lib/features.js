/**
 * SportBridge feature flags.
 * Change BASKETBALL_ENABLED to true when basketball goes live.
 * All basketball-gated UI checks this file — no other code to touch.
 */

export const BASKETBALL_ENABLED = false
export const PAYMENTS_ENABLED = false
export const MAX_PLAYER_TRAINING_MINUTES = 30

// ─── Football positions (expanded full list) ──────────────────────────────────
export const FOOTBALL_POSITIONS = [
  // Goalkeepers
  'Goalkeeper',
  // Defenders
  'Right Back',
  'Left Back',
  'Right Wing Back',
  'Left Wing Back',
  'Centre Back',
  'Sweeper',
  'Ball-Playing Centre Back',
  'Libero',
  // Midfielders
  'Defensive Mid',
  'Central Mid',
  'Box-to-Box Mid',
  'Attacking Mid',
  'Deep-Lying Playmaker',
  'Advanced Playmaker',
  // Wingers
  'Right Wing',
  'Left Wing',
  'Inverted Right Winger',
  'Inverted Left Winger',
  // Forwards
  'Second Striker',
  'Striker',
  'Centre Forward',
  'False 9',
  'Target Man',
  'Poacher',
]

// ─── Player contract status ───────────────────────────────────────────────────
export const CONTRACT_STATUSES = [
  'Free Agent',
  'Under Contract',
  'Contract Expiring (6 months)',
  'Contract Expiring (1 year)',
  'On Loan',
  'Released',
  'Trial Period',
]

// ─── Player profile specialisation tags ──────────────────────────────────────
export const PLAYER_SPECIALISATIONS = [
  'Pace & Dribbling',
  'Aerial Ability',
  'Set Piece Specialist',
  'Long Range Shooting',
  'Defensive Duels',
  'Pressing & High Press',
  'Box-to-Box Runner',
  'Creative Passing',
  'Leadership / Captain',
  'Technical Dribbler',
  'Two-Footed',
  'Vision & Through Balls',
]

// ─── Analyst specialisation sub-roles ────────────────────────────────────────
export const ANALYST_SPECIALISATIONS = [
  'Performance Analyst',
  'Video Analyst',
  'Data Analyst',
  'Recruitment Analyst',
  'Tactical Analyst',
  'Opposition Analyst',
  'Head of Analysis',
  'Sports Scientist (Analytics)',
  'Biomechanics Analyst',
]

// ─── Analyst tools / software ────────────────────────────────────────────────
export const ANALYST_TOOLS = [
  'Wyscout', 'InStat', 'StatsBomb IQ', 'Opta', 'Hudl Sportscode',
  'Python', 'R', 'Tableau', 'PowerBI', 'SciSports',
  'Tracab', 'Metrica Sports', 'Nacsport', 'LongoMatch',
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

// ─── Staff / coaching roles (35 + sub-roles — job posts AND profile dropdowns) ─
export const STAFF_ROLES = [
  // ── Head positions
  'Head Coach',
  'First Team Manager',
  'Caretaker Manager',
  'Interim Manager',
  'Player-Manager',
  'Under-23 Manager',
  'Under-18 Manager',

  // ── Coaching staff
  'Assistant Head Coach',
  'Assistant Coach',
  'Goalkeeping Coach',
  'Set-Piece Coach',
  'Fitness Coach',
  'Strength & Conditioning Coach',
  'Sports Scientist',
  'Physio / Sports Therapist',
  'Team Doctor',
  'Nutritionist',
  'Sport Psychologist',

  // ── Management & leadership
  'Sporting Director',
  'Technical Director',
  'Director of Football',
  'Academy Director',
  'Head of Recruitment',
  'Head of Player Development',
  'Head of Analysis',
  'Chief Executive Officer (CEO)',
  'General Manager',
  'Club Secretary',
  'Operations Manager',

  // ── Scouting & analysis
  'Scout',
  'Chief Scout',
  'Regional Scout',
  'International Scout',
  'Performance Analyst',
  'Video Analyst',
  'Data Analyst',
  'Opposition Analyst',
  'Recruitment Analyst',
  'Tactical Analyst',
  'Head of Data Science',

  // ── Development & other
  'Reserve Team Coach',
  'U23 / U21 Coach',
  'U18 Coach',
  'U16 Coach',
  'U14 Coach',
  'Youth Academy Coach',
  'Elite Development Coach',
  'Loan Manager',
  'Player Liaison',
  'Community Coach',
  'Women\'s Team Coach',
  'Futsal Coach',
]

// ─── Coaching licence levels ──────────────────────────────────────────────────
export const COACHING_LICENCES = [
  'UEFA Pro Licence',
  'UEFA A Licence',
  'UEFA B Licence',
  'UEFA C Licence',
  'CAF Pro Licence',
  'CAF A Licence',
  'CAF B Licence',
  'FIFA Coaching Diploma',
  'FA Level 4 (Pro)',
  'FA Level 3',
  'FA Level 2',
  'FA Level 1',
  'Turkish FA Pro Licence',
  'CBF Pro Licence (Brazil)',
  'DFB Fussballlehrer (Germany)',
  'FFF Diplôme d\'Entraîneur Pro (France)',
  'RFEF Nivel III (Spain)',
  'NFF Coaching Licence (Nigeria)',
  'GFA Coaching Licence (Ghana)',
  'NSCA-CSCS (S&C)',
  'UEFA Fitness Certificate',
  'UEFA Analysis Certificate',
  'Wyscout Certified',
  'StatsBomb IQ Certified',
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
  'registration fee',
  'sign-up fee',
  'joining fee',
  'compulsory payment',
  'mandatory payment',
  'we guarantee',
  'secure your spot',
]

/**
 * Fee thresholds per currency.
 * Any fee above these amounts automatically sets is_fee_flagged=true
 * and status='pending_approval' regardless of fraud keywords.
 *
 * Rule: > 5,000 USD | > 5,000 EUR | > 5,000 GBP | > 5,000,000 NGN | > 75,000 GHS
 */
export const FEE_FLAG_THRESHOLDS = {
  USD: 5000,
  EUR: 5000,
  GBP: 5000,
  NGN: 5_000_000,
  GHS: 75_000,   // Ghana Cedis (~5 000 USD at ~15 GHS/USD)
}

/**
 * Returns true if the fee amount for the given currency should be flagged.
 * @param {number} amount
 * @param {string} currency  'USD' | 'EUR' | 'GBP' | 'NGN' | 'GHS'
 */
export function isFeeAboveThreshold(amount, currency = 'USD') {
  if (!amount || isNaN(amount) || amount <= 0) return false
  const threshold = FEE_FLAG_THRESHOLDS[currency?.toUpperCase()] ?? FEE_FLAG_THRESHOLDS.USD
  return Number(amount) > threshold
}

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
