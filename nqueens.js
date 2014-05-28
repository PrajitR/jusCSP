var csp = require('./csp');

var SIZE = 8, board = {}, variables = {}, constraints = [];

function not_colliding(i, j) {
  function diagonal(a, b) {
    return Math.abs(a[0] - b[0]) == Math.abs(a[1] - b[1]);
  }
  return !(i[0] == j[0] || i[1] == j[1] || diagonal(i, j));
}

for (var i = 0; i < SIZE; i++) {
  var queenPos = [];
  for (var j = 0; j < SIZE; j++) { 
    queenPos.push([i, j]); 
    if (i != j) { constraints.push([i, j, not_colliding]); }
  }
  variables[i] = queenPos;
}
board.variables = variables;
board.constraints = constraints;

var result = csp.solve(board), valid = true;
if (result != 'FAILURE') {
  for (var i = 0; i < SIZE; i++) {
    for (var j = 0; j < SIZE; j++) {
      if (i != j && !not_colliding(result[i], result[j])) { valid = false; }
    }
  }
} else { valid = false; }

var status = !valid ? 'FAILURE' : 'SUCCESS';
console.log('\n***************');
console.log('    ' + status);
console.log('***************');
console.log(result);
console.log('\n');
