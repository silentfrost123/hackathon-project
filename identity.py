"""
Identity normalization, validation and hashing for JISR KYC.

Everything that decides "is this the same person?" lives here so it can be unit-tested
(tests/test_auth.py) and reused by any future provider.

  normalize_email("Jane.Doe+jisr@GMAIL.com ")  -> "janedoe@gmail.com"
  normalize_phone("+971", "050 123 4567")      -> "+971501234567"
  normalize_id("emirates_id", "784-1990-1234567-1") -> "784199012345671"
  id_hash(pepper, "emirates_id", "784199012345671")  -> hex HMAC-SHA256 (never the number itself)
"""
import hashlib
import hmac
import re
import unicodedata

# Providers where dots in the local part are ignored by the mailbox.
DOTLESS_DOMAINS = {"gmail.com", "googlemail.com"}
DOMAIN_ALIASES = {"googlemail.com": "gmail.com"}

EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$")

# Country calling codes offered in the UI (UAE first / default). Value = allowed national number length.
COUNTRY_CODES = {
    "+971": (9, 9),    # UAE (mobile 5XXXXXXXX)
    "+966": (9, 9),    # Saudi Arabia
    "+974": (8, 8),    # Qatar
    "+965": (8, 8),    # Kuwait
    "+973": (8, 8),    # Bahrain
    "+968": (8, 8),    # Oman
    "+20":  (10, 10),  # Egypt
    "+962": (9, 9),    # Jordan
    "+961": (7, 8),    # Lebanon
    "+44":  (10, 10),  # UK
    "+1":   (10, 10),  # US / Canada
    "+91":  (10, 10),  # India
    "+92":  (10, 10),  # Pakistan
}

ID_TYPES = ("emirates_id", "university_id")
TRACKS = ("specialist", "researcher", "inventor", "founder")
ROLES = ("talent", "partner")

# Arabic-Indic and Eastern Arabic-Indic digits -> ASCII, so "٧٨٤" and "784" compare equal.
_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹", "01234567890123456789")


def _ascii_digits(s):
    return (s or "").translate(_DIGITS)


# ---------------------------------------------------------------- email
def clean_email(raw):
    """Trimmed, lowercased email as typed. Returns None if it doesn't look like an email."""
    e = unicodedata.normalize("NFKC", (raw or "")).strip().lower()
    return e if len(e) <= 254 and EMAIL_RE.match(e) else None


def normalize_email(raw):
    """Canonical mailbox used for uniqueness + login.

    - trim + lowercase
    - drop a "+tag" sub-address on every domain (jane+x@ and jane@ are the same inbox on most providers)
    - Gmail: dots in the local part are ignored, googlemail.com == gmail.com
    """
    e = clean_email(raw)
    if not e:
        return None
    local, domain = e.rsplit("@", 1)
    domain = DOMAIN_ALIASES.get(domain, domain)
    local = local.split("+", 1)[0]
    if domain in DOTLESS_DOMAINS:
        local = local.replace(".", "")
    if not local:
        return None
    return f"{local}@{domain}"


# ---------------------------------------------------------------- phone
def normalize_phone(country_code, number):
    """E.164 ("+9715XXXXXXXX") or None.

    Accepts spaces, dashes, brackets, a leading trunk 0 ("050..."), the country code typed again
    ("+971 50...", "00971 50..."), and Arabic-Indic digits.
    """
    cc = (country_code or "").strip()
    if cc not in COUNTRY_CODES:
        return None
    ccd = cc[1:]
    raw = _ascii_digits(number).strip()
    digits = re.sub(r"\D", "", raw)
    if raw.startswith("+") and digits.startswith(ccd):
        digits = digits[len(ccd):]
    elif digits.startswith("00" + ccd):
        digits = digits[2 + len(ccd):]
    elif len(digits) > COUNTRY_CODES[cc][1] and digits.startswith(ccd):
        digits = digits[len(ccd):]
    digits = digits.lstrip("0")  # trunk prefix
    lo, hi = COUNTRY_CODES[cc]
    if not (lo <= len(digits) <= hi):
        return None
    if cc == "+971" and not digits.startswith("5"):  # UAE mobile numbers only (SMS)
        return None
    return cc + digits


# ---------------------------------------------------------------- ID numbers
def normalize_id(id_type, raw):
    """Strip spaces, dashes, dots and slashes; uppercase; ASCII digits."""
    s = _ascii_digits(unicodedata.normalize("NFKC", raw or "")).upper()
    return re.sub(r"[\s\-./_]", "", s)


def valid_id_format(id_type, norm):
    if id_type == "emirates_id":
        # 784-YYYY-NNNNNNN-C: 15 digits starting with the UAE code 784
        return bool(re.fullmatch(r"784\d{12}", norm))
    if id_type == "university_id":
        return bool(re.fullmatch(r"[A-Z0-9]{4,20}", norm))
    return False


def normalize_institution(raw):
    s = unicodedata.normalize("NFKC", raw or "").casefold()
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def id_hash(pepper, id_type, norm_number, institution=""):
    """HMAC-SHA256 keyed with the server pepper. University IDs are only unique per university,
    so the institution is part of the input; Emirates IDs are national."""
    if not pepper:
        raise ValueError("ID pepper is not configured")
    inst = normalize_institution(institution) if id_type == "university_id" else ""
    msg = f"{id_type}:{inst}:{norm_number}".encode()
    return hmac.new(pepper.encode() if isinstance(pepper, str) else pepper, msg, hashlib.sha256).hexdigest()


def mask_id(last4):
    return "****" + (last4 or "")


# ---------------------------------------------------------------- names
def _name_tokens(name):
    s = unicodedata.normalize("NFKD", name or "")
    s = "".join(ch for ch in s if not unicodedata.combining(ch)).casefold()
    return {t for t in re.split(r"[^\w]+", s) if len(t) > 1}


def names_match(a, b):
    """Loose check: the account name and the name on the ID share at least two words
    (or all words when one of them is a single word). Used only to flag for review."""
    ta, tb = _name_tokens(a), _name_tokens(b)
    if not ta or not tb:
        return False
    common = ta & tb
    return len(common) >= min(2, len(ta), len(tb))


def clean_name(raw, max_len=80):
    s = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", raw or "")).strip()
    if not (2 <= len(s) <= max_len) or re.search(r"[<>{}\d@]", s):
        return None
    return s


def password_problem(pw):
    if not isinstance(pw, str) or len(pw) < 8:
        return "weak_password"
    if len(pw) > 200:
        return "weak_password"
    if not re.search(r"[A-Za-z؀-ۿ]", pw) or not re.search(r"\d", pw):
        return "weak_password"
    return None
