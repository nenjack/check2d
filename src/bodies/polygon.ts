import {
  BBox,
  BodyGroup,
  BodyOptions,
  BodyProps,
  BodyType,
  DecompPolygon,
  GetAABBAsBox,
  PotentialVector,
  SATPolygon,
  SATVector,
  Vector,
  isSimple,
  quickDecomp
} from '../model'
import { forEach, map } from '../optimized'
import {
  clonePointsArray,
  drawBVH,
  drawPolygon,
  ensurePolygonPoints,
  ensureVectorPoint,
  extendBody,
  getGroup,
  mapArrayToVector,
  mapVectorToArray,
  move
} from '../utils'

import { System } from '../system'

export interface PolygonConstructor<TPolygon extends Polygon> {
  new (
    position: PotentialVector,
    points: PotentialVector[],
    options?: BodyOptions
  ): TPolygon
}

/**
 * collider - polygon
 */
export class Polygon<UserDataType = any>
  extends SATPolygon
  implements BBox, BodyProps<UserDataType>
{
  /**
   * minimum x bound of body
   */
  minX!: number

  /**
   * maximum x bound of body
   */
  maxX!: number

  /**
   * minimum y bound of body
   */
  minY!: number

  /**
   * maximum y bound of body
   */
  maxY!: number

  /**
   * bounding box cache, without padding
   */
  bbox!: BBox

  /**
   * is it a convex polgyon as opposed to a hollow inside (concave) polygon
   */
  isConvex!: boolean

  /**
   * optimization for convex polygons
   */
  convexPolygons!: SATPolygon[]

  /**
   * bodies are not reinserted during update if their bbox didnt move outside bbox + padding
   */
  padding!: number

  /**
   * static bodies don't move but they collide
   */
  isStatic!: boolean

  /**
   * trigger bodies move but are like ghosts
   */
  isTrigger!: boolean

  /**
   * reference to collision system
   */
  system?: System

  /**
   * was the polygon modified and needs update in the next checkCollision
   */
  dirty = false

  /**
   * allows the user to set any misc data for client use
   */
  userData!: BodyProps<UserDataType>['userData']

  /**
   * type of body
   */
  readonly type:
    | BodyType.Polygon
    | BodyType.Box
    | BodyType.Point
    | BodyType.Ellipse
    | BodyType.Line = BodyType.Polygon

  /**
   * faster than type
   */
  readonly typeGroup:
    | BodyGroup.Polygon
    | BodyGroup.Box
    | BodyGroup.Point
    | BodyGroup.Ellipse
    | BodyGroup.Line = BodyGroup.Polygon

  /**
   * backup of points used for scaling
   */
  protected pointsBackup!: Vector[]

  /**
   * is body centered
   */
  protected centered = false

  /**
   * group for collision filtering
   */
  protected _group!: number

  /**
   * scale Vector of body
   */
  protected readonly scaleVector: Vector = { x: 1, y: 1 }

  /**
   * collider - polygon
   */
  constructor(
    position: PotentialVector,
    points: PotentialVector[],
    options?: BodyOptions<UserDataType>
  ) {
    super(ensureVectorPoint(position), ensurePolygonPoints(points))

    if (!points.length) {
      throw new Error('No points in polygon')
    }

    extendBody(this, options)
  }

  /**
   * flag to set is polygon centered
   */
  set isCentered(center: boolean) {
    if (this.centered === center) return

    let centroid!: Vector

    this.runWithoutRotation(() => {
      centroid = this.getCentroid()
    })

    const offsetX = center ? -centroid.x : -this.points[0].x
    const offsetY = center ? -centroid.y : -this.points[0].y

    this.setPoints(
      map(this.points, ({ x, y }) => new SATVector(x + offsetX, y + offsetY))
    )

    this.centered = center
  }

  /**
   * is polygon centered?
   */
  get isCentered(): boolean {
    return this.centered
  }

  get x(): number {
    return this.pos.x
  }

  /**
   * updating this.pos.x by this.x = x updates AABB
   */
  set x(x: number) {
    this.pos.x = x
    this.markAsDirty()
  }

  get y(): number {
    return this.pos.y
  }

  /**
   * updating this.pos.y by this.y = y updates AABB
   */
  set y(y: number) {
    this.pos.y = y
    this.markAsDirty()
  }

  /**
   * allow exact getting of scale x - use setScale(x, y) to set
   */
  get scaleX(): number {
    return this.scaleVector.x
  }

  /**
   * allow exact getting of scale y - use setScale(x, y) to set
   */
  get scaleY(): number {
    return this.scaleVector.y
  }

  /**
   * allow approx getting of scale
   */
  get scale(): number {
    return (this.scaleVector.x + this.scaleVector.y) / 2
  }

  /**
   * allow easier setting of scale
   */
  set scale(scale: number) {
    this.setScale(scale)
  }

  // Don't overwrite docs from BodyProps
  get group(): number {
    return this._group
  }

  // Don't overwrite docs from BodyProps
  set group(group: number) {
    this._group = getGroup(group)
  }

  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed = 1, updateNow = true): SATPolygon {
    move(this, speed, updateNow)

    return this
  }

  /**
   * update position BY TELEPORTING
   */
  setPosition(x: number, y: number, updateNow = true): SATPolygon {
    this.pos.x = x
    this.pos.y = y
    this.markAsDirty(updateNow)

    return this
  }

  /**
   * update scale
   */
  setScale(x: number, y: number = x, updateNow = true): SATPolygon {
    this.scaleVector.x = Math.abs(x)
    this.scaleVector.y = Math.abs(y)

    // super instead of this to not taint pointsBackup
    super.setPoints(
      map(
        this.points,
        (_point: SATVector, index: number) =>
          new SATVector(
            this.pointsBackup[index].x * this.scaleVector.x,
            this.pointsBackup[index].y * this.scaleVector.y
          )
      )
    )

    this.updateConvex()
    this.markAsDirty(updateNow)

    return this
  }

  setAngle(angle: number, updateNow = true): SATPolygon {
    super.setAngle(angle)
    this.markAsDirty(updateNow)

    return this
  }

  setOffset(offset: SATVector, updateNow = true): SATPolygon {
    super.setOffset(offset)
    this.markAsDirty(updateNow)

    return this
  }

  /**
   * get body bounding box, without padding
   */
  getAABBAsBBox(): BBox {
    const { pos, w, h } = (this as unknown as GetAABBAsBox).getAABBAsBox()

    return {
      minX: pos.x,
      minY: pos.y,
      maxX: pos.x + w,
      maxY: pos.y + h
    }
  }

  /**
   * Get edge line by index
   */
  getEdge(index: number) {
    const { x, y } = this.calcPoints[index]
    const next = this.calcPoints[(index + 1) % this.calcPoints.length]
    const start = {
      x: this.x + x,
      y: this.y + y
    }
    const end = {
      x: this.x + next.x,
      y: this.y + next.y
    }

    return { start, end }
  }

  /**
   * Draws exact collider on canvas context
   */
  draw(context: CanvasRenderingContext2D) {
    drawPolygon(context, this, this.isTrigger)
  }

  /**
   * Draws Bounding Box on canvas context
   */
  drawBVH(context: CanvasRenderingContext2D) {
    drawBVH(context, this)
  }

  /**
   * sets polygon points to new array of vectors
   */
  setPoints(points: SATVector[]): Polygon {
    super.setPoints(points)
    this.updateConvex()
    this.pointsBackup = clonePointsArray(points)

    return this
  }

  /**
   * translates polygon points in x, y direction
   */
  translate(x: number, y: number): Polygon {
    super.translate(x, y)
    this.pointsBackup = clonePointsArray(this.points)

    return this
  }

  /**
   * rotates polygon points by angle, in radians
   */
  rotate(angle: number): Polygon {
    super.rotate(angle)
    this.pointsBackup = clonePointsArray(this.points)

    return this
  }

  /**
   * if true, polygon is not an invalid, self-crossing polygon
   */
  isSimple(): boolean {
    return isSimple(map(this.calcPoints, mapVectorToArray))
  }

  /**
   * inner function for after position change update aabb in system and convex inner polygons
   */
  updateBody(updateNow = this.dirty): void {
    if (updateNow) {
      this.updateConvexPolygonPositions()
      this.system?.insert(this)
      this.dirty = false
    }
  }

  /**
   * used to do stuff with temporarily disabled rotation
   */
  protected runWithoutRotation(callback: () => void): void {
    const angle = this.angle
    this.setAngle(0, false)
    callback()
    this.setAngle(angle, false)
  }

  /**
   * update instantly or mark as dirty
   */
  protected markAsDirty(updateNow = false): void {
    if (updateNow) {
      this.updateBody(true)
    } else {
      this.dirty = true
    }
  }

  /**
   * update the position of the decomposed convex polygons (if any), called
   * after the position of the body has changed
   */
  protected updateConvexPolygonPositions() {
    if (this.isConvex || !this.convexPolygons) {
      return
    }

    forEach(this.convexPolygons, (polygon: SATPolygon) => {
      polygon.pos.x = this.pos.x
      polygon.pos.y = this.pos.y
      if (polygon.angle !== this.angle) {
        // Must use setAngle to recalculate the points of the Polygon
        polygon.setAngle(this.angle)
      }
    })
  }

  /**
   * returns body split into convex polygons, or empty array for convex bodies
   */
  protected getConvex(): DecompPolygon[] {
    if (
      (this.typeGroup && this.typeGroup !== BodyGroup.Polygon) ||
      this.points.length < 4
    ) {
      return []
    }

    const points = map(this.calcPoints, mapVectorToArray)

    return quickDecomp(points)
  }

  /**
   * updates convex polygons cache in body
   */
  protected updateConvexPolygons(
    convex: DecompPolygon[] = this.getConvex()
  ): void {
    if (this.isConvex) {
      return
    }

    if (!this.convexPolygons) {
      this.convexPolygons = []
    }

    forEach(convex, (points: DecompPolygon, index: number) => {
      // lazy create
      if (!this.convexPolygons[index]) {
        this.convexPolygons[index] = new SATPolygon()
      }

      this.convexPolygons[index].pos.x = this.pos.x
      this.convexPolygons[index].pos.y = this.pos.y
      this.convexPolygons[index].angle = this.angle
      this.convexPolygons[index].setPoints(
        ensurePolygonPoints(map(points, mapArrayToVector))
      )
    })

    // trim array length
    this.convexPolygons.length = convex.length
  }

  /**
   * after points update set is convex
   */
  protected updateConvex(): void {
    // all other types other than polygon are always convex
    const convex = this.getConvex()
    // everything with empty array or one element array
    this.isConvex = convex.length <= 1
    this.updateConvexPolygons(convex)
  }
}
