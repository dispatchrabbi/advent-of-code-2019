const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

const PASSWORD_LENGTH = 6;

async function run() {
  const bounds = (await processInput(path.resolve(__dirname, 'input.txt'), '-')).map(x => +x);

  let totalPossiblePasswords = 0;
  for(let candidate = bounds[0]; candidate <= bounds[1]; ++candidate) {
    if(isValidPassword(candidate.toString())) {
      totalPossiblePasswords++;
    }
  }

  return totalPossiblePasswords;
}

function isValidPassword(candidate) {
  if(candidate.length !== PASSWORD_LENGTH) {
    return false;
  }

  const digits = candidate.split('').map(n => +n);
  let hasDouble = false;
  let neverDecreases = true;

  for(let i = 0; i < PASSWORD_LENGTH - 1; ++i) {
    if(digits[i] > digits[i + 1]) {
      neverDecreases = false;
      break;
    }

    if(digits[i] === digits[i + 1]) {
      hasDouble = true;
    }
  }

  return hasDouble && neverDecreases;
}

runAndOutput(run);
