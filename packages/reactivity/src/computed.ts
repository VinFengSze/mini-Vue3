import { isFunction } from "@swf/shared";
import {
  activeEffect,
  ReactiveEffect,
  trackEffect,
  trggerEffect,
} from "@swf/reactivity/src/effect";
const noop = () => {};

class CoputedRefImpl {
  public deps = undefined;
  public __v_isRef: boolean = true; // 是否用.value取值
  public _dirty: boolean = true;
  public _value = undefined;
  public effect = undefined;
  constructor(public getter, public setter) {
    // 这里的getter就是effect收集的副作用函数
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
      // 计算属性的值变化 会触发scheduler回调函数
      trggerEffect(this.deps);
    });
  }
  get value() {
    if (activeEffect) {
      // 如果有activeEffect 是在effect中使用
      trackEffect(this.deps || (this.deps = new Set()));
    }
    // 取值才执行，并把取到的值缓存起来
    if (this._dirty) {
      this._value = this.effect.run();
      this._dirty = false; //
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
export function computed(getterOrOprions) {
  const onlyGetter = isFunction(getterOrOprions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = onlyGetter;
    setter = noop;
  } else {
    getter = getterOrOprions.get;
    setter = getterOrOprions.set || noop;
  }
  return new CoputedRefImpl(getter, setter);
}
