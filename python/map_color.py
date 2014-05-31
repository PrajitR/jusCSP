import csp
import json
import pprint

with open('state_neighbors.json', 'r') as f:
  data = json.loads(f.read())

us = {}
us['variables'] = { state:['red', 'green', 'blue', 'yellow'] for state in data.keys() }
us['constraints'] = [(s1, s2, lambda x,y: x != y) for s1 in data.keys() for s2 in data[s1]]

result = csp.solve(us)
status = 'SUCCESS'
if result == 'FAILURE' or not all((result[s1] != result[s2] for s1 in data.keys() for s2 in data[s1])):
  status = 'FAILURE'

print '\n***************'
print '    ' + status
print '***************\n'
pprint.PrettyPrinter(indent=2).pprint(result)
print '\n'
