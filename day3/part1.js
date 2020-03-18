const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

const intersect = require('./intersect.js');

async function run() {
  const routes = await processInput(path.resolve(__dirname, 'input.txt'));
  const segments = routes.map(routeToSegments);
  // segments.forEach(s => console.log(s));
  // filter out (0, 0), since all the routes will intersect there
  const intersections = findIntersections(segments[0], segments[1]).filter(point => point.x != 0 && point.y != 0);
  // console.log(intersections);
  const distances = intersections.map(calculateManhattanDistanceToOrigin);
  // console.log(distances);
  return Math.min(...distances);
}

function routeToSegments(route) {
  const directions = route.split(',');
  const segments = [];
  let lastPoint = { x: 0, y: 0 };

  directions.forEach(function(direction) {
    const heading = direction.substr(0, 1);
    const distance = +direction.substr(1);

    const nextPoint = { x: lastPoint.x, y: lastPoint.y };
    switch(heading) {
      case 'U':
        nextPoint.y += distance;
        break;
      case 'D':
        nextPoint.y -= distance;
        break;
      case 'L':
        nextPoint.x -= distance;
        break;
      case 'R':
        nextPoint.x += distance;
        break;
      default:
        throw new Error(`Invalid heading in direction ${direction}`);
    }

    segments.push([lastPoint, nextPoint]);
    lastPoint = nextPoint;
  });

  return segments;
}

function findIntersections(route1, route2) {
  const intersections = [];
  route1.forEach(function(segment1) {
    route2.forEach(function(segment2) {
      const intersection = intersect(
        segment1[0].x, segment1[0].y,
        segment1[1].x, segment1[1].y,
        segment2[0].x, segment2[0].y,
        segment2[1].x, segment2[1].y,
      );

      if(intersection) {
        intersections.push(intersection);
      }
    });
  });

  return intersections;
}

function calculateManhattanDistanceToOrigin(point) {
  return Math.abs(point.x) + Math.abs(point.y);
}

runAndOutput(run);
