const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

// Should be false during testing
const RESTORE_1202_ERROR_CONDITION = true;

async function run() {
  const memory = (await processInput(path.resolve(__dirname, 'input.txt'), ',')).map(x => +x);
  let pointer = 0;

  if(RESTORE_1202_ERROR_CONDITION) {
    memory[1] = 12;
    memory[2] = 2;
  }

  while(true) {
    // console.log(memory.join(','));

    if(memory[pointer] == 99) {
      break;
    }

    if(memory[pointer] == 1) {
      memory[memory[pointer + 3]] = memory[memory[pointer + 1]] + memory[memory[pointer + 2]];
      pointer +=4;
      continue;
    }

    if(memory[pointer] == 2) {
      memory[memory[pointer + 3]] = memory[memory[pointer + 1]] * memory[memory[pointer + 2]];
      pointer +=4;
      continue;
    }

    throw new Error(`Invalid opcode ${memory[pointer]} found at position ${pointer}`);
  }

  return memory[0];
}

runAndOutput(run);
