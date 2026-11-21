/* ==========================================================================
   JISR demo portals — Talent · Business · Mentor · Admin
   Everything here is DEMO DATA held in this browser (localStorage). There is no
   backend: no real accounts, payments, AI grading or emails are processed.
   ========================================================================== */
(function () {
  'use strict';

  var I = window.icon;
  var STATE_KEY = 'jisr.demo.v2';
  var view = document.getElementById('view');

  /* ------------------------------------------------------------------ i18n */
  var T = {
    // shared
    sample: ['Sample', 'مثال'],
    close: ['Close', 'إغلاق'],
    cancel: ['Cancel', 'إلغاء'],
    view: ['View', 'عرض'],
    details: ['Details', 'التفاصيل'],
    kycVerified: ['KYC verified · University ID', 'هوية موثّقة · بطاقة جامعية'],
    kybVerified: ['KYB verified · Trade licence', 'شركة موثّقة · رخصة تجارية'],
    legacy: ['Legacy', 'سابق'],
    native: ['Native', 'أصيل'],
    outOf: ['/ 100', '/ 100'],
    demoNoProcess: ['Demo only — nothing is sent or charged.', 'عرض توضيحي فقط — لا يتم إرسال أو خصم أي شيء.'],
    resetTitle: ['Reset the demo?', 'إعادة ضبط العرض؟'],
    resetBody: ['This clears everything you did in the demo (applications, shortlist, reviews, NDA) and restores the sample data.', 'سيؤدي هذا إلى مسح كل ما فعلته في العرض (الطلبات، القائمة المختصرة، المراجعات، اتفاقية عدم الإفصاح) واستعادة البيانات التجريبية.'],
    resetBtn: ['Reset demo', 'إعادة ضبط العرض'],
    resetDone: ['Demo reset to the original sample data.', 'تمت إعادة العرض إلى البيانات التجريبية الأصلية.'],
    saving: ['Saving…', 'جارٍ الحفظ…'],
    working: ['Working…', 'جارٍ التنفيذ…'],
    storageWarn: ['Your browser is blocking storage, so demo progress won\'t be kept after a reload.', 'متصفحك يمنع التخزين، لذلك لن يُحفظ تقدّمك في العرض بعد إعادة التحميل.'],

    // who
    whoTalent: ['Layla A.', 'ليلى أ.'],
    whoBusiness: ['Gulf Retail Group', 'مجموعة الخليج للتجزئة'],
    whoMentor: ['Dr. Hamad', 'د. حمد'],
    whoAdmin: ['Shams team', 'فريق شمس'],

    // talent
    tKicker: ['Talent dashboard', 'لوحة الموهبة'],
    tHello: ['Welcome back, Layla', 'أهلًا بعودتك يا ليلى'],
    tTracks: ['Your tracks', 'مساراتك'],
    tTrackScore: ['Score {n}', 'المؤشر {n}'],
    rsTitle: ['Readiness Score', 'مؤشر الجاهزية'],
    rsHint: ['{track} track', 'مسار {track}'],
    rsWhat: ['How ready you are for paid work on this track, from verified evidence only.', 'مدى جاهزيتك للعمل المدفوع في هذا المسار، بناءً على أدلة موثّقة فقط.'],
    rsNext: ['Next step', 'الخطوة التالية'],
    lvl0: ['Building', 'قيد البناء'], lvl1: ['Emerging', 'واعد'], lvl2: ['Ready', 'جاهز'], lvl3: ['Top talent', 'موهبة متميزة'],
    lvlDesc0: ['Keep adding verified work to unlock paid opportunities.', 'استمر في إضافة أعمال موثّقة لتفتح الفرص المدفوعة.'],
    lvlDesc1: ['Visible to partners. Entry-level opportunities unlocked.', 'ظاهر للشركاء. فُتحت لك فرص المستوى المبتدئ.'],
    lvlDesc2: ['Ready for paid client work on this track.', 'جاهز لأعمال العملاء المدفوعة في هذا المسار.'],
    lvlDesc3: ['Featured to partners first.', 'تظهر للشركاء أولًا.'],
    scaleAria: ['Score scale: 0–49 building, 50–69 emerging, 70–84 ready, 85–100 top talent', 'مقياس المؤشر: 0–49 قيد البناء، 50–69 واعد، 70–84 جاهز، 85–100 موهبة متميزة'],

    oppTitle: ['Opportunities for you', 'فرص مناسبة لك'],
    oppHint: ['Matched to your {track} score', 'مطابقة لمؤشرك في مسار {track}'],
    oppEmpty: ['No open opportunities on this track yet.', 'لا توجد فرص مفتوحة في هذا المسار حاليًا.'],
    oppDoneToast: ['Done — "{title}" is now marked as {status}.', 'تم — أصبحت «{title}» بحالة: {status}.'],

    dcTitle: ['Defense Check', 'فحص الدفاع'],
    dcFor: ['Verifies a Legacy item', 'يوثّق عملًا سابقًا'],
    dcFile: ['Retail_DCF_model_v7.xlsx', 'Retail_DCF_model_v7.xlsx'],
    dcFileMeta: ['Source file and edit history found', 'تم العثور على الملف المصدر وسجل التعديلات'],
    dcIntro: ['Answer 3 short questions about your own file to prove you made it. You have 5 minutes.', 'أجب عن 3 أسئلة قصيرة حول ملفك لتثبت أنك صاحبه. لديك 5 دقائق.'],
    dcStart: ['Start 5-minute check', 'ابدأ الفحص (5 دقائق)'],
    dcQ1: ['Why does the terminal growth rate in cell F42 differ from the base case?', 'لماذا يختلف معدل النمو النهائي في الخلية F42 عن الحالة الأساسية؟'],
    dcQ2: ['Which sheet drives the working-capital assumptions, and why?', 'أي ورقة تحدد افتراضات رأس المال العامل، ولماذا؟'],
    dcQ3: ['What breaks if store count stays flat in year 3?', 'ما الذي يتأثر إذا بقي عدد المتاجر ثابتًا في السنة الثالثة؟'],
    dcPlaceholder: ['Your answer…', 'إجابتك…'],
    dcLeft: ['{t} left', 'متبقٍ {t}'],
    dcTimeUp: ['Time is up. Submit what you have, or start again.', 'انتهى الوقت. أرسل ما كتبته أو ابدأ من جديد.'],
    dcSubmit: ['Submit answers', 'إرسال الإجابات'],
    dcChecking: ['Checking your answers…', 'جارٍ مراجعة إجاباتك…'],
    dcTooShort: ['Please write at least 15 characters.', 'يرجى كتابة 15 حرفًا على الأقل.'],
    dcFix: ['Answer all three questions to continue.', 'أجب عن الأسئلة الثلاثة للمتابعة.'],
    dcPassed: ['Passed — Legacy badge added', 'تم الاجتياز — أُضيفت الشارة السابقة'],
    dcPassedBody: ['Your Specialist score went up by 4. You can also ask a professor or past client to confirm the work.', 'ارتفع مؤشرك في مسار المتخصصين 4 نقاط. يمكنك أيضًا أن تطلب من أستاذ أو عميل سابق تأكيد العمل.'],
    dcDemo: ['Demo: answers stay in your browser and are not graded by a real AI.', 'عرض توضيحي: تبقى الإجابات في متصفحك ولا يقيّمها ذكاء اصطناعي حقيقي.'],
    dcAttest: ['Request attestation', 'اطلب شهادة'],
    dcAttested: ['Attestation requested from {email}.', 'تم طلب الشهادة من {email}.'],
    atTitle: ['Request an attestation', 'طلب شهادة'],
    atSub: ['A professor or past client confirms you made this work.', 'يؤكد أستاذ أو عميل سابق أنك صاحب هذا العمل.'],
    atEmail: ['Their email', 'بريده الإلكتروني'],
    atHelp: ['They\'ll get a one-click confirmation link.', 'سيصله رابط تأكيد بنقرة واحدة.'],
    atBad: ['Enter a valid email, like name@university.ac.ae', 'أدخل بريدًا صحيحًا، مثل name@university.ac.ae'],
    atSend: ['Request attestation', 'إرسال الطلب'],
    atToast: ['Attestation request recorded (demo — no email sent).', 'تم تسجيل طلب الشهادة (عرض توضيحي — لم يُرسل بريد).'],

    pfTitle: ['Verified portfolio', 'ملف الأعمال الموثّق'],
    pfAll: ['All', 'الكل'],
    pfLegacyDesc: ['Legacy = work done before JISR, proven by source files + Defense Check.', 'سابق = عمل أُنجز قبل جسر، مُثبت بالملفات المصدر وفحص الدفاع.'],
    pfNativeDesc: ['Native = work done on JISR, verified automatically.', 'أصيل = عمل أُنجز على جسر، موثّق تلقائيًا.'],
    pfPending: ['Awaiting mentor review', 'بانتظار مراجعة المرشد'],
    pfEmpty: ['No items with this badge yet.', 'لا توجد عناصر بهذه الشارة بعد.'],

    dcAiOn: ['AI: Gemini', 'الذكاء الاصطناعي: Gemini'],
    dcAiDemo: ['Demo mode', 'وضع تجريبي'],
    dcIntro2: ['Upload the original, editable file of something you made before JISR. The AI reads it and asks 3 questions only its creator could answer — in a locked, timed screen.', 'ارفع الملف الأصلي القابل للتعديل لعمل أنجزته قبل جسر. يقرؤه الذكاء الاصطناعي ويطرح 3 أسئلة لا يجيب عنها إلا صاحبه — في شاشة مقفلة ومؤقتة.'],
    dcChoose: ['Choose a file', 'اختر ملفًا'],
    dcChange: ['click to change', 'انقر للتغيير'],
    dcTypes: ['PDF, Word, Excel, PowerPoint, images, code or text · up to 15 MB', 'PDF أو Word أو Excel أو PowerPoint أو صور أو شيفرة أو نص · حتى 15 ميغابايت'],
    dcPrivacy: ['Your file is sent to Google Gemini to write and grade the questions.', 'يُرسل ملفك إلى Google Gemini لكتابة الأسئلة وتقييمها.'],
    dcDemoNote: ['Demo mode: no AI is connected, so the questions are generic and grading is a simple length check. Your file stays in your browser.', 'وضع تجريبي: لا يوجد ذكاء اصطناعي متصل، لذا الأسئلة عامة والتقييم فحص بسيط للطول. يبقى ملفك في متصفحك.'],
    dcAnalyse: ['Analyse file', 'حلّل الملف'],
    dcReading: ['Reading your file…', 'جارٍ قراءة ملفك…'],
    dcReadingSub: ['Writing questions about your work. This usually takes 10–30 seconds.', 'تتم كتابة أسئلة حول عملك. يستغرق ذلك عادةً 10–30 ثانية.'],
    dcFound: ['We read: {title}', 'قرأنا: {title}'],
    dcRulesTitle: ['Before you start', 'قبل أن تبدأ'],
    dcRule1: ['The check opens in full screen and locks the rest of the site.', 'يفتح الفحص بملء الشاشة ويقفل بقية الموقع.'],
    dcRule2: ['{n} questions, one at a time, {s} seconds each. You can\'t go back.', '{n} أسئلة، واحد تلو الآخر، {s} ثانية لكل سؤال. لا يمكنك الرجوع.'],
    dcRule3: ['Switching tabs or apps, or leaving full screen, is recorded. You get {w} warnings — the next one ends the check.', 'التبديل بين التبويبات أو التطبيقات أو الخروج من ملء الشاشة يُسجَّل. لديك {w} تحذيران — والتالي ينهي الفحص.'],
    dcRule4: ['Copy and paste are turned off. Answer from memory, in Arabic or English.', 'النسخ واللصق معطّلان. أجب من ذاكرتك بالعربية أو الإنجليزية.'],
    dcMulti: ['We detected more than one screen. Disconnect extra screens before you start — this is noted on your result.', 'رصدنا أكثر من شاشة. افصل الشاشات الإضافية قبل البدء — سيُسجَّل ذلك في نتيجتك.'],
    dcAck: ['I\'ve closed this file and any notes, and I\'ll answer from memory.', 'أغلقت هذا الملف وأي ملاحظات، وسأجيب من ذاكرتي.'],
    dcAckMust: ['Please confirm before you start.', 'يرجى التأكيد قبل البدء.'],
    dcEnter: ['Enter locked mode', 'ادخل الوضع المقفل'],
    dcInProgress: ['Check in progress…', 'الفحص جارٍ…'],
    dcPassedBody2: ['Score {score}/100. Your Specialist score went up by 4.', 'الدرجة {score}/100. ارتفع مؤشرك في مسار المتخصصين 4 نقاط.'],
    dcMentorOk: ['A mentor reviewed your check and approved the badge.', 'راجع مرشد فحصك واعتمد الشارة.'],
    dcReview: ['Sent for mentor review', 'أُرسل لمراجعة المرشد'],
    dcReviewIntegrity: ['Your answers were good, but the lock-down recorded {n} issue(s). A mentor will confirm before the badge is issued.', 'إجاباتك جيدة، لكن الوضع المقفل سجّل {n} ملاحظة. سيؤكد مرشد قبل إصدار الشارة.'],
    dcReviewBorder: ['Some answers were only partly right, so a mentor will take a look before the badge is issued.', 'بعض الإجابات صحيحة جزئيًا، لذا سيراجعها مرشد قبل إصدار الشارة.'],
    dcFailed: ['Not verified', 'لم يتم التوثيق'],
    dcFailIntegrity: ['The check ended because you left the locked screen too many times.', 'انتهى الفحص لأنك غادرت الشاشة المقفلة عدة مرات.'],
    dcFailAbandoned: ['The page was closed or reloaded during the check, so it was ended.', 'أُغلقت الصفحة أو أُعيد تحميلها أثناء الفحص، لذا أُنهي.'],
    dcFailMentor: ['A mentor reviewed your check and didn\'t approve the badge.', 'راجع مرشد فحصك ولم يعتمد الشارة.'],
    dcFailAnswers: ['Your answers didn\'t show enough first-hand knowledge of this work.', 'لم تُظهر إجاباتك معرفة مباشرة كافية بهذا العمل.'],
    dcSeeFeedback: ['See questions and feedback', 'اعرض الأسئلة والملاحظات'],
    dcIntegrityLog: ['Lock-down log: {list}', 'سجل الوضع المقفل: {list}'],
    dcDemoResult: ['Demo result — not graded by AI.', 'نتيجة تجريبية — لم يقيّمها ذكاء اصطناعي.'],
    dcAgain: ['Try again with new questions', 'حاول مجددًا بأسئلة جديدة'],
    dcAnother: ['Verify another file', 'وثّق ملفًا آخر'],
    dcErrType: ['This file type isn\'t supported. Upload a PDF, Office file, image, code or text file.', 'نوع الملف غير مدعوم. ارفع ملف PDF أو Office أو صورة أو شيفرة أو نص.'],
    dcErrSize: ['This file is larger than 15 MB.', 'حجم الملف أكبر من 15 ميغابايت.'],
    dcErrEmpty: ['This file is empty.', 'هذا الملف فارغ.'],
    dcErrRead: ['We couldn\'t read this file from your device.', 'تعذّرت قراءة الملف من جهازك.'],
    dcErrNetwork: ['Couldn\'t reach the JISR server. Check your connection and try again.', 'تعذّر الوصول إلى خادم جسر. تحقق من اتصالك وحاول مجددًا.'],
    dcErrGeneric: ['Something went wrong. Please try again.', 'حدث خطأ ما. يرجى المحاولة مجددًا.'],
    dcMentorToastOk: ['Defense Check approved — Legacy badge issued.', 'اعتُمد فحص الدفاع — صدرت الشارة السابقة.'],
    dcMentorToastNo: ['Defense Check not approved.', 'لم يُعتمد فحص الدفاع.'],
    dmDesc: ['Demo mode — the AI isn\'t connected, so these questions are generic.', 'وضع تجريبي — الذكاء الاصطناعي غير متصل، لذا الأسئلة عامة.'],
    dmQ1: ['What was the hardest decision you made in this work, and why did you choose that option?', 'ما أصعب قرار اتخذته في هذا العمل، ولماذا اخترته؟'],
    dmQ2: ['Name one specific part of the file you would change today, and explain how.', 'اذكر جزءًا محددًا من الملف ستغيّره اليوم، واشرح كيف.'],
    dmQ3: ['Explain one key section, formula or function of this work as if to a client.', 'اشرح قسمًا أو معادلة أو دالة رئيسية في هذا العمل كأنك تشرحها لعميل.'],
    ldMode: ['Defense Check · Locked mode', 'فحص الدفاع · الوضع المقفل'],
    ldWarnCount: ['Warnings {n}/{m}', 'التحذيرات {n}/{m}'],
    ldLoading: ['Loading question…', 'جارٍ تحميل السؤال…'],
    ldAnswer: ['Your answer', 'إجابتك'],
    ldPh: ['Type your answer from memory…', 'اكتب إجابتك من ذاكرتك…'],
    ldNoPaste: ['Paste is turned off', 'اللصق معطّل'],
    ldSubmit: ['Submit answer', 'أرسل الإجابة'],
    ldFinish: ['Submit & finish', 'أرسل وأنهِ'],
    ldCount: ['Question {i} of {n}', 'السؤال {i} من {n}'],
    ldSecondsLeft: ['{n} seconds left', 'متبقٍ {n} ثانية'],
    ldWarnTitle: ['You left the check', 'لقد غادرت الفحص'],
    ldWarnBody: ['This has been recorded (warning {n} of {m}). The timer kept running. Going over {m} warnings ends the check.', 'تم تسجيل ذلك (التحذير {n} من {m}). استمر المؤقت في العمل. تجاوز {m} تحذيرات ينهي الفحص.'],
    ldReturn: ['Return to the check', 'العودة إلى الفحص'],
    ldGrading: ['Grading your answers…', 'جارٍ تقييم إجاباتك…'],
    ldGradingSub: ['Stay on this screen. This takes a few seconds.', 'ابقَ في هذه الشاشة. يستغرق ذلك بضع ثوانٍ.'],
    ldGradeErr: ['Grading didn’t finish', 'لم يكتمل التقييم'],
    ldGradeKept: ['Your answers are saved — try grading again.', 'إجاباتك محفوظة — حاول التقييم مجددًا.'],
    ldGradeRetry: ['Try grading again', 'أعد محاولة التقييم'],
    ldGradeClosed: ['Grading couldn’t finish because the AI was busy. Please start a new check.', 'تعذّر إكمال التقييم لانشغال الذكاء الاصطناعي. يرجى بدء فحص جديد.'],
    ldErrTitle: ['The check couldn\'t continue', 'تعذّر استكمال الفحص'],
    flagLate: ['question {n} answered after time ran out', 'أُجيب عن السؤال {n} بعد انتهاء الوقت'],
    flagNotTyped: ['answer {n} appeared without being typed', 'ظهرت الإجابة {n} دون كتابتها'],
    mDcKind: ['Defense Check review', 'مراجعة فحص دفاع'],
    mDcScore: ['AI score {s}/100', 'درجة الذكاء الاصطناعي {s}/100'],
    mDcTitle: ['Layla A. — {title}', 'ليلى أ. — {title}'],
    mDcWhyIntegrity: ['Answers passed, but the lock-down recorded: {list}. Approve only if you\'re satisfied it was her own work.', 'اجتازت الإجابات، لكن الوضع المقفل سجّل: {list}. اعتمد فقط إذا اقتنعت أنه عملها.'],
    mDcWhyBorder: ['Borderline answers. Check the scores below, or ask her about the work in your next session.', 'إجابات حدّية. راجع الدرجات أدناه، أو اسألها عن العمل في جلستك القادمة.'],
    mDcApprove: ['Approve badge', 'اعتمد الشارة'],
    mDcReject: ['Don\'t approve', 'لا تعتمد'],
    evDcReview: ['Defense Check sent for mentor review (Layla A.)', 'إحالة فحص دفاع لمراجعة المرشد (ليلى أ.)'],
    evDcFail: ['Defense Check not verified (Layla A.)', 'عدم توثيق فحص دفاع (ليلى أ.)'],
    vaultTitle: ['Your IP Vault', 'خزنة ملكيتك الفكرية'],
    vaultStamped: ['Date-stamped {date}', 'مختوم بتاريخ {date}'],
    vaultWaiting: ['A scout viewed your public summary. Full blueprints stay locked until they sign an NDA.', 'اطّلع أحد الباحثين عن الفرص على ملخصك العام. تبقى المخططات مقفلة حتى يوقّع اتفاقية عدم الإفصاح.'],
    vaultSigned: ['Gulf Retail Group signed the NDA and paid the option fee. Your deal room is open.', 'وقّعت مجموعة الخليج للتجزئة اتفاقية عدم الإفصاح ودفعت رسم الخيار. غرفة الصفقة مفتوحة.'],

    squadTitle: ['Squad Builder', 'منشئ الفريق'],
    squadSub: ['Add a verified specialist from another track to your team.', 'أضف متخصصًا موثّقًا من مسار آخر إلى فريقك.'],
    squadTeam: ['Your team', 'فريقك'],
    squadSuggest: ['Suggested specialists', 'متخصصون مقترحون'],
    squadInvite: ['Invite', 'دعوة'],
    squadInvited: ['Invited', 'تمت الدعوة'],
    squadCancel: ['Cancel invite', 'إلغاء الدعوة'],
    squadToast: ['Invitation sent to {name} (demo).', 'أُرسلت الدعوة إلى {name} (عرض توضيحي).'],
    squadCancelToast: ['Invitation to {name} cancelled.', 'أُلغيت الدعوة إلى {name}.'],
    you: ['You', 'أنت'],

    ventureTitle: ['Your venture: Desert Cool', 'مشروعك: ديزرت كول'],
    ventureSub: ['Evaporative cooling vest · Safe Box escrow', 'سترة تبريد بالتبخير · ضمان صندوق الأمان'],

    // business
    bKicker: ['Partner portal · Gulf Retail Group (sample)', 'بوابة الشركاء · مجموعة الخليج للتجزئة (مثال)'],
    bTitle: ['Find verified talent', 'ابحث عن مواهب موثّقة'],
    bTabFind: ['Find talent', 'ابحث عن مواهب'],
    bTabShort: ['Shortlist', 'القائمة المختصرة'],
    bTabDeals: ['Deals & escrow', 'الصفقات والضمان'],
    bSearch: ['Search by name, skill or city', 'ابحث بالاسم أو المهارة أو المدينة'],
    bTrack: ['Track', 'المسار'],
    bAllTracks: ['All tracks', 'كل المسارات'],
    bMin: ['Minimum score', 'الحد الأدنى للمؤشر'],
    bAny: ['Any score', 'أي مؤشر'],
    bSort: ['Sort by', 'ترتيب حسب'],
    bSortScore: ['Highest score', 'الأعلى مؤشرًا'],
    bSortProof: ['Most verified work', 'الأكثر أعمالًا موثّقة'],
    bSortName: ['Name (A–Z)', 'الاسم (أ–ي)'],
    bChipNative: ['Has Native badge', 'لديه شارة أصيلة'],
    bChipBi: ['Arabic + English', 'عربي + إنجليزي'],
    bChipUae: ['UAE-based', 'مقيم في الإمارات'],
    bResults: ['{n} candidates', '{n} مرشحين'],
    bResult1: ['1 candidate', 'مرشح واحد'],
    bClear: ['Clear filters', 'مسح عوامل التصفية'],
    bNone: ['No candidates match', 'لا يوجد مرشحون مطابقون'],
    bNoneBody: ['Try a lower minimum score or remove a filter.', 'جرّب حدًا أدنى أقل للمؤشر أو أزل أحد عوامل التصفية.'],
    bProfile: ['View profile', 'عرض الملف'],
    bAdd: ['Shortlist', 'أضف للقائمة'],
    bAdded: ['Shortlisted', 'في القائمة'],
    bAddToast: ['{name} added to your shortlist.', 'أُضيف {name} إلى قائمتك المختصرة.'],
    bRemoveToast: ['{name} removed from your shortlist.', 'أُزيل {name} من قائمتك المختصرة.'],
    bRemove: ['Remove', 'إزالة'],
    bShortEmpty: ['Your shortlist is empty', 'قائمتك المختصرة فارغة'],
    bShortEmptyBody: ['Shortlist candidates while you search and compare them here.', 'أضف المرشحين أثناء البحث وقارن بينهم هنا.'],
    bShortHint: ['Saved candidates you can compare and come back to.', 'المرشحون المحفوظون للمقارنة والرجوع إليهم.'],
    bVerifiedWork: ['Verified work', 'أعمال موثّقة'],
    bLanguages: ['Languages', 'اللغات'],
    bLocation: ['Location', 'الموقع'],
    bTrackL: ['Track', 'المسار'],
    bLegacyN: ['{n} Legacy', '{n} سابق'],
    bNativeN: ['{n} Native', '{n} أصيل'],
    langAr: ['Arabic', 'العربية'], langEn: ['English', 'الإنجليزية'],

    escTitle: ['Backed venture: Desert Cool', 'مشروع مدعوم: ديزرت كول'],
    escSub: ['Evaporative cooling vest · founder squad of 3 · mentor: Dr. Hamad', 'سترة تبريد بالتبخير · فريق من 3 مؤسسين · المرشد: د. حمد'],
    escInBox: ['In Safe Box', 'في صندوق الأمان'],
    escReleased: ['Released so far', 'المصروف حتى الآن'],
    escNote: ['Each release needs the mentor\'s sign-off. Open the Mentor view to review the next stage.', 'كل دفعة تحتاج اعتماد المرشد. افتح واجهة المرشد لمراجعة المرحلة التالية.'],
    escGoMentor: ['Open mentor view', 'افتح واجهة المرشد'],
    stReleased: ['Released', 'مصروف'],
    stAwaiting: ['Awaiting mentor', 'بانتظار المرشد'],
    stChanges: ['Changes requested', 'طُلبت تعديلات'],
    stLocked: ['Locked', 'مقفل'],
    stPrototype: ['Prototype', 'النموذج الأولي'],
    stProduction: ['Production', 'الإنتاج'],
    stDelivery: ['Delivery', 'التسليم'],

    ipTitle: ['IP Vault: low-water irrigation valve', 'خزنة الملكية: صمام ري موفّر للمياه'],
    ipMeta: ['Inventor track · Khalid A. (sample)', 'مسار المخترعين · خالد أ. (مثال)'],
    ipSummary: ['Public summary: a pressure-sensing valve that cuts drip-irrigation water use on date-palm farms. Seeking a licence or buyout.', 'الملخص العام: صمام يستشعر الضغط ويخفض استهلاك مياه الري بالتنقيط في مزارع النخيل. يبحث عن ترخيص أو استحواذ.'],
    ipLocked: ['Full blueprints are locked. Sign the one-click NDA and place the option fee in escrow to open the deal room.', 'المخططات الكاملة مقفلة. وقّع اتفاقية عدم الإفصاح بنقرة وضع رسم الخيار في الضمان لفتح غرفة الصفقة.'],
    ipSign: ['Sign NDA & unlock', 'وقّع واطّلع'],
    ipOpen: ['NDA signed — deal room open', 'تم التوقيع — غرفة الصفقة مفتوحة'],
    ipOpenBody: ['Blueprints, field-test data and the inventor\'s terms are now visible. 7% brokerage applies if the deal closes.', 'أصبحت المخططات وبيانات الاختبار الميداني وشروط المخترع متاحة. تُطبَّق عمولة 7٪ عند إتمام الصفقة.'],
    ipFiles: ['Illustrative files — not downloadable in the demo.', 'ملفات توضيحية — غير قابلة للتنزيل في العرض.'],
    ndaTitle: ['Sign NDA and open deal room', 'توقيع اتفاقية عدم الإفصاح وفتح غرفة الصفقة'],
    ndaSub: ['Low-water irrigation valve · Khalid A.', 'صمام ري موفّر للمياه · خالد أ.'],
    ndaTerms: ['What you\'re agreeing to', 'ما توافق عليه'],
    ndaT1: ['Keep all blueprints and test data confidential for 3 years.', 'الحفاظ على سرية المخططات وبيانات الاختبار لمدة 3 سنوات.'],
    ndaT2: ['No reverse-engineering or filing of related patents.', 'عدم الهندسة العكسية أو تسجيل براءات ذات صلة.'],
    ndaT3: ['Option fee is held in escrow and credited to the deal if it closes.', 'يُحفظ رسم الخيار في الضمان ويُحتسب ضمن الصفقة عند إتمامها.'],
    ndaFee: ['Option fee (held in escrow)', 'رسم الخيار (محفوظ في الضمان)'],
    ndaAgree: ['I have read and agree to the NDA terms on behalf of Gulf Retail Group.', 'قرأت شروط اتفاقية عدم الإفصاح وأوافق عليها نيابة عن مجموعة الخليج للتجزئة.'],
    ndaMust: ['Please confirm you agree to the terms.', 'يرجى تأكيد موافقتك على الشروط.'],
    ndaConfirm: ['Sign & open deal room', 'وقّع وافتح غرفة الصفقة'],
    ndaToast: ['NDA signed. The deal room is open.', 'تم توقيع الاتفاقية. غرفة الصفقة مفتوحة.'],

    // mentor
    mKicker: ['Mentor portal · University Incubation Centre (sample)', 'بوابة المرشد · مركز الاحتضان الجامعي (مثال)'],
    mHello: ['Good evening, Dr. Hamad', 'مساء الخير يا د. حمد'],
    mWaiting: ['Waiting for your review', 'بانتظار مراجعتك'],
    mReviewed: ['Reviewed by you', 'راجعتها أنت'],
    mSessions: ['Sessions this week', 'جلسات هذا الأسبوع'],
    mQueue: ['Review queue', 'قائمة المراجعة'],
    mQueueHint: ['Oldest first', 'الأقدم أولًا'],
    mAllDone: ['You\'re all caught up', 'لا توجد مراجعات معلّقة'],
    mAllDoneBody: ['New milestones and sprint submissions will appear here.', 'ستظهر هنا المراحل الجديدة والمشاريع المقدَّمة.'],
    mEscrowKind: ['Escrow release · {share}', 'صرف من الضمان · {share}'],
    mEscrowTitle: ['Desert Cool — {stage} stage', 'ديزرت كول — مرحلة {stage}'],
    mSprintKind: ['Sprint review', 'مراجعة مشروع'],
    mSprintTitle: ['Layla A. — Cash-flow forecasting sprint', 'ليلى أ. — مشروع التنبؤ بالتدفقات النقدية'],
    mSprintBody: ['Approving adds a Native badge to her portfolio and raises her Specialist score.', 'الاعتماد يضيف شارة أصيلة إلى ملفها ويرفع مؤشرها في مسار المتخصصين.'],
    mSubmitted: ['Submitted {d}', 'قُدِّم {d}'],
    mEvidence: ['Evidence submitted', 'الأدلة المقدَّمة'],
    mApproveRelease: ['Verify & release {amt}', 'اعتمد واصرف {amt}'],
    mApprove: ['Approve sprint', 'اعتماد المشروع'],
    mChanges: ['Request changes', 'اطلب تعديلات'],
    mWaitingFor: ['Waiting for the team to resubmit', 'بانتظار إعادة التقديم من الفريق'],
    mYourNote: ['Your feedback', 'ملاحظاتك'],
    mSimResubmit: ['Simulate resubmission', 'محاكاة إعادة التقديم'],
    mResubToast: ['Resubmitted — back in your queue.', 'أُعيد التقديم — عاد إلى قائمتك.'],
    apTitle: ['Verify the {stage} stage?', 'اعتماد مرحلة {stage}؟'],
    apBody: ['You confirm the evidence meets the milestone. {amt} will be released from the Safe Box to the Desert Cool team.', 'أنت تؤكد أن الأدلة تحقق المرحلة. سيُصرف {amt} من صندوق الأمان لفريق ديزرت كول.'],
    apWarn: ['Releases can\'t be reversed once made.', 'لا يمكن التراجع عن الصرف بعد تنفيذه.'],
    apConfirm: ['Verify & release', 'اعتمد واصرف'],
    apToast: ['{amt} released for the {stage} stage.', 'صُرف {amt} لمرحلة {stage}.'],
    spTitle: ['Approve this sprint?', 'اعتماد هذا المشروع؟'],
    spBody: ['Layla receives a Native badge for "Cash-flow forecasting sprint" and +3 on her Specialist score.', 'ستحصل ليلى على شارة أصيلة لـ«مشروع التنبؤ بالتدفقات النقدية» و+3 في مؤشر المتخصصين.'],
    spConfirm: ['Approve sprint', 'اعتماد المشروع'],
    spToast: ['Sprint approved — Native badge issued to Layla.', 'تم اعتماد المشروع — أُصدرت شارة أصيلة لليلى.'],
    rcTitle: ['Request changes', 'طلب تعديلات'],
    rcSub: ['Tell the team exactly what to fix. They\'ll see this note.', 'وضّح للفريق ما يجب إصلاحه بالتحديد. سيرون هذه الملاحظة.'],
    rcLabel: ['What needs to change?', 'ما الذي يحتاج إلى تعديل؟'],
    rcPh: ['e.g. The heat-test report is missing the 45°C run.', 'مثال: تقرير اختبار الحرارة ينقصه اختبار 45 درجة.'],
    rcShort: ['Please write at least 10 characters so the team knows what to fix.', 'يرجى كتابة 10 أحرف على الأقل ليعرف الفريق ما يجب إصلاحه.'],
    rcSend: ['Send request', 'إرسال الطلب'],
    rcToast: ['Changes requested. The team has been notified (demo).', 'طُلبت التعديلات وأُبلغ الفريق (عرض توضيحي).'],
    mUpcoming: ['Upcoming sessions', 'الجلسات القادمة'],
    mHistory: ['Recently completed', 'المكتمل مؤخرًا'],
    mHistoryEmpty: ['Reviews you complete will be listed here.', 'ستظهر هنا المراجعات التي تكملها.'],

    // admin
    aKicker: ['Shams programme admin', 'إدارة برنامج شمس'],
    aTitle: ['Programme overview', 'نظرة عامة على البرنامج'],
    aK1: ['KYC-verified talent', 'مواهب موثّقة الهوية'],
    aK1n: ['Across 4 tracks', 'عبر 4 مسارات'],
    aK2: ['Badges issued', 'الشارات الصادرة'],
    aK2n: ['Legacy + Native', 'سابقة + أصيلة'],
    aK3: ['Talent scoring 50+', 'مواهب بمؤشر 50+'],
    aK3n: ['Stage 2 target: 60%', 'هدف المرحلة 2: 60٪'],
    aK4: ['Escrow released', 'المصروف من الضمان'],
    aK4n: ['of {total} in Safe Box', 'من {total} في صندوق الأمان'],
    aStages: ['Programme stages', 'مراحل البرنامج'],
    aStagesHint: ['12-month plan', 'خطة 12 شهرًا'],
    aDone: ['Complete', 'مكتملة'],
    aActive: ['In progress', 'قيد التنفيذ'],
    aUpcoming: ['Upcoming', 'قادمة'],
    aBudget: ['{b} of budget', '{b} من الميزانية'],
    aS1: ['Stage 1 · Attract, KYC & select', 'المرحلة 1 · الاستقطاب والتحقق والاختيار'],
    aS2: ['Stage 2 · Train, mentor & produce', 'المرحلة 2 · التدريب والإرشاد والإنتاج'],
    aS3: ['Stage 3 · Connect & commercialise', 'المرحلة 3 · الربط والتسويق'],
    aS4: ['Stage 4 · Incubate & scale', 'المرحلة 4 · الاحتضان والتوسع'],
    aM1: ['Months 1–2', 'الشهران 1–2'], aM2: ['Months 3–5', 'الأشهر 3–5'], aM3: ['Months 6–8', 'الأشهر 6–8'], aM4: ['Months 9–12', 'الأشهر 9–12'],
    aSafe: ['Safe Box status', 'حالة صندوق الأمان'],
    aLedger: ['Escrow ledger & audit log', 'سجل الضمان والتدقيق'],
    aLedgerHint: ['Every money movement and verification, newest first.', 'كل حركة مالية وعملية توثيق، الأحدث أولًا.'],
    aFAll: ['All', 'الكل'], aFEscrow: ['Escrow', 'الضمان'], aFDeals: ['Deals', 'الصفقات'], aFVerify: ['Verification', 'التوثيق'],
    aExport: ['Export CSV', 'تصدير CSV'],
    aExportToast: ['CSV downloaded.', 'تم تنزيل ملف CSV.'],
    aTime: ['Time', 'الوقت'], aEvent: ['Event', 'الحدث'], aBy: ['By', 'بواسطة'], aAmount: ['Amount', 'المبلغ'],
    aNoRows: ['No entries of this type yet.', 'لا توجد سجلات من هذا النوع بعد.'],

    // ledger events
    evFunded: ['Desert Cool Safe Box funded', 'تمويل صندوق أمان ديزرت كول'],
    evRelease: ['Released: {stage} stage', 'صرف: مرحلة {stage}'],
    evChanges: ['Changes requested: {stage} stage', 'طلب تعديلات: مرحلة {stage}'],
    evNda: ['NDA signed · irrigation valve deal room', 'توقيع اتفاقية · غرفة صفقة صمام الري'],
    evDc: ['Legacy badge issued · Defense Check (Layla A.)', 'إصدار شارة سابقة · فحص الدفاع (ليلى أ.)'],
    evSprint: ['Native badge issued · cash-flow sprint (Layla A.)', 'إصدار شارة أصيلة · مشروع التدفقات (ليلى أ.)'],
    evSprintChanges: ['Changes requested · cash-flow sprint', 'طلب تعديلات · مشروع التدفقات'],
    evKyb: ['KYB verified · Gulf Retail Group', 'توثيق شركة · مجموعة الخليج للتجزئة'],
    evAudit: ['Native badge issued · audit simulation (Layla A.)', 'إصدار شارة أصيلة · محاكاة التدقيق (ليلى أ.)'],
    byBackers: ['Backers (pre-orders)', 'الداعمون (طلبات مسبقة)'],
    byHamad: ['Dr. Hamad (mentor)', 'د. حمد (مرشد)'],
    byGulf: ['Gulf Retail Group', 'مجموعة الخليج للتجزئة'],
    bySystem: ['System', 'النظام'],
    feeHeld: ['{amt} option fee held', 'رسم خيار {amt} محفوظ']
  };

  function lang() { return window.JISR.lang(); }
  function t(key, p) {
    var e = T[key]; var s = e ? (lang() === 'ar' ? e[1] : e[0]) : key;
    if (p) for (var k in p) s = s.split('{' + k + '}').join(p[k]);
    return s;
  }
  function L(o) { return o == null ? '' : (typeof o === 'string' ? o : (lang() === 'ar' ? o.ar : o.en)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { var s = Number(n).toLocaleString('en-US'); return lang() === 'ar' ? s + ' درهم' : 'AED ' + s; }
  function when(iso, withTime) {
    var d = new Date(iso);
    var opts = withTime ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' };
    try { return new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-u-nu-latn' : 'en-GB', opts).format(d); } catch (e) { return d.toDateString(); }
  }

  /* ------------------------------------------------------------------ data */
  var TRACKS = [
    { id: 'spec', icon: 'briefcase', label: { en: 'Specialist', ar: 'المتخصصين' }, short: { en: 'Specialist', ar: 'متخصص' }, score: 72,
      next: { en: 'Finish one mentor-reviewed paid sprint to add about 8 points.', ar: 'أنجز مشروعًا مدفوعًا واحدًا يراجعه مرشد لتضيف نحو 8 نقاط.' } },
    { id: 'res', icon: 'flask', label: { en: 'Researcher', ar: 'الباحثين' }, short: { en: 'Researcher', ar: 'باحث' }, score: 64,
      next: { en: 'Publish one verified study summary to reach corporate lab sponsors.', ar: 'انشر ملخص دراسة موثّقًا واحدًا لتصل إلى رعاة المختبرات من الشركات.' } },
    { id: 'inv', icon: 'bulb', label: { en: 'Inventor', ar: 'المخترعين' }, short: { en: 'Inventor', ar: 'مخترع' }, score: 58,
      next: { en: 'Add test data to your vaulted invention to strengthen deal-room offers.', ar: 'أضف بيانات اختبار إلى اختراعك المحفوظ لتقوية عروض غرفة الصفقة.' } },
    { id: 'fnd', icon: 'rocket', label: { en: 'Founder', ar: 'المؤسسين' }, short: { en: 'Founder', ar: 'مؤسس' }, score: 49,
      next: { en: 'Recruit one verified specialist with the Squad Builder to pass 50.', ar: 'ضُمّ متخصصًا موثّقًا عبر منشئ الفريق لتتجاوز 50.' } }
  ];

  var OPPS = {
    spec: [
      { id: 's1', kind: { en: 'Job', ar: 'وظيفة' }, title: { en: 'Junior FP&A analyst', ar: 'محلل تخطيط وتحليل مالي مبتدئ' }, meta: { en: 'Retail group · Dubai · Full-time', ar: 'مجموعة تجزئة · دبي · دوام كامل' },
        body: { en: 'Build monthly forecasts and variance reports for 40 stores. Requires a Specialist score of 65+ and at least one verified model.', ar: 'إعداد توقعات شهرية وتقارير انحراف لـ40 متجرًا. يتطلب مؤشر متخصص 65+ ونموذجًا موثّقًا واحدًا على الأقل.' },
        cta: { en: 'Apply', ar: 'تقدّم' }, done: { en: 'Applied', ar: 'تم التقديم' } },
      { id: 's2', kind: { en: 'Paid sprint', ar: 'مشروع مدفوع' }, title: { en: '3-statement model for a café chain', ar: 'نموذج القوائم الثلاث لسلسلة مقاهٍ' }, meta: { en: '2 weeks · AED 3,500 · fee locked in escrow', ar: 'أسبوعان · 3,500 درهم · الأتعاب محفوظة في الضمان' },
        body: { en: 'A 6-branch café chain needs a linked P&L, balance sheet and cash-flow model. You keep 90% of the fee; it is released when the client accepts delivery.', ar: 'تحتاج سلسلة مقاهٍ من 6 فروع إلى نموذج مترابط للدخل والميزانية والتدفقات النقدية. تحصل على 90٪ من الأتعاب، وتُصرف عند قبول العميل للتسليم.' },
        cta: { en: 'Request sprint', ar: 'اطلب المشروع' }, done: { en: 'Requested', ar: 'تم الطلب' } },
      { id: 's3', kind: { en: 'Simulation', ar: 'محاكاة' }, title: { en: 'Year-end audit sandbox', ar: 'بيئة محاكاة تدقيق نهاية العام' }, meta: { en: 'Self-paced · earns a Native badge', ar: 'بالوتيرة الذاتية · تمنح شارة أصيلة' },
        body: { en: 'Work through a realistic audit file with planted errors. A mentor reviews your findings and a Native badge is added on approval.', ar: 'اعمل على ملف تدقيق واقعي يحتوي أخطاء مقصودة. يراجع مرشد نتائجك وتُضاف شارة أصيلة عند الاعتماد.' },
        cta: { en: 'Join simulation', ar: 'انضم للمحاكاة' }, done: { en: 'Joined', ar: 'انضممت' } }
    ],
    res: [
      { id: 'r1', kind: { en: 'Sponsorship', ar: 'رعاية' }, title: { en: 'Water-reuse lab study', ar: 'دراسة مختبرية لإعادة استخدام المياه' }, meta: { en: 'Corporate R&D team · 6 months', ar: 'فريق بحث وتطوير مؤسسي · 6 أشهر' },
        body: { en: 'A utilities company will sponsor a 6-month study on greywater reuse for landscaping. Milestone-based funding through escrow.', ar: 'ستموّل شركة مرافق دراسة لمدة 6 أشهر حول إعادة استخدام المياه الرمادية في التشجير، بتمويل مرحلي عبر الضمان.' },
        cta: { en: 'Express interest', ar: 'أبدِ اهتمامك' }, done: { en: 'Interest sent', ar: 'أُرسل الاهتمام' } },
      { id: 'r2', kind: { en: 'Expert call', ar: 'استشارة خبير' }, title: { en: 'Advise on solar-panel soiling data', ar: 'استشارة حول بيانات اتساخ الألواح الشمسية' }, meta: { en: '45 min · paid · bookable', ar: '45 دقيقة · مدفوعة · قابلة للحجز' },
        body: { en: 'An energy start-up wants a 45-minute call to sanity-check its cleaning-schedule model.', ar: 'تريد شركة طاقة ناشئة مكالمة لمدة 45 دقيقة لمراجعة نموذج جدولة التنظيف لديها.' },
        cta: { en: 'Accept call', ar: 'اقبل المكالمة' }, done: { en: 'Accepted', ar: 'تم القبول' } },
      { id: 'r3', kind: { en: 'Simulation', ar: 'محاكاة' }, title: { en: 'Grant-proposal review sprint', ar: 'مشروع مراجعة مقترح منحة' }, meta: { en: 'Mentor-reviewed · Native badge', ar: 'يراجعه مرشد · شارة أصيلة' },
        body: { en: 'Review and strengthen a real (anonymised) grant proposal. Earns a Native badge on mentor approval.', ar: 'راجع وحسّن مقترح منحة حقيقي (مجهول الهوية). يمنح شارة أصيلة عند اعتماد المرشد.' },
        cta: { en: 'Join sprint', ar: 'انضم للمشروع' }, done: { en: 'Joined', ar: 'انضممت' } }
    ],
    inv: [
      { id: 'i1', kind: { en: 'Clinic', ar: 'عيادة' }, title: { en: 'University patent clinic slot', ar: 'موعد في عيادة البراءات الجامعية' }, meta: { en: 'Free · this Thursday, 4 pm', ar: 'مجاني · هذا الخميس، 4 مساءً' },
        body: { en: 'A 30-minute session with the university legal clinic to review your claims before filing.', ar: 'جلسة 30 دقيقة مع العيادة القانونية الجامعية لمراجعة مطالباتك قبل التسجيل.' },
        cta: { en: 'Book slot', ar: 'احجز الموعد' }, done: { en: 'Booked', ar: 'تم الحجز' } },
      { id: 'i2', kind: { en: 'Showcase', ar: 'عرض' }, title: { en: 'Agri-tech scouting day', ar: 'يوم استكشاف التقنية الزراعية' }, meta: { en: 'Pitch to 6 verified corporate scouts', ar: 'قدّم لـ6 مستكشفين مؤسسيين موثّقين' },
        body: { en: 'Present your vaulted invention to verified agri-tech scouts. Only the public summary is shown until a scout signs an NDA.', ar: 'اعرض اختراعك المحفوظ على مستكشفين موثّقين في التقنية الزراعية. لا يظهر إلا الملخص العام حتى يوقّع المستكشف اتفاقية عدم الإفصاح.' },
        cta: { en: 'Register', ar: 'سجّل' }, done: { en: 'Registered', ar: 'تم التسجيل' } }
    ],
    fnd: [
      { id: 'f1', kind: { en: 'Incubation', ar: 'احتضان' }, title: { en: 'Prototype-stage support', ar: 'دعم مرحلة النموذج الأولي' }, meta: { en: 'University incubator · mentor assigned', ar: 'حاضنة جامعية · مرشد مخصص' },
        body: { en: 'Workspace, lab access and a dedicated mentor while you build your prototype.', ar: 'مساحة عمل ووصول للمختبر ومرشد مخصص أثناء بناء نموذجك الأولي.' },
        cta: { en: 'Apply', ar: 'تقدّم' }, done: { en: 'Applied', ar: 'تم التقديم' } },
      { id: 'f2', kind: { en: 'Demo day', ar: 'يوم العرض' }, title: { en: 'Monthly live Demo Fair', ar: 'معرض العروض الشهري' }, meta: { en: 'Pitch to verified angel investors', ar: 'قدّم لمستثمرين ملائكيين موثّقين' },
        body: { en: 'Five-minute pitch slots in front of KYB-verified angels and family offices.', ar: 'فرص عرض مدتها خمس دقائق أمام مستثمرين ملائكيين ومكاتب عائلية موثّقة.' },
        cta: { en: 'Request a slot', ar: 'اطلب موعدًا' }, done: { en: 'Requested', ar: 'تم الطلب' } },
      { id: 'f3', kind: { en: 'Campaign', ar: 'حملة' }, title: { en: 'Launch a 30/40/30 pre-order campaign', ar: 'أطلق حملة طلب مسبق 30/40/30' }, meta: { en: '5% platform fee on success', ar: 'رسوم 5٪ عند النجاح' },
        body: { en: 'Raise pre-orders into a three-stage Safe Box. Your mentor verifies each stage before funds are released.', ar: 'اجمع طلبات مسبقة في صندوق أمان من ثلاث مراحل. يتحقق مرشدك من كل مرحلة قبل صرف الأموال.' },
        cta: { en: 'Start draft', ar: 'ابدأ مسودة' }, done: { en: 'Draft started', ar: 'بدأت المسودة' } }
    ]
  };

  var PORTFOLIO = [
    { id: 'dcf', type: 'legacy', title: { en: 'Retail DCF model (2025)', ar: 'نموذج تدفقات نقدية لقطاع التجزئة (2025)' } },
    { id: 'audit', type: 'native', title: { en: 'Audit simulation · Pod 3', ar: 'محاكاة تدقيق · المجموعة 3' }, proof: { en: 'Mentor reviewed · 4.8 rating', ar: 'راجعه مرشد · تقييم 4.8' } },
    { id: 'inv', type: 'native', title: { en: 'Paid sprint: inventory forecast', ar: 'مشروع مدفوع: التنبؤ بالمخزون' }, proof: { en: 'Delivered on time · escrow released', ar: 'سُلِّم في الموعد · صُرف الضمان' } }
  ];

  var PEOPLE = [
    { id: 'la', i: 'LA', name: { en: 'Layla A.', ar: 'ليلى أ.' }, track: 'spec', role: { en: 'Financial modelling', ar: 'النمذجة المالية' }, score: 72, city: { en: 'Sharjah', ar: 'الشارقة' }, uae: true, langs: ['ar', 'en'], legacy: 2, native: 3,
      about: { en: 'Finance student building retail and F&B models. Strong in three-statement modelling and forecasting.', ar: 'طالبة مالية تبني نماذج للتجزئة والأغذية. متميزة في نمذجة القوائم الثلاث والتنبؤ.' },
      work: [['legacy', { en: 'Retail DCF model (2025)', ar: 'نموذج تدفقات نقدية للتجزئة (2025)' }], ['native', { en: 'Audit simulation · Pod 3', ar: 'محاكاة تدقيق · المجموعة 3' }], ['native', { en: 'Paid sprint: inventory forecast', ar: 'مشروع مدفوع: التنبؤ بالمخزون' }]] },
    { id: 'om', i: 'OK', name: { en: 'Omar K.', ar: 'عمر ك.' }, track: 'spec', role: { en: 'Audit & controls', ar: 'التدقيق والرقابة' }, score: 81, city: { en: 'Abu Dhabi', ar: 'أبوظبي' }, uae: true, langs: ['ar', 'en'], legacy: 1, native: 5,
      about: { en: 'Accounting graduate with five completed audit sprints and a focus on internal controls.', ar: 'خريج محاسبة أنجز خمسة مشاريع تدقيق ويركّز على الرقابة الداخلية.' },
      work: [['native', { en: 'Internal-controls review · logistics client', ar: 'مراجعة الرقابة الداخلية · عميل لوجستي' }], ['native', { en: 'Year-end audit sandbox', ar: 'محاكاة تدقيق نهاية العام' }], ['legacy', { en: 'Graduation project: fraud red flags', ar: 'مشروع التخرج: مؤشرات الاحتيال' }]] },
    { id: 'sr', i: 'SR', name: { en: 'Sara R.', ar: 'سارة ر.' }, track: 'spec', role: { en: 'Data & dashboards', ar: 'البيانات ولوحات المعلومات' }, score: 68, city: { en: 'Dubai', ar: 'دبي' }, uae: true, langs: ['ar', 'en'], legacy: 3, native: 1,
      about: { en: 'Builds Power BI and SQL dashboards for sales and operations teams.', ar: 'تبني لوحات Power BI وSQL لفرق المبيعات والعمليات.' },
      work: [['legacy', { en: 'Sales dashboard for a car dealer', ar: 'لوحة مبيعات لوكيل سيارات' }], ['native', { en: 'Paid sprint: churn report', ar: 'مشروع مدفوع: تقرير فقدان العملاء' }]] },
    { id: 'ym', i: 'YM', name: { en: 'Yousef M.', ar: 'يوسف م.' }, track: 'spec', role: { en: 'Full-stack developer', ar: 'مطوّر متكامل' }, score: 77, city: { en: 'Dubai', ar: 'دبي' }, uae: true, langs: ['en'], legacy: 2, native: 4,
      about: { en: 'React and Node developer with four delivered client sprints, including a booking system.', ar: 'مطوّر React وNode سلّم أربعة مشاريع لعملاء، منها نظام حجوزات.' },
      work: [['native', { en: 'Clinic booking web app', ar: 'تطبيق ويب لحجز العيادات' }], ['legacy', { en: 'Open-source Arabic date picker', ar: 'منتقي تاريخ عربي مفتوح المصدر' }]] },
    { id: 'rd', i: 'RD', name: { en: 'Rania D.', ar: 'رانيا د.' }, track: 'spec', role: { en: 'Brand & motion design', ar: 'تصميم الهوية والحركة' }, score: 63, city: { en: 'Amman (remote)', ar: 'عمّان (عن بُعد)' }, uae: false, langs: ['ar', 'en'], legacy: 3, native: 0,
      about: { en: 'Designer with a strong bilingual typography portfolio. New to on-platform sprints.', ar: 'مصممة بملف قوي في الخطوط ثنائية اللغة. جديدة على مشاريع المنصة.' },
      work: [['legacy', { en: 'Bilingual café brand identity', ar: 'هوية مقهى ثنائية اللغة' }], ['legacy', { en: 'Ramadan campaign motion pack', ar: 'حزمة حركة لحملة رمضان' }]] },
    { id: 'nh', i: 'NH', name: { en: 'Dr. Noura H.', ar: 'د. نورة ح.' }, track: 'res', role: { en: 'Water-reuse researcher', ar: 'باحثة في إعادة استخدام المياه' }, score: 74, city: { en: 'Al Ain', ar: 'العين' }, uae: true, langs: ['ar', 'en'], legacy: 4, native: 2,
      about: { en: 'Post-doctoral researcher in membrane filtration and greywater systems.', ar: 'باحثة ما بعد الدكتوراه في الترشيح الغشائي وأنظمة المياه الرمادية.' },
      work: [['legacy', { en: 'Peer-reviewed paper: greywater membranes', ar: 'ورقة محكّمة: أغشية المياه الرمادية' }], ['native', { en: 'Expert call · utilities company', ar: 'استشارة خبير · شركة مرافق' }]] },
    { id: 'tb', i: 'TB', name: { en: 'Tariq B.', ar: 'طارق ب.' }, track: 'res', role: { en: 'Materials science expert', ar: 'خبير علوم المواد' }, score: 52, city: { en: 'Cairo (remote)', ar: 'القاهرة (عن بُعد)' }, uae: false, langs: ['ar', 'en'], legacy: 2, native: 1,
      about: { en: 'Researcher in heat-resistant polymers, available for expert calls.', ar: 'باحث في البوليمرات المقاومة للحرارة، متاح لاستشارات الخبراء.' },
      work: [['legacy', { en: 'Thesis: polymer heat ageing', ar: 'أطروحة: التقادم الحراري للبوليمرات' }], ['native', { en: 'Grant-proposal review sprint', ar: 'مشروع مراجعة مقترح منحة' }]] },
    { id: 'ka', i: 'KA', name: { en: 'Khalid A.', ar: 'خالد أ.' }, track: 'inv', role: { en: 'Agri-tech inventor', ar: 'مخترع في التقنية الزراعية' }, score: 66, city: { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' }, uae: true, langs: ['ar'], legacy: 2, native: 1,
      about: { en: 'Inventor of a low-water irrigation valve, date-stamped in the IP Vault.', ar: 'مخترع صمام ري موفّر للمياه، مختوم زمنيًا في خزنة الملكية.' },
      work: [['legacy', { en: 'Irrigation valve prototype', ar: 'نموذج صمام الري' }], ['native', { en: 'Patent clinic review', ar: 'مراجعة عيادة البراءات' }]] },
    { id: 'mf', i: 'MF', name: { en: 'Maryam F.', ar: 'مريم ف.' }, track: 'fnd', role: { en: 'Ed-tech founder', ar: 'مؤسسة في تقنيات التعليم' }, score: 59, city: { en: 'Ajman', ar: 'عجمان' }, uae: true, langs: ['ar', 'en'], legacy: 1, native: 2,
      about: { en: 'Building an Arabic reading app for early learners; in incubation.', ar: 'تبني تطبيقًا لتعليم القراءة العربية للأطفال؛ في مرحلة الاحتضان.' },
      work: [['native', { en: 'Prototype stage verified', ar: 'تم التحقق من مرحلة النموذج الأولي' }], ['legacy', { en: 'Pilot with 2 nurseries', ar: 'تجربة مع حضانتين' }]] }
  ];

  var STAGES = [
    { key: 'stPrototype', pct: 30, amount: 12000,
      evidence: [{ en: 'Working prototype video (3 min)', ar: 'فيديو النموذج الأولي العامل (3 دقائق)' }, { en: 'Bill of materials', ar: 'قائمة المواد' }, { en: 'Lab heat-test report at 40°C and 45°C', ar: 'تقرير اختبار الحرارة المخبري عند 40 و45 درجة' }] },
    { key: 'stProduction', pct: 40, amount: 16000,
      evidence: [{ en: 'Supplier contract for the first 500 units', ar: 'عقد المورّد لأول 500 وحدة' }, { en: 'Quality-check sample photos', ar: 'صور عينة فحص الجودة' }] },
    { key: 'stDelivery', pct: 30, amount: 12000,
      evidence: [{ en: 'Shipping confirmations for backer pre-orders', ar: 'تأكيدات شحن طلبات الداعمين' }, { en: 'Backer satisfaction survey', ar: 'استبيان رضا الداعمين' }] }
  ];
  var SAFEBOX = 40000;
  var NDA_FEE = 2000;

  var SESSIONS = [
    { d: '2026-11-22T18:00:00', title: { en: 'Cohort pod 3 critique', ar: 'جلسة نقد المجموعة 3' }, meta: { en: '6 talents · Specialist track', ar: '6 مواهب · مسار المتخصصين' }, where: { en: 'Online', ar: 'عن بُعد' } },
    { d: '2026-11-24T17:00:00', title: { en: 'Squad formation: Desert Cool', ar: 'تشكيل فريق: ديزرت كول' }, meta: { en: 'Founders + finance specialist', ar: 'المؤسسون + متخصص مالي' }, where: { en: 'Incubation Centre, room 2', ar: 'مركز الاحتضان، غرفة 2' } },
    { d: '2026-11-26T16:00:00', title: { en: 'Patent clinic office hours', ar: 'ساعات عيادة البراءات' }, meta: { en: 'With the university legal clinic', ar: 'مع العيادة القانونية الجامعية' }, where: { en: 'Law faculty', ar: 'كلية القانون' } }
  ];

  /* ------------------------------------------------------------------ state */
  function initialState() {
    return {
      track: 'spec',
      dc: { status: 'idle', result: null, attest: null, inProgress: false },
      opps: {},
      squad: {},
      shortlist: {},
      nda: false,
      escrow: { stage: 0, changes: null },
      sprint: { status: 'pending', note: null },
      reviewed: 0,
      log: [
        { at: '2026-10-28T10:20:00', type: 'verify', ev: 'evKyb', by: 'byGulf', amt: null },
        { at: '2026-11-02T09:15:00', type: 'escrow', ev: 'evFunded', by: 'byBackers', amt: SAFEBOX },
        { at: '2026-11-10T15:40:00', type: 'verify', ev: 'evAudit', by: 'byHamad', amt: null }
      ]
    };
  }
  var storageOk = true;
  function load() {
    try { var raw = localStorage.getItem(STATE_KEY); if (raw) return Object.assign(initialState(), JSON.parse(raw)); }
    catch (e) { storageOk = false; }
    return initialState();
  }
  var S = load();
  (function migrate() {
    var d = S.dc || (S.dc = {});
    if (['idle', 'passed', 'review', 'failed'].indexOf(d.status) < 0 || (d.status !== 'idle' && !d.result)) { d.status = 'idle'; d.result = null; }
    if (d.inProgress) {   // the page was reloaded or closed during locked mode
      d.inProgress = false; d.status = 'failed';
      d.result = { result: 'failed', reason: 'abandoned', score: 0, questions: [], integrity: { violations: ['left_page'], flags: [], terminated: true } };
      S.log.push({ at: new Date().toISOString(), type: 'verify', ev: 'evDcFail', by: 'bySystem', amt: null });
    }
    try { localStorage.setItem(STATE_KEY, JSON.stringify(S)); } catch (e) {}
  })();
  function save() { try { localStorage.setItem(STATE_KEY, JSON.stringify(S)); } catch (e) { storageOk = false; } }
  function log(type, ev, by, amt, params) { S.log.push({ at: new Date().toISOString(), type: type, ev: ev, by: by, amt: amt == null ? null : amt, p: params || null }); }

  // UI-only (not persisted)
  var UI = { bizTab: 'find', q: '', fTrack: 'all', fMin: 0, sort: 'score', chips: { native: false, bi: false, uae: false }, pf: 'all', ledger: 'all' };

  /* ------------------------------------------------------------------ derived */
  function trackScore(id) {
    var tr = TRACKS.find(function (x) { return x.id === id; });
    var s = tr.score;
    if (id === 'spec') { if (S.dc.status === 'passed') s += 4; if (S.sprint.status === 'approved') s += 3; }
    if (id === 'fnd' && Object.keys(S.squad).some(function (k) { return S.squad[k]; })) s += 2;
    return Math.min(100, s);
  }
  function level(score) { return score >= 85 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0; }
  function released() { return STAGES.slice(0, S.escrow.stage).reduce(function (a, x) { return a + x.amount; }, 0); }
  function pendingCount() { return (S.escrow.stage < 3 && !S.escrow.changes ? 1 : 0) + (S.sprint.status === 'pending' ? 1 : 0) + (S.dc.status === 'review' ? 1 : 0); }

  /* ------------------------------------------------------------------ router */
  var ROLES = ['talent', 'business', 'mentor', 'admin'];
  function route() {
    var h = (location.hash || '#talent').slice(1).split('/');
    var role = ROLES.indexOf(h[0]) > -1 ? h[0] : 'talent';
    if (role === 'talent' && h[1] && TRACKS.some(function (x) { return x.id === h[1]; })) {
      if (S.track !== h[1]) { S.track = h[1]; save(); }
    }
    return role;
  }

  var currentRole = null;
  function render(opts) {
    var role = route();
    var changed = currentRole !== null && currentRole !== role;
    currentRole = role;
    document.querySelectorAll('[data-role]').forEach(function (a) {
      if (a.dataset.role === role) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var who = { talent: ['whoTalent', 'LA', ''], business: ['whoBusiness', 'GR', 'navy'], mentor: ['whoMentor', 'DH', 'gold'], admin: ['whoAdmin', 'SH', 'navy'] }[role];
    document.getElementById('who').innerHTML = '<span class="avatar ' + who[2] + '" aria-hidden="true">' + who[1] + '</span>' + esc(t(who[0]));
    var html = { talent: renderTalent, business: renderBusiness, mentor: renderMentor, admin: renderAdmin }[role]();
    if (!storageOk) html = '<p class="note-box" style="margin-bottom:20px">' + I('alert') + '<span>' + t('storageWarn') + '</span></p>' + html;
    view.innerHTML = '<div class="' + (changed || (opts && opts.fade) ? 'view-fade' : '') + '">' + html + '</div>';
    var titles = { talent: t('tHello'), business: t('bTitle'), mentor: t('mHello'), admin: t('aTitle') };
    document.title = titles[role] + ' · JISR جسر';
    afterRender(role);
    if (changed && opts && opts.focus) { var h1 = view.querySelector('h1'); if (h1) h1.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
  }

  function afterRender(role) {
    if (role === 'business' && UI.bizTab === 'find') renderResults();
  }

  function pageHead(kicker, title, badges) {
    return '<div class="page-head"><div><p class="kicker">' + kicker + '</p><h1 tabindex="-1">' + title + '</h1></div>' +
      (badges ? '<div class="head-badges">' + badges + '</div>' : '') + '</div>';
  }

  /* ================================================================== TALENT */
  function renderTalent() {
    var tr = TRACKS.find(function (x) { return x.id === S.track; }) || TRACKS[0];
    var score = trackScore(tr.id);
    var lv = level(score);

    var h = pageHead(t('tKicker'), t('tHello'), '<span class="badge badge-verified">' + I('shield') + t('kycVerified') + '</span>');

    // track tabs
    h += '<div class="track-tabs" role="tablist" aria-label="' + esc(t('tTracks')) + '">' + TRACKS.map(function (x) {
      var sel = x.id === tr.id;
      return '<button type="button" class="track-tab" role="tab" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '" data-act="track" data-arg="' + x.id + '">' +
        '<span class="ticon">' + I(x.icon) + '</span><span><span class="tname">' + esc(L(x.short)) + '</span><span class="tscore">' + t('tTrackScore', { n: trackScore(x.id) }) + '</span></span></button>';
    }).join('') + '</div>';

    h += '<div class="grid-main"><div class="stack">';

    // readiness
    var markerPos = score + '%';
    h += '<section class="card" aria-labelledby="rs-h"><div class="card-head"><h2 id="rs-h">' + t('rsTitle') + '</h2><span class="hint">' + t('rsHint', { track: esc(L(tr.short)) }) + '</span></div>' +
      '<div class="readiness"><div class="ring" style="--val:' + score + '" role="img" aria-label="' + esc(t('rsTitle')) + ': ' + score + ' / 100"><div class="ring-val"><strong>' + score + '</strong><span>' + t('outOf') + '</span></div></div>' +
      '<div><span class="level-pill">' + I('check-circle', 'icon-sm') + t('lvl' + lv) + '</span><h3>' + t('lvlDesc' + lv) + '</h3><p>' + t('rsWhat') + '</p></div></div>' +
      '<div class="scale" role="img" aria-label="' + esc(t('scaleAria')) + '"><div class="scale-bar">' +
      [0, 1, 2, 3].map(function (i) { return '<span class="' + (i <= lv ? 'on' : '') + '"></span>'; }).join('') +
      '<i class="scale-marker" style="inset-inline-start:' + markerPos + '"></i></div><div class="scale-legend" aria-hidden="true"><span>0 · ' + t('lvl0') + '</span><span>50 · ' + t('lvl1') + '</span><span>70</span><span>85+</span></div></div>' +
      '<div class="next-step">' + I('arrow-right', 'flip-rtl') + '<div><strong>' + t('rsNext') + '</strong>' + esc(L(tr.next)) + '</div></div></section>';

    // opportunities
    var opps = OPPS[tr.id] || [];
    h += '<section class="card" aria-labelledby="op-h"><div class="card-head"><h2 id="op-h">' + t('oppTitle') + '</h2><span class="hint">' + t('oppHint', { track: esc(L(tr.short)) }) + '</span></div>';
    if (!opps.length) h += '<div class="empty"><p>' + t('oppEmpty') + '</p></div>';
    else h += '<div class="rows">' + opps.map(function (o) {
      var done = !!S.opps[o.id];
      return '<div class="row wrap-sm"><div class="grow"><span class="kind">' + esc(L(o.kind)) + '</span><span class="title">' + esc(L(o.title)) + '</span><span class="meta">' + esc(L(o.meta)) + '</span></div>' +
        '<div class="row-actions">' + (done ? '<span class="badge badge-verified">' + I('check') + esc(L(o.done)) + '</span>' : '') +
        '<button type="button" class="btn btn-outline btn-sm" data-act="opp" data-arg="' + o.id + '">' + t('details') + '<span class="sr-only">: ' + esc(L(o.title)) + '</span></button></div></div>';
    }).join('') + '</div>';
    h += '</section>';

    // track-specific tools
    if (tr.id === 'inv') h += vaultCard();
    if (tr.id === 'fnd') h += ventureCard();
    if (tr.id === 'inv' || tr.id === 'fnd') h += squadCard();

    h += '</div><div class="stack">';
    h += defenseCard();
    h += portfolioCard();
    h += '</div></div>';
    return h;
  }

  /* ================================================================== DEFENSE CHECK
     Upload → AI writes 3 questions → rules → LOCKED MODE (full screen, one question at a
     time, per-question timer, paste blocked, leaving the window is recorded) → AI grades.
     With server.py + a Gemini key the server holds the questions, the rubric and the
     clock. Without it the same flow runs locally in clearly-labelled demo mode. */
  var MODE = { ai: null, seconds: 100, maxViolations: 3 };   // ai: null = checking, true/false
  var DC = { phase: 'idle', file: null, error: '', session: null, ack: false };
  var ACCEPT = '.pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json,.py,.js,.ts,.java,.c,.cpp,.cs,.go,.html,.css,.sql,.ipynb,.r,.tex';
  var MAX_MB = 15;

  fetch('api/health', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) { MODE.ai = !!(j && j.ai); if (j) { MODE.seconds = j.seconds || 100; MODE.maxViolations = j.maxViolations || 3; } })
    .catch(function () { MODE.ai = false; })
    .then(function () { if (currentRole === 'talent' && DC.phase === 'idle') render(); });

  function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function inline(ic) { return I(ic, 'icon-sm').replace('class="icon', 'style="display:inline;vertical-align:-3px;margin-inline-end:6px" class="icon'); }

  function defenseCard() {
    var d = S.dc, h;
    var resultShown = DC.phase === 'idle' && d.status !== 'idle' && d.result;
    var step = { idle: 0, analysing: 1, ready: 1, locked: 2, grading: 2 }[DC.phase] || 0;
    if (resultShown) step = 3;
    h = '<section class="card dark" aria-labelledby="dc-h" id="dc-card"><div class="card-head"><h2 id="dc-h" tabindex="-1">' + t('dcTitle') + '</h2>' +
      (MODE.ai === true ? '<span class="badge badge-native">' + I('sparkle') + t('dcAiOn') + '</span>' : MODE.ai === false ? '<span class="badge badge-demo">' + t('dcAiDemo') + '</span>' : '') + '</div>' +
      '<div class="dc-steps" aria-hidden="true">' + [1, 2, 3].map(function (i) { return '<span class="' + (i <= step ? 'on' : '') + '"></span>'; }).join('') + '</div>';

    if (resultShown) return h + dcResult(d) + '</section>';

    if (DC.phase === 'idle') {
      var f = DC.file;
      h += '<p>' + t('dcIntro2') + '</p>' +
        '<div class="dropzone' + (f ? ' has-file' : '') + '"><input type="file" id="dc-file" class="dz-input" accept="' + ACCEPT + '" aria-describedby="dc-types dc-ferr">' +
        '<label for="dc-file" class="dz-label">' + I(f ? 'file' : 'download') + '<span><strong>' + (f ? '<span dir="ltr">' + esc(f.name) + '</span>' : t('dcChoose')) + '</strong>' +
        '<small id="dc-types">' + (f ? fmtSize(f.size) + ' · ' + t('dcChange') : t('dcTypes')) + '</small></span></label></div>' +
        '<p class="error-msg" id="dc-ferr" role="alert"' + (DC.error ? '' : ' hidden') + '>' + I('alert') + esc(DC.error) + '</p>' +
        '<p class="small" style="opacity:.85">' + inline('info') + (MODE.ai ? t('dcPrivacy') : t('dcDemoNote')) + '</p>' +
        '<button type="button" class="btn btn-accent" style="justify-self:start" data-act="dc-analyse"' + (f ? '' : ' disabled') + '>' + I('sparkle', 'icon-sm') + t('dcAnalyse') + '</button>';
    } else if (DC.phase === 'analysing') {
      h += '<div class="dc-file"><span class="spinner" aria-hidden="true" style="width:20px;height:20px"></span><div><div class="name">' + t('dcReading') + '</div><div class="meta" dir="ltr">' + esc(DC.file ? DC.file.name : '') + '</div></div></div><p role="status">' + t('dcReadingSub') + '</p>';
    } else if (DC.phase === 'ready') {
      var s = DC.session, multi = window.screen && window.screen.isExtended;
      h += '<div class="dc-file">' + I('check-circle') + '<div><div class="name">' + t('dcFound', { title: esc(s.title) }) + '</div><div class="meta">' + esc(s.description) + '</div></div></div>' +
        '<div><p style="font-weight:600;color:#fff;margin-bottom:10px">' + t('dcRulesTitle') + '</p><ul class="rules" role="list">' +
        [['lock', t('dcRule1')], ['clock', t('dcRule2', { n: s.count, s: s.seconds })], ['eye', t('dcRule3', { w: s.maxViolations - 1 })], ['x', t('dcRule4')]].map(function (r) {
          return '<li>' + I(r[0]) + '<span>' + r[1] + '</span></li>';
        }).join('') + '</ul></div>' +
        (multi ? '<p class="note-box">' + I('alert') + '<span>' + t('dcMulti') + '</span></p>' : '') +
        '<label class="check" style="color:#fff"><input type="checkbox" id="dc-ack"' + (DC.ack ? ' checked' : '') + ' aria-describedby="dc-ack-err"><span>' + t('dcAck') + '</span></label>' +
        '<p class="error-msg" id="dc-ack-err" hidden>' + I('alert') + t('dcAckMust') + '</p>' +
        '<div class="row-gap"><button type="button" class="btn btn-accent" data-act="dc-lock">' + I('lock', 'icon-sm') + t('dcEnter') + '</button><button type="button" class="btn btn-outline-light" data-act="dc-reset">' + t('cancel') + '</button></div>';
    } else {
      h += '<p role="status">' + t('dcInProgress') + '</p>';
    }
    return h + '</section>';
  }

  function dcResult(d) {
    var r = d.result, h = '';
    if (d.status === 'passed') {
      h += '<div class="success-box" role="status"><strong>' + I('check-circle') + t('dcPassed') + '</strong><p>' + (r.mentor ? t('dcMentorOk') : t('dcPassedBody2', { score: r.score })) + '</p></div>';
    } else if (d.status === 'review') {
      var n = (r.integrity && r.integrity.violations.length) || 0;
      h += '<div class="review-box" role="status"><strong>' + I('clock') + t('dcReview') + '</strong><p>' + (r.reason === 'integrity' ? t('dcReviewIntegrity', { n: n || 1 }) : t('dcReviewBorder')) + '</p></div>';
    } else {
      var why = r.reason === 'integrity' ? t('dcFailIntegrity') : r.reason === 'abandoned' ? t('dcFailAbandoned') : r.reason === 'mentor' ? t('dcFailMentor') : t('dcFailAnswers');
      h += '<div class="fail-box" role="status"><strong>' + I('alert') + t('dcFailed') + '</strong><p>' + why + '</p></div>';
    }
    if (r.title) h += '<div class="dc-file">' + I('file') + '<div><div class="name">' + esc(r.title) + '</div><div class="meta" dir="ltr">' + esc(r.filename || '') + '</div></div></div>';
    if (r.questions && r.questions.length) {
      h += '<details class="dc-details"><summary>' + t('dcSeeFeedback') + '</summary><ol>' + r.questions.map(function (q) {
        return '<li><p class="q">' + esc(q.question) + '</p><p class="s"><strong>' + q.score + '/10</strong>' + (q.feedback ? ' · ' + esc(q.feedback) : '') + '</p></li>';
      }).join('') + '</ol>' + (r.overall ? '<p class="small">' + esc(r.overall) + '</p>' : '') +
      (r.integrity && (r.integrity.violations.length || r.integrity.flags.length) ? '<p class="small">' + inline('eye') + t('dcIntegrityLog', { list: esc(flagText(r.integrity.violations.concat(r.integrity.flags))) }) + '</p>' : '') + '</details>';
    }
    if (r.demo) h += '<p class="small" style="opacity:.8">' + t('dcDemoResult') + '</p>';
    if (d.status === 'passed') {
      if (d.attest) h += '<p class="small">' + inline('send') + t('dcAttested', { email: '<span dir="ltr">' + esc(d.attest) + '</span>' }) + '</p>';
      else h += '<button type="button" class="btn btn-outline-light" style="justify-self:start" data-act="attest">' + I('send') + t('dcAttest') + '</button>';
    }
    if (d.status === 'failed' || (d.status === 'review' && r.demo)) h += '<button type="button" class="btn btn-accent" style="justify-self:start" data-act="dc-again">' + I('refresh', 'icon-sm') + t('dcAgain') + '</button>';
    else h += '<button type="button" class="btn btn-ghost btn-sm" style="justify-self:start;color:var(--navy-200)" data-act="dc-again">' + t('dcAnother') + '</button>';
    return h;
  }

  /* ---------- API: server (Gemini) or local demo ---------- */
  function post(path, body) {
    return fetch('api/defense/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { var e = new Error(j.message || t('dcErrGeneric')); e.code = j.error; throw e; }
          return j;
        });
      }, function () { throw new Error(t('dcErrNetwork')); });
  }

  var Demo = {
    s: null,
    start: function (file) {
      var lang0 = lang();
      this.s = { issued: {}, answers: {}, next: 0, violations: 0, flags: [], keys: {}, terminated: false };
      var qs = ['dmQ1', 'dmQ2', 'dmQ3'].map(function (k) { return t(k); });
      this.s.qs = qs;
      return new Promise(function (res) { setTimeout(function () {
        res({ sid: 'demo', title: file.name.replace(/\.[^.]+$/, ''), description: t('dmDesc'), count: 3, seconds: MODE.seconds, maxViolations: MODE.maxViolations, demo: true, lang: lang0 });
      }, 1200); });
    },
    begin: function (b) { if (b.multiScreen) this.s.flags.push('multiple_screens'); return Promise.resolve({ ok: true }); },
    question: function (b) {
      var s = this.s, i = b.i;
      if (i !== s.next) return Promise.reject(new Error(t('dcErrGeneric')));
      if (!s.issued[i]) s.issued[i] = Date.now();
      return Promise.resolve({ i: i, total: 3, question: s.qs[i], secondsLeft: Math.max(0, Math.round(MODE.seconds - (Date.now() - s.issued[i]) / 1000)) });
    },
    answer: function (b) {
      var s = this.s, late = Date.now() - s.issued[b.i] > (MODE.seconds + 8) * 1000;
      var a = late ? '' : b.answer;
      if (late) s.flags.push('late_q' + (b.i + 1));
      else if (a.trim().length > 40 && b.keystrokes < a.trim().length * 0.15) s.flags.push('not_typed_q' + (b.i + 1));
      s.answers[b.i] = a; s.next = b.i + 1;
      return Promise.resolve({ ok: true, late: late, done: s.next >= 3 });
    },
    event: function (b) {
      var s = this.s;
      if (['paste', 'copy', 'drop', 'shortcut'].indexOf(b.type) > -1) { s.flags.push(b.type); return Promise.resolve({ violations: s.violations, max: MODE.maxViolations, terminated: false }); }
      s.violations++; s.vlist = (s.vlist || []).concat(b.type);
      if (s.violations >= MODE.maxViolations) s.terminated = true;
      return Promise.resolve({ violations: s.violations, max: MODE.maxViolations, terminated: s.terminated });
    },
    finish: function () {
      var s = this.s;
      var scores = [0, 1, 2].map(function (i) { var n = (s.answers[i] || '').trim().length; return n >= 60 ? 7 : n >= 25 ? 5 : n > 0 ? 2 : 0; });
      var avg = (scores[0] + scores[1] + scores[2]) / 3;
      var issue = s.violations > 0 || s.flags.some(function (f) { return /^(late|not_typed|multiple)/.test(f); });
      var out = s.terminated ? ['failed', 'integrity'] : (avg >= 6 && Math.min.apply(null, scores) >= 4) ? (issue ? ['review', 'integrity'] : ['passed', '']) : avg >= 5 ? ['review', 'borderline'] : ['failed', 'answers'];
      return new Promise(function (res) { setTimeout(function () {
        res({ result: out[0], reason: out[1], score: Math.round(avg * 10), demo: true,
          questions: s.qs.map(function (q, i) { return { question: q, score: scores[i], feedback: '' }; }), overall: '',
          integrity: { violations: s.vlist || [], flags: s.flags, terminated: s.terminated } });
      }, 1200); });
    }
  };
  var FLAG_LABEL = {
    left_window: ['switched to another window or app', 'انتقل إلى نافذة أو تطبيق آخر'],
    left_tab: ['switched browser tab', 'انتقل إلى تبويب آخر'],
    exited_fullscreen: ['left full screen', 'خرج من ملء الشاشة'],
    left_page: ['closed or reloaded the page', 'أغلق الصفحة أو أعاد تحميلها'],
    paste: ['tried to paste', 'حاول اللصق'], drop: ['tried to drop in text', 'حاول إفلات نص'],
    copy: ['tried to copy', 'حاول النسخ'], multiple_screens: ['more than one screen connected', 'أكثر من شاشة متصلة'],
    no_fullscreen: ['full screen unavailable', 'ملء الشاشة غير متاح']
  };
  function flagText(list) {
    var seen = {};
    return list.map(function (c) {
      var m = /^(late|not_typed)_q(\d)$/.exec(c);
      var txt = m ? (m[1] === 'late' ? t('flagLate', { n: m[2] }) : t('flagNotTyped', { n: m[2] })) : FLAG_LABEL[c] ? (lang() === 'ar' ? FLAG_LABEL[c][1] : FLAG_LABEL[c][0]) : c;
      return txt;
    }).filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }).join(lang() === 'ar' ? '، ' : '; ');
  }
  function api(name, body) { return MODE.ai ? post(name, body) : Demo[name](body); }

  /* ---------- Upload + analyse ---------- */
  function readBase64(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { rej(new Error(t('dcErrRead'))); };
      r.readAsDataURL(file);
    });
  }
  function pickFile(file) {
    DC.error = '';
    if (!file) { DC.file = null; return render(); }
    var ext = (file.name.match(/\.[^.]+$/) || [''])[0].toLowerCase();
    if (ACCEPT.split(',').indexOf(ext) < 0) { DC.file = null; DC.error = t('dcErrType'); }
    else if (file.size > MAX_MB * 1048576) { DC.file = null; DC.error = t('dcErrSize'); }
    else if (!file.size) { DC.file = null; DC.error = t('dcErrEmpty'); }
    else DC.file = file;
    render(); refocus(DC.file ? '[data-act="dc-analyse"]' : '#dc-file');
  }
  function analyse() {
    if (!DC.file || MODE.ai === null) return;
    DC.phase = 'analysing'; DC.error = ''; render(); refocus('#dc-h');
    var file = DC.file;
    var go = MODE.ai ? readBase64(file).then(function (b64) { return post('start', { filename: file.name, data: b64, lang: lang() }); }) : Demo.start(file);
    go.then(function (s) {
      DC.session = s; DC.phase = 'ready'; DC.ack = false;
      if (currentRole === 'talent') { render(); refocus('#dc-ack'); }
    }, function (e) {
      DC.phase = 'idle'; DC.error = e.message || t('dcErrGeneric');
      if (currentRole === 'talent') { render(); refocus('#dc-file'); }
    });
  }

  /* ---------- Locked mode ---------- */
  var LD = null;
  function lockStart() {
    var ack = document.getElementById('dc-ack');
    if (!ack || !ack.checked) { var er = document.getElementById('dc-ack-err'); if (er) er.hidden = false; if (ack) { ack.setAttribute('aria-invalid', 'true'); ack.focus(); } return; }
    var root = document.documentElement;
    var fsSupported = !!(root.requestFullscreen && document.fullscreenEnabled);
    var fsPromise = fsSupported ? Promise.race([   // must run inside the click; some browsers never settle the promise
      root.requestFullscreen({ navigationUI: 'hide' }).catch(function () { return null; }),
      new Promise(function (r) { setTimeout(r, 1500); })
    ]) : Promise.resolve(null);

    LD = { i: 0, total: DC.session.count, deadline: 0, keys: 0, busy: false, warned: 0, lastHard: 0, fs: fsSupported, timer: null, ended: false };
    DC.phase = 'locked';
    S.dc.inProgress = true; save();
    buildOverlay();
    ['visibilitychange', 'fullscreenchange'].forEach(function (ev) { document.addEventListener(ev, onLockEvent); });
    window.addEventListener('blur', onLockEvent);
    window.addEventListener('beforeunload', onUnload);
    ['copy', 'cut', 'paste', 'drop', 'contextmenu', 'dragstart'].forEach(function (ev) { document.addEventListener(ev, onBlockedEvent, true); });
    document.addEventListener('keydown', onLockKey, true);

    fsPromise.then(function () {
      LD.fs = !!document.fullscreenElement;
      return api('begin', { sid: DC.session.sid, multiScreen: !!(window.screen && window.screen.isExtended), fullscreen: LD.fs });
    }).then(function () { loadQuestion(0); }, lockError);
  }

  function buildOverlay() {
    // hide and disable the rest of the site while locked
    ['.skip-link', '.app-header', '.demo-banner', '#main', '#toasts'].forEach(function (sel) { var el = document.querySelector(sel); if (el) { el.inert = true; el.setAttribute('aria-hidden', 'true'); } });
    document.body.classList.add('is-locked');
    var o = document.createElement('div');
    o.className = 'lockdown'; o.id = 'lockdown';
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'ld-q');
    o.innerHTML =
      '<div class="ld-top"><span class="brand"><span class="brand-mark">' + I('bridge') + '</span><span class="brand-name"><span class="brand-latin">JISR</span></span></span>' +
        '<span class="ld-mode">' + I('lock', 'icon-sm') + t('ldMode') + '</span><span class="ld-warns" id="ld-warns">' + I('eye', 'icon-sm') + '<span>' + t('ldWarnCount', { n: 0, m: MODE.maxViolations - 1 }) + '</span></span></div>' +
      '<div class="ld-body" id="ld-body">' +
        '<div class="ld-meta"><span id="ld-count"></span><span class="ld-time" id="ld-time" role="timer"></span></div>' +
        '<div class="ld-bar"><span id="ld-bar"></span></div>' +
        '<h2 id="ld-q" class="ld-q">' + t('ldLoading') + '</h2>' +
        '<label for="ld-a" class="sr-only">' + t('ldAnswer') + '</label>' +
        '<textarea id="ld-a" class="ld-a" rows="7" spellcheck="true" autocomplete="off" autocorrect="off" placeholder="' + esc(t('ldPh')) + '" disabled></textarea>' +
        '<div class="ld-foot"><span class="ld-hint" id="ld-hint">' + I('x', 'icon-sm') + t('ldNoPaste') + '</span>' +
        '<button type="button" class="btn btn-accent btn-lg" id="ld-next" disabled>' + t('ldSubmit') + '</button></div>' +
        '<p class="sr-only" id="ld-live" aria-live="polite"></p>' +
      '</div>' +
      '<div class="ld-warning" id="ld-warning" hidden role="alertdialog" aria-labelledby="ld-w-t" aria-describedby="ld-w-d"><div class="ld-w-card">' +
        '<span class="ld-w-icon">' + I('alert') + '</span><h2 id="ld-w-t">' + t('ldWarnTitle') + '</h2><p id="ld-w-d"></p>' +
        '<button type="button" class="btn btn-accent btn-lg" id="ld-return">' + t('ldReturn') + '</button></div></div>';
    document.body.appendChild(o);
    var ta = o.querySelector('#ld-a');
    // count real typing (works with phone keyboards too); pasted or dropped text never counts
    ta.addEventListener('input', function (e) {
      var it = e.inputType || '';
      if (/FromPaste|FromDrop|FromYank/.test(it)) return;
      if (/^insert|^delete/.test(it)) LD.keys++;
    });
    o.querySelector('#ld-next').addEventListener('click', function () { submitAnswer(false); });
    o.querySelector('#ld-return').addEventListener('click', resumeFromWarning);
    o.addEventListener('keydown', function (e) {   // keep Tab inside the overlay
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(o.querySelectorAll('button,textarea'), function (x) { return !x.disabled && x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  function loadQuestion(i) {
    LD.i = i; LD.busy = true;
    var ta = document.getElementById('ld-a'), btn = document.getElementById('ld-next');
    ta.disabled = true; btn.disabled = true; ta.value = '';
    document.getElementById('ld-q').textContent = t('ldLoading');
    api('question', { sid: DC.session.sid, i: i }).then(function (q) {
      if (!LD || LD.ended) return;
      LD.busy = false; LD.keys = 0;
      LD.deadline = Date.now() + q.secondsLeft * 1000;
      document.getElementById('ld-count').textContent = t('ldCount', { i: i + 1, n: q.total });
      document.getElementById('ld-q').textContent = q.question;
      document.getElementById('ld-live').textContent = t('ldCount', { i: i + 1, n: q.total }) + '. ' + q.question;
      btn.textContent = i + 1 === q.total ? t('ldFinish') : t('ldSubmit');
      ta.disabled = false; btn.disabled = false;
      if (document.getElementById('ld-warning').hidden) ta.focus();
      LD.announced = {};
      clearInterval(LD.timer); LD.timer = setInterval(tick, 250); tick();
    }, lockError);
  }

  function tick() {
    if (!LD || LD.busy) return;
    var ms = Math.max(0, LD.deadline - Date.now()), total = MODE.seconds * 1000;
    if (DC.session && DC.session.seconds) total = DC.session.seconds * 1000;
    var sec = Math.ceil(ms / 1000), m = Math.floor(sec / 60), s = sec % 60;
    var el = document.getElementById('ld-time');
    el.innerHTML = I('clock', 'icon-sm') + '<span dir="ltr">' + m + ':' + (s < 10 ? '0' : '') + s + '</span>';
    el.classList.toggle('low', ms <= 20000);
    var bar = document.getElementById('ld-bar'); bar.style.width = (ms / total * 100) + '%'; bar.classList.toggle('low', ms <= 20000);
    [30, 10].forEach(function (n) { if (sec === n && !LD.announced[n]) { LD.announced[n] = 1; document.getElementById('ld-live').textContent = t('ldSecondsLeft', { n: n }); } });
    if (ms <= 0) submitAnswer(true);
  }

  function submitAnswer(auto) {
    if (!LD || LD.busy || LD.ended) return;
    LD.busy = true; clearInterval(LD.timer);
    var ta = document.getElementById('ld-a'), btn = document.getElementById('ld-next');
    ta.disabled = true; btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + t('saving');
    var i = LD.i;
    api('answer', { sid: DC.session.sid, i: i, answer: ta.value, keystrokes: LD.keys }).then(function (r) {
      if (!LD || LD.ended) return;
      if (r.done) finishCheck(); else loadQuestion(i + 1);
    }, lockError);
  }

  /* lock-down violations */
  function onLockEvent(e) {
    if (!LD || LD.ended || LD.grading) return;
    var type = null;
    if (e.type === 'visibilitychange' && document.visibilityState === 'hidden') type = 'left_tab';
    else if (e.type === 'blur') type = 'left_window';
    else if (e.type === 'fullscreenchange' && !document.fullscreenElement && LD.fs) type = 'exited_fullscreen';
    if (!type) return;
    var now = Date.now();
    if (now - LD.lastHard < 1500) return;   // one action can fire several events: count it once
    LD.lastHard = now;
    api('event', { sid: DC.session.sid, type: type }).then(function (r) {
      if (!LD || LD.ended) return;
      LD.warned = r.violations;
      document.querySelector('#ld-warns span').textContent = t('ldWarnCount', { n: Math.min(r.violations, r.max - 1), m: r.max - 1 });
      document.getElementById('ld-warns').classList.add('on');
      if (r.terminated) { endTerminated(); return; }
      var w = document.getElementById('ld-warning');
      w.querySelector('#ld-w-d').textContent = t('ldWarnBody', { n: r.violations, m: r.max - 1 });
      w.hidden = false;
      document.getElementById('ld-return').focus();
    }, function () { /* keep going; the server clock still applies */ });
  }
  function resumeFromWarning() {
    var w = document.getElementById('ld-warning');
    var done = function () { w.hidden = true; LD.lastHard = Date.now(); var ta = document.getElementById('ld-a'); if (ta && !ta.disabled) ta.focus(); };
    if (LD.fs && !document.fullscreenElement) document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(done, done);
    else done();
  }
  function onBlockedEvent(e) {
    if (!LD || LD.ended) return;
    e.preventDefault();
    if (e.type === 'paste' || e.type === 'drop') {
      var h = document.getElementById('ld-hint'); h.classList.add('flash'); setTimeout(function () { h.classList.remove('flash'); }, 1200);
      api('event', { sid: DC.session.sid, type: e.type }).catch(function () {});
    }
  }
  function onLockKey(e) {
    if (!LD || LD.ended) return;
    var k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'p', 's', 'f', 'u'].indexOf(k) > -1) { e.preventDefault(); if (k === 'v') onBlockedEvent({ type: 'paste', preventDefault: function () {} }); }
    if (k === 'f12' || k === 'printscreen') e.preventDefault();
  }
  function onUnload(e) { if (LD && !LD.ended) { e.preventDefault(); e.returnValue = ''; } }

  function endTerminated() {
    LD.busy = true; clearInterval(LD.timer);
    var ta = document.getElementById('ld-a');
    // save what was typed for the open question, then grade
    api('answer', { sid: DC.session.sid, i: LD.i, answer: ta ? ta.value : '', keystrokes: LD.keys }).catch(function () {}).then(finishCheck);
  }

  function finishCheck() {
    if (!LD) return;
    LD.grading = true; clearInterval(LD.timer);
    document.getElementById('ld-warning').hidden = true;
    document.getElementById('ld-body').innerHTML = '<div class="ld-grading" role="status"><span class="spinner" aria-hidden="true"></span><h2 id="ld-q">' + t('ldGrading') + '</h2><p>' + t('ldGradingSub') + '</p></div>';
    api('finish', { sid: DC.session.sid }).then(function (r) {
      r.filename = r.filename || (DC.file && DC.file.name) || '';
      r.title = r.title || (DC.session && DC.session.title) || '';
      teardown();
      S.dc.status = r.result; S.dc.result = r; S.dc.inProgress = false;
      log('verify', r.result === 'passed' ? 'evDc' : r.result === 'review' ? 'evDcReview' : 'evDcFail', 'bySystem', null);
      save();
      DC.phase = 'idle'; DC.file = null; DC.session = null;
      render(); refocus('#dc-h');
      window.JISR.toast(t(r.result === 'passed' ? 'dcPassed' : r.result === 'review' ? 'dcReview' : 'dcFailed'), r.result === 'failed' ? 'error' : null);
    }, gradeError);
  }

  // Answers are already saved on the server, so a grading failure must not cost the attempt.
  function gradeError(e) {
    if (!LD) return;
    LD.ended = true;   // stop recording lock-down events; the answers are in
    var body = document.getElementById('ld-body');
    body.innerHTML = '<div class="ld-grading" role="alert">' + I('alert', 'icon-lg') + '<h2 id="ld-q">' + t('ldGradeErr') + '</h2><p>' + esc((e && e.message) || t('dcErrGeneric')) + ' ' + t('ldGradeKept') + '</p>' +
      '<div class="row-gap" style="justify-content:center"><button type="button" class="btn btn-accent" id="ld-retry">' + I('refresh', 'icon-sm') + t('ldGradeRetry') + '</button><button type="button" class="btn btn-outline-light" id="ld-close">' + t('close') + '</button></div></div>';
    body.querySelector('#ld-retry').addEventListener('click', function () { LD.ended = false; LD.grading = false; finishCheck(); });
    body.querySelector('#ld-close').addEventListener('click', function () {
      teardown(); S.dc.inProgress = false; save();
      DC.phase = 'idle'; DC.session = null; DC.error = t('ldGradeClosed');
      render(); refocus('#dc-file');
    });
    body.querySelector('#ld-retry').focus();
  }

  function lockError(e) {
    if (!LD) return;
    clearInterval(LD.timer);
    var body = document.getElementById('ld-body');
    body.innerHTML = '<div class="ld-grading" role="alert">' + I('alert', 'icon-lg') + '<h2 id="ld-q">' + t('ldErrTitle') + '</h2><p>' + esc((e && e.message) || t('dcErrGeneric')) + '</p><button type="button" class="btn btn-accent" id="ld-close">' + t('close') + '</button></div>';
    LD.ended = true;
    body.querySelector('#ld-close').addEventListener('click', function () {
      teardown(); S.dc.inProgress = false; save();
      DC.phase = 'idle'; DC.session = null; DC.error = (e && e.message) || t('dcErrGeneric');
      render(); refocus('#dc-file');
    });
    body.querySelector('#ld-close').focus();
  }

  function teardown() {
    if (!LD) return;
    LD.ended = true; clearInterval(LD.timer);
    ['visibilitychange', 'fullscreenchange'].forEach(function (ev) { document.removeEventListener(ev, onLockEvent); });
    window.removeEventListener('blur', onLockEvent);
    window.removeEventListener('beforeunload', onUnload);
    ['copy', 'cut', 'paste', 'drop', 'contextmenu', 'dragstart'].forEach(function (ev) { document.removeEventListener(ev, onBlockedEvent, true); });
    document.removeEventListener('keydown', onLockKey, true);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    var o = document.getElementById('lockdown'); if (o) o.remove();
    ['.skip-link', '.app-header', '.demo-banner', '#main', '#toasts'].forEach(function (sel) { var el = document.querySelector(sel); if (el) { el.inert = false; el.removeAttribute('aria-hidden'); } });
    document.body.classList.remove('is-locked');
    LD = null;
  }

  function portfolioCard() {
    var r = S.dc.result, verified = r && (S.dc.status === 'passed' || S.dc.status === 'review');
    var items = PORTFOLIO.map(function (p) {
      if (p.id === 'dcf' && verified) return { type: 'legacy', title: { en: r.title || r.filename, ar: r.title || r.filename },
        proof: S.dc.status === 'passed' ? { en: 'Defense Check passed' + (r.score ? ' · ' + r.score + '/100' : ''), ar: 'اجتاز فحص الدفاع' + (r.score ? ' · ' + r.score + '/100' : '') } : { en: 'Defense Check done', ar: 'اكتمل فحص الدفاع' },
        waiting: S.dc.status === 'review' };
      var proof = p.id === 'dcf' ? { en: 'Upload it to the Defense Check to verify', ar: 'ارفعه إلى فحص الدفاع لتوثيقه' } : p.proof;
      return { type: p.type, title: p.title, proof: proof };
    });
    if (S.sprint.status === 'approved') items.unshift({ type: 'native', title: { en: 'Cash-flow forecasting sprint', ar: 'مشروع التنبؤ بالتدفقات النقدية' }, proof: { en: 'Mentor approved · just now', ar: 'اعتمده المرشد · الآن' } });
    else items.push({ type: 'native', title: { en: 'Cash-flow forecasting sprint', ar: 'مشروع التنبؤ بالتدفقات النقدية' }, proof: { en: S.sprint.status === 'changes' ? 'Mentor asked for changes' : 'Submitted', ar: S.sprint.status === 'changes' ? 'طلب المرشد تعديلات' : 'تم التقديم' }, pending: true, waiting: true });

    var shown = items.filter(function (x) { return UI.pf === 'all' || x.type === UI.pf; });
    var h = '<section class="card" aria-labelledby="pf-h"><div class="card-head"><h2 id="pf-h">' + t('pfTitle') + '</h2></div>' +
      '<div class="seg" role="group" aria-label="' + esc(t('pfTitle')) + '">' +
      [['all', t('pfAll')], ['legacy', t('legacy')], ['native', t('native')]].map(function (f) {
        return '<button type="button" aria-pressed="' + (UI.pf === f[0]) + '" data-act="pf" data-arg="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div>';
    if (!shown.length) h += '<div class="empty"><p>' + t('pfEmpty') + '</p></div>';
    else h += '<ul class="rows" role="list">' + shown.map(function (x) {
      return '<li class="row"><span class="badge badge-' + x.type + '">' + I(x.type === 'legacy' ? 'history' : 'sparkle') + t(x.type) + '</span>' +
        '<div class="grow"><span class="title">' + esc(L(x.title)) + '</span><span class="meta">' + (x.waiting ? I('clock', 'icon-sm').replace('class="icon', 'style="display:inline;vertical-align:-3px;margin-inline-end:4px" class="icon') + t('pfPending') + ' · ' : '') + esc(L(x.proof)) + '</span></div></li>';
    }).join('') + '</ul>';
    h += '<div class="legend"><span>' + '<span class="badge badge-legacy">' + I('history') + t('legacy') + '</span>' + t('pfLegacyDesc').replace(/^[^=]+=\s*/, '') + '</span><span><span class="badge badge-native">' + I('sparkle') + t('native') + '</span>' + t('pfNativeDesc').replace(/^[^=]+=\s*/, '') + '</span></div>';
    return h + '</section>';
  }

  function vaultCard() {
    return '<section class="card dark" aria-labelledby="vt-h"><div class="card-head"><h2 id="vt-h">' + t('vaultTitle') + '</h2>' + I('vault') + '</div>' +
      '<div><strong>' + esc(lang() === 'ar' ? 'صمام ري موفّر للمياه لمزارع النخيل' : 'Low-water date-palm irrigation valve') + '</strong></div>' +
      '<div class="vault-meta"><div>' + I('calendar', 'icon-sm') + t('vaultStamped', { date: when('2026-10-12T00:00:00') }) + '</div><div>' + I('hash', 'icon-sm') + '<code>a91f…3c0e</code></div></div>' +
      (S.nda ? '<div class="success-box" role="status"><strong>' + I('unlock') + t('ipOpen') + '</strong><p>' + t('vaultSigned') + '</p></div>'
             : '<div class="locked">' + I('lock') + '<p>' + t('vaultWaiting') + '</p></div>') + '</section>';
  }

  function ventureCard() {
    var rel = released();
    return '<section class="card" aria-labelledby="vn-h"><div class="card-head"><h2 id="vn-h">' + t('ventureTitle') + '</h2></div><p class="card-sub">' + t('ventureSub') + '</p>' +
      stagesHtml() + '<div class="money"><span class="lbl">' + t('escReleased') + '</span><strong>' + money(rel) + ' <span class="small muted">/ ' + money(SAFEBOX) + '</span></strong></div></section>';
  }

  function squadCard() {
    var team = [
      { i: 'LA', name: { en: 'Layla A. (' + t('you') + ')', ar: 'ليلى أ. (' + t('you') + ')' }, role: S.track === 'inv' ? { en: 'Inventor', ar: 'مخترعة' } : { en: 'Founder · finance', ar: 'مؤسسة · مالية' } },
      { i: 'HS', name: { en: 'Hessa S.', ar: 'حصة س.' }, role: { en: 'Founder · engineering', ar: 'مؤسسة · هندسة' } }
    ];
    var sugg = PEOPLE.filter(function (p) { return p.track === 'spec' && p.id !== 'la'; }).slice(0, 3);
    var h = '<section class="card" aria-labelledby="sq-h"><div class="card-head"><h2 id="sq-h">' + t('squadTitle') + '</h2>' + I('users') + '</div><p class="card-sub">' + t('squadSub') + '</p>' +
      '<div><p class="small muted" style="margin-bottom:8px">' + t('squadTeam') + '</p><div class="row-gap">' + team.map(function (m) {
        return '<span class="row" style="padding:8px 12px"><span class="avatar sm" aria-hidden="true">' + m.i + '</span><span class="grow"><span class="title">' + esc(L(m.name)) + '</span><span class="meta">' + esc(L(m.role)) + '</span></span></span>';
      }).join('') + '</div></div>' +
      '<div><p class="small muted" style="margin-bottom:8px">' + t('squadSuggest') + '</p><ul class="rows" role="list">' + sugg.map(function (p) {
        var inv = !!S.squad[p.id];
        return '<li class="row wrap-sm"><span class="avatar sm" aria-hidden="true">' + p.i + '</span><div class="grow"><span class="title">' + esc(L(p.name)) + '</span><span class="meta">' + esc(L(p.role)) + ' · ' + t('tTrackScore', { n: p.score }) + '</span></div>' +
          '<div class="row-actions">' + (inv
            ? '<span class="badge badge-verified">' + I('check') + t('squadInvited') + '</span><button type="button" class="btn btn-ghost btn-sm" data-act="squad" data-arg="' + p.id + '">' + t('squadCancel') + '<span class="sr-only">: ' + esc(L(p.name)) + '</span></button>'
            : '<button type="button" class="btn btn-outline btn-sm" data-act="squad" data-arg="' + p.id + '">' + I('user-plus', 'icon-sm') + t('squadInvite') + '<span class="sr-only"> ' + esc(L(p.name)) + '</span></button>') + '</div></li>';
      }).join('') + '</ul></div></section>';
    return h;
  }

  /* ================================================================== BUSINESS */
  function renderBusiness() {
    var n = Object.keys(S.shortlist).filter(function (k) { return S.shortlist[k]; }).length;
    var h = pageHead(t('bKicker'), t('bTitle'), '<span class="badge badge-verified">' + I('shield') + t('kybVerified') + '</span>');
    h += '<div class="seg" role="tablist" aria-label="' + esc(t('bTitle')) + '" style="margin-bottom:20px;max-width:560px">' +
      [['find', t('bTabFind'), 'search'], ['short', t('bTabShort'), 'bookmark'], ['deals', t('bTabDeals'), 'lock']].map(function (x) {
        var sel = UI.bizTab === x[0];
        return '<button type="button" role="tab" id="tab-' + x[0] + '" aria-controls="panel-biz" aria-selected="' + sel + '" tabindex="' + (sel ? 0 : -1) + '" data-act="biztab" data-arg="' + x[0] + '">' + I(x[2], 'icon-sm') + x[1] + (x[0] === 'short' && n ? '<span class="count">' + n + '</span>' : '') + '</button>';
      }).join('') + '</div><div id="panel-biz" role="tabpanel" aria-labelledby="tab-' + UI.bizTab + '">';

    if (UI.bizTab === 'find') h += findPanel();
    else if (UI.bizTab === 'short') h += shortPanel();
    else h += dealsPanel();
    return h + '</div>';
  }

  function findPanel() {
    var opt = function (v, label, cur) { return '<option value="' + v + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + label + '</option>'; };
    return '<section class="card" aria-label="' + esc(t('bTabFind')) + '"><div class="filters">' +
      '<div class="search-wrap"><label for="q" class="sr-only">' + t('bSearch') + '</label>' + I('search') + '<input id="q" class="input" type="search" autocomplete="off" placeholder="' + esc(t('bSearch')) + '" value="' + esc(UI.q) + '" data-filter="q"></div>' +
      '<div class="filter-row">' +
      '<div class="field"><label for="f-track">' + t('bTrack') + '</label><select id="f-track" class="select" data-filter="fTrack">' + opt('all', t('bAllTracks'), UI.fTrack) + TRACKS.map(function (x) { return opt(x.id, esc(L(x.short)), UI.fTrack); }).join('') + '</select></div>' +
      '<div class="field"><label for="f-min">' + t('bMin') + '</label><select id="f-min" class="select" data-filter="fMin">' + opt(0, t('bAny'), UI.fMin) + [50, 60, 70, 80].map(function (v) { return opt(v, v + '+', UI.fMin); }).join('') + '</select></div>' +
      '<div class="field"><label for="f-sort">' + t('bSort') + '</label><select id="f-sort" class="select" data-filter="sort">' + opt('score', t('bSortScore'), UI.sort) + opt('proof', t('bSortProof'), UI.sort) + opt('name', t('bSortName'), UI.sort) + '</select></div>' +
      '</div><div class="chips" role="group" aria-label="Filters">' +
      [['native', t('bChipNative')], ['bi', t('bChipBi')], ['uae', t('bChipUae')]].map(function (c) {
        return '<button type="button" class="chip" aria-pressed="' + UI.chips[c[0]] + '" data-act="chip" data-arg="' + c[0] + '">' + I('check') + c[1] + '</button>';
      }).join('') + '</div></div></section>' +
      '<div style="margin-top:20px" class="stack"><div class="results-bar" id="results-bar" aria-live="polite"></div><div id="results"></div></div>';
  }

  function filtered() {
    var q = UI.q.trim().toLowerCase();
    var list = PEOPLE.filter(function (p) {
      if (UI.fTrack !== 'all' && p.track !== UI.fTrack) return false;
      if (p.score < Number(UI.fMin)) return false;
      if (UI.chips.native && !p.native) return false;
      if (UI.chips.bi && !(p.langs.indexOf('ar') > -1 && p.langs.indexOf('en') > -1)) return false;
      if (UI.chips.uae && !p.uae) return false;
      if (q) {
        var hay = [p.name.en, p.name.ar, p.role.en, p.role.ar, p.city.en, p.city.ar, p.about.en, p.about.ar].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      if (UI.sort === 'name') return L(a.name).localeCompare(L(b.name), lang());
      if (UI.sort === 'proof') return (b.legacy + b.native) - (a.legacy + a.native) || b.score - a.score;
      return b.score - a.score;
    });
    return list;
  }
  function filtersActive() { return UI.q || UI.fTrack !== 'all' || Number(UI.fMin) > 0 || UI.chips.native || UI.chips.bi || UI.chips.uae; }

  function renderResults() {
    var box = document.getElementById('results'), bar = document.getElementById('results-bar');
    if (!box) return;
    var list = filtered();
    bar.innerHTML = '<span><strong>' + (list.length === 1 ? t('bResult1') : t('bResults', { n: list.length })) + '</strong></span>' +
      (filtersActive() ? '<button type="button" class="btn btn-ghost btn-sm" data-act="clear">' + I('x', 'icon-sm') + t('bClear') + '</button>' : '');
    if (!list.length) {
      box.innerHTML = '<div class="empty"><span class="ei">' + I('search') + '</span><h3>' + t('bNone') + '</h3><p>' + t('bNoneBody') + '</p><button type="button" class="btn btn-outline" data-act="clear">' + t('bClear') + '</button></div>';
      return;
    }
    box.innerHTML = '<ul class="cand-grid" role="list">' + list.map(candCard).join('') + '</ul>';
  }

  function personLangs(p) { return p.langs.map(function (l) { return t(l === 'ar' ? 'langAr' : 'langEn'); }).join(' · '); }

  function candCard(p) {
    var on = !!S.shortlist[p.id];
    var tr = TRACKS.find(function (x) { return x.id === p.track; });
    return '<li class="cand"><div class="person"><span class="avatar" aria-hidden="true">' + p.i + '</span><div class="person-meta"><span class="person-name">' + esc(L(p.name)) + '</span><span class="person-role">' + esc(L(p.role)) + '</span></div>' +
      '<div class="score" aria-label="' + esc(t('rsTitle')) + ' ' + p.score + '"><strong>' + p.score + '</strong><span>' + esc(L(tr.short)) + '</span></div></div>' +
      '<div class="tags">' + (p.legacy ? '<span class="badge badge-legacy">' + I('history') + t('bLegacyN', { n: p.legacy }) + '</span>' : '') + (p.native ? '<span class="badge badge-native">' + I('sparkle') + t('bNativeN', { n: p.native }) + '</span>' : '') + '</div>' +
      '<div class="facts"><span>' + I('pin') + esc(L(p.city)) + '</span><span>' + I('lang') + personLangs(p) + '</span></div>' +
      '<div class="actions"><button type="button" class="btn btn-outline btn-sm" data-act="profile" data-arg="' + p.id + '">' + t('bProfile') + '<span class="sr-only">: ' + esc(L(p.name)) + '</span></button>' +
      '<button type="button" class="btn btn-outline btn-sm btn-shortlist" aria-pressed="' + on + '" data-act="shortlist" data-arg="' + p.id + '">' + I(on ? 'check' : 'bookmark', 'icon-sm') + (on ? t('bAdded') : t('bAdd')) + '<span class="sr-only">: ' + esc(L(p.name)) + '</span></button></div></li>';
  }

  function shortPanel() {
    var list = PEOPLE.filter(function (p) { return S.shortlist[p.id]; }).sort(function (a, b) { return b.score - a.score; });
    if (!list.length) return '<div class="empty"><span class="ei">' + I('bookmark') + '</span><h3>' + t('bShortEmpty') + '</h3><p>' + t('bShortEmptyBody') + '</p><button type="button" class="btn btn-primary" data-act="biztab" data-arg="find">' + I('search', 'icon-sm') + t('bTabFind') + '</button></div>';
    return '<section class="card" aria-labelledby="sl-h"><div class="card-head"><h2 id="sl-h">' + t('bTabShort') + ' (' + list.length + ')</h2><span class="hint">' + t('bShortHint') + '</span></div><ul class="rows" role="list">' +
      list.map(function (p) {
        var tr = TRACKS.find(function (x) { return x.id === p.track; });
        return '<li class="row wrap-sm"><span class="avatar sm" aria-hidden="true">' + p.i + '</span><div class="grow"><span class="title">' + esc(L(p.name)) + ' · <span style="color:var(--teal-700)">' + p.score + '</span></span><span class="meta">' + esc(L(p.role)) + ' · ' + esc(L(tr.short)) + ' · ' + esc(L(p.city)) + '</span></div>' +
          '<div class="row-actions"><button type="button" class="btn btn-outline btn-sm" data-act="profile" data-arg="' + p.id + '">' + t('bProfile') + '<span class="sr-only">: ' + esc(L(p.name)) + '</span></button>' +
          '<button type="button" class="btn btn-danger-ghost btn-sm" data-act="shortlist" data-arg="' + p.id + '">' + I('trash', 'icon-sm') + t('bRemove') + '<span class="sr-only">: ' + esc(L(p.name)) + '</span></button></div></li>';
      }).join('') + '</ul></section>';
  }

  function stagesHtml() {
    return '<div class="stages">' + STAGES.map(function (x, i) {
      var st = i < S.escrow.stage ? 'released' : i === S.escrow.stage ? (S.escrow.changes ? 'changes' : 'current') : 'locked';
      var label = { released: t('stReleased'), current: t('stAwaiting'), changes: t('stChanges'), locked: t('stLocked') }[st];
      var ic = { released: 'check-circle', current: 'clock', changes: 'edit', locked: 'lock' }[st];
      return '<div class="stage ' + st + '" style="flex:' + x.pct + ' 1 0"><span class="bar"></span><span class="sl">' + x.pct + '% ' + t(x.key) + '</span><span class="ss">' + I(ic) + label + '</span></div>';
    }).join('') + '</div>';
  }

  function dealsPanel() {
    var rel = released();
    var h = '<div class="grid-2">';
    h += '<section class="card" aria-labelledby="es-h"><div class="card-head"><h2 id="es-h">' + t('escTitle') + '</h2><span class="badge badge-neutral">' + money(SAFEBOX) + ' ' + t('escInBox') + '</span></div>' +
      '<p class="card-sub">' + t('escSub') + '</p>' + stagesHtml() +
      '<div class="money"><span class="lbl">' + t('escReleased') + '</span><strong>' + money(rel) + ' <span class="small muted">/ ' + money(SAFEBOX) + '</span></strong></div>' +
      '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(rel / SAFEBOX * 100) + '" aria-label="' + esc(t('escReleased')) + '"><span style="width:' + (rel / SAFEBOX * 100) + '%"></span></div>' +
      (S.escrow.stage < 3 ? '<div class="next-step">' + I('info') + '<div>' + t('escNote') + ' <a href="#mentor">' + t('escGoMentor') + '</a></div></div>' : '') + '</section>';

    h += '<section class="card dark" aria-labelledby="ip-h"><div class="card-head"><h2 id="ip-h">' + t('ipTitle') + '</h2></div>' +
      '<div class="vault-meta"><div>' + I('bulb', 'icon-sm') + t('ipMeta') + '</div><div>' + I('calendar', 'icon-sm') + t('vaultStamped', { date: when('2026-10-12T00:00:00') }) + '</div><div>' + I('hash', 'icon-sm') + '<code>a91f…3c0e</code></div></div>' +
      '<p>' + t('ipSummary') + '</p>';
    if (!S.nda) h += '<div class="locked">' + I('lock') + '<p>' + t('ipLocked') + '</p><button type="button" class="btn btn-accent" style="justify-self:start" data-act="nda">' + I('unlock', 'icon-sm') + t('ipSign') + '</button></div>';
    else h += '<div class="success-box" role="status"><strong>' + I('unlock') + t('ipOpen') + '</strong><p>' + t('ipOpenBody') + '</p></div>' +
      '<div class="deal-files">' + ['Blueprints_v3.pdf', 'Field_test_data.xlsx', 'Licence_terms.pdf'].map(function (f) { return '<div>' + I('file', 'icon-sm') + '<span dir="ltr">' + f + '</span></div>'; }).join('') + '</div><p class="small">' + t('ipFiles') + '</p>';
    return h + '</section></div>';
  }

  /* ================================================================== MENTOR */
  function renderMentor() {
    var pending = pendingCount();
    var h = pageHead(t('mKicker'), t('mHello'));
    h += '<div class="stat-tiles"><div class="stat-tile' + (pending ? ' hl' : '') + '"><strong>' + pending + '</strong><span>' + t('mWaiting') + '</span></div>' +
      '<div class="stat-tile"><strong>' + S.reviewed + '</strong><span>' + t('mReviewed') + '</span></div>' +
      '<div class="stat-tile"><strong>' + SESSIONS.length + '</strong><span>' + t('mSessions') + '</span></div></div>';

    h += '<div class="grid-main"><div class="stack"><section aria-labelledby="q-h" class="stack" style="gap:14px"><div class="card-head"><h2 id="q-h" style="font-size:20px">' + t('mQueue') + '</h2><span class="hint">' + t('mQueueHint') + '</span></div>';

    var items = '';
    if (S.escrow.stage < 3) {
      var st = STAGES[S.escrow.stage], stName = t(st.key);
      items += '<article class="review' + (S.escrow.changes ? '' : ' urgent') + '"><div class="review-top"><span class="badge badge-warn">' + I('coins') + t('mEscrowKind', { share: st.pct + '% · ' + money(st.amount) }) + '</span><span class="small muted">' + t('mSubmitted', { d: when('2026-11-19T00:00:00') }) + '</span></div>' +
        '<h3>' + t('mEscrowTitle', { stage: stName }) + '</h3>' +
        '<div class="evidence" aria-label="' + esc(t('mEvidence')) + '">' + st.evidence.map(function (e) { return '<div>' + I('file') + '<span>' + esc(L(e)) + '</span></div>'; }).join('') + '</div>';
      if (S.escrow.changes) items += '<div class="feedback"><strong>' + t('mYourNote') + '</strong>' + esc(S.escrow.changes) + '</div><p class="small muted">' + I('clock', 'icon-sm').replace('class="icon', 'style="display:inline;vertical-align:-3px;margin-inline-end:4px" class="icon') + t('mWaitingFor') + '</p>' +
        '<div class="review-actions"><button type="button" class="btn btn-outline" data-act="resub" data-arg="escrow">' + I('refresh', 'icon-sm') + t('mSimResubmit') + '</button></div>';
      else items += '<div class="review-actions"><button type="button" class="btn btn-primary" data-act="approve-escrow">' + I('check', 'icon-sm') + t('mApproveRelease', { amt: money(st.amount) }) + '</button><button type="button" class="btn btn-outline" data-act="changes" data-arg="escrow">' + I('edit', 'icon-sm') + t('mChanges') + '</button></div>';
      items += '</article>';
    }
    if (S.sprint.status !== 'approved') {
      items += '<article class="review"><div class="review-top"><span class="badge badge-native">' + I('sparkle') + t('mSprintKind') + '</span><span class="small muted">' + t('mSubmitted', { d: when('2026-11-20T00:00:00') }) + '</span></div>' +
        '<h3>' + t('mSprintTitle') + '</h3><p class="small muted">' + t('mSprintBody') + '</p>' +
        '<div class="evidence">' + [{ en: '12-month cash-flow model (.xlsx)', ar: 'نموذج تدفقات نقدية لـ12 شهرًا (.xlsx)' }, { en: 'Client brief and acceptance note', ar: 'موجز العميل ومذكرة القبول' }].map(function (e) { return '<div>' + I('file') + '<span>' + esc(L(e)) + '</span></div>'; }).join('') + '</div>';
      if (S.sprint.status === 'changes') items += '<div class="feedback"><strong>' + t('mYourNote') + '</strong>' + esc(S.sprint.note) + '</div><div class="review-actions"><button type="button" class="btn btn-outline" data-act="resub" data-arg="sprint">' + I('refresh', 'icon-sm') + t('mSimResubmit') + '</button></div>';
      else items += '<div class="review-actions"><button type="button" class="btn btn-primary" data-act="approve-sprint">' + I('check', 'icon-sm') + t('mApprove') + '</button><button type="button" class="btn btn-outline" data-act="changes" data-arg="sprint">' + I('edit', 'icon-sm') + t('mChanges') + '</button></div>';
      items += '</article>';
    }
    if (S.dc.status === 'review' && S.dc.result) {
      var dr = S.dc.result;
      items += '<article class="review urgent"><div class="review-top"><span class="badge badge-legacy">' + I('history') + t('mDcKind') + '</span><span class="small muted">' + t('mDcScore', { s: dr.score }) + '</span></div>' +
        '<h3>' + t('mDcTitle', { title: esc(dr.title || dr.filename || '') }) + '</h3><p class="small muted">' + (dr.reason === 'integrity' ? t('mDcWhyIntegrity', { list: esc(flagText(dr.integrity.violations.concat(dr.integrity.flags)) || '—') }) : t('mDcWhyBorder')) + '</p>' +
        '<div class="evidence">' + (dr.questions || []).map(function (q) { return '<div>' + I('message') + '<span>' + esc(q.question) + ' — <strong>' + q.score + '/10</strong></span></div>'; }).join('') + '</div>' +
        '<div class="review-actions"><button type="button" class="btn btn-primary" data-act="dc-approve">' + I('check', 'icon-sm') + t('mDcApprove') + '</button><button type="button" class="btn btn-outline" data-act="dc-reject">' + I('x', 'icon-sm') + t('mDcReject') + '</button></div></article>';
    }
    h += items || '<div class="empty"><span class="ei">' + I('check-circle') + '</span><h3>' + t('mAllDone') + '</h3><p>' + t('mAllDoneBody') + '</p></div>';
    h += '</section>';

    // history
    var hist = S.log.filter(function (e) { return e.by === 'byHamad'; }).slice().reverse().slice(0, 5);
    h += '<section class="card" aria-labelledby="hi-h"><div class="card-head"><h2 id="hi-h">' + t('mHistory') + '</h2></div>' +
      (hist.length ? '<ul class="rows" role="list">' + hist.map(function (e) {
        return '<li class="row"><span class="avatar sm ' + (e.type === 'escrow' ? 'gold' : '') + '" aria-hidden="true">' + I(e.type === 'escrow' ? 'coins' : 'sparkle', 'icon-sm') + '</span><div class="grow"><span class="title">' + esc(evText(e)) + '</span><span class="meta">' + when(e.at, true) + (e.amt ? ' · ' + money(e.amt) : '') + '</span></div></li>';
      }).join('') + '</ul>' : '<p class="muted small">' + t('mHistoryEmpty') + '</p>') + '</section>';

    h += '</div><div class="stack"><section class="card" aria-labelledby="ss-h"><div class="card-head"><h2 id="ss-h">' + t('mUpcoming') + '</h2>' + I('calendar') + '</div><ul class="sessions" role="list">' +
      SESSIONS.map(function (s) {
        var d = new Date(s.d);
        var day = d.getDate();
        var mon = new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { month: 'short' }).format(d);
        var wd = new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(d);
        return '<li class="session"><span class="date-chip"><b>' + day + '</b><small>' + mon + '</small></span><div><div class="title">' + esc(L(s.title)) + '</div><div class="meta"><span>' + I('clock') + wd + '</span><span>' + I('pin') + esc(L(s.where)) + '</span></div><div class="meta"><span>' + I('users') + esc(L(s.meta)) + '</span></div></div></li>';
      }).join('') + '</ul></section></div></div>';
    return h;
  }

  /* ================================================================== ADMIN */
  function evText(e) {
    var p = {};
    if (e.p && e.p.stage) p.stage = t(e.p.stage);
    return t(e.ev, p);
  }
  function evAmount(e) {
    if (e.ev === 'evNda') return t('feeHeld', { amt: money(NDA_FEE) });
    return e.amt == null ? '—' : money(e.amt);
  }

  function renderAdmin() {
    var rel = released();
    var badges = 3610 + (S.dc.status === 'passed' ? 1 : 0) + (S.sprint.status === 'approved' ? 1 : 0);
    var h = pageHead(t('aKicker'), t('aTitle'), '<span class="badge badge-neutral">' + t('sample') + '</span>');
    h += '<div class="kpis">' +
      kpi('users', t('aK1'), '1,240', t('aK1n')) +
      kpi('sparkle', t('aK2'), badges.toLocaleString('en-US'), t('aK2n')) +
      kpi('chart', t('aK3'), '58%', t('aK3n')) +
      kpi('coins', t('aK4'), money(rel), t('aK4n', { total: money(SAFEBOX) })) + '</div>';

    var stage4 = Math.round(S.escrow.stage / 3 * 100);
    var prog = [['aS1', 'aM1', '15%', 100], ['aS2', 'aM2', '35%', 70], ['aS3', 'aM3', '25%', 25], ['aS4', 'aM4', '25%', stage4]];
    h += '<div class="grid-main"><section class="card" aria-labelledby="ps-h"><div class="card-head"><h2 id="ps-h">' + t('aStages') + '</h2><span class="hint">' + t('aStagesHint') + '</span></div><div class="prog-list">' +
      prog.map(function (p) {
        var cls = p[3] >= 100 ? 'done' : p[3] > 0 ? 'active' : '';
        var status = p[3] >= 100 ? t('aDone') : p[3] > 0 ? t('aActive') : t('aUpcoming');
        return '<div class="prog ' + cls + '"><div class="prog-top"><b>' + t(p[0]) + '</b><span>' + status + ' · ' + p[3] + '%</span></div>' +
          '<div class="progress" role="progressbar" aria-label="' + esc(t(p[0])) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p[3] + '"><span style="width:' + p[3] + '%"></span></div>' +
          '<div class="prog-top"><span>' + t(p[1]) + '</span><span>' + t('aBudget', { b: p[2] }) + '</span></div></div>';
      }).join('') + '</div></section>';

    h += '<section class="card" aria-labelledby="sb-h"><div class="card-head"><h2 id="sb-h">' + t('aSafe') + '</h2></div><p class="card-sub">' + t('escSub') + '</p>' + stagesHtml() +
      '<div class="money"><span class="lbl">' + t('escReleased') + '</span><strong>' + money(rel) + '</strong></div></section></div>';

    // ledger
    var rows = S.log.slice().reverse().filter(function (e) { return UI.ledger === 'all' || e.type === UI.ledger; });
    h += '<section class="card" style="margin-top:24px" aria-labelledby="lg-h"><div class="card-head"><div><h2 id="lg-h">' + t('aLedger') + '</h2><p class="small muted">' + t('aLedgerHint') + '</p></div>' +
      '<button type="button" class="btn btn-outline btn-sm" data-act="csv">' + I('download', 'icon-sm') + t('aExport') + '</button></div>' +
      '<div class="seg" role="group" aria-label="' + esc(t('aLedger')) + '" style="max-width:520px">' +
      [['all', 'aFAll'], ['escrow', 'aFEscrow'], ['deals', 'aFDeals'], ['verify', 'aFVerify']].map(function (f) {
        return '<button type="button" aria-pressed="' + (UI.ledger === f[0]) + '" data-act="ledger" data-arg="' + f[0] + '">' + t(f[1]) + '</button>';
      }).join('') + '</div>';
    if (!rows.length) h += '<p class="muted small">' + t('aNoRows') + '</p>';
    else h += '<div class="table-wrap"><table class="table"><caption class="sr-only">' + t('aLedger') + '</caption><thead><tr><th scope="col">' + t('aTime') + '</th><th scope="col">' + t('aEvent') + '</th><th scope="col">' + t('aBy') + '</th><th scope="col" class="amt">' + t('aAmount') + '</th></tr></thead><tbody>' +
      rows.map(function (e) {
        return '<tr><td class="time">' + when(e.at, true) + '</td><td class="ev">' + esc(evText(e)) + '</td><td class="muted">' + t(e.by) + '</td><td class="amt">' + evAmount(e) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    return h + '</section>';
  }
  function kpi(ic, label, val, note) { return '<div class="kpi"><span class="kl">' + I(ic) + label + '</span><strong>' + val + '</strong><span class="kn">' + note + '</span></div>'; }

  function exportCsv() {
    var rows = [[t('aTime'), t('aEvent'), t('aBy'), t('aAmount')]].concat(S.log.slice().reverse().map(function (e) {
      return [new Date(e.at).toISOString(), evText(e), t(e.by), evAmount(e)];
    }));
    var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    var a = document.createElement('a'); a.href = url; a.download = 'jisr-escrow-ledger-demo.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    window.JISR.toast(t('aExportToast'));
  }

  /* ================================================================== MODAL */
  var modalReturn = null;
  function openModal(o) {
    closeModal(true);
    modalReturn = document.activeElement;
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-backdrop" data-modal-bg><div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title"' + (o.sub ? ' aria-describedby="m-sub"' : '') + '>' +
      '<div class="modal-head"><div><h2 id="m-title">' + o.title + '</h2>' + (o.sub ? '<p id="m-sub">' + o.sub + '</p>' : '') + '</div><button type="button" class="modal-close" data-modal-close aria-label="' + esc(t('close')) + '">' + I('x') + '</button></div>' +
      '<form class="modal-body" id="m-form" novalidate>' + o.body + '</form>' +
      '<div class="modal-foot">' + (o.cancel === false ? '' : '<button type="button" class="btn btn-outline" data-modal-close>' + (o.cancelLabel || t('cancel')) + '</button>') +
      (o.confirm ? '<button type="submit" form="m-form" class="btn ' + (o.confirmCls || 'btn-primary') + '" id="m-confirm">' + o.confirm + '</button>' : '') + '</div></div></div>';
    var bg = root.firstChild;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { bg.classList.add('open'); });
    var form = document.getElementById('m-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!o.onConfirm) return closeModal();
      var btn = document.getElementById('m-confirm');
      var res = o.onConfirm(form);
      if (res === false) return;
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + t('working'); }
      setTimeout(function () { closeModal(); if (typeof res === 'function') res(); }, 700);
    });
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-modal-close]')) closeModal(); });
    bg.addEventListener('keydown', trapKeys);
    var first = form.querySelector('input,textarea,select') || bg.querySelector('#m-confirm') || bg.querySelector('.modal-close');
    setTimeout(function () { first && first.focus(); }, 30);
  }
  function trapKeys(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(e.currentTarget.querySelectorAll('button,input,select,textarea,a[href]'), function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
  function closeModal(instant) {
    var root = document.getElementById('modal-root');
    if (!root.firstChild) return;
    var bg = root.firstChild;
    document.body.style.overflow = '';
    var done = function () { root.innerHTML = ''; };
    if (instant) done(); else { bg.classList.remove('open'); setTimeout(done, 180); }
    if (!instant && modalReturn && document.contains(modalReturn)) modalReturn.focus();
  }
  function fieldError(input, errEl, show) {
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
    errEl.hidden = !show;
  }

  /* ================================================================== ACTIONS */
  function refocus(sel) { var el = view.querySelector(sel); if (el) el.focus(); }

  var actions = {
    reset: function () {
      openModal({ title: t('resetTitle'), body: '<p class="muted">' + t('resetBody') + '</p>', confirm: t('resetBtn'), confirmCls: 'btn-dark',
        onConfirm: function () { return function () { try { localStorage.removeItem(STATE_KEY); } catch (e) {} S = initialState(); UI.bizTab = 'find'; UI.pf = 'all'; UI.ledger = 'all'; render(); window.JISR.toast(t('resetDone')); }; } });
    },
    track: function (id) { S.track = id; save(); history.replaceState(null, '', location.pathname + location.search + '#talent/' + id); render(); refocus('[data-act="track"][data-arg="' + id + '"]'); },
    pf: function (f) { UI.pf = f; render(); refocus('[data-act="pf"][data-arg="' + f + '"]'); },
    opp: function (id) {
      var o = OPPS[S.track].find(function (x) { return x.id === id; });
      var done = !!S.opps[id];
      openModal({ title: esc(L(o.title)), sub: esc(L(o.kind)) + ' · ' + esc(L(o.meta)),
        body: '<p>' + esc(L(o.body)) + '</p>' + (done ? '<div class="success-box light"><strong>' + I('check-circle') + esc(L(o.done)) + '</strong></div>' : '<p class="small muted">' + t('demoNoProcess') + '</p>'),
        confirm: done ? null : esc(L(o.cta)), cancelLabel: done ? t('close') : t('cancel'),
        onConfirm: function () { return function () { S.opps[id] = true; save(); render(); window.JISR.toast(t('oppDoneToast', { title: L(o.title), status: L(o.done) })); }; } });
    },
    'dc-analyse': analyse,
    'dc-lock': lockStart,
    'dc-reset': function () { DC.phase = 'idle'; DC.session = null; render(); refocus('#dc-file'); },
    'dc-again': function () { S.dc.status = 'idle'; S.dc.result = null; save(); DC.phase = 'idle'; DC.file = null; DC.error = ''; render(); refocus('#dc-file'); },
    'dc-approve': function () {
      S.dc.status = 'passed'; S.dc.result.mentor = true; S.reviewed++; log('verify', 'evDc', 'byHamad', null); save(); render();
      window.JISR.toast(t('dcMentorToastOk'));
    },
    'dc-reject': function () {
      S.dc.status = 'failed'; S.dc.result.reason = 'mentor'; S.reviewed++; log('verify', 'evDcFail', 'byHamad', null); save(); render();
      window.JISR.toast(t('dcMentorToastNo'));
    },
    attest: function () {
      openModal({ title: t('atTitle'), sub: t('atSub'),
        body: '<div class="field"><label for="at-email">' + t('atEmail') + '</label><input id="at-email" class="input" type="email" autocomplete="off" dir="ltr" aria-describedby="at-help at-err"><p class="help" id="at-help">' + t('atHelp') + '</p><p class="error-msg" id="at-err" hidden>' + I('alert') + t('atBad') + '</p></div><p class="small muted">' + t('demoNoProcess') + '</p>',
        confirm: t('atSend'),
        onConfirm: function (form) {
          var inp = form.querySelector('#at-email'), v = inp.value.trim();
          var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
          fieldError(inp, form.querySelector('#at-err'), !ok);
          if (!ok) { inp.focus(); return false; }
          return function () { S.dc.attest = v; save(); render(); window.JISR.toast(t('atToast')); };
        } });
    },
    squad: function (id) {
      var p = PEOPLE.find(function (x) { return x.id === id; });
      S.squad[id] = !S.squad[id]; save(); render();
      window.JISR.toast(t(S.squad[id] ? 'squadToast' : 'squadCancelToast', { name: L(p.name) }));
      refocus('[data-act="squad"][data-arg="' + id + '"]');
    },

    biztab: function (tab) { UI.bizTab = tab; render(); refocus('[data-act="biztab"][data-arg="' + tab + '"]'); },
    chip: function (k) { UI.chips[k] = !UI.chips[k]; var b = view.querySelector('[data-act="chip"][data-arg="' + k + '"]'); b.setAttribute('aria-pressed', UI.chips[k]); renderResults(); },
    clear: function () { UI.q = ''; UI.fTrack = 'all'; UI.fMin = 0; UI.chips = { native: false, bi: false, uae: false }; render(); refocus('#q'); },
    shortlist: function (id) {
      var p = PEOPLE.find(function (x) { return x.id === id; });
      S.shortlist[id] = !S.shortlist[id]; if (!S.shortlist[id]) delete S.shortlist[id]; save();
      window.JISR.toast(t(S.shortlist[id] ? 'bAddToast' : 'bRemoveToast', { name: L(p.name) }));
      // update count badge + the relevant area without losing filter focus
      var count = Object.keys(S.shortlist).length;
      var tabBtn = view.querySelector('[data-act="biztab"][data-arg="short"]');
      if (tabBtn) { var c = tabBtn.querySelector('.count'); if (count) { if (!c) { c = document.createElement('span'); c.className = 'count'; tabBtn.appendChild(c); } c.textContent = count; } else if (c) c.remove(); }
      if (UI.bizTab === 'find') { renderResults(); refocus('[data-act="shortlist"][data-arg="' + id + '"]'); }
      else { render(); var nxt = view.querySelector('[data-act="shortlist"]') || view.querySelector('[data-act="biztab"][data-arg="find"]'); if (nxt) nxt.focus(); }
    },
    profile: function (id) {
      var p = PEOPLE.find(function (x) { return x.id === id; });
      var tr = TRACKS.find(function (x) { return x.id === p.track; });
      var on = !!S.shortlist[id];
      openModal({ title: esc(L(p.name)), sub: esc(L(p.role)) + ' · ' + esc(L(p.city)),
        body: '<div class="score-row"><div class="ring" style="--val:' + p.score + ';--size:72px;--thick:8px;--ring-bg:var(--bg)" role="img" aria-label="' + esc(t('rsTitle')) + ' ' + p.score + '"><div class="ring-val"><strong>' + p.score + '</strong></div></div><div><strong>' + t('rsTitle') + '</strong><p class="small muted">' + esc(L(tr.label)) + ' · ' + t('lvl' + level(p.score)) + '</p></div></div>' +
          '<p>' + esc(L(p.about)) + '</p>' +
          '<div><p class="small muted" style="margin-bottom:8px;font-weight:600">' + t('bVerifiedWork') + '</p><ul class="rows" role="list">' + p.work.map(function (w) {
            return '<li class="row"><span class="badge badge-' + w[0] + '">' + I(w[0] === 'legacy' ? 'history' : 'sparkle') + t(w[0]) + '</span><span class="grow title">' + esc(L(w[1])) + '</span></li>';
          }).join('') + '</ul></div>' +
          '<dl class="kv"><dt>' + t('bTrackL') + '</dt><dd>' + esc(L(tr.label)) + '</dd><dt>' + t('bLocation') + '</dt><dd>' + esc(L(p.city)) + '</dd><dt>' + t('bLanguages') + '</dt><dd>' + personLangs(p) + '</dd></dl>',
        confirm: on ? t('bRemove') : t('bAdd'), confirmCls: on ? 'btn-outline' : 'btn-primary', cancelLabel: t('close'),
        onConfirm: function () { return function () { actions.shortlist(id); }; } });
    },
    nda: function () {
      openModal({ title: t('ndaTitle'), sub: t('ndaSub'),
        body: '<div><p class="small" style="font-weight:600;margin-bottom:8px">' + t('ndaTerms') + '</p><div class="evidence">' + ['ndaT1', 'ndaT2', 'ndaT3'].map(function (k) { return '<div>' + I('check') + '<span>' + t(k) + '</span></div>'; }).join('') + '</div></div>' +
          '<div class="money"><span class="lbl">' + t('ndaFee') + '</span><strong>' + money(NDA_FEE) + '</strong></div>' +
          '<div><label class="check"><input type="checkbox" id="nda-ok" aria-describedby="nda-err"><span>' + t('ndaAgree') + '</span></label><p class="error-msg mt-8" id="nda-err" hidden>' + I('alert') + t('ndaMust') + '</p></div>' +
          '<p class="note-box">' + I('info') + '<span>' + t('demoNoProcess') + '</span></p>',
        confirm: t('ndaConfirm'), confirmCls: 'btn-dark',
        onConfirm: function (form) {
          var cb = form.querySelector('#nda-ok');
          fieldError(cb, form.querySelector('#nda-err'), !cb.checked);
          if (!cb.checked) { cb.focus(); return false; }
          return function () { S.nda = true; log('deals', 'evNda', 'byGulf', NDA_FEE); save(); render(); window.JISR.toast(t('ndaToast')); };
        } });
    },

    'approve-escrow': function () {
      var st = STAGES[S.escrow.stage], name = t(st.key);
      openModal({ title: t('apTitle', { stage: name }), body: '<p>' + t('apBody', { amt: '<strong>' + money(st.amount) + '</strong>' }) + '</p><p class="note-box">' + I('alert') + '<span>' + t('apWarn') + '</span></p>',
        confirm: t('apConfirm'),
        onConfirm: function () { return function () {
          log('escrow', 'evRelease', 'byHamad', st.amount, { stage: st.key });
          S.escrow.stage = Math.min(3, S.escrow.stage + 1); S.escrow.changes = null; S.reviewed++; save(); render();
          window.JISR.toast(t('apToast', { amt: money(st.amount), stage: name }));
          var nx = view.querySelector('[data-act="approve-escrow"],[data-act="approve-sprint"]'); if (nx) nx.focus();
        }; } });
    },
    'approve-sprint': function () {
      openModal({ title: t('spTitle'), body: '<p>' + t('spBody') + '</p>', confirm: t('spConfirm'),
        onConfirm: function () { return function () {
          S.sprint = { status: 'approved', note: null }; S.reviewed++; log('verify', 'evSprint', 'byHamad', null); save(); render();
          window.JISR.toast(t('spToast'));
        }; } });
    },
    changes: function (which) {
      openModal({ title: t('rcTitle'), sub: t('rcSub'),
        body: '<div class="field"><label for="rc-note">' + t('rcLabel') + '</label><textarea id="rc-note" class="textarea" rows="4" placeholder="' + esc(t('rcPh')) + '" aria-describedby="rc-err"></textarea><p class="error-msg" id="rc-err" hidden>' + I('alert') + t('rcShort') + '</p></div>',
        confirm: t('rcSend'),
        onConfirm: function (form) {
          var ta = form.querySelector('#rc-note'), v = ta.value.trim();
          fieldError(ta, form.querySelector('#rc-err'), v.length < 10);
          if (v.length < 10) { ta.focus(); return false; }
          return function () {
            if (which === 'escrow') { S.escrow.changes = v; log('escrow', 'evChanges', 'byHamad', null, { stage: STAGES[S.escrow.stage].key }); }
            else { S.sprint = { status: 'changes', note: v }; log('verify', 'evSprintChanges', 'byHamad', null); }
            S.reviewed++; save(); render(); window.JISR.toast(t('rcToast'));
          };
        } });
    },
    resub: function (which) {
      if (which === 'escrow') S.escrow.changes = null; else S.sprint = { status: 'pending', note: null };
      save(); render(); window.JISR.toast(t('mResubToast'));
    },

    ledger: function (f) { UI.ledger = f; render(); refocus('[data-act="ledger"][data-arg="' + f + '"]'); },
    csv: exportCsv
  };

  /* ------------------------------------------------------------------ events */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !actions[b.dataset.act]) return;
    e.preventDefault();
    actions[b.dataset.act](b.dataset.arg);
  });

  view.addEventListener('submit', function (e) {
  });

  var debounce;
  view.addEventListener('input', function (e) {
    var el = e.target;
    if (el.dataset.filter === 'q') { UI.q = el.value; renderResults(); }
  });
  view.addEventListener('change', function (e) {
    if (e.target.id === 'dc-file') { pickFile(e.target.files && e.target.files[0]); return; }
    if (e.target.id === 'dc-ack') { DC.ack = e.target.checked; var er = document.getElementById('dc-ack-err'); if (er && DC.ack) { er.hidden = true; e.target.removeAttribute('aria-invalid'); } return; }
    var k = e.target.dataset.filter;
    if (k && k !== 'q') { UI[k] = e.target.value; renderResults(); }
  });

  // Arrow-key navigation inside tablists
  view.addEventListener('keydown', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (!tab || ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
    var tabs = Array.prototype.slice.call(tab.parentNode.querySelectorAll('[role="tab"]'));
    var i = tabs.indexOf(tab), rtl = document.documentElement.dir === 'rtl';
    var dir = e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    var n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + dir + tabs.length) % tabs.length;
    e.preventDefault(); tabs[n].click();
  });

  window.addEventListener('hashchange', function () { closeModal(true); render({ focus: true }); });
  document.addEventListener('jisr:lang', function () { render(); });
  window.addEventListener('storage', function (e) { if (e.key === STATE_KEY) { S = load(); render(); } });

  // reset button in banner needs an accessible name on small screens where its label is hidden
  document.addEventListener('DOMContentLoaded', function () {
    render();
  });
})();
