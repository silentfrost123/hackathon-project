-- JISR accounts + KYC schema (SQLite). Migration 001.
-- Applied automatically by auth_api.py on server start (idempotent).
--
-- ONE PERSON = ONE ACCOUNT is enforced here, not only in the UI:
--   * identities.id_hash    UNIQUE  -> one verified ID document = one identity
--   * users.identity_id     UNIQUE  -> one identity = one user account
--   * users.email_norm      UNIQUE  -> normalized email (lowercase, Gmail dots / +alias removed)
--   * users.phone_e164      UNIQUE  -> phone in E.164
-- Score and badges reference the IDENTITY, so they follow the verified person, not a login.
-- ID numbers are never stored: only an HMAC-SHA256 (server pepper from .env) and the last 4 digits.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS identities (
  id             INTEGER PRIMARY KEY,
  id_type        TEXT    NOT NULL CHECK (id_type IN ('emirates_id', 'university_id')),
  id_hash        TEXT    NOT NULL UNIQUE,            -- HMAC(pepper, type:institution:number)
  id_last4       TEXT    NOT NULL,                   -- for masked display only (****1234)
  institution    TEXT,                               -- university name (university_id only)
  name_on_id     TEXT    NOT NULL,
  name_match     INTEGER NOT NULL DEFAULT 1,         -- 0 = account name differs from ID name (flag for review)
  kyc_status     TEXT    NOT NULL DEFAULT 'verified' CHECK (kyc_status IN ('verified', 'review', 'rejected')),
  kyc_provider   TEXT    NOT NULL,                   -- 'mock' for the prototype
  verified_at    INTEGER NOT NULL,
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id                INTEGER PRIMARY KEY,
  identity_id       INTEGER NOT NULL UNIQUE REFERENCES identities(id) ON DELETE RESTRICT,
  full_name         TEXT    NOT NULL,
  email             TEXT    NOT NULL,                -- as typed (for display / sending)
  email_norm        TEXT    NOT NULL UNIQUE,         -- canonical form used for uniqueness + login
  email_verified_at INTEGER NOT NULL,
  phone_e164        TEXT    NOT NULL UNIQUE,
  phone_verified_at INTEGER NOT NULL,
  password_hash     TEXT    NOT NULL,                -- scrypt$n$r$p$salt$hash
  role              TEXT    NOT NULL CHECK (role IN ('talent', 'partner')),
  track             TEXT    CHECK (track IN ('video', 'design', 'content', 'journalism', 'specialist', 'researcher', 'inventor', 'founder')),   -- Media specialty (old values kept for older accounts)
  kyb_status        TEXT    CHECK (kyb_status IN ('not_started', 'pending')),   -- partners only (KYB later)
  trade_license     TEXT,                            -- partners only, placeholder until KYB
  created_at        INTEGER NOT NULL
);

-- Readiness Score (0-100) is owned by the verified identity.
CREATE TABLE IF NOT EXISTS scores (
  identity_id     INTEGER PRIMARY KEY REFERENCES identities(id) ON DELETE CASCADE,
  identity_trust  INTEGER NOT NULL DEFAULT 0 CHECK (identity_trust BETWEEN 0 AND 20),
  projects        INTEGER NOT NULL DEFAULT 0 CHECK (projects       BETWEEN 0 AND 25),
  work_on_jisr    INTEGER NOT NULL DEFAULT 0 CHECK (work_on_jisr   BETWEEN 0 AND 25),
  timeliness      INTEGER NOT NULL DEFAULT 0 CHECK (timeliness     BETWEEN 0 AND 20),
  certificates    INTEGER NOT NULL DEFAULT 0 CHECK (certificates   BETWEEN 0 AND 10),
  updated_at      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
  id           INTEGER PRIMARY KEY,
  identity_id  INTEGER NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  kind         TEXT    NOT NULL,                     -- 'kyc_verified', 'legacy', 'native', ...
  ref          TEXT,                                 -- e.g. project id the badge is for
  awarded_at   INTEGER NOT NULL,
  UNIQUE (identity_id, kind, ref)
);

-- A sign-up in progress. Holds what has been verified so far; becomes a user at step 3.
CREATE TABLE IF NOT EXISTS signups (
  token_hash        TEXT    PRIMARY KEY,             -- sha256 of the token the browser holds
  full_name         TEXT    NOT NULL,
  email             TEXT    NOT NULL,
  email_norm        TEXT    NOT NULL,
  email_verified_at INTEGER,
  phone_e164        TEXT,
  phone_verified_at INTEGER,
  password_hash     TEXT    NOT NULL,
  role              TEXT    NOT NULL,
  track             TEXT,
  created_at        INTEGER NOT NULL,
  expires_at        INTEGER NOT NULL
);

-- One-time codes (email + SMS). Only a hash of the code is stored.
CREATE TABLE IF NOT EXISTS otp_codes (
  id           INTEGER PRIMARY KEY,
  signup_token TEXT    NOT NULL REFERENCES signups(token_hash) ON DELETE CASCADE,
  channel      TEXT    NOT NULL CHECK (channel IN ('email', 'sms')),
  destination  TEXT    NOT NULL,                     -- normalized email / E.164 phone
  code_hash    TEXT    NOT NULL,
  attempts     INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL,
  consumed_at  INTEGER
);
CREATE INDEX IF NOT EXISTS otp_by_signup ON otp_codes (signup_token, channel);
CREATE INDEX IF NOT EXISTS otp_by_dest   ON otp_codes (destination, created_at);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (1, strftime('%s', 'now'));
