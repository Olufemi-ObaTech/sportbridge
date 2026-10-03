# SportBridge Supabase setup

`schema.sql` is the complete initial Supabase schema for the Netlify app. It is designed to be re-runnable and creates the account/profile, academy, agent, coach, player/team, media, feed, jobs/applications, watchlists, access requests, conversations/messages, ratings/recommendations, reports/admin logs, saved searches, trials/try-outs, push subscription, and storage structures. Row-level security is enabled on all public tables.

## Apply the schema

1. Back up any existing Supabase project data before changing a live project.
2. In the intended Supabase project, open **SQL Editor → New query**.
3. Copy the entire contents of this file, paste it into the editor, and run it.
4. Confirm the query completes and check **Table Editor** for the tables. In **Storage**, confirm `public-media` and `private-documents` exist.
5. In **Project Settings → API**, copy the Project URL and public anon/publishable key. Do not use a service-role/secret key in the browser.

## First administrator

1. Create and confirm an account through the app first so its `auth.users` and `public.profiles` rows exist.
2. In SQL Editor, promote only that account by replacing the email below with the exact admin email:

	```sql
	update public.profiles
	set role = 'super_admin', updated_at = now()
	where email = 'admin@example.com';
	```

3. Confirm exactly one row was updated. Public sign-up metadata cannot grant `super_admin`; users cannot change their own role/status through the app.

## Security and storage

- `profiles.email`, phone, role, status, and private fields are not publicly readable. Profile owners can update allowed personal fields; admins can moderate accounts.
- Player, club, agent, coach, feed, and job listings are visible only when explicitly public/active. Player profiles default to private until the owner opts in.
- CVs, identity/license documents, and private notes belong in `private-documents`, which is not a public bucket. Store objects under `<auth-user-id>/<file-name>` and issue signed URLs only after authorization.
- `public-media` is intentionally public for assets users choose to display publicly. Upload under `<auth-user-id>/<file-name>` and mark metadata `visibility = 'public'`.
- `private-media` stores owner-only images/videos. It is not a public bucket; store objects under `<auth-user-id>/<file-name>`.
- Never put CVs, identity documents, licenses, credentials, or private messages in `public-media`. Store documents in `private-documents`; the schema rejects document metadata that points to the public bucket.
- Conversations/messages, applications, watchlists, saved searches, access requests, push tokens, and reports are restricted to their owners/participants or administrators as appropriate.
- The browser receives only the anon/publishable key. Never expose `SUPABASE_SERVICE_ROLE_KEY` or provider credentials in `VITE_*` variables.

## Netlify variables

Configure these in Netlify for the frontend build and health function, then redeploy:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-or-publishable-key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<public-anon-or-publishable-key>
```

The two `VITE_` values are embedded in the React build. The unprefixed pair is used by the Netlify health function. Use the same project and public key for both pairs.

## Migration boundary

This schema is the Supabase backend contract for the Netlify frontend; it does not automatically migrate existing Laravel/MySQL records. Export/import legacy data separately after mapping and reviewing privacy fields. Apply schema changes in versioned SQL migrations and keep `schema.sql` as the complete fresh-project setup script.
