import { BodyGroup, BodyOptions, BodyType, PotentialVector } from '../model'
import { Polygon } from './polygon'
export interface BoxConstructor<TBox extends Box> {
  new (
    position: PotentialVector,
    width: number,
    height: number,
    options?: BodyOptions
  ): TBox
}
/**
 * collider - box
 */
export declare class Box<UserDataType = any> extends Polygon<UserDataType> {
  /**
   * type of body
   */
  readonly type: BodyType.Box | BodyType.Point
  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Box | BodyGroup.Point
  /**
   * boxes are convex
   */
  readonly isConvex = true
  /**
   * inner width
   */
  protected _width: number
  /**
   * inner height
   */
  protected _height: number
  /**
   * collider - box
   */
  constructor(
    position: PotentialVector,
    width: number,
    height: number,
    options?: BodyOptions<UserDataType>
  )
  /**
   * get box width
   */
  get width(): number
  /**
   * set box width, update points
   */
  set width(width: number)
  /**
   * get box height
   */
  get height(): number
  /**
   * set box height, update points
   */
  set height(height: number)
  /**
   * after setting width/height update translate
   * see https://github.com/nenjack/check2d/issues/70
   */
  protected afterUpdateSize(): void
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  protected updateConvex(): void
}
