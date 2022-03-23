<?php

    ini_set("session.cookie_httponly", 1);

    session_start();

    header("Content-Type: application/json");

    //Check to make sure HTTP User Agent is consistent
    $previous_ua = @$_SESSION['useragent'];
    $current_ua = $_SERVER['HTTP_USER_AGENT'];

    if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua){
        echo json_encode(array("Session hijack detected" => true));
        die("Session hijack detected");
    }else{
        $_SESSION['useragent'] = $current_ua;
    }

    //Check to make sure user is not already logged in
    if(!isset($_SESSION['user'])) {
        echo json_encode(array("nosession" => true));
        die();
    }

    $arr = array();

    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    $id = $json_obj['id'];
    $token = $json_obj['token'];

    //Get token if exists
    if($json_obj['token'] != '') {
        $token = $json_obj['token'];
    }

    //Verify token to prevent CSRF attack
    if($token != $_SESSION['token']) {
        echo json_encode(array("Invalid Token" => true));
        die();
    } else { 
        $arr['token'] = true;
    }

    //connect to database with wustl user
    $conn = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calendar');

    //exit if connection fails
    if ($conn->connect_error) {
        $arr['sql connection'] = false;
        echo json_encode($arr);
        die();
    }

    //Verify that user is the owner of the event
    $query = $conn->prepare('Select * FROM events WHERE id=(?)');
    $query->bind_param("i", $id);
    if($query->execute()) {
        $result = $query->get_result();
        while($row = $result->fetch_assoc()) {
            if($row['userid'] != $_SESSION['userid']) {
                $arr['owner'] = false;
                echo json_encode($arr);
                die();
            } else {
                $arr['owner'] = true;
            }
        }
    }

    //Delete event from database
    $query = $conn->prepare('DELETE FROM events WHERE id=(?) AND userId=(?)');
    $query->bind_param("ii", $id, $_SESSION['userid']);
    if($query->execute()) {
        $arr['success'] = true;
    } else {
        $arr['success'] = false;
    }

    echo json_encode($arr);
?>