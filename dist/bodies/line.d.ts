import { BodyGroup, BodyOptions, BodyType, SATVector, Vector } from '../model'
import { Polygon } from './polygon'
export interface LineConstructor<TLine extends Line> {
  new (start: Vector, end: Vector, options?: BodyOptions): TLine
}
/**
 * collider - line
 */
export declare class Line<UserDataType = any> extends Polygon<UserDataType> {
  /**
   * line type
   */
  readonly type: BodyType.Line
  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Line
  /**
   * line is convex
   */
  readonly isConvex = true
  /**
   * collider - line from start to end
   */
  constructor(start: Vector, end: Vector, options?: BodyOptions<UserDataType>)
  get start(): Vector
  /**
   * @param position
   */
  set start({ x, y }: Vector)
  get end(): Vector
  /**
   * @param position
   */
  set end({ x, y }: Vector)
  getCentroid(): SATVector
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  protected updateConvex(): void
}
