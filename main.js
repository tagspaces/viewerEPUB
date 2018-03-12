/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals JSZip */
'use strict';

let $epubContent;
const Book = ePub('./epubjs/epub.js');

$(document).ready(() => {
  console.log('Initalization EPUB Viewer...');
  // console.log(Book);
  init();
});

function init() {
  const locale = getParameterByName('locale');
  const filePath = getParameterByName('file');
  initI18N(locale, 'ns.viewerEPUB.json');

  let extSettings;
  loadExtSettings();

  $epubContent = $('#epubContent');

  const styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
  let currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  const zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  let currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $epubContent.removeClass();
  $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);

  $('#changeStyleButton').bind('click', () => {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#resetStyleButton').bind('click', () => {
    currentStyleIndex = 0;
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomInButton').bind('click', () => {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomOutButton').bind('click', () => {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomResetButton').bind('click', () => {
    currentZoomState = 3;
    $epubContent.removeClass();
    $epubContent.addClass('markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  function saveExtSettings() {
    const settings = {
      'styleIndex': currentStyleIndex,
      'zoomState':  currentZoomState
    };
    localStorage.setItem('viewerEPUBSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerEPUBSettings'));
  }

  // removing the script tags from the content
  // const cleanedContent = content.toString().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  $epubContent.empty().append($('<div>', {
    style: 'background-color: darkgray; width: 100%;',
    class: 'flexLayoutVertical',
    id: 'mainLayout'
  })
  .append('<span style="font-size: 14px; color: white;">&nbsp;Preview of the document begin: </span>')
  .append($('<textarea>', {
      readonly: 'true',
      style: 'overflow: auto; height: 100%; width: 100%; font-size: 13px; margin: 0px; background-color: white; border-width: 0px;',
      class: 'flexMaxHeight'
    })
  // .append(cleanedContent)
  ));

  if (isElectron) {
    $epubContent.find("#mainLayout").prepend($('<button/>', {
      class: 'btn btn-primary',
      style: 'margin: 5px;',
      text: 'Open Natively'
    }).on('click', () => {
      const msg = {command: 'openFileNatively', link: filePath};
      sendMessageToHost(msg);
    }));
  }

  const renderID = getRandomID('epub');
  initEpub(filePath, renderID);
}

function getRandomID(prefix, length) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
  const string_length = length || 8;
  let randomstring = '';
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return prefix ? prefix + '-' + randomstring : randomstring;
}

function initEpub(filePath, elementID) {
  console.log('Initalization EPUB Viewer...');

  const renderID = getRandomID('epub');
  initViewerUI(elementID, renderID);
  if (isElectron || isChromeExt) {
    // filePath = 'file://' + filePath;
  }
  loadBook(filePath, renderID);
}

function initViewerUI(elementID, renderID) {
  const $prev = $("<div class='viewerEPUBNaviButton'>‹</div>").click(prevPage);
  const $next = $("<div class='viewerEPUBNaviButton'>›</div>").click(nextPage);

  const $area = $("<div>")
  .attr('id', renderID)
  .addClass('flexMaxWidth')
  .addClass('flexLayoutVertical')
  .css({'margin': '5% auto'});

  const $main = $("<div>")
  .attr('id', 'viewerEPUBMain')
  .addClass('flexLayout')
  .css({'width': '100%'})
  .append($prev)
  .append($area)
  .append($next);

  $('#' + elementID).append($main);
}

let book,
  rendered;
let bookFileName;
const defaultBookStyle = {
  'font-size': '1.2em',
  'text-align': 'justify'
};

const options = {
  bookPath: null,
  version: 1, // Changing will cause stored Book information to be reloaded
  restore: true, // Skips parsing epub contents, loading from localstorage instead
  storage: false, // true (auto) or false (none) | override: 'ram', 'websqldatabase', 'indexeddb', 'filesystem'
  spreads: false, // Displays two columns
  fixedLayout: true, // -- Will turn off pagination
  styles: {}, // Styles to be applied to epub
  width: false,
  height: false,
};

function loadBook(filePath, renderID) {
  bookFileName = filePath;
  book = ePub(filePath, options);
  setStyle(defaultBookStyle);
  rendered = book.renderTo(renderID);

  book.on('renderer:locationChanged', (locationCfi) => {
    storeLastPage(locationCfi);
  });

  book.on('book:pageChanged', (location) => {
    console.log('pageChanged', location);
  });

  book.on('book:ready', () => {
    if (options.restore) {
      restoreLastPage();
    }
  });
}

function restoreLastPage() {
  const locationCfi = storeLastPage();
  book.displayChapter(locationCfi);
}

function storeLastPage(storeData) {
  if (storeData) {
    localStorage.setItem(bookFileName, storeData);
  } else {
    return localStorage.getItem(bookFileName);
  }
}

function prevPage() {
  book.prevPage();
}

function nextPage() {
  book.nextPage();
}

function setStyle(obj) {
  for (const key in obj) {
    book.setStyle(key, obj[key]);
  }
}
