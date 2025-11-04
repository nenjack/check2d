/* tslint:disable:no-implicit-dependencies variable-name no-any */
import { Bench } from 'tinybench'
import { clearLoop } from '../demo/canvas'
import Stress from '../demo/stress'

const amounts = Array.from(
  { length: 10 },
  (_, index: number) => 1000 * (index + 1)
)

export const stressBenchmark = async () => {
  let stressTest: Stress

  const benchmark = new Bench({
    time: 1000,
    warmupIterations: 0
  })

  amounts.forEach((items) => {
    benchmark.add(
      `stress test, items=${items}`,
      () => {
        stressTest.update()
      },
      {
        beforeEach: () => {
          stressTest = new Stress(items, true)
        },
        afterEach: () => {
          clearLoop()
          stressTest.check2d.clear()
        }
      }
    )
  })

  await benchmark.run()

  console.table(benchmark.table())
}
