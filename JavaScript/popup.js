// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;
    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
   document.getElementById('status').textContent = statusText;
}

function displayTabData(tabList) {
    var tabs = document.getElementById("tabData");
    for (var i = 0; i < tabList.length; i++) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(tabList[i].title));
        console.log(li.textContent);
        tabs.appendChild(li);
    }
}

(function($){
  
    $(document).ready(function(){
  
      getCurrentTabUrl(function(url){
          $.get(url, {}, function(html){
            console.log($(html));
          });
      });
      
    });
  
}(jQuery));

/*
document.addEventListener('DOMContentLoaded', function () {
    var allTabs = [];
    chrome.tabs.query({}, function (tabs) {
        allTabs = tabs;
        
        for (var i = 0; i < tabs.length; i++)
        {
            allTabs[i] = tabs[i];
        }
        
        for (var i = 0; i < allTabs.length; i++)
        {
            if (allTabs[i] != null)
            {
                console.log(allTabs[i].title);
            }
            //renderStatus(allTabs[i].title);
        }
        displayTabData(allTabs);
    });
});
*/
/*
document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    console.log(url);
    // Put the image URL in Google search.
    renderStatus('Performing Google Image search for ' + url);
    console.log(1);
    getImageUrl(url, function(imageUrl, width, height) {
      console.log(imageUrl);
      renderStatus('Search term: ' + url + '\n' +
          'Google image search result: ' + imageUrl);
      var imageResult = document.getElementById('image-result');
      // Explicitly set the width/height to minimize the number of reflows. For
      // a single image, this does not matter, but if you're going to embed
      // multiple external images in your page, then the absence of width/height
      // attributes causes the popup to resize multiple times.
      imageResult.width = width;
      imageResult.height = height;
      imageResult.src = imageUrl;
      imageResult.hidden = false;

    }, function(errorMessage) {
      renderStatus('Cannot display image. ' + errorMessage);
    });
  });
});
*/

Array.prototype.remove = function (ele) {
    this.splice(this.indexOf(ele), 1);
}

var app = angular.module("app", []);

app.controller("ctrl", function ($scope) {

    $scope.dragTab = undefined;
    $scope.origWindow = undefined;
	
	$scope.goTo = function(tab, win){
		
		chrome.tabs.update(tab.id, {selected: true,"highlighted":true});
		chrome.windows.update(win.id, {focused: true})
		
	}

    $scope.enter = function (window) {
        
        if ($scope.dragTab != undefined) {
            window.tabs.push($scope.dragTab);
            $scope.origWindow.tabs.remove($scope.dragTab);
            chrome.tabs.move($scope.dragTab.id, { windowId: window.id, index: -1 });

            chrome.extension.getBackgroundPage().dragTab($scope.dragTab.id, $scope.dragTab.url, window.id);

            $scope.dragTab = undefined;
            $scope.origWindow = undefined;
        }
        
    }

    $scope.press = function (tab, window) {
        $scope.dragTab = tab;
        console.log(window);
        $scope.origWindow = window;
    }

    $scope.release = function () {
        $scope.dragTab = undefined;
        $scope.origWindow = undefined;
    }

    chrome.windows.getAll({"populate":true}, function (windows) {
        $scope.$apply(function ($scope) {
            $scope.windows = windows;
        });
    });
    chrome.tabs.query({}, function (tabs) {
        console.log(tabs);
        $scope.$apply(function ($scope) {
            $scope.tabs = tabs;
        });
        /*
        for (var i = 0; i < tabs.length; i++)
        {
            allTabs[i] = tabs[i];
        }
        */
        //for (var i = 0; i < tabs.length; i++) {
        //    if (tabs[i] != null) {
        //        console.log(tabs[i].title);
        //        $scope.tabs.push(tabs[i]);
        //    }
        //    //renderStatus(allTabs[i].title);
        //}
        //for (var i = 0; i < $scope.tabs.length; i++) {
        //    console.log($scope.tabs[i].title);
        //    console.log($scope.tabs[i].favIconURL);
        //}
        //displayTabData(allTabs);
    });
    $scope.dragCallback = function (event, ui, title) {

    };

    $scope.dropCallback = function (event, ui, tab, window) {
        console.log(tab, window);
    };

});