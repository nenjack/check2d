'use strict'
/* tslint:disable:one-variable-per-declaration */
Object.defineProperty(exports, '__esModule', { value: true })
exports.map =
  exports.filter =
  exports.every =
  exports.some =
  exports.forEach =
    void 0
/**
 * 40-90% faster than built-in Array.forEach function.
 *
 * basic benchmark: https://jsbench.me/urle772xdn
 */
const forEach = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    callback(array[index], index)
  }
}
exports.forEach = forEach
/**
 * 20-90% faster than built-in Array.some function.
 *
 * basic benchmark: https://jsbench.me/l0le7bnnsq
 */
const some = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    if (callback(array[index], index)) {
      return true
    }
  }
  return false
}
exports.some = some
/**
 * 20-40% faster than built-in Array.every function.
 *
 * basic benchmark: https://jsbench.me/unle7da29v
 */
const every = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    if (!callback(array[index], index)) {
      return false
    }
  }
  return true
}
exports.every = every
/**
 * 20-60% faster than built-in Array.filter function.
 *
 * basic benchmark: https://jsbench.me/o1le77ev4l
 */
const filter = (array, callback) => {
  const output = []
  for (let index = 0, len = array.length; index < len; index++) {
    const item = array[index]
    if (callback(item, index)) {
      output.push(item)
    }
  }
  return output
}
exports.filter = filter
/**
 * 20-70% faster than built-in Array.map
 *
 * basic benchmark: https://jsbench.me/oyle77vbpc
 */
const map = (array, callback) => {
  const len = array.length
  const output = new Array(len)
  for (let index = 0; index < len; index++) {
    output[index] = callback(array[index], index)
  }
  return output
}
exports.map = map
