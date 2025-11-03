export default class RBush {
  constructor(maxEntries?: number)
  _maxEntries: number
  _minEntries: number
  all(): any
  search(bbox: any): any[]
  collides(bbox: any): boolean
  load(data: any): this
  data: any
  insert(item: any): this
  clear(): this
  remove(item: any, equalsFn: any): this
  toBBox(item: any): any
  compareMinX(a: any, b: any): number
  compareMinY(a: any, b: any): number
  toJSON(): any
  fromJSON(data: any): this
  _all(node: any, result: any): any
  _build(
    items: any,
    left: any,
    right: any,
    height: any
  ): {
    children: any
    height: number
    leaf: boolean
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  _chooseSubtree(bbox: any, node: any, level: any, path: any): any
  _insert(item: any, level: any, isNode: any): void
  _split(insertPath: any, level: any): void
  _splitRoot(node: any, newNode: any): void
  _chooseSplitIndex(node: any, m: any, M: any): any
  _chooseSplitAxis(node: any, m: any, M: any): void
  _allDistMargin(node: any, m: any, M: any, compare: any): number
  _adjustParentBBoxes(bbox: any, path: any, level: any): void
  _condense(path: any): void
}
