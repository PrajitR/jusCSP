var csp = require('./csp');

var SIZE = 9, BLOCK_SIZE = Math.sqrt(SIZE) | 0, domain = [],
    sudoku = {}, variables = {}, constraints = [],
    filled_in = generate_sudoku();

function generate_sudoku() {
  var starting_nums = [1, 4, 7, 2, 5, 8, 3, 6, 9],
      SIZE = 9, BLOCK = Math.sqrt(SIZE) | 0,
      board = [];
  
  for (var i = 0; i < SIZE; i++) {
    var row = [], starting = starting_nums[i];
    for (var j = 0; j < SIZE; j++) {
      row.push(starting++);
      if (starting == SIZE + 1) { starting = 1; }
    }
    board.push(row);
  }

  function transpose(array) {
    return array[0].map(function(_, i) {
      return array.map(function(row) {
        return row[i];
      });
    });
  }
  function swapRows(array) {
    var row1 = (Math.random() * SIZE) | 0,
        blockInd = row1 / BLOCK | 0, // Which block row1 is in.
        row2 = row1;
    while (row2 == row1) { row2 = BLOCK * blockInd + ((Math.random() * BLOCK) | 0); }
    var r1 = array[row1].slice(), r2 = array[row2].slice();
    array[row1] = r2; array[row2] = r1;
    return array;
  }
  function swapRowBlocks(array) {
    var b1 = (Math.random() * BLOCK) | 0, b2 = b1;
    while (b2 == b1) { b2 = (Math.random() * BLOCK) | 0; }
    for (var i = 0; i < BLOCK; i++) {
      var row1 = b1 * BLOCK + i, row2 = b2 * BLOCK + i,
        r1 = array[row1].slice(), r2 = array[row2].slice();
      array[row1] = r2; array[row2] = r1;
    }
  }

  var ITERS = 500;
  for (var i = 0; i < ITERS; i++) {
    switch (i % 4) {
      case 0: // Row swap.
        swapRows(board);
        break;
      case 1: // Col swap.
        board = transpose(swapRows(transpose(board)));
        break;
      case 2:
        swapRowBlocks(board);
        break;
      case 3: // Transpose
        board = transpose(board);
        break;
    }
  }

  var selected = {}, num_selected = 30;
  for (var ind = 0; ind < num_selected; ind++) {
    var i = (Math.random() * SIZE) | 0, j = (Math.random() * SIZE) | 0;
    if (selected[[i + 1,j + 1]]) { ind--; }
    selected[[i + 1,j + 1]] = board[i][j];
  }
  return selected;
}

for (var i = 1; i <= SIZE; i++) { domain.push(i); }
function neq(x, y) { return x != y; }

for (var i = 1; i <= SIZE; i++) {
  for (var j = 1; j <= SIZE; j++) {
    var fi = filled_in[[i,j]];
    variables[[i, j]] = fi ? [fi] : domain.slice();

    // Vertical and horizontal constraints.
    for (var k = 1; k <= SIZE; k++) {
      if (neq(i, j)) {
        constraints.push([[i, k], [j, k], neq]);
        constraints.push([[k, i], [k, j], neq]);
      }
    }
    // Block constraints.
    var v = (i - 1) / BLOCK_SIZE | 0, h = (j - 1) / BLOCK_SIZE | 0;
    for (var k = v * 3; k < (v + 1) * BLOCK_SIZE; k++) {
      for (var m = h * 3; m < (h + 1) * BLOCK_SIZE; m++) {
        if (neq(i, k + 1) || neq(j, m + 1)) {
          constraints.push([[k + 1, m + 1], [i, j], neq]);
        }
      }
    }
  }
}

sudoku.variables = variables;
sudoku.constraints = constraints;

var result = csp.solve(sudoku);
if (result == 'FAILURE') { console.log(result); return; }

var divider = '|';
for (var i = 1; i <= 35; i++) { divider += '-'; }
divider += '|';
console.log(divider);
for (var i = 1; i <= SIZE; i++) {
  var row = '| ';
  for (var j = 1; j <= SIZE; j++) {
    row += result[[i, j]];
    row += j % BLOCK_SIZE != 0 ? '   ' : ' | ';
  }
  console.log(row);
  if (i % BLOCK_SIZE == 0) { console.log(divider); }
}

