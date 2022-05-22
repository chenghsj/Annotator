function encodeString(str) {
	return [...new TextEncoder().encode(str)];
}

function findDOMPositions({ bookmarkList, currentURL }) {
	let markList;
	bookmarkIdx = bookmarkList.findIndex((item) => item.url === currentURL);
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
					if (!document.getElementById(key + encodedContent)) {
						let bookmark = document.createElement("div");
						bookmark.id = key + encodedContent;
						bookmark.classList.add("ct_bks");
						document.body.append(bookmark);
						bookmark.style.top = `${getOffsetTop(item) + 100}px`;
						bookmark.addEventListener("click", async function (e) {
							memoInputBox = await MemoInputBox({
								event: e,
								top: bookmark.style.top,
								tagName: key,
								encodedContent,
							});
							// memoInput(e, bookmark.style.top);
						});
						bookmark.addEventListener("mouseenter", function () {
							if (memoInputBox?.visible) return;
							contentBookmarkMouseenterTimeoutId = setTimeout(() => {
								console.log("mouse enter");
								console.log(memoInputBox);
							}, delay);
						});
						bookmark.addEventListener("mouseleave", function () {
							if (contentBookmarkMouseenterTimeoutId) {
								clearTimeout(contentBookmarkMouseenterTimeoutId);
							}
						});
					}
					item.classList.add("ct_bks_bg", encodedContent);
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
