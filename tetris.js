(function() {
    function resetCanvas () {
        ctx.canvas.height = window.innerHeight;
        ctx.canvas.width = window.innerWidth;
        
        ctx.strokeStyle = "gray";
        
        game.blockSize = Math.min(ctx.canvas.height/20, ctx.canvas.width/10);
        game.blockSize = Math.floor(game.blockSize);
    }
    
    function drawBlock (x, y) {
        ctx.beginPath();
        ctx.rect(x*game.blockSize, y*game.blockSize, game.blockSize, game.blockSize);
        ctx.fill();
        ctx.stroke();
    }
    
    function drawGrid (grid, buffer, drawEmpty) {
        buffer = buffer || 0;
        
        for (var i = buffer; i < grid.length - buffer; i++) {
            for (var j = buffer; j < grid[i].length - buffer; j++) {
                if (drawEmpty || grid[i][j]) {
                    ctx.fillStyle = COLOURS[grid[i][j]];
                    drawBlock(j - buffer, i - buffer);
                }
            }
        }
    }

    function draw () {
        if (!game.board) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.save();
        
        if (game.pause) ctx.globalAlpha = 0.5;
        
        drawGrid(game.board, 2, true);
        
        ctx.save();
        ctx.translate((game.pieceX-2) * game.blockSize, (game.pieceY-2) * game.blockSize);
        drawGrid(game.currentPiece);
        ctx.restore();
        
        ctx.save();
        ctx.translate(12 * game.blockSize, 2 * game.blockSize);
        drawGrid(game.nextPiece, 0, true);
        ctx.restore();
        
        var ghostDistance = 0;
        while (!checkCollision(game.currentPiece, game.pieceX, game.pieceY+ghostDistance+1)) ghostDistance++;
        if (ghostDistance) {
            ctx.save();
            ctx.globalAlpha *= 0.5;
            ctx.translate((game.pieceX-2) * game.blockSize, (game.pieceY+ghostDistance-2) * game.blockSize);
            drawGrid(game.currentPiece);
            ctx.restore();
        }
        
        ctx.restore();

        ctx.fillText("Lines: "+game.lines, 12.5 * game.blockSize, 9 * game.blockSize);
    }
    
    function transpose (piece) {
        var newPiece = [];
    
        for (var i = 0; i < piece[0].length; i++) {
            var newLine = [];
            
            for (var j = 0; j < piece.length; j++) {
                newLine.push(piece[j][i]);
            }
            
            newPiece[i] = newLine;
        }
        return newPiece;
    }
    function reverseRows (piece) {
        var newPiece = [];
        
        for (var i = 0; i < piece.length; i++) {
            newPiece[i] = [];
            
            for (var j = 0; j < piece[i].length; j++) {
                newPiece[i][j] = piece[i][piece[i].length-j-1];
            }
        }
        return newPiece;
    }
    function rotateCW () {
        var newPiece = reverseRows(transpose(game.currentPiece));
        if (!checkCollision(newPiece, game.pieceX, game.pieceY)) {
            game.currentPiece = newPiece;
            draw();
        }
        else { // Kick it
            if (!checkCollision(newPiece, game.pieceX, game.pieceY+1)) {
                game.currentPiece = newPiece;
                game.pieceY++;
                draw();
            }
            else if (!checkCollision(newPiece, game.pieceX+1, game.pieceY)) {
                game.currentPiece = newPiece;
                game.pieceX++;
                draw();
            }
            else if (!checkCollision(newPiece, game.pieceX-1, game.pieceY)) {
                game.currentPiece = newPiece;
                game.pieceX--;
                draw();
            }
            else if (!checkCollision(newPiece, game.pieceX+1, game.pieceY+1)) {
                game.currentPiece = newPiece;
                game.pieceX++;
                game.pieceY++;
                draw();
            }
            else if (!checkCollision(newPiece, game.pieceX-1, game.pieceY+1)) {
                game.currentPiece = newPiece;
                game.pieceX--;
                game.pieceY++;
                draw();
            }
        }
    }
    
    function moveLeft() {
        if (!checkCollision(game.currentPiece, game.pieceX-1, game.pieceY)) {
            game.pieceX--;
            draw();
        }
    }
    
    function moveRight() {
        if (!checkCollision(game.currentPiece, game.pieceX+1, game.pieceY)) {
            game.pieceX++;
            draw();
        }
    }
    
    function hardDrop() {
        while (!softDrop());
    }
    
    function softDrop() {
        var collisionHappened = checkCollision(game.currentPiece, game.pieceX, game.pieceY+1);

        if (collisionHappened) {
            for (var i = 0; i < game.currentPiece.length; i++) {
                for (var j = 0; j < game.currentPiece[i].length; j++) {
                    if (game.currentPiece[i][j]) game.board[i+game.pieceY][j+game.pieceX] = game.currentPiece[i][j];
                }
            }
            
            deleteFullLines(game.pieceY, game.currentPiece.length);
            
            game.currentPiece = game.nextPiece;
            game.nextPiece = getNewPiece();
            
            if (checkCollision(game.currentPiece, game.pieceX, game.pieceY)) {
                console.log("GAME OVER");
                console.log("You cleared "+game.lines+" lines.");
                startGame();
            }
        }
        else {
            game.pieceY++;
        }
        
        draw();
        
        return collisionHappened;
    }
    
    function deleteFullLines(top, length) {
        var end = Math.min(top+length, game.board.length-2);
        
        for (var i = top; i < end; i++) {
            var flag = true;
            
            for (var j = 2; j < 12 && flag; j++) {
                flag = (game.board[i][j] > 0 && game.board[i][j] < 8);
            }
            
            if (flag) { // delete line
                for (var j = i; j > 0; j--) {
                    game.board[j] = Array.apply(undefined, game.board[j-1]);
                }
                game.board[0] = [2,2,0,0,0,0,0,0,0,0,0,0,2,2];
                game.lines++;
            }
        }
    }
    
    function checkCollision(piece, x, y) {
        var flag = false;
        
        for (var i = 0; i < piece.length; i++) {
            for (var j = 0; j < piece[i].length; j++) {
                flag = flag || (piece[i][j] && game.board[i+y][j+x]);
            }
        }
        
        return flag;
    }
    
    function getNewPiece() {
        game.pieceX = 5;
        game.pieceY = 2;
        return PIECES[Math.floor(Math.random()*PIECES.length)];
    }
    
    function tick () {
        if (game.pause) return;
        
        if (game.counter < 75*Math.pow(0.8, game.lines/8)){
            game.counter++;
        }
        else {
            game.counter = 0;
            softDrop();
        }
    }
    
    function initListeners () {
        window.onkeydown = function(event){
            var keyCode = event.keyCode || event.which || 0;
            
            switch (keyCode) {
                case 13:
                    console.log("ENTER");
                    break;
                case 16:
                    console.log("SHIFT");
                    break;
                case 27:
                    console.log("ESCAPE");
                    break;
                case 32:
                    if (!game.pause) hardDrop();
                    break;
                case 37:
                    if (!game.pause) moveLeft();
                    break;
                case 38:
                    if (!game.pause) rotateCW();
                    break;
                case 39:
                    if (!game.pause) moveRight();
                    break;
                case 40:
                    if (!game.pause) softDrop();
                    break;
                case 80:
                    game.pause = !game.pause;
                    draw();
                    break;
                case 81:
                    console.log("Q");
                    break;
            }
        };
    }
    
    function startGame() {
        game.board = [
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,0,0,0,0,0,0,0,0,0,0,8,8],
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8],
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8]];
            
        game.currentPiece = getNewPiece();
        game.nextPiece = getNewPiece();
        game.lines = 0;
        game.counter = 0;
    }

    function init () {
        resetCanvas();
        
        startGame();
        
        draw();
        
        window.onresize = function(){
            resetCanvas();
            draw();
        };
        
        initListeners();
        
        setInterval(tick, 20);
    }

    var ctx = document.getElementsByTagName("canvas")[0].getContext("2d");

    var game = {
        counter: 0,
        board: null,
        blockSize: 0,
        currentPiece: null,
        pieceX: 2,
        pieceY: 2,
        nextPiece: null,
        switchPiece: null,
        pause: false,
        lines: 0
    };
    
    const COLOURS = ["#111", "#F00", "#00F", "#0F0", "#0FF", "#F0F", "#FF0", "orangered", "#CCC"];

    const PIECES = [
        [ // I
            [0,0,0,0],
            [4,4,4,4],
            [0,0,0,0],
            [0,0,0,0]
        ],
        [ // J
            [2,0,0],
            [2,2,2],
            [0,0,0]
        ],
        [ // L
            [0,0,7],
            [7,7,7],
            [0,0,0]
        ],
        [ // O
            [0,0,0,0],
            [0,6,6,0],
            [0,6,6,0],
            [0,0,0,0]
        ],
        [ // S
            [0,3,3],
            [3,3,0],
            [0,0,0],
        ],
        [ // T
            [0,5,0],
            [5,5,5],
            [0,0,0]
        ],
        [ // Z
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ]
    ];

    init();
    
}).call();

