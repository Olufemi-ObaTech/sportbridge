# SportBridge system guide

This guide describes the current product behavior and the two application stacks in this repository. The React/Supabase application is the production product. The Laravel/MySQL application is a separate legacy implementation kept for local development and reference.

## 1. System architecture

### Production application

| Layer | Technology | Responsibility |
|---|---|---|
| Browser application | React 19, JavaScript modules, Vite 8 | Registration, profiles, search, jobs, tryouts, feed, inbox, and dashboards |
| Identity | Supabase Auth | User registration, sign-in, and session management |
| Database | Supabase PostgreSQL | Profiles, player and organization records, jobs, reports, verification, and application data |
| Authorization | PostgreSQL row-level security (RLS) and database functions | Enforce account ownership, role permissions, verified publishing, and admin-only review |
| File storage | Supabase Storage | Public media and private identity, license, and ownership evidence |
| Hosting | Netlify | Hosts the compiled single-page application |
| Source and CI | GitHub Actions | Source control and automated frontend/PHP checks |

The frontend source is in [`frontend/`](./frontend/). The canonical Supabase database definition is [`supabase/schema.sql`](./supabase/schema.sql). Hosting and environment setup are documented in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

### Legacy local application

The repository also contains Laravel 12, PHP 8.2+, Blade/Bootstrap, and MySQL code for local development. It uses local XAMPP MySQL databases and is **not** the production backend for the Netlify/Supabase application. The Laravel setup and its separate database behavior are described in [`README.md`](./README.md).

### Interface languages and responsive navigation

The frontend language selector offers English (default), French, Portuguese, Arabic, and Spanish. The selection is saved in the browser, updates the document language, and enables right-to-left direction for Arabic. Interface translations are served from the frontend's local catalog; user-generated profile and community content is not translated. New interface copy should be added to the catalog for every supported language. The Explore menu and language selector are keyboard dismissible and adapt to the mobile navigation layout.

## 2. Accounts, roles, and capabilities

Accounts have one primary role: **Player**, **Academy/Club**, **Agent/Scout**, **Coach/Manager**, or **Super Admin**. Coach specialties distinguish goalkeeper coaches, fitness coaches/physios, team managers, sporting directors, and related roles.

| Account | Main capabilities |
|---|---|
| Player | Build and edit a football profile, add appearances, goals, assists, clean sheets, pass accuracy, dribble success, and minutes played, upload highlights/CV, and add optional self-reported country/region; browse players and openings, apply for jobs, and express interest in tryouts. These statistics are player-reported, not independently verified by SportBridge. Players may host a live or training session only after verification, and the session duration cannot exceed 30 minutes. |
| Academy/Club | Maintain an academy/club profile, submit organization verification evidence, add roster players with ownership/contract and identity evidence, publish player-needed and staff-needed openings, and host verified live/training sessions. Roster entries remain private until an administrator approves the evidence. |
| Agent/Scout | Discover players, maintain a watchlist, manage access requests, and publish player-search/tryout opportunities where enabled. Agents/scouts submit identity and license evidence before receiving a verified badge. |
| Coach/Manager | Browse and apply for staff openings, submit coach/manager credentials, publish a job-seeking listing, recommend players to academies/clubs or agents, and host verified live/training sessions. |
| Super Admin | Review verification and roster evidence, approve or reject requests, manage account roles/statuses, review user reports, investigate scam reports, and moderate flagged tryout content. |

Public browsing and applications are not generally hidden behind verification. Verification is required for gated publishing and trust-sensitive actions. Current checks include job/job-seeking listings, tryouts/player searches, academy roster submissions, recommendations, and live/training sessions. The database RLS policies are intended to enforce the critical publishing restrictions in addition to the frontend controls.

## 3. Verification and badges

Verification is separate from account access status:

- **Account status** controls access: `active`, `pending`, `suspended`, or `denied`.
- **Verification status** records document review: `unverified`, `pending`, `verified`, or `rejected`.

Registration currently creates an active account; submitting verification documents does not itself approve the account or award a badge. An administrator reviews the submission and records approval or rejection. Private evidence is stored in the private documents bucket and is not intended to be served as a public profile asset.

Approved profiles display a role-aware badge, such as **Verified Player**, **FIFA TMS Verified Academy / Club**, **FIFA Agent Verified**, **Verified Scout**, **Verified Goalkeeper Coach**, **Verified Fitness Coach**, **Verified Team Manager**, or **Verified Sporting Director**. Public profile/search surfaces use a limited badge projection rather than exposing private profile data.

Verification is a human review workflow. A FIFA Agent ID or FIFA TMS identifier entered by an applicant is evidence for review; the application does not automatically query FIFA or FIFA TMS. Administrators must independently validate such credentials before awarding the corresponding badge.

Player verification additionally requires a public video explicitly classified as **Full Match**. The verification form checks for it, and the administrator approval function refuses approval if it is missing. Classification is an applicant-provided label; an administrator must inspect the footage and supporting documents. SHA-256 identifies byte-for-byte duplicate files; it does not prove that footage is complete, unedited, genuine, or owned by the applicant.

### Academy roster submissions

An active, verified academy/club can submit a player name, position, age, nationality, and country alongside:

1. Ownership evidence or a signed player contract.
2. A player passport or NIN identity document.

The roster row is created privately and is not published until an administrator reviews both documents. Rejected submissions stay unpublished. Identity and ownership evidence should remain in private storage.

## 4. Jobs, opportunities, and recommendations

The jobs board supports:

- **Player Needed** listings with position, age group, country, nationality, region, work arrangement, and optional budget/free-agent criteria.
- **Staff Needed** listings for coaching, goalkeeper coaching, fitness/physio, team management, sporting direction, scouting, and related roles.
- **Seeking Job** listings for professionals seeking a role.

Work arrangements include full-time, short-term, loan, and internship. Users can browse openings and eligible players can apply. Verified academies/clubs and agents/scouts can publish the relevant openings/opportunities. Verified coaches/managers can create job-seeking listings and recommend players to academies/clubs or agents.

Tryout and player-search opportunities include position, age group, region, event details, and optional fee information. Fee-bearing or fraud-flagged opportunities are sent to the administrator moderation queue rather than being published immediately.

Paid tryouts and known scam phrases are also forced into the review queue by a database trigger, so changing client-side fields cannot immediately publish them. Every public tryout card shows either that no fee is listed or a paid-tryout warning and any supplied fee breakdown. Verified organizers receive their role-aware badge on the card. SportBridge does not collect or guarantee organizer fees.

## 5. Live and training sessions

Verified active players, coaches, and academies can publish live/training session posts with an external join or stream link, optional start time, and duration.

- Player sessions are capped at **30 minutes** by both the interface and the database policy.
- Coach and academy sessions have no product-configured maximum duration. A positive duration is still required.
- Session publishing does not provide video streaming itself; the session link points to the provider selected by the host.
- Agents/scouts and unverified accounts cannot publish these session types.

## 6. Payments

The payment pathway is scaffolded but deliberately **inactive**:

- `PAYMENTS_ENABLED` is `false`.
- The plans page is informational and checkout is unavailable.
- No payment provider checkout, webhook, or entitlement update is active.
- Do not enable the flag until provider credentials, server-side checkout, signed webhook handling, database entitlement rules, testing, and operational support are in place.

## 7. Admin operations and trust & safety

The Super Admin dashboard provides:

- Exact total-account, new-today, and per-role counts, plus a paginated account list.
- Account role changes and account status actions.
- A verification queue for user documents and academy player ownership/identity evidence.
- A report queue with investigation notes and outcomes.
- Moderation queues for duplicate uploads and flagged tryouts.

Administrators can approve/reject verification submissions, suspend/reactivate accounts, and investigate reports. A confirmed-scam outcome requires investigation notes, sets the reported profile to `denied`, blocks application access, and retains the account and report history. It does **not** permanently delete the account. Report dismissal does not disable the account.

The account counts include all profiles, including non-active accounts. The user table is paginated and can search across all accounts by name, email, role, country, or region. Location is optional, self-reported country/region only; the system does not collect GPS or precise location. Administrators can deny active accounts, suspend them, and reactivate denied or suspended accounts. Confirmed scam investigations disable rather than permanently delete accounts so that reports and investigation history remain available.

## 8. Data and privacy boundaries

The Supabase schema includes profiles, players, academy/agent/coach profiles, jobs, applications, opportunities, feed posts, messages, verification requests, academy-player verifications, reports, uploads, contact-unlock requests, and admin logs. RLS is used to restrict reads and writes by ownership, role, account status, and administrator privileges.

Verification identifiers and document paths are sensitive. Private evidence belongs in the `private-documents` bucket and should only be accessed by the submitting account and authorized administrators. Public badge and profile views should contain only the fields required for discovery; do not expose contact details, identity numbers, or private document paths through a public view. Country and region are self-reported and visible to administrators for account management, not collected from device location services.

Contact-unlock requests require an active, identity-verified account at the database policy layer and cannot target the requester's own player profile. The current test build does not reveal phone numbers or email addresses, does not implement direct messaging from the player page, and does not charge for unlocks. Payments remain inactive.

The browser computes each file's SHA-256 hash, then calls narrowly scoped database functions to check/record the hash without exposing another uploader's account or storage path. Database locking prevents concurrent registrations through the supported upload flow. Because a public browser client can be modified, the database does not independently hash the uploaded bytes; a determined client can submit a fabricated hash. A production-grade tamper-resistant detector requires server-side hashing in a trusted upload/Edge Function.

The browser registration form requires passwords of at least 12 characters, and authentication errors avoid distinguishing unknown accounts from incorrect credentials. This client-side minimum does not replace configuring an equivalent password policy, email confirmation, rate limits, and any desired MFA in the Supabase Auth project.

Admin account pages and moderation queues use bounded pagination/query sizes to protect database performance and prevent unbounded reads. These safeguards are intentional; the user directory supports exact totals and cross-page search rather than fetching every row at once.

SportBridge is a discovery and recruitment platform, not a party to agreements between users and not a payment intermediary while payments are disabled. A verified badge indicates that a review was recorded; it is not a guarantee of performance or a substitute for independent due diligence.

## 9. Local development and checks

Requirements for the production frontend are Node.js and npm. From the repository root:

```powershell
Push-Location frontend
npm install
npm run dev
npm run lint
npm run build
Pop-Location
```

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for local frontend builds. Use only a Supabase anon/publishable key in browser code; never put a service-role key in the frontend.

The Supabase schema file is the source for database changes. On an existing project, apply [`supabase/fix-public-badge-relationships.sql`](./supabase/fix-public-badge-relationships.sql) after the base schema so PostgREST can embed public verification badges in player search, jobs, feed, and tryout results. This patch first creates the `public_profile_badges` view and the profile fields it needs; this avoids PostgreSQL error `42704` when a relationship function references the missing view row type. Then apply [`supabase/trust-safety-upgrade.sql`](./supabase/trust-safety-upgrade.sql) to add the full-match video gate, private/atomic hash registration, contact-unlock identity policy, organizer badges, and fee-moderation trigger. It installs the `current_user_is_verified()`, `profile_is_active(uuid)`, and `current_user_is_admin()` helper functions before policies that use them, avoiding `42883` on older installations. It also grants the player columns selected by Explore and public profiles; re-run this updated script to apply the grant fix. The project owner reports that the earlier versions of both upgrade scripts ran successfully in Supabase; this session has not independently queried the remote migration state.

After the database upgrades, test: player full-match upload and approval rejection/acceptance; verified and unverified contact-unlock requests; same-account and cross-account file hashes; simultaneous duplicate uploads; paid/scam-phrase listing moderation and admin approval; and all five languages and small-screen layouts. Then run `npm run lint` and `npm run build` from `frontend/`. Successful SQL execution alone does not validate all end-to-end flows.

For the legacy Laravel checks and setup, see [`README.md`](./README.md). For production hosting and Supabase project setup, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## 10. Connecting `Sportbridge.online`

DNS for the domain was not resolving when this guide was updated. Once the site is published:

1. In the Netlify site dashboard, add `sportbridge.online` as the custom domain and add `www.sportbridge.online` if both names should work.
2. Copy the exact DNS records Netlify displays into the domain registrar's DNS settings. Do not reuse guessed IP addresses or CNAME targets; Netlify's required values can vary by site and account.
3. Remove conflicting records only after confirming they are not used by email or other services. Choose the preferred canonical hostname and configure the other hostname to redirect to it in Netlify.
4. Wait for Netlify to confirm DNS and provision HTTPS. Test both hostnames and the redirect in a browser.
5. In Supabase Auth URL configuration, set the production Site URL to the chosen HTTPS hostname and add the production callback/redirect URLs (including the `www` hostname if used) to the allowed redirect list. Update OAuth provider callback settings if any are enabled.
6. Confirm the production Netlify environment contains only the intended Supabase project URL and public/publishable key. Never add a Supabase service-role key to frontend environment variables.
