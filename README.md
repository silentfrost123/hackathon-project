# JISR جسر — website prototype

A responsive static website (no build step, no dependencies besides Google Fonts).

- `index.html` — landing page
- `app.html` — interactive demo portals: `#talent` (also `#talent/spec|res|inv|fnd`), `#business`, `#mentor`, `#admin`
- `assets/css/styles.css` — design tokens + all styles (mobile-first, RTL via logical properties)
- `assets/js/site.js` — EN/AR switch (RTL), mobile menu, scroll reveal, toasts
- `assets/js/i18n-ar.js` — Arabic strings for static markup (English lives in the HTML)
- `assets/js/app.js` — portal logic, demo data and Arabic/English strings for the portals
- `assets/js/icons.js` — inline SVG icon sprite
- `jisr-canvas/` — the original design-canvas prototype, kept for reference
- `_refs/` — reference screenshots

Run locally: `python server.py` in this folder, then open http://localhost:5178.
(`python -m http.server` also works, but then the Defense Check can only run in demo mode.)

## Defense Check (AI verification + locked mode)

1. Get a free Gemini API key at https://aistudio.google.com/apikey
2. Copy `.env.example` to `.env` and put the key after `GEMINI_API_KEY=`
3. Restart `python server.py` — it prints `Defense Check AI: Gemini (...)`

Flow: talent uploads the editable source file → `server.py` sends it to Gemini, which writes 3 questions
(plus a private rubric that never leaves the server) → rules screen → **locked mode** → Gemini grades.

Locked mode:
- full screen, rest of the site disabled, one question at a time, 100 s each, no going back
- copy/paste/drop/right-click blocked; leaving the tab/window or full screen = a warning;
  2 warnings allowed, the 3rd ends the check; reloading or closing the page = failed attempt
- enforced by the server: question order, the clock (late answers are discarded), the rubric,
  the warning count. Answers that appear without typing, extra screens, or late answers are flagged.
- outcome: passed (badge), sent to mentor review (good answers but integrity flags, or borderline),
  or not verified. Mentors approve/reject reviews in the Mentor portal.

Limits: a browser cannot stop someone reading from a second device or a person helping them.
Short timers, file-specific "why" questions and mentor review are the real defence; webcam
proctoring or in-person checks would be the next step if that matters.

Privacy: uploaded files are sent to Google's Gemini API. On the free tier Google may use the data
to improve its products — use a paid key before handling real users' files.
Sessions live in server memory (45 min) and the document is dropped once graded.

## CV and certificate verification

**My CV** (talent portal): Gemini lists the provable claims in the uploaded CV (projects, jobs,
certifications, degrees). Each project/job is proved by uploading the work: Gemini first checks the
file really is that work (a wrong file is rejected with a reason), then the locked Defense Check runs.
Businesses see "X of Y claims verified".

**Certificates** (no paid APIs):
- file forensics in `verify.py`: PDF re-saved after creation, editing tools (Photoshop, iLovePDF…),
  modified long after it was issued, text in a non-embedded font, digital signature intact or not;
  images: editing software, error-level analysis (JPEG) and a pasted-patch detector
- Gemini reads holder / issuer / course / ID / verification link and looks for visual edits
- if there's a verification link on a known issuer site (Coursera, Credly, Microsoft, edX…), the
  server opens it and Gemini compares it with the certificate — the strongest free proof
- name on the certificate vs the talent's name, and the same file uploaded under another name
- verdicts: confirmed with issuer · no signs of tampering · needs review (mentor queue) · signs of tampering

These checks catch common edits; they can't prove a certificate is genuine without the issuer.

Append `?lang=ar` to any URL to open it in Arabic.

Apart from the Defense Check, all portal data is **demo data** stored in the browser's localStorage
("Reset demo" restores it). There are no real accounts, payments or emails.
