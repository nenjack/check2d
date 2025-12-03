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
export declare class Circle<UserDataType = any>
  extends SATCircle
  implements BBox, BodyProps<UserDataType>
{
  /**
   * minimum x bound of body
   */
  minX: number
  /**
   * maximum x bound of body
   */
  maxX: number
  /**
   * minimum y bound of body
   */
  minY: number
  /**
   * maximum y bound of body
   */
  maxY: number
  /**
   * bounding box cache, without padding
   */
  bbox: BBox
  /**
   * offset
   */
  offset: SATVector
  /**
   * offset copy without angle applied
   */
  offsetCopy: Vector
  /**
   * bodies are not reinserted during update if their bbox didnt move outside bbox + padding
   */
  padding: number
  /**
   * for compatibility reasons circle has angle
   */
  angle: number
  /**
   * static bodies don't move but they collide
   */
  isStatic: boolean
  /**
   * trigger bodies move but are like ghosts
   */
  isTrigger: boolean
  /**
   * reference to collision system
   */
  system?: System
  /**
   * was the polygon modified and needs update in the next checkCollision
   */
  dirty: boolean
  /**
   * allows the user to set any misc data for client use
   */
  userData: BodyProps<UserDataType>['userData']
  readonly isConvex = true
  /**
   * circle type
   */
  readonly type: BodyType.Circle
  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Circle
  /**
   * always centered
   */
  readonly isCentered = true
  /**
   * group for collision filtering
   */
  protected _group: number
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
  )
  /**
   * get this.pos.x
   */
  get x(): number
  /**
   * updating this.pos.x by this.x = x updates AABB
   */
  set x(x: number)
  /**
   * get this.pos.y
   */
  get y(): number
  /**
   * updating this.pos.y by this.y = y updates AABB
   */
  set y(y: number)
  /**
   * allow get scale
   */
  get scale(): number
  /**
   * shorthand for setScale()
   */
  set scale(scale: number)
  /**
   * scaleX = scale in case of Circles
   */
  get scaleX(): number
  /**
   * scaleY = scale in case of Circles
   */
  get scaleY(): number
  get group(): number
  set group(group: number)
  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed?: number, updateNow?: boolean): Circle
  /**
   * update position BY TELEPORTING
   */
  setPosition(x: number, y: number, updateNow?: boolean): Circle
  /**
   * update scale
   */
  setScale(scaleX: number, _scaleY?: number, updateNow?: boolean): Circle
  /**
   * set rotation
   */
  setAngle(angle: number, updateNow?: boolean): Circle
  /**
   * set offset from center
   */
  setOffset(offset: Vector, updateNow?: boolean): Circle
  /**
   * get body bounding box, without padding
   */
  getAABBAsBBox(): BBox
  /**
   * Draws collider on a CanvasRenderingContext2D's current path
   */
  draw(context: CanvasRenderingContext2D): void
  /**
   * Draws Bounding Box on canvas context
   */
  drawBVH(context: CanvasRenderingContext2D): void
  /**
   * inner function for after position change update aabb in system
   */
  updateBody(updateNow?: boolean): void
  /**
   * update instantly or mark as dirty
   */
  protected markAsDirty(updateNow?: boolean): void
  /**
   * internal for getting offset with applied angle
   */
  protected getOffsetWithAngle(): Vector
}
