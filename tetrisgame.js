const canv = document.getElementById("tetris");
const contxt = canv.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = 10;
const COLUMN = 10;
const SQR = 20;
const EMPTY = "BLACK"; // the square is empty and available

//draw the square
function drawSquare(x, y, color){
    contxt.fillStyle = color;
    contxt.fillRect(x * SQR, y * SQR, SQR, SQR);
    contxt.strokeStyle = "GREY";
    contxt.strokeRect(x * SQR, y * SQR, SQR, SQR);
}
//define the board
let board = [];
for(r = 0; r < ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = EMPTY;
    }
}

//draw the board on canvas
function drawBoard(){
    for(r = 0; r < ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c, r, board[r][c]);
        }
    }
}
drawBoard();

//define the colors of the pieces of all types
const PIECES = [
    [Z, "green"],
    [S, "purple"],
    [T, "yellow"],
    [O, "magenta"],
    [L, "cyan"],
    [I, "orange"],
    [J, "pink"]
];
//Initialize random pieces

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

//Define the Piece
function Piece(tetromino, color){
    this.tetromino = tetromino;
    this.color = color;
    this.tetrominoNum = 0; // first tetromino of one type
    this.activeTetromino = this.tetromino[this.tetrominoNum]; // which tetromino is active

    //define initial points for control
    this.x = 3;
    this.y = -2;
}

//fill a matrix with the Piece type and draw or undraw condition
Piece.prototype.fillflood = function(color){
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            //we will only draw the occupied squares
            if(this.activeTetromino[r][c])
                drawSquare(this.x + c, this.y + r, color);
        }
    }
}

//draw the Piece on the board
Piece.prototype.draw = function(){
    this.fillflood(this.color);
}

//undraw the Piece on the board
Piece.prototype.undraw = function(){
    this.fillflood(EMPTY);
}

//move down the Piece
Piece.prototype.moveDown = function(){
    if(!this.collisionCheck(0, 1, this.activeTetromino)){
        this.undraw();
        this.y++;
        this.draw();
    } else{
        //lock the Piece here
        this.lock();
        p = randomPiece();
    }
}

//move left the Piece
Piece.prototype.moveLeft = function(){
    if(!this.collisionCheck(-1, 0, this.activeTetromino)){
        this.undraw();
        this.x--;
        this.draw();
    }
}

//move right the Piece
Piece.prototype.moveRight = function(){
    if(!this.collisionCheck(1, 0, this.activeTetromino)){
        this.undraw();
        this.x++;
        this.draw();
    }
}

//rotate the Piece
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoNum + 1) % this.tetromino.length];
    let wall = 0;
    if(this.collisionCheck(0, 0, nextPattern)){
        if(this.x > (COL/2)){
            //need to move the current Piece to left
            wall = -1;
        } else{
            //need to move the current Piece to right
            wall = 1;
        }
    }
    if(!this.collisionCheck(wall, 0, nextPattern)){
        this.undraw();
        this.x += wall; // update wrt to kick
        //rotate within the 4 different clockwise moves
        this.tetrominoNum = (this.tetrominoNum + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoNum];
        this.draw();
    }
}


let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            //Skip the EMPTY squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            //Pieces to lock on top = game over. 
            //Top is reached.
            if(this.y + r < 0){
                alert("Game Over");
                //Stop animation frame
                gameOver = true;
                break;
            }
            //lock the piece
            board[this.y+r][this.x+c] = this.color;
        }
    }
    //remove all the full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != EMPTY);
        }
        if(isRowFull){
            //if the row is full
            //move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            //the top row board[0][x] has no row above it
            for( c = 0; c < COL; c++){
                board[0][c] = EMPTY;
            }
            //increment the score
            score += 10;
        }
    }
    //update the board
    drawBoard();
    
    //update the score
    scoreElement.innerHTML = score;
}

//collision detction function
Piece.prototype.collisionCheck = function(x, y, curPiece){
    for(r = 0; r < curPiece.length; r++){
        for(c = 0; c < curPiece.length; c++){
            //if square is empty, then skip it
            if(!curPiece[r][c]){
                continue;
            }
            //check for future positions of the Piece
            let newx = this.x + c + x;
            let newy = this.y + r + y;

            if(newx < 0 || newx >= COL || newy >= ROW){
                return true;
            }
            //skip newy < 0 as board[-1][x] will crash the game
            if(newy < 0){
                continue;
            }
            //check if this position is empty or locked
            if(board[newy][newx] != EMPTY){
                return true;
            }
        }
    }
    return false;
}


//Control the moves via keyboard
//37 == Left ||  38 == Up (Rotate) ||  39 == Right ||  40 == Down
document.addEventListener("keydown", controlKey);

function controlKey(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    } else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    } else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    } else if(event.keyCode == 40){
        p.moveDown();
    }
}

//drop a Piece every 1 sec
let dropStart = Date.now();
let gameOver = false;
let speed = 1000;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > speed){
        p.moveDown();
        dropStart = Date.now();
        speed -= (speed/1000);
    }
    if(!gameOver){
        requestAnimationFrame(drop);
    }
}
drop();