const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');
const IntCode = require('../shared/intcode.js');


async function run() {
  const initialMemoryState = await processInput(path.resolve(__dirname, 'input.txt'), ',', true);

  const DESIRED_OUTPUT = 19690720;

  // noun and verb can be anywhere between 0 and 99...
  // time for some brute force!
  let noun, verb;
  outer: for(noun = 0; noun <= 99; ++noun) {
    for(verb = 0; verb <= 99; ++verb) {
      const initializedMemory = Array.from(initialMemoryState);
      initializedMemory[1] = noun;
      initializedMemory[2] = verb;

      const intcode = new IntCode(initializedMemory);
      intcode.run();

      // console.log(`Tried ${noun} and ${verb}, got ${after}`);
      if(intcode.memory[0] === DESIRED_OUTPUT) {
        break outer;
      }
    }
  }

  return (100 * noun) + verb;
}

runAndOutput(run);
