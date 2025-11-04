import {
  Body,
  BaseCircle,
  BaseLine,
  BasePolygon,
  SATPolygon,
  Vector
} from './model'
import { type Circle } from './bodies/circle'
import { type Point } from './bodies/point'
import { type Polygon } from './bodies/polygon'
/**
 * Converts calcPoints into simple x/y Vectors and adds polygon pos to them
 *
 * @param {BasePolygon} polygon
 * @returns {Vector[]}
 */
export declare function getWorldPoints({
  calcPoints,
  pos
}: BasePolygon): Vector[]
/**
 * replace body with array of related convex polygons
 */
export declare function ensureConvex<
  TBody extends Body = Circle | Point | Polygon
>(body: TBody): (TBody | SATPolygon)[]
/**
 * @param polygon
 * @param circle
 */
export declare function polygonInCircle(
  polygon: BasePolygon,
  circle: BaseCircle
): boolean
export declare function pointInPolygon(point: Vector, polygon: Polygon): boolean
export declare function polygonInPolygon(
  polygonA: Polygon,
  polygonB: Polygon
): boolean
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param point
 * @param circle
 */
export declare function pointOnCircle(
  point: Vector,
  circle: BaseCircle
): boolean
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle1
 * @param circle2
 */
export declare function circleInCircle(
  circle1: BaseCircle,
  circle2: BaseCircle
): boolean
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle
 * @param polygon
 */
export declare function circleInPolygon(
  circle: BaseCircle,
  polygon: Polygon
): boolean
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle
 * @param polygon
 */
export declare function circleOutsidePolygon(
  circle: BaseCircle,
  polygon: Polygon
): boolean
/**
 * https://stackoverflow.com/a/37225895/1749528
 *
 * @param line
 * @param circle
 */
export declare function intersectLineCircle(
  line: BaseLine,
  { pos, r }: BaseCircle
): Vector[]
/**
 * faster implementation of intersectLineLine
 * https://stackoverflow.com/a/16725715/1749528
 *
 * @param line1
 * @param line2
 */
export declare function intersectLineLineFast(
  line1: BaseLine,
  line2: BaseLine
): boolean
/**
 * returns the point of intersection
 * https://stackoverflow.com/a/24392281/1749528
 *
 * @param line1
 * @param line2
 */
export declare function intersectLineLine(
  line1: BaseLine,
  line2: BaseLine
): Vector | undefined
/**
 * Computes all intersection points between two polygons.
 *
 * Iterates over each edge of `polygonA` and checks against `polygonB`
 * using {@link intersectLinePolygon}.
 * Removes duplicates.
 * Also detects corner–corner touches.
 *
 * @param {BasePolygon} polygonA - First polygon
 * @param {BasePolygon} polygonB - Second polygon
 * @returns {Vector[]} Array of intersection points (empty if none found)
 */
export declare function intersectPolygonPolygon(
  polygonA: BasePolygon,
  polygonB: BasePolygon
): Vector[]
/**
 * Computes all intersection points between a line segment and a polygon.
 *
 * @param {BaseLine} line - The line segment
 * @param {BasePolygon} polygon - A polygon object or array of global points
 * @returns {Vector[]} Array of intersection points (empty if none)
 */
export declare function intersectLinePolygon(
  line: BaseLine,
  { calcPoints, pos }: BasePolygon
): Vector[]
/**
 * @param circle1
 * @param circle2
 */
export declare function intersectCircleCircle(
  circle1: BaseCircle,
  circle2: BaseCircle
): Vector[]
