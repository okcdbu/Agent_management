document.addEventListener('DOMContentLoaded', function () {
  var eventarray = getArrayFromJson(dayoffmodel)
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['interaction', 'dayGrid'],
    header: {
      left: 'today',
      center: 'title',
      right: 'prev,next'
    },
    eventLimit: true, // allow "more" link when too many events
    events: eventarray,
    locale: 'ko'
  });
  calendar.render();
  //set element data
  $('#callup').text(usermodel[0].fields.callup_date)
  $('#discharge').text(usermodel[0].fields.discharge_date)
  elementSetter(usermodel[0].fields.callup_date,usermodel[0].fields.discharge_date)
  dayoffCalculator(usermodel[0].fields.callup_date)
  clickEventHandler(calendar)
});
$(function () {
  $('[data-toggle="tooltip"]').tooltip({trigger: 'manual'}).tooltip('show');
  });

function rankCalculator(startdate,enddate,curdate) {
  var today = new Date(curdate)
  var start = new Date(startdate)
  var end = new Date(enddate)
  start.setDate(1)
  start.setHours(0)
  var tmp1 = new Date(start)
  tmp1.setMonth(tmp1.getMonth() + 2)
  var tmp2 = new Date(start)
  tmp2.setMonth(tmp2.getMonth() + 8)
  var tmp3 = new Date(start)
  tmp3.setMonth(tmp3.getMonth() + 14)
  var rankidx
  if(start <= today && today < tmp1){
    rankidx = 0
  }
  else if(tmp1 <= today && today < tmp2){
    rankidx = 1
  }
  else if(tmp2 <= today && today < tmp3){
    rankidx = 2
  }
  else if(tmp3 <= today && today <= end){
    rankidx = 3
  }
  else{
    rankidx = 4
  }
  return rankidx
}

function elementSetter(startdate,enddate) {
  var today = new Date()
  var start = new Date(startdate)
  var end = new Date(enddate)
  var ogstart = new Date(start)

  //progress bar
  var timerid = setInterval(function () {
    var tdy = new Date()
    var percentage = ((tdy.getTime() - ogstart.getTime()) * 100 / (end.getTime() - ogstart.getTime())).toFixed(6)
    $('.progress-bar').width(percentage + '%').attr('aria-valuenow', percentage).text(percentage + '%')
    $('[data-toggle="tooltip"]').tooltip('show')
  },100)
  //dday
  var dday = Math.ceil((end.getTime() - today.getTime())/(1000*60*60*24))

  var rank;
  var idx = rankCalculator(startdate,enddate,today)
  switch (idx) {
    case 0:
      rank = '이병(1)'
      break;
    case 1:
      rank = '일병(2)'
      break;
    case 2:
      rank = '상병(3)'
      break;
    case 3:
      rank = '병장(4)'
      break;
    case 4:
      rank = '민간인'
      break;
  }
  $('#rank').text(rank)
  $('.popOver').attr('title','D-' + dday)
  var todayrank = rankCalculator(usermodel[0].fields.callup_date, usermodel[0].fields.discharge_date, new Date())
  paymentCalculator(new Date(),todayrank)
}

function dayoffCalculator(start) {
  var firoff = 0,secoff = 0,puboff = 0,sickoff = 0
  start = new Date(start)
  start.setFullYear(start.getFullYear() + 1)

  for(var i in dayoffmodel){
    var date = new Date(dayoffmodel[i]['fields']['date'])
    var days = (dayoffmodel[i]['fields']['daytype'] === 'allday'?1:0.5)
    if(dayoffmodel[i]['fields']['type'] === 'dayoff'){
      if(date < start){
        firoff+=days
      }
      else{
        secoff+=days
      }
    }
    else if(dayoffmodel[i]['fields']['type'] === 'public' || dayoffmodel[i]['fields']['type'] === 'special'){
      puboff+=days
    }
    else if(dayoffmodel[i]['fields']['type'] === 'sickleave'){
      sickoff+=days
    }
  }
  $('#dayoff-first').text(15-firoff +'일' + $('#dayoff-first').text())
  $('#dayoff-second').text(13-secoff +'일' + $('#dayoff-second').text())
  $('#sickleave').text(30-sickoff +'일' + $('#sickleave').text())
  $('#etc').text(puboff +'일')
}
function getArrayFromJson(model) {
  var arr = []
  for(var i in model){
    var tmp = {}
    tmp.title = dicttokor[model[i]['fields']['daytype']] + dicttokor[model[i]['fields']['type']]
    tmp.start = model[i]['fields']['date']
    tmp.backgroundColor = '#8080ff'
    arr.push(tmp)
  }
  $.ajax({
    url: url,
    dataType: "json",
    type: "GET",
    async: false,
    success: function (data) {
      $.each(data,function (key,value) {
        var tmp = {}
        tmp.start = value.start
        tmp.title = value.title
        tmp.backgroundColor = '#ff8080'
        arr.push(tmp)
      })
    }
  })
  return arr
}

function paymentCalculator(date, rank) {
  var basic = paydata[date.getFullYear().toString()][rank]
  var lunchcnt = 0, transcostcnt = 0; // days which cannot get additional pay
  for(var i in dayoffmodel){
    var mddate = new Date(dayoffmodel[i]['fields']['date'])
    if(mddate.getMonth() === date.getMonth()
        && mddate.getFullYear() === date.getFullYear()){
      if(dayoffmodel[i]['fields']['daytype'] === 'allday'){
        transcostcnt++
      }
      if(dayoffmodel[i]['fields']['daytype'] !== 'PM'){
        lunchcnt++
      }
    }
  }
  $.ajax({
    url: url,
    dataType: "json",
    type: "GET",
    async: false,
    success: function (data) {
      $.each(data,function (key,value) {
        var holiday = new Date(value.start)
        if (holiday.getFullYear() === date.getFullYear() && holiday.getMonth() === date.getMonth()){
          lunchcnt++
          transcostcnt++
        }
      })
    }
  })
  var days = new Date(date.getFullYear(),date.getMonth() + 1,0).getDate()
  var tmp = new Date(date)
  for(var day = 1;day <= days;day++){
    tmp.setDate(day)
    if(tmp.getDay() === 0 || tmp.getDay()===6){
      lunchcnt++
      transcostcnt++
    }
  }
  var lunchpay = 7000 * (days - lunchcnt)
  var transpay = 2600 * (days - transcostcnt)
  var data = '￦' + (basic + lunchpay + transpay)
  $('#balance').text(data)
}
function clickEventHandler(calendar) {
  $("button.fc-prev-button").click(function() {
    var rank = rankCalculator(usermodel[0].fields.callup_date, usermodel[0].fields.discharge_date,calendar.getDate())
    var date = calendar.getDate()
    paymentCalculator(date,rank)
  });
  $("button.fc-next-button").click(function() {
    var rank = rankCalculator(usermodel[0].fields.callup_date, usermodel[0].fields.discharge_date,calendar.getDate())
    var date = calendar.getDate()
    paymentCalculator(date,rank)
  });
}
const dicttokor = {
  'public' : '공가',
  'dayoff' : '연가',
  'sickleave' : '병가',
  'special' : '특별휴가',
  'allday' : '하루',
  'AM' : '오전',
  'PM' : '오후'
}

const paydata = {
  '2018': [306100, 331300, 366200, 405700],
  '2019': [306100, 331300, 366200, 405700],
  '2020': [408100, 441700, 488200, 540900],
  '2021': [459100, 496900, 549200, 608500],
  '2022': [510100, 552100, 610200, 676100]
}