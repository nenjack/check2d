import { BodyGroup, BodyType } from '../model'
import { ensureVectorPoint } from '../utils'
import { Box } from './box'
/**
 * collider - point (very tiny box)
 */
export class Point extends Box {
  /**
   * collider - point (very tiny box)
   */
  constructor(position, options) {
    super(ensureVectorPoint(position), 0.001, 0.001, options)
    /**
     * point type
     */
    this.type = BodyType.Point
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Point
  }
}
