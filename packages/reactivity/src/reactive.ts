import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandlers";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE]);
}
// 缓存代理对象
const reactiveMap = new WeakMap();

export const reactive = (target) => {
  if (!isObject(target)) return target; // 处理非对象的情况

  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  const isExistProxy = reactiveMap.get(target);
  // 若已经存在代理对象，则直接返回
  if (isExistProxy) {
    return isExistProxy;
  }

  const proxy = new Proxy(target, mutableHandlers);

  reactiveMap.set(target, proxy);
  return proxy;
};
