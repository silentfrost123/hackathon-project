"""
KYC provider adapter.

The rest of the server only talks to this interface, so swapping the MOCK for real services
(e.g. an email API, an SMS gateway, UAE PASS / ICP for Emirates ID, a university SSO) means
writing one new class and setting KYC_PROVIDER in .env. Nothing else changes.

    provider.generate_code()                          -> str  (6 digits)
    provider.send_email_otp(email, code, lang)        -> None (raise ProviderError on failure)
    provider.send_phone_otp(phone_e164, code, lang)   -> None
    provider.verify_id(id_type, id_number, name_on_id, institution, image_bytes) -> IdCheck

OTP *checking* (hash compare, 10-minute expiry, attempt limit) is done by auth_api.py so it is
the same for every provider.
"""
import os
import secrets
from dataclasses import dataclass

from identity import valid_id_format


class ProviderError(Exception):
    pass


@dataclass
class IdCheck:
    ok: bool
    reason: str = ""          # machine code when not ok, e.g. "bad_format", "not_found"
    needs_review: bool = False


class KycProvider:
    name = "base"
    demo = False

    def generate_code(self):
        return f"{secrets.randbelow(1_000_000):06d}"

    def send_email_otp(self, email, code, lang="en"):
        raise NotImplementedError

    def send_phone_otp(self, phone_e164, code, lang="en"):
        raise NotImplementedError

    def verify_id(self, id_type, id_number, name_on_id, institution="", image=None):
        raise NotImplementedError


class MockKycProvider(KycProvider):
    """Prototype provider: nothing leaves the server.

    - every OTP is the fixed DEMO_OTP_CODE (default 123456), shown in the UI's demo-mode hint
    - the ID check passes whenever the number has a valid format
    """
    name = "mock"
    demo = True

    def __init__(self, demo_code=None):
        code = (demo_code or os.environ.get("DEMO_OTP_CODE", "123456")).strip()
        self.demo_code = code if code.isdigit() and len(code) == 6 else "123456"

    def generate_code(self):
        return self.demo_code

    def send_email_otp(self, email, code, lang="en"):
        print(f"[kyc:mock] email code for {email[:2]}***: (demo code)", flush=True)

    def send_phone_otp(self, phone_e164, code, lang="en"):
        print(f"[kyc:mock] sms code for ***{phone_e164[-3:]}: (demo code)", flush=True)

    def verify_id(self, id_type, id_number, name_on_id, institution="", image=None):
        if not valid_id_format(id_type, id_number):
            return IdCheck(False, "bad_format")
        return IdCheck(True)


PROVIDERS = {"mock": MockKycProvider}


def get_provider():
    name = os.environ.get("KYC_PROVIDER", "mock").strip().lower() or "mock"
    cls = PROVIDERS.get(name)
    if not cls:
        raise RuntimeError(f"Unknown KYC_PROVIDER '{name}'. Available: {', '.join(PROVIDERS)}")
    return cls()
