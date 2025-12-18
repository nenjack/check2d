# [<img src="https://img.shields.io/npm/dw/check2d.svg?style=for-the-badge&color=success" alt="npm downloads per week" />](https://www.npmjs.com/package/check2d) + [<img src="https://img.shields.io/npm/dw/detect-collisions.svg?style=for-the-badge&color=success" alt="npm downloads per week" />](https://www.npmjs.com/package/detect-collisions) @ [<img src="https://img.shields.io/npm/v/check2d?style=for-the-badge&color=success" alt="npm version" />](https://www.npmjs.com/package/check2d?activeTab=versions)

## Introduction

~~detect-collisions~~ 🚀 `check2d` is a feature-complete library to detect collisions between all possible kinds of shapes. It uses Bounding Volume Hierarchy (BVH) for sweep wide quick tree trim phase, and the Separating Axis Theorem (SAT) for accurate detection inside nearby groups. This library supports RayCasting, offsets, rotation, scaling, and optimizations. Also includes flags for groups filtering - making it an ideal choice for real-time online gaming and simulations.

## Very Tested

```bash
Test Suites: 12 passed, 12 total
Tests:       84 passed, 84 total
```

## Demos

- [Tank](https://nenjack.github.io/check2d/demo/)
- [Stress Test](https://nenjack.github.io/check2d/demo/?stress)
- [Stackblitz](https://stackblitz.com/edit/check2d)
- [CodePan](https://nenjack.github.io/codepan/#/boilerplate/check2d?pans=console,html)

## Installation

```bash
yarn add check2d
```

## API Documentation

For detailed documentation on the library's API, refer to the following link:

[check2d API Documentation](https://nenjack.github.io/check2d/)

## Usage

### Step 1: Initialize Collision System

Initialize a unique collision system using check2d:

```ts
const { System } = require('check2d')
const check2d = new System()
```

### Step 2: Understand Body Attributes

Bodies possess various properties:

- **Position**: Use `setPosition(x: number, y: number)` for teleport and `move(speed: number)` for moving forward in direction of its angle.
- **Scale**: Use `setScale(x: number, y: number)` for setting and `scale: Vector` for getting scale
- **Rotation**: Use `setAngle(radians: number)` for setting and `angle: number` for getting and `deg2rad(degrees: number)` to convert to radians.
- **Offset**: Use `setOffset(offset: Vector)` for setting and `offset: Vector` for getting offset from the body center.
- **AABB Bounding Box**: Use `aabb: BBox` for inserted or `getAABBAsBBox(): BBox` for non inserted bodies to get the bounding box.
- **Padding**: Use `padding: number` and set to nonzero value to reduce costly reinserts on attributes' change.
- **Collision Filtering**: Use `group: number` for collision filtering, with a range within 0x0 ~ 0x7fffffff.
- **Body Options**: [Read more in BodyOptions documentation](https://nenjack.github.io/check2d/interfaces/BodyOptions.html)

### Step 3: Create and Manage Bodies

Create bodies of various types and manage them:

```ts
const { Box, Circle, Ellipse, Line, Point, Polygon } = require('check2d')

// Example: Create and insert box1 body
const box1 = check2d.createBox(position, width, height, options)
// Example: Create box2 body
const box2 = new Box(position, width, height, options)
// Example: Insert box2 body
check2d.insert(box2)
```

### Step 4: Manipulate Bodies

Manipulate body attributes and update the collision system:

```ts
// if omitted updateNow is true
const updateNow = false
// this should be time scaled, 1 for example
const speed = 1

// teleport
box.setPosition(x, y, updateNow)
box.setScale(scaleX, scaleY, updateNow)
box.setAngle(angle, updateNow)
box.move(speed, updateNow)
box.setOffset({ x, y }, updateNow)
console.log(box.dirty) // true

box.updateBody() // Update the body once, when all manipulations are done
console.log(box.dirty) // false

box.group = group // Immediate effect, no body/system update needed
console.log(box.dirty) // false
```

### Step 5: Collision Detection and Resolution

Detect collisions and respond accordingly:

```ts
const callback = (result) => {
  console.info(result)
}

if (check2d.checkAll(callback)) {
  // Do something yourself
}

if (check2d.checkOne(body, callback)) {
  // Do something yourself
}

// Or separate bodies based on isStatic/isTrigger
check2d.separate()
```

Get exact collision points:

```ts
const { a, b } = result
const points = check2d.getCollisionPoints(a, b)
```

### Step 6: Cleaning Up

Remove bodies when they're no longer needed:

```ts
check2d.remove(body)
```

And that's it! You're now ready to utilize the check2d library in your project.

## Visual Debugging with Rendering

To facilitate debugging, check2d allows you to visually represent the collision bodies. By invoking the `draw()` method and supplying a 2D context of a `<canvas>` element, you can draw all the bodies within a collision check2d. You can also opt to draw individual bodies.

```ts
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')

context.strokeStyle = '#FFFFFF'
context.beginPath()
// draw specific body
body.draw(context)
// draw whole system
check2d.draw(context)
context.stroke()
```

To assess the [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy), you can draw the BVH.

```ts
context.strokeStyle = '#FFFFFF'
context.beginPath()
// draw specific body bounding box
body.drawBVH(context)
// draw bounding volume hierarchy of the system
check2d.drawBVH(context)
context.stroke()
```

## Raycasting

check2d provides the functionality to gather raycast data. Here's how:

```ts
const start = { x: 0, y: 0 }
const end = { x: 0, y: -10 }
const hit = check2d.raycast(start, end, (body, ray) => {
  // if you don't want the body to be hit by raycast return false
  return true
})

if (hit) {
  const { point, body } = hit

  console.log({ point, body })
}
```

In this example, `point` is a `Vector` with the coordinates of the nearest intersection, and `body` is a reference to the closest body.

## Usage in Browsers

```js
import { System } from 'https://esm.sh/check2d'
```

## Contributing to the Project

We welcome contributions! Feel free to open a merge request. When doing so, please adhere to the following code style guidelines:

- Execute the `npm run precommit` script prior to submitting your merge request
- Follow the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) standard
- Refrain from using the `any` type

## Additional Considerations

### Why not use a physics engine?

While physics engines like [Matter-js](https://github.com/liabru/matter-js) or [Planck.js](https://github.com/shakiba/planck.js) are recommended for projects that need comprehensive physics simulation, not all projects require such complexity. In fact, using a physics engine solely for collision detection can lead to unnecessary overhead and complications due to built-in assumptions (gravity, velocity, friction, etc.). check2d is purpose-built for efficient and robust collision detection, making it an excellent choice for projects that primarily require this functionality. It can also serve as the foundation for a custom physics engine.

## Benchmark

This will provide you with the results of both the insertion test benchmark and a headless [Stress Demo](https://nenjack.github.io/check2d/demo/?stress) benchmark, featuring moving bodies, with increasing amounts in each step.

```bash
git clone https://github.com/nenjack/check2d.git
cd check2d
npm i && npm run build # will build & run tests & run benchmarks
```

## License

MIT
