var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// initialize game sprites
var backgroundSprite = new Image();
var mineSprite = new Image();
var flagSprite = new Image();
var tileSprite = new Image();

// load game sprites
backgroundSprite.src = "img/background.jpg";
mineSprite.src = "img/mine.jpg";
flagSprite.src = "img/flag.jpg";
tileSprite.src = "img/tile.jpg";


// Tile class
var Tile = (function() {
    var self;
    function Tile(size, x, y) {
        self = this;
        self.size = size;
        self.x = (x * self.size);
        self.y = (y * self.size);
        self.isHidden = true;
        self.isMine = false;
        self.isFlagged = false;
        self.numberOfAdjacentMines = 0;
        self.wasSearched = false;
    };

    Tile.prototype.draw = function () {
        var x = self.x;
        var y = self.y;

        if (self.isHidden) {
            if (self.isFlagged) {
                // unclicked flagged
                ctx.drawImage(flagSprite, x, y);
            }
            else {
                // unclicked
                ctx.drawImage(tileSprite, x, y);
            }
        }
        else {
            // background
            ctx.drawImage(backgroundSprite, x, y);
        }

        // if tile uncovered
        if (!(self.isHidden)) {
            if ((self.numberOfAdjacentMines != 0)) {
                ctx.fillStyle = "#333";
                ctx.font = "15px 'BebasNeueRegular', 'Arial', sans-serif";
                ctx.fillText(self.numberOfAdjacentMines, (x + 9), (y + (self.size - 5)));
            }

            if (self.isMine) {
                ctx.drawImage(mineSprite, x, y);
            }
        }
    };

    return Tile;
})();

// Main game class
var Game = (function() {
    var self;
    function Game(width, height, numberOfMines) {
        self = this;
        self.width = width;
        self.height = height;
        self.numberOfMines = numberOfMines;

        self.guiHeight = 25;
        self.tileSize = 25;

        // self.board = new Board(self.width, self.height, self.tileSize)
        self.mines = [];

        self.isFirstClick = true;
        self.timer = {};
        self.time = 0;
    };

    // Game initialisation
    Game.prototype.init = function () {
        // set up canvas
        canvas.width = (self.width * self.tileSize);
        canvas.height = ((self.height * self.tileSize) + self.guiHeight);

        // add mouse support
        canvas.removeEventListener("mousedown", self.init, false);
        canvas.addEventListener("mousedown", self.click, false);
        self.isFirstClick = true;

        // initialize time
        self.time = 0;

        self.board.init();

        self.board.draw();
        self.drawGUI("Game started, waiting for click...");

        tileSprite.onload = (function () {
    self.board.draw();
});
    };

    // Timer
    Game.prototype.startTimer = function () {
        self.drawGUI("Time: 0");

        var onTick = function () {
            self.drawGUI(("Time: " + self.time));
            (self.time += 1);
        };
        self.timer = setInterval(onTick, 1000);
    };

    // Draw game information on canvas
    Game.prototype.drawGUI = function (text) {
        ctx.fillStyle = "#333";
        ctx.fillRect(0, (canvas.height - self.guiHeight), canvas.width, self.guiHeight);
        ctx.fillStyle = "#eee";
        ctx.font = "15px 'BebasNeueRegular', 'Arial', sans-serif";

        ctx.fillText(text, 7, (canvas.height - 7));
    };

    // Called when all mines are found or when a mine is clicked
    Game.prototype.gameOver = function (won) {
        // stop timer
        clearInterval(self.timer);

        if (won) {
            self.drawGUI((("Congratulations! Score: " + self.time) + "s. Click to play again"));
        }
        else {
            self.drawGUI("Game over! Click to play again");
        }

        // reveal the mines
        self.board.revealAll();

        // on click, start new game
        canvas.removeEventListener("mousedown", self.click, false);
        canvas.addEventListener("mousedown", self.init, false);
    };

    // Click handler
    // See http:#www.quirksmode.org/js/events_properties.html
    Game.prototype.click = function (e) {
        var mouseX = 0;
        var mouseY = 0;
        var clickedTile = 0;
        var rightClick = 0;

        // determine if right click
        if (e.which) {
            rightClick = (e.which == 3);
        }
        else if (e.button) {
            rightClick = (e.button == 2);
        }

        // determine mouse position
        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        else if (e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }

        // normalize by tile size to get the tile coordinates
        mouseX = Math.floor((mouseX / self.tileSize));
        mouseY = Math.floor((mouseY / self.tileSize));

        // if we click on the board
        if ((mouseY < self.board.tiles[0].length)) {
            clickedTile = self.board.tiles[mouseX][mouseY];

            if (rightClick) {
                clickedTile.isFlagged = !(clickedTile.isFlagged);
                clickedTile.draw();
            }
            else if (!(clickedTile.isFlagged)) {
                // on first click, start timer and initialize
                // the mines for the player not to click on a mine
                if (self.isFirstClick) {
                    self.board.addMines(self.numberOfMines, mouseX, mouseY);
                    self.startTimer();
                    self.isFirstClick = false;
                }

                if (clickedTile.isMine) {
                    // game lost
                    self.gameOver(false);
                }
                else {
                    self.board.reveal(mouseX, mouseY);

                    if ((self.board.numberOfHiddenTiles == self.numberOfMines)) {
                        // game won
                        self.gameOver(true);
                    }
                }
            }
        }
    };

    return Game;
})();

window.onload = (function () {
    console.log("start");
    var game = new Game(15, 15, 25);
    game.init();

    var tile = new Tile(20, 50, 50);
    tile.draw();
});
