// yes, global function, naughty.  what should I have done?
gcd = function(a, b) {
  if (b === 0)
    return a;
  return self.gcd(b, a % b);
};

function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;
  this.stylevalue       = gcd(this.value, 63504000);

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};
