var FAILURE = 'FAILURE';

function solve(csp, cb) {
  var result = backtrack({}, csp.variables, csp, cb);
  if (result == FAILURE) { return result; }
  for (var key in result) {
    result[key] = result[key][0];
  }
  return result;
}

function backtrack(assigned, unassigned, csp, cb) {
  if (finished(unassigned)) { return assigned; }
  var key = selectUnassignedVariable(unassigned),
      values = orderValues(key, assigned, unassigned, csp);
  delete unassigned[key];

  for (var i = 0; i < values.length; i++) {
    assigned[key] = [values[i]];
    var consistent = enforceConsistency(assigned, unassigned, csp);
    if (anyEmpty(consistent)) { continue; }
    var newUnassigned = {}, newAssigned = {};
    for (key in consistent) {
      if (assigned[key]) { newAssigned[key] = consistent[key]; }
      else { newUnassigned[key] = consistent[key]; }
    }
    cb(newAssigned, newUnassigned, csp);
    var result = backtrack(newAssigned, newUnassigned, csp, cb);
    if (result != FAILURE) { return result; }
  }

  return FAILURE;
}

function finished(unassigned) {
  return Object.keys(unassigned).length == 0;
}

function anyEmpty(consistent) {
  for (key in consistent) {
    if (consistent[key].length == 0) { return true; }
  }
  return false;
}

function partialAssignment(assigned, unassigned) {
  var partial = {};
  for (key in unassigned) { partial[key] = unassigned[key]; }
  for (key in assigned) { partial[key] = assigned[key]; }
  return partial;
}

function enforceConsistency(assigned, unassigned, csp) {

  function removeInconsistentValues(head, tail, constraint, variables) {
    var validTailValues = [], hv = variables[head], tv = variables[tail];
    for (var i = 0, t = tv[i]; i < tv.length; i++) {
      for (var j = 0, h = hv[j]; j < hv.length; j++) {
        if (constraint(h, t)) {
          validTailValues.push(t);
          continue;
        }
      }
    }
    var removed = tv.length != validTailValues.length;
    variables[tail] = validTailValues;
    return removed;
  }

  function incomingConstraints(node) {
    var validConstraints = [];
    csp.constraints.forEach(function (c) {
      if (c[0] == node) { validConstraints.push(c); }
    });
    return validConstraints;
  }
  
  var queue = csp.constraints.slice(), 
      variables = partialAssignment(assigned, unassigned);
  while (queue.length) {
    var c = queue.shift(), head = c[0], tail = c[1], constraint = c[2];
    if removeInconsistentValues(head, tail, constraint, variables) {
      queue = queue.concat(incomingConstraints(tail));
    }
  }
  return variables;
}

function selectUnassignedVariable(unassigned) {
  var minKey = null, minLength = Number.POSITIVE_INFINITY;
  for (var key in unassigned) {
    var len = unassigned[key];
    if (len < minLength) { minKey = key, minLength = len; }
  }
  return minKey;
}

function orderValues(nextKey, assigned, unassigned, csp) {
  
  function countValues(vars) {
    var sum = 0;
    for (var key in unassigned) {
      sum += unassigned[key].length;
    }
    return sum;
  }

  function valuesEliminated(val) {
    assigned[nextKey] = [val];
    var newLength = countValues(enforceConsistency(assigned, unassigned, csp));
    delete assigned[nextKey];
    return newLength;
  }

  // Cache valuesEliminated.
  var cache = {}, values = unassigned[nextKey];
  values.forEach(function(val) {
    cache[val] = valuesEliminated(val);
  });
  values.sort(function (a, b) { return cache[b] - cache[a]; });
  return values;
}
