function resetCanvas (canvas) {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
}

function draw (ctx) {
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    console.log("Draw!!");
}

function init () {
    var ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
    resetCanvas(ctx.canvas);
    
    window.onresize = function(){
        resetCanvas(ctx.canvas);
        draw(ctx);
    };
    
    draw(ctx);
    //setInterval(draw, 10, ctx);
}

init();
