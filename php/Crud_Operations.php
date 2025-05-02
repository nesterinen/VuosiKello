<?php 

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

// table name = wp_vuosi_kello
function vuosi_kello_get_all(): void {
    global $wpdb;
    $table_name = 'wp_vuosi_kello';

    // dont fetch reservations that are more than 2 months old, fetching the whole table is not good for longetivity.
    //$time = strtotime("-2 month", time());
    //$year_ago = date("Y-m-d", $time);

    $result = $wpdb->get_results("SELECT * FROM {$table_name}");
    //write_log($result);

    if($result !== false){
        foreach ($result as $index => $event) {
            $result[0]->group = json_decode($event->group);
            //write_log(gettype($event->group));
            //write_log(json_decode($event->group));
        }
        wp_send_json_success($result, 200);
    } else {
        wp_send_json_error($result, 500);
    }
}
add_action("wp_ajax_vuosi_kello_get_all", "vuosi_kello_get_all");
add_action("wp_ajax_nopriv_vuosi_kello_get_all", "vuosi_kello_get_all");