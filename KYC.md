# Sign in + KYC sign-up (one person = one account)

## What was built
- **`auth.html`** (`#signin`, `#signup`): sign in, and a 4-step KYC sign-up with a progress bar.
  1. **Account**: role (Talent with track Specialist / Researcher / Inventor / Founder, or Partner), full name, email, password, then a 6-digit email code.
  2. **Phone**: country code (UAE +971 by default) + mobile, then an SMS code.
  3. **Identity**: Emirates ID or University ID (+ university), ID number, name as on the ID, optional ID photo. Partners also see a "KYB coming soon" box with an optional trade licence number.
  4. **Done**: the "KYC verified" tag in the landing-page style, a masked summary (`****5671`), Identity & Trust 20/20, then on to `app.html#talent` (partners go to `#business`).
- Same tokens, buttons, cards, badges, fonts and EN/AR toggle (RTL) as the rest of the site. Mobile first, labelled fields, focus states, `aria-live`/`role=alert` errors, inline validation, loading buttons, and Back keeps everything typed (also survives a page refresh).
- "Sign in" button added to the landing-page header and mobile menu.

## Files
| File | What |
|---|---|
| `auth.html`, `assets/css/auth.css`, `assets/js/auth.js`, `assets/js/i18n-ar-auth.js` | Page, styles, logic + EN/AR strings |
| `auth_api.py` | `/api/auth/*` endpoints, OTPs, rate limits, sessions |
| `identity.py` | Normalizing and hashing email / phone / ID numbers |
| `kyc_providers.py` | Provider adapter + `MockKycProvider` |
| `db/schema.sql` | Migration 001: `identities`, `users`, `scores`, `badges`, `signups`, `otp_codes`, `sessions` |
| `tests/test_auth.py` | 11 tests (normalizing, happy path, duplicates, OTP limits, rate limits, no enumeration) |
| `server.py` | Small edits: routes `/api/auth/*`, sets the session cookie, never serves `/db/` or `/tests/` (data lives in `.data/`, which was already hidden) |
| `.env.example` | New variables (`.env` and `.data/` were already git-ignored) |

## Run
```
cp .env.example .env          # then set JISR_ID_PEPPER (python -c "import secrets; print(secrets.token_hex(32))")
python server.py              # http://localhost:5178/auth.html#signup
python -m unittest discover -s tests -v
```
No new dependencies (Python stdlib + SQLite). The database is created at `.data/jisr.db` on first start.
On Railway: set `JISR_ID_PEPPER`, `TRUST_PROXY=1`, and point `JISR_DATA_DIR` at a persistent volume (otherwise accounts reset on every deploy).

## How one person = one account is enforced
- **Database**: `UNIQUE` on `users.email_norm`, `users.phone_e164`, `users.identity_id` and `identities.id_hash`. The final step creates identity + user + score + badge in one transaction, so two sign-ups racing for the same identity can't both win.
- **Normalizing first**: emails are trimmed and lowercased, `+tags` are dropped, and Gmail dots are ignored (`Layla.M+jisr@gmail.com` = `laylam@googlemail.com`). Phones become E.164 (`050 123 4567` = `+971501234567`, Arabic digits work). ID numbers lose spaces, dashes and dots.
- **ID numbers are never stored**: only `HMAC-SHA256(JISR_ID_PEPPER, type:university:number)` and the last 4 digits for display.
- **Score and badges belong to the identity**: `scores.identity_id` and `badges.identity_id` reference `identities`, not `users`.
- **No data leaks**: a duplicate always gets the same message, "An account already exists for this identity. Sign in instead.", with no hint of which field matched. Email and phone duplicates are checked only after the code is verified, so nobody can use the form to find out whether someone else's email or phone is registered. Sign-in always says "Email or password is incorrect", with equal timing.
- **Abuse limits**: codes expire in 10 minutes, 5 wrong tries burn the code, 30 s resend cooldown, 5 codes per email/phone per 15 min, sign-up 10/hour per IP, sign-in 20 per 10 min per IP and 8 per 15 min per email, 3 ID tries per sign-up.

## Test the duplicate block (demo code is 123456)
1. **Same ID, different formatting.** Sign up as `layla@example.com`, `050 123 4567`, Emirates ID `784-1999-1234567-1`. In a private window, sign up as `other@example.com`, `055 987 6543`, ID `784 1999 1234567 1` → blocked at step 3.
2. **Same Gmail inbox.** With an account on `layla.m+jisr@gmail.com`, start a sign-up with `LaylaM@googlemail.com` → blocked right after the email code.
3. **Same phone.** Use a new email but `+971 50 123 4567` again → blocked right after the SMS code.
Also: sign in with an unknown email and with a wrong password: both show the same error.

## What is mocked
`KYC_PROVIDER=mock`: no emails or SMS are sent, every code is `123456` (shown in a yellow "Demo mode" hint), and the ID check passes on a valid format (Emirates ID: 15 digits starting 784; University ID: 4 to 20 letters/digits). The ID photo is accepted but never stored. To go live, add a class to `kyc_providers.py` with `send_email_otp`, `send_phone_otp`, `verify_id` and set `KYC_PROVIDER`.

## Assumptions
- The backend is the existing stdlib `server.py`, so I used SQLite rather than adding a framework or a database server.
- Completing KYC gives the full 20 points of the Identity & Trust pillar.
- A name that doesn't match the ID name is flagged (`name_match = 0`, a note on the Done screen) but not blocked, because Arabic and English spellings differ.

## Future work
Password reset; real email/SMS providers; real ID checks (UAE PASS / ICP, university SSO) and Emirates ID check-digit validation; admin review of IDs and name mismatches; KYB for partners; linking the portal (`app.html`) to the signed-in account instead of demo data; one person holding both a University ID and an Emirates ID (today those are two different hashes, so requiring Emirates ID for UAE residents would close that gap); rate limits in shared storage (Redis) when running more than one server.
