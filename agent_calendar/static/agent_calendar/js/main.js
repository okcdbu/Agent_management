(function($) {
	"use strict";
	// Setup the calendar with the current date
$(document).ready(function(){
    var date = new Date();
    var today = date.getDate();
    // Set click handlers for DOM elements
    $(".right-button").click({date: date}, next_year);
    $(".left-button").click({date: date}, prev_year);
    $(".month").click({date: date}, month_click);
    $("#add-button").click({date: date}, new_event);

    // Set current month as active
    $(".months-row").children().eq(date.getMonth()).addClass("active-month");
    // Get Data from DB
    get_dayoff(url_to_Dayoff);
    get_holidays(url_to_Holidays)
    init_calendar(date);
    var events = check_events(today, date.getMonth()+1, date.getFullYear());
    var holidays = check_holidays(today,date.getMonth()+1, date.getFullYear())
    show_events(events,holidays, months[date.getMonth()], today);
    // Modal Button settings
    $("#modify").click(modalchange);
    $("#cancel").click(modaldelete);
});

// Initialize the calendar by appending the HTML dates
function init_calendar(date) {
    $(".tbody").empty();
    $(".events-container").empty();
    var calendar_days = $(".tbody");
    var month = date.getMonth();
    var year = date.getFullYear();
    var day_count = days_in_month(month, year);
    var row = $("<tr class='table-row'></tr>");
    var today = date.getDate();
    // Set date to 1 to find the first day of the month
    date.setDate(1);
    var first_day = date.getDay();
    // 35+firstDay is the number of date elements to be added to the dates table
    // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
    for(var i=0; i<35+first_day; i++) {
        // Since some of the elements will be blank, 
        // need to calculate actual date from index
        var day = i-first_day+1;
        // If it is a sunday, make a new row
        if(i%7===0) {
            calendar_days.append(row);
            row = $("<tr class='table-row'></tr>");
        }
        // if current index isn't a day in this month, make it blank
        if(i < first_day || day > day_count) {
            var curr_date = $("<td class='table-date nil'>"+"</td>");
            row.append(curr_date);
        }   
        else {
            var curr_date = $("<td class='table-date'>"+day+"</td>");
            var events = check_events(day, month+1, year);
            var holidays = check_holidays(day,month + 1,year)
            if(today===day && $(".active-date").length===0) {
                curr_date.addClass("active-date");
                if(holidays.length !== 0){
                    $("#add-button").attr('disabled', true)
                }
                else if(username){
                    $("#add-button").attr('disabled', false)
                }
                show_events(events, holidays, months[month], day);
            }
            // If this date has any events, style it with .event-date
            if(events.length!==0) {

                curr_date.addClass("event-date");
            }
            if(holidays.length!==0) {
                curr_date.addClass("holiday-date")
            }
            // Set onClick handler for clicking a date
            curr_date.click({events: events,holidays: holidays, month: months[month], day:day}, date_click);
            row.append(curr_date);
        }
    }
    // Append the last row and set the current year
    calendar_days.append(row);
    $(".year").text(year);
}

// Get the number of days in a given month/year
function days_in_month(month, year) {
    var monthStart = new Date(year, month, 1);
    var monthEnd = new Date(year, month + 1, 1);
    return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);    
}

// Event handler for when a date is clicked
function date_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    $(".active-date").removeClass("active-date");
    $(this).addClass("active-date");
    console.log(event.data.day)
    if(event.data.holidays.length !== 0){
        $("#add-button").attr('disabled', true)
    }
    else if(username){
        $("#add-button").attr('disabled', false)
    }
    show_events(event.data.events, event.data.holidays, event.data.month, event.data.day);
};

// Event handler for when a month is clicked
function month_click(event) {
    $(".events-container").show(250);
    $("#dialog").hide(250);
    var date = event.data.date;
    $(".active-month").removeClass("active-month");
    $(this).addClass("active-month");
    var new_month = $(".month").index(this);
    date.setMonth(new_month);
    init_calendar(date);
}

// Event handler for when the year right-button is clicked
function next_year(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_year = date.getFullYear()+1;
    $("year").html(new_year);
    date.setFullYear(new_year);
    init_calendar(date);
}

// Event handler for when the year left-button is clicked
function prev_year(event) {
    $("#dialog").hide(250);
    var date = event.data.date;
    var new_year = date.getFullYear()-1;
    $("year").html(new_year);
    date.setFullYear(new_year);
    init_calendar(date);
}

// Event handler for clicking the new event button
function new_event(event) {
    // if a date isn't selected then do nothing
    if($(".active-date").length===0)
        return;
    // remove red error input on click
    $("input").click(function(){
        $(this).removeClass("error-input");
    })
    // empty inputs and hide events
    $("#dialog input[type=text]").val('');
    $(".events-container").hide(250);
    $("#dialog").show(250);
    // Event handler for cancel button
    $("#cancel-button").click(function() {
        $("#content").removeClass("error-input");
        $("#dialog").hide(250);
        $(".events-container").show(250);
    });
    // Event handler for ok button
    $("#ok-button").unbind().click({date: event.data.date}, function() {
        var type = $("#type input:radio:checked").val();
        var content = $("#content").val().trim();
        var daytype = $("#days input:radio:checked").val();
        var username1 = username;
        var date = event.data.date;
        var day = parseInt($(".active-date").html());
        // Basic form validation
        if(content.length === 0) {
            $("#content").addClass("error-input");
        }
        else {
            $("#dialog").hide(250);

            date.setDate(day);
            post_dayoff(url_to_Dayoff,{
                "type": type,
                "daytype": daytype,
                "content": content,
                "username": username1,
                "date": new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().substring(0,10),
            });
            init_calendar(date);
        }
    });
}

// Adds a json event to event_data
function new_event_json(id, type, content, daytype, username, date) {
    var event = {
        "id" : id,
        "type": type,
        "daytype": daytype,
        "content": content,
        "username": username,
        "year": date.getFullYear(),
        "month": date.getMonth()+1,
        "day": date.getDate(),
    };
    event_data["events"].push(event);
}

function holiday_data_json(title,date) {
    var event = {
        "title" : title,
        "year": date.getFullYear(),
        "month": date.getMonth()+1,
        "day": date.getDate(),
    }
    event_data["holidays"].push(event);
}

// Display all events of the selected date in card views
function show_events(events, holidays, month, day) {
    // Clear the dates container
    $(".events-container").empty();
    $(".events-container").show(250);
    // If there are no events for this date, notify the user
    if(events.length===0 && holidays.length ===0) {
        var event_card = $("<div class='event-card text-center'></div>");
        var event_name = $("<div class='event-name'>"+month+" "+day+"일 에는 예정된 일정이 없습니다.</div>");
        $(event_card).css({ "border-left": "10px solid #FF1744" });
        $(event_card).append(event_name);
        $(".events-container").append(event_card);
    }
    else if(events.length ===0){
        var event_card = $("<div class='event-card text-center'></div>");
        var event_name = $("<div class='event-name'>" + holidays[0]["title"]+ "</div>");
        $(event_card).css({ "border-left": "10px solid #FF1744" });
        $(event_card).append(event_name);
        $(".events-container").append(event_card);

    }
    else {
        // Go through and add each event as a card to the events container
        for(var i=0; i<events.length; i++) {
            var event_card = $("<div class='event-card text-center'></div>");
            var title = events[i]["username"] + " " + printdict[events[i]["daytype"]] + " " + printdict[events[i]["type"]];
            var event_name = $("<div class='event-name'>"+title+"</div>");
            $(event_card).data("data",events[i]);
            $(document).on("click",".event-card", function () {
                jQuery.noConflict();
                var text = $(this).text();
                var content = "<h5>휴가 내용</h5><p>" + $(this).data("data")['content'] + "</p>";
                $(".modal-content").data("event", $(this).data("data"))
                $(".modal-title").text(text);
                $(".modal-body").html(content);
                modalfooterDisplay(username);
                $("#modalBox").modal("show")
            })
            // if(events[i]["cancelled"]===true) {
            //     $(event_card).css({
            //         "border-left": "10px solid #FF1744"
            //     });
            //     var event_cancelled = $("<div class='event-cancelled'>Cancelled</div>");
            //     $(event_name).append(event_cancelled)
            // }
            $(event_card).append(event_name);
            $(".events-container").append(event_card);
        }
    }
}

// Checks if a specific date has any events
function check_events(day, month, year) {
    var events = [];
    for(var i=0; i<event_data["events"].length; i++) {
        var event = event_data["events"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                events.push(event);
            }
    }
    return events;
}

function check_holidays(day,month,year) {
    var events = [];
    for(var i=0; i<event_data["holidays"].length; i++) {
        var event = event_data["holidays"][i];
        if(event["day"]===day &&
            event["month"]===month &&
            event["year"]===year) {
                events.push(event);
            }
    }
    return events;
}
// Need to modify and add listener to #modify
function modalchange() {
    var data = $(".modal-content").data("event");
    //console.log(data)
    $('#modalBox').modal('hide');
    $(".events-container").hide(250);
    $("#dialog").show(250);
    $("#dialog input[type=text]").val(data["content"]);

    // Event handler for ok button
    $("#ok-button").unbind().click({event: data}, function(event) {
        var type = $("#type input:radio:checked").val();
        var content = $("#content").val().trim();
        var daytype = $("#days input:radio:checked").val();
        //console.log(event.data.event)
        var date = new Date(event.data.event['year'],event.data.event['month'] - 1,event.data.event['day'])
        var id = event.data.event["id"];
        // Basic form validation
        if(content.length === 0) {
            $("#content").addClass("error-input");
        }
        else {
            $("#dialog").hide(250);

            put_dayoff(url_to_Dayoff,{
                "id" : id,
                "type": type,
                "daytype": daytype,
                "content": content,
            });
            init_calendar(date);
        }
    });
}
// Need to modify and add listener to #cancel
function modaldelete() {
    var data = $(".modal-content").data("event");
    $('#modalBox').modal('hide');
    //console.log(data)
    if(confirm('정말 취소하겠습니까?')){
        delete_dayoff(url_to_Dayoff,{
            "id" : data['id']
        });
        var today = new Date(data['year'],data['month']-1,data['day']);
        init_calendar(today)
    }
    else return false;

}

// Modal Button Display settings
function modalfooterDisplay(curuser) {
    var event_owner = $(".modal-content").data("event")['username']
    if(curuser === event_owner){
        $("#modify").show()
        $("#cancel").show()
        if($(".modal-content").data("event")['cancelled']){
            $("#cancel").prop("disabled",true);
        }
        else{
            $("#cancel").prop("disabled",false);
        }
    }
    else{
        $("#modify").hide()
        $("#cancel").hide()
    }
}

// Get data from backend database, defined in agent_calendar.Dayoff
function get_dayoff(url) {
    $.ajax({
        url: url,
        dataType: 'json',
        async: false,
        success: function (data) {
            for(var jsondata of data){
                var date = new Date(jsondata.fields.date)
                new_event_json(jsondata.pk, jsondata.fields.type,
                jsondata.fields.content,jsondata.fields.daytype,jsondata.fields.username[0],date)
            }
        },
        error: function (request,status,error) {
            console.log(request)
        }
    });
}

// Post data to backend database, defined in agent_calendar.Dayoff
function post_dayoff(url,event) {
    $.ajax({
       url:url,
       type:'POST',
       data: JSON.stringify(event),
       async : false,
       headers:{
         'X-CSRFTOKEN' : csrf_token
       },
       success: function (data) {
            //console.log(data)
            for(var jsondata of data){
                var date = new Date(jsondata.fields.date)
                new_event_json(jsondata.pk, jsondata.fields.type,
                    jsondata.fields.content,jsondata.fields.daytype,jsondata.fields.username[0],date)
            }
       },
       error: function (request,status,error) {
            console.log(error)
       }
    });
}

// Update data from backend database, defined in agent_calendar.Dayoff
function put_dayoff(url,event) {
    $.ajax({
       url:url,
       type:'PUT',
       data: JSON.stringify(event),
       async:false,
       headers:{
         'X-CSRFTOKEN' : csrf_token
       },
       success: function (data) {
           var idx = event_data['events'].findIndex((eventdata) => eventdata.id === event.id )
           event_data['events'][idx].type = event.type;
           event_data['events'][idx].daytype = event.daytype;
           event_data['events'][idx].content = event.content;
       },
       error: function (request,status,error) {
            console.log(error)
       }
    });
}
// Delete data from backend database, defined in agent_calendar.Dayoff
function delete_dayoff(url,event) {
    $.ajax({
       url:url,
       type:'DELETE',
       data: JSON.stringify(event),
       async:false,
       headers:{
         'X-CSRFTOKEN' : csrf_token
       },
       success: function () {
           var idx = event_data['events'].findIndex((eventdata) => eventdata.id === event.id )
           event_data['events'].splice(idx,1)
       },
       error: function (request,status,error) {
            console.log(error)
       }
    });
}

function get_holidays(url) {
    $.ajax({
        url : url,
        type : 'GET',
        async : false,
        success: function (data) {
            for(var i in data){
                holiday_data_json(data[i].title,new Date(data[i].start))
            }
        },
        error: function (request,status,error) {
            console.log(error)
        }
    })
}

// Given data for events in JSON format
var event_data = {
    "events": [

    ],
    "holidays" : [

    ]
};

const months = [ 
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월"
];

const printdict = {
    'dayoff':'연가',
    'sickleave':'병가',
    'special':'특별휴가',
    'public':'공가',
    'AM':'오전',
    'PM':'오후',
    'allday':'하루',
}

})(jQuery);
