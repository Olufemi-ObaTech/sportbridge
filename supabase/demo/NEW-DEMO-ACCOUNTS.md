# SportBridge — Live Demo Accounts

All accounts registered directly on https://sportbridge.online
Password for all: `Demo@SportBridge1!`

| Role | Email | Password |
|------|-------|----------|
| 🏃 Player | marcus.thompson@sportbridge.online.demo | Demo@SportBridge1! |
| 🎽 Coach | carlos.mendes@sportbridge.online.demo | Demo@SportBridge1! |
| 🔍 Agent | scouting@sportbridge.online.demo | Demo@SportBridge1! |
| 🔍 Agent 2 | scoutingglobal-talent@sportbridge.online.demo | Demo@SportBridge1! |
| 🏟️ Academy | admin-elitelondonfcsportbridge.online.demo | Demo@SportBridge1! |
| 📊 Analyst | sophie.laurent@sportbridge.online.demo | Demo@SportBridge1! |
| 🛡️ Admin | sportbridge.online@gmail.com | (your password) |

## After registering — run this SQL to verify all accounts:

```sql
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_verification_fields;
UPDATE public.profiles
SET verification_status = 'verified', status = 'active'
WHERE email IN (
  'marcus.thompson@sportbridge.online.demo',
  'carlos.mendes@sportbridge.online.demo',
  'scouting@sportbridge.online.demo',
  'scoutingglobal-talent@sportbridge.online.demo',
  'admin-elitelondonfcsportbridge.online.demo',
  'sophie.laurent@sportbridge.online.demo'
);
ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_verification_fields;
```
