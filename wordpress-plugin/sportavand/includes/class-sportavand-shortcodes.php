<?php
/**
 * Shortcode & Block Handlers for Sportavand
 * Namespace: Sportavand
 * Canonical Shortcodes: [sportavand_form], [sportavand_roster], [sportavand_app]
 * Canonical Blocks: sportavand/intake-form, sportavand/team-roster
 * Includes backward-compatible shortcode aliases so existing WordPress pages never break on upgrade.
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit;
}

class Sportavand_Shortcodes {

    public static function init() {
        // Official Sportavand shortcodes
        add_shortcode('sportavand_form', array(__CLASS__, 'render_form_shortcode'));
        add_shortcode('sportavand_roster', array(__CLASS__, 'render_roster_shortcode'));
        add_shortcode('sportavand_app', array(__CLASS__, 'render_app_shortcode'));

        // Backward-compatibility shortcode aliases for seamless upgrade of existing pages (e.g., fwa.ir/register)
        add_shortcode('sportnova_form', array(__CLASS__, 'render_form_shortcode'));
        add_shortcode('sportnova_roster', array(__CLASS__, 'render_roster_shortcode'));

        // Register Gutenberg Blocks under sportavand/* namespace
        if (function_exists('register_block_type')) {
            register_block_type('sportavand/intake-form', array(
                'render_callback' => array(__CLASS__, 'render_form_shortcode'),
            ));
            register_block_type('sportavand/team-roster', array(
                'render_callback' => array(__CLASS__, 'render_roster_shortcode'),
            ));
        }
    }

    /**
     * Render Registration & Intake Form Shortcode: [sportavand_form id="17"]
     */
    public static function render_form_shortcode($atts) {
        $a = shortcode_atts(array(
            'id'       => '17',
            'category' => 'all',
            'theme'    => 'dark',
        ), $atts, 'sportavand_form');

        // Enqueue bundle
        sportavand_enqueue_app_assets('shortcode-form');

        $mount_id = 'spv-root-form-' . wp_generate_uuid4();

        ob_start();
        ?>
        <div class="spv-app-container spv-theme-<?php echo esc_attr($a['theme']); ?>" dir="rtl">
            <div id="<?php echo esc_attr($mount_id); ?>" 
                 class="spv-mount-target"
                 data-mode="intake" 
                 data-preset-id="<?php echo esc_attr($a['id']); ?>" 
                 data-category="<?php echo esc_attr($a['category']); ?>">
                <div style="padding: 2.5rem; text-align: center; font-family: 'Vazirmatn', -apple-system, sans-serif; background: #0f172a; color: #f8fafc; border-radius: 1rem; border: 1px solid #334155;">
                    <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #f59e0b;">
                        اسپورتاوند | Sportavand — سامانه ثبت‌نام الکترونیکی ورزشکاران
                    </div>
                    <div style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem;">
                        از سامان تا اوج &middot; ماژول اسپورتاوند بسکتبال (Sportavand Basketball)
                    </div>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">
                        در حال بارگذاری فرم استاندارد ثبت‌نام و استعلام کدملی ۱۰ رقمی...
                    </p>
                    <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(245, 158, 11, 0.3); border-top-color: #f59e0b; border-radius: 50%; animation: spv-spin 1s linear infinite;"></div>
                </div>
            </div>
        </div>
        <style>
            @keyframes spv-spin { to { transform: rotate(360deg); } }
        </style>
        <?php
        return ob_get_clean();
    }

    /**
     * Render Team Roster Shortcode: [sportavand_roster team_id="1"]
     */
    public static function render_roster_shortcode($atts) {
        $a = shortcode_atts(array(
            'team_id'  => 'default',
            'category' => 'all',
            'theme'    => 'dark',
        ), $atts, 'sportavand_roster');

        // Enqueue bundle
        sportavand_enqueue_app_assets('shortcode-roster');

        $mount_id = 'spv-root-roster-' . wp_generate_uuid4();

        ob_start();
        ?>
        <div class="spv-app-container spv-theme-<?php echo esc_attr($a['theme']); ?>" dir="rtl">
            <div id="<?php echo esc_attr($mount_id); ?>" 
                 class="spv-mount-target"
                 data-mode="team" 
                 data-team-id="<?php echo esc_attr($a['team_id']); ?>" 
                 data-category="<?php echo esc_attr($a['category']); ?>">
                <div style="padding: 2.5rem; text-align: center; font-family: 'Vazirmatn', -apple-system, sans-serif; background: #0f172a; color: #f8fafc; border-radius: 1rem; border: 1px solid #334155;">
                    <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #f59e0b;">
                        اسپورتاوند | Sportavand — فهرست اعضا و روستر رسمی مسابقات
                    </div>
                    <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">
                        در حال بارگذاری لیست بازیکنان و کادر فنی تأییدشده...
                    </p>
                    <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(245, 158, 11, 0.3); border-top-color: #f59e0b; border-radius: 50%; animation: spv-spin 1s linear infinite;"></div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Render Full Portal / Dashboard Shortcode: [sportavand_app mode="auto"]
     */
    public static function render_app_shortcode($atts) {
        $a = shortcode_atts(array(
            'mode'     => 'auto',
            'id'       => '17',
            'team_id'  => 'default',
            'theme'    => 'dark',
        ), $atts, 'sportavand_app');

        sportavand_enqueue_app_assets('shortcode-app');

        $mount_id = 'spv-root-app-' . wp_generate_uuid4();

        ob_start();
        ?>
        <div class="spv-app-container spv-theme-<?php echo esc_attr($a['theme']); ?>" dir="rtl">
            <div id="<?php echo esc_attr($mount_id); ?>"
                 class="spv-mount-target"
                 data-mode="<?php echo esc_attr($a['mode']); ?>"
                 data-preset-id="<?php echo esc_attr($a['id']); ?>"
                 data-team-id="<?php echo esc_attr($a['team_id']); ?>">
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
