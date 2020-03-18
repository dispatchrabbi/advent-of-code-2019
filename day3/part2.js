const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

const intersect = require('./intersect.js');

async function run() {
  const routes = await processInput(path.resolve(__dirname, 'input.txt'));
  const segments = routes.map(routeToSegments);
  segments.forEach(s => console.log(s));
  // filter out (0, 0), since all the routes will intersect there
  const intersections = findIntersections(segments[0], segments[1]).filter(point => point.x != 0 && point.y != 0);
  console.log(intersections);
  const distances = intersections.map(function(intersection) {
    return calculateDistanceTo(intersection, segments[0]) + calculateDistanceTo(intersection, segments[1]);
  });
  console.log(distances);
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

function calculateDistanceTo(point, route) {
  let total = 0;
  for (const segment of route) {
    if(segmentContainsPoint(segment, point)) {
      total += calculateManhattanDistance(segment[0], point);
      break;
    } else {
      total += calculateManhattanDistance(segment[0], segment[1]);
    }
  }

  return total;
}

function calculateManhattanDistance(point1, point2) {
  return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

function segmentContainsPoint(segment, point) {
  if(segment[0].x === segment[1].x && point.x === segment[0].x) {
    const minY = Math.min(segment[0].y, segment[1].y);
    const maxY = Math.max(segment[0].y, segment[1].y);
    return minY <= point.y && point.y <= maxY;
  } else if(segment[0].y === segment[1].y && point.y === segment[0].y) {
    const minX = Math.min(segment[0].x, segment[1].x);
    const maxX = Math.max(segment[0].x, segment[1].x);
    return minX <= point.x && point.x <= maxX;
  } else {
    return false;
  }
}

runAndOutput(run);
