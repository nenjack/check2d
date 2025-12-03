/* tslint:disable:trailing-whitespace */
/* tslint:disable:cyclomatic-complexity */
import { BodyGroup } from './model'
import { every, forEach, map, some } from './optimized'
import { pointInCircle, pointInPolygon as pointInConvexPolygon } from 'sat'
/**
 * Converts calcPoints into simple x/y Vectors and adds polygon pos to them
 *
 * @param {BasePolygon} polygon
 * @returns {Vector[]}
 */
export function getWorldPoints({ calcPoints, pos }) {
  return map(calcPoints, ({ x, y }) => ({
    x: x + pos.x,
    y: y + pos.y
  }))
}
/**
 * replace body with array of related convex polygons
 */
export function ensureConvex(body) {
  if (body.isConvex || body.typeGroup !== BodyGroup.Polygon) {
    return [body]
  }
  return body.convexPolygons
}
/**
 * @param polygon
 * @param circle
 */
export function polygonInCircle(polygon, circle) {
  const points = getWorldPoints(polygon)
  return every(points, (point) => {
    return pointInCircle(point, circle)
  })
}
export function pointInPolygon(point, polygon) {
  return some(ensureConvex(polygon), (convex) =>
    pointInConvexPolygon(point, convex)
  )
}
export function polygonInPolygon(polygonA, polygonB) {
  const points = getWorldPoints(polygonA)
  return every(points, (point) => pointInPolygon(point, polygonB))
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param point
 * @param circle
 */
export function pointOnCircle(point, circle) {
  return (
    (point.x - circle.pos.x) * (point.x - circle.pos.x) +
      (point.y - circle.pos.y) * (point.y - circle.pos.y) ===
    circle.r * circle.r
  )
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle1
 * @param circle2
 */
export function circleInCircle(circle1, circle2) {
  const x1 = circle1.pos.x
  const y1 = circle1.pos.y
  const x2 = circle2.pos.x
  const y2 = circle2.pos.y
  const r1 = circle1.r
  const r2 = circle2.r
  const distSq = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  return distSq + r2 === r1 || distSq + r2 < r1
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle
 * @param polygon
 */
export function circleInPolygon(circle, polygon) {
  // Circle with radius 0 isn't a circle
  if (circle.r === 0) {
    return false
  }
  // If the center of the circle is not within the polygon,
  // then the circle may overlap, but it'll never be "contained"
  // so return false
  if (!pointInPolygon(circle.pos, polygon)) {
    return false
  }
  // Necessary add polygon pos to points
  const points = getWorldPoints(polygon)
  // If the center of the circle is within the polygon,
  // the circle is not outside of the polygon completely.
  // so return false.
  if (some(points, (point) => pointInCircle(point, circle))) {
    return false
  }
  // If any line-segment of the polygon intersects the circle,
  // the circle is not "contained"
  // so return false
  if (
    some(points, (end, index) => {
      const start = index ? points[index - 1] : points[points.length - 1]
      return intersectLineCircle({ start, end }, circle).length > 0
    })
  ) {
    return false
  }
  return true
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle
 * @param polygon
 */
export function circleOutsidePolygon(circle, polygon) {
  // Circle with radius 0 isn't a circle
  if (circle.r === 0) {
    return false
  }
  // If the center of the circle is within the polygon,
  // the circle is not outside of the polygon completely.
  // so return false.
  if (pointInPolygon(circle.pos, polygon)) {
    return false
  }
  // Necessary add polygon pos to points
  const points = getWorldPoints(polygon)
  // If the center of the circle is within the polygon,
  // the circle is not outside of the polygon completely.
  // so return false.
  if (
    some(
      points,
      (point) => pointInCircle(point, circle) || pointOnCircle(point, circle)
    )
  ) {
    return false
  }
  // If any line-segment of the polygon intersects the circle,
  // the circle is not "contained"
  // so return false
  if (
    some(points, (end, index) => {
      const start = index ? points[index - 1] : points[points.length - 1]
      return intersectLineCircle({ start, end }, circle).length > 0
    })
  ) {
    return false
  }
  return true
}
/**
 * https://stackoverflow.com/a/37225895/1749528
 *
 * @param line
 * @param circle
 */
export function intersectLineCircle(line, { pos, r }) {
  const v1 = { x: line.end.x - line.start.x, y: line.end.y - line.start.y }
  const v2 = { x: line.start.x - pos.x, y: line.start.y - pos.y }
  const b = (v1.x * v2.x + v1.y * v2.y) * -2
  const c = (v1.x * v1.x + v1.y * v1.y) * 2
  const d = Math.sqrt(b * b - (v2.x * v2.x + v2.y * v2.y - r * r) * c * 2)
  if (isNaN(d)) {
    // no intercept
    return []
  }
  const u1 = (b - d) / c // these represent the unit distance of point one and two on the line
  const u2 = (b + d) / c
  const results = [] // return array
  if (u1 <= 1 && u1 >= 0) {
    // add point if on the line segment
    results.push({ x: line.start.x + v1.x * u1, y: line.start.y + v1.y * u1 })
  }
  if (u2 <= 1 && u2 >= 0) {
    // second add point if on the line segment
    results.push({ x: line.start.x + v1.x * u2, y: line.start.y + v1.y * u2 })
  }
  return results
}
/**
 * helper for intersectLineLineFast
 */
function isTurn(point1, point2, point3) {
  const A = (point3.x - point1.x) * (point2.y - point1.y)
  const B = (point2.x - point1.x) * (point3.y - point1.y)
  return A > B + Number.EPSILON ? 1 : A + Number.EPSILON < B ? -1 : 0
}
/**
 * faster implementation of intersectLineLine
 * https://stackoverflow.com/a/16725715/1749528
 *
 * @param line1
 * @param line2
 */
export function intersectLineLineFast(line1, line2) {
  return (
    isTurn(line1.start, line2.start, line2.end) !==
      isTurn(line1.end, line2.start, line2.end) &&
    isTurn(line1.start, line1.end, line2.start) !==
      isTurn(line1.start, line1.end, line2.end)
  )
}
/**
 * returns the point of intersection
 * https://stackoverflow.com/a/24392281/1749528
 *
 * @param line1
 * @param line2
 */
export function intersectLineLine(line1, line2) {
  const dX = line1.end.x - line1.start.x
  const dY = line1.end.y - line1.start.y
  const determinant =
    dX * (line2.end.y - line2.start.y) - (line2.end.x - line2.start.x) * dY
  if (Math.abs(determinant) < Number.EPSILON) {
    return
  }
  const lambda =
    ((line2.end.y - line2.start.y) * (line2.end.x - line1.start.x) +
      (line2.start.x - line2.end.x) * (line2.end.y - line1.start.y)) /
    determinant
  const gamma =
    ((line1.start.y - line1.end.y) * (line2.end.x - line1.start.x) +
      dX * (line2.end.y - line1.start.y)) /
    determinant
  // stricter check – no eps fudge, only inside [0,1]
  if (lambda < 0 || lambda > 1 || gamma < 0 || gamma > 1) {
    return
  }
  return { x: line1.start.x + lambda * dX, y: line1.start.y + lambda * dY }
}
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
export function intersectPolygonPolygon(polygonA, polygonB) {
  const pointsA = getWorldPoints(polygonA)
  const pointsB = getWorldPoints(polygonB)
  const results = []
  forEach(pointsA, (start, index) => {
    const end = pointsA[(index + 1) % pointsA.length]
    forEach(
      intersectLinePolygon(
        { start, end },
        { pos: { x: 0, y: 0 }, calcPoints: pointsB }
      ),
      ({ x, y }) => {
        // add unique
        if (!results.find((point) => x === point.x && y === point.y)) {
          results.push({ x, y })
        }
      }
    )
  })
  return results
}
/**
 * Computes all intersection points between a line segment and a polygon.
 *
 * @param {BaseLine} line - The line segment
 * @param {BasePolygon} polygon - A polygon object or array of global points
 * @returns {Vector[]} Array of intersection points (empty if none)
 */
export function intersectLinePolygon(line, { calcPoints, pos }) {
  const results = []
  forEach(calcPoints, (to, index) => {
    const from = index
      ? calcPoints[index - 1]
      : calcPoints[calcPoints.length - 1]
    const side = {
      start: { x: from.x + pos.x, y: from.y + pos.y },
      end: { x: to.x + pos.x, y: to.y + pos.y }
    }
    const hit = intersectLineLine(line, side)
    if (hit) {
      results.push(hit)
    }
  })
  return results
}
/**
 * @param circle1
 * @param circle2
 */
export function intersectCircleCircle(circle1, circle2) {
  const results = []
  const x1 = circle1.pos.x
  const y1 = circle1.pos.y
  const r1 = circle1.r
  const x2 = circle2.pos.x
  const y2 = circle2.pos.y
  const r2 = circle2.r
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > r1 + r2 || dist < Math.abs(r1 - r2) || dist === 0) {
    return results
  }
  const a = (r1 * r1 - r2 * r2 + dist * dist) / (2 * dist)
  const h = Math.sqrt(r1 * r1 - a * a)
  const px = x1 + (dx * a) / dist
  const py = y1 + (dy * a) / dist
  const intersection1 = {
    x: px + (h * dy) / dist,
    y: py - (h * dx) / dist
  }
  results.push(intersection1)
  const intersection2 = {
    x: px - (h * dy) / dist,
    y: py + (h * dx) / dist
  }
  results.push(intersection2)
  return results
}
