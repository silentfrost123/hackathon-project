"""Accounts + KYC tests (stdlib unittest). Run from the project folder:

    python -m unittest discover -s tests -v

Uses a throw-away database in a temp folder and the MOCK provider (code 123456).
"""
import os
import sys
import tempfile
import unittest

TMP = tempfile.mkdtemp(prefix="jisr-test-")
os.environ["JISR_DATA_DIR"] = TMP
os.environ["JISR_DB_PATH"] = os.path.join(TMP, "test.db")
os.environ["JISR_ID_PEPPER"] = "test-pepper-0123456789abcdef0123456789abcdef"
os.environ["KYC_PROVIDER"] = "mock"
os.environ["DEMO_OTP_CODE"] = "123456"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import auth_api  # noqa: E402
import identity as idn  # noqa: E402

auth_api.init()
JSON = "application/json"


def call(path, body=None, ip="10.0.0.1", cookie=""):
    method = "GET" if path in auth_api.GET_ROUTES else "POST"
    return auth_api.handle(method, path, body or {}, {"ip": ip, "cookie": cookie, "content_type": JSON, "https": False})


def signup(email="layla@example.com", phone="501234567", id_type="emirates_id", id_number="784-1999-1234567-1",
           name="Layla Al Mansouri", institution="", ip="10.0.0.1", stop_at=None):
    """Runs the whole flow; returns the last (status, body, cookie)."""
    s, b, _ = call("/api/auth/signup/start", {"fullName": name, "email": email, "password": "bridge2026",
                                              "role": "talent", "track": "specialist"}, ip=ip)
    if s != 200:
        return s, b, None
    tok = b["signup"]["token"]
    r = call("/api/auth/signup/verify-email", {"token": tok, "code": "123456"}, ip=ip)
    if r[0] != 200 or stop_at == "email":
        return r
    r = call("/api/auth/signup/phone", {"token": tok, "countryCode": "+971", "phone": phone}, ip=ip)
    if r[0] != 200:
        return r
    r = call("/api/auth/signup/verify-phone", {"token": tok, "code": "123456"}, ip=ip)
    if r[0] != 200 or stop_at == "phone":
        return r
    return call("/api/auth/signup/identity", {"token": tok, "idType": id_type, "idNumber": id_number,
                                              "nameOnId": name, "institution": institution}, ip=ip)


class Normalize(unittest.TestCase):
    def test_email(self):
        self.assertEqual(idn.normalize_email("  Jane.Doe+jisr@GMAIL.com "), "janedoe@gmail.com")
        self.assertEqual(idn.normalize_email("j.a.n.e.doe@googlemail.com"), "janedoe@gmail.com")
        self.assertEqual(idn.normalize_email("first.last+x@uaeu.ac.ae"), "first.last@uaeu.ac.ae")
        self.assertIsNone(idn.normalize_email("not-an-email"))

    def test_phone(self):
        for raw in ("050 123 4567", "+971 50 123 4567", "00971501234567", "501234567", "٠٥٠١٢٣٤٥٦٧"):
            self.assertEqual(idn.normalize_phone("+971", raw), "+971501234567", raw)
        self.assertIsNone(idn.normalize_phone("+971", "04 123 4567"))  # landline, can't get SMS
        self.assertIsNone(idn.normalize_phone("+999", "501234567"))

    def test_id(self):
        self.assertEqual(idn.normalize_id("emirates_id", "784-1999 1234567-1"), "784199912345671")
        self.assertTrue(idn.valid_id_format("emirates_id", "784199912345671"))
        self.assertFalse(idn.valid_id_format("emirates_id", "123199912345671"))
        p = "x" * 40
        self.assertEqual(idn.id_hash(p, "university_id", "A123", "Khalifa University"),
                         idn.id_hash(p, "university_id", "A123", "  khalifa   university "))
        self.assertNotEqual(idn.id_hash(p, "university_id", "A123", "Khalifa University"),
                            idn.id_hash(p, "university_id", "A123", "UAE University"))


class Flow(unittest.TestCase):
    def setUp(self):
        auth_api.reset_rate_limits()

    def test_1_happy_path_and_login(self):
        s, b, cookie = signup()
        self.assertEqual(s, 200, b)
        u = b["user"]
        self.assertEqual(u["identity"]["masked"], "****5671")
        self.assertIn("kyc_verified", u["badges"])
        self.assertEqual(u["score"]["identity_trust"], 20)
        self.assertIn("HttpOnly", cookie)
        # the ID number is not stored anywhere in plain text
        import sqlite3
        dump = "\n".join(sqlite3.connect(os.environ["JISR_DB_PATH"]).iterdump())
        self.assertNotIn("784199912345671", dump)
        # sign in with a different spelling of the same Gmail-style address works
        s, b, cookie = call("/api/auth/login", {"email": " LAYLA@example.com", "password": "bridge2026"})
        self.assertEqual(s, 200)
        sid = cookie.split(";")[0]
        s, b, _ = call("/api/auth/me", cookie=sid)
        self.assertEqual((s, b["user"]["fullName"]), (200, "Layla Al Mansouri"))

    def test_2_duplicate_email_alias(self):
        signup(email="omar.k@gmail.com", phone="501111111", id_number="784199011111111", name="Omar Khalid")
        s, b, _ = signup(email="O.M.A.R.K+second@googlemail.com", phone="502222222", id_number="784199022222222",
                         name="Omar Khalid", stop_at="email")
        self.assertEqual((s, b["error"]), (409, "identity_exists"))
        self.assertEqual(b["message"], auth_api.DUPLICATE_MSG)
        self.assertNotIn("field", b)

    def test_3_duplicate_phone(self):
        signup(email="sara@example.com", phone="503333333", id_number="784199033333333", name="Sara Ali")
        s, b, _ = signup(email="sara.new@example.com", phone="+971 50 333 3333", id_number="784199044444444",
                         name="Sara Ali", stop_at="phone")
        self.assertEqual((s, b["error"]), (409, "identity_exists"))

    def test_4_duplicate_id_with_different_formatting(self):
        signup(email="noor@example.com", phone="505555555", id_number="784-2001-5555555-5", name="Noor Hassan")
        s, b, _ = signup(email="noor.other@example.com", phone="506666666", id_number="784 2001 5555555 5",
                         name="N Hassan")
        self.assertEqual((s, b["error"]), (409, "identity_exists"))
        self.assertNotIn("noor@example.com", str(b))

    def test_5_login_no_enumeration(self):
        a = call("/api/auth/login", {"email": "nobody@example.com", "password": "whatever1"})
        b = call("/api/auth/login", {"email": "layla@example.com", "password": "wrongpass1"})
        self.assertEqual(a[0], b[0])
        self.assertEqual(a[1], b[1])

    def test_6_otp_attempt_limit(self):
        s, b, _ = call("/api/auth/signup/start", {"fullName": "Test User", "email": "t@example.com",
                                                  "password": "abcdefg1", "role": "partner"})
        tok = b["signup"]["token"]
        for i in range(auth_api.OTP_MAX_ATTEMPTS - 1):
            s, b, _ = call("/api/auth/signup/verify-email", {"token": tok, "code": "000000"})
            self.assertEqual(b["error"], "bad_code")
        s, b, _ = call("/api/auth/signup/verify-email", {"token": tok, "code": "000000"})
        self.assertEqual(b["error"], "too_many_attempts")
        s, b, _ = call("/api/auth/signup/verify-email", {"token": tok, "code": "123456"})
        self.assertEqual(b["error"], "code_expired")  # the code is burnt; must request a new one

    def test_7_rate_limit_signup(self):
        for i in range(auth_api.LIMITS["signup_ip"][0]):
            call("/api/auth/signup/start", {"fullName": "Spam Bot", "email": f"s{i}@example.com",
                                            "password": "abcdefg1", "role": "partner"}, ip="10.9.9.9")
        s, b, _ = call("/api/auth/signup/start", {"fullName": "Spam Bot", "email": "x@example.com",
                                                  "password": "abcdefg1", "role": "partner"}, ip="10.9.9.9")
        self.assertEqual((s, b["error"]), (429, "rate_limited"))

    def test_8_requires_json(self):
        s, _, _ = auth_api.handle("POST", "/api/auth/login", {}, {"ip": "1", "content_type": "application/x-www-form-urlencoded"})
        self.assertEqual(s, 415)


if __name__ == "__main__":
    unittest.main()
