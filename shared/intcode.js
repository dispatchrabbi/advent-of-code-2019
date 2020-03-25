const OPERATIONS = [
  {
    name: 'add',
    opcode: 1,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      this.memory[args[2]] = argVals[0] + argVals[1];
    },
  },
  {
    name: 'multiply',
    opcode: 2,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      this.memory[args[2]] = argVals[0] * argVals[1];
    },
  },
  {
    name: 'input',
    opcode: 3,
    args: 1,
    func: function(args, modes) {
      this.memory[args[0]] = this.read();
    }
  },
  {
    name: 'output',
    opcode: 4,
    args: 1,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      this.write(argVals[0]);
    }
  },
  {
    name: 'jump-if-true',
    opcode: 5,
    args: 2,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      if(argVals[0] !== 0) {
        this.pointer = argVals[1];
        this.flags.jumped = true;
      }
    }
  },
  {
    name: 'jump-if-false',
    opcode: 6,
    args: 2,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      if(argVals[0] === 0) {
        this.pointer = argVals[1];
        this.flags.jumped = true;
      }
    }
  },
  {
    name: 'less-than',
    opcode: 7,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      this.memory[args[2]] = (argVals[0] < argVals[1] ? 1 : 0);
    }
  },
  {
    name: 'equals',
    opcode: 8,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      this.memory[args[2]] = (argVals[0] === argVals[1] ? 1 : 0);
    }
  },
];

// Not all opcodes, just ones that require functionality outside of computation
const OPCODES = {
  HALT: 99,
  INPUT: 3,
  OUTPUT: 4,
};

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1,
};

const DEFAULT_FLAGS = {
  jumped: false,
}

class IntCode {
  constructor(memory) {
    this.pointer = 0;
    this.memory = memory;

    this.input = [];
    this.output = [];

    this.flags = Object.assign({}, DEFAULT_FLAGS);
  }

  *run() {
    while(true) {
      // this.printDebugLog();
      const opcode = this.memory[this.pointer];

      if(opcode === OPCODES.HALT) {
        return this.output.shift();
      } else if(opcode === OPCODES.INPUT) {
        const nextOutput = this.output.shift();
        const nextInput = yield nextOutput;
        this.input.push(nextInput);
      }

      this.resetFlags();
      this.executeNextInstruction();
    }
  }

  resetFlags() {
    Object.assign(this.flags, DEFAULT_FLAGS);
  }

  executeNextInstruction() {

    const instructionCode = this.memory[this.pointer];

    const instructionString = '' + instructionCode;

    // get the opcode and operation to perform:
    // The last two digits are the opcode. So, for `1002`, the opcode is `02`
    const opcode = +instructionString.substr(-2);
    const operation = OPERATIONS.find(op => op.opcode === opcode);
    if(!operation) {
      throw new Error(`Invalid opcode ${opcode} found at position ${this.pointer} (instruction was ${this.memory[this.pointer]})`);
    }

    // get the parameter modes:
    // The parameter modes go from *right to left* starting with the hundreds digit and any leading 0s are dropped
    // So, for `1002`, we expect three args (because it's a multiply instruction). Going right to left, we get:
    // - the first argument is in position mode, indicated by the 0 in the hundreds place
    // - the second argument is in immediate mode, indicated by the 1 in the thousands place
    // - the third argument is in position mode, indicated by a missing leading 0 that would be in the ten-thousands place
    const modes = instructionString.substr(0, instructionString.length - 2).split('').reverse().map(i => +i);
    // add in any missing leading zeroes
    if(modes.length < operation.args) {
      const originalLength = modes.length;
      modes.length = operation.args;
      modes.fill(0, originalLength);
    }

    // grab the right number of args out of memory
    const args = this.memory.slice(this.pointer + 1, this.pointer + operation.args + 1);

    // execute the instruction
    operation.func.call(this, args, modes);

    // advance the pointer (maybe)
    if(!this.flags.jumped) {
      this.pointer = this.pointer + operation.args + 1;
    }
  }

  argValue(arg, mode) {
    let value;

    switch(mode) {
      case MODES.POSITION:
        value = this.memory[arg];
        break;
      case MODES.IMMEDIATE:
        value = arg;
        break;
      default:
        throw new Error(`Invalid mode ${mode} given (arg was ${arg})`);
    }

    return value;
  }

  read() {
    const val = this.input.shift();
    // console.log(`Reading from input: ${val}`);
    return val;
  }

  write(val) {
    // console.log(`Writing to output: ${val}`);
    this.output.push(val);
  }

  // TODO: add debug mode
  printDebugLog() {
    this.printMemoryForDebug(this.memory, this.pointer);
    console.debug(`pointer is at ${this.pointer}`);
    console.debug(`flags: J:${this.flags.jumped ? 'X' : '-'}`);
    console.debug(`input queue: ${this.input}`);
    console.debug(`output queue: ${this.output}`);
    console.debug('');
  }

  printMemoryForDebug(memory, pointer) {
    const prettyMemory = memory.map((val, loc) => {
      const pointerIndicator = loc === pointer ? '^' : ' ';

      const valStr = '' + val;
      // memory values can be expected to be a max of 6 digits wide
      console.log({loc, val, len: valStr.length});
      const padding = Array(6 - valStr.length).fill('.').join('');

      return `${pointerIndicator}${padding}${valStr} `;
    });

    const displayRows = [];
    let rowIndex = 0;
    const ENTRIES_PER_ROW = 10;
    while(rowIndex * ENTRIES_PER_ROW < prettyMemory.length) {
      displayRows.push(prettyMemory.slice(rowIndex * ENTRIES_PER_ROW, rowIndex * ENTRIES_PER_ROW + ENTRIES_PER_ROW));
      rowIndex++;
    }

    displayRows.forEach(row => console.debug(row.join('')));
  }
}

module.exports = IntCode;
