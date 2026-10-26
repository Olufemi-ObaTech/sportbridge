# SportBridge deployment

## Production architecture

| Service | Role |
|---|---|
| **GitHub** — `Olufemi-ObaTech/sportbridge`, branch `main` | Source of truth. Every push triggers CI (PHP tests + React lint/build). |
| **Netlify** — site `sportbridgeng` | Hosts the compiled React/Vite SPA from `frontend/dist`. Builds on every push to `main`. |
| **Supabase** — project `pzfohowzaeunywaqukwe` | Postgres database, Auth, RLS, and Storage. |
| **XAMPP MySQL** (local only) | Three local databases: `football_connect`, `football_connect_basketball`, `football_connect_admin`. Used by the legacy Laravel app during development. |

The React frontend in `frontend/` is the production app. The Laravel/PHP application is retained for local development only and is **not** deployed via Netlify.

---

## Step 1 — Supabase

1. Open **[https://supabase.com/dashboard/project/pzfohowzaeunywaqukwe](https://supabase.com/dashboard/project/pzfohowzaeunywaqukwe)**.
2. Go to **SQL Editor → New query**. Paste the entire contents of `supabase/schema.sql` and click **Run**. This is idempotent — safe to re-run.
3. Go to **Project Settings → API**. Copy:
   - **Project URL** — `https://pzfohowzaeunywaqukwe.supabase.co` (already set in the codebase)
   - **anon / public key** — the `eyJ...` token labelled *anon* or *publishable*. **Do not copy the service_role key.**
4. Go to **Authentication → URL Configuration**:
   - Set **Site URL** to `https://sportbridge.online`
   - Add to **Redirect URLs**:
     ```
     https://sportbridge.online/**
     https://www.sportbridge.online/**
     https://*.netlify.app/**
     http://localhost:5173/**
     ```
5. Go to **Storage** and confirm three buckets exist: `public-media`, `private-media`, `private-documents`. If not, the schema.sql run in step 2 creates them automatically.

---

## Step 2 — Netlify environment variables

In **Netlify → Site configuration → Environment variables**, create the following for scope **All** (Production + Deploy Previews):

| Variable | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://pzfohowzaeunywaqukwe.supabase.co` | Embedded in the browser bundle at build time |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key from Supabase) | Embedded in the browser bundle — use the anon key only |
| `SUPABASE_URL` | `https://pzfohowzaeunywaqukwe.supabase.co` | Used by the Netlify health function (server-side) |
| `SUPABASE_ANON_KEY` | `eyJ...` (same anon key) | Used by the Netlify health function (server-side) |

After saving, **trigger a redeploy** (Deploys → Trigger deploy → Deploy site). Verify:
- The site loads at your Netlify URL and shows the SportBridge home page.
- `https://<your-site>.netlify.app/.netlify/functions/supabase-health` returns `{"ok":true,"status":200}`.

---

## Step 3 — GitHub secrets (for CI builds)

In **GitHub → repo Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value |
|---|---|
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key from Supabase) |

This lets the GitHub Actions `build-frontend` job build with real credentials so the CI build matches the Netlify production build exactly. The `VITE_SUPABASE_URL` is non-secret and is hardcoded in the workflow.

---

## Step 4 — Link Netlify to GitHub

Netlify should already be connected. If not:
1. **Netlify → Sites → sportbridgeng → Site configuration → Build & deploy → Continuous deployment**.
2. Click **Link to a Git provider**, choose GitHub, and select `Olufemi-ObaTech/sportbridge`.
3. Set **Branch to deploy** to `main`.
4. Build command: `cd frontend && npm ci && npm run build`
5. Publish directory: `frontend/dist`

Every push to `main` on GitHub now triggers both:
- **GitHub Actions CI** — runs PHP tests + Pint + React lint + React build
- **Netlify** — deploys the new frontend to production

---

## Step 5 — Custom domain (`sportbridge.online`)

Add `sportbridge.online` and `www.sportbridge.online` to the `sportbridgeng` site's domain management page. Set `sportbridge.online` as the primary hostname if both should be used. Netlify manages HTTPS and the redirect from the alternate hostname.

At your domain registrar:
1. Copy the exact DNS records shown by Netlify after adding the domains. Do not guess A/ALIAS/CNAME targets; they can vary by site and provider.
2. Add the records in the registrar's DNS settings. Preserve unrelated records such as email MX/TXT records.
3. Wait for DNS propagation, then confirm Netlify reports the domain as verified and provisions a TLS certificate.
4. In **Supabase → Auth → URL Configuration**, set `https://sportbridge.online` as the Site URL and allow both production hostnames as redirect URLs.

---

## Step 6 — First admin account

After running `schema.sql` in Supabase:

1. Register an account through the SportBridge frontend using the email you want as super admin.
2. Confirm the email in your inbox.
3. In the Supabase **SQL Editor** run:

```sql
update public.profiles
set role = 'super_admin'
where email = 'your-admin@email.com';
```

4. Sign back in — the dashboard will show the admin panel.

---

## Local MySQL databases (Laravel dev only)

All three databases are confirmed present on XAMPP:

| Database | Tables | Purpose |
|---|---|---|
| `football_connect` | 40 | Main app (users, players, jobs, feed, chat, …) |
| `football_connect_basketball` | 9 | Basketball-specific tables (separate DB by design) |
| `football_connect_admin` | 2 | Super Admin reporting snapshot |

The `.env` file already points at these with `DB_USERNAME=root` and no password (default XAMPP). All migrations are fully applied — `php artisan migrate:status` shows zero pending.

---

## Local checks before pushing

```powershell
# Frontend
Push-Location frontend
npm ci
npm run lint
npm run build
Pop-Location

# Laravel
vendor/bin/pint --test
vendor/bin/phpunit
```

---

## What the health function checks

`GET /.netlify/functions/supabase-health` pings `https://pzfohowzaeunywaqukwe.supabase.co/auth/v1/health`.

- Returns `{"ok":true,"status":200}` when Supabase is reachable and env vars are set.
- Returns `{"ok":false,"error":"Supabase environment is not configured."}` (HTTP 503) when `SUPABASE_URL` or `SUPABASE_ANON_KEY` are missing from Netlify — this is the current state until you add the env vars.
