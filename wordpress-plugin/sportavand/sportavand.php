<?php
/**
 * Plugin Name:       Sportavand
 * Plugin URI:        https://sportavand.ir
 * Description:       اسپورتاوند — سامانه جامع مدیریت ورزش (از سامان تا اوج). پلتفرم ماژولار مدیریت هویت یکتای ورزشکاران، عضویت چندنقشی، کارت دیجیتال هوشمند، روستر مسابقات و ۹ جدول رابطه‌ای اختصاصی با ماژول اسپورتاوند بسکتبال (Sportavand Basketball).
 * Version:           0.6.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Massoud Ebrahimimanesh
 * Author URI:        https://sportavand.ir
 * License:           GPL-2.0+
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       sportavand
 * Domain Path:       /languages
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Single Source of Truth: Global Core Constants (SPORTAVAND_*)
define('SPORTAVAND_VERSION', '0.6.0');
define('SPORTAVAND_VERSION_FA', '۰٫۶٫۰');
define('SPORTAVAND_DB_VERSION', '6.0.0');
define('SPORTAVAND_MIGRATION_VERSION', '0.6.0');
define('SPORTAVAND_PLUGIN_FILE', __FILE__);
define('SPORTAVAND_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SPORTAVAND_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SPORTAVAND_BASENAME', plugin_basename(__FILE__));
define('SPORTAVAND_REST_NAMESPACE', 'sportavand/v1');
define('SPORTAVAND_BASKETBALL_MODULE_ID', 'sportavand-basketball');

// Autoload Core & Basketball Module Includes
require_once SPORTAVAND_PLUGIN_DIR . 'includes/class-sportavand-db.php';
require_once SPORTAVAND_PLUGIN_DIR . 'includes/class-sportavand-migrator.php';
require_once SPORTAVAND_PLUGIN_DIR . 'includes/class-sportavand-api.php';
require_once SPORTAVAND_PLUGIN_DIR . 'includes/class-sportavand-shortcodes.php';
require_once SPORTAVAND_PLUGIN_DIR . 'includes/class-sportavand-admin.php';

/**
 * Helper: Format English digits to Persian digits
 *
 * @param string $str Input string.
 * @return string
 */
function sportavand_to_persian_digits($str) {
    $en = array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.');
    $fa = array('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '٫');
    return str_replace($en, $fa, (string) $str);
}

/**
 * Reusable Footer Renderer (Single Source of Truth for PHP Admin & Shortcode Views)
 *
 * @param string $section_name Current section or module name.
 * @param string $lang         'fa' or 'en'.
 * @return string HTML footer markup.
 */
function sportavand_render_footer($section_name = 'هسته پلتفرم', $lang = 'fa') {
    $year = gmdate('Y');
    if ($lang === 'en') {
        $sec = $section_name ? $section_name : 'Core Platform';
        return sprintf(
            '<footer class="spv-footer" dir="ltr" style="border-top: 1px solid #1e293b; background: #020617; padding: 1rem; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 1.5rem; border-radius: 0 0 12px 12px;">
                <div style="color: #e2e8f0; font-weight: 600;">Sportavand — Sports Management Platform &middot; %s &middot; Version %s</div>
                <div style="margin-top: 4px; font-size: 11px; color: #94a3b8;">Designed &amp; Developed by Massoud Ebrahimimanesh &middot; <a href="https://sportavand.ir" target="_blank" rel="noopener noreferrer" style="color: #fbbf24; text-decoration: none;">sportavand.ir</a> &middot; &copy; %s</div>
            </footer>',
            esc_html($sec),
            esc_html(SPORTAVAND_VERSION),
            esc_html($year)
        );
    }

    $version_fa = sportavand_to_persian_digits(SPORTAVAND_VERSION);
    return sprintf(
        '<footer class="spv-footer" dir="rtl" style="border-top: 1px solid #1e293b; background: #020617; padding: 1rem; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 1.5rem; border-radius: 0 0 12px 12px; font-family: \'Vazirmatn\', -apple-system, sans-serif;">
            <div style="color: #e2e8f0; font-weight: 600;">اسپورتاوند | Sportavand — سامانه جامع مدیریت ورزش &middot; %s &middot; نسخه %s</div>
            <div style="margin-top: 4px; font-size: 11px; color: #94a3b8;">طراحی و توسعه: Massoud Ebrahimimanesh &middot; <a href="https://sportavand.ir" target="_blank" rel="noopener noreferrer" style="color: #fbbf24; text-decoration: none;">sportavand.ir</a> &middot; &copy; %s</div>
        </footer>',
        esc_html($section_name),
        esc_html($version_fa),
        esc_html($year)
    );
}

/**
 * Activation Hook: Create 9 custom relational tables and run safe idempotent migration
 */
function sportavand_activate_plugin() {
    // 1. Deactivate legacy plugins if active to prevent dual-plugin conflict
    Sportavand_Migrator::deactivate_legacy_plugins();

    // 2. Install / verify 9 canonical sportavand_* tables
    Sportavand_DB::install();

    // 3. Run safe, idempotent migration from legacy tables/options/meta if present
    Sportavand_Migrator::maybe_run_migrations();

    // 4. Update canonical version options
    update_option('sportavand_version', SPORTAVAND_VERSION);
    update_option('sportavand_db_version', SPORTAVAND_DB_VERSION);

    // 5. Schedule single maintenance cron (clearing legacy cron hooks)
    Sportavand_Migrator::migrate_cron_jobs();

    flush_rewrite_rules();
}
\register_activation_hook(__FILE__, __NAMESPACE__ . '\\sportavand_activate_plugin');

/**
 * Deactivation Hook
 */
function sportavand_deactivate_plugin() {
    wp_clear_scheduled_hook('sportavand_daily_maintenance');
    flush_rewrite_rules();
}
\register_deactivation_hook(__FILE__, __NAMESPACE__ . '\\sportavand_deactivate_plugin');

/**
 * Register Optional Custom Post Types & Taxonomies with spv_* prefix (<= 20 chars)
 */
function sportavand_register_cpts_and_taxonomies() {
    register_post_type('spv_announcement', array(
        'labels' => array(
            'name'          => __('اطلاعیه‌های اسپورتاوند', 'sportavand'),
            'singular_name' => __('اطلاعیه ورزشی', 'sportavand'),
        ),
        'public'       => false,
        'show_ui'      => false,
        'supports'     => array('title', 'editor'),
        'rewrite'      => array('slug' => 'spv-announcement'),
        'show_in_rest' => true,
    ));

    register_taxonomy('spv_age_cat', array('spv_announcement'), array(
        'labels' => array(
            'name'          => __('رده‌های سنی اسپورتاوند', 'sportavand'),
            'singular_name' => __('رده سنی', 'sportavand'),
        ),
        'public'       => false,
        'show_ui'      => false,
        'hierarchical' => true,
        'rewrite'      => array('slug' => 'spv-age-category'),
        'show_in_rest' => true,
    ));
}

/**
 * Initialize Plugin Components
 */
function sportavand_init() {
    // Load text domain for translations
    load_plugin_textdomain('sportavand', false, dirname(SPORTAVAND_BASENAME) . '/languages');

    // Register spv_* CPTs and Taxonomies
    sportavand_register_cpts_and_taxonomies();

    // Initialize Official & Backward-Compatible Shortcodes + Gutenberg Blocks
    Sportavand_Shortcodes::init();

    // Check DB version & run versioned migration only once when version changes
    if (get_option('sportavand_db_version') !== SPORTAVAND_DB_VERSION) {
        Sportavand_DB::install();
    }
    if (get_option('sportavand_migration_version') !== SPORTAVAND_MIGRATION_VERSION) {
        Sportavand_Migrator::maybe_run_migrations();
    }
}
\add_action('init', __NAMESPACE__ . '\\sportavand_init');

/**
 * Register REST API Routes (sportavand/v1 + backward-compat alias)
 */
\add_action('rest_api_init', array(__NAMESPACE__ . '\\Sportavand_API', 'register_routes'));

/**
 * Register WordPress Admin Menu & Submenus
 */
\add_action('admin_menu', array(__NAMESPACE__ . '\\Sportavand_Admin', 'register_menus'));

/**
 * Enqueue Frontend Scripts & Styles for Shortcodes (including Elementor pages)
 */
function sportavand_enqueue_frontend_scripts() {
    global $post;
    $should_enqueue = false;

    $shortcodes_to_check = array(
        'sportavand_form',
        'sportavand_roster',
        'sportavand_app',
        // Legacy compatibility shortcodes so existing pages never break on upgrade
        'sportnova_form',
        'sportnova_roster',
    );

    if (is_a($post, 'WP_Post')) {
        foreach ($shortcodes_to_check as $sc) {
            if (has_shortcode($post->post_content, $sc)) {
                $should_enqueue = true;
                break;
            }
        }

        // Also check Elementor _elementor_data postmeta so Elementor pages enqueue CSS in <head>
        if (!$should_enqueue) {
            $elementor_data = get_post_meta($post->ID, '_elementor_data', true);
            if (is_string($elementor_data) && !empty($elementor_data)) {
                foreach ($shortcodes_to_check as $sc) {
                    if (strpos($elementor_data, $sc) !== false) {
                        $should_enqueue = true;
                        break;
                    }
                }
            }
        }
    }

    if ($should_enqueue) {
        sportavand_enqueue_app_assets('frontend');
    }
}
\add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\sportavand_enqueue_frontend_scripts');

/**
 * Enqueue Admin Scripts & Styles for all Sportavand Admin pages (including Persian submenu hooks)
 */
function sportavand_enqueue_admin_scripts($hook) {
    $current_page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';
    if (
        strpos((string) $hook, 'sportavand') !== false ||
        strpos($current_page, 'sportavand') === 0
    ) {
        sportavand_enqueue_app_assets('admin');
    }
}
\add_action('admin_enqueue_scripts', __NAMESPACE__ . '\\sportavand_enqueue_admin_scripts');

/**
 * Helper to register and enqueue compiled assets & typography with sportavand-* handles
 */
function sportavand_enqueue_app_assets($context = 'frontend') {
    // Enqueue Vazirmatn & JetBrains Mono fonts
    wp_enqueue_style(
        'sportavand-vazir-font',
        'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap',
        array(),
        null
    );

    $bundle_js       = SPORTAVAND_PLUGIN_URL . 'assets/sportavand-bundle.js';
    $bundle_css      = SPORTAVAND_PLUGIN_URL . 'assets/sportavand-bundle.css';
    $bundle_js_path  = SPORTAVAND_PLUGIN_DIR . 'assets/sportavand-bundle.js';
    $bundle_css_path = SPORTAVAND_PLUGIN_DIR . 'assets/sportavand-bundle.css';

    $version = file_exists($bundle_js_path) ? filemtime($bundle_js_path) : SPORTAVAND_VERSION;

    if (file_exists($bundle_css_path)) {
        wp_enqueue_style('sportavand-app-css', $bundle_css, array('sportavand-vazir-font'), $version);
    }

    if (file_exists($bundle_js_path)) {
        wp_enqueue_script('sportavand-app-js', $bundle_js, array(), $version, true);

        // Determine default active tab based on WordPress Admin submenu page
        $current_page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';
        $default_tab  = 'team';
        if ($current_page === 'sportavand-roster') {
            $default_tab = 'player';
        } elseif ($current_page === 'sportavand-forms') {
            $default_tab = 'intake';
        } elseif ($current_page === 'sportavand-database') {
            $default_tab = 'database';
        } elseif ($current_page === 'sportavand-migration' || $current_page === 'sportavand-docs') {
            $default_tab = 'brand';
        }

        $settings_payload = array(
            'apiUrl'        => esc_url_raw(rest_url(SPORTAVAND_REST_NAMESPACE)),
            'nonce'         => wp_create_nonce('wp_rest'),
            'siteUrl'       => get_site_url(),
            'currentUserId' => get_current_user_id(),
            'isAdmin'       => current_user_can('manage_options'),
            'isWpAdmin'     => is_admin(),
            'currentPage'   => $current_page,
            'defaultTab'    => $default_tab,
            'context'       => $context,
            'pluginUrl'     => SPORTAVAND_PLUGIN_URL,
            'version'       => SPORTAVAND_VERSION,
            'versionFa'     => SPORTAVAND_VERSION_FA,
            'moduleId'      => SPORTAVAND_BASKETBALL_MODULE_ID,
            'tablesPrefix'  => 'wp_sportavand_',
            'brandDomain'   => 'sportavand.ir',
        );

        // Canonical Sportavand localized settings object
        wp_localize_script('sportavand-app-js', 'sportavandSettings', $settings_payload);
    }
}

/**
 * Plugin action links (Direct link to Dashboard & Docs in Plugins list)
 */
function sportavand_plugin_action_links($links) {
    $custom_links = array(
        '<a href="' . esc_url(admin_url('admin.php?page=sportavand')) . '">' . __('داشبورد اسپورتاوند', 'sportavand') . '</a>',
        '<a href="' . esc_url(admin_url('admin.php?page=sportavand-migration')) . '">' . __('وضعیت مهاجرت', 'sportavand') . '</a>',
        '<a href="' . esc_url(admin_url('admin.php?page=sportavand-docs')) . '">' . __('راهنما و شورت‌کدها', 'sportavand') . '</a>',
    );
    return array_merge($custom_links, $links);
}
\add_filter('plugin_action_links_' . SPORTAVAND_BASENAME, __NAMESPACE__ . '\\sportavand_plugin_action_links');
