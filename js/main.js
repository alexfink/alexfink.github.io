// log P(sweeper)
// Alex Fink, 2018
// based on an implementation by Corentin Smith, 2013:
// see https://github.com/cosmith/minesweeper

(function () {
	"use strict";

	var canvas  = document.getElementById('canvas'),
		ctx = canvas.getContext('2d'),
		game,
		// initialize game sprites
		backgroundSprite = new Image(),
    backgroundHilitSprite = new Image(),
		mineSprite = new Image(),
		flagSprite = new Image(),
		tileSprite = new Image(),
    flagHilitSprite = new Image(),
    tileHilitSprite = new Image();

	// load game sprites
	backgroundSprite.src = 'img/background.jpg';
	backgroundHilitSprite.src = 'img/backgroundHilit.jpg';
	mineSprite.src = 'img/mine.jpg';
	flagSprite.src = 'img/flag.jpg';
	tileSprite.src = 'img/tile.jpg';
	flagHilitSprite.src = 'img/flagHilit.jpg';
	tileHilitSprite.src = 'img/tileHilit.jpg';

	/**
	* Tile object
	*/
	function Tile(size, x, y) {
		var that = this;

		that.size = size;
		that.x = x * that.size; // where rendered
		that.y = y * that.size;
		that.isHidden = true;
		that.isMine = false;
		that.isFlagged = false;
		that.numberOfAdjacentMines = 0;
		that.wasSearched = false;

    /**
		* Toggle flag
    */
    that.toggleFlag = function () {
      that.isFlagged = !that.isFlagged;
    }
 
		/**
		* Draw the tile to the canvas
		*/
		that.draw = function (hilit) {
			var x = that.x,
				y = that.y;

			if (that.isHidden) {
				// Hidden tile
				if (that.isFlagged) {
          if (hilit)
            ctx.drawImage(flagHilitSprite, x, y);
          else
            ctx.drawImage(flagSprite, x, y);
				} else {
          if (hilit)
            ctx.drawImage(tileHilitSprite, x, y);
          else
            ctx.drawImage(tileSprite, x, y);
				}
			} else {
				// Background
        if (hilit)
          ctx.drawImage(backgroundHilitSprite, x, y);
        else
          ctx.drawImage(backgroundSprite, x, y);
			}

			// If tile uncovered
			if (!that.isHidden) {
				// Print number of adjacent mines
				if (that.numberOfAdjacentMines !== 0) {
					ctx.fillStyle = "#333";
					ctx.font = "15px 'Arial', sans-serif";
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
	* Front-endy board object, where tiles are drawn
	*/
	function Board(width, height, tileSize) {
		var that = this;

		that.width = width;
		that.height = height;
		that.tileSize = tileSize;
		that.tiles = [];

		/**
		* Initialize the board
		*/
		that.init = function () {
			var i, j;

      // cursor position.  clicking sets
      that.x = that.y = 0;
      that.lastInputWasKey = false;
 
			that.numberOfHiddenTiles = width * height;
      that.nFlags = 0;

			// Initialize the board array
			for (i = width - 1; i >= 0; i -= 1) {
				that.tiles[i] = [];
				for (j = height - 1; j >= 0; j -= 1) {
					that.tiles[i][j] = new Tile(tileSize, i, j);
				}
			}
		};

    /**
		* Make sure cursor is in bounds
		*/
    that.boundCursor = function () {
     if (that.x < 0)
      that.x = 0;
     if (that.x >= that.width - 1)
      that.x = that.width - 1;
     if (that.y < 0)
      that.y = 0;
     if (that.y >= that.height - 1)
      that.y = that.height - 1;
    };
 
		/**
		* Draw every tile
		*/
		that.draw = function () {
			var i,
				j;

			for (i = that.width - 1; i >= 0; i -= 1) {
				for (j = that.height - 1; j >= 0; j -= 1) {
					that.tiles[i][j].draw(that.lastInputWasKey && i==that.x && j==that.y);
				}
			}
		};

		/**
		* Reveal the whole board
		*/
		that.revealAll = function () {
			var i,
				j;

			for (i = that.width - 1; i >= 0; i -= 1) {
				for (j = that.height - 1; j >= 0; j -= 1) {
					that.tiles[i][j].isHidden = false;
				}
			}

			that.draw();
		};

		/**
		* Randomly scatter mines on the field
		*/
		that.addMines = function (numberOfMines, mouseX, mouseY) {
			var i,
				x,
				y;

			x = Math.floor(Math.random() * that.width);
			y = Math.floor(Math.random() * that.height);
			for (i = numberOfMines - 1; i >= 0; i -= 1) {
				// check if already mine
				while ((that.tiles[x][y].isMine)
						|| ((Math.abs(x - mouseX) <= 1) && (Math.abs(y - mouseY) <= 1))) {
					x = Math.floor(Math.random() * that.width);
					y = Math.floor(Math.random() * that.height);
				}
				that.tiles[x][y].isMine = true;
			}

			that.setAdjacentMines();
		};

		/**
		* Compute the number of adjacent mines on the whole board
		*/
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
							&& (y + j >= 0)
							&& (y + j < height)) {
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
		that.reveal = function (xInit, yInit) {
			var clickedArr,
				clickedTile;

			// reveal the tile
			clickedTile = that.tiles[xInit][yInit];
			if (clickedTile.isHidden) {
				clickedTile.isHidden = false;
				that.numberOfHiddenTiles -= 1;
			}
			clickedTile.draw();

			// if it is empty, reveal around
			if (that.tiles[xInit][yInit].numberOfAdjacentMines === 0) {
				clickedArr = that.revealAroundTile([xInit, yInit]);
				that.recursiveReveal(clickedArr);
			}

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
									// not already searched
									&& (!currentTile.wasSearched)) {
								tilesToClear.push([x + i, y + j]);
							}

							// show current tile
							if (!currentTile.isMine && currentTile.isHidden) {
								currentTile.isHidden = false;
								that.numberOfHiddenTiles -= 1;
							}
						}
					}
				}
				that.tiles[x][y].isHidden = false;
			}

			return tilesToClear;
		};

		/**
		* Recursive function used to reveal empty tiles
		*/
		that.recursiveReveal = function (tilesToClear) {
			var arr = [],
				first,
				returned = [];
			if (tilesToClear.length === 0) {
				returned = [];
			} else if (tilesToClear.length === 1) {
				// clear around this tile
				arr = that.revealAroundTile(tilesToClear[0]);
				// and start again on the tiles around it
				returned = that.recursiveReveal(arr);
			} else {
				first = tilesToClear.shift();
				// clear around the first tile of the array
				arr = that.recursiveReveal([first])
					// and do it on the others
					.concat(that.recursiveReveal(tilesToClear));
				returned = arr;
			}

			return returned;
		};
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
		that.isFirstClick = true;
		that.timer = {};
		that.time = 0;


		/**
		* Called when all mines are found or when a mine is clicked
		*/
		that.gameOver = function (won) {
			// stop timer
			clearInterval(that.timer);

			if (won) {
				that.drawGUI('Win!  Score ' + that.score.toFixed(3) + ' achieved in '
							 + that.formatTime(that.time) + '.  Click to restart.');
			} else {
				that.drawGUI('Game over!  (Score minus infinity.)  Click to restart.');
			}

			// reveal the mines
			that.board.revealAll();

			// on click, start new game
			canvas.removeEventListener("mousedown", that.click, false);
			canvas.addEventListener("mousedown", that.init, false);
      window.removeEventListener("keydown", that.keydown, false);
      window.addEventListener("keydown", that.initOnEnter, false);
		};

    that.initOnEnter = function (e) {
      if (e.key == "Enter")
        that.init();
    };

    /**
    * Toggle the flag of the tile at (x, y), and keep track of the count.
    */
    that.toggleFlag = function(x, y) {
      var clickedTile = that.board.tiles[x][y];
      clickedTile.toggleFlag();
      clickedTile.draw(false);
      if (clickedTile.isFlagged)
        that.board.nFlags += 1;
      else
        that.board.nFlags -= 1;
      that.drawStatusLine();
    };
 
    /**
    * Expose the tile at (x, y).
    */
    that.expose = function(x, y) {
      var clickedTile = that.board.tiles[x][y];
     
      if (!clickedTile.isFlagged) {
        // on first click, start timer and initialize
        // the mines for the player not to click on a mine
        if (that.isFirstClick) {
          that.board.addMines(that.numberOfMines, x, y);
          that.startTimer();
          that.isFirstClick = false;
        }

        if (clickedTile.isMine) {
          // game lost
          that.gameOver(false);
        } else {
          that.board.reveal(x, y);

          if (that.board.numberOfHiddenTiles
              === that.numberOfMines) {
            // game won
            that.gameOver(true);
          }
        }
      }
    };
 
		/**
		* Click handler
		* See http://www.quirksmode.org/js/events_properties.html
		*/
		that.click = function (e) {
			var x, y, mouseX, mouseY,
				clickedTile,
				rightClick;

      // remove cursor highlighting
      that.board.lastInputWasKey = false;
      that.board.tiles[that.board.x][that.board.y].draw(false);
 
      // determine if right click
			if (e.which) {
				rightClick = (e.which === 3);
			} else if (e.button) {
				rightClick = (e.button === 2);
			}

			// determine mouse position
			if (e.offsetX) {
				mouseX = e.offsetX;
				mouseY = e.offsetY;
			} else if (e.layerX) {
				mouseX = e.layerX;
				mouseY = e.layerY;
			}

			// normalize by tile size to get the tile coordinates
			x = that.board.x = Math.floor(mouseX / that.tileSize);
			y = that.board.y = Math.floor(mouseY / that.tileSize);

			// if we click on the board
			if (y < that.board.tiles[0].length) {

				if (rightClick) {
          that.toggleFlag(x, y);
				} else
          that.expose(x, y);
			}
		};

		/**
		* Draw game information on canvas
		*/
		that.drawGUI = function (text) {
			ctx.fillStyle = "#333";
			ctx.fillRect(0, canvas.height - that.guiHeight,
						 canvas.width, that.guiHeight);
			ctx.fillStyle = "#eee";
			ctx.font = "15px 'Arial', sans-serif";

			ctx.fillText(text, 7, canvas.height - 7);
		};

		/**
		* Format time as minutes and seconds
		*/
		that.formatTime = function(time) {
			return Math.floor(time/60) + ':' + (time%60+100).toString().slice(1);
		}

		/**
		* Status line
		*/
		that.drawStatusLine = function () {
      // ick, formatting using spaces
			that.drawGUI('Time: ' + that.formatTime(that.time)
                   + '       Score: ' + that.score.toFixed(3)
                   + '       Mines: ' + that.board.nFlags + '/' + that.numberOfMines);
		};

		/**
		* Timer
		*/
		that.startTimer = function () {
			that.drawStatusLine();
			that.timer = setInterval(function () {
				that.time += 1;
				that.drawStatusLine();
			}, 1000);
		};
 
		/**
		* Key handler
		*/
		that.keydown = function (e) {
     var key = e.key;

     that.board.lastInputWasKey = true; // do we need this? global draw uses it
     that.board.tiles[that.board.x][that.board.y].draw(false);
     if (key == "ArrowLeft" || key == "Left") {
      that.board.x -= 1;
     } else if (key == "ArrowRight" || key == "Right") {
      that.board.x += 1;
     } else if (key == "ArrowUp" || key == "Up") {
      that.board.y -= 1;
     } else if (key == "ArrowDown" || key == "Down") {
      that.board.y += 1;
     } else if (key == " " || key == "Spacebar") {
      that.toggleFlag(that.board.x, that.board.y);
     } else if (key == "Enter") {
      that.expose(that.board.x, that.board.y);
     }
     that.board.boundCursor();
     that.board.tiles[that.board.x][that.board.y].draw(true);
 
     e.stopPropagation();
    };
 
		/**
		* Game initialization
		*/
		that.init = function () {
			canvas.width = width * that.tileSize;
			canvas.height = height * that.tileSize + that.guiHeight;

			canvas.removeEventListener("mousedown", that.init, false);
			canvas.addEventListener("mousedown", that.click, false);
      window.removeEventListener("keydown", that.initOnEnter, false);
      window.addEventListener("keydown", that.keydown, false);
      window.addEventListener("keypress", e => {e.stopPropagation();}, false);
      that.isFirstClick = true;
 
			that.time = 0;
      that.score = 0.0;
 
			that.board.init();

			that.board.draw();
			that.drawGUI('Game ready.  Click a tile to start.');

			tileSprite.onload = function () {
				that.board.draw();
			};
		};
	}

	window.onload = function () {
		game = new Game(16, 16, 85);
		game.init();
	};

}());
