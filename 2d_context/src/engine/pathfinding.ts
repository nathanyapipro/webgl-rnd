import { Entity } from "./entities";
import { clamp } from "./helpers/math";
import { Context } from "./Engine";

export const PATHFINDING_TILE_SIZE = 10;

export interface Position {
  x: number;
  y: number;
}

export interface Tile extends Position {
  parent?: Tile;
  value: number;
  f: number;
  g: number;
}

export class Pathfinding {
  tileSize: number;
  world: number[][];
  worldWidth: number;
  worldHeight: number;

  constructor(ctx: Context) {
    this.tileSize = PATHFINDING_TILE_SIZE;
    this.worldHeight = Math.floor(ctx.height / PATHFINDING_TILE_SIZE);
    this.worldWidth = Math.floor(ctx.width / PATHFINDING_TILE_SIZE);
    this.world = [];
    this.initWorld();
  }

  initWorld() {
    this.world = [] as number[][];
    for (let i = -1; i < this.worldWidth + 1; i++) {
      this.world[i] = [];
      for (let j = -1; j < this.worldHeight + 1; j++) {
        this.world[i][j] = 0;
      }
    }
  }

  updateEntityCollisionRect(entity: Entity, weight: number) {
    const { x, y, w, h } = entity.getCollisionRect();

    const hitbox = [
      {
        x: x,
        y: y,
      },
      {
        x: x + w,
        y: y + h,
      },
    ];
    const { x: x1, y: y1 } = this.toWorldPosition(hitbox[0]);
    const { x: x2, y: y2 } = this.toWorldPosition(hitbox[1]);

    for (let i = x1; i < x2; i++) {
      for (let j = y1; j < y2; j++) {
        this.world[i][j] = weight;
      }
    }
  }

  updateConnectorCollisionPath(path: Position[], weight: number) {
    path.forEach(({ x, y }) => {
      this.world[x][y] = +weight;
    });
  }

  toWorldPosition(p: Position): Position {
    return {
      x: clamp(Math.floor(p.x / this.tileSize - 1), -1, this.worldWidth),
      y: clamp(Math.floor(p.y / this.tileSize - 1), -1, this.worldHeight),
    };
  }

  toCanvasPosition(p: Position): Position {
    return {
      x: clamp(
        p.x * this.tileSize + this.tileSize * 1,
        0,
        this.tileSize * (this.worldWidth - 1)
      ),
      y: clamp(
        p.y * this.tileSize + this.tileSize * 1,
        0,
        this.tileSize * (this.worldHeight - 1)
      ),
    };
  }

  distance(node: Position, goal: Position) {
    return (
      Math.abs(node.x - goal.x) +
      Math.abs(node.y - goal.y) +
      this.world[node.x][node.y]
    );
  }

  canWalkHere(p: Position) {
    return (
      this.world[p.x] !== null &&
      this.world[p.x][p.y] !== null &&
      this.world[p.x][p.y] < 5
    );
  }

  neighbours(p: Position) {
    const N = p.y - 1,
      S = p.y + 1,
      E = p.x + 1,
      W = p.x - 1,
      myN = N > -1 && this.canWalkHere({ x: p.x, y: N }),
      myS = S < this.worldHeight && this.canWalkHere({ x: p.x, y: S }),
      myE = E < this.worldWidth && this.canWalkHere({ x: E, y: p.y }),
      myW = W > -1 && this.canWalkHere({ x: W, y: p.y }),
      result: Position[] = [];
    if (myN) result.push({ x: p.x, y: N });
    if (myE) result.push({ x: E, y: p.y });
    if (myS) result.push({ x: p.x, y: S });
    if (myW) result.push({ x: W, y: p.y });
    return result;
  }

  createTile(parent: Tile | undefined, point: Position) {
    return {
      // pointer to another Tile object
      parent: parent,
      // array index of this Tile in the world linear array
      value: point.x * this.worldWidth + point.y,
      // the location coordinates of this Tile
      x: point.x,
      y: point.y,
      // the distanceFunction cost to get
      // TO this Tile from the START
      f: 0,
      // the distanceFunction cost to get
      // from this Tile to the GOAL
      g: 0,
    };
  }

  getPath(start: Position, end: Position) {
    let startTile = this.createTile(undefined, start);
    let endTile = this.createTile(undefined, end);
    // create an array that will contain all world cells
    let aStar: boolean[] = new Array(this.worldHeight * this.worldWidth);
    // list of currently open Tiles
    let openTiles: Tile[] = [startTile];
    // list of closed Tiles
    let closedTiles: Tile[] = [];
    // list of the final output array
    let result: Position[] = [];
    // reference to a Tile (that is nearby)
    let myNeighbours: Position[];
    // reference to a Tile (that we are considering now)
    let myTile: Tile;
    // reference to a Tile (that starts a path in question)
    let myPath: Tile | undefined;
    // temp integer letiables used in the calculations
    let length: number, max: number, min: number, i: number, j: number;
    // iterate through the open list until none are left
    while ((length = openTiles.length)) {
      max = this.worldHeight * this.worldWidth;
      min = -1;
      for (i = 0; i < length; i++) {
        if (openTiles[i].f < max) {
          max = openTiles[i].f;
          min = i;
        }
      }
      // grab the next node and remove it from openTiles array
      myTile = openTiles.splice(min, 1)[0];
      // is it the destination node?
      if (myTile.value === endTile.value) {
        myPath = closedTiles[closedTiles.push(myTile) - 1];
        do {
          result.push({ x: myPath.x, y: myPath.y });
        } while ((myPath = myPath.parent));
        // clear the working arrays
        // console.log(openTiles);
        aStar = closedTiles = openTiles = [];
        // we want to return start to finish
        result.reverse();
      } // not the destination
      else {
        // find which nearby nodes are walkable
        myNeighbours = this.neighbours(myTile);
        // console.log(myNeighbours);
        // test each one that hasn't been tried already
        for (i = 0, j = myNeighbours.length; i < j; i++) {
          myPath = this.createTile(myTile, myNeighbours[i]);
          if (!aStar[myPath.value]) {
            // estimated cost of this particular route so far
            myPath.g = myTile.g + this.distance(myNeighbours[i], myTile);
            // estimated cost of entire guessed route to the destination
            myPath.f = myPath.g + this.distance(myNeighbours[i], endTile);
            // remember this new path for testing above
            openTiles.push(myPath);
            // mark this node in the world graph as visited
            aStar[myPath.value] = true;
          }
        }
        // remember this route as having no more untested options
        closedTiles.push(myTile);
      }
    } // keep iterating until until the Open list is empty

    return result;
  }
}
