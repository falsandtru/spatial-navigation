/// <reference path="../.d/lazychain.d.ts" />

import ENTITY = require('../entity/entity');
import ATTRIBUTE = require('../attribute/attribute');

import VIEW = require('../view/view');
import CONTROLLER = require('../controller/controller');

import STORE = require('../store/store');
export const store = STORE.create<Result>();

import ANALYSIS = require('./analysis');
//import MAP = require('./map');

import LazyChain = require('lazychain');

export type Data = {
  entity: ENTITY.EntityInterface
  attribute: ATTRIBUTE.AttributeInterface
  result: Result
};

export interface Result {
  targets: HTMLElement[];
}

const views: VIEW.View[] = [];

export function main() {
  CONTROLLER.Controller([window])
    .forEach(view => views.unshift(view));
}

const stream = LazyChain<Data>();
stream
  .lazy(10)
  .reduceRight(v => v)
  .map(ANALYSIS.analyze)
  .stream(output);

export function input(entity: ENTITY.EntityInterface, attribute: ATTRIBUTE.AttributeInterface) {
  stream.notify({ entity: entity, attribute: attribute, result: null });
}

function output(data: Data) {
  store.update(data.entity.viewId, data.result);
  VIEW.emit(data.entity, data.attribute);
}
