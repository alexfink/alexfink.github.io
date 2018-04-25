# log P(sweeper)

Minesweeper, but with hitting mines derandomised.
When you reveal a tile, instead of randomly having a chance of dying,
you score the log of your probability of survival and carry on.
The game only ends if it would be inconsistent for it to continue.

Try it: https://alexfink.github.io/logpsweeper/

Alex Fink, 2018.
Based on an implementation by Corentin Smith, 2013:
see https://github.com/cosmith/minesweeper .
