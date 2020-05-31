import { genRandomColor } from "./utils";
import * as m3 from "./math";
import { Pathfinding } from "./pathfinding";
import createMixins from "@material-ui/core/styles/createMixins";
import { Context } from "./Engine";

export interface Rect {
  w: number;
  h: number;
}

export class Entity {
  id: number;
  type: string;
  colorKey: string;
  localMatrix: number[];
  worldMatrix: number[];
  parent?: Entity;
  children: Entity[];
  meta: Rect;

  constructor(data: {
    id: number;
    localMatrix: number[];
    type: string;
    meta: Rect;
  }) {
    this.id = data.id;
    this.localMatrix = m3.translate(data.localMatrix, 0, 0);
    this.worldMatrix = [...this.localMatrix];
    this.type = data.type;
    this.colorKey = genRandomColor();
    this.children = [];
    this.meta = data.meta;
  }

  setParent(parent: Entity) {
    if (this.parent) {
      var ndx = this.parent.children.indexOf(this);
      if (ndx >= 0) {
        this.parent.children.splice(ndx, 1);
      }
    }
    // Add us to our new parent
    if (parent) {
      parent.children.push(this);
    }
    this.parent = parent;
  }

  updateWorldMatrix(parentWorldMatrix?: number[]) {
    if (parentWorldMatrix) {
      // a matrix was passed in so do the math
      this.worldMatrix = m3.multiply(parentWorldMatrix, this.localMatrix);
    } else {
      // no matrix was passed in so just copy local to world
      this.worldMatrix = [...this.localMatrix];
    }

    // now process all the children
    const worldMatrix = this.worldMatrix;
    this.children.forEach(function (child) {
      child.updateWorldMatrix(worldMatrix);
    });
  }

  getWorldHit(pathfinding: Pathfinding, ctx: CanvasRenderingContext2D) {
    const { x, y } = this.origin(pathfinding, ctx);
    return {
      x: Math.floor(x / pathfinding.tileSize),
      y: Math.floor(y / pathfinding.tileSize),
      w: Math.floor(this.meta.w / pathfinding.tileSize),
      h: Math.floor(this.meta.h / pathfinding.tileSize),
    };
  }

  drawHit(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.colorKey;
    ctx.resetTransform();
    const m = this.worldMatrix;
    ctx.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);

    ctx.fillRect(0, 0, this.meta.w, this.meta.h);
  }

  origin(pathfinding: Pathfinding, ctx: CanvasRenderingContext2D) {
    ctx.resetTransform();
    const m = this.worldMatrix;
    ctx.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);

    const matrix = ctx.getTransform();

    return {
      x: matrix.e,
      y: matrix.f,
    };
  }

  drawSelected(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#FFBB00";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.meta.w, this.meta.h);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.resetTransform();
    ctx.strokeStyle = "none";

    const m = this.worldMatrix;
    ctx.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);

    ctx.fillRect(0, 0, this.meta.w, this.meta.h);
  }
}
