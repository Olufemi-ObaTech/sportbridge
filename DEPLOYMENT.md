# Deploying SportBridge

Three services, each doing one job:

| Service | Job |
|---|---|
| **GitHub** | Source control. Pushing to `main` triggers Railway and Netlify automatically once they're connected (Section 3). `.github/workflows/ci.yml` also runs tests + Pint on every push/PR as a quality gate. |
| **Railway** | Runs the actual Laravel app (PHP/Apache via `Dockerfile`) and hosts the two MySQL databases (`sportbridge` + `sportbridge_basketball`). |
| **Netlify** | Hosts only the compiled CSS/JS (`public/build`) as a static CDN. Optional — the app works fine without it (Railway serves assets itself as a fallback), this just offloads static asset delivery to a CDN. |

Netlify cannot run the Laravel app itself — it has no PHP runtime, only static hosting and JS functions. That split is why Railway exists in this picture at all.

## 1. Push to GitHub

```bash
git add -A
git commit -m "Prepare SportBridge for deployment"
git remote add origin https://github.com/<you>/sportbridge.git
git push -u origin main
```

## 2. Railway — the app + all three databases

1. **New Project → Deploy from GitHub repo**, pick this repo. Railway detects `railway.json` and builds from the `Dockerfile` automatically.
2. **Add a MySQL database**: `+ New → Database → MySQL`. Railway provisions one MySQL instance with one default database.
3. **Create the second and third databases on that same instance** — basketball, and the Super Admin's own read-only reporting database. Open the MySQL plugin's `Data` tab (or connect with the credentials Railway shows you) and run:
   ```sql
   CREATE DATABASE sportbridge_basketball CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE sportbridge_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   Football's and basketball's tables must stay in two physically separate databases (see `config/database.php`'s `mysql_basketball` connection) — one database with two apps' worth of tables is not the same thing and migrations will collide. The admin database is separate again: it holds a rebuildable snapshot only, not live application data (see `App\Console\Commands\SyncAdminUserRecords`).
4. **Set environment variables** on the app service (Railway → your service → Variables). Reference the MySQL plugin's variables with Railway's `${{ MySQL.VARNAME }}` syntax so you don't hand-copy credentials:

   ```
   APP_NAME=SportBridge
   APP_ENV=production
   APP_KEY=                          # generate below, don't leave blank
   APP_DEBUG=false
   APP_URL=https://<your-app>.up.railway.app

   DB_CONNECTION=mysql
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_DATABASE=${{MySQL.MYSQLDATABASE}}
   DB_USERNAME=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

   DB_BASKETBALL_DATABASE=sportbridge_basketball
   DB_ADMIN_DATABASE=sportbridge_admin
   # DB_BASKETBALL_*/DB_ADMIN_* HOST/PORT/USERNAME/PASSWORD all fall back to the
   # DB_* values above automatically (see config/database.php) - only the
   # database name differs.

   SESSION_SECURE_COOKIE=true
   FILESYSTEM_DISK=public             # switch to s3 + fill AWS_* once you have a bucket
   QUEUE_CONNECTION=database
   MAIL_MAILER=log                    # point at a real provider before going live for real users

   ADMIN_NAME="Platform Admin"
   ADMIN_EMAIL=admin@sportbridge.test # change this
   ADMIN_PASSWORD=                    # set a strong password, don't leave the repo default

   # Only needed if you deploy the Netlify asset CDN in Section 4:
   # ASSET_URL=https://sportbridge-assets.netlify.app
   ```

   Generate `APP_KEY` once locally and paste the value in:
   ```bash
   php artisan key:generate --show
   ```

5. **Deploy.** Railway builds the `Dockerfile`, and `docker/entrypoint.sh` runs `php artisan migrate --force` against *both* databases automatically on every deploy before the server starts (safe to re-run — it only applies new migrations).
6. **Seed once, manually**, after the first successful deploy (Railway → service → the `⋮` menu → **Run Command**, or `railway run` from the CLI):
   ```bash
   php artisan db:seed --force
   ```
   Don't run `db:fresh-all` against production after real users exist — it drops every table. It's a local/staging reset tool only.
7. **Custom domain** (optional): Railway → Settings → Domains → add your domain, update `APP_URL` to match, and point your DNS CNAME at the address Railway gives you.

## 3. Connect GitHub for auto-deploy

Already done as part of step 2.1 — Railway's GitHub integration redeploys automatically on every push to `main`. No separate deploy action is needed; `.github/workflows/ci.yml` runs tests independently as a status check, it does not push to Railway itself.

## 4. Netlify — optional static asset CDN

1. **Add new site → Import an existing project**, pick the same GitHub repo. Netlify reads `netlify.toml` automatically (`npm ci && npm run build`, publishes `public/build`).
2. Once it deploys, copy the site URL (e.g. `https://sportbridge-assets.netlify.app`).
3. Back in Railway, set `ASSET_URL=https://sportbridge-assets.netlify.app` and redeploy. Laravel's `@vite()` directive (in `resources/views/layouts/partials/head.blade.php`) resolves asset URLs through `ASSET_URL` automatically — no code changes needed. Leave `ASSET_URL` unset and the app just serves its own compiled assets from Railway instead; nothing breaks either way.

## 5. Verify

```bash
curl -I https://<your-railway-domain>/up      # Laravel's health check route, should be 200
```

Log in with the credentials below, click through a dashboard for each role, post to the feed, and check `/admin` as the super admin.

## Local development reset

To rebuild both databases from scratch locally (this project's custom fix for the fact that Laravel's own `migrate:fresh` only drops tables on the *default* connection and silently leaves the basketball database's tables in place):

```bash
php artisan db:fresh-all --seed
```
