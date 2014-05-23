FAILURE = 'FAILURE'

def solve(csp):
  """
  csp is an object that should have properties:

    variables:  
      dictionary of variables and values they can take on

    constraints:
      list of constraints where each element is a tuple of 
      (head node, tail node, constraint function)

    consistent: 
      function that takes in a dictionary of assignments and checks if
      the assignments are valid

    enforce_consistency:
      function that takes in a variable and value, and performs arc
      consistency, returning a new variables dictionary
  """
  return backtrack({}, csp.variables, csp)
  
def backtrack(assignments, unassigned, csp):
  if finished(unassigned): return assignments
  var = select_unassigned_variable(unassigned)
  values = order_values(var, assignments, unassigned, csp)
  del unassigned[var]
  for value in values:
    assignments[var] = value
    v = enforce_consistency(assignments, unassigned, csp)
    if any_empty(v): continue
    unassigned = { var:val for var,val in v.iteritems() if var not in assignments }
    result = backtrack(assignments.copy(), unassigned, csp)
    if result != FAILURE: return result
  return FAILURE

def finished(unassigned):
  return len(unassigned) == 0

def any_empty(v):
  return any((len(v[k]) == 0 for k in v.keys()))

def partial_assignment(assignments, unassigned):
  v = unassigned.copy()
  v.update(assignments)
  return v

def consistent(assignments, csp):
  variables = assignments.copy()
  variables.update(csp.variables)
  return all((constraint(variables[head], variables[tail]) for head, tail, constraint in csp.constraints))

def enforce_consistency(assignments, unassigned, csp):
  """
  Enforces arc consistency by removing values from tail nodes of a 
  constraint, and if a node loses value, perform arc consistency on 
  that node.
  """
  def remove_inconsistent_values(head, tail, constraint, variables):
    removed, valid_tail_values = False, []
    for t in variables[tail]:
      for h in variables[head]:
        if constraint(h, t): # Constraint is satisfied
          valid_tail_values.append(t)
          removed = True
          break
    variables[tail] = valid_tail_values
    return removed

  def incoming_constraints(node, csp):
    return [(h, t, c) for h,t,c in csp.constraints if h == node]
    
  queue, variables = csp.constraints, partial_assignment(assignments, unassigned)
  while len(queue):
    head, tail, constraint = queue.pop(0)
    if remove_inconsistent_values(head, tail, constraint, variables):
      queue.extend(incoming_constraints(tail))
  return variables

def select_unassigned_variable(assignments, unassigned, csp):
  """
  Picks the next variable to assign according to the 
  Minimum Remaining Values principle: choose the variable
  with the fewest legal values remaining. This helps 
  identify failure earlier.
  """
  return min(unassigned.keys(), key=lambda k: len(csp.variables[k]))
    
def order_values(var, assignments, unassigned, csp):
  """
  Orders the values of an unassigned variable according to the
  Least Constraining Value principle: order values by the amount
  of values they eliminate when assigned (fewest eliminated at the
  front, most eliminated at the end). Helps make future assignments
  easier to succeed.
  """
  def count_vals(vars):
    return sum((len(vars[v]) for v in unassigned if v != var)) 

  num_vals = count_vals(partial_assignment(assignments, csp.variables))
  def values_eliminated(val):
    assignments[var] = val
    new_vals = count_vals(enforce_consistency(assignments, unassigned, csp)) 
    del assignments[var]
    return num_vals - new_vals

  return sorted(csp.variables[var], key=values_eliminated)
  
