
export const enum COMMAND {
  UP,
  UP_S,
  DOWN,
  DOWN_S,
  LEFT,
  RIGHT,
  EXPAND,
  //CONTRACT,
  ENTER,
  ENTER_S,
  QUIT,
  INVALID
}

const enum KEYMAP {
  w = 119,
  W = 87,
  s = 115,
  S = 83,
  a = 97,
  d = 100,
  e = 101,
  //E = 69,
  q = 113,
  Enter = 13
}

const enum CMDMAP {
  UP = KEYMAP.w,
  UP_S = KEYMAP.W,
  DOWN = KEYMAP.s,
  DOWN_S = KEYMAP.S,
  LEFT = KEYMAP.a,
  RIGHT = KEYMAP.d,
  EXPAND = KEYMAP.e,
  //CONTRACT = KEYMAP.E,
  QUIT = KEYMAP.q,
  ENTER = KEYMAP.Enter
}

export const CURSOR_ID = 'spatialnavigation-cursor';
export const URLDISPLAY_ID = 'spatialnavigation-urldisplay';

export const MARKER_TAG = 'spatialnavigation-marker';

export interface AttributeInterface {
  command: COMMAND;
  cursor: HTMLElement;
}
export function attribute(event: KeyboardEvent, cursor: HTMLElement): AttributeInterface {
  return {
    command: key2command(event),
    cursor: cursor
  };
}
export function key2command(event: KeyboardEvent): COMMAND {
  if (event.altKey || event.ctrlKey || event.metaKey) { return COMMAND.INVALID; }

  const keyCode = event.shiftKey ? String.fromCharCode(event.keyCode).toUpperCase().charCodeAt(0)
                                 : String.fromCharCode(event.keyCode).toLowerCase().charCodeAt(0);
  switch (keyCode) {
    case CMDMAP.QUIT:
      return COMMAND.QUIT;
    case CMDMAP.EXPAND:
      return COMMAND.EXPAND;
    //case CMDMAP.CONTRACT:
    //  return COMMAND.CONTRACT;
    case CMDMAP.UP:
      return COMMAND.UP;
    case CMDMAP.UP_S:
      return COMMAND.UP_S;
    case CMDMAP.DOWN:
      return COMMAND.DOWN;
    case CMDMAP.DOWN_S:
      return COMMAND.DOWN_S;
    case CMDMAP.LEFT:
      return COMMAND.LEFT;
    case CMDMAP.RIGHT:
      return COMMAND.RIGHT;
    case CMDMAP.ENTER:
      return event.shiftKey ? COMMAND.ENTER_S : COMMAND.ENTER;
    default:
      return COMMAND.INVALID;
  }
}
