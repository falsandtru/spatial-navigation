
import ATTRIBUTE = require('../attribute/attribute');
import MODEL = require('./model');

const SELECTOR = [
  'a',
  'input',
  'select',
  'textarea',
  'button',
  'audio',
  'video',
  'embed',
  '[onclick]',
  '[tabindex]',
  //'[role="link"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="tab"]',
  '[role="menuitem"]'
]
.join(',');

export function analyze(data: MODEL.Data) {
  const winWidth = window.innerWidth,
        winHeight = window.innerHeight,
        winTop = window.scrollY,
        winLeft = window.scrollX;
  const targets = (<HTMLElement[]>Array.apply(null, document.querySelectorAll(SELECTOR)))
    .filter((elem: HTMLElement) => Offset(elem).width > 9 && Offset(elem).height > 9);
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
          ? findLeftTops(targets)
          : findCursorTops(targets, cursor);

      case ATTRIBUTE.COMMAND.DOWN:
        return !cursor
          ? findMainColumn(targets)
          : findCursorBottoms(targets, cursor);

      case ATTRIBUTE.COMMAND.LEFT:
        return !cursor
          ? findLeftColumn(targets)
          : findCursorLefts(targets, cursor);

      case ATTRIBUTE.COMMAND.RIGHT:
        return !cursor
          ? findRightColumn(targets)
          : findCursorRights(targets, cursor);

      case ATTRIBUTE.COMMAND.EXPAND:
        return findCursorNeerTargets(targets, cursor || findMainColumn(targets)[0] || document.body);

      default:
        return [];
    }

    function findLeftTops(targets: HTMLElement[]) {
      return targets
        .filter(isInWindow)
        .sort(compareLeftTopDistance)
        .filter(isVisible);
    }
    function findMainColumn(targets: HTMLElement[]) {
      return columns(targets)
        .filter(group => group[0].getBoundingClientRect().left < (winWidth / 2))
        .map(group => group.filter(isInWindow).filter(isVisible))
        .filter(group => group.length > 0)
        .reduce((_, group) => group, findLeftTops(targets))
        .sort(compareLeftTopDistance);
    }
    function findLeftColumn(targets: HTMLElement[]) {
      const mainColumn = findMainColumn(targets);
      return columns(targets)
        .filter(group => group.length > 0)
        .map(group => group.filter(isInWindow).filter(isVisible))
        .filter(group => group.length > 0)
        .reduce((r, group) => Offset(group[0]).left < Offset(mainColumn[0]).left ? group : r, mainColumn)
        .sort(compareLeftTopDistance);
    }
    function findRightColumn(targets: HTMLElement[]) {
      const mainColumn = findMainColumn(targets);
      return columns(targets)
        .filter(group => group.length > 0)
        .map(group => group.filter(isInWindow).filter(isVisible))
        .filter(group => group.length > 0)
        .reduce((r, group) => Offset(group[0]).left > Offset(mainColumn[0]).left ? group : r, mainColumn)
        .sort(compareLeftTopDistance);
    }
    function findCursorNeerTargets(targets: HTMLElement[], cursor: HTMLElement) {
      return targets
        .filter(isInWindow)
        .sort(compareCursorDistance(cursor))
        .filter(isVisible);
    }
    function findCursorTops(targets: HTMLElement[], cursor: HTMLElement) {
      return targets
        .filter(isInRange(winTop - Math.max(winHeight * 3, 0), winLeft, winLeft + winWidth, Offset(cursor).top))
        .sort(compareCursorVerticalDistance(cursor))
        .filter(isVisible);
    }
    function findCursorBottoms(targets: HTMLElement[], cursor: HTMLElement) {
      return targets
        .filter(isInRange(Offset(cursor).bottom, winLeft, winLeft + winWidth, winTop + Math.max(winHeight * 4, winHeight + 3000)))
        .sort(compareCursorVerticalDistance(cursor))
        .filter(isVisible);
    }
    function findCursorLefts(targets: HTMLElement[], cursor: HTMLElement) {
      return targets
        .filter(isInRange(winTop, 0, Offset(cursor).left, winTop + winHeight))
        .sort(compareCursorLeftDistance(cursor))
        .filter(isVisible);
    }
    function findCursorRights(targets: HTMLElement[], cursor: HTMLElement) {
      return targets
        .filter(isInRange(winTop, Offset(cursor).right, Infinity, winTop + winHeight))
        .sort(compareCursorRightDistance(cursor))
        .filter(isVisible);
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
        const offset = Offset(elem);
        return top <= offset.top && offset.bottom <= bottom
            && left <= offset.left && offset.right <= right;
      };
    }
    function columns(targets: HTMLElement[]) {
      return targets
        .sort(compareLeftDistance)
        .reduce(groupsByLeftDistance, [])
        .map(filterFewNodesGroup)
        .filter(group => group.length > 1)
        .sort(compareGroupsByTextAverageSize);
    }
    function groupsByLeftDistance(groups: HTMLElement[][], elem: HTMLElement) {
      if (groups.length === 0) { return [[elem]]; }
      const group = groups.slice(-1)[0];
      return isSameGroup(group, elem) ? groups.slice(0, -1).concat([group.concat(elem)]) : groups.concat([[elem]]);

      function isSameGroup(group: HTMLElement[], elem: HTMLElement) {
        return Math.floor(group[0].getBoundingClientRect().left) === Math.floor(elem.getBoundingClientRect().left);
      }
    }
    function compareGroupsByTextAverageSize(a: HTMLElement[], b: HTMLElement[]) {
      return calTextAverageSize(a.slice(0, 30)) - calTextAverageSize(b.slice(0, 30));

      function calTextAverageSize(elems: HTMLElement[]) {
        return elems.reduce((r, elem) => r + calTextSize(elem), 0) / elems.length * (Math.min(elems.length, 5) / 5 + 0.5);
      }
      function calTextSize(elem: HTMLElement) {
        return parseInt(window.getComputedStyle(elem).lineHeight, 10);
      }
    }
    function filterFewNodesGroup(group: HTMLElement[]) {
      return groupsByNodeDistanceFromRoot(group)
        .filter(group => group.length > 1)
        .reduce((r, group) => r.concat(group), []);
    }
    function groupsByNodeDistanceFromRoot(group: HTMLElement[]) {
      return group
        .sort(compareByNodeDistanceFromRoot)
        .reduce((r, elem) => r.length === 0 ? [[elem]]
                                            : compareByNodeDistanceFromRoot(r[0][0], elem) === 0 ? [[elem].concat(r[0])].concat(r.slice(1))
                                                                                                 : [[elem]].concat(r)
        , <HTMLElement[][]>[]);
    }
    function compareByNodeDistanceFromRoot(a: HTMLElement, b: HTMLElement) {
      return countNodeDistanceFromRoot(a) - countNodeDistanceFromRoot(b);

      function countNodeDistanceFromRoot(elem: HTMLElement) {
        var count = 0,
          parent: HTMLElement = elem;
        while (parent = parent.parentElement) {
          ++count;
        }
        return count;
      }
    }
    function compareLeftDistance(a: HTMLElement, b: HTMLElement) {
      return Math.floor(a.getBoundingClientRect().left) - Math.floor(b.getBoundingClientRect().left);
    }
    function compareLeftTopDistance(a: HTMLElement, b: HTMLElement) {
      return distance(a) - distance(b);

      function distance(elem: HTMLElement) {
        const rect = elem.getBoundingClientRect();
        return Math.floor(
            rect.left
          + rect.top * 5
        );
      }
    }
    function compareCursorDistance(cursor: HTMLElement) {
      const cursorOffset = Offset(cursor);
      return function (a: HTMLElement, b: HTMLElement) {
        return distance(a) - distance(b);
      };

      function distance(elem: HTMLElement) {
        const targetOffset = Offset(elem);
        return Math.floor(
          Math.abs(targetOffset.left - cursorOffset.left)
        + Math.abs(targetOffset.top - cursorOffset.top) * 3
        );
      }
    }
    function compareCursorVerticalDistance(cursor: HTMLElement) {
      const cursorOffset = Offset(cursor);
      return function (a: HTMLElement, b: HTMLElement) {
        return distance(a) - distance(b);
      };

      function distance(elem: HTMLElement) {
        const targetOffset = Offset(elem);
        return Math.floor(
          Math.abs(targetOffset.left - cursorOffset.left) * 3
        + Math.abs(targetOffset.top - cursorOffset.top)
        );
      }
    }
    function compareCursorLeftDistance(cursor: HTMLElement) {
      const cursorOffset = Offset(cursor);
      return function (a: HTMLElement, b: HTMLElement) {
        return distance(a) - distance(b);
      };

      function distance(elem: HTMLElement) {
        const targetOffset = Offset(elem);
        return Math.floor(
          Math.abs(targetOffset.right - cursorOffset.left)
        + Math.abs(targetOffset.top - cursorOffset.top) * 5
        );
      }
    }
    function compareCursorRightDistance(cursor: HTMLElement) {
      const cursorOffset = Offset(cursor);
      return function (a: HTMLElement, b: HTMLElement) {
        return distance(a) - distance(b);
      };

      function distance(elem: HTMLElement) {
        const targetOffset = Offset(elem);
        return Math.floor(
          Math.abs(targetOffset.left - cursorOffset.right)
        + Math.abs(targetOffset.top - cursorOffset.top) * 5
        );
      }
    }
    function isVisible(elem: HTMLElement) {
      const rect = elem.getBoundingClientRect(),
            point = <HTMLElement>document.elementFromPoint(Math.floor(rect.left + ((rect.right - rect.left) / 2)),
                                                           Math.floor(rect.top + (rect.bottom - rect.top) / 2));
      return point
        ? point === elem || isChild(elem, point) || point === elem.parentElement
        : isVisibleStyle(elem);

      function isChild(parent: HTMLElement, child: HTMLElement) {
        return child ? child.parentElement === parent || isChild(parent, child.parentElement) : false;
      }
      function isVisibleStyle(elem: HTMLElement) {
        const style = window.getComputedStyle(elem);
        return (
          style.display.split(' ')[0] !== 'none' ||
          style.visibility.split(' ')[0] !== 'hidden' ||
          !(parseInt(style.zIndex.split(' ')[0], 10) < 0)
        );
      }
    }
  }
  function Offset(elem: HTMLElement) {
    const offset = elem.getBoundingClientRect();
    return {
      top: winTop + offset.top,
      left: winLeft + offset.left,
      right: winLeft + offset.right,
      bottom: winTop + offset.bottom,
      width: offset.right - offset.left,
      height: offset.bottom - offset.top
    };
  }
}
