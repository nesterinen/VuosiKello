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
            $result[$index]->id = (int)$event->id;
            $result[$index]->priority = (int)$event->priority;
            if(gettype($event->series_id) === 'string'){
                $result[$index]->series_id = (int)$event->series_id;
            }
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

    switch (true) {
        case $result === false:
            wp_send_json_error($result, 500);
            break;
        
        case $result === 0:
            wp_send_json_error($result, 400);
            break;

        case $result >= 1:
            wp_send_json_success(array("id" => $wpdb->insert_id), 200);
    }
}

add_action("wp_ajax_vuosi_kello_post_one", "vuosi_kello_post_one");
add_action("wp_ajax_nopriv_vuosi_kello_post_one", "vuosi_kello_post_one");

function vuosi_kello_delete_one(): void {
    global $wpdb;
    $table_name = 'wp_vuosi_kello';

    $result = $wpdb->delete($table_name, [
        'id' => $_POST['id']
    ]);

    if($result !== false){
        wp_send_json_success($result, 200);
    } else {
        wp_send_json_error($result, 500);
    }
}

add_action("wp_ajax_vuosi_kello_delete_one", "vuosi_kello_delete_one");
add_action("wp_ajax_nopriv_vuosi_kello_delete_one", "vuosi_kello_delete_one");

function vuosi_kello_post_series(): void {
    global $wpdb;
    $table_name = 'wp_vuosi_kello';
    $series_t = $table_name . '_series';

    
    $time_str = current_time('mysql');
    $series_result = $wpdb->query("INSERT INTO {$series_t} (time_stamp) VALUES ('{$time_str}');");

    if($series_result === 0){
        wp_send_json_error($series_result, 500);
        return;
    }

    $series_id = $wpdb->insert_id;

    $results = [];
    
    foreach ($_POST['arrayOfDates'] as $key => $times) {
        $result = $wpdb->insert($table_name, [
            'series_id' => $series_id,
            'priority' => $_POST['priority'],
            'reservor' => $_POST['reservor'],
            'group' => json_encode($_POST['group']),
            'title' => $_POST['title'],
            'content' => $_POST['content'],
            'start' => $times['start'],
            'end' => $times['end'],
        ]);

        if($result >= 1){
            $results[] = $wpdb->insert_id;
        }
    }
    

    $sent_amount = count($results);
    $needed_amount = count($_POST['arrayOfDates']);
    if($needed_amount == $sent_amount){
        //write_log($results);
        wp_send_json_success(["ids" => $results, "series_id" => $series_id], 200);
    } else {
       //write_log('error');
        wp_send_json_error(["message"=>"sent: {$sent_amount}, needed: {$needed_amount}"], 400);
    }
}
add_action("wp_ajax_vuosi_kello_post_series", "vuosi_kello_post_series");
add_action("wp_ajax_nopriv_vuosi_kello_post_series", "vuosi_kello_post_series");

function vuosi_kello_delete_by_series(): void {
    global $wpdb;
    $table_name = 'wp_vuosi_kello';
    $series_t = $table_name . '_series';
    
    $result = $wpdb->delete($series_t, ['id' => $_POST["series_id"]]);

    switch (true) {
        case $result === false:
            wp_send_json_error($result, 500);
            break;
        
        case $result === 0:
            wp_send_json_error($result, 400);
            break;

        case $result >= 1:
            wp_send_json_success(array("message" => "wpdb delete completed successfully"), 200);
    }
}
add_action("wp_ajax_vuosi_kello_delete_by_series", "vuosi_kello_delete_by_series");
add_action("wp_ajax_nopriv_vuosi_kello_delete_by_series", "vuosi_kello_delete_by_series");