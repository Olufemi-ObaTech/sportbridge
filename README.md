# SportBridge

A multi-sport (football & basketball) talent and recruitment platform connecting **Academies/Clubs**, **Agents/Scouts**, and **Coaches/Managers**. Academies showcase players and post jobs. Agents discover players and request access to full profiles. Coaches browse and apply to jobs. A Super Admin moderates every account and piece of content.

Built with Laravel 11, MySQL, Bootstrap 5.3, and vanilla ES6 — no frontend framework.

## Stack

| Layer | Choice |
|---|---|
| Framework | Laravel 11, PHP 8.2+ |
| Database | MySQL 8, Eloquent |
| Frontend | Bootstrap 5.3 (CDN), Vanilla ES6 modules |
| Auth | Laravel Breeze (Blade) + role middleware + Policies |
| Storage | `public` disk (dev), S3-ready |
| Images | Intervention Image v3, queued WebP thumbnails |
| Excel/CSV | maatwebsite/excel |
| Real-time | Laravel Echo + Pusher, with a 5s polling fallback |
| Queues | Database driver |
| Testing | PHPUnit (SQLite in-memory) |

## Requirements

- PHP 8.2+ with the `pdo_mysql`, `pdo_sqlite` (for tests), `gd`, and `zip` extensions enabled
- Composer 2.x
- Node.js 18+ / npm
- MySQL 8

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your MySQL credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), then create all three physical databases — football, basketball, and the Super Admin's own reporting database (see "Three databases, on purpose" below):

```sql
CREATE DATABASE sportbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE sportbridge_basketball CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE sportbridge_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Continue setup:

```bash
php artisan migrate --seed
php artisan storage:link
```

### Three databases, on purpose

Football and basketball data live in two physically separate MySQL databases (`DB_DATABASE` / `DB_BASKETBALL_DATABASE`) behind one Laravel app — see `config/database.php`. A third, `DB_ADMIN_DATABASE`, holds a **read-only reporting snapshot** for the Super Admin only: every user record, split into a `football_user_records` table and a `basketball_user_records` table. It is never written to live by the app — rebuild it on demand from `/admin/data-records` or:

```bash
php artisan admin:sync-user-records
```

`php artisan migrate:fresh` only drops tables on the *default* connection, which silently breaks the basketball and admin databases (they're left in place, so the next migration run fails with "table already exists"). Use this project's own command instead, which drops and rebuilds all three:

```bash
php artisan db:fresh-all --seed
```

`migrate --seed` runs `AdminSeeder` (creates the super admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`) and `DemoSeeder` (3 academies, 5 agents, 8 coaches, ~40 players, 10 job posts, sample feed activity, plus one pending/suspended account per role so the moderation queue isn't empty). All seeded demo users share the password `password`; the super admin uses `ADMIN_PASSWORD`.

Run the app (in separate terminals):

```bash
php artisan serve
php artisan queue:work
npm run dev
```

Or all at once:

```bash
composer run dev
```

Visit `http://localhost:8000`. Log in as the seeded super admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`) to review pending registrations, or register a new Academy/Agent/Coach account to see the pending-review holding page.

## Running tests

```bash
php artisan test
```

Tests run against an in-memory SQLite database (configured in `phpunit.xml`) and don't touch your development MySQL database. Coverage includes: each registration flow, role-based route access (e.g. a coach hitting `/admin` gets 403), player CRUD authorization, job application uniqueness, message authorization, and admin approve/deny.

## Code style

```bash
./vendor/bin/pint
```

Laravel Pint enforces PSR-12. Run it before committing.

## Real-time chat

Chat falls back to 5-second polling (`/api/conversations/{id}/poll`) out of the box — no extra setup needed. To enable real-time delivery via Pusher, set these in `.env` and rebuild assets:

```
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=...
PUSHER_APP_KEY=...
PUSHER_APP_SECRET=...
PUSHER_APP_CLUSTER=...
```

`resources/js/echo.js` only initializes Laravel Echo when `VITE_PUSHER_APP_KEY` is present, so leaving it blank keeps the app on the polling path.

## Project structure notes

- **Roles**: `super_admin`, `academy`, `agent`, `coach`, `player` — see `App\Models\User` constants.
- **Statuses**: `pending`, `active`, `suspended`, `denied`. Registration has no approval gate — every role goes `active` immediately (`App\Services\RegistrationService`); `pending`/`denied` exist for accounts a Super Admin has manually reviewed and acted on. `App\Http\Middleware\CheckUserStatus` logs out suspended/denied users on their next request, and `App\Http\Middleware\EnsureAccountIsActive` keeps pending users on the read-only holding page instead of their role dashboard.
- **Authorization**: every write route is covered by a Form Request (`app/Http/Requests`) plus a Policy (`app/Policies`), registered in `App\Providers\AuthServiceProvider`.
- **Business logic**: lives in `app/Services`, not controllers (registration, moderation, reports, access requests, job applications, image handling, YouTube URL parsing, Excel import, profile completeness).
- **Sensitive documents** (license certificates, ID documents, CVs, agent supporting documents) are stored on the private `local` disk and served only through signed, authorization-checked routes in `App\Http\Controllers\DocumentController` — never a public URL.
- **Navigation**: the dashboard sidebar is data-driven from `config/navigation.php`, keyed by role.

## Trust & safety

- **Complaints**: any active user can report another account (`/users/{user}/report`) with a reason and optional details. Filing a report never changes the account's status automatically — it's purely a signal that lands in the Super Admin's queue at `/admin/reports` and by email/database notification. A Super Admin investigates and decides whether to suspend, deny, or dismiss using the normal moderation actions, then marks the report(s) actioned. See `App\Services\ReportService`.
- **Agent ratings require a real interaction**: a user can only leave a star rating on an agent if they've either messaged that agent or had an access request the agent granted (`AgentProfile::hasProvidedServiceTo()`) — an existing rating can always be updated. Recommendations (referring a player *to* an agent) are intentionally not gated the same way, since that feature is about introducing new talent, not reviewing past service.
- **Agent supporting documents**: agents can upload additional verification documents (licenses, certificates) from their dashboard, viewable only by themselves and Super Admin (`App\Http\Controllers\AgentDocumentController`).

## Deployment notes

1. **Environment**: set `APP_ENV=production`, `APP_DEBUG=false`, and `SESSION_SECURE_COOKIE=true` (requires HTTPS).
2. **Storage**: switch `FILESYSTEM_DISK=s3` and fill in the `AWS_*` variables in `config/filesystems.php`'s `s3` disk. Private documents should move to a private S3 bucket/prefix — update `DocumentController` if you introduce a second private disk.
3. **Queue**: run a persistent worker (`php artisan queue:work --daemon`) under a process supervisor (Supervisor, systemd) — thumbnail generation and all notification emails are queued.
4. **Cache/route/view caching**: run `php artisan config:cache route:cache view:cache` as part of your deploy step, and clear them again before the next deploy.
5. **Build assets**: run `npm run build` during deploy (do not ship `npm run dev`/HMR to production).
6. **Migrations**: run `php artisan migrate --force` (never run `--seed` against production — `DemoSeeder` is for local/demo environments only; never run `db:fresh-all` against production either, it drops every table across all three databases). Run `AdminSeeder` once, manually, with a strong `ADMIN_PASSWORD`, then rotate it. Schedule `php artisan admin:sync-user-records` (or trigger it from `/admin/data-records`) periodically to keep the Super Admin's reporting snapshot current.
7. **Mail**: point `MAIL_MAILER` at a real transactional provider (Postmark, SES, etc.) — registration/moderation/job-application notifications all send email.
8. **Broadcasting**: configure real Pusher (or a Pusher-protocol-compatible) credentials if you want live chat instead of the polling fallback.
9. **HTTPS**: terminate TLS in front of the app (load balancer/reverse proxy) and ensure `APP_URL` matches the public HTTPS URL so signed document links and asset URLs resolve correctly.
