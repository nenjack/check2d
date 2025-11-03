export = Stress
declare class Stress {
  constructor(count?: number)
  size: number
  check2d: System<import('../model').Body>
  bodies: any[]
  polygons: number
  boxes: number
  circles: number
  ellipses: number
  lines: number
  lastVariant: number
  count: number
  bounds: import('..').Box<any>[]
  enableFiltering: boolean
  legend: string
  lastTime: number
  updateBody(body: any): void
  start: () => void
  getBounds(): import('..').Box<any>[]
  toggleFiltering(): void
  update(): void
  timeScale: number | undefined
  bounceBody(body: any): void
  createShape(large: any): void
}
import { System } from '../system'
