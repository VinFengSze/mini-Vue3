import { isObject } from "@vue/shared";
import { reactive } from "./reactive";
import { activeEffect, trackEffect, trggerEffect } from "./effect";
export function toReactive(value) {
  if (isObject(value)) {
    return reactive(value);
  }
  return value;
}
class RefImpl {
  public deps = undefined;
  public _value;
  public __v_isRef = true;
  constructor(public rawVal) {
    this._value = toReactive(rawVal);
  }
  get value() {
    // 依赖收集
    if (activeEffect) {
      trackEffect(this.deps || (this.deps = new Set()));
    }
    return this._value;
  }
  set value(newVal) {
    if (this.rawVal !== newVal) {
      this._value = toReactive(newVal);
      this.rawVal = newVal;
      // 依赖更新
      trggerEffect(this.deps);
    }
  }
}
export function ref(value) {
  return new RefImpl(value);
}
