import { Entity, Anchor } from ".";
import * as matrix from "../helpers/matrix";
import { Context, ById } from "../Engine";
import { PATHFINDING_TILE_SIZE } from "../pathfinding";

export class Node extends Entity {
  height: number;
  width: number;
  inputIds: string[];
  outputIds: string[];

  constructor(data: {
    id?: string;
    localMatrix: number[];
    height: number;
    width: number;
    inputCount: number;
    outputCount: number;
  }) {
    const hitbox = {
      dx: 0,
      dy: 0,
      h: data.height,
      w: Math.max(data.inputCount, data.outputCount) * 50,
    };
    super({ ...data, type: "NODE", hitbox });
    this.height = data.height;
    this.width = Math.max(data.inputCount, data.outputCount) * 50;
    this.inputIds = [];
    this.outputIds = [];

    for (let i = 0; i < data.inputCount; i++) {
      const x0 = (this.width / (data.inputCount + 1)) * (i + 1) - 10;
      const anchor = new Anchor({
        localMatrix: matrix.translation(x0, 0),
      });
      this.inputIds.push(anchor.id);
      anchor.setParent(this);
    }

    for (let i = 0; i < data.outputCount; i++) {
      const x0 = (this.width / (data.outputCount + 1)) * (i + 1) - 10;
      const anchor = new Anchor({
        localMatrix: matrix.translation(x0, this.height - 10),
      });
      this.outputIds.push(anchor.id);
      anchor.setParent(this);
    }
  }

  getCollisionRect() {
    const { x, y } = this.getGlobalOrigin();
    const { dx, dy, w, h } = this.hitbox;
    return {
      x: x - dx - 5 + PATHFINDING_TILE_SIZE / 2,
      y: y - dy - 5 + PATHFINDING_TILE_SIZE / 2,
      w: w + dx + 10,
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
    ctx.drawing.globalCompositeOperation = "source-over";
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
    Object.values(this.children).forEach((child) =>
      child.draw(ctx, selectedId)
    );
  }
}
