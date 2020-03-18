const path = require('path');
const { processInput, runAndOutput } = require('../shared/io.js');

async function run() {
  const orbitLinks = await processInput(path.resolve(__dirname, 'input.txt'));

  const nodes = {
    'COM': makeNewNode('COM'),
  };

  // build the tree
  orbitLinks.forEach(function(link) {
    const [ parentName, nodeName ] = link.split(')');
    addNode(nodes, nodeName, parentName);
  })

  // count steps back to COM for each node
  // I'm sure there's some cool algorithm for this, but I'm just gonna brute force it
  const distances = Object.values(nodes).map(getDistance);

  return distances.reduce((total, distance) => total + distance, 0);
}

function addNode(nodes, nodeName, parentName) {
  const node = nodes[nodeName] ? nodes[nodeName] : makeNewNode(nodeName);
  nodes[nodeName] = node;

  const parentNode = nodes[parentName] ? nodes[parentName] : makeNewNode(parentName);
  nodes[parentName] = parentNode;
  node.parent = parentNode;
}

function makeNewNode(name) {
  return { name, parent: null };
}

function getDistance(node) {
  return 1 + (node.parent ? getDistance(node.parent) : -1)
}

runAndOutput(run);
