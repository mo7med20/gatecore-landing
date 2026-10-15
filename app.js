/* GateCore landing — interactions
   0. Theme (Light is the default; dark is an explicit, remembered choice)
   1. Navbar: frosted bar on scroll + accessible mobile drawer
   2. Scroll reveal
   3. Version pill -> roadmap
   4. Pricing annual/monthly toggle
   5. Trial modal (focus trap) + mailto hand-off
   6. Product showcase tabs (ARIA tab pattern)
*/
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* English remains in the HTML as the no-JS source; translations apply only
     to matching copy text nodes, leaving code and terminal markup untouched. */
  var AR = {
    'skip':'انتقل إلى المحتوى', 'nav.product':'المنتج', 'nav.pricing':'الأسعار', 'nav.roadmap':'خارطة الطريق', 'nav.docs':'التوثيق',
    'Skip to content':'انتقل إلى المحتوى', 'Product':'المنتج', 'Pricing':'الأسعار', 'Roadmap':'خارطة الطريق', 'Docs':'التوثيق',
    'Start Free Trial':'ابدأ التجربة المجانية', 'Now Available':'متاح الآن',
    'Purpose-built for fintech SREs · Healthcare IT · MSPs · Regulated Infrastructure':'مصمم لفرق التقنية المالية والرعاية الصحية وMSPs والقطاعات الخاضعة للتنظيم',
    'Built in Go. Runs on anything. Trusted where downtime is not an option.':'مبني بلغة Go، ويعمل على مختلف الأجهزة، حيث لا مجال للتوقف.',
    'The problem':'التحدي', 'Your infrastructure stack is held together with vendor contracts and SSH sessions.':'تعتمد بنية مؤسستك على عقود الموردين وجلسات SSH المتفرقة.',
    'Your rack today':'بنيتك اليوم', '6 vendors':'6 موردين', '6 support contracts':'6 عقود دعم', '1 binary':'ملف تنفيذي واحد',
    'Who it\'s for':'لمن صُمم', 'Proof':'ما يثبت ذلك', 'Get started':'ابدأ الآن',
    'Start with a free 30-day trial.':'ابدأ بتجربة مجانية لمدة 30 يومًا.', 'No card. No cloud. Just your hardware.':'من دون بطاقة دفع أو سحابة؛ على أجهزتك مباشرة.',
    'Contact GateCore Team':'تواصل مع فريق GateCore', 'Chat on WhatsApp':'تواصل عبر WhatsApp',
    'Unified on-prem infrastructure.':'بنية موحدة داخل مؤسستك.', 'Built in Go. Founded in Cairo.':'مبني بلغة Go. تأسس في القاهرة.',
    'About':'نبذة عنا', 'Features':'الميزات', 'Screenshots':'لقطات الشاشة', 'Documentation':'التوثيق', 'Support':'الدعم', 'Legal':'الشؤون القانونية',
    'Free 30-day trial':'تجربة مجانية لمدة 30 يومًا', 'Get the GateCore binary':'احصل على ملف GateCore التنفيذي',
    'Full feature access, no card. We\'ll send the zip and your Ed25519 trial license.':'استخدم جميع الميزات دون بطاقة دفع. سنرسل ملف ZIP ورخصة تجريبية Ed25519.',
    'Name':'الاسم', 'Work email':'بريد العمل', 'Company':'الشركة', '(optional)':'(اختياري)', 'Request the download':'اطلب التنزيل',
    'Opens your email client — nothing is stored on this page.':'سيفتح تطبيق البريد لديك؛ لا تُحفظ أي بيانات في هذه الصفحة.',
    'Request ready':'طلبك جاهز', 'Close':'إغلاق', 'Open menu':'فتح القائمة', 'Close menu':'إغلاق القائمة',
    'Switch to dark theme':'التبديل إلى المظهر الداكن', 'Switch to light theme':'التبديل إلى المظهر الفاتح',
    'One Platform. Every Layer of Your':'منصة واحدة لكل طبقات', 'On-Prem Infrastructure.':'بنيتك داخل المؤسسة.',
    'GateCore replaces your reverse proxy, firewall, API gateway, load balancer, and VPN appliance — on commodity x86 hardware — with a single software-defined platform your team actually understands.':'تستبدل GateCore الوكيل العكسي والجدار الناري وبوابة API وموزع الأحمال وجهاز VPN، على عتاد x86 قياسي، بمنصة برمجية موحدة يسهل على فريقك إدارتها.',
    'Learn More':'اكتشف المزيد','median proxy overhead':'الزيادة الوسيطة في زمن الوكيل','binary to deploy':'ملف تنفيذي للنشر','appliances retired':'أجهزة تستغني عنها',
    'Six-figure appliance renewals':'تجديدات أجهزة باهظة','Software license on commodity hardware. No hardware refresh cycle.':'ترخيص برمجي على عتاد قياسي، دون الحاجة إلى تحديث الأجهزة.',
    'Fragmented audit trails':'سجلات تدقيق متفرقة','Single unified audit log, HMAC-signed and RBAC-enforced, exportable in one call.':'سجل تدقيق موحد وموقّع بـ HMAC ومطبّق عليه RBAC، قابل للتصدير بطلب واحد.',
    'Vendor lock-in & black-box firmware':'الارتباط بالمورد وبرمجيات مغلقة','Open SDK, full source delivery, and a Go binary you can read end to end.':'SDK مفتوح، وتسليم كامل للمصدر، وملف Go تنفيذي يمكنك مراجعته بالكامل.',
    'What is GateCore':'ما GateCore؟','Available Now':'متاح الآن','Capabilities':'الإمكانات','Everything v1.0 ships, on day one.':'كل ما يأتي مع v1.0، منذ اليوم الأول.',
    'Go-native performance':'أداء أصيل بلغة Go','Ed25519 License System':'نظام تراخيص Ed25519','Live Traffic Dashboard':'لوحة حركة مرور مباشرة','Full RBAC & Audit':'RBAC وتدقيق شامل',
    'Plugin Architecture':'بنية الإضافات','One Binary, Full Stack':'ملف تنفيذي واحد، المنظومة كاملة','See it in action':'شاهده عمليًا',
    'One binary. This is what it looks like.':'ملف تنفيذي واحد. هكذا يبدو.', 'Terminal':'الطرفية','Live Traffic':'حركة المرور المباشرة','Backends':'الخوادم الخلفية',
    'Architecture':'البنية','Designed from day one to own every layer.':'صُممت منذ البداية لإدارة كل طبقة.',
    'Management Plane':'طبقة الإدارة','Infra Management Engine':'محرك إدارة البنية','Data Plane System':'نظام مستوى البيانات','Corporate Network Layer':'طبقة شبكة المؤسسة',
    'Every layer shares one API surface, one audit store, and one upgrade path. No vendor per tier. No integration glue.':'تستخدم كل طبقة واجهة API واحدة وسجل تدقيق موحدًا ومسار ترقية واحدًا. دون مورد لكل طبقة أو أعمال دمج معقدة.',
    'Vision':'الرؤية','A four-act plan to replace your entire rack.':'خطة من أربع مراحل لاستبدال منظومتك بالكامل.',
    'Act 1 — Harden':'المرحلة الأولى — تعزيز الجاهزية','Act 2 — Egypt First':'المرحلة الثانية — مصر أولًا','Act 3 — Platform':'المرحلة الثالثة — المنصة','Act 4 — World Market':'المرحلة الرابعة — السوق العالمي',
    'One platform. Commodity hardware. Full control.':'منصة واحدة. عتاد قياسي. تحكم كامل.','Transparent pricing. No surprise renewals.':'أسعار واضحة، بلا تجديدات مفاجئة.',
    'Annual':'سنوي','Monthly':'شهري',
    'For evaluation':'للتقييم','Full feature access':'الوصول إلى جميع الميزات','Time-limited license':'ترخيص محدود المدة','No card required':'لا حاجة إلى بطاقة دفع',
    'perpetual':'دائم','For homelab & learning':'للمختبر المنزلي والتعلم','Core proxy + metrics':'الوكيل الأساسي والمقاييس','Community support':'دعم المجتمع','No ACL / WAF':'دون ACL / WAF',
    'Most Popular':'الأكثر شيوعًا','Best for compliance':'الأفضل للامتثال','For SMB & startup infra':'للبنية التحتية للشركات الناشئة والصغيرة','For regulated & HA environments':'للبيئات المنظمة وعالية التوافر',
    'Priority support':'دعم ذو أولوية','Audit export':'تصدير سجلات التدقيق','Unlimited nodes':'عدد غير محدود من العقد','For MSPs & large orgs':'لمزودي الخدمات والمؤسسات الكبيرة',
    'Unlimited nodes in org':'عقد غير محدودة في المؤسسة','Single API surface':'واجهة API موحدة','Named support':'دعم مخصص','Download':'تنزيل',
    'All plans include: one binary, one API, full documentation. No per-seat dashboards. No module unlocks. One upgrade path.':'تشمل كل الخطط: ملفًا تنفيذيًا واحدًا وواجهة API واحدة وتوثيقًا كاملًا. دون لوحات لكل مستخدم أو ميزات مقفلة. ومسار ترقية واحد.',
    'Built for teams where downtime is measured in lost trust, not just lost revenue.':'للفرق التي يعني التوقف لديها فقدان الثقة، لا الإيرادات فحسب.',
    'Fintech SREs':'مهندسو موثوقية الخدمات المالية','Healthcare IT':'تقنية المعلومات للرعاية الصحية','Audit trail gaps, latency spikes, compliance pressure.':'ثغرات في سجل التدقيق، وارتفاع زمن الاستجابة، وضغط الامتثال.',
    'Full RBAC + HMAC audit log, sub-ms Go proxy.':'RBAC كامل وسجل تدقيق HMAC ووكيل Go بزمن أقل من مللي ثانية.',
    'Vendor lock-in, opaque firmware, data sovereignty.':'الارتباط بالمورد، وبرمجيات غامضة، وسيادة البيانات.',
    'On-prem, source delivery, no cloud dependency.':'تشغيل داخلي وتسليم للمصدر دون اعتماد على السحابة.',
    'Managing 12 different consoles for 20 clients.':'إدارة 12 لوحة تحكم مختلفة لعشرين عميلًا.',
    'Site license + a single API surface across all clients.':'ترخيص موقع وواجهة API واحدة لجميع العملاء.',
    'Questions about migration, HA topology or procurement? Talk to the team that built it.':'لديك أسئلة حول الترحيل أو تصميم HA أو الشراء؟ تواصل مع الفريق الذي بنى المنصة.',
    'LinkedIn':'LinkedIn','License':'الترخيص','Privacy':'الخصوصية','© 2026 GateCore. Founded in Cairo, Egypt.':'© 2026 GateCore. تأسست في القاهرة، مصر.',
    'Open dialog':'فتح النافذة','Close dialog':'إغلاق النافذة','(optional)':'(اختياري)',
    'One Platform. Every Layer of Your':'منصة واحدة لكل طبقات','Your':'لديك','': '',
    'Reverse proxy appliance':'جهاز وكيل عكسي','Next-gen firewall':'جدار ناري من الجيل التالي','API gateway':'بوابة API','Load balancer':'موزع أحمال','VPN concentrator':'مجمّع VPN','DHCP / DNS server':'خادم DHCP / DNS',
    'GateCore is one binary. One API. ':'GateCore ملف تنفيذي واحد وواجهة API واحدة. ','One audit trail.':'وسجل تدقيق موحد.',
    'Most on-prem teams run 4–7 different appliances — each from a different vendor,':'تستخدم معظم الفرق التي تدير بنيتها داخليًا من 4 إلى 7 أجهزة مختلفة، لكل منها مورد مختلف،',
    'each with its own dashboard, audit log, upgrade cycle, and support contract.':'ولكل جهاز لوحة تحكم وسجل تدقيق ودورة تحديث وعقد دعم خاصة به.',
    'One misconfiguration costs you an RCA.':'وقد يؤدي خطأ واحد في الإعداد إلى تحقيق في السبب الجذري RCA.',
    'Not just a proxy. Not just a firewall. A Unified On-Prem Infrastructure Platform.':'ليست مجرد وكيل أو جدار ناري؛ إنها منصة موحدة للبنية التحتية داخل المؤسسة.',
    'GateCore v1.0 ships today as a Secure Application Gateway. The platform evolves with you — the same binary, the same API, the same team — as you grow.':'تتوفر GateCore v1.0 اليوم كبوابة تطبيقات آمنة. وتتطور المنصة مع نموك، مع الملف التنفيذي نفسه وواجهة API نفسها والفريق نفسه.',
    'Secure App Gateway':'بوابة تطبيقات آمنة','App + API Security':'أمان التطبيقات وواجهات API','On-Prem Security Gateway':'بوابة أمان داخل المؤسسة','Unified Platform':'منصة موحدة',
    'Reverse proxy':'وكيل عكسي','Load balancing':'موازنة الأحمال','TLS termination':'إنهاء اتصالات TLS','Metrics':'المقاييس','Plugin system':'نظام الإضافات',
    'Rate limiting':'تحديد معدل الطلبات','API key management':'إدارة مفاتيح API','Threat analytics':'تحليلات التهديدات','Firewall':'جدار ناري','Replace every network & security appliance':'استبدل كل أجهزة الشبكات والأمان',
    'Sub-millisecond proxy, zero GC pressure under sustained load. Runs lean on commodity x86.':'وكيل بزمن أقل من مللي ثانية، ومن دون ضغط على GC أثناء الحمل المستمر. يعمل بكفاءة على أجهزة x86 القياسية.',
    'Tier-based feature enforcement. Trial → Community → Professional → Enterprise, cleanly gated.':'تُتاح الميزات بحسب مستوى الترخيص، من التجربة إلى Enterprise، مع فصل واضح للصلاحيات.',
    'Real-time SSE traffic stream, historical metrics snapshots, Prometheus-compatible':'تدفق حركة مرور فوري عبر SSE، ولقطات للمقاييس السابقة، ومتوافق مع Prometheus',
    'Every API call, every config change — logged, attributed, exportable. Multi-role, multi-tenant.':'يُسجّل كل طلب API وكل تغيير إعداد مع تحديد صاحبه وإمكانية تصديره، مع أدوار ومساحات عمل متعددة.',
    'Ship your logic as a plugin. The platform calls it; the audit trail owns it. SDK in v1.5.':'أضف منطقك كإضافة؛ تستدعيها المنصة وتوثّقها سجلات التدقيق. يتوفر SDK في v1.5.',
    'No microservice sprawl. Deploy with a single zip, manage with a single API, upgrade with one command.':'لا تعقيد من خدمات مصغّرة. انشر بملف ZIP واحد، وأدر عبر API واحدة، وحدّث بأمر واحد.',
    'Upstream servers, health checks and per-node request rates from one table.':'الخوادم المصدرية وفحوصات الصحة ومعدلات الطلب لكل عقدة، في جدول واحد.',
    'Container orchestration, load balancing, auto-scaling and health checks — shipping next.':'تنسيق الحاويات وموازنة الأحمال والتوسع التلقائي وفحوصات الصحة — قريبًا.',
    'Bandwidth metering, quota enforcement and billing on the same box. Target: v1.1.':'قياس استهلاك النطاق وتطبيق الحصص والفوترة على الجهاز نفسه. مستهدف في v1.1.',
    'SDN, firewalls, proxies and DNS/DHCP on commodity hardware. Target: v1.5.':'تقنيات SDN والجدران النارية والوكلاء وDNS/DHCP على عتاد قياسي. مستهدف في v1.5.',
    'the single control surface for every layer below.':'واجهة التحكم الموحدة لكل الطبقات أدناه.',
    'Resolve 6 known gaps. Reach 80/100 readiness score.':'عالج 6 ثغرات معروفة، وبلوغ جاهزية 80 من 100.',
    'First paying clients. Commercial surface. Payment.':'أول العملاء الدافعين، وتجهيز البيع والتحصيل.',
    'Open SDK, ecosystem, v1.5 network layer live.':'إطلاق SDK مفتوح ومنظومة إضافات وطبقة الشبكات v1.5.',
    'GateCore 2.0. Replace every appliance in the rack.':'إصدار GateCore 2.0 واستبدال كل أجهزة الرف.',
    'For homelab & learning':'للمختبر المنزلي والتعلم','For SMB & startup infra':'للبنية التحتية للشركات الناشئة والصغيرة',
    'For regulated & HA environments':'للبيئات الخاضعة للتنظيم وعالية التوافر','For MSPs & large orgs':'لمزودي الخدمات والمؤسسات الكبيرة',
    'Core proxy + metrics':'الوكيل الأساسي والمقاييس','ACL & rate limiting':'ACL وتحديد معدل الطلبات','Plugin support':'دعم الإضافات','All features':'كل الميزات',
    'Most on-prem teams run 4–7 different appliances — each from a different vendor, each with its own dashboard, audit log, upgrade cycle, and support contract. One misconfiguration costs you an RCA.':'تستخدم معظم الفرق التي تدير بنيتها داخليًا من 4 إلى 7 أجهزة مختلفة، لكل منها مورد ولوحة تحكم وسجل تدقيق ودورة تحديث وعقد دعم خاص. وقد يتسبب خطأ في الإعداد بفتح تحقيق في السبب الجذري RCA.',
    'questions about migration':'أسئلة حول الترحيل',
    'The email client should be open with the details filled in. If it didn\'t open, email ':'يفترض أن يكون تطبيق البريد قد فُتح مع تفاصيل الطلب. إن لم يفتح، راسل ',
    ' directly, or message us on ':' مباشرة، أو راسلنا عبر ',
    'Primary':'التنقل الرئيسي','Target categories':'الفئات المستهدفة','Product views':'عروض المنتج','Billing period':'دورة الفوترة',
    'GateCore — home':'GateCore — الصفحة الرئيسية','Traffic flowing from clients through the GateCore traffic engine to the corporate network':'تدفق الحركة من العملاء عبر محرك GateCore إلى شبكة المؤسسة',
    'Toggle theme':'تبديل المظهر','Close dialog':'إغلاق النافذة','Switch to English':'Switch to English'
  };
  AR['Purpose-built for fintech SREs · Healthcare IT · MSPs · Regulated Infrastructure'] = 'مصممة لفرق التقنية المالية والرعاية الصحية ومزودي الخدمات والقطاعات الخاضعة للتنظيم';
  AR['Fintech'] = 'التقنية المالية'; AR['Healthcare'] = 'الرعاية الصحية'; AR['Regulated Infra'] = 'بنية خاضعة للتنظيم'; AR['Homelab'] = 'مختبر منزلي';
  AR['Reverse proxy appliance'] = 'جهاز وكيل عكسي'; AR['Next-gen firewall'] = 'جدار ناري من الجيل التالي';
  AR['Six-figure appliance renewals'] = 'تجديدات أجهزة باهظة'; AR['GateCore'] = 'GateCore';
  AR['ACL & RBAC'] = '<bdi dir="ltr" translate="no">ACL</bdi> و<bdi dir="ltr" translate="no">RBAC</bdi>';
  AR['No ACL / WAF'] = 'دون <bdi dir="ltr" translate="no">ACL / WAF</bdi>';
  AR['For regulated & HA environments'] = 'للبيئات الخاضعة للتنظيم وعالية التوافر <bdi dir="ltr" translate="no">HA</bdi>';
  AR['For MSPs & large orgs'] = 'لمزودي الخدمات <bdi dir="ltr" translate="no">MSPs</bdi> والمؤسسات الكبيرة';
  AR['Professional'] = 'Professional'; AR['Enterprise'] = 'Enterprise'; AR['Community'] = 'Community'; AR['Trial'] = 'Trial'; AR['Site License'] = 'Site License';
  AR['Start with a free 30-day trial.'] = 'ابدأ تجربة GateCore المجانية لمدة 30 يومًا.';
  AR['No card. No cloud. Just your hardware.'] = 'دون بطاقة دفع أو سحابة؛ تعمل المنصة على أجهزتك.';
  AR['GateCore — home'] = 'GateCore — الصفحة الرئيسية';
  AR['GateCore replaces your reverse proxy, firewall, API gateway, load balancer, and VPN appliance — on commodity x86 hardware — with a single software-defined platform your team actually understands.'] = 'تستبدل GateCore الوكيل العكسي والجدار الناري وبوابة API وموزع الأحمال وجهاز VPN، على عتاد x86 قياسي، بمنصة برمجية موحدة يسهل على فريقك إدارتها.';
  AR['Most on-prem teams run 4–7 different appliances — each from a different vendor, each with its own dashboard, audit log, upgrade cycle, and support contract. One misconfiguration costs you an RCA.'] = 'تستخدم معظم الفرق التي تدير بنيتها داخليًا من 4 إلى 7 أجهزة مختلفة، لكل منها مورد ولوحة تحكم وسجل تدقيق ودورة تحديث وعقد دعم خاص. وقد يتسبب خطأ في الإعداد بفتح تحقيق في السبب الجذري RCA.';
  AR['We\'re not racing to match FortiGate feature-for-feature. We\'re building the category those vendors never owned: software-defined unified on-prem infrastructure.'] = 'لا نسعى إلى تقليد كل ميزة في FortiGate؛ بل نبني فئة جديدة: بنية موحدة داخل المؤسسة تُدار بالبرمجيات.';
  AR['Questions about migration, HA topology or procurement? Talk to the team that built it.'] = 'لديك أسئلة حول الترحيل أو تصميم HA أو الشراء؟ تواصل مع الفريق الذي بنى المنصة.';
  AR['Your email client should be open with the details filled in. If it didn\'t open, email '] = 'يفترض أن يكون تطبيق البريد قد فُتح مع تفاصيل الطلب. إن لم يفتح، راسل ';
  AR[' directly, or message us on '] = ' مباشرة، أو راسلنا عبر ';
  AR['GateCore — Unified On-Prem Infrastructure Platform'] = 'GateCore — منصة موحدة للبنية التحتية داخل المؤسسة';
  AR['Mohamed Sameh'] = 'محمد سامح'; AR['Acme Financial'] = 'شركة أكمي المالية';
  AR['WhatsApp'] = 'WhatsApp';
  AR['We\'re not racing to match FortiGate feature-for-feature. We\'re building the category'] = 'لا نسعى إلى تقليد كل ميزة في FortiGate؛ بل نبني الفئة';
  AR['those vendors never owned: software-defined unified on-prem infrastructure.'] = 'التي لم يقدمها الموردون: بنية موحدة داخل المؤسسة تُدار بالبرمجيات.';
  AR['those vendors never owned: software-defined unified on-prem infrastructure.\n      '] = 'التي لم يقدمها الموردون: بنية موحدة داخل المؤسسة تُدار بالبرمجيات.\n      ';
  AR['Act 1 — Harden'] = 'المرحلة الأولى — تعزيز الجاهزية'; AR['Act 2 — Egypt First'] = 'المرحلة الثانية — مصر أولًا';
  AR['Act 3 — Platform'] = 'المرحلة الثالثة — المنصة'; AR['Act 4 — World Market'] = 'المرحلة الرابعة — السوق العالمي';
  AR['The problem'] = 'التحدي'; AR['What is GateCore'] = 'ما GateCore؟'; AR['Who it\'s for'] = 'لمن صُممت';
  AR['See it in action'] = 'شاهدها عمليًا'; AR['Get started'] = 'ابدأ الآن';
  AR['Oct 2026'] = 'أكتوبر 2026'; AR['Oct 2026 – Feb 2027'] = 'أكتوبر 2026 – فبراير 2027';
  AR['Q2–Q3 2027'] = 'الربع الثاني إلى الثالث 2027'; AR['2028+'] = '2028 وما بعده';
  AR['Median proxy overhead'] = 'الزيادة الوسيطة في زمن الوكيل';
  AR['On-prem, source delivery, no cloud dependency.'] = 'تشغيل داخلي وتسليم للمصدر دون اعتماد على السحابة.';
  AR['First paying clients. Commercial surface. Payment.'] = 'أول العملاء الدافعين، وتجهيز البيع والتحصيل.';
  AR['License validated'] = 'تم التحقق من الترخيص'; AR['RBAC loaded'] = 'تم تحميل RBAC';
  AR['ACL engine ready'] = 'محرك ACL جاهز'; AR['TLS certificates loaded'] = 'تم تحميل شهادات TLS';
  AR['Plugin system online'] = 'نظام الإضافات يعمل'; AR['Management API'] = 'واجهة الإدارة';
  AR['Traffic engine'] = 'محرك حركة المرور'; AR['Metrics endpoint'] = 'نقطة المقاييس';
  AR['Request ready'] = 'الطلب جاهز'; AR['Your email client should be open with the details filled in. If it didn\'t open, email'] = 'يفترض أن يكون تطبيق البريد قد فُتح مع تفاصيل الطلب. إن لم يفتح، راسل';
  AR['We\'re not racing to match FortiGate feature-for-feature. We\'re building the category those vendors never owned: software-defined unified on-prem infrastructure.'] = 'لا نسعى إلى تقليد كل ميزة في FortiGate؛ بل نبني فئة جديدة لم يقدمها الموردون: بنية موحدة داخل المؤسسة تُدار بالبرمجيات.';
  AR['GateCore v1.0 ships today as a Secure Application Gateway. The platform evolves with you — the same binary, the same API, the same team — as you grow.'] = 'تتوفر GateCore v1.0 اليوم كبوابة تطبيقات آمنة. وتتطور المنصة مع نموك، مع الملف التنفيذي نفسه وواجهة API نفسها والفريق نفسه.';
  AR['Real-time SSE stream, historical snapshots, Prometheus-compatible'] = 'تدفق فوري عبر SSE ولقطات تاريخية للمقاييس، مع توافق Prometheus';
  AR['Live in v1.0'] = 'متاح في v1.0'; AR['Planned v1.1'] = 'مخطط في v1.1'; AR['Planned v1.5'] = 'مخطط في v1.5'; AR['Next'] = 'التالي';
  AR['Dashboard · REST API · RBAC · Policy'] = 'لوحة تحكم · REST API · RBAC · السياسات';
  AR['Container Orchestration · LB · Auto-Scaling · Health Checks'] = 'تنسيق الحاويات · LB · التوسع التلقائي · فحوصات الصحة';
  AR['Bandwidth Metering · Quota · Billing'] = 'قياس النطاق · الحصص · الفوترة';
  AR['SDN · Firewalls · Proxies'] = 'SDN · جدران نارية · وكلاء';
  AR['Dashboard · REST API · RBAC · Policy — the single control surface for every layer below.'] = 'لوحة تحكم وREST API وRBAC وسياسات؛ واجهة التحكم الموحدة لكل الطبقات أدناه.';
  AR['Container orchestration, load balancing, auto-scaling and health checks — shipping next.'] = 'تنسيق الحاويات وموازنة الأحمال والتوسع التلقائي وفحوصات الصحة — قريبًا.';
  AR['Bandwidth metering, quota enforcement and billing on the same box. Target: v1.1.'] = 'قياس استهلاك النطاق وتطبيق الحصص والفوترة على الجهاز نفسه. مستهدف في v1.1.';
  AR['SDN, firewalls, proxies and DNS/DHCP on commodity hardware. Target: v1.5.'] = 'تقنيات SDN والجدران النارية والوكلاء وDNS/DHCP على عتاد قياسي. مستهدف في v1.5.';
  AR['Free'] = 'مجانًا'; AR['Core proxy + metrics'] = 'الوكيل الأساسي والمقاييس';
  AR['Community support'] = 'دعم المجتمع'; AR['ACL & rate limiting'] = 'ACL وتحديد معدل الطلبات';
  AR['Plugin support'] = 'دعم الإضافات'; AR['All features'] = 'كل الميزات';
  AR['Full RBAC'] = 'RBAC كامل'; AR['Single API surface'] = 'واجهة API موحدة';
  AR['Audit export'] = 'تصدير سجلات التدقيق'; AR['Unlimited nodes in org'] = 'عقد غير محدودة في المؤسسة';
  AR['Management Plane'] = 'طبقة الإدارة'; AR['Infra Management Engine'] = 'محرك إدارة البنية';
  AR['Data Plane System'] = 'نظام مستوى البيانات'; AR['Corporate Network Layer'] = 'طبقة شبكة المؤسسة';
  AR['Start Free Trial'] = 'ابدأ التجربة المجانية';
  AR['All plans include: one binary, one API, full documentation. No per-seat dashboards. No module unlocks. One upgrade path.'] = 'تشمل كل الخطط ملفًا تنفيذيًا واحدًا وواجهة API واحدة وتوثيقًا كاملًا، دون لوحات لكل مستخدم أو ميزات مقفلة، مع مسار ترقية واحد.';
  AR['Start with a free 30-day trial.'] = 'ابدأ تجربة مجانية لمدة 30 يومًا.';
  AR['One platform. Commodity hardware. Full control.'] = 'منصة واحدة. عتاد قياسي. تحكم كامل.';
  AR['A four-act plan to replace your entire rack.'] = 'خطة من أربع مراحل لاستبدال منظومتك بالكامل.';
  AR['GateCore is one binary. One API.'] = 'GateCore ملف تنفيذي واحد وواجهة API واحدة.';
  AR['1 API · 1 audit log'] = 'واجهة API واحدة · سجل تدقيق واحد';
  AR['Your email client should be open with the details filled in. If it didn\'t open, email'] = 'يفترض أن يكون تطبيق البريد قد فُتح مع تفاصيل الطلب. إن لم يفتح، راسل';
  AR['directly, or message us on'] = 'مباشرة، أو راسلنا عبر';
  AR['/yr per node'] = '/yr لكل عقدة'; AR['/mo per node'] = '/mo لكل عقدة'; AR['/yr flat'] = '/yr بسعر ثابت'; AR['/mo flat'] = '/mo بسعر ثابت';
  AR['30 days'] = '30 يومًا'; AR['For evaluation'] = 'للتقييم'; AR['No card required'] = 'لا حاجة إلى بطاقة دفع';
  AR['Full feature access'] = 'الوصول إلى جميع الميزات'; AR['Time-limited license'] = 'ترخيص محدود المدة';
  AR['Unlimited nodes in org'] = 'عقد غير محدودة في المؤسسة'; AR['Single API surface'] = 'واجهة API موحدة';
  AR['Named support'] = 'دعم مخصص'; AR['Priority support'] = 'دعم ذو أولوية'; AR['Audit export'] = 'تصدير سجلات التدقيق';
  AR['perpetual'] = 'دائم'; AR['For homelab & learning'] = 'للمختبر المنزلي والتعلم';
  AR['For SMB & startup infra'] = 'للبنية التحتية للشركات الصغيرة والناشئة';
  AR['For regulated & HA environments'] = 'للبيئات الخاضعة للتنظيم وعالية التوافر <bdi dir="ltr" translate="no">HA</bdi>';
  AR['For MSPs & large orgs'] = 'لمزودي الخدمات والمؤسسات الكبيرة';
  AR['Single unified audit log, HMAC-signed and RBAC-enforced, exportable in one call.'] = 'سجل تدقيق موحد وموقّع بـ <bdi dir="ltr" translate="no">HMAC</bdi> ومطبّق عليه <bdi dir="ltr" translate="no">RBAC</bdi>، قابل للتصدير بطلب واحد.';
  AR['Full RBAC + HMAC audit log, sub-ms Go proxy.'] = 'صلاحيات <bdi dir="ltr" translate="no">RBAC</bdi> كاملة وسجل تدقيق <bdi dir="ltr" translate="no">HMAC</bdi> ووكيل <bdi dir="ltr" translate="no">Go</bdi> بزمن أقل من مللي ثانية.';
  AR['No ACL / WAF'] = 'دون <bdi dir="ltr" translate="no">ACL / WAF</bdi>';
  AR['Questions about migration, HA topology or procurement? Talk to the team that built it.'] = 'لديك أسئلة عن الترحيل أو تصميم <bdi dir="ltr" translate="no">HA</bdi> أو الشراء؟ تواصل مع الفريق الذي بنى المنصة.';
  AR['No microservice sprawl. Deploy with a single zip, manage with a single API, upgrade with one command.'] = 'لا تعقيد من خدمات مصغّرة. انشر بملف ZIP واحد، وأدر عبر واجهة <bdi dir="ltr" translate="no">API</bdi> واحدة، وحدّث بأمر واحد.';
  AR['Open SDK, full source delivery, and a Go binary you can read end to end.'] = 'حزمة <bdi dir="ltr" translate="no">SDK</bdi> مفتوحة وتسليم كامل للمصدر وملف <bdi dir="ltr" translate="no">Go</bdi> تنفيذي يمكنك مراجعته بالكامل.';
  var enText = [];
  var enAttrs = [];
  var activeCycle = 'annual';
  var ABBR = /\b(?:API|RBAC|HMAC|VPN|TLS|DNS|ACL|WAF|SDN|SDK|DHCP|SSE|REST|LB|HA|SSH|RSA|NAT|RCA|SMB|MSPs?|SREs?|IT|OS|GateCore|WhatsApp|LinkedIn|Go|Ed25519|Prometheus|Inter|Cairo|English|FortiGate|x86|ZIP|Professional|Community|Trial|Enterprise|Site License|Q[1-4]|v\d+(?:\.\d+)*|req\/s|ms|yr|mo)\b/g;
  function richText(value) {
    var trusted = [];
    value = value.replace(/<bdi\b[^>]*>[\s\S]*?<\/bdi>/g, function (tag) {
      if (!/\blang=/.test(tag)) tag = tag.replace('<bdi ', '<bdi lang="en" ');
      var token = '\u0001' + trusted.length + '\u0002'; trusted.push(tag); return token;
    });
    value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(ABBR, '<bdi class="abbr" lang="en" dir="ltr" translate="no">$&</bdi>');
    trusted.forEach(function (tag, i) { value = value.replace('\u0001' + i + '\u0002', tag); });
    return value;
  }
  function setLanguage(language) {
    var arabic = language === 'ar';
    root.lang = arabic ? 'ar' : 'en'; root.dir = arabic ? 'rtl' : 'ltr';
    if (!enText.length) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        var owner = node.parentElement;
        if (!owner || owner.closest('[translate="no"],.notranslate,.mono,code,script,style,svg')) continue;
        var original = node.nodeValue;
        var key = original.trim().replace(/\s+/g, ' ');
        if (key) {
          if (!owner.hasAttribute('data-i18n') && AR[key]) owner.setAttribute('data-i18n', key);
          enText.push({node:node, original:original, key:key, parent:owner});
        }
      }
      $$('[aria-label],[title],[placeholder],[data-tip]').forEach(function (el) {
        ['aria-label','title','placeholder','data-tip'].forEach(function (name) {
          if (el.hasAttribute(name)) enAttrs.push({el:el, name:name, value:el.getAttribute(name)});
        });
      });
    }
    enText.forEach(function (entry) {
      var keyAttr = entry.parent.getAttribute('data-i18n');
      var translation = AR[entry.key] || AR[keyAttr];
      if (arabic && translation) {
        var wrapper = document.createElement('span');
        wrapper.className = 'i18n-inline'; wrapper.dir = 'auto';
        wrapper.innerHTML = richText(translation);
        entry.node.parentNode.replaceChild(wrapper, entry.node);
        entry.wrapper = wrapper;
      } else if (!arabic) {
        if (entry.wrapper && entry.wrapper.parentNode) entry.wrapper.parentNode.replaceChild(entry.node, entry.wrapper);
        entry.wrapper = null;
      }
    });
    enAttrs.forEach(function (entry) {
      var translation = AR[entry.value];
      if (translation && arabic) entry.el.setAttribute(entry.name, translation);
      else if (!arabic) entry.el.setAttribute(entry.name, entry.value);
    });
    document.title = arabic ? 'GateCore — منصة موحدة للبنية التحتية داخل المؤسسة' : 'GateCore — Unified On-Prem Infrastructure Platform';
    $$('[data-annual],[data-monthly]').forEach(function (el) {
      if (!el.dataset.englishValue) el.dataset.englishValue = el.textContent;
      var selected = el.dataset[activeCycle];
      if (!selected) return;
      el.textContent = arabic ? (AR[selected] || selected) : selected;
    });
    $$('.lang').forEach(function (button) {
      button.textContent = arabic ? 'English' : 'العربية';
      button.setAttribute('lang', arabic ? 'en' : 'ar');
      button.setAttribute('aria-label', arabic ? 'Switch to English' : 'التبديل إلى العربية');
      button.setAttribute('aria-pressed', arabic ? 'true' : 'false');
    });
    try { localStorage.setItem('gatecore-lang', arabic ? 'ar' : 'en'); } catch (e) {}
    root.classList.add('lang-ready');
  }
  $$('.lang').forEach(function (button) {
    button.addEventListener('click', function () {
      setLanguage(root.lang === 'ar' ? 'en' : 'ar');
      setDrawer(false);
    });
  });
  if (root.lang === 'ar') { root.lang = 'en'; setLanguage('ar'); }

  /* ============================================================
     0. THEME
     ============================================================ */
  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function syncThemeColor() {
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark() ? '#0A0F1C' : '#ffffff');
  }

  /* Screenshots ship in a light and a dark variant; swap the source so the
     asset always matches the active theme. */
  function syncShots() {
    var key = isDark() ? 'dark' : 'light';
    $$('img[data-light][data-dark]').forEach(function (img) {
      var next = img.dataset[key];
      if (next && img.getAttribute('src') !== next) img.setAttribute('src', next);
    });
  }

  var themeBtn = $('#theme');
  function syncThemeBtn() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-pressed', isDark() ? 'true' : 'false');
    themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      if (isDark()) root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', 'dark');
      syncThemeBtn();
      syncShots();
      syncThemeColor();
    });
  }
  syncThemeBtn();
  syncShots();
  syncThemeColor();

  /* ============================================================
     1. NAVBAR
     ============================================================ */
  var nav = $('#nav');
  var burger = $('#burger');
  var scrim = $('#navScrim');

  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setDrawer(open) {
    if (!nav || !burger) return;
    var wasOpen = drawerOpen();
    if (open) { previousScrollY = window.scrollY; root.style.setProperty('--scroll-y', -previousScrollY + 'px'); }
    nav.classList.toggle('is-open', open);
    root.classList.toggle('nav-open', open);
    if (!open && wasOpen) { root.style.removeProperty('--scroll-y'); window.scrollTo(0, previousScrollY); }
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', root.lang === 'ar' ? (open ? 'إغلاق القائمة' : 'فتح القائمة') : (open ? 'Close menu' : 'Open menu'));
  }
  var previousScrollY = 0;
  function drawerOpen() { return nav && nav.classList.contains('is-open'); }

  if (burger) {
    burger.addEventListener('click', function () { setDrawer(!drawerOpen()); });
  }
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });

  // close after tapping a link inside the drawer
  $$('#nav-drawer a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawerOpen()) {
      setDrawer(false);
      if (burger) burger.focus();
    }
  });

  // a drawer left open across a resize would strand the scrim
  var mqDesktop = window.matchMedia('(min-width: 861px)');
  (mqDesktop.addEventListener ? mqDesktop.addEventListener.bind(mqDesktop, 'change')
                              : mqDesktop.addListener.bind(mqDesktop))(function (e) {
    if (e.matches) setDrawer(false);
  });

  /* ============================================================
     2. SCROLL REVEAL
     ============================================================ */
  var reveals = $$('.reveal');

  function stagger(el) {
    var siblings = Array.prototype.slice.call(el.parentNode.children).filter(function (n) {
      return n.classList && n.classList.contains('reveal');
    });
    var i = siblings.indexOf(el);
    return (i > 0 ? Math.min(i, 5) * 70 : 0) + 'ms';
  }
  function show(el) { el.classList.add('is-in'); }

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = stagger(e.target);
        show(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });

    // reveal what is already on screen immediately — above-the-fold content
    // must never flash in late (this is what LCP measures)
    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 0) && r.bottom > 0) {
        el.style.transitionDelay = stagger(el);
        show(el);
        io.unobserve(el);
      }
    });

    // safety net: never leave content permanently invisible
    setTimeout(function () {
      reveals.forEach(function (el) {
        if (el.getBoundingClientRect().top < (window.innerHeight || 0)) show(el);
      });
    }, 1200);
  }

  /* ============================================================
     3. VERSION PILL -> ROADMAP
     ============================================================ */
  $$('.js-to-roadmap').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = $('#roadmap');
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ============================================================
     4. PRICING TOGGLE
     ============================================================ */
  $$('.toggle__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cycle = btn.dataset.cycle;
      activeCycle = cycle;
      $$('.toggle__btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      $$('[data-annual]').forEach(function (el) {
        var value = el.dataset[cycle];
        el.textContent = root.lang === 'ar' ? (AR[value] || value) : value;
      });
    });
  });

  /* ============================================================
     5. TRIAL MODAL
     ============================================================ */
  var modal = $('#trialModal');
  var formWrap = $('#trialFormWrap');
  var doneWrap = $('#trialDoneWrap');
  var form = $('#trialForm');
  var lastFocus = null;
  var lastFocusInDrawer = false;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocusInDrawer = drawerOpen() && nav.contains(document.activeElement);
    lastFocus = lastFocusInDrawer ? burger : document.activeElement;
    if (lastFocusInDrawer) setDrawer(false);
    formWrap.hidden = false;
    doneWrap.hidden = true;
    form.reset();
    modal.hidden = false;
    previousScrollY = window.scrollY;
    root.style.setProperty('--scroll-y', -previousScrollY + 'px');
    root.classList.add('nav-open');       // scroll lock
    var first = form.querySelector('input');
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function closeModal() {
    modal.hidden = true;
    root.classList.remove('nav-open');
    root.style.removeProperty('--scroll-y');
    window.scrollTo(0, previousScrollY);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocusInDrawer = false;
  }

  $$('.js-trial').forEach(function (b) { b.addEventListener('click', openModal); });
  $$('[data-close]', modal).forEach(function (b) {
    b.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    // keep Tab inside the dialog
    if (e.key === 'Tab') {
      var items = $$(FOCUSABLE, modal).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // No backend here: hand the request off through the visitor's mail client.
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = (data.get('name') || '').toString().trim();
    var email = (data.get('email') || '').toString().trim();
    var company = (data.get('company') || '').toString().trim();
    if (!name || !email) {
      var bad = !name ? $('#trialName') : $('#trialEmail');
      bad.focus();
      return;
    }

    var body =
      'GateCore 30-day trial request\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Company: ' + (company || '—') + '\n';

    window.location.href =
      'mailto:mosameh2011@outlook.com?subject=' +
      encodeURIComponent('GateCore trial request — ' + (company || name)) +
      '&body=' + encodeURIComponent(body);

    formWrap.hidden = true;
    doneWrap.hidden = false;
  });

  /* ============================================================
     6. SHOWCASE TABS (ARIA tab pattern: roving tabindex + arrow keys)
     ============================================================ */
  var tablist = $('.demo-tabs');
  if (tablist) {
    var tabs = $$('.demo-tab', tablist);

    function selectTab(btn, focus) {
      tabs.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
        var panel = document.getElementById('tab-' + b.dataset.tab);
        if (panel) panel.hidden = !on;
      });
      if (focus) btn.focus();
    }

    tabs.forEach(function (btn, i) {
      btn.addEventListener('click', function () { selectTab(btn); });
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }

})();
