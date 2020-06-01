import { Entity } from "./Entity";
import { Context } from "../Engine";

export class Anchor extends Entity {
  height: number;
  width: number;
  constructor(data: { localMatrix: number[] }) {
    const hitbox = {
      dx: 0,
      dy: 15,
      h: 10,
      w: 20,
    };
    super({ ...data, type: "NODE", hitbox });
    this.height = hitbox.h;
    this.width = hitbox.w;
  }

  getCollisionRect() {
    const { x, y } = this.getGlobalOrigin();
    const { dx, dy, w, h } = this.hitbox;
    return {
      x: x - dx - 0,
      y: y - dy - 5,
      w: w + dx + 0,
      h: h + dy + 10,
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
    ctx.drawing.fillStyle = "#18a0fb";
    ctx.drawing.fillRect(0, 0, this.width, this.height);
  }
}
