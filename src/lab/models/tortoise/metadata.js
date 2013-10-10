/*global define: false */

define(function() {

  return {
    mainProperties: {
      type: {
        defaultValue: "tortoise",
        immutable: true
      },
      minX: {
        defaultValue: -25,
        immutable: true
      },
      maxX: {
        defaultValue: 25,
        immutable: true
      },
      minY: {
        defaultValue: -25,
        immutable: true
      },
      maxY: {
        defaultValue: 25,
        immutable: true
      },
      width: {
        defaultValue: 50
      },
      height: {
        defaultValue: 50
      },
      horizontalWrapping: {
        defaultValue: false
      },
      verticalWrapping: {
        defaultValue: false
      },
    },

    viewOptions: {
      viewPortWidth: {
        immutable: true
      },
      viewPortHeight: {
        immutable: true
      },
      viewPortZoom: {
        defaultValue: 1
      },
      viewPortX: {
      },
      viewPortY: {
      },
      viewPortDrag: {
        // Supported values:
        // - true  -> dragging is enabled.
        // - "x"   -> dragging is limited only to X axis.
        // - "y"   -> dragging is limited only yo Y axis.
        // - false -> dragging is disabled.
        defaultValue: false
      },
      showClock: {
        defaultValue: true,
        storeInTickHistory: true
      },
      controlButtons: {
        defaultValue: "play"
      }
    }
  };
});
