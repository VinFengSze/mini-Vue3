import { ReactiveFlags, reactive } from "./reactive";
import { track, trigger } from "./effect";
import { isObject } from "@vue/shared";
export const mutableHandlers = {
  get(target, key, receiver) {
    // 若被代理后的对象上，增加了get方法，再次访问target[ReactiveFlags.IS_REACTIVE]会触发get方法
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    track(target, key); // 依赖收集
    const result = Reflect.get(target, key, receiver);
    if (isObject(result)) {
      return reactive(result);
    }
    return Reflect.get(target, key, receiver); // 处理了this指向问题
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]; // 没有修改之前的值
    const r = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return r;
  },
};
