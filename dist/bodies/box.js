import { BodyGroup, BodyType } from '../model'
import { Polygon } from './polygon'
import { createBox } from '../utils'
/**
 * collider - box
 */
export class Box extends Polygon {
  /**
   * collider - box
   */
  constructor(position, width, height, options) {
    super(position, createBox(width, height), options)
    /**
     * type of body
     */
    this.type = BodyType.Box
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Box
    /**
     * boxes are convex
     */
    this.isConvex = true
    this._width = width
    this._height = height
  }
  /**
   * get box width
   */
  get width() {
    return this._width
  }
  /**
   * set box width, update points
   */
  set width(width) {
    this._width = width
    this.afterUpdateSize()
  }
  /**
   * get box height
   */
  get height() {
    return this._height
  }
  /**
   * set box height, update points
   */
  set height(height) {
    this._height = height
    this.afterUpdateSize()
  }
  /**
   * after setting width/height update translate
   * see https://github.com/jackie-aniki/check2d/issues/70
   */
  afterUpdateSize() {
    this.setPoints(createBox(this._width, this._height))
  }
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  updateConvex() {
    return
  }
}
