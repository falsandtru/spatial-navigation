
import ENTITY = require('../entity/entity');
import ATTRIBUTE = require('../attribute/attribute');

import MODEL = require('../model/model');
import CONTROLLER = require('../controller/controller');

import STATE = require('../state/module');

import MAP = require('./map');

var id = 0;
const views: { [id: number]: View } = {};

export const state = STATE.state;

export class View {
  constructor(target: Window|Document|Element) {
    views[this.id_] = this;
    this.target_ = target;
    this.handler_ = this.handler_.bind(this);
    this.observe_();
    this.style.innerHTML = [
      '.' + ATTRIBUTE.CURSOR_ID + ' {',
      '  outline: 4px solid turquoise !important;',
      '  outline-offset: -1px;',
      '}'
    ].join('\n');
  }
  private id_ = ++id;
  private target_: Window|Document|Element;
  private style = document.createElement('style');
  private handler_(event: KeyboardEvent) {
    if (!state()) { return; }
    if (event.defaultPrevented) { return; }
    if (isInserting(event.srcElement)) { return; }

    const cursor = <HTMLElement>document.querySelector('.' + ATTRIBUTE.CURSOR_ID),
          entity = new ENTITY.Entity(this.id_),
          attribute = ATTRIBUTE.attribute(event, cursor);

    if (attribute.command === ATTRIBUTE.COMMAND.INVALID) { return; }

    event.preventDefault();
    event.stopImmediatePropagation();

    CONTROLLER.command(entity, attribute);
    return;

    function isInserting(elem: Element) {
      switch (elem.tagName.toLowerCase()) {
        case 'input':
        case 'select':
        case 'textarea':
          return true;
      }
      return false;
    }
  }
  private observe_() {
    this.target_.addEventListener('keydown', this.handler_, true);
  }
  private release_() {
    this.target_.removeEventListener('keydown', this.handler_, true);
  }
  private destructor() {
    this.release_();
    delete views[this.id_];
  }

  update(command: ATTRIBUTE.COMMAND) {
    if (!this.style.parentElement) {
      document.head.appendChild(this.style);
    }
    const state = MODEL.store.state(this.id_),
          diff = MODEL.store.diff(this.id_);
    var key: string;
    while (key = diff.shift()) {
      switch (key) {
        case 'targets':
          markTarget(state.targets);
      }
    }

    function markTarget(targets: HTMLElement[]) {
      switch (command) {
        case ATTRIBUTE.COMMAND.UP:
        case ATTRIBUTE.COMMAND.DOWN:
        case ATTRIBUTE.COMMAND.LEFT:
        case ATTRIBUTE.COMMAND.RIGHT:
          const target = targets[0];
          if (!target) { break; }
          mark(target);
          (<any>target).scrollIntoViewIfNeeded();
          break;

        case ATTRIBUTE.COMMAND.EXPAND:
          MAP.map(targets, (target) => (target.tagName.toLowerCase() === 'a' || target.onclick) && mark(target));
          break;

        case ATTRIBUTE.COMMAND.ENTER:
          const cursor = <HTMLElement>document.querySelector('.' + ATTRIBUTE.CURSOR_ID) || document.createElement('div');
          switch (cursor.tagName.toLowerCase()) {
            case 'input':
            case 'textarea':
              cursor.focus();
          }
          cursor.click();
          unmark();
          break;

        default:
          unmark();
      }
      return;

      function mark(elem: Element) {
        unmark();
        elem.classList.add(ATTRIBUTE.CURSOR_ID);
      }
      function unmark() {
        const marker = document.querySelector('.' + ATTRIBUTE.CURSOR_ID) || document.createElement('div');
        marker.classList.remove(ATTRIBUTE.CURSOR_ID);
      }
    }
  }
  destroy() {
    this.destructor();
  }
}

export function emit(entity: ENTITY.EntityInterface, attribute: ATTRIBUTE.AttributeInterface): boolean {
  const viewId = entity.viewId;
  if (viewId in views) {
    views[viewId].update(attribute.command);
    return true;
  }
  else {
    return false;
  }
}
