import csp
import pprint

SIZE = 8
board = {}

board['variables'] = { i: [(i, j) for j in range(SIZE)] for i in range(SIZE) }

def not_colliding(i, j):
  def diagonal(a, b):
    return abs(a[0] - b[0]) == abs(a[1] - b[1])
  return not(i[0] == j[0] or i[1] == j[1] or diagonal(i, j))

board['constraints'] = [(i, j, not_colliding) for i in range(SIZE) for j in range(i + 1, SIZE)]

result = csp.solve(board)
status = 'SUCCESS'
if not all((not_colliding(result[i], result[j]) for i in range(SIZE) for j in range(i + 1, SIZE))):
  status = 'FAILURE'

print '\n***************'
print '    ' + status
print '***************\n'
pprint.PrettyPrinter(indent=2).pprint(result)
print '\n'
