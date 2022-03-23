<?php
    ini_set("session.cookie_httponly", 1);

    session_start();

    header("Content-Type: application/json");
    $arr = array();

    //Send back the user's email and token if they are logged in
    if(isset($_SESSION['user'])) {
        $arr['session'] = $_SESSION['user'];
        $arr['token'] = $_SESSION['token'];
    } else {
        $arr['session'] = false;
    }

    echo json_encode($arr);
?>