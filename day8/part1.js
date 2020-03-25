const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const pixels = await processInput(path.resolve(__dirname, 'input.txt'), '', true);

  const IMAGE_WIDTH = 25;
  const IMAGE_HEIGHT = 6;
  const layers = parseSifData(pixels, IMAGE_WIDTH, IMAGE_HEIGHT);

  // find the layer with the most 0s
  const winner = layers.reduce(function(winner, layer, index) {
    const count = layer.filter(pixel => pixel === 0).length;
    return count < winner.count ? { index, count } :  winner;
  }, { index: -1, count: Infinity });

  // find the number of 1s and the number of 2s and multiply them together
  const numberOf1s = layers[winner.index].filter(p => p === 1).length;
  const numberOf2s = layers[winner.index].filter(p => p === 2).length;

  return numberOf1s * numberOf2s;
}

function parseSifData(pixels, width, height) {
  const layerArea = width * height;
  let layers = [];
  for(let i = 0; i < pixels.length; i += layerArea) {
    const layer = pixels.slice(i, i + layerArea);
    layers.push(layer);
  }

  return layers;
}

runAndOutput(run);
