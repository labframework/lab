      var Cloner, Random, StrictMath, println, typeIsArray;

if (!Array.prototype.filter) {
  Array.prototype.filter = function(callback) {
    var element, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      element = this[_i];
      if (callback(element)) {
        _results.push(element);
      }
    }
    return _results;
  };
}

if (typeof println === "undefined" || println === null) {
  if (typeof console !== "undefined" && console !== null) {
    println = console.log;
  }
  if (println == null) {
    println = java.lang.System.out.println;
  }
}

typeIsArray = function(value) {
  return value && typeof value === 'object' && value instanceof Array && typeof value.length === 'number' && typeof value.splice === 'function' && !(value.propertyIsEnumerable('length'));
};

if (typeof Random === "undefined" || Random === null) {
  Random = {};
  Random.nextInt = function(limit) {
    return Math.floor(Math.random() * limit);
  };
  Random.nextLong = Random.nextInt;
  Random.nextDouble = function() {
    return Math.random();
  };
}

Cloner = {
  clone: function(obj) {
    var key, temp, _i, _len, _ref;
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    temp = new obj.constructor();
    _ref = Object.getOwnPropertyNames(obj);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      temp[key] = this.clone(obj[key]);
    }
    return temp;
  }
};

if (typeof StrictMath === "undefined" || StrictMath === null) {
  StrictMath = Cloner.clone(Math);
  StrictMath.toRadians = function(degrees) {
    return degrees * Math.PI / 180;
  };
}
;
var AgentSet, Agents, Dump, Globals, Iterator, Patch, PatchesOwn, Prims, Shufflerator, Torus, Trig, Turtle, TurtlesOwn, Updates, World, collectUpdates, died, patchBuiltins, turtleBuiltins, updated,
  __slice = [].slice;

turtleBuiltins = ["id", "color", "heading", "xcor", "ycor", "shape", "label", "labelcolor", "breed", "hidden", "size", "pensize", "penmode"];

patchBuiltins = ["pxcor", "pycor", "pcolor", "plabel", "plabelcolor"];

Updates = [];

collectUpdates = function() {
  var result;
  result = Updates.length === 0 ? [
    {
      turtles: {},
      patches: {}
    }
  ] : Updates;
  Updates = [];
  return result;
};

died = function(id) {
  var update;
  update = {
    patches: {},
    turtles: {}
  };
  update.turtles[id] = {
    WHO: -1
  };
  Updates.push(update);
};

updated = function() {
  var change, obj, oneUpdate, update, v, vars, _i, _len;
  obj = arguments[0], vars = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  change = {};
  for (_i = 0, _len = vars.length; _i < _len; _i++) {
    v = vars[_i];
    if (v === "plabelcolor") {
      change["PLABEL-COLOR"] = obj[v];
    } else if (v === "labelcolor") {
      change["LABEL-COLOR"] = obj[v];
    } else if (v === "pensize") {
      change["PEN-SIZE"] = obj[v];
    } else if (v === "penmode") {
      change["PEN-MODE"] = obj[v];
    } else if (v === "hidden") {
      change["HIDDEN?"] = obj[v];
    } else if (v === "id") {
      change["WHO"] = obj[v];
    } else {
      change[v.toUpperCase()] = obj[v];
    }
  }
  oneUpdate = {};
  oneUpdate[obj.id] = change;
  update = {};
  if (obj instanceof Turtle) {
    update.turtles = oneUpdate;
    update.patches = {};
  } else {
    update.turtles = {};
    update.patches = oneUpdate;
  }
  Updates.push(update);
};

Turtle = (function() {

  Turtle.prototype.vars = [];

  function Turtle(id, color, heading, xcor, ycor, shape, label, labelcolor, breed, hidden, size, pensize, penmode) {
    var x;
    this.id = id;
    this.color = color;
    this.heading = heading;
    this.xcor = xcor;
    this.ycor = ycor;
    this.shape = shape != null ? shape : "default";
    this.label = label != null ? label : "";
    this.labelcolor = labelcolor != null ? labelcolor : 9.9;
    this.breed = breed != null ? breed : "TURTLES";
    this.hidden = hidden != null ? hidden : false;
    this.size = size != null ? size : 1.0;
    this.pensize = pensize != null ? pensize : 1.0;
    this.penmode = penmode != null ? penmode : "up";
    updated.apply(null, [this].concat(__slice.call(turtleBuiltins)));
    this.vars = (function() {
      var _i, _len, _ref, _results;
      _ref = TurtlesOwn.vars;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        _results.push(x);
      }
      return _results;
    })();
  }

  Turtle.prototype.toString = function() {
    return "(turtle " + this.id + ")";
  };

  Turtle.prototype.keepHeadingInRange = function() {
    if (this.heading < 0 || this.heading >= 360) {
      this.heading = ((this.heading % 360) + 360) % 360;
    }
  };

  Turtle.prototype.patchAhead = function(amount) {
    var newX, newY;
    newX = world.topology().wrap(this.xcor + amount * Trig.sin(this.heading), world.minPxcor - 0.5, world.maxPxcor + 0.5);
    newY = world.topology().wrap(this.ycor + amount * Trig.cos(this.heading), world.minPycor - 0.5, world.maxPycor + 0.5);
    return world.getPatchAt(newX, newY);
  };

  Turtle.prototype.fd = function(amount) {
    this.xcor = world.topology().wrap(this.xcor + amount * Trig.sin(this.heading), world.minPxcor - 0.5, world.maxPxcor + 0.5);
    this.ycor = world.topology().wrap(this.ycor + amount * Trig.cos(this.heading), world.minPycor - 0.5, world.maxPycor + 0.5);
    updated(this, "xcor", "ycor");
  };

  Turtle.prototype.right = function(amount) {
    this.heading += amount;
    this.keepHeadingInRange();
    updated(this, "heading");
  };

  Turtle.prototype.setxy = function(x, y) {
    this.xcor = x;
    this.ycor = y;
    updated(this, "xcor", "ycor");
  };

  Turtle.prototype.die = function() {
    if (this.id !== -1) {
      world.removeTurtle(this.id);
      died(this.id);
      this.id = -1;
    }
  };

  Turtle.prototype.getTurtleVariable = function(n) {
    if (n < turtleBuiltins.length) {
      return this[turtleBuiltins[n]];
    } else {
      return this.vars[n - turtleBuiltins.length];
    }
  };

  Turtle.prototype.setTurtleVariable = function(n, v) {
    if (n < turtleBuiltins.length) {
      this[turtleBuiltins[n]] = v;
      if (n === 2) {
        this.keepHeadingInRange();
      }
      return updated(this, turtleBuiltins[n]);
    } else {
      return this.vars[n - turtleBuiltins.length] = v;
    }
  };

  Turtle.prototype.getPatchHere = function() {
    return world.getPatchAt(this.xcor, this.ycor);
  };

  Turtle.prototype.getPatchVariable = function(n) {
    return this.getPatchHere().getPatchVariable(n);
  };

  Turtle.prototype.setPatchVariable = function(n, v) {
    return this.getPatchHere().setPatchVariable(n, v);
  };

  Turtle.prototype.turtlesHere = function() {
    var p, t, _i, _len, _ref, _results;
    p = this.getPatchHere();
    _ref = world.turtles();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (t.getPatchHere() === p) {
        _results.push(t);
      }
    }
    return _results;
  };

  return Turtle;

})();

Patch = (function() {

  Patch.prototype.vars = [];

  function Patch(id, pxcor, pycor, pcolor, plabel, plabelcolor) {
    var x;
    this.id = id;
    this.pxcor = pxcor;
    this.pycor = pycor;
    this.pcolor = pcolor != null ? pcolor : 0.0;
    this.plabel = plabel != null ? plabel : "";
    this.plabelcolor = plabelcolor != null ? plabelcolor : 9.9;
    this.vars = (function() {
      var _i, _len, _ref, _results;
      _ref = PatchesOwn.vars;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        _results.push(x);
      }
      return _results;
    })();
  }

  Patch.prototype.toString = function() {
    return "(patch " + this.pxcor + " " + this.pycor + ")";
  };

  Patch.prototype.getPatchVariable = function(n) {
    if (n < patchBuiltins.length) {
      return this[patchBuiltins[n]];
    } else {
      return this.vars[n - patchBuiltins.length];
    }
  };

  Patch.prototype.setPatchVariable = function(n, v) {
    if (n < patchBuiltins.length) {
      this[patchBuiltins[n]] = v;
      if (patchBuiltins[n] === "pcolor" && v !== 0) {
        world.patchesAllBlack(false);
      }
      return updated(this, patchBuiltins[n]);
    } else {
      return this.vars[n - patchBuiltins.length] = v;
    }
  };

  Patch.prototype.getNeighbors = function() {
    return world.getNeighbors(this.pxcor, this.pycor);
  };

  Patch.prototype.sprout = function(n) {
    var num, _i, _results;
    _results = [];
    for (num = _i = 0; 0 <= n ? _i < n : _i > n; num = 0 <= n ? ++_i : --_i) {
      _results.push(world.createturtle(this.pxcor, this.pycor, 5 + 10 * Random.nextInt(14), Random.nextInt(360)));
    }
    return _results;
  };

  return Patch;

})();

World = (function() {
  var width, _nextId, _patches, _patchesAllBlack, _ticks, _topology, _turtles;

  _nextId = 0;

  _turtles = [];

  _patches = [];

  width = 0;

  _topology = null;

  _ticks = -1;

  _patchesAllBlack = true;

  function World(minPxcor, maxPxcor, minPycor, maxPycor) {
    this.minPxcor = minPxcor;
    this.maxPxcor = maxPxcor;
    this.minPycor = minPycor;
    this.maxPycor = maxPycor;
    collectUpdates();
    Updates.push({
      world: {
        0: {
          worldWidth: Math.abs(this.minPxcor - this.maxPxcor) + 1,
          worldHeight: Math.abs(this.minPycor - this.maxPycor) + 1,
          minPxcor: this.minPxcor,
          minPycor: this.minPycor,
          maxPxcor: this.maxPxcor,
          maxPycor: this.maxPycor,
          nbInterfaceGlobals: 0,
          linkBreeds: "XXX IMPLEMENT ME",
          linkShapeList: "XXX IMPLEMENT ME",
          patchSize: 12,
          patchesAllBlack: _patchesAllBlack,
          patchesWithLabels: 0,
          ticks: _ticks,
          turtleBreeds: "XXX IMPLEMENT ME",
          turtleShapeList: "XXX IMPLEMENT ME",
          unbreededLinksAreDirected: false,
          wrappingAllowedInX: true,
          wrappingAllowedInY: true
        }
      }
    });
    this.resize(this.minPxcor, this.maxPxcor, this.minPycor, this.maxPycor);
  }

  World.prototype.createPatches = function() {
    var nested, p, x, y, _i, _len, _ref, _results;
    nested = (function() {
      var _i, _ref, _ref1, _results;
      _results = [];
      for (y = _i = _ref = this.maxPycor, _ref1 = this.minPycor; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; y = _ref <= _ref1 ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref2, _ref3, _results1;
          _results1 = [];
          for (x = _j = _ref2 = this.minPxcor, _ref3 = this.maxPxcor; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; x = _ref2 <= _ref3 ? ++_j : --_j) {
            _results1.push(new Patch((width * (this.maxPycor - y)) + x - this.minPxcor, x, y));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }).call(this);
    _patches = (_ref = []).concat.apply(_ref, nested);
    _results = [];
    for (_i = 0, _len = _patches.length; _i < _len; _i++) {
      p = _patches[_i];
      _results.push(updated(p, "pxcor", "pycor", "pcolor", "plabel", "plabelcolor"));
    }
    return _results;
  };

  World.prototype.topology = function() {
    return _topology;
  };

  World.prototype.turtles = function() {
    return _turtles;
  };

  World.prototype.patches = function() {
    return _patches;
  };

  World.prototype.resetTicks = function() {
    _ticks = 0;
    return Updates.push({
      world: {
        0: {
          ticks: _ticks
        }
      }
    });
  };

  World.prototype.clearTicks = function() {
    _ticks = -1;
    return Updates.push({
      world: {
        0: {
          ticks: _ticks
        }
      }
    });
  };

  World.prototype.resize = function(minPxcor, maxPxcor, minPycor, maxPycor) {
    var t, _i, _len, _ref;
    if (minPxcor > 0 || maxPxcor < 0 || minPycor > 0 || maxPycor < 0) {
      throw new Error("You must include the point (0, 0) in the world");
    }
    this.minPxcor = minPxcor;
    this.maxPxcor = maxPxcor;
    this.minPycor = minPycor;
    this.maxPycor = maxPycor;
    width = (this.maxPxcor - this.minPxcor) + 1;
    _topology = new Torus(this.minPxcor, this.maxPxcor, this.minPycor, this.maxPycor);
    _ref = this.turtles();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      t.die();
    }
    this.createPatches();
    return Updates.push({
      world: {
        0: {
          worldWidth: Math.abs(this.minPxcor - this.maxPxcor) + 1,
          worldHeight: Math.abs(this.minPycor - this.maxPycor) + 1,
          minPxcor: this.minPxcor,
          minPycor: this.minPycor,
          maxPxcor: this.maxPxcor,
          maxPycor: this.maxPycor
        }
      }
    });
  };

  World.prototype.tick = function() {
    if (_ticks === -1) {
      throw new Error("Need to call reset-ticks");
    }
    _ticks++;
    return Updates.push({
      world: {
        0: {
          ticks: _ticks
        }
      }
    });
  };

  World.prototype.advancetick = function(n) {
    if (_ticks === -1) {
      throw new Error("Need to call reset-ticks");
    }
    if (n < 0) {
      throw new Error("Cannot advance ticks by a negative amount");
    }
    _ticks += n;
    return Updates.push({
      world: {
        0: {
          ticks: _ticks
        }
      }
    });
  };

  World.prototype.ticks = function() {
    if (_ticks === -1) {
      throw new Error("Need to call reset-ticks");
    }
    Updates.push({
      world: {
        0: {
          ticks: _ticks
        }
      }
    });
    return _ticks;
  };

  World.prototype.getPatchAt = function(x, y) {
    var index;
    index = (this.maxPycor - StrictMath.round(y)) * width + (StrictMath.round(x) - this.minPxcor);
    return _patches[index];
  };

  World.prototype.removeTurtle = function(id) {
    _turtles = this.turtles().filter(function(t) {
      return t.id !== id;
    });
  };

  World.prototype.patchesAllBlack = function(val) {
    _patchesAllBlack = val;
    return Updates.push({
      world: {
        0: {
          patchesAllBlack: _patchesAllBlack
        }
      }
    });
  };

  World.prototype.clearall = function() {
    var t, _i, _len, _ref;
    Globals.init(Globals.vars.length);
    _ref = this.turtles();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      t.die();
    }
    this.createPatches();
    _nextId = 0;
    this.patchesAllBlack(true);
    this.clearTicks();
  };

  World.prototype.createturtle = function(x, y, color, heading) {
    var t;
    t = new Turtle(_nextId++, color, heading, x, y);
    _turtles.push(t);
    return t;
  };

  World.prototype.createorderedturtles = function(n) {
    var num, _i, _results;
    _results = [];
    for (num = _i = 0; 0 <= n ? _i < n : _i > n; num = 0 <= n ? ++_i : --_i) {
      _results.push(this.createturtle(0, 0, (num * 10 + 5) % 140, num * (360 / n)));
    }
    return _results;
  };

  World.prototype.createturtles = function(n) {
    var num, _i, _results;
    _results = [];
    for (num = _i = 0; 0 <= n ? _i < n : _i > n; num = 0 <= n ? ++_i : --_i) {
      _results.push(this.createturtle(0, 0, 5 + 10 * Random.nextInt(14), Random.nextInt(360)));
    }
    return _results;
  };

  World.prototype.getNeighbors = function(pxcor, pycor) {
    return this.topology().getNeighbors(pxcor, pycor);
  };

  return World;

})();

Agents = (function() {

  function Agents() {}

  Agents.prototype.count = function(x) {
    return x.length;
  };

  Agents.prototype.any = function(x) {
    return x.length > 0;
  };

  Agents.prototype._self = 0;

  Agents.prototype.self = function() {
    return this._self;
  };

  Agents.prototype.askAgent = function(a, f) {
    var oldAgent, res;
    oldAgent = this._self;
    this._self = a;
    res = f();
    this._self = oldAgent;
    return res;
  };

  Agents.prototype.ask = function(agentsOrAgent, shuffle, f) {
    var a, agents, iter;
    agents = agentsOrAgent;
    if (!(typeIsArray(agentsOrAgent))) {
      agents = [agentsOrAgent];
    }
    iter = shuffle ? new Shufflerator(agents) : new Iterator(agents);
    while (iter.hasNext()) {
      a = iter.next();
      this.askAgent(a, f);
    }
  };

  Agents.prototype.agentFilter = function(agents, f) {
    var a, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = agents.length; _i < _len; _i++) {
      a = agents[_i];
      if (this.askAgent(a, f)) {
        _results.push(a);
      }
    }
    return _results;
  };

  Agents.prototype.of = function(agents, f) {
    var a, islist, iter, result;
    islist = agents.slice;
    if (!islist) {
      agents = [agents];
    }
    result = [];
    iter = new Shufflerator(agents);
    while (iter.hasNext()) {
      a = iter.next();
      result.push(this.askAgent(a, f));
    }
    if (islist) {
      return result;
    } else {
      return result[0];
    }
  };

  Agents.prototype.oneOf = function(agents) {
    return agents[Random.nextInt(agents.length)];
  };

  Agents.prototype.die = function() {
    return this._self.die();
  };

  Agents.prototype.getTurtleVariable = function(n) {
    return this._self.getTurtleVariable(n);
  };

  Agents.prototype.setTurtleVariable = function(n, v) {
    return this._self.setTurtleVariable(n, v);
  };

  Agents.prototype.getPatchVariable = function(n) {
    return this._self.getPatchVariable(n);
  };

  Agents.prototype.setPatchVariable = function(n, v) {
    return this._self.setPatchVariable(n, v);
  };

  return Agents;

})();

Iterator = (function() {

  function Iterator(agents) {
    this.agents = agents;
  }

  Iterator.prototype.i = 0;

  Iterator.prototype.hasNext = function() {
    return this.i < this.agents.length;
  };

  Iterator.prototype.next = function() {
    var result;
    result = this.agents[this.i];
    this.i = this.i + 1;
    return result;
  };

  return Iterator;

})();

Shufflerator = (function() {

  function Shufflerator(agents) {
    this.agents = agents;
    this.agents = this.agents.slice(0);
    this.fetch();
  }

  Shufflerator.prototype.i = 0;

  Shufflerator.prototype.nextOne = null;

  Shufflerator.prototype.hasNext = function() {
    return this.nextOne !== null;
  };

  Shufflerator.prototype.next = function() {
    var result;
    result = this.nextOne;
    this.fetch();
    return result;
  };

  Shufflerator.prototype.fetch = function() {
    var r;
    if (this.i >= this.agents.length) {
      this.nextOne = null;
    } else {
      if (this.i < this.agents.length - 1) {
        r = this.i + Random.nextInt(this.agents.length - this.i);
        this.nextOne = this.agents[r];
        this.agents[r] = this.agents[this.i];
      } else {
        this.nextOne = this.agents[this.i];
      }
      this.i = this.i + 1;
    }
  };

  return Shufflerator;

})();

Prims = {
  fd: function(n) {
    return AgentSet.self().fd(n);
  },
  bk: function(n) {
    return AgentSet.self().fd(-n);
  },
  right: function(n) {
    return AgentSet.self().right(n);
  },
  left: function(n) {
    return AgentSet.self().right(-n);
  },
  setxy: function(x, y) {
    return AgentSet.self().setxy(x, y);
  },
  getNeighbors: function() {
    return AgentSet.self().getNeighbors();
  },
  sprout: function(n) {
    return AgentSet.self().sprout(n);
  },
  patch: function(x, y) {
    return world.getPatchAt(x, y);
  },
  randomxcor: function() {
    return world.minPxcor - 0.5 + Random.nextDouble() * (world.maxPxcor - world.minPxcor + 1);
  },
  randomycor: function() {
    return world.minPycor - 0.5 + Random.nextDouble() * (world.maxPycor - world.minPycor + 1);
  },
  shadeOf: function(c1, c2) {
    return Math.floor(c1 / 10) === Math.floor(c2 / 10);
  },
  scaleColor: function(color, number, min, max) {
    var perc, tempmax, tempval;
    color = Math.floor(color / 10) * 10;
    perc = 0.0;
    if (min > max) {
      if (number < max) {
        perc = 1.0;
      } else if (number > min) {
        perc = 0.0;
      } else {
        tempval = min - number;
        tempmax = min - max;
        perc = tempval / tempmax;
      }
    } else {
      if (number > max) {
        perc = 1.0;
      } else if (number < min) {
        perc = 0.0;
      } else {
        tempval = number - min;
        tempmax = max - min;
        perc = tempval / tempmax;
      }
    }
    perc *= 10;
    if (perc >= 9.9999) {
      perc = 9.9999;
    }
    if (perc < 0) {
      perc = 0;
    }
    return color + perc;
  },
  randomfloat: function(n) {
    return n * Random.nextDouble();
  },
  list: function() {
    var xs;
    xs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return xs;
  },
  max: function(xs) {
    return Math.max.apply(Math, xs);
  },
  min: function(xs) {
    return Math.min.apply(Math, xs);
  },
  sum: function(xs) {
    return xs.reduce(function(a, b) {
      return a + b;
    });
  },
  sort: function(xs) {
    return xs.sort();
  },
  removeDuplicates: function(xs) {
    var key, result, value, _i, _ref, _results;
    result = {};
    for (key = _i = 0, _ref = xs.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
      result[xs[key]] = xs[key];
    }
    _results = [];
    for (key in result) {
      value = result[key];
      _results.push(value);
    }
    return _results;
  },
  outputprint: function(x) {
    return println(Dump(x));
  }
};

Globals = {
  vars: [],
  init: function(n) {
    var x;
    return this.vars = (function() {
      var _i, _results;
      _results = [];
      for (x = _i = 0; 0 <= n ? _i < n : _i > n; x = 0 <= n ? ++_i : --_i) {
        _results.push(0);
      }
      return _results;
    })();
  },
  getGlobal: function(n) {
    return this.vars[n];
  },
  setGlobal: function(n, v) {
    return this.vars[n] = v;
  }
};

TurtlesOwn = {
  vars: [],
  init: function(n) {
    var x;
    return this.vars = (function() {
      var _i, _ref, _results;
      _results = [];
      for (x = _i = 0, _ref = n - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        _results.push(0);
      }
      return _results;
    })();
  }
};

PatchesOwn = {
  vars: [],
  init: function(n) {
    var x;
    return this.vars = (function() {
      var _i, _ref, _results;
      _results = [];
      for (x = _i = 0, _ref = n - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        _results.push(0);
      }
      return _results;
    })();
  }
};

AgentSet = new Agents;

Dump = function(x) {
  var x2;
  if (typeIsArray(x)) {
    return "[" + ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = x.length; _i < _len; _i++) {
        x2 = x[_i];
        _results.push(Dump(x2));
      }
      return _results;
    })()).join(" ") + "]";
  } else {
    return "" + x;
  }
};

Trig = {
  squash: function(x) {
    if (StrictMath.abs(x) < 3.2e-15) {
      return 0;
    } else {
      return x;
    }
  },
  sin: function(degrees) {
    return this.squash(StrictMath.sin(StrictMath.toRadians(degrees)));
  },
  cos: function(degrees) {
    return this.squash(StrictMath.cos(StrictMath.toRadians(degrees)));
  },
  unsquashedSin: function(degrees) {
    return StrictMath.sin(StrictMath.toRadians(degrees));
  },
  unsquashedCos: function(degrees) {
    return StrictMath.cos(StrictMath.toRadians(degrees));
  }
};

Torus = (function() {

  function Torus(minPxcor, maxPxcor, minPycor, maxPycor) {
    this.minPxcor = minPxcor;
    this.maxPxcor = maxPxcor;
    this.minPycor = minPycor;
    this.maxPycor = maxPycor;
  }

  Torus.prototype.wrap = function(pos, min, max) {
    var result;
    if (pos >= max) {
      return min + ((pos - max) % (max - min));
    } else if (pos < min) {
      result = max - ((min - pos) % (max - min));
      if (result < max) {
        return result;
      } else {
        return min;
      }
    } else {
      return pos;
    }
  };

  Torus.prototype.getNeighbors = function(pxcor, pycor) {
    if (pxcor === this.maxPxcor && pxcor === this.minPxcor) {
      if ((pycor === this.maxPycor && pycor === this.minPycor)([])) {

      } else {
        return [this.getPatchNorth(pxcor, pycor), this.getPatchSouth(pxcor, pycor)];
      }
    } else if (pycor === this.maxPycor && pycor === this.minPycor) {
      return [this.getPatchEast(pxcor, pycor), this.getPatchWest(pxcor, pycor)];
    } else {
      return [this.getPatchNorth(pxcor, pycor), this.getPatchEast(pxcor, pycor), this.getPatchSouth(pxcor, pycor), this.getPatchWest(pxcor, pycor), this.getPatchNorthEast(pxcor, pycor), this.getPatchSouthEast(pxcor, pycor), this.getPatchSouthWest(pxcor, pycor), this.getPatchNorthWest(pxcor, pycor)];
    }
  };

  Torus.prototype.getPatchNorth = function(pxcor, pycor) {
    if (pycor === this.maxPycor) {
      return world.getPatchAt(pxcor, this.minPycor);
    } else {
      return world.getPatchAt(pxcor, pycor + 1);
    }
  };

  Torus.prototype.getPatchSouth = function(pxcor, pycor) {
    if (pycor === this.minPycor) {
      return world.getPatchAt(pxcor, this.maxPycor);
    } else {
      return world.getPatchAt(pxcor, pycor - 1);
    }
  };

  Torus.prototype.getPatchEast = function(pxcor, pycor) {
    if (pxcor === this.maxPxcor) {
      return world.getPatchAt(this.minPxcor, pycor);
    } else {
      return world.getPatchAt(pxcor + 1, pycor);
    }
  };

  Torus.prototype.getPatchWest = function(pxcor, pycor) {
    if (pxcor === this.minPxcor) {
      return world.getPatchAt(this.maxPxcor, pycor);
    } else {
      return world.getPatchAt(pxcor - 1, pycor);
    }
  };

  Torus.prototype.getPatchNorthWest = function(pxcor, pycor) {
    if (pycor === this.maxPycor) {
      if (pxcor === this.minPxcor) {
        return world.getPatchAt(this.maxPxcor, this.minPycor);
      } else {
        return world.getPatchAt(pxcor - 1, this.minPycor);
      }
    } else if (pxcor === this.minPxcor) {
      return world.getPatchAt(this.maxPxcor, pycor + 1);
    } else {
      return world.getPatchAt(pxcor - 1, pycor + 1);
    }
  };

  Torus.prototype.getPatchSouthWest = function(pxcor, pycor) {
    if (pycor === this.minPycor) {
      if (pxcor === this.minPxcor) {
        return world.getPatchAt(this.maxPxcor, this.maxPycor);
      } else {
        return world.getPatchAt(pxcor - 1, this.maxPycor);
      }
    } else if (pxcor === this.minPxcor) {
      return world.getPatchAt(this.maxPxcor, pycor - 1);
    } else {
      return world.getPatchAt(pxcor - 1, pycor - 1);
    }
  };

  Torus.prototype.getPatchSouthEast = function(pxcor, pycor) {
    if (pycor === this.minPycor) {
      if (pxcor === this.maxPxcor) {
        return world.getPatchAt(this.minPxcor, this.maxPycor);
      } else {
        return world.getPatchAt(pxcor + 1, this.maxPycor);
      }
    } else if (pxcor === this.maxPxcor) {
      return world.getPatchAt(this.minPxcor, pycor - 1);
    } else {
      return world.getPatchAt(pxcor + 1, pycor - 1);
    }
  };

  Torus.prototype.getPatchNorthEast = function(pxcor, pycor) {
    if (pycor === this.maxPycor) {
      if (pxcor === this.maxPxcor) {
        return world.getPatchAt(this.minPxcor, this.minPycor);
      } else {
        return world.getPatchAt(pxcor + 1, this.minPycor);
      }
    } else if (pxcor === this.maxPxcor) {
      return world.getPatchAt(this.minPxcor, pycor + 1);
    } else {
      return world.getPatchAt(pxcor + 1, pycor + 1);
    }
  };

  return Torus;

})();
;
(function() {

  window.AgentModel = (function() {
    var mergeObjectInto;

    function AgentModel() {
      this.turtles = {};
      this.patches = {};
      this.links = {};
      this.observer = {};
      this.world = {};
    }

    AgentModel.prototype.update = function(modelUpdate) {
      var anyUpdates, l, linkId, p, patchId, t, turtleId, varUpdates, worldUpdate, _ref, _ref1, _ref2;
      anyUpdates = false;
      _ref = modelUpdate.turtles;
      for (turtleId in _ref) {
        varUpdates = _ref[turtleId];
        anyUpdates = true;
        if (varUpdates === null || varUpdates['WHO'] === -1) {
          delete this.turtles[turtleId];
        } else {
          t = this.turtles[turtleId];
          if (!(t != null)) {
            t = this.turtles[turtleId] = {
              heading: 360 * Math.random(),
              xcor: 0,
              ycor: 0,
              shape: 'default',
              color: 'hsl(' + (360 * Math.random()) + ',100%,50%)'
            };
          }
          mergeObjectInto(varUpdates, t);
        }
      }
      _ref1 = modelUpdate.links;
      for (linkId in _ref1) {
        varUpdates = _ref1[linkId];
        anyUpdates = true;
        if (varUpdates === null) {
          delete this.links[linkId];
        } else {
          l = this.links[linkId];
          if (!(l != null)) {
            l = this.links[linkId] = {
              shape: 'default',
              color: 5
            };
          }
          mergeObjectInto(varUpdates, l);
        }
      }
      if ((modelUpdate.world != null) && (modelUpdate.world[0] != null)) {
        worldUpdate = modelUpdate.world[0];
        mergeObjectInto(modelUpdate.world[0], this.world);
        if ((worldUpdate.worldWidth != null) && (worldUpdate.worldHeight != null)) {
          this.patches = {};
        }
      }
      _ref2 = modelUpdate.patches;
      for (patchId in _ref2) {
        varUpdates = _ref2[patchId];
        anyUpdates = true;
        p = this.patches[patchId];
        if (p == null) {
          p = this.patches[patchId] = {};
        }
        mergeObjectInto(varUpdates, p);
      }
      mergeObjectInto(modelUpdate.observer, this.observer);
      return anyUpdates;
    };

    mergeObjectInto = function(updatedObject, targetObject) {
      var value, variable;
      for (variable in updatedObject) {
        value = updatedObject[variable];
        targetObject[variable.toLowerCase()] = value;
      }
    };

    return AgentModel;

  })();

}).call(this);
;
(function() {
  var b, baseIndex, cachedNetlogoColors, colorArrayToCSS, colorTimesTen, g, netlogoBaseColors, r, step;

  window.netlogoColorToCSS = function(netlogoColor) {
    switch (typeof netlogoColor) {
      case "number":
        return cachedNetlogoColors[Math.floor(netlogoColor * 10)];
      case "object":
        return colorArrayToCSS(netlogoColor);
      case "string":
        return netlogoColor;
      default:
        return console.error("Unrecognized color: " + netlogoColor);
    }
  };

  netlogoBaseColors = [[140, 140, 140], [215, 48, 39], [241, 105, 19], [156, 109, 70], [237, 237, 47], [87, 176, 58], [42, 209, 57], [27, 158, 119], [82, 196, 196], [43, 140, 190], [50, 92, 168], [123, 78, 163], [166, 25, 105], [224, 126, 149], [0, 0, 0], [255, 255, 255]];

  cachedNetlogoColors = (function() {
    var _i, _ref, _results;
    _results = [];
    for (colorTimesTen = _i = 0; _i <= 1400; colorTimesTen = ++_i) {
      baseIndex = Math.floor(colorTimesTen / 100);
      _ref = netlogoBaseColors[baseIndex], r = _ref[0], g = _ref[1], b = _ref[2];
      step = (colorTimesTen % 100 - 50) / 50.48 + 0.012;
      if (step < 0) {
        r += Math.floor(r * step);
        g += Math.floor(g * step);
        b += Math.floor(b * step);
      } else {
        r += Math.floor((0xFF - r) * step);
        g += Math.floor((0xFF - g) * step);
        b += Math.floor((0xFF - b) * step);
      }
      _results.push("rgb(" + r + ", " + g + ", " + b + ")");
    }
    return _results;
  })();

  colorArrayToCSS = function(array) {
    var a;
    r = array[0], g = array[1], b = array[2];
    a = array.length > 3 ? array[3] : 255;
    if (a < 255) {
      return "rgba(" + r + ", " + g + ", " + b + ", " + (a / 255) + ")";
    } else {
      return "rgb(" + r + ", " + g + ", " + b + ")";
    }
  };

}).call(this);
;
(function() {
  var drawPath, setColoring,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ShapeDrawer = (function() {

    function ShapeDrawer(shapes) {
      this.shapes = shapes;
    }

    ShapeDrawer.prototype.drawShape = function(ctx, turtleColor, shapeName) {
      ctx.translate(.5, -.5);
      ctx.scale(-1 / 300, 1 / 300);
      this.drawRawShape(ctx, turtleColor, shapeName);
    };

    ShapeDrawer.prototype.drawRawShape = function(ctx, turtleColor, shapeName) {
      var elem, shape, _i, _len, _ref;
      shape = this.shapes[shapeName] || defaultShape;
      _ref = shape.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        draw[elem.type](ctx, turtleColor, elem);
      }
    };

    return ShapeDrawer;

  })();

  window.CachingShapeDrawer = (function(_super) {

    __extends(CachingShapeDrawer, _super);

    function CachingShapeDrawer(shapes) {
      CachingShapeDrawer.__super__.constructor.call(this, shapes);
      this.shapeCache = {};
    }

    CachingShapeDrawer.prototype.drawShape = function(ctx, turtleColor, shapeName) {
      var shapeCanvas, shapeCtx;
      shapeName = shapeName.toLowerCase();
      shapeCanvas = this.shapeCache[[shapeName, turtleColor]];
      if (!(shapeCanvas != null)) {
        shapeCanvas = document.createElement('canvas');
        shapeCanvas.width = shapeCanvas.height = 300;
        shapeCtx = shapeCanvas.getContext('2d');
        this.drawRawShape(shapeCtx, turtleColor, shapeName);
        this.shapeCache[[shapeName, turtleColor]] = shapeCanvas;
      }
      ctx.translate(.5, -.5);
      ctx.scale(-1 / 300, 1 / 300);
      ctx.drawImage(shapeCanvas, 0, 0);
    };

    return CachingShapeDrawer;

  })(ShapeDrawer);

  setColoring = function(ctx, turtleColor, element) {
    turtleColor = netlogoColorToCSS(turtleColor);
    if (element.filled) {
      if (element.marked) {
        ctx.fillStyle = turtleColor;
      } else {
        ctx.fillStyle = element.color;
      }
    } else {
      if (element.marked) {
        ctx.strokeStyle = turtleColor;
      } else {
        ctx.strokeStyle = element.color;
      }
    }
  };

  drawPath = function(ctx, turtleColor, element) {
    setColoring(ctx, turtleColor, element);
    if (element.filled) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };

  window.draw = {
    circle: function(ctx, turtleColor, circle) {
      var r;
      r = circle.diam / 2;
      ctx.beginPath();
      ctx.arc(circle.x + r, circle.y + r, r, 0, 2 * Math.PI, false);
      ctx.closePath();
      drawPath(ctx, turtleColor, circle);
    },
    polygon: function(ctx, turtleColor, polygon) {
      var i, x, xcors, y, ycors, _i, _len, _ref;
      xcors = polygon.xcors;
      ycors = polygon.ycors;
      ctx.beginPath();
      ctx.moveTo(xcors[0], ycors[0]);
      _ref = xcors.slice(1);
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        x = _ref[i];
        y = ycors[i + 1];
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      drawPath(ctx, turtleColor, polygon);
    },
    rectangle: function(ctx, turtleColor, rectangle) {
      var h, w, x, y;
      x = rectangle.xmin;
      y = rectangle.ymin;
      w = rectangle.xmax - x;
      h = rectangle.ymax - y;
      setColoring(ctx, turtleColor, rectangle);
      if (rectangle.filled) {
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.strokeRect(x, y, w, h);
      }
    },
    line: function(ctx, turtleColor, line) {
      var h, w, x, y;
      x = line.x1;
      y = line.y1;
      w = line.x2 - line.x1;
      h = line.y2 - line.y1;
      setColoring(ctx, turtleColor, line);
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
      ctx.lineWidth = .1;
    }
  };

  window.defaultShape = {
    rotate: true,
    elements: [
      {
        type: 'polygon',
        color: 'grey',
        filled: 'true',
        marked: 'true',
        xcors: [150, 40, 150, 260],
        ycors: [5, 250, 205, 250]
      }
    ]
  };

}).call(this);
;
defaultShapes = {
  "default": {
    "rotate": true,
    "elements": [
      {
        "xcors": [
          150,
          40,
          150,
          260
        ],
        "ycors": [
          5,
          250,
          205,
          250
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "airplane": {
    "rotate": true,
    "elements": [
      {
        "xcors": [
          150,
          135,
          120,
          120,
          15,
          15,
          120,
          135,
          105,
          120,
          150,
          180,
          210,
          165,
          180,
          285,
          285,
          180,
          180,
          165
        ],
        "ycors": [
          0,
          15,
          60,
          105,
          165,
          195,
          180,
          240,
          270,
          285,
          270,
          285,
          270,
          240,
          180,
          195,
          165,
          105,
          60,
          15
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "arrow": {
    "rotate": true,
    "elements": [
      {
        "xcors": [
          150,
          0,
          105,
          105,
          195,
          195,
          300
        ],
        "ycors": [
          0,
          150,
          150,
          293,
          293,
          150,
          150
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "box": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          150,
          285,
          285,
          150
        ],
        "ycors": [
          285,
          225,
          75,
          135
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          150,
          15,
          150,
          285
        ],
        "ycors": [
          135,
          75,
          15,
          75
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          15,
          15,
          150,
          150
        ],
        "ycors": [
          75,
          225,
          285,
          135
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x1": 150,
        "y1": 285,
        "x2": 150,
        "y2": 135,
        "type": "line",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x1": 150,
        "y1": 135,
        "x2": 15,
        "y2": 75,
        "type": "line",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x1": 150,
        "y1": 135,
        "x2": 285,
        "y2": 75,
        "type": "line",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      }
    ]
  },
  "bug": {
    "rotate": true,
    "elements": [
      {
        "x": 96,
        "y": 182,
        "diam": 108,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 110,
        "y": 127,
        "diam": 80,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 110,
        "y": 75,
        "diam": 80,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x1": 150,
        "y1": 100,
        "x2": 80,
        "y2": 30,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 150,
        "y1": 100,
        "x2": 220,
        "y2": 30,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "butterfly": {
    "rotate": true,
    "elements": [
      {
        "xcors": [
          150,
          209,
          225,
          225,
          195,
          165,
          150
        ],
        "ycors": [
          165,
          199,
          225,
          255,
          270,
          255,
          240
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          150,
          89,
          75,
          75,
          105,
          135,
          150
        ],
        "ycors": [
          165,
          198,
          225,
          255,
          270,
          255,
          240
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          139,
          100,
          55,
          25,
          10,
          10,
          25,
          40,
          85,
          139
        ],
        "ycors": [
          148,
          105,
          90,
          90,
          105,
          135,
          180,
          195,
          194,
          163
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          162,
          200,
          245,
          275,
          290,
          290,
          275,
          260,
          215,
          162
        ],
        "ycors": [
          150,
          105,
          90,
          90,
          105,
          135,
          180,
          195,
          195,
          165
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          150,
          135,
          120,
          135,
          150,
          165,
          180,
          165
        ],
        "ycors": [
          255,
          225,
          150,
          120,
          105,
          120,
          150,
          225
        ],
        "type": "polygon",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 135,
        "y": 90,
        "diam": 30,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x1": 150,
        "y1": 105,
        "x2": 195,
        "y2": 60,
        "type": "line",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x1": 150,
        "y1": 105,
        "x2": 105,
        "y2": 60,
        "type": "line",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      }
    ]
  },
  "car": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          300,
          279,
          261,
          240,
          226,
          213,
          203,
          185,
          159,
          135,
          75,
          0,
          0,
          0,
          300,
          300
        ],
        "ycors": [
          180,
          164,
          144,
          135,
          132,
          106,
          84,
          63,
          50,
          50,
          60,
          150,
          165,
          225,
          225,
          180
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 180,
        "y": 180,
        "diam": 90,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 30,
        "y": 180,
        "diam": 90,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          162,
          132,
          134,
          209,
          194,
          189,
          180
        ],
        "ycors": [
          80,
          78,
          135,
          135,
          105,
          96,
          89
        ],
        "type": "polygon",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 47,
        "y": 195,
        "diam": 58,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 195,
        "y": 195,
        "diam": 58,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "circle": {
    "rotate": false,
    "elements": [
      {
        "x": 0,
        "y": 0,
        "diam": 300,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "circle 2": {
    "rotate": false,
    "elements": [
      {
        "x": 0,
        "y": 0,
        "diam": 300,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 30,
        "y": 30,
        "diam": 240,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "cloud": {
    "rotate": false,
    "elements": [
      {
        "x": 13,
        "y": 118,
        "diam": 94,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 86,
        "y": 101,
        "diam": 127,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 51,
        "y": 51,
        "diam": 108,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 118,
        "y": 43,
        "diam": 95,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 158,
        "y": 68,
        "diam": 134,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "co2-molecule": {
    "rotate": true,
    "elements": [
      {
        "x": 183,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 183,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x": 75,
        "y": 75,
        "diam": 150,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 75,
        "y": 75,
        "diam": 150,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x": 33,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 33,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      }
    ]
  },
  "cow": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          200,
          197,
          179,
          177,
          166,
          140,
          93,
          78,
          72,
          49,
          48,
          37,
          25,
          25,
          45,
          103,
          179,
          198,
          252,
          272,
          293,
          285,
          255,
          242,
          224
        ],
        "ycors": [
          193,
          249,
          249,
          196,
          187,
          189,
          191,
          179,
          211,
          209,
          181,
          149,
          120,
          89,
          72,
          84,
          75,
          76,
          64,
          81,
          103,
          121,
          121,
          118,
          167
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          73,
          86,
          62,
          48
        ],
        "ycors": [
          210,
          251,
          249,
          208
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          25,
          16,
          9,
          23,
          25,
          39
        ],
        "ycors": [
          114,
          195,
          204,
          213,
          200,
          123
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "cylinder": {
    "rotate": false,
    "elements": [
      {
        "x": 0,
        "y": 0,
        "diam": 300,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "dot": {
    "rotate": false,
    "elements": [
      {
        "x": 90,
        "y": 90,
        "diam": 120,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "face happy": {
    "rotate": false,
    "elements": [
      {
        "x": 8,
        "y": 8,
        "diam": 285,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 60,
        "y": 75,
        "diam": 60,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 180,
        "y": 75,
        "diam": 60,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          150,
          90,
          62,
          47,
          67,
          90,
          109,
          150,
          192,
          210,
          227,
          251,
          236,
          212
        ],
        "ycors": [
          255,
          239,
          213,
          191,
          179,
          203,
          218,
          225,
          218,
          203,
          181,
          194,
          217,
          240
        ],
        "type": "polygon",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "face neutral": {
    "rotate": false,
    "elements": [
      {
        "x": 8,
        "y": 7,
        "diam": 285,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 60,
        "y": 75,
        "diam": 60,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 180,
        "y": 75,
        "diam": 60,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xmin": 60,
        "ymin": 195,
        "xmax": 240,
        "ymax": 225,
        "type": "rectangle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "face sad": {
    "rotate": false,
    "elements": [
      {
        "x": 8,
        "y": 8,
        "diam": 285,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 60,
        "y": 75,
        "diam": 60,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 180,
        "y": 75,
        "diam": 60,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          150,
          90,
          62,
          47,
          67,
          90,
          109,
          150,
          192,
          210,
          227,
          251,
          236,
          212
        ],
        "ycors": [
          168,
          184,
          210,
          232,
          244,
          220,
          205,
          198,
          205,
          220,
          242,
          229,
          206,
          183
        ],
        "type": "polygon",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "fish": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          44,
          21,
          15,
          0,
          15,
          0,
          13,
          20,
          45
        ],
        "ycors": [
          131,
          87,
          86,
          120,
          150,
          180,
          214,
          212,
          166
        ],
        "type": "polygon",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          135,
          119,
          95,
          76,
          46,
          60
        ],
        "ycors": [
          195,
          235,
          218,
          210,
          204,
          165
        ],
        "type": "polygon",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          75,
          83,
          71,
          86,
          166,
          135
        ],
        "ycors": [
          45,
          77,
          103,
          114,
          78,
          60
        ],
        "type": "polygon",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          30,
          151,
          226,
          280,
          292,
          292,
          287,
          270,
          195,
          151,
          30
        ],
        "ycors": [
          136,
          77,
          81,
          119,
          146,
          160,
          170,
          195,
          210,
          212,
          166
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 215,
        "y": 106,
        "diam": 30,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "flag": {
    "rotate": false,
    "elements": [
      {
        "xmin": 60,
        "ymin": 15,
        "xmax": 75,
        "ymax": 300,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          90,
          270,
          90
        ],
        "ycors": [
          150,
          90,
          30
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x1": 75,
        "y1": 135,
        "x2": 90,
        "y2": 135,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 75,
        "y1": 45,
        "x2": 90,
        "y2": 45,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "flower": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          135,
          165,
          180,
          180,
          150,
          165,
          195,
          195,
          165
        ],
        "ycors": [
          120,
          165,
          210,
          240,
          300,
          300,
          240,
          195,
          135
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 85,
        "y": 132,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 130,
        "y": 147,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 192,
        "y": 85,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 85,
        "y": 40,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 177,
        "y": 40,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 177,
        "y": 132,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 70,
        "y": 85,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 130,
        "y": 25,
        "diam": 38,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 96,
        "y": 51,
        "diam": 108,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 113,
        "y": 68,
        "diam": 74,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          189,
          219,
          249,
          279,
          234
        ],
        "ycors": [
          233,
          188,
          173,
          188,
          218
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          180,
          150,
          105,
          75,
          135
        ],
        "ycors": [
          255,
          210,
          210,
          240,
          240
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "house": {
    "rotate": false,
    "elements": [
      {
        "xmin": 45,
        "ymin": 120,
        "xmax": 255,
        "ymax": 285,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xmin": 120,
        "ymin": 210,
        "xmax": 180,
        "ymax": 285,
        "type": "rectangle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          15,
          150,
          285
        ],
        "ycors": [
          120,
          15,
          120
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x1": 30,
        "y1": 120,
        "x2": 270,
        "y2": 120,
        "type": "line",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      }
    ]
  },
  "leaf": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          150,
          135,
          120,
          60,
          30,
          60,
          60,
          15,
          30,
          15,
          40,
          45,
          60,
          90,
          105,
          120,
          105,
          120,
          135,
          150,
          165,
          180,
          195,
          180,
          195,
          210,
          240,
          255,
          263,
          285,
          270,
          285,
          240,
          240,
          270,
          240,
          180,
          165
        ],
        "ycors": [
          210,
          195,
          210,
          210,
          195,
          180,
          165,
          135,
          120,
          105,
          104,
          90,
          90,
          105,
          120,
          120,
          60,
          60,
          30,
          15,
          30,
          60,
          60,
          120,
          120,
          105,
          90,
          90,
          104,
          105,
          120,
          135,
          165,
          180,
          195,
          210,
          210,
          195
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          135,
          135,
          120,
          105,
          105,
          135,
          165,
          165
        ],
        "ycors": [
          195,
          240,
          255,
          255,
          285,
          285,
          240,
          195
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "line": {
    "rotate": true,
    "elements": [
      {
        "x1": 150,
        "y1": 0,
        "x2": 150,
        "y2": 300,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "line half": {
    "rotate": true,
    "elements": [
      {
        "x1": 150,
        "y1": 0,
        "x2": 150,
        "y2": 150,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "molecule water": {
    "rotate": true,
    "elements": [
      {
        "x": 183,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 183,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x": 75,
        "y": 75,
        "diam": 150,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 75,
        "y": 75,
        "diam": 150,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      },
      {
        "x": 33,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 33,
        "y": 63,
        "diam": 84,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": false,
        "marked": false
      }
    ]
  },
  "pentagon": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          150,
          15,
          60,
          240,
          285
        ],
        "ycors": [
          15,
          120,
          285,
          285,
          120
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "person": {
    "rotate": false,
    "elements": [
      {
        "x": 110,
        "y": 5,
        "diam": 80,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          105,
          120,
          90,
          105,
          135,
          150,
          165,
          195,
          210,
          180,
          195
        ],
        "ycors": [
          90,
          195,
          285,
          300,
          300,
          225,
          300,
          300,
          285,
          195,
          90
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xmin": 127,
        "ymin": 79,
        "xmax": 172,
        "ymax": 94,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          195,
          240,
          225,
          165
        ],
        "ycors": [
          90,
          150,
          180,
          105
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          105,
          60,
          75,
          135
        ],
        "ycors": [
          90,
          150,
          180,
          105
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "plant": {
    "rotate": false,
    "elements": [
      {
        "xmin": 135,
        "ymin": 90,
        "xmax": 165,
        "ymax": 300,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          135,
          90,
          45,
          75,
          135
        ],
        "ycors": [
          255,
          210,
          195,
          255,
          285
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          165,
          210,
          255,
          225,
          165
        ],
        "ycors": [
          255,
          210,
          195,
          255,
          285
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          135,
          90,
          45,
          75,
          135
        ],
        "ycors": [
          180,
          135,
          120,
          180,
          210
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          165,
          165,
          225,
          255,
          210
        ],
        "ycors": [
          180,
          210,
          180,
          120,
          135
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          135,
          90,
          45,
          75,
          135
        ],
        "ycors": [
          105,
          60,
          45,
          105,
          135
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          165,
          165,
          225,
          255,
          210
        ],
        "ycors": [
          105,
          135,
          105,
          45,
          60
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          135,
          120,
          150,
          180,
          165
        ],
        "ycors": [
          90,
          45,
          15,
          45,
          90
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "ray": {
    "rotate": true,
    "elements": [
      {
        "x1": 150,
        "y1": 0,
        "x2": 150,
        "y2": 315,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 120,
        "y1": 255,
        "x2": 150,
        "y2": 225,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 150,
        "y1": 225,
        "x2": 180,
        "y2": 255,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 120,
        "y1": 165,
        "x2": 150,
        "y2": 135,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 120,
        "y1": 75,
        "x2": 150,
        "y2": 45,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 150,
        "y1": 135,
        "x2": 180,
        "y2": 165,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 150,
        "y1": 45,
        "x2": 180,
        "y2": 75,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "square": {
    "rotate": false,
    "elements": [
      {
        "xmin": 30,
        "ymin": 30,
        "xmax": 270,
        "ymax": 270,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "square 2": {
    "rotate": false,
    "elements": [
      {
        "xmin": 30,
        "ymin": 30,
        "xmax": 270,
        "ymax": 270,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xmin": 60,
        "ymin": 60,
        "xmax": 240,
        "ymax": 240,
        "type": "rectangle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "star": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          151,
          185,
          298,
          207,
          242,
          151,
          59,
          94,
          3,
          116
        ],
        "ycors": [
          1,
          108,
          108,
          175,
          282,
          216,
          282,
          175,
          108,
          108
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "target": {
    "rotate": false,
    "elements": [
      {
        "x": 0,
        "y": 0,
        "diam": 300,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 30,
        "y": 30,
        "diam": 240,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 60,
        "y": 60,
        "diam": 180,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 90,
        "y": 90,
        "diam": 120,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 120,
        "y": 120,
        "diam": 60,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "tree": {
    "rotate": false,
    "elements": [
      {
        "x": 118,
        "y": 3,
        "diam": 94,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xmin": 120,
        "ymin": 195,
        "xmax": 180,
        "ymax": 300,
        "type": "rectangle",
        "color": "rgba(157, 110, 72, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 65,
        "y": 21,
        "diam": 108,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 116,
        "y": 41,
        "diam": 127,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 45,
        "y": 90,
        "diam": 120,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 104,
        "y": 74,
        "diam": 152,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "triangle": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          150,
          15,
          285
        ],
        "ycors": [
          30,
          255,
          255
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "triangle 2": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          150,
          15,
          285
        ],
        "ycors": [
          30,
          255,
          255
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          151,
          225,
          75
        ],
        "ycors": [
          99,
          223,
          224
        ],
        "type": "polygon",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      }
    ]
  },
  "truck": {
    "rotate": false,
    "elements": [
      {
        "xmin": 4,
        "ymin": 45,
        "xmax": 195,
        "ymax": 187,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          296,
          296,
          259,
          244,
          208,
          207
        ],
        "ycors": [
          193,
          150,
          134,
          104,
          104,
          194
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xmin": 195,
        "ymin": 60,
        "xmax": 195,
        "ymax": 105,
        "type": "rectangle",
        "color": "rgba(255, 255, 255, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          238,
          252,
          219,
          218
        ],
        "ycors": [
          112,
          141,
          141,
          112
        ],
        "type": "polygon",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 234,
        "y": 174,
        "diam": 42,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xmin": 181,
        "ymin": 185,
        "xmax": 214,
        "ymax": 194,
        "type": "rectangle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 144,
        "y": 174,
        "diam": 42,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 24,
        "y": 174,
        "diam": 42,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x": 24,
        "y": 174,
        "diam": 42,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x": 144,
        "y": 174,
        "diam": 42,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x": 234,
        "y": 174,
        "diam": 42,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "turtle": {
    "rotate": true,
    "elements": [
      {
        "xcors": [
          215,
          240,
          246,
          228,
          215,
          193
        ],
        "ycors": [
          204,
          233,
          254,
          266,
          252,
          210
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          195,
          225,
          245,
          260,
          269,
          261,
          240,
          225,
          210
        ],
        "ycors": [
          90,
          75,
          75,
          89,
          108,
          124,
          105,
          105,
          105
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          105,
          75,
          55,
          40,
          31,
          39,
          60,
          75,
          90
        ],
        "ycors": [
          90,
          75,
          75,
          89,
          108,
          124,
          105,
          105,
          105
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          132,
          134,
          107,
          108,
          150,
          192,
          192,
          169,
          172
        ],
        "ycors": [
          85,
          64,
          51,
          17,
          2,
          18,
          52,
          65,
          87
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          85,
          60,
          54,
          72,
          85,
          107
        ],
        "ycors": [
          204,
          233,
          254,
          266,
          252,
          210
        ],
        "type": "polygon",
        "color": "rgba(89, 176, 60, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "xcors": [
          119,
          179,
          209,
          224,
          220,
          175,
          128,
          81,
          74,
          88
        ],
        "ycors": [
          75,
          75,
          101,
          135,
          225,
          261,
          261,
          224,
          135,
          99
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  },
  "wheel": {
    "rotate": false,
    "elements": [
      {
        "x": 3,
        "y": 3,
        "diam": 294,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x": 30,
        "y": 30,
        "diam": 240,
        "type": "circle",
        "color": "rgba(0, 0, 0, 1.0)",
        "filled": true,
        "marked": false
      },
      {
        "x1": 150,
        "y1": 285,
        "x2": 150,
        "y2": 15,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 15,
        "y1": 150,
        "x2": 285,
        "y2": 150,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x": 120,
        "y": 120,
        "diam": 60,
        "type": "circle",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "x1": 216,
        "y1": 40,
        "x2": 79,
        "y2": 269,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 40,
        "y1": 84,
        "x2": 269,
        "y2": 221,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 40,
        "y1": 216,
        "x2": 269,
        "y2": 79,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      },
      {
        "x1": 84,
        "y1": 40,
        "x2": 221,
        "y2": 269,
        "type": "line",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": false,
        "marked": true
      }
    ]
  },
  "x": {
    "rotate": false,
    "elements": [
      {
        "xcors": [
          270,
          225,
          30,
          75
        ],
        "ycors": [
          75,
          30,
          225,
          270
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      },
      {
        "xcors": [
          30,
          75,
          270,
          225
        ],
        "ycors": [
          75,
          30,
          225,
          270
        ],
        "type": "polygon",
        "color": "rgba(141, 141, 141, 1.0)",
        "filled": true,
        "marked": true
      }
    ]
  }
}
;
(function() {
  var LayeredView, PatchView, TurtleView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if (!(window.AgentModel != null)) {
    console.error('view.js requires agentmodel.js!');
  }

  window.AgentStreamController = (function() {

    function AgentStreamController(container) {
      this.container = container;
      this.turtleView = new TurtleView();
      this.patchView = new PatchView();
      this.layeredView = new LayeredView();
      this.layeredView.setLayers(this.patchView, this.turtleView);
      this.container.appendChild(this.layeredView.canvas);
      this.model = new AgentModel();
      this.model.world.turtleshapelist = defaultShapes;
      this.repaint();
    }

    AgentStreamController.prototype.repaint = function() {
      this.turtleView.repaint(this.model.world, this.model.turtles, this.model.links);
      this.patchView.repaint(this.model.world, this.model.patches);
      return this.layeredView.repaint();
    };

    AgentStreamController.prototype.update = function(modelUpdate) {
      return this.model.update(modelUpdate);
    };

    return AgentStreamController;

  })();

  View = (function() {

    function View() {
      this.quality = 1;
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'netlogo-canvas';
      this.canvas.width = 500;
      this.canvas.height = 500;
      this.canvas.style.width = "100%";
      this.ctx = this.canvas.getContext('2d');
    }

    View.prototype.matchesWorld = function(world) {
      return ((this.maxpxcor != null) && (this.minpxcor != null) && (this.maxpycor != null) && (this.minpycor != null) && (this.patchsize != null)) && (!(world.maxpxcor != null) || world.maxpxcor === this.maxpxcor) && (!(world.minpxcor != null) || world.minpxcor === this.minpxcor) && (!(world.maxpycor != null) || world.maxpycor === this.maxpycor) && (!(world.minpycor != null) || world.minpycor === this.minpycor) && (!(world.patchsize != null) || world.patchsize === this.patchsize);
    };

    View.prototype.transformToWorld = function(world) {
      this.maxpxcor = world.maxpxcor != null ? world.maxpxcor : 25;
      this.minpxcor = world.minpxcor != null ? world.minpxcor : -25;
      this.maxpycor = world.maxpycor != null ? world.maxpycor : 25;
      this.minpycor = world.minpycor != null ? world.minpycor : -25;
      this.patchsize = world.patchsize != null ? world.patchsize : 9;
      this.onePixel = 1 / this.patchsize;
      this.patchWidth = this.maxpxcor - this.minpxcor + 1;
      this.patchHeight = this.maxpycor - this.minpycor + 1;
      this.canvas.width = this.patchWidth * this.patchsize * this.quality;
      this.canvas.height = this.patchHeight * this.patchsize * this.quality;
      return this.ctx.setTransform(this.canvas.width / this.patchWidth, 0, 0, -this.canvas.height / this.patchHeight, -(this.minpxcor - .5) * this.canvas.width / this.patchWidth, (this.maxpycor + .5) * this.canvas.height / this.patchHeight);
    };

    return View;

  })();

  LayeredView = (function(_super) {

    __extends(LayeredView, _super);

    function LayeredView() {
      return LayeredView.__super__.constructor.apply(this, arguments);
    }

    LayeredView.prototype.setLayers = function() {
      var layers;
      layers = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.layers = layers;
    };

    LayeredView.prototype.repaint = function() {
      var l, layer, _i, _len, _ref;
      this.canvas.width = Math.max.apply(Math, (function() {
        var _i, _len, _ref, _results;
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          _results.push(l.canvas.width);
        }
        return _results;
      }).call(this));
      this.canvas.height = Math.max.apply(Math, (function() {
        var _i, _len, _ref, _results;
        _ref = this.layers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          _results.push(l.canvas.height);
        }
        return _results;
      }).call(this));
      _ref = this.layers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        layer = _ref[_i];
        this.ctx.drawImage(layer.canvas, 0, 0, this.canvas.width, this.canvas.height);
      }
    };

    return LayeredView;

  })(View);

  TurtleView = (function(_super) {

    __extends(TurtleView, _super);

    function TurtleView() {
      TurtleView.__super__.constructor.call(this);
      this.drawer = new CachingShapeDrawer({});
      this.quality = 3;
    }

    TurtleView.prototype.drawTurtle = function(id, turtle) {
      var angle, heading, scale, shape, shapeName, xcor, ycor;
      xcor = turtle.xcor || 0;
      ycor = turtle.ycor || 0;
      heading = turtle.heading || 0;
      scale = turtle.size || 1;
      angle = (180 - heading) / 360 * 2 * Math.PI;
      shapeName = turtle.shape;
      shape = this.drawer.shapes[shapeName] || defaultShape;
      this.ctx.save();
      this.ctx.translate(xcor, ycor);
      if (shape.rotate) {
        this.ctx.rotate(angle);
      } else {
        this.ctx.rotate(Math.PI);
      }
      this.ctx.scale(scale, scale);
      this.drawer.drawShape(this.ctx, turtle.color, shapeName);
      return this.ctx.restore();
    };

    TurtleView.prototype.drawLink = function(link, turtles) {
      var end1, end2;
      end1 = turtles[link.end1];
      end2 = turtles[link.end2];
      this.ctx.strokeStyle = netlogoColorToCSS(link.color);
      this.ctx.lineWidth = link.thickness > this.onePixel ? link.thickness : this.onePixel;
      this.ctx.beginPath();
      this.ctx.moveTo(end1.xcor, end1.ycor);
      this.ctx.lineTo(end2.xcor, end2.ycor);
      return this.ctx.stroke();
    };

    TurtleView.prototype.repaint = function(world, turtles, links) {
      var id, link, turtle;
      this.transformToWorld(world);
      if (world.turtleshapelist !== this.drawer.shapes && typeof world.turtleshapelist === "object") {
        this.drawer = new CachingShapeDrawer(world.turtleshapelist);
      }
      for (id in links) {
        link = links[id];
        this.drawLink(link, turtles);
      }
      this.ctx.lineWidth = this.onePixel;
      for (id in turtles) {
        turtle = turtles[id];
        this.drawTurtle(id, turtle);
      }
    };

    return TurtleView;

  })(View);

  PatchView = (function(_super) {

    __extends(PatchView, _super);

    function PatchView() {
      PatchView.__super__.constructor.call(this);
      this.patchColors = [];
    }

    PatchView.prototype.transformToWorld = function(world) {
      var col, x, y, _i, _j, _ref, _ref1, _ref2, _ref3;
      PatchView.__super__.transformToWorld.call(this, world);
      this.patchColors = [];
      for (x = _i = _ref = this.minpxcor, _ref1 = this.maxpxcor; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; x = _ref <= _ref1 ? ++_i : --_i) {
        for (y = _j = _ref2 = this.maxpycor, _ref3 = this.minpycor; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; y = _ref2 <= _ref3 ? ++_j : --_j) {
          this.colorPatch({
            'pxcor': x,
            'pycor': y,
            'pcolor': 'black'
          });
        }
        col = 0;
      }
    };

    PatchView.prototype.colorPatch = function(patch) {
      var col, color, patchIndex, row;
      row = this.maxpycor - patch.pycor;
      col = patch.pxcor - this.minpxcor;
      patchIndex = row * this.patchWidth + col;
      color = patch.pcolor;
      color = netlogoColorToCSS(color);
      if (color !== this.patchColors[patchIndex]) {
        this.patchColors[patchIndex] = this.ctx.fillStyle = color;
        return this.ctx.fillRect(patch.pxcor - .5, patch.pycor - .5, 1, 1);
      }
    };

    PatchView.prototype.repaint = function(world, patches) {
      var p, _, _results;
      if (!this.matchesWorld(world)) {
        this.transformToWorld(world);
      }
      _results = [];
      for (_ in patches) {
        p = patches[_];
        _results.push(this.colorPatch(p));
      }
      return _results;
    };

    return PatchView;

  })(View);

}).call(this);
;
(function() {
  var Connection;

  window.connect = function(socketURL) {
    return new Connection(new WebSocket(socketURL));
  };

  Connection = (function() {

    function Connection(socket) {
      var _this = this;
      this.socket = socket;
      this.listeners = {
        'all': []
      };
      this.outbox = [];
      this.socket.onmessage = function(event) {
        return _this.dispatch(JSON.parse(event.data));
      };
      this.socket.onopen = function() {
        var msg, _i, _len, _ref, _results;
        _ref = _this.outbox;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          msg = _ref[_i];
          _results.push(_this.send(msg));
        }
        return _results;
      };
    }

    Connection.prototype.send = function(message) {
      if (this.socket.readyState === this.socket.OPEN) {
        return this.socket.send(JSON.stringify(message));
      } else {
        return this.outbox.push(message);
      }
    };

    Connection.prototype.dispatch = function(msg) {
      var listener, _i, _j, _len, _len1, _ref, _ref1, _results;
      _ref = this.listeners['all'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener(msg);
      }
      if (!(this.listeners[msg.kind] != null)) {
        this.listeners[msg.kind] = [];
      }
      _ref1 = this.listeners[msg.kind];
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        listener = _ref1[_j];
        _results.push(listener(msg));
      }
      return _results;
    };

    Connection.prototype.on = function(kind, listener) {
      if (!(this.listeners[kind] != null)) {
        this.listeners[kind] = [];
      }
      return this.listeners[kind].push(listener);
    };

    return Connection;

  })();

}).call(this);
;
(function() {

  window.SessionLite = (function() {

    SessionLite.controller = void 0;

    function SessionLite(container) {
      var existingCanvas;
      existingCanvas = container.querySelector("#netlogo-canvas");
      if (existingCanvas != null) {
        container.removeChild(existingCanvas);
      }
      this.controller = new AgentStreamController(container);
    }

    SessionLite.prototype.update = function(modelUpdate) {
      var update, _i, _len;
      if (modelUpdate instanceof Array) {
        for (_i = 0, _len = modelUpdate.length; _i < _len; _i++) {
          update = modelUpdate[_i];
          this.controller.update(update);
        }
      } else {
        this.controller.update(modelUpdate);
      }
      return this.controller.repaint();
    };

    return SessionLite;

  })();

}).call(this);
;