
import ENTITY = require('../entity/entity');
import ATTRIBUTE = require('../attribute/attribute');

import MODEL = require('../model/model');
import VIEW = require('../view/view');

export function Controller(targets: (Window|Document|Element)[]) {
  return targets.map(target => new VIEW.View(target));
}
export function command(entity: ENTITY.Entity, attribute: ATTRIBUTE.AttributeInterface) {
  MODEL.input(entity, attribute);
}
