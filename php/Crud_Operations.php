<?php 

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/*
    id: int (PRIMARY KEY),
    series_id: int | null (FOREIGN KEY),
    priority: int,
    reservor: varchar 255,
    group: json (str[]),
    title: varchar 255,
    content: text,
    start: datetime,
    end: datetime
*/

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
            $result[$index]->group = json_decode($event->group);
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


function vuosi_kello_post_one(): void {
    global $wpdb;
    $table_name = 'wp_vuosi_kello';

    $result = $wpdb->insert($table_name, [
        'series_id' => null,
        'priority' => $_POST['priority'],
        'reservor' => $_POST['reservor'],
        'group' => json_encode($_POST['group']),
        'title' => $_POST['title'],
        'content' => $_POST['content'],
        'start' => $_POST['start'],
        'end' => $_POST['end'],
    ]);

    if($result !== false){
        wp_send_json_success($result, 200);
    } else {
        wp_send_json_error($result, 500);
    }
}

add_action("wp_ajax_vuosi_kello_post_one", "vuosi_kello_post_one");
add_action("wp_ajax_nopriv_vuosi_kello_post_one", "vuosi_kello_post_one");