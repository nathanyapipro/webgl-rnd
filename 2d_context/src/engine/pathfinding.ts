import { Entity } from "./Entity";
import { Context } from "./Engine";
import { clamp } from "./utils";

export interface Position {
  x: number;
  y: number;
}

export interface Node extends Position {
  parent?: Node;
  value: number;
  f: number;
  g: number;
}

export interface Pathfinding {
  tileSize: number;
  world: number[][];
  worldWidth: number;
  worldHeight: number;
}

export function initWorld(pathfinding: Pathfinding) {
  pathfinding.world = [] as number[][];
  for (let i = -1; i < pathfinding.worldWidth + 1; i++) {
    pathfinding.world[i] = [];
    for (let j = -1; j < pathfinding.worldHeight + 1; j++) {
      pathfinding.world[i][j] = 0;
    }
  }
}

export function updateBoxInWorld(
  cxt: CanvasRenderingContext2D,
  pathfinding: Pathfinding,
  entity: Entity,
  weight: number
) {
  const { x, y } = entity.origin(cxt);

  const hitbox = [
    {
      x: x - 10,
      y: y - 10,
    },
    {
      x: x + entity.meta.w + 20,
      y: y + entity.meta.h + 20,
    },
  ];
  const { x: x1, y: y1 } = convertToWorldCoordinates(pathfinding, hitbox[0]);
  const { x: x2, y: y2 } = convertToWorldCoordinates(pathfinding, hitbox[1]);

  for (let i = x1; i < x2; i++) {
    for (let j = y1; j < y2; j++) {
      pathfinding.world[i][j] = weight;
    }
  }
}

export function updateConnectorInWorld(
  pathfinding: Pathfinding,
  path: Position[],
  weight: number
) {
  path.forEach(({ x, y }) => {
    pathfinding.world[x][y] = +weight;
  });
}

export function convertToWorldCoordinates(
  pathfinding: Pathfinding,
  p: Position
): Position {
  return {
    x: clamp(
      Math.floor(p.x / pathfinding.tileSize - 1),
      -1,
      pathfinding.worldWidth
    ),
    y: clamp(
      Math.floor(p.y / pathfinding.tileSize - 1),
      -1,
      pathfinding.worldHeight
    ),
  };
}

export function convertToCanvasCoordinates(
  pathfinding: Pathfinding,
  p: Position
): Position {
  return {
    x: clamp(
      p.x * pathfinding.tileSize + pathfinding.tileSize * 1,
      0,
      pathfinding.tileSize * (pathfinding.worldWidth - 1)
    ),
    y: clamp(
      p.y * pathfinding.tileSize + pathfinding.tileSize * 1,
      0,
      pathfinding.tileSize * (pathfinding.worldHeight - 1)
    ),
  };
}

export function distance(
  pathfinding: Pathfinding,
  node: Position,
  goal: Position
) {
  return (
    Math.abs(node.x - goal.x) +
    Math.abs(node.y - goal.y) +
    pathfinding.world[node.x][node.y] * 2
  );
}

export function canWalkHere(pathfinding: Pathfinding, p: Position) {
  return (
    pathfinding.world[p.x] !== null &&
    pathfinding.world[p.x][p.y] !== null &&
    pathfinding.world[p.x][p.y] < 5
  );
}

export function neighbours(pathfinding: Pathfinding, p: Position) {
  const N = p.y - 1,
    S = p.y + 1,
    E = p.x + 1,
    W = p.x - 1,
    myN = N > -1 && canWalkHere(pathfinding, { x: p.x, y: N }),
    myS =
      S < pathfinding.worldHeight && canWalkHere(pathfinding, { x: p.x, y: S }),
    myE =
      E < pathfinding.worldWidth && canWalkHere(pathfinding, { x: E, y: p.y }),
    myW = W > -1 && canWalkHere(pathfinding, { x: W, y: p.y }),
    result: Position[] = [];
  if (myN) result.push({ x: p.x, y: N });
  if (myE) result.push({ x: E, y: p.y });
  if (myS) result.push({ x: p.x, y: S });
  if (myW) result.push({ x: W, y: p.y });
  return result;
}

export function createNode(
  pathfinding: Pathfinding,
  parent: Node | undefined,
  point: Position
) {
  return {
    // pointer to another Node object
    parent: parent,
    // array index of this Node in the world linear array
    value: point.x + point.y * pathfinding.worldHeight,
    // the location coordinates of this Node
    x: point.x,
    y: point.y,
    // the distanceFunction cost to get
    // TO this Node from the START
    f: 0,
    // the distanceFunction cost to get
    // from this Node to the GOAL
    g: 0,
  };
}

export function getPath(
  pathfinding: Pathfinding,
  start: Position,
  end: Position
) {
  let startNode = createNode(pathfinding, undefined, start);
  let endNode = createNode(pathfinding, undefined, end);
  // create an array that will contain all world cells
  let aStar: boolean[] = new Array(
    pathfinding.worldHeight * pathfinding.worldWidth
  );
  // list of currently open Nodes
  let openNodes: Node[] = [startNode];
  // list of closed Nodes
  let closedNodes: Node[] = [];
  // list of the final output array
  let result: Position[] = [];
  // reference to a Node (that is nearby)
  let myNeighbours: Position[];
  // reference to a Node (that we are considering now)
  let myNode: Node;
  // reference to a Node (that starts a path in question)
  let myPath: Node | undefined;
  // temp integer letiables used in the calculations
  let length: number, max: number, min: number, i: number, j: number;
  // iterate through the open list until none are left
  while ((length = openNodes.length)) {
    max = pathfinding.worldHeight * pathfinding.worldWidth;
    min = -1;
    for (i = 0; i < length; i++) {
      if (openNodes[i].f < max) {
        max = openNodes[i].f;
        min = i;
      }
    }
    // grab the next node and remove it from openNodes array
    myNode = openNodes.splice(min, 1)[0];
    // is it the destination node?
    if (myNode.value === endNode.value) {
      myPath = closedNodes[closedNodes.push(myNode) - 1];
      do {
        result.push({ x: myPath.x, y: myPath.y });
      } while ((myPath = myPath.parent));
      // clear the working arrays
      // console.log(openNodes);
      aStar = closedNodes = openNodes = [];
      // we want to return start to finish
      result.reverse();
    } // not the destination
    else {
      // find which nearby nodes are walkable
      myNeighbours = neighbours(pathfinding, myNode);
      // console.log(myNeighbours);
      // test each one that hasn't been tried already
      for (i = 0, j = myNeighbours.length; i < j; i++) {
        myPath = createNode(pathfinding, myNode, myNeighbours[i]);
        if (!aStar[myPath.value]) {
          // estimated cost of this particular route so far
          myPath.g = myNode.g + distance(pathfinding, myNeighbours[i], myNode);
          // estimated cost of entire guessed route to the destination
          myPath.f = myPath.g + distance(pathfinding, myNeighbours[i], endNode);
          // remember this new path for testing above
          openNodes.push(myPath);
          // mark this node in the world graph as visited
          aStar[myPath.value] = true;
        }
      }
      // remember this route as having no more untested options
      closedNodes.push(myNode);
    }
  } // keep iterating until until the Open list is empty

  return result;
}
