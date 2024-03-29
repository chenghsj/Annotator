import sendMessageList from "./inject/sendMessageList.js";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (!tab.url || !tab.url.startsWith("http")) {
		return;
	}
	if (changeInfo.status === "complete") {
		chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["inject/inject.js"] });
		chrome.scripting.insertCSS({ target: { tabId: tabId }, files: ["inject/bookmark.css"] });
	}
});

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		title: "Annotator",
		id: "add-bookmark",
		contexts: ["selection"],
	});
});

chrome.contextMenus.onClicked.addListener(function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { message: sendMessageList.ADD_BOOKMARK, tab: tabs[0] });
	});
});
