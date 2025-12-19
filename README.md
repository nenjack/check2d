# check2d

## [<img valign="middle" src="https://img.shields.io/npm/dw/check2d.svg?style=for-the-badge&color=success" alt="npm downloads per week" />](https://www.npmjs.com/package/check2d) + [<img valign="middle" src="https://img.shields.io/npm/dw/detect-collisions.svg?style=for-the-badge&color=success" alt="npm downloads per week" />](https://www.npmjs.com/package/detect-collisions) @ [<img valign="middle" src="https://img.shields.io/npm/v/check2d?style=for-the-badge&color=success" alt="npm version" />](https://www.npmjs.com/package/check2d?activeTab=versions)

**check2d** is a **feature-complete 2D collision detection library** for JavaScript, designed for **real-time games and simulations**.

It combines a **Bounding Volume Hierarchy (BVH)** broad phase with **Separating Axis Theorem (SAT)** narrow phase detection, providing fast and accurate collision checks across many shape types.

### highlights

- BVH-based broad phase for high performance
- SAT-based precise collision detection
- supports boxes, circles, ellipses, polygons, lines, points
- raycasting, offsets, rotation, scaling
- group-based collision filtering
- visual debugging helpers
- browser and Node.js support
- battle-tested and well benchmarked

---

## demos

- Stress test  
  https://nenjack.github.io/check2d/demo/?stress
- Tank demo  
  https://nenjack.github.io/check2d/demo/
- StackBlitz  
  https://stackblitz.com/edit/check2d
- CodePan  
  https://nenjack.github.io/codepan/#/boilerplate/check2d?pans=console,html

---

## quick start

```ts
const { System } = require('check2d')

const system = new System()
````

### creating bodies

```ts
const { Box, Circle, Polygon } = require('check2d')

const box = system.createBox({ x: 0, y: 0 }, 10, 10)
const circle = new Circle({ x: 5, y: 0 }, 5)

system.insert(circle)
```

---

## body manipulation

Bodies can be transformed freely. Changes are batched and applied once.

```ts
box.setPosition(10, 5, false)
box.setAngle(Math.PI / 4, false)
box.setScale(2, 1, false)
box.move(1, false)

box.updateBody()
```

Supported features include:

* position, rotation, scale
* movement in facing direction
* offsets relative to body center
* AABB access
* padding to reduce BVH reinserts
* group-based collision filtering

---

## collision checks

```ts
system.checkAll((result) => {
  console.log(result)
})

system.checkOne(box, (result) => {
  console.log(result)
})

// optional automatic separation
system.separate()
```

### collision points

```ts
const points = system.getCollisionPoints(result.a, result.b)
```

---

## raycasting

```ts
const hit = system.raycast(
  { x: 0, y: 0 },
  { x: 0, y: -10 },
  (body) => true
)

if (hit) {
  const { point, body } = hit
  console.log(point, body)
}
```

---

## visual debugging

Draw bodies directly to a `<canvas>` context:

```ts
context.beginPath()
system.draw(context)
context.stroke()
```

Draw BVH bounding boxes:

```ts
context.beginPath()
system.drawBVH(context)
context.stroke()
```

---

## browser usage

```js
import { System } from 'https://esm.sh/check2d'
```

---

## testing & benchmark

```bash
Test Suites: 12 passed, 12 total
Tests:       84 passed, 84 total
```

Run benchmarks and stress tests:

```bash
git clone https://github.com/nenjack/check2d.git
cd check2d
npm i
npm run benchmark
```

---

## installation

```bash
yarn add check2d
```

---

## documentation

API reference and guides:
[https://nenjack.github.io/check2d/](https://nenjack.github.io/check2d/)

---

## why not a physics engine?

Physics engines like Matter.js or Planck.js are excellent when full simulation is required, but they often introduce unnecessary overhead when **only collision detection is needed**.

**check2d** focuses purely on collision detection:

* no gravity
* no forces
* no assumptions about movement

This makes it ideal as a **standalone collision system** or as the foundation of a custom physics engine.

---

## contributing

Contributions are welcome.

* run `npm run precommit`
* follow conventional commits
* avoid using `any`

---

## license

MIT
