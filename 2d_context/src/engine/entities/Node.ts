import { Entity, Anchor } from ".";
import * as matrix from "../helpers/matrix";
import { Context } from "../Engine";

export class Node extends Entity {
  height: number;
  width: number;
  constructor(data: {
    id?: string;
    localMatrix: number[];
    height: number;
    width: number;
  }) {
    const hitbox = {
      dx: 0,
      dy: 0,
      h: data.height,
      w: data.width,
    };
    super({ ...data, type: "NODE", hitbox });
    this.height = data.height;
    this.width = data.width;
    const anchor = new Anchor({
      localMatrix: matrix.translation(this.height / 2 - 10, 0),
    });

    anchor.setParent(this);
  }

  getCollisionRect() {
    const { x, y } = this.getGlobalOrigin();
    const { dx, dy, w, h } = this.hitbox;
    return {
      x: x - dx - 10,
      y: y - dy - 10,
      w: w + dx + 20,
      h: h + dy + 20,
    };
  }

  getCenter() {
    const { x, y } = this.getGlobalOrigin();
    const { width, height } = this;
    return {
      x: x + width / 2,
      y: y + height / 2,
    };
  }

  draw(ctx: Context, selectedId?: string) {
    ctx.drawing.resetTransform();
    const m = this.globalMatrix;
    ctx.drawing.setTransform(m[0], m[1], m[3], m[4], m[6], m[7]);
    ctx.drawing.strokeStyle = "none";
    ctx.drawing.fillStyle = "#000000";
    ctx.drawing.fillRect(0, 0, this.width, this.height);
    if (selectedId === this.id) {
      ctx.drawing.strokeStyle = "#CCCCCC";
      ctx.drawing.lineWidth = 4;
      ctx.drawing.strokeRect(2, 2, this.width - 2, this.height - 2);
    }
    this.drawHit(ctx);
    this.children.forEach((child) => child.draw(ctx, selectedId));
  }
}
