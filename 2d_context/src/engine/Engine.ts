export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Connectors {
  source: number;
  target: number;
}

export interface Scale {
  x: number;
  y: number;
}

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

export class Engine {
  drawingCanvas: HTMLCanvasElement;
  boxes: Box[];
  connectors: Connectors[];
  tileSize: number;
  worldSize: number;
  world: number[][];
  // scale: Scale;

  constructor(drawingCanvas: HTMLCanvasElement) {
    this.drawingCanvas = drawingCanvas;

    this.tileSize = 25;
    this.worldSize = 600 / this.tileSize;
    this.boxes = [
      { x: 25, y: 25, w: 25, h: 25 },
      { x: 475, y: 475, w: 25, h: 25 },
      { x: 300, y: 300, w: 100, h: 100 },
      { x: 450, y: 50, w: 100, h: 100 },
      { x: 150, y: 350, w: 100, h: 100 },
      {
        x: Math.floor(Math.random() * (this.worldSize - 1)) * this.tileSize,
        y: Math.floor(Math.random() * (this.worldSize - 1)) * this.tileSize,
        w: 100,
        h: 100,
      },
      {
        x: Math.floor(Math.random() * (this.worldSize - 1)) * this.tileSize,
        y: Math.floor(Math.random() * (this.worldSize - 1)) * this.tileSize,
        w: 100,
        h: 100,
      },
    ];
    this.world = this.initWorld();
    this.connectors = [{ source: 0, target: 1 }];
    this.drawingCanvas.width = this.drawingCanvas.clientWidth;
    this.drawingCanvas.height = this.drawingCanvas.clientHeight;
    // this.scale = {
    //   x: 1,
    //   y: 1,
    // };

    // this.drawingCanvas.addEventListener("resize", this.resized);
  }

  initWorld() {
    const map = [[]] as number[][];
    for (let i = 0; i < 600 / this.tileSize; i++) {
      map[i] = [];
      for (let j = 0; j < 600 / this.tileSize; j++) {
        map[i][j] = 0;
      }
    }
    return map;
  }

  addBoxToWorld(box: Box) {
    const width = Math.floor(box.w / this.tileSize);
    const height = Math.floor(box.h / this.tileSize);
    const x1 = Math.max(0, Math.floor(box.x / this.tileSize));
    const y1 = Math.max(0, Math.floor(box.y / this.tileSize));
    const x2 = Math.min(x1 + width, this.tileSize);
    const y2 = Math.min(y1 + height, this.tileSize);

    for (let i = x1; i < x2; i++) {
      for (let j = y1; j < y2; j++) {
        this.world[i][j] = 1;
      }
    }
  }

  manhattanDistance(node: Position, goal: Position) {
    // linear movement - no diagonals - just cardinal directions (NSEW)
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
  }

  canWalkHere(x: number, y: number) {
    return (
      this.world[x] != null &&
      this.world[x][y] != null &&
      this.world[x][y] === 0
    );
  }

  neighbours(x: number, y: number) {
    const N = y - 1,
      S = y + 1,
      E = x + 1,
      W = x - 1,
      myN = N > -1 && this.canWalkHere(x, N),
      myS = S < this.worldSize && this.canWalkHere(x, S),
      myE = E < this.worldSize && this.canWalkHere(E, y),
      myW = W > -1 && this.canWalkHere(W, y),
      result: Position[] = [];
    if (myN) result.push({ x: x, y: N });
    if (myE) result.push({ x: E, y: y });
    if (myS) result.push({ x: x, y: S });
    if (myW) result.push({ x: W, y: y });
    return result;
  }

  createNode(parent: Node | undefined, point: Position) {
    return {
      // pointer to another Node object
      parent: parent,
      // array index of this Node in the world linear array
      value: point.x + point.y * this.worldSize,
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

  getPath(start: Position, end: Position) {
    let startNode = this.createNode(undefined, start);
    let endNode = this.createNode(undefined, end);
    // create an array that will contain all world cells
    let aStar: boolean[] = new Array(this.worldSize * this.worldSize);
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
      max = this.worldSize * this.worldSize;
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
        myNeighbours = this.neighbours(myNode.x, myNode.y);
        // console.log(myNeighbours);
        // test each one that hasn't been tried already
        for (i = 0, j = myNeighbours.length; i < j; i++) {
          myPath = this.createNode(myNode, myNeighbours[i]);
          if (!aStar[myPath.value]) {
            // estimated cost of this particular route so far
            myPath.g =
              myNode.g + this.manhattanDistance(myNeighbours[i], myNode);
            // estimated cost of entire guessed route to the destination
            myPath.f =
              myPath.g + this.manhattanDistance(myNeighbours[i], endNode);
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

  // calculateScaleX() {
  //   return this.drawingCanvas.clientWidth / 500;
  // }
  // calculateScaleY() {
  //   return this.drawingCanvas.clientHeight / 500;
  // }

  // resized() {
  //   this.drawingCanvas.width = this.drawingCanvas.clientWidth;
  //   this.drawingCanvas.height = this.drawingCanvas.clientHeight;
  //   this.scale = {
  //     x: this.calculateScaleX(),
  //     y: this.calculateScaleY(),
  //   };

  //   this.draw();
  // }

  draw() {
    console.log("draw");
    const drawingCtx = this.drawingCanvas.getContext("2d");

    if (drawingCtx === null) {
      return;
    }
    // drawingCtx.scale(this.scale.x, this.scale.y);
    drawingCtx.clearRect(
      0,
      0,
      this.drawingCanvas.clientWidth,
      this.drawingCanvas.clientHeight
    );
    this.boxes.forEach((box) => {
      drawingCtx.fillRect(box.x, box.y, box.w, box.h);
      this.addBoxToWorld(box);
    });

    this.connectors.forEach((connector) => {
      var box1 = this.boxes[connector.source];
      var box2 = this.boxes[connector.target];
      const path = this.getPath(
        {
          x: Math.floor(box1.x / this.worldSize + 1),
          y: Math.floor(box1.y / this.worldSize + 1),
        },
        {
          x: Math.floor(box2.x / this.worldSize + 1),
          y: Math.floor(box2.y / this.worldSize),
        }
      );
      this.drawPath(path);
      // console.log(path);
      // drawingCtx.beginPath();
      // drawingCtx.moveTo(box1.x + box1.w / 2, box1.y + box1.h / 2);
      // drawingCtx.lineTo(box2.x + box2.w / 2, box2.y + box2.h / 2);
      // drawingCtx.stroke();
    });
  }

  drawPath(path: Position[]) {
    const drawingCtx = this.drawingCanvas.getContext("2d");

    if (drawingCtx === null) {
      return;
    }
    drawingCtx.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i];
      const target = path[i + 1];
      drawingCtx.moveTo(source.x * this.tileSize, source.y * this.tileSize);
      drawingCtx.lineTo(target.x * this.tileSize, target.y * this.tileSize);
    }

    drawingCtx.stroke();
  }
}
