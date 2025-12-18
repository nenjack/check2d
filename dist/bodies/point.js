"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
const model_1 = require("../model");
const utils_1 = require("../utils");
const box_1 = require("./box");
/**
 * collider - point (very tiny box)
 */
class Point extends box_1.Box {
    /**
     * collider - point (very tiny box)
     */
    constructor(position, options) {
        super((0, utils_1.ensureVectorPoint)(position), 0.001, 0.001, options);
        /**
         * point type
         */
        this.type = model_1.BodyType.Point;
        /**
         * faster than type
         */
        this.typeGroup = model_1.BodyGroup.Point;
    }
}
exports.Point = Point;
