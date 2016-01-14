/*
 * @overview EPUB viewer for tagspaces
 * @copyright Copyright (c) 2015 Borislav Sapundzhiev <BSapundzhiev@gmail.com>
 * @license   Licensed under MIT license
 *            See https://opensource.org/licenses/MIT  
 */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerEPUB");

  exports.id = "viewerEPUB"; // ID should be equal to the directory name where the ext. is located
  exports.title = "EPUB Viewer";
  exports.type = "viewer";
  exports.supportedFileTypes = ["epub"];
  
  var TSCORE = require("tscore");
  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  var reader = require("ext/viewerEPUB/epubreader");
  require([
    'css!' + extensionDirectory + '/extension.css',
  ], function() {});

  function initViewerUI(elementID, renderID) {
    var $prev = $("<div class='viewerEPUBNaviButton'>‹</div>").click(reader.prevPage);

    var $next = $("<div class='viewerEPUBNaviButton'>›</div>").click(reader.nextPage);

    var $area = $("<div>")
      .attr('id', renderID)
      .addClass("flexMaxWidth")
      .addClass("flexLayoutVertical")
      .css({"margin": "5% auto"});

    var $main = $("<div>")
      .attr('id', 'viewerEPUBMain')
      .addClass("flexLayout")
      .css({"width": "100%"})
      .append($prev)
      .append($area)
      .append($next);

    $('#' + elementID).append($main);
  }

  exports.init = function(filePath, elementID) {
    console.log("Initalization EPUB Viewer...");

    var renderID = getRandomID("epub");
    initViewerUI(elementID, renderID);
    if (!isCordova) {
      filePath = "file://" + filePath;
    }
    reader.loadBook(filePath, renderID);
  };

  exports.viewerMode = function() {
    console.log("viewerMode not supported on this extension");
  };

  exports.setContent = function() {
    console.log("setContent not supported on this extension");
  };

  exports.getContent = function() {
    console.log("getContent not supported on this extension");
  };

  function getRandomID(prefix, length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = length || 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return prefix ? prefix + "-" + randomstring : randomstring;
  }
});
