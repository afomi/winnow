'use strict';

var currentWindowId;
var chromeWindowsArray;
var windowIds = new Array();
// names = {
//  windowId : 'Name 1',
//  21098765 : 'Name 2',
//  77777777 : 'Name 3'
// }
var names = {};
var activeTab;

$(function() {
  // when the Chrome Extension Toolbar icon is clicked...
  init();
});

// CONTROLLER
function init() {

  // set names from Local Storage
  chrome.storage.local.get('names', function(obj) {
    console.log('Getting names from local cache');
    names = obj.names;
    console.log('Set an instance of names to');
    console.log(names);
    draw();
  });

  // find Chome Window and Tab values, and set variables
  chrome.windows.getCurrent({}, function(currentWindow) {
    currentWindowId = currentWindow.id;
    console.log("Set currentWindowId to " + currentWindowId);
  });

  chrome.windows.getAll({}, function(chromeWindows) {
    chromeWindowsArray = chromeWindows;
    $.each(chromeWindows, function(i, chromeWindow) {
      windowIds.push(chromeWindow.id);
    });

    windowIds = $.unique(windowIds);
    console.log("Set windowIds to " + windowIds);

    // Views
    draw();
  });
}

// VIEW
//
// draw() assumes the defined ## (at the top) are set:
function draw() {
  $("#window-buttons").empty();
  $("input[name='window-name']").val(names[currentWindowId]);

  // Draw buttons, and exclude the currentWindow
  $.each(windowIds, function(i, chromeWindowId) {
    if (chromeWindowId != currentWindowId) {
      drawButton(chromeWindowId);
    }
  });

  // set activeTab
  chrome.tabs.getSelected(function(tab) {
    activeTab = tab;
  });

  $("#save-name").click(function() {
    setWindowNamefromInput();
  })
}

// This is the primary function of this Extension
function sendCurrentTabToWindow(tabId, winId) {
  chrome.tabs.move(tabId,
                  { 'windowId' : winId, 'index' : -1 },
                    function (res) {
                      console.log(res);
  })
}

function drawButton(chromeWindowId) {
  var newButton = $("#window-button.template").clone();
  newButton.removeClass('hide');
  newButton.removeAttr('id');
  newButton.addClass('window-button');
  newButton.attr('data-id', chromeWindowId);
  newButton.text(names[chromeWindowId]);

  newButton.click(function() {
    sendCurrentTabToWindow(activeTab.id, parseInt($(this).attr('data-id')));
    console.log('sendCurrentTabToWindow()');
  });

  $("#window-buttons").append(newButton);
  return true;
}

function setWindowNamefromInput() {
  var name = $("input[name='window-name']").val();

  names[currentWindowId] = name;
  console.log(names);
  chrome.storage.local.set({ 'names': names }, function(a) {
    console.log('Saving names to local cache');
    console.log(a);
    return true;
  });
}

function saveChanges() {
  // Get a value saved in a form.
  var inputValue = $("input[name='window-name']").val();

  // Check that there's some code there.
  if (!inputValue) {
    message('Error: No value specified');
    return;
  }
  // Save it using the Chrome extension storage API.
  chrome.storage.local.set({'value': inputValue}, function() {
    // Notify that we saved.
    alert('hi');
    message('Settings saved');
  });
}

function setName(windowId, name) {
  names[windowId] = name;
}
