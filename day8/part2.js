const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const pixels = await processInput(path.resolve(__dirname, 'input.txt'), '', true);

  const IMAGE_WIDTH = 25;
  const IMAGE_HEIGHT = 6;
  const image = parseSifData(pixels, IMAGE_WIDTH, IMAGE_HEIGHT);

  return renderSifImage(image);
}

const COLORS = {
  BLACK: 0,
  WHITE: 1,
  TRANSPARENT: 2,
};

function parseSifData(pixels, width, height) {
  const layerArea = width * height;
  const layers = [];
  for(let i = 0; i < pixels.length; i += layerArea) {
    const layer = pixels.slice(i, i + layerArea);
    layers.push(layer);
  }

  const stacked = layers.reverse().reduce(stackLayers, Array(layerArea).fill(COLORS.TRANSPARENT));

  const rows = [];
  for(let j = 0; j < layerArea; j += width) {
    const row = stacked.slice(j, j + width);
    rows.push(row);
  }

  return rows;
}

function stackLayers(bottomLayer, topLayer) {
  return topLayer.map((color, ix) => color === COLORS.TRANSPARENT ? bottomLayer[ix] : color);
}

const PIXELS = [ '█', ' ', '░' ];
function renderSifImage(image) {
  return image.map(row => row.map(px => PIXELS[px]).join('')).join('\n');
}

runAndOutput(run);
