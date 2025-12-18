import { BBox, Body, CollisionCallback, RaycastHit, Response, Vector } from './model';
import { BaseSystem } from './base-system';
import { Line } from './bodies/line';
/**
 * collision system
 */
export declare class System<TBody extends Body = Body> extends BaseSystem<TBody> {
    /**
     * the last collision result
     */
    response: Response;
    /**
     * for raycasting
     */
    protected ray: Line;
    /**
     * re-insert body into collision tree and update its bbox
     * every body can be part of only one system
     */
    insert(body: TBody): this;
    /**
     * separate (move away) bodies
     */
    separate(callback?: CollisionCallback, response?: Response): void;
    /**
     * separate (move away) 1 body, with optional callback before collision
     */
    separateBody(body: TBody, callback?: CollisionCallback, response?: Response): void;
    /**
     * check one body collisions with callback
     */
    checkOne(body: TBody, callback?: CollisionCallback, response?: Response): boolean;
    /**
     * check all bodies collisions in area with callback
     */
    checkArea(area: BBox, callback?: CollisionCallback, response?: Response): boolean;
    /**
     * check all bodies collisions with callback
     */
    checkAll(callback?: CollisionCallback, response?: Response): boolean;
    /**
     * check do 2 objects collide
     */
    checkCollision(bodyA: TBody, bodyB: TBody, response?: Response): boolean;
    /**
     * raycast to get collider of ray from start to end
     */
    raycast(start: Vector, end: Vector, allow?: (body: TBody, ray: TBody) => boolean): RaycastHit<TBody> | undefined;
    /**
     * find collisions points between 2 bodies
     */
    getCollisionPoints(a: Body, b: Body): Vector[];
}
