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
    
    var JSZip = require("jszip");
    var TSCORE = require("tscore");
    var reader = require("ext/viewerEPUB/epubreader");

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

    function initViewerUI(elementID, renderID) {
        var styleArrow =  {
            "position": "absolute",
            "top": "50%",
            "margin-top": "-32px",
            "font-size": "64px",
            "color": "#D8D8D8",
            "font-family": "arial, sans-serif",
            "font-weight": "bold",
            "cursor": "pointer",
            "-webkit-user-select": "none",
            "-moz-user-select": "none",
            "user-select": "none"
        };

        var styleMain = {
            "position": "absolute",
            "width": "100%",
            "height": "100%"
        };

        var styleArea = {
            "width": "80%",
            "height": "80%",
            "margin": "5% auto",
        };

        var $prev = $("<div>‹</div>").attr('id','prev').css({"left": "40px"}).css(styleArrow).click(reader.prevPage);
        var $next = $("<div>›</div>").attr('id','next').css({"right": "40px"}).css(styleArrow).click(reader.nextPage);
        
        var $area = $("<div/>").attr('id', renderID).css(styleArea); 
        var $main = $("<div/>").attr('id','main').css(styleMain)
            .append($prev).append($area).append($next);

        $('#'+elementID).append($main); 

    }

    exports.init = function(filePath, elementID) {
        console.log("Initalization EPUB Viewer...");
        var renderID = getRandomID("epub");
        initViewerUI(elementID, renderID);
        if(isCordova !== true) {
            reader.setZipStoragePromise(getZipStorage);
            reader.loadBook(filePath, renderID);   
        } else {
            loadEpubFile(filePath, function(extractedPath) {
                reader.loadBook(extractedPath, renderID);
            });
        }
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

    function loadEpubFile(filePath, resultCallback) {

        var extrfolder = isCordovaiOS ? cordova.file.dataDirectory : cordova.file.externalDataDirectory;
        var pathToImport = extrfolder + "/" + baseName(filePath) +".IMP/";
        
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
            pathToImport = pathToImport.replace("file://", "");
            resultCallback(pathToImport, zipFile); 
        }, 1000);
   
        }, function(error) {
            TSCORE.showAlertDialog(error);
        });
    }

    function getRandomID(prefix, length) {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var string_length = length || 8;
        var randomstring = '';
        for (var i=0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return prefix ? prefix + "-" + randomstring : randomstring;
    }
});
