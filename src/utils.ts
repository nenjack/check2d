/* tslint:disable:cyclomatic-complexity */

import {
  BBox,
  BasePolygon,
  Body,
  BodyGroup,
  BodyOptions,
  BodyType,
  DecompPoint,
  InTest,
  PotentialVector,
  Response,
  SATPolygon,
  SATTest,
  SATVector,
  Vector
} from './model'
import {
  circleInCircle,
  circleInPolygon,
  polygonInCircle,
  polygonInPolygon
} from './intersect'
import { forEach, map } from './optimized'
import {
  testCircleCircle,
  testCirclePolygon,
  testPolygonCircle,
  testPolygonPolygon
} from 'sat'

import { Polygon } from './bodies/polygon'

/* helpers for faster getSATTest() and checkAInB() */

const testMap = {
  satCircleCircle: testCircleCircle,
  satCirclePolygon: testCirclePolygon,
  satPolygonCircle: testPolygonCircle,
  satPolygonPolygon: testPolygonPolygon,
  inCircleCircle: circleInCircle,
  inCirclePolygon: circleInPolygon,
  inPolygonCircle: polygonInCircle,
  inPolygonPolygon: polygonInPolygon
}

function createArray<T = SATTest | InTest>(
  bodyType: BodyType.Circle | BodyType.Polygon,
  testType: 'sat' | 'in'
): T[] {
  const arrayResult: T[] = []
  const bodyGroups = Object.values(BodyGroup).filter(
    (value) => typeof value === 'number'
  )

  forEach(bodyGroups, (bodyGroup: BodyGroup) => {
    arrayResult[bodyGroup] = (
      bodyGroup === BodyGroup.Circle
        ? testMap[`${testType}${bodyType}Circle`]
        : testMap[`${testType}${bodyType}Polygon`]
    ) as T
  })

  return arrayResult
}

const circleSATFunctions = createArray<SATTest>(BodyType.Circle, 'sat')
const circleInFunctions = createArray<InTest>(BodyType.Circle, 'in')
const polygonSATFunctions = createArray<SATTest>(BodyType.Polygon, 'sat')
const polygonInFunctions = createArray<InTest>(BodyType.Polygon, 'in')

export const DEG2RAD = Math.PI / 180

export const RAD2DEG = 180 / Math.PI

export const EPSILON = 1e-9

/**
 * convert from degrees to radians
 */
export function deg2rad(degrees: number) {
  return degrees * DEG2RAD
}

/**
 * convert from radians to degrees
 */
export function rad2deg(radians: number) {
  return radians * RAD2DEG
}
/**
 * Compares two numbers for approximate equality within a given tolerance.
 *
 * Useful for floating-point calculations where exact equality (`===`)
 * is unreliable due to rounding errors.
 *
 * @param {number} a - First number to compare
 * @param {number} b - Second number to compare
 * @param {number} [eps=EPSILON] - Allowed tolerance (default: global EPSILON)
 * @returns {boolean} `true` if numbers differ by less than `eps`
 */
export function almostEqual(
  a: number,
  b: number,
  eps: number = EPSILON
): boolean {
  return Math.abs(a - b) < eps
}

/**
 * Compares two vectors for approximate equality within a tolerance.
 *
 * Uses {@link almostEqual} on both `x` and `y` coordinates.
 * Two points are considered equal if both coordinates are
 * within the allowed tolerance.
 *
 * @param {Vector} a - First vector
 * @param {Vector} b - Second vector
 * @returns {boolean} `true` if both vectors are approximately equal
 */
export function pointsEqual(a: Vector, b: Vector): boolean {
  return almostEqual(a.x, b.x) && almostEqual(a.y, b.y)
}

/**
 * creates ellipse-shaped polygon based on params
 */
export function createEllipse(
  radiusX: number,
  radiusY: number = radiusX,
  step = 1
): SATVector[] {
  const steps: number = Math.PI * Math.hypot(radiusX, radiusY) * 2
  const length: number = Math.max(8, Math.ceil(steps / Math.max(1, step)))
  const ellipse: SATVector[] = []

  for (let index = 0; index < length; index++) {
    const value: number = (index / length) * 2 * Math.PI
    const x: number = Math.cos(value) * radiusX
    const y: number = Math.sin(value) * radiusY

    ellipse.push(new SATVector(x, y))
  }

  return ellipse
}

/**
 * creates box shaped polygon points
 */
export function createBox(width: number, height: number): SATVector[] {
  return [
    new SATVector(0, 0),
    new SATVector(width, 0),
    new SATVector(width, height),
    new SATVector(0, height)
  ]
}

/**
 * ensure SATVector type point result
 */
export function ensureVectorPoint(point: PotentialVector = {}): SATVector {
  return point instanceof SATVector
    ? point
    : new SATVector(point.x || 0, point.y || 0)
}

/**
 * ensure Vector points (for polygon) in counter-clockwise order
 */
export function ensurePolygonPoints(
  points: PotentialVector[] = []
): SATVector[] {
  const polygonPoints: SATVector[] = map(points, ensureVectorPoint)

  return clockwise(polygonPoints) ? polygonPoints.reverse() : polygonPoints
}

/**
 * get distance between two Vector points
 */
export function distance(bodyA: Vector, bodyB: Vector): number {
  const xDiff = bodyA.x - bodyB.x
  const yDiff = bodyA.y - bodyB.y

  return Math.hypot(xDiff, yDiff)
}

/**
 * check [is clockwise] direction of polygon
 */
export function clockwise(points: Vector[]): boolean {
  const length = points.length
  let sum = 0

  forEach(points, (v1, index) => {
    const v2 = points[(index + 1) % length]

    sum += (v2.x - v1.x) * (v2.y + v1.y)
  })

  return sum > 0
}

/**
 * used for all types of bodies in constructor
 */
export function extendBody(body: Body, options: BodyOptions = {}): void {
  body.isStatic = !!options.isStatic
  body.isTrigger = !!options.isTrigger
  body.padding = options.padding || 0
  // Default value should be reflected in documentation of `BodyOptions.group`
  body.group = options.group ?? 0x7fffffff

  if ('userData' in options) {
    body.userData = options.userData
  }

  if (options.isCentered && body.typeGroup !== BodyGroup.Circle) {
    body.isCentered = true
  }

  if (options.angle) {
    body.setAngle(options.angle)
  }
}

/**
 * check if body moved outside of its padding
 */
export function bodyMoved(body: Body): boolean {
  const { bbox, minX, minY, maxX, maxY } = body

  return (
    bbox.minX < minX || bbox.minY < minY || bbox.maxX > maxX || bbox.maxY > maxY
  )
}

/**
 * returns true if two boxes not intersect
 */
export function notIntersectAABB(bodyA: BBox, bodyB: BBox): boolean {
  return (
    bodyB.minX > bodyA.maxX ||
    bodyB.minY > bodyA.maxY ||
    bodyB.maxX < bodyA.minX ||
    bodyB.maxY < bodyA.minY
  )
}

/**
 * checks if two boxes intersect
 */
export function intersectAABB(bodyA: BBox, bodyB: BBox): boolean {
  return !notIntersectAABB(bodyA, bodyB)
}

/**
 * checks if two bodies can interact (for collision filtering)
 *
 * Based on {@link https://box2d.org/documentation/md_simulation.html#filtering Box2D}
 * ({@link https://aurelienribon.wordpress.com/2011/07/01/box2d-tutorial-collision-filtering/ tutorial})
 *
 * @param bodyA
 * @param bodyB
 *
 * @example
 * const body1 = { group: 0b00000000_00000000_00000001_00000000 }
 * const body2 = { group: 0b11111111_11111111_00000011_00000000 }
 * const body3 = { group: 0b00000010_00000000_00000100_00000000 }
 *
 * // Body 1 has the first custom group but cannot interact with any other groups
 * // except itself because the first 16 bits are all zeros, only bodies with an
 * // identical value can interact with it.
 * canInteract(body1, body1) // returns true (identical groups can always interact)
 * canInteract(body1, body2) // returns false
 * canInteract(body1, body3) // returns false
 *
 * // Body 2 has the first and second group and can interact with all other
 * // groups, but only if that body also can interact with is custom group.
 * canInteract(body2, body1) // returns false (body1 cannot interact with others)
 * canInteract(body2, body2) // returns true (identical groups can always interact)
 * canInteract(body2, body3) // returns true
 *
 * // Body 3 has the third group but can interact with the second group.
 * // This means that Body 2 and Body 3 can interact with each other but no other
 * // body can interact with Body 1 because it doesn't allow interactions with
 * // any other custom group.
 * canInteract(body3, body1) // returns false (body1 cannot interact with others)
 * canInteract(body3, body2) // returns true
 * canInteract(body3, body3) // returns true (identical groups can always interact)
 */
export function canInteract(
  { group: groupA }: Body,
  { group: groupB }: Body
): boolean {
  const categoryA = groupA >> 16
  const categoryB = groupB >> 16
  const maskA = groupA & 0xffff
  const maskB = groupB & 0xffff
  return (categoryA & maskB) !== 0 && (categoryB & maskA) !== 0 // Box2D rules
}

/**
 * checks if body a is in body b
 */
export function checkAInB(bodyA: Body, bodyB: Body): boolean {
  const check =
    bodyA.typeGroup === BodyGroup.Circle
      ? circleInFunctions
      : polygonInFunctions

  return check[bodyB.typeGroup](bodyA, bodyB)
}

/**
 * clone sat vector points array into vector points array
 */
export function clonePointsArray(points: SATVector[]): Vector[] {
  return map(points, ({ x, y }: Vector) => ({ x, y }))
}

/**
 * change format from SAT.js to poly-decomp
 *
 * @param position
 */
export function mapVectorToArray(
  { x, y }: Vector = { x: 0, y: 0 }
): DecompPoint {
  return [x, y]
}

/**
 * change format from poly-decomp to SAT.js
 *
 * @param positionAsArray
 */
export function mapArrayToVector([x, y]: DecompPoint = [0, 0]): Vector {
  return { x, y }
}

/**
 * given 2 bodies calculate vector of bounce assuming equal mass and they are circles
 */
export function getBounceDirection(body: Vector, collider: Vector): SATVector {
  const v2 = new SATVector(collider.x - body.x, collider.y - body.y)
  const v1 = new SATVector(body.x - collider.x, body.y - collider.y)
  const len = v1.dot(v2.normalize()) * 2

  return new SATVector(v2.x * len - v1.x, v2.y * len - v1.y).normalize()
}

/**
 * returns correct sat.js testing function based on body types
 */
export function getSATTest(bodyA: Body, bodyB: Body): SATTest {
  const check =
    bodyA.typeGroup === BodyGroup.Circle
      ? circleSATFunctions
      : polygonSATFunctions

  return check[bodyB.typeGroup]
}

/**
 * draws dashed line on canvas context
 */
export function dashLineTo(
  context: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  dash = 2,
  gap = 4
): void {
  const xDiff = toX - fromX
  const yDiff = toY - fromY
  const arc = Math.atan2(yDiff, xDiff)
  const offsetX = Math.cos(arc)
  const offsetY = Math.sin(arc)

  let posX = fromX
  let posY = fromY
  let dist = Math.hypot(xDiff, yDiff)

  while (dist > 0) {
    const step = Math.min(dist, dash)
    context.moveTo(posX, posY)
    context.lineTo(posX + offsetX * step, posY + offsetY * step)
    posX += offsetX * (dash + gap)
    posY += offsetY * (dash + gap)
    dist -= dash + gap
  }
}

/**
 * draw polygon
 *
 * @param context
 * @param polygon
 * @param isTrigger
 */
export function drawPolygon(
  context: CanvasRenderingContext2D,
  {
    pos,
    calcPoints
  }: Pick<Polygon | SATPolygon, 'calcPoints'> & { pos: Vector },
  isTrigger = false
): void {
  const lastPoint = calcPoints[calcPoints.length - 1]
  const fromX = pos.x + lastPoint.x
  const fromY = pos.y + lastPoint.y

  if (calcPoints.length === 1) {
    context.arc(fromX, fromY, 1, 0, Math.PI * 2)
  } else {
    context.moveTo(fromX, fromY)
  }

  forEach(calcPoints, (point, index) => {
    const toX = pos.x + point.x
    const toY = pos.y + point.y

    if (isTrigger) {
      const prev = calcPoints[index - 1] || lastPoint
      dashLineTo(context, pos.x + prev.x, pos.y + prev.y, toX, toY)
    } else {
      context.lineTo(toX, toY)
    }
  })
}

/**
 * draw body bounding body box
 */
export function drawBVH(
  context: CanvasRenderingContext2D,
  body: Body,
  isTrigger = true
) {
  drawPolygon(
    context,
    {
      pos: { x: body.minX, y: body.minY },
      calcPoints: createBox(body.maxX - body.minX, body.maxY - body.minY)
    },
    isTrigger
  )
}

/**
 * clone response object returning new response with previous ones values
 */
export function cloneResponse(response: Response) {
  const clone = new Response()
  const { a, b, overlap, overlapN, overlapV, aInB, bInA } = response
  clone.a = a
  clone.b = b
  clone.overlap = overlap
  clone.overlapN = overlapN.clone()
  clone.overlapV = overlapV.clone()
  clone.aInB = aInB
  clone.bInA = bInA

  return clone
}

/**
 * dummy fn used as default, for optimization
 */
export function returnTrue() {
  return true
}

/**
 * for groups
 */
export function getGroup(group: number): number {
  return Math.max(0, Math.min(group, 0x7fffffff))
}

/**
 * binary string to decimal number
 */
export function bin2dec(binary: string): number {
  return Number(`0b${binary}`.replace(/\s/g, ''))
}

/**
 * helper for groupBits()
 *
 * @param input - number or binary string
 */
export function ensureNumber(input: number | string): number {
  return typeof input === 'number' ? input : bin2dec(input)
}

/**
 * create group bits from category and mask
 *
 * @param category - category bits
 * @param mask - mask bits (default: category)
 */
export function groupBits(
  category: number | string,
  mask: number | string = category
) {
  return (ensureNumber(category) << 16) | ensureNumber(mask)
}

export function move(body: Body, speed = 1, updateNow = true) {
  if (!speed) {
    return
  }
  const moveX = Math.cos(body.angle) * speed
  const moveY = Math.sin(body.angle) * speed
  body.setPosition(body.x + moveX, body.y + moveY, updateNow)
}
