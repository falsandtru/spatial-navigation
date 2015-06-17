
import ATTRIBUTE = require('../attribute/attribute');

export function map(targets: HTMLElement[]) {
  if (targets.length === 0) { return []; }

  const keys = 'fdsaewjklio'.split(''),
        markers = <HTMLElement[]>[],
        observer = document.createElement('input');
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
  observer.addEventListener('keydown', handler);
  observer.addEventListener('blur', handler);
  return targets.slice(0, keys.length)
    .map(target => {
      const marker = document.createElement('span'),
            key = keys.shift();
      marker.classList.add(ATTRIBUTE.MARKER_TAG);
      marker.classList.add(ATTRIBUTE.MARKER_TAG + '-' + key);
      marker.textContent = key;
      markers.push(marker);
      target.appendChild(marker);
      return target;
    });

  function handler(event: KeyboardEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const key = String.fromCharCode(event.keyCode).toLowerCase(),
          target = <HTMLElement>(document.querySelector('.' + ATTRIBUTE.MARKER_TAG + '-' + key) || <any>{}).parentElement;

    observer.removeEventListener('keydown', handler);
    observer.removeEventListener('blur', handler);
    observer.remove();
    markers.forEach((elem: HTMLElement) => elem.remove());

    if (key && target) {
      target.click();
    }
  }
}
