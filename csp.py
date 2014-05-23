FAILURE = 'FAILURE'

def solve(csp):
  """
  Solve a constraint satisfaction problem.

  csp is an object that should have properties:

    variables:  
      dictionary of variables and values they can take on

    constraints:
      list of constraints where each element is a tuple of 
      (head node, tail node, constraint function)
 """
  result = backtrack({}, csp['variables'], csp)
  if result == FAILURE: return result
  return { k:v[0] for k,v in result.iteritems() } # Unpack values wrapped in arrays.
  
def backtrack(assignments, unassigned, csp):
  """
  Main algorithm for solving a constraint satisfaction problem.
  """
  if finished(unassigned): return assignments
  var = select_unassigned_variable(unassigned)
  values = order_values(var, assignments, unassigned, csp)
  del unassigned[var]

  for value in values:
    assignments[var] = [value]
    v = enforce_consistency(assignments, unassigned, csp)
    if any_empty(v): continue # A variable has no legal values.
    u = { var:val for var,val in v.iteritems() if var not in assignments }
    result = backtrack(assignments.copy(), u, csp)
    if result != FAILURE: return result

  return FAILURE

def finished(unassigned):
  return len(unassigned) == 0

def any_empty(v):
  return any((len(values) == 0 for values in v.itervalues()))

def partial_assignment(assignments, unassigned):
  """
  Merge together assigned and unassigned dictionaries (assigned
  values take priority).
  """
  v = unassigned.copy()
  v.update(assignments)
  return v

def enforce_consistency(assignments, unassigned, csp):
  """
  Enforces arc consistency by removing values from tail nodes of a 
  constraint, and if a node loses value, perform arc consistency on 
  that node.
  """

  def remove_inconsistent_values(head, tail, constraint, variables):
    """
    Checks if there are any inconsistent values in the tail. An 
    inconsistent value means that for a given value in the tail,
    there are no values in head that will satisfy the constraints.
    Returns whether there were inconsistent values in tail.
    """
    valid_tail_values = [t for t in variables[tail] if any((constraint(h, t) for h in variables[head]))]
    removed = len(variables[tail]) != len(valid_tail_values)
    variables[tail] = valid_tail_values
    return removed

  def incoming_constraints(node):
    """
    All constraints where constraint head is the passed in node.
    """
    return [(h, t, c) for h, t, c in csp['constraints'] if h == node]
    
  queue, variables = csp['constraints'][:], partial_assignment(assignments, unassigned)
  while len(queue):
    head, tail, constraint = queue.pop(0)
    if remove_inconsistent_values(head, tail, constraint, variables):
      queue.extend(incoming_constraints(tail)) # Need to recheck constraint arcs coming into tail.
  return variables

def select_unassigned_variable(unassigned):
  """
  Picks the next variable to assign according to the 
  Minimum Remaining Values principle: choose the variable
  with the fewest legal values remaining. This helps 
  identify failure earlier.
  """
  return min(unassigned.keys(), key=lambda k: len(unassigned[k]))
    
def order_values(var, assignments, unassigned, csp):
  """
  Orders the values of an unassigned variable according to the
  Least Constraining Value principle: order values by the amount
  of values they eliminate when assigned (fewest eliminated at the
  front, most eliminated at the end). Keeps future options open.
  """
  def count_vals(vars):
    return sum((len(vars[v]) for v in unassigned if v != var)) 

  def values_eliminated(val):
    assignments[var] = [val]
    new_vals = count_vals(enforce_consistency(assignments, unassigned, csp)) 
    del assignments[var]
    return new_vals

  return sorted(unassigned[var], key=values_eliminated, reverse=True)
