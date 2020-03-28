const DEBUG = false;

const OPERATIONS = [
  {
    name: 'add',
    opcode: 1,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      const loc = args[2] + (modes[2] === MODES.RELATIVE ? this.base : 0);
      this.writeValueTo(loc, argVals[0] + argVals[1]);
    },
  },
  {
    name: 'multiply',
    opcode: 2,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      const loc = args[2] + (modes[2] === MODES.RELATIVE ? this.base : 0);
      this.writeValueTo(loc, argVals[0] * argVals[1]);
    },
  },
  {
    name: 'input',
    opcode: 3,
    args: 1,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      const loc = args[0] + (modes[0] === MODES.RELATIVE ? this.base : 0);
      this.writeValueTo(loc, this.input.shift());
    }
  },
  {
    name: 'output',
    opcode: 4,
    args: 1,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      this.output.push(argVals[0]);
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

      const loc = args[2] + (modes[2] === MODES.RELATIVE ? this.base : 0);
      this.writeValueTo(loc, (argVals[0] < argVals[1] ? 1 : 0));
    }
  },
  {
    name: 'equals',
    opcode: 8,
    args: 3,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      const loc = args[2] + (modes[2] === MODES.RELATIVE ? this.base : 0);
      this.writeValueTo(loc, (argVals[0] === argVals[1] ? 1 : 0));
    }
  },
  {
    name: 'adjust-base',
    opcode: 9,
    args: 1,
    func: function(args, modes) {
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));

      const oldBase = this.base;
      this.base += argVals[0];
    }
  },
  {
    name: 'halt',
    opcode: 99,
    args: 0,
    func: function(args, modes) {
      throw new Error(`Somehow a 99 instruction actually got executed. That's not supposed to happen.`);
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
  RELATIVE: 2,
};

const DEFAULT_FLAGS = {
  jumped: false,
}

class IntCode {
  constructor(memory) {
    this.pointer = 0;
    this.memory = memory;
    this.base = 0;

    this.input = [];
    this.output = [];

    this.flags = Object.assign({}, DEFAULT_FLAGS);
  }

  *run() {
    while(true) {
      // this.printDebugLog();
      const { opcode } = this.parseInstruction(this.readValueAt(this.pointer));

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

    const { opcode, operation, modes } = this.parseInstruction(this.readValueAt(this.pointer));

    // grab the right number of args out of memory
    const args = this.memory.slice(this.pointer + 1, this.pointer + operation.args + 1);

    // execute the instruction
    if(DEBUG) {
      console.debug(`About to execute:`);
      const argVals = args.map((el, ix) => this.argValue(el, modes[ix]));
      console.debug({
        name: operation.name,
        instruction: this.readValueAt(this.pointer),
        opcode,
        modes,
        args,
        argVals,
      });
      this.printDebugLog();
    }

    operation.func.call(this, args, modes);

    // advance the pointer (maybe)
    if(!this.flags.jumped) {
      this.pointer = this.pointer + operation.args + 1;
    }
  }

  parseInstruction(instruction) {
    const instructionString = '' + instruction;

    // get the opcode and operation to perform:
    // The last two digits are the opcode. So, for `1002`, the opcode is `02`
    const opcode = +instructionString.substr(-2);
    const operation = OPERATIONS.find(op => op.opcode === opcode);
    if(!operation) {
      throw new Error(`Invalid opcode ${opcode} found at position ${this.pointer} (instruction was ${this.readValueAt(this.pointer)})`);
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

    return { opcode, operation, modes };
  }

  readValueAt(loc) {
    this.allocateMemoryIfNeeded(loc);
    return this.memory[loc];
  }

  writeValueTo(loc, val) {
    this.allocateMemoryIfNeeded(loc);
    this.memory[loc] = val;
  }

  allocateMemoryIfNeeded(loc) {
    if(loc < 0) {
      throw new Error(`Negative memory location (${loc}) requested`);
    }

    if(this.memory.length < (loc + 1)) {
      const oldLength = this.memory.length;
      this.memory.length = loc + 1;
      this.memory.fill(0, oldLength);
    }
  }

  argValue(arg, mode) {
    let value;

    switch(mode) {
      case MODES.POSITION:
        value = this.readValueAt(arg);
        break;
      case MODES.IMMEDIATE:
        value = arg;
        break;
      case MODES.RELATIVE:
        value = this.readValueAt(this.base + arg);
        break;
      default:
        throw new Error(`Invalid mode ${mode} given (arg was ${arg})`);
    }

    return value;
  }

  // TODO: add debug mode
  printDebugLog() {
    this.printMemoryForDebug(this.memory, this.pointer);
    console.debug(`pointer is at ${this.pointer}`);
    console.debug(`relative base is ${this.base}`);
    console.debug(`flags: J:${this.flags.jumped ? 'X' : '-'}`);
    console.debug(`input queue: ${this.input}`);
    console.debug(`output queue: ${this.output}`);
    console.debug('');
  }

  printMemoryForDebug(memory, pointer) {
    const prettyMemory = memory.map((val, loc) => {
      const pointerIndicator = loc === pointer ? '^' : ' ';

      const valStr = '' + val;
      // memory values can be expected to be a max of 16 digits wide
      const padding = Array(18 - valStr.length).fill('.').join('');

      return `${pointerIndicator}${padding}${valStr} `;
    });

    const ENTRIES_PER_ROW = 50;
    const displayRows = [
      // This row displays 1, 2, 3, ... etc. on top of each of the columns
      Array(ENTRIES_PER_ROW).fill(0).map((el, ix) => (' ' + ix + Array(18 - ('' + ix).length).fill(' ').join('') + ' ')),
    ];
    let rowIndex = 0;
    while(rowIndex * ENTRIES_PER_ROW < prettyMemory.length) {
      displayRows.push(prettyMemory.slice(rowIndex * ENTRIES_PER_ROW, rowIndex * ENTRIES_PER_ROW + ENTRIES_PER_ROW));
      rowIndex++;
    }

    displayRows.forEach(row => console.debug(row.join('')));
  }
}

module.exports = IntCode;
