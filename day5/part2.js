const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');
const IntCode = require('../shared/intcode.js');

async function run() {
  const initialMemoryState = await processInput(path.resolve(__dirname, 'input.txt'), ',', true);

  const THERMAL_RADIATOR_CONTROLLER_DIAGNOSTIC_ID = 5;
  const computer = new IntCode(initialMemoryState);
  const output = computer.run([THERMAL_RADIATOR_CONTROLLER_DIAGNOSTIC_ID])

  return output;
}

runAndOutput(run);
