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

function vuosi_kello_event_validation($event, $checkDates=true): string | null {
    if($checkDates){
        if($event['start'] == null || $event['end'] == null) {
            return 'start | end missing';
        }
        $startDate = date($event['start']);
        $endDate = date($event['end']);
        if($startDate >= $endDate) {
            return 'end date is earlier then stop date';
        }
    }

    if(strlen($event['reservor']) <= 0 || strlen($event['reservor']) >= 255 ) {
        return 'invalid reservor length <=0 or >=255';
    }
    
    if(strlen($event['title']) <= 0 || strlen($event['title']) >= 255 ) {
        return 'invalid title length <=0 or >=255';
    }

    if($event['priority'] < 0 || $event['priority'] > 5) {
        return 'invalid priority not between 0-5';
    }

    if($event['group'] == null || gettype($event['group']) !== "array"){
        return 'invalid group type';
    }

    if(count($event['group']) === 0){
        return 'invalid group length (0)';
    }

    return null;
}

// table name = wp_vuosi_kello
function vuosi_kello_get_all(): void {
    global $wpdb;
    $table_name = get_vuosi_kello_table();
    
    $extra_query = '';
    if (array_key_exists('year', $_POST)){
        if(intval($_POST['year']) > 0){
            $extra_query = ' WHERE YEAR(start) = ' . $_POST['year'];
        }
    }

    // dont fetch reservations that are more than 2 months old, fetching the whole table is not good for longetivity.
    //$time = strtotime("-2 month", time());
    //$year_ago = date("Y-m-d", $time);

    $result = $wpdb->get_results("SELECT * FROM {$table_name}" . $extra_query);

    if($result !== false){
        foreach ($result as $index => $event) {
            $result[$index]->group = json_decode($event->groups_json);
            $result[$index]->id = (int)$event->id;
            $result[$index]->priority = (int)$event->priority;
            if(gettype($event->series_id) === 'string'){
                $result[$index]->series_id = (int)$event->series_id;
            }
        }
        wp_send_json_success($result, 200);
    } else if ($result === false){
        wp_send_json_error('get_all failure (false)', 500);
    }
}
add_action("wp_ajax_vuosi_kello_get_all", "vuosi_kello_get_all");
add_action("wp_ajax_nopriv_vuosi_kello_get_all", "vuosi_kello_get_all");


function vuosi_kello_post_one(): void {
    $validation_result = vuosi_kello_event_validation($_POST);
    if($validation_result !== null){
        wp_send_json_error($validation_result, 400);
        return;
    }

    global $wpdb;
    $table_name = get_vuosi_kello_table();

    $result = $wpdb->insert($table_name, [
        'series_id' => null,
        'priority' => $_POST['priority'],
        'reservor' => $_POST['reservor'],
        'groups_json' => json_encode($_POST['group']),
        'title' => $_POST['title'],
        'content' => $_POST['content'],
        'start' => $_POST['start'],
        'end' => $_POST['end'],
    ]);

    switch (true) {
        case $result === false:
            wp_send_json_error('post_one failure (false)', 500);
            break;
        
        case $result === 0:
            wp_send_json_error('post_one failure (0)', 500);
            break;

        case $result >= 1:
            wp_send_json_success(array("id" => $wpdb->insert_id), 200);
    }
}

add_action("wp_ajax_vuosi_kello_post_one", "vuosi_kello_post_one");
add_action("wp_ajax_nopriv_vuosi_kello_post_one", "vuosi_kello_post_one");

function vuosi_kello_delete_one(): void {
    global $wpdb;
    $table_name = get_vuosi_kello_table();

    $result = $wpdb->delete($table_name, [
        'id' => $_POST['id']
    ]);

    if($result === 1){
        wp_send_json_success($result, 200);
    } else if ($result === false || $result === 0){
        wp_send_json_error('delete_one failure (false|0)', 500);
    }
}

add_action("wp_ajax_vuosi_kello_delete_one", "vuosi_kello_delete_one");
add_action("wp_ajax_nopriv_vuosi_kello_delete_one", "vuosi_kello_delete_one");

function vuosi_kello_post_series(): void {
    $validation_result = vuosi_kello_event_validation($_POST, false);
    if($validation_result !== null){
        wp_send_json_error($validation_result, 400);
        return;
    }

    if($_POST['arrayOfDates'] === null) {
        wp_send_json_error('series has no dates', 400);
        return;
    } else if (count($_POST['arrayOfDates']) === 0) {
        wp_send_json_error('series has no dates', 400);
        return;
    } else if (count($_POST['arrayOfDates']) >= 365){
        wp_send_json_error('series has too many events', 400);
        return;
    }


    global $wpdb;
    $table_name = get_vuosi_kello_table();
    $series_t = get_vuosi_kello_series_table();

    
    $time_str = current_time('mysql');
    $series_result = $wpdb->query("INSERT INTO {$series_t} (time_stamp) VALUES ('{$time_str}');");

    if($series_result === 0){
        wp_send_json_error($series_result, 500);
        return;
    }

    $series_id = $wpdb->insert_id;

    $results = [];
    
    foreach ($_POST['arrayOfDates'] as $key => $times) {
        $data = [
            'series_id' => (int)$series_id,
            'priority' => (int)$_POST['priority'],
            'reservor' => $_POST['reservor'],
            'groups_json' => json_encode($_POST['group']),
            'title' => $_POST['title'],
            'content' => $_POST['content'],
            'start' => $times['start'],
            'end' => $times['end'],
        ];

        $result = $wpdb->insert($table_name, $data);

        if($result >= 1){
            $data['id'] = $wpdb->insert_id;
            $data['group'] = $_POST['group'];
            $results[] = $data;
        }
    }
    

    $sent_amount = count($results);
    $needed_amount = count($_POST['arrayOfDates']);
    if($needed_amount == $sent_amount){
        //write_log($results);
        wp_send_json_success(["events" => $results, "series_id" => $series_id], 200);
    } else {
       //write_log('error');
        wp_send_json_error(["message"=>"sent: {$sent_amount}, needed: {$needed_amount}"], 400);
    }
}
add_action("wp_ajax_vuosi_kello_post_series", "vuosi_kello_post_series");
add_action("wp_ajax_nopriv_vuosi_kello_post_series", "vuosi_kello_post_series");

function vuosi_kello_delete_by_series(): void {
    global $wpdb;
    $series_t = get_vuosi_kello_series_table();
    
    $result = $wpdb->delete($series_t, ['id' => $_POST["series_id"]]);

    switch (true) {
        case $result === false:
            wp_send_json_error('delete_by_series failure (false)', 500);
            break;
        
        case $result === 0:
            wp_send_json_error('delete_by_series failure (0)', 500);
            break;

        case $result >= 1:
            wp_send_json_success(array("message" => "wpdb delete completed successfully"), 200);
    }
}
add_action("wp_ajax_vuosi_kello_delete_by_series", "vuosi_kello_delete_by_series");
add_action("wp_ajax_nopriv_vuosi_kello_delete_by_series", "vuosi_kello_delete_by_series");

function vuosi_kello_update_one(): void {
    $validation_result = vuosi_kello_event_validation($_POST['event'], false);
    if($validation_result !== null){
        wp_send_json_error($validation_result, 400);
        return;
    }

    if(!isset($_POST['id'])){
        wp_send_json_error('post is missing id', 400);
        return;
    }

    //validate clock start & end.
    $time_regex = "/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/";
    if(!preg_match($time_regex, $_POST['clockTimes']['clockStart'])){
        wp_send_json_error("invalid clock start: {$_POST['clockTimes']['clockStart']}", 400);
    }
    if(!preg_match($time_regex, $_POST['clockTimes']['clockEnd'])){
        wp_send_json_error("invalid clock end: {$_POST['clockTimes']['clockEnd']}", 400);
    }

    global $wpdb;
    $table_name = get_vuosi_kello_table();

    $result = $wpdb->update(
        $table_name,
        [
            'priority' => $_POST['event']['priority'],
            'reservor' => $_POST['event']['reservor'],
            'groups_json' => json_encode($_POST['event']['group']),
            'title' => $_POST['event']['title'],
            'content' => $_POST['event']['content'],
        ],
        ['id' => $_POST['id']],
    );

    // UPDATE DATE CLOCK TIME SEPERATELY
    $spaghetti_code = $wpdb->get_results(
        "UPDATE {$table_name} 
        SET start = concat(date(start), ' {$_POST['clockTimes']['clockStart']}'),
        end = concat(date(start), ' {$_POST['clockTimes']['clockEnd']}')
        WHERE id = {$_POST['id']};
        "
    );

    if($result !== false){
        $result += $wpdb->rows_affected;
    }

    switch (true) {
        case $result === false:
            wp_send_json_error('update_one failure (false)', 500);
            break;
        
        case $result === 0:
            wp_send_json_error('update_one failure (0)', 500);
            break;

        case $result >= 1:
            wp_send_json_success($result, 200);
    }

    //wp_send_json_success('doneTODO', 200);
}
add_action("wp_ajax_vuosi_kello_update_one", "vuosi_kello_update_one");
add_action("wp_ajax_nopriv_vuosi_kello_update_one", "vuosi_kello_update_one");

function vuosi_kello_update_series(): void {
    $validation_result = vuosi_kello_event_validation($_POST['event'], false);
    if($validation_result !== null){
        wp_send_json_error($validation_result, 400);
        return;
    }

    if(!isset($_POST['series_id'])){
        wp_send_json_error('post is missing series_id', 400);
        return;
    }

    //validate clock start & end.
    $time_regex = "/^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/";
    if(!preg_match($time_regex, $_POST['clockTimes']['clockStart'])){
        wp_send_json_error("invalid clock start: {$_POST['clockTimes']['clockStart']}", 400);
    }
    if(!preg_match($time_regex, $_POST['clockTimes']['clockEnd'])){
        wp_send_json_error("invalid clock end: {$_POST['clockTimes']['clockEnd']}", 400);
    }

   
    global $wpdb;
    $table_name = get_vuosi_kello_table();

    $result = $wpdb->update(
        $table_name,
        [
            'priority' => $_POST['event']['priority'],
            'reservor' => $_POST['event']['reservor'],
            'groups_json' => json_encode($_POST['event']['group']),
            'title' => $_POST['event']['title'],
            'content' => $_POST['event']['content'],
        ],
        ['series_id' => $_POST['series_id']],
    );

    // UPDATE DATE CLOCK TIME SEPERATELY
    $spaghetti_code = $wpdb->get_results(
        "UPDATE {$table_name} 
        SET start = concat(date(start), ' {$_POST['clockTimes']['clockStart']}'),
        end = concat(date(start), ' {$_POST['clockTimes']['clockEnd']}')
        WHERE series_id = {$_POST['series_id']};
        "
    );

    if($result !== false && $result === 0){
        $result += $wpdb->rows_affected;
    }

    switch (true) {
        case $result === false:
            wp_send_json_error('update_one failure (false)', 500);
            break;
        
        case $result === 0:
            wp_send_json_error('update_one failure (0)', 500);
            break;

        case $result >= 1:
            wp_send_json_success($result, 200);
    }
}
add_action("wp_ajax_vuosi_kello_update_series", "vuosi_kello_update_series");
add_action("wp_ajax_nopriv_vuosi_kello_update_series", "vuosi_kello_update_series");