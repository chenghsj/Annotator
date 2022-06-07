import { MemoInputBox, MemoBox } from "./memo.js";

class Bookmark {
	/**
	 * @param {object} args
	 * @param {string} args.key tagName
	 * @param {string} args.encodedContent
	 * @param {integer} args.top
	 */
	constructor({ tagName, encodedContent, top, color }) {
		this.top = top;
		this.tagName = tagName;
		this.encodedContent = encodedContent;
		this.createBookmark({ tagName, encodedContent, color });
		this.tempBookmark;
	}
	createBookmark = ({ tagName, encodedContent, color }) => {
		let self = this;
		let span;
		this.bookmark = document.createElement("div");
		this.bookmark.id = tagName + encodedContent;
		this.bookmark.classList.add("ct_bks");
		document.body.append(this.bookmark);
		this.bookmark.style.top = `${this.top}px`;
		this.bookmark.style.background = color;
		span = document.createElement("span");
		span.style.borderRightColor = color;
		this.bookmark.append(span);

		this.bookmark.addEventListener("click", async function (e) {
			e.stopPropagation();
			if (
				memoInputBox?.visible &&
				this.tempBookmark &&
				deepEqual(memoInputBox.bookmarkMessage, this.tempBookmark)
			)
				return;
			memoInputBox?.remove();
			memoBox?.remove();
			memoInputBox = new MemoInputBox({
				event: e,
				top: `${self.top}px`,
				tagName,
				encodedContent,
				color: mm_bg_color,
			});
			this.tempBookmark = { tagName, encodedContent };
		});
		this.bookmark.addEventListener("dblclick", function (e) {
			//   removeBookMark({ tagName: self.tagName, encodedContent: self.encodedContent });
			editBookmarkWithinPage({ tagName: self.tagName, encodedContent: self.encodedContent });
			chrome.storage.local.set({ bookmarkList });
			this.remove();
			memoInputBox?.remove();
			memoBox?.remove();
		});
		this.bookmark.addEventListener("mouseenter", function () {
			if (memoInputBox?.visible) return;
			contentBookmarkMouseenterTimeoutId = setTimeout(() => {
				// console.log("mouse enter");
				memoBox = new MemoBox({
					top: self.top,
					tagName: self.tagName,
					encodedContent: self.encodedContent,
					color: mm_bg_color,
				});
			}, delay);
		});
		this.bookmark.addEventListener("mouseleave", function () {
			if (contentBookmarkMouseenterTimeoutId) {
				memoBox?.remove();
				clearTimeout(contentBookmarkMouseenterTimeoutId);
			}
		});
	};
	remove = () => {
		this.bookmark.remove();
	};
}

export default Bookmark;

function deepEqual(object1, object2) {
	const keys1 = Object.keys(object1);
	const keys2 = Object.keys(object2);
	if (keys1.length !== keys2.length) {
		return false;
	}
	for (const key of keys1) {
		const val1 = object1[key];
		const val2 = object2[key];
		const areObjects = isObject(val1) && isObject(val2);
		if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
			return false;
		}
	}
	return true;
}
function isObject(object) {
	return object != null && typeof object === "object";
}
