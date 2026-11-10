# SportBridge — Updated Project Report
**Date:** October 2026 | **Status:** Live on Netlify | **Build:** 92 modules, clean

---

## Platform Summary
SportBridge is a verified football talent platform connecting players, coaches, agents, academies, sports analysts and clubs worldwide. Built with React 19 + Vite 8 + Supabase PostgreSQL.

**Live URL:** https://sportbridge-com-ng.netlify.app  
**Admin login:** sportbridge.com.ng@gmail.com / `SportBridge2026!`  
**Demo password (all others):** `Demo@SportBridge1!`

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19.2, Vite 8.3 |
| Styling | Bootstrap 5.3.3 (npm bundled), Bootstrap Icons 1.11.3 |
| Database | Supabase PostgreSQL (31+ tables, RLS) |
| Auth | Supabase Auth + Brevo SMTP |
| File Storage | Supabase Storage |
| Hosting | Netlify (auto-deploy from GitHub) |
| Languages | EN · FR · PT · AR (RTL) · ES — 850+ strings |
| Legacy (local) | Laravel 12 + PHP 8.2 + MySQL |

---

## 6 Roles — 52 Staff Sub-roles

### Player (free forever)
- Full profile: position, secondary position, height/weight, foot, age group, availability
- **NEW:** Availability field (Available Now / Jan 2026 / Jul 2026 / Under Contract) editable from dashboard
- **NEW:** Age Group field (U13/U15/U17/U20/U23/Senior) editable from dashboard
- Upload: full-match video (required for verification), highlight clips, CV, photos
- 6-tab profile view: Overview · Career · Statistics · Videos · Achievements · Documents
- Career timeline with season stats (Apps/Goals/Assists/Clean Sheets)
- Profile completeness bar in sidebar
- Access request management (approve/deny agents) — verified only
- Post to Community Feed — verified only
- Verification: NIN (Nigerian) or International Passport + release letter

### Coach / Manager (52 sub-roles)
- **Head positions** (7): Head Coach · First Team Manager · Caretaker Manager · Interim Manager · Player-Manager · Under-23 Manager · Under-18 Manager
- **Coaching staff** (11): Assistant Head Coach · Assistant Coach · Goalkeeping Coach · Set-Piece Coach · Fitness Coach · Strength & Conditioning Coach · Sports Scientist · Physio / Sports Therapist · Team Doctor · Nutritionist · Sport Psychologist
- **Management & Leadership** (11): Sporting Director · Technical Director · Director of Football · Academy Director · Head of Recruitment · Head of Player Development · Head of Analysis · CEO · General Manager · Club Secretary · Operations Manager
- **Scouting & Analysis** (11): Scout · Chief Scout · Regional Scout · International Scout · Performance Analyst · Video Analyst · Data Analyst · Opposition Analyst · Recruitment Analyst · Tactical Analyst · Head of Data Science
- **Development & Other** (12): Reserve Team Coach · U23/U21 Coach · U18/U16/U14 Coach · Youth Academy Coach · Elite Development Coach · Loan Manager · Player Liaison · Community Coach · Women's Team Coach · Futsal Coach
- **NEW:** Post Event tab now has content (Post Update form)
- **NEW:** Post Tryout tab has content
- **NEW:** Apply for Jobs tab with verified-only gate
- Recommend players to agents/clubs
- Verification: Passport or FA/Federation letter

### Sports Analyst (9 specialisations)
- **NEW:** Verification now stores correct role `sports_analyst` (was incorrectly storing `coach`)
- **NEW:** `recommend-media` tab — Recommend with video/CV
- **NEW:** `find-players` tab — link to player directory
- **NEW:** `apply-jobs` tab with verified-only gate
- **NEW:** `post-review` tab — post match analysis
- Specialisations: Performance · Video · Data · Recruitment · Tactical · Opposition · Head of Analysis · Sports Scientist · Biomechanics

### Agent / Scout
- Agency profile: name, regions, experience, sport, about, achievements, LinkedIn
- **FIXED:** LinkedIn now fetched and displayed on agent profiles in Members Directory
- Track Record & Achievements with bullet-point display
- Safety notice on every agent profile
- Regions displayed as coloured badges
- Verification: FIFA Agents ID + Passport, or FA Federation letter

### Academy / Club
- **FIXED:** AcademyPlayerForm now receives correct `profile`, `academyId`, `onSaved`, `onVerify` props — squad roster feature fully functional
- **FIXED:** `leagues` and `languages` now fetched from academy_profiles and displayed in Members Directory
- **NEW:** Year Founded, Leagues & Competitions, Languages sections on club profile
- **NEW:** FIFA TMS Verified badge for clubs with `verified_badge = true`
- **NEW:** How to Work with This Club section (Player Trials · Staff Positions · Player Recommendations)
- Club Stats sidebar (Founded, Sports, Country, Leagues, Verified)
- Verification: CAC document + reg number + facility photos + FIFA TMS ID (optional)

### Super Admin
- All accounts management with sub-roles, location, sport columns
- **NEW:** Admin inbox messaging — when investigation starts/confirms/dismisses, personalised messages sent to both reporter and reported user via inbox + notification
- **NEW:** `AdminMessageForm` — send custom message to any party during investigation
- Verification queue with approve/reject
- Reports & Disputes queue with filter tabs
- Fee-flagged tryout review
- Duplicate file detector

---

## Security & Verification System

### Verification Forms (all roles)
| Role | Documents Required |
|------|-------------------|
| Player | NIN (11-digit) or International Passport + selfie + release letter |
| Academy/Club | CAC document + reg number + 3 facility photos + FIFA TMS ID (optional) |
| Agent | FIFA Agents ID + passport scan OR FA federation letter |
| Coach | International Passport OR FA federation verification letter |
| Sports Analyst | International Passport OR FA federation verification letter |

**FIXED:** `player_private.player_id` FK now correctly uses `players.id` (not `profiles.id`)

### Platform Rules
- No contact info in any public text field (auto-blocked)
- All contact via secure inbox only
- Fee guard: >5,000 USD/EUR/GBP · >5,000,000 NGN · >75,000 GHS = auto-flagged
- Full-match video required before player verification approved
- Password minimum 12 characters
- SHA-256 duplicate file detection
- **NEW:** Unverified members cannot post to Feed, manage Access Requests, or apply for Jobs
- **NEW:** Inbox restricted to verified members only (super_admin bypasses)

---

## Bugs Fixed in This Session (16 total)

| # | Severity | Fix |
|---|---------|-----|
| 1 | CRITICAL | AcademyPlayerForm missing `profile`, `academyId`, `onSaved`, `onVerify` props — squad roster never worked |
| 2 | HIGH | `player_private` FK used `user.id` (profiles.id) instead of `players.id` |
| 3 | HIGH | Sports analyst verification stored `role='coach'` — now correctly stores `'sports_analyst'` |
| 4 | HIGH | `leagues` and `languages` missing from academy_profiles SELECT — always blank in ClubProfile |
| 5 | MEDIUM | Coach profile had non-existent columns (`age_groups_coached`, `coaching_philosophy`, `publications`, `regions`) — removed |
| 6 | MEDIUM | Agent `linkedin` missing from SELECT — LinkedIn button never showed |
| 7 | MEDIUM | Player dashboard SELECT missing `availability`, `age_group`, `achievements_data`, `stats` |
| 8 | MEDIUM | Player dashboard had no edit fields for `availability` or `age_group` |
| 9 | MEDIUM | `player_history` referenced non-existent columns `league`, `country`, `minutes_played` |
| 10 | LOW | Coach `post-event`, `post-tryout`, `apply-jobs` tabs rendered blank |
| 11 | LOW | Analyst `recommend-media`, `find-players`, `apply-jobs`, `post-review` tabs rendered blank |
| 12 | LOW | Self-view inflated `views_count` — now skipped when viewer is the player |
| 13 | LOW | Analyst verification used `role="coach"` on VerifyForm — fixed to `role="sports_analyst"` |
| 14 | LOW | AcademyDashboard select missing `leagues`, `languages` |
| 15 | LOW | `player_private` upsert silently failed with null `player_id` |
| 16 | LOW | Schema: `age_group` and `availability` missing from authenticated UPDATE grants → `patch-player-grants.sql` |

---

## Supabase SQL to Run

```
1. supabase/demo/step1-prepare.sql        — constraint patches
2. supabase/demo/step3-coaches-analysts.sql
3. supabase/demo/step4-agents-clubs.sql
4. supabase/demo/step5-players.sql
5. supabase/demo/fix-login-now.sql        — confirm all emails
6. supabase/patch-player-grants.sql       — add age_group/availability UPDATE grants
7. supabase/patch-fee-currency.sql        — add fee_currency to opportunities
8. supabase/patch-fix-view.sql            — fix public_profile_badges view
```
Then: Supabase → Authentication → Email → turn OFF "Confirm email"

---

## Demo Logins

| Role | Email | Password |
|------|-------|----------|
| Super Admin | sportbridge.com.ng@gmail.com | `SportBridge2026!` |
| Head Coach (Brazil) | carlos.mendes@sportbridge.demo | `Demo@SportBridge1!` |
| Sporting Director (Spain) | javier.morales@sportbridge.demo | `Demo@SportBridge1!` |
| S&C Coach (Australia) | sarah.mitchell@sportbridge.demo | `Demo@SportBridge1!` |
| Performance Analyst (France) | sophie.laurent@sportbridge.demo | `Demo@SportBridge1!` |
| Video Analyst (England) | james.clarke@sportbridge.demo | `Demo@SportBridge1!` |
| Agent (Germany) | scouting@global-talent.demo | `Demo@SportBridge1!` |
| Agent (Argentina) | contact@sabridge.demo | `Demo@SportBridge1!` |
| Club (England) | admin@elitelondonfc.demo | `Demo@SportBridge1!` |
| Club (France) | info@academie-paris.demo | `Demo@SportBridge1!` |
| Club (Ghana) | contact@ghanafinstitute.demo | `Demo@SportBridge1!` |
| Club (Portugal) | academy@sportinglisboa.demo | `Demo@SportBridge1!` |
| Club (Nigeria) | admin@riversunited.demo | `Demo@SportBridge1!` |
| Player (England) | marcus.thompson@sportbridge.demo | `Demo@SportBridge1!` |
| Player (Brazil) | gabriel.santos@sportbridge.demo | `Demo@SportBridge1!` |
| Player (Ghana) | kwame.asante@sportbridge.demo | `Demo@SportBridge1!` |
| + 25 more players | see supabase/demo/step5-players.sql | `Demo@SportBridge1!` |

---

## What Can Be Added Next
- Payments (Stripe/Paystack) — `PAYMENTS_ENABLED` flag ready
- Basketball — `BASKETBALL_ENABLED` flag ready
- Video analytics & structured scouting reports
- Push notifications (PWA manifest.json already in place)
- Mobile app (React Native)
- More languages (Swahili, Hausa, Yoruba)
- Admin analytics dashboards
- Club-to-club transfer documentation flow
