import {
  BBox,
  BodyGroup,
  BodyOptions,
  BodyProps,
  BodyType,
  PotentialVector,
  SATCircle,
  SATVector,
  Vector
} from '../model'
import { System } from '../system'
import {
  dashLineTo,
  drawBVH,
  ensureVectorPoint,
  extendBody,
  getGroup,
  move
} from '../utils'

export interface CircleConstructor<TCircle extends Circle> {
  new (
    position: PotentialVector,
    radius: number,
    options?: BodyOptions
  ): TCircle
}

/**
 * collider - circle
 */
export class Circle<UserDataType = any>
  extends SATCircle
  implements BBox, BodyProps<UserDataType>
{
  /**
   * minimum x bound of body
   */
  minX!: number

  /**
   * maximum x bound of body
   */
  maxX!: number

  /**
   * minimum y bound of body
   */
  minY!: number

  /**
   * maximum y bound of body
   */
  maxY!: number

  /**
   * bounding box cache, without padding
   */
  bbox!: BBox

  /**
   * offset
   */
  offset!: SATVector

  /**
   * offset copy without angle applied
   */
  offsetCopy: Vector = { x: 0, y: 0 }

  /**
   * bodies are not reinserted during update if their bbox didnt move outside bbox + padding
   */
  padding!: number

  /**
   * for compatibility reasons circle has angle
   */
  angle!: number

  /**
   * static bodies don't move but they collide
   */
  isStatic!: boolean

  /**
   * trigger bodies move but are like ghosts
   */
  isTrigger!: boolean

  /**
   * reference to collision system
   */
  system?: System

  /**
   * was the polygon modified and needs update in the next checkCollision
   */
  dirty = false

  /**
   * allows the user to set any misc data for client use
   */
  userData!: BodyProps<UserDataType>['userData']

  /*
   * circles are convex
   */
  readonly isConvex = true

  /**
   * circle type
   */
  readonly type: BodyType.Circle = BodyType.Circle

  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Circle = BodyGroup.Circle

  /**
   * always centered
   */
  readonly isCentered = true

  /**
   * group for collision filtering
   */
  protected _group!: number

  /**
   * saved initial radius - internal
   */
  protected readonly unscaledRadius: number

  /**
   * collider - circle
   */
  constructor(
    position: PotentialVector,
    radius: number,
    options?: BodyOptions<UserDataType>
  ) {
    super(ensureVectorPoint(position), radius)

    extendBody(this, options)

    this.unscaledRadius = radius
  }

  /**
   * get this.pos.x
   */
  get x(): number {
    return this.pos.x
  }

  /**
   * updating this.pos.x by this.x = x updates AABB
   */
  set x(x: number) {
    this.pos.x = x
    this.markAsDirty()
  }

  /**
   * get this.pos.y
   */
  get y(): number {
    return this.pos.y
  }

  /**
   * updating this.pos.y by this.y = y updates AABB
   */
  set y(y: number) {
    this.pos.y = y
    this.markAsDirty()
  }

  /**
   * allow get scale
   */
  get scale(): number {
    return this.r / this.unscaledRadius
  }

  /**
   * shorthand for setScale()
   */
  set scale(scale: number) {
    this.setScale(scale)
  }

  /**
   * scaleX = scale in case of Circles
   */
  get scaleX(): number {
    return this.scale
  }

  /**
   * scaleY = scale in case of Circles
   */
  get scaleY(): number {
    return this.scale
  }

  // Don't overwrite docs from BodyProps
  get group(): number {
    return this._group
  }

  // Don't overwrite docs from BodyProps
  set group(group: number) {
    this._group = getGroup(group)
  }

  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed = 1, updateNow = true): Circle {
    move(this, speed, updateNow)

    return this
  }

  /**
   * update position BY TELEPORTING
   */
  setPosition(x: number, y: number, updateNow = true): Circle {
    this.pos.x = x
    this.pos.y = y
    this.markAsDirty(updateNow)

    return this
  }

  /**
   * update scale
   */
  setScale(scaleX: number, _scaleY = scaleX, updateNow = true): Circle {
    this.r = this.unscaledRadius * Math.abs(scaleX)
    this.markAsDirty(updateNow)

    return this
  }

  /**
   * set rotation
   */
  setAngle(angle: number, updateNow = true): Circle {
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
  setOffset(offset: Vector, updateNow = true): Circle {
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
  getAABBAsBBox(): BBox {
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
  draw(context: CanvasRenderingContext2D) {
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

        dashLineTo(context, fromX, fromY, toX, toY)
      }
    } else {
      context.moveTo(x + r, y)
      context.arc(x, y, r, 0, Math.PI * 2)
    }
  }

  /**
   * Draws Bounding Box on canvas context
   */
  drawBVH(context: CanvasRenderingContext2D) {
    drawBVH(context, this)
  }

  /**
   * inner function for after position change update aabb in system
   */
  updateBody(updateNow = this.dirty): void {
    if (updateNow) {
      this.system?.insert(this)
      this.dirty = false
    }
  }

  /**
   * update instantly or mark as dirty
   */
  protected markAsDirty(updateNow = false): void {
    if (updateNow) {
      this.updateBody(true)
    } else {
      this.dirty = true
    }
  }

  /**
   * internal for getting offset with applied angle
   */
  protected getOffsetWithAngle(): Vector {
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
