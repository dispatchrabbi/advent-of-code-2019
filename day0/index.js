const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const input = await processInput(path.resolve(__dirname, 'input.txt'), null);
  return input;
}

runAndOutput(run);
