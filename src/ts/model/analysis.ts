
import ATTRIBUTE = require('../attribute/attribute');
import MODEL = require('./model');

import $ = require('jquery');

const QUERY = [
  'a',
  'input',
  'select',
  'textarea',
  'button',
  'audio',
  'video',
  'embed',
  '[onclick]'
]
.map(v => v + ':visible')
.join(',');

export function analyze(data: MODEL.Data) {
  const winWidth = $(window).width(),
        winHeight = $(window).height(),
        winTop = $(window).scrollTop(),
        winLeft = $(window).scrollLeft();
  const targets = $(QUERY).get().filter((elem: HTMLElement) => $(elem).width() > 9
                                                            && $(elem).height() > 9);
  return {
    entity: data.entity,
    attribute: data.attribute,
    result: {
      targets: findTargets(targets, data.attribute.command, data.attribute.cursor)
    }
  };

  function findTargets(targets: HTMLElement[], command: ATTRIBUTE.COMMAND, cursor: HTMLElement): HTMLElement[] {
    cursor = isCursorActive(cursor) ? cursor : null;
    switch (command) {
      case ATTRIBUTE.COMMAND.UP:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
              .slice(0, 1000)
              .filter(isVisible)
          : targets
              .filter(isInRange(0, 0, Infinity, calOffset(cursor).top))
              .sort(sortCursorVerticalDistance)
              .slice(0, 1000)
              .filter(isVisible);

      case ATTRIBUTE.COMMAND.DOWN:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
              .slice(0, 1000)
              .filter(isVisible)
          : targets
              .filter(isInRange(calOffset(cursor).bottom, 0, Infinity, Infinity))
              .sort(sortCursorVerticalDistance)
              .slice(0, 1000)
              .filter(isVisible);

      case ATTRIBUTE.COMMAND.LEFT:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
              .slice(0, 1000)
              .filter(isVisible)
          : targets
              .filter(isInRange(winTop, 0, calOffset(cursor).left, winTop + winHeight))
              .sort(sortCursorLeftDistance)
              .slice(0, 1000)
              .filter(isVisible);

      case ATTRIBUTE.COMMAND.RIGHT:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
              .slice(0, 1000)
              .filter(isVisible)
          : targets
              .filter(isInRange(winTop, calOffset(cursor).right, Infinity, winTop + winHeight))
              .sort(sortCursorRightDistance)
              .slice(0, 1000)
              .filter(isVisible);

      case ATTRIBUTE.COMMAND.EXPAND:
        cursor = cursor || findTargets(targets, ATTRIBUTE.COMMAND.DOWN, null)[0] || document.body;
        return targets
          .filter(isInWindow)
          .sort(sortCursorDistance)
          .slice(0, 1000)
          .filter(isVisible);

      default:
        return [];
    }
    function isCursorActive(cursor: HTMLElement) {
      const rect = cursor && cursor.getBoundingClientRect();
      return !(
        !rect ||
        rect.bottom < 0 ||
        rect.top > winHeight ||
        rect.right < 0 ||
        rect.left > winWidth
      );
    }
    function isInWindow(elem: HTMLElement): boolean {
      return !!elem && isInRange(winTop, winLeft, winLeft + winWidth, winTop + winHeight)(elem);
    }
    function isInRange(top: number, left: number, right: number, bottom: number) {
      return function (elem: HTMLElement): boolean {
        const offset = calOffset(elem);
        return top <= offset.top && offset.bottom <= bottom
            && left <= offset.left && offset.right <= right;
      };
    }
    function sortLeftTopDistance(a: HTMLElement, b: HTMLElement) {
      return distance(a) - distance(b);

      function distance(elem: HTMLElement) {
        const rect = elem.getBoundingClientRect();
        return Math.floor(
            rect.left
          + rect.top * 5
        );
      }
    }
    function sortCursorDistance(a: HTMLElement, b: HTMLElement) {
      const cursoroffset = calOffset(cursor);
      return distance(a) - distance(b);

      function distance(elem: HTMLElement) {
        const offset = calOffset(elem);
        return Math.floor(
            Math.abs(offset.left - cursoroffset.left)
          + Math.abs(offset.top - cursoroffset.top) * 3
        );
      }
    }
    function sortCursorVerticalDistance(a: HTMLElement, b: HTMLElement) {
      const cursoroffset = calOffset(cursor);
      return distance(a) - distance(b);

      function distance(elem: HTMLElement) {
        const offset = calOffset(elem);
        return Math.floor(
            Math.abs(offset.left - cursoroffset.left) * 3
          + Math.abs(offset.top - cursoroffset.top)
        );
      }
    }
    function sortCursorLeftDistance(a: HTMLElement, b: HTMLElement) {
      const cursoroffset = calOffset(cursor);
      return distance(a) - distance(b);

      function distance(elem: HTMLElement) {
        const offset = calOffset(elem);
        return Math.floor(
            Math.abs(offset.right - cursoroffset.left)
          + Math.abs(offset.top - cursoroffset.top) * 5
        );
      }
    }
    function sortCursorRightDistance(a: HTMLElement, b: HTMLElement) {
      const cursoroffset = calOffset(cursor);
      return distance(a) - distance(b);

      function distance(elem: HTMLElement) {
        const offset = calOffset(elem);
        return Math.floor(
            Math.abs(offset.left - cursoroffset.right)
          + Math.abs(offset.top - cursoroffset.top) * 5
        );
      }
    }
    function calOffset(elem: HTMLElement) {
      const offset = elem.getBoundingClientRect();
      return {
        top: winTop + offset.top,
        left: winLeft + offset.left,
        right: winLeft + offset.right,
        bottom: winTop + offset.bottom
      };
    }
    function isVisible(elem: HTMLElement) {
      const rect = elem.getBoundingClientRect(),
            point = <HTMLElement>document.elementFromPoint(Math.floor(rect.left + ((rect.right - rect.left) / 2)),
                                                           Math.floor(rect.top + (rect.bottom - rect.top) / 2));
      return isOut() || point === elem || isChild(elem, point) || isChild(point, elem);

      function isOut() {
        const x = rect.left + ((rect.right - rect.left) / 2),
              y = rect.top + ((rect.bottom - rect.top) / 2);
        return y < 0 || $(window).height() < y
            || x < 0 || $(window).width() < x ;
      }
      function isChild(parent: HTMLElement, child: HTMLElement) {
        return child ? child.parentElement === parent || isChild(parent, child.parentElement) : false;
      }
    }
  }
}
