# راهنمای ارتقا، مهاجرت ایمن و بازیابی (Upgrade, Migration & Recovery Guide)
**Sportavand (اسپورتاوند — سامانه جامع مدیریت ورزش) · نسخه 0.6.0 (`۰٫۶٫۰`)**

این سند دستورالعمل گام‌به‌گام ارتقای بدون افت داده از نسخه‌های قبلی به **Sportavand v0.6.0**، جدول نگاشت کامل شناسه‌های قدیم به جدید، و روش بازگشت ایمن (Rollback) در صورت نیاز را تشریح می‌کند.

---

## ۱. اصول ایمنی موتور مهاجرت (`Sportavand_Migrator`)
موتور مهاجرت در فایل `wordpress-plugin/sportavand/includes/class-sportavand-migrator.php` بر پایه ۵ اصل مهندسی طراحی شده است:
1. **تکرارپذیر و نسخه‌دار (Idempotent & Versioned):** وضعیت مهاجرت در گزینه `sportavand_migration_version` ذخیره می‌شود و فقط هنگام تغییر نسخه اجرا می‌گردد (هرگز در هر بار لود صفحه اجرا نمی‌شود).
2. **قفل همزمانی (Transient Lock):** با استفاده از ترنزینت `sportavand_migration_lock` از اجرای موازی یا تکراری در درخواست‌های همزمان جلوگیری می‌شود.
3. **عدم بازنویسی داده‌های جدیدتر (`INSERT IGNORE`):** رکوردهای موجود در جداول قبلی با حفظ کلیدهای اصلی (`id`)، کلیدهای خارجی (`person_id`, `org_id`) و کد ملی یکتا (`national_code`) به جداول `{$wpdb->prefix}sportavand_*` منتقل می‌شوند و هیچ رکورد جدیدتری بازنویسی نمی‌شود.
4. **حفظ جداول قدیمی تا تأیید نهایی:** جداول قدیمی (`wp_sportnova_*`) پس از کپی داده‌ها به‌صورت خودکار حذف نمی‌شوند تا مدیر سامانه پس از بررسی صحت کامل در منوی **اسپورتاوند > مهاجرت و نگاشت** از سلامت ۱۰۰٪ داده‌ها اطمینان حاصل کند.
5. **سازگاری شورت‌کدها و REST API:** برگه‌های موجود وردپرس (مانند `fwa.ir/register`) که حاوی شورت‌کدهای قبلی هستند، بدون نیاز به ویرایش فوری برگه، به کار خود ادامه می‌دهند.

---

## ۲. جدول نگاشت شناسه‌های قدیم به جدید (Identifier Mapping Table)

| بخش / موجودیت | شناسه قبلی (Legacy) | شناسه نهایی و قطعی (Sportavand) | استراتژی مهاجرت و سازگاری |
|---|---|---|---|
| **نام و عنوان محصول** | `BMSS` / `SportNova` / `ورزش‌یار` | `Sportavand` / `اسپورتاوند — سامانه جامع مدیریت ورزش` | جایگزینی کامل در رابط کاربری، هدر، پابرگ، متاتگ‌ها و مستندات |
| **شعار و دامنه محصول** | — / `fwa.ir` (دامنه باشگاه) | `از سامان تا اوج` / `sportavand.ir` | تفکیک دامنه رسمی محصول (`sportavand.ir`) از دامنه باشگاه مشتری (`fwa.ir`) |
| **پوشه و فایل اصلی افزونه** | `sportnova/sportnova.php` | `sportavand/sportavand.php` | غیرفعال‌سازی خودکار افزونه قدیمی هنگام فعال‌سازی `sportavand` |
| **Text Domain** | `sportnova` | `sportavand` | بارگذاری فایل‌های ترجمه از `/languages` |
| **PHP Namespace** | بدون فضای نام / `SportNova` | `Sportavand` و `Sportavand\Modules\Basketball` | جداسازی کامل کلاس‌های هسته و ماژول بسکتبال |
| **شناسه ماژول بسکتبال** | `sportnova-basketball` | `sportavand-basketball` | به‌روزرسانی خودکار ستون `sport_module` در جدول `workspaces` |
| **ثابت‌های سراسری** | `SPORTNOVA_VERSION`, `SPORTNOVA_*` | `SPORTAVAND_VERSION` (`0.6.0`), `SPORTAVAND_*` | منبع واحد حقیقت نسخه در فایل اصلی افزونه |
| **۹ جدول اختصاصی دیتابیس** | `{$wpdb->prefix}sportnova_*` | `{$wpdb->prefix}sportavand_*` | انتقال ایمن رکوردها با `INSERT IGNORE` و حفظ جداول قدیمی به‌عنوان پشتیبان |
| **فضای نام REST API** | `/wp-json/sportnova/v1/*` | `/wp-json/sportavand/v1/*` | ثبت مسیر اصلی `sportavand/v1` + پشتیبانی از مسیر قبلی در لایه سازگاری |
| **شورت‌کدهای وردپرس** | `[sportnova_form]`, `[sportnova_roster]` | `[sportavand_form]`, `[sportavand_roster]`, `[sportavand_app]` | ثبت شورت‌کدهای جدید + پشتیبانی از شورت‌کدهای قبلی در برگه‌های موجود |
| **بلوک‌های گوتنبرگ** | — | `sportavand/intake-form`, `sportavand/team-roster` | ثبت در فضای نام استاندارد `sportavand/*` |
| **پست‌تایپ و تاکسونومی** | `sportnova_*` | `spv_announcement`, `spv_age_cat` (`spv_*`) | رعایت سقف ۲۰ کاراکتر وردپرس برای جلوگیری از خطای ثبت |
| **کلاس‌ها و متغیرهای CSS** | `.sportnova-*` | `.spv-*` و `--spv-*` | ایزولاسیون کامل در برابر المنتور و قالب‌های وردپرس |
| **هندل اسکریپت و استایل** | `sportnova-app-js`, `sportnova-app-css` | `sportavand-app-js`, `sportavand-app-css`, `sportavand-vazir-font` | بارگذاری باندل با شیء تنظیمات `sportavandSettings` |
| **گزینه‌ها (Options)** | `sportnova_version`, `sportnova_settings`, ... | `sportavand_version`, `sportavand_settings`, ... | انتقال با `get_option` / `update_option` جهت حفظ سلامت داده‌های سریالایز |
| **متادیتای کاربر و پست** | `sportnova_*`, `_sportnova_*` | `sportavand_*`, `_sportavand_*` | کپی کلیدهای متا با `maybe_unserialize` بدون بازنویسی مقادیر جدید |
| **نقش‌ها و دسترسی‌ها** | `sportnova_manager` | `sportavand_manager` (`sportavand_manage`, `sportavand_review`) | اعطای نقش و دسترسی جدید به مدیران فعلی |
| **کرون‌جاب (WP-Cron)** | `sportnova_daily_maintenance` | `sportavand_daily_maintenance` | پاک‌سازی هوک‌های قدیمی و ثبت یک‌باره هوک جدید |

---

## ۳. مراحل گام‌به‌گام ارتقا در وردپرس (Step-by-Step Upgrade Procedure)

1. **تهیه نسخه پشتیبان (توصیه استاندارد):**
   پیش از هر ارتقای ماژور در وردپرس، یک خروجی SQL از دیتابیس هاست تهیه کنید.
2. **نصب بسته جدید `sportavand-v0.6.0.zip`:**
   - در پیشخوان وردپرس به **افزونه‌ها > افزودن افزونه > بارگذاری افزونه** بروید.
   - فایل `sportavand-v0.6.0.zip` را انتخاب و نصب کنید.
3. **فعال‌سازی افزونه `Sportavand`:**
   - روی **فعال‌سازی افزونه** کلیک کنید.
   - در لحظه فعال‌سازی:
     - اگر افزونه قدیمی `sportnova/sportnova.php` فعال باشد، به‌صورت خودکار غیرفعال می‌شود تا تداخل توابع رخ ندهد.
     - ۹ جدول `wp_sportavand_*` ساخته می‌شوند.
     - تمام رکوردهای موجود در جداول قدیمی (`persons`, `memberships`, `organizations`, `workspaces`, `audit_events`, ...) به جداول جدید منتقل می‌شوند.
4. **بررسی گزارش مهاجرت:**
   - در منوی پیشخوان به **اسپورتاوند (Sportavand) > مهاجرت و نگاشت** بروید و وضعیت `completed_verified` و تعداد رکوردهای ۹ جدول را مشاهده کنید.
5. **به‌روزرسانی تدریجی شورت‌کدها (اختیاری):**
   - شورت‌کدهای قبلی در برگه‌هایی مانند `fwa.ir/register` همچنان کار می‌کنند، اما توصیه می‌شود در فرصت مناسب آن‌ها را به `[sportavand_form id="17"]` و `[sportavand_roster team_id="1"]` تغییر دهید.

---

## ۴. راهنمای بازیابی و بازگشت (Rollback & Recovery Procedure)
از آنجا که موتور مهاجرت `Sportavand_Migrator` جداول قدیمی و گزینه‌های قبلی را حذف نمی‌کند:
- در صورت بروز هرگونه خطای پیش‌بینی‌نشده در سرور مقصد، کافی است افزونه `Sportavand` را غیرفعال کنید.
- کلیه داده‌های قبلی در جداول قدیمی بدون هیچ تغییری دست‌نخورده باقی مانده‌اند.
- برای اجرای مجدد مهاجرت پس از رفع مشکل، می‌توانید گزینه `sportavand_migration_version` را از جدول `wp_options` پاک کنید یا افزونه را یک بار غیرفعال و مجدداً فعال نمایید.
