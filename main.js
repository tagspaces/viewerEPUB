/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals JSZip */
'use strict';

var $epubContent;
var Book = ePub('./epubjs/epub.js');
//var reader = require('./epubreader');

$(document).ready(init);
function init() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
      results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  var locale = getParameterByName('locale');
  var filePath = getParameterByName("file");

  var extSettings;
  loadExtSettings();

  $epubContent = $('#epubContent');

  var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
  var currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  var currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $epubContent.removeClass();
  $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);

  $('#changeStyleButton').bind('click', function() {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#resetStyleButton').bind('click', function() {
    currentStyleIndex = 0;
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomInButton').bind('click', function() {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomOutButton').bind('click', function() {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomResetButton').bind('click', function() {
    currentZoomState = 3;
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  // Init internationalization
  i18next.init({
    ns: {namespaces: ['ns.viewerEPUB']},
    debug: true,
    lng: locale,
    fallbackLng: 'en_US'
  }, function() {
    jqueryI18next.init(i18next, $);
    $('[data-i18n]').localize();
  });

  function saveExtSettings() {
    var settings = {
      'styleIndex': currentStyleIndex,
      'zoomState':  currentZoomState
    };
    localStorage.setItem('viewerEPUBSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerEPUBSettings'));
  }

  // removing the script tags from the content
  // var cleanedContent = content.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  $epubContent.empty().append($('<div>', {
    style: "background-color: darkgray; width: 100%;",
    class: "flexLayoutVertical",
    id: "mainLayout"
  })
  .append('<span style="font-size: 14px; color: white;">&nbsp;Preview of the document begin: </span>')
  .append($('<textarea>', {
      readonly: "true",
      style: "overflow: auto; height: 100%; width: 100%; font-size: 13px; margin: 0px; background-color: white; border-width: 0px;",
      class: "flexMaxHeight"
    })
  // .append(cleanedContent)
  ));

  if (isElectron) {
    $epubContent.find("#mainLayout").prepend($('<button/>', {
      class: 'btn btn-primary',
      style: 'margin: 5px;',
      text: 'Open Natively'
    }).on("click", function() {
      var msg = {command: 'openFileNatively', link: filePath};
      sendMessageToHost(msg);
    }));
  }

  console.log("Initalization EPUB Viewer...");
  var renderID = getRandomID("epub");
  initEpub(filePath, renderID);
}

function getRandomID(prefix, length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  var string_length = length || 8;
  var randomstring = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return prefix ? prefix + '-' + randomstring : randomstring;
}

function initEpub(filePath, elementID) {
  console.log('Initalization EPUB Viewer...');

  var renderID = getRandomID('epub');
  initViewerUI(elementID, renderID);
  if (isElectron || isChromeExt) {
    filePath = 'file://' + filePath;
  }
  reader.loadBook(filePath, renderID);
}

function initViewerUI(elementID, renderID) {
  var $prev = $("<div class='viewerEPUBNaviButton'>‹</div>").click(reader.prevPage);
  var $next = $("<div class='viewerEPUBNaviButton'>›</div>").click(reader.nextPage);

  var $area = $("<div>")
  .attr('id', renderID)
  .addClass('flexMaxWidth')
  .addClass('flexLayoutVertical')
  .css({'margin': '5% auto'});

  var $main = $("<div>")
  .attr('id', 'viewerEPUBMain')
  .addClass("flexLayout")
  .css({"width": "100%"})
  .append($prev)
  .append($area)
  .append($next);

  $('#' + elementID).append($main);
}
