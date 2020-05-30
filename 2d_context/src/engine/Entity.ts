import { genRandomColor } from "./utils";
import * as m3 from "./math";

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
    this.localMatrix = data.localMatrix;
    this.worldMatrix = data.localMatrix;
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
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function (child) {
      child.updateWorldMatrix(worldMatrix);
    });
  }

  getHit() {
    const [x0, y0] = m3.multiply(this.worldMatrix, [
      -this.meta.w / 2,
      -this.meta.h / 2,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
    return {
      x: x0,
      y: y0,
      w: this.meta.w,
      h: this.meta.h,
    };
  }

  drawHit(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.colorKey;
    const m = this.worldMatrix;
    ctx.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);

    // const { x, y, w, h } = this.getHit();
    ctx.fillRect(-this.meta.w / 2, -this.meta.h / 2, this.meta.w, this.meta.h);
  }

  origin() {
    const [x0, y0] = m3.multiply(this.worldMatrix, [0, 0, 1, 0, 0, 0, 0, 0, 0]);
    return { x: x0, y: y0 };
  }

  drawSelected(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "#FFBB00";
    ctx.lineWidth = 4;
    const m = this.worldMatrix;
    ctx.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);

    // const { x, y, w, h } = this.getHit();
    ctx.strokeRect(
      -this.meta.w / 2,
      -this.meta.h / 2,
      this.meta.w,
      this.meta.h
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "none";

    const m = this.worldMatrix;
    ctx.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);

    ctx.fillRect(-this.meta.w / 2, -this.meta.h / 2, this.meta.w, this.meta.h);
  }
}
