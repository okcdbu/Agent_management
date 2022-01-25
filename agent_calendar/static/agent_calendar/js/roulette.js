let theWheel = new Winwheel({
    'outerRadius'    : 170,
    'strokeStyle'    : 'purple',
    'fillStyle'      : '#efd5f7',
    'lineWidth'      : 3,
    'animation' :
    {
        'type'     : 'spinToStop',
        'duration' : 5,
        'spins'    : 8,
         // Remember to do something after the animation has finished specify callback function.
        'callbackFinished' : 'alertPrize()',

        // During the animation need to call the drawTriangle() to re-draw the pointer each frame.
        'callbackAfter' : 'drawTriangle()'
    }
    });
$(document).ready(function () {
    // Button mapping
    // Function to draw pointer using code (like in a previous tutorial).
    drawTriangle();
    $("#startbtn").click(startbtn);
    $("#resetbtn").click(resetbtn);
    for(var segment in segment_init){
        theWheel.addSegment({'text' : segment_init[segment].name});
    }
    theWheel.deleteSegment(1);
    theWheel.draw()
});
drawTriangle();
// This function called after the spin animation has stopped.
function alertPrize()
    {
        // Call getIndicatedSegment() function to return pointer to the segment pointed to on wheel.
        let winningSegment = theWheel.getIndicatedSegment();

        // Basic alert of the segment text which is the prize name.
        alert("오늘의 " + type + "은 " + winningSegment.text + " 입니다!");
        $.ajax({
            url: '/roulette/',
            type:'POST',
            data: JSON.stringify({
                'winner' : winningSegment.text,
                'name' : type
            }),
            async : false,
            headers:{
                'X-CSRFTOKEN' : csrf_token
            },
            success: function (data) {
                console.log(data)
            },
            error: function (request,status,error) {
                console.log(error)
            }
        });
    }

 function drawTriangle()
 {
     // Get the canvas context the wheel uses.
     let ctx = theWheel.ctx;

     ctx.strokeStyle = 'purple';     // Set line colour.
     ctx.fillStyle   = '#cd76e8';     // Set fill colour.
     ctx.lineWidth   = 2;
     ctx.beginPath();              // Begin path.
     ctx.moveTo(180, 5);           // Move to initial position.
     ctx.lineTo(220, 5);           // Draw lines to make the shape.
     ctx.lineTo(200, 40);
     ctx.lineTo(181, 5);
     ctx.stroke();                 // Complete the path by stroking (draw lines).
     ctx.fill();                   // Then fill.
 }

 function startbtn() {
     theWheel.startAnimation();
 }


 function resetbtn() {
     theWheel.stopAnimation(false);
     theWheel.rotationAngle = 0;
     theWheel.draw();
     drawTriangle();
 }
 
 function onCheck(box) {
    var value = box.value
    for(var idx = 1; idx <= theWheel.numSegments; idx++){
        if(theWheel.segments[idx] === undefined)
            continue;
        if(theWheel.segments[idx].text === value){
            if(theWheel.numSegments <= 1){
                theWheel.addSegment({'text' : ''});
            }
            theWheel.deleteSegment(idx);
            theWheel.draw();
            return;
        }
    }
    theWheel.addSegment({'text' : value});
    if(theWheel.segments[1].text===''){
        theWheel.deleteSegment(1);
    }
    theWheel.draw();
 }