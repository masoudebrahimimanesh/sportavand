<?php
/**
 * Safe, Versioned, Idempotent Migration Engine for Sportavand
 * Namespace: Sportavand
 *
 * Safely migrates existing installations from legacy identifiers (sportnova_* / bmss_*)
 * to canonical Sportavand (sportavand_* / spv_*) without data loss, without overwriting
 * newer records, and without running repeatedly on every request.
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit;
}

class Sportavand_Migrator {

    const LOCK_TRANSIENT     = 'sportavand_migration_lock';
    const VERSION_OPTION     = 'sportavand_migration_version';
    const REPORT_OPTION      = 'sportavand_migration_report';

    /**
     * Deactivate legacy plugins if active to prevent dual-active conflicts
     */
    public static function deactivate_legacy_plugins() {
        if (!function_exists('deactivate_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $legacy_basenames = array(
            'sportnova/sportnova.php',
            'bmss/bmss.php',
        );
        foreach ($legacy_basenames as $legacy_plugin) {
            if (is_plugin_active($legacy_plugin)) {
                deactivate_plugins($legacy_plugin, true);
            }
        }
    }

    /**
     * Run versioned migrations safely (idempotent, locked, resumable)
     *
     * @param bool $force Force re-verification even if version matches.
     * @return array Migration execution report.
     */
    public static function maybe_run_migrations($force = false) {
        $installed_migration = get_option(self::VERSION_OPTION, '0.0.0');
        if (!$force && version_compare($installed_migration, SPORTAVAND_MIGRATION_VERSION, '>=')) {
            return get_option(self::REPORT_OPTION, array('status' => 'already_up_to_date'));
        }

        // Prevent concurrent execution across parallel requests
        if (get_transient(self::LOCK_TRANSIENT)) {
            return array('status' => 'locked_in_progress');
        }
        set_transient(self::LOCK_TRANSIENT, time(), 120);

        $report = array(
            'started_at'       => current_time('mysql'),
            'from_version'     => $installed_migration,
            'to_version'       => SPORTAVAND_MIGRATION_VERSION,
            'tables_migrated'  => array(),
            'options_migrated' => array(),
            'meta_migrated'    => 0,
            'roles_migrated'   => false,
            'errors'           => array(),
        );

        try {
            // Ensure destination 9 tables exist first
            Sportavand_DB::install();

            // 1. Migrate 9 custom relational tables from legacy prefixes (sportnova_ / bmss_)
            $report['tables_migrated'] = self::migrate_custom_tables();

            // 2. Migrate options & serialized settings safely
            $report['options_migrated'] = self::migrate_options();

            // 3. Migrate usermeta & postmeta keys safely
            $report['meta_migrated'] = self::migrate_meta_keys();

            // 4. Migrate roles & capabilities
            $report['roles_migrated'] = self::migrate_roles_and_caps();

            // 5. Migrate scheduled cron hooks
            self::migrate_cron_jobs();

            // 6. Seed initial data ONLY if no legacy data existed and tables are still empty
            Sportavand_DB::seed_initial_data_if_empty();

            // Record migration in sportavand_migrations table
            Sportavand_DB::record_migration(
                SPORTAVAND_MIGRATION_VERSION,
                'Safe Idempotent Rebrand & Data Migration to Sportavand'
            );

            $report['completed_at'] = current_time('mysql');
            $report['status']       = empty($report['errors']) ? 'completed_verified' : 'completed_with_warnings';

            update_option(self::REPORT_OPTION, $report, false);
            update_option(self::VERSION_OPTION, SPORTAVAND_MIGRATION_VERSION, true);
        } catch (\Throwable $e) {
            $report['status']   = 'failed_recoverable';
            $report['errors'][] = $e->getMessage();
            update_option(self::REPORT_OPTION, $report, false);
        } finally {
            delete_transient(self::LOCK_TRANSIENT);
        }

        return $report;
    }

    /**
     * Copy rows from legacy tables ({$wpdb->prefix}sportnova_* or {$wpdb->prefix}bmss_*)
     * into {$wpdb->prefix}sportavand_* without overwriting newer records and without dropping legacy tables.
     */
    public static function migrate_custom_tables() {
        global $wpdb;
        $dest_tables = Sportavand_DB::get_table_names();
        $legacy_prefixes = array(
            $wpdb->prefix . 'sportnova_',
            $wpdb->prefix . 'bmss_',
        );

        $table_results = array();

        foreach ($dest_tables as $key => $dest_table) {
            foreach ($legacy_prefixes as $legacy_prefix) {
                $source_table = $legacy_prefix . $key;
                $source_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $source_table));
                if (!$source_exists) {
                    continue;
                }

                $source_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM `{$source_table}`");
                if ($source_count === 0) {
                    $table_results[$key] = array(
                        'source'       => $source_table,
                        'destination'  => $dest_table,
                        'source_rows'  => 0,
                        'copied_rows'  => 0,
                        'verified'     => true,
                        'legacy_kept'  => true,
                    );
                    continue;
                }

                // Get shared columns between source and destination tables to ensure safe INSERT IGNORE
                $src_cols  = $wpdb->get_col("DESC `{$source_table}`", 0);
                $dest_cols = $wpdb->get_col("DESC `{$dest_table}`", 0);
                $common_cols = array_intersect($src_cols, $dest_cols);

                if (!empty($common_cols)) {
                    $escaped_cols = array_map(function($c) {
                        return '`' . esc_sql($c) . '`';
                    }, $common_cols);
                    $cols_sql = implode(', ', $escaped_cols);

                    // INSERT IGNORE preserves primary keys, unique national_code, and never overwrites newer destination rows
                    $wpdb->query("INSERT IGNORE INTO `{$dest_table}` ({$cols_sql}) SELECT {$cols_sql} FROM `{$source_table}`");
                }

                // Update legacy module identifiers inside workspaces table after copy
                if ($key === 'workspaces') {
                    $wpdb->query(
                        $wpdb->prepare(
                            "UPDATE `{$dest_table}` SET sport_module = %s WHERE sport_module IN ('sportnova-basketball', 'bmss-basketball')",
                            SPORTAVAND_BASKETBALL_MODULE_ID
                        )
                    );
                }

                // Update legacy system_title inside installations table
                if ($key === 'installations') {
                    $wpdb->query(
                        $wpdb->prepare(
                            "UPDATE `{$dest_table}` SET system_title = %s WHERE system_title LIKE %s OR system_title LIKE %s",
                            'Sportavand Sports Management Platform',
                            '%SportNova%',
                            '%BMSS%'
                        )
                    );
                }

                $dest_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM `{$dest_table}`");
                $table_results[$key] = array(
                    'source'       => $source_table,
                    'destination'  => $dest_table,
                    'source_rows'  => $source_count,
                    'dest_rows'    => $dest_count,
                    'verified'     => ($dest_count >= $source_count),
                    'legacy_kept'  => true, // Old tables are preserved until explicit admin cleanup
                );
            }
        }

        return $table_results;
    }

    /**
     * Migrate WordPress options without overwriting existing sportavand_* options
     * Uses get_option / update_option so PHP serialized arrays/objects remain 100% intact.
     */
    public static function migrate_options() {
        $option_map = array(
            'sportnova_version'          => 'sportavand_version',
            'sportnova_db_version'       => 'sportavand_db_version',
            'sportnova_roster_published' => 'sportavand_roster_published',
            'sportnova_settings'         => 'sportavand_settings',
            'sportnova_active_modules'   => 'sportavand_active_modules',
            'bmss_roster_published'      => 'sportavand_roster_published',
            'bmss_settings'              => 'sportavand_settings',
        );

        $migrated = array();
        foreach ($option_map as $old_key => $new_key) {
            $old_val = get_option($old_key, null);
            if ($old_val !== null) {
                $existing_new = get_option($new_key, null);
                if ($existing_new === null) {
                    // Safely normalize module IDs inside arrays/strings without breaking serialization
                    $normalized_val = self::normalize_legacy_value($old_val);
                    update_option($new_key, $normalized_val);
                    $migrated[$old_key] = $new_key;
                }
            }
        }
        return $migrated;
    }

    /**
     * Recursively normalize legacy module identifiers inside unserialized values
     */
    private static function normalize_legacy_value($value) {
        if (is_array($value)) {
            $out = array();
            foreach ($value as $k => $v) {
                $new_k = str_replace(array('sportnova', 'bmss'), 'sportavand', (string) $k);
                $out[$new_k] = self::normalize_legacy_value($v);
            }
            return $out;
        }
        if (is_string($value)) {
            return str_replace(
                array('sportnova-basketball', 'bmss-basketball'),
                SPORTAVAND_BASKETBALL_MODULE_ID,
                $value
            );
        }
        return $value;
    }

    /**
     * Migrate usermeta and postmeta keys from sportnova_* / bmss_* to sportavand_*
     */
    public static function migrate_meta_keys() {
        global $wpdb;
        $count = 0;

        // Copy usermeta keys if destination key does not already exist for that user
        $usermeta_rows = $wpdb->get_results(
            "SELECT user_id, meta_key, meta_value FROM {$wpdb->usermeta}
             WHERE meta_key LIKE 'sportnova_%' OR meta_key LIKE 'bmss_%'",
            ARRAY_A
        );
        if (!empty($usermeta_rows)) {
            foreach ($usermeta_rows as $row) {
                $new_key = preg_replace('/^(sportnova_|bmss_)/', 'sportavand_', $row['meta_key']);
                $exists  = get_metadata('user', (int) $row['user_id'], $new_key, true);
                if ($exists === '' || $exists === false) {
                    $val = maybe_unserialize($row['meta_value']);
                    update_user_meta((int) $row['user_id'], $new_key, self::normalize_legacy_value($val));
                    $count++;
                }
            }
        }

        // Copy postmeta keys if destination key does not already exist for that post
        $postmeta_rows = $wpdb->get_results(
            "SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta}
             WHERE meta_key LIKE 'sportnova_%' OR meta_key LIKE 'bmss_%' OR meta_key LIKE '_sportnova_%'",
            ARRAY_A
        );
        if (!empty($postmeta_rows)) {
            foreach ($postmeta_rows as $row) {
                $new_key = preg_replace('/^(_?)(sportnova_|bmss_)/', '$1sportavand_', $row['meta_key']);
                $exists  = get_metadata('post', (int) $row['post_id'], $new_key, true);
                if ($exists === '' || $exists === false) {
                    $val = maybe_unserialize($row['meta_value']);
                    update_post_meta((int) $row['post_id'], $new_key, self::normalize_legacy_value($val));
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Register canonical Sportavand roles/capabilities and migrate users with legacy roles
     */
    public static function migrate_roles_and_caps() {
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap('sportavand_manage');
            $admin_role->add_cap('sportavand_review');
            $admin_role->add_cap('sportavand_export');
        }

        // Add Sportavand Club Manager role
        add_role(
            'sportavand_manager',
            __('مدیر باشگاه اسپورتاوند', 'sportavand'),
            array(
                'read'              => true,
                'sportavand_manage' => true,
                'sportavand_review' => true,
                'sportavand_export' => true,
            )
        );

        // Migrate users assigned to legacy roles
        $legacy_roles = array('sportnova_manager', 'bmss_manager');
        foreach ($legacy_roles as $old_role) {
            $users = get_users(array('role' => $old_role));
            foreach ($users as $user) {
                $user->add_role('sportavand_manager');
            }
        }

        return true;
    }

    /**
     * Clear legacy cron hooks and schedule single canonical Sportavand maintenance hook
     */
    public static function migrate_cron_jobs() {
        wp_clear_scheduled_hook('sportnova_daily_maintenance');
        wp_clear_scheduled_hook('bmss_daily_maintenance');

        if (!wp_next_scheduled('sportavand_daily_maintenance')) {
            wp_schedule_event(time() + 3600, 'daily', 'sportavand_daily_maintenance');
        }
    }

    /**
     * Get the complete Old-to-New Identifier Mapping Table for Admin Inspection
     */
    public static function get_identifier_mapping() {
        return array(
            array(
                'category' => 'نام و فایل اصلی افزونه (Plugin & Main File)',
                'legacy'   => 'sportnova/sportnova.php (SportNova | ورزش‌یار)',
                'current'  => 'sportavand/sportavand.php (Sportavand | اسپورتاوند)',
                'strategy' => 'غیرفعال‌سازی خودکار افزونه قدیمی هنگام فعال‌سازی اسپورتاوند',
            ),
            array(
                'category' => 'فضای نام و ماژول اول (PHP Namespace & Module ID)',
                'legacy'   => 'SportNova / sportnova-basketball',
                'current'  => 'Sportavand & Sportavand\Modules\Basketball / sportavand-basketball',
                'strategy' => 'به‌روزرسانی خودکار ستون sport_module در جدول workspaces',
            ),
            array(
                'category' => 'ثابت‌های سراسری (Global Constants)',
                'legacy'   => 'SPORTNOVA_VERSION, SPORTNOVA_DB_VERSION, SPORTNOVA_PLUGIN_DIR',
                'current'  => 'SPORTAVAND_VERSION, SPORTAVAND_DB_VERSION, SPORTAVAND_PLUGIN_DIR',
                'strategy' => 'تعریف متمرکز در فایل اصلی sportavand.php (تک‌منبع حقیقت نسخه)',
            ),
            array(
                'category' => '۹ جدول اختصاصی دیتابیس (Custom DB Tables)',
                'legacy'   => '{$wpdb->prefix}sportnova_* (و {$wpdb->prefix}bmss_*)',
                'current'  => '{$wpdb->prefix}sportavand_* (۹ جدول رابطه‌ای)',
                'strategy' => 'کپی ایمن با INSERT IGNORE با حفظ کلیدهای اصلی و کدملی و نگهداری جداول قدیم تا تأیید نهایی',
            ),
            array(
                'category' => 'مسیرهای REST API (REST Namespace)',
                'legacy'   => '/wp-json/sportnova/v1/*',
                'current'  => '/wp-json/sportavand/v1/*',
                'strategy' => 'ثبت مسیر اصلی sportavand/v1 به همراه پشتیبانی سازگار از مسیر قبلی در لایه مهاجرت',
            ),
            array(
                'category' => 'شورت‌کدها (Shortcodes)',
                'legacy'   => '[sportnova_form], [sportnova_roster]',
                'current'  => '[sportavand_form], [sportavand_roster], [sportavand_app]',
                'strategy' => 'ثبت شورت‌کدهای جدید + پشتیبانی کامل از شورت‌کدهای قبلی در صفحات موجود بدون شکستگی',
            ),
            array(
                'category' => 'کلاس‌ها و متغیرهای CSS و هندل‌های اسکریپت',
                'legacy'   => '.sportnova-* / sportnova-app-js / sportnova-app-css',
                'current'  => '.spv-* , --spv-* / sportavand-app-js / sportavand-app-css',
                'strategy' => 'پشتیبانی همزمان از سلکتورهای .spv-* و سلکتورهای قبلی برای حفظ کامل استایل برگه‌ها',
            ),
            array(
                'category' => 'پست‌تایپ‌ها و تاکسونومی‌ها (CPTs & Taxonomies)',
                'legacy'   => 'sportnova_*',
                'current'  => 'spv_announcement, spv_age_cat (پیشوند استاندارد spv_*)',
                'strategy' => 'رعایت سقف ۲۰ کاراکتر وردپرس و جلوگیری از تداخل نام‌ها',
            ),
            array(
                'category' => 'گزینه‌ها، متادیتا، نقش‌ها و کرون‌جاب (Options, Meta, Roles, Cron)',
                'legacy'   => 'sportnova_* / sportnova_manager / sportnova_daily_maintenance',
                'current'  => 'sportavand_* / sportavand_manager / sportavand_daily_maintenance',
                'strategy' => 'مهاجرت سریالایز امن با get_option/update_option و حذف کرون‌های تکراری قدیمی',
            ),
        );
    }
}
