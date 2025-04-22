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

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(public _object, public _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}

export function toRefs(target) {
  const res = {};
  for (const key in target) {
    res[key] = toRef(target, key);
  }
  return res;
}
export function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const v = Reflect.get(target, key, receiver);
      return v.__v_isRef ? v.value : v;
    },
    set(target, key, newValue, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = newValue;
        return true;
      }
      const v = Reflect.set(target, key, newValue, receiver);
      return v;
    },
  });
}
