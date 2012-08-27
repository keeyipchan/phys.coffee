// Generated by CoffeeScript 1.3.3
(function() {
  var Axis, Body, Box, Circle, Collision, Contact, Poly, Space, SpaceIndex, Vec, exports;

  Vec = function(x, y) {
    return {
      x: x,
      y: y,
      __proto__: Vec.methods
    };
  };

  Vec.methods = {
    cp: function() {
      return {
        x: this.x,
        y: this.y,
        __proto__: this.__proto__
      };
    },
    set: function(_arg) {
      this.x = _arg.x, this.y = _arg.y;
      return this;
    },
    set_: function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    },
    opp: function() {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    },
    mult: function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },
    add: function(_arg) {
      var x, y;
      x = _arg.x, y = _arg.y;
      this.x += x;
      this.y += y;
      return this;
    },
    addMult: function(_arg, s) {
      var x, y;
      x = _arg.x, y = _arg.y;
      this.x += s * x;
      this.y += s * y;
      return this;
    },
    sub: function(_arg) {
      var x, y;
      x = _arg.x, y = _arg.y;
      this.x -= x;
      this.y -= y;
      return this;
    },
    subMult: function(_arg, s) {
      var x, y;
      x = _arg.x, y = _arg.y;
      this.x -= x * s;
      this.y -= y * s;
      return this;
    },
    dot: function(_arg) {
      var x, y;
      x = _arg.x, y = _arg.y;
      return this.x * x + this.y * y;
    },
    cross: function(_arg) {
      var x, y;
      x = _arg.x, y = _arg.y;
      return -(this.x * -y + this.y * x);
    },
    perp: function() {
      var y;
      y = this.y;
      this.y = this.x;
      this.x = -y;
      return this;
    },
    len: function() {
      return Math.sqrt(this.dot(this));
    },
    unit: function() {
      var l;
      l = this.len();
      this.x /= l;
      this.y /= l;
      return this;
    },
    rotate: function(_arg) {
      var x, x_, y, y_;
      x = _arg.x, y = _arg.y;
      x_ = this.x * x - this.y * y;
      y_ = this.y * x + this.x * y;
      this.x = x_;
      this.y = y_;
      return this;
    },
    rotate_: function(x, y) {
      var x_, y_;
      x_ = this.x * x - this.y * y;
      y_ = this.y * x + this.x * y;
      this.x = x_;
      this.y = y_;
      return this;
    },
    toString: function() {
      return "{" + this.x + "," + this.y + "}";
    }
  };

  Vec.polar = function(a) {
    return Vec(Math.cos(a), Math.sin(a));
  };

  Axis = function(n, d) {
    return {
      n: n,
      d: d,
      __proto__: Axis.methods
    };
  };

  Axis.methods = {
    cp: function() {
      return {
        n: this.n.cp(),
        d: this.d,
        __proto__: Axis.methods
      };
    },
    opp: function() {
      this.n.opp();
      return this;
    },
    toString: function() {
      return "Axis(" + this.n + "," + this.d + ")";
    }
  };

  Circle = function(radius) {
    return {
      radius: radius,
      area: radius * radius * Math.PI,
      inertia: radius * radius / 2,
      obj: function() {
        return {
          center: null,
          radius: radius,
          bounds: {
            p1: Vec(),
            p2: Vec()
          }
        };
      },
      update: function(obj, pos, dir) {
        var ext;
        obj.center = pos;
        ext = Vec(this.radius, this.radius);
        obj.bounds.p1.set(pos).sub(ext);
        return obj.bounds.p2.set(pos).add(ext);
      }
    };
  };

  Poly = function(verts) {
    var a, ai, b, bi, s, v1, v2, v3;
    return {
      verts: verts,
      axes: Poly.sides(verts).map(function(_arg) {
        var n, v1, v2;
        v1 = _arg[0], v2 = _arg[1];
        n = v2.cp().sub(v1).unit().perp();
        return Axis(n, n.dot(v1));
      }),
      area: ((function() {
        var _i, _len, _ref, _ref1;
        s = 0;
        _ref = Poly.sides3(verts);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], v1 = _ref1[0], v2 = _ref1[1], v3 = _ref1[2];
          s += v2.x * (v1.y - v3.y);
        }
        return s / 2;
      })()),
      inertia: ((function() {
        var _i, _len, _ref, _ref1;
        a = 0;
        b = 0;
        _ref = Poly.sides(verts);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], v1 = _ref1[0], v2 = _ref1[1];
          ai = v2.cross(v1);
          bi = v1.dot(v1) + v2.dot(v2) + v1.dot(v2);
          a += ai * bi;
          b += bi;
        }
        return a / (6 * b);
      })()),
      obj: function() {
        return {
          verts: this.verts.map(function() {
            return Vec();
          }),
          axes: this.axes.map(function() {
            return Axis(Vec());
          }),
          bounds: {
            p1: Vec(),
            p2: Vec()
          }
        };
      },
      update: function(obj, pos, dir) {
        var l, r, t, v, _i, _len, _ref;
        this.verts.forEach(function(v, i) {
          var tv;
          tv = obj.verts[i];
          return tv.set(pos).add(Vec().set(dir).rotate(v));
        });
        this.axes.forEach(function(a, i) {
          var ta;
          ta = obj.axes[i];
          ta.n.set(a.n).rotate(dir);
          return ta.d = ta.n.dot(pos) + a.d;
        });
        l = Infinity;
        r = -Infinity;
        t = Infinity;
        b = -Infinity;
        _ref = obj.verts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          l = Math.min(l, v.x);
          r = Math.max(r, v.x);
          t = Math.min(t, v.y);
          b = Math.max(b, v.y);
        }
        obj.bounds.p1.set_(l, t);
        return obj.bounds.p2.set_(r, b);
      }
    };
  };

  Poly.sides = function(xs) {
    return xs.map(function(x, i) {
      return [x, xs[(i + 1) % xs.length]];
    });
  };

  Poly.sides3 = function(xs) {
    return xs.map(function(x, i) {
      return [x, xs[(i + 1) % xs.length], xs[(i + 2) % xs.length]];
    });
  };

  Box = function(w, h) {
    return Poly([Vec(-w / 2, -h / 2), Vec(-w / 2, h / 2), Vec(w / 2, h / 2), Vec(w / 2, -h / 2)]);
  };

  Body = function(pos, shapes, density, ang, bounce) {
    var area, inertia, mass, s, _i, _len;
    if (density == null) {
      density = 1;
    }
    if (ang == null) {
      ang = 0;
    }
    if (bounce == null) {
      bounce = .2;
    }
    area = 0;
    inertia = 0;
    for (_i = 0, _len = shapes.length; _i < _len; _i++) {
      s = shapes[_i];
      area += s.area;
      inertia += s.inertia;
    }
    mass = area * density;
    inertia = mass * inertia;
    return {
      id: Body.tag++,
      pos: pos,
      ang: ang,
      vel: Vec(0, 0),
      rot: 0,
      snap: Vec(0, 0),
      asnap: 0,
      shapes: shapes,
      transform: (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = shapes.length; _j < _len1; _j++) {
          s = shapes[_j];
          _results.push(s.obj());
        }
        return _results;
      })(),
      density: density,
      bounce: bounce,
      mass: mass,
      inertia: inertia,
      invMass: 1 / mass,
      invInertia: 1 / inertia,
      __proto__: Body.methods
    };
  };

  Body.tag = 0;

  Body.methods = {
    update: function(gravity, dt) {
      var dir, i, obj, _i, _len, _ref, _results;
      this.pos.addMult(this.vel, dt).add(this.snap);
      this.ang += this.rot * dt + this.asnap;
      this.snap.set_(0, 0);
      this.asnap = 0;
      if (this.mass !== Infinity) {
        this.vel.addMult(gravity, dt);
      }
      dir = Vec.polar(this.ang);
      _ref = this.transform;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        obj = _ref[i];
        _results.push(this.shapes[i].update(obj, this.pos, dir));
      }
      return _results;
    },
    applySnap: function(j, rn) {
      this.snap.addMult(j, this.invMass);
      return this.asnap += j.dot(rn) * this.invInertia;
    },
    applySnapOpp: function(j, rn) {
      this.snap.subMult(j, this.invMass);
      return this.asnap -= j.dot(rn) * this.invInertia;
    },
    applyVel: function(j, rn) {
      this.vel.addMult(j, this.invMass);
      return this.rot += j.dot(rn) * this.invInertia;
    },
    applyVelOpp: function(j, rn) {
      this.vel.subMult(j, this.invMass);
      return this.rot -= j.dot(rn) * this.invInertia;
    }
  };

  Collision = {
    sepAxisPP: function(poly1, poly2) {
      var a, d, maxd, maxn, v, _i, _j, _len, _len1, _ref, _ref1;
      maxd = -Infinity;
      maxn = null;
      _ref = poly1.axes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        d = Infinity;
        _ref1 = poly2.verts;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          d = Math.min(d, v.dot(a.n));
        }
        d = d - a.d;
        if (d > maxd) {
          maxd = d;
          maxn = a.n;
        }
      }
      if (maxd >= 0) {
        return false;
      }
      return Axis(maxn, maxd);
    },
    containsV: function(poly, v) {
      var a, _i, _len, _ref;
      _ref = poly.axes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        if (a.n.dot(v) > a.d) {
          return false;
        }
      }
      return true;
    },
    findVs: function(poly1, poly2) {
      var i, pts, v, _i, _j, _len, _len1, _ref, _ref1;
      pts = [];
      _ref = poly1.verts;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        v = _ref[i];
        if (Collision.containsV(poly2, v)) {
          pts.push({
            p: v,
            id: i
          });
        }
      }
      _ref1 = poly2.verts;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        v = _ref1[i];
        if (Collision.containsV(poly1, v)) {
          pts.push({
            p: v,
            id: 8 | i
          });
        }
      }
      return pts;
    },
    polyPoly: function(poly1, poly2) {
      var a1, a2, d, n;
      a1 = Collision.sepAxisPP(poly1, poly2);
      a2 = Collision.sepAxisPP(poly2, poly1);
      if (a1 && a2) {
        n = a1.d > a2.d ? a1.n : a2.n.cp().opp();
        d = Math.max(a1.d, a2.d);
        return {
          n: n,
          dist: d,
          pts: Collision.findVs(poly1, poly2)
        };
      } else {
        return false;
      }
    },
    circleCircle: function(circle1, circle2) {
      var len, min, p, r;
      r = circle2.center.cp().sub(circle1.center);
      min = circle1.radius + circle2.radius;
      if (r.dot(r) > min * min) {
        return false;
      }
      len = r.len();
      p = circle1.center.cp().addMult(r, 0.5 + (circle1.radius - 0.5 * min) / len);
      r.mult(1 / len);
      return {
        n: r,
        dist: len - min,
        pts: [
          {
            p: p,
            id: 0
          }
        ]
      };
    },
    sepAxisPC: function(poly, circle) {
      var a, d, i, max, maxi, _i, _len, _ref;
      max = -Infinity;
      maxi = 0;
      _ref = poly.axes;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        a = _ref[i];
        d = a.n.dot(circle.center) - a.d - circle.radius;
        if (d > max) {
          max = d;
          maxi = i;
        }
      }
      if (max < 0) {
        return [max, maxi];
      } else {
        return false;
      }
    },
    polyCircle: function(poly, circle) {
      var a, corner, d, i, max, sep, v1, v2;
      if (sep = Collision.sepAxisPC(poly, circle)) {
        max = sep[0], i = sep[1];
        v1 = poly.verts[i];
        v2 = poly.verts[(i + 1) % poly.verts.length];
        a = poly.axes[i];
        d = a.n.cross(circle.center);
        corner = function(v) {
          return Collision.circleCircle({
            center: v,
            radius: 0
          }, circle);
        };
        switch (false) {
          case !(d > a.n.cross(v1)):
            return corner(v1);
          case !(d < a.n.cross(v2)):
            return corner(v2);
          default:
            return {
              n: a.n,
              dist: max,
              pts: [
                {
                  p: circle.center.cp().subMult(a.n, circle.radius + max / 2),
                  id: i
                }
              ]
            };
        }
      }
    },
    check: function(a, b) {
      var c;
      switch (false) {
        case !(a.verts && b.verts):
          return Collision.polyPoly(a, b);
        case !(a.verts && b.radius):
          return Collision.polyCircle(a, b);
        case !(a.radius && b.verts):
          c = Collision.polyCircle(b, a);
          if (c) {
            c.n = c.n.cp().opp();
            return c;
          }
          break;
        case !(a.radius && b.radius):
          return Collision.circleCircle(a, b);
      }
    }
  };

  Contact = function(a, b) {
    return {
      a: a,
      b: b,
      n: Vec(),
      n2: Vec(),
      p: Vec(),
      t: 0,
      jN: 0,
      jT: 0,
      massN: 0,
      massT: 0,
      snapDist: 0,
      bounceTgt: 0,
      r1: Vec(),
      r2: Vec(),
      r1n: Vec(),
      r2n: Vec(),
      __proto__: Contact.methods
    };
  };

  Contact.methods = {
    update: function(dist, n, p, t) {
      var v;
      this.t = t;
      this.n.set(n);
      this.p.set(p);
      this.n2.set(n).perp();
      this.r1.set(p).sub(this.a.pos);
      this.r1n.set(this.r1).perp();
      this.r2.set(p).sub(this.b.pos);
      this.r2n.set(this.r2).perp();
      this.massN = this.kin(this.n);
      this.massT = this.kin(this.n2);
      this.snapDist = 0.2 * -Math.min(0, dist + 0.1);
      v = this.rel(this.b.vel, this.b.rot, this.a.vel, this.a.rot);
      this.bounceTgt = Math.max(this.a.bounce, this.b.bounce) * -v.dot(this.n) - this.jN;
      return this.bounceTgt = Math.max(this.bounceTgt, 0);
    },
    rel: function(bv, br, av, ar) {
      return Vec().set(bv).addMult(this.r2n, br).sub(av).subMult(this.r1n, ar);
    },
    kin: function(n) {
      return 1 / (this.a.invMass + this.b.invMass + this.a.invInertia * Math.pow(this.r1.cross(n), 2) + this.b.invInertia * Math.pow(this.r2.cross(n), 2));
    },
    applySnap: function(j) {
      this.a.applySnapOpp(j, this.r1n);
      return this.b.applySnap(j, this.r2n);
    },
    applyVel: function(j) {
      this.a.applyVelOpp(j, this.r1n);
      return this.b.applyVel(j, this.r2n);
    },
    accumulated: function() {
      return this.applyVel(Vec().set(this.n).rotate_(this.jN, this.jT));
    },
    correction: function() {
      var jN, newN, s, snapN, v;
      s = this.rel(this.b.snap, this.b.asnap, this.a.snap, this.a.asnap);
      v = this.rel(this.b.vel, this.b.rot, this.a.vel, this.a.rot);
      snapN = this.massN * (this.snapDist - s.dot(this.n));
      if (snapN > 0) {
        this.applySnap(Vec().set(this.n).mult(snapN));
      }
      jN = this.massN * -v.dot(this.n);
      newN = Math.max(0, this.jN + jN);
      this.applyVel(Vec().set(this.n).mult(newN - this.jN));
      return this.jN = newN;
    },
    interaction: function() {
      var jN, jT, limitT, newN, newT, v;
      v = this.rel(this.b.vel, this.b.rot, this.a.vel, this.a.rot);
      jN = this.massN * (-v.dot(this.n) + this.bounceTgt);
      jT = this.massT * -v.dot(this.n2);
      newN = Math.max(0, this.jN + jN);
      limitT = newN * 0.8;
      newT = Math.min(limitT, Math.max(-limitT, this.jT + jT));
      this.applyVel(Vec().set(this.n).rotate_(newN - this.jN, newT - this.jT));
      this.jN = newN;
      return this.jT = newT;
    }
  };

  Space = function(bodies) {
    var body, index, obj, _i, _j, _len, _len1, _ref;
    index = new SpaceIndex();
    for (_i = 0, _len = bodies.length; _i < _len; _i++) {
      body = bodies[_i];
      _ref = body.transform;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        obj = _ref[_j];
        index.add(body, obj);
      }
    }
    return {
      bodies: bodies,
      gravity: Vec(0, 200),
      t: 0,
      cts: {},
      index: index,
      __proto__: Space.methods
    };
  };

  Space.methods = {
    update: function(dt, iters) {
      var body, ct, curCts, id, _, _i, _j, _k, _l, _len, _len1, _ref, _ref1, _results,
        _this = this;
      this.t++;
      _ref = this.bodies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        body = _ref[_i];
        body.update(this.gravity, dt);
      }
      this.index.scan(function(a, sa, saix, b, sb, sbix) {
        var col;
        if (a === b) {
          return;
        }
        if (a.mass === Infinity && b.mass === Infinity) {
          return;
        }
        if (col = Collision.check(sa, sb)) {
          return _this.addCt(a, b, saix, sbix, col);
        }
      });
      curCts = [];
      _ref1 = this.cts;
      for (id in _ref1) {
        ct = _ref1[id];
        if (ct.t + 3 <= this.t) {
          delete this.cts[id];
        } else {
          curCts.push(ct);
        }
      }
      for (_j = 0, _len1 = curCts.length; _j < _len1; _j++) {
        ct = curCts[_j];
        ct.accumulated();
      }
      for (_ = _k = 1; 1 <= iters ? _k <= iters : _k >= iters; _ = 1 <= iters ? ++_k : --_k) {
        for (id in curCts) {
          ct = curCts[id];
          ct.correction();
        }
      }
      _results = [];
      for (_ = _l = 1; 1 <= iters ? _l <= iters : _l >= iters; _ = 1 <= iters ? ++_l : --_l) {
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (id in curCts) {
            ct = curCts[id];
            _results1.push(ct.interaction());
          }
          return _results1;
        })());
      }
      return _results;
    },
    addCt: function(a, b, ia, ib, col) {
      var ct, hash, id, p, _i, _len, _ref, _ref1, _results;
      hash = (ia << 12 | ib) << 4;
      _ref = col.pts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], p = _ref1.p, id = _ref1.id;
        if (!(ct = this.cts[hash | id])) {
          ct = this.cts[hash | id] = Contact(a, b);
        }
        _results.push(ct.update(col.dist, col.n, p, this.t, id));
      }
      return _results;
    },
    find: function(v, v2) {
      var a, b, res, s, _i, _j, _len, _len1, _ref, _ref1;
      if (v2 == null) {
        v2 = v;
      }
      res = [];
      _ref = this.bodies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        b = _ref[_i];
        _ref1 = b.transform;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          s = _ref1[_j];
          a = s.bounds;
          if (v.x < a.p2.x && v.y < a.p2.y && a.p1.x < v2.x && a.p1.y < v2.y) {
            res.push(b);
            break;
          }
        }
      }
      return res;
    }
  };

  SpaceIndex = function() {
    return {
      start: null,
      __proto__: SpaceIndex.methods
    };
  };

  SpaceIndex.tag = 0;

  SpaceIndex.methods = {
    add: function(body, obj) {
      var ins;
      ins = {
        body: body,
        obj: obj,
        bounds: obj.bounds,
        prev: null,
        next: this.start,
        id: SpaceIndex.tag++
      };
      if (this.start) {
        this.start.prev = ins;
      }
      return this.start = ins;
    },
    scan: function(report) {
      var a, b, _results;
      a = this.start.next;
      while (a) {
        b = a.prev;
        if (b.bounds.p1.x > a.bounds.p1.x) {
          while (b.prev && b.bounds.p1.x > a.bounds.p1.x) {
            b = b.prev;
          }
          this.reinsert(a, b);
          if (!a.prev) {
            this.start = a;
          }
        }
        a = a.next;
      }
      a = this.start;
      _results = [];
      while (a) {
        b = a.next;
        while (b && a.bounds.p2.x > b.bounds.p1.x) {
          if (a.bounds.p1.y < b.bounds.p2.y && b.bounds.p1.y < a.bounds.p2.y) {
            report(a.body, a.obj, a.id, b.body, b.obj, b.id);
          }
          b = b.next;
        }
        _results.push(a = a.next);
      }
      return _results;
    },
    reinsert: function(i, at) {
      if (i.next) {
        i.next.prev = i.prev;
      }
      if (i.prev) {
        i.prev.next = i.next;
      }
      i.prev = at.prev;
      i.next = at;
      if (at.prev) {
        at.prev.next = i;
      } else {
        this.start = i;
      }
      return at.prev = i;
    }
  };

  exports = window || module.exports;

  exports.phys = {
    Vec: Vec,
    Axis: Axis,
    Circle: Circle,
    Poly: Poly,
    Box: Box,
    Body: Body,
    Space: Space
  };

}).call(this);