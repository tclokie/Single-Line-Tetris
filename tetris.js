(function() {
    function resetCanvas () {
        ctx.canvas.height = window.innerHeight;
        ctx.canvas.width = window.innerWidth;
        
        ctx.strokeStyle = "gray";
        ctx.textBaseline = "middle";
        
        blockSize = Math.min(ctx.canvas.height/20, ctx.canvas.width/17);
        blockSize = Math.floor(blockSize);

        ctx.font = (blockSize*0.75)+"px monospace";
    }
    
    function drawBlock (x, y) {
        ctx.beginPath();
        ctx.rect(x*blockSize, y*blockSize, blockSize, blockSize);
        ctx.fill();
        ctx.stroke();
    }
    
    function drawGrid (grid, border, drawEmpty) {
        border = border || 0;
        
        for (var i = 0; i < grid.length - border; i++) {
            for (var j = border; j < grid[i].length - border; j++) {
                if (drawEmpty || grid[i][j]) {
                    ctx.fillStyle = COLOURS[grid[i][j]];
                    drawBlock(j - border, i);
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
        ctx.translate((game.pieceX-2) * blockSize, (game.pieceY) * blockSize);
        drawGrid(game.currentPiece);
        ctx.restore();
        
        ctx.save();
        ctx.translate(12 * blockSize, 2 * blockSize);
        drawGrid(game.nextPiece, 0, true);
        ctx.restore();
        
        if (!game.pause) {
            var ghostDistance = 0;
            while (!checkCollision(game.currentPiece, game.pieceX, game.pieceY+ghostDistance+1)) ghostDistance++;
            if (ghostDistance) {
                ctx.save();
                ctx.globalAlpha *= 0.5;
                ctx.translate((game.pieceX-2) * blockSize, (game.pieceY+ghostDistance) * blockSize);
                drawGrid(game.currentPiece);
                ctx.restore();
            }
        }
        
        ctx.save();
        ctx.translate(12 * blockSize, (18-game.switchPiece.length) * blockSize);
        drawGrid(game.switchPiece, 0, true);
        ctx.restore();
                
        ctx.restore();
        
        ctx.fillStyle = (game.pause && !game.over) ? "#666" : "#000";
        ctx.fillText("Lines: "+game.lines, 12 * blockSize, 10 * blockSize);
        
        if (game.over) {
            ctx.save();
            ctx.strokeStyle = "#F00";
            ctx.lineWidth = 2;
            ctx.font = "bold "+(blockSize*3)+"px monospace";
            ctx.textAlign = "center";
            ctx.fillText("GAME", 5*blockSize, 7.5*blockSize);
            ctx.strokeText("GAME", 5*blockSize, 7.5*blockSize);
            ctx.fillText("OVER", 5*blockSize, 13*blockSize);
            ctx.strokeText("OVER", 5*blockSize, 13*blockSize);
            ctx.restore();
        }
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
        game.counter = 0;
        
        var collisionHappened = checkCollision(game.currentPiece, game.pieceX, game.pieceY+1);

        if (collisionHappened) {
            for (var i = 0; i < game.currentPiece.length; i++) {
                for (var j = 0; j < game.currentPiece[i].length; j++) {
                    if (game.currentPiece[i][j]) game.board[i+game.pieceY][j+game.pieceX] = game.currentPiece[i][j];
                }
            }
            
            deleteFullLines(game.pieceY, game.currentPiece.length);
            
            nextPiece();
            
            if (checkCollision(game.currentPiece, game.pieceX, game.pieceY)) gameOver();
        }
        else {
            game.pieceY++;
        }
        
        draw();
        
        return collisionHappened;
    }
    
    function deleteFullLines(top, length) {
        var end = Math.min(top+length, game.board.length-2);
        
        var linesDeleted = 0;
        
        for (var i = top; i < end; i++) {
            var flag = true;
            
            for (var j = 2; j < 12 && flag; j++) {
                flag = (game.board[i][j] > 0 && game.board[i][j] < 8);
            }
            
            if (flag) { // delete line
                for (var j = i; j > 0; j--) {
                    game.board[j] = Array.apply(undefined, game.board[j-1]);
                }
                game.board[0] = [8,8,0,0,0,0,0,0,0,0,0,0,8,8];
                game.lines++;
                linesDeleted++;
            }
        }
        
        switch (linesDeleted) {
            case 0: break;
            case 1:
                game.speed *= 0.95;
                break;
            case 2:
                game.speed *= 0.9;
                break;
            case 3:
                game.speed *= 0.8;
                break;
            case 4:
                game.speed *= 0.7;
                break;
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
    
    function switchPiece() {
        if (game.canSwitch && !checkCollision(game.switchPiece, 5, 2)) {
            game.canSwitch = false;
            game.pieceX = 5;
            game.pieceY = 0;
            
            var swap = game.currentPiece;
            game.currentPiece = game.switchPiece;
            game.switchPiece = swap;
            
            draw();
        }
    }
    
    
    
    function getNewPiece() {
        if (!game.nextPieces.length) {
            var list = function (array) { // shuffle
                var currentIndex = array.length, temp, randomIndex;

                while (0 !== currentIndex) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;

                    temp = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temp;
                }

                return array;
            }([0,1,2,3,4,5,6]);
            
            for (var i = 0; i < list.length; i++) {
                game.nextPieces[i] = PIECES[list[i]];
            }
        }
        
        return game.nextPieces.pop();
    }
    
    function nextPiece() {
        game.pieceX = 5;
        game.pieceY = 0;
        game.canSwitch = true;
        game.currentPiece = game.nextPiece;
        game.nextPiece = getNewPiece();
    }
    
    function tick () {
        if (game.pause) return;
        
        if (game.counter < game.speed){
            game.counter++;
        }
        else {
            softDrop();
        }
    }
    
    function initListeners () {
        window.onkeydown = function(event){
            var keyCode = event.keyCode || event.which || 0;
            
            switch (keyCode) {
                case 13: // enter
                    if (game.over) startGame();
                    break;
                case 16: // shift
                    if (!game.pause) switchPiece();
                    break;
                case 32: // space
                    if (!game.pause) hardDrop();
                    break;
                case 37: // left
                    if (!game.pause) moveLeft();
                    break;
                case 38: // up
                    if (!game.pause) rotateCW();
                    break;
                case 39: // right
                    if (!game.pause) moveRight();
                    break;
                case 40: // down
                    if (!game.pause) softDrop();
                    break;
                case 80: // p
                    if (!game.over) {
                        game.pause = !game.pause;
                        draw();
                    }
                    break;
                case 81: // q
                    if (game.pause) gameOver();
                    break;
            }
        };
        
        window.onresize = function(){
            resetCanvas();
            draw();
        };
    }
    
    function gameOver() {
        game.over = true;
        game.pause = true;
        draw();
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
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8],
            [8,8,8,8,8,8,8,8,8,8,8,8,8,8]];
        
        game.nextPieces = [];
        game.nextPiece = getNewPiece();
        game.switchPiece = getNewPiece();
        nextPiece();
        
        game.lines = 0;
        game.speed = 75;
        game.counter = 0;
        game.pause = false;
        game.over = false;
        
        draw();
    }

    function init () {
        resetCanvas();
        
        startGame();
        
        initListeners();
        
        setInterval(tick, 20);
    }

    var ctx = document.getElementsByTagName("canvas")[0].getContext("2d");
    var blockSize = 0;

    var game = {
        counter: 0,
        board: null,
        currentPiece: null,
        pieceX: 0,
        pieceY: 5,
        nextPiece: null,
        switchPiece: null,
        nextPieces: null,
        canSwitch: false,
        pause: false,
        over: false,
        lines: 0,
        speed: 0
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

