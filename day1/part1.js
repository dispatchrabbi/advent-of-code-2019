const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const masses = await processInput(path.resolve(__dirname, 'input.txt'));
  // Convert all the masses to fuel requirements, then add them
  const total = masses.map(mass => calculateFuel(+mass)).reduce((acc, el) => acc + el, 0);
  return total;
}

function calculateFuel(mass) {
  return Math.floor(mass / 3) - 2;
}

runAndOutput(run);
