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
import { seedEntities } from "./utils";
import * as m3 from "./math";
import { Entity } from "./Entity";

export interface Connectors {
  source: number;
  target: number;
}

export interface UI {
  selectedId?: number;
  isDragging: boolean;
  colorHash: {
    [key: string]: number;
  };
}

export interface Context {
  drawing: CanvasRenderingContext2D;
  hit: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export class Engine {
  ctx: Context;
  ui: UI;
  pathfinding: Pathfinding;
  entities: Entity[];
  connectors: Connectors[];

  constructor(canvas: HTMLCanvasElement) {
    const height = canvas.height;
    const width = canvas.width;

    // Initalize drawing canvas
    const drawingCtx = canvas.getContext("2d");
    // Initialize hit canvas
    const hitCanvas = document.createElement("canvas");

    const hitCtx = hitCanvas.getContext("2d");

    if (drawingCtx && hitCtx) {
      this.ctx = {
        drawing: drawingCtx,
        hit: hitCtx,
        height,
        width,
      };
      hitCanvas.height = this.ctx.height;
      hitCanvas.width = this.ctx.width;
    } else {
      throw new Error();
    }

    this.pathfinding = {
      tileSize: 25,
      worldHeight: this.ctx.height / 25,
      worldWidth: this.ctx.width / 25,
      world: [],
    };
    this.pathfinding.world = initWorld(this.pathfinding);
    this.entities = seedEntities();
    this.ui = {
      isDragging: false,
      selectedId: undefined,
      colorHash: {},
    };
    this.connectors = [
      { source: 0, target: 1 },
      { source: 2, target: 3 },
    ];
    this.entities.forEach(({ colorKey }, index) => {
      this.ui.colorHash[colorKey] = index;
    });

    canvas.addEventListener("mousedown", (e) => {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      let index = -1;
      const pixel = this.ctx.hit.getImageData(x, y, 1, 1).data;
      const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
      index = this.ui.colorHash[color];
      if (index !== -1) {
        this.ui.isDragging = true;
        this.ui.selectedId = index;
      } else {
        this.ui.selectedId = undefined;
      }

      this.drawScene();
    });

    canvas.addEventListener("mousemove", (e) => {
      if (this.ui.selectedId !== undefined && this.ui.isDragging) {
        this.entities[this.ui.selectedId].localMatrix = m3.translation(
          e.offsetX,
          e.offsetY
        );

        this.entities[this.ui.selectedId].updateWorldMatrix();

        this.drawScene();
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      if (this.ui.isDragging === true) {
        this.ui.isDragging = false;
      }
    });
  }

  clear() {
    this.pathfinding.world = initWorld(this.pathfinding);
    this.ctx.drawing.resetTransform();
    this.ctx.hit.resetTransform();
    this.ctx.drawing.clearRect(0, 0, this.ctx.width, this.ctx.height);
    this.ctx.hit.clearRect(0, 0, this.ctx.width, this.ctx.height);
  }

  drawScene() {
    this.clear();

    this.entities.forEach((entity, id) => {
      entity.draw(this.ctx.drawing);
      entity.drawHit(this.ctx.hit);

      if (this.ui.selectedId === id) {
        entity.drawSelected(this.ctx.drawing);
      }
      updateBoxInWorld(this.pathfinding, entity, 5);
    });

    this.connectors.forEach((connector) => {
      var box1 = this.entities[connector.source];
      var box2 = this.entities[connector.target];
      updateBoxInWorld(this.pathfinding, box1, 0);
      updateBoxInWorld(this.pathfinding, box2, 0);

      const path = getPath(
        this.pathfinding,
        convertToWorldCoordinates(this.pathfinding, box1.origin()),
        convertToWorldCoordinates(this.pathfinding, box2.origin())
      );
      this.drawPath(path);
      updateBoxInWorld(this.pathfinding, box1, 5);
      updateBoxInWorld(this.pathfinding, box2, 5);
      updateConnectorInWorld(this.pathfinding, path, 3);
    });
  }

  drawPath(path: Position[]) {
    this.ctx.drawing.resetTransform();
    this.ctx.drawing.lineWidth = 2;
    this.ctx.drawing.strokeStyle = "black";
    this.ctx.drawing.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const source = convertToCanvasCoordinates(this.pathfinding, path[i]);
      const target = convertToCanvasCoordinates(this.pathfinding, path[i + 1]);
      this.ctx.drawing.moveTo(source.x, source.y);
      this.ctx.drawing.lineTo(target.x, target.y);
    }

    this.ctx.drawing.stroke();
  }
}
