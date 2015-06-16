
export function create<T>() {
  return new Store<T>();
}

class Store<T> {
  private state_: { [id: string]: T; } = {};
  private diff_: { [id: string]: string[] } = {};

  update(id: number|string, diff: {}) {
    const curState = this.state_[id] = this.state_[id] || <T>{},
          curDiff = this.diff_[id] = this.diff_[id] || [];
    Object.keys(diff)
      .forEach(v => {
        const key = v,
              val = diff[key];
        if (val === curState[key]) { return; }
        curState[key] = val;
        curDiff.push(key);
      });
  }

  state(id: number|string) {
    return this.state_[id] = this.state_[id] || <T>{};
  }

  diff(id: number|string) {
    const diff = this.diff_[id] = this.diff_[id] || [],
          uniq = diff.sort().reduce((r, v, i) => i === 0 ? [v] : r[0] === v ? r : [v].concat(r), <string[]>[]).reverse();
    [].splice.apply(diff, (<Array<number|string>>[0, diff.length]).concat(uniq));
    return diff;
  }
}
