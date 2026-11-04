import { SPORTAVAND_BRAND } from '../config/brand';

export interface GateInfo {
  id: string;
  name: string;
  phase: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'ready';
  description: string;
  deliverables: string[];
  passCriteria: string[];
  blockers?: string[];
}

export interface AdrInfo {
  id: string;
  title: string;
  status: 'PROPOSED' | 'ACCEPTED' | 'DRAFT';
  context: string;
  decision: string;
  consequences: string[];
  details: string;
}

export interface ConflictItem {
  id: string;
  topic: string;
  pastIdea: string;
  doc2Decision: string;
  rationale: string;
  status: 'حل‌شده' | 'نیاز به تأیید مالک';
}

export interface PackageZip {
  name: string;
  slug: string;
  license: 'رایگان (مخزن وردپرس)' | 'پولی / تجاری (سایت شما)';
  target: string;
  scope: string[];
  guidelineCompliance: string;
}

export const EXECUTIVE_PILLARS = [
  {
    id: 'compliance',
    title: 'انطباق قطعی با قوانین مخزن WordPress.org',
    short: 'جداسازی ۱۰۰٪ هسته رایگان از لایسنس پولی',
    desc: 'هسته رایگان (Sportavand Core) هیچ بررسی لایسنس، سقف تعداد، مهلت تست یا کد غیرفعال نخواهد داشت. تمام قابلیت‌های تجاری، صندلی‌ها و کنترل دسترسی پیشرفته به صورت افزونه‌های ZIP مجزا از دامنه اختصاصی sportavand.ir توزیع می‌شوند.',
    icon: 'ShieldCheck',
    color: 'emerald',
  },
  {
    id: 'intake-export',
    title: 'تثبیت موتور بومی Intake و Export به عنوان قلب اسپورتاوند',
    short: 'عدم وابستگی به Gravity Forms؛ هسته کاملاً خودبسنده است',
    desc: 'فرم‌های دامنه‌ای اعتبارسنجی‌شده (ثبت شخص، کادر، تیم و مدارک) و خروجی‌های ساخت‌یافته استاندارد (اکسل، فشرده‌سازی مدارک و گزارش) بخش اصلی سیستم هستند. ابزارهای بیرونی فقط ورودی آداپتور اختیاری خواهند بود.',
    icon: 'FileInput',
    color: 'amber',
  },
  {
    id: 'node-grant',
    title: 'سلسله‌مراتب صریح Node/Grant و سطوح اطمینان',
    short: 'پایان ارث‌بری کور دسترسی‌ها با اعتبارسنجی ۰ تا ۵',
    desc: 'هیچ دسترسی خودکاری از بالا به پایین داده نمی‌شود. هر اقدام نیازمند اعطای صریح (Grant) است. اطلاعات توسط خود شخص ثبت شده و زنجیره تأیید (فرد ← تیم ← باشگاه ← شهرستان ← استان ← فدراسیون) سطح اعتماد داده را بالا می‌برد.',
    icon: 'GitBranch',
    color: 'indigo',
  },
  {
    id: 'sport-pack',
    title: 'هسته چندرشته‌ای مستقل با ماژول اسپورتاوند بسکتبال',
    short: 'آغاز با Sportavand Basketball و آماده توسعه ماژولار',
    desc: 'مفاهیم پایه (Person, Event, Node, Attendance, Fee) کاملاً از قواعد ورزشی منتزع هستند. قواعد تخصصی بسکتبال، خطاهای تیمی، کوارترها و فرمت‌های ۵×۵ و ۳×۳ در ماژول اول (sportavand-basketball) تزریق می‌شوند.',
    icon: 'Trophy',
    color: 'rose',
  },
];

export const CURRENT_REALITY = {
  version: `Sportavand Core ${SPORTAVAND_BRAND.version} (${SPORTAVAND_BRAND.nameFa})`,
  dbSchema: '۹ جدول اختصاصی رابطه‌ای با پیشوند wp_sportavand_',
  packageVersion: SPORTAVAND_BRAND.version,
  testedEnv: 'PHP 8.2+ / WordPress 6.x با معماری ماژولار Sportavand',
  realSiteStatus: 'هاست مرجع باشگاه (fwa.ir) متصل به ۹ جدول اختصاصی Sportavand بدون فشار به wp_postmeta',
  criticalWarnings: [
    'نام رسمی و نهایی محصول منحصراً Sportavand (اسپورتاوند — سامانه جامع مدیریت ورزش) با شعار «از سامان تا اوج» است.',
    'ساختار ۹ جدول اختصاصی رابطه‌ای با پیشوند wp_sportavand_ سرعت پردازش و پاسخ‌دهی را به حداکثر رسانده است.',
    'شورت‌کدهای رسمی استاندارد [sportavand_form] و [sportavand_roster] هستند (با حفظ سازگاری خودکار برای برگه‌های قبلی).',
    'ماژول اول پلتفرم Sportavand Basketball — اسپورتاوند بسکتبال (sportavand-basketball) است.',
  ],
  tables: [
    { name: 'sportavand_migrations', role: 'ثبت و پیگیری نسخه‌های اسکیمای ساختار پایگاه‌داده و مهاجرت‌ها' },
    { name: 'sportavand_installations', role: 'متادیتای نصب، شناسه عمومی سامانه و کلیدهای پیکربندی' },
    { name: 'sportavand_organizations', role: 'تعریف ساختار سازمان‌ها، هیئت‌ها، باشگاه‌ها و نهادها' },
    { name: 'sportavand_workspaces', role: 'فضاهای کاری ایزوله برای مدیریت مستقل هر واحد و ماژول ورزشی' },
    { name: 'sportavand_audit_events', role: 'لاگ ثبت وقایع امنیتی، تغییر وضعیت‌ها و تصمیمات غیرقابل دست‌کاری' },
    { name: 'sportavand_persons', role: 'اطلاعات یکتای هویت مدنی شخص، کد ملی ۱۰ رقمی و مشخصات بیومتریک ورزشی' },
    { name: 'sportavand_account_links', role: 'اتصال ایمن حساب‌های کاربری وردپرس به پرونده یکتای شخص' },
    { name: 'sportavand_memberships', role: 'وضعیت عضویت چندنقشی شخص در تیم‌ها (بازیکن، سرمربی، مربی، سرپرست)' },
    { name: 'sportavand_reviewers', role: 'تعیین صریح بازبین‌ها و مسئولین تأیید درخواست‌های عضویت' },
  ],
};

export const CONFLICTS_DATA: ConflictItem[] = [
  {
    id: 'C-01',
    topic: 'ACF به عنوان منبع اصلی داده vs دیتابیس اختصاصی اسپورتاوند',
    pastIdea: 'در برخی گفتگوهای قبلی پیشنهاد شده بود تمام داده‌های لیگ و بازی‌ها با فیلدهای سفارشی ACF ذخیره شوند.',
    doc2Decision: 'جداول اختصاصی رابطه‌ای Sportavand (wp_sportavand_*) تنها منبع حقیقت (Source of Truth) هستند.',
    rationale: 'استفاده از postmeta برای صدها هزار رکورد تراکنشی، مسابقات و احراز هویت باعث قفل‌شدگی دیتابیس و افت شدید کارایی می‌شود.',
    status: 'حل‌شده',
  },
  {
    id: 'C-02',
    topic: 'وابستگی اجباری به Gravity Forms vs موتور مستقل Intake',
    pastIdea: 'نسخه‌های اولیه به طور عمیق به هوک‌ها و ساختار دیتابیس Gravity Forms متصل شده بودند.',
    doc2Decision: 'هسته Sportavand موتور ورودی (Intake) کاملاً مستقل دارد. اتصال به فرم‌های خارجی اختیاری است.',
    rationale: 'سامانه باید روی هر سایت وردپرسی بدون الزام به خرید افزونه پرهزینه تجاری خارجی کار کند.',
    status: 'حل‌شده',
  },
  {
    id: 'C-03',
    topic: 'یک شخص با چند سمت vs رکورد تکراری برای هر تیم',
    pastIdea: 'در مبدل‌های قدیمی با هر ثبت‌نام جدید، رکورد جدیدی از شخص ساخته می‌شد.',
    doc2Decision: 'هر شخص دقیقاً یک پرونده هویتی (wp_sportavand_persons) دارد و چند انتصاب یا عضویت (wp_sportavand_memberships) به آن متصل می‌شود.',
    rationale: 'حفظ سابقه کارنامه، پیشگیری از تقلب هویتی و امکان مدیریت همزمان نقش بازیکن، مربی و داور.',
    status: 'حل‌شده',
  },
];

export const GATES_DATA: GateInfo[] = [
  {
    id: 'G0',
    name: 'تثبیت هویت Sportavand و موتور مهاجرت ایمن نسخه ۰٫۶٫۰',
    phase: 'تغییر نام یکپارچه و مهاجرت بدون افت داده',
    status: 'ready',
    description: 'تغییر نام کامل هسته و ماژول بسکتبال به Sportavand (اسپورتاوند)، پیاده‌سازی موتور مهاجرت نسخه‌دار Sportavand_Migrator و تضمین سازگاری شورت‌کدهای موجود.',
    deliverables: [
      'افزونه استاندارد sportavand-v0.6.0.zip با فضای نام Sportavand',
      'موتور مهاجرت ایمن و تکرارپذیر جداول، گزینه‌ها، متادیتاها و کرون‌جاب‌ها',
      'پابرگ استاندارد دو زبانه با منبع واحد حقیقت نسخه و سند هویت برند SPORTAVAND_BRAND.md',
    ],
    passCriteria: [
      'صفر خطای سینتکس در PHP و TypeScript و کامپایل موفق باندل',
      'انتقال بدون افت داده از جداول قدیمی بدون حذف جداول مبدأ تا تأیید نهایی',
      'حفظ کارکرد بدون وقفه برگه‌های موجود در هاست واقعی (مانند fwa.ir/register)',
    ],
  },
  {
    id: 'G1',
    name: 'درخت سازمانی، سیستم اختیار و زنجیره تأیید',
    phase: 'هسته امنیتی و دسترسی‌ها',
    status: 'pending',
    description: 'پیاده‌سازی مدل Node، ساختار Grant، سوییچ نقش‌ها، موتور زنجیره تأیید چندمرحله‌ای و سطوح اطمینان ۰ تا ۵.',
    deliverables: [
      'جدول و سرویس گره‌های سازمانی (Node)',
      'سرویس تخصیص صریح اختیارات (Grant Engine)',
      'موتور ارزیابی سطوح اطمینان (Verification Pipeline)',
    ],
    passCriteria: [
      'تغییر نقش دسترسی‌های نقش قبلی را کاملاً مسدود کند',
      'تست نفوذ منفی برای دسترسی‌های بین حوزه‌ای ۱۰۰٪ پاس شود',
    ],
  },
];

export const ADR_LIST: AdrInfo[] = [
  {
    id: 'ADR-001',
    title: 'هویت برند یکپارچه Sportavand (اسپورتاوند) و معماری ماژولار رشته‌ها',
    status: 'ACCEPTED',
    context: 'برای بلوغ محصول و گسترش از یک ابزار تک‌منظوره به یک سامانه جامع مدیریت ورزش با دامنه رسمی sportavand.ir، نیاز به هویتی اصیل، مقیاس‌پذیر و استاندارد در کد و دیتابیس وجود داشت.',
    decision: 'انتخاب نام قطعی Sportavand (اسپورتاوند — سامانه جامع مدیریت ورزش) با شعار «از سامان تا اوج»، فضای نام PHP به صورت Sportavand، پیشوند جداول wp_sportavand_*، پیشوند کوتاه spv_* برای پست‌تایپ‌ها و کلاس‌های CSS، و شناسه sportavand-basketball برای ماژول اول.',
    consequences: [
      'یکپارچگی ۱۰۰٪ نام‌گذاری در PHP، دیتابیس، REST API، شورت‌کدها و رابط کاربری.',
      'حذف کامل نام‌های منسوخ قدیمی از رابط کاربری و هسته فعال.',
      'امکان افزودن ماژول‌های آینده با الگوی استاندارد بدون تغییر در هسته.',
    ],
    details: 'مهاجرت از نسخه‌های پیشین توسط کلاس Sportavand_Migrator به صورت نسخه‌دار، قفل‌شده با transient و بدون حذف جداول قدیمی تا تأیید نهایی انجام می‌گیرد.',
  },
  {
    id: 'ADR-002',
    title: 'ساختار سلسله‌مراتب Node/Grant و زنجیره سطوح اطمینان (Verification Pipeline)',
    status: 'ACCEPTED',
    context: 'در سامانه‌های ورزشی سنتی، دسترسی‌ها بر اساس نقش عمومی کاربر در وردپرس یا ارث‌بری خودکار مدیران به سطوح پایین داده می‌شود که به نقض حریم شخصی منجر می‌گردد.',
    decision: 'تعریف موجودیت Node به عنوان هر واحد سازمانی مستقل و موجودیت Grant به عنوان اعطای صریح دسترسی با شرط، زمان و دامنه مشخص در اسپورتاوند.',
    consequences: [
      'هیچ نقشی دسترسی خودکار به زیردرخت نخواهد داشت مگر با Grant صریح.',
      'افزایش شفافیت از طریق لاگ اختصاصی در جدول wp_sportavand_audit_events.',
    ],
    details: 'هر Grant شامل ترکیب (Actor, Node, Scope, Actions, ValidityPeriod, Conditions) است.',
  },
  {
    id: 'ADR-003',
    title: 'موتور بومی ورود اطلاعات (Intake Engine) با اعتبارسنجی کد ملی ۱۰ رقمی',
    status: 'ACCEPTED',
    context: 'اتکای گذشته به فرم‌سازهای سنگین برای ذخیره اطلاعات اعضا باعث ناهماهنگی فیلدها و ایجاد رکوردهای تکراری می‌شد.',
    decision: 'ساخت موتور Intake سبک و بومی در هسته Sportavand با اعتبارسنجی سمت سرور و کلاینت (الگوریتم رقم کنترل کد ملی ۱۰ رقمی و پشتیبانی از چندنقشی).',
    consequences: [
      'تضمین قانون طلایی: ۱ انسان = ۱ کد ملی یکتا در جدول wp_sportavand_persons.',
      'صدور آنی کارت شناسایی دیجیتال با QR کد و کد رهگیری SPV.',
    ],
    details: 'شورت‌کد رسمی [sportavand_form id="17"] در هر برگه وردپرس بدون نیاز به لاگین بازیکن کار می‌کند.',
  },
  {
    id: 'ADR-004',
    title: 'بسته‌بندی ماژولار و انطباق مطلق با ضوابط WordPress.org',
    status: 'ACCEPTED',
    context: 'مخزن رسمی وردپرس قرار دادن کدهایی که قابلیت‌ها را با لایسنس پولی قفل می‌کنند را ممنوع کرده است.',
    decision: 'تفکیک کامل پکیج Sportavand Core (رایگان و متن‌باز) از ماژول‌ها و افزونه‌های تجاری که از دامنه رسمی sportavand.ir توزیع می‌شوند.',
    consequences: [
      'تأیید تضمینی افزونه پایه در مخزن جهانی وردپرس.',
      'جداسازی کامل کدهای تجاری از هسته رایگان.',
    ],
    details: 'ارتباط هسته با ماژول‌ها تنها از طریق Action Hookها و Filter Hookهای استاندارد با پیشوند sportavand_* صورت می‌گیرد.',
  },
];

export const PACKAGES_DATA: PackageZip[] = [
  {
    name: 'Sportavand Core (هسته پایه اسپورتاوند)',
    slug: 'sportavand',
    license: 'رایگان (مخزن وردپرس)',
    target: 'مخزن رسمی وردپرس (WordPress.org) و sportavand.ir',
    scope: [
      'تعریف هویت فردی یکتا (Person) با کد ملی ۱۰ رقمی و اتصال حساب',
      'ماژول اول: اسپورتاوند بسکتبال (Sportavand Basketball)',
      'پنل اختصاصی و شورت‌کدهای [sportavand_form] و [sportavand_roster]',
      'موتور مهاجرت ایمن (Sportavand_Migrator) و لاگ ممیزی رویدادها',
    ],
    guidelineCompliance: '۱۰۰٪ مطابق با گایدلاین‌های رسمی مخزن وردپرس',
  },
];

export interface FormFieldDefinition {
  id: string;
  label: string;
  category: 'identity' | 'contact' | 'sports' | 'medical' | 'documents' | 'staff';
  type: 'text' | 'number' | 'date' | 'select' | 'file';
  options?: string[];
  required: boolean;
  enabled: boolean;
  description: string;
}

export const ALL_INTAKE_FIELDS: FormFieldDefinition[] = [
  // هویت
  { id: 'firstName', label: 'نام', category: 'identity', type: 'text', required: true, enabled: true, description: 'نام شناسنامه‌ای' },
  { id: 'lastName', label: 'نام خانوادگی', category: 'identity', type: 'text', required: true, enabled: true, description: 'نام خانوادگی رسمی' },
  { id: 'nationalCode', label: 'کد ملی ۱۰ رقمی', category: 'identity', type: 'text', required: true, enabled: true, description: 'اعتبارسنجی با الگوریتم ثبت احوال' },
  { id: 'birthDate', label: 'تاریخ تولد (شمسی)', category: 'identity', type: 'date', required: true, enabled: true, description: 'مبنای محاسبه سن و رده مسابقات' },
  { id: 'fatherName', label: 'نام پدر', category: 'identity', type: 'text', required: false, enabled: true, description: 'شناسایی و پرونده رسمی' },
  { id: 'birthCertNumber', label: 'شماره شناسنامه', category: 'identity', type: 'text', required: false, enabled: false, description: 'در صورت تفاوت با کد ملی' },
  { id: 'gender', label: 'جنسیت', category: 'identity', type: 'select', options: ['پسران / آقایان', 'دختران / بانوان'], required: true, enabled: true, description: 'تعیین رده مسابقات' },

  // ورزشی تخصصی (اسپورتاوند بسکتبال)
  { id: 'position', label: 'پست تخصصی بازی', category: 'sports', type: 'select', options: ['پست ۱ (پوینت گارد / بازیساز)', 'پست ۲ (شوتینگ گارد)', 'پست ۳ (اسمال فوروارد)', 'پست ۴ (پاور فوروارد)', 'پست ۵ (سنتر)'], required: true, enabled: true, description: 'نقش تخصصی در زمین بسکتبال' },
  { id: 'jerseyNumber', label: 'شماره پیراهن', category: 'sports', type: 'number', required: true, enabled: true, description: 'از ۰ تا ۹۹ طبق قوانین فیبا' },
  { id: 'clubName', label: 'باشگاه / تیم', category: 'sports', type: 'text', required: true, enabled: true, description: 'نام مجموعه ورزشی' },
  { id: 'teamCategory', label: 'رده سنی', category: 'sports', type: 'select', options: ['مینی‌بسکتبال (زیر ۱۲ سال)', 'نونهالان (زیر ۱۴ سال)', 'نوجوانان (زیر ۱۶ سال)', 'جوانان (زیر ۱۸ سال)', 'امید (زیر ۲۱ سال)', 'بزرگسالان'], required: true, enabled: true, description: 'رده مسابقاتی' },
  { id: 'dominantHand', label: 'دست غالب', category: 'sports', type: 'select', options: ['راست‌دست', 'چپ‌دست', 'دو دست'], required: false, enabled: true, description: 'شاخص ارزیابی فنی و استعدادیابی' },
  { id: 'experienceYears', label: 'سابقه فعالیت ورزشی (سال)', category: 'sports', type: 'number', required: false, enabled: false, description: 'رزومه ورزشی' },

  // فیزیکی و پزشکی
  { id: 'height', label: 'قد (سانتی‌متر)', category: 'medical', type: 'number', required: false, enabled: true, description: 'شاخص فیزیکی' },
  { id: 'weight', label: 'وزن (کیلوگرم)', category: 'medical', type: 'number', required: false, enabled: true, description: 'شاخص فیزیکی' },
  { id: 'shoeSize', label: 'سایز کفش', category: 'medical', type: 'text', required: false, enabled: false, description: 'تدارکات ورزشی تیم' },
  { id: 'jerseySize', label: 'سایز لباس ورزشی', category: 'medical', type: 'select', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'], required: false, enabled: false, description: 'سفارش البسه' },
  { id: 'bloodGroup', label: 'گروه خونی', category: 'medical', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: false, enabled: true, description: 'اورژانس پزشکی ورزشی' },
  { id: 'medicalNotes', label: 'سابقه آسیب‌دیدگی / آلرژی خاص', category: 'medical', type: 'text', required: false, enabled: false, description: 'پرونده پزشکی محرمانه' },

  // تماس و اضطراری
  { id: 'phone', label: 'شماره تلفن همراه', category: 'contact', type: 'text', required: true, enabled: true, description: 'دریافت پیامک و اطلاع‌رسانی' },
  { id: 'parentPhone', label: 'شماره ولی / سرپرست قانونی', category: 'contact', type: 'text', required: false, enabled: true, description: 'برای ورزشکاران زیر ۱۸ سال' },
  { id: 'emergencyPhone', label: 'شماره تماس اضطراری', category: 'contact', type: 'text', required: false, enabled: true, description: 'حوادث مسابقه و تمرین' },
  { id: 'city', label: 'شهر سکونت', category: 'contact', type: 'text', required: false, enabled: true, description: 'حوزه جغرافیایی' },
  { id: 'postalAddress', label: 'نشانی پستی', category: 'contact', type: 'text', required: false, enabled: false, description: 'ارسال احکام و مدارک' },

  // مدارک و آپلود
  { id: 'photo', label: 'عکس پرسنلی ورزشی (۳×۴)', category: 'documents', type: 'file', required: true, enabled: true, description: 'صدور کارت بازی و آیدی‌کارت' },
  { id: 'nationalCardImage', label: 'تصویر کارت ملی / شناسنامه', category: 'documents', type: 'file', required: false, enabled: true, description: 'تطبیق هویت' },
  { id: 'insuranceNumber', label: 'شماره بیمه ورزشی فدراسیون', category: 'documents', type: 'text', required: true, enabled: true, description: 'الزامی برای مسابقات و تمرین' },
  { id: 'insuranceExpiry', label: 'تاریخ انقضای بیمه ورزشی', category: 'documents', type: 'date', required: true, enabled: true, description: 'کنترل خودکار اعتبار بیمه' },

  // کادر فنی
  { id: 'staffRole', label: 'سمت در کادر فنی', category: 'staff', type: 'select', options: ['سرمربی', 'مربی', 'کمک مربی', 'سرپرست تیم', 'پزشک / فیزیوتراپ', 'آنالیزور', 'تدارکات'], required: true, enabled: true, description: 'سمت رسمی روی نیمکت' },
  { id: 'coachingGrade', label: 'درجه مربیگری / داوری', category: 'staff', type: 'select', options: ['درجه ۳ ملی', 'درجه ۲ ملی', 'درجه ۱ ملی', 'ملی', 'بین‌المللی فیبا (FIBA)'], required: true, enabled: true, description: 'مجوز حضور در رده‌های بالاتر' },
  { id: 'licenseCode', label: 'شماره کارت صلاحیت ورزشی', category: 'staff', type: 'text', required: false, enabled: true, description: 'کد استعلام فدراسیون' },
];

export const FORM_PRESETS = [
  {
    id: 'form-17',
    name: 'فرم ۱۷: ثبت‌نام جامع تیم مسابقات قهرمانی استان (اسپورتاوند بسکتبال)',
    shortcode: '[sportavand_form id="17"]',
    description: 'فرم استاندارد و کامل مورد تایید هیئت شامل هویت، بیمه ورزشی معتبر، عکس و مدارک کامل برای مسابقات رسمی.',
    activeFieldIds: ['firstName', 'lastName', 'nationalCode', 'birthDate', 'phone', 'parentPhone', 'emergencyPhone', 'position', 'jerseyNumber', 'clubName', 'teamCategory', 'dominantHand', 'height', 'weight', 'bloodGroup', 'photo', 'nationalCardImage', 'insuranceNumber', 'insuranceExpiry'],
  },
  {
    id: 'form-10',
    name: 'فرم ۱۰: پذیرش سریع مدرسه و آکادمی بسکتبال',
    shortcode: '[sportavand_form id="10"]',
    description: 'فرم ساده و سبک برای ثبت‌نام روزمره باشگاه‌ها با حداقل فیلدهای اجباری برای سرعت بالای ثبت.',
    activeFieldIds: ['firstName', 'lastName', 'nationalCode', 'birthDate', 'phone', 'clubName', 'teamCategory', 'photo', 'insuranceNumber'],
  },
  {
    id: 'form-21',
    name: 'فرم ۲۱: انتصاب و ثبت کادر فنی و سرپرستی',
    shortcode: '[sportavand_form id="21"]',
    description: 'مخصوص ثبت سرمربی، مربیان و سرپرستان با استعلام مدرک مربیگری و الصاق به نیمکت تیم.',
    activeFieldIds: ['firstName', 'lastName', 'nationalCode', 'birthDate', 'phone', 'clubName', 'staffRole', 'coachingGrade', 'licenseCode', 'photo', 'insuranceNumber'],
  },
];

export interface PersonRecord {
  id: string;
  nationalCode: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  birthDate: string;
  gender: string;
  bloodGroup: string;
  photo: string;
  isIdentityVerified: boolean;
  canEditPhoto: boolean;
  username: string;
  passwordHash: string;
}

export interface MembershipRecord {
  id: string;
  personId: string;
  clubName: string;
  teamCategory: string;
  role: string;
  jerseyNumber: string;
  position: string;
  height: string;
  weight: string;
  dominantHand: string;
  phone: string;
  parentPhone: string;
  emergencyPhone: string;
  address: string;
  insuranceNumber: string;
  insuranceExpiry: string;
  insuranceValid: boolean;
  status: 'تأیید مدارک' | 'در انتظار بررسی' | 'نیازمند اصلاح' | 'تعلیق موقت';
  joinedSeason: string;
  isPublishedPublic: boolean;
}

export const INITIAL_PERSONS: PersonRecord[] = [
  {
    id: 'P-101',
    nationalCode: '1751234567',
    firstName: 'آرش',
    lastName: 'رضایی',
    fatherName: 'محمد',
    birthDate: '1386/04/15',
    gender: 'پسران / آقایان',
    bloodGroup: 'A+',
    photo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
    isIdentityVerified: true,
    canEditPhoto: false,
    username: '1751234567',
    passwordHash: 'pass123',
  },
  {
    id: 'P-102',
    nationalCode: '1759876543',
    firstName: 'رضا',
    lastName: 'مرادی',
    fatherName: 'حسین',
    birthDate: '1387/08/20',
    gender: 'پسران / آقایان',
    bloodGroup: 'O+',
    photo: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=150&auto=format&fit=crop&q=80',
    isIdentityVerified: true,
    canEditPhoto: false,
    username: '1759876543',
    passwordHash: 'pass123',
  },
  {
    id: 'P-103',
    nationalCode: '1750011223',
    firstName: 'علیرضا',
    lastName: 'داوودی',
    fatherName: 'احمد',
    birthDate: '1365/02/10',
    gender: 'پسران / آقایان',
    bloodGroup: 'B+',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isIdentityVerified: true,
    canEditPhoto: false,
    username: '1750011223',
    passwordHash: 'coach123',
  },
];

export const INITIAL_MEMBERSHIPS: MembershipRecord[] = [
  {
    id: 'M-01',
    personId: 'P-101',
    clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
    teamCategory: 'نوجوانان (زیر ۱۶ سال)',
    role: 'بازیکن',
    jerseyNumber: '7',
    position: 'پست ۲ (شوتینگ گارد)',
    height: '188',
    weight: '78',
    dominantHand: 'راست‌دست',
    phone: '09161234567',
    parentPhone: '09167778899',
    emergencyPhone: '09169990011',
    address: 'اهواز، کیانپارس، خیابان ۱۲ غربی',
    insuranceNumber: 'MED-1405-88219',
    insuranceExpiry: '1405/12/29',
    insuranceValid: true,
    status: 'تأیید مدارک',
    joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
    isPublishedPublic: true,
  },
  {
    id: 'M-02',
    personId: 'P-101',
    clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
    teamCategory: 'مینی‌بسکتبال (زیر ۱۲ سال)',
    role: 'کمک مربی',
    jerseyNumber: '—',
    position: 'کمک مربی پایه (استعدادیابی)',
    height: '188',
    weight: '78',
    dominantHand: 'راست‌دست',
    phone: '09161234567',
    parentPhone: '09167778899',
    emergencyPhone: '09169990011',
    address: 'اهواز، کیانپارس، خیابان ۱۲ غربی',
    insuranceNumber: 'MED-1405-88219',
    insuranceExpiry: '1405/12/29',
    insuranceValid: true,
    status: 'تأیید مدارک',
    joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
    isPublishedPublic: true,
  },
  {
    id: 'M-03',
    personId: 'P-102',
    clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
    teamCategory: 'نوجوانان (زیر ۱۶ سال)',
    role: 'بازیکن',
    jerseyNumber: '11',
    position: 'پست ۴ (پاور فوروارد)',
    height: '194',
    weight: '85',
    dominantHand: 'چپ‌دست',
    phone: '09162223344',
    parentPhone: '09165554433',
    emergencyPhone: '09163332211',
    address: 'اهواز، زیتون کارمندی، خیابان مهران',
    insuranceNumber: 'MED-1405-11024',
    insuranceExpiry: '1405/12/29',
    insuranceValid: true,
    status: 'تأیید مدارک',
    joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
    isPublishedPublic: true,
  },
  {
    id: 'M-04',
    personId: 'P-103',
    clubName: 'باشگاه فرهنگی ورزشی اروند خوزستان',
    teamCategory: 'نوجوانان (زیر ۱۶ سال)',
    role: 'سرمربی',
    jerseyNumber: '—',
    position: 'سرمربی تیم (مربی درجه ۱ ملی)',
    height: '185',
    weight: '82',
    dominantHand: 'راست‌دست',
    phone: '09160001122',
    parentPhone: '—',
    emergencyPhone: '09164443322',
    address: 'اهواز، گلستان، خیابان فروردین',
    insuranceNumber: 'MED-1405-00918',
    insuranceExpiry: '1405/12/29',
    insuranceValid: true,
    status: 'تأیید مدارک',
    joinedSeason: 'فصل ۱۴۰۵-۱۴۰۶',
    isPublishedPublic: true,
  },
];
