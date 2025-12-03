import {
  Response,
  Circle as SATCircle,
  Polygon as SATPolygon,
  Vector as SATVector
} from 'sat'
// version 4.0.0 1=1 copy
import RBush from './external/rbush'
export { isSimple, quickDecomp } from 'poly-decomp-es'
export { RBush, Response, SATCircle, SATPolygon, SATVector }
/**
 * types
 */
export var BodyType
;(function (BodyType) {
  BodyType['Ellipse'] = 'Ellipse'
  BodyType['Circle'] = 'Circle'
  BodyType['Polygon'] = 'Polygon'
  BodyType['Box'] = 'Box'
  BodyType['Line'] = 'Line'
  BodyType['Point'] = 'Point'
})(BodyType || (BodyType = {}))
/**
 * for groups
 */
export var BodyGroup
;(function (BodyGroup) {
  BodyGroup[(BodyGroup['Ellipse'] = 32)] = 'Ellipse'
  BodyGroup[(BodyGroup['Circle'] = 16)] = 'Circle'
  BodyGroup[(BodyGroup['Polygon'] = 8)] = 'Polygon'
  BodyGroup[(BodyGroup['Box'] = 4)] = 'Box'
  BodyGroup[(BodyGroup['Line'] = 2)] = 'Line'
  BodyGroup[(BodyGroup['Point'] = 1)] = 'Point'
})(BodyGroup || (BodyGroup = {}))
