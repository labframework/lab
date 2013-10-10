/*global define $ */

define(function (require) {
  // Dependencies.
  var ModelController   = require('common/controllers/model-controller'),
      Model             = require('models/tortoise/modeler'),
      ModelContainer    = require('models/tortoise/views/view'),
      ScriptingAPI      = require('models/tortoise/controllers/scripting-api'),
      Benchmarks        = function() {};

  return function (modelUrl, modelOptions, interactiveController) {
    return new ModelController(modelUrl, modelOptions, interactiveController,
                               Model, ModelContainer, ScriptingAPI, Benchmarks);
  };
});
