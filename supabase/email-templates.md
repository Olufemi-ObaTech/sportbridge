# SportBridge — Supabase Email Templates

Paste each HTML block into:
**Supabase → Authentication → Emails → [template name]**

---

## 1. Confirm signup

**Subject:** Confirm your SportBridge account

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirm your SportBridge account</title>
</head>
<body style="margin:0;padding:0;background:#050B1F;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050B1F;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0A1633;border-radius:12px;overflow:hidden;border:1px solid rgba(245,179,1,.2);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0B2B6B,#1B54D6);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-.5px;">
            Sport<span style="background:linear-gradient(135deg,#FFCC33,#F5B301);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Bridge</span>
          </div>
          <div style="color:rgba(255,255,255,.7);font-size:13px;margin-top:4px;">Nigeria's #1 Verified Football Network</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">Confirm your account</h1>
          <p style="color:rgba(247,249,248,.78);font-size:15px;line-height:1.6;margin:0 0 24px;">
            You're one step away from joining Nigeria's most trusted football network.
            Click the button below to confirm your email address and activate your account.
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="{{ .ConfirmationURL }}"
              style="display:inline-block;background:linear-gradient(135deg,#FFCC33,#F5B301);color:#050B1F;font-weight:700;font-size:16px;padding:14px 40px;border-radius:10px;text-decoration:none;">
              Confirm my account
            </a>
          </div>

          <p style="color:rgba(247,249,248,.45);font-size:13px;line-height:1.6;margin:0;">
            This link expires in 24 hours. If you didn't create a SportBridge account, you can safely ignore this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
          <p style="color:rgba(247,249,248,.35);font-size:12px;margin:0;">
            SportBridge · Nigeria's verified football network<br />
            <a href="https://sportbridge-ng-com.netlify.app" style="color:rgba(245,179,1,.7);text-decoration:none;">sportbridge-ng-com.netlify.app</a>
          </p>
          <p style="color:rgba(247,249,248,.25);font-size:11px;margin:8px 0 0;">
            SportBridge never charges players a registration fee. Never send money to arrange a trial.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 2. Reset password

**Subject:** Reset your SportBridge password

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#050B1F;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050B1F;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0A1633;border-radius:12px;overflow:hidden;border:1px solid rgba(245,179,1,.2);">

        <tr><td style="background:linear-gradient(135deg,#0B2B6B,#1B54D6);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;">
            Sport<span style="background:linear-gradient(135deg,#FFCC33,#F5B301);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Bridge</span>
          </div>
        </td></tr>

        <tr><td style="padding:40px;">
          <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">Reset your password</h1>
          <p style="color:rgba(247,249,248,.78);font-size:15px;line-height:1.6;margin:0 0 24px;">
            We received a request to reset the password for your SportBridge account.
            Click the button below to choose a new password.
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="{{ .ConfirmationURL }}"
              style="display:inline-block;background:linear-gradient(135deg,#FFCC33,#F5B301);color:#050B1F;font-weight:700;font-size:16px;padding:14px 40px;border-radius:10px;text-decoration:none;">
              Reset my password
            </a>
          </div>

          <p style="color:rgba(247,249,248,.45);font-size:13px;line-height:1.6;margin:0;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your account is secure.
          </p>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
          <p style="color:rgba(247,249,248,.35);font-size:12px;margin:0;">
            SportBridge · <a href="https://sportbridge-ng-com.netlify.app" style="color:rgba(245,179,1,.7);text-decoration:none;">sportbridge-ng-com.netlify.app</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## 3. Magic link (passwordless login)

**Subject:** Your SportBridge sign-in link

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#050B1F;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050B1F;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0A1633;border-radius:12px;overflow:hidden;border:1px solid rgba(245,179,1,.2);">

        <tr><td style="background:linear-gradient(135deg,#0B2B6B,#1B54D6);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;">
            Sport<span style="background:linear-gradient(135deg,#FFCC33,#F5B301);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Bridge</span>
          </div>
        </td></tr>

        <tr><td style="padding:40px;">
          <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">Your sign-in link</h1>
          <p style="color:rgba(247,249,248,.78);font-size:15px;line-height:1.6;margin:0 0 24px;">
            Click the button below to sign in to your SportBridge account. This link can only be used once.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="{{ .ConfirmationURL }}"
              style="display:inline-block;background:linear-gradient(135deg,#FFCC33,#F5B301);color:#050B1F;font-weight:700;font-size:16px;padding:14px 40px;border-radius:10px;text-decoration:none;">
              Sign in to SportBridge
            </a>
          </div>
          <p style="color:rgba(247,249,248,.45);font-size:13px;">Link expires in 1 hour. If you didn't request this, ignore it.</p>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,.08);text-align:center;">
          <p style="color:rgba(247,249,248,.35);font-size:12px;margin:0;">
            SportBridge · <a href="https://sportbridge-ng-com.netlify.app" style="color:rgba(245,179,1,.7);text-decoration:none;">sportbridge-ng-com.netlify.app</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
```

---

## How to apply these templates in Supabase

1. Go to **[Supabase → Authentication → Emails](https://supabase.com/dashboard/project/pzfohowzaeunywaqukwe/auth/templates)**
2. Click each template tab (Confirm signup, Reset password, Magic Link)
3. Paste the HTML above into the **Message** field
4. Update the **Subject** line
5. Click **Save**

The `{{ .ConfirmationURL }}` placeholder is automatically replaced by Supabase with the real link.
