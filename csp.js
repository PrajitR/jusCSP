!function() {

var csp = {},
    FAILURE = 'FAILURE';

csp.solve = function solve(csp, cb) {
  // Solves a constraint satisfaction problem.
  // `csp` is an object that should have the properties:
  //    `variables`  : object that holds variable names and their domain.
  //    `constraints`: list of constraints where each element is an 
  //                   array of [head node, tail node, constraint function]

  var result = backtrack({}, csp.variables, csp, cb);
  if (result == FAILURE) { return result; }
  // Unwrap values from array containers.
  for (var key in result) {
    result[key] = result[key][0];
  }
  return result;
}

function backtrack(assigned, unassigned, csp, cb) {
  // Backtracking search.
  if (finished(unassigned)) { return assigned; } // Base case.
  var nextKey = selectUnassignedVariable(unassigned),
      values = orderValues(nextKey, assigned, unassigned, csp);
  delete unassigned[nextKey];

  for (var i = 0; i < values.length; i++) {
    assigned[nextKey] = [values[i]]; // Assign a value to a variable.
    var consistent = enforceConsistency(assigned, unassigned, csp);
    var newUnassigned = {}, newAssigned = {};
    for (var key in consistent) {
      if (assigned[key]) { newAssigned[key] = consistent[key].slice(); }
      else { newUnassigned[key] = consistent[key].slice(); }
    }
    if (cb) { cb(newAssigned, newUnassigned, csp); }
    if (anyEmpty(consistent)) { continue; } // Empty domains means failure.
    var result = backtrack(newAssigned, newUnassigned, csp, cb);
    if (result != FAILURE) { return result; }
  }

  return FAILURE;
}

function finished(unassigned) {
  // Checks if there are no more variables to assign.
  return Object.keys(unassigned).length == 0;
}

function anyEmpty(consistent) {
  // Checks if any variable's domain is empty.
  for (var key in consistent) {
    if (consistent[key].length == 0) { return true; }
  }
  return false;
}

function partialAssignment(assigned, unassigned) {
  // Combine unassigned and assigned for use in enforceConsistency.
  var partial = {};
  for (var key in unassigned) { partial[key] = unassigned[key].slice(); }
  for (var key in assigned) { partial[key] = assigned[key].slice(); }
  return partial;
}

function enforceConsistency(assigned, unassigned, csp) {
  // Enforces arc consistency by removing inconsistent values from
  // every constraint's tail node.

  function removeInconsistentValues(head, tail, constraint, variables) {
    // Removes inconsistent values from the tail node. A value is
    // inconsistent when if the `tail` is assigned that value, there are
    // no values in `head`'s domain that satisfies the constraint.
    var hv = variables[head], tv = variables[tail];
    var validTailValues = tv.filter(function (t) {
      return hv.some(function (h) {
        return constraint(h, t);
      });
    });
    var removed = tv.length != validTailValues.length;
    variables[tail] = validTailValues;
    return removed;
  }

  function incomingConstraints(node) {
    // Returns all the constraints where `node` is the head node.
    return csp.constraints.filter(function (c) {
      return c[0] == node;
    });
  }
  
  var queue = csp.constraints.slice(), 
      variables = partialAssignment(assigned, unassigned);
  while (queue.length) { // While there are more constraints to test.
    var c = queue.shift(), head = c[0], tail = c[1], constraint = c[2];
    if (removeInconsistentValues(head, tail, constraint, variables)) {
      // If values from the tail have been removed, incoming constraints
      // to the tail must be rechecked.
      queue = queue.concat(incomingConstraints(tail));
    }
  }
  return variables;
}

function selectUnassignedVariable(unassigned) {
  // Picks the next variable to assign according to the Minimum
  // Remaining Values heuristic. Pick the variable with the fewest
  // values remaining in its domain. This helps identify domain
  // failures earlier.
  var minKey = null, minLen = Number.POSITIVE_INFINITY;
  for (var key in unassigned) {
    var len = unassigned[key].length;
    if (len < minLen) { minKey = key, minLen = len; }
  }
  return minKey;
}

function orderValues(nextKey, assigned, unassigned, csp) {
  // Orders the values of an unassigned variable according to the
  // Least Constraining Values heuristic. Perform arc consistency
  // on each possible value, and order variables according to the
  // how many values were eliminated from all the domains (fewest
  // eliminated in the front). This helps makes success more likely
  // by keeping future options open.
  
  function countValues(vars) {
    var sum = 0;
    for (var key in vars) { sum += vars[key].length; }
    return sum;
  }

  function valuesEliminated(val) {
    assigned[nextKey] = [val];
    var newLength = countValues(enforceConsistency(assigned, unassigned, csp));
    delete assigned[nextKey];
    return newLength;
  }

  // Cache valuesEliminated to be used in sort.
  var cache = {}, values = unassigned[nextKey];
  values.forEach(function(val) {
    cache[val] = valuesEliminated(val);
  });
  // Descending order based on the number of domain values remaining.
  values.sort(function (a, b) { return cache[b] - cache[a]; });
  return values;
}

// Taken from d3 source. Makes `csp` usable in other scripts.
if (typeof define === 'function' && define.amd) {
  define(csp);
} else if (typeof module === 'object' && module.exports) {
  module.exports = csp;
} else {
  this.csp = csp;
}

}();
