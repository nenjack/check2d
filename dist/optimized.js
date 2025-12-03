/* tslint:disable:one-variable-per-declaration */
/**
 * 40-90% faster than built-in Array.forEach function.
 *
 * basic benchmark: https://jsbench.me/urle772xdn
 */
export const forEach = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    callback(array[index], index)
  }
}
/**
 * 20-90% faster than built-in Array.some function.
 *
 * basic benchmark: https://jsbench.me/l0le7bnnsq
 */
export const some = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    if (callback(array[index], index)) {
      return true
    }
  }
  return false
}
/**
 * 20-40% faster than built-in Array.every function.
 *
 * basic benchmark: https://jsbench.me/unle7da29v
 */
export const every = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    if (!callback(array[index], index)) {
      return false
    }
  }
  return true
}
/**
 * 20-60% faster than built-in Array.filter function.
 *
 * basic benchmark: https://jsbench.me/o1le77ev4l
 */
export const filter = (array, callback) => {
  const output = []
  for (let index = 0, len = array.length; index < len; index++) {
    const item = array[index]
    if (callback(item, index)) {
      output.push(item)
    }
  }
  return output
}
/**
 * 20-70% faster than built-in Array.map
 *
 * basic benchmark: https://jsbench.me/oyle77vbpc
 */
export const map = (array, callback) => {
  const len = array.length
  const output = new Array(len)
  for (let index = 0; index < len; index++) {
    output[index] = callback(array[index], index)
  }
  return output
}
