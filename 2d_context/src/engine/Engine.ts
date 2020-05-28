export interface Box {
  colorKey: string;
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
  drawingCtx: CanvasRenderingContext2D;
  hitCtx: CanvasRenderingContext2D;
  width: number;
  height: number;
  mousePosition: Position;
  boxes: Box[];
  selectedId?: number;
  connectors: Connectors[];
  tileSize: number;
  worldSize: number;
  world: number[][];
  isDragging: boolean;
  colorHash: {
    [key: string]: number;
  };
  // scale: Scale;

  constructor(drawingCanvas: HTMLCanvasElement) {
    this.drawingCtx = drawingCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    this.mousePosition = { x: 0, y: 0 };
    this.height = drawingCanvas.height;
    this.width = drawingCanvas.width;
    this.isDragging = false;
    const hitCanvas = document.createElement("canvas");
    this.hitCtx = hitCanvas.getContext("2d") as CanvasRenderingContext2D;
    hitCanvas.height = this.height;
    hitCanvas.width = this.width;
    this.selectedId = undefined;
    this.tileSize = 25;
    this.colorHash = {};
    this.worldSize = 600 / this.tileSize;
    this.boxes = [
      {
        colorKey: this.getRandomColor(),
        x: 75,
        y: 75,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: 525,
        y: 525,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: 525,
        y: 75,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: 75,
        y: 525,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: Math.floor(Math.random() * 3 + 3) * this.tileSize,
        y: Math.floor(Math.random() * 10 + 8) * this.tileSize,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: Math.floor(Math.random() * 3 + 8) * this.tileSize,
        y: Math.floor(Math.random() * 10 + 8) * this.tileSize,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: Math.floor(Math.random() * 3 + 13) * this.tileSize,
        y: Math.floor(Math.random() * 10 + 8) * this.tileSize,
        w: 75,
        h: 75,
      },
      {
        colorKey: this.getRandomColor(),
        x: Math.floor(Math.random() * 3 + 18) * this.tileSize,
        y: Math.floor(Math.random() * 10 + 8) * this.tileSize,
        w: 75,
        h: 75,
      },
    ];
    this.boxes.forEach(({ colorKey }, index) => {
      this.colorHash[colorKey] = index;
    });
    this.world = this.initWorld();
    this.connectors = [
      { source: 0, target: 1 },
      { source: 2, target: 3 },
    ];

    drawingCanvas.addEventListener("mousedown", (e) => {
      this.mousePosition = {
        x: e.clientX - drawingCanvas.offsetLeft,
        y: e.clientY - drawingCanvas.offsetTop,
      };
      let index = -1;
      const pixel = this.hitCtx.getImageData(
        this.mousePosition.x,
        this.mousePosition.y,
        1,
        1
      ).data;
      const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
      index = this.colorHash[color];
      if (index !== -1) {
        this.isDragging = true;
        this.selectedId = index;
      } else {
        this.selectedId = undefined;
      }

      this.drawScene();
    });

    drawingCanvas.addEventListener("mousemove", (e) => {
      if (this.selectedId !== undefined && this.isDragging) {
        this.boxes[this.selectedId].x = e.offsetX;
        this.boxes[this.selectedId].y = e.offsetY;
        this.drawScene();
      }
    });

    drawingCanvas.addEventListener("mouseup", (e) => {
      if (this.isDragging === true) {
        this.isDragging = false;
      }
    });

    // this.drawingCanvas.width = this.drawingCanvas.clientWidth;
    // this.drawingCanvas.height = this.drawingCanvas.clientHeight;
    // this.scale = {
    //   x: 1,
    //   y: 1,
    // };

    // this.drawingCanvas.addEventListener("resize", this.resized);
  }

  getRandomColor() {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
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
    const width = Math.floor((box.w + 50) / this.tileSize);
    const height = Math.floor((box.h + 50) / this.tileSize);
    const x1 = Math.max(0, Math.floor((box.x - 25) / this.tileSize));
    const y1 = Math.max(0, Math.floor((box.y - 25) / this.tileSize));
    const x2 = Math.min(x1 + width, this.worldSize);
    const y2 = Math.min(y1 + height, this.worldSize);

    for (let i = x1; i < x2; i++) {
      for (let j = y1; j < y2; j++) {
        this.world[i][j] = 5;
      }
    }
  }

  removeBoxFromWorld(box: Box) {
    const width = Math.floor(box.w / this.tileSize) + 2;
    const height = Math.floor(box.h / this.tileSize) + 2;
    const x1 = Math.max(0, Math.floor(box.x / this.tileSize) - 1);
    const y1 = Math.max(0, Math.floor(box.y / this.tileSize) - 1);
    const x2 = Math.min(x1 + width, this.worldSize);
    const y2 = Math.min(y1 + height, this.worldSize);

    for (let i = x1; i < x2; i++) {
      for (let j = y1; j < y2; j++) {
        this.world[i][j] = 0;
      }
    }
  }

  addConnectorToWorld(path: Position[]) {
    path.forEach(({ x, y }) => {
      this.world[x][y] += 3;
    });
  }

  distance(node: Position, goal: Position) {
    // linear movement - no diagonals - just cardinal directions (NSEW)
    return (
      Math.abs(node.x - goal.x) +
      Math.abs(node.y - goal.y) +
      this.world[node.x][node.y]
    );
    // return Math.max(Math.abs(node.x - goal.x), Math.abs(node.y - goal.y) );
    // return Math.sqrt(
    //   Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2)
    // );
  }

  canWalkHere(x: number, y: number) {
    return (
      this.world[x] != null && this.world[x][y] != null && this.world[x][y] < 5
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
            myPath.g = myNode.g + this.distance(myNeighbours[i], myNode);
            // estimated cost of entire guessed route to the destination
            myPath.f = myPath.g + this.distance(myNeighbours[i], endNode);
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

  clear() {
    // drawingCtx.scale(this.scale.x, this.scale.y);
    this.world = this.initWorld();
    this.drawingCtx.clearRect(0, 0, this.width, this.height);
    this.hitCtx.clearRect(0, 0, this.width, this.height);
  }

  drawScene() {
    console.log("draw");
    this.clear();

    this.boxes.forEach((box, id) => {
      this.drawBox(box, id);
    });

    this.connectors.forEach((connector) => {
      var box1 = this.boxes[connector.source];
      var box2 = this.boxes[connector.target];
      this.removeBoxFromWorld(box1);
      this.removeBoxFromWorld(box2);
      const path = this.getPath(
        {
          x: Math.floor(box1.x / this.worldSize),
          y: Math.floor(box1.y / this.worldSize),
        },
        {
          x: Math.floor(box2.x / this.worldSize),
          y: Math.floor(box2.y / this.worldSize),
        }
      );
      this.drawPath(path);
      this.addBoxToWorld(box1);
      this.addBoxToWorld(box2);
      this.addConnectorToWorld(path);
    });
  }

  drawBox(box: Box, id: number) {
    this.drawingCtx.fillRect(
      box.x - box.w / 2,
      box.y - box.h / 2,
      box.w,
      box.h
    );
    let boxStroke = "none";
    if (this.selectedId === id) {
      boxStroke = "#FFBB00";
      this.drawingCtx.strokeStyle = boxStroke;
      this.drawingCtx.lineWidth = 4;
      this.drawingCtx.strokeRect(
        box.x - box.w / 2,
        box.y - box.h / 2,
        box.w,
        box.h
      );
    }

    this.hitCtx.fillStyle = box.colorKey;

    this.hitCtx.fillRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h);

    this.addBoxToWorld(box);
  }

  drawPath(path: Position[]) {
    this.drawingCtx.lineWidth = 2;
    this.drawingCtx.strokeStyle = "black";
    this.drawingCtx.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const source = path[i];
      const target = path[i + 1];
      this.drawingCtx.moveTo(
        source.x * this.tileSize,
        source.y * this.tileSize
      );
      this.drawingCtx.lineTo(
        target.x * this.tileSize,
        target.y * this.tileSize
      );
    }

    this.drawingCtx.stroke();
  }
}
