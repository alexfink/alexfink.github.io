function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.announcer        = document.querySelector(".announcer");
  this.currentlyUnlocked= document.querySelector(".currently-unlocked");

  this.score = 0;
  
  this.overlayPrimes = [7, 11, 13, 17, 19, 23, 29, 31];
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.over) self.message(false); // You lose
    if (metadata.won) self.message(true); // You win!
  });
};

HTMLActuator.prototype.restart = function () {
  this.clearMessage();
  this.clearCurrentlyUnlocked();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.removeFirstChild = function (container) {
  container.removeChild(container.firstChild);
};

// yes, global function, naughty.  what should I have done?
gcd = function(a, b) {
  if (b === 0)
    return a;
  return self.gcd(b, a % b);
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var element   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + gcd(tile.value, 1296000)];
  var animatedClasses = [];

  classes.push(positionClass);
  this.applyClasses(element, classes);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(element, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    animatedClasses.push("tile-merged");
    this.applyClasses(element, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    animatedClasses.push("tile-new");
    this.applyClasses(element, classes);
  }

  var tileNumber = document.createElement("div");
  var tileNumberClasses = animatedClasses.slice(0);
  tileNumberClasses.push("tilenumber");
  var contentLength = String(tile.value).length;
  if (contentLength > 3) {
    if (contentLength > 6) {
      contentLength = 6;
    }
    tileNumberClasses.push("tile-small-" + contentLength);
  }
  this.applyClasses(tileNumber, tileNumberClasses);
  tileNumber.textContent = tile.value;
  element.appendChild(tileNumber);

  this.overlayPrimes.forEach(function (p) {
    if (tile.value % p == 0) {
      var tileOverlay = document.createElement("div");
      var tileOverlayClasses = animatedClasses.slice(0);
      tileOverlayClasses.push("tileoverlay");
      if (tile.value % (p*p) == 0)
        tileOverlayClasses.push("tileoverlay-" + (p*p));
      else
        tileOverlayClasses.push("tileoverlay-" + p);
      self.applyClasses(tileOverlay, tileOverlayClasses);
      element.appendChild(tileOverlay);
    }
  });

  // Put the tile on the board
  this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.announce = function (message) {
  var announce = document.createElement("p");
  announce.classList.add("announcement");
  announce.textContent = message;
  this.announcer.appendChild(announce);
  setTimeout(this.removeFirstChild.bind(this,this.announcer),2500);
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.clearContainer(this.announcer);
  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won", "game-over");
};

HTMLActuator.prototype.updateCurrentlyUnlocked = function (list) {
  this.currentlyUnlocked.textContent = list.join(", ");
  this.currentlyUnlocked.classList.remove("hidden");
}

HTMLActuator.prototype.clearCurrentlyUnlocked = function () {
  this.currentlyUnlocked.textContent = "";
  this.currentlyUnlocked.classList.add("hidden");
};
