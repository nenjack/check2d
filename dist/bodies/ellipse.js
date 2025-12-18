"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ellipse = void 0;
const model_1 = require("../model");
const polygon_1 = require("./polygon");
const utils_1 = require("../utils");
/**
 * collider - ellipse
 */
class Ellipse extends polygon_1.Polygon {
    /**
     * collider - ellipse
     */
    constructor(position, radiusX, radiusY = radiusX, step = (radiusX + radiusY) / Math.PI, options) {
        super(position, (0, utils_1.createEllipse)(radiusX, radiusY, step), options);
        /**
         * ellipse type
         */
        this.type = model_1.BodyType.Ellipse;
        /**
         * faster than type
         */
        this.typeGroup = model_1.BodyGroup.Ellipse;
        /**
         * ellipses are convex
         */
        this.isConvex = true;
        this._radiusX = radiusX;
        this._radiusY = radiusY;
        this._step = step;
    }
    /**
     * flag to set is body centered
     */
    set isCentered(_isCentered) { }
    /**
     * is body centered?
     */
    get isCentered() {
        return true;
    }
    /**
     * get ellipse step number
     */
    get step() {
        return this._step;
    }
    /**
     * set ellipse step number
     */
    set step(step) {
        this._step = step;
        this.setPoints((0, utils_1.createEllipse)(this._radiusX, this._radiusY, this._step));
    }
    /**
     * get ellipse radiusX
     */
    get radiusX() {
        return this._radiusX;
    }
    /**
     * set ellipse radiusX, update points
     */
    set radiusX(radiusX) {
        this._radiusX = radiusX;
        this.setPoints((0, utils_1.createEllipse)(this._radiusX, this._radiusY, this._step));
    }
    /**
     * get ellipse radiusY
     */
    get radiusY() {
        return this._radiusY;
    }
    /**
     * set ellipse radiusY, update points
     */
    set radiusY(radiusY) {
        this._radiusY = radiusY;
        this.setPoints((0, utils_1.createEllipse)(this._radiusX, this._radiusY, this._step));
    }
    /**
     * do not attempt to use Polygon.center()
     */
    center() {
        return;
    }
    /**
     * do not attempt to use Polygon.updateConvex()
     */
    updateConvex() {
        return;
    }
}
exports.Ellipse = Ellipse;
