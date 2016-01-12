/* Copyright (c) 2015 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) { 
  "use strict";

  var ePub = require("ext/viewerEPUB/epubjs/epub");
  var book, rendered;
  var data;
  var bookFileName;
  var defaultBookStyle = {
    "font-size": "1.2em",
    "text-align": "justify"
  };

  var options = {
    bookPath : null,
    version: 1, // Changing will cause stored Book information to be reloaded
    restore: true,// Skips parsing epub contents, loading from localstorage instead
    storage: false, // true (auto) or false (none) | override: 'ram', 'websqldatabase', 'indexeddb', 'filesystem'
    spreads: false, // Displays two columns
    fixedLayout : true, //-- Will turn off pagination
    styles : {}, // Styles to be applied to epub
    width : false,
    height: false,
  };

  function loadBook(filePath, renderID) {
    bookFileName = filePath;
    book = ePub(filePath, options);
    setStyle(defaultBookStyle);
    rendered = book.renderTo(renderID);

    book.on('renderer:locationChanged', function(locationCfi) {
      storeLastPage(locationCfi);
    });

    book.on('book:pageChanged', function(location) {
      console.log("pageChanged", location);
    });

    book.on('book:ready', function() {
      if (options.restore) {
        restoreLastPage();
      }
    });
  }

  function restoreLastPage() {
    var locationCfi = storeLastPage();
    book.displayChapter(locationCfi);
  }

  function storeLastPage(storeData) {
    if (storeData) {
      localStorage.setItem(bookFileName, storeData);
    } else {
      return localStorage.getItem(bookFileName);
    }
  }

  function setZipData(zipData) {
    data = zipData;
  }

  function prevPage() {
    book.prevPage();
  }

  function nextPage() {
    book.nextPage();
  }

  function setStyle (obj) {
    for (var key in obj) {
      book.setStyle(key, obj[key]);
    }
  }

  exports.options = options;
  exports.loadBook = loadBook;
  exports.prevPage = prevPage;
  exports.nextPage = nextPage;
  exports.setZipStoragePromise = setZipStoragePromise;
  exports.setZipData = setZipData;
  exports.setStyle = setStyle;
});