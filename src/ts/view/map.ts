
import ATTRIBUTE = require('../attribute/attribute');

export function map(targets: HTMLElement[], callback: (elem: HTMLElement, shiftKey: boolean) => any) {
  if (targets.length === 0) { return []; }
  
  const scrollTop = window.scrollY,
        scrollLeft = window.scrollX;
  const keys = 'edsawgvcxliohnmzbptuy'.split(''),
        container = document.createElement('div'),
        observer = document.createElement('input'),
        table = <{ [key: string]: HTMLElement }>{};
  observer.style.cssText = [
    'position: fixed;',
    'width: 0px;',
    'height: 0px;',
    'bottom: 0px;',
    'right: 0px;',
    'margin: 0px;',
    'border-width: 0px;',
    'padding: 0px;',
    'z-index: -1;'
  ]
  .map(str => str.split(';')[0] + ' !important;')
  .join('');
  observer.addEventListener('input', handler);
  observer.addEventListener('blur', handler);
  document.body.appendChild(observer);
  observer.focus();
  setTimeout(() => observer.focus(), 1000);
  document.body.appendChild(container);
  return targets.slice(0, keys.length)
    .map(target => {
      const marker = document.createElement('span'),
            key = keys.shift(),
            offset = calOffset(target);
      marker.classList.add(ATTRIBUTE.MARKER_TAG);
      marker.classList.add(ATTRIBUTE.MARKER_TAG + '-' + key);
      marker.style.cssText = [
        'position: absolute;',
        'overflow: visible;',
        'z-index: 9999;',
        'top: ' + (offset.top - 3) + 'px;',
        'left: ' + (offset.left - 12) + 'px;',
        'min-width: 5px;',
        'margin: 0px;',
        'border: 0px;',
        'padding: 1px 3px;',
        'border-radius: 3px;',
        'box-shadow: 1px 1px 1px 0px;',
        'background-color: gold;',
        'font-family: Helvetica, Arial, sans-serif;',
        'font-size: 13px;',
        'font-weight: bold;',
        'line-height: normal;',
        'color: black;'
      ]
      .map(str => str.split(';')[0] + ' !important;')
      .join('');
      marker.textContent = key;
      table[key] = target;
      container.appendChild(marker);
      return target;
    });

  function handler(event: KeyboardEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const key = ja2en((<any>event.target).value),
          shiftKey = key === key.toUpperCase(),
          target = table[key.toLowerCase()];

    observer.removeEventListener('keydown', handler);
    observer.removeEventListener('blur', handler);
    container.remove();

    if (key && target) {
      callback(target, shiftKey);
    }

    observer.blur();
    observer.remove();
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

function ja2en(char: string) {
  switch (char) {
    case 'ｑ':
      return 'q';
    case 'Ｑ':
      return 'Q';
    case 'ｗ':
      return 'w';
    case 'Ｗ':
      return 'W';
    case 'え':
      return 'e';
    case 'Ｅ':
      return 'E';
    case 'ｒ':
      return 'r';
    case 'Ｒ':
      return 'R';
    case 'ｔ':
      return 't';
    case 'Ｔ':
      return 'T';
    case 'ｙ':
      return 'y';
    case 'Ｙ':
      return 'Y';
    case 'う':
      return 'u';
    case 'Ｕ':
      return 'U';
    case 'い':
      return 'i';
    case 'Ｉ':
      return 'I';
    case 'お':
      return 'o';
    case 'Ｏ':
      return 'O';
    case 'ｐ':
      return 'p';
    case 'Ｐ':
      return 'P';
    case 'あ':
      return 'a';
    case 'Ａ':
      return 'A';
    case 'ｓ':
      return 's';
    case 'Ｓ':
      return 'S';
    case 'ｄ':
      return 'd';
    case 'Ｄ':
      return 'D';
    case 'ｆ':
      return 'f';
    case 'Ｆ':
      return 'F';
    case 'ｇ':
      return 'g';
    case 'Ｇ':
      return 'G';
    case 'ｈ':
      return 'h';
    case 'Ｈ':
      return 'H';
    case 'ｊ':
      return 'j';
    case 'Ｊ':
      return 'J';
    case 'ｋ':
      return 'k';
    case 'Ｋ':
      return 'K';
    case 'ｌ':
      return 'l';
    case 'Ｌ':
      return 'L';
    case 'ｚ':
      return 'z';
    case 'Ｚ':
      return 'Z';
    case 'ｘ':
      return 'x';
    case 'Ｘ':
      return 'X';
    case 'ｃ':
      return 'c';
    case 'Ｃ':
      return 'C';
    case 'ｖ':
      return 'v';
    case 'Ｖ':
      return 'V';
    case 'ｂ':
      return 'b';
    case 'Ｂ':
      return 'B';
    case 'ｎ':
      return 'n';
    case 'Ｎ':
      return 'N';
    case 'ｍ':
      return 'm';
    case 'Ｍ':
      return 'M';
    default:
      return char;
  }
}
