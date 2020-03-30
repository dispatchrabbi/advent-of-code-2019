const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const asteroidField = (await processInput(path.resolve(__dirname, 'input.txt'))).map(line => line.trim().split(''));
  const fieldWidth = asteroidField[0].length;
  const fieldHeight = asteroidField.length;

  const asteroidLocations = [];
  for(let y = 0; y < fieldHeight; ++y) {
    for(let x = 0; x < fieldWidth; ++x) {
      if(asteroidField[y][x] === '#') {
        asteroidLocations.push({x, y});
      }
    }
  }

  const asteroidCounts = asteroidLocations.map(asteroid => ({
    x: asteroid.x,
    y: asteroid.y,
    count: detectAsteroids(asteroid, asteroidLocations, fieldWidth, fieldHeight).length
  }));

  const winner = asteroidCounts.reduce((winner, asteroid) => asteroid.count > winner.count ? asteroid : winner, { count: -Infinity });

  return winner;
}

function detectAsteroids(base, asteroidLocations) {
  const detectedAsteroids = asteroidLocations.map(function(asteroid) {
    const xDiff = asteroid.x - base.x;
    const yDiff = asteroid.y - base.y;

    const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
    const angle = Math.atan2(yDiff, xDiff);

    return { x: asteroid.x, y: asteroid.y, xDiff, yDiff, distance, angle };
  })
  .sort((a, b) => a.angle === b.angle ? b.distance - a.distance : b.angle - a.angle)
  .filter((asteroid, ix, arr) => undefined === arr.slice(0, ix).find(a => a.angle === asteroid.angle));

  return detectedAsteroids;
}

runAndOutput(run);
