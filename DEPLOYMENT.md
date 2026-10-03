# SportBridge deployment

## Production architecture

- GitHub repository: `Olufemi-ObaTech/sportbridge`, production branch `main`.
- Netlify site: `sportbridgeng`, builds `frontend/` and publishes `frontend/dist` using the root `netlify.toml`.
- Supabase provides Postgres, authentication, and row-level security. Netlify does not run the legacy Laravel/PHP application.

The React frontend currently supports player and opportunity browsing plus Supabase email/password authentication. Laravel features have not all been migrated to this frontend.

## GitHub and Netlify

The Netlify site should be connected to the GitHub repository above with `main` as its production branch. Each successful push to `main` triggers a Netlify build. GitHub Actions runs PHP tests/style checks and React lint/build checks before merge or after push.

```powershell
git add DEPLOYMENT.md README.md .github/workflows/ci.yml frontend netlify.toml supabase
git commit -m "Build SportBridge Netlify and Supabase frontend"
git push origin main
```

Never commit `.env`, `.env.local`, access tokens, database passwords, or Supabase secret/service-role keys.

## Supabase setup

1. Open the intended project in Supabase and select **SQL Editor → New query**.
2. Paste and run `supabase/schema.sql`. This creates the tables and row-level security policies, provisions public player display names without exposing profile email addresses, and creates a listing when a player registers. It is safe to run again.
3. In **Project Settings → API**, copy the Project URL and public anon/publishable key. Confirm the key belongs to this project before deploying; never use the service-role/secret key in browser or Netlify variables.
4. In Netlify `sportbridgeng` → **Project configuration → Environment variables**, add these values for Production, Deploy Previews, and Local development as applicable:

   ```text
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<public-anon-or-publishable-key>
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_ANON_KEY=<public-anon-or-publishable-key>
   ```

   The `VITE_` variables are embedded in the frontend build. The unprefixed pair is used only by the Netlify health function. Use the same project URL and public key for each pair; do not use a service-role key.
5. In **Authentication → URL Configuration**, set the Site URL to the Netlify production URL and add the production URL, deploy-preview URL pattern, and final custom domain to the redirect allow list.
6. Redeploy after changing variables. Verify the home page shows live listings and the health function returns HTTP 200. A frontend build alone does not prove database access.

## Custom domain activation

The domain must first be registered and delegated at its registrar. Add both `sportbridge.com.ng` and `www.sportbridge.com.ng` to the Netlify site, then configure exactly the A/ALIAS/CNAME records Netlify displays for the account. Do not copy guessed IP addresses from old instructions. The domain currently returns `NXDOMAIN`; no redirect or TLS certificate can work until DNS resolves.

After DNS resolves, set the primary domain in Netlify, wait for its HTTPS certificate, then add `https://www.sportbridge.com.ng` to Supabase's Site URL and redirect allow list. Verify both apex and `www` URLs over HTTPS.

## Email and SMS activation

The static React frontend must not send SMTP directly. Brevo SMTP is for email and does not enable SMS. The current React/Supabase app has no email-notification or SMS-sending endpoint yet.

Before activating SMS, choose an SMS provider/API, enable billing and the destination countries, register/approve a sender ID where required, and define consent, rate limits, and message templates. Implement sending in a Netlify Function or Supabase Edge Function using a server-only secret; never expose provider credentials in `VITE_*` values. Then test a single opted-in number and delivery receipt.

For transactional email, verify the sender in Brevo. To send from the custom domain, publish Brevo's domain-verification, SPF, and DKIM DNS records at the registrar. The Gmail address `sportbridge.com.ng@gmail.com` must be added and verified as a Brevo sender; it does not authenticate ownership of `sportbridge.com.ng`. Do not send until Brevo reports the sender as verified.

## Local checks

```powershell
Push-Location frontend
npm ci
npm run lint
npm run build
Pop-Location

vendor/bin/pint --test
vendor/bin/phpunit
```
