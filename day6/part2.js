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

  // get chains:
  const comToYou = getFullChain(nodes['YOU']).reverse(); // COM to YOU
  const comToSan = getFullChain(nodes['SAN']).reverse(); // COM to SAN

  // combine them into a direct path:
  const youToSan = fuseChains(comToYou, comToSan);

  // take the length of the path, subtract 1 for fenceposts -> links, and subtract 2 (one for your link and one for SAN's)
  return youToSan.length - 3;
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

function getFullChain(node, chainSoFar = []) {
  chainSoFar.push(node.name);

  return node.parent ? getFullChain(node.parent, chainSoFar) : chainSoFar;
}

function fuseChains(chain1, chain2) {
  let lastLink = null;
  while(chain1[0] === chain2[0]) {
    lastLink = chain1.shift();
    chain2.shift();
  }

  return chain1.reverse().concat(lastLink, chain2);
}

function getDistanceTo(node, targetName) {
  return 1 + (node.name === targetName ? -1 : getDistance(node.parent));
}

runAndOutput(run);
