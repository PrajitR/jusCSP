var csp = require('./csp'),
    fs = require('fs');

var data = JSON.parse(fs.readFileSync('state_neighbors.json'));

var us = {}, variables = {}, constraints = [];
function neq(s1, s2) { return s1 != s2; }

for (var state in data) {
  variables[state] = ['red', 'yellow', 'green', 'blue'];
  for (var i = 0, s = data[state]; i < s.length; i++) {
    constraints.push([state, s[i], neq]);
  }
}
us.variables = variables;
us.constraints = constraints;

var result = csp.solve(us), valid = true;
for (var state in data) {
  for (var i = 0, s = data[state]; i < s.length; i++) {
    if (result[state] == result[s[i]]) { valid = false; }
  }
}

var status = (result == 'FAILURE' || !valid) ? 'FAILURE' : 'SUCCESS';
console.log('\n***************');
console.log('    ' + status);
console.log('***************');
console.log(JSON.stringify(result, null, 2));
console.log('\n');
