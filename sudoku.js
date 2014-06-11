var csp = require('./csp');

var SIZE = 9, BLOCK_SIZE = Math.sqrt(SIZE) | 0, domain = [],
    sudoku = {}, variables = {}, constraints = [],
    filled_in = {'2,1': [7], '3,3': [2], '1,4': [5]};

for (var i = 1; i <= SIZE; i++) { domain.push(i); }
function neq(x, y) { return x != y; }

for (var i = 1; i <= SIZE; i++) {
  for (var j = 1; j <= SIZE; j++) {
    variables[[i, j]] = filled_in[[i, j]] || domain.slice();
    
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

