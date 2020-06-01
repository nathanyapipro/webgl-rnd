import {
  Position,
  Pathfinding,
  getPath,
  initWorld,
  PATHFINDING_TILE_SIZE,
  updateBoxInWorld,
  updateConnectorInWorld,
  convertToWorldCoordinates,
  convertToCanvasCoordinates,
} from "./pathfinding";
import { clamp } from "./helpers/math";
import { seedEntities, seedConnectors } from "./helpers/seed";
import * as m3 from "./helpers/matrix";
import { Entity, Anchor, Group } from "./entities";

export interface Connectors {
  source: Anchor;
  target: Anchor;
}

export interface UI {
  selectedId?: string;
  isDragging: boolean;
  colorHash: {
    [key: string]: string;
  };
}

export interface Context {
  drawing: CanvasRenderingContext2D;
  hit: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export interface ById<T> {
  [key: string]: T;
}

export class Engine {
  ctx: Context;
  ui: UI;
  pathfinding: Pathfinding;
  root: Group;
  entities: ById<Entity>;
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
      tileSize: PATHFINDING_TILE_SIZE,
      worldHeight: this.ctx.height / PATHFINDING_TILE_SIZE,
      worldWidth: this.ctx.width / PATHFINDING_TILE_SIZE,
      world: [],
    };
    initWorld(this.pathfinding);
    this.root = new Group({
      id: "root",
      localMatrix: m3.translation(0, 0),
      height: 0,
      width: 0,
    });
    this.entities = seedEntities(this.root, this.ctx.width, this.ctx.height);
    this.ui = {
      isDragging: false,
      selectedId: undefined,
      colorHash: {},
    };
    this.connectors = seedConnectors(this.entities);

    Object.values(this.entities).forEach(({ colorKey, id }) => {
      this.ui.colorHash[colorKey] = id;
    });

    canvas.addEventListener("mousedown", (e) => {
      const x = e.clientX - canvas.offsetLeft;
      const y = e.clientY - canvas.offsetTop;
      let index = undefined;
      const pixel = this.ctx.hit.getImageData(x, y, 1, 1).data;
      const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
      index = this.ui.colorHash[color];
      if (index) {
        this.ui.isDragging = true;
        this.ui.selectedId = index;
      } else {
        this.ui.selectedId = undefined;
        this.ui.isDragging = false;
      }

      this.drawScene();
    });

    canvas.addEventListener("mousemove", (e) => {
      if (this.ui.selectedId !== undefined && this.ui.isDragging) {
        const selectedEntity = this.entities[this.ui.selectedId];
        const { hitbox } = selectedEntity;
        const x = clamp(
          e.clientX - canvas.offsetLeft - hitbox.w / 2,
          0,
          this.ctx.width - hitbox.w
        );
        const y = clamp(
          e.clientY - canvas.offsetTop - hitbox.h / 2,
          0,
          this.ctx.height - hitbox.h
        );

        selectedEntity.localMatrix = m3.translation(x, y);

        this.drawScene();
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      if (this.ui.selectedId !== undefined && this.ui.isDragging) {
        this.ui.isDragging = false;

        this.drawScene();
      }
    });
  }

  clear() {
    this.ctx.drawing.resetTransform();
    this.ctx.hit.resetTransform();
    this.ctx.drawing.clearRect(0, 0, this.ctx.width, this.ctx.height);
    this.ctx.hit.clearRect(0, 0, this.ctx.width, this.ctx.height);
    initWorld(this.pathfinding);
    // console.log(this.pathfinding.global);
  }

  drawScene() {
    this.clear();
    this.root.updateGlobalMatrix();

    Object.values(this.entities).forEach((entity) => {
      entity.draw(this.ctx, this.ui.selectedId);
      // entity.drawHit(this.ctx);

      updateBoxInWorld(this.pathfinding, entity, 5);
    });

    this.connectors.forEach((connector) => {
      const { source, target } = connector;
      updateBoxInWorld(this.pathfinding, source, 0);
      updateBoxInWorld(this.pathfinding, target, 0);

      const path = getPath(
        this.pathfinding,
        convertToWorldCoordinates(this.pathfinding, source.getCenter()),
        convertToWorldCoordinates(this.pathfinding, target.getCenter())
      );
      this.drawPath(path);

      updateConnectorInWorld(this.pathfinding, path, 2);
      updateBoxInWorld(this.pathfinding, source, 5);
      updateBoxInWorld(this.pathfinding, target, 5);
    });
  }

  drawPath(path: Position[]) {
    this.ctx.drawing.globalCompositeOperation = "destination-over";
    this.ctx.drawing.resetTransform();

    this.ctx.drawing.lineWidth = 2;
    this.ctx.drawing.strokeStyle = "black";
    this.ctx.drawing.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const source = convertToCanvasCoordinates(this.pathfinding, path[i]);
      const target = convertToCanvasCoordinates(this.pathfinding, path[i + 1]);
      this.ctx.drawing.moveTo(
        source.x + this.pathfinding.tileSize / 2,
        source.y + this.pathfinding.tileSize / 2
      );
      this.ctx.drawing.lineTo(
        target.x + this.pathfinding.tileSize / 2,
        target.y + this.pathfinding.tileSize / 2
      );
    }

    this.ctx.drawing.stroke();
  }
}
