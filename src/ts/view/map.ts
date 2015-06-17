
import ATTRIBUTE = require('../attribute/attribute');

export function map(targets: HTMLElement[], callback: (elem: HTMLElement) => any) {
  if (targets.length === 0) { return []; }
  
  const scrollTop = window.scrollY,
        scrollLeft = window.scrollX;
  const keys = 'fdsaewlioghvnybcm'.split(''),
        markers = <HTMLElement[]>[],
        observer = document.createElement('input'),
        table = <{ [key: string]: HTMLElement }>{};
  observer.style.cssText = [
    'position: absolute !important;',
    'width: 0px !important;',
    'height: 0px !important;',
    'bottom: 0px !important;',
    'right: 0px !important;',
    'margin: 0px !important;',
    'border-width: 0px !important;',
    'padding: 0px !important;',
    'z-index: -1 !important;'
  ].join('');
  document.body.appendChild(observer);
  observer.focus();
  observer.addEventListener('input', handler);
  observer.addEventListener('blur', handler);
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
        'top: ' + (offset.top - 5) + 'px;',
        'left: ' + (offset.left - 12) + 'px;',
        'margin: 0px;',
        'border: 0px;',
        'padding: 1px 3px;',
        'border-radius: 3px;',
        'background-color: gold;',
        'font-family: monospace;',
        'font-size: 12px;',
        'font-weight: bold;',
        'line-height: normal;',
        'color: black;'
      ]
      .map(str => str.split(';')[0] + ' !important;')
      .join('');
      marker.textContent = key;
      markers.push(marker);
      table[key] = target;
      document.body.appendChild(marker);
      return target;
    });

  function handler(event: KeyboardEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const key = ja2en((<any>event.target).value).toLowerCase(),
          target = table[key];

    observer.removeEventListener('keydown', handler);
    observer.removeEventListener('blur', handler);
    observer.remove();
    markers.forEach((elem: HTMLElement) => elem.remove());

    if (key && target) {
      target.focus();
      target.click();
      callback(target);
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

function ja2en(char: string) {
  switch (char) {
    case 'ｑ':
      return 'q';
    case 'ｗ':
      return 'w';
    case 'え':
      return 'e';
    case 'ｒ':
      return 'r';
    case 'ｔ':
      return 't';
    case 'ｙ':
      return 'y';
    case 'う':
      return 'u';
    case 'い':
      return 'i';
    case 'お':
      return 'o';
    case 'ｐ':
      return 'p';
    case 'あ':
      return 'a';
    case 'ｓ':
      return 's';
    case 'ｄ':
      return 'd';
    case 'ｆ':
      return 'f';
    case 'ｇ':
      return 'g';
    case 'ｈ':
      return 'h';
    case 'ｊ':
      return 'j';
    case 'ｋ':
      return 'k';
    case 'ｌ':
      return 'l';
    case 'ｚ':
      return 'z';
    case 'ｘ':
      return 'x';
    case 'ｃ':
      return 'c';
    case 'ｖ':
      return 'v';
    case 'ｂ':
      return 'b';
    case 'ｎ':
      return 'n';
    case 'ｍ':
      return 'm';
    default:
      return char;
  }
}
