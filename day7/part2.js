const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');
const IntCode = require('../shared/intcode.js');

async function run() {
  const amplifierProgram = await processInput(path.resolve(__dirname, 'input.txt'), ',', true);

  const phaseSequences = getPermutations([5, 6, 7, 8, 9]);
  const signalResults = phaseSequences.map(function(sequence) {
    console.log(`Running test with ${sequence.join(',')}`);
    const outputSignal = runTest(amplifierProgram, sequence);
    console.log(`Output was ${outputSignal}`);
    console.log('');

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

function runTest(program, phaseSequence) {
  const amplifiers = 'ABCDE'.split('').map(function(name, ix) {
    const amplifier = new IntCode(Array.from(program));
    const gen = amplifier.run();
    gen.next(); // start the generator

    const phase = phaseSequence[ix];
    // console.log(`  Setting amp ${name} to phase ${phase}`);
    gen.next(phase);
    // at this point, the next call to gen.next() should include the input signal from the previous amplifier

    return { name, gen };
  });

  let inputSignal = 0;
  let outputStatus;
  while(amplifiers.length > 0) {
    // console.log(`  Amp order: ${amplifiers.map(a => a.name).join(',')}`);
    // console.log(`  Feeding amp ${amplifiers[0].name} the input ${inputSignal}`);
    outputStatus = amplifiers[0].gen.next(inputSignal);
    // console.log(`  Got output ${outputStatus.value} from amp ${amplifiers[0].name}`);

    inputSignal = outputStatus.value;
    // if this amp has halted, remove it from the group; otherwise, stick it on the end
    if(outputStatus.done) {
      amplifiers.shift();
    } else {
      amplifiers.push(amplifiers.shift());
    }
  }

  return outputStatus.value;
};

runAndOutput(run);
