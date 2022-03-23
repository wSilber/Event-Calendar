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
    $title = 'Untitled Event';
    $description = '';
    $date = '';
    $color = 'white';
    $shareUser = '';
    $token = '';
    
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    //Get token
    if($json_obj['token'] != '') {
        $token = $json_obj['token'];
    }

    //Verify token given
    if($token != $_SESSION['token']) {
        echo json_encode(array("Invalid Token" => true));
        die();
    } else { 
        $arr['token'] = true;
    }

    //Get date if given - throw error if none given
    if($json_obj['date'] != '') {
        $date = $json_obj['date'];
        $arr['date'] = $date;
    } else {
        $arr['date'] = false;
        echo json_encode($arr);
        die();
    }

    //Get title given
    if($json_obj['title'] != '') {
        $title = $json_obj['title'];
        $arr['title'] = $title;
    } else {
        $arr['title'] = false;
    }

    //Get description given
    if($json_obj['description'] != '') {
        $description = $json_obj['description'];
        $arr['description'] = $description;
    } else {
        $arr['description'] = false;
    }

    //Get color given
    if($json_obj['color'] != '') {
        $color = $json_obj['color'];
        $arr['color'] = $color;
    } else {
        $arr['color'] = false;
    }

    //Get shared user given
    if($json_obj['shareUser'] != '') {
        $shareUser = $json_obj['shareUser'];
        $arr['shareUser'] = $shareUser;
    } else {
        $arr['shareUser'] = false;
    }

    //validate shared user email is in correct format
    if($shareUser != '') {
        $email_regex = "/^[\w!#$%&'*+\/=?^_`{|}~-]+@([\w\-]+(?:\.[\w\-]+)+)$/";
        if(!preg_match($email_regex, $shareUser, $matches)){
    
            $arr['incorrect_share_email_format'] = true;
            $shareUser = '';
        }
    }

    //Verify that user does not share event with themselves
    if($shareUser == $_SESSION['user']) {
        $shareUser = '';
        $arr['shared_with_self'] = true;
    }

    //connect to database with wustl user
    $conn = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calendar');

    //exit if connection fails
    if ($conn->connect_error) {
        $arr['sql connection'] = false;
        echo json_encode($arr);
        die();
    }

    $userId = -1;

    //Verify if shared user exists
    if($shareUser != '') {
        $query = $conn->prepare('SELECT id FROM users WHERE email=(?)');
        $query->bind_param("s", $shareUser);
        if($query->execute()) {
            $result = $query->get_result();
            while($row = $result->fetch_assoc()) {
                $userId = $row['id'];
            }
            $arr['shareUser Found'] = true;
        }

        if($userId == -1) {
            $result = 0;
            $arr['shareUser_Not_Found'] = true;
        }
    }

    //Insert event into database
    $query = $conn->prepare('INSERT INTO events (userid, title, description, date, color, shareId) values (?, ?, ?, ?, ?, ?)');
    $query->bind_param("issssi", $_SESSION['userid'], $title, $description, $date, $color, $userId);
    if($query->execute()) {
        $arr['success'] = true;
    } else {
        $arr['success'] = false;
    }

    echo json_encode($arr);

?>