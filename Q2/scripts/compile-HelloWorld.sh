#!/bin/bash

cd contracts/circuits

mkdir HelloWorld

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling HelloWorld.circom..."

# compile circuit

pwd
ls
circom HelloWorld.circom --r1cs --wasm --sym
snarkjs r1cs info HelloWorld.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup HelloWorld.r1cs powersOfTau28_hez_final_10.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier circuit_final.zkey ../HelloWorldVerifier.sol

# generate solidity contract
snarkjs zkey export solidityverifier HelloWorld/circuit_final.zkey ../HelloWorldVerifier.sol

cd ../..