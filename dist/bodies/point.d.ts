import { BodyGroup, BodyOptions, BodyType, PotentialVector } from '../model'
import { Box } from './box'
export interface PointConstructor<TPoint extends Point> {
  new (position: PotentialVector, options?: BodyOptions): TPoint
}
/**
 * collider - point (very tiny box)
 */
export declare class Point<UserDataType = any> extends Box<UserDataType> {
  /**
   * point type
   */
  readonly type: BodyType.Point
  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Point
  /**
   * collider - point (very tiny box)
   */
  constructor(position: PotentialVector, options?: BodyOptions<UserDataType>)
}
