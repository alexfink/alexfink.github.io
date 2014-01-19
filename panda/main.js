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
    function Tile(size, x, y) {
        var self = this;
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
        var self = this;

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

var Board = (function() {
    function Board(width, height, tileSize) {
        var self = this;
        self.width = width;
        self.height = height;
        self.tileSize = tileSize;
        self.tiles = [];
        self.numberOfHiddenTiles = 0;
    };

    // initialize the board
    Board.prototype.init = function () {
        var self = this;

        // initialize with all tiles hidden
        self.numberOfHiddenTiles = (self.width * self.height);

        // Initialize the board array
        var i;
        for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
            i = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
            self.tiles[i] = [];
            var j;
            for (var _k1 = 0; _k1 < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; _k1 += 1) {
                j = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[_k1];
                self.tiles[i][j] = new Tile(self.tileSize, i, j);
            }
        }
    };

    // Draw every tile
    Board.prototype.draw = function () {
        var self = this;

        var i;
        for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
            i = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
            var j;
            for (var _k1 = 0; _k1 < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; _k1 += 1) {
                j = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[_k1];
                self.tiles[i][j].draw();
            }
        }
    };

    // Reveal the whole board
    Board.prototype.revealAll = function () {
        var self = this;

        var i;
        for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
            i = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
            var j;
            for (var _k1 = 0; _k1 < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; _k1 += 1) {
                j = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[_k1];
                self.tiles[i][j].isHidden = false;
            }
        }

        self.draw();
    };

    // Randomly scatter mines on the field
    Board.prototype.addMines = function (numberOfMines, mouseX, mouseY) {
        var self = this;

        var x = Math.floor((Math.random() * self.width));
        var y = Math.floor((Math.random() * self.height));
        var i;
        for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (numberOfMines - 1) ? _i1 <= (numberOfMines - 1) : _i1 >= (numberOfMines - 1); 0 <= (numberOfMines - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
            i = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (numberOfMines - 1) ? _i1 <= (numberOfMines - 1) : _i1 >= (numberOfMines - 1); 0 <= (numberOfMines - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
            // check if already mine
            while (            (self.tiles[x][y].isMine || ((x == mouseX) && (y == mouseY)))) {
                x = Math.floor((Math.random() * self.width));
                y = Math.floor((Math.random() * self.height));
            };
            self.tiles[x][y].isMine = true;
        }

        self.setAdjacentMines();
    };

    // Compute the number of adjacent mines on the whole board
    Board.prototype.setAdjacentMines = function () {
        var self = this;

        var i;
        for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
            i = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.width - 1) ? _i1 <= (self.width - 1) : _i1 >= (self.width - 1); 0 <= (self.width - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
            var j;
            for (var _k1 = 0; _k1 < (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; _k1 += 1) {
                j = (function () {
    var a = [];
    for (var _i1 = 0; 0 < (self.height - 1) ? _i1 <= (self.height - 1) : _i1 >= (self.height - 1); 0 <= (self.height - 1) ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[_k1];
                self.computeAdjacentMines(i, j);
            }
        }
    };

    // Compute the number of adjacent mines of tile x, y
    Board.prototype.computeAdjacentMines = function (x, y) {
        var self = this;

        var width = self.tiles.length;
        var height = self.tiles[0].length;
        var count = 0;

        var i;
        for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
            i = (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
            var j;
            for (var _k1 = 0; _k1 < (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; _k1 += 1) {
                j = (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[_k1];
                // inside canvas ?
                if ((((((x + i) >= 0) && ((x + i) < width)) && ((y + j) >= 0)) && ((y + j) < height))) {
                    // is a mine ?
                    if (self.tiles[(x + i)][(y + j)].isMine) {
                        (count += 1);
                    }
                }
            }
        }

        self.tiles[x][y].numberOfAdjacentMines = count;
    };

    // Reveal all empty tiles around the one clicked
    Board.prototype.reveal = function (xInit, yInit) {
        var self = this;

        // reveal the tile
        var clickedTile = self.tiles[xInit][yInit];
        if (clickedTile.isHidden) {
            clickedTile.isHidden = false;
            (self.numberOfHiddenTiles -= 1);
        }
        clickedTile.draw();

        // if it is empty, reveal around
        if ((self.tiles[xInit][yInit].numberOfAdjacentMines == 0)) {
            var clickedArr = self.revealAroundTile([xInit, yInit]);
            self.recursiveReveal(clickedArr);
        }

        self.draw();
    };

    // Reveal the tiles surrounding a empty one if they are not mines
    Board.prototype.revealAroundTile = function (coords) {
        var self = this;

        var x = coords[0];
        var y = coords[1];
        var width = self.tiles.length;
        var height = self.tiles[0].length;
        var currentTile = self.tiles[x][y];
        var tilesToClear = [];

        currentTile.wasSearched = true;

        if ((currentTile.numberOfAdjacentMines == 0)) {
            var i;
            for (var k = 0; k < (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; k += 1) {
                i = (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[k];
                var j;
                for (var _k1 = 0; _k1 < (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})().length; _k1 += 1) {
                    j = (function () {
    var a = [];
    for (var _i1 = - 1; - 1 < 1 ? _i1 <= 1 : _i1 >= 1; - 1 <= 1 ? _i1++ : _i1--) { a.push(_i1) }
    return a;
})()[_k1];
                    // inside canvas ?
                    if ((((((x + i) >= 0) && ((x + i) < width)) && ((y + j) >= 0)) && ((y + j) < height))) {
                        // is not a mine ?
                        currentTile = self.tiles[(x + i)][(y + j)];

                        // add tiles to clear to array
                        // empty tile
                        if ((((currentTile.numberOfAdjacentMines == 0) && (Math.abs((i + j)) == 1)) && !(currentTile.wasSearched))) {
                            tilesToClear.push([(x + i), (y + j)]);
                        }

                        // show current tile
                        if ((!(currentTile.isMine) && currentTile.isHidden)) {
                            currentTile.isHidden = false;
                            (self.numberOfHiddenTiles -= 1);
                        }
                    }
                }
            }
            self.tiles[x][y].isHidden = false;
        }

        return tilesToClear;
    };

    // Recursive function used to reveal empty tiles
    Board.prototype.recursiveReveal = function (tilesToClear) {
        var self = this;

        var arr = [];
        var returned = [];

        if ((tilesToClear.length == 0)) {
            returned = [];
        }
        else if ((tilesToClear.length == 1)) {
            // clear around this tile
            arr = self.revealAroundTile(tilesToClear[0]);
            // and start again on the tiles around it
            returned = self.recursiveReveal(arr);
        }
        else {
            var first = tilesToClear.shift();
            // clear around the first tile of the array and do it on the others
            arr = self.recursiveReveal([first]).concat(self.recursiveReveal(tilesToClear));
            returned = arr;
        }

        return returned;
    };

    return Board;
})();

// Main game class
var Game = (function() {
    function Game(width, height, numberOfMines) {
        var self = this;
        self.width = width;
        self.height = height;
        self.numberOfMines = numberOfMines;

        self.guiHeight = 25;
        self.tileSize = 25;

        self.board = new Board(self.width, self.height, self.tileSize);
        self.mines = [];

        self.isFirstClick = true;
        self.timer = {};
        self.time = 0;
    };

    // trick to have the correct value of this in self.init
    Game.prototype.newGame = function (e) {
        var self = this;

        self.init(e);
    };

    // Game initialisation
    Game.prototype.init = function () {
        var self = this;

        // set up canvas
        canvas.width = (self.width * self.tileSize);
        canvas.height = ((self.height * self.tileSize) + self.guiHeight);

        // add mouse support
        canvas.onmousedown = (function (e) {
    self.handleClick.call(self, e);
});

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
        var self = this;

        self.drawGUI("Time: 0");

        var onTick = function () {
            self.drawGUI(("Time: " + self.time));
            (self.time += 1);
        };
        self.timer = setInterval(onTick, 1000);
    };

    // Draw game information on canvas
    Game.prototype.drawGUI = function (text) {
        var self = this;

        ctx.fillStyle = "#333";
        ctx.fillRect(0, (canvas.height - self.guiHeight), canvas.width, self.guiHeight);
        ctx.fillStyle = "#eee";
        ctx.font = "15px 'BebasNeueRegular', 'Arial', sans-serif";

        ctx.fillText(text, 7, (canvas.height - 7));
    };

    // Click handler
    // See http://www.quirksmode.org/js/events_properties.html
    Game.prototype.handleClick = function (e) {
        var self = this;

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

    // Called when all mines are found or when a mine is clicked
    Game.prototype.gameOver = function (won) {
        var self = this;

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

        canvas.onmousedown = (function (e) {
    self.newGame.call(self, e);
});
    };

    return Game;
})();

var game = 0;
window.onload = (function () {
    console.log("start");
    game = new Game(15, 15, 25);
    game.init();
});
