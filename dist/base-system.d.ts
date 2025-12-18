import { Body, BodyOptions, ChildrenData, Data, InTest, Leaf, PotentialVector, RBush, TraverseFunction, Vector } from './model';
import { Box, BoxConstructor } from './bodies/box';
import { Circle, CircleConstructor } from './bodies/circle';
import { Ellipse, EllipseConstructor } from './bodies/ellipse';
import { Line, LineConstructor } from './bodies/line';
import { Point, PointConstructor } from './bodies/point';
import { Polygon, PolygonConstructor } from './bodies/polygon';
/**
 * very base collision system (create, insert, update, draw, remove)
 */
export declare class BaseSystem<TBody extends Body = Body> extends RBush implements Data<TBody> {
    data: ChildrenData<TBody>;
    /**
     * create point at position with options and add to system
     */
    createPoint<TPoint extends Point>(position: PotentialVector, options?: BodyOptions, Class?: PointConstructor<TPoint>): TPoint | Point;
    /**
     * create line at position with options and add to system
     */
    createLine<TLine extends Line>(start: Vector, end: Vector, options?: BodyOptions, Class?: LineConstructor<TLine>): TLine | Line;
    /**
     * create circle at position with options and add to system
     */
    createCircle<TCircle extends Circle>(position: PotentialVector, radius: number, options?: BodyOptions, Class?: CircleConstructor<TCircle>): TCircle | Circle;
    /**
     * create box at position with options and add to system
     */
    createBox<TBox extends Box>(position: PotentialVector, width: number, height: number, options?: BodyOptions, Class?: BoxConstructor<TBox>): TBox | Box;
    /**
     * create ellipse at position with options and add to system
     */
    createEllipse<TEllipse extends Ellipse>(position: PotentialVector, radiusX: number, radiusY?: number, step?: number, options?: BodyOptions, Class?: EllipseConstructor<TEllipse>): TEllipse | Ellipse;
    /**
     * create polygon at position with options and add to system
     */
    createPolygon<TPolygon extends Polygon>(position: PotentialVector, points: PotentialVector[], options?: BodyOptions, Class?: PolygonConstructor<TPolygon>): TPolygon | Polygon;
    /**
     * re-insert body into collision tree and update its bbox
     * every body can be part of only one system
     */
    insert(body: TBody): this;
    /**
     * updates body in collision tree
     */
    updateBody(body: TBody): void;
    /**
     * update all bodies aabb
     */
    update(): void;
    /**
     * draw exact bodies colliders outline
     */
    draw(context: CanvasRenderingContext2D): void;
    /**
     * draw bounding boxes hierarchy outline
     */
    drawBVH(context: CanvasRenderingContext2D, isTrigger?: boolean): void;
    /**
     * remove body aabb from collision tree
     */
    remove(body: TBody, equals?: InTest<TBody>): this;
    /**
     * get object potential colliders
     * @deprecated because it's slower to use than checkOne() or checkAll()
     */
    getPotentials(body: TBody): TBody[];
    /**
     * used to find body deep inside data with finder function returning boolean found or not
     *
     * @param traverseFunction
     * @param tree
     */
    traverse(traverseFunction: TraverseFunction<TBody>, { children }?: {
        children?: Leaf<TBody>[];
    }): TBody | undefined;
}
