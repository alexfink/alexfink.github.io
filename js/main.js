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
		* Place the mines according to a PBoard sample
		*/
    that.mineFromSample = function (tileSample) {
			for (var i = that.width - 1; i >= 0; i -= 1) {
				for (var j = that.height - 1; j >= 0; j -= 1) {
					that.tiles[i][j].isMine = false;
				}
			}
      for (var coords of tileSample)
        that.tiles[coords[0]][coords[1]].isMine = true;
 
      that.setAdjacentMines();
    }

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
									// not the clicked
									&& (i !== 0 || j !== 0)
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




  var factorials = [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600,6227020800,87178291200,1307674368000,20922789888000,355687428096000,6402373705728000,121645100408832000,2432902008176640000,51090942171709440000];

  function factorial(n) {
    var z;
    if (n < factorials.length)
      return factorials[n];
    else {
      z = n+1;
      //Gerg\H{o} Nemes' version of Stirling's approximation.  eight sig figs is fine
      return Math.sqrt(2*Math.PI/z)*Math.pow((z+1/(12*z-0.1/z))/Math.E, z);
    }
  }

  /**
  * Return a list of n of the items from ll.
  */
  function randomSublist(ll, n) {
    var l = ll.slice(),
        sublist = [];
    for (var i = n - 1; i >= 0; i -= 1)
      sublist.push(l.splice(Math.floor(Math.random() * l.length), 1)[0]);
    return sublist;
  }
 
	/**
  * A fact known about a set of cells on the board
  */
	function CellConstraint(cells, n) {
var that = this;
that.cells = new Set(cells); // expecting a Set
that.n = n;

that.equals = function (constraint) {
  if (constraint.n != that.n)
    return false;
  for (var e of that.cells)
    if (!constraint.cells.has(e))
      return false;
  for (var e of constraint.cells)
    if (!that.cells.has(e))
      return false;
  return true;
};

that.isSubset = function (constraint) {
  for (var e of that.cells)
    if (!constraint.cells.has(e))
      return false;
  return true;
};

/**
* Not guaranteed to be meaningful when constraint is not a subset of that.
*/
that.minus = function (constraint) {
  var difference = CellConstraint(that.cells, that.n - constraint.n);
  for (var e of constraint.cells)
    difference.cells.delete(e);
  return difference;
};

/**
* The set of common cells (not a constraint).
*/
that.intersection = function (constraint) {
  var s = new Set();
  for (var e of that.cells)
    if (constraint.cells.has(e))
      s.add(e);
  return s;
};
  }

	/**
	* Logicky board object, which does all the probabilistic reasoning
	*/
	function PBoard(width, height, nMines) {
var that = this;
that.width = width;
that.height = height;
that.nCells = width * height;
that.nMines = nMines;
that.constraints = [];

that.deepCopy = function () {
  var board = new PBoard(that.width, that.height, that.nMines);
  for (var constraint of that.constraints)
    board.constraints.push(new CellConstraint(constraint.cells, constraint.n));
  return board;
}

/**
* Convert cell coordinates (x, y) to a single integer representing the cell.
*/
that.coordsToID = function (x, y) {
  return y * that.width + x;
};

/**
* Convert single integer to cell coordinates.
*/
that.IDTOCoords = function (i) {
  return [i % that.width, Math.floor(i / that.width)];
}

/**
* Delete a constraint given its index,
* and update housekeeping information.
*/
that.deleteConstraint = function (j) {
  that.constraints.splice(j, 1);
};

/**
* Start the game with an exposure at (x, y).
*/
that.startGame = function(x, y) {
  that.constraints = [];
  for (var i = x-1; i <= x+1; i++) {
    if (i < 0) continue;
    if (i > that.width - 1) break;
    for (var j = y-1; j <= y+1; j++) {
      if (j < 0) continue;
      if (j > that.height - 1) break;

      that.constraints.push(new CellConstraint([that.coordsToID(i, j)], 0));
    }
  }
};

/**
* Return a set in which two constraints intersect nontrivially,
* or null if there isn't any.
* TODO: this is where we'll need heuristics if we have to compute approximately.
*/
that.findIntersection = function () {
  var intersection;

  for (var j = that.constraints.length - 1; j >= 0; j -= 1)
    for (var i = j - 1; i >= 0; i -= 1) {
      intersection = that.constraints[j].intersection(that.constraints[i]);
      if (intersection.size > 0 &&
          intersection.size < that.constraints[j].cells.size &&
          intersection.size < that.constraints[i].cells.size)
        return intersection;
    }
  return null;
};

/**
* Set of cells in no constraint.
*/
that.cellsInNoConstraint = function () {
  var s = new Set([...Array(that.nCells).keys()]);
  for (var constraint of that.constraints)
    for (var i of constraint.cells)
      s.delete(i);
  return s;
};

/**
* Count assignments of mines compatible with this board state.
* If sample is true, also return a uniform random one.
* If inner is true, assume the board state has already been simplified.
*/
that.count = function (sample, inner) {
  var intersection,
      board,
      total = 0,
      caseCount,
      lastSample;

  if (!inner)
    that.simplify();
  intersection = that.findIntersection();
  console.log("intersection", intersection);
  if (intersection === null) {
    return that.countBaseCase(sample);
  } else {
    for (var n = intersection.size; n >= 0; n -= 1) {
      board = that.deepCopy();
      board.simplify([new CellConstraint(intersection, n)]);
      caseCount = board.count(sample, true);
      total += caseCount[0];
      if (sample && Math.random() < caseCount[0] / total)
        lastSample = caseCount[1];
    }
  }
  if (sample)
    return [total, lastSample];
  else
    return [total];
};

/**
* This is the case in which no constraints intersect,
* so they can be counted and sampled indepedently.
*/
that.countBaseCase = function (sample) {
  var cellsLeft = that.nCells,
      minesLeft = that.nMines,
      prod = 1,
      mines = [],
      n, r;
  for (var constraint of that.constraints) {
    cellsLeft -= n = constraint.cells.size;
    minesLeft -= r = constraint.n; // yeah I know
    prod *= factorial(n) / factorial(r) / factorial(n-r);
    if (sample)
      mines = mines.concat(randomSublist([...constraint.cells], r));
  }
  prod *= factorial(cellsLeft) / factorial(minesLeft) / factorial(cellsLeft-minesLeft);
  if (sample) {
    mines = mines.concat(randomSublist([...that.cellsInNoConstraint()], minesLeft));
    return [prod, mines];
  } else
    return [prod];
};

/**
* Add the newConstraints, then simplify constraints using all the strategies.
* Omit newConstraints to simplify with respect to everything.
* Return false iff a contradiction was found.
*/
that.simplify = function (newConstraints) {
  var active; // indices of constraints we need to do something with
  if (newConstraints === undefined) {
    active = [...Array(that.constraints.length).keys()];
  } else {
    active = [];
    for (var constraint of newConstraints) {
      active.push(that.constraints.length);
      that.removeSubsetsAndAdd(constraint);
    }
  }

  while (active.length) {
    console.log("before crumble", that.constraints, active);
    active = that.crumbleUniques(active);
    console.log("before cut out", that.constraints, active);
    if (active === null)
      return false;
    active = that.cutOutSubsets(active);
  }
  return true;
};

/**
* The opposite number to cutOutSubsets, below.
*/
that.removeSubsetsAndAdd = function (constraint) {
  for (var i = that.constraints.length - 1; i >= 0; i -= 1) {
    if (that.constraints[i].isSubset(constraint))
      constraint = constraint.minus(that.constraints[i]);
  }
  that.constraints.push(constraint);
};

/**
* Simplify constraints of which the js[0]th or js[1]th or ... is a proper subset.
* Return the list of indices so simplified.
*/
that.cutOutSubsets = function (js) {
  var actedOn = [];
  for (var j of js) {
    for (var i = that.constraints.length - 1; i >= 0; i -= 1) {
      if (i == j)
        continue;
      if (that.constraints[j].isSubset(that.constraints[i])) {
        that.constraints[i] = that.constraints[i].minus(that.constraints[j]);
        actedOn.push[i];
      }
    }
  }
  return actedOn;
};

/**
* Look at the js[0]th, js[1]th, ... constraints, 
* to see whether they have at most one solution.
* Return null if any has none.
* Otherwise return the list of indices of constraints which these were broken into.
* Note that this process kills constraints of size 0.
*/
that.crumbleUniques = function(js) {
  var crumbs = [],
      lastJ = -1, // we don't want to do one twice
      newCrumbsStart = that.constraints.length, // everything appended is a crumb
      newCrumbs,
      c;

  js.sort((a,b) => b-a);
  for (var j of js) {
    if (j == lastJ)
      continue;
    lastJ = j;

    c = that.constraints[j];
    if (c.n > c.cells.size || c.n < 0)
      return null;
    if (c.n == c.cells.size || c.n == 0) {
      for (var i of c.cells)
        that.constraints.push(new CellConstraint([i], c.n?1:0));
      that.deleteConstraint(j);
      newCrumbsStart -= 1;
    } else
      crumbs.push[j];
  }
 
  newCrumbs = new Array(that.constraints.length - newCrumbsStart);
  for (var i = that.constraints.length - 1; i >= newCrumbsStart; i -= 1)
    newCrumbs[i - newCrumbsStart] = i;
  return newCrumbs.concat(crumbs);
};
  }

 
	/**
	* Main game object
	*/
	function Game(width, height, numberOfMines) {
		var that = this;

		that.width = width;
		that.height = height;
    that.numberOfMines = numberOfMines;
		that.guiHeight = 25;
		that.tileSize = 25;
		that.board = new Board(that.width, that.height, that.tileSize);
    that.pBoard = new PBoard(that.width, that.height, numberOfMines);
		that.mines = [];
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
      var clickedTile = that.board.tiles[x][y],
          count;
     
      if (!clickedTile.isFlagged) {
        // on first click, start timer and initialize
        // the mines for the player not to click on a mine
        if (that.isFirstClick) {
          that.pBoard.startGame(x, y);
          count = that.pBoard.count(true);
          that.board.mineFromSample(count[1].map(i => that.pBoard.IDTOCoords(i)));
 
          that.startTimer();
          that.isFirstClick = false;

          //that.gameOver(false);
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
