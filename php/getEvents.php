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

    //connect to database with wustl user
    $conn = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calendar');



    //exit if connection fails
    if ($conn->connect_error) {
        $arr['sql connection'] = false;
        echo json_encode($arr);
        die();
    }

    //Push all events created by user into array
    $query = $conn->prepare('SELECT * FROM events WHERE userId="'.$_SESSION['userid'].'"');

    $query->execute();
    $result = $query->get_result();
    while($row = $result->fetch_assoc()) {
        array_push($arr, $row);
    }

    //Push all events shared to user into array
    $query = $conn->prepare('SELECT * FROM events WHERE shareId=(?)');
    $query->bind_param("i", $_SESSION['userid']);
    $query->execute();
    $result = $query->get_result();
    while($row = $result->fetch_assoc()) {
        array_push($arr, $row);
    }

    //Return all events
    echo json_encode($arr);

?>