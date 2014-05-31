import csp
from math import sqrt

SIZE = 9
BLOCK_SIZE = int(sqrt(SIZE))
sudoku = {}

variables = { (i,j):range(SIZE) for i in range(SIZE) for j in range(SIZE) }
# Replace empty dict with dict of filled in values.
filled_in = { pos:[val - 1] for pos,val in {}.iteritems() } 
variables.update(filled_in)
sudoku['variables'] = variables

neq = lambda x,y: x != y
horiz = [((i,k), (j,k), neq) for k in range(SIZE) for i in range(SIZE) for j in range(SIZE) if neq(i,j)]
vert  = [((k,i), (k,j), neq) for k in range(SIZE) for i in range(SIZE) for j in range(SIZE) if neq(i,j)]
block = []
for (k,l) in [(k,l) for k in range(SIZE) for l in range(SIZE)]:
  v,h = k // BLOCK_SIZE, l // BLOCK_SIZE
  for (i,j) in [(i,j) for i in range(v * 3, (v + 1) * 3) for j in range(h * 3, (h + 1) * 3) 
                    if neq((k,l), (i,j))]:
    block.append(((k,l), (i,j), neq))
sudoku['constraints'] = [v for a in [horiz, vert, block] for v in a]

def print_sudoku(result):
  divider = '|' + '-' * 35 + '|'
  print divider
  for i in range(SIZE):
    row = '| '
    for j in range(SIZE):
      row += str(result[(i,j)] + 1)
      row += '   ' if j % 3 != (BLOCK_SIZE - 1) else ' | '
    print row
    if i % 3 == (BLOCK_SIZE - 1):
      print divider

result = csp.solve(sudoku)
print_sudoku(result)
