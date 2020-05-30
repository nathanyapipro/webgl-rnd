import {
  Position,
  Pathfinding,
  getPath,
  initWorld,
  updateBoxInWorld,
  updateConnectorInWorld,
  convertToWorldCoordinates,
  convertToCanvasCoordinates,
} from "./pathfinding";

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

export class Engine {
  drawingCtx: CanvasRenderingContext2D;
  hitCtx: CanvasRenderingContext2D;
  width: number;
  height: number;
  mousePosition: Position;
  boxes: Box[];
  selectedId?: number;
  connectors: Connectors[];
  pathfinding: Pathfinding;
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
    this.pathfinding = {
      tileSize: 25,
      worldHeight: this.height / 25,
      worldWidth: this.width / 25,
      world: [],
    };
    this.pathfinding.world = initWorld(this.pathfinding);
    this.colorHash = {};
    this.boxes = seedBoxes(this.getRandomColor);
    this.boxes.forEach(({ colorKey }, index) => {
      this.colorHash[colorKey] = index;
    });
    this.connectors = [
      { source: 0, target: 1 },
      { source: 2, target: 3 },
      { source: 4, target: 5 },
      { source: 6, target: 7 },
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
  }

  getRandomColor() {
    const r = Math.round(Math.random() * 255);
    const g = Math.round(Math.random() * 255);
    const b = Math.round(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  }

  clear() {
    this.pathfinding.world = initWorld(this.pathfinding);
    this.drawingCtx.clearRect(0, 0, this.width, this.height);
    this.hitCtx.clearRect(0, 0, this.width, this.height);
  }

  drawScene() {
    this.clear();

    this.boxes.forEach((box, id) => {
      this.drawBox(box, id);
    });

    this.connectors.forEach((connector) => {
      var box1 = this.boxes[connector.source];
      var box2 = this.boxes[connector.target];
      updateBoxInWorld(this.pathfinding, box1, 0);
      updateBoxInWorld(this.pathfinding, box2, 0);
      const path = getPath(
        this.pathfinding,
        convertToWorldCoordinates(this.pathfinding, box1),
        convertToWorldCoordinates(this.pathfinding, box2)
      );
      this.drawPath(path);
      updateBoxInWorld(this.pathfinding, box1, 5);
      updateBoxInWorld(this.pathfinding, box2, 5);
      updateConnectorInWorld(this.pathfinding, path, 3);
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

    updateBoxInWorld(this.pathfinding, box, 5);
  }

  drawPath(path: Position[]) {
    this.drawingCtx.lineWidth = 2;
    this.drawingCtx.strokeStyle = "black";
    this.drawingCtx.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const source = convertToCanvasCoordinates(this.pathfinding, path[i]);
      const target = convertToCanvasCoordinates(this.pathfinding, path[i + 1]);
      this.drawingCtx.moveTo(source.x, source.y);
      this.drawingCtx.lineTo(target.x, target.y);
    }

    this.drawingCtx.stroke();
  }
}

export function seedBoxes(genColorKey: () => string): Box[] {
  return [
    {
      colorKey: genColorKey(),
      x: 75,
      y: 75,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: 525,
      y: 525,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: 525,
      y: 75,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: 75,
      y: 525,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: Math.floor(Math.random() * 3 + 3) * 25,
      y: Math.floor(Math.random() * 10 + 8) * 25,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: Math.floor(Math.random() * 3 + 8) * 25,
      y: Math.floor(Math.random() * 10 + 8) * 25,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: Math.floor(Math.random() * 3 + 13) * 25,
      y: Math.floor(Math.random() * 10 + 8) * 25,
      w: 75,
      h: 75,
    },
    {
      colorKey: genColorKey(),
      x: Math.floor(Math.random() * 3 + 18) * 25,
      y: Math.floor(Math.random() * 10 + 8) * 25,
      w: 75,
      h: 75,
    },
  ];
}
