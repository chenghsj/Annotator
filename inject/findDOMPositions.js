import Bookmark from "./bookmark.js";

function findDOMPositions({ bookmarkList, tabUrl, contentFromPopup }) {
	let markList;
	bookmarkIdx = bookmarkList.findIndex((item) => item.url === tabUrl);
	if (bookmarkIdx < 0) return;
	markList = bookmarkList[bookmarkIdx].markList;
	let positions = [];
	let contentFromPopupPosition;
	for (let tagName in markList) {
		let DOMqueryList = [...document.querySelectorAll(tagName)];
		let tempMarkList = [...markList[tagName]];
		DOMqueryList.forEach((item) => {
			let encodedContent = [
				encodeString(item.innerText).slice(0, 20).join(""),
				encodeString(item.innerText).slice(-20).join(""),
			].join("");
			if (contentFromPopup === encodedContent) {
				contentFromPopupPosition = getOffsetTop(item);
				return;
			}
			tempMarkList.forEach((content, idx) => {
				if (content === encodedContent) {
					if (document.getElementById(tagName + encodedContent)) {
						// bookmark id is tagName + encodedContent
						// remove than add is for dynamic purpose when resizing the window
						document.getElementById(tagName + encodedContent).remove();
					}
					new Bookmark({
						tagName,
						encodedContent,
						top: getOffsetTop(item) + 100,
					});
					item.classList.add("ct_bks_bg");
					item.dataset.encodedContent = encodedContent;
					positions.push(getOffsetTop(item));
					tempMarkList[idx] = null;
				}
			});
		});
	}
	positions.sort(function (a, b) {
		return a - b;
	});
	if (contentFromPopup) return contentFromPopupPosition;
	return positions;
}

export default findDOMPositions;

/**
 * @param {HtmlElement} element
 * @returns
 */
function getOffsetTop(element) {
	let offsetTop = 0;
	while (element) {
		offsetTop += element.offsetTop;
		element = element.offsetParent;
	}
	return offsetTop - 100;
}
