"use strict";
// super basic mock
const win = typeof window !== "undefined" ? window : {};
const doc = typeof document !== "undefined" ? document : {};
const width = win.innerWidth || 1024;
const height = win.innerHeight || 768;
const { clock } = require("../clock");
class TestCanvas {
    constructor(test) {
        if (!doc.createElement) {
            throw new Error("Do not use demo/canvas.js in node env!");
        }
        this.check2d = test.check2d;
        this.drawCallback = test.drawCallback;
        this.createCanvas();
        this.setContext(this.canvas, test);
        this.createElement(test.legend);
        this.element.appendChild(this.canvas);
        this.frame = 0;
        this.fps = 0;
        this.started = Date.now();
        this.clock = clock;
        this.clock.add(this.update.bind(this));
    }
    get bvhCheckbox() {
        return this.element.querySelector("#bvh");
    }
    createCanvas() {
        this.canvas = doc.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
    }
    createElement(legend = "") {
        this.element = doc.createElement("div");
        this.element.id = "debug";
        this.element.innerHTML = `${legend}
    <div>
      <label>
        <input id="bvh" type="checkbox"/> Show Bounding Volume Hierarchy
      </label>
    </div>`;
    }
    setContext(canvas, test) {
        this.context = canvas.getContext("2d");
        this.context.font = "24px Arial";
        test.context = this.context;
    }
    update() {
        var _a;
        this.frame++;
        const timeDiff = Date.now() - this.started;
        if (timeDiff >= 1000) {
            this.fps = this.frame / (timeDiff / 1000);
            this.frame = 0;
            this.started = Date.now();
        }
        // Clear the canvas
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, width, height);
        // Render the bodies
        this.context.strokeStyle = "#FFFFFF";
        this.context.beginPath();
        this.check2d.draw(this.context);
        this.context.stroke();
        // Render the BVH
        if (this.bvhCheckbox.checked) {
            this.context.strokeStyle = "#00FF00";
            this.context.beginPath();
            this.check2d.drawBVH(this.context);
            this.context.stroke();
        }
        // Render the FPS
        this.context.fillStyle = "#FFCC00";
        this.context.fillText(`FPS: ${this.fps ? this.fps.toFixed(0) : "?"}`, 24, 48);
        (_a = this.drawCallback) === null || _a === void 0 ? void 0 : _a.call(this);
    }
}
module.exports.TestCanvas = TestCanvas;
module.exports.win = win;
module.exports.doc = doc;
module.exports.width = width;
module.exports.height = height;
