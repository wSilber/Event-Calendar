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

    //Check to make sure user is already logged in
    if(isset($_SESSION['user'])) {
        echo json_encode(array("already logged in" => true));
        die();
    }

    //$arr['already logged in'] = false;

    //connect to database with wustl user
    $conn = new mysqli('localhost', 'wustl_inst', 'wustl_pass', 'calendar');

    //exit if connection fails
    if ($conn->connect_error) {
        $arr['sql connection'] = false;
        echo json_encode($arr);
        die();
    }

    //Make sure email is filled out
    if(isset($email)) {

        //validate email is in correct format
        $email_regex = "/^[\w!#$%&'*+\/=?^_`{|}~-]+@([\w\-]+(?:\.[\w\-]+)+)$/";
	    if(!preg_match($email_regex, $email, $matches)){

            $arr['incorrect email format'] = true;
            echo json_encode($arr);
            die();
	    }

        //Select all emails from database
        $query = 'SELECT `email` FROM `users`';
        $result = mysqli_query($conn, $query);
        while($row = mysqli_fetch_array($result)) {

            //Check to see if email given matches any emails in database
            $emails = [];
            if($row['email'] == $email) {
                
                //Check to see if password was given
                if(isset($password)) {

                    //Hash password
                    $_Password = password_hash($password, PASSWORD_DEFAULT);

                    //Select hashed password from database
                    $query = 'SELECT * FROM `users` WHERE `email`="'.$row['email'].'"';
                    $resultPassword = mysqli_query($conn, $query);
                    while($rowPassword = mysqli_fetch_array($resultPassword)) {

                        //Securely verifies if hashed password matches up with database hashed password
                        if(password_verify($password, $rowPassword['password'])) {

                            //Set the session variable at 'user' to equal users email (log them in)
                            $_SESSION['user'] = mysqli_real_escape_string($conn, $row['email']);

                            //Set the session userid variable to user's id
                            $_SESSION['userid'] = $rowPassword['id'];

                            //Add token to user's session to prevent CSRF attack
                            $_SESSION['token'] = bin2hex(random_bytes(32));

                            $arr['session'] = $_SESSION['user'];
                            $arr['userid'] = $_SESSION['userid'];
                            $arr['token'] = $_SESSION['token'];
                            $arr['success'] = true;

                            echo json_encode($arr);
                            die();
                        } else {
                            $arr['password incorrect'] = true;
                            echo json_encode($arr);
                            die();
                        }
                    }
                } else {
                    $arr['password given'] = false;
                }
            }
        }

        //Let user know that email or password does not exist
        $arr['email correct'] = false;
    } else {
        $arr['email given'] = false;
    }

    echo json_encode($arr);
?>