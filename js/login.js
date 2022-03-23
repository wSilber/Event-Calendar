var login = true;
var user = '';
var token = '';

//Function when document is fully loaded
$(document).ready(function() {
    $('.modal-register-active').hide();
    getSession();
})

//function that happens shows login modal when clicked
$('#login-btn-sit').click(function() {
    showLoginModal()
});

//Registers user when register button is clicked
$('#register-btn').click(function() {
    registerAjax();
})

//Logs in user when login button is clicked
$('#login-btn').click(function() {
    loginAjax();
})

//Logs out user when logout button is clicked
$('#logout-btn').click(function() {
    logout();
})

//Switches the login modal from login to register
$('.login-switch-btn').click(function() {
    if(login) {
        $('.modal-login-active').hide();
        $('.modal-register-active').show();
    } else {
        $('.modal-login-active').show();
        $('.modal-register-active').hide();
    }
    login = !login;
})


//Function to login user
function loginAjax(event) {
        var email = $('#login-email').val();
        var password = $('#login-password').val();

    const data = { 'email': email, 'password': password };

    fetch("php/login.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(function(text) {
            if(text.success == true) {
                if(text.session != false) {
                    
                    //Update calendar if user is successfully logged in
                    updatePageLoginBtn(true)
                    showLoginSuccess();
                    updateCalendar();
                    token = text.token;
                } else {
                    updatePageLoginBtn(false)
                }
                destroyLoginModal();
            } else {

                //Show error on unsuccessful login
                showLoginError("ERROR: Email or Password is incorrect")
            }
        })
        .catch(err => console.error(err));
}

//Function to register user
function registerAjax(event) {
    var email = $('#register-email').val();
    var password = $('#register-password').val();
    var passwordConfirm = $('#register-password-confirm').val();

const data = { 'email': email, 'password': password, 'passwordConfirm': passwordConfirm};

fetch("php/registerUser.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(function(text) {
        if(text.success == true) {

            //Show successful login on success
            destroyLoginModal();
            showLoginSuccess();
        } else {
            
            //Show errors on unsuccessful register
            if(text.incorrect_email_format) {
                showRegisterError("ERROR: Incorrect email format")
            } else if(text.email_exists) {
                showRegisterError("ERROR: Email already exists!")
            }
        }
    })
    .catch(err => console.error(err));
}

//Function to get user's session
function getSession(event) {
    fetch("php/getSession.php", {
        method: 'POST'
    })
    .then(res => res.json())
    .then(function(text) {
        if(text.session != false) {

            //Update user and token on success
            user = text.session
            token = text.token;
            updatePageLoginBtn(true)
        } else {
            updatePageLoginBtn(false)
        }
    });
}

//Shows login modal
function showLoginModal() {
    $("#login-modal").modal('show');
    $('.modal-register-active').hide();
    hideLoginError();
    hideRegisterError();
}

//Hides login modal
function destroyLoginModal() {
    $("#login-modal").modal('hide');
}

//Updates login button 
function updatePageLoginBtn(status) {
    if(status) {
        $('#show-login-btn').hide();
        $('#user-welcome').show();
    } else {
        $('#user-welcome').hide();
        $('#show-login-btn').show();
    }
}

//Function to logout user
function logout() {
    fetch("php/logout.php", {
        method: 'POST'
    })
    .then(res => res.json())
    .then(function(text) {
        updatePageLoginBtn(false, null)
        showLogoutSuccess();
        updateCalendar();
    });
}

//Show login error
function showLoginError(error) {
    $('#login-error').show();
    $('#login-error').html(error)
}

//Show register error
function showRegisterError(error) {
    $('#register-error').show();
    $('#register-error').html(error)
}

//Hide login error
function hideLoginError() {
    $('#login-error').hide();
}

//Hide register error
function hideRegisterError() {
    $('#register-error').hide();
}

//Show user successful login
function showLoginSuccess() {
    $('#login-success').show();
}

//Show user successful logout
function showLogoutSuccess() {
    $('#logout-success').show();
}

//Updates calendar UI
function updateCalendar() {
    document.getElementById('calendar-days').innerHTML = '';
    getUserEvents()
}
