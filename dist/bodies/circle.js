'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.Circle = void 0
const model_1 = require('../model')
const utils_1 = require('../utils')
/**
 * collider - circle
 */
class Circle extends model_1.SATCircle {
  /**
   * collider - circle
   */
  constructor(position, radius, options) {
    super((0, utils_1.ensureVectorPoint)(position), radius)
    /**
     * offset copy without angle applied
     */
    this.offsetCopy = { x: 0, y: 0 }
    /**
     * was the polygon modified and needs update in the next checkCollision
     */
    this.dirty = false
    /*
     * circles are convex
     */
    this.isConvex = true
    /**
     * circle type
     */
    this.type = model_1.BodyType.Circle
    /**
     * faster than type
     */
    this.typeGroup = model_1.BodyGroup.Circle
    /**
     * always centered
     */
    this.isCentered = true
    ;(0, utils_1.extendBody)(this, options)
    this.unscaledRadius = radius
  }
  /**
   * get this.pos.x
   */
  get x() {
    return this.pos.x
  }
  /**
   * updating this.pos.x by this.x = x updates AABB
   */
  set x(x) {
    this.pos.x = x
    this.markAsDirty()
  }
  /**
   * get this.pos.y
   */
  get y() {
    return this.pos.y
  }
  /**
   * updating this.pos.y by this.y = y updates AABB
   */
  set y(y) {
    this.pos.y = y
    this.markAsDirty()
  }
  /**
   * allow get scale
   */
  get scale() {
    return this.r / this.unscaledRadius
  }
  /**
   * shorthand for setScale()
   */
  set scale(scale) {
    this.setScale(scale)
  }
  /**
   * scaleX = scale in case of Circles
   */
  get scaleX() {
    return this.scale
  }
  /**
   * scaleY = scale in case of Circles
   */
  get scaleY() {
    return this.scale
  }
  // Don't overwrite docs from BodyProps
  get group() {
    return this._group
  }
  // Don't overwrite docs from BodyProps
  set group(group) {
    this._group = (0, utils_1.getGroup)(group)
  }
  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed = 1, updateNow = true) {
    ;(0, utils_1.move)(this, speed, updateNow)
    return this
  }
  /**
   * update position BY TELEPORTING
   */
  setPosition(x, y, updateNow = true) {
    this.pos.x = x
    this.pos.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * update scale
   */
  setScale(scaleX, _scaleY = scaleX, updateNow = true) {
    this.r = this.unscaledRadius * Math.abs(scaleX)
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * set rotation
   */
  setAngle(angle, updateNow = true) {
    this.angle = angle
    const { x, y } = this.getOffsetWithAngle()
    this.offset.x = x
    this.offset.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * set offset from center
   */
  setOffset(offset, updateNow = true) {
    this.offsetCopy.x = offset.x
    this.offsetCopy.y = offset.y
    const { x, y } = this.getOffsetWithAngle()
    this.offset.x = x
    this.offset.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * get body bounding box, without padding
   */
  getAABBAsBBox() {
    const x = this.pos.x + this.offset.x
    const y = this.pos.y + this.offset.y
    return {
      minX: x - this.r,
      maxX: x + this.r,
      minY: y - this.r,
      maxY: y + this.r
    }
  }
  /**
   * Draws collider on a CanvasRenderingContext2D's current path
   */
  draw(context) {
    const x = this.pos.x + this.offset.x
    const y = this.pos.y + this.offset.y
    const r = Math.abs(this.r)
    if (this.isTrigger) {
      const max = Math.max(8, this.r)
      for (let i = 0; i < max; i++) {
        const arc = (i / max) * 2 * Math.PI
        const arcPrev = ((i - 1) / max) * 2 * Math.PI
        const fromX = x + Math.cos(arcPrev) * this.r
        const fromY = y + Math.sin(arcPrev) * this.r
        const toX = x + Math.cos(arc) * this.r
        const toY = y + Math.sin(arc) * this.r
        ;(0, utils_1.dashLineTo)(context, fromX, fromY, toX, toY)
      }
    } else {
      context.moveTo(x + r, y)
      context.arc(x, y, r, 0, Math.PI * 2)
    }
  }
  /**
   * Draws Bounding Box on canvas context
   */
  drawBVH(context) {
    ;(0, utils_1.drawBVH)(context, this)
  }
  /**
   * inner function for after position change update aabb in system
   */
  updateBody(updateNow = this.dirty) {
    var _a
    if (updateNow) {
      ;(_a = this.system) === null || _a === void 0 ? void 0 : _a.insert(this)
      this.dirty = false
    }
  }
  /**
   * update instantly or mark as dirty
   */
  markAsDirty(updateNow = false) {
    if (updateNow) {
      this.updateBody(true)
    } else {
      this.dirty = true
    }
  }
  /**
   * internal for getting offset with applied angle
   */
  getOffsetWithAngle() {
    if ((!this.offsetCopy.x && !this.offsetCopy.y) || !this.angle) {
      return this.offsetCopy
    }
    const sin = Math.sin(this.angle)
    const cos = Math.cos(this.angle)
    const x = this.offsetCopy.x * cos - this.offsetCopy.y * sin
    const y = this.offsetCopy.x * sin + this.offsetCopy.y * cos
    return { x, y }
  }
}
exports.Circle = Circle
