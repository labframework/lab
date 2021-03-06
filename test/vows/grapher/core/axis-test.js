var helpers   = require("../../../helpers");
helpers.setupBrowserEnvironment();

var vows      = require("vows"),
    assert    = require("assert"),
    requirejs = helpers.getRequireJS(),

    axis = requirejs('grapher/core/axis'),

    suite = vows.describe("grapher/core/axis");

suite.addBatch({
  "axis": {
    topic: function() {
      return axis.axisProcessDrag;
    },
    // axisProcessDrag((dragstart, currentdrag, domain);
    // => newDomain
    "axisProcessDrag: (20, 10, [0, 40]) => [0, 80]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(20, 10, [0, 40]), [0, 80]);
    },
    "axisProcessDrag: (60, 50, [40, 80]) => [40, 120]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(60, 50, [40, 80]), [40, 120]);
    },
    "axisProcessDrag: (10, 20, [0, 40]) => [0, 20]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(10, 20, [0, 40]), [0, 20]);
    },
    "axisProcessDrag: (20, 10, [-40, 40]) => [-80, 80]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(20, 10, [-40, 40]), [-80, 80]);
    },
    "axisProcessDrag: (-60, -50, [-80, -40]) => [-120, -40]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(-60, -50, [-80, -40]), [-120, -40]);
    },
    "axisProcessDrag: (-0.4, -0.2, [-1.0, 0.4]) => [-2.0, 0.8]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(-0.4, -0.2, [-1.0, 0.4]), [-2.0, 0.8]);
    },
    "axisProcessDrag: (-0.2, -0.4, [-1.0, 0.4]) => [-0.5, 0.2]": function(axisProcessDrag) {
      assert.deepEqual(axisProcessDrag(-0.2, -0.4, [-1.0, 0.4]), [-0.5, 0.2]);
    }
  }
});

suite.export(module);
