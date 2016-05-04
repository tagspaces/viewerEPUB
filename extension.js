/*
 * @overview EPUB viewer for tagspaces
 * @copyright Copyright (c) 2015 Borislav Sapundzhiev <BSapundzhiev@gmail.com>
 * @license   Licensed under MIT license
 *            See https://opensource.org/licenses/MIT
 */

define(function(require, exports, module) {
  "use strict";

  var extensionID = "viewerEPUB"; // ID should be equal to the directory name where the ext. is located
  var extensionSupportedFileTypes = ["epub"];

  console.log("Loading " + extensionID);

  var TSCORE = require("tscore");
  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;
  var reader = require("ext/viewerEPUB/epubreader");
  require([
    'css!' + extensionDirectory + '/extension.css',
  ], function() {
  });
  var containerElID;
  var currentFilePath;
  var $containerElement;

  function init(filePath, containerElementID) {
    console.log("Initalization EPUB Viewer...");
    containerElID = containerElementID;
    $containerElement = $('#' + containerElID);

    currentFilePath = filePath;
    $containerElement.empty();
    $containerElement.css("background-color", "white");
    $containerElement.append($('<iframe>', {
      sandbox: "allow-same-origin allow-scripts allow-modals",
      id: "iframeViewer",
      "nwdisable": "",
      //"nwfaketop": "",
      "src": extensionDirectory + "/index.html?&locale=" + TSCORE.currentLanguage,
    }));
    TSCORE.IO.getFileContentPromise(filePath).then(function(content) {
      exports.setContent(content);
    }, function(error) {
      TSCORE.hideLoadingAnimation();
      TSCORE.showAlertDialog("Loading " + filePath + " failed.");
      console.error("Loading file " + filePath + " failed " + error);
    });
  }

  function viewerMode() {

    console.log("viewerMode not supported on this extension");
  }


  function setContent(content) {
    var ePubContent = new ePub(content);

    var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);
    if (isWeb) {
      fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(location.href) + "/" + fileDirectory;
    }

    var contentWindow = document.getElementById("iframeViewer").contentWindow;
    if (typeof contentWindow.setContent === "function") {
      contentWindow.setContent(ePubContent, fileDirectory);
    } else {
      window.setTimeout(function() {
        contentWindow.setContent(ePubContent, fileDirectory);
      }, 500);
    }
    console.log("setContent not supported on this extension");
  }

  function getContent() {

    console.log("getContent not supported on this extension");
  }

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

  exports.init = init;
  exports.getContent = getContent;
  exports.setContent = setContent;
  exports.viewerMode = viewerMode;
});
