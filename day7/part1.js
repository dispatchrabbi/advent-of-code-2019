const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');
const IntCode = require('../shared/intcode.js');

async function run() {
  const amplifierProgram = await processInput(path.resolve(__dirname, 'input.txt'), ',', true);

  const phaseSequences = getPermutations([0, 1, 2, 3, 4]);
  const signalResults = phaseSequences.map(function(sequence) {
    // console.log(`Running test with ${sequence.join(',')}`);
    const outputSignal = runTest(amplifierProgram, sequence);
    // console.log(`Output was ${outputSignal}`);
    // console.log('');

    return { sequence, outputSignal };
  });

  return signalResults.sort((a, b) => b.outputSignal - a.outputSignal)[0];
}

// stolen from https://stackoverflow.com/a/20871714
function getPermutations(elements) {
  let permutations = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      permutations.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next))
      }
    }
  }

  permute(elements);
  return permutations;
}

const AMPLIFIER_NAMES = 'ABCDE'.split('');
function runTest(program, phaseSequence) {
  const outputSignal = phaseSequence.reduce(function(inputSignal, phase, ix) {
    // console.log(`  Running amplifier ${AMPLIFIER_NAMES[ix]} with input ${inputSignal} set to phase ${phase}`);

    const amplifier = new IntCode(Array.from(program));
    const gen = amplifier.run();
    gen.next(); // start the generator
    gen.next(phase);
    const final = gen.next(inputSignal);
    const output = final.value;

    console.log(`  Output signal from ${AMPLIFIER_NAMES[ix]}: ${output}`);
    return output;
  }, 0);

  return outputSignal;
};

runAndOutput(run);
