import { Entity } from "./Entity";
import * as m3 from "./math";

export function genRandomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

export function seedEntities(): Entity[] {
  const Root = new Entity({
    id: 1,
    localMatrix: m3.translation(0, 0),
    type: "root",
    meta: {
      h: 0,
      w: 0,
    },
  });

  const item1 = new Entity({
    id: 2,
    localMatrix: m3.translation(400, 400),
    type: "box",
    meta: {
      h: 55,
      w: 55,
    },
  });

  const item2 = new Entity({
    id: 3,
    localMatrix: m3.translation(50, 400),
    type: "box",
    meta: {
      h: 55,
      w: 55,
    },
  });

  const item3 = new Entity({
    id: 3,
    localMatrix: m3.translation(75, 75),
    type: "rect",
    meta: {
      h: 55,
      w: 55,
    },
  });

  const item4 = new Entity({
    id: 4,
    localMatrix: m3.translation(325, 525),
    type: "rect",
    meta: {
      h: 55,
      w: 55,
    },
  });

  const item5 = new Entity({
    id: 5,
    localMatrix: m3.translation(225, 150),
    type: "rect",
    meta: {
      h: 55,
      w: 55,
    },
  });
  const item6 = new Entity({
    id: 6,
    localMatrix: m3.translation(150, 325),
    type: "rect",
    meta: {
      h: 55,
      w: 55,
    },
  });

  item1.setParent(Root);
  item2.setParent(Root);
  item3.setParent(Root);
  item4.setParent(Root);
  item5.setParent(Root);
  item6.setParent(Root);

  Root.updateWorldMatrix();

  // console.log(Box3.worldMatrix);

  return [Root, item1, item2, item3, item4, item5, item6];
}
