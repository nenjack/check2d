import { BodyGroup, BodyOptions, BodyType, PotentialVector } from '../model'
import { Polygon } from './polygon'
export interface EllipseConstructor<TEllipse extends Ellipse> {
  new (
    position: PotentialVector,
    radiusX: number,
    radiusY?: number,
    step?: number,
    options?: BodyOptions
  ): TEllipse
}
/**
 * collider - ellipse
 */
export declare class Ellipse<UserDataType = any> extends Polygon<UserDataType> {
  /**
   * ellipse type
   */
  readonly type: BodyType.Ellipse
  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Ellipse
  /**
   * ellipses are convex
   */
  readonly isConvex = true
  /**
   * inner initial params save
   */
  protected _radiusX: number
  protected _radiusY: number
  protected _step: number
  /**
   * collider - ellipse
   */
  constructor(
    position: PotentialVector,
    radiusX: number,
    radiusY?: number,
    step?: number,
    options?: BodyOptions<UserDataType>
  )
  /**
   * flag to set is body centered
   */
  set isCentered(_isCentered: boolean)
  /**
   * is body centered?
   */
  get isCentered(): boolean
  /**
   * get ellipse step number
   */
  get step(): number
  /**
   * set ellipse step number
   */
  set step(step: number)
  /**
   * get ellipse radiusX
   */
  get radiusX(): number
  /**
   * set ellipse radiusX, update points
   */
  set radiusX(radiusX: number)
  /**
   * get ellipse radiusY
   */
  get radiusY(): number
  /**
   * set ellipse radiusY, update points
   */
  set radiusY(radiusY: number)
  /**
   * do not attempt to use Polygon.center()
   */
  center(): void
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  protected updateConvex(): void
}
