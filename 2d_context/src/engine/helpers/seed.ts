import { Node, Group, Entity, Anchor } from "../entities";
import { Connectors, ById } from "../Engine";

import * as m3 from "./matrix";

const ENTITIES_NUMBER_OF = 10;
const CONNECTORS_NUMBER_OF = Math.floor(ENTITIES_NUMBER_OF - 1); // would be wierd to have more connectors than entities.
const ENTITY_SQUARE_SIDE = 50;

export function genRandomColor() {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);
  return `rgb(${r},${g},${b})`;
}

export function seedEntities(
  root: Group,
  width: number,
  height: number
): ById<Entity> {
  const entities = {} as ById<Entity>;

  for (let itr = 0; itr < ENTITIES_NUMBER_OF; itr++) {
    const item = new Node({
      localMatrix: m3.translation(
        Math.floor(Math.random() * width - ENTITY_SQUARE_SIDE / 2),
        Math.floor(Math.random() * height - ENTITY_SQUARE_SIDE / 2)
      ),
      height: ENTITY_SQUARE_SIDE * 1.5,
      width: ENTITY_SQUARE_SIDE,
      inputCount: Math.floor(Math.random() * 3) + 1,
      outputCount: Math.floor(Math.random() * 3) + 1,
    });

    item.setParent(root);
    entities[item.id] = item;
  }

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
  const findRandomNode = (): Node => {
    // get a random index,
    const rnd = Math.floor(Math.random() * maxNode);
    const node = entities[entityKeys[rnd]] as Node;
    return node;
  };

  const usedAnchorIds: string[] = [];

  while (connectors.length < CONNECTORS_NUMBER_OF && maxNode > 0) {
    // select two random indices, connect them
    const nodeSource = findRandomNode();
    const nodeTarget = findRandomNode();
    if (nodeSource.id === nodeTarget.id) {
      continue;
    }
    const sourceAnchorIndex = Math.floor(
      Math.random() * nodeSource.outputIds.length
    );
    const targetAnchorIndex = Math.floor(
      Math.random() * nodeTarget.inputIds.length
    );
    const sourceAnchorId = nodeSource.outputIds[sourceAnchorIndex];
    const targetAnchorId = nodeTarget.inputIds[targetAnchorIndex];
    if (
      usedAnchorIds.includes(sourceAnchorId) ||
      usedAnchorIds.includes(targetAnchorId)
    ) {
      continue;
    }

    const source = nodeSource.children[sourceAnchorId] as Anchor;
    const target = nodeTarget.children[targetAnchorId] as Anchor;
    connectors.push({ source, target });
    usedAnchorIds.push(source.id);
    usedAnchorIds.push(target.id);
  }

  return connectors;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(max, value), min);
}
