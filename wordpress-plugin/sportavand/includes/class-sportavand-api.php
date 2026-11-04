<?php
/**
 * REST API Endpoints for Sportavand
 * Canonical Namespace: /wp-json/sportavand/v1/
 * Includes backward-compatible route registration for legacy clients during upgrade transition.
 */

namespace Sportavand;

if (!defined('ABSPATH')) {
    exit;
}

class Sportavand_API {

    const REST_NAMESPACE        = 'sportavand/v1';
    const LEGACY_REST_NAMESPACE = 'sportnova/v1';

    public static function register_routes() {
        $namespaces = array(self::REST_NAMESPACE, self::LEGACY_REST_NAMESPACE);

        foreach ($namespaces as $ns) {
            // Health, Migration & 9-Table Diagnostics
            register_rest_route($ns, '/health', array(
                'methods'             => 'GET',
                'callback'            => array(__CLASS__, 'get_health'),
                'permission_callback' => '__return_true',
            ));

            // Get Team Roster
            register_rest_route($ns, '/roster', array(
                'methods'             => 'GET',
                'callback'            => array(__CLASS__, 'get_roster'),
                'permission_callback' => '__return_true',
            ));

            // Intake Registration (One National Code = One Person, Multi-role Support)
            register_rest_route($ns, '/register', array(
                'methods'             => 'POST',
                'callback'            => array(__CLASS__, 'handle_registration'),
                'permission_callback' => '__return_true',
            ));

            // Get Specific Person & Digital Dossier
            register_rest_route($ns, '/person/(?P<id>[a-zA-Z0-9_\-]+)', array(
                'methods'             => 'GET',
                'callback'            => array(__CLASS__, 'get_person'),
                'permission_callback' => '__return_true',
            ));

            // Player Editable Profile Update (Guards locked identity fields)
            register_rest_route($ns, '/update-player', array(
                'methods'             => 'POST',
                'callback'            => array(__CLASS__, 'update_player_editable'),
                'permission_callback' => '__return_true',
            ));

            // Toggle Roster Public Visibility
            register_rest_route($ns, '/toggle-publish', array(
                'methods'             => 'POST',
                'callback'            => array(__CLASS__, 'toggle_publish'),
                'permission_callback' => function() {
                    return current_user_can('edit_posts') || current_user_can('sportavand_manage');
                },
            ));
        }
    }

    /**
     * System health, migration status, and 9-table diagnostics
     */
    public static function get_health($request) {
        $table_status = Sportavand_DB::get_table_status();
        $all_exist = true;
        foreach ($table_status as $t) {
            if (!$t['exists']) {
                $all_exist = false;
                break;
            }
        }

        return rest_ensure_response(array(
            'status'            => $all_exist ? 'ok' : 'degraded',
            'product_name'      => 'Sportavand',
            'product_name_fa'   => 'اسپورتاوند',
            'slogan'            => 'از سامان تا اوج',
            'domain'            => 'sportavand.ir',
            'plugin_version'    => SPORTAVAND_VERSION,
            'plugin_version_fa' => SPORTAVAND_VERSION_FA,
            'db_version'        => SPORTAVAND_DB_VERSION,
            'migration_version' => get_option(Sportavand_Migrator::VERSION_OPTION, '0.0.0'),
            'module'            => SPORTAVAND_BASKETBALL_MODULE_ID,
            'tables'            => $table_status,
            'timestamp'         => current_time('mysql'),
        ));
    }

    /**
     * Get Roster Members list
     */
    public static function get_roster($request) {
        global $wpdb;
        $tables = Sportavand_DB::get_table_names();

        $query = "
            SELECT 
                m.id AS membership_id,
                m.role,
                m.team_category,
                m.jersey_number,
                m.position,
                m.height,
                m.weight,
                m.dominant_hand,
                m.phone,
                m.parent_phone,
                m.emergency_phone,
                m.address,
                m.insurance_number,
                m.insurance_expiry,
                m.insurance_valid,
                m.status,
                m.joined_season,
                m.is_published_public,
                p.id AS person_id,
                p.national_code,
                p.first_name,
                p.last_name,
                p.father_name,
                p.birth_date,
                p.gender,
                p.blood_group,
                p.photo_url,
                p.is_identity_verified,
                p.can_edit_photo
            FROM {$tables['memberships']} m
            INNER JOIN {$tables['persons']} p ON m.person_id = p.id
            ORDER BY m.id DESC
        ";

        $results = $wpdb->get_results($query, ARRAY_A);

        return rest_ensure_response(array(
            'count'   => is_array($results) ? count($results) : 0,
            'members' => is_array($results) ? $results : array(),
        ));
    }

    /**
     * Register or Add Role to Existing Person
     */
    public static function handle_registration($request) {
        global $wpdb;
        $tables = Sportavand_DB::get_table_names();
        $params = $request->get_json_params();

        if (empty($params)) {
            $params = $request->get_params();
        }

        $national_code = sanitize_text_field($params['nationalCode'] ?? '');
        if (strlen($national_code) !== 10 || !ctype_digit($national_code)) {
            return new \WP_Error('invalid_national_code', 'کد ملی وارد شده باید دقیقاً ۱۰ رقم عددی باشد.', array('status' => 400));
        }

        // Check if person already exists
        $existing_person = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$tables['persons']} WHERE national_code = %s",
            $national_code
        ), ARRAY_A);

        $person_id     = null;
        $is_new_person = false;

        if ($existing_person) {
            // Person already registered! Reuse person record (Multi-role support)
            $person_id = $existing_person['id'];
        } else {
            // Create new person record
            $wpdb->insert($tables['persons'], array(
                'national_code'        => $national_code,
                'first_name'           => sanitize_text_field($params['firstName'] ?? ''),
                'last_name'            => sanitize_text_field($params['lastName'] ?? ''),
                'father_name'          => sanitize_text_field($params['fatherName'] ?? ''),
                'birth_date'           => sanitize_text_field($params['birthDate'] ?? ''),
                'gender'               => sanitize_text_field($params['gender'] ?? 'پسران / آقایان'),
                'blood_group'          => sanitize_text_field($params['bloodGroup'] ?? 'A+'),
                'photo_url'            => esc_url_raw($params['photo'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
                'is_identity_verified' => 1,
                'can_edit_photo'       => 0,
                'created_at'           => current_time('mysql'),
            ));
            $person_id     = $wpdb->insert_id;
            $is_new_person = true;
        }

        // Add membership record
        $role = sanitize_text_field($params['role'] ?? 'بازیکن');
        $wpdb->insert($tables['memberships'], array(
            'person_id'           => $person_id,
            'role'                => $role,
            'team_category'       => sanitize_text_field($params['teamCategory'] ?? 'نوجوانان (زیر ۱۶ سال)'),
            'jersey_number'       => $role === 'بازیکن' ? sanitize_text_field($params['jerseyNumber'] ?? '—') : '—',
            'position'            => $role === 'بازیکن' ? sanitize_text_field($params['position'] ?? 'پست ۱ (پوینت گارد)') : "کادر فنی ({$role})",
            'height'              => sanitize_text_field($params['height'] ?? '180'),
            'weight'              => sanitize_text_field($params['weight'] ?? '75'),
            'dominant_hand'       => sanitize_text_field($params['dominantHand'] ?? 'راست‌دست'),
            'phone'               => sanitize_text_field($params['phone'] ?? ''),
            'parent_phone'        => sanitize_text_field($params['parentPhone'] ?? ''),
            'emergency_phone'     => sanitize_text_field($params['emergencyPhone'] ?? ''),
            'address'             => sanitize_textarea_field($params['address'] ?? 'اهواز'),
            'insurance_number'    => sanitize_text_field($params['insuranceNumber'] ?? 'MED-1405-AUTO'),
            'insurance_expiry'    => sanitize_text_field($params['insuranceExpiry'] ?? '1405/12/29'),
            'insurance_valid'     => 1,
            'status'              => 'در انتظار بررسی',
            'joined_season'       => 'فصل ۱۴۰۵-۱۴۰۶',
            'is_published_public' => 1,
            'created_at'          => current_time('mysql'),
        ));
        $membership_id = $wpdb->insert_id;

        // Log audit event
        $wpdb->insert($tables['audit_events'], array(
            'person_id'    => $person_id,
            'user_id'      => get_current_user_id(),
            'action'       => $is_new_person ? 'PERSON_REGISTERED' : 'MEMBERSHIP_ROLE_ADDED',
            'target_table' => $tables['memberships'],
            'target_id'    => $membership_id,
            'details_json' => wp_json_encode(array('role' => $role, 'national_code' => $national_code)),
            'ip_address'   => sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? ''),
            'created_at'   => current_time('mysql'),
        ));

        $tracking_code = 'SPV-' . gmdate('Y') . '-REG-' . str_pad((string) $membership_id, 5, '0', STR_PAD_LEFT);

        return rest_ensure_response(array(
            'success'       => true,
            'message'       => $is_new_person ? 'ورزشکار جدید با موفقیت در سامانه اسپورتاوند ثبت‌نام شد.' : 'عضویت جدید با موفقیت به پرونده کدملی موجود در اسپورتاوند افزوده شد.',
            'person_id'     => $person_id,
            'membership_id' => $membership_id,
            'tracking_code' => $tracking_code,
            'is_new_person' => $is_new_person,
        ));
    }

    /**
     * Get single person and digital card payload
     */
    public static function get_person($request) {
        global $wpdb;
        $tables = Sportavand_DB::get_table_names();
        $id = $request->get_param('id');

        $person = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$tables['persons']} WHERE id = %d OR national_code = %s",
            $id,
            $id
        ), ARRAY_A);

        if (!$person) {
            return new \WP_Error('not_found', 'پرونده هویتی برای شناسه درخواستی در اسپورتاوند یافت نشد.', array('status' => 404));
        }

        $memberships = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$tables['memberships']} WHERE person_id = %d",
            $person['id']
        ), ARRAY_A);

        return rest_ensure_response(array(
            'person'      => $person,
            'memberships' => $memberships,
            'qr_payload'  => array(
                'verification_url' => home_url('/?sportavand_verify=' . $person['national_code']),
                'national_code'    => $person['national_code'],
                'full_name'        => $person['first_name'] . ' ' . $person['last_name'],
                'verified_at'      => $person['updated_at'],
            ),
        ));
    }

    /**
     * Update editable fields (phone, address, height, weight) without altering locked identity
     */
    public static function update_player_editable($request) {
        global $wpdb;
        $tables = Sportavand_DB::get_table_names();
        $params = $request->get_json_params();

        $membership_id = intval($params['membership_id'] ?? 0);
        if (!$membership_id) {
            return new \WP_Error('missing_id', 'شناسه عضویت مشخص نیست.', array('status' => 400));
        }

        $update_data = array();
        if (isset($params['phone'])) $update_data['phone'] = sanitize_text_field($params['phone']);
        if (isset($params['parent_phone'])) $update_data['parent_phone'] = sanitize_text_field($params['parent_phone']);
        if (isset($params['emergency_phone'])) $update_data['emergency_phone'] = sanitize_text_field($params['emergency_phone']);
        if (isset($params['address'])) $update_data['address'] = sanitize_textarea_field($params['address']);
        if (isset($params['height'])) $update_data['height'] = sanitize_text_field($params['height']);
        if (isset($params['weight'])) $update_data['weight'] = sanitize_text_field($params['weight']);
        if (isset($params['dominant_hand'])) $update_data['dominant_hand'] = sanitize_text_field($params['dominant_hand']);

        if (!empty($update_data)) {
            $wpdb->update($tables['memberships'], $update_data, array('id' => $membership_id));
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'فیلدهای مجاز با موفقیت ویرایش شدند. فیلدهای هویتی قفل‌شده محافظت گردیدند.',
        ));
    }

    /**
     * Toggle public roster visibility
     */
    public static function toggle_publish($request) {
        $params    = $request->get_json_params();
        $new_state = !empty($params['published']) ? 1 : 0;
        update_option('sportavand_roster_published', $new_state);

        return rest_ensure_response(array(
            'success'   => true,
            'published' => (bool) $new_state,
        ));
    }
}
