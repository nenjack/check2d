import {
  Response,
  Circle as SATCircle,
  Polygon as SATPolygon,
  Vector as SATVector
} from 'sat'
import { Box } from './bodies/box'
import { Circle } from './bodies/circle'
import { Ellipse } from './bodies/ellipse'
import { Line } from './bodies/line'
import { Point } from './bodies/point'
import { Polygon } from './bodies/polygon'
import { System } from './system'
import RBush from './external/rbush'
export {
  Point as DecompPoint,
  Polygon as DecompPolygon,
  isSimple,
  quickDecomp
} from 'poly-decomp-es'
export type BasePoint = {
  pos: Vector
}
export type BasePolygon = BasePoint & {
  calcPoints: Vector[]
}
export type BaseCircle = BasePoint & {
  r: number
}
export type BaseLine = {
  start: Vector
  end: Vector
}
export interface BBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}
export { RBush, Response, SATCircle, SATPolygon, SATVector }
export type CollisionCallback = (response: Response) => boolean | void
/**
 * types
 */
export declare enum BodyType {
  Ellipse = 'Ellipse',
  Circle = 'Circle',
  Polygon = 'Polygon',
  Box = 'Box',
  Line = 'Line',
  Point = 'Point'
}
/**
 * for groups
 */
export declare enum BodyGroup {
  Ellipse = 32,
  Circle = 16,
  Polygon = 8,
  Box = 4,
  Line = 2,
  Point = 1
}
/**
 * body with children (rbush)
 */
export type Leaf<TBody extends Body> = TBody & {
  children?: Leaf<TBody>[]
}
/**
 * rbush data
 */
export interface ChildrenData<TBody extends Body> {
  children: Leaf<TBody>[]
}
/**
 * for use of private function of sat.js
 */
export interface Data<TBody extends Body> {
  data: ChildrenData<TBody>
}
/**
 * BodyOptions for body creation
 */
export interface BodyOptions<UserDataType = any> {
  /**
   * check2d.separate() doesn't move this body
   */
  isStatic?: boolean
  /**
   * check2d.separate() doesn't trigger collision of this body
   */
  isTrigger?: boolean
  /**
   * is body offset centered for rotation purpouses
   */
  isCentered?: boolean
  /**
   * body angle in radians use deg2rad to convert
   * move(speed) moves at `1 speed = 1px` towards angle
   */
  angle?: number
  /**
   * BHV padding for bounding box, preventing costly updates
   */
  padding?: number
  /**
   * group for collision filtering
   *
   * Based on {@link https://box2d.org/documentation/md_simulation.html#filtering Box2D}
   * ({@link https://aurelienribon.wordpress.com/2011/07/01/box2d-tutorial-collision-filtering/ tutorial})
   *
   * Values in {@link BodyGroup} are predefined and used each the body type and
   * should not be used for custom filtering
   *
   * `0b00000001 << 16` to `0b01000000 << 16` (max 0x7fffffff) are free to use for custom groups
   *
   * @see {@link canInteract} for how groups are used
   * @default 0x7fffffff // member of all groups (can interact with everyting)
   */
  group?: number
  /**
   * allows the user to set any misc data for client use
   */
  userData?: UserDataType
}
/**
 * check2d.raycast(from, to) result
 */
export interface RaycastHit<TBody> {
  point: Vector
  body: TBody
}
/**
 * potential vector
 */
export interface PotentialVector {
  x?: number
  y?: number
}
/**
 * x, y vector
 */
export interface Vector extends PotentialVector {
  x: number
  y: number
}
/**
 * for use of private function of sat.js
 */
export interface GetAABBAsBox {
  getAABBAsBox(): {
    pos: Vector
    w: number
    h: number
  }
}
/**
 * generic body union type
 */
export type Body<UserDataType = any> =
  | Point<UserDataType>
  | Line<UserDataType>
  | Ellipse<UserDataType>
  | Circle<UserDataType>
  | Box<UserDataType>
  | Polygon<UserDataType>
/**
 * each body contains those regardless of type
 */
export interface BodyProps<UserDataType = any>
  extends BodyOptions<UserDataType> {
  /**
   * type of body
   */
  readonly type: BodyType
  /**
   * faster for comparision, inner, type of body as number
   */
  readonly typeGroup: BodyGroup
  /**
   * flag to show is it a convex body or non convex polygon
   */
  isConvex: boolean
  /**
   * bounding box cache, without padding
   */
  bbox: BBox
  /**
   * each body may have offset from center
   */
  offset: SATVector
  /**
   * collisions system reference
   */
  system?: System
  /**
   * was the body modified and needs update in the next checkCollision
   */
  dirty: boolean
  /**
   * scale getter (x)
   */
  get scaleX(): number
  /**
   * scale getter (y = x for Circle)
   */
  get scaleY(): number
  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed: number, updateNow?: boolean): Circle | SATPolygon
  /**
   * update position BY TELEPORTING
   */
  setPosition(x: number, y: number, updateNow?: boolean): Circle | SATPolygon
  /**
   * for setting scale
   */
  setScale(x: number, y: number, updateNow?: boolean): Circle | SATPolygon
  /**
   * for setting angle
   */
  setAngle(angle: number, updateNow?: boolean): Circle | SATPolygon
  /**
   * for setting offset from center
   */
  setOffset(offset: Vector, updateNow?: boolean): Circle | SATPolygon
  /**
   * draw the bounding box
   */
  drawBVH(context: CanvasRenderingContext2D): void
  /**
   * draw the collider
   */
  draw(context: CanvasRenderingContext2D): void
  /**
   * return bounding box without padding
   */
  getAABBAsBBox(): BBox
}
export type SATTest<
  T extends {} = Circle | Polygon | SATPolygon,
  Y extends {} = Circle | Polygon | SATPolygon
> = (bodyA: T, bodyB: Y, response: Response) => boolean
export type InTest<TBody extends Body = Body> = (
  bodyA: TBody,
  bodyB: TBody
) => boolean
export type TraverseFunction<TBody extends Body = Body> = (
  child: Leaf<TBody>,
  children: Leaf<TBody>[],
  index: number
) => boolean | void
