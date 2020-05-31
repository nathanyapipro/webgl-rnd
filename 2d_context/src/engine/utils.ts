import { Entity } from "./Entity";
import { Connectors } from "./Engine";

import * as m3 from "./math";

const ENTITIES_NUMBER_OF = 30;
const CONNECTORS_NUMBER_OF = Math.floor(ENTITIES_NUMBER_OF*.66)/2; // would be wierd to have more connectors than entities.
const ENTITY_SQUARE_SIDE = 50;

export function genRandomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

export function seedEntities(width: number, height: number): Entity[] {

  const Root = new Entity({
    id: 1,
    localMatrix: m3.translation(0, 0),
    type: "root",
    meta: {
      h: 0,
      w: 0,
    },
  });
  const entities = [Root];

  for (let itr = 0 ; itr < ENTITIES_NUMBER_OF; itr++ ) {

    const item = new Entity({
      id: itr+1,
      localMatrix: m3.translation(
        Math.floor(Math.random() * width-ENTITY_SQUARE_SIDE/2), 
        Math.floor(Math.random() * height-ENTITY_SQUARE_SIDE/2)),
      type: "box",
      meta: {
        h: ENTITY_SQUARE_SIDE,
        w: ENTITY_SQUARE_SIDE,
      },
    });

    item.setParent(Root);
    entities.push(item);  
  }

  Root.updateWorldMatrix();

  return entities ;
}

export function seedConnectors(entityList: Entity[]): Connectors[]  {

  let maxEntity = entityList.length;
  const connectors:Connectors[] = [];

  // we don't want to duplicate any connectors or previously connected 
  // entities. After we pick one, move it to the end of the list, 
  // and mode the end to exclude it. This method is fast - no new mem
  // allocations, but destructive to the list order, does it matter?
  const findRandomIndex = ():number => {
    // get a random index, 
    const rnd = Math.floor(Math.random()*(maxEntity));
    const idx = entityList[rnd].id;
    const swap = entityList[rnd];
    entityList[rnd] = entityList[maxEntity-1];
    maxEntity--;
    entityList[maxEntity] = swap;

    return idx;
  }

  while ((connectors.length < CONNECTORS_NUMBER_OF) && (maxEntity>0)) {
    // select two random indices, connect them
    const source = findRandomIndex();
    const target = findRandomIndex();
    connectors.push({source,target});
  }
  
  return connectors;
}
