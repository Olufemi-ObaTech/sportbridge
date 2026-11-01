# SportBridge System Guide

*Last verified: October 2026 — all facts cross-checked against live codebase*

This guide describes the current product behaviour and the two application stacks in this repository. The React/Supabase application is the production product. The Laravel/MySQL application is a separate legacy implementation kept for local development and reference only.

---

## 1. System Architecture

### Production Application

| Layer | Technology | Responsibility |
|---|---|---|
| Browser application | React **19.2**, JavaScript modules, Vite **8.3** | Registration, profiles, search, jobs, tryouts, feed, inbox, dashboards |
| Identity | Supabase Auth + Brevo SMTP | User registration, sign-in, email confirmation, session management |
| Database | Supabase PostgreSQL | Profiles, players, org records, jobs, reports, verification, applications |
| Authorization | PostgreSQL Row-Level Security (RLS) + database functions | Account ownership, role permissions, verified publishing, admin review |
| File storage | Supabase Storage (`uploads` bucket) | Public media, private identity documents, CVs, licence evidence |
| Hosting | Netlify (`sportbridge-com-ng` site) | Compiled single-page application |
| Source & CI | GitHub Actions | Frontend build, lint, PHP test checks |

The frontend source is in `frontend/`. The canonical database definition is `supabase/schema.sql`. Hosting and environment setup are in `DEPLOYMENT.md`.

### Legacy Local Application

The repository also contains **Laravel 12 / PHP 8.2+ / Blade / Bootstrap / MySQL** code for local XAMPP development. It is **not** the production backend for the Netlify/Supabase application. See `README.md` for the Laravel setup.

### Interface Languages

The language selector offers **English (default), Français, Português, العربية, Español**.
- Selection is saved in the browser via `localStorage`
- Updates `document.lang` and sets `dir="rtl"` for Arabic
- All interface strings are translated in `frontend/src/lib/i18n.js`
- **New in this version:** Sports Analyst role, all 35 staff role names, "Post to Feed", "Share to Community Feed", "Specialisation", "Performance Analyst", "Video Analyst" and all related strings are fully translated across all 5 languages
- User-generated profile content is **not** translated

---

## 2. Accounts, Roles and Capabilities

Accounts have one primary role assigned at registration. The database `profiles.role` column accepts exactly:

```
player | coach | sports_analyst | agent | academy | super_admin
```

### Player *(free forever)*
- Build and edit a football profile: position, secondary position, age, nationality, country, region, gender, preferred foot, height, weight, current club, bio, achievements
- Upload full-match video, highlight clips, photos and CV (private)
- Set profile to **Public** to appear in the player directory
- Add career statistics: appearances, goals, assists, clean sheets, minutes played *(self-reported, not independently verified)*
- Apply for jobs and express interest in tryout opportunities
- Approve or deny access requests from scouts and agents
- Share activity updates, goals, course completions and media to the **Community Feed** (with optional photo/video attachment)
- Receive a **Verified ✓ badge** after submitting NIN or international passport for admin review
- Receive notifications for access requests, messages and verification outcomes
- Secure **Inbox** for all contact — no phone number or email ever shown publicly
- Player live/training sessions capped at **30 minutes** (enforced in both UI and database)

### Coach / Manager
Includes all 35 selectable specialisations:
> Head Coach · First Team Manager · Caretaker Manager · Interim Manager · Player-Manager · Assistant Head Coach · Assistant Coach · Goalkeeping Coach · Set-Piece Coach · Fitness Coach · Strength & Conditioning Coach · Sports Scientist · Physio / Sports Therapist · Team Doctor · Sporting Director · Technical Director · Director of Football · Academy Director · Head of Recruitment · Head of Player Development · Head of Analysis · Scout · Chief Scout · Performance Analyst · Video Analyst · Data Analyst · Opposition Analyst · Recruitment Analyst · Tactical Analyst · Reserve Team Coach · U23 / U21 Coach · U18 Coach · Youth Academy Coach · Loan Manager · Player Liaison

**Can do:**
- Build a public coaching profile with preferred role, experience years, badges/licences, nationality, current club, bio, achievements
- Upload CV privately (shared only with clubs applied to)
- Browse and apply for **coaching, management and director** roles on the Job Board
- **Recommend players** to agents and clubs with personal notes (stored in `agent_recommendations`)
- Share updates (new courses, new role, achievements) with optional photos/videos to Community Feed
- Receive **Verified ✓ badge** using FIFA licence / FA letter / international passport
- Host verified **live or training sessions** (no duration cap for coaches)
- Secure Inbox

### Sports Analyst *(NEW role — added in this version)*
Specialisations selectable on dashboard:
> Performance Analyst · Video Analyst · Data Analyst · Recruitment Analyst · Tactical Analyst · Opposition Analyst · Head of Analysis

**Uses the same `coach_profiles` table** (distinguished by `profiles.role = 'sports_analyst'`).

**Can do:**
- Build a public analyst profile with specialisation, software/tools (Wyscout, StatsBomb, Python, R, Tableau etc.), experience, bio, publications
- Upload CV and analysis portfolio
- Browse and apply for **analyst roles** on the Job Board
- **Recommend players** to agents and clubs with data-backed analysis notes
- **Post Player Position Needed** jobs on behalf of club clients
- Share insights, data reports and analysis publications to Community Feed
- Receive **Verified ✓ badge**
- Secure Inbox

### Agent / Scout
- Build a public agency profile: agency name, regions, experience years, nationality, about, achievements
- **Search the full player directory** — filter by position, age group, region, nationality, preferred foot, verified-only
- **Watchlist players** (stored in `watchlists` table)
- **Request access** to a player's full CV and contact details — player must approve before anything is shared
- Post **Player Position Needed** jobs on behalf of clubs
- Post **tryout opportunities** (free tryouts publish immediately; paid tryouts go to admin review queue)
- Receive player recommendations from coaches and analysts
- Receive **Verified ✓ badge** using FIFA Agents ID + passport scan
- Secure Inbox

### Academy / Club
- Create a verified club profile: name, country, state, address, phone, year founded, sports
- Add players to squad roster (requires admin approval of identity + ownership evidence)
- Post **Player Needed** and **Staff Needed** jobs
- Post tryout opportunities
- Manage squad stats, access requests, active job listings
- Share club news, squad updates and opportunities to Community Feed
- Receive **Verified ✓ badge** using CAC / company registration documents
- Host verified live/training sessions (no duration cap)
- Secure Inbox

### Super Admin
- View all user accounts (search by name / email / role — up to 300 rows loaded)
- Change any user's role from the dropdown
- **Suspend** or **restore** any account (stored in `profiles.status`)
- **New-today** stat card showing accounts created in the current calendar day
- Role distribution bar chart showing breakdown across all roles
- **Verification queue** — review pending identity document submissions, approve or reject with notes. On approval: sets `verification_status = 'verified'`, awards `verified_badge = true` on agent/academy sub-profiles
- **Duplicate file detector** — view uploads flagged as byte-for-byte SHA-256 duplicates
- **Fee-flagged tryout queue** — approve or reject tryout opportunities flagged for excessive fees or scam phrases
- Confirmed-scam investigations set the account to `denied` — account is **not** permanently deleted; history is retained

---

## 3. Verification and Badges

Verification is separate from account access:

| Field | Values | Meaning |
|---|---|---|
| `profiles.status` | `active` · `pending` · `suspended` · `denied` | Controls whether the account can access the platform |
| `profiles.verification_status` | `unverified` · `pending` · `verified` · `rejected` | Records document review outcome |

Registration creates an `active` account immediately. Submitting documents sets `verification_status = 'pending'` — it does **not** auto-approve. An admin reviews and approves or rejects.

Role-aware badge labels shown on verified profiles:
- **Verified Player** · **FIFA TMS Verified Academy / Club** · **FIFA Agent Verified** · **Verified Scout** · **Verified Goalkeeper Coach** · **Verified Fitness Coach** · **Verified Team Manager** · **Verified Sporting Director** · **Verified Sports Analyst**

Player verification additionally requires at least one video classified as **Full Match**. The verification form checks for this. SHA-256 identifies duplicate file bytes — it does not prove footage is complete, unedited or genuine. Admins must inspect documents independently.

---

## 4. Home Page — Public (No Login Required)

The home page is **fully visible to guests** including:

| Section | Content |
|---|---|
| Hero | Global statement, role CTA buttons, comparison pills |
| Role cards | 5 cards in a responsive 3-column grid: Player, Club/Academy, Agent/Scout, Coach/Manager, Sports Analyst |
| Visual showcase | Stadium photography (3-column grid) |
| **Meet the community** | Live Supabase data — member cards with filter tabs: All Members / Players / Coaches / Agents / Clubs / Analysts. Player cards are clickable → opens full profile. Non-player cards show "Join to connect" CTA |
| Advanced search | Full PlayerSearch component: filter by position, age group, region, nationality, foot, verified-only |
| CTA band | Join free call-to-action |
| Footer | Explore links, Join links by role, World Clock (London/New York/Tokyo/Lagos/Qatar) |

---

## 5. Community Feed

All authenticated users (all roles) can post to the Community Feed. Post types: **Update**, **Live**, **Training**.

- Posts can include optional photo and video attachments (uploaded to Supabase Storage `uploads` bucket)
- After any profile save, an **Activity-to-Feed prompt** appears offering to share the update to the feed
- Contact info (phone numbers, email addresses) is automatically blocked in captions
- Live and Training session posts require **verified** account status
- Player live sessions capped at 30 minutes

---

## 6. Jobs Board

Real column names in `public.jobs` table (verified from schema):

| Column | Purpose |
|---|---|
| `title` | Job title |
| `description` | Full description |
| `sport` | `football` or `basketball` |
| `job_type` | `player_needed` · `staff_needed` · `seeking_job` |
| `player_position` | Position sought (Player Needed jobs) |
| `staff_role` | Role sought (Staff Needed jobs) |
| `age_group` | `U13` · `U15` · `U17` · `U20` · `U23` · `Senior` |
| `region` | Geographic region |
| `salary_min` / `salary_max` | Budget range (integers) |
| `currency` | Currency code e.g. `GBP` |
| `application_deadline` | Date field |
| `status` | `open` · `closed` |
| `posted_by` | FK → `profiles.id` |

Work arrangements: `full_time` · `short_term` · `loan` · `internship`

---

## 7. Tryout Opportunities

Real column names in `public.opportunities` table (verified from schema):

| Column | Purpose |
|---|---|
| `title` | Opportunity title |
| `description` | Full description |
| `sport` | `football` or `basketball` |
| `type` | `tryout` or `player_search` |
| `position` | Position sought (text, not array) |
| `age_group` | e.g. `U23`, `Senior` |
| `region` | Geographic region |
| `venue` | Physical venue name |
| `tryout_date` | Single date field |
| `gender` | `male` · `female` · `mixed` |
| `fee_amount` | Integer (0 = free) |
| `fee_breakdown` | Text explanation of fee |
| `status` | `open` · `pending_approval` · `closed` · `rejected` |
| `is_fee_flagged` | Boolean — triggers admin review |
| `posted_by` | FK → `profiles.id` |

**No** `positions_needed`, `date_from`, `date_to`, or `is_free` columns.

Real column names in `public.feed_posts` table (verified from schema):

| Column | Purpose |
|---|---|
| `author_id` | FK → `profiles.id` (NOT `user_id`) |
| `sport` | `football` or `basketball` |
| `content` | Post text (NOT `caption`) |
| `media_urls` | JSONB array of media objects |
| `visibility` | `public` or `private` (NOT boolean `is_public`) |
| `status` | `draft` · `published` · `removed` |
| `is_training` | Boolean — marks training session post |
| `is_live` | Boolean — marks live session post |
| `is_pinned` | Boolean |
| `training_link` / `live_link` | External stream URL |
| `likes_count` / `comments_count` | Counters |

**No** `post_type`, `user_id`, `caption`, or `is_public` columns.

---

## 8. Payments

Payments are deliberately **inactive**:
- `PAYMENTS_ENABLED = false` in `frontend/src/lib/features.js`
- `BASKETBALL_ENABLED = false` in `frontend/src/lib/features.js`
- Plans page is informational only — no checkout flow, no webhook, no provider credentials
- Do not set `PAYMENTS_ENABLED = true` until: provider credentials, server-side checkout, webhook handling, database entitlement rules, testing and operational support are all in place

---

## 9. Admin Dashboard

Rebuilt admin UI (committed `a7577d4`) with:
- **6 stat cards**: Total users, New today, Players, Academies, Agents, Pending verification
- **Role distribution bar** showing proportional breakdown
- **Pill tab navigation**: Users · Verify · Duplicates · Fee-Flagged
- **Users table**: search, role change dropdown, Save + Suspend/Restore per row
- **Verification queue**: approve/reject with reviewer notes
- **Duplicate files**: SHA-256 hash matches shown with file type, user, date
- **Fee-flagged tryouts**: approve or reject with full breakdown shown

---

## 10. Data and Privacy

- Phone numbers and email addresses are **automatically blocked** in all public text fields (bio, achievements, captions) by `blockContactInfo()` in `uploadGuards.js`
- Contact unlock requires an active, identity-verified account — cannot target own profile
- Private documents (NIN, passports, contracts) stored in `private-documents` bucket — never served publicly
- SHA-256 duplicate detection is browser-computed; a determined client can fabricate a hash — production-grade detection requires server-side hashing in a Supabase Edge Function
- Password minimum: **12 characters** (enforced in signup form)
- Auth errors do not distinguish unknown accounts from wrong passwords
- Admin pages use bounded query limits (300 rows max) to protect database performance
- GPS / device location is **never collected** — country and region are self-reported only

---

## 11. SQL Files — Run Order

**Always run in this exact order in Supabase SQL Editor:**

| Order | File | What it does |
|---|---|---|
| 1 | `supabase/schema.sql` | Creates all 31+ tables, RLS policies, triggers, indexes, helper functions |
| 2 | `supabase/fix-roles.sql` | Patches `profiles_role_check` to include `sports_analyst`; patches `players_availability_check`; fixes any wrong user roles; verifies demo accounts |
| 3 | `supabase/seed.sql` | Inserts 50 international demo accounts — pure SQL, no PL/pgSQL blocks |
| Optional | `supabase/reset-passwords.sql` | Resets all demo account passwords if login stops working |

**Demo account password:** `Demo@SportBridge1!`
**Admin login:** `sportbridge.com.ng@gmail.com` / `SportBridge2026!`

### seed.sql — what it creates (v5, verified)

| Role | Count | Countries |
|---|---|---|
| Players | 28 | England, Brazil, France, Germany, Ghana, Morocco, Argentina, Senegal, Japan, South Korea, Spain, USA, Nigeria, Ukraine, Algeria, Mexico, Serbia, Egypt, Ivory Coast, Norway, Portugal, Iran, Colombia, Poland, Greece |
| Coaches / Managers | 6 | Brazil (Head Coach), Spain (Sporting Director), Italy (Asst Head Coach), Turkey (First Team Manager), Australia (S&C Coach), Serbia (Head Coach) |
| Sports Analysts | 4 | France (Performance), England (Video), Japan (Data), USA (Recruitment) |
| Agents / Scouts | 5 | Germany, Argentina, UAE, Netherlands, Ivory Coast |
| Academies / Clubs | 5 | England (Elite London FC), France (Academie Paris), Ghana (Ghana Football Institute), Portugal (Sporting Lisboa), Nigeria (Rivers United) |

---

## 12. Local Development

```powershell
# From repo root
cd frontend
npm install
npm run dev      # → http://localhost:5173/
npm run lint
npm run build
```

Required environment variables in `frontend/.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Never put a Supabase service-role key in the frontend.** Use only the publishable anon key.

---

## 13. Deployed Sites

| Site | Purpose | Supabase Project |
|---|---|---|
| `sportbridge.netlify.app` | Demo site — 50 international demo accounts | Project #1 (demo data) |
| `sportbridge.online` | Real site — clean database for real users | Project #2 (empty, real) |

### Connecting sportbridge.online

1. Netlify dashboard → add `sportbridge.online` as custom domain (and `www.sportbridge.online`)
2. Copy the exact DNS records Netlify shows → paste into registrar DNS settings
3. Wait for Netlify to confirm DNS and provision HTTPS
4. Supabase Auth → URL Configuration → set Site URL to `https://sportbridge.online` → add redirect URLs
5. Set Netlify environment variables to the **second Supabase project** URL and anon key
6. Never put a service-role key in Netlify environment variables

---

## 14. What Changed Since the Previous Guide

| Area | Change |
|---|---|
| Roles | `sports_analyst` added as a full 6th role with dedicated dashboard, sign-up card, translations and DB routing |
| Staff roles | Expanded from 10 to **35 specialisations** covering every coaching, management, analysis and scouting position |
| Community section | Home page now shows live Supabase member profiles for all guests — filterable by role with counts |
| Activity-to-Feed | Every dashboard (all 5 roles) now prompts to share profile saves and achievements to the Community Feed with optional media |
| i18n | Sports Analyst, all 35 staff role names, feed strings and community strings added to all 5 languages |
| Admin UI | Rebuilt with 6 stat cards, role distribution bar, new-today counter, pill tabs, improved verification queue |
| Encoding | All garbled box-drawing characters (`ΓöÇ`, `ΓÇö`, `ΓÇª`) replaced throughout — `— Select —`, `Saving…`, `Loading…` now display correctly |
| seed.sql | Rewritten (v5) — pure SQL, no PL/pgSQL, correct column names (`player_position`, `salary_min`, `application_deadline`), 50 accounts from 25+ countries |
| fix-roles.sql | Rewritten — no trigger disable (trigger may not exist), patches constraints directly, safe to run multiple times |
| Notifications + Inbox | Dashboard shell has top-level tabs for Dashboard / Notifications / Inbox for all roles |
| Dispute form | `DisputeForm.jsx` created with file upload support (PDF, video, image) |
| Player directory | Replaced old "Scout the next generation" header with "Who's on SportBridge / Meet the community" community section |
