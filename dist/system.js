"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.System = void 0;
const intersect_1 = require("./intersect");
const model_1 = require("./model");
const optimized_1 = require("./optimized");
const utils_1 = require("./utils");
const base_system_1 = require("./base-system");
const line_1 = require("./bodies/line");
/**
 * collision system
 */
class System extends base_system_1.BaseSystem {
    constructor() {
        super(...arguments);
        /**
         * the last collision result
         */
        this.response = new model_1.Response();
    }
    /**
     * re-insert body into collision tree and update its bbox
     * every body can be part of only one system
     */
    insert(body) {
        const insertResult = super.insert(body);
        // set system for later body.check2d.updateBody(body)
        body.system = this;
        return insertResult;
    }
    /**
     * separate (move away) bodies
     */
    separate(callback = utils_1.returnTrue, response = this.response) {
        (0, optimized_1.forEach)(this.all(), (body) => {
            this.separateBody(body, callback, response);
        });
    }
    /**
     * separate (move away) 1 body, with optional callback before collision
     */
    separateBody(body, callback = utils_1.returnTrue, response = this.response) {
        if (body.isStatic && !body.isTrigger) {
            return;
        }
        const offsets = { x: 0, y: 0 };
        const addOffsets = (collision) => {
            // when is not trigger and callback returns true it continues
            if (callback(collision) && !body.isTrigger && !collision.b.isTrigger) {
                offsets.x += collision.overlapV.x;
                offsets.y += collision.overlapV.y;
            }
        };
        this.checkOne(body, addOffsets, response);
        if (offsets.x || offsets.y) {
            body.setPosition(body.x - offsets.x, body.y - offsets.y);
        }
    }
    /**
     * check one body collisions with callback
     */
    checkOne(body, callback = utils_1.returnTrue, response = this.response) {
        // no need to check static body collision
        if (body.isStatic && !body.isTrigger) {
            return false;
        }
        const bodies = this.search(body);
        const checkCollision = (candidate) => {
            if (candidate !== body &&
                this.checkCollision(body, candidate, response)) {
                return callback(response);
            }
        };
        return (0, optimized_1.some)(bodies, checkCollision);
    }
    /**
     * check all bodies collisions in area with callback
     */
    checkArea(area, callback = utils_1.returnTrue, response = this.response) {
        const checkOne = (body) => {
            return this.checkOne(body, callback, response);
        };
        return (0, optimized_1.some)(this.search(area), checkOne);
    }
    /**
     * check all bodies collisions with callback
     */
    checkAll(callback = utils_1.returnTrue, response = this.response) {
        const checkOne = (body) => {
            return this.checkOne(body, callback, response);
        };
        return (0, optimized_1.some)(this.all(), checkOne);
    }
    /**
     * check do 2 objects collide
     */
    checkCollision(bodyA, bodyB, response = this.response) {
        const { bbox: bboxA, padding: paddingA } = bodyA;
        const { bbox: bboxB, padding: paddingB } = bodyB;
        // assess the bodies real aabb without padding
        /* tslint:disable-next-line:cyclomatic-complexity */
        if (!bboxA ||
            !bboxB ||
            !(0, utils_1.canInteract)(bodyA, bodyB) ||
            ((paddingA || paddingB) && (0, utils_1.notIntersectAABB)(bboxA, bboxB))) {
            return false;
        }
        const sat = (0, utils_1.getSATTest)(bodyA, bodyB);
        // 99% of cases
        if (bodyA.isConvex && bodyB.isConvex) {
            // always first clear response
            response.clear();
            return sat(bodyA, bodyB, response);
        }
        // more complex (non convex) cases
        const convexBodiesA = (0, intersect_1.ensureConvex)(bodyA);
        const convexBodiesB = (0, intersect_1.ensureConvex)(bodyB);
        let overlapX = 0;
        let overlapY = 0;
        let collided = false;
        (0, optimized_1.forEach)(convexBodiesA, (convexBodyA) => {
            (0, optimized_1.forEach)(convexBodiesB, (convexBodyB) => {
                // always first clear response
                response.clear();
                if (sat(convexBodyA, convexBodyB, response)) {
                    collided = true;
                    overlapX += response.overlapV.x;
                    overlapY += response.overlapV.y;
                }
            });
        });
        if (collided) {
            const vector = new model_1.SATVector(overlapX, overlapY);
            response.a = bodyA;
            response.b = bodyB;
            response.overlapV.x = overlapX;
            response.overlapV.y = overlapY;
            response.overlapN = vector.normalize();
            response.overlap = vector.len();
            response.aInB = (0, utils_1.checkAInB)(bodyA, bodyB);
            response.bInA = (0, utils_1.checkAInB)(bodyB, bodyA);
        }
        return collided;
    }
    /**
     * raycast to get collider of ray from start to end
     */
    raycast(start, end, allow = utils_1.returnTrue) {
        let minDistance = Infinity;
        let result;
        if (!this.ray) {
            this.ray = new line_1.Line(start, end, { isTrigger: true });
        }
        else {
            this.ray.start = start;
            this.ray.end = end;
        }
        this.insert(this.ray);
        this.checkOne(this.ray, ({ b: body }) => {
            if (!allow(body, this.ray)) {
                return false;
            }
            const points = body.typeGroup === model_1.BodyGroup.Circle
                ? (0, intersect_1.intersectLineCircle)(this.ray, body)
                : (0, intersect_1.intersectLinePolygon)(this.ray, body);
            (0, optimized_1.forEach)(points, (point) => {
                const pointDistance = (0, utils_1.distance)(start, point);
                if (pointDistance < minDistance) {
                    minDistance = pointDistance;
                    result = { point, body };
                }
            });
        });
        this.remove(this.ray);
        return result;
    }
    /**
     * find collisions points between 2 bodies
     */
    getCollisionPoints(a, b) {
        const collisionPoints = [];
        if (a.typeGroup === model_1.BodyGroup.Circle && b.typeGroup === model_1.BodyGroup.Circle) {
            collisionPoints.push(...(0, intersect_1.intersectCircleCircle)(a, b));
        }
        if (a.typeGroup === model_1.BodyGroup.Circle && b.typeGroup !== model_1.BodyGroup.Circle) {
            for (let indexB = 0; indexB < b.calcPoints.length; indexB++) {
                const lineB = b.getEdge(indexB);
                collisionPoints.push(...(0, intersect_1.intersectLineCircle)(lineB, a));
            }
        }
        if (a.typeGroup !== model_1.BodyGroup.Circle) {
            for (let indexA = 0; indexA < a.calcPoints.length; indexA++) {
                const lineA = a.getEdge(indexA);
                if (b.typeGroup === model_1.BodyGroup.Circle) {
                    collisionPoints.push(...(0, intersect_1.intersectLineCircle)(lineA, b));
                }
                else {
                    for (let indexB = 0; indexB < b.calcPoints.length; indexB++) {
                        const lineB = b.getEdge(indexB);
                        const hit = (0, intersect_1.intersectLineLine)(lineA, lineB);
                        if (hit) {
                            collisionPoints.push(hit);
                        }
                    }
                }
            }
        }
        // unique
        return collisionPoints.filter(({ x, y }, index) => index ===
            collisionPoints.findIndex((collisionPoint) => (0, utils_1.pointsEqual)(collisionPoint, { x, y })));
    }
}
exports.System = System;
