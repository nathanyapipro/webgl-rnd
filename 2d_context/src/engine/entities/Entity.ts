import { genRandomColor } from "../helpers/hit";
import { Context } from "../Engine";
import * as matrix from "../helpers/matrix";
import { v1 as uuidv1 } from "uuid";

export interface Offset {
  dx: number;
  dy: number;
}

export interface Location {
  x: number;
  y: number;
}
export interface Rect extends Location {
  h: number;
  w: number;
}

export interface Hitbox {
  dx: number;
  dy: number;
  w: number;
  h: number;
}

export abstract class Entity {
  id: string;
  type: string;
  colorKey: string;
  localMatrix: number[];
  globalMatrix: number[];
  parent?: Entity;
  children: Entity[];
  hitbox: Hitbox;

  constructor(data: {
    localMatrix: number[];
    hitbox: Hitbox;
    type: string;
    id?: string;
  }) {
    this.id = data.id || uuidv1();
    this.type = data.type;
    this.localMatrix = [...data.localMatrix];
    this.globalMatrix = [...this.localMatrix];
    this.colorKey = genRandomColor();
    this.children = [];
    this.hitbox = data.hitbox;
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

  updateGlobalMatrix(parentGlobalMatrix?: number[]) {
    if (parentGlobalMatrix) {
      // a matrix was passed in so do the math
      this.globalMatrix = matrix.multiply(parentGlobalMatrix, this.localMatrix);
    } else {
      // no matrix was passed in so just copy local to world
      this.globalMatrix = [...this.localMatrix];
    }

    // now process all the children
    const globalMatrix = this.globalMatrix;
    this.children.forEach(function (child) {
      child.updateGlobalMatrix(globalMatrix);
    });
  }

  getLocalOrigin() {
    const m = this.localMatrix;
    return {
      x: m[6],
      y: m[7],
    };
  }

  getGlobalOrigin() {
    const m = this.globalMatrix;
    return {
      x: m[6],
      y: m[7],
    };
  }

  abstract getCollisionRect(): Rect;

  // getCollisionHit() {
  //   const { x, y } = this.getGlobalOrigin();
  //   const { dx, dy, w, h } = this.hitbox;
  //   return {
  //     x: (x - dx -10),
  //     y: (y - dy -10),
  //     w: (w + dx + 20),
  //     h: (h + dy + 20),
  //   };
  // }

  drawHit(ctx: Context) {
    const m = this.globalMatrix;
    ctx.hit.resetTransform();
    ctx.hit.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);
    const hitbox = this.hitbox;
    ctx.hit.fillStyle = this.colorKey;

    ctx.hit.fillRect(
      -hitbox.dx,
      -hitbox.dy,
      hitbox.w + hitbox.dx,
      hitbox.h + hitbox.dy
    );
  }

  abstract getCenter(): Location;

  abstract draw(ctx: Context, selectedId?: string): void;
}
