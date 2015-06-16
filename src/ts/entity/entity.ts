
export interface EntityInterface {
  viewId: number;
}
export class Entity implements EntityInterface {
  constructor(viewId: number) {
    this.viewId_ = viewId;
  }

  private viewId_: number;
  get viewId() {
    return this.viewId_;
  }
  set viewId(_) {
    return;
  }
}
