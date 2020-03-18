const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const masses = await processInput(path.resolve(__dirname, 'input.txt'));
  // Convert all the masses to fuel requirements, then add them
  const total = masses.map(mass => calculateFuelRecursively(+mass)).reduce((acc, el) => acc + el, 0);
  return total;
}

function calculateFuelRecursively(mass) {
  const fuel = Math.floor(mass / 3) - 2;

  if(fuel <= 0) {
    return 0;
  }

  return fuel + calculateFuelRecursively(fuel);
}

runAndOutput(run);
