import { Entity } from ".";
// import * as matrix from "../helpers/matrix";
import { Context } from "../Engine";
import { Pathfinding } from "../Pathfinding";

export class Group extends Entity {
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
    super({ ...data, type: "GROUP", hitbox });
    this.height = data.height;
    this.width = data.width;
  }

  getCollisionRect() {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
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

  draw(ctx: Context, pathfinding: Pathfinding, selectedId?: string) {
    ctx.drawing.strokeStyle = "none";
    ctx.drawing.fillStyle = "#000000";
    ctx.drawing.fillRect(0, 0, this.width, this.height);
    if (this.id === selectedId) {
      ctx.drawing.strokeStyle = "#FFBB00";
      ctx.drawing.lineWidth = 4;
      ctx.drawing.strokeRect(0, 0, this.width, this.height);
    }
    Object.values(this.children).forEach((child) =>
      child.draw(ctx, pathfinding, selectedId)
    );
  }
}
