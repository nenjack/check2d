"use strict";
const { BodyGroup } = require("../model");
const { System } = require("../system");
const { getBounceDirection, groupBits } = require("../utils");
const { clock } = require("../clock");
const { win, doc, width, height } = require("./canvas");
const seededRandom = require("random-seed").create("@Prozi").random;
function random(min, max) {
    return Math.floor(seededRandom() * max) + min;
}
class Stress {
    static getDefaultCount() {
        return Math.floor(Math.min(2000, Math.hypot(width, height)));
    }
    constructor(count = Stress.getDefaultCount()) {
        this.clock = clock;
        this.check2d = new System();
        this.size = Math.sqrt((width * height) / (count * 50));
        this.bodies = [];
        this.polygons = 0;
        this.boxes = 0;
        this.circles = 0;
        this.ellipses = 0;
        this.lines = 0;
        this.lastVariant = 0;
        this.count = count;
        this.bounds = this.getBounds();
        this.enableFiltering = false;
        for (let i = 0; i < count; ++i) {
            this.createShape(!random(0, 20));
        }
        this.legend = `<div><b>Total:</b> ${count}</div>
    <div><b>Polygons:</b> ${this.polygons}</div>
    <div><b>Boxes:</b> ${this.boxes}</div>
    <div><b>Circles:</b> ${this.circles}</div>
    <div><b>Ellipses:</b> ${this.ellipses}</div>
    <div><b>Lines:</b> ${this.lines}</div>
    <div>
      <label>
        <input id="filtering" type="checkbox"/> Enable Collision Filtering
      </label>
    </div>
    `;
        this.lastTime = Date.now();
        this.updateBody = this.updateBody.bind(this);
        // observer #debug & add filtering checkbox event
        if (win.MutationObserver) {
            const observer = new win.MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.id === "debug") {
                            document
                                .querySelector("#filtering")
                                .addEventListener("change", () => this.toggleFiltering());
                            observer.disconnect();
                        }
                    });
                });
            });
            observer.observe(doc.querySelector("body"), {
                subtree: false,
                childList: true,
            });
        }
        this.start = () => {
            this.clock.add(this.update.bind(this));
        };
    }
    getBounds() {
        return [
            this.check2d.createBox({ x: 0, y: 0 }, width, 10, {
                isStatic: true,
            }),
            this.check2d.createBox({ x: width - 10, y: 0 }, 10, height, {
                isStatic: true,
            }),
            this.check2d.createBox({ x: 0, y: height - 10 }, width, 10, {
                isStatic: true,
            }),
            this.check2d.createBox({ x: 0, y: 0 }, 10, height, {
                isStatic: true,
            }),
        ];
    }
    clear() {
        this.check2d.clear();
        this.clock.clear();
    }
    toggleFiltering() {
        this.enableFiltering = !this.enableFiltering;
        this.check2d.clear();
        this.bodies.length = 0;
        this.polygons = 0;
        this.boxes = 0;
        this.circles = 0;
        this.ellipses = 0;
        this.lines = 0;
        this.lastVariant = 0;
        this.bounds = this.getBounds();
        for (let i = 0; i < this.count; ++i) {
            this.createShape(!random(0, 20));
        }
    }
    update() {
        const now = Date.now();
        this.timeScale = Math.min(1000, now - this.lastTime) / 60;
        this.lastTime = now;
        this.bodies.forEach(this.updateBody);
    }
    updateBody(body) {
        body.setAngle(body.angle + body.rotationSpeed * this.timeScale, false);
        if (seededRandom() < 0.05 * this.timeScale) {
            body.targetScale.x = 0.5 + seededRandom();
        }
        if (seededRandom() < 0.05 * this.timeScale) {
            body.targetScale.y = 0.5 + seededRandom();
        }
        if (Math.abs(body.targetScale.x - body.scaleX) > 0.01) {
            const scaleX = body.scaleX +
                Math.sign(body.targetScale.x - body.scaleX) * 0.02 * this.timeScale;
            const scaleY = body.scaleY +
                Math.sign(body.targetScale.y - body.scaleY) * 0.02 * this.timeScale;
            body.setScale(scaleX, scaleY, false);
        }
        // as last step update position, and bounding box
        body.setPosition(body.x + body.directionX * this.timeScale, body.y + body.directionY * this.timeScale);
        // separate + bounce
        this.bounceBody(body);
    }
    bounceBody(body) {
        const bounces = { x: 0, y: 0 };
        const addBounces = ({ overlapV: { x, y } }) => {
            bounces.x += x;
            bounces.y += y;
        };
        this.check2d.checkOne(body, addBounces);
        if (bounces.x || bounces.y) {
            const size = 0.5 * (body.scaleX + body.scaleY);
            const bounce = getBounceDirection(body, {
                x: body.x + bounces.x,
                y: body.y + bounces.y,
            });
            bounce.scale(body.size).add({
                x: body.directionX * size,
                y: body.directionY * size,
            });
            const { x, y } = bounce.normalize();
            body.directionX = x;
            body.directionY = y;
            body.rotationSpeed = (seededRandom() - seededRandom()) * 0.1;
            body.setPosition(body.x - bounces.x, body.y - bounces.y);
        }
    }
    createShape(large) {
        const minSize = this.size * 1.0 * (large ? seededRandom() + 1 : 1);
        const maxSize = this.size * 1.25 * (large ? seededRandom() * 2 + 1 : 1);
        const x = random(0, width);
        const y = random(0, height);
        const direction = (random(0, 360) * Math.PI) / 180;
        const options = {
            isCentered: true,
            padding: (minSize + maxSize) * 0.2,
        };
        let body;
        const variant = this.lastVariant++ % 5;
        switch (variant) {
            case 0:
                if (this.enableFiltering) {
                    options.group = groupBits(BodyGroup.Circle);
                }
                body = this.check2d.createCircle({ x, y }, random(minSize, maxSize) / 2, options);
                ++this.circles;
                break;
            case 1:
                const width = random(minSize, maxSize);
                const height = random(minSize, maxSize);
                if (this.enableFiltering) {
                    options.group = groupBits(BodyGroup.Ellipse);
                }
                body = this.check2d.createEllipse({ x, y }, width, height, 2, options);
                ++this.ellipses;
                break;
            case 2:
                if (this.enableFiltering) {
                    options.group = groupBits(BodyGroup.Box);
                }
                body = this.check2d.createBox({ x, y }, random(minSize, maxSize), random(minSize, maxSize), options);
                ++this.boxes;
                break;
            case 3:
                if (this.enableFiltering) {
                    options.group = groupBits(BodyGroup.Line);
                }
                body = this.check2d.createLine({ x, y }, {
                    x: x + random(minSize, maxSize),
                    y: y + random(minSize, maxSize),
                }, options);
                ++this.lines;
                break;
            default:
                if (this.enableFiltering) {
                    options.group = groupBits(BodyGroup.Polygon);
                }
                body = this.check2d.createPolygon({ x, y }, [
                    { x: -random(minSize, maxSize), y: random(minSize, maxSize) },
                    { x: random(minSize, maxSize), y: random(minSize, maxSize) },
                    { x: random(minSize, maxSize), y: -random(minSize, maxSize) },
                    { x: -random(minSize, maxSize), y: -random(minSize, maxSize) },
                ], options);
                ++this.polygons;
                break;
        }
        // set initial rotation angle direction
        body.rotationSpeed = (seededRandom() - seededRandom()) * 0.1;
        body.setAngle((random(0, 360) * Math.PI) / 180);
        body.targetScale = { x: 1, y: 1 };
        body.size = (minSize + maxSize) / 2;
        body.directionX = Math.cos(direction);
        body.directionY = Math.sin(direction);
        this.bodies.push(body);
    }
}
module.exports = Stress;
