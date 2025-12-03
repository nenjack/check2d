var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
/* tslint:disable:no-implicit-dependencies variable-name no-any */
import { Bench } from 'tinybench'
import Stress from '../demo/stress'
const amounts = Array.from({ length: 10 }, (_, index) => 1000 * (index + 1))
export const stressBenchmark = () =>
  __awaiter(void 0, void 0, void 0, function* () {
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
    yield benchmark.run()
    console.table(benchmark.table())
  })
