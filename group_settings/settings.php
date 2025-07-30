<?php
function get_vuosi_kello_group_table(): string{
    global $wpdb;
    global $vuosi_kello_group_table_name;
    
    return $wpdb->prefix . $vuosi_kello_group_table_name;
}

function vuosi_kello_plugin_activation_group(): void {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    $group_table =  get_vuosi_kello_group_table();

    $query = "CREATE TABLE IF NOT EXISTS $group_table (
        id INT NOT NULL AUTO_INCREMENT,
        group_name VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    ); $charset_collate";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($query);

    // If table is empty add default groups.
    global $vuosi_kello_default_groups;

    $table_contents = $wpdb->get_results("SELECT * FROM {$group_table}");
    if($table_contents !== false){
        if(count($table_contents) === 0){
            foreach ($vuosi_kello_default_groups as $group){
                $wpdb->insert($group_table, ['group_name' => $group]);
            }
        }
    }
}
//register_activation_hook(__FILE__, 'vuosi_kello_plugin_activation_group');

function settings_add_admin_page(){
    add_options_page(
        page_title: 'VuosiKello: Asetukset',
        menu_title: 'VuosiKello',
        capability: 'manage_options',
        menu_slug: 'vuosi_kello_settings',
        callback: 'vuosi_kello_settings_page_callback'
    );

    function vuosi_kello_settings_page_callback() {
        echo '<div id="vuosi_settings_container">Loading...</div>';

        global $wpdb;
        $group_table =  get_vuosi_kello_group_table();

        $table_contents = $wpdb->get_results("SELECT * FROM {$group_table}");

        $groups = [];
        foreach ($table_contents as $object){
            $groups[] = ['group'=>$object->group_name, 'id'=>$object->id];
        }

        wp_enqueue_style(
            handle: 'wsp-settings-style',
            src: plugin_dir_url(file: __FILE__) . 'settings.css');

        wp_enqueue_script(
            handle: 'wsp-settings-script',
            src: plugin_dir_url(file: __FILE__) . 'settings.js',
            deps: ['jquery'],
            ver: null
        );

        wp_localize_script(
            handle: 'wsp-settings-script',
            object_name: 'php_settings_args',
            l10n: [
                'ajax_url' => admin_url( path: 'admin-ajax.php' ),
                'groups' => $groups,
            ]
        );
    }
}
add_action('admin_menu', 'settings_add_admin_page');

// ## group crud
function vuosi_kello_get_groups_array(): array{
    global $wpdb;
        $group_table =  get_vuosi_kello_group_table();

        $table_contents = $wpdb->get_results("SELECT group_name FROM {$group_table}");

        $groups = [];
        foreach ($table_contents as $object){
            $groups[] = $object->group_name;
        }

        return $groups;
}

function vuosi_kello_delete_group_by_id(): void {
    global $wpdb;
    $group_table =  get_vuosi_kello_group_table();

    $result = $wpdb->delete($group_table, [
        'id' => $_POST['id']
    ]);

    if($result !== false){
        if($result !== 0){
            wp_send_json_success($result, 200);
        } else {
            wp_send_json_error('id not found', 404);
        }
    } else {
        wp_send_json_error($result, 500);
    }
}
add_action("wp_ajax_vuosi_kello_delete_group_by_id", "vuosi_kello_delete_group_by_id");
add_action("wp_ajax_nopriv_vuosi_kello_delete_group_by_id", "vuosi_kello_delete_group_by_id");

function vuosi_kello_restore_groups(): void {
    global $wpdb;
    $group_table =  get_vuosi_kello_group_table();

    $wpdb->query("TRUNCATE TABLE $group_table");

    global $vuosi_kello_default_groups;
    foreach ($vuosi_kello_default_groups as $group){
        $wpdb->insert($group_table, ['group_name' => $group]);
    }
}
add_action("wp_ajax_vuosi_kello_restore_groups", "vuosi_kello_restore_groups");
add_action("wp_ajax_nopriv_vuosi_kello_restore_groups", "vuosi_kello_restore_groups");

function vuosi_kello_add_group(): void {
    if(!array_key_exists('group_name', $_POST)){
        wp_send_json_error('request is missing group_name', 400);
        return;
    }

    if(strlen($_POST['group_name']) <= 0 || strlen($_POST['group_name']) >= 255){
        wp_send_json_error('group_name invalid length !(0-255)', 400);
        return;
    }

    global $wpdb;
    $group_table =  get_vuosi_kello_group_table();

    $result = $wpdb->insert($group_table, [
        'group_name' => $_POST['group_name']
    ]);

    if($result){
        $last_id = $wpdb->insert_id;
        if($last_id){
            wp_send_json_success($last_id, 200);
        } else {
            wp_send_json_error('no last insert??', 500);
        }
    }
}
add_action("wp_ajax_vuosi_kello_add_group", "vuosi_kello_add_group");
add_action("wp_ajax_nopriv_vuosi_kello_add_group", "vuosi_kello_add_group");