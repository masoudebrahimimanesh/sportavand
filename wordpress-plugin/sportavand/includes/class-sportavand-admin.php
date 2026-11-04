<?php
/**
 * WordPress Admin Menu, Migration Inspector, and RTL Portal Loader for Sportavand
 * Namespace: Sportavand
 * Every submenu page mounts the full RTL Sportavand React Portal on its corresponding tab
 * so that the WordPress Admin experience is 100% identical to the AI Studio preview.
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit;
}

class Sportavand_Admin {

    public static function register_menus() {
        // Main Menu (Team & Club Dashboard)
        add_menu_page(
            'اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش',
            'اسپورتاوند (Sportavand)',
            'manage_options',
            'sportavand',
            array(__CLASS__, 'render_main_dashboard'),
            'dashicons-awards',
            26
        );

        // Submenu 1: Team & Club Dashboard
        add_submenu_page(
            'sportavand',
            'اسپورتاوند بسکتبال — داشبورد تیم و باشگاه',
            'داشبورد تیم و باشگاه',
            'manage_options',
            'sportavand',
            array(__CLASS__, 'render_main_dashboard')
        );

        // Submenu 2: Athlete Dossiers & Digital Cards
        add_submenu_page(
            'sportavand',
            'اسپورتاوند بسکتبال — پرونده و کارت دیجیتال بازیکنان',
            'پرونده و کارت بازیکنان',
            'manage_options',
            'sportavand-roster',
            array(__CLASS__, 'render_roster_page')
        );

        // Submenu 3: Form Studio & Shortcodes
        add_submenu_page(
            'sportavand',
            'استودیو فرم ثبت‌نام و شورت‌کدها — اسپورتاوند',
            'استودیو فرم و شورت‌کدها',
            'manage_options',
            'sportavand-forms',
            array(__CLASS__, 'render_forms_page')
        );

        // Submenu 4: Database (9 Tables)
        add_submenu_page(
            'sportavand',
            'وضعیت پایگاه‌داده ۹ جدول اسپورتاوند',
            'پایگاه‌داده ۹ جدول',
            'manage_options',
            'sportavand-database',
            array(__CLASS__, 'render_database_page')
        );

        // Submenu 5: Safe Migration & Identifier Mapping
        add_submenu_page(
            'sportavand',
            'مهاجرت ایمن و نگاشت شناسه‌ها — اسپورتاوند',
            'مهاجرت و نگاشت',
            'manage_options',
            'sportavand-migration',
            array(__CLASS__, 'render_migration_page')
        );

        // Submenu 6: Shortcodes, Brand & Docs
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
     * Unified RTL Portal Shell Renderer for all WordPress Admin submenus
     *
     * @param string $active_tab   Initial tab to open ('team', 'player', 'intake', 'database', 'brand').
     * @param string $section_name Section label for pre-hydration shell and footer.
     */
    private static function render_portal_shell($active_tab = 'team', $section_name = 'پیشخوان مدیریت هسته') {
        // Ensure assets are enqueued even if admin_enqueue_scripts hook name was encoded
        sportavand_enqueue_app_assets('admin');
        ?>
        <div id="spv-wp-shell" class="wrap spv-admin-wrap spv-app-container spv-scope" dir="rtl">
            <h1 class="screen-reader-text" style="display:none !important;">اسپورتاوند | Sportavand</h1>
            <div id="spv-root"
                 class="spv-mount-target spv-scope"
                 dir="rtl"
                 data-mode="admin"
                 data-tab="<?php echo esc_attr($active_tab); ?>">
                <div style="background: #020617; color: #f8fafc; padding: 2.5rem; border-radius: 16px; border: 1px solid #1e293b; direction: rtl; text-align: right; font-family: 'Vazirmatn', -apple-system, sans-serif;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid #1e293b; padding-bottom: 1.25rem;">
                        <div>
                            <div style="color: #fbbf24; font-weight: 900; font-size: 1.35rem; margin-bottom: 0.35rem;">
                                اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش
                            </div>
                            <div style="color: #94a3b8; font-size: 0.85rem;">
                                شعار: از سامان تا اوج &middot; بخش فعال: <?php echo esc_html($section_name); ?> &middot; نسخه <?php echo esc_html(SPORTAVAND_VERSION_FA); ?>
                            </div>
                        </div>
                        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; padding: 0.4rem 0.9rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700;">
                            در حال بارگذاری رابط گرافیکی یکپارچه اسپورتاوند (RTL)...
                        </div>
                    </div>
                    <?php echo sportavand_render_footer($section_name, 'fa'); ?>
                </div>
            </div>
        </div>
        <?php
    }

    public static function render_main_dashboard() {
        self::render_portal_shell('team', 'داشبورد تیم و باشگاه (اسپورتاوند بسکتبال)');
    }

    public static function render_roster_page() {
        self::render_portal_shell('player', 'پرونده و کارت دیجیتال بازیکنان');
    }

    public static function render_forms_page() {
        self::render_portal_shell('intake', 'استودیو فرم ثبت‌نام و شورت‌کدها');
    }

    public static function render_database_page() {
        self::render_portal_shell('database', 'وضعیت پایگاه‌داده ۹ جدول');
    }

    public static function render_migration_page() {
        self::render_portal_shell('brand', 'مهاجرت ایمن و نگاشت شناسه‌ها');
    }

    public static function render_docs_page() {
        self::render_portal_shell('brand', 'هویت برند و راهنمای شورت‌کدها');
    }
}
