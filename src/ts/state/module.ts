
const enum STATE {
  ENABLE,
  DISABLE
}
var state_ = STATE.ENABLE;
export function state(enable?: boolean): boolean {
  switch (enable) {
    case true:
      state_ = STATE.ENABLE;
      break;
    case false:
      state_ = STATE.DISABLE;
      break;
  }
  return state_ === STATE.ENABLE;
}
