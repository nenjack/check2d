'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.insertionBenchmark = void 0
/* tslint:disable:no-implicit-dependencies */
const tinybench_1 = require('tinybench')
const circle_js_1 = require('../bodies/circle.js')
const polygon_js_1 = require('../bodies/polygon.js')
const model_js_1 = require('../model.js')
const system_js_1 = require('../system.js')
const insertionBenchmark = () => {
  const benchmark = new tinybench_1.Bench({})
  const nonoverlappingBodies = []
  const nonoverlappingTriangles = []
  const nonoverlappingRectangles = []
  const overlappingBodies = []
  const overlappingTriangles = []
  const overlappingRectangles = []
  const BODY_COUNT = 1000
  for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
    nonoverlappingBodies.push(
      new circle_js_1.Circle(new model_js_1.SATVector(ndx, 0), 0.25)
    )
    overlappingBodies.push(
      new circle_js_1.Circle(new model_js_1.SATVector(0, 0), 0.25)
    )
    nonoverlappingTriangles.push(
      new polygon_js_1.Polygon(new model_js_1.SATVector(ndx * 2, 0), [
        new model_js_1.SATVector(0, 0),
        new model_js_1.SATVector(0, 1),
        new model_js_1.SATVector(1, 0)
      ])
    )
    overlappingTriangles.push(
      new polygon_js_1.Polygon(new model_js_1.SATVector(0, 0), [
        new model_js_1.SATVector(0, 0),
        new model_js_1.SATVector(0, 1),
        new model_js_1.SATVector(1, 0)
      ])
    )
    nonoverlappingRectangles.push(
      new polygon_js_1.Polygon(new model_js_1.SATVector(0, 0), [
        new model_js_1.SATVector(0, 0),
        new model_js_1.SATVector(0, 1),
        new model_js_1.SATVector(1, 1),
        new model_js_1.SATVector(1, 0)
      ])
    )
    overlappingRectangles.push(
      new polygon_js_1.Polygon(new model_js_1.SATVector(0, 0), [
        new model_js_1.SATVector(0, 0),
        new model_js_1.SATVector(0, 1),
        new model_js_1.SATVector(1, 1),
        new model_js_1.SATVector(1, 0)
      ])
    )
  }
  benchmark
    .add('non overlapping circles', () => {
      const uut = new system_js_1.System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(nonoverlappingBodies[ndx])
      }
    })
    .add('overlapping circles', () => {
      const uut = new system_js_1.System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(overlappingBodies[ndx])
      }
    })
    .add('non-overlapping triangles', () => {
      const uut = new system_js_1.System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(nonoverlappingTriangles[ndx])
      }
    })
    .add('overlapping triangles', () => {
      const uut = new system_js_1.System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(overlappingTriangles[ndx])
      }
    })
    .add('non-overlapping quad', () => {
      const uut = new system_js_1.System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(nonoverlappingRectangles[ndx])
      }
    })
    .add('overlapping quad', () => {
      const uut = new system_js_1.System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(overlappingRectangles[ndx])
      }
    })
  benchmark
    .run()
    .then(() => {
      console.table(
        benchmark.tasks.map(({ name, result }) => {
          var _a, _b, _c, _d, _e
          return {
            'Task Name': name,
            'Average Time (s)': parseFloat(
              ((_a =
                result === null || result === void 0 ? void 0 : result.mean) !==
                null && _a !== void 0
                ? _a
                : 0
              ).toFixed(3)
            ),
            'Standard Deviation (s)': parseFloat(
              ((_b =
                result === null || result === void 0 ? void 0 : result.sd) !==
                null && _b !== void 0
                ? _b
                : 0
              ).toFixed(3)
            ),
            hz: parseFloat(
              ((_c =
                result === null || result === void 0 ? void 0 : result.hz) !==
                null && _c !== void 0
                ? _c
                : 0
              ).toFixed(3)
            ),
            'p99 (s)': parseFloat(
              ((_d =
                result === null || result === void 0 ? void 0 : result.p99) !==
                null && _d !== void 0
                ? _d
                : 0
              ).toFixed(3)
            ),
            'p995 (s)': parseFloat(
              ((_e =
                result === null || result === void 0 ? void 0 : result.p995) !==
                null && _e !== void 0
                ? _e
                : 0
              ).toFixed(3)
            )
          }
        })
      )
    })
    .catch((err) => {
      console.warn(err.message || err)
    })
}
exports.insertionBenchmark = insertionBenchmark
