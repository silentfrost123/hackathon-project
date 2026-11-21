"""
Free certificate forensics for JISR — no paid APIs.

These checks look for signs that a certificate file was ALTERED. They cannot prove a
certificate is genuine (only the issuer can); the strongest free proof is the issuer's own
verification page, which fetch_issuer_page() reads.

Each check returns "signals": {"code": str, "status": "pass"|"warn"|"fail"|"info", "params": {...}}.
The browser turns codes into readable English/Arabic text.
"""
import base64
import datetime as dt
import io
import ipaddress
import re
import socket
import urllib.parse
import urllib.request
import zlib

try:
    from PIL import Image, ImageChops, ImageStat
except ImportError:  # the site still works; image checks are skipped
    Image = None

# Tools that are mainly used to EDIT documents/images. Seeing one is a warning, not proof.
EDITORS = [
    "photoshop", "illustrator", "gimp", "inkscape", "affinity", "pixlr", "photopea", "paint.net",
    "pdfescape", "sejda", "ilovepdf", "smallpdf", "pdf-xchange editor", "pdfxchange editor", "phantompdf",
    "foxit pdf editor", "nitro pro", "pdffiller", "dochub", "soda pdf", "pdfelement", "pdf candy", "lightpdf",
]
DESIGN_TOOLS = ["canva", "figma", "powerpoint", "microsoft word", "google docs", "keynote", "pages"]

# Issuer sites whose public verification pages the server is allowed to open.
ISSUER_HOSTS = [
    "coursera.org", "credly.com", "youracclaim.com", "udemy.com", "ude.my", "learn.microsoft.com",
    "edx.org", "credential.net", "accredible.com", "badgr.com", "freecodecamp.org", "hackerrank.com",
    "datacamp.com", "linkedin.com", "cert.efset.org", "efset.org", "google.com", "skillshop.withgoogle.com",
    "cloudskillsboost.google", "aws.amazon.com", "certmetrics.com", "cisco.com", "comptia.org",
    "isc2.org", "pmi.org", "acca.global", "accaglobal.com", "cfainstitute.org", "kaggle.com", "sololearn.com",
    "codecademy.com", "simplilearn.com", "greatlearning.in", "alison.com", "futurelearn.com", "edraak.org",
    "rwaq.org", "maharatech.gov.eg", "doroob.sa", "hbku.edu.qa",
]


def _sig(code, status, **params):
    return {"code": code, "status": status, "params": params}


# ---------------------------------------------------------------- PDF
def _pdf_str(b):
    """Decode a PDF literal/hex string roughly into text."""
    if b.startswith(b"<") and b.endswith(b">"):
        try:
            b = bytes.fromhex(re.sub(rb"\s", b"", b[1:-1]).decode())
        except ValueError:
            return ""
    else:
        b = b[1:-1] if b.startswith(b"(") else b
        b = re.sub(rb"\\([nrtbf()\\])", lambda m: {b"n": b"\n", b"r": b"\r", b"t": b"\t", b"b": b"", b"f": b""}.get(m.group(1), m.group(1)), b)
    if b.startswith(b"\xfe\xff"):
        return b[2:].decode("utf-16-be", errors="ignore")
    return b.decode("latin-1", errors="ignore")


def _pdf_date(s):
    m = re.search(r"(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?", s or "")
    if not m:
        return None
    y, mo, d, h, mi = (int(x) if x else dflt for x, dflt in zip(m.groups(), (0, 1, 1, 0, 0)))
    try:
        return dt.datetime(y, mo, d, h, mi)
    except ValueError:
        return None


def _streams(raw, budget=40_000_000):
    out, total = [], 0
    for m in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", raw, re.S):
        try:
            d = zlib.decompress(m.group(1))
        except zlib.error:
            continue
        total += len(d)
        if total > budget:
            break
        out.append(d)
    return out


def pdf_forensics(raw):
    signals, meta = [], {}
    if not raw.startswith(b"%PDF"):
        return [_sig("not_pdf", "fail")], meta
    blob = raw + b"\n".join(_streams(raw))

    # 1. digital signature: does the signed byte range cover the whole file?
    ranges = re.findall(rb"/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]", raw)
    n_sigs = len(ranges)
    if ranges:
        a, b, c, d = map(int, ranges[-1])
        end = len(raw.rstrip())
        if c + d >= end - 2:
            signals.append(_sig("pdf_signed_intact", "pass"))
        else:
            signals.append(_sig("pdf_signed_changed", "warn", bytes=end - (c + d)))

    # 2. saved again after creation (incremental updates)
    linearized = 1 if b"/Linearized" in raw[:2048] else 0
    updates = raw.count(b"%%EOF") - 1 - linearized - n_sigs
    if updates > 0:
        signals.append(_sig("pdf_resaved", "warn", n=updates))

    # 3. which software made / last saved it
    tools = []
    for key in (rb"/Producer", rb"/Creator"):
        for m in re.finditer(key + rb"\s*(\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]*>)", blob):
            tools.append(_pdf_str(m.group(1)).strip())
    for m in re.finditer(rb"<(?:xmp:CreatorTool|pdf:Producer)>(.*?)</", blob, re.S):
        tools.append(m.group(1).decode("utf-8", "ignore").strip())
    tools = [t for t in dict.fromkeys(tools) if t]
    meta["software"] = tools[:4]
    low = " | ".join(tools).lower()
    editor = next((e for e in EDITORS if e in low), None)
    design = next((e for e in DESIGN_TOOLS if e in low), None)
    if editor:
        signals.append(_sig("pdf_editor", "warn", tool=editor.title()))
    elif design:
        signals.append(_sig("pdf_design_tool", "info", tool=design.title()))

    # 4. modified long after it was created
    # incremental updates append a newer Info dictionary, so the LAST dates are the current ones
    cds = [_pdf_date(_pdf_str(x)) for x in re.findall(rb"/CreationDate\s*(\([^)]*\))", blob)]
    mds = [_pdf_date(_pdf_str(x)) for x in re.findall(rb"/ModDate\s*(\([^)]*\))", blob)]
    cds = [d for d in cds if d]
    mds = [d for d in mds if d]
    cd = min(cds) if cds else None
    md = max(mds) if mds else None
    if cd:
        meta["created"] = cd.strftime("%Y-%m-%d")
    if cd and md and (md - cd).days >= 1:
        signals.append(_sig("pdf_modified_later", "warn", days=(md - cd).days))

    # 5. text in a font that isn't embedded like the rest -> often text typed on top later
    fonts = list(dict.fromkeys(f.decode("latin-1") for f in re.findall(rb"/BaseFont\s*/([A-Za-z0-9+\-_,.#]+)", blob)))
    subset = [f for f in fonts if re.match(r"^[A-Z]{6}\+", f)]
    plain = [f for f in fonts if not re.match(r"^[A-Z]{6}\+", f)]
    meta["fonts"] = len(fonts)
    if subset and plain:
        signals.append(_sig("pdf_font_mismatch", "warn", fonts=", ".join(plain[:3])))

    if not any(s["status"] in ("warn", "fail") for s in signals):
        signals.append(_sig("pdf_structure_ok", "pass"))
    return signals, meta


# ---------------------------------------------------------------- images
def _png_software(raw):
    found = []
    for m in re.finditer(rb"(tEXt|iTXt)(Software|Creator Tool|Comment)\x00+([^\x00]{1,80})", raw[:200_000]):
        found.append(m.group(3).decode("latin-1", "ignore"))
    return found


def image_forensics(raw, ext):
    signals, meta, heat = [], {}, None
    if Image is None:
        return [_sig("img_checks_unavailable", "info")], meta, None
    try:
        im = Image.open(io.BytesIO(raw))
        im.load()
    except Exception:
        return [_sig("img_unreadable", "fail")], meta, None
    meta["size"] = f"{im.width}x{im.height}"

    software = []
    try:
        exif = im.getexif()
        if exif.get(305):
            software.append(str(exif.get(305)))
    except Exception:
        pass
    if ext == ".png":
        software += _png_software(raw)
    software += [str(v) for k, v in (im.info or {}).items() if str(k).lower() in ("software", "creator tool") and isinstance(v, str)]
    software = [s.strip() for s in dict.fromkeys(software) if s and s.strip()]
    meta["software"] = software[:3]
    low = " | ".join(software).lower()
    editor = next((e for e in EDITORS if e in low), None)
    design = next((e for e in DESIGN_TOOLS if e in low), None)
    if editor:
        signals.append(_sig("img_editor", "warn", tool=editor.title()))
    elif design:
        signals.append(_sig("img_design_tool", "info", tool=design.title()))

    # Error Level Analysis (JPEG only): re-save at a known quality and look for regions
    # whose compression error differs sharply from the rest (pasted / retouched areas).
    if ext in (".jpg", ".jpeg") and max(im.size) <= 5000:
        rgb = im.convert("RGB")
        buf = io.BytesIO()
        rgb.save(buf, "JPEG", quality=90)
        resaved = Image.open(io.BytesIO(buf.getvalue())).convert("RGB")
        diff = ImageChops.difference(rgb, resaved).convert("L")
        w, h = diff.size
        cols, rows = 12, 12
        cells = []
        for r in range(rows):
            for c in range(cols):
                box = (c * w // cols, r * h // rows, (c + 1) * w // cols, (r + 1) * h // rows)
                cells.append(ImageStat.Stat(diff.crop(box)).mean[0])
        srt = sorted(cells)
        median = srt[len(srt) // 2]
        top = srt[-1]
        hot = sum(1 for v in cells if v > max(3 * median, median + 4))
        ratio = (top + 0.5) / (median + 0.5)
        meta["ela_ratio"] = round(ratio, 1)
        if ratio >= 6 and top >= 6 and 1 <= hot <= len(cells) * 0.25:
            signals.append(_sig("img_ela_uneven", "warn", cells=hot))
        else:
            signals.append(_sig("img_ela_even", "pass"))
        # heat map for the reviewer: brighten the difference image
        ext_max = max(1, diff.getextrema()[1])
        vis = diff.point(lambda p: min(255, int(p * 255 / ext_max)))
        vis.thumbnail((640, 640))
        out = io.BytesIO()
        vis.save(out, "PNG", optimize=True)
        heat = "data:image/png;base64," + base64.b64encode(out.getvalue()).decode()
    elif ext in (".png", ".webp"):
        signals.append(_sig("img_lossless", "info"))

    # Smooth-patch check: a flat block in an otherwise textured background is a classic sign of
    # something painted over (e.g. a name or date covered and retyped).
    gray = im.convert("L")
    w, h = gray.size
    cols, rows = 32, 24
    if w >= 320 and h >= 240:
        grid = [[ImageStat.Stat(gray.crop((c * w // cols, r * h // rows, (c + 1) * w // cols, (r + 1) * h // rows))).stddev[0]
                 for c in range(cols)] for r in range(rows)]
        flat = sorted(v for row in grid for v in row)
        typical = flat[len(flat) // 2]
        if typical >= 3:   # only meaningful when the background itself has texture
            smooth = {(r, c) for r in range(rows) for c in range(cols) if grid[r][c] < typical * 0.25}
            seen, patches = set(), 0
            for start in smooth:
                if start in seen:
                    continue
                comp, stack = [], [start]
                seen.add(start)
                while stack:
                    r, c = stack.pop()
                    comp.append((r, c))
                    for nb in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if nb in smooth and nb not in seen:
                            seen.add(nb)
                            stack.append(nb)
                rs = [x[0] for x in comp]
                cs = [x[1] for x in comp]
                if min(rs) == 0 or min(cs) == 0 or max(rs) == rows - 1 or max(cs) == cols - 1:
                    continue      # touches the edge: margins / plain areas, not a patch
                if not (2 <= len(comp) <= rows * cols * 0.12):
                    continue
                box = (max(rs) - min(rs) + 1) * (max(cs) - min(cs) + 1)
                if len(comp) / box < 0.6:
                    continue      # patches pasted over text are rectangles
                ring = {(r + dr, c + dc) for r, c in comp for dr in (-1, 0, 1) for dc in (-1, 0, 1)} - set(comp)
                textured = sum(1 for (r, c) in ring if grid[r][c] >= typical * 0.6)
                if ring and textured / len(ring) >= 0.6:
                    patches += 1
            meta["smooth_patches"] = patches
            if patches:
                signals.append(_sig("img_smooth_patch", "warn", n=patches))

    if not software and ext in (".jpg", ".jpeg") and not editor:
        signals.append(_sig("img_no_meta", "info"))
    return signals, meta, heat


# ---------------------------------------------------------------- issuer page
def issuer_allowed(url):
    try:
        u = urllib.parse.urlparse(url)
    except ValueError:
        return False
    host = (u.hostname or "").lower()
    return u.scheme == "https" and any(host == h or host.endswith("." + h) for h in ISSUER_HOSTS)


def _public_host(host):
    try:
        for info in socket.getaddrinfo(host, 443):
            ip = ipaddress.ip_address(info[4][0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                return False
        return True
    except OSError:
        return False


class _SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not issuer_allowed(newurl):
            return None
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch_issuer_page(url):
    """Return (status, text). status: ok | not_allowed | unreachable | empty."""
    if not issuer_allowed(url):
        return "not_allowed", ""
    if not _public_host(urllib.parse.urlparse(url).hostname):
        return "not_allowed", ""
    opener = urllib.request.build_opener(_SafeRedirect)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; JISR-CertCheck/1.0)", "Accept-Language": "en"})
    try:
        with opener.open(req, timeout=15) as r:
            if not issuer_allowed(r.geturl()):
                return "not_allowed", ""
            html = r.read(1_500_000).decode("utf-8", "ignore")
    except Exception:
        return "unreachable", ""
    html = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", html)
    # keep useful meta tags (many verify pages put the name/course there)
    metas = " ".join(re.findall(r'(?i)<meta[^>]+content="([^"]{3,300})"', html))
    text = re.sub(r"(?s)<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", metas + " " + text).strip()
    if len(text) < 200:
        return "empty", text
    return "ok", text[:20_000]
