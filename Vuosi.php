<?php
/**
 * Plugin Name: VuosiKello
 * Description: Organisaation tapahtumien yleiskatsaus vuosikello muodossa.
 * Version: 0.9.5
 * Author: Aleksei Nesterinen
 * Author URI: https://github.com/nesterinen
 * Plugin URI: https://codeload.github.com/nesterinen/VuosiKello/zip/refs/heads/main
*/

if (!defined(constant_name: 'ABSPATH')) {
    exit;
}

global $vuosi_kello_page_name;
$vuosi_kello_page_name = 'VuosiKello';

global $vuosi_kello_table_name;
$vuosi_kello_table_name = 'vuosi_kello';

global $vuosi_kello_series_table_name;
$vuosi_kello_series_table_name = 'vuosi_kello_series';

global $vuosi_kello_div_id;
$vuosi_kello_div_id = 'VuosiKelloElement';

global $vuosi_kello_group_table_name;
$vuosi_kello_group_table_name = 'vuosi_kello_groups';

global $vuosi_kello_default_groups;
$vuosi_kello_default_groups = [
    'Hallinto',
    'Esihenkilöt',
    'Henkilöstö',
    'Wörkkis',
    'Asumispalvelut',
    'Kouhu'
];

//group settings admin page, group table initializations & etc..
include(plugin_dir_path(__FILE__) . 'group_settings/settings.php');

function get_vuosi_kello_table(): string{
    global $wpdb;
    global $vuosi_kello_table_name;
    
    return $wpdb->prefix . $vuosi_kello_table_name;
}

function get_vuosi_kello_series_table(): string{
    global $wpdb;
    global $vuosi_kello_series_table_name;
    
    return $wpdb->prefix . $vuosi_kello_series_table_name;
}

/*
function to_module($tag, $handle, $src): string{
    if ( 'plugin-script' === $handle ) {
        $tag = '<script type="module" src="' . esc_url( url: $src ) . '" id="scripts" ></script>';
    }
    write_log($tag);
    return $tag;
}
*/

function vuosi_kello_plugin_activation(): void {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    $series_table_name = get_vuosi_kello_series_table();
    $query1 = "CREATE TABLE IF NOT EXISTS $series_table_name (
        id int NOT NULL AUTO_INCREMENT,
        time_stamp datetime NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";

    dbDelta($query1);


    $main_table_name = get_vuosi_kello_table();
    $query2 = "CREATE TABLE IF NOT EXISTS $main_table_name(
        id int NOT NULL AUTO_INCREMENT,
        series_id int,
        priority tinyint,
        reservor varchar(255),
        groups_json JSON NOT NULL,
        title varchar(255) NOT NULL,
        content text,
        start datetime NOT NULL,
        end datetime NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (series_id)
        REFERENCES $series_table_name (id)
        ON DELETE CASCADE
    ); $charset_collate";

    dbDelta($query2);
}
register_activation_hook(__FILE__, 'vuosi_kello_plugin_activation');


function vuosi_kello_create_main_page(): void {
    global $vuosi_kello_page_name;
    global $vuosi_kello_div_id;

    $query = new WP_Query(
        [
            'post_type'              => 'page',
            'title'                  => $vuosi_kello_page_name,
            'post_status'            => 'all',
            'posts_per_page'         => 1,
            'no_found_rows'          => true,
            'ignore_sticky_posts'    => true,
            'update_post_term_cache' => false,
            'update_post_meta_cache' => false,
            'orderby'                => 'post_date ID',
            'order'                  => 'ASC',
        ]
    );

    if ( ! empty( $query->post)) { 
        //write_log('page exists already');
        return;
    }

    $page_content = '<div id=' . $vuosi_kello_div_id . '></div>';

    $vuosi_kello_page = [
        'post_title' => wp_strip_all_tags($vuosi_kello_page_name),
        'post_content' => $page_content,
        'post_status' => 'publish',
        'post_author' => 1,
        'post_type' => 'page'
    ];
    
    wp_insert_post($vuosi_kello_page);
}
register_activation_hook(__FILE__, 'vuosi_kello_create_main_page');


// ajax, rest/crud api modifying db stuff for vuosikello
include(plugin_dir_path(__FILE__) . 'php/Crud_Operations.php');
function load_plugin(): void{
    $version = '0.9.5';

    global $vuosi_kello_page_name;
    if(!is_page($vuosi_kello_page_name)){
        return;
    }

    $pkmtt_logo = plugin_dir_url(__FILE__) . 'img/PKMTT_LOGO.PNG';

    global $vuosi_kello_div_id;

    global $vuosi_kello_default_groups;
    $actual_groups = vuosi_kello_get_groups_array();

    $js_file_dir = plugin_dir_url(file: __FILE__) . 'js';
    wp_enqueue_style(handle: 'wsp-styles', src: plugin_dir_url(file: __FILE__) . 'css/main.css');
    wp_enqueue_style(handle: 'wsp-table-style', src: plugin_dir_url(file: __FILE__) . 'css/table.css');
    wp_enqueue_style(handle: 'wsp-info-style', src: plugin_dir_url(file: __FILE__) . 'css/info.css');
    wp_enqueue_style(handle: 'wsp-yearCircle-style', src: plugin_dir_url(file: __FILE__) . 'css/yearCircle.css');
    wp_enqueue_style(handle: 'wsp-dialogs-style', src: plugin_dir_url(file: __FILE__) . 'css/dialogs.css');

    wp_register_script(
        handle: 'loading-graphic',
        src: "{$js_file_dir}/loading.js",
        deps: [],
        ver: $version
    );

    wp_register_script(
        handle: 'year-dialogs',
        src: "{$js_file_dir}/dialogs.js",
        deps: [],
        ver: $version
    );

    wp_register_script(
        handle: 'year-table',
        src: "{$js_file_dir}/table.js",
        deps: [],
        ver: $version
    );

    wp_register_script(
        handle: 'year-events-handler',
        src: "{$js_file_dir}/eventsHandler.js",
        deps: [],
        ver: $version
    );

    wp_enqueue_script(
        handle:'year-circle',
        src: "{$js_file_dir}/year.js",
        deps: [],
        ver: $version
    );
    
    wp_enqueue_script(
        handle:'year-utils',
        src: "{$js_file_dir}/utils.js",
        deps: [],
        ver: $version
    );

    wp_enqueue_script(
        handle:'year-info',
        src: "{$js_file_dir}/info.js",
        deps: [],
        ver: $version
    );

    wp_enqueue_script(
        handle:'plugin-script',
        src: "{$js_file_dir}/main.js",
        deps: [
            'jquery',
            'loading-graphic',
            'year-dialogs',
            'year-table',
            'year-events-handler',
            'year-circle',
            'year-utils',
            'year-info'
        ],
        ver: $version
    );
    

    wp_localize_script(
        handle:'plugin-script',
        object_name: 'php_args_vuosi',
        l10n: [
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'element_name' => $vuosi_kello_div_id,
            'actual_groups' => $actual_groups,
            'default_groups' => $vuosi_kello_default_groups,
            'logo_url' => $pkmtt_logo,
        ]
    );
}

add_action(hook_name: 'wp_enqueue_scripts', callback: 'load_plugin');