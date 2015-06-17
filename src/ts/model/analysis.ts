
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
  'embed'
]
.map(v => v + ':visible')
.join(',');

export function analyze(data: MODEL.Data) {
  const $window = $(window),
        scrollTop = $window.scrollTop(),
        scrollLeft = $window.scrollLeft();
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
          : targets
              .filter(isInRange(0, 0, Infinity, calOffset(cursor).top))
              .sort(sortCursorVerticalDistance);

      case ATTRIBUTE.COMMAND.DOWN:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
          : targets
              .filter(isInRange(calOffset(cursor).bottom, 0, Infinity, Infinity))
              .sort(sortCursorVerticalDistance);

      case ATTRIBUTE.COMMAND.LEFT:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
          : targets
              .filter(isInRange(scrollTop, 0, calOffset(cursor).left, scrollTop + $window.height()))
              .sort(sortCursorLeftDistance);

      case ATTRIBUTE.COMMAND.RIGHT:
        return !cursor
          ? targets
              .filter(isInWindow)
              .sort(sortLeftTopDistance)
          : targets
              .filter(isInRange(scrollTop, calOffset(cursor).right, Infinity, scrollTop + $window.height()))
              .sort(sortCursorRightDistance);

      case ATTRIBUTE.COMMAND.EXPAND:
        cursor = cursor || findTargets(targets, ATTRIBUTE.COMMAND.DOWN, null)[0] || document.body;
        return targets
          .filter(isInWindow)
          .sort(sortCursorDistance);

      default:
        return [];
    }
    function isCursorActive(cursor: HTMLElement) {
      const rect = cursor && cursor.getBoundingClientRect();
      return !(
        !rect ||
        rect.bottom < 0 ||
        rect.top > $window.height() ||
        rect.right < 0 ||
        rect.left > $window.width()
      );
    }
    function isInWindow(elem: HTMLElement): boolean {
      return !!elem && isInRange(scrollTop, scrollLeft, scrollLeft + $window.width(), scrollTop + $window.height())(elem);
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
        top: scrollTop + offset.top,
        left: scrollLeft + offset.left,
        right: scrollLeft + offset.right,
        bottom: scrollTop + offset.bottom
      };
    }
  }
}
