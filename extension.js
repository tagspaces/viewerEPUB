/* Copyright (c) 2014 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading viewerEPUB");

    exports.id = "viewerEPUB"; // ID should be equal to the directory name where the ext. is located
    exports.title = "EPUB Viewer";
    exports.type = "viewer";
    exports.supportedFileTypes = [ "epub" ];
    
    var TSCORE = require("tscore");
    var JSZip = require("jszip");
    var ePub = require("ext/viewerEPUB/epub.min");

    var Book = null;
    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;
    
    function getZipStorage(zipUrl) {

        var promise = new Promise( function (resolve, reject) {
            TSCORE.IO.getFileContent(zipUrl, function(jsArrayBuffer) {
                var zipFile = new JSZip(jsArrayBuffer);
                resolve(zipFile);
            }, function(error) {
                console.log("getZipStorage error: " + error);
                reject(error);
            });
        });

        return promise;
    }

    function getMimeType(file) {
        var mimeTypes = {
            "xhtml" : "application/xhtml+xml",
            "jpg" : "image/jpeg"
        }
        var ext = file.split(".").pop();
        var res = mimeTypes[ext];
        console.log("mimeType " + res);
        return res;
    }

    EPUBJS.Unarchiver.prototype.loadLib = function () {
        console.log("PUBJS.Unarchiver.prototype.loadLib - handle error ");
    }

    EPUBJS.Unarchiver.prototype.openZip = function(zipUrl, callback) {

        var unarchiver = this;
        return getZipStorage(zipUrl).then(function(data) {
            unarchiver.zip = data;
            unarchiver.zip.getMimeType = getMimeType;
        });
    };

    exports.init = function(filePath, elementID) {
        console.log("Initalization EPUB Viewer...");

        var styleArrow =  {
            "position": "absolute",
            "top": "50%",
            "margin-top": "-32px",
            "font-size": "64px",
            "color": "#E2E2E2",
            "font-family": "arial, sans-serif",
            "font-weight": "bold",
            "cursor": "pointer",
            "-webkit-user-select": "none",
            "-moz-user-select": "none",
            "user-select": "none"
        }

        var styleMain = {
            "position": "absolute",
            "width": "100%",
            "height": "100%"
        }

        var styleArea = {
            "width": "80%",
            "height": "80%",
            "margin": "5% auto",
            "max-width": "1250px"
        }

        var $prev = $("<div>‹</div>").attr('id','prev').css({"left": "40px"}).css(styleArrow).click(prevPage);
        var $next = $("<div>›</div>").attr('id','next').css({"right": "40px"}).css(styleArrow).click(nextPage);
        var $area = $("<div/>").attr('id','area').css(styleArea); 
        var $main = $("<div/>").attr('id','main').css(styleMain)
            .append($prev).append($area).append($next);
        $('#'+elementID).append($main); 


        Book = ePub({ restore: true });
        Book.renderTo("area");
        Book.open(filePath); 
        
        /*loadEpubFile(filePath, function(exportedBookPath, zipFile) {
           
            Book.open(exportedBookPath); 
        });*/
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

    function baseName(path) {
        return path.split("/").pop();
    }
    function dirName(path) {
        var res = path.substring(0, path.lastIndexOf("/"));
        return res.length > 0 ? res : undefined;
    }

    function prevPage() {
        Book.prevPage();
    }

    function nextPage() {
        Book.nextPage();
    }

    function loadEpubFile(filePath, resultCallback) {

        var pathToImport = TSCORE.currentPath + "/" + baseName(filePath) +".IMP/";
        
        TSCORE.IO.getFileContent(filePath, function(jsArrayBuffer) {
            var zipFile = new JSZip(jsArrayBuffer);
            var lastDir, currentDir;
            TSCORE.IO.createDirectory(pathToImport, true);

            for (var fileName in zipFile.files) {
                
                currentDir = dirName(fileName);
                if (lastDir !== currentDir) {
                    TSCORE.IO.createDirectory(pathToImport + currentDir, true);
                } 

                if (JSZip.support.arraybuffer) {
                    var buffer = zipFile.file(fileName).asArrayBuffer(); 
                    var extractedFilePath = pathToImport;
                    if(currentDir) {
                        extractedFilePath += currentDir + "/";
                    }
                    extractedFilePath += baseName(fileName);

                    TSCORE.IO.saveBinaryFile(extractedFilePath, buffer, true, true);
                } else {
                    TSCORE.showAlertDialog("JSZip dont support arraybuffer exit !");
                    return;
                }

                lastDir = currentDir;
           }

        setTimeout( function() {
            resultCallback(pathToImport, zipFile); 
        }, 1000);
   
        }, function(error) {
            TSCORE.showAlertDialog(error);
        });
    }
});
