// key === 'Control or e.ctrlKey' &&
// key === 'Alt' or e.altKey
// key === 'k' or e.code === 'KeyK' or keyCode: 75
// key === 'j' or e.code === 'KeyJ' or keyCode: 74
// key === 'l' or e.code === 'KeyL' or keyCode: 76

var selectedText, bookmarkList;

function getAllStorageLocalData() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items);
		});
	});
}

function encodeString(str) {
	return [...new TextEncoder().encode(str)];
}

async function bookMarkInit() {
	let items = await getAllStorageLocalData();
	bookmarkList = items.bookmarkList || [];
	console.log("Get Storage Data: ", bookmarkList);
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
	let items = await getAllStorageLocalData();
	bookmarkList = items.bookmarkList || [];
	if (message.addBookMark) {
		let tab = message.tab;
		let bookmarkIdx;
		let encodedContent;
		let encodedSelectedContent = encodeString(
			window.getSelection().anchorNode.parentElement.innerText
		);
		console.log(message.tab);

		encodedContent = [
			encodedSelectedContent.slice(0, 10).join(""),
			encodedSelectedContent.slice(-10).join(""),
		].join("");

		bookmarkIdx = bookmarkList.findIndex((item) => item.url === tab.url);
		if (bookmarkIdx >= 0) {
			if (bookmarkList[bookmarkIdx].markList.indexOf(encodedContent) < 0) {
				bookmarkList[bookmarkIdx].markList.push(encodedContent);
			}
		} else {
			bookmarkList.push({
				url: tab.url,
				markList: [encodedContent],
			});
		}

		chrome.storage.local.set({ bookmarkList });
		console.log("Save to Storage", bookmarkList);
	}
	sendResponse();
});

// chrome.storage.local.clear();

window.addEventListener("keydown", function (e) {
	if (e.ctrlKey && e.altKey && e.code === "KeyK") {
	}
});

bookMarkInit();
