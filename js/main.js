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

        document.addEventListener("mousedown", that.click, false);

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

        that.click = function () {
            console.log('daron');
        }
    }



    /**
    * Main game object
    */
    function Game(width, height, tileSize, numberOfMines) {
        var that = this;

        that.width = width;
        that.height = height;
        that.tileSize = tileSize;
        that.board = [];
        that.mines = [];
        that.numberOfMines = numberOfMines;

        /**
        * Randomly scatter mines on the field
        */
        that.setMines = function () {
            var i,
                x,
                y;

            x = Math.random() * that.width;
            y = Math.random() * that.height;
            for (i = numberOfMines - 1; i >= 0; i -= 1) {
                // check if already mine
                while (that.board[x][y].isMine) {
                    x = Math.random() * that.width;
                    y = Math.random() * that.height;
                }
                that.board[x][y].isMine = true;
            }
        };

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

            // Initialize the board array
            for (i = width - 1; i >= 0; i -= 1) {
                that.board[i] = [];
                for (j = height - 1; j >= 0; j -= 1) {
                    that.board[i][j] = new Tile(tileSize, i, j);
                }
            }

            that.setMines();

            that.clearScreen();

            that.mainLoop();
        };

        /**
        * Clear canvas; draw background
        */
        that.clearScreen = function () {
            // resetting canvas width causes it to reinitialize
            canvas.width = canvas.width;

            ctx.fillStyle = "#002b36";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        /**
        * Draw every tile
        */
        that.drawBoard = function () {
            var i,
                j;

            for (i = that.width - 1; i >= 0; i -= 1) {
                for (j = that.height - 1; j >= 0; j -= 1) {
                    that.board[i][j].draw();
                }
            }
        };
    }


    game = new Game(10, 10, 25);
    game.begin();
    game.drawBoard();


}());


