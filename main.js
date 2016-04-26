/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals marked */
"use strict";

var isCordova;
var isWin;
var isWeb;
var filePath;

$(document).ready(function() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var locale = getParameterByName("locale");

  var extSettings;
  loadExtSettings();

  isCordova = parent.isCordova;
  isWin = parent.isWin;
  isWeb = parent.isWeb;
  
  $(document).on('drop dragend dragenter dragover', function(event) {
    event.preventDefault();
  });
  
  $('#aboutExtensionModal').on('show.bs.modal', function() {
    $.ajax({
      url: 'README.md',
      type: 'GET'
    })
    .done(function(mdData) {
      //console.log("DATA: " + mdData);
      if (marked) {
        var modalBody = $("#aboutExtensionModal .modal-body");
        modalBody.html(marked(mdData, { sanitize: true }));
        handleLinks(modalBody);
      } else {
        console.log("markdown to html transformer not found");
      }        
    })
    .fail(function(data) {
      console.warn("Loading file failed " + data);
    });
  });  

  function handleLinks($element) {
    $element.find("a[href]").each(function() {
      var currentSrc = $(this).attr("href");
      $(this).bind('click', function(e) {
        e.preventDefault();
        var msg = {command: "openLinkExternally", link : currentSrc};
        window.parent.postMessage(JSON.stringify(msg), "*");
      });
    });
  }

  var $htmlContent = $("#htmlContent");

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

  $htmlContent.removeClass();
  $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);

  $("#changeStyleButton").bind('click', function() {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomInButton").bind('click', function() {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomOutButton").bind('click', function() {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomResetButton").bind('click', function() {
    currentZoomState = 3;
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#printButton").on("click", function() {
    $(".dropdown-menu").dropdown('toggle');
    window.print();
  });

  if (isCordova) {
    $("#printButton").hide();
  }

  // Init internationalization
  $.i18n.init({
    ns: {namespaces: ['ns.viewerEPUB']},
    debug: true,
    lng: locale,
    fallbackLng: 'en_US'
  }, function() {
    $('[data-i18n]').i18n();
  });

  function saveExtSettings() {
    var settings = {
      "styleIndex": currentStyleIndex,
      "zoomState":  currentZoomState
    };
    localStorage.setItem('viewerEPUBSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem("viewerEPUBSettings"));
  }

});

//function initViewerUI(containerElementID, renderID) {
//  var $prev = $("<div class='viewerEPUBNaviButton'>‹</div>").click(reader.prevPage);
//
//  var $next = $("<div class='viewerEPUBNaviButton'>›</div>").click(reader.nextPage);
//
//  var $area = $("<div>")
//      .attr('id', renderID)
//      .addClass("flexMaxWidth")
//      .addClass("flexLayoutVertical")
//      .css({"margin": "5% auto"});
//
//  var $main = $("<div>")
//      .attr('id', 'viewerEPUBMain')
//      .addClass("flexLayout")
//      .css({"width": "100%"})
//      .append($prev)
//      .append($area)
//      .append($next);
//
//  $('#' + containerElementID).append($main);
//}

//function getRandomID(prefix, length) {
//  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
//  var string_length = length || 8;
//  var randomstring = '';
//  for (var i = 0; i < string_length; i++) {
//    var rnum = Math.floor(Math.random() * chars.length);
//    randomstring += chars.substring(rnum, rnum + 1);
//  }
//  return prefix ? prefix + "-" + randomstring : randomstring;
//}
function init(filePath, elementID) {
  //console.log("Initalization EPUB Viewer...");

  //var renderID = getRandomID("epub");
  //initViewerUI(elementID, renderID);
  //if (!isCordova) {
  //  filePath = "file://" + filePath;
  //}
  //reader.loadBook(filePath, renderID);
}

var book;
function setContent(content, fileDirectory , containerElementID) {
  console.log("MAIN CONTENT:");
  console.debug(content);
  console.log("MAIN END");

  //try {
  //  content = JSON.parse(content);
  //} catch (e){
  //  console.log("Error parsing JSON document. " + e);
  //  return false;
  //}
  //console.debug(content);

  var $htmlContent = $('#htmlContent');
  $htmlContent.append(content);

  if (fileDirectory.indexOf("file://") === 0) {
    fileDirectory = fileDirectory.substring(("file://").length, fileDirectory.length);
  }


  //var renderID = getRandomID("epub");
  //initViewerUI(containerElementID, renderID);

  //var options = {
  //  bookPath : fileDirectory,
  //  restore: true
  //};

}
