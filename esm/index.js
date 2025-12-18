var SAT$1 = { exports: {} }

var SAT = SAT$1.exports

var hasRequiredSAT

function requireSAT() {
  if (hasRequiredSAT) return SAT$1.exports
  hasRequiredSAT = 1
  ;(function (module, exports$1) {
    // Version 0.9.0 - Copyright 2012 - 2021 -  Jim Riecken <jimr@jimr.ca>
    //
    // Released under the MIT License - https://github.com/jriecken/sat-js
    //
    // A simple library for determining intersections of circles and
    // polygons using the Separating Axis Theorem.
    /** @preserve SAT.js - Version 0.9.0 - Copyright 2012 - 2021 - Jim Riecken <jimr@jimr.ca> - released under the MIT License. https://github.com/jriecken/sat-js */

    /*global define: false, module: false*/
    /*jshint shadow:true, sub:true, forin:true, noarg:true, noempty:true,
		  eqeqeq:true, bitwise:true, strict:true, undef:true,
		  curly:true, browser:true */

    // Create a UMD wrapper for SAT. Works in:
    //
    //  - Plain browser via global SAT variable
    //  - AMD loader (like require.js)
    //  - Node.js
    //
    // The quoted properties all over the place are used so that the Closure Compiler
    // does not mangle the exposed API in advanced mode.
    /**
     * @param {*} root - The global scope
     * @param {Function} factory - Factory that creates SAT module
     */
    ;(function (root, factory) {
      {
        module['exports'] = factory()
      }
    })(SAT, function () {
      var SAT = {}

      //
      // ## Vector
      //
      // Represents a vector in two dimensions with `x` and `y` properties.

      // Create a new Vector, optionally passing in the `x` and `y` coordinates. If
      // a coordinate is not specified, it will be set to `0`
      /**
       * @param {?number=} x The x position.
       * @param {?number=} y The y position.
       * @constructor
       */
      function Vector(x, y) {
        this['x'] = x || 0
        this['y'] = y || 0
      }
      SAT['Vector'] = Vector
      // Alias `Vector` as `V`
      SAT['V'] = Vector

      // Copy the values of another Vector into this one.
      /**
       * @param {Vector} other The other Vector.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['copy'] = Vector.prototype.copy = function (other) {
        this['x'] = other['x']
        this['y'] = other['y']
        return this
      }

      // Create a new vector with the same coordinates as this on.
      /**
       * @return {Vector} The new cloned vector
       */
      Vector.prototype['clone'] = Vector.prototype.clone = function () {
        return new Vector(this['x'], this['y'])
      }

      // Change this vector to be perpendicular to what it was before. (Effectively
      // roatates it 90 degrees in a clockwise direction)
      /**
       * @return {Vector} This for chaining.
       */
      Vector.prototype['perp'] = Vector.prototype.perp = function () {
        var x = this['x']
        this['x'] = this['y']
        this['y'] = -x
        return this
      }

      // Rotate this vector (counter-clockwise) by the specified angle (in radians).
      /**
       * @param {number} angle The angle to rotate (in radians)
       * @return {Vector} This for chaining.
       */
      Vector.prototype['rotate'] = Vector.prototype.rotate = function (angle) {
        var x = this['x']
        var y = this['y']
        this['x'] = x * Math.cos(angle) - y * Math.sin(angle)
        this['y'] = x * Math.sin(angle) + y * Math.cos(angle)
        return this
      }

      // Reverse this vector.
      /**
       * @return {Vector} This for chaining.
       */
      Vector.prototype['reverse'] = Vector.prototype.reverse = function () {
        this['x'] = -this['x']
        this['y'] = -this['y']
        return this
      }

      // Normalize this vector.  (make it have length of `1`)
      /**
       * @return {Vector} This for chaining.
       */
      Vector.prototype['normalize'] = Vector.prototype.normalize = function () {
        var d = this.len()
        if (d > 0) {
          this['x'] = this['x'] / d
          this['y'] = this['y'] / d
        }
        return this
      }

      // Add another vector to this one.
      /**
       * @param {Vector} other The other Vector.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['add'] = Vector.prototype.add = function (other) {
        this['x'] += other['x']
        this['y'] += other['y']
        return this
      }

      // Subtract another vector from this one.
      /**
       * @param {Vector} other The other Vector.
       * @return {Vector} This for chaiing.
       */
      Vector.prototype['sub'] = Vector.prototype.sub = function (other) {
        this['x'] -= other['x']
        this['y'] -= other['y']
        return this
      }

      // Scale this vector. An independent scaling factor can be provided
      // for each axis, or a single scaling factor that will scale both `x` and `y`.
      /**
       * @param {number} x The scaling factor in the x direction.
       * @param {?number=} y The scaling factor in the y direction.  If this
       *   is not specified, the x scaling factor will be used.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['scale'] = Vector.prototype.scale = function (x, y) {
        this['x'] *= x
        this['y'] *= typeof y != 'undefined' ? y : x
        return this
      }

      // Project this vector on to another vector.
      /**
       * @param {Vector} other The vector to project onto.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['project'] = Vector.prototype.project = function (
        other
      ) {
        var amt = this.dot(other) / other.len2()
        this['x'] = amt * other['x']
        this['y'] = amt * other['y']
        return this
      }

      // Project this vector onto a vector of unit length. This is slightly more efficient
      // than `project` when dealing with unit vectors.
      /**
       * @param {Vector} other The unit vector to project onto.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['projectN'] = Vector.prototype.projectN = function (
        other
      ) {
        var amt = this.dot(other)
        this['x'] = amt * other['x']
        this['y'] = amt * other['y']
        return this
      }

      // Reflect this vector on an arbitrary axis.
      /**
       * @param {Vector} axis The vector representing the axis.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['reflect'] = Vector.prototype.reflect = function (axis) {
        var x = this['x']
        var y = this['y']
        this.project(axis).scale(2)
        this['x'] -= x
        this['y'] -= y
        return this
      }

      // Reflect this vector on an arbitrary axis (represented by a unit vector). This is
      // slightly more efficient than `reflect` when dealing with an axis that is a unit vector.
      /**
       * @param {Vector} axis The unit vector representing the axis.
       * @return {Vector} This for chaining.
       */
      Vector.prototype['reflectN'] = Vector.prototype.reflectN = function (
        axis
      ) {
        var x = this['x']
        var y = this['y']
        this.projectN(axis).scale(2)
        this['x'] -= x
        this['y'] -= y
        return this
      }

      // Get the dot product of this vector and another.
      /**
       * @param {Vector}  other The vector to dot this one against.
       * @return {number} The dot product.
       */
      Vector.prototype['dot'] = Vector.prototype.dot = function (other) {
        return this['x'] * other['x'] + this['y'] * other['y']
      }

      // Get the squared length of this vector.
      /**
       * @return {number} The length^2 of this vector.
       */
      Vector.prototype['len2'] = Vector.prototype.len2 = function () {
        return this.dot(this)
      }

      // Get the length of this vector.
      /**
       * @return {number} The length of this vector.
       */
      Vector.prototype['len'] = Vector.prototype.len = function () {
        return Math.sqrt(this.len2())
      }

      // ## Circle
      //
      // Represents a circle with a position and a radius.

      // Create a new circle, optionally passing in a position and/or radius. If no position
      // is given, the circle will be at `(0,0)`. If no radius is provided, the circle will
      // have a radius of `0`.
      /**
       * @param {Vector=} pos A vector representing the position of the center of the circle
       * @param {?number=} r The radius of the circle
       * @constructor
       */
      function Circle(pos, r) {
        this['pos'] = pos || new Vector()
        this['r'] = r || 0
        this['offset'] = new Vector()
      }
      SAT['Circle'] = Circle

      // Compute the axis-aligned bounding box (AABB) of this Circle.
      //
      // Note: Returns a _new_ `Box` each time you call this.
      /**
       * @return {Polygon} The AABB
       */
      Circle.prototype['getAABBAsBox'] = Circle.prototype.getAABBAsBox =
        function () {
          var r = this['r']
          var corner = this['pos']
            .clone()
            .add(this['offset'])
            .sub(new Vector(r, r))
          return new Box(corner, r * 2, r * 2)
        }

      // Compute the axis-aligned bounding box (AABB) of this Circle.
      //
      // Note: Returns a _new_ `Polygon` each time you call this.
      /**
       * @return {Polygon} The AABB
       */
      Circle.prototype['getAABB'] = Circle.prototype.getAABB = function () {
        return this.getAABBAsBox().toPolygon()
      }

      // Set the current offset to apply to the radius.
      /**
       * @param {Vector} offset The new offset vector.
       * @return {Circle} This for chaining.
       */
      Circle.prototype['setOffset'] = Circle.prototype.setOffset = function (
        offset
      ) {
        this['offset'] = offset
        return this
      }

      // ## Polygon
      //
      // Represents a *convex* polygon with any number of points (specified in counter-clockwise order)
      //
      // Note: Do _not_ manually change the `points`, `angle`, or `offset` properties. Use the
      // provided setters. Otherwise the calculated properties will not be updated correctly.
      //
      // `pos` can be changed directly.

      // Create a new polygon, passing in a position vector, and an array of points (represented
      // by vectors relative to the position vector). If no position is passed in, the position
      // of the polygon will be `(0,0)`.
      /**
       * @param {Vector=} pos A vector representing the origin of the polygon. (all other
       *   points are relative to this one)
       * @param {Array<Vector>=} points An array of vectors representing the points in the polygon,
       *   in counter-clockwise order.
       * @constructor
       */
      function Polygon(pos, points) {
        this['pos'] = pos || new Vector()
        this['angle'] = 0
        this['offset'] = new Vector()
        this.setPoints(points || [])
      }
      SAT['Polygon'] = Polygon

      // Set the points of the polygon. Any consecutive duplicate points will be combined.
      //
      // Note: The points are counter-clockwise *with respect to the coordinate system*.
      // If you directly draw the points on a screen that has the origin at the top-left corner
      // it will _appear_ visually that the points are being specified clockwise. This is just
      // because of the inversion of the Y-axis when being displayed.
      /**
       * @param {Array<Vector>=} points An array of vectors representing the points in the polygon,
       *   in counter-clockwise order.
       * @return {Polygon} This for chaining.
       */
      Polygon.prototype['setPoints'] = Polygon.prototype.setPoints = function (
        points
      ) {
        // Only re-allocate if this is a new polygon or the number of points has changed.
        var lengthChanged =
          !this['points'] || this['points'].length !== points.length
        if (lengthChanged) {
          var i
          var calcPoints = (this['calcPoints'] = [])
          var edges = (this['edges'] = [])
          var normals = (this['normals'] = [])
          // Allocate the vector arrays for the calculated properties
          for (i = 0; i < points.length; i++) {
            // Remove consecutive duplicate points
            var p1 = points[i]
            var p2 = i < points.length - 1 ? points[i + 1] : points[0]
            if (p1 !== p2 && p1.x === p2.x && p1.y === p2.y) {
              points.splice(i, 1)
              i -= 1
              continue
            }
            calcPoints.push(new Vector())
            edges.push(new Vector())
            normals.push(new Vector())
          }
        }
        this['points'] = points
        this._recalc()
        return this
      }

      // Set the current rotation angle of the polygon.
      /**
       * @param {number} angle The current rotation angle (in radians).
       * @return {Polygon} This for chaining.
       */
      Polygon.prototype['setAngle'] = Polygon.prototype.setAngle = function (
        angle
      ) {
        this['angle'] = angle
        this._recalc()
        return this
      }

      // Set the current offset to apply to the `points` before applying the `angle` rotation.
      /**
       * @param {Vector} offset The new offset vector.
       * @return {Polygon} This for chaining.
       */
      Polygon.prototype['setOffset'] = Polygon.prototype.setOffset = function (
        offset
      ) {
        this['offset'] = offset
        this._recalc()
        return this
      }

      // Rotates this polygon counter-clockwise around the origin of *its local coordinate system* (i.e. `pos`).
      //
      // Note: This changes the **original** points (so any `angle` will be applied on top of this rotation).
      /**
       * @param {number} angle The angle to rotate (in radians)
       * @return {Polygon} This for chaining.
       */
      Polygon.prototype['rotate'] = Polygon.prototype.rotate = function (
        angle
      ) {
        var points = this['points']
        var len = points.length
        for (var i = 0; i < len; i++) {
          points[i].rotate(angle)
        }
        this._recalc()
        return this
      }

      // Translates the points of this polygon by a specified amount relative to the origin of *its own coordinate
      // system* (i.e. `pos`).
      //
      // This is most useful to change the "center point" of a polygon. If you just want to move the whole polygon, change
      // the coordinates of `pos`.
      //
      // Note: This changes the **original** points (so any `offset` will be applied on top of this translation)
      /**
       * @param {number} x The horizontal amount to translate.
       * @param {number} y The vertical amount to translate.
       * @return {Polygon} This for chaining.
       */
      Polygon.prototype['translate'] = Polygon.prototype.translate = function (
        x,
        y
      ) {
        var points = this['points']
        var len = points.length
        for (var i = 0; i < len; i++) {
          points[i]['x'] += x
          points[i]['y'] += y
        }
        this._recalc()
        return this
      }

      // Computes the calculated collision polygon. Applies the `angle` and `offset` to the original points then recalculates the
      // edges and normals of the collision polygon.
      /**
       * @return {Polygon} This for chaining.
       */
      Polygon.prototype._recalc = function () {
        // Calculated points - this is what is used for underlying collisions and takes into account
        // the angle/offset set on the polygon.
        var calcPoints = this['calcPoints']
        // The edges here are the direction of the `n`th edge of the polygon, relative to
        // the `n`th point. If you want to draw a given edge from the edge value, you must
        // first translate to the position of the starting point.
        var edges = this['edges']
        // The normals here are the direction of the normal for the `n`th edge of the polygon, relative
        // to the position of the `n`th point. If you want to draw an edge normal, you must first
        // translate to the position of the starting point.
        var normals = this['normals']
        // Copy the original points array and apply the offset/angle
        var points = this['points']
        var offset = this['offset']
        var angle = this['angle']
        var len = points.length
        var i
        for (i = 0; i < len; i++) {
          var calcPoint = calcPoints[i].copy(points[i])
          calcPoint['x'] += offset['x']
          calcPoint['y'] += offset['y']
          if (angle !== 0) {
            calcPoint.rotate(angle)
          }
        }
        // Calculate the edges/normals
        for (i = 0; i < len; i++) {
          var p1 = calcPoints[i]
          var p2 = i < len - 1 ? calcPoints[i + 1] : calcPoints[0]
          var e = edges[i].copy(p2).sub(p1)
          normals[i].copy(e).perp().normalize()
        }
        return this
      }

      // Compute the axis-aligned bounding box. Any current state
      // (translations/rotations) will be applied before constructing the AABB.
      //
      // Note: Returns a _new_ `Box` each time you call this.
      /**
       * @return {Polygon} The AABB
       */
      Polygon.prototype['getAABBAsBox'] = Polygon.prototype.getAABBAsBox =
        function () {
          var points = this['calcPoints']
          var len = points.length
          var xMin = points[0]['x']
          var yMin = points[0]['y']
          var xMax = points[0]['x']
          var yMax = points[0]['y']
          for (var i = 1; i < len; i++) {
            var point = points[i]
            if (point['x'] < xMin) {
              xMin = point['x']
            } else if (point['x'] > xMax) {
              xMax = point['x']
            }
            if (point['y'] < yMin) {
              yMin = point['y']
            } else if (point['y'] > yMax) {
              yMax = point['y']
            }
          }
          return new Box(
            this['pos'].clone().add(new Vector(xMin, yMin)),
            xMax - xMin,
            yMax - yMin
          )
        }

      // Compute the axis-aligned bounding box. Any current state
      // (translations/rotations) will be applied before constructing the AABB.
      //
      // Note: Returns a _new_ `Polygon` each time you call this.
      /**
       * @return {Polygon} The AABB
       */
      Polygon.prototype['getAABB'] = Polygon.prototype.getAABB = function () {
        return this.getAABBAsBox().toPolygon()
      }

      // Compute the centroid (geometric center) of the polygon. Any current state
      // (translations/rotations) will be applied before computing the centroid.
      //
      // See https://en.wikipedia.org/wiki/Centroid#Centroid_of_a_polygon
      //
      // Note: Returns a _new_ `Vector` each time you call this.
      /**
       * @return {Vector} A Vector that contains the coordinates of the Centroid.
       */
      Polygon.prototype['getCentroid'] = Polygon.prototype.getCentroid =
        function () {
          var points = this['calcPoints']
          var len = points.length
          var cx = 0
          var cy = 0
          var ar = 0
          for (var i = 0; i < len; i++) {
            var p1 = points[i]
            var p2 = i === len - 1 ? points[0] : points[i + 1] // Loop around if last point
            var a = p1['x'] * p2['y'] - p2['x'] * p1['y']
            cx += (p1['x'] + p2['x']) * a
            cy += (p1['y'] + p2['y']) * a
            ar += a
          }
          ar = ar * 3 // we want 1 / 6 the area and we currently have 2*area
          cx = cx / ar
          cy = cy / ar
          return new Vector(cx, cy)
        }

      // ## Box
      //
      // Represents an axis-aligned box, with a width and height.

      // Create a new box, with the specified position, width, and height. If no position
      // is given, the position will be `(0,0)`. If no width or height are given, they will
      // be set to `0`.
      /**
       * @param {Vector=} pos A vector representing the bottom-left of the box (i.e. the smallest x and smallest y value).
       * @param {?number=} w The width of the box.
       * @param {?number=} h The height of the box.
       * @constructor
       */
      function Box(pos, w, h) {
        this['pos'] = pos || new Vector()
        this['w'] = w || 0
        this['h'] = h || 0
      }
      SAT['Box'] = Box

      // Returns a polygon whose edges are the same as this box.
      /**
       * @return {Polygon} A new Polygon that represents this box.
       */
      Box.prototype['toPolygon'] = Box.prototype.toPolygon = function () {
        var pos = this['pos']
        var w = this['w']
        var h = this['h']
        return new Polygon(new Vector(pos['x'], pos['y']), [
          new Vector(),
          new Vector(w, 0),
          new Vector(w, h),
          new Vector(0, h)
        ])
      }

      // ## Response
      //
      // An object representing the result of an intersection. Contains:
      //  - The two objects participating in the intersection
      //  - The vector representing the minimum change necessary to extract the first object
      //    from the second one (as well as a unit vector in that direction and the magnitude
      //    of the overlap)
      //  - Whether the first object is entirely inside the second, and vice versa.
      /**
       * @constructor
       */
      function Response() {
        this['a'] = null
        this['b'] = null
        this['overlapN'] = new Vector()
        this['overlapV'] = new Vector()
        this.clear()
      }
      SAT['Response'] = Response

      // Set some values of the response back to their defaults.  Call this between tests if
      // you are going to reuse a single Response object for multiple intersection tests (recommented
      // as it will avoid allcating extra memory)
      /**
       * @return {Response} This for chaining
       */
      Response.prototype['clear'] = Response.prototype.clear = function () {
        this['aInB'] = true
        this['bInA'] = true
        this['overlap'] = Number.MAX_VALUE
        return this
      }

      // ## Object Pools

      // A pool of `Vector` objects that are used in calculations to avoid
      // allocating memory.
      /**
       * @type {Array<Vector>}
       */
      var T_VECTORS = []
      for (var i = 0; i < 10; i++) {
        T_VECTORS.push(new Vector())
      }

      // A pool of arrays of numbers used in calculations to avoid allocating
      // memory.
      /**
       * @type {Array<Array<number>>}
       */
      var T_ARRAYS = []
      for (var i = 0; i < 5; i++) {
        T_ARRAYS.push([])
      }

      // Temporary response used for polygon hit detection.
      /**
       * @type {Response}
       */
      var T_RESPONSE = new Response()

      // Tiny "point" polygon used for polygon hit detection.
      /**
       * @type {Polygon}
       */
      var TEST_POINT = new Box(new Vector(), 0.000001, 0.000001).toPolygon()

      // ## Helper Functions

      // Flattens the specified array of points onto a unit vector axis,
      // resulting in a one dimensional range of the minimum and
      // maximum value on that axis.
      /**
       * @param {Array<Vector>} points The points to flatten.
       * @param {Vector} normal The unit vector axis to flatten on.
       * @param {Array<number>} result An array.  After calling this function,
       *   result[0] will be the minimum value,
       *   result[1] will be the maximum value.
       */
      function flattenPointsOn(points, normal, result) {
        var min = Number.MAX_VALUE
        var max = -Number.MAX_VALUE
        var len = points.length
        for (var i = 0; i < len; i++) {
          // The magnitude of the projection of the point onto the normal
          var dot = points[i].dot(normal)
          if (dot < min) {
            min = dot
          }
          if (dot > max) {
            max = dot
          }
        }
        result[0] = min
        result[1] = max
      }

      // Check whether two convex polygons are separated by the specified
      // axis (must be a unit vector).
      /**
       * @param {Vector} aPos The position of the first polygon.
       * @param {Vector} bPos The position of the second polygon.
       * @param {Array<Vector>} aPoints The points in the first polygon.
       * @param {Array<Vector>} bPoints The points in the second polygon.
       * @param {Vector} axis The axis (unit sized) to test against.  The points of both polygons
       *   will be projected onto this axis.
       * @param {Response=} response A Response object (optional) which will be populated
       *   if the axis is not a separating axis.
       * @return {boolean} true if it is a separating axis, false otherwise.  If false,
       *   and a response is passed in, information about how much overlap and
       *   the direction of the overlap will be populated.
       */
      function isSeparatingAxis(aPos, bPos, aPoints, bPoints, axis, response) {
        var rangeA = T_ARRAYS.pop()
        var rangeB = T_ARRAYS.pop()
        // The magnitude of the offset between the two polygons
        var offsetV = T_VECTORS.pop().copy(bPos).sub(aPos)
        var projectedOffset = offsetV.dot(axis)
        // Project the polygons onto the axis.
        flattenPointsOn(aPoints, axis, rangeA)
        flattenPointsOn(bPoints, axis, rangeB)
        // Move B's range to its position relative to A.
        rangeB[0] += projectedOffset
        rangeB[1] += projectedOffset
        // Check if there is a gap. If there is, this is a separating axis and we can stop
        if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
          T_VECTORS.push(offsetV)
          T_ARRAYS.push(rangeA)
          T_ARRAYS.push(rangeB)
          return true
        }
        // This is not a separating axis. If we're calculating a response, calculate the overlap.
        if (response) {
          var overlap = 0
          // A starts further left than B
          if (rangeA[0] < rangeB[0]) {
            response['aInB'] = false
            // A ends before B does. We have to pull A out of B
            if (rangeA[1] < rangeB[1]) {
              overlap = rangeA[1] - rangeB[0]
              response['bInA'] = false
              // B is fully inside A.  Pick the shortest way out.
            } else {
              var option1 = rangeA[1] - rangeB[0]
              var option2 = rangeB[1] - rangeA[0]
              overlap = option1 < option2 ? option1 : -option2
            }
            // B starts further left than A
          } else {
            response['bInA'] = false
            // B ends before A ends. We have to push A out of B
            if (rangeA[1] > rangeB[1]) {
              overlap = rangeA[0] - rangeB[1]
              response['aInB'] = false
              // A is fully inside B.  Pick the shortest way out.
            } else {
              var option1 = rangeA[1] - rangeB[0]
              var option2 = rangeB[1] - rangeA[0]
              overlap = option1 < option2 ? option1 : -option2
            }
          }
          // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
          var absOverlap = Math.abs(overlap)
          if (absOverlap < response['overlap']) {
            response['overlap'] = absOverlap
            response['overlapN'].copy(axis)
            if (overlap < 0) {
              response['overlapN'].reverse()
            }
          }
        }
        T_VECTORS.push(offsetV)
        T_ARRAYS.push(rangeA)
        T_ARRAYS.push(rangeB)
        return false
      }
      SAT['isSeparatingAxis'] = isSeparatingAxis

      // Calculates which Voronoi region a point is on a line segment.
      // It is assumed that both the line and the point are relative to `(0,0)`
      //
      //            |       (0)      |
      //     (-1)  [S]--------------[E]  (1)
      //            |       (0)      |
      /**
       * @param {Vector} line The line segment.
       * @param {Vector} point The point.
       * @return  {number} LEFT_VORONOI_REGION (-1) if it is the left region,
       *          MIDDLE_VORONOI_REGION (0) if it is the middle region,
       *          RIGHT_VORONOI_REGION (1) if it is the right region.
       */
      function voronoiRegion(line, point) {
        var len2 = line.len2()
        var dp = point.dot(line)
        // If the point is beyond the start of the line, it is in the
        // left voronoi region.
        if (dp < 0) {
          return LEFT_VORONOI_REGION
        }
        // If the point is beyond the end of the line, it is in the
        // right voronoi region.
        else if (dp > len2) {
          return RIGHT_VORONOI_REGION
        }
        // Otherwise, it's in the middle one.
        else {
          return MIDDLE_VORONOI_REGION
        }
      }
      // Constants for Voronoi regions
      /**
       * @const
       */
      var LEFT_VORONOI_REGION = -1
      /**
       * @const
       */
      var MIDDLE_VORONOI_REGION = 0
      /**
       * @const
       */
      var RIGHT_VORONOI_REGION = 1

      // ## Collision Tests

      // Check if a point is inside a circle.
      /**
       * @param {Vector} p The point to test.
       * @param {Circle} c The circle to test.
       * @return {boolean} true if the point is inside the circle, false if it is not.
       */
      function pointInCircle(p, c) {
        var differenceV = T_VECTORS.pop().copy(p).sub(c['pos']).sub(c['offset'])
        var radiusSq = c['r'] * c['r']
        var distanceSq = differenceV.len2()
        T_VECTORS.push(differenceV)
        // If the distance between is smaller than the radius then the point is inside the circle.
        return distanceSq <= radiusSq
      }
      SAT['pointInCircle'] = pointInCircle

      // Check if a point is inside a convex polygon.
      /**
       * @param {Vector} p The point to test.
       * @param {Polygon} poly The polygon to test.
       * @return {boolean} true if the point is inside the polygon, false if it is not.
       */
      function pointInPolygon(p, poly) {
        TEST_POINT['pos'].copy(p)
        T_RESPONSE.clear()
        var result = testPolygonPolygon(TEST_POINT, poly, T_RESPONSE)
        if (result) {
          result = T_RESPONSE['aInB']
        }
        return result
      }
      SAT['pointInPolygon'] = pointInPolygon

      // Check if two circles collide.
      /**
       * @param {Circle} a The first circle.
       * @param {Circle} b The second circle.
       * @param {Response=} response Response object (optional) that will be populated if
       *   the circles intersect.
       * @return {boolean} true if the circles intersect, false if they don't.
       */
      function testCircleCircle(a, b, response) {
        // Check if the distance between the centers of the two
        // circles is greater than their combined radius.
        var differenceV = T_VECTORS.pop()
          .copy(b['pos'])
          .add(b['offset'])
          .sub(a['pos'])
          .sub(a['offset'])
        var totalRadius = a['r'] + b['r']
        var totalRadiusSq = totalRadius * totalRadius
        var distanceSq = differenceV.len2()
        // If the distance is bigger than the combined radius, they don't intersect.
        if (distanceSq > totalRadiusSq) {
          T_VECTORS.push(differenceV)
          return false
        }
        // They intersect.  If we're calculating a response, calculate the overlap.
        if (response) {
          var dist = Math.sqrt(distanceSq)
          response['a'] = a
          response['b'] = b
          response['overlap'] = totalRadius - dist
          response['overlapN'].copy(differenceV.normalize())
          response['overlapV'].copy(differenceV).scale(response['overlap'])
          response['aInB'] = a['r'] <= b['r'] && dist <= b['r'] - a['r']
          response['bInA'] = b['r'] <= a['r'] && dist <= a['r'] - b['r']
        }
        T_VECTORS.push(differenceV)
        return true
      }
      SAT['testCircleCircle'] = testCircleCircle

      // Check if a polygon and a circle collide.
      /**
       * @param {Polygon} polygon The polygon.
       * @param {Circle} circle The circle.
       * @param {Response=} response Response object (optional) that will be populated if
       *   they interset.
       * @return {boolean} true if they intersect, false if they don't.
       */
      function testPolygonCircle(polygon, circle, response) {
        // Get the position of the circle relative to the polygon.
        var circlePos = T_VECTORS.pop()
          .copy(circle['pos'])
          .add(circle['offset'])
          .sub(polygon['pos'])
        var radius = circle['r']
        var radius2 = radius * radius
        var points = polygon['calcPoints']
        var len = points.length
        var edge = T_VECTORS.pop()
        var point = T_VECTORS.pop()

        // For each edge in the polygon:
        for (var i = 0; i < len; i++) {
          var next = i === len - 1 ? 0 : i + 1
          var prev = i === 0 ? len - 1 : i - 1
          var overlap = 0
          var overlapN = null

          // Get the edge.
          edge.copy(polygon['edges'][i])
          // Calculate the center of the circle relative to the starting point of the edge.
          point.copy(circlePos).sub(points[i])

          // If the distance between the center of the circle and the point
          // is bigger than the radius, the polygon is definitely not fully in
          // the circle.
          if (response && point.len2() > radius2) {
            response['aInB'] = false
          }

          // Calculate which Voronoi region the center of the circle is in.
          var region = voronoiRegion(edge, point)
          // If it's the left region:
          if (region === LEFT_VORONOI_REGION) {
            // We need to make sure we're in the RIGHT_VORONOI_REGION of the previous edge.
            edge.copy(polygon['edges'][prev])
            // Calculate the center of the circle relative the starting point of the previous edge
            var point2 = T_VECTORS.pop().copy(circlePos).sub(points[prev])
            region = voronoiRegion(edge, point2)
            if (region === RIGHT_VORONOI_REGION) {
              // It's in the region we want.  Check if the circle intersects the point.
              var dist = point.len()
              if (dist > radius) {
                // No intersection
                T_VECTORS.push(circlePos)
                T_VECTORS.push(edge)
                T_VECTORS.push(point)
                T_VECTORS.push(point2)
                return false
              } else if (response) {
                // It intersects, calculate the overlap.
                response['bInA'] = false
                overlapN = point.normalize()
                overlap = radius - dist
              }
            }
            T_VECTORS.push(point2)
            // If it's the right region:
          } else if (region === RIGHT_VORONOI_REGION) {
            // We need to make sure we're in the left region on the next edge
            edge.copy(polygon['edges'][next])
            // Calculate the center of the circle relative to the starting point of the next edge.
            point.copy(circlePos).sub(points[next])
            region = voronoiRegion(edge, point)
            if (region === LEFT_VORONOI_REGION) {
              // It's in the region we want.  Check if the circle intersects the point.
              var dist = point.len()
              if (dist > radius) {
                // No intersection
                T_VECTORS.push(circlePos)
                T_VECTORS.push(edge)
                T_VECTORS.push(point)
                return false
              } else if (response) {
                // It intersects, calculate the overlap.
                response['bInA'] = false
                overlapN = point.normalize()
                overlap = radius - dist
              }
            }
            // Otherwise, it's the middle region:
          } else {
            // Need to check if the circle is intersecting the edge,
            // Change the edge into its "edge normal".
            var normal = edge.perp().normalize()
            // Find the perpendicular distance between the center of the
            // circle and the edge.
            var dist = point.dot(normal)
            var distAbs = Math.abs(dist)
            // If the circle is on the outside of the edge, there is no intersection.
            if (dist > 0 && distAbs > radius) {
              // No intersection
              T_VECTORS.push(circlePos)
              T_VECTORS.push(normal)
              T_VECTORS.push(point)
              return false
            } else if (response) {
              // It intersects, calculate the overlap.
              overlapN = normal
              overlap = radius - dist
              // If the center of the circle is on the outside of the edge, or part of the
              // circle is on the outside, the circle is not fully inside the polygon.
              if (dist >= 0 || overlap < 2 * radius) {
                response['bInA'] = false
              }
            }
          }

          // If this is the smallest overlap we've seen, keep it.
          // (overlapN may be null if the circle was in the wrong Voronoi region).
          if (
            overlapN &&
            response &&
            Math.abs(overlap) < Math.abs(response['overlap'])
          ) {
            response['overlap'] = overlap
            response['overlapN'].copy(overlapN)
          }
        }

        // Calculate the final overlap vector - based on the smallest overlap.
        if (response) {
          response['a'] = polygon
          response['b'] = circle
          response['overlapV']
            .copy(response['overlapN'])
            .scale(response['overlap'])
        }
        T_VECTORS.push(circlePos)
        T_VECTORS.push(edge)
        T_VECTORS.push(point)
        return true
      }
      SAT['testPolygonCircle'] = testPolygonCircle

      // Check if a circle and a polygon collide.
      //
      // **NOTE:** This is slightly less efficient than polygonCircle as it just
      // runs polygonCircle and reverses everything at the end.
      /**
       * @param {Circle} circle The circle.
       * @param {Polygon} polygon The polygon.
       * @param {Response=} response Response object (optional) that will be populated if
       *   they interset.
       * @return {boolean} true if they intersect, false if they don't.
       */
      function testCirclePolygon(circle, polygon, response) {
        // Test the polygon against the circle.
        var result = testPolygonCircle(polygon, circle, response)
        if (result && response) {
          // Swap A and B in the response.
          var a = response['a']
          var aInB = response['aInB']
          response['overlapN'].reverse()
          response['overlapV'].reverse()
          response['a'] = response['b']
          response['b'] = a
          response['aInB'] = response['bInA']
          response['bInA'] = aInB
        }
        return result
      }
      SAT['testCirclePolygon'] = testCirclePolygon

      // Checks whether polygons collide.
      /**
       * @param {Polygon} a The first polygon.
       * @param {Polygon} b The second polygon.
       * @param {Response=} response Response object (optional) that will be populated if
       *   they interset.
       * @return {boolean} true if they intersect, false if they don't.
       */
      function testPolygonPolygon(a, b, response) {
        var aPoints = a['calcPoints']
        var aLen = aPoints.length
        var bPoints = b['calcPoints']
        var bLen = bPoints.length
        // If any of the edge normals of A is a separating axis, no intersection.
        for (var i = 0; i < aLen; i++) {
          if (
            isSeparatingAxis(
              a['pos'],
              b['pos'],
              aPoints,
              bPoints,
              a['normals'][i],
              response
            )
          ) {
            return false
          }
        }
        // If any of the edge normals of B is a separating axis, no intersection.
        for (var i = 0; i < bLen; i++) {
          if (
            isSeparatingAxis(
              a['pos'],
              b['pos'],
              aPoints,
              bPoints,
              b['normals'][i],
              response
            )
          ) {
            return false
          }
        }
        // Since none of the edge normals of A or B are a separating axis, there is an intersection
        // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
        // final overlap vector.
        if (response) {
          response['a'] = a
          response['b'] = b
          response['overlapV']
            .copy(response['overlapN'])
            .scale(response['overlap'])
        }
        return true
      }
      SAT['testPolygonPolygon'] = testPolygonPolygon

      return SAT
    })
  })(SAT$1)
  return SAT$1.exports
}

var SATExports = requireSAT()

/**
 * Rearranges items so that all items in the [left, k] are the smallest.
 * The k-th element will have the (k - left + 1)-th smallest value in [left, right].
 *
 * @template T
 * @param {T[]} arr the array to partially sort (in place)
 * @param {number} k middle index for partial sorting (as defined above)
 * @param {number} [left=0] left index of the range to sort
 * @param {number} [right=arr.length-1] right index
 * @param {(a: T, b: T) => number} [compare = (a, b) => a - b] compare function
 */
function quickselect(
  arr,
  k,
  left = 0,
  right = arr.length - 1,
  compare = defaultCompare
) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1
      const m = k - left + 1
      const z = Math.log(n)
      const s = 0.5 * Math.exp((2 * z) / 3)
      const sd =
        0.5 * Math.sqrt((z * s * (n - s)) / n) * (m - n / 2 < 0 ? -1 : 1)
      const newLeft = Math.max(left, Math.floor(k - (m * s) / n + sd))
      const newRight = Math.min(right, Math.floor(k + ((n - m) * s) / n + sd))
      quickselect(arr, k, newLeft, newRight, compare)
    }
    const t = arr[k]
    let i = left
    /** @type {number} */
    let j = right
    swap(arr, left, k)
    if (compare(arr[right], t) > 0) swap(arr, left, right)
    while (i < j) {
      swap(arr, i, j)
      i++
      j--
      while (compare(arr[i], t) < 0) i++
      while (compare(arr[j], t) > 0) j--
    }
    if (compare(arr[left], t) === 0) swap(arr, left, j)
    else {
      j++
      swap(arr, j, right)
    }
    if (j <= k) left = j + 1
    if (k <= j) right = j - 1
  }
}
/**
 * @template T
 * @param {T[]} arr
 * @param {number} i
 * @param {number} j
 */
function swap(arr, i, j) {
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}
/**
 * @template T
 * @param {T} a
 * @param {T} b
 * @returns {number}
 */
function defaultCompare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

class RBush {
  constructor(maxEntries = 9) {
    // max entries in a node is 9 by default; min node fill is 40% for best performance
    this._maxEntries = Math.max(4, maxEntries)
    this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4))
    this.clear()
  }
  all() {
    return this._all(this.data, [])
  }
  search(bbox) {
    let node = this.data
    const result = []
    if (!intersects(bbox, node)) return result
    const toBBox = this.toBBox
    const nodesToSearch = []
    while (node) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        const childBBox = node.leaf ? toBBox(child) : child
        if (intersects(bbox, childBBox)) {
          if (node.leaf) result.push(child)
          else if (contains(bbox, childBBox)) this._all(child, result)
          else nodesToSearch.push(child)
        }
      }
      node = nodesToSearch.pop()
    }
    return result
  }
  collides(bbox) {
    let node = this.data
    if (!intersects(bbox, node)) return false
    const nodesToSearch = []
    while (node) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        const childBBox = node.leaf ? this.toBBox(child) : child
        if (intersects(bbox, childBBox)) {
          if (node.leaf || contains(bbox, childBBox)) return true
          nodesToSearch.push(child)
        }
      }
      node = nodesToSearch.pop()
    }
    return false
  }
  load(data) {
    if (!(data && data.length)) return this
    if (data.length < this._minEntries) {
      for (let i = 0; i < data.length; i++) {
        this.insert(data[i])
      }
      return this
    }
    // recursively build the tree with the given data from scratch using OMT algorithm
    let node = this._build(data.slice(), 0, data.length - 1, 0)
    if (!this.data.children.length) {
      // save as is if tree is empty
      this.data = node
    } else if (this.data.height === node.height) {
      // split root if trees have the same height
      this._splitRoot(this.data, node)
    } else {
      if (this.data.height < node.height) {
        // swap trees if inserted one is bigger
        const tmpNode = this.data
        this.data = node
        node = tmpNode
      }
      // insert the small tree into the large tree at appropriate level
      this._insert(node, this.data.height - node.height - 1, true)
    }
    return this
  }
  insert(item) {
    if (item) this._insert(item, this.data.height - 1)
    return this
  }
  clear() {
    this.data = createNode([])
    return this
  }
  remove(item, equalsFn) {
    if (!item) return this
    let node = this.data
    const bbox = this.toBBox(item)
    const path = []
    const indexes = []
    let i, parent, goingUp
    // depth-first iterative tree traversal
    while (node || path.length) {
      if (!node) {
        // go up
        node = path.pop()
        parent = path[path.length - 1]
        i = indexes.pop()
        goingUp = true
      }
      if (node.leaf) {
        // check current node
        const index = findItem(item, node.children, equalsFn)
        if (index !== -1) {
          // item found, remove the item and condense tree upwards
          node.children.splice(index, 1)
          path.push(node)
          this._condense(path)
          return this
        }
      }
      if (!goingUp && !node.leaf && contains(node, bbox)) {
        // go down
        path.push(node)
        indexes.push(i)
        i = 0
        parent = node
        node = node.children[0]
      } else if (parent) {
        // go right
        i++
        node = parent.children[i]
        goingUp = false
      } else node = null // nothing found
    }
    return this
  }
  toBBox(item) {
    return item
  }
  compareMinX(a, b) {
    return a.minX - b.minX
  }
  compareMinY(a, b) {
    return a.minY - b.minY
  }
  toJSON() {
    return this.data
  }
  fromJSON(data) {
    this.data = data
    return this
  }
  _all(node, result) {
    const nodesToSearch = []
    while (node) {
      if (node.leaf) result.push(...node.children)
      else nodesToSearch.push(...node.children)
      node = nodesToSearch.pop()
    }
    return result
  }
  _build(items, left, right, height) {
    const N = right - left + 1
    let M = this._maxEntries
    let node
    if (N <= M) {
      // reached leaf level; return leaf
      node = createNode(items.slice(left, right + 1))
      calcBBox(node, this.toBBox)
      return node
    }
    if (!height) {
      // target height of the bulk-loaded tree
      height = Math.ceil(Math.log(N) / Math.log(M))
      // target number of root entries to maximize storage utilization
      M = Math.ceil(N / Math.pow(M, height - 1))
    }
    node = createNode([])
    node.leaf = false
    node.height = height
    // split the items into M mostly square tiles
    const N2 = Math.ceil(N / M)
    const N1 = N2 * Math.ceil(Math.sqrt(M))
    multiSelect(items, left, right, N1, this.compareMinX)
    for (let i = left; i <= right; i += N1) {
      const right2 = Math.min(i + N1 - 1, right)
      multiSelect(items, i, right2, N2, this.compareMinY)
      for (let j = i; j <= right2; j += N2) {
        const right3 = Math.min(j + N2 - 1, right2)
        // pack each entry recursively
        node.children.push(this._build(items, j, right3, height - 1))
      }
    }
    calcBBox(node, this.toBBox)
    return node
  }
  _chooseSubtree(bbox, node, level, path) {
    while (true) {
      path.push(node)
      if (node.leaf || path.length - 1 === level) break
      let minArea = Infinity
      let minEnlargement = Infinity
      let targetNode
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]
        const area = bboxArea(child)
        const enlargement = enlargedArea(bbox, child) - area
        // choose entry with the least area enlargement
        if (enlargement < minEnlargement) {
          minEnlargement = enlargement
          minArea = area < minArea ? area : minArea
          targetNode = child
        } else if (enlargement === minEnlargement) {
          // otherwise choose one with the smallest area
          if (area < minArea) {
            minArea = area
            targetNode = child
          }
        }
      }
      node = targetNode || node.children[0]
    }
    return node
  }
  _insert(item, level, isNode) {
    const bbox = isNode ? item : this.toBBox(item)
    const insertPath = []
    // find the best node for accommodating the item, saving all nodes along the path too
    const node = this._chooseSubtree(bbox, this.data, level, insertPath)
    // put the item into the node
    node.children.push(item)
    extend(node, bbox)
    // split on node overflow; propagate upwards if necessary
    while (level >= 0) {
      if (insertPath[level].children.length > this._maxEntries) {
        this._split(insertPath, level)
        level--
      } else break
    }
    // adjust bboxes along the insertion path
    this._adjustParentBBoxes(bbox, insertPath, level)
  }
  // split overflowed node into two
  _split(insertPath, level) {
    const node = insertPath[level]
    const M = node.children.length
    const m = this._minEntries
    this._chooseSplitAxis(node, m, M)
    const splitIndex = this._chooseSplitIndex(node, m, M)
    const newNode = createNode(
      node.children.splice(splitIndex, node.children.length - splitIndex)
    )
    newNode.height = node.height
    newNode.leaf = node.leaf
    calcBBox(node, this.toBBox)
    calcBBox(newNode, this.toBBox)
    if (level) insertPath[level - 1].children.push(newNode)
    else this._splitRoot(node, newNode)
  }
  _splitRoot(node, newNode) {
    // split root node
    this.data = createNode([node, newNode])
    this.data.height = node.height + 1
    this.data.leaf = false
    calcBBox(this.data, this.toBBox)
  }
  _chooseSplitIndex(node, m, M) {
    let index
    let minOverlap = Infinity
    let minArea = Infinity
    for (let i = m; i <= M - m; i++) {
      const bbox1 = distBBox(node, 0, i, this.toBBox)
      const bbox2 = distBBox(node, i, M, this.toBBox)
      const overlap = intersectionArea(bbox1, bbox2)
      const area = bboxArea(bbox1) + bboxArea(bbox2)
      // choose distribution with minimum overlap
      if (overlap < minOverlap) {
        minOverlap = overlap
        index = i
        minArea = area < minArea ? area : minArea
      } else if (overlap === minOverlap) {
        // otherwise choose distribution with minimum area
        if (area < minArea) {
          minArea = area
          index = i
        }
      }
    }
    return index || M - m
  }
  // sorts node children by the best axis for split
  _chooseSplitAxis(node, m, M) {
    const compareMinX = node.leaf ? this.compareMinX : compareNodeMinX
    const compareMinY = node.leaf ? this.compareMinY : compareNodeMinY
    const xMargin = this._allDistMargin(node, m, M, compareMinX)
    const yMargin = this._allDistMargin(node, m, M, compareMinY)
    // if total distributions margin value is minimal for x, sort by minX,
    // otherwise it's already sorted by minY
    if (xMargin < yMargin) node.children.sort(compareMinX)
  }
  // total margin of all possible split distributions where each node is at least m full
  _allDistMargin(node, m, M, compare) {
    node.children.sort(compare)
    const toBBox = this.toBBox
    const leftBBox = distBBox(node, 0, m, toBBox)
    const rightBBox = distBBox(node, M - m, M, toBBox)
    let margin = bboxMargin(leftBBox) + bboxMargin(rightBBox)
    for (let i = m; i < M - m; i++) {
      const child = node.children[i]
      extend(leftBBox, node.leaf ? toBBox(child) : child)
      margin += bboxMargin(leftBBox)
    }
    for (let i = M - m - 1; i >= m; i--) {
      const child = node.children[i]
      extend(rightBBox, node.leaf ? toBBox(child) : child)
      margin += bboxMargin(rightBBox)
    }
    return margin
  }
  _adjustParentBBoxes(bbox, path, level) {
    // adjust bboxes along the given tree path
    for (let i = level; i >= 0; i--) {
      extend(path[i], bbox)
    }
  }
  _condense(path) {
    // go through the path, removing empty nodes and updating bboxes
    for (let i = path.length - 1, siblings; i >= 0; i--) {
      if (path[i].children.length === 0) {
        if (i > 0) {
          siblings = path[i - 1].children
          siblings.splice(siblings.indexOf(path[i]), 1)
        } else this.clear()
      } else calcBBox(path[i], this.toBBox)
    }
  }
}
function findItem(item, items, equalsFn) {
  if (!equalsFn) return items.indexOf(item)
  for (let i = 0; i < items.length; i++) {
    if (equalsFn(item, items[i])) return i
  }
  return -1
}
// calculate node's bbox from bboxes of its children
function calcBBox(node, toBBox) {
  distBBox(node, 0, node.children.length, toBBox, node)
}
// min bounding rectangle of node children from k to p-1
function distBBox(node, k, p, toBBox, destNode) {
  if (!destNode) destNode = createNode(null)
  destNode.minX = Infinity
  destNode.minY = Infinity
  destNode.maxX = -Infinity
  destNode.maxY = -Infinity
  for (let i = k; i < p; i++) {
    const child = node.children[i]
    extend(destNode, node.leaf ? toBBox(child) : child)
  }
  return destNode
}
function extend(a, b) {
  a.minX = Math.min(a.minX, b.minX)
  a.minY = Math.min(a.minY, b.minY)
  a.maxX = Math.max(a.maxX, b.maxX)
  a.maxY = Math.max(a.maxY, b.maxY)
  return a
}
function compareNodeMinX(a, b) {
  return a.minX - b.minX
}
function compareNodeMinY(a, b) {
  return a.minY - b.minY
}
function bboxArea(a) {
  return (a.maxX - a.minX) * (a.maxY - a.minY)
}
function bboxMargin(a) {
  return a.maxX - a.minX + (a.maxY - a.minY)
}
function enlargedArea(a, b) {
  return (
    (Math.max(b.maxX, a.maxX) - Math.min(b.minX, a.minX)) *
    (Math.max(b.maxY, a.maxY) - Math.min(b.minY, a.minY))
  )
}
function intersectionArea(a, b) {
  const minX = Math.max(a.minX, b.minX)
  const minY = Math.max(a.minY, b.minY)
  const maxX = Math.min(a.maxX, b.maxX)
  const maxY = Math.min(a.maxY, b.maxY)
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY)
}
function contains(a, b) {
  return (
    a.minX <= b.minX && a.minY <= b.minY && b.maxX <= a.maxX && b.maxY <= a.maxY
  )
}
function intersects(a, b) {
  return (
    b.minX <= a.maxX && b.minY <= a.maxY && b.maxX >= a.minX && b.maxY >= a.minY
  )
}
function createNode(children) {
  return {
    children,
    height: 1,
    leaf: true,
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity
  }
}
// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach
function multiSelect(arr, left, right, n, compare) {
  const stack = [left, right]
  while (stack.length) {
    right = stack.pop()
    left = stack.pop()
    if (right - left <= n) continue
    const mid = left + Math.ceil((right - left) / n / 2) * n
    quickselect(arr, mid, left, right, compare)
    stack.push(left, mid, mid, right)
  }
}

/**
 * Checks if two line segments intersects.
 * @param p1 The start vertex of the first line segment.
 * @param p2 The end vertex of the first line segment.
 * @param q1 The start vertex of the second line segment.
 * @param q2 The end vertex of the second line segment.
 * @return True if the two line segments intersect
 */
function lineSegmentsIntersect(p1, p2, q1, q2) {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  const da = q2[0] - q1[0]
  const db = q2[1] - q1[1]

  // segments are parallel
  if (da * dy - db * dx === 0) {
    return false
  }
  const s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx)
  const t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy)
  return s >= 0 && s <= 1 && t >= 0 && t <= 1
}

/**
 * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
 * @param a point 1
 * @param b point 2
 * @param c point 3
 * @return the area of a triangle spanned by the three given points
 */
function triangleArea(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])
}
function isLeft(a, b, c) {
  return triangleArea(a, b, c) > 0
}
function isLeftOn(a, b, c) {
  return triangleArea(a, b, c) >= 0
}
function isRight(a, b, c) {
  return triangleArea(a, b, c) < 0
}
function isRightOn(a, b, c) {
  return triangleArea(a, b, c) <= 0
}
function sqdist(a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  return dx * dx + dy * dy
}

/**
 * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
 * @param i vertex position
 * @return vertex at position i
 */
function polygonAt(polygon, i) {
  const s = polygon.length
  return polygon[i < 0 ? (i % s) + s : i % s]
}

/**
 * Append points "from" to "to" -1 from an other polygon "poly" onto this one.
 * @param polygon the polygon to append to
 * @param poly The polygon to get points from.
 * @param from The vertex index in "poly".
 * @param to The end vertex index in "poly". Note that this vertex is NOT included when appending.
 */
function polygonAppend(polygon, poly, from, to) {
  for (let i = from; i < to; i++) {
    polygon.push(poly[i])
  }
}

/**
 * Check if a point in the polygon is a reflex point
 * @param i the point in the polygon to check
 * @return whether the given point in the polygon is a reflex point
 */
function polygonIsReflex(polygon, i) {
  return isRight(
    polygonAt(polygon, i - 1),
    polygonAt(polygon, i),
    polygonAt(polygon, i + 1)
  )
}

/**
 * Check if two vertices in the polygon can see each other
 * @param a vertex index 1
 * @param b vertex index 2
 * @return if two vertices in the polygon can see each other
 */
function polygonCanSee2(polygon, a, b) {
  // for each edge
  for (let i = 0; i !== polygon.length; ++i) {
    // ignore incident edges
    if (
      i === a ||
      i === b ||
      (i + 1) % polygon.length === a ||
      (i + 1) % polygon.length === b
    ) {
      continue
    }
    if (
      lineSegmentsIntersect(
        polygonAt(polygon, a),
        polygonAt(polygon, b),
        polygonAt(polygon, i),
        polygonAt(polygon, i + 1)
      )
    ) {
      return false
    }
  }
  return true
}

/**
 * Checks that the line segments of this polygon do not intersect each other.
 * @param polygon An array of vertices e.g. [[0,0],[0,1],...]
 * @return whether line segments of this polygon do not intersect each other.
 * @todo Should it check all segments with all others?
 */
function isSimple(polygon) {
  const path = polygon
  let i

  // Check
  for (i = 0; i < path.length - 1; i++) {
    for (let j = 0; j < i - 1; j++) {
      if (lineSegmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
        return false
      }
    }
  }

  // Check the segment between the last and the first point to all others
  for (i = 1; i < path.length - 2; i++) {
    if (
      lineSegmentsIntersect(
        path[0],
        path[path.length - 1],
        path[i],
        path[i + 1]
      )
    ) {
      return false
    }
  }
  return true
}
function getIntersectionPoint(p1, p2, q1, q2, delta) {
  if (delta === void 0) {
    delta = 0
  }
  const a1 = p2[1] - p1[1]
  const b1 = p1[0] - p2[0]
  const c1 = a1 * p1[0] + b1 * p1[1]
  const a2 = q2[1] - q1[1]
  const b2 = q1[0] - q2[0]
  const c2 = a2 * q1[0] + b2 * q1[1]
  const det = a1 * b2 - a2 * b1
  if (!scalarsEqual(det, 0, delta)) {
    return [(b2 * c1 - b1 * c2) / det, (a1 * c2 - a2 * c1) / det]
  } else {
    return [0, 0]
  }
}

/**
 * Quickly decompose the Polygon into convex sub-polygons.
 * @param polygon the polygon to decompose
 * @param result
 * @param reflexVertices
 * @param steinerPoints
 * @param delta
 * @param maxlevel
 * @param level
 * @return the decomposed sub-polygons
 */
function quickDecomp(
  polygon,
  result,
  reflexVertices,
  steinerPoints,
  delta,
  maxlevel,
  level
) {
  if (result === void 0) {
    result = []
  }
  if (reflexVertices === void 0) {
    reflexVertices = []
  }
  if (steinerPoints === void 0) {
    steinerPoints = []
  }
  if (delta === void 0) {
    delta = 25
  }
  if (maxlevel === void 0) {
    maxlevel = 100
  }
  if (level === void 0) {
    level = 0
  }
  // Points
  let upperInt = [0, 0]
  let lowerInt = [0, 0]
  let p = [0, 0]

  // scalars
  let upperDist = 0
  let lowerDist = 0
  let d = 0
  let closestDist = 0

  // Integers
  let upperIndex = 0
  let lowerIndex = 0
  let closestIndex = 0

  // polygons
  const lowerPoly = []
  const upperPoly = []
  const poly = polygon
  const v = polygon
  if (v.length < 3) {
    return result
  }
  level++
  if (level > maxlevel) {
    console.warn('quickDecomp: max level (' + maxlevel + ') reached.')
    return result
  }
  for (let i = 0; i < polygon.length; ++i) {
    if (polygonIsReflex(poly, i)) {
      reflexVertices.push(poly[i])
      upperDist = lowerDist = Number.MAX_VALUE
      for (let j = 0; j < polygon.length; ++j) {
        if (
          isLeft(
            polygonAt(poly, i - 1),
            polygonAt(poly, i),
            polygonAt(poly, j)
          ) &&
          isRightOn(
            polygonAt(poly, i - 1),
            polygonAt(poly, i),
            polygonAt(poly, j - 1)
          )
        ) {
          // if line intersects with an edge
          p = getIntersectionPoint(
            polygonAt(poly, i - 1),
            polygonAt(poly, i),
            polygonAt(poly, j),
            polygonAt(poly, j - 1)
          ) // find the point of intersection
          if (isRight(polygonAt(poly, i + 1), polygonAt(poly, i), p)) {
            // make sure it's inside the poly
            d = sqdist(poly[i], p)
            if (d < lowerDist) {
              // keep only the closest intersection
              lowerDist = d
              lowerInt = p
              lowerIndex = j
            }
          }
        }
        if (
          isLeft(
            polygonAt(poly, i + 1),
            polygonAt(poly, i),
            polygonAt(poly, j + 1)
          ) &&
          isRightOn(
            polygonAt(poly, i + 1),
            polygonAt(poly, i),
            polygonAt(poly, j)
          )
        ) {
          p = getIntersectionPoint(
            polygonAt(poly, i + 1),
            polygonAt(poly, i),
            polygonAt(poly, j),
            polygonAt(poly, j + 1)
          )
          if (isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), p)) {
            d = sqdist(poly[i], p)
            if (d < upperDist) {
              upperDist = d
              upperInt = p
              upperIndex = j
            }
          }
        }
      }

      // if there are no vertices to connect to, choose a point in the middle
      if (lowerIndex === (upperIndex + 1) % polygon.length) {
        p[0] = (lowerInt[0] + upperInt[0]) / 2
        p[1] = (lowerInt[1] + upperInt[1]) / 2
        steinerPoints.push(p)
        if (i < upperIndex) {
          polygonAppend(lowerPoly, poly, i, upperIndex + 1)
          lowerPoly.push(p)
          upperPoly.push(p)
          if (lowerIndex !== 0) {
            polygonAppend(upperPoly, poly, lowerIndex, poly.length)
          }
          polygonAppend(upperPoly, poly, 0, i + 1)
        } else {
          if (i !== 0) {
            polygonAppend(lowerPoly, poly, i, poly.length)
          }
          polygonAppend(lowerPoly, poly, 0, upperIndex + 1)
          lowerPoly.push(p)
          upperPoly.push(p)
          polygonAppend(upperPoly, poly, lowerIndex, i + 1)
        }
      } else {
        // connect to the closest point within the triangle
        if (lowerIndex > upperIndex) {
          upperIndex += polygon.length
        }
        closestDist = Number.MAX_VALUE
        if (upperIndex < lowerIndex) {
          return result
        }
        for (let j = lowerIndex; j <= upperIndex; ++j) {
          if (
            isLeftOn(
              polygonAt(poly, i - 1),
              polygonAt(poly, i),
              polygonAt(poly, j)
            ) &&
            isRightOn(
              polygonAt(poly, i + 1),
              polygonAt(poly, i),
              polygonAt(poly, j)
            )
          ) {
            d = sqdist(polygonAt(poly, i), polygonAt(poly, j))
            if (d < closestDist && polygonCanSee2(poly, i, j)) {
              closestDist = d
              closestIndex = j % polygon.length
            }
          }
        }
        if (i < closestIndex) {
          polygonAppend(lowerPoly, poly, i, closestIndex + 1)
          if (closestIndex !== 0) {
            polygonAppend(upperPoly, poly, closestIndex, v.length)
          }
          polygonAppend(upperPoly, poly, 0, i + 1)
        } else {
          if (i !== 0) {
            polygonAppend(lowerPoly, poly, i, v.length)
          }
          polygonAppend(lowerPoly, poly, 0, closestIndex + 1)
          polygonAppend(upperPoly, poly, closestIndex, i + 1)
        }
      }

      // solve smallest poly first
      if (lowerPoly.length < upperPoly.length) {
        quickDecomp(
          lowerPoly,
          result,
          reflexVertices,
          steinerPoints,
          delta,
          maxlevel,
          level
        )
        quickDecomp(
          upperPoly,
          result,
          reflexVertices,
          steinerPoints,
          delta,
          maxlevel,
          level
        )
      } else {
        quickDecomp(
          upperPoly,
          result,
          reflexVertices,
          steinerPoints,
          delta,
          maxlevel,
          level
        )
        quickDecomp(
          lowerPoly,
          result,
          reflexVertices,
          steinerPoints,
          delta,
          maxlevel,
          level
        )
      }
      return result
    }
  }
  result.push(polygon)
  return result
}

/**
 * Check if two scalars are equal
 * @param a scalar a
 * @param b scalar b
 * @param precision the precision for the equality check
 * @return whether the two scalars are equal with the given precision
 */
function scalarsEqual(a, b, precision) {
  if (precision === void 0) {
    precision = 0
  }
  precision = precision || 0
  return Math.abs(a - b) <= precision
}

/**
 * types
 */
var BodyType
;(function (BodyType) {
  BodyType['Ellipse'] = 'Ellipse'
  BodyType['Circle'] = 'Circle'
  BodyType['Polygon'] = 'Polygon'
  BodyType['Box'] = 'Box'
  BodyType['Line'] = 'Line'
  BodyType['Point'] = 'Point'
})(BodyType || (BodyType = {}))
/**
 * for groups
 */
var BodyGroup
;(function (BodyGroup) {
  BodyGroup[(BodyGroup['Ellipse'] = 32)] = 'Ellipse'
  BodyGroup[(BodyGroup['Circle'] = 16)] = 'Circle'
  BodyGroup[(BodyGroup['Polygon'] = 8)] = 'Polygon'
  BodyGroup[(BodyGroup['Box'] = 4)] = 'Box'
  BodyGroup[(BodyGroup['Line'] = 2)] = 'Line'
  BodyGroup[(BodyGroup['Point'] = 1)] = 'Point'
})(BodyGroup || (BodyGroup = {}))

/* tslint:disable:one-variable-per-declaration */
/**
 * 40-90% faster than built-in Array.forEach function.
 *
 * basic benchmark: https://jsbench.me/urle772xdn
 */
const forEach = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    callback(array[index], index)
  }
}
/**
 * 20-90% faster than built-in Array.some function.
 *
 * basic benchmark: https://jsbench.me/l0le7bnnsq
 */
const some = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    if (callback(array[index], index)) {
      return true
    }
  }
  return false
}
/**
 * 20-40% faster than built-in Array.every function.
 *
 * basic benchmark: https://jsbench.me/unle7da29v
 */
const every = (array, callback) => {
  for (let index = 0, len = array.length; index < len; index++) {
    if (!callback(array[index], index)) {
      return false
    }
  }
  return true
}
/**
 * 20-60% faster than built-in Array.filter function.
 *
 * basic benchmark: https://jsbench.me/o1le77ev4l
 */
const filter = (array, callback) => {
  const output = []
  for (let index = 0, len = array.length; index < len; index++) {
    const item = array[index]
    if (callback(item, index)) {
      output.push(item)
    }
  }
  return output
}
/**
 * 20-70% faster than built-in Array.map
 *
 * basic benchmark: https://jsbench.me/oyle77vbpc
 */
const map = (array, callback) => {
  const len = array.length
  const output = new Array(len)
  for (let index = 0; index < len; index++) {
    output[index] = callback(array[index], index)
  }
  return output
}

/* tslint:disable:trailing-whitespace */
/* tslint:disable:cyclomatic-complexity */
/**
 * Converts calcPoints into simple x/y Vectors and adds polygon pos to them
 *
 * @param {BasePolygon} polygon
 * @returns {Vector[]}
 */
function getWorldPoints({ calcPoints, pos }) {
  return map(calcPoints, ({ x, y }) => ({
    x: x + pos.x,
    y: y + pos.y
  }))
}
/**
 * replace body with array of related convex polygons
 */
function ensureConvex(body) {
  if (body.isConvex || body.typeGroup !== BodyGroup.Polygon) {
    return [body]
  }
  return body.convexPolygons
}
/**
 * @param polygon
 * @param circle
 */
function polygonInCircle(polygon, circle) {
  const points = getWorldPoints(polygon)
  return every(points, (point) => {
    return SATExports.pointInCircle(point, circle)
  })
}
function pointInPolygon(point, polygon) {
  return some(ensureConvex(polygon), (convex) =>
    SATExports.pointInPolygon(point, convex)
  )
}
function polygonInPolygon(polygonA, polygonB) {
  const points = getWorldPoints(polygonA)
  return every(points, (point) => pointInPolygon(point, polygonB))
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param point
 * @param circle
 */
function pointOnCircle(point, circle) {
  return (
    (point.x - circle.pos.x) * (point.x - circle.pos.x) +
      (point.y - circle.pos.y) * (point.y - circle.pos.y) ===
    circle.r * circle.r
  )
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle1
 * @param circle2
 */
function circleInCircle(circle1, circle2) {
  const x1 = circle1.pos.x
  const y1 = circle1.pos.y
  const x2 = circle2.pos.x
  const y2 = circle2.pos.y
  const r1 = circle1.r
  const r2 = circle2.r
  const distSq = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  return distSq + r2 === r1 || distSq + r2 < r1
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle
 * @param polygon
 */
function circleInPolygon(circle, polygon) {
  // Circle with radius 0 isn't a circle
  if (circle.r === 0) {
    return false
  }
  // If the center of the circle is not within the polygon,
  // then the circle may overlap, but it'll never be "contained"
  // so return false
  if (!pointInPolygon(circle.pos, polygon)) {
    return false
  }
  // Necessary add polygon pos to points
  const points = getWorldPoints(polygon)
  // If the center of the circle is within the polygon,
  // the circle is not outside of the polygon completely.
  // so return false.
  if (some(points, (point) => SATExports.pointInCircle(point, circle))) {
    return false
  }
  // If any line-segment of the polygon intersects the circle,
  // the circle is not "contained"
  // so return false
  if (
    some(points, (end, index) => {
      const start = index ? points[index - 1] : points[points.length - 1]
      return intersectLineCircle({ start, end }, circle).length > 0
    })
  ) {
    return false
  }
  return true
}
/**
 * https://stackoverflow.com/a/68197894/1749528
 *
 * @param circle
 * @param polygon
 */
function circleOutsidePolygon(circle, polygon) {
  // Circle with radius 0 isn't a circle
  if (circle.r === 0) {
    return false
  }
  // If the center of the circle is within the polygon,
  // the circle is not outside of the polygon completely.
  // so return false.
  if (pointInPolygon(circle.pos, polygon)) {
    return false
  }
  // Necessary add polygon pos to points
  const points = getWorldPoints(polygon)
  // If the center of the circle is within the polygon,
  // the circle is not outside of the polygon completely.
  // so return false.
  if (
    some(
      points,
      (point) =>
        SATExports.pointInCircle(point, circle) || pointOnCircle(point, circle)
    )
  ) {
    return false
  }
  // If any line-segment of the polygon intersects the circle,
  // the circle is not "contained"
  // so return false
  if (
    some(points, (end, index) => {
      const start = index ? points[index - 1] : points[points.length - 1]
      return intersectLineCircle({ start, end }, circle).length > 0
    })
  ) {
    return false
  }
  return true
}
/**
 * https://stackoverflow.com/a/37225895/1749528
 *
 * @param line
 * @param circle
 */
function intersectLineCircle(line, { pos, r }) {
  const v1 = { x: line.end.x - line.start.x, y: line.end.y - line.start.y }
  const v2 = { x: line.start.x - pos.x, y: line.start.y - pos.y }
  const b = (v1.x * v2.x + v1.y * v2.y) * -2
  const c = (v1.x * v1.x + v1.y * v1.y) * 2
  const d = Math.sqrt(b * b - (v2.x * v2.x + v2.y * v2.y - r * r) * c * 2)
  if (isNaN(d)) {
    // no intercept
    return []
  }
  const u1 = (b - d) / c // these represent the unit distance of point one and two on the line
  const u2 = (b + d) / c
  const results = [] // return array
  if (u1 <= 1 && u1 >= 0) {
    // add point if on the line segment
    results.push({ x: line.start.x + v1.x * u1, y: line.start.y + v1.y * u1 })
  }
  if (u2 <= 1 && u2 >= 0) {
    // second add point if on the line segment
    results.push({ x: line.start.x + v1.x * u2, y: line.start.y + v1.y * u2 })
  }
  return results
}
/**
 * helper for intersectLineLineFast
 */
function isTurn(point1, point2, point3) {
  const A = (point3.x - point1.x) * (point2.y - point1.y)
  const B = (point2.x - point1.x) * (point3.y - point1.y)
  return A > B + Number.EPSILON ? 1 : A + Number.EPSILON < B ? -1 : 0
}
/**
 * faster implementation of intersectLineLine
 * https://stackoverflow.com/a/16725715/1749528
 *
 * @param line1
 * @param line2
 */
function intersectLineLineFast(line1, line2) {
  return (
    isTurn(line1.start, line2.start, line2.end) !==
      isTurn(line1.end, line2.start, line2.end) &&
    isTurn(line1.start, line1.end, line2.start) !==
      isTurn(line1.start, line1.end, line2.end)
  )
}
/**
 * returns the point of intersection
 * https://stackoverflow.com/a/24392281/1749528
 *
 * @param line1
 * @param line2
 */
function intersectLineLine(line1, line2) {
  const dX = line1.end.x - line1.start.x
  const dY = line1.end.y - line1.start.y
  const determinant =
    dX * (line2.end.y - line2.start.y) - (line2.end.x - line2.start.x) * dY
  if (Math.abs(determinant) < Number.EPSILON) {
    return
  }
  const lambda =
    ((line2.end.y - line2.start.y) * (line2.end.x - line1.start.x) +
      (line2.start.x - line2.end.x) * (line2.end.y - line1.start.y)) /
    determinant
  const gamma =
    ((line1.start.y - line1.end.y) * (line2.end.x - line1.start.x) +
      dX * (line2.end.y - line1.start.y)) /
    determinant
  // stricter check – no eps fudge, only inside [0,1]
  if (lambda < 0 || lambda > 1 || gamma < 0 || gamma > 1) {
    return
  }
  return { x: line1.start.x + lambda * dX, y: line1.start.y + lambda * dY }
}
/**
 * Computes all intersection points between two polygons.
 *
 * Iterates over each edge of `polygonA` and checks against `polygonB`
 * using {@link intersectLinePolygon}.
 * Removes duplicates.
 * Also detects corner–corner touches.
 *
 * @param {BasePolygon} polygonA - First polygon
 * @param {BasePolygon} polygonB - Second polygon
 * @returns {Vector[]} Array of intersection points (empty if none found)
 */
function intersectPolygonPolygon(polygonA, polygonB) {
  const pointsA = getWorldPoints(polygonA)
  const pointsB = getWorldPoints(polygonB)
  const results = []
  forEach(pointsA, (start, index) => {
    const end = pointsA[(index + 1) % pointsA.length]
    forEach(
      intersectLinePolygon(
        { start, end },
        { pos: { x: 0, y: 0 }, calcPoints: pointsB }
      ),
      ({ x, y }) => {
        // add unique
        if (!results.find((point) => x === point.x && y === point.y)) {
          results.push({ x, y })
        }
      }
    )
  })
  return results
}
/**
 * Computes all intersection points between a line segment and a polygon.
 *
 * @param {BaseLine} line - The line segment
 * @param {BasePolygon} polygon - A polygon object or array of global points
 * @returns {Vector[]} Array of intersection points (empty if none)
 */
function intersectLinePolygon(line, { calcPoints, pos }) {
  const results = []
  forEach(calcPoints, (to, index) => {
    const from = index
      ? calcPoints[index - 1]
      : calcPoints[calcPoints.length - 1]
    const side = {
      start: { x: from.x + pos.x, y: from.y + pos.y },
      end: { x: to.x + pos.x, y: to.y + pos.y }
    }
    const hit = intersectLineLine(line, side)
    if (hit) {
      results.push(hit)
    }
  })
  return results
}
/**
 * @param circle1
 * @param circle2
 */
function intersectCircleCircle(circle1, circle2) {
  const results = []
  const x1 = circle1.pos.x
  const y1 = circle1.pos.y
  const r1 = circle1.r
  const x2 = circle2.pos.x
  const y2 = circle2.pos.y
  const r2 = circle2.r
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > r1 + r2 || dist < Math.abs(r1 - r2) || dist === 0) {
    return results
  }
  const a = (r1 * r1 - r2 * r2 + dist * dist) / (2 * dist)
  const h = Math.sqrt(r1 * r1 - a * a)
  const px = x1 + (dx * a) / dist
  const py = y1 + (dy * a) / dist
  const intersection1 = {
    x: px + (h * dy) / dist,
    y: py - (h * dx) / dist
  }
  results.push(intersection1)
  const intersection2 = {
    x: px - (h * dy) / dist,
    y: py + (h * dx) / dist
  }
  results.push(intersection2)
  return results
}

/* tslint:disable:cyclomatic-complexity */
/* helpers for faster getSATTest() and checkAInB() */
const testMap = {
  satCircleCircle: SATExports.testCircleCircle,
  satCirclePolygon: SATExports.testCirclePolygon,
  satPolygonCircle: SATExports.testPolygonCircle,
  satPolygonPolygon: SATExports.testPolygonPolygon,
  inCircleCircle: circleInCircle,
  inCirclePolygon: circleInPolygon,
  inPolygonCircle: polygonInCircle,
  inPolygonPolygon: polygonInPolygon
}
function createArray(bodyType, testType) {
  const arrayResult = []
  const bodyGroups = Object.values(BodyGroup).filter(
    (value) => typeof value === 'number'
  )
  forEach(bodyGroups, (bodyGroup) => {
    arrayResult[bodyGroup] =
      bodyGroup === BodyGroup.Circle
        ? testMap[`${testType}${bodyType}Circle`]
        : testMap[`${testType}${bodyType}Polygon`]
  })
  return arrayResult
}
const circleSATFunctions = createArray(BodyType.Circle, 'sat')
const circleInFunctions = createArray(BodyType.Circle, 'in')
const polygonSATFunctions = createArray(BodyType.Polygon, 'sat')
const polygonInFunctions = createArray(BodyType.Polygon, 'in')
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI
const EPSILON = 1e-9
/**
 * convert from degrees to radians
 */
function deg2rad(degrees) {
  return degrees * DEG2RAD
}
/**
 * convert from radians to degrees
 */
function rad2deg(radians) {
  return radians * RAD2DEG
}
/**
 * Compares two numbers for approximate equality within a given tolerance.
 *
 * Useful for floating-point calculations where exact equality (`===`)
 * is unreliable due to rounding errors.
 *
 * @param {number} a - First number to compare
 * @param {number} b - Second number to compare
 * @param {number} [eps=EPSILON] - Allowed tolerance (default: global EPSILON)
 * @returns {boolean} `true` if numbers differ by less than `eps`
 */
function almostEqual(a, b, eps = EPSILON) {
  return Math.abs(a - b) < eps
}
/**
 * Compares two vectors for approximate equality within a tolerance.
 *
 * Uses {@link almostEqual} on both `x` and `y` coordinates.
 * Two points are considered equal if both coordinates are
 * within the allowed tolerance.
 *
 * @param {Vector} a - First vector
 * @param {Vector} b - Second vector
 * @returns {boolean} `true` if both vectors are approximately equal
 */
function pointsEqual(a, b) {
  return almostEqual(a.x, b.x) && almostEqual(a.y, b.y)
}
/**
 * creates ellipse-shaped polygon based on params
 */
function createEllipse(radiusX, radiusY = radiusX, step = 1) {
  const steps = Math.PI * Math.hypot(radiusX, radiusY) * 2
  const length = Math.max(8, Math.ceil(steps / Math.max(1, step)))
  const ellipse = []
  for (let index = 0; index < length; index++) {
    const value = (index / length) * 2 * Math.PI
    const x = Math.cos(value) * radiusX
    const y = Math.sin(value) * radiusY
    ellipse.push(new SATExports.Vector(x, y))
  }
  return ellipse
}
/**
 * creates box shaped polygon points
 */
function createBox(width, height) {
  return [
    new SATExports.Vector(0, 0),
    new SATExports.Vector(width, 0),
    new SATExports.Vector(width, height),
    new SATExports.Vector(0, height)
  ]
}
/**
 * ensure SATVector type point result
 */
function ensureVectorPoint(point = {}) {
  return point instanceof SATExports.Vector
    ? point
    : new SATExports.Vector(point.x || 0, point.y || 0)
}
/**
 * ensure Vector points (for polygon) in counter-clockwise order
 */
function ensurePolygonPoints(points = []) {
  const polygonPoints = map(points, ensureVectorPoint)
  return clockwise(polygonPoints) ? polygonPoints.reverse() : polygonPoints
}
/**
 * get distance between two Vector points
 */
function distance(bodyA, bodyB) {
  const xDiff = bodyA.x - bodyB.x
  const yDiff = bodyA.y - bodyB.y
  return Math.hypot(xDiff, yDiff)
}
/**
 * check [is clockwise] direction of polygon
 */
function clockwise(points) {
  const length = points.length
  let sum = 0
  forEach(points, (v1, index) => {
    const v2 = points[(index + 1) % length]
    sum += (v2.x - v1.x) * (v2.y + v1.y)
  })
  return sum > 0
}
/**
 * used for all types of bodies in constructor
 */
function extendBody(body, options = {}) {
  body.isStatic = !!options.isStatic
  body.isTrigger = !!options.isTrigger
  body.padding = options.padding || 0
  // Default value should be reflected in documentation of `BodyOptions.group`
  body.group = options.group ?? 0x7fffffff
  if ('userData' in options) {
    body.userData = options.userData
  }
  if (options.isCentered && body.typeGroup !== BodyGroup.Circle) {
    body.isCentered = true
  }
  if (options.angle) {
    body.setAngle(options.angle)
  }
}
/**
 * check if body moved outside of its padding
 */
function bodyMoved(body) {
  const { bbox, minX, minY, maxX, maxY } = body
  return (
    bbox.minX < minX || bbox.minY < minY || bbox.maxX > maxX || bbox.maxY > maxY
  )
}
/**
 * returns true if two boxes not intersect
 */
function notIntersectAABB(bodyA, bodyB) {
  return (
    bodyB.minX > bodyA.maxX ||
    bodyB.minY > bodyA.maxY ||
    bodyB.maxX < bodyA.minX ||
    bodyB.maxY < bodyA.minY
  )
}
/**
 * checks if two boxes intersect
 */
function intersectAABB(bodyA, bodyB) {
  return !notIntersectAABB(bodyA, bodyB)
}
/**
 * checks if two bodies can interact (for collision filtering)
 *
 * Based on {@link https://box2d.org/documentation/md_simulation.html#filtering Box2D}
 * ({@link https://aurelienribon.wordpress.com/2011/07/01/box2d-tutorial-collision-filtering/ tutorial})
 *
 * @param bodyA
 * @param bodyB
 *
 * @example
 * const body1 = { group: 0b00000000_00000000_00000001_00000000 }
 * const body2 = { group: 0b11111111_11111111_00000011_00000000 }
 * const body3 = { group: 0b00000010_00000000_00000100_00000000 }
 *
 * // Body 1 has the first custom group but cannot interact with any other groups
 * // except itself because the first 16 bits are all zeros, only bodies with an
 * // identical value can interact with it.
 * canInteract(body1, body1) // returns true (identical groups can always interact)
 * canInteract(body1, body2) // returns false
 * canInteract(body1, body3) // returns false
 *
 * // Body 2 has the first and second group and can interact with all other
 * // groups, but only if that body also can interact with is custom group.
 * canInteract(body2, body1) // returns false (body1 cannot interact with others)
 * canInteract(body2, body2) // returns true (identical groups can always interact)
 * canInteract(body2, body3) // returns true
 *
 * // Body 3 has the third group but can interact with the second group.
 * // This means that Body 2 and Body 3 can interact with each other but no other
 * // body can interact with Body 1 because it doesn't allow interactions with
 * // any other custom group.
 * canInteract(body3, body1) // returns false (body1 cannot interact with others)
 * canInteract(body3, body2) // returns true
 * canInteract(body3, body3) // returns true (identical groups can always interact)
 */
function canInteract({ group: groupA }, { group: groupB }) {
  const categoryA = groupA >> 16
  const categoryB = groupB >> 16
  const maskA = groupA & 0xffff
  const maskB = groupB & 0xffff
  return (categoryA & maskB) !== 0 && (categoryB & maskA) !== 0 // Box2D rules
}
/**
 * checks if body a is in body b
 */
function checkAInB(bodyA, bodyB) {
  const check =
    bodyA.typeGroup === BodyGroup.Circle
      ? circleInFunctions
      : polygonInFunctions
  return check[bodyB.typeGroup](bodyA, bodyB)
}
/**
 * clone sat vector points array into vector points array
 */
function clonePointsArray(points) {
  return map(points, ({ x, y }) => ({ x, y }))
}
/**
 * change format from SAT.js to poly-decomp
 *
 * @param position
 */
function mapVectorToArray({ x, y } = { x: 0, y: 0 }) {
  return [x, y]
}
/**
 * change format from poly-decomp to SAT.js
 *
 * @param positionAsArray
 */
function mapArrayToVector([x, y] = [0, 0]) {
  return { x, y }
}
/**
 * given 2 bodies calculate vector of bounce assuming equal mass and they are circles
 */
function getBounceDirection(body, collider) {
  const v2 = new SATExports.Vector(collider.x - body.x, collider.y - body.y)
  const v1 = new SATExports.Vector(body.x - collider.x, body.y - collider.y)
  const len = v1.dot(v2.normalize()) * 2
  return new SATExports.Vector(v2.x * len - v1.x, v2.y * len - v1.y).normalize()
}
/**
 * returns correct sat.js testing function based on body types
 */
function getSATTest(bodyA, bodyB) {
  const check =
    bodyA.typeGroup === BodyGroup.Circle
      ? circleSATFunctions
      : polygonSATFunctions
  return check[bodyB.typeGroup]
}
/**
 * draws dashed line on canvas context
 */
function dashLineTo(context, fromX, fromY, toX, toY, dash = 2, gap = 4) {
  const xDiff = toX - fromX
  const yDiff = toY - fromY
  const arc = Math.atan2(yDiff, xDiff)
  const offsetX = Math.cos(arc)
  const offsetY = Math.sin(arc)
  let posX = fromX
  let posY = fromY
  let dist = Math.hypot(xDiff, yDiff)
  while (dist > 0) {
    const step = Math.min(dist, dash)
    context.moveTo(posX, posY)
    context.lineTo(posX + offsetX * step, posY + offsetY * step)
    posX += offsetX * (dash + gap)
    posY += offsetY * (dash + gap)
    dist -= dash + gap
  }
}
/**
 * draw polygon
 *
 * @param context
 * @param polygon
 * @param isTrigger
 */
function drawPolygon(context, { pos, calcPoints }, isTrigger = false) {
  const lastPoint = calcPoints[calcPoints.length - 1]
  const fromX = pos.x + lastPoint.x
  const fromY = pos.y + lastPoint.y
  if (calcPoints.length === 1) {
    context.arc(fromX, fromY, 1, 0, Math.PI * 2)
  } else {
    context.moveTo(fromX, fromY)
  }
  forEach(calcPoints, (point, index) => {
    const toX = pos.x + point.x
    const toY = pos.y + point.y
    if (isTrigger) {
      const prev = calcPoints[index - 1] || lastPoint
      dashLineTo(context, pos.x + prev.x, pos.y + prev.y, toX, toY)
    } else {
      context.lineTo(toX, toY)
    }
  })
}
/**
 * draw body bounding body box
 */
function drawBVH(context, body, isTrigger = true) {
  drawPolygon(
    context,
    {
      pos: { x: body.minX, y: body.minY },
      calcPoints: createBox(body.maxX - body.minX, body.maxY - body.minY)
    },
    isTrigger
  )
}
/**
 * clone response object returning new response with previous ones values
 */
function cloneResponse(response) {
  const clone = new SATExports.Response()
  const { a, b, overlap, overlapN, overlapV, aInB, bInA } = response
  clone.a = a
  clone.b = b
  clone.overlap = overlap
  clone.overlapN = overlapN.clone()
  clone.overlapV = overlapV.clone()
  clone.aInB = aInB
  clone.bInA = bInA
  return clone
}
/**
 * dummy fn used as default, for optimization
 */
function returnTrue() {
  return true
}
/**
 * for groups
 */
function getGroup(group) {
  return Math.max(0, Math.min(group, 0x7fffffff))
}
/**
 * binary string to decimal number
 */
function bin2dec(binary) {
  return Number(`0b${binary}`.replace(/\s/g, ''))
}
/**
 * helper for groupBits()
 *
 * @param input - number or binary string
 */
function ensureNumber(input) {
  return typeof input === 'number' ? input : bin2dec(input)
}
/**
 * create group bits from category and mask
 *
 * @param category - category bits
 * @param mask - mask bits (default: category)
 */
function groupBits(category, mask = category) {
  return (ensureNumber(category) << 16) | ensureNumber(mask)
}
function move(body, speed = 1, updateNow = true) {
  if (!speed) {
    return
  }
  const moveX = Math.cos(body.angle) * speed
  const moveY = Math.sin(body.angle) * speed
  body.setPosition(body.x + moveX, body.y + moveY, updateNow)
}

/**
 * collider - circle
 */
class Circle extends SATExports.Circle {
  /**
   * collider - circle
   */
  constructor(position, radius, options) {
    super(ensureVectorPoint(position), radius)
    /**
     * offset copy without angle applied
     */
    this.offsetCopy = { x: 0, y: 0 }
    /**
     * was the polygon modified and needs update in the next checkCollision
     */
    this.dirty = false
    /*
     * circles are convex
     */
    this.isConvex = true
    /**
     * circle type
     */
    this.type = BodyType.Circle
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Circle
    /**
     * always centered
     */
    this.isCentered = true
    extendBody(this, options)
    this.unscaledRadius = radius
  }
  /**
   * get this.pos.x
   */
  get x() {
    return this.pos.x
  }
  /**
   * updating this.pos.x by this.x = x updates AABB
   */
  set x(x) {
    this.pos.x = x
    this.markAsDirty()
  }
  /**
   * get this.pos.y
   */
  get y() {
    return this.pos.y
  }
  /**
   * updating this.pos.y by this.y = y updates AABB
   */
  set y(y) {
    this.pos.y = y
    this.markAsDirty()
  }
  /**
   * allow get scale
   */
  get scale() {
    return this.r / this.unscaledRadius
  }
  /**
   * shorthand for setScale()
   */
  set scale(scale) {
    this.setScale(scale)
  }
  /**
   * scaleX = scale in case of Circles
   */
  get scaleX() {
    return this.scale
  }
  /**
   * scaleY = scale in case of Circles
   */
  get scaleY() {
    return this.scale
  }
  // Don't overwrite docs from BodyProps
  get group() {
    return this._group
  }
  // Don't overwrite docs from BodyProps
  set group(group) {
    this._group = getGroup(group)
  }
  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed = 1, updateNow = true) {
    move(this, speed, updateNow)
    return this
  }
  /**
   * update position BY TELEPORTING
   */
  setPosition(x, y, updateNow = true) {
    this.pos.x = x
    this.pos.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * update scale
   */
  setScale(scaleX, _scaleY = scaleX, updateNow = true) {
    this.r = this.unscaledRadius * Math.abs(scaleX)
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * set rotation
   */
  setAngle(angle, updateNow = true) {
    this.angle = angle
    const { x, y } = this.getOffsetWithAngle()
    this.offset.x = x
    this.offset.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * set offset from center
   */
  setOffset(offset, updateNow = true) {
    this.offsetCopy.x = offset.x
    this.offsetCopy.y = offset.y
    const { x, y } = this.getOffsetWithAngle()
    this.offset.x = x
    this.offset.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * get body bounding box, without padding
   */
  getAABBAsBBox() {
    const x = this.pos.x + this.offset.x
    const y = this.pos.y + this.offset.y
    return {
      minX: x - this.r,
      maxX: x + this.r,
      minY: y - this.r,
      maxY: y + this.r
    }
  }
  /**
   * Draws collider on a CanvasRenderingContext2D's current path
   */
  draw(context) {
    const x = this.pos.x + this.offset.x
    const y = this.pos.y + this.offset.y
    const r = Math.abs(this.r)
    if (this.isTrigger) {
      const max = Math.max(8, this.r)
      for (let i = 0; i < max; i++) {
        const arc = (i / max) * 2 * Math.PI
        const arcPrev = ((i - 1) / max) * 2 * Math.PI
        const fromX = x + Math.cos(arcPrev) * this.r
        const fromY = y + Math.sin(arcPrev) * this.r
        const toX = x + Math.cos(arc) * this.r
        const toY = y + Math.sin(arc) * this.r
        dashLineTo(context, fromX, fromY, toX, toY)
      }
    } else {
      context.moveTo(x + r, y)
      context.arc(x, y, r, 0, Math.PI * 2)
    }
  }
  /**
   * Draws Bounding Box on canvas context
   */
  drawBVH(context) {
    drawBVH(context, this)
  }
  /**
   * inner function for after position change update aabb in system
   */
  updateBody(updateNow = this.dirty) {
    if (updateNow) {
      this.system?.insert(this)
      this.dirty = false
    }
  }
  /**
   * update instantly or mark as dirty
   */
  markAsDirty(updateNow = false) {
    if (updateNow) {
      this.updateBody(true)
    } else {
      this.dirty = true
    }
  }
  /**
   * internal for getting offset with applied angle
   */
  getOffsetWithAngle() {
    if ((!this.offsetCopy.x && !this.offsetCopy.y) || !this.angle) {
      return this.offsetCopy
    }
    const sin = Math.sin(this.angle)
    const cos = Math.cos(this.angle)
    const x = this.offsetCopy.x * cos - this.offsetCopy.y * sin
    const y = this.offsetCopy.x * sin + this.offsetCopy.y * cos
    return { x, y }
  }
}

/**
 * collider - polygon
 */
class Polygon extends SATExports.Polygon {
  /**
   * collider - polygon
   */
  constructor(position, points, options) {
    super(ensureVectorPoint(position), ensurePolygonPoints(points))
    /**
     * was the polygon modified and needs update in the next checkCollision
     */
    this.dirty = false
    /**
     * type of body
     */
    this.type = BodyType.Polygon
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Polygon
    /**
     * is body centered
     */
    this.centered = false
    /**
     * scale Vector of body
     */
    this.scaleVector = { x: 1, y: 1 }
    if (!points.length) {
      throw new Error('No points in polygon')
    }
    extendBody(this, options)
  }
  /**
   * flag to set is polygon centered
   */
  set isCentered(center) {
    if (this.centered === center) return
    let centroid
    this.runWithoutRotation(() => {
      centroid = this.getCentroid()
    })
    const offsetX = center ? -centroid.x : -this.points[0].x
    const offsetY = center ? -centroid.y : -this.points[0].y
    this.setPoints(
      map(
        this.points,
        ({ x, y }) => new SATExports.Vector(x + offsetX, y + offsetY)
      )
    )
    this.centered = center
  }
  /**
   * is polygon centered?
   */
  get isCentered() {
    return this.centered
  }
  get x() {
    return this.pos.x
  }
  /**
   * updating this.pos.x by this.x = x updates AABB
   */
  set x(x) {
    this.pos.x = x
    this.markAsDirty()
  }
  get y() {
    return this.pos.y
  }
  /**
   * updating this.pos.y by this.y = y updates AABB
   */
  set y(y) {
    this.pos.y = y
    this.markAsDirty()
  }
  /**
   * allow exact getting of scale x - use setScale(x, y) to set
   */
  get scaleX() {
    return this.scaleVector.x
  }
  /**
   * allow exact getting of scale y - use setScale(x, y) to set
   */
  get scaleY() {
    return this.scaleVector.y
  }
  /**
   * allow approx getting of scale
   */
  get scale() {
    return (this.scaleVector.x + this.scaleVector.y) / 2
  }
  /**
   * allow easier setting of scale
   */
  set scale(scale) {
    this.setScale(scale)
  }
  // Don't overwrite docs from BodyProps
  get group() {
    return this._group
  }
  // Don't overwrite docs from BodyProps
  set group(group) {
    this._group = getGroup(group)
  }
  /**
   * update position BY MOVING FORWARD IN ANGLE DIRECTION
   */
  move(speed = 1, updateNow = true) {
    move(this, speed, updateNow)
    return this
  }
  /**
   * update position BY TELEPORTING
   */
  setPosition(x, y, updateNow = true) {
    this.pos.x = x
    this.pos.y = y
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * update scale
   */
  setScale(x, y = x, updateNow = true) {
    this.scaleVector.x = Math.abs(x)
    this.scaleVector.y = Math.abs(y)
    // super instead of this to not taint pointsBackup
    super.setPoints(
      map(
        this.points,
        (_point, index) =>
          new SATExports.Vector(
            this.pointsBackup[index].x * this.scaleVector.x,
            this.pointsBackup[index].y * this.scaleVector.y
          )
      )
    )
    this.updateConvex()
    this.markAsDirty(updateNow)
    return this
  }
  setAngle(angle, updateNow = true) {
    super.setAngle(angle)
    this.markAsDirty(updateNow)
    return this
  }
  setOffset(offset, updateNow = true) {
    super.setOffset(offset)
    this.markAsDirty(updateNow)
    return this
  }
  /**
   * get body bounding box, without padding
   */
  getAABBAsBBox() {
    const { pos, w, h } = this.getAABBAsBox()
    return {
      minX: pos.x,
      minY: pos.y,
      maxX: pos.x + w,
      maxY: pos.y + h
    }
  }
  /**
   * Get edge line by index
   */
  getEdge(index) {
    const { x, y } = this.calcPoints[index]
    const next = this.calcPoints[(index + 1) % this.calcPoints.length]
    const start = {
      x: this.x + x,
      y: this.y + y
    }
    const end = {
      x: this.x + next.x,
      y: this.y + next.y
    }
    return { start, end }
  }
  /**
   * Draws exact collider on canvas context
   */
  draw(context) {
    drawPolygon(context, this, this.isTrigger)
  }
  /**
   * Draws Bounding Box on canvas context
   */
  drawBVH(context) {
    drawBVH(context, this)
  }
  /**
   * sets polygon points to new array of vectors
   */
  setPoints(points) {
    super.setPoints(points)
    this.updateConvex()
    this.pointsBackup = clonePointsArray(points)
    return this
  }
  /**
   * translates polygon points in x, y direction
   */
  translate(x, y) {
    super.translate(x, y)
    this.pointsBackup = clonePointsArray(this.points)
    return this
  }
  /**
   * rotates polygon points by angle, in radians
   */
  rotate(angle) {
    super.rotate(angle)
    this.pointsBackup = clonePointsArray(this.points)
    return this
  }
  /**
   * if true, polygon is not an invalid, self-crossing polygon
   */
  isSimple() {
    return isSimple(map(this.calcPoints, mapVectorToArray))
  }
  /**
   * inner function for after position change update aabb in system and convex inner polygons
   */
  updateBody(updateNow = this.dirty) {
    if (updateNow) {
      this.updateConvexPolygonPositions()
      this.system?.insert(this)
      this.dirty = false
    }
  }
  /**
   * used to do stuff with temporarily disabled rotation
   */
  runWithoutRotation(callback) {
    const angle = this.angle
    this.setAngle(0, false)
    callback()
    this.setAngle(angle, false)
  }
  /**
   * update instantly or mark as dirty
   */
  markAsDirty(updateNow = false) {
    if (updateNow) {
      this.updateBody(true)
    } else {
      this.dirty = true
    }
  }
  /**
   * update the position of the decomposed convex polygons (if any), called
   * after the position of the body has changed
   */
  updateConvexPolygonPositions() {
    if (this.isConvex || !this.convexPolygons) {
      return
    }
    forEach(this.convexPolygons, (polygon) => {
      polygon.pos.x = this.pos.x
      polygon.pos.y = this.pos.y
      if (polygon.angle !== this.angle) {
        // Must use setAngle to recalculate the points of the Polygon
        polygon.setAngle(this.angle)
      }
    })
  }
  /**
   * returns body split into convex polygons, or empty array for convex bodies
   */
  getConvex() {
    if (
      (this.typeGroup && this.typeGroup !== BodyGroup.Polygon) ||
      this.points.length < 4
    ) {
      return []
    }
    const points = map(this.calcPoints, mapVectorToArray)
    return quickDecomp(points)
  }
  /**
   * updates convex polygons cache in body
   */
  updateConvexPolygons(convex = this.getConvex()) {
    if (this.isConvex) {
      return
    }
    if (!this.convexPolygons) {
      this.convexPolygons = []
    }
    forEach(convex, (points, index) => {
      // lazy create
      if (!this.convexPolygons[index]) {
        this.convexPolygons[index] = new SATExports.Polygon()
      }
      this.convexPolygons[index].pos.x = this.pos.x
      this.convexPolygons[index].pos.y = this.pos.y
      this.convexPolygons[index].angle = this.angle
      this.convexPolygons[index].setPoints(
        ensurePolygonPoints(map(points, mapArrayToVector))
      )
    })
    // trim array length
    this.convexPolygons.length = convex.length
  }
  /**
   * after points update set is convex
   */
  updateConvex() {
    // all other types other than polygon are always convex
    const convex = this.getConvex()
    // everything with empty array or one element array
    this.isConvex = convex.length <= 1
    this.updateConvexPolygons(convex)
  }
}

/**
 * collider - ellipse
 */
class Ellipse extends Polygon {
  /**
   * collider - ellipse
   */
  constructor(
    position,
    radiusX,
    radiusY = radiusX,
    step = (radiusX + radiusY) / Math.PI,
    options
  ) {
    super(position, createEllipse(radiusX, radiusY, step), options)
    /**
     * ellipse type
     */
    this.type = BodyType.Ellipse
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Ellipse
    /**
     * ellipses are convex
     */
    this.isConvex = true
    this._radiusX = radiusX
    this._radiusY = radiusY
    this._step = step
  }
  /**
   * flag to set is body centered
   */
  set isCentered(_isCentered) {}
  /**
   * is body centered?
   */
  get isCentered() {
    return true
  }
  /**
   * get ellipse step number
   */
  get step() {
    return this._step
  }
  /**
   * set ellipse step number
   */
  set step(step) {
    this._step = step
    this.setPoints(createEllipse(this._radiusX, this._radiusY, this._step))
  }
  /**
   * get ellipse radiusX
   */
  get radiusX() {
    return this._radiusX
  }
  /**
   * set ellipse radiusX, update points
   */
  set radiusX(radiusX) {
    this._radiusX = radiusX
    this.setPoints(createEllipse(this._radiusX, this._radiusY, this._step))
  }
  /**
   * get ellipse radiusY
   */
  get radiusY() {
    return this._radiusY
  }
  /**
   * set ellipse radiusY, update points
   */
  set radiusY(radiusY) {
    this._radiusY = radiusY
    this.setPoints(createEllipse(this._radiusX, this._radiusY, this._step))
  }
  /**
   * do not attempt to use Polygon.center()
   */
  center() {
    return
  }
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  updateConvex() {
    return
  }
}

/**
 * collider - box
 */
class Box extends Polygon {
  /**
   * collider - box
   */
  constructor(position, width, height, options) {
    super(position, createBox(width, height), options)
    /**
     * type of body
     */
    this.type = BodyType.Box
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Box
    /**
     * boxes are convex
     */
    this.isConvex = true
    this._width = width
    this._height = height
  }
  /**
   * get box width
   */
  get width() {
    return this._width
  }
  /**
   * set box width, update points
   */
  set width(width) {
    this._width = width
    this.afterUpdateSize()
  }
  /**
   * get box height
   */
  get height() {
    return this._height
  }
  /**
   * set box height, update points
   */
  set height(height) {
    this._height = height
    this.afterUpdateSize()
  }
  /**
   * after setting width/height update translate
   * see https://github.com/nenjack/check2d/issues/70
   */
  afterUpdateSize() {
    this.setPoints(createBox(this._width, this._height))
  }
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  updateConvex() {
    return
  }
}

/**
 * collider - point (very tiny box)
 */
class Point extends Box {
  /**
   * collider - point (very tiny box)
   */
  constructor(position, options) {
    super(ensureVectorPoint(position), 0.001, 0.001, options)
    /**
     * point type
     */
    this.type = BodyType.Point
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Point
  }
}

/**
 * collider - line
 */
class Line extends Polygon {
  /**
   * collider - line from start to end
   */
  constructor(start, end, options) {
    super(
      start,
      [
        { x: 0, y: 0 },
        { x: end.x - start.x, y: end.y - start.y }
      ],
      options
    )
    /**
     * line type
     */
    this.type = BodyType.Line
    /**
     * faster than type
     */
    this.typeGroup = BodyGroup.Line
    /**
     * line is convex
     */
    this.isConvex = true
    if (this.calcPoints.length === 1 || !end) {
      console.error({ start, end })
      throw new Error('No end point for line provided')
    }
  }
  get start() {
    return {
      x: this.x + this.calcPoints[0].x,
      y: this.y + this.calcPoints[0].y
    }
  }
  /**
   * @param position
   */
  set start({ x, y }) {
    this.x = x
    this.y = y
  }
  get end() {
    return {
      x: this.x + this.calcPoints[1].x,
      y: this.y + this.calcPoints[1].y
    }
  }
  /**
   * @param position
   */
  set end({ x, y }) {
    this.points[1].x = x - this.start.x
    this.points[1].y = y - this.start.y
    this.setPoints(this.points)
  }
  getCentroid() {
    return new SATExports.Vector(
      (this.end.x - this.start.x) / 2,
      (this.end.y - this.start.y) / 2
    )
  }
  /**
   * do not attempt to use Polygon.updateConvex()
   */
  updateConvex() {
    return
  }
}

/**
 * very base collision system (create, insert, update, draw, remove)
 */
class BaseSystem extends RBush {
  /**
   * create point at position with options and add to system
   */
  createPoint(position, options, Class) {
    const PointClass = Class || Point
    const point = new PointClass(position, options)
    this.insert(point)
    return point
  }
  /**
   * create line at position with options and add to system
   */
  createLine(start, end, options, Class) {
    const LineClass = Class || Line
    const line = new LineClass(start, end, options)
    this.insert(line)
    return line
  }
  /**
   * create circle at position with options and add to system
   */
  createCircle(position, radius, options, Class) {
    const CircleClass = Class || Circle
    const circle = new CircleClass(position, radius, options)
    this.insert(circle)
    return circle
  }
  /**
   * create box at position with options and add to system
   */
  createBox(position, width, height, options, Class) {
    const BoxClass = Class || Box
    const box = new BoxClass(position, width, height, options)
    this.insert(box)
    return box
  }
  /**
   * create ellipse at position with options and add to system
   */
  createEllipse(position, radiusX, radiusY = radiusX, step, options, Class) {
    const EllipseClass = Class || Ellipse
    const ellipse = new EllipseClass(position, radiusX, radiusY, step, options)
    this.insert(ellipse)
    return ellipse
  }
  /**
   * create polygon at position with options and add to system
   */
  createPolygon(position, points, options, Class) {
    const PolygonClass = Class || Polygon
    const polygon = new PolygonClass(position, points, options)
    this.insert(polygon)
    return polygon
  }
  /**
   * re-insert body into collision tree and update its bbox
   * every body can be part of only one system
   */
  insert(body) {
    body.bbox = body.getAABBAsBBox()
    if (body.system) {
      // allow end if body inserted and not moved
      if (!bodyMoved(body)) {
        return this
      }
      // old bounding box *needs* to be removed
      body.system.remove(body)
    }
    // only then we update min, max
    body.minX = body.bbox.minX - body.padding
    body.minY = body.bbox.minY - body.padding
    body.maxX = body.bbox.maxX + body.padding
    body.maxY = body.bbox.maxY + body.padding
    // reinsert bounding box to collision tree
    return super.insert(body)
  }
  /**
   * updates body in collision tree
   */
  updateBody(body) {
    body.updateBody()
  }
  /**
   * update all bodies aabb
   */
  update() {
    forEach(this.all(), (body) => {
      this.updateBody(body)
    })
  }
  /**
   * draw exact bodies colliders outline
   */
  draw(context) {
    forEach(this.all(), (body) => {
      body.draw(context)
    })
  }
  /**
   * draw bounding boxes hierarchy outline
   */
  drawBVH(context, isTrigger = true) {
    const drawChildren = (body) => {
      drawBVH(context, body, isTrigger)
      if (body.children) {
        forEach(body.children, drawChildren)
      }
    }
    forEach(this.data.children, drawChildren)
  }
  /**
   * remove body aabb from collision tree
   */
  remove(body, equals) {
    body.system = undefined
    return super.remove(body, equals)
  }
  /**
   * get object potential colliders
   * @deprecated because it's slower to use than checkOne() or checkAll()
   */
  getPotentials(body) {
    // filter here is required as collides with self
    return filter(this.search(body), (candidate) => candidate !== body)
  }
  /**
   * used to find body deep inside data with finder function returning boolean found or not
   *
   * @param traverseFunction
   * @param tree
   */
  traverse(traverseFunction, { children } = this.data) {
    return children?.find((body, index) => {
      if (!body) {
        return false
      }
      if (body.typeGroup && traverseFunction(body, children, index)) {
        return true
      }
      // if callback returns true, ends forEach
      if (body.children) {
        this.traverse(traverseFunction, body)
      }
    })
  }
}

/**
 * collision system
 */
class System extends BaseSystem {
  constructor() {
    super(...arguments)
    /**
     * the last collision result
     */
    this.response = new SATExports.Response()
  }
  /**
   * re-insert body into collision tree and update its bbox
   * every body can be part of only one system
   */
  insert(body) {
    const insertResult = super.insert(body)
    // set system for later body.check2d.updateBody(body)
    body.system = this
    return insertResult
  }
  /**
   * separate (move away) bodies
   */
  separate(callback = returnTrue, response = this.response) {
    forEach(this.all(), (body) => {
      this.separateBody(body, callback, response)
    })
  }
  /**
   * separate (move away) 1 body, with optional callback before collision
   */
  separateBody(body, callback = returnTrue, response = this.response) {
    if (body.isStatic && !body.isTrigger) {
      return
    }
    const offsets = { x: 0, y: 0 }
    const addOffsets = (collision) => {
      // when is not trigger and callback returns true it continues
      if (callback(collision) && !body.isTrigger && !collision.b.isTrigger) {
        offsets.x += collision.overlapV.x
        offsets.y += collision.overlapV.y
      }
    }
    this.checkOne(body, addOffsets, response)
    if (offsets.x || offsets.y) {
      body.setPosition(body.x - offsets.x, body.y - offsets.y)
    }
  }
  /**
   * check one body collisions with callback
   */
  checkOne(body, callback = returnTrue, response = this.response) {
    // no need to check static body collision
    if (body.isStatic && !body.isTrigger) {
      return false
    }
    const bodies = this.search(body)
    const checkCollision = (candidate) => {
      if (
        candidate !== body &&
        this.checkCollision(body, candidate, response)
      ) {
        return callback(response)
      }
    }
    return some(bodies, checkCollision)
  }
  /**
   * check all bodies collisions in area with callback
   */
  checkArea(area, callback = returnTrue, response = this.response) {
    const checkOne = (body) => {
      return this.checkOne(body, callback, response)
    }
    return some(this.search(area), checkOne)
  }
  /**
   * check all bodies collisions with callback
   */
  checkAll(callback = returnTrue, response = this.response) {
    const checkOne = (body) => {
      return this.checkOne(body, callback, response)
    }
    return some(this.all(), checkOne)
  }
  /**
   * check do 2 objects collide
   */
  checkCollision(bodyA, bodyB, response = this.response) {
    const { bbox: bboxA, padding: paddingA } = bodyA
    const { bbox: bboxB, padding: paddingB } = bodyB
    // assess the bodies real aabb without padding
    /* tslint:disable-next-line:cyclomatic-complexity */
    if (
      !bboxA ||
      !bboxB ||
      !canInteract(bodyA, bodyB) ||
      ((paddingA || paddingB) && notIntersectAABB(bboxA, bboxB))
    ) {
      return false
    }
    const sat = getSATTest(bodyA, bodyB)
    // 99% of cases
    if (bodyA.isConvex && bodyB.isConvex) {
      // always first clear response
      response.clear()
      return sat(bodyA, bodyB, response)
    }
    // more complex (non convex) cases
    const convexBodiesA = ensureConvex(bodyA)
    const convexBodiesB = ensureConvex(bodyB)
    let overlapX = 0
    let overlapY = 0
    let collided = false
    forEach(convexBodiesA, (convexBodyA) => {
      forEach(convexBodiesB, (convexBodyB) => {
        // always first clear response
        response.clear()
        if (sat(convexBodyA, convexBodyB, response)) {
          collided = true
          overlapX += response.overlapV.x
          overlapY += response.overlapV.y
        }
      })
    })
    if (collided) {
      const vector = new SATExports.Vector(overlapX, overlapY)
      response.a = bodyA
      response.b = bodyB
      response.overlapV.x = overlapX
      response.overlapV.y = overlapY
      response.overlapN = vector.normalize()
      response.overlap = vector.len()
      response.aInB = checkAInB(bodyA, bodyB)
      response.bInA = checkAInB(bodyB, bodyA)
    }
    return collided
  }
  /**
   * raycast to get collider of ray from start to end
   */
  raycast(start, end, allow = returnTrue) {
    let minDistance = Infinity
    let result
    if (!this.ray) {
      this.ray = new Line(start, end, { isTrigger: true })
    } else {
      this.ray.start = start
      this.ray.end = end
    }
    this.insert(this.ray)
    this.checkOne(this.ray, ({ b: body }) => {
      if (!allow(body, this.ray)) {
        return false
      }
      const points =
        body.typeGroup === BodyGroup.Circle
          ? intersectLineCircle(this.ray, body)
          : intersectLinePolygon(this.ray, body)
      forEach(points, (point) => {
        const pointDistance = distance(start, point)
        if (pointDistance < minDistance) {
          minDistance = pointDistance
          result = { point, body }
        }
      })
    })
    this.remove(this.ray)
    return result
  }
  /**
   * find collisions points between 2 bodies
   */
  getCollisionPoints(a, b) {
    const collisionPoints = []
    if (a.typeGroup === BodyGroup.Circle && b.typeGroup === BodyGroup.Circle) {
      collisionPoints.push(...intersectCircleCircle(a, b))
    }
    if (a.typeGroup === BodyGroup.Circle && b.typeGroup !== BodyGroup.Circle) {
      for (let indexB = 0; indexB < b.calcPoints.length; indexB++) {
        const lineB = b.getEdge(indexB)
        collisionPoints.push(...intersectLineCircle(lineB, a))
      }
    }
    if (a.typeGroup !== BodyGroup.Circle) {
      for (let indexA = 0; indexA < a.calcPoints.length; indexA++) {
        const lineA = a.getEdge(indexA)
        if (b.typeGroup === BodyGroup.Circle) {
          collisionPoints.push(...intersectLineCircle(lineA, b))
        } else {
          for (let indexB = 0; indexB < b.calcPoints.length; indexB++) {
            const lineB = b.getEdge(indexB)
            const hit = intersectLineLine(lineA, lineB)
            if (hit) {
              collisionPoints.push(hit)
            }
          }
        }
      }
    }
    // unique
    return collisionPoints.filter(
      ({ x, y }, index) =>
        index ===
        collisionPoints.findIndex((collisionPoint) =>
          pointsEqual(collisionPoint, { x, y })
        )
    )
  }
}

/**
 * Utility clock/loop class
 */
class Clock {
  /**
   * @param delay {number} how long between setTimeout tic-toc
   */
  constructor(delay = 0) {
    this.events = []
    this.delay = delay
    this.toc = () => {
      if (!this.events.length) {
        return
      }
      this.events.forEach((event) => {
        event()
      })
      this.tic()
    }
  }
  /**
   * Issue next toc after delay with set timeout
   */
  tic() {
    if (!this.events.length) {
      return
    }
    setTimeout(this.toc, this.delay)
  }
  /**
   * Add function to clock events
   * First add issues first tic
   * @param event {BaseFunction} function to add to events
   */
  add(event) {
    this.events.push(event)
    if (this.events.length === 1) {
      this.tic()
    }
  }
  /**
   * Clear clock events
   */
  clear() {
    while (this.events.length) {
      this.events.pop()
    }
  }
}
const clock = new Clock()

var Response = SATExports.Response
var Circle$1 = SATExports.Circle
var Polygon$1 = SATExports.Polygon
var Vector = SATExports.Vector
export {
  BodyGroup,
  BodyType,
  Box,
  Circle,
  Clock,
  DEG2RAD,
  EPSILON,
  Ellipse,
  Line,
  Point,
  Polygon,
  RAD2DEG,
  RBush,
  Response,
  Circle$1 as SATCircle,
  Polygon$1 as SATPolygon,
  Vector as SATVector,
  System,
  almostEqual,
  bin2dec,
  bodyMoved,
  canInteract,
  checkAInB,
  circleInCircle,
  circleInPolygon,
  circleOutsidePolygon,
  clock,
  clockwise,
  clonePointsArray,
  cloneResponse,
  createBox,
  createEllipse,
  dashLineTo,
  deg2rad,
  distance,
  drawBVH,
  drawPolygon,
  ensureConvex,
  ensureNumber,
  ensurePolygonPoints,
  ensureVectorPoint,
  extendBody,
  getBounceDirection,
  getGroup,
  getSATTest,
  getWorldPoints,
  groupBits,
  intersectAABB,
  intersectCircleCircle,
  intersectLineCircle,
  intersectLineLine,
  intersectLineLineFast,
  intersectLinePolygon,
  intersectPolygonPolygon,
  isSimple,
  mapArrayToVector,
  mapVectorToArray,
  move,
  notIntersectAABB,
  pointInPolygon,
  pointOnCircle,
  pointsEqual,
  polygonInCircle,
  polygonInPolygon,
  quickDecomp,
  rad2deg,
  returnTrue
}
//# sourceMappingURL=index.js.map
