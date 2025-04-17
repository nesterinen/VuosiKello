<?php
/**
 * Plugin Name: VuosiPROTO
 * Description: Prototyping
 * Version: 0.1
 * Author: Aleksei Nesterinen
 * Author URI: missing..
*/

if (!defined(constant_name: 'ABSPATH')) {
    exit;
}

global $organization_groups;
$organization_groups = [
    'Hallinto' => '#5baa00',
    'Esihenkilöt' => '#5baa00',
    'Henkilöstö' => '#5baa00',
    'Wörkkis' => '#5baa00',
    'Asumispalvelut' => '#5baa00',
    'Kouhu' => '#5baa00'
];


function to_module($tag, $handle, $src): string{
    if ( 'plugin-script' === $handle ) {
        $tag = '<script type="module" src="' . esc_url( url: $src ) . '" id="scripts" ></script>';
    }
    write_log($tag);
    return $tag;
}

function load_plugin(): void{
    global $organization_groups;

    $js_file_dir = plugin_dir_url(file: __FILE__) . 'js';
    wp_enqueue_style(handle: 'wsp-styles', src: plugin_dir_url(file: __FILE__) . 'css/main.css');
    wp_enqueue_style(handle: 'wsp-table-style', src: plugin_dir_url(file: __FILE__) . 'css/table.css');
    wp_enqueue_style(handle: 'wsp-info-style', src: plugin_dir_url(file: __FILE__) . 'css/info.css');


    wp_register_script(
        handle: 'year-dialogs',
        src: "{$js_file_dir}/dialogs.js",
        deps: [],
        ver: null
    );

    wp_register_script(
        handle: 'year-table',
        src: "{$js_file_dir}/table.js",
        deps: [],
        ver: null
    );

    wp_register_script(
        handle: 'year-events-handler',
        src: "{$js_file_dir}/eventsHandler.js",
        deps: [],
        ver: null
    );

    wp_enqueue_script(
        handle:'year-circle',
        src: "{$js_file_dir}/year.js",
        deps: [],
        ver: null
    );
    
    wp_enqueue_script(
        handle:'year-utils',
        src: "{$js_file_dir}/utils.js",
        deps: [],
        ver: null
    );

    wp_enqueue_script(
        handle:'year-info',
        src: "{$js_file_dir}/info.js",
        deps: [],
        ver: null
    );

    wp_enqueue_script(
        handle:'plugin-script',
        src: "{$js_file_dir}/main.js",
        deps: [
            'jquery',
            'year-dialogs',
            'year-table',
            'year-events-handler',
            'year-circle',
            'year-utils',
            'year-info'
        ],
        ver: null
    );
    

    wp_localize_script(
        handle:'plugin-script',
        object_name: 'php_args',
        l10n: [
            'groups' => $organization_groups
        ]
    );
}

add_action(hook_name: 'wp_enqueue_scripts', callback: 'load_plugin');