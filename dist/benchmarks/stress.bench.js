/* tslint:disable:no-implicit-dependencies variable-name no-any */
import { Bench } from 'tinybench'
import Stress from '../demo/stress'
const amounts = Array.from({ length: 10 }, (_, index) => 1000 * (index + 1))
export const stressBenchmark = async () => {
  let stressTest
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
          stressTest = new Stress(items)
        },
        afterEach: () => {
          stressTest.clear()
        }
      }
    )
  })
  await benchmark.run()
  console.table(benchmark.table())
}
