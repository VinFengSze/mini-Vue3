export let activeEffectScope;
class EffectScope {
  active = true;
  effects = [];
  parent;
  constructor() {}
  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope;
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = this.parent;
        this.parent = null;
      }
    }
  }
  stop() {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop();
      }
      this.active = false;
    }
  }
}
export function effectScope() {
  return new EffectScope();
}

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.isActive) {
    activeEffectScope.effects.push(effect);
  }
}
