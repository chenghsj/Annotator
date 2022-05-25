import Bookmark from "./bookmark.js";

function findDOMPositions({ bookmarkList, tabUrl }) {
	let markList;
	bookmarkIdx = bookmarkList.findIndex((item) => item.url === tabUrl);
	if (bookmarkIdx < 0) return;
	markList = bookmarkList[bookmarkIdx].markList;
	let positions = [];
	for (let key in markList) {
		let DOMqueryList = [...document.querySelectorAll(key)];
		let tempMarkList = [...markList[key]];
		DOMqueryList.forEach((item) => {
			let encodedContent = [
				encodeString(item.innerText).slice(0, 20).join(""),
				encodeString(item.innerText).slice(-20).join(""),
			].join("");
			tempMarkList.forEach((content, idx) => {
				if (content === encodedContent) {
					if (document.getElementById(key + encodedContent)) {
						document.getElementById(key + encodedContent).remove();
					}
					new Bookmark({
						key,
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
	return positions;
}

export default findDOMPositions;
