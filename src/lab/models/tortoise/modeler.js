/*global define: false */

define(function(require) {

  var LabModelerMixin         = require('common/lab-modeler-mixin'),
      validator               = require('common/validator'),
      metadata                = require('models/tortoise/metadata'),
      // engine                  = require('models/tortoise/engine'),
      // climate                 = require('models/tortoise/Simple_Climate'),

      unitsDefinition = {
        units: {
          time: {
            name: "second",
            pluralName: "seconds",
            symbol: "s"
          },
          frequency: {
            name: "Hertz",
            pluralName: "Hertz",
            symbol: "Hz"
          },
          angle: {
            name: "radian",
            pluralName: "radians",
            symbol: "rad"
          }
        }
      };

  return function Model(initialProperties) {
    var customSetters = {
          // Ensure that phase + (time * angular frequency) remains unchanged when the frequency changes.
          // This makes for continuous signals.
          frequency: function (newFrequency) {
            if (lastFrequency !== undefined) {
              phase = constrain(phase + 2 * Math.PI * (lastFrequency - newFrequency) * model.properties.time);
            }
            lastFrequency = newFrequency;
          }
        },

        labModelerMixin = new LabModelerMixin({
          metadata: metadata,
          setters: customSetters,
          unitsDefinition: unitsDefinition,
          initialProperties: initialProperties
        }),
        dispatch = labModelerMixin.dispatchSupport,

        lastFrequency,
        phase = 0,
        time = 0,
        stepCounter = 0,
        model;

    function constrain(angle) {
      return angle - 2 * Math.PI * Math.floor(angle / (2 * Math.PI));
    }

    model = {

      tick: function () {
        // tortoise-tick
        stepCounter++;
        time += 0.05;
        window.GO();
        window.session.update(window.collectUpdates());

        model.updateAllOutputProperties();

        dispatch.tick();
      },

      stepCounter: function() {
        return stepCounter;
      },

      reset: function() {
        dispatch.reset();
        window.SETUP();
        window.session.update(window.collectUpdates());
      },

      setup: function() {
        model.reset();
      },

      serialize: function() {
        return {};
      }

    };

    // This will extend model API to support standard Lab model features. We
    // have to do it know, as this will also set initial properties, so the
    // engine has to be already defined (see custom setters).
    labModelerMixin.mixInto(model);

    dispatch.addEventTypes("tick");
    dispatch.addEventTypes('reset');

    model.defineOutput('time', {
      label: "Time",
      unitType: 'time',
      format: '.2f'
    }, function() {
      return time;
    });

    model.defineOutput('displayTime', {
      label: "Time",
      unitType: 'time',
      format: '.2f'
    }, function() {
      return time;
    });

    model.defineOutput('climateTemperature', {
      label: "Temperature",
      format: '.2f'
    }, function() {
      return window.getClimateTemp();
    });

    if (typeof window.SETUP === 'function') {
      window.SETUP();
      window.session.update(window.collectUpdates());
    }

    return model;
  };
});
