/* JISR sign in + 4-step KYC sign-up (auth.html).
   Talks to /api/auth/* in server.py / auth_api.py. Strings follow app.js: T[key] = [English, Arabic].
   Views: auth.html#signin, auth.html#signup. State lives in memory (and the non-secret parts in
   sessionStorage) so going back a step or switching language never loses what was typed. */
(function () {
  'use strict';

  var T = {
    signinTitle: ['Sign in', 'تسجيل الدخول'],
    signinLead: ['Welcome back. Use the email you verified.', 'مرحبًا بعودتك. استخدم البريد الإلكتروني الذي وثّقته.'],
    email: ['Email', 'البريد الإلكتروني'],
    password: ['Password', 'كلمة المرور'],
    showPw: ['Show password', 'إظهار كلمة المرور'],
    hidePw: ['Hide password', 'إخفاء كلمة المرور'],
    forgot: ['Forgot password?', 'نسيت كلمة المرور؟'],
    forgotStub: ['Password reset is coming soon in this prototype.', 'استعادة كلمة المرور قادمة قريبًا في هذا النموذج.'],
    signinBtn: ['Sign in', 'دخول'],
    signingIn: ['Signing in…', 'جارٍ تسجيل الدخول…'],
    noAccount: ['New to JISR?', 'جديد على جسر؟'],
    createAcc: ['Create a verified account', 'أنشئ حسابًا موثّقًا'],
    haveAccount: ['Already have an account?', 'لديك حساب بالفعل؟'],
    signinLink: ['Sign in', 'سجّل الدخول'],

    signupTitle: ['Create your verified account', 'أنشئ حسابك الموثّق'],
    stepOf: ['Step {n} of 4', 'الخطوة {n} من 4'],
    s1: ['Account', 'الحساب'], s2: ['Phone', 'الهاتف'], s3: ['Identity', 'الهوية'], s4: ['Done', 'تم'],
    progress: ['Sign-up progress', 'تقدّم التسجيل'],
    completed: ['completed', 'مكتملة'], current: ['current step', 'الخطوة الحالية'],

    iAm: ['I\'m joining as', 'أنضم بصفتي'],
    talent: ['Talent', 'موهبة'], talentSub: ['Build a verified portfolio', 'ابنِ ملف أعمال موثّقًا'],
    partner: ['Partner', 'شريك'], partnerSub: ['Company or investor', 'شركة أو مستثمر'],
    track: ['Your track', 'مسارك'],
    specialist: ['Specialist', 'متخصص'], researcher: ['Researcher', 'باحث'], inventor: ['Inventor', 'مخترع'], founder: ['Founder', 'مؤسس'],
    fullName: ['Full name', 'الاسم الكامل'],
    fullNameHelp: ['As you\'d like it on your profile.', 'كما تريده أن يظهر في ملفك.'],
    pwHelp: ['At least 8 characters, with letters and numbers.', '8 أحرف على الأقل، تتضمن حروفًا وأرقامًا.'],
    sendEmailCode: ['Send email code', 'أرسل رمز البريد'],
    sending: ['Sending…', 'جارٍ الإرسال…'],
    continue: ['Continue', 'متابعة'],
    back: ['Back', 'رجوع'],
    checkEmail: ['Check your email', 'تحقّق من بريدك'],
    checkPhone: ['Check your messages', 'تحقّق من رسائلك'],
    sentTo: ['We sent a 6-digit code to {d}.', 'أرسلنا رمزًا من 6 أرقام إلى {d}.'],
    code: ['Verification code', 'رمز التحقق'],
    codeHelp: ['The code expires in 10 minutes.', 'تنتهي صلاحية الرمز خلال 10 دقائق.'],
    verify: ['Verify', 'تحقّق'],
    verifying: ['Verifying…', 'جارٍ التحقق…'],
    resend: ['Resend code', 'أعد إرسال الرمز'],
    resendIn: ['Resend in {s}s', 'إعادة الإرسال بعد {s} ث'],
    changeEmail: ['Change email', 'غيّر البريد'],
    changePhone: ['Change number', 'غيّر الرقم'],
    codeSent: ['A new code is on its way.', 'تم إرسال رمز جديد.'],
    demoHint: ['Demo mode: no message is sent. Use code', 'وضع العرض: لا تُرسل رسائل فعلية. استخدم الرمز'],
    emailVerified: ['Email verified', 'تم توثيق البريد'],
    phoneVerified: ['Phone verified', 'تم توثيق الهاتف'],

    phoneTitle: ['Verify your phone', 'وثّق رقم هاتفك'],
    phoneLead: ['We\'ll text you a code. One number can belong to one account only.', 'سنرسل لك رمزًا برسالة نصية. يرتبط كل رقم بحساب واحد فقط.'],
    country: ['Country code', 'رمز الدولة'],
    mobile: ['Mobile number', 'رقم الجوال'],
    mobileHelp: ['UAE mobiles start with 5, e.g. 50 123 4567.', 'أرقام الجوال في الإمارات تبدأ بـ 5، مثل 50 123 4567.'],
    sendSms: ['Send SMS code', 'أرسل رمز الرسالة'],

    idTitle: ['Verify your identity', 'وثّق هويتك'],
    idLead: ['This keeps JISR to one account per person. We store only a secure fingerprint of the number, never the number itself.', 'هذا ما يضمن حسابًا واحدًا لكل شخص في جسر. نحفظ بصمة آمنة للرقم فقط، ولا نحفظ الرقم نفسه أبدًا.'],
    idType: ['ID type', 'نوع الهوية'],
    eid: ['Emirates ID', 'الهوية الإماراتية'], eidSub: ['National ID', 'الهوية الوطنية'],
    uid: ['University ID', 'البطاقة الجامعية'], uidSub: ['Student or staff card', 'بطاقة طالب أو موظف'],
    idNumber: ['ID number', 'رقم الهوية'],
    eidHelp: ['15 digits starting with 784, e.g. 784-1999-1234567-1.', '15 رقمًا تبدأ بـ 784، مثل 784-1999-1234567-1.'],
    uidHelp: ['As printed on your card. Letters and numbers.', 'كما هو مطبوع على بطاقتك. حروف وأرقام.'],
    university: ['University', 'الجامعة'],
    nameOnId: ['Name as it appears on the ID', 'الاسم كما يظهر في الهوية'],
    nameOnIdHelp: ['Arabic or English, exactly as printed.', 'بالعربية أو الإنجليزية، كما هو مطبوع تمامًا.'],
    idImage: ['Photo of the ID (optional in this prototype)', 'صورة الهوية (اختيارية في هذا النموذج)'],
    chooseFile: ['Choose a JPG, PNG or PDF, up to 5 MB', 'اختر ملف JPG أو PNG أو PDF حتى 5 ميغابايت'],
    removeFile: ['Remove', 'إزالة'],
    kybTitle: ['Business verification (KYB)', 'توثيق المنشأة (KYB)'],
    soon: ['Coming soon', 'قريبًا'],
    kybLead: ['Partners will verify their company separately. Add your trade licence number now if you have it.', 'سيوثّق الشركاء منشآتهم بشكل منفصل. أضف رقم الرخصة التجارية الآن إن توفّر.'],
    tradeLicense: ['Trade licence number (optional)', 'رقم الرخصة التجارية (اختياري)'],
    verifyId: ['Verify ID and finish', 'وثّق الهوية وأنهِ التسجيل'],
    checkingId: ['Checking ID…', 'جارٍ فحص الهوية…'],

    doneTitle: ['You\'re verified', 'تم توثيقك'],
    doneLead: ['Your account is linked to one verified identity. Your score and badges will always stay with it.', 'حسابك مرتبط بهوية موثّقة واحدة، وسيبقى مؤشرك وشاراتك معها دائمًا.'],
    kycVerified: ['KYC verified', 'هوية موثّقة'],
    sumEmail: ['Email', 'البريد'], sumPhone: ['Phone', 'الهاتف'], sumId: ['ID', 'الهوية'],
    sumScore: ['Identity & Trust', 'الهوية والثقة'],
    nameReview: ['The name on your ID differs from your profile name, so a mentor may double-check it.', 'الاسم في هويتك يختلف عن اسم ملفك، لذا قد يراجعه أحد المرشدين.'],
    toDashboard: ['Continue to my dashboard', 'تابع إلى لوحتي'],
    toPartner: ['Continue to the partner portal', 'تابع إلى بوابة الشركاء'],

    // errors (codes from auth_api.py)
    e_invalid_name: ['Enter your full name (letters only).', 'أدخل اسمك الكامل (حروف فقط).'],
    e_invalid_email: ['Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.'],
    e_weak_password: ['Use at least 8 characters with letters and numbers.', 'استخدم 8 أحرف على الأقل تتضمن حروفًا وأرقامًا.'],
    e_required: ['This field is required.', 'هذا الحقل مطلوب.'],
    e_invalid_role: ['Choose how you\'ll use JISR.', 'اختر كيف ستستخدم جسر.'],
    e_invalid_track: ['Choose your track.', 'اختر مسارك.'],
    e_invalid_phone: ['Enter a valid mobile number.', 'أدخل رقم جوال صحيحًا.'],
    e_bad_code: ['That code isn\'t right. {n} tries left.', 'الرمز غير صحيح. تبقّى {n} محاولات.'],
    e_code_format: ['Enter the 6-digit code.', 'أدخل الرمز المكوّن من 6 أرقام.'],
    e_code_expired: ['This code has expired. Request a new one.', 'انتهت صلاحية الرمز. اطلب رمزًا جديدًا.'],
    e_too_many_attempts: ['Too many wrong codes. Request a new one.', 'محاولات خاطئة كثيرة. اطلب رمزًا جديدًا.'],
    e_rate_limited: ['Too many attempts. Please wait {s} seconds and try again.', 'محاولات كثيرة. انتظر {s} ثانية ثم حاول مجددًا.'],
    e_identity_exists: ['An account already exists for this identity. <a href="#signin">Sign in instead.</a>', 'يوجد حساب بالفعل لهذه الهوية. <a href="#signin">سجّل الدخول بدلًا من ذلك.</a>'],
    e_signup_expired: ['This sign-up has expired. Please start again.', 'انتهت صلاحية هذا التسجيل. ابدأ من جديد.'],
    e_step_order: ['Please finish the previous step first.', 'أكمل الخطوة السابقة أولًا.'],
    e_invalid_id_type: ['Choose an ID type.', 'اختر نوع الهوية.'],
    e_invalid_id: ['Check the ID number.', 'تحقّق من رقم الهوية.'],
    e_invalid_id_name: ['Enter your name exactly as it appears on the ID.', 'أدخل اسمك كما يظهر في الهوية تمامًا.'],
    e_invalid_institution: ['Enter your university.', 'أدخل اسم جامعتك.'],
    e_image_too_big: ['The ID image must be under 5 MB.', 'يجب أن يكون حجم صورة الهوية أقل من 5 ميغابايت.'],
    e_bad_image: ['Choose a JPG, PNG or PDF file.', 'اختر ملف JPG أو PNG أو PDF.'],
    e_login_failed: ['Email or password is incorrect.', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
    e_network: ['Can\'t reach the server. Check your connection, or run it with python server.py.', 'تعذّر الوصول إلى الخادم. تحقّق من الاتصال، أو شغّله عبر python server.py.'],
    e_server_error: ['Something went wrong on the server. Please try again.', 'حدث خطأ في الخادم. حاول مرة أخرى.'],
    errorsAbove: ['Please fix the highlighted fields.', 'يرجى تصحيح الحقول المظللة.']
  };

  var COUNTRIES = {
    '+971': ['UAE', 'الإمارات'], '+966': ['Saudi Arabia', 'السعودية'], '+974': ['Qatar', 'قطر'], '+965': ['Kuwait', 'الكويت'],
    '+973': ['Bahrain', 'البحرين'], '+968': ['Oman', 'عُمان'], '+20': ['Egypt', 'مصر'], '+962': ['Jordan', 'الأردن'],
    '+961': ['Lebanon', 'لبنان'], '+44': ['UK', 'المملكة المتحدة'], '+1': ['US/Canada', 'أمريكا/كندا'], '+91': ['India', 'الهند'], '+92': ['Pakistan', 'باكستان']
  };
  var UNIS = ['United Arab Emirates University', 'Khalifa University', 'University of Sharjah', 'American University of Sharjah',
    'Zayed University', 'Higher Colleges of Technology', 'NYU Abu Dhabi', 'American University in Dubai', 'Abu Dhabi University', 'Ajman University'];
  var TRACKS = [['specialist', 'briefcase'], ['researcher', 'flask'], ['inventor', 'bulb'], ['founder', 'rocket']];
  var SS_KEY = 'jisr.signup';

  function lang() { return window.JISR && window.JISR.lang ? window.JISR.lang() : 'en'; }
  function t(key, p) {
    var e = T[key]; var s = e ? (lang() === 'ar' ? e[1] : e[0]) : key;
    if (p) for (var k in p) s = s.split('{' + k + '}').join(p[k]);
    return s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ico(name, cls) { return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>'; }
  function $(sel) { return root.querySelector(sel); }

  var root = document.getElementById('auth-root');

  /* ------------------------------------------------------------ state */
  var S = {
    cfg: { demo: true, demoCode: null, countryCodes: Object.keys(COUNTRIES) },
    view: 'signin',
    busy: false,
    errors: {}, formError: '',
    signin: { email: '', password: '' },
    step: 1,
    sub: 'form',               // 'form' | 'code' (steps 1 and 2)
    acct: { fullName: '', email: '', password: '', role: 'talent', track: 'specialist' },
    phone: { cc: '+971', number: '' },
    ident: { idType: 'emirates_id', idNumber: '', nameOnId: '', institution: '', file: null, tradeLicense: '' },
    code: '',
    token: null, signup: null, resendAt: 0,
    user: null
  };

  function persist() {
    try {
      if (!S.token) { sessionStorage.removeItem(SS_KEY); return; }
      sessionStorage.setItem(SS_KEY, JSON.stringify({
        token: S.token, step: S.step, sub: S.sub,
        acct: { fullName: S.acct.fullName, email: S.acct.email, role: S.acct.role, track: S.acct.track },
        phone: S.phone
      }));
    } catch (e) {}
  }
  function restore() {
    try { var r = JSON.parse(sessionStorage.getItem(SS_KEY) || 'null'); } catch (e) { r = null; }
    if (!r || !r.token) return;
    S.token = r.token; S.step = r.step || 1; S.sub = r.sub || 'form';
    Object.assign(S.acct, r.acct || {}); Object.assign(S.phone, r.phone || {});
    api('/api/auth/signup/status', { token: S.token }).then(function (res) {
      S.signup = res.signup;
      // never land past what the server says is verified
      if (!res.signup.emailVerified) S.step = 1;
      else if (!res.signup.phoneVerified && S.step > 2) S.step = 2;
      if (S.step === 3 && !S.ident.nameOnId) S.ident.nameOnId = S.acct.fullName;
      render(true);
    }).catch(function () { S.token = null; S.signup = null; S.step = 1; S.sub = 'form'; persist(); render(true); });
  }

  /* ------------------------------------------------------------ API */
  function api(path, body) {
    var opts = body === undefined ? { credentials: 'same-origin' }
      : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ lang: lang() }, body)) };
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return { error: 'server_error' }; }).then(function (data) {
        if (!r.ok) { var err = new Error(data.message || 'error'); err.data = data; err.status = r.status; throw err; }
        return data;
      });
    }, function () { var err = new Error('network'); err.data = { error: 'network' }; throw err; });
  }

  function errText(data) {
    var code = (data && data.error) || 'server_error';
    if (code === 'bad_code') return t('e_bad_code', { n: data.attemptsLeft != null ? data.attemptsLeft : '' });
    if (code === 'rate_limited') return t('e_rate_limited', { s: data.retryAfter || 60 });
    return T['e_' + code] ? t('e_' + code) : (data && data.message) || t('e_server_error');
  }

  // Shows a server error either under its field or in the form-level alert.
  function showError(err) {
    var d = err.data || {};
    if (d.error === 'identity_exists' || d.error === 'signup_expired') {
      S.token = null; S.signup = null; persist();
      if (d.error === 'signup_expired') { S.step = 1; S.sub = 'form'; }
    }
    if (d.field && d.field !== 'code' && fieldExists(d.field)) { S.errors = {}; S.errors[d.field] = errText(d); S.formError = ''; }
    else if (d.field === 'code') { S.errors = { code: errText(d) }; S.formError = ''; }
    else { S.formError = errText(d); }
    S.busy = false;
    render(false, true);
  }
  function fieldExists(name) { return !!root.querySelector('[name="' + name + '"]'); }

  /* ------------------------------------------------------------ client-side validation (mirrors identity.py) */
  var V = {
    fullName: function (v) { v = v.trim(); return v.length < 2 ? 'e_required' : /[<>{}\d@]/.test(v) ? 'e_invalid_name' : ''; },
    email: function (v) { v = v.trim(); return !v ? 'e_required' : /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v) ? '' : 'e_invalid_email'; },
    password: function (v) { return !v ? 'e_required' : (v.length >= 8 && /[A-Za-z؀-ۿ]/.test(v) && /\d/.test(v)) ? '' : 'e_weak_password'; },
    signinPassword: function (v) { return v ? '' : 'e_required'; },
    phone: function (v) {
      var d = toAscii(v).replace(/\D/g, '').replace(/^0+/, '');
      var cc = S.phone.cc.slice(1);
      if (d.indexOf('00' + cc) === 0) d = d.slice(2 + cc.length); else if (d.length > 10 && d.indexOf(cc) === 0) d = d.slice(cc.length);
      if (!d) return 'e_required';
      if (S.phone.cc === '+971') return /^5\d{8}$/.test(d) ? '' : 'e_invalid_phone';
      return d.length >= 7 && d.length <= 10 ? '' : 'e_invalid_phone';
    },
    code: function (v) { return /^\d{6}$/.test(toAscii(v).trim()) ? '' : 'e_code_format'; },
    idNumber: function (v) {
      var n = toAscii(v).toUpperCase().replace(/[\s\-./_]/g, '');
      if (!n) return 'e_required';
      return S.ident.idType === 'emirates_id' ? (/^784\d{12}$/.test(n) ? '' : 'e_invalid_id') : (/^[A-Z0-9]{4,20}$/.test(n) ? '' : 'e_invalid_id');
    },
    nameOnId: function (v) { v = v.trim(); return v.length < 2 ? 'e_required' : /[<>{}\d@]/.test(v) ? 'e_invalid_id_name' : ''; },
    institution: function (v) { return S.ident.idType !== 'university_id' || v.trim().length >= 3 ? '' : 'e_invalid_institution'; }
  };
  function toAscii(s) { return String(s || '').replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 1776; }); }

  function validate(names) {
    var ok = true; S.errors = {};
    names.forEach(function (n) {
      var el = root.querySelector('[name="' + n + '"]'); if (!el) return;
      var rule = V[el.getAttribute('data-rule') || n]; if (!rule) return;
      var k = rule(el.value || '');
      if (k) { S.errors[n] = t(k); ok = false; }
    });
    return ok;
  }

  // Inline validation on blur without a full re-render (keeps focus where the user is).
  function paintFieldError(el) {
    var n = el.name, rule = V[el.getAttribute('data-rule') || n]; if (!rule) return;
    var k = el.value ? rule(el.value) : '';   // don't nag about empty fields until submit
    var box = root.querySelector('#err-' + n);
    if (k) S.errors[n] = t(k); else delete S.errors[n];
    el.setAttribute('aria-invalid', k ? 'true' : 'false');
    if (box) box.innerHTML = k ? ico('alert') + '<span>' + esc(t(k)) + '</span>' : '';
  }

  /* ------------------------------------------------------------ render helpers */
  function field(o) {
    // o: name, label, type, value, help, autocomplete, inputmode, rule, dir, maxlength, placeholder, extraCls
    var err = S.errors[o.name];
    var ids = []; if (o.help) ids.push('help-' + o.name); ids.push('err-' + o.name);
    var input = '<input class="input' + (o.extraCls ? ' ' + o.extraCls : '') + '" id="f-' + o.name + '" name="' + o.name + '" type="' + (o.type || 'text') + '"' +
      ' value="' + esc(o.value) + '"' + (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : '') +
      (o.inputmode ? ' inputmode="' + o.inputmode + '"' : '') + (o.rule ? ' data-rule="' + o.rule + '"' : '') +
      (o.dir ? ' dir="' + o.dir + '"' : '') + (o.maxlength ? ' maxlength="' + o.maxlength + '"' : '') +
      (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + (o.list ? ' list="' + o.list + '"' : '') +
      (o.required !== false ? ' required aria-required="true"' : '') +
      ' aria-invalid="' + (err ? 'true' : 'false') + '" aria-describedby="' + ids.join(' ') + '">';
    if (o.type === 'password') {
      input = '<div class="pw-wrap">' + input + '<button type="button" class="pw-toggle" data-act="pw" aria-controls="f-' + o.name + '" aria-pressed="false" aria-label="' + esc(t('showPw')) + '">' + ico('eye') + '</button></div>';
    }
    return '<div class="field">' +
      (o.labelRow ? '<div class="field-row"><label for="f-' + o.name + '">' + esc(o.label) + '</label>' + o.labelRow + '</div>' : '<label for="f-' + o.name + '">' + esc(o.label) + '</label>') +
      input +
      (o.help ? '<span class="help" id="help-' + o.name + '">' + esc(o.help) + '</span>' : '') +
      '<span class="error-msg" id="err-' + o.name + '">' + (err ? ico('alert') + '<span>' + esc(err) + '</span>' : '') + '</span>' +
      '</div>';
  }
  function formError() {
    return '<div class="form-error" role="alert" id="form-error">' + (S.formError ? ico('alert') + '<span>' + S.formError + '</span>' : '') + '</div>';
  }
  function button(label, busyLabel, cls, act) {
    return '<button type="submit" class="btn ' + (cls || 'btn-primary') + ' btn-lg"' + (act ? ' data-act="' + act + '"' : '') + (S.busy ? ' disabled aria-busy="true"' : '') + '>' +
      (S.busy ? '<span class="spinner" aria-hidden="true"></span>' + esc(busyLabel) : esc(label)) + '</button>';
  }
  function demoHint() {
    if (!S.cfg.demo || !S.cfg.demoCode) return '';
    return '<p class="demo-hint" role="note">' + ico('info') + '<span>' + esc(t('demoHint')) + ' <code>' + esc(S.cfg.demoCode) + '</code></span></p>';
  }
  function backBtn() {
    return '<button type="button" class="btn btn-outline btn-lg" data-act="back">' + ico('arrow-right', 'back-arrow') + '<span>' + esc(t('back')) + '</span></button>';
  }

  function progress() {
    var h = '<ol class="kyc-steps" aria-label="' + esc(t('progress')) + '">';
    ['s1', 's2', 's3', 's4'].forEach(function (k, i) {
      var n = i + 1, st = n < S.step ? 'done' : n === S.step ? 'current' : '';
      h += '<li class="' + st + '"' + (st === 'current' ? ' aria-current="step"' : '') + '><span class="bar" aria-hidden="true"></span><span class="lbl">' +
        (st === 'done' ? ico('check') : '') + esc(t(k)) + (st ? '<span class="sr-only"> (' + esc(t(st === 'done' ? 'completed' : 'current')) + ')</span>' : '') + '</span></li>';
    });
    return h + '</ol>';
  }

  /* ------------------------------------------------------------ views */
  function viewSignin() {
    return '<h2 id="view-h" tabindex="-1">' + esc(t('signinTitle')) + '</h2>' +
      '<p class="lead">' + esc(t('signinLead')) + '</p>' +
      '<form data-form="signin" novalidate>' + formError() +
      field({ name: 'signinEmail', label: t('email'), type: 'email', value: S.signin.email, autocomplete: 'username', rule: 'email', dir: 'ltr', inputmode: 'email' }) +
      field({ name: 'signinPassword', label: t('password'), type: 'password', value: S.signin.password, autocomplete: 'current-password', rule: 'signinPassword',
        labelRow: '<a href="#forgot" data-act="forgot">' + esc(t('forgot')) + '</a>' }) +
      button(t('signinBtn'), t('signingIn'), 'btn-primary btn-block') +
      '</form>' +
      '<p class="auth-switch">' + esc(t('noAccount')) + ' <a href="#signup">' + esc(t('createAcc')) + '</a></p>';
  }

  function stepAccount() {
    if (S.sub === 'code') return codeView('email');
    var a = S.acct;
    var roles = [['talent', 'user', 'talentSub'], ['partner', 'building', 'partnerSub']].map(function (r) {
      return '<label class="choice"><input type="radio" name="role" value="' + r[0] + '"' + (a.role === r[0] ? ' checked' : '') + '>' + ico(r[1]) +
        '<span>' + esc(t(r[0])) + '<small>' + esc(t(r[2])) + '</small></span></label>';
    }).join('');
    var tracks = a.role !== 'talent' ? '' : '<fieldset class="field"><legend>' + esc(t('track')) + '</legend><div class="choice-grid tracks">' +
      TRACKS.map(function (tr) {
        return '<label class="choice"><input type="radio" name="track" value="' + tr[0] + '"' + (a.track === tr[0] ? ' checked' : '') + '>' + ico(tr[1]) + '<span>' + esc(t(tr[0])) + '</span></label>';
      }).join('') + '</div></fieldset>';
    var verified = S.signup && S.signup.emailVerified && sameEmail();
    return '<form data-form="account" novalidate>' + formError() +
      '<fieldset class="field"><legend>' + esc(t('iAm')) + '</legend><div class="choice-grid">' + roles + '</div></fieldset>' + tracks +
      field({ name: 'fullName', label: t('fullName'), value: a.fullName, autocomplete: 'name', help: t('fullNameHelp'), maxlength: 80 }) +
      field({ name: 'email', label: t('email'), type: 'email', value: a.email, autocomplete: 'email', dir: 'ltr', inputmode: 'email', maxlength: 254,
        help: verified ? '✓ ' + t('emailVerified') : '' }) +
      field({ name: 'password', label: t('password'), type: 'password', value: a.password, autocomplete: 'new-password', help: t('pwHelp'), maxlength: 200,
        required: !verified }) +
      button(verified ? t('continue') : t('sendEmailCode'), t('sending'), 'btn-primary btn-block') +
      '</form>' +
      '<p class="auth-switch">' + esc(t('haveAccount')) + ' <a href="#signin">' + esc(t('signinLink')) + '</a></p>';
  }

  function codeView(channel) {
    var dest = channel === 'email' ? S.acct.email.trim() : (S.signup && S.signup.phone) || '';
    var wait = Math.max(0, Math.ceil((S.resendAt - Date.now()) / 1000));
    return '<form data-form="code-' + channel + '" novalidate>' +
      '<h3 class="sr-only">' + esc(t(channel === 'email' ? 'checkEmail' : 'checkPhone')) + '</h3>' +
      '<p class="sent-to">' + t('sentTo', { d: '<strong dir="ltr">' + esc(dest) + '</strong>' }) + '</p>' +
      demoHint() + formError() +
      field({ name: 'code', label: t('code'), value: S.code, autocomplete: 'one-time-code', inputmode: 'numeric', maxlength: 6, placeholder: '000000',
        extraCls: 'otp-input', help: t('codeHelp'), dir: 'ltr' }) +
      '<div class="otp-actions"><button type="button" class="link-btn" data-act="resend" data-channel="' + (channel === 'email' ? 'email' : 'sms') + '"' + (wait ? ' disabled' : '') + ' id="resend-btn">' +
      esc(wait ? t('resendIn', { s: wait }) : t('resend')) + '</button><span aria-hidden="true">·</span>' +
      '<button type="button" class="link-btn" data-act="change">' + esc(t(channel === 'email' ? 'changeEmail' : 'changePhone')) + '</button></div>' +
      '<div class="step-actions">' + backBtn() + button(t('verify'), t('verifying'), 'btn-primary') + '</div>' +
      '</form>';
  }

  function stepPhone() {
    if (S.sub === 'code') return codeView('sms');
    var opts = (S.cfg.countryCodes || Object.keys(COUNTRIES)).map(function (cc) {
      var name = COUNTRIES[cc] ? COUNTRIES[cc][lang() === 'ar' ? 1 : 0] : cc;
      return '<option value="' + cc + '"' + (S.phone.cc === cc ? ' selected' : '') + '>' + esc(cc + ' ' + name) + '</option>';
    }).join('');
    var err = S.errors.phone;
    var verified = S.signup && S.signup.phoneVerified;
    return '<form data-form="phone" novalidate>' +
      '<p class="lead" style="margin-top:0">' + esc(t('phoneLead')) + '</p>' + formError() +
      '<div class="field"><label for="f-phone">' + esc(t('mobile')) + '</label>' +
      '<div class="phone-row"><label class="sr-only" for="f-cc">' + esc(t('country')) + '</label>' +
      '<select class="select" id="f-cc" name="cc" autocomplete="tel-country-code">' + opts + '</select>' +
      '<input class="input" id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" dir="ltr" maxlength="20" required aria-required="true" value="' + esc(S.phone.number) + '"' +
      ' placeholder="50 123 4567" aria-invalid="' + (err ? 'true' : 'false') + '" aria-describedby="help-phone err-phone"></div>' +
      '<span class="help" id="help-phone">' + esc(verified ? '✓ ' + t('phoneVerified') : t('mobileHelp')) + '</span>' +
      '<span class="error-msg" id="err-phone">' + (err ? ico('alert') + '<span>' + esc(err) + '</span>' : '') + '</span></div>' +
      '<div class="step-actions">' + backBtn() + button(verified ? t('continue') : t('sendSms'), t('sending'), 'btn-primary') + '</div>' +
      '</form>';
  }

  function stepIdentity() {
    var d = S.ident, eid = d.idType === 'emirates_id';
    var types = [['emirates_id', 'eid', 'eidSub'], ['university_id', 'uid', 'uidSub']].map(function (r) {
      return '<label class="choice"><input type="radio" name="idType" value="' + r[0] + '"' + (d.idType === r[0] ? ' checked' : '') + '>' + ico(r[0] === 'emirates_id' ? 'shield' : 'cap') +
        '<span>' + esc(t(r[1])) + '<small>' + esc(t(r[2])) + '</small></span></label>';
    }).join('');
    var file = d.file
      ? '<span class="name">' + esc(d.file.name) + '</span><button type="button" class="link-btn" data-act="rmfile">' + esc(t('removeFile')) + '</button>'
      : '<span>' + esc(t('chooseFile')) + '</span>';
    var kyb = S.acct.role !== 'partner' ? '' :
      '<div class="kyb-box"><div class="head"><span>' + esc(t('kybTitle')) + '</span><span class="badge badge-warn">' + esc(t('soon')) + '</span></div>' +
      '<p class="help" style="font-size:13px;color:var(--text-muted)">' + esc(t('kybLead')) + '</p>' +
      field({ name: 'tradeLicense', label: t('tradeLicense'), value: d.tradeLicense, dir: 'ltr', maxlength: 60, required: false }) + '</div>';
    return '<form data-form="identity" novalidate>' +
      '<p class="lead" style="margin-top:0">' + esc(t('idLead')) + '</p>' + formError() +
      '<fieldset class="field"><legend>' + esc(t('idType')) + '</legend><div class="choice-grid">' + types + '</div></fieldset>' +
      (eid ? '' : field({ name: 'institution', label: t('university'), value: d.institution, list: 'uni-list', autocomplete: 'organization', maxlength: 120 }) +
        '<datalist id="uni-list">' + UNIS.map(function (u) { return '<option value="' + esc(u) + '">'; }).join('') + '</datalist>') +
      field({ name: 'idNumber', label: t('idNumber'), value: d.idNumber, dir: 'ltr', autocomplete: 'off', inputmode: eid ? 'numeric' : 'text', maxlength: 24,
        placeholder: eid ? '784-XXXX-XXXXXXX-X' : '', help: t(eid ? 'eidHelp' : 'uidHelp') }) +
      field({ name: 'nameOnId', label: t('nameOnId'), value: d.nameOnId, autocomplete: 'name', help: t('nameOnIdHelp'), maxlength: 120 }) +
      '<div class="field"><span class="label" id="lbl-file">' + esc(t('idImage')) + '</span>' +
      '<label class="file-drop">' + ico('file') + '<input type="file" name="idFile" accept="image/jpeg,image/png,application/pdf" aria-labelledby="lbl-file" aria-describedby="err-image">' + file + '</label>' +
      '<span class="error-msg" id="err-image">' + (S.errors.image ? ico('alert') + '<span>' + esc(S.errors.image) + '</span>' : '') + '</span></div>' +
      kyb +
      '<div class="step-actions">' + backBtn() + button(t('verifyId'), t('checkingId'), 'btn-accent') + '</div>' +
      '</form>';
  }

  function stepDone() {
    var u = S.user || {};
    var idLabel = u.identity ? t(u.identity.type === 'emirates_id' ? 'eid' : 'uid') : '';
    return '<div class="kyc-done">' +
      '<span class="seal">' + ico('shield') + '</span>' +
      '<span class="preview-tag">' + ico('shield') + '<span>' + esc(t('kycVerified')) + '</span></span>' +
      '<p>' + esc(t('doneLead')) + '</p>' +
      '<dl class="kyc-summary">' +
      '<div><dt>' + esc(t('sumEmail')) + '</dt><dd>' + ico('check-circle') + esc(u.email) + '</dd></div>' +
      '<div><dt>' + esc(t('sumPhone')) + '</dt><dd>' + ico('check-circle') + esc(u.phone) + '</dd></div>' +
      '<div><dt>' + esc(t('sumId')) + ' · ' + esc(idLabel) + '</dt><dd>' + ico('check-circle') + esc(u.identity && u.identity.masked) + '</dd></div>' +
      '<div><dt>' + esc(t('sumScore')) + '</dt><dd>' + esc(u.score ? u.score.identity_trust : 0) + ' / 20</dd></div>' +
      '</dl>' +
      (u.identity && !u.identity.nameMatch ? '<p class="note-box">' + ico('info') + '<span>' + esc(t('nameReview')) + '</span></p>' : '') +
      '<a class="btn btn-accent btn-lg btn-block" href="' + esc(dashUrl(u)) + '">' + esc(t(u.role === 'partner' ? 'toPartner' : 'toDashboard')) + ico('arrow-right', 'flip-rtl') + '</a>' +
      '</div>';
  }
  function dashUrl(u) { return 'app.html' + (lang() === 'ar' ? '?lang=ar' : '') + (u && u.role === 'partner' ? '#business' : '#talent'); }

  function viewSignup() {
    var titles = { 1: 'signupTitle', 2: 'phoneTitle', 3: 'idTitle', 4: 'doneTitle' };
    var title = S.step === 1 && S.sub === 'code' ? 'checkEmail' : S.step === 2 && S.sub === 'code' ? 'checkPhone' : titles[S.step];
    var body = S.step === 1 ? stepAccount() : S.step === 2 ? stepPhone() : S.step === 3 ? stepIdentity() : stepDone();
    return progress() +
      '<div><p class="step-count">' + esc(t('stepOf', { n: S.step })) + '</p><h2 id="view-h" tabindex="-1">' + esc(t(title)) + '</h2></div>' + body;
  }

  var lastKey = '';
  function render(moveFocus, focusError) {
    var key = S.view + S.step + S.sub;
    root.innerHTML = S.view === 'signin' ? viewSignin() : viewSignup();
    if (moveFocus || key !== lastKey) {
      var h = $('#view-h'); if (h && lastKey) h.focus();
    }
    if (focusError) {
      var bad = root.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus(); else { var fe = $('#form-error'); if (fe && S.formError) { fe.setAttribute('tabindex', '-1'); fe.focus(); } }
    }
    lastKey = key;
    tickResend();
  }

  var resendTimer = null;
  function tickResend() {
    clearTimeout(resendTimer);
    var b = $('#resend-btn'); if (!b) return;
    var wait = Math.max(0, Math.ceil((S.resendAt - Date.now()) / 1000));
    b.disabled = !!wait; b.textContent = wait ? t('resendIn', { s: wait }) : t('resend');
    if (wait) resendTimer = setTimeout(tickResend, 1000);
  }

  /* ------------------------------------------------------------ actions */
  function sameEmail() { return S.signup && S.signup.email === S.acct.email.trim().toLowerCase(); }
  function begin() { S.busy = true; S.formError = ''; render(); }
  function done() { S.busy = false; S.errors = {}; S.formError = ''; }

  function submitSignin() {
    if (!validate(['signinEmail', 'signinPassword'])) { S.formError = ''; return render(false, true); }
    begin();
    api('/api/auth/login', { email: S.signin.email, password: S.signin.password }).then(function (res) {
      done(); S.signin.password = '';
      location.href = dashUrl(res.user);
    }).catch(function (err) { S.signin.password = ''; showError(err); });
  }

  function submitAccount() {
    var verified = S.signup && S.signup.emailVerified && sameEmail();
    var fields = ['fullName', 'email'].concat(verified && !S.acct.password ? [] : ['password']);
    if (!validate(fields)) { S.formError = t('errorsAbove'); return render(false, true); }
    var a = S.acct;
    var payload = { fullName: a.fullName, email: a.email, password: a.password, role: a.role, track: a.role === 'talent' ? a.track : null };
    begin();
    if (verified) {
      // same email, already verified: just save any edits and move on
      var changed = a.fullName.trim() !== S.signup.fullName || a.role !== S.signup.role || (a.role === 'talent' && a.track !== S.signup.track) || a.password;
      var p = changed && a.password ? api('/api/auth/signup/update', Object.assign({ token: S.token }, payload))
        : changed ? Promise.reject({ data: { error: 'weak_password', field: 'password' } }) : Promise.resolve({ signup: S.signup });
      return p.then(function (res) { done(); S.signup = res.signup; goStep(2); }).catch(showError);
    }
    api('/api/auth/signup/start', payload).then(function (res) {
      done(); S.token = res.signup.token; S.signup = res.signup; S.code = '';
      S.resendAt = Date.now() + (res.otp.resendIn || 30) * 1000;
      S.sub = 'code'; persist(); render(true);
    }).catch(showError);
  }

  function submitCode(channel) {
    if (!validate(['code'])) return render(false, true);
    begin();
    api(channel === 'email' ? '/api/auth/signup/verify-email' : '/api/auth/signup/verify-phone', { token: S.token, code: toAscii(S.code) })
      .then(function (res) {
        done(); S.signup = res.signup; S.code = '';
        if (channel === 'email') { S.acct.password = ''; goStep(2); } else goStep(3);
      }).catch(showError);
  }

  function submitPhone() {
    if (!validate(['phone'])) return render(false, true);
    if (S.signup && S.signup.phoneVerified && S.signup.phone === localE164()) return goStep(3);
    begin();
    api('/api/auth/signup/phone', { token: S.token, countryCode: S.phone.cc, phone: S.phone.number }).then(function (res) {
      done(); S.signup = res.signup; S.code = '';
      S.resendAt = Date.now() + (res.otp.resendIn || 30) * 1000;
      S.sub = 'code'; persist(); render(true);
    }).catch(showError);
  }
  function localE164() { var d = toAscii(S.phone.number).replace(/\D/g, '').replace(/^0+/, ''); var cc = S.phone.cc.slice(1); if (d.indexOf(cc) === 0 && d.length > 10) d = d.slice(cc.length); return S.phone.cc + d; }

  function submitIdentity() {
    if (!validate(['idNumber', 'nameOnId', 'institution'])) { S.formError = t('errorsAbove'); return render(false, true); }
    var d = S.ident;
    begin();
    api('/api/auth/signup/identity', {
      token: S.token, idType: d.idType, idNumber: d.idNumber, nameOnId: d.nameOnId, institution: d.idType === 'university_id' ? d.institution : '',
      image: d.file ? d.file.data : null, tradeLicense: S.acct.role === 'partner' ? d.tradeLicense : ''
    }).then(function (res) {
      done(); S.user = res.user; S.token = null; S.signup = null;
      S.ident.idNumber = ''; S.ident.file = null;  // don't keep the ID in memory longer than needed
      persist(); goStep(4);
    }).catch(showError);
  }

  function resend(channel) {
    S.formError = '';
    api('/api/auth/signup/resend', { token: S.token, channel: channel }).then(function (res) {
      S.resendAt = Date.now() + (res.otp.resendIn || 30) * 1000; S.errors = {}; S.code = '';
      render(); window.JISR.toast(t('codeSent'));
    }).catch(function (err) {
      if (err.data && err.data.retryAfter) S.resendAt = Date.now() + err.data.retryAfter * 1000;
      showError(err);
    });
  }

  function goStep(n) { S.step = n; S.sub = 'form'; S.errors = {}; S.formError = ''; if (n === 3 && !S.ident.nameOnId) S.ident.nameOnId = S.acct.fullName; persist(); render(true); }

  function back() {
    S.errors = {}; S.formError = '';
    if (S.sub === 'code') { S.sub = 'form'; }
    else if (S.step > 1) { S.step -= 1; S.sub = 'form'; }
    persist(); render(true);
  }

  /* ------------------------------------------------------------ events */
  root.addEventListener('input', function (e) {
    var el = e.target, n = el.name, v = el.value;
    if (n === 'signinEmail') S.signin.email = v;
    else if (n === 'signinPassword') S.signin.password = v;
    else if (n === 'fullName' || n === 'email' || n === 'password') S.acct[n] = v;
    else if (n === 'phone') S.phone.number = v;
    else if (n === 'code') { S.code = v.replace(/[^\d٠-٩۰-۹]/g, '').slice(0, 6); if (el.value !== S.code) el.value = S.code; }
    else if (n === 'idNumber' || n === 'nameOnId' || n === 'institution' || n === 'tradeLicense') S.ident[n] = v;
    if (el.getAttribute('aria-invalid') === 'true') paintFieldError(el);
  });
  root.addEventListener('change', function (e) {
    var el = e.target, n = el.name;
    if (n === 'role') { S.acct.role = el.value; render(); root.querySelector('input[name="role"]:checked').focus(); }
    else if (n === 'track') S.acct.track = el.value;
    else if (n === 'cc') { S.phone.cc = el.value; var p = $('#f-phone'); if (p && p.value) paintFieldError(p); }
    else if (n === 'idType') { S.ident.idType = el.value; S.errors = {}; render(); root.querySelector('input[name="idType"]:checked').focus(); }
    else if (n === 'idFile') readFile(el.files && el.files[0]);
  });
  root.addEventListener('focusout', function (e) {
    var el = e.target;
    if (el.matches && el.matches('input.input') && el.value) paintFieldError(el);
  });
  root.addEventListener('submit', function (e) {
    e.preventDefault();
    if (S.busy) return;
    var f = e.target.getAttribute('data-form');
    if (f === 'signin') submitSignin();
    else if (f === 'account') submitAccount();
    else if (f === 'code-email') submitCode('email');
    else if (f === 'code-sms') submitCode('sms');
    else if (f === 'phone') submitPhone();
    else if (f === 'identity') submitIdentity();
  });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'pw') {
      var inp = document.getElementById(b.getAttribute('aria-controls'));
      var show = inp.type === 'password'; inp.type = show ? 'text' : 'password';
      b.setAttribute('aria-pressed', show ? 'true' : 'false'); b.setAttribute('aria-label', t(show ? 'hidePw' : 'showPw'));
    } else if (act === 'forgot') { e.preventDefault(); window.JISR.toast(t('forgotStub')); }
    else if (act === 'back') back();
    else if (act === 'change') { S.sub = 'form'; S.errors = {}; S.formError = ''; persist(); render(true); var f = $(S.step === 1 ? '#f-email' : '#f-phone'); if (f) f.focus(); }
    else if (act === 'resend') resend(b.getAttribute('data-channel'));
    else if (act === 'rmfile') { S.ident.file = null; delete S.errors.image; render(); }
  });

  function readFile(file) {
    delete S.errors.image;
    if (!file) { S.ident.file = null; return render(); }
    if (!/^(image\/(jpeg|png)|application\/pdf)$/.test(file.type)) { S.errors.image = t('e_bad_image'); return render(); }
    if (file.size > 5 * 1024 * 1024) { S.errors.image = t('e_image_too_big'); return render(); }
    var r = new FileReader();
    r.onload = function () { S.ident.file = { name: file.name, data: r.result }; render(); };
    r.onerror = function () { S.errors.image = t('e_bad_image'); render(); };
    r.readAsDataURL(file);
  }

  function route() {
    var h = (location.hash || '').replace('#', '');
    var v = h === 'signup' ? 'signup' : 'signin';
    if (h === 'signin' && S.step === 4) { S.step = 1; S.user = null; }
    if (v !== S.view) { S.view = v; S.errors = {}; S.formError = ''; }
    render(true);
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('jisr:lang', function () {
    // re-translate any visible error that came from a code
    S.errors = {}; S.formError = ''; render();
  });

  api('/api/auth/config').then(function (cfg) { S.cfg = cfg; render(); }).catch(function () { /* static hosting: errors show on submit */ });
  restore();
  route();
})();
