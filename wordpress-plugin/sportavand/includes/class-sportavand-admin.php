<?php
/**
 * WordPress Admin Menu, Migration Inspector, and Dashboard for Sportavand
 * Namespace: Sportavand
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit;
}

class Sportavand_Admin {

    public static function register_menus() {
        // Main Menu
        add_menu_page(
            'اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش',
            'اسپورتاوند (Sportavand)',
            'manage_options',
            'sportavand',
            array(__CLASS__, 'render_main_dashboard'),
            'dashicons-awards',
            26
        );

        // Submenu: Roster (Sportavand Basketball)
        add_submenu_page(
            'sportavand',
            'اسپورتاوند بسکتبال — فهرست و روستر تیم‌ها',
            'روستر و بازیکنان',
            'manage_options',
            'sportavand-roster',
            array(__CLASS__, 'render_roster_page')
        );

        // Submenu: Database (9 Tables)
        add_submenu_page(
            'sportavand',
            'وضعیت پایگاه‌داده ۹ جدول اسپورتاوند',
            'پایگاه‌داده ۹ جدول',
            'manage_options',
            'sportavand-database',
            array(__CLASS__, 'render_database_page')
        );

        // Submenu: Safe Migration & Identifier Mapping
        add_submenu_page(
            'sportavand',
            'مهاجرت ایمن و نگاشت شناسه‌ها — اسپورتاوند',
            'مهاجرت و نگاشت',
            'manage_options',
            'sportavand-migration',
            array(__CLASS__, 'render_migration_page')
        );

        // Submenu: Shortcodes, Brand & Docs
        add_submenu_page(
            'sportavand',
            'شورت‌کدها، هویت برند و راهنما — اسپورتاوند',
            'شورت‌کدها و درباره ما',
            'manage_options',
            'sportavand-docs',
            array(__CLASS__, 'render_docs_page')
        );
    }

    /**
     * Main Dashboard Page
     */
    public static function render_main_dashboard() {
        ?>
        <div class="wrap spv-admin-wrap" dir="rtl" style="font-family: 'Vazirmatn', -apple-system, sans-serif;">
            <h1 style="display:none;">اسپورتاوند | Sportavand</h1>
            <div id="spv-root" class="spv-mount-target" data-mode="admin">
                <div style="background: #0f172a; color: #f8fafc; padding: 2rem; border-radius: 12px; margin-top: 1rem; border: 1px solid #334155;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1rem;">
                        <div>
                            <h2 style="color: #f59e0b; margin: 0; font-size: 1.5rem;">اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش</h2>
                            <p style="color: #94a3b8; margin: 0.5rem 0 0 0; font-size: 0.9rem;">شعار: از سامان تا اوج &middot; ماژول اول: اسپورتاوند بسکتبال (Sportavand Basketball) &middot; نسخه <?php echo esc_html(SPORTAVAND_VERSION_FA); ?></p>
                        </div>
                        <div>
                            <span style="background: #059669; color: #fff; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold;">
                                ۹ جدول دیتابیس آماده و متصل
                            </span>
                        </div>
                    </div>
                    <p style="color: #cbd5e1; line-height: 1.8;">
                        اسپورتاوند سامانه‌ای ماژولار برای مدیریت هوشمند باشگاه‌ها، تیم‌ها، ورزشکاران، رویدادها و فرآیندهای ورزشی است؛ از ثبت و سازمان‌دهی داده‌ها تا تحلیل، رشد و حرفه‌ای‌سازی ورزش. تمام رکوردها مستقیماً در جداول رابطه‌ای اختصاصی <code>wp_sportavand_*</code> ذخیره می‌شوند.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                        <div style="background: #1e293b; padding: 1.25rem; border-radius: 8px; border: 1px solid #334155;">
                            <h3 style="color: #38bdf8; margin-top: 0; font-size: 1.1rem;">استفاده از شورت‌کدهای رسمی در برگه</h3>
                            <p style="color: #94a3b8; font-size: 0.85rem;">فرم ثبت‌نام و جدول روستر را با قرار دادن شورت‌کدهای استاندارد اسپورتاوند در هر برگه وردپرس نمایش دهید:</p>
                            <code style="display: block; background: #0b1120; color: #f59e0b; padding: 0.6rem; border-radius: 6px; font-size: 0.95rem; direction: ltr; text-align: left; margin-bottom: 0.5rem;">[sportavand_form id="17"]</code>
                            <code style="display: block; background: #0b1120; color: #f59e0b; padding: 0.6rem; border-radius: 6px; font-size: 0.95rem; direction: ltr; text-align: left;">[sportavand_roster team_id="1"]</code>
                        </div>
                        <div style="background: #1e293b; padding: 1.25rem; border-radius: 8px; border: 1px solid #334155;">
                            <h3 style="color: #10b981; margin-top: 0; font-size: 1.1rem;">وضعیت پایگاه‌داده و مهاجرت ایمن</h3>
                            <p style="color: #94a3b8; font-size: 0.85rem;">ارتباط مستقیم با ۹ جدول رابطه‌ای دیتابیس بدون فشار به wp_postmeta:</p>
                            <ul style="color: #e2e8f0; font-size: 0.85rem; padding-right: 1.2rem; margin: 0;">
                                <li>قانون یکتا: ۱ شخص = ۱ کد ملی ۱۰ رقمی</li>
                                <li>پشتیبانی از چندنقشی در <code>wp_sportavand_memberships</code></li>
                                <li>مهاجرت خودکار و بدون افت داده از نسخه‌های قبلی</li>
                            </ul>
                        </div>
                    </div>
                    <?php echo sportavand_render_footer('پیشخوان مدیریت هسته', 'fa'); ?>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Submenu: Roster Page (Sportavand Basketball Module)
     */
    public static function render_roster_page() {
        global $wpdb;
        $tables  = Sportavand_DB::get_table_names();
        $members = $wpdb->get_results("
            SELECT m.*, p.first_name, p.last_name, p.national_code, p.photo_url
            FROM {$tables['memberships']} m
            INNER JOIN {$tables['persons']} p ON m.person_id = p.id
            ORDER BY m.id DESC
        ", ARRAY_A);
        ?>
        <div class="wrap spv-admin-wrap" dir="rtl" style="font-family: 'Vazirmatn', -apple-system, sans-serif;">
            <h1 style="color: #1e293b; font-size: 1.5rem; margin-bottom: 1rem;">فهرست اعضا و روستر تیم — اسپورتاوند بسکتبال (Sportavand Basketball)</h1>
            <table class="wp-list-table widefat fixed striped table-view-list" style="border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                    <tr>
                        <th style="width: 60px;">تصویر</th>
                        <th>نام و نام خانوادگی</th>
                        <th>کد ملی</th>
                        <th>نقش</th>
                        <th>شماره پیراهن</th>
                        <th>رده سنی / پست</th>
                        <th>شماره تماس</th>
                        <th>وضعیت بیمه</th>
                        <th>وضعیت عضویت</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($members)): ?>
                        <tr><td colspan="9" style="text-align: center; padding: 2rem;">هنوز عضوی ثبت نشده است. از شورت‌کد <code>[sportavand_form id="17"]</code> برای ثبت‌نام استفاده کنید.</td></tr>
                    <?php else: ?>
                        <?php foreach ($members as $m): ?>
                            <tr>
                                <td>
                                    <img src="<?php echo esc_url($m['photo_url'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'); ?>" 
                                         alt="" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
                                </td>
                                <td><strong><?php echo esc_html($m['first_name'] . ' ' . $m['last_name']); ?></strong></td>
                                <td><code><?php echo esc_html($m['national_code']); ?></code></td>
                                <td><span class="badge" style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-size: 12px;"><?php echo esc_html($m['role']); ?></span></td>
                                <td><strong>#<?php echo esc_html($m['jersey_number']); ?></strong></td>
                                <td><?php echo esc_html($m['team_category'] . ' — ' . $m['position']); ?></td>
                                <td><span dir="ltr"><?php echo esc_html($m['phone'] ?: '—'); ?></span></td>
                                <td>
                                    <?php if ($m['insurance_valid']): ?>
                                        <span style="color: #059669; font-weight: bold;">معتبر (<?php echo esc_html($m['insurance_expiry']); ?>)</span>
                                    <?php else: ?>
                                        <span style="color: #dc2626; font-weight: bold;">منقضی</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <span style="background: #ecfdf5; color: #047857; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
                                        <?php echo esc_html($m['status']); ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
            <?php echo sportavand_render_footer('اسپورتاوند بسکتبال', 'fa'); ?>
        </div>
        <?php
    }

    /**
     * Submenu: Database Status Page (9 Canonical Tables)
     */
    public static function render_database_page() {
        $tables = Sportavand_DB::get_table_status();
        ?>
        <div class="wrap spv-admin-wrap" dir="rtl" style="font-family: 'Vazirmatn', -apple-system, sans-serif;">
            <h1 style="color: #1e293b; font-size: 1.5rem; margin-bottom: 1rem;">وضعیت ۹ جدول اختصاصی پایگاه داده اسپورتاوند (Sportavand)</h1>
            <p style="color: #64748b; margin-bottom: 1.5rem;">
                تمام داده‌های سامانه در جداول استاندارد رابطه‌ای زیر با پیشوند <code>wp_sportavand_*</code> ذخیره می‌شوند.
            </p>
            <table class="wp-list-table widefat fixed striped" style="border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr>
                        <th style="width: 40px;">#</th>
                        <th>نام جدول فیزیکی (MySQL)</th>
                        <th>کاربرد در معماری اسپورتاوند</th>
                        <th>وضعیت در دیتابیس</th>
                        <th>تعداد رکورد فعلی</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $descriptions = array(
                        'migrations'    => 'پیگیری لاگ ساختار و نسخه‌های مهاجرت دیتابیس',
                        'installations' => 'اطلاعات نصب، شناسه یکتای سیستم و تنظیمات سراسری',
                        'organizations' => 'باشگاه‌ها، هیئت‌های استانی، فدراسیون و آکادمی‌ها',
                        'workspaces'    => 'فضاهای کاری چندمستأجری رشته‌ها (sportavand-basketball)',
                        'audit_events'  => 'لاگ ممیزی امنیتی و ثبت تغییرات و تصمیمات مأموران',
                        'persons'       => 'پرونده هویتی یکتای هر انسان با کلید کدملی ۱۰ رقمی',
                        'account_links' => 'اتصال شناسه‌های کاربران وردپرس به شخص',
                        'memberships'   => 'عضویت‌ها، رده‌های سنی، شماره پیراهن و چندنقشی',
                        'reviewers'     => 'بازبین‌ها و ناظران تأیید مدارک باشگاه و هیئت',
                    );
                    $i = 1;
                    foreach ($tables as $key => $t):
                    ?>
                        <tr>
                            <td><?php echo $i++; ?></td>
                            <td><code><?php echo esc_html($t['name']); ?></code></td>
                            <td><?php echo esc_html($descriptions[$key] ?? 'جدول سامانه'); ?></td>
                            <td>
                                <?php if ($t['exists']): ?>
                                    <span style="color: #059669; font-weight: bold;">&#10004; موجود و فعال</span>
                                <?php else: ?>
                                    <span style="color: #dc2626; font-weight: bold;">&#10008; ایجاد نشده</span>
                                <?php endif; ?>
                            </td>
                            <td><strong><?php echo number_format_i18n($t['count']); ?></strong> سطر</td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php echo sportavand_render_footer('مدیریت پایگاه‌داده هسته', 'fa'); ?>
        </div>
        <?php
    }

    /**
     * Submenu: Safe Migration & Identifier Mapping Page
     */
    public static function render_migration_page() {
        $mapping = Sportavand_Migrator::get_identifier_mapping();
        $report  = get_option(Sportavand_Migrator::REPORT_OPTION, array());
        ?>
        <div class="wrap spv-admin-wrap" dir="rtl" style="font-family: 'Vazirmatn', -apple-system, sans-serif;">
            <h1 style="color: #1e293b; font-size: 1.5rem; margin-bottom: 0.75rem;">مهاجرت ایمن نسخه‌دار و جدول نگاشت شناسه‌ها (Sportavand v<?php echo esc_html(SPORTAVAND_VERSION); ?>)</h1>
            <p style="color: #475569; margin-bottom: 1.25rem;">
                موتور مهاجرت اسپورتاوند به‌صورت خودکار، تکرارپذیر (Idempotent) و بدون حذف جداول قبلی، داده‌های موجود را با حفظ کلیدهای اصلی و کدملی به ساختار <code>wp_sportavand_*</code> منتقل می‌کند.
            </p>

            <?php if (!empty($report)): ?>
                <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 1rem 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; color: #065f46;">
                    <strong>وضعیت آخرین مهاجرت:</strong> <?php echo esc_html($report['status'] ?? 'completed'); ?>
                    &middot; <strong>نسخه مهاجرت:</strong> <code><?php echo esc_html($report['to_version'] ?? SPORTAVAND_MIGRATION_VERSION); ?></code>
                    &middot; <strong>زمان تکمیل:</strong> <code><?php echo esc_html($report['completed_at'] ?? current_time('mysql')); ?></code>
                </div>
            <?php endif; ?>

            <table class="wp-list-table widefat fixed striped" style="border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr>
                        <th style="width: 22%;">بخش / موجودیت</th>
                        <th style="width: 26%;">شناسه قدیمی (Legacy)</th>
                        <th style="width: 26%;">شناسه جدید و قطعی (Sportavand)</th>
                        <th style="width: 26%;">استراتژی مهاجرت و سازگاری</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($mapping as $row): ?>
                        <tr>
                            <td><strong><?php echo esc_html($row['category']); ?></strong></td>
                            <td><code style="direction: ltr; display: inline-block;"><?php echo esc_html($row['legacy']); ?></code></td>
                            <td><code style="direction: ltr; display: inline-block; color: #047857; font-weight: bold;"><?php echo esc_html($row['current']); ?></code></td>
                            <td><?php echo esc_html($row['strategy']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php echo sportavand_render_footer('موتور مهاجرت و سازگاری', 'fa'); ?>
        </div>
        <?php
    }

    /**
     * Submenu: Shortcodes, Brand Story & Docs
     */
    public static function render_docs_page() {
        ?>
        <div class="wrap spv-admin-wrap" dir="rtl" style="font-family: 'Vazirmatn', -apple-system, sans-serif; max-width: 960px;">
            <h1 style="color: #1e293b; font-size: 1.5rem; margin-bottom: 1rem;">درباره اسپورتاوند و راهنمای شورت‌کدها</h1>

            <!-- Brand Story Box -->
            <div style="background: #0f172a; color: #f8fafc; padding: 1.75rem; border-radius: 12px; border: 1px solid #334155; margin-bottom: 1.5rem;">
                <div style="color: #f59e0b; font-weight: 800; font-size: 1.25rem; margin-bottom: 0.5rem;">
                    اسپورتاوند — سامانه جامع مدیریت ورزش &middot; از سامان تا اوج
                </div>
                <p style="color: #e2e8f0; line-height: 1.9; font-size: 0.92rem; margin-bottom: 0.9rem;">
                    اسپورتاوند از پیوند دو مفهوم شکل گرفته است: «اسپورت» به‌عنوان زبان مشترک ورزش امروزی، و «وند» به‌عنوان پسوند اصیل فارسی که معنای پیوند، نسبت و تعلق را می‌رساند؛ به این معنا که اسپورتاوند، زیست‌بوم پیوندیافته ورزش، داده، باشگاه و مدیریت حرفه‌ای است.
                </p>
                <p style="color: #cbd5e1; line-height: 1.9; font-size: 0.9rem; margin-bottom: 0.9rem;">
                    در لایه مفهومی و آوایی، این نام یادآور «اروند» است؛ نماد جریان، پویایی و توقف‌ناپذیری، و نیز «الوند»؛ نماد استواری، تکیه‌گاه و اوج. اسپورتاوند بر همین دو پایه بنا شده است: جریان زنده اطلاعات ورزشی بر بستری پایدار، دقیق و قابل اعتماد.
                </p>
                <p style="color: #cbd5e1; line-height: 1.9; font-size: 0.9rem; margin: 0;">
                    اسپورتاوند یک ابزار تک‌منظوره نیست؛ هسته‌ای ماژولار برای مدیریت ورزش است که با ماژول تخصصی بسکتبال آغاز می‌شود و برای گسترش به رشته‌های دیگر، باشگاه‌ها، هیئت‌ها، آکادمی‌ها و مسابقات طراحی شده است.
                </p>
            </div>

            <div style="background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="font-size: 1.15rem; color: #0284c7; margin-top: 0;">۱. شورت‌کد رسمی ثبت‌نام الکترونیکی و استعلام کدملی</h2>
                <p style="color: #475569;">این شورت‌کد را در هر برگه (مانند «ثبت‌نام ورزشکاران») قرار دهید تا فرم هوشمند، اعتبارسنجی ۱۰ رقمی، و بارگذاری مدارک بارگذاری شود:</p>
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 1.1rem; color: #b45309; direction: ltr; text-align: left;">
                    [sportavand_form id="17"]
                </div>
            </div>

            <div style="background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <h2 style="font-size: 1.15rem; color: #059669; margin-top: 0;">۲. شورت‌کد رسمی نمایش روستر و اعضای تیم در سایت</h2>
                <p style="color: #475569;">برای نمایش عمومی اعضای تأییدشده تیم همراه با شماره پیراهن، عکس، رده سنی و کارت دیجیتال:</p>
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 1.1rem; color: #047857; direction: ltr; text-align: left;">
                    [sportavand_roster team_id="1"]
                </div>
            </div>

            <?php echo sportavand_render_footer('مستندات و هویت برند', 'fa'); ?>
        </div>
        <?php
    }
}
