/* tslint:disable:no-implicit-dependencies */
import { Bench } from 'tinybench'
import { Circle } from '../bodies/circle.js'
import { Polygon } from '../bodies/polygon.js'
import { SATVector } from '../model.js'
import { System } from '../system.js'
export const insertionBenchmark = () => {
  const benchmark = new Bench({})
  const nonoverlappingBodies = []
  const nonoverlappingTriangles = []
  const nonoverlappingRectangles = []
  const overlappingBodies = []
  const overlappingTriangles = []
  const overlappingRectangles = []
  const BODY_COUNT = 1000
  for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
    nonoverlappingBodies.push(new Circle(new SATVector(ndx, 0), 0.25))
    overlappingBodies.push(new Circle(new SATVector(0, 0), 0.25))
    nonoverlappingTriangles.push(
      new Polygon(new SATVector(ndx * 2, 0), [
        new SATVector(0, 0),
        new SATVector(0, 1),
        new SATVector(1, 0)
      ])
    )
    overlappingTriangles.push(
      new Polygon(new SATVector(0, 0), [
        new SATVector(0, 0),
        new SATVector(0, 1),
        new SATVector(1, 0)
      ])
    )
    nonoverlappingRectangles.push(
      new Polygon(new SATVector(0, 0), [
        new SATVector(0, 0),
        new SATVector(0, 1),
        new SATVector(1, 1),
        new SATVector(1, 0)
      ])
    )
    overlappingRectangles.push(
      new Polygon(new SATVector(0, 0), [
        new SATVector(0, 0),
        new SATVector(0, 1),
        new SATVector(1, 1),
        new SATVector(1, 0)
      ])
    )
  }
  benchmark
    .add('non overlapping circles', () => {
      const uut = new System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(nonoverlappingBodies[ndx])
      }
    })
    .add('overlapping circles', () => {
      const uut = new System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(overlappingBodies[ndx])
      }
    })
    .add('non-overlapping triangles', () => {
      const uut = new System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(nonoverlappingTriangles[ndx])
      }
    })
    .add('overlapping triangles', () => {
      const uut = new System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(overlappingTriangles[ndx])
      }
    })
    .add('non-overlapping quad', () => {
      const uut = new System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(nonoverlappingRectangles[ndx])
      }
    })
    .add('overlapping quad', () => {
      const uut = new System(BODY_COUNT)
      for (let ndx = 0; ndx < BODY_COUNT; ndx++) {
        uut.insert(overlappingRectangles[ndx])
      }
    })
  benchmark
    .run()
    .then(() => {
      console.table(
        benchmark.tasks.map(({ name, result }) => ({
          'Task Name': name,
          'Average Time (s)': parseFloat((result?.mean ?? 0).toFixed(3)),
          'Standard Deviation (s)': parseFloat((result?.sd ?? 0).toFixed(3)),
          hz: parseFloat((result?.hz ?? 0).toFixed(3)),
          'p99 (s)': parseFloat((result?.p99 ?? 0).toFixed(3)),
          'p995 (s)': parseFloat((result?.p995 ?? 0).toFixed(3))
        }))
      )
    })
    .catch((err) => {
      console.warn(err.message || err)
    })
}
