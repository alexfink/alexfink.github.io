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


        /**
        * Draw the tile to the canvas
        */
        that.draw = function () {
            // Tile background
            if (that.isHidden) {
                ctx.fillStyle = "#ddd";
            } else {
                ctx.fillStyle = "#555";
            }
            ctx.fillRect(that.x + 1, that.y + 1,
                         that.size - 2, that.size - 2);

            // If tile uncovered
            if (!that.isHidden) {
                // Print number of adjacent mines
                if (that.numberOfAdjacentMines !== 0) {
                    ctx.fillStyle = "#fff";
                    ctx.font = "15px Arial";
                    ctx.fillText(that.numberOfAdjacentMines,
                                 that.x + 6, that.y + that.size - 5);
                }

                // Uncovered mine
                if (that.isMine) {
                    ctx.fillStyle = "#f00";
                    ctx.fillRect(that.x + 2, that.y + 2,
                                 that.size - 3, that.size - 3);
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

            ctx.fillStyle = "#002b36";
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
            // var x = xInit,
            //     y = yInit,
            //     width = that.tiles.length,
            //     height = that.tiles[0].length,
            //     currentTile = that.tiles[x][y];

            // while (currentTile.numberOfAdjacentMines === 0 && x < width) {
            //     that.clearColumn(x, y);
            //     x += 1;
            // }

            // x = xInit;
            // currentTile = that.tiles[x][y];
            // while (currentTile.numberOfAdjacentMines === 0 && x >= 0) {
            //     that.clearColumn(x, y);
            //     x -= 1;
            // }
            that.revealAroundTile(xInit, yInit);

            that.draw();
        };

        /**
        * Reaveal the tiles surrounding a empty one if they are not mines
        */
        that.revealAroundTile = function (x, y) {
            var i, j,
                width = that.tiles.length,
                height = that.tiles[0].length,
                count = 0,
                currentTile = that.tiles[x][y];

            if (that.tiles[x][y].numberOfAdjacentMines === 0) {

                for (i = -1; i <= 1; i += 1) {
                    for (j = -1; j <= 1; j += 1) {
                        // inside canvas ?
                        if ((x + i >= 0) && (x + i < width)
                            && (y + j >= 0) && (y + j < height)) {
                            // is a mine ?
                            currentTile = that.tiles[x + i][y + j];
                            console.log(x+i, y+j);
                            if (!currentTile.isMine) {
                                currentTile.isHidden = false;
                            }
                        }
                    }
                }

                that.tiles[x][y].isHidden = false;
            }
        }

        // /**
        // * Clear a row of empty tiles
        // */
        // that.clearRow = function (xInit, yInit) {
        //     var x = xInit,
        //         y = yInit,
        //         width = that.tiles.length,
        //         currentTile = that.tiles[xInit][yInit];

        //     // to the right
        //     while (currentTile.numberOfAdjacentMines === 0 && x < width) {
        //         console.log(x, y);
        //         currentTile = that.tiles[x][y];
        //         that.clearColumn(x, y);
        //         x += 1;
        //     }

        //     // and to the left
        //     x = xInit;
        //     currentTile = that.tiles[x][y];
        //     while (currentTile.numberOfAdjacentMines === 0 && x >= 0) {
        //         currentTile = that.tiles[x][y];
        //         that.clearColumn(x, y);
        //         x -= 1;
        //     }
        // };

        // /**
        // * Clear a column of empty tiles
        // */
        // that.clearColumn = function (xInit, yInit) {
        //     var x = xInit,
        //         y = yInit,
        //         height = that.tiles[0].length,
        //         currentTile = that.tiles[xInit][yInit];

        //     while (currentTile.numberOfAdjacentMines === 0 && y < height) {
        //         console.log(x, y);
        //         currentTile = that.tiles[x][y];
        //         currentTile.isHidden = 0;
        //         y += 1;
        //     }

        //     y = yInit;
        //     currentTile = that.tiles[x][y];
        //     while (currentTile.numberOfAdjacentMines === 0 && y >= 0) {
        //         currentTile = that.tiles[x][y];
        //         currentTile.isHidden = 0;
        //         y -= 1;
        //     }
        // };
    }


    /**
    * Main game object
    */
    function Game(width, height, tileSize, numberOfMines) {
        var that = this;

        that.width = width;
        that.height = height;
        that.tileSize = tileSize;
        that.board = new Board(that.width, that.height, that.tileSize);
        that.mines = [];
        that.numberOfMines = numberOfMines;


        /**
        * Called when all mines are found or when a mine is clicked
        */
        that.gameOver = function (won) {
            if (won) {

            } else {
                that.board.reveal();
            }
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
        * Main game loop
        */
        that.mainLoop = function () {

        };

        /**
        * Begin game
        */
        that.begin = function () {
            var i, j;

            // Set up the canvas
            canvas.width = width * tileSize;
            canvas.height = height * tileSize;

            // Add mouse support
            canvas.addEventListener("click", that.click, false);

            that.board.init();

            that.board.addMines(that.numberOfMines);

            that.board.clear();
            that.board.draw();

            that.mainLoop();
        };


    }


    game = new Game(10, 13, 25, 12);
    game.begin();


}());


