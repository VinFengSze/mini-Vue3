export let activeEffect = null;
export class ReactiveEffect {
  public active: boolean = true;
  public deps: Array<any> = [];
  public parent: any = null;
  constructor(public fn, private scheduler) {}
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      clearupEffects(this);
      return this.fn(); // 会触发响应式取值get
    } finally {
      activeEffect = this.parent;
      this.parent = null;
    }
  }
  stop() {
    if (this.active) {
      clearupEffects(this);
      this.active = false;
    }
  }
}
export const effect = (fn, options = { scheduler: null }) => {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  _effect.run();
  const runner = _effect.fn.bind(_effect);
  runner.effect = _effect;
  return runner;
};

const targetMap = new WeakMap();
export function track(target, key) {
  // 取值触发get，没在effect回调函数中
  if (!activeEffect) return;
  let depMaps = targetMap.get(target);
  if (!depMaps) {
    targetMap.set(target, (depMaps = new Map()));
  }
  let deps = depMaps.get(key);
  if (!deps) {
    depMaps.set(key, (deps = new Set()));
  }
  trackEffect(deps);
}
export function trackEffect(deps) {
  const isShouldAddEffect = deps.has(activeEffect);
  if (!isShouldAddEffect) {
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
  }
}
export function trigger(target, key, newValue, oldValue) {
  // weakmap: { obj: map{ key: Set(effect) }}
  const depMaps = targetMap.get(target);
  if (!depMaps) return;
  const deps = depMaps.get(key);
  trggerEffect(deps);
}
export function trggerEffect(deps) {
  if (!deps) return;
  const effects = [...deps]; // 防止死循环
  effects.forEach((effect) => {
    // 解决effect内部修改属性，导致栈溢出
    if (activeEffect !== effect) {
      if (!effect.scheduler) {
        effect.run();
      } else {
        effect.scheduler();
      }
    }
  });
}
// 依赖收集前 清理，防止3元表达式，副作用函数残留
function clearupEffects(effect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    const dep = deps[i];
    dep.delete(effect);
  }
  effect.deps.length = 0;
}
