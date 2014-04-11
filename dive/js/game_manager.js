function GameManager(size, InputManager, Actuator, ScoreManager) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.scoreManager = new ScoreManager;
  this.actuator     = new Actuator;

  this.startTiles   = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);

  var select = document.gameModeForm.gameModeSelect;
  this.gameMode     = +(select.options[select.selectedIndex].value);
  this.tileTypes = [2,3,5,7];
  if (this.gameMode & 1) {
    this.tileTypes = [2];
    this.actuator.updateCurrentlyUnlocked(this.tileTypes);
    this.tilesSeen = [2];
  } 

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Set game mode for best score
  this.scoreManager.setGameMode(this.gameMode);

  // Add the initial tiles
  this.addStartTiles();

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = this.tileTypes[Math.floor(Math.random() * this.tileTypes.length)];
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.scoreManager.get() < this.score) {
    this.scoreManager.set(this.score);
  }

  this.actuator.actuate(this.grid, {
    score:     this.score,
    over:      this.over,
    won:       this.won,
    bestScore: this.scoreManager.get()
  });

};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.over || this.won) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;
  var newPrimes  = [];

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  var ominosityBound;
  if (self.gameMode && 1) {
    // The idea of this is that a seed is ominous roughly if it exceeds 
    // the 2i-th prime, if there are i seeds so far.
    // But add a little more, to be forgiving.
    ominosityBound = self.tileTypes.length * 2;
    ominosityBound *= Math.log(ominosityBound);
    ominosityBound += 8;
  }

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);
      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && self.div(next.value, tile.value) > 0 && !next.mergedFrom) {
          var merged = new Tile(positions.next, self.div(next.value, tile.value));
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += Math.min(next.value, tile.value);

          // Unlock new primes, if in that mode
          if (self.gameMode & 1) {
            var primes = self.extractNewPrimes(merged.value);
            newPrimes = newPrimes.concat(primes);
          }
        } else { // if (tile)
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (self.gameMode & 1) {
    // remove duplicates
    if (newPrimes.length >= 2) {
      newPrimes.sort(function (a,b){return a-b});
      for (var i = newPrimes.length - 2; i >= 0; i--)
        if (newPrimes[i] == newPrimes[i+1])
          newPrimes.splice(i,1);
    }        
    self.tileTypes = self.tileTypes.concat(newPrimes);
  }

  if (moved) {
    if ((self.gameMode & 1) && newPrimes.length) {
      // in mode 1, score for unlocking
      if ((self.gameMode & 3) == 1) {
        self.score += newPrimes.reduce(function(x,y){return x+y});
      }

      self.tilesSeen.push.apply(self.tilesSeen, newPrimes);

      var verb = " unlocked!";
      if (newPrimes.filter(function(x){return x > ominosityBound}).length)
        verb = " unleashed!";
      var list = String(newPrimes.pop());
      if (newPrimes.length) {
        list = newPrimes.join(", ") + " and " + list;
      }
      self.actuator.announce(list + verb);
      self.actuator.updateCurrentlyUnlocked(self.tileTypes);
    } // mode 1 only
        
    if ((self.gameMode & 3) == 3) {
      // Eliminate primes now absent.
      var eliminatedIndices = [];
      for (var i = 0; i < self.tileTypes.length; i++)
        eliminatedIndices.push(i);

      traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
          cell = { x: x, y: y };
          tile = self.grid.cellContent(cell);
          if (tile) {
            for(var i = 0; i < self.tileTypes.length; i++) {
              if (tile.value % self.tileTypes[i] == 0)
                eliminatedIndices[i] = null;
            }
          }
        });
      });
          
      eliminatedIndices = eliminatedIndices.filter(function (x) {return x != null});
      if (eliminatedIndices.length) {
        var eliminatedPrimes = eliminatedIndices.map(function (x) {return self.tileTypes[x]});
        self.score += eliminatedPrimes.reduce(function(x,y){return x+y});

        var verb = " eliminated!"
        if (eliminatedPrimes.filter(function(x){return x > ominosityBound}).length)
          verb = " vanquished!";
        var list = String(eliminatedPrimes.pop());
        if (eliminatedPrimes.length) {
          list = eliminatedPrimes.join(", ") + " and " + list;
        }
        self.actuator.announce(list + verb);
        self.actuator.updateCurrentlyUnlocked(self.tileTypes);
      }
        
      for(var i = eliminatedIndices.length - 1; i >= 0; i--)
        self.tileTypes.splice(eliminatedIndices[i],1);
      self.actuator.updateCurrentlyUnlocked(self.tileTypes);
    } // mode 3

    this.addRandomTile();

    if (!this.movesAvailable()) { // Game over!
      if ((this.gameMode & 3) == 3)
        this.over = { tileTypes: this.tileTypes,
                      tilesSeen: this.tilesSeen };
      else
        this.over = {};
    }

    this.actuate();
  } // if (moved)
};

GameManager.prototype.div = function (next, cur) {
  if ((next % cur === 0) || (cur % next === 0))
    return next + cur
};

// Do the factor extraction in the way yielding the least result
GameManager.prototype.extractPrimesFrom = function(n, i) {
  if (i >= this.tileTypes.length) return n;
  var min = this.extractPrimesFrom(n, i+1);
  while (n % this.tileTypes[i] == 0) {
    n /= this.tileTypes[i];
    var comparandum = this.extractPrimesFrom(n, i+1);
    if (comparandum < min)
      min = comparandum;
  }
  return min;
}

GameManager.prototype.extractNewPrimes = function (n) {
  n = this.extractPrimesFrom(n, 0);
  if (n > 1)
    return [n];
  return [];
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && self.div(other.value, tile.value) > 0) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
