
    document.addEventListener('DOMContentLoaded', function() {
        var calendarEl = document.getElementById('calendar');
    
        var calendar = new FullCalendar.Calendar(calendarEl, {
          plugins: [ 'interaction', 'dayGrid' ],
          header: {
            left:null,
            center:'title', 
            right:null
          },
          eventLimit: true, // allow "more" link when too many events
          events: function(info, successCallback, failureCallback){
            
          },
          locale: 'ko'
        });
    
        calendar.render();
      });

