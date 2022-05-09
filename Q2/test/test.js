const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // We start by creating the proof and public signals from an input..
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // prints the correct statement of the proof.
        console.log('1x2 =',publicSignals[0]);

        // converts the proof and public signals to BigInt.
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // generates call parameters that are to be called
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        // the calldata is split into an array
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // assigns the calldata array's contents to the corresponding input
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // checks the proof using the inputs. If the true is valid, it returns true.
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //  assigned false values to determine if the verifyProof() function will correctly validate the proof
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]

        // Verifies the proof. Because of the invalid parameters, it should return false.
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    // this runs the same steps as the previous code block
    
    let verifier;
    let Verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"in1": 5, "in2": 7, "in3": 8}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey");

        console.log("5x7x8 =", publicSignals[0]);

        const editedProof = unstringifyBigInts(proof);
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];

        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here

        // the Contract Factory for the smart contract is created in the next line.
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        // the smart contract is deployed.
        verifier = await Verifier.deploy();
        // verifies the smart contract's deployment.
        await verifier.deployed();

    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"in1": 5, "in2": 7, "in3": 9}, "contracts/circuits/_plonk/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/_plonk/circuit_final.zkey");

        console.log("5x7x9 =", publicSignals[0]);

        const editedProof = unstringifyBigInts(proof);
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(",");

        // this line converts argv[1] to BigInt
        const argv4 = [BigInt(argv[1])];
        
        // this line verifies the proof.
        expect( await verifier.verifyProof(argv[0], argv4)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = 0x7980;
        let b = [4];

        expect( await verifier.verifyProof(a, b)).to.be.false;
    });
});