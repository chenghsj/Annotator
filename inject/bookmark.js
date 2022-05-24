import { MemoInputBox, MemoBox } from "./memoInputBox.js";
class Bookmark {
	/**
	 * @param {object} args
	 * @param {string} args.key tagName
	 * @param {string} args.encodedContent
	 * @param {integer} args.top
	 */
	constructor({ key, encodedContent, top }) {
		this.top = top;
		this.key = key;
		this.encodedContent = encodedContent;
		this.createBookmark({ key, encodedContent });
	}
	createBookmark = ({ key, encodedContent }) => {
		let self = this;
		let bookmark = document.createElement("div");
		bookmark.id = key + encodedContent;
		bookmark.classList.add("ct_bks");
		document.body.append(bookmark);
		bookmark.style.top = `${this.top}px`;
		bookmark.addEventListener("click", async function (e) {
			memoInputBox = new MemoInputBox({
				event: e,
				top: bookmark.style.top,
				tagName: key,
				encodedContent,
			});
			if (memoBox != null) {
				memoBox.remove();
			}
		});
		bookmark.addEventListener("mouseenter", function () {
			if (memoInputBox?.visible) return;
			contentBookmarkMouseenterTimeoutId = setTimeout(() => {
				console.log("mouse enter");
				memoBox = new MemoBox({
					top: self.top,
					tagName: self.key,
					encodedContent: self.encodedContent,
				});
			}, delay);
		});
		bookmark.addEventListener("mouseleave", function () {
			if (contentBookmarkMouseenterTimeoutId) {
				memoBox.remove();
				clearTimeout(contentBookmarkMouseenterTimeoutId);
			}
		});
	};
	setTop = (top) => {
		this.top = top;
	};
}

export default Bookmark;
