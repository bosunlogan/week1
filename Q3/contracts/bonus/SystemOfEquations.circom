pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include ""; // hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
}
component multi = matMul(n,n,1);

for (var i =0; i < n; i++){
    for (var j = 0; j < n; j++){
        multi.a[i][j] <== A[i][j];
    }
    multi.b[1][0] <== x[i];
}

component math1 = matElemSum(n, 1);
component math2 = matElemSum(n, 1);

for (var i =0; i<n; i++){
    math1.a[i][0] <== multi.out[i][o];
    math2.a[i][0] <== b[i];
}