cspjs
=====

Visualize solving Constraint Satisfaction Problems. [Demonstration.](http://prajitr.github.io/jusCSP/)

Intro
-----

Constraint satisfaction problems (CSPs) are problems where you solve for the values of a set of variables, subject to some constraints.

Take map coloring. Each state in the US map can take on one of four colors. However, neighboring states cannot have the same color. If California is red, Oregon cannot also be red. In this CSP, the US states are the set of variables, their domains are the four colors, and the constraints are the neighbor color restrictions.

Another example of a CSP is Sudoku. Each square in the 9x9 grid can take on values from 1 to 9 inclusive. However, squares in the same row, same column, or same 3x3 block cannot take on that value. For example, if the square at position (2, 7) has a value of 4, other squares in row 2, column 7, and block 3 (third block in the first block row) cannot be 4. The 81 squares are the set of variables, their domains are numbers from 1 to 9, and the constraints are the row/column/block restrictions.

Yet another CSP is the N-Queens problem. Each of N queens can be on any square of a NxN board. However, no queen should be able to kill another queen based on the rules of chess. That is, if you place a queen on a particular square, no other queen can be on the same row, same column, or same diagonals; otherwise, the queens could kill each other. In this CSP, the queens are the set of variables, their domains are the squares on the board, and the constraints are the killing restrictions.

csp.js can solve all these problems and provide hooks to visualize the solving process.

Usage
-----

First put the file in your working directory, and then import it.

```
var csp = require('./csp');
// OR
<script src="csp.js"></script>
```

You can call one function, `csp.solve(problem)`, which takes an object. This object should have 4 properties (though two are optional):

* variables: object that holds variable names and variable domains as key-value pairs.
* constraints: an array of constraints where each element is a list of head node, tail node, and constraint function that takes in two values (one for head node and one for tail node) and returns `true` if the constraint is satisfied, and `false` otherwise. The nodes must be the names of the keys in `variables`. For the states coloring problem, `[["CA", "OR", not_equal_function], ["CA", "NV", not_equal_function],...]` would be a valid `constraints` array. **Note:** `["CA", "OR", not_equal_function]` and `["OR", "CA", not_equal_function]` are *different* constraints. If you want the constraint to hold both ways, you **must** include both constraints.
* cb: Optional callback function for visualization. Passed in an object with variable and their assignments as key-value pairs and an object with unassigned variables and their domains as key-value pairs. 
* timeStep: Time between calls to `cb` in milliseconds. Default is 1 millisecond.

`csp.solve(problem)` returns an object with variable names and assigned values. If the problem could not be solved, returns the string `"FAILURE"`.
