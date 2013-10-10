/*global define */

define(function (require) {

  var DNAEditDialog = require('models/md2d/views/dna-edit-dialog');

  /**
    Define the model-specific MD2D scripting API used by 'action' scripts on interactive elements.

    The universal Interactive scripting API is extended with the properties of the
    object below which will be exposed to the interactive's 'action' scripts as if
    they were local vars. All other names (including all globals, but excluding
    Javascript builtins) will be unavailable in the script context; and scripts
    are run in strict mode so they don't accidentally expose or read globals.

    @param: api
  */
  return function TortoiseScriptingAPI (api, model) {

    return {

      addCloud: function() {
        window.ADD_CLOUD();
        window.session.update(window.collectUpdates());
      },
      removeCloud: function() {
        window.REMOVE_CLOUD();
        window.session.update(window.collectUpdates());
      },
      addCO2: function() {
        window.ADD_CO2();
        window.session.update(window.collectUpdates());
      },
      removeCO2: function() {
        window.REMOVE_CO2();
        window.session.update(window.collectUpdates());
      },
    };

  };
});
