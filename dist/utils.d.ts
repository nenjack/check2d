import { BBox, Body, BodyOptions, DecompPoint, PotentialVector, Response, SATPolygon, SATTest, SATVector, Vector } from './model';
import { Polygon } from './bodies/polygon';
export declare const DEG2RAD: number;
export declare const RAD2DEG: number;
export declare const EPSILON = 1e-9;
/**
 * convert from degrees to radians
 */
export declare function deg2rad(degrees: number): number;
/**
 * convert from radians to degrees
 */
export declare function rad2deg(radians: number): number;
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
export declare function almostEqual(a: number, b: number, eps?: number): boolean;
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
export declare function pointsEqual(a: Vector, b: Vector): boolean;
/**
 * creates ellipse-shaped polygon based on params
 */
export declare function createEllipse(radiusX: number, radiusY?: number, step?: number): SATVector[];
/**
 * creates box shaped polygon points
 */
export declare function createBox(width: number, height: number): SATVector[];
/**
 * ensure SATVector type point result
 */
export declare function ensureVectorPoint(point?: PotentialVector): SATVector;
/**
 * ensure Vector points (for polygon) in counter-clockwise order
 */
export declare function ensurePolygonPoints(points?: PotentialVector[]): SATVector[];
/**
 * get distance between two Vector points
 */
export declare function distance(bodyA: Vector, bodyB: Vector): number;
/**
 * check [is clockwise] direction of polygon
 */
export declare function clockwise(points: Vector[]): boolean;
/**
 * used for all types of bodies in constructor
 */
export declare function extendBody<UserDataType = any>(body: Body, options?: BodyOptions<UserDataType>): void;
/**
 * check if body moved outside of its padding
 */
export declare function bodyMoved(body: Body): boolean;
/**
 * returns true if two boxes not intersect
 */
export declare function notIntersectAABB(bodyA: BBox, bodyB: BBox): boolean;
/**
 * checks if two boxes intersect
 */
export declare function intersectAABB(bodyA: BBox, bodyB: BBox): boolean;
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
export declare function canInteract({ group: groupA }: Body, { group: groupB }: Body): boolean;
/**
 * checks if body a is in body b
 */
export declare function checkAInB(bodyA: Body, bodyB: Body): boolean;
/**
 * clone sat vector points array into vector points array
 */
export declare function clonePointsArray(points: SATVector[]): Vector[];
/**
 * change format from SAT.js to poly-decomp
 *
 * @param position
 */
export declare function mapVectorToArray({ x, y }?: Vector): DecompPoint;
/**
 * change format from poly-decomp to SAT.js
 *
 * @param positionAsArray
 */
export declare function mapArrayToVector([x, y]?: DecompPoint): Vector;
/**
 * given 2 bodies calculate vector of bounce assuming equal mass and they are circles
 */
export declare function getBounceDirection(body: Vector, collider: Vector): SATVector;
/**
 * returns correct sat.js testing function based on body types
 */
export declare function getSATTest(bodyA: Body, bodyB: Body): SATTest;
/**
 * draws dashed line on canvas context
 */
export declare function dashLineTo(context: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, dash?: number, gap?: number): void;
/**
 * draw polygon
 *
 * @param context
 * @param polygon
 * @param isTrigger
 */
export declare function drawPolygon(context: CanvasRenderingContext2D, { pos, calcPoints }: Pick<Polygon | SATPolygon, 'calcPoints'> & {
    pos: Vector;
}, isTrigger?: boolean): void;
/**
 * draw body bounding body box
 */
export declare function drawBVH(context: CanvasRenderingContext2D, body: Body, isTrigger?: boolean): void;
/**
 * clone response object returning new response with previous ones values
 */
export declare function cloneResponse(response: Response): Response;
/**
 * dummy fn used as default, for optimization
 */
export declare function returnTrue(): boolean;
/**
 * for groups
 */
export declare function getGroup(group: number): number;
/**
 * binary string to decimal number
 */
export declare function bin2dec(binary: string): number;
/**
 * helper for groupBits()
 *
 * @param input - number or binary string
 */
export declare function ensureNumber(input: number | string): number;
/**
 * create group bits from category and mask
 *
 * @param category - category bits
 * @param mask - mask bits (default: category)
 */
export declare function groupBits(category: number | string, mask?: number | string): number;
export declare function move(body: Body, speed?: number, updateNow?: boolean): void;
