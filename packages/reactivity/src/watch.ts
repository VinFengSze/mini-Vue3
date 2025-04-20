import { isReactive } from "./reactive";
import { isFunction } from "@swf/shared";
import { ReactiveEffect } from "./effect";
import { isObject } from "@vue/shared";

function traverse(source, s = new Set()) {
  if (!isObject(source)) return source;
  if (s.has(source)) {
    return;
  }
  s.add(source);
  for (const key in source) {
    traverse(source[key], s); // 递归取值
  }
  return source;
}
export function watch(source, cb, options) {
  // let getter;
  // if (isReactive(source)) {
  //   getter = () => traverse(source); // 只有访问属性，才能依赖收集
  // } else if (isFunction(source)) {
  //   getter = source;
  // }
  // let oldValue;
  // const job = () => {
  //   const newVal = effect.run(); //再次调用effect 拿到新的值
  //   cb(newVal, oldValue);
  //   oldValue = newVal;
  // };
  // const effect = new ReactiveEffect(getter, job);
  // if (options.immediate) {
  //   job();
  //   return;
  // }
  // oldValue = effect.run(); // 保留老值
  doWatch(source, cb, options);
}
export function doWatch(source, cb, options) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source); // 只有访问属性，才能依赖收集
  } else if (isFunction(source)) {
    getter = source;
  }
  let oldValue;
  const job = () => {
    if (cb) {
      const newVal = effect.run(); //再次调用effect 拿到新的值
      cb(newVal, oldValue);
      oldValue = newVal;
    } else {
      effect.run();
    }
  };
  const effect = new ReactiveEffect(getter, job);
  if (options?.immediate) {
    job();
    return;
  }
  oldValue = effect.run(); // 保留老值
}

export function watchEffect(effect, options) {
  doWatch(effect, null, options);
}
