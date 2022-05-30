class MemoInputBox {
	/**
	 * @param {object} args
	 * @param {HTMLElementEventMap} args.event
	 * @param {string} args.top scrollTop position
	 * @param {string} args.tagName
	 * @param {string} args.encodedContent
	 */
	constructor({ event, top, tagName, encodedContent, color }) {
		this.bookmarkMessage = { tagName, encodedContent };
		this.inputBox;
		this.textarea;
		this.visible = true;
		this.top = top;
		this.create({ top, tagName, encodedContent, color });
	}
	create = ({ tagName, encodedContent, color }) => {
		let memoIdx = bookmarkList[bookmarkIdx].markList[tagName].indexOf(encodedContent);
		this.memo = bookmarkList[bookmarkIdx].memo[tagName][memoIdx];
		this.inputBox = document.createElement("div");
		document.body.append(this.inputBox);
		this.inputBox.innerHTML += "<textarea placeholder='memo...'/>";
		this.inputBox.classList.add("ct_bks_mm_ip_box");
		this.inputBox.style.top = this.top;
		this.inputBox.style.background = color;
		this.textarea = this.inputBox.getElementsByTagName("textarea")[0];
		this.textarea.value =
			memoIdx >= 0 && this.memo != null ? this.memo.split("<br/>").join("\n") : "";
		this.textarea.focus();
		this.inputBox.addEventListener("mouseup", function (e) {
			e.stopPropagation();
		});
		this.inputBox.addEventListener("click", function (e) {
			e.stopPropagation();
		});
		this.inputHandler();
	};
	inputHandler = () => {
		let self = this,
			timeId;
		this.textarea.addEventListener("keypress", function (e) {
			if (wordsCount(self.textarea.value) > 100) {
				e.preventDefault();
				alert("Please do not enter more than 100 words.");
				return;
			}
			if (timeId) {
				clearTimeout(timeId);
			}
			timeId = setTimeout(() => {
				self.textarea.value = e.target.value;
			}, 200);
		});
		this.textarea.addEventListener("paste", function (e) {
			if (wordsCount(e.clipboardData.getData("text")) + wordsCount(self.textarea.value) > 100) {
				e.preventDefault();
				alert("Please do not enter more than 100 words.");
				return;
			}
			self.textarea.value = e.target.value;
		});
	};
	remove = () => {
		let event;
		if (this.visible) {
			this.inputBox.remove();
			this.visible = false;
			if (this.textarea.value === "" || this.textarea.value.replaceAll(/[\n\r\s\t]+/g, "") === "") {
				this.textarea.value = "";
				this.remove();
			}
			event = new CustomEvent("save_content_bookmark_memo", {
				detail: { memo: this.textarea.value.split("\n").join("<br/>") },
			});
			window.dispatchEvent(event);
		}
	};
}

class MemoBox {
	constructor({ tagName, encodedContent, top, color }) {
		this.memoBox;
		this.memo;
		this.createMemoBox(tagName, encodedContent, top, color);
	}
	createMemoBox = (tagName, encodedContent, top, color) => {
		let memoIdx;
		memoIdx = bookmarkList[bookmarkIdx].markList[tagName].indexOf(encodedContent);
		this.memo = bookmarkList[bookmarkIdx].memo[tagName][memoIdx];
		this.memoBox = document.createElement("div");
		document.body.append(this.memoBox);
		this.memoBox.classList.add("ct_bks_mm_ip_box", "ct_bks_mm_box");
		this.memoBox.style.top = `${top}px`;
		this.memoBox.style.background = color;
		if (!Boolean(this.memo)) {
			this.memo = "memo...";
			this.memoBox.style.color = "darkgray";
		}
		this.memoBox.innerHTML += `<span style="line-height: normal">${this.memo}</span>`;
	};
	remove = () => {
		this.memoBox.remove();
	};
}

export { MemoInputBox, MemoBox };

function wordsCount(str) {
	var splittedStr = [...str];
	var arrayLength = splittedStr.length;
	var words = [];
	var englishWord = "";
	var i;
	for (i = 0; i < arrayLength; i += 1) {
		if (/^[a-zA-Z]+$/.test(splittedStr[i])) {
			englishWord += splittedStr[i];
		} else if (/(\s)+$/.test(splittedStr[i])) {
			if (englishWord !== "") {
				words.push(englishWord);
				englishWord = "";
			}
		} else {
			if (englishWord !== "") {
				words.push(englishWord);
				englishWord = "";
			}
			words.push(splittedStr[i]);
		}
	}
	if (englishWord !== "") {
		words.push(englishWord);
	}
	return words.length;
}
