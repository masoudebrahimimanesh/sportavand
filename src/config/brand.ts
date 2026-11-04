/**
 * Single Source of Truth for Sportavand Brand Identity, Version, Modules & Migration Mapping
 * Product: Sportavand (اسپورتاوند — سامانه جامع مدیریت ورزش)
 * Domain: sportavand.ir
 * Creator & Developer: Massoud Ebrahimimanesh
 */

export function toPersianDigits(input: string | number): string {
  const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
  const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '٫'];
  let result = String(input);
  for (let i = 0; i < en.length; i++) {
    result = result.split(en[i]).join(fa[i]);
  }
  return result;
}

export const SPORTAVAND_BRAND = {
  // Single Source of Truth for Plugin & Platform Version
  version: '0.6.0',
  versionFa: toPersianDigits('0.6.0'), // ۰٫۶٫۰
  dbSchemaVersion: '6.0.0',

  // Official Brand Identity
  nameEn: 'Sportavand',
  nameFa: 'اسپورتاوند',
  fullTitleFa: 'اسپورتاوند — سامانه جامع مدیریت ورزش',
  pageTitleFa: 'اسپورتاوند | سامانه جامع مدیریت ورزش',
  fullTitleEn: 'Sportavand — Sports Management Platform',
  sloganFa: 'از سامان تا اوج',
  sloganEn: 'From Order to Peak',
  domain: 'sportavand.ir',
  domainUrl: 'https://sportavand.ir',
  creator: 'Massoud Ebrahimimanesh',
  creatorFa: 'مسعود ابراهیمی‌منش',

  // Active First Module
  firstModule: {
    id: 'sportavand-basketball',
    namespace: 'Sportavand\\Modules\\Basketball',
    nameEn: 'Sportavand Basketball',
    nameFa: 'اسپورتاوند بسکتبال',
    fullLabel: 'Sportavand Basketball — اسپورتاوند بسکتبال',
    status: 'active' as const,
  },

  // Future Module Naming Pattern (Documented for architecture pattern only; not presented as ready features)
  futureModulesPattern: [
    {
      id: 'sportavand-volleyball',
      namespace: 'Sportavand\\Modules\\Volleyball',
      nameEn: 'Sportavand Volleyball',
      nameFa: 'اسپورتاوند والیبال',
      fullLabel: 'Sportavand Volleyball — اسپورتاوند والیبال',
      status: 'planned_pattern' as const,
    },
    {
      id: 'sportavand-football',
      namespace: 'Sportavand\\Modules\\Football',
      nameEn: 'Sportavand Football',
      nameFa: 'اسپورتاوند فوتبال',
      fullLabel: 'Sportavand Football — اسپورتاوند فوتبال',
      status: 'planned_pattern' as const,
    },
  ],

  // Technical Naming Standards
  technicalStandards: {
    pluginName: 'Sportavand',
    pluginFolder: 'sportavand',
    mainFile: 'sportavand.php',
    textDomain: 'sportavand',
    domainPath: '/languages',
    phpNamespace: 'Sportavand',
    basketballNamespace: 'Sportavand\\Modules\\Basketball',
    functionPrefix: 'sportavand_*',
    constantPrefix: 'SPORTAVAND_*',
    cptPrefix: 'spv_*',
    tablePrefix: '{$wpdb->prefix}sportavand_*',
    restNamespace: 'sportavand/v1',
    blockNamespace: 'sportavand/*',
    cssPrefix: 'spv- / --spv-',
    scriptHandlePrefix: 'sportavand-*',
    shortcodes: ['[sportavand_form id="17"]', '[sportavand_roster team_id="1"]', '[sportavand_app]'],
    zipFilename: 'sportavand-v0.6.0.zip',
  },

  // Official Brand Intro & Story
  shortIntroFa:
    'اسپورتاوند سامانه‌ای ماژولار برای مدیریت هوشمند باشگاه‌ها، تیم‌ها، ورزشکاران، رویدادها و فرآیندهای ورزشی است؛ از ثبت و سازمان‌دهی داده‌ها تا تحلیل، رشد و حرفه‌ای‌سازی ورزش.',
  brandStoryParagraphsFa: [
    'اسپورتاوند از پیوند دو مفهوم شکل گرفته است: «اسپورت» به‌عنوان زبان مشترک ورزش امروزی، و «وند» به‌عنوان پسوند اصیل فارسی که معنای پیوند، نسبت و تعلق را می‌رساند؛ به این معنا که اسپورتاوند، زیست‌بوم پیوندیافته ورزش، داده، باشگاه و مدیریت حرفه‌ای است.',
    'در لایه مفهومی و آوایی، این نام یادآور «اروند» است؛ نماد جریان، پویایی و توقف‌ناپذیری، و نیز «الوند»؛ نماد استواری، تکیه‌گاه و اوج. اسپورتاوند بر همین دو پایه بنا شده است: جریان زنده اطلاعات ورزشی بر بستری پایدار، دقیق و قابل اعتماد.',
    'اسپورتاوند یک ابزار تک‌منظوره نیست؛ هسته‌ای ماژولار برای مدیریت ورزش است که با ماژول تخصصی بسکتبال آغاز می‌شود و برای گسترش به رشته‌های دیگر، باشگاه‌ها، هیئت‌ها، آکادمی‌ها و مسابقات طراحی شده است.',
  ],
};

export interface IdentifierMappingItem {
  category: string;
  legacyIdentifier: string;
  newIdentifier: string;
  migrationStrategy: string;
}

export const IDENTIFIER_MAPPING_TABLE: IdentifierMappingItem[] = [
  {
    category: 'نام محصول و برند (Brand Identity)',
    legacyIdentifier: 'BMSS / SportNova / ورزش‌یار / ورزشیار',
    newIdentifier: 'Sportavand | اسپورتاوند — سامانه جامع مدیریت ورزش',
    migrationStrategy: 'جایگزینی کامل در تمام رابط‌های کاربری، هدر، پابرگ، متاتگ‌ها و مستندات رسمی',
  },
  {
    category: 'پوشه و فایل اصلی افزونه (Plugin Folder & File)',
    legacyIdentifier: 'sportnova/sportnova.php',
    newIdentifier: 'sportavand/sportavand.php',
    migrationStrategy: 'تشخیص و غیرفعال‌سازی خودکار افزونه قدیمی هنگام فعال‌سازی اسپورتاوند جهت جلوگیری از تداخل دو افزونه فعال',
  },
  {
    category: 'فضای نام PHP و ماژول اول (Namespaces & Module ID)',
    legacyIdentifier: 'SportNova / sportnova-basketball',
    newIdentifier: 'Sportavand & Sportavand\\Modules\\Basketball / sportavand-basketball',
    migrationStrategy: 'به‌روزرسانی خودکار ستون sport_module در جدول wp_sportavand_workspaces',
  },
  {
    category: 'ثابت‌های سراسری و نسخه (Constants & Version)',
    legacyIdentifier: 'SPORTNOVA_VERSION, SPORTNOVA_DB_VERSION, SPORTNOVA_PLUGIN_DIR',
    newIdentifier: 'SPORTAVAND_VERSION (0.6.0), SPORTAVAND_DB_VERSION (6.0.0), SPORTAVAND_PLUGIN_DIR',
    migrationStrategy: 'خواندن نسخه از منبع واحد حقیقت (Single Source of Truth) در PHP و TypeScript',
  },
  {
    category: '۹ جدول اختصاصی دیتابیس (Custom Relational Tables)',
    legacyIdentifier: '{$wpdb->prefix}sportnova_* و {$wpdb->prefix}bmss_*',
    newIdentifier: '{$wpdb->prefix}sportavand_* (۹ جدول استاندارد رابطه‌ای)',
    migrationStrategy: 'انتقال ایمن و تکرارپذیر (Idempotent) با INSERT IGNORE، حفظ کلیدهای اصلی و کدملی، بررسی تعداد رکوردها و حفظ جداول قدیم تا تأیید نهایی',
  },
  {
    category: 'مسیرهای REST API (REST Namespace)',
    legacyIdentifier: '/wp-json/sportnova/v1/*',
    newIdentifier: '/wp-json/sportavand/v1/*',
    migrationStrategy: 'ثبت فضای نام اصلی sportavand/v1 به همراه پشتیبانی سازگار از مسیر قدیمی در لایه مهاجرت',
  },
  {
    category: 'شورت‌کدها و بلوک‌ها (Shortcodes & Blocks)',
    legacyIdentifier: '[sportnova_form], [sportnova_roster]',
    newIdentifier: '[sportavand_form], [sportavand_roster], [sportavand_app] و بلوک‌های sportavand/*',
    migrationStrategy: 'ثبت شورت‌کدهای جدید + پشتیبانی از شورت‌کدهای قبلی در لایه سازگاری تا برگه‌های موجود مثل fwa.ir/register از کار نیفتند',
  },
  {
    category: 'پست‌تایپ‌ها و تاکسونومی‌ها (CPTs & Taxonomies)',
    legacyIdentifier: 'sportnova_*',
    newIdentifier: 'spv_announcement, spv_age_cat (پیشوند spv_* زیر ۲۰ کاراکتر)',
    migrationStrategy: 'رعایت محدودیت طول وردپرس و جلوگیری از تداخل نام‌ها',
  },
  {
    category: 'کلاس‌های CSS، متغیرها و هندل‌های اسکریپت',
    legacyIdentifier: '.sportnova-* / sportnova-app-js / sportnova-app-css',
    newIdentifier: '.spv-*, --spv-* / sportavand-app-js / sportavand-app-css',
    migrationStrategy: 'ایزولاسیون کامل استایل با پیشوند spv- و حفظ سازگاری با کانتینرهای قبلی',
  },
  {
    category: 'گزینه‌ها، متادیتا، نقش‌ها و کرون‌جاب (Options, Meta, Roles, Cron)',
    legacyIdentifier: 'sportnova_* / sportnova_manager / sportnova_daily_maintenance',
    newIdentifier: 'sportavand_* / sportavand_manager / sportavand_daily_maintenance',
    migrationStrategy: 'مهاجرت امن داده‌های سریالایز با get_option/update_option، قفل transient و پاک‌سازی کرون‌های قدیمی',
  },
];
