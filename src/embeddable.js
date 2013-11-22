/*global Lab, _, $, jQuery, d3, controllers, alert, model, _gaq, AUTHORING: true */
/*jshint boss:true */

// Strawman setting for telling the interactive to be in "author mode",
// allowing things like positioning textBoxes by hand.
AUTHORING = false;

(function() {

  var controller,
      interactiveUrl,
      hash;

  function sendGAPageview(){
    // send the pageview to GA
    if (typeof _gaq === 'undefined'){
      return;
    }
    // make an array out of the URL's hashtag string, splitting the string at every ampersand
    var my_hashtag_array = location.hash.split('&');

    // grab the first value of the array (assuming that's the value that indicates which interactive is being viewed)
    var my_hashtag = my_hashtag_array[0];
    _gaq.push(['_trackPageview', location.pathname + my_hashtag]);
  }

  hash = document.location.hash;

  if (hash) {
    interactiveUrl = hash.substr(1, hash.length);
    controller = new Lab.InteractivesController(interactiveUrl, '#interactive-container');
    controller.on("modelLoaded", function() {
      interactive = controller.interactive;
      document.title = "Lab Interactive: " + interactive.title;
      sendGAPageview();
    });
  }

  $(window).bind('hashchange', function() {
    if (document.location.hash !== hash) {
      location.reload();
    }
  });

  // When Shutterbug wants to take a snapshot of the page, it first emits a 'shutterbug-
  // saycheese' event. By default, any WebGL canvas will return a blank image when Shutterbug
  // calls .toDataURL on it, However, if we ask Pixi to render to the canvas during the
  // Shutterbug event loop (remember synthetic events such as 'shutterbug-saycheese' are
  // handled synchronously) the rendered image will still be in the WebGL drawing buffer where
  // Shutterbug can see it.
  $(window).on('shutterbug-saycheese', function() {
    window.script.repaint();
  });

}());
