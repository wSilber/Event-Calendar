var dayNames = ["Sunday", "Monday", "Tuesday", "Wednsday", "Thursday", "Friday", "Saturday"];
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var currentMonth = new Date(Date.now()).getMonth();
var currentYear = new Date(Date.now()).getFullYear();
const calendar = document.getElementById('calendar-days');
var currentEvent = '';

//Loads calendar once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    getUserEvents()
})

//Function to reload calendar
function getUserEvents() {
    var arr = []
    calendar.innerHTML = '';
    fetch("php/getEvents.php", {
        method: 'POST'
    })
    .then(res => res.json())
    .then(function(text) {

        //Determine wheither use is logged in 
        if(!text.nosession) {
            var allUserEvents = [];

            //Get all user events
            text.forEach(function(event) {
                arr.push(event);
                allUserEvents.push(event);
            })

            //Draw calendar with all user events
            new Month(currentYear, currentMonth, allUserEvents).draw();
        } else {

            //Draw calendar with no events
            new Month(currentYear, currentMonth, null).draw();
        }

        //Make events draggable
        $('.event').draggable({
            containment: 'document',
            zIndex: 100,
            helper: 'clone',
            start: function(event, ui) {
                currentEvent = $(this);
            }
        });
        
        //Make all days a droppable area
        $('.card-day').droppable({

            //Changes background color of day if event is dragged over it
            over: function(event, ui) {
                $(this).css('background-color', '#CCCCCC')
            },

            //Changed background color of day back to white if event is dragged out of the day area
            out: function(event, ui) {
                $(this).css('background-color', 'white')
            },

            //Function that is called when event is dropped into certain day
            drop: function(event, ui) {
                $(this).css('background-color', 'white')
                $(this).append(currentEvent);
                var number = parseInt($(this).children()[0].childNodes[0].textContent);
                var newDate = String($(currentEvent).children()[3].value).replace(/\b-\d+ \b/g, '-' + number + ' ');
                var title = $(currentEvent).children()[0].innerText;
                var id = $(currentEvent).children()[2].value;
                var desc = $(currentEvent).children()[4].value;
                var color = $(currentEvent).css('background-color');

                //Edit event with new day
                editEvent(id, title, desc, newDate, color, null);

                //Update event after drop
                text.forEach(function(event) {
                    arr.push(event);
                    allUserEvents.push(event);
                })
            }
        });
    });
}

//Draws the calendar for next month when button is clicked
 $('#change_month_right').click(function() {
     if(currentMonth == 11) {
        currentMonth = 0;
        currentYear++;
     } else {
        currentMonth++;
     }
     calendar.innerHTML = '';
     getUserEvents()
 })

 //Draws the calendar for the previous month when button clicked
 $('#change_month_left').click(function() {
    if(currentMonth == 0) {
       currentMonth = 11;
       currentYear--;
    } else {
       currentMonth--;
    }
    calendar.innerHTML = '';
    getUserEvents()
})

//Day object
function Day(date, events) {

    //instance variables
    this.date = date;
    this.events = [];
    if(events != null) {
        this.events = events;
    }

    //Function to draw padding days for when first day of month does not start of Sunday
    this.drawPadding = function(node) {
        var container = document.createElement("div");
        var numberContainer = document.createElement("div");
        container.classList.add("card-day-padding");
        container.classList.add("col-sm-1");
        numberContainer.classList.add("day-number");
        var dayNumber = document.createElement("span");
        numberContainer.appendChild(dayNumber);
        container.appendChild(numberContainer);
        return container
    }

    //Function to draw all events for each day
    this.drawEvent = function(node) {
        var eventDiv = document.createElement('div');
        eventDiv.classList.add("events");
        var date = this.date;
        this.events.forEach(function(event) {

            //Check if the event date matches this day
            if(new Date(date).getYear() == new Date(event.date).getYear() && new Date(date).getMonth() == new Date(event.date).getMonth() && new Date(date).getDate() == new Date(event.date).getDate()) {
                var eventDate = event.date;
                var eventTitle = event.title;
                var color = event.color;
                var id = event.id;
                var description = event.description;

                //Create event document structure
                var event = document.createElement('div');
                var title = document.createElement("p");
                var time = document.createElement("p");
                var idInput = document.createElement("input");
                var fullDate = document.createElement("input");
                var desc = document.createElement("input")

                title.classList.add("no-margin");
                time.classList.add("no-margin");
                event.classList.add("centered");
                event.classList.add("event");

                event.style.cssText = "background-color: " + color;

                title.innerText = eventTitle;
                time.innerText = eventDate.substr(11, 5);
                idInput.value = id;
                fullDate.value = eventDate;
                desc.value = description;

                idInput.style.cssText = "display: none";
                fullDate.style.cssText = "display: none";
                desc.style.cssText = "display: none";

                //Add event to the day structure
                event.appendChild(title);
                event.appendChild(time);
                event.appendChild(idInput);
                event.appendChild(fullDate);
                event.appendChild(desc)
                eventDiv.appendChild(event);

                //Adds a click listener to the event. Shows edit event modal when event is clicked. Passes event information to the modal
                event.addEventListener('click', function() {
                    var title = this.childNodes[0].innerHTML;
                    var id = this.childNodes[2].value;
                    var date = this.childNodes[3].value;
                    var desc = this.childNodes[4].value;
                    var descReplace = date.replace(/ /g, 'T')
                    var color = $(this).css('background-color');

                    //Passes event information to modal
                    document.getElementById('edit-event-title').value = title
                    document.getElementById('edit-event-description').innerText = desc
                    document.getElementById('edit-event-date').value = descReplace;
                    document.getElementById('edit-event-id').value = id;
                    document.getElementById('delete-event-id').value = id;
                    document.getElementById('edit-event-color').value = color;

                    //Shows edit event modal
                    hideEventEditError()
                    $("#edit-event-modal").modal('show');
                })
            }
        })

        //Appends entire events structure to the day structure
        node.appendChild(eventDiv)
    }

    //Function to draw day 
    this.draw = function(node) {

        //Create structure for day
        var container = document.createElement("div");
        var numberContainer = document.createElement("div");
        container.classList.add("card-day");
        container.classList.add("col-sm-1");
        numberContainer.classList.add("day-number");
        var dayNumber = document.createElement("span");

        //Add day number
        dayNumber.innerText = new Date(date).getDate();
        numberContainer.appendChild(dayNumber);
        container.appendChild(numberContainer);

        //Add events to day
        this.drawEvent(container);

        //Return structure representing the day
        return container
    }
}



//Week object
function Week(days, events) {

    //Instance variables
    this.days = days;
    this.events = events;

    //Returns the day specified
    this.getDay = function(day){
        return days[day];
    }

    //Function to draw a week
    this.draw = function(days) {

        //Create week structure
        var row = document.createElement("div");
        row.classList.add('row');
        
        //Calculate the amount of padding days needed || ONLY FOR FIRST WEEK
        if(new Date(this.days[0].date).getDay() != 0) {
            for(var i = 0; i < new Date(this.days[0].date).getDay(); i++) {

                //Add padding days
                row.appendChild(this.days[0].drawPadding(row))
            }
        }
        
        //Add all days structure to week structure
        this.days.forEach(function(day) {
            row.appendChild(day.draw(row))
        })

        //Add week structure to the full calendar
        calendar.appendChild(row);
    }
}

//Month object
function Month(year, month, events) {

    //Instance variables
    this.year = year;
    this.month = month
    this.weeks = [];
    this.days = [];
    this.events = events

    //Function to initialize month
    this.initialize = function() {

        //Get the last day in month
        var date = new Date(year, month + 1, 0);
        var daysReverse = [];
        var weekDays = [];
        var counter = 1;

        //Push all days in month into an array
        while (date.getMonth() === month) {
          daysReverse.push(new Date(date));
          date.setDate(date.getDate() - 1);
          counter++;
        }

        //Push all days from array into days variable in reverse order
        for(var i = daysReverse.length - 1; i >= 0; i--) {

            //Push days into day array
            this.days.push(daysReverse[i])

            //Push day into week array
            weekDays.push(new Day(new Date(daysReverse[i]), this.events));

            //If day is a saturday start a new week (resets week array)
            if(new Date(daysReverse[i]).getDay() == 6) {
                this.weeks.push(weekDays);
                weekDays = [];
            }
        }

        //push push final week into weeks array
        this.weeks.push(weekDays);
    }

    //Function to draw week
    this.draw = function() {
        this.initialize();

        //Draw name for month and year
        var month = document.getElementById('month');
        month.innerText = monthNames[this.month] + " " + this.year;

        //Draw each week in month
        this.weeks.forEach(function(week) {
            if(week.length > 0) {
                var weekObj = new Week(week);
                weekObj.draw();
            }
        })
    }
}