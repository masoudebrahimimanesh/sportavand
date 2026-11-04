<?php
/**
 * Database Management & Canonical 9-Table Schema for Sportavand
 * Namespace: Sportavand
 * Tables prefix: {$wpdb->prefix}sportavand_*
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit;
}

class Sportavand_DB {

    /**
     * List of 9 canonical relational tables for Sportavand
     *
     * @return array<string, string>
     */
    public static function get_table_names() {
        global $wpdb;
        return array(
            'migrations'    => $wpdb->prefix . 'sportavand_migrations',
            'installations' => $wpdb->prefix . 'sportavand_installations',
            'organizations' => $wpdb->prefix . 'sportavand_organizations',
            'workspaces'    => $wpdb->prefix . 'sportavand_workspaces',
            'audit_events'  => $wpdb->prefix . 'sportavand_audit_events',
            'persons'       => $wpdb->prefix . 'sportavand_persons',
            'account_links' => $wpdb->prefix . 'sportavand_account_links',
            'memberships'   => $wpdb->prefix . 'sportavand_memberships',
            'reviewers'     => $wpdb->prefix . 'sportavand_reviewers',
        );
    }

    /**
     * Install / Update the 9 canonical Sportavand relational tables via dbDelta
     */
    public static function install() {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $charset_collate = $wpdb->get_charset_collate();

        $tables = self::get_table_names();

        // Table 1: Migrations
        $sql_migrations = "CREATE TABLE {$tables['migrations']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            version varchar(50) NOT NULL,
            name varchar(191) NOT NULL,
            applied_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uk_version (version)
        ) $charset_collate;";
        dbDelta($sql_migrations);

        // Table 2: Installations
        $sql_installations = "CREATE TABLE {$tables['installations']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            install_uuid varchar(64) NOT NULL,
            system_title varchar(191) NOT NULL DEFAULT 'Sportavand Sports Management Platform',
            public_url varchar(255) DEFAULT '',
            settings_json longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uk_install_uuid (install_uuid)
        ) $charset_collate;";
        dbDelta($sql_installations);

        // Table 3: Organizations (Federation, Board, Club, Academy)
        $sql_orgs = "CREATE TABLE {$tables['organizations']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            name varchar(191) NOT NULL,
            slug varchar(100) NOT NULL,
            org_type varchar(50) NOT NULL DEFAULT 'club',
            province varchar(100) DEFAULT '',
            city varchar(100) DEFAULT '',
            contact_phone varchar(50) DEFAULT '',
            logo_url varchar(255) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uk_slug (slug)
        ) $charset_collate;";
        dbDelta($sql_orgs);

        // Table 4: Workspaces (Multi-tenant sport workspaces, e.g., sportavand-basketball)
        $sql_workspaces = "CREATE TABLE {$tables['workspaces']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            org_id bigint(20) unsigned NOT NULL DEFAULT 1,
            title varchar(191) NOT NULL,
            sport_module varchar(64) NOT NULL DEFAULT 'sportavand-basketball',
            is_active tinyint(1) NOT NULL DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY idx_org_id (org_id)
        ) $charset_collate;";
        dbDelta($sql_workspaces);

        // Table 5: Audit Events
        $sql_audit = "CREATE TABLE {$tables['audit_events']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            person_id bigint(20) unsigned DEFAULT NULL,
            user_id bigint(20) unsigned DEFAULT 0,
            action varchar(100) NOT NULL,
            target_table varchar(64) NOT NULL,
            target_id bigint(20) unsigned NOT NULL,
            details_json text,
            ip_address varchar(45) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY idx_target (target_table, target_id),
            KEY idx_created_at (created_at)
        ) $charset_collate;";
        dbDelta($sql_audit);

        // Table 6: Persons (Civil identity, UNIQUE National Code 10 digits)
        $sql_persons = "CREATE TABLE {$tables['persons']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            national_code varchar(10) NOT NULL,
            first_name varchar(100) NOT NULL,
            last_name varchar(100) NOT NULL,
            father_name varchar(100) DEFAULT '',
            birth_date varchar(20) NOT NULL,
            gender varchar(20) NOT NULL DEFAULT 'male',
            blood_group varchar(10) DEFAULT 'A+',
            photo_url text,
            is_identity_verified tinyint(1) NOT NULL DEFAULT 0,
            can_edit_photo tinyint(1) NOT NULL DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uk_national_code (national_code),
            KEY idx_names (last_name, first_name)
        ) $charset_collate;";
        dbDelta($sql_persons);

        // Table 7: Account Links (WP Users <-> Person record)
        $sql_account_links = "CREATE TABLE {$tables['account_links']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            person_id bigint(20) unsigned NOT NULL,
            wp_user_id bigint(20) unsigned NOT NULL,
            auth_provider varchar(50) NOT NULL DEFAULT 'local',
            provider_uid varchar(191) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY idx_person_id (person_id),
            KEY idx_wp_user_id (wp_user_id)
        ) $charset_collate;";
        dbDelta($sql_account_links);

        // Table 8: Memberships (Multi-role assignments in clubs/teams)
        $sql_memberships = "CREATE TABLE {$tables['memberships']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            person_id bigint(20) unsigned NOT NULL,
            org_id bigint(20) unsigned NOT NULL DEFAULT 1,
            workspace_id bigint(20) unsigned NOT NULL DEFAULT 1,
            role varchar(50) NOT NULL DEFAULT 'player',
            team_category varchar(100) NOT NULL DEFAULT 'نوجوانان (زیر ۱۶ سال)',
            jersey_number varchar(10) DEFAULT '—',
            position varchar(100) DEFAULT '—',
            height varchar(10) DEFAULT '',
            weight varchar(10) DEFAULT '',
            dominant_hand varchar(50) DEFAULT 'راست‌دست',
            phone varchar(30) DEFAULT '',
            parent_phone varchar(30) DEFAULT '',
            emergency_phone varchar(30) DEFAULT '',
            address text,
            insurance_number varchar(100) DEFAULT '',
            insurance_expiry varchar(20) DEFAULT '',
            insurance_valid tinyint(1) NOT NULL DEFAULT 1,
            status varchar(50) NOT NULL DEFAULT 'در انتظار بررسی',
            joined_season varchar(50) DEFAULT 'فصل ۱۴۰۵-۱۴۰۶',
            is_published_public tinyint(1) NOT NULL DEFAULT 1,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY idx_person (person_id),
            KEY idx_team_category (team_category),
            KEY idx_status (status)
        ) $charset_collate;";
        dbDelta($sql_memberships);

        // Table 9: Reviewers
        $sql_reviewers = "CREATE TABLE {$tables['reviewers']} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            org_id bigint(20) unsigned NOT NULL,
            wp_user_id bigint(20) unsigned NOT NULL,
            permission_scope varchar(100) NOT NULL DEFAULT 'full_reviewer',
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY idx_org_user (org_id, wp_user_id)
        ) $charset_collate;";
        dbDelta($sql_reviewers);

        // Record canonical schema installation
        self::record_migration('6.0.0', 'Sportavand Canonical 9-Table Relational Architecture');
    }

    /**
     * Record applied migration in sportavand_migrations table
     */
    public static function record_migration($version, $name) {
        global $wpdb;
        $tables = self::get_table_names();
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$tables['migrations']} WHERE version = %s",
            $version
        ));
        if (!$exists) {
            $wpdb->insert($tables['migrations'], array(
                'version'    => $version,
                'name'       => $name,
                'applied_at' => current_time('mysql'),
            ));
        }
    }

    /**
     * Seed initial starter records ONLY if database is completely empty after legacy migration check
     */
    public static function seed_initial_data_if_empty() {
        global $wpdb;
        $tables = self::get_table_names();

        // 1. Initial Organization
        $org_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['organizations']}");
        if ($org_count === 0) {
            $wpdb->insert($tables['organizations'], array(
                'name'          => 'باشگاه فرهنگی ورزشی اروند خوزستان',
                'slug'          => 'arvand-khz',
                'org_type'      => 'club',
                'province'      => 'خوزستان',
                'city'          => 'اهواز',
                'contact_phone' => '06133333333',
                'created_at'    => current_time('mysql'),
            ));
            $org_id = $wpdb->insert_id;

            // Workspace for Sportavand Basketball module
            $wpdb->insert($tables['workspaces'], array(
                'org_id'       => $org_id,
                'title'        => 'فضای تخصصی بسکتبال اروند (اسپورتاوند بسکتبال)',
                'sport_module' => 'sportavand-basketball',
                'is_active'    => 1,
                'created_at'   => current_time('mysql'),
            ));
        }

        // 2. Initial Persons & Memberships (only if empty)
        $person_count = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$tables['persons']}");
        if ($person_count === 0) {
            // Player 1: Alireza Mohammadi
            $wpdb->insert($tables['persons'], array(
                'national_code'        => '1740001122',
                'first_name'           => 'علیرضا',
                'last_name'            => 'محمدی',
                'father_name'          => 'رضا',
                'birth_date'           => '1388/04/15',
                'gender'               => 'پسران / آقایان',
                'blood_group'          => 'O+',
                'photo_url'            => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
                'is_identity_verified' => 1,
                'can_edit_photo'       => 0,
                'created_at'           => current_time('mysql'),
            ));
            $p1_id = $wpdb->insert_id;

            $wpdb->insert($tables['memberships'], array(
                'person_id'           => $p1_id,
                'role'                => 'بازیکن',
                'team_category'       => 'نوجوانان (زیر ۱۶ سال)',
                'jersey_number'       => '7',
                'position'            => 'پست ۱ (پوینت گارد)',
                'height'              => '184',
                'weight'              => '72',
                'dominant_hand'       => 'راست‌دست',
                'phone'               => '09161112233',
                'parent_phone'        => '09163334455',
                'emergency_phone'     => '06133445566',
                'address'             => 'اهواز، کیانپارس، خیابان ۵ غربی',
                'insurance_number'    => 'MED-1405-88391',
                'insurance_expiry'    => '1405/11/20',
                'insurance_valid'     => 1,
                'status'              => 'تأیید مدارک',
                'joined_season'       => 'فصل ۱۴۰۵-۱۴۰۶',
                'is_published_public' => 1,
                'created_at'          => current_time('mysql'),
            ));

            // Player 2: Mohammad Hossein Zadeh
            $wpdb->insert($tables['persons'], array(
                'national_code'        => '1759988776',
                'first_name'           => 'محمد',
                'last_name'            => 'حسین‌زاده',
                'father_name'          => 'جعفر',
                'birth_date'           => '1386/11/02',
                'gender'               => 'پسران / آقایان',
                'blood_group'          => 'A+',
                'photo_url'            => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                'is_identity_verified' => 1,
                'can_edit_photo'       => 0,
                'created_at'           => current_time('mysql'),
            ));
            $p2_id = $wpdb->insert_id;

            $wpdb->insert($tables['memberships'], array(
                'person_id'           => $p2_id,
                'role'                => 'بازیکن',
                'team_category'       => 'جوانان (زیر ۱۸ سال)',
                'jersey_number'       => '11',
                'position'            => 'پست ۳ (اسمال فوروارد)',
                'height'              => '192',
                'weight'              => '81',
                'dominant_hand'       => 'چپ‌دست',
                'phone'               => '09164445566',
                'parent_phone'        => '09167778899',
                'emergency_phone'     => '06133998877',
                'address'             => 'اهواز، پادادشهر، خیابان ۱۰',
                'insurance_number'    => 'MED-1405-77412',
                'insurance_expiry'    => '1405/09/10',
                'insurance_valid'     => 1,
                'status'              => 'تأیید مدارک',
                'joined_season'       => 'فصل ۱۴۰۵-۱۴۰۶',
                'is_published_public' => 1,
                'created_at'          => current_time('mysql'),
            ));

            // Person 3: Coach Amirreza Ghasemi
            $wpdb->insert($tables['persons'], array(
                'national_code'        => '1752233445',
                'first_name'           => 'امیررضا',
                'last_name'            => 'قاسمی',
                'father_name'          => 'حسین',
                'birth_date'           => '1368/02/19',
                'gender'               => 'آقایان',
                'blood_group'          => 'B+',
                'photo_url'            => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
                'is_identity_verified' => 1,
                'can_edit_photo'       => 0,
                'created_at'           => current_time('mysql'),
            ));
            $p3_id = $wpdb->insert_id;

            $wpdb->insert($tables['memberships'], array(
                'person_id'           => $p3_id,
                'role'                => 'سرمربی',
                'team_category'       => 'کادر فنی اروند',
                'jersey_number'       => '—',
                'position'            => 'سرمربی ارشد',
                'height'              => '188',
                'weight'              => '85',
                'dominant_hand'       => 'راست‌دست',
                'phone'               => '09162223344',
                'emergency_phone'     => '06133221100',
                'address'             => 'اهواز، زیتون کارمندی',
                'insurance_number'    => 'MED-1405-11002',
                'insurance_expiry'    => '1405/12/29',
                'insurance_valid'     => 1,
                'status'              => 'تأیید مدارک',
                'joined_season'       => 'فصل ۱۴۰۵-۱۴۰۶',
                'is_published_public' => 1,
                'created_at'          => current_time('mysql'),
            ));
        }
    }

    /**
     * Get real status and row counts of all 9 Sportavand tables
     */
    public static function get_table_status() {
        global $wpdb;
        $tables = self::get_table_names();
        $status = array();

        foreach ($tables as $key => $table_name) {
            $exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name));
            if ($exists) {
                $count = (int) $wpdb->get_var("SELECT COUNT(*) FROM `{$table_name}`");
                $status[$key] = array(
                    'name'   => $table_name,
                    'exists' => true,
                    'count'  => $count,
                );
            } else {
                $status[$key] = array(
                    'name'   => $table_name,
                    'exists' => false,
                    'count'  => 0,
                );
            }
        }
        return $status;
    }

    public static function deactivate() {
        // Tables are intentionally preserved to protect all user data!
    }
}
