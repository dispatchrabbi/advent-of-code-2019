const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');
const IntCode = require('../shared/intcode.js');

async function run() {
  const initialMemoryState = await processInput(path.resolve(__dirname, 'input.txt'), ',', true);

  const AC_UNIT_DIAGNOSTIC_ID = 1;
  const computer = new IntCode(initialMemoryState);
  const output = computer.run([AC_UNIT_DIAGNOSTIC_ID])

  return output;
}

runAndOutput(run);
