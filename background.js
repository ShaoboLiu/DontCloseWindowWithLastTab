﻿var newTabUrl = "chrome://newtab/";

var creatingPinnedTab = false;
var creatingTab = false;
var removingPinnedTab = false;
var removingTab = false;

var single_new_tab = '0';

function handleEvent() {
	chrome.windows.getAll({populate: true, windowTypes: ["normal"]}, function(windows){
		for (var windowNumber = 0; windowNumber < windows.length; windowNumber++) {
			var window = windows[windowNumber];
			chrome.tabs.query({"windowId": window.id, "url": newTabUrl}, function(window, windowNumber, windowNewTabs) {
				chrome.tabs.query({"windowId": window.id, "pinned": true, "url": newTabUrl}, function(window, windowNumber, windowNewTabs, windowPinnedNewTabs) {

					// create the single pinned tab if there's none
					if (windows.length == 1 && window.tabs.length < 2 && windowPinnedNewTabs.length < 1 && !creatingPinnedTab) {
						creatingPinnedTab = true;
						//console.log("creating pinned tab");
						chrome.tabs.create({"index": 0, "pinned": true, "active": false, "url": newTabUrl}, function(tab) {
							creatingPinnedTab = false;
						});
					}

					// open new tab if there's only single pinned tab
					if (windows.length == 1 && window.tabs.length == 1 && windowPinnedNewTabs.length == 1 && !creatingTab) {
						creatingTab = true;
						//console.log("creating tab");
						chrome.tabs.create({"url": newTabUrl}, function(tab) {
							creatingTab = false;
						});
					}

					// remove pinned tab if there's enough open tabs
					if (windows.length == 1 && window.tabs.length > 2 && windowPinnedNewTabs.length < window.tabs.length && windowPinnedNewTabs.length >= 1 && !removingPinnedTab) {
						removingPinnedTab = true;
						//console.log("removing pinned tab 1");
						chrome.tabs.remove(windowPinnedNewTabs[0].id, function(tab) {
							removingPinnedTab = false;
						});
					}

					// unpin single pinned tab if there's another window
					if (windows.length == 2 && window.tabs.length == 1 && windowPinnedNewTabs.length == 1) {
						chrome.tabs.update(windowPinnedNewTabs[0].id, {"pinned": false}, function(tab) {
						});
					}

					// remove pinned tab if 1st window has at least one regular page and new window is openning (ctrl+n)
					if (windows.length == 2 && window.tabs.length == 2 && windowPinnedNewTabs.length == 1 && !removingPinnedTab) {
						removingPinnedTab = true;
						//console.log("removing pinned tab 2");
						chrome.tabs.remove(windowPinnedNewTabs[0].id, function(tab) {
							removingPinnedTab = false;
						});
					}

					// prevent blank new tab page(s) before actual tabs with loaded pages (allow single new tab page)
					if (single_new_tab == '1' && windowNewTabs.length > 1 && windowPinnedNewTabs.length == 0 && !removingTab) {
						removingTab = true;
						//console.log("removing tab");
						chrome.tabs.remove(windowNewTabs[0].id, function(tab) {
							removingTab = false;
						});
					}
				}.bind(null, window, windowNumber, windowNewTabs));
			}.bind(null, window, windowNumber));
		}
	});
}

function init() {
	single_new_tab = localStorage['single_new_tab'];

	handleEvent();
}

init();
//chrome.tabs.onCreated.addListener(handleEvent);
chrome.tabs.onUpdated.addListener(handleEvent);
chrome.tabs.onAttached.addListener(handleEvent);
//chrome.tabs.onActivated.addListener(handleEvent);
chrome.tabs.onRemoved.addListener(handleEvent);
chrome.windows.onRemoved.addListener(handleEvent);
