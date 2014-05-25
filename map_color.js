var csp = require('csp'),
    fs = require('fs');

var data = JSON.parse(fs.readFileSync('state_neighbors.json'));

var us = {}, variables = {}, constraints = [];
function neq(s1, s2) { return s1 != s2; }

for (var state in data) {
  variables[state] = ['red', 'yellow', 'green', 'blue'];
  for (var neighbor in data[state]) {
    constraints.push([state, neighbor, neq]);
  }
}
us.variables = variables;
us.constraints = constraints;

var result = csp.solve(us), valid = true;
for (var state in data) {
  for (var neighbor in data[state]) {
    if (data[state] == data[neighbor]) { valid = false; }
  }
}

var status = (result == 'FAILURE' || !valid) ? 'FAILURE' : 'SUCCESS';
console.log('\n***************');
console.log('    ' + status);
console.log('\n***************');
console.log(JSON.stringify(result, null, 2));
console.log('\n');
