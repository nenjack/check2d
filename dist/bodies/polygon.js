"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Polygon = void 0;
const model_1 = require("../model");
const optimized_1 = require("../optimized");
const utils_1 = require("../utils");
/**
 * collider - polygon
 */
class Polygon extends model_1.SATPolygon {
    /**
     * collider - polygon
     */
    constructor(position, points, options) {
        super((0, utils_1.ensureVectorPoint)(position), (0, utils_1.ensurePolygonPoints)(points));
        /**
         * was the polygon modified and needs update in the next checkCollision
         */
        this.dirty = false;
        /**
         * type of body
         */
        this.type = model_1.BodyType.Polygon;
        /**
         * faster than type
         */
        this.typeGroup = model_1.BodyGroup.Polygon;
        /**
         * is body centered
         */
        this.centered = false;
        /**
         * scale Vector of body
         */
        this.scaleVector = { x: 1, y: 1 };
        if (!points.length) {
            throw new Error('No points in polygon');
        }
        (0, utils_1.extendBody)(this, options);
    }
    /**
     * flag to set is polygon centered
     */
    set isCentered(center) {
        if (this.centered === center)
            return;
        let centroid;
        this.runWithoutRotation(() => {
            centroid = this.getCentroid();
        });
        const offsetX = center ? -centroid.x : -this.points[0].x;
        const offsetY = center ? -centroid.y : -this.points[0].y;
        this.setPoints((0, optimized_1.map)(this.points, ({ x, y }) => new model_1.SATVector(x + offsetX, y + offsetY)));
        this.centered = center;
    }
    /**
     * is polygon centered?
     */
    get isCentered() {
        return this.centered;
    }
    get x() {
        return this.pos.x;
    }
    /**
     * updating this.pos.x by this.x = x updates AABB
     */
    set x(x) {
        this.pos.x = x;
        this.markAsDirty();
    }
    get y() {
        return this.pos.y;
    }
    /**
     * updating this.pos.y by this.y = y updates AABB
     */
    set y(y) {
        this.pos.y = y;
        this.markAsDirty();
    }
    /**
     * allow exact getting of scale x - use setScale(x, y) to set
     */
    get scaleX() {
        return this.scaleVector.x;
    }
    /**
     * allow exact getting of scale y - use setScale(x, y) to set
     */
    get scaleY() {
        return this.scaleVector.y;
    }
    /**
     * allow approx getting of scale
     */
    get scale() {
        return (this.scaleVector.x + this.scaleVector.y) / 2;
    }
    /**
     * allow easier setting of scale
     */
    set scale(scale) {
        this.setScale(scale);
    }
    // Don't overwrite docs from BodyProps
    get group() {
        return this._group;
    }
    // Don't overwrite docs from BodyProps
    set group(group) {
        this._group = (0, utils_1.getGroup)(group);
    }
    /**
     * update position BY MOVING FORWARD IN ANGLE DIRECTION
     */
    move(speed = 1, updateNow = true) {
        (0, utils_1.move)(this, speed, updateNow);
        return this;
    }
    /**
     * update position BY TELEPORTING
     */
    setPosition(x, y, updateNow = true) {
        this.pos.x = x;
        this.pos.y = y;
        this.markAsDirty(updateNow);
        return this;
    }
    /**
     * update scale
     */
    setScale(x, y = x, updateNow = true) {
        this.scaleVector.x = Math.abs(x);
        this.scaleVector.y = Math.abs(y);
        // super instead of this to not taint pointsBackup
        super.setPoints((0, optimized_1.map)(this.points, (_point, index) => new model_1.SATVector(this.pointsBackup[index].x * this.scaleVector.x, this.pointsBackup[index].y * this.scaleVector.y)));
        this.updateConvex();
        this.markAsDirty(updateNow);
        return this;
    }
    setAngle(angle, updateNow = true) {
        super.setAngle(angle);
        this.markAsDirty(updateNow);
        return this;
    }
    setOffset(offset, updateNow = true) {
        super.setOffset(offset);
        this.markAsDirty(updateNow);
        return this;
    }
    /**
     * get body bounding box, without padding
     */
    getAABBAsBBox() {
        const { pos, w, h } = this.getAABBAsBox();
        return {
            minX: pos.x,
            minY: pos.y,
            maxX: pos.x + w,
            maxY: pos.y + h
        };
    }
    /**
     * Get edge line by index
     */
    getEdge(index) {
        const { x, y } = this.calcPoints[index];
        const next = this.calcPoints[(index + 1) % this.calcPoints.length];
        const start = {
            x: this.x + x,
            y: this.y + y
        };
        const end = {
            x: this.x + next.x,
            y: this.y + next.y
        };
        return { start, end };
    }
    /**
     * Draws exact collider on canvas context
     */
    draw(context) {
        (0, utils_1.drawPolygon)(context, this, this.isTrigger);
    }
    /**
     * Draws Bounding Box on canvas context
     */
    drawBVH(context) {
        (0, utils_1.drawBVH)(context, this);
    }
    /**
     * sets polygon points to new array of vectors
     */
    setPoints(points) {
        super.setPoints(points);
        this.updateConvex();
        this.pointsBackup = (0, utils_1.clonePointsArray)(points);
        return this;
    }
    /**
     * translates polygon points in x, y direction
     */
    translate(x, y) {
        super.translate(x, y);
        this.pointsBackup = (0, utils_1.clonePointsArray)(this.points);
        return this;
    }
    /**
     * rotates polygon points by angle, in radians
     */
    rotate(angle) {
        super.rotate(angle);
        this.pointsBackup = (0, utils_1.clonePointsArray)(this.points);
        return this;
    }
    /**
     * if true, polygon is not an invalid, self-crossing polygon
     */
    isSimple() {
        return (0, model_1.isSimple)((0, optimized_1.map)(this.calcPoints, utils_1.mapVectorToArray));
    }
    /**
     * inner function for after position change update aabb in system and convex inner polygons
     */
    updateBody(updateNow = this.dirty) {
        var _a;
        if (updateNow) {
            this.updateConvexPolygonPositions();
            (_a = this.system) === null || _a === void 0 ? void 0 : _a.insert(this);
            this.dirty = false;
        }
    }
    /**
     * used to do stuff with temporarily disabled rotation
     */
    runWithoutRotation(callback) {
        const angle = this.angle;
        this.setAngle(0, false);
        callback();
        this.setAngle(angle, false);
    }
    /**
     * update instantly or mark as dirty
     */
    markAsDirty(updateNow = false) {
        if (updateNow) {
            this.updateBody(true);
        }
        else {
            this.dirty = true;
        }
    }
    /**
     * update the position of the decomposed convex polygons (if any), called
     * after the position of the body has changed
     */
    updateConvexPolygonPositions() {
        if (this.isConvex || !this.convexPolygons) {
            return;
        }
        (0, optimized_1.forEach)(this.convexPolygons, (polygon) => {
            polygon.pos.x = this.pos.x;
            polygon.pos.y = this.pos.y;
            if (polygon.angle !== this.angle) {
                // Must use setAngle to recalculate the points of the Polygon
                polygon.setAngle(this.angle);
            }
        });
    }
    /**
     * returns body split into convex polygons, or empty array for convex bodies
     */
    getConvex() {
        if ((this.typeGroup && this.typeGroup !== model_1.BodyGroup.Polygon) ||
            this.points.length < 4) {
            return [];
        }
        const points = (0, optimized_1.map)(this.calcPoints, utils_1.mapVectorToArray);
        return (0, model_1.quickDecomp)(points);
    }
    /**
     * updates convex polygons cache in body
     */
    updateConvexPolygons(convex = this.getConvex()) {
        if (this.isConvex) {
            return;
        }
        if (!this.convexPolygons) {
            this.convexPolygons = [];
        }
        (0, optimized_1.forEach)(convex, (points, index) => {
            // lazy create
            if (!this.convexPolygons[index]) {
                this.convexPolygons[index] = new model_1.SATPolygon();
            }
            this.convexPolygons[index].pos.x = this.pos.x;
            this.convexPolygons[index].pos.y = this.pos.y;
            this.convexPolygons[index].angle = this.angle;
            this.convexPolygons[index].setPoints((0, utils_1.ensurePolygonPoints)((0, optimized_1.map)(points, utils_1.mapArrayToVector)));
        });
        // trim array length
        this.convexPolygons.length = convex.length;
    }
    /**
     * after points update set is convex
     */
    updateConvex() {
        // all other types other than polygon are always convex
        const convex = this.getConvex();
        // everything with empty array or one element array
        this.isConvex = convex.length <= 1;
        this.updateConvexPolygons(convex);
    }
}
exports.Polygon = Polygon;
