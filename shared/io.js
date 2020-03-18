const process = require('process');

const { promisify } = require('util');
const { readFile } = require('fs');
const readFileAsPromised = promisify(readFile);

async function processInput(filepath, splitOn = '\n', castToNumber = false) {
  try {
    let contents = await readFileAsPromised(filepath, 'utf-8');

    if(splitOn !== null) {
      contents = contents.split(splitOn).filter(text => text.length > 0);

      if(castToNumber) {
        contents = contents.map(x => +x);
      }
    }

    return contents;
  } catch (ex) {
    console.error(`Error reading file ${filepath}: ${ex.message}`);
    throw ex; // the program should probably crash at this point, but we'll let the code outside this decide that
  }
}

function runAndOutput(func) {
  func()
    .then(function(output) { console.log(output); })
    .catch(function(err) { console.error(err); });
}

module.exports = {
  processInput,
  runAndOutput
};
