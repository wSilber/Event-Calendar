<?php

    ini_set("session.cookie_httponly", 1);

    //Destroy the user session
    session_start();
    session_destroy();

    header("Content-Type: application/json");
    $arr = array();

    $arr['logout'] = true;

    echo json_encode($arr);

?>