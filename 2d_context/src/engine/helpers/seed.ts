// import { Node } from "./Node";
import { Node, Group, Entity } from "../entities";
import { Connectors, ById } from "../Engine";

import * as m3 from "./matrix";

const ENTITIES_NUMBER_OF = 20;
const CONNECTORS_NUMBER_OF = Math.floor(ENTITIES_NUMBER_OF * 0.66) / 2; // would be wierd to have more connectors than entities.
const ENTITY_SQUARE_SIDE = 50;

export function genRandomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

export function seedEntities(width: number, height: number): ById<Entity> {
  const Root = new Group({
    id: "root",
    localMatrix: m3.translation(0, 0),
    height: 0,
    width: 0,
  });
  const entities = {} as ById<Entity>;
  entities[Root.id] = Root;

  for (let itr = 0; itr < ENTITIES_NUMBER_OF; itr++) {
    const item = new Node({
      localMatrix: m3.translation(
        Math.floor(Math.random() * width - ENTITY_SQUARE_SIDE / 2),
        Math.floor(Math.random() * height - ENTITY_SQUARE_SIDE / 2)
      ),
      height: ENTITY_SQUARE_SIDE,
      width: ENTITY_SQUARE_SIDE,
    });

    item.setParent(Root);
    entities[item.id] = item;
  }

  Root.updateGlobalMatrix();

  return entities;
}

export function seedConnectors(entities: ById<Entity>): Connectors[] {
  let entityKeys = Object.keys(entities);
  let maxNode = entityKeys.length;
  const connectors: Connectors[] = [];

  // we don't want to duplicate any connectors or previously connected
  // entities. After we pick one, move it to the end of the list,
  // and mode the end to exclude it. This method is fast - no new mem
  // allocations, but destructive to the list order, does it matter?
  const findRandomIndex = (): string => {
    // get a random index,
    const rnd = Math.floor(Math.random() * maxNode);
    const idx = entities[entityKeys[rnd]].id;

    return idx;
  };

  while (connectors.length < CONNECTORS_NUMBER_OF && maxNode > 0) {
    // select two random indices, connect them
    const source = findRandomIndex();
    const target = findRandomIndex();
    connectors.push({ source, target });
  }

  return connectors;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(max, value), min);
}
