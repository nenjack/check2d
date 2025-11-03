/**
 * 40-90% faster than built-in Array.forEach function.
 *
 * basic benchmark: https://jsbench.me/urle772xdn
 */
export declare const forEach: <T>(
  array: T[],
  callback: (item: T, index: number) => void
) => void
/**
 * 20-90% faster than built-in Array.some function.
 *
 * basic benchmark: https://jsbench.me/l0le7bnnsq
 */
export declare const some: <T>(
  array: T[],
  callback: (item: T, index: number) => unknown
) => boolean
/**
 * 20-40% faster than built-in Array.every function.
 *
 * basic benchmark: https://jsbench.me/unle7da29v
 */
export declare const every: <T>(
  array: T[],
  callback: (item: T, index: number) => unknown
) => boolean
/**
 * 20-60% faster than built-in Array.filter function.
 *
 * basic benchmark: https://jsbench.me/o1le77ev4l
 */
export declare const filter: <T>(
  array: T[],
  callback: (item: T, index: number) => unknown
) => T[]
/**
 * 20-70% faster than built-in Array.map
 *
 * basic benchmark: https://jsbench.me/oyle77vbpc
 */
export declare const map: <T, Y>(
  array: T[],
  callback: (item: T, index: number) => Y
) => Y[]
