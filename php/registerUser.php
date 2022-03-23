<?php
ini_set("session.cookie_httponly", 1);

session_start();

header("Content-Type: application/json");
$arr = array();


$json_str = file_get_contents('php://input');
//This will store the data into an associative array
$json_obj = json_decode($json_str, true);

    $email = $json_obj['email'];
    $password = $json_obj['password'];
    $passwordConfirm = $json_obj['passwordConfirm'];

    //Send user back to homepage if already logged in
    if(isset($_SESSION['user'])) {
        echo json_encode(array("already logged in" => true));
        die();
    }

    //validate email is in correct format
    $email_regex = "/^[\w!#$%&'*+\/=?^_`{|}~-]+@([\w\-]+(?:\.[\w\-]+)+)$/";
	if(!preg_match($email_regex, $email, $matches)){
        $arr['incorrect_email_format'] = true;
        echo json_encode($arr);
        die();
	}

    //Send user back to homepage with error if passwords do not match
    if($password != $passwordConfirm) {
        echo json_encode(array("password_match" => false));
        die();
    }

    //Connect to database
    $conn = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calendar');

    if ($conn->connect_error) {
        $arr['sql_connection'] = false;
        echo json_encode($arr);
        die();
    }

    //Check to see if email already exists
    $query = 'SELECT `email` FROM `users`';
    $result = mysqli_query($conn, $query);
    while($row = mysqli_fetch_array($result)) {
        if(mysqli_real_escape_string($conn, $row['email']) == $email) {
            $arr['email_exists'] = true;
            echo json_encode($arr);
            die();
        }
    }

    //Insert sanitized email and hashed password into database
    $query = $conn->prepare('INSERT INTO users (email, password) values (?, ?)');
    $pass = password_hash($password, PASSWORD_DEFAULT);
    $query->bind_param("ss", $email, $pass);
    $query->execute();

    //Select hashed password from database
    $query = 'SELECT * FROM `users` WHERE `email`="'.$email.'"';
    $result = mysqli_query($conn, $query);
    while($row = mysqli_fetch_array($result)) {

        //Log user in and send them to news page
        $_SESSION['user'] = $email;
        $arr['user'] = $email;
        //Set the session userid variable to user's id
        $_SESSION['userid'] = $row['id'];
        $arr['userid'] = $row['id'];

        //Add token to user's session to prevent CSRF attack
        $_SESSION['token'] = bin2hex(random_bytes(32));
        $arr['token'] = $_SESSION['token'];
    }
    $arr['success'] = true;
    echo json_encode($arr);

?>