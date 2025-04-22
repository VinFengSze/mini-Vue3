export let activeEffectScope;
class EffectScope {
  active = true;
  effects = [];
  parent;
  scopes;
  constructor(detached = false) {
    if (!detached && activeEffectScope) {
      activeEffectScope.scope || (activeEffectScope.scopes = []).push(this);
    }
  }
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
    }
    if (this.scopes) {
      for (let i = 0; i < this.scopes.length; i++) {
        this.scopes[i].stop();
      }
    }
    this.active = false;
  }
}
export function effectScope(detached) {
  return new EffectScope(this.detached);
}

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.isActive) {
    activeEffectScope.effects.push(effect);
  }
}
