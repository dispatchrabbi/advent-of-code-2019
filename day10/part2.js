const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const asteroidField = (await processInput(path.resolve(__dirname, 'input.txt'))).map(line => line.trim().split(''));
  const fieldWidth = asteroidField[0].length;
  const fieldHeight = asteroidField.length;

  const ASTEROID_BASE = { x: 20, y: 21 };

  const asteroidLocations = [];
  for(let y = 0; y < fieldHeight; ++y) {
    for(let x = 0; x < fieldWidth; ++x) {
      if(asteroidField[y][x] === '#' && !(x === ASTEROID_BASE.x && y === ASTEROID_BASE.y)) {
        asteroidLocations.push({x, y});
      }
    }
  }

  const destructionOrder = orderAsteroidsForDestruction(ASTEROID_BASE, asteroidLocations);

  return destructionOrder[200 - 1];
}

function orderAsteroidsForDestruction(base, asteroidLocations) {
  return asteroidLocations.map(function(asteroid) {
    const xDiff = asteroid.x - base.x;
    const yDiff = asteroid.y - base.y;

    const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
    // this angle is clockwise from north
    let angle = Math.atan2(yDiff, xDiff) + Math.PI / 2;
    if(angle < 0) {
      angle += Math.PI * 2;
    }

    return Object.assign({}, asteroid, { angle, distance });
  })
  .sort((a, b) => a.angle === b.angle ? a.distance - b.distance : a.angle - b.angle)
  .map(function(asteroid, ix, arr) {
    const numberOfPreviousAsteroidsAtTheSameAngle = arr.slice(0, ix).filter(a => a.angle === asteroid.angle).length;
    return Object.assign({}, asteroid, { angle: asteroid.angle + numberOfPreviousAsteroidsAtTheSameAngle * 2 * Math.PI});
  })
  .sort((a, b) => a.angle - b.angle);
}

runAndOutput(run);
