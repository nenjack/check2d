import { BodyGroup, BodyType } from '../model'
import { Polygon } from './polygon'
import { createEllipse } from '../utils'
/**
 * collider - ellipse
 */
export class Ellipse extends Polygon {
  /**
   * collider - ellipse
   */
  constructor(
    position,
    radiusX,
    radiusY = radiusX,
    step = (radiusX + radiusY) / Math.PI,
    options
  ) {
    super(position, createEllipse(radiusX, radiusY, step), options)
    /**
     * ellipse type
     */
    this.type = BodyType.Ellipse
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Ellipse
    /**
     * ellipses are convex
     */
    this.isConvex = true
    this._radiusX = radiusX
    this._radiusY = radiusY
    this._step = step
  }
  /**
   * flag to set is body centered
   */
  set isCentered(_isCentered) {}
  /**
   * is body centered?
   */
  get isCentered() {
    return true
  }
  /**
   * get ellipse step number
   */
  get step() {
    return this._step
  }
  /**
   * set ellipse step number
   */
  set step(step) {
    this._step = step
    this.setPoints(createEllipse(this._radiusX, this._radiusY, this._step))
  }
  /**
   * get ellipse radiusX
   */
  get radiusX() {
    return this._radiusX
  }
  /**
   * set ellipse radiusX, update points
   */
  set radiusX(radiusX) {
    this._radiusX = radiusX
    this.setPoints(createEllipse(this._radiusX, this._radiusY, this._step))
  }
  /**
   * get ellipse radiusY
   */
  get radiusY() {
    return this._radiusY
  }
  /**
   * set ellipse radiusY, update points
   */
  set radiusY(radiusY) {
    this._radiusY = radiusY
    this.setPoints(createEllipse(this._radiusX, this._radiusY, this._step))
  }
  /**
   * do not attempt to use Polygon.center()
   */
  center() {
    return
  }
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  updateConvex() {
    return
  }
}
