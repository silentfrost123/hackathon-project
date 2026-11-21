"""
JISR accounts + KYC API (sign in, 4-step sign-up, sessions).  Python stdlib only (sqlite3).

ONE PERSON = ONE ACCOUNT
  * Email, phone and ID number are normalized (identity.py) before any comparison.
  * The ID number is stored only as HMAC-SHA256(JISR_ID_PEPPER, type:institution:number) + last 4.
  * Uniqueness is enforced by UNIQUE constraints in db/schema.sql; the checks below only give an
    earlier, friendlier answer. The final insert runs in one transaction, so two sign-ups racing
    for the same identity can't both win (the loser gets the same "identity_exists" answer).
  * Duplicate checks run only AFTER the person proves they own the email / phone (OTP), so the
    sign-up form can't be used to test whether someone else's email or phone is registered.
    The duplicate message never says which field matched or which account it is.
  * Score and badges reference identities(id), not users(id).

ABUSE PROTECTION
  * rate limits per IP and per destination for OTP sends, OTP checks, sign-up starts and sign-ins
  * OTPs expire after OTP_TTL (10 min), allow OTP_MAX_ATTEMPTS tries, 30 s resend cooldown
  * sign-in errors are always "Email or password is incorrect" (no user enumeration), and a dummy
    password hash runs when the email is unknown so timing doesn't leak it either
  * session + sign-up tokens are random 256-bit values; only their SHA-256 is stored
"""
import base64
import binascii
import hashlib
import hmac
import os
import secrets
import sqlite3
import threading
import time
from collections import defaultdict, deque

import identity as idn
from kyc_providers import get_provider

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.environ.get("JISR_DATA_DIR", os.path.join(ROOT, ".data"))
DB_PATH = os.environ.get("JISR_DB_PATH", os.path.join(DATA_DIR, "jisr.db"))
SCHEMA_PATH = os.path.join(ROOT, "db", "schema.sql")

OTP_TTL = 10 * 60
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN = 30
SIGNUP_TTL = 30 * 60
SESSION_TTL = 7 * 24 * 3600
MAX_ID_IMAGE_BYTES = 5 * 1024 * 1024
COOKIE = "jisr_sid"

# (max events, window seconds)
LIMITS = {
    "signup_ip":      (10, 3600),
    "otp_send_ip":    (20, 900),
    "otp_send_dest":  (5, 900),
    "otp_check_ip":   (30, 600),
    "identity_ip":    (10, 600),
    "identity_signup": (3, 1800),   # ID tries per sign-up (stops probing ID numbers)
    "login_ip":       (20, 600),
    "login_email":    (8, 900),
}

DUPLICATE_MSG = "An account already exists for this identity. Sign in instead."
LOGIN_FAILED_MSG = "Email or password is incorrect."

PROVIDER = get_provider()
_PEPPER = None
_DUMMY_HASH = None


class AuthError(Exception):
    def __init__(self, status, code, message, field=None, **extra):
        super().__init__(message)
        self.status, self.code, self.message, self.field, self.extra = status, code, message, field, extra

    def body(self):
        b = {"error": self.code, "message": self.message}
        if self.field:
            b["field"] = self.field
        b.update(self.extra)
        return b


# ---------------------------------------------------------------- setup
def _pepper():
    """JISR_ID_PEPPER from .env. In development a random one is created once and kept in
    .data/.id-pepper so duplicate detection survives restarts (never use that in production)."""
    global _PEPPER
    if _PEPPER:
        return _PEPPER
    p = os.environ.get("JISR_ID_PEPPER", "").strip()
    if not p:
        path = os.path.join(DATA_DIR, ".id-pepper")
        if os.path.exists(path):
            with open(path, encoding="utf-8") as fh:
                p = fh.read().strip()
        else:
            p = secrets.token_hex(32)
            os.makedirs(DATA_DIR, exist_ok=True)
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(p)
            try:
                os.chmod(path, 0o600)
            except OSError:
                pass
        print(f"[auth] JISR_ID_PEPPER is not set; using the pepper kept in {path}. Keep that folder on a persistent volume, "
              "and don't add JISR_ID_PEPPER later (a different pepper breaks duplicate detection for existing accounts).", flush=True)
    if len(p) < 32:
        raise RuntimeError("JISR_ID_PEPPER must be at least 32 characters")
    _PEPPER = p
    return p


def _db():
    con = sqlite3.connect(DB_PATH, timeout=10, isolation_level=None)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def _migrate_media_tracks():
    """Migration 002: allow the Media specialties in users.track. SQLite can't alter a CHECK
    constraint, so the table is rebuilt (the documented 12-step way) and every row is kept."""
    con = _db()
    try:
        row = con.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").fetchone()
        if not row or "'video'" in row["sql"]:
            return
        new_sql = row["sql"].replace("CREATE TABLE users", "CREATE TABLE users_new", 1).replace(
            "CHECK (track IN ('specialist', 'researcher', 'inventor', 'founder'))",
            "CHECK (track IN ('video', 'design', 'content', 'journalism', 'specialist', 'researcher', 'inventor', 'founder'))")
        if "'video'" not in new_sql:
            raise RuntimeError("migration 002: unexpected users table definition")
        con.execute("PRAGMA foreign_keys = OFF")
        con.execute("BEGIN IMMEDIATE")
        try:
            con.execute(new_sql)
            con.execute("INSERT INTO users_new SELECT * FROM users")
            con.execute("DROP TABLE users")
            con.execute("ALTER TABLE users_new RENAME TO users")
            bad = con.execute("PRAGMA foreign_key_check").fetchall()
            if bad:
                raise RuntimeError(f"migration 002: foreign key problems {bad[:3]}")
            con.execute("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (2, ?)", (int(time.time()),))
            con.execute("COMMIT")
            print("[auth] migration 002 applied: Media specialties allowed in users.track", flush=True)
        except Exception:
            con.execute("ROLLBACK")
            raise
        finally:
            con.execute("PRAGMA foreign_keys = ON")
    finally:
        con.close()


def init():
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    con = _db()
    try:
        con.execute("PRAGMA journal_mode = WAL")
        with open(SCHEMA_PATH, encoding="utf-8") as fh:
            con.executescript(fh.read())
    finally:
        con.close()
    _migrate_media_tracks()
    _pepper()
    global _DUMMY_HASH
    _DUMMY_HASH = hash_password(secrets.token_hex(8))
    return {"db": DB_PATH, "provider": PROVIDER.name}


# ---------------------------------------------------------------- crypto helpers
def _sha(s):
    return hashlib.sha256(s.encode()).hexdigest()


def hash_password(pw):
    salt = secrets.token_bytes(16)
    n, r, p = 2 ** 14, 8, 1
    dk = hashlib.scrypt(pw.encode(), salt=salt, n=n, r=r, p=p, dklen=32)
    return f"scrypt${n}${r}${p}${salt.hex()}${dk.hex()}"


def check_password(pw, stored):
    try:
        _, n, r, p, salt, dk = stored.split("$")
        got = hashlib.scrypt(pw.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p), dklen=len(dk) // 2)
        return hmac.compare_digest(got.hex(), dk)
    except (ValueError, TypeError):
        return False


def _code_hash(token_hash, code):
    return hmac.new(_pepper().encode(), f"otp:{token_hash}:{code}".encode(), hashlib.sha256).hexdigest()


# ---------------------------------------------------------------- rate limiting (in memory)
_RL = defaultdict(deque)
_RL_LOCK = threading.Lock()


def rate_limit(bucket, key, cost=1):
    limit, window = LIMITS[bucket]
    now = time.time()
    k = (bucket, key)
    with _RL_LOCK:
        q = _RL[k]
        while q and q[0] <= now - window:
            q.popleft()
        if len(q) + cost > limit:
            retry = int(q[0] + window - now) + 1 if q else window
            raise AuthError(429, "rate_limited", "Too many attempts. Please wait and try again.", retryAfter=retry)
        for _ in range(cost):
            q.append(now)


def reset_rate_limits():
    with _RL_LOCK:
        _RL.clear()


# ---------------------------------------------------------------- sign-up state
def _signup(con, token):
    if not isinstance(token, str) or len(token) < 20:
        raise AuthError(410, "signup_expired", "This sign-up has expired. Please start again.")
    th = _sha(token)
    row = con.execute("SELECT * FROM signups WHERE token_hash = ?", (th,)).fetchone()
    if not row or row["expires_at"] < time.time():
        raise AuthError(410, "signup_expired", "This sign-up has expired. Please start again.")
    return row


def _signup_view(row, token=None):
    v = {
        "fullName": row["full_name"], "email": row["email"], "role": row["role"], "track": row["track"],
        "emailVerified": bool(row["email_verified_at"]),
        "phone": row["phone_e164"], "phoneVerified": bool(row["phone_verified_at"]),
        "expiresIn": max(0, int(row["expires_at"] - time.time())),
    }
    if token:
        v["token"] = token
    return v


def _issue_otp(con, row, channel, destination, ip, lang):
    th = row["token_hash"]
    last = con.execute("SELECT created_at FROM otp_codes WHERE signup_token = ? AND channel = ? ORDER BY id DESC LIMIT 1",
                       (th, channel)).fetchone()
    now = int(time.time())
    if last and now - last["created_at"] < OTP_RESEND_COOLDOWN:
        wait = OTP_RESEND_COOLDOWN - (now - last["created_at"])
        raise AuthError(429, "rate_limited", "Please wait before requesting another code.", retryAfter=wait)
    rate_limit("otp_send_ip", ip)
    rate_limit("otp_send_dest", destination)
    code = PROVIDER.generate_code()
    con.execute("UPDATE otp_codes SET consumed_at = ? WHERE signup_token = ? AND channel = ? AND consumed_at IS NULL",
                (now, th, channel))
    con.execute("INSERT INTO otp_codes (signup_token, channel, destination, code_hash, created_at, expires_at) VALUES (?,?,?,?,?,?)",
                (th, channel, destination, _code_hash(th, code), now, now + OTP_TTL))
    if channel == "email":
        PROVIDER.send_email_otp(row["email"], code, lang)
    else:
        PROVIDER.send_phone_otp(destination, code, lang)
    return {"sent": True, "channel": channel, "expiresIn": OTP_TTL, "resendIn": OTP_RESEND_COOLDOWN}


def _check_otp(con, row, channel, code, ip):
    """verify_email_otp / verify_phone_otp: same rules for every provider."""
    rate_limit("otp_check_ip", ip)
    code = idn._ascii_digits(str(code or "")).strip()
    th = row["token_hash"]
    otp = con.execute("SELECT * FROM otp_codes WHERE signup_token = ? AND channel = ? AND consumed_at IS NULL ORDER BY id DESC LIMIT 1",
                      (th, channel)).fetchone()
    now = int(time.time())
    if not otp:
        raise AuthError(400, "code_expired", "This code has expired. Request a new one.", field="code")
    if otp["expires_at"] < now:
        con.execute("UPDATE otp_codes SET consumed_at = ? WHERE id = ?", (now, otp["id"]))
        raise AuthError(400, "code_expired", "This code has expired. Request a new one.", field="code")
    if otp["attempts"] >= OTP_MAX_ATTEMPTS:
        con.execute("UPDATE otp_codes SET consumed_at = ? WHERE id = ?", (now, otp["id"]))
        raise AuthError(429, "too_many_attempts", "Too many wrong codes. Request a new one.", field="code")
    if not (code.isdigit() and len(code) == 6 and hmac.compare_digest(otp["code_hash"], _code_hash(th, code))):
        attempts = otp["attempts"] + 1
        con.execute("UPDATE otp_codes SET attempts = ?, consumed_at = CASE WHEN ? >= ? THEN ? END WHERE id = ?",
                    (attempts, attempts, OTP_MAX_ATTEMPTS, now, otp["id"]))
        left = OTP_MAX_ATTEMPTS - attempts
        if left <= 0:
            raise AuthError(429, "too_many_attempts", "Too many wrong codes. Request a new one.", field="code")
        raise AuthError(400, "bad_code", "That code isn't right.", field="code", attemptsLeft=left)
    con.execute("UPDATE otp_codes SET consumed_at = ? WHERE id = ?", (now, otp["id"]))
    return otp["destination"]


def _dup(field=None):
    # field is deliberately NOT sent to the browser
    return AuthError(409, "identity_exists", DUPLICATE_MSG)


def _account_fields(body):
    name = idn.clean_name(body.get("fullName"))
    if not name:
        raise AuthError(400, "invalid_name", "Enter your full name.", field="fullName")
    pw = body.get("password")
    if idn.password_problem(pw):
        raise AuthError(400, "weak_password", "Use at least 8 characters with letters and numbers.", field="password")
    role = body.get("role")
    if role not in idn.ROLES:
        raise AuthError(400, "invalid_role", "Choose how you'll use JISR.", field="role")
    track = body.get("track") if role == "talent" else None
    if role == "talent" and track not in idn.TRACKS:
        raise AuthError(400, "invalid_track", "Choose your media specialty.", field="track")
    return name, pw, role, track


# ---------------------------------------------------------------- endpoints
def signup_start(body, ctx):
    rate_limit("signup_ip", ctx["ip"])
    name, pw, role, track = _account_fields(body)
    email = idn.clean_email(body.get("email"))
    email_norm = idn.normalize_email(body.get("email"))
    if not email or not email_norm:
        raise AuthError(400, "invalid_email", "Enter a valid email address.", field="email")
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    con = _db()
    try:
        con.execute("BEGIN IMMEDIATE")
        con.execute("DELETE FROM signups WHERE expires_at < ?", (now,))
        con.execute("INSERT INTO signups (token_hash, full_name, email, email_norm, password_hash, role, track, created_at, expires_at) "
                    "VALUES (?,?,?,?,?,?,?,?,?)",
                    (_sha(token), name, email, email_norm, hash_password(pw), role, track, now, now + SIGNUP_TTL))
        row = con.execute("SELECT * FROM signups WHERE token_hash = ?", (_sha(token),)).fetchone()
        sent = _issue_otp(con, row, "email", email_norm, ctx["ip"], body.get("lang"))
        con.execute("COMMIT")
    except Exception:
        con.execute("ROLLBACK")
        raise
    finally:
        con.close()
    return {"signup": _signup_view(row, token), "otp": sent}


def signup_update(body, ctx):
    """Change name / password / role from step 1 without re-verifying the same email."""
    name, pw, role, track = _account_fields(body)
    con = _db()
    try:
        row = _signup(con, body.get("token"))
        con.execute("UPDATE signups SET full_name = ?, password_hash = ?, role = ?, track = ? WHERE token_hash = ?",
                    (name, hash_password(pw), role, track, row["token_hash"]))
        row = _signup(con, body.get("token"))
        return {"signup": _signup_view(row)}
    finally:
        con.close()


def signup_status(body, ctx):
    con = _db()
    try:
        return {"signup": _signup_view(_signup(con, body.get("token")))}
    finally:
        con.close()


def signup_resend(body, ctx):
    channel = body.get("channel")
    con = _db()
    try:
        con.execute("BEGIN IMMEDIATE")
        row = _signup(con, body.get("token"))
        if channel == "email":
            dest = row["email_norm"]
        elif channel == "sms" and row["phone_e164"]:
            dest = row["phone_e164"]
        else:
            raise AuthError(400, "step_order", "Finish the previous step first.")
        sent = _issue_otp(con, row, channel, dest, ctx["ip"], body.get("lang"))
        con.execute("COMMIT")
        return {"otp": sent}
    except Exception:
        con.execute("ROLLBACK")
        raise
    finally:
        con.close()


def signup_verify_email(body, ctx):
    con = _db()
    try:
        con.execute("BEGIN IMMEDIATE")
        row = _signup(con, body.get("token"))
        try:
            _check_otp(con, row, "email", body.get("code"), ctx["ip"])
        except AuthError:
            con.execute("COMMIT")  # keep the attempt count
            raise
        # The person now owns this mailbox, so it's safe to tell them it's taken.
        if con.execute("SELECT 1 FROM users WHERE email_norm = ?", (row["email_norm"],)).fetchone():
            con.execute("DELETE FROM signups WHERE token_hash = ?", (row["token_hash"],))
            con.execute("COMMIT")
            raise _dup("email")
        con.execute("UPDATE signups SET email_verified_at = ? WHERE token_hash = ?", (int(time.time()), row["token_hash"]))
        con.execute("COMMIT")
        return {"signup": _signup_view(_signup(con, body.get("token")))}
    except AuthError:
        raise
    except Exception:
        con.execute("ROLLBACK")
        raise
    finally:
        con.close()


def signup_phone(body, ctx):
    phone = idn.normalize_phone(body.get("countryCode"), body.get("phone"))
    if not phone:
        raise AuthError(400, "invalid_phone", "Enter a valid mobile number.", field="phone")
    con = _db()
    try:
        con.execute("BEGIN IMMEDIATE")
        row = _signup(con, body.get("token"))
        if not row["email_verified_at"]:
            raise AuthError(400, "step_order", "Verify your email first.")
        if row["phone_e164"] != phone:
            con.execute("UPDATE signups SET phone_e164 = ?, phone_verified_at = NULL WHERE token_hash = ?", (phone, row["token_hash"]))
            row = _signup(con, body.get("token"))
        sent = _issue_otp(con, row, "sms", phone, ctx["ip"], body.get("lang"))
        con.execute("COMMIT")
        return {"signup": _signup_view(row), "otp": sent}
    except Exception:
        con.execute("ROLLBACK")
        raise
    finally:
        con.close()


def signup_verify_phone(body, ctx):
    con = _db()
    try:
        con.execute("BEGIN IMMEDIATE")
        row = _signup(con, body.get("token"))
        if not row["email_verified_at"] or not row["phone_e164"]:
            con.execute("ROLLBACK")
            raise AuthError(400, "step_order", "Finish the previous step first.")
        try:
            dest = _check_otp(con, row, "sms", body.get("code"), ctx["ip"])
        except AuthError:
            con.execute("COMMIT")
            raise
        if dest != row["phone_e164"]:
            con.execute("COMMIT")
            raise AuthError(400, "code_expired", "This code has expired. Request a new one.", field="code")
        if con.execute("SELECT 1 FROM users WHERE phone_e164 = ?", (dest,)).fetchone():
            con.execute("DELETE FROM signups WHERE token_hash = ?", (row["token_hash"],))
            con.execute("COMMIT")
            raise _dup("phone")
        con.execute("UPDATE signups SET phone_verified_at = ? WHERE token_hash = ?", (int(time.time()), row["token_hash"]))
        con.execute("COMMIT")
        return {"signup": _signup_view(_signup(con, body.get("token")))}
    finally:
        con.close()


def signup_identity(body, ctx):
    """Step 3: verify the ID, then create identity + user + score + KYC badge in ONE transaction."""
    rate_limit("identity_ip", ctx["ip"])
    id_type = body.get("idType")
    if id_type not in idn.ID_TYPES:
        raise AuthError(400, "invalid_id_type", "Choose an ID type.", field="idType")
    number = idn.normalize_id(id_type, body.get("idNumber"))
    if not idn.valid_id_format(id_type, number):
        raise AuthError(400, "invalid_id", "Check the ID number.", field="idNumber")
    name_on_id = idn.clean_name(body.get("nameOnId"), 120)
    if not name_on_id:
        raise AuthError(400, "invalid_id_name", "Enter your name exactly as it appears on the ID.", field="nameOnId")
    institution = (body.get("institution") or "").strip()[:120]
    if id_type == "university_id" and len(idn.normalize_institution(institution)) < 3:
        raise AuthError(400, "invalid_institution", "Enter your university.", field="institution")
    image = None
    if body.get("image"):
        try:
            image = base64.b64decode(str(body["image"]).split(",", 1)[-1], validate=True)
        except (binascii.Error, ValueError):
            raise AuthError(400, "bad_image", "The ID image couldn't be read.", field="image")
        if len(image) > MAX_ID_IMAGE_BYTES:
            raise AuthError(413, "image_too_big", "The ID image must be under 5 MB.", field="image")
    trade_license = (body.get("tradeLicense") or "").strip()[:60] or None

    con = _db()
    try:
        row = _signup(con, body.get("token"))
        if not (row["email_verified_at"] and row["phone_verified_at"]):
            raise AuthError(400, "step_order", "Verify your email and phone first.")
        rate_limit("identity_signup", row["token_hash"])
        check = PROVIDER.verify_id(id_type, number, name_on_id, institution, image)
        image = None  # prototype: the image is never stored
        if not check.ok:
            raise AuthError(400, "invalid_id", "We couldn't verify this ID. Check the number and try again.", field="idNumber")
        h = idn.id_hash(_pepper(), id_type, number, institution)
        now = int(time.time())
        match = idn.names_match(row["full_name"], name_on_id)
        # A name that doesn't match the ID can't count as verified: it waits for review (no full trust points).
        status = "review" if (check.needs_review or not match) else "verified"
        con.execute("BEGIN IMMEDIATE")
        try:
            # Friendly early answer; the UNIQUE constraints below are the real guarantee.
            if (con.execute("SELECT 1 FROM identities WHERE id_hash = ?", (h,)).fetchone()
                    or con.execute("SELECT 1 FROM users WHERE email_norm = ? OR phone_e164 = ?",
                                   (row["email_norm"], row["phone_e164"])).fetchone()):
                raise _dup()
            cur = con.execute(
                "INSERT INTO identities (id_type, id_hash, id_last4, institution, name_on_id, name_match, kyc_status, kyc_provider, verified_at, created_at) "
                "VALUES (?,?,?,?,?,?,?,?,?,?)",
                (id_type, h, number[-4:], institution or None, name_on_id, int(match), status, PROVIDER.name, now, now))
            identity_id = cur.lastrowid
            cur = con.execute(
                "INSERT INTO users (identity_id, full_name, email, email_norm, email_verified_at, phone_e164, phone_verified_at, "
                "password_hash, role, track, kyb_status, trade_license, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (identity_id, row["full_name"], row["email"], row["email_norm"], row["email_verified_at"], row["phone_e164"],
                 row["phone_verified_at"], row["password_hash"], row["role"], row["track"],
                 ("pending" if trade_license else "not_started") if row["role"] == "partner" else None,
                 trade_license if row["role"] == "partner" else None, now))
            user_id = cur.lastrowid
            # Identity & Trust pillar (max 20) is earned by completing KYC.
            con.execute("INSERT INTO scores (identity_id, identity_trust, updated_at) VALUES (?, ?, ?)",
                        (identity_id, 20 if status == "verified" else 10, now))
            con.execute("INSERT INTO badges (identity_id, kind, ref, awarded_at) VALUES (?, ?, '', ?)",
                        (identity_id, "kyc_verified" if status == "verified" else "kyc_review", now))
            con.execute("DELETE FROM signups WHERE token_hash = ?", (row["token_hash"],))
            sid = _new_session(con, user_id)
            con.execute("COMMIT")
        except sqlite3.IntegrityError:
            con.execute("ROLLBACK")
            raise _dup()
        except Exception:
            con.execute("ROLLBACK")
            raise
        return {"user": _me(con, user_id), "_session": sid}
    finally:
        con.close()


def _new_session(con, user_id):
    sid = secrets.token_urlsafe(32)
    now = int(time.time())
    con.execute("DELETE FROM sessions WHERE expires_at < ?", (now,))
    con.execute("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?,?,?,?)",
                (_sha(sid), user_id, now, now + SESSION_TTL))
    return sid


def _me(con, user_id):
    r = con.execute(
        "SELECT u.id, u.full_name, u.email, u.phone_e164, u.role, u.track, u.kyb_status, "
        "i.id AS identity_id, i.id_type, i.id_last4, i.kyc_status, i.name_match, i.kyc_provider, "
        "s.identity_trust, s.projects, s.work_on_jisr, s.timeliness, s.certificates "
        "FROM users u JOIN identities i ON i.id = u.identity_id LEFT JOIN scores s ON s.identity_id = i.id WHERE u.id = ?",
        (user_id,)).fetchone()
    if not r:
        return None
    badges = [b["kind"] for b in con.execute("SELECT kind FROM badges WHERE identity_id = ? ORDER BY awarded_at", (r["identity_id"],))]
    parts = {k: r[k] or 0 for k in ("identity_trust", "projects", "work_on_jisr", "timeliness", "certificates")}
    phone = r["phone_e164"]
    return {
        "fullName": r["full_name"], "email": r["email"],
        "phone": phone[:4] + " ••• " + phone[-3:],
        "role": r["role"], "track": r["track"], "kybStatus": r["kyb_status"],
        "identity": {"type": r["id_type"], "masked": idn.mask_id(r["id_last4"]), "status": r["kyc_status"],
                     "nameMatch": bool(r["name_match"]),
                     "demo": r["kyc_provider"] == "mock"},   # the ID was only format-checked by the demo provider
        "score": {"total": sum(parts.values()), **parts},
        "badges": badges,
    }


def login(body, ctx):
    rate_limit("login_ip", ctx["ip"])
    email_norm = idn.normalize_email(body.get("email")) or ""
    pw = body.get("password") if isinstance(body.get("password"), str) else ""
    if email_norm:
        rate_limit("login_email", email_norm)
    con = _db()
    try:
        row = con.execute("SELECT id, password_hash FROM users WHERE email_norm = ?", (email_norm,)).fetchone() if email_norm else None
        ok = check_password(pw, row["password_hash"] if row else _DUMMY_HASH) and row is not None
        if not ok:
            raise AuthError(401, "login_failed", LOGIN_FAILED_MSG)
        sid = _new_session(con, row["id"])
        return {"user": _me(con, row["id"]), "_session": sid}
    finally:
        con.close()


def _user_from_cookie(cookie_header):
    sid = None
    for part in (cookie_header or "").split(";"):
        k, _, v = part.strip().partition("=")
        if k == COOKIE:
            sid = v
    if not sid:
        return None, None
    con = _db()
    try:
        r = con.execute("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?", (_sha(sid),)).fetchone()
        if not r or r["expires_at"] < time.time():
            return None, sid
        return _me(con, r["user_id"]), sid
    finally:
        con.close()


def me(body, ctx):
    # Signed out is a normal state for a visitor, not an error: answer 200 with user null
    # (a 401 here showed up as a console error on every portal visit).
    user, _ = _user_from_cookie(ctx.get("cookie"))
    return {"user": user}


def logout(body, ctx):
    _, sid = _user_from_cookie(ctx.get("cookie"))
    if sid:
        con = _db()
        try:
            con.execute("DELETE FROM sessions WHERE token_hash = ?", (_sha(sid),))
        finally:
            con.close()
    return {"ok": True, "_session": ""}


def config(body, ctx):
    return {
        "demo": PROVIDER.demo,
        "demoCode": getattr(PROVIDER, "demo_code", None) if PROVIDER.demo else None,
        "provider": PROVIDER.name,
        "countryCodes": list(idn.COUNTRY_CODES),
        "otpTtl": OTP_TTL, "resendCooldown": OTP_RESEND_COOLDOWN,
    }


POST_ROUTES = {
    "/api/auth/login": login,
    "/api/auth/logout": logout,
    "/api/auth/signup/start": signup_start,
    "/api/auth/signup/update": signup_update,
    "/api/auth/signup/status": signup_status,
    "/api/auth/signup/resend": signup_resend,
    "/api/auth/signup/verify-email": signup_verify_email,
    "/api/auth/signup/phone": signup_phone,
    "/api/auth/signup/verify-phone": signup_verify_phone,
    "/api/auth/signup/identity": signup_identity,
}
GET_ROUTES = {"/api/auth/me": me, "/api/auth/config": config}


def session_cookie(sid, secure):
    attrs = f"{COOKIE}={sid}; Path=/; HttpOnly; SameSite=Lax"
    attrs += f"; Max-Age={SESSION_TTL if sid else 0}"
    if secure:
        attrs += "; Secure"
    return attrs


def handle(method, path, body, ctx):
    """Returns (status, json_body, set_cookie_or_None)."""
    fn = (POST_ROUTES if method == "POST" else GET_ROUTES).get(path)
    if not fn:
        return 404, {"error": "not_found", "message": "Unknown endpoint."}, None
    if method == "POST" and "application/json" not in (ctx.get("content_type") or ""):
        # blocks cross-site HTML form posts (simple CSRF); fetch() from our pages always sends JSON
        return 415, {"error": "bad_request", "message": "Bad request."}, None
    try:
        out = fn(body if isinstance(body, dict) else {}, ctx)
    except AuthError as e:
        return e.status, e.body(), None
    cookie = None
    if "_session" in out:
        cookie = session_cookie(out.pop("_session"), ctx.get("https"))
    return 200, out, cookie
