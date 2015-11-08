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
    
    function drawGrid (grid, buffer) {
        if (!grid) return;
        buffer = buffer || 0;
        
        for (var i = buffer; i < grid.length - buffer; i++) {
            for (var j = buffer; j < grid[i].length - buffer; j++) {
                ctx.fillStyle = COLOURS[grid[i][j]];
                drawBlock(j - buffer, i - buffer);
            }
        }
    }

    function draw () {
        if (!game.board) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.save();
        
        drawGrid(game.board, 2);
        
        ctx.translate(game.pieceX * game.blockSize, game.pieceY * game.blockSize);
        drawGrid(game.currentPiece);

        ctx.restore();
    }

    function init () {
        resetCanvas();
        
        game.board = EMPTYBOARD;
            
        game.currentPiece = PIECES[2];
        
        draw();
        //setInterval(draw, 10);
        
        window.onresize = function(){
            resetCanvas();
            draw();
        };
    }

    var ctx = document.getElementsByTagName("canvas")[0].getContext("2d");

    var game = {
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
    
    const COLOURS = ["black", "red", "blue", "green", "cyan", "magenta", "yellow", "orangered", "gray"];

    const PIECES = [
        [ // I
            [0,0,0,0],
            [0,0,0,0],
            [4,4,4,4],
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
            [6,6],
            [6,6]
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
    
    const EMPTYBOARD = [
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

    init();
    
}).call();

