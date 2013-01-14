// Minesweeper
// Corentin Smith 2013
/*jslint browser: true*/
/*jslint devel: true*/
/*jslint maxlen: 80 */

(function () {
    "use strict";

    var canvas  = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        game;

    // initialize game sprites
    var backgroundSprite = new Image(),
        mineSprite = new Image(),
        tileSprite = new Image();

    // load game sprites
    backgroundSprite.src = 'img/background.jpg';
    mineSprite.src = 'img/mine.jpg';
    tileSprite.src = 'img/tile.jpg';

    /**
    * Tile object
    */
    function Tile(size, x, y) {
        var that = this;

        that.size = size;
        that.x = x * that.size;
        that.y = y * that.size;
        that.isHidden = true;
        that.isMine = false;
        that.numberOfAdjacentMines = 0;
        that.wasSearched = false;


        /**
        * Draw the tile to the canvas
        */
        that.draw = function () {
            var x = that.x,
                y = that.y;

            // Tile background
            if (that.isHidden) {
                ctx.drawImage(tileSprite, x, y);
            } else {
                ctx.drawImage(backgroundSprite, x, y);
            }

            // If tile uncovered
            if (!that.isHidden) {
                // Print number of adjacent mines
                if (that.numberOfAdjacentMines !== 0) {
                    ctx.fillStyle = "#333";
                    ctx.font = "15px 'Impact', 'Arial', sans-serif";
                    ctx.fillText(that.numberOfAdjacentMines,
                                 x + 9, y + that.size - 5);
                }

                // Uncovered mine
                if (that.isMine) {
                    ctx.drawImage(mineSprite, x, y);
                }
            }
        };
    }

    /**
    * Board object, where tiles are drawn
    */
    function Board(width, height, tileSize) {
        var that = this;

        that.width = width;
        that.height = height;
        that.tileSize = tileSize;
        that.tiles = [];


        /**
        * Clear canvas; draw background
        */
        that.clear = function () {
            // resetting canvas width causes it to reinitialize
            canvas.width = canvas.width;

            ctx.fillStyle = "#333";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        /**
        * Initialize the board
        */
        that.init = function () {
            var i, j;

            // Initialize the board array
            for (i = width - 1; i >= 0; i -= 1) {
                that.tiles[i] = [];
                for (j = height - 1; j >= 0; j -= 1) {
                    that.tiles[i][j] = new Tile(tileSize, i, j);
                }
            }
        }

        /**
        * Draw every tile
        */
        that.draw = function () {
            var i,
                j;

            for (i = that.width - 1; i >= 0; i -= 1) {
                for (j = that.height - 1; j >= 0; j -= 1) {
                    that.tiles[i][j].draw();
                }
            }
        };

        /**
        * Reveal the whole board
        */
        that.reveal = function () {
            var i,
                j;

            for (i = that.width - 1; i >= 0; i -= 1) {
                for (j = that.height - 1; j >= 0; j -= 1) {
                    that.tiles[i][j].isHidden = false;
                }
            }

            that.draw();
        }

        /**
        * Randomly scatter mines on the field
        */
        that.addMines = function (numberOfMines) {
            var i,
                x,
                y;

            x = Math.floor(Math.random() * that.width);
            y = Math.floor(Math.random() * that.height);
            for (i = numberOfMines - 1; i >= 0; i -= 1) {
                // check if already mine
                while (that.tiles[x][y].isMine) {
                    x = Math.floor(Math.random() * that.width);
                    y = Math.floor(Math.random() * that.height);
                }
                that.tiles[x][y].isMine = true;
            }

            that.setAdjacentMines();
        };

        that.setAdjacentMines = function () {
            var i,
                j;

            for (i = that.width - 1; i >= 0; i -= 1) {
                for (j = that.height - 1; j >= 0; j -= 1) {
                    that.computeAdjacentMines(i, j);
                }
            }
        };


        /**
        * Compute the number of adjacent mines of tile x, y
        */
        that.computeAdjacentMines = function (x, y) {
            var i, j,
                width = that.tiles.length,
                height = that.tiles[0].length,
                count = 0;

            for (i = -1; i <= 1; i += 1) {
                for (j = -1; j <= 1; j += 1) {
                    // inside canvas ?
                    if ((x + i >= 0) && (x + i < width)
                        && (y + j >= 0) && (y + j < height)) {
                        // is a mine ?
                        if (that.tiles[x + i][y + j].isMine) {
                            count += 1;
                        }
                    }
                }
            }

            that.tiles[x][y].numberOfAdjacentMines = count;
        };

        /**
        * Reveal all empty tiles around the one clicked
        */
        that.revealEmptyTiles = function (xInit, yInit) {
            console.log('click');

            var clicked = that.revealAroundTile([xInit, yInit]);

            that.recursiveReveal(clicked);

            that.draw();
        };

        /**
        * Reveal the tiles surrounding a empty one if they are not mines
        */
        that.revealAroundTile = function (coords) {
            var x = coords[0], y = coords[1],
                i, j,
                width = that.tiles.length,
                height = that.tiles[0].length,
                count = 0,
                currentTile = that.tiles[x][y],
                tilesToClear = [];

            currentTile.wasSearched = true;
            if (currentTile.numberOfAdjacentMines === 0) {

                for (i = -1; i <= 1; i += 1) {
                    for (j = -1; j <= 1; j += 1) {
                        // inside canvas ?
                        if ((x + i >= 0) && (x + i < width)
                            && (y + j >= 0) && (y + j < height)) {
                            // is not a mine ?
                            currentTile = that.tiles[x + i][y + j];

                            // add tiles to clear to array
                            // empty tile
                            if ((currentTile.numberOfAdjacentMines === 0)
                                // not the clicked nor diagonal
                                && (Math.abs(i + j) === 1)
                                // not already visible
                                && (!currentTile.wasSearched)) {
                                tilesToClear.push([x + i, y + j]);
                            }

                            // show current tile
                            if (!currentTile.isMine) {
                                currentTile.isHidden = false;
                            }
                        }
                    }
                }

                that.tiles[x][y].isHidden = false;
            }

            return tilesToClear;
        }

        /**
        * Recursive function used to reveal empty tiles
        */
        that.recursiveReveal = function(tilesToClear) {
            var arr = [],
                idx = 0,
                first;
            if (tilesToClear.length === 0) {
                return [];
            } else if (tilesToClear.length === 1) {
                // clear around this tile
                arr = that.revealAroundTile(tilesToClear[0]);
                // and start again on the tiles around it
                return that.recursiveReveal(arr);
            } else {
                first = tilesToClear.shift();
                arr = that.recursiveReveal([first])
                    .concat(that.recursiveReveal(tilesToClear));
                return arr;
            }
        }
    }


    /**
    * Main game object
    */
    function Game(width, height, numberOfMines) {
        var that = this;

        that.width = width;
        that.height = height;
        that.guiHeight = 25;
        that.tileSize = 25;
        that.board = new Board(that.width, that.height, that.tileSize);
        that.mines = [];
        that.numberOfMines = numberOfMines;
        that.timer;


        /**
        * Called when all mines are found or when a mine is clicked
        */
        that.gameOver = function (won) {
            if (won) {

            } else {
                that.board.reveal();
            }
            clearInterval(that.timer);
        };

        /**
        * Click handler
        */
        that.click = function (e) {
            var mouseX, mouseY,
                clickedTile;

            if(e.offsetX) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
            }
            else if(e.layerX) {
                mouseX = e.layerX;
                mouseY = e.layerY;
            }

            // normalize by tile size to get the tile coordinates
            mouseX = Math.floor(mouseX / that.tileSize);
            mouseY = Math.floor(mouseY / that.tileSize);

            clickedTile = that.board.tiles[mouseX][mouseY];
            clickedTile.isHidden = false;
            clickedTile.draw();

            if (clickedTile.isMine) {
                that.gameOver(false);
            } else {
                if (clickedTile.numberOfAdjacentMines === 0) {
                    that.board.revealEmptyTiles(mouseX, mouseY);
                }
            }
        }

        /**
        * Draw game information on canvas
        */
        that.drawGUI = function (time) {
            ctx.fillStyle = "#333";
            ctx.fillRect(0, canvas.height - that.guiHeight, canvas.width, that.guiHeight);
            ctx.fillStyle = "#eee";
            ctx.font = "15px 'Impact', 'Arial', sans-serif";

            ctx.fillText('Time: ' + time, 7, canvas.height - 7);
        };

        /**
        * Main game loop
        */
        that.mainLoop = function () {
            var time = 0;
            that.drawGUI(0);
            that.timer = setInterval(function () {
                that.drawGUI(time);
                time += 1;
            }, 1000);
        };

        /**
        * Game initialization
        */
        that.begin = function () {
            var i, j;

            // Set up the canvas
            canvas.width = width * that.tileSize;
            canvas.height = height * that.tileSize + that.guiHeight;

            // Add mouse support
            canvas.addEventListener("click", that.click, false);

            that.board.init();

            that.board.addMines(that.numberOfMines);

            that.board.clear();

            tileSprite.onload = function () {
                that.board.draw();
                console.log('draw');
            };

            that.mainLoop();
        };
    }


    game = new Game(10, 12, 10);
    game.begin();

}());


