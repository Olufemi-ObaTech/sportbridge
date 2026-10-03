# Supabase setup for SportBridge

1. Create a new Supabase project.
2. Open SQL Editor and run the contents of `schema.sql`.
3. Create an auth provider and note the project URL + anon key.
4. Add these environment variables to the Netlify frontend:

VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

5. Deploy the frontend to Netlify using the `frontend/netlify.toml` file.

This frontend is intentionally decoupled from the legacy Laravel app. The current Laravel codebase is not directly compatible with Supabase because it is built around Laravel/MySQL sessions, middleware, and Eloquent patterns.
