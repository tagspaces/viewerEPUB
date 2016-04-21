/*
 * @overview EPUB viewer for tagspaces
 * @copyright Copyright (c) 2015 Borislav Sapundzhiev <BSapundzhiev@gmail.com>
 * @license   Licensed under MIT license
 *            See https://opensource.org/licenses/MIT  
 */

define(function (require, exports, module) {
    "use strict";

    var extensionID = "viewerEPUB"; // ID should be equal to the directory name where the ext. is located
    var extensionSupportedFileTypes = ["epub"];

    console.log("Loading " + extensionID);

    var containerElID, $containerElement, currentFilePath;
    var TSCORE = require("tscore");
    var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;
    require([
        'css!' + extensionDirectory + '/extension.css',
    ], function () {
    });

    function init(filePath, containerElementID) {
        console.log("Initalization EPUB Viewer...");
        containerElID = containerElementID;
        $containerElement = $('#' + containerElID);

        currentFilePath = filePath;
        $containerElement.empty();
        $containerElement.css("background-color", "white");
        $containerElement.append($('<iframe>', {
            "sandbox": "allow-same-origin allow-scripts allow-modals",
            "id": "iframeViewer",
            "nwdisable": "",
            "src": extensionDirectory + "/index.html?&locale=" + TSCORE.currentLanguage,
        }));

        TSCORE.IO.loadTextFilePromise(filePath).then(function (content) {
                exports.setContent(content);
            },
            function (error) {
                TSCORE.hideLoadingAnimation();
                TSCORE.showAlertDialog("Loading " + filePath + " failed.");
                console.error("Loading file " + filePath + " failed " + error);
            });
    }

    function viewerMode() {

        console.log("viewerMode not supported on this extension");
    }

    function setContent(content) {

       //var  parser = new DOMParser();
       //var  xmlDoc = parser.parseFromString(content,"text/xml");
       // console.log(xmlDoc);

        var fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(currentFilePath);
        if (isWeb) {
            fileDirectory = TSCORE.TagUtils.extractContainingDirectoryPath(location.href) + "/" + fileDirectory;
        }
        var contentWindow = document.getElementById("iframeViewer").contentWindow;
        if (typeof contentWindow.setContent === "function") {
            contentWindow.setContent(content,fileDirectory);
        } else {
            // TODO optimize setTimeout
            window.setTimeout(function () {
                contentWindow.setContent(content,fileDirectory);
            }, 500);
        }
    }

    function getContent() {

        console.log("getContent not supported on this extension");
    }

    exports.init = init;
    exports.getContent = getContent;
    exports.setContent = setContent;
    exports.viewerMode = viewerMode;
});
