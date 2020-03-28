const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');
const IntCode = require('../shared/intcode.js');

async function run() {
  const program = await processInput(path.resolve(__dirname, 'input.txt'), ',', true);
  const computer = new IntCode(Array.from(program));
  const gen = computer.run();
  gen.next(); // start the generator
  const output = gen.next(2); // input `1` for test mode

  return [output.value].concat(computer.output);
}

runAndOutput(run);
