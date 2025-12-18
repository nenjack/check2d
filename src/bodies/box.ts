import { BodyGroup, BodyOptions, BodyType, PotentialVector } from '../model'

import { Polygon } from './polygon'
import { createBox } from '../utils'

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
export class Box<UserDataType = any> extends Polygon<UserDataType> {
  /**
   * type of body
   */
  readonly type: BodyType.Box | BodyType.Point = BodyType.Box

  /**
   * faster than type
   */
  readonly typeGroup: BodyGroup.Box | BodyGroup.Point = BodyGroup.Box

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
  ) {
    super(position, createBox(width, height), options)

    this._width = width
    this._height = height
  }

  /**
   * get box width
   */
  get width(): number {
    return this._width
  }

  /**
   * set box width, update points
   */
  set width(width: number) {
    this._width = width
    this.afterUpdateSize()
  }

  /**
   * get box height
   */
  get height(): number {
    return this._height
  }

  /**
   * set box height, update points
   */
  set height(height: number) {
    this._height = height
    this.afterUpdateSize()
  }

  /**
   * after setting width/height update translate
   * see https://github.com/nenjack/check2d/issues/70
   */
  protected afterUpdateSize(): void {
    this.setPoints(createBox(this._width, this._height))
  }

  /**
   * do not attempt to use Polygon.updateConvex()
   */
  protected updateConvex(): void {
    return
  }
}
