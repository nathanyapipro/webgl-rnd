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
    new Entity({
      id: 4,
      localMatrix: m3.translation(175, 525),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    new Entity({
      id: 5,
      localMatrix: m3.translation(275, 225),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    new Entity({
      id: 6,
      localMatrix: m3.translation(375, 125),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
    new Entity({
      id: 7,
      localMatrix: m3.translation(75, 225),
      type: "rect",
      meta: {
        h: 75,
        w: 75,
      },
    }),
  ];
}
