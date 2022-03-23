//Show create event modal when create event button clicked
$('#create-event-btn').click(function() {
    hideEventError();
    $('#create-event-modal').modal('show')

})

//Delete event when the delete event button is clicked
$('#delete-event-btn').click(function() {
    var id = $('#delete-event-id').val();
    
    const data = {'id': id, 'token': token}

    fetch("php/deleteEvent.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(function(text) {
        if(!text.owner) {
            hideEditEventModal();
            showOwnerError("ERROR: You must be the owner to modify this event");
        } else if(text.success) {

            //Reload calendar UI on successful delete
            getUserEvents();
            hideEditEventModal();
        }
    })
    .catch(err => console.error(err));
})

//Creates event when the create event button is clicked
$('#create-event-btn-final').click(function() {
    var title = document.getElementById('create-event-title').value;
    var description = document.getElementById('create-event-description').value;
    var date = document.getElementById('create-event-date').value;
    var color = document.getElementById('create-event-color').value;
    var shareUser = document.getElementById("create-event-share-user").value;

    const data = {'title': title, 'description': description, 'date': date, 'color': color, 'shareUser': shareUser, 'token': token}

    fetch("php/createEvent.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(function(text) {

        //Display error to user if not successful
        if(text.nosession) {
            showEventError("ERROR: You must be logged in to do this")
        } else if(text.date == false) {
            showEventError("ERROR: Must specify date")
        } else if(text.incorrect_share_email_format) {
            showEventError("ERROR: Invalid email format")
        } else if(text.shareUser_Not_Found) {
            showEventError("ERROR: Use does not exist")
        } else if(text.shared_with_self) {
            showEventError("ERROR: Cannot share event with yourself")
        } else if (text.success) {

            //Update Calendar UI on success
            hideEventModal();
            getUserEvents();
        }
    })
    .catch(err => console.error(err));
})

//Edits event when edit event button clicked
$('#edit-event-btn-final').click(function() {
    var id = document.getElementById('edit-event-id').value;
    var title = document.getElementById('edit-event-title').value;
    var description = document.getElementById('edit-event-description').value;
    var date = document.getElementById('edit-event-date').value;
    var color = document.getElementById('edit-event-color').value;
    var shareUser = document.getElementById("edit-event-share-user").value;

    editEvent(id, title, description, date, color, shareUser);
})

//Function to edit events with new given information
function editEvent(id, title, description, date, color, shareUser) {
    const data = {'id': id, 'title': title, 'description': description, 'date': date, 'color': color, 'shareUser': shareUser, 'token': token}

    fetch("php/editEvent.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(function(text) {

        //Display errors if unsuccessful
        if(text.nosession) {
            showEventEditError("ERROR: You must be logged in to do this")
        } else if(text.date == false) {
            showEventEditError("ERROR: Must specify date")
        } else if(text.incorrect_share_email_format) {
            showEventEditError("ERROR: Invalid email format")
        } else if(text.shareUser_Not_Found) {
            showEventEditError("ERROR: User does not exist")
        } else if(text.shared_with_self) {
            showEventEditError("ERROR: Cannot share event with yourself")
        } else if(!text.owner) {
            showOwnerError("ERROR: You must be the owner to modify this event");
            hideEditEventModal();
            updateCalendar();
        } else if(text.success) {

            hideOwnerError();
            //Update Calendar if successful
            if($('#edit-event-modal').is(':visible')) {
                updateCalendar();
                hideEditEventModal();
            }
        }
    })
    .catch(err => console.error(err));
}

//Function to show event error
function showEventError(error) {
    $('#create-event-error').text(error)
    $('#create-event-error').show();
}

//Function to show error on edit event modal
function showEventEditError(error) {
    $('#edit-event-error').text(error)
    $('#edit-event-error').show();
}

//Function to hide event error
function hideEventError() {
    $('#create-event-error').hide();
}

//Function to hide edit event error
function hideEventEditError() {
    $('#edit-event-error').hide();
}


//Function to hide edit event modal
function hideEditEventModal() {
    $('#edit-event-modal').modal('hide');
}

//Function to hide event modal
function hideEventModal() {
    $('#create-event-modal').modal('hide')
}

function showOwnerError(error) {
    $('#alert-error').text(error)
    $('#alert-error').show();
}

function hideOwnerError() {
    $('#alert-error').hide();
}