import { Entity } from "./Entity";
import * as m3 from "./math";

export function genRandomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

export function seedEntities(): Entity[] {
  // const Box1 = new Entity({
  //   id: 1,
  //   localMatrix: m3.translation(0, 0),
  //   type: "box",
  //   meta: {
  //     h: 50,
  //     w: 100,
  //   },
  // });

  // const Box2 = new Entity({
  //   id: 2,
  //   localMatrix: m3.translation(100, 100),
  //   type: "box",
  //   meta: {
  //     h: 50,
  //     w: 100,
  //   },
  // });

  // const Box3 = new Entity({
  //   id: 3,
  //   localMatrix: m3.translation(50, 50),
  //   type: "box",
  //   meta: {
  //     h: 50,
  //     w: 100,
  //   },
  // });

  // Box3.setParent(Box2);
  // Box2.setParent(Box1);

  // Box1.updateWorldMatrix();

  // console.log(Box3.worldMatrix);

  return [
    new Entity({
      id: 0,
      localMatrix: m3.translation(75, 75),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    new Entity({
      id: 1,
      localMatrix: m3.translation(525, 525),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    new Entity({
      id: 2,
      localMatrix: m3.translation(525, 75),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    new Entity({
      id: 3,
      localMatrix: m3.translation(75, 525),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    // {
    //   colorKey: genRandomColor(),
    //   x: 75,
    //   y: 75,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: 525,
    //   y: 525,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: 525,
    //   y: 75,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: 75,
    //   y: 525,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: Math.floor(Math.random() * 3 + 3) * 25,
    //   y: Math.floor(Math.random() * 10 + 8) * 25,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: Math.floor(Math.random() * 3 + 8) * 25,
    //   y: Math.floor(Math.random() * 10 + 8) * 25,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: Math.floor(Math.random() * 3 + 13) * 25,
    //   y: Math.floor(Math.random() * 10 + 8) * 25,
    //   w: 75,
    //   h: 75,
    // },
    // {
    //   colorKey: genRandomColor(),
    //   x: Math.floor(Math.random() * 3 + 18) * 25,
    //   y: Math.floor(Math.random() * 10 + 8) * 25,
    //   w: 75,
    //   h: 75,
    // },
  ];
}
