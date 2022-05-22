chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (!tab.url || !tab.url.startsWith("http")) {
		return;
	}
	if (changeInfo.status === "complete") {
		chrome.scripting.executeScript({ target: { tabId: tabId }, files: ["inject/inject.js"] });
		chrome.scripting.insertCSS({ target: { tabId: tabId }, files: ["inject/bookmark.css"] });
	}
});

chrome.contextMenus.create(
	{ title: "Content Bookmark", id: "add-bookmark", contexts: ["selection"] },
	function () {
		if (chrome.runtime.lastError) console.log(chrome.runtime.lastError.message);
	}
);

chrome.contextMenus.onClicked.addListener(function () {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, { addBookMark: true, tab: tabs[0] });
	});
});
