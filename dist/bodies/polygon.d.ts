import { BBox, BodyGroup, BodyOptions, BodyProps, BodyType, DecompPolygon, PotentialVector, SATPolygon, SATVector, Vector } from '../model';
import { System } from '../system';
export interface PolygonConstructor<TPolygon extends Polygon> {
    new (position: PotentialVector, points: PotentialVector[], options?: BodyOptions): TPolygon;
}
/**
 * collider - polygon
 */
export declare class Polygon<UserDataType = any> extends SATPolygon implements BBox, BodyProps<UserDataType> {
    /**
     * minimum x bound of body
     */
    minX: number;
    /**
     * maximum x bound of body
     */
    maxX: number;
    /**
     * minimum y bound of body
     */
    minY: number;
    /**
     * maximum y bound of body
     */
    maxY: number;
    /**
     * bounding box cache, without padding
     */
    bbox: BBox;
    /**
     * is it a convex polgyon as opposed to a hollow inside (concave) polygon
     */
    isConvex: boolean;
    /**
     * optimization for convex polygons
     */
    convexPolygons: SATPolygon[];
    /**
     * bodies are not reinserted during update if their bbox didnt move outside bbox + padding
     */
    padding: number;
    /**
     * static bodies don't move but they collide
     */
    isStatic: boolean;
    /**
     * trigger bodies move but are like ghosts
     */
    isTrigger: boolean;
    /**
     * reference to collision system
     */
    system?: System;
    /**
     * was the polygon modified and needs update in the next checkCollision
     */
    dirty: boolean;
    /**
     * allows the user to set any misc data for client use
     */
    userData?: BodyProps<UserDataType>['userData'];
    /**
     * type of body
     */
    readonly type: BodyType.Polygon | BodyType.Box | BodyType.Point | BodyType.Ellipse | BodyType.Line;
    /**
     * faster than type
     */
    readonly typeGroup: BodyGroup.Polygon | BodyGroup.Box | BodyGroup.Point | BodyGroup.Ellipse | BodyGroup.Line;
    /**
     * backup of points used for scaling
     */
    protected pointsBackup: Vector[];
    /**
     * is body centered
     */
    protected centered: boolean;
    /**
     * group for collision filtering
     */
    protected _group: number;
    /**
     * scale Vector of body
     */
    protected readonly scaleVector: Vector;
    /**
     * collider - polygon
     */
    constructor(position: PotentialVector, points: PotentialVector[], options?: BodyOptions<UserDataType>);
    /**
     * flag to set is polygon centered
     */
    set isCentered(center: boolean);
    /**
     * is polygon centered?
     */
    get isCentered(): boolean;
    get x(): number;
    /**
     * updating this.pos.x by this.x = x updates AABB
     */
    set x(x: number);
    get y(): number;
    /**
     * updating this.pos.y by this.y = y updates AABB
     */
    set y(y: number);
    /**
     * allow exact getting of scale x - use setScale(x, y) to set
     */
    get scaleX(): number;
    /**
     * allow exact getting of scale y - use setScale(x, y) to set
     */
    get scaleY(): number;
    /**
     * allow approx getting of scale
     */
    get scale(): number;
    /**
     * allow easier setting of scale
     */
    set scale(scale: number);
    get group(): number;
    set group(group: number);
    /**
     * update position BY MOVING FORWARD IN ANGLE DIRECTION
     */
    move(speed?: number, updateNow?: boolean): SATPolygon;
    /**
     * update position BY TELEPORTING
     */
    setPosition(x: number, y: number, updateNow?: boolean): SATPolygon;
    /**
     * update scale
     */
    setScale(x: number, y?: number, updateNow?: boolean): SATPolygon;
    setAngle(angle: number, updateNow?: boolean): SATPolygon;
    setOffset(offset: SATVector, updateNow?: boolean): SATPolygon;
    /**
     * get body bounding box, without padding
     */
    getAABBAsBBox(): BBox;
    /**
     * Get edge line by index
     */
    getEdge(index: number): {
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
    };
    /**
     * Draws exact collider on canvas context
     */
    draw(context: CanvasRenderingContext2D): void;
    /**
     * Draws Bounding Box on canvas context
     */
    drawBVH(context: CanvasRenderingContext2D): void;
    /**
     * sets polygon points to new array of vectors
     */
    setPoints(points: SATVector[]): Polygon;
    /**
     * translates polygon points in x, y direction
     */
    translate(x: number, y: number): Polygon;
    /**
     * rotates polygon points by angle, in radians
     */
    rotate(angle: number): Polygon;
    /**
     * if true, polygon is not an invalid, self-crossing polygon
     */
    isSimple(): boolean;
    /**
     * inner function for after position change update aabb in system and convex inner polygons
     */
    updateBody(updateNow?: boolean): void;
    /**
     * used to do stuff with temporarily disabled rotation
     */
    protected runWithoutRotation(callback: () => void): void;
    /**
     * update instantly or mark as dirty
     */
    protected markAsDirty(updateNow?: boolean): void;
    /**
     * update the position of the decomposed convex polygons (if any), called
     * after the position of the body has changed
     */
    protected updateConvexPolygonPositions(): void;
    /**
     * returns body split into convex polygons, or empty array for convex bodies
     */
    protected getConvex(): DecompPolygon[];
    /**
     * updates convex polygons cache in body
     */
    protected updateConvexPolygons(convex?: DecompPolygon[]): void;
    /**
     * after points update set is convex
     */
    protected updateConvex(): void;
}
