# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## SportBridge setup

This React/Vite app is hosted by Netlify. Supabase Auth and Postgres back its account dashboard, player directory, and role-aware admin dashboard. The complete data model, RLS, and storage setup is in `../supabase/schema.sql` and `../supabase/README.md`.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the project URL and public anon/publishable key. Never use a service-role key in the frontend.
3. Apply the complete `../supabase/schema.sql` in Supabase SQL Editor and configure Auth redirect URLs.
4. Run `npm ci` and `npm run dev` from this directory.

Sign up from the home page, confirm email if required, and sign in to open the dashboard. Player profiles are private until owners opt in to directory visibility. The admin dashboard requires `profiles.role = 'super_admin'`; bootstrap the first admin using the SQL instructions in `../supabase/README.md`.

The root `netlify.toml` builds this app and publishes `dist`. Netlify needs all four Supabase variables documented in `../supabase/README.md`. The legacy Laravel/PHP application is not run by Netlify.
