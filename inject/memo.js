class MemoInputBox {
	/**
	 * @param {object} args
	 * @param {HTMLElementEventMap} args.event
	 * @param {string} args.top scrollTop position
	 * @param {string} args.tagName
	 * @param {string} args.encodedContent
	 */
	constructor({ event, top, tagName, encodedContent }) {
		this.bookmarkMessage = { tagName, encodedContent };
		this.inputBox;
		this.textarea;
		this.visible = true;
		this.create(top);
	}
	create = (top) => {
		this.inputBox = document.createElement("div");
		document.body.append(this.inputBox);
		this.inputBox.innerHTML += "<textarea maxlength='150' placeholder='memo...'/>";
		this.inputBox.innerHTML +=
			"<div class='ct_bks_btn_container'><button id='ct_bks_tt_y'>YES</button><button id='ct_bks_tt_n'>NO</button></div>";
		this.inputBox.classList.add("ct_bks_ip_box");
		this.inputBox.style.top = top;
		this.textarea = this.inputBox.getElementsByTagName("textarea")[0];
		this.textarea.focus();
		this.inputBox.addEventListener("mouseup", function (e) {
			e.stopPropagation();
		});
		this.btnClickHandler();
		this.inputHandler();
	};
	inputHandler = () => {
		let self = this,
			timeId;
		this.textarea.addEventListener("keyup", function (e) {
			if (timeId) {
				clearTimeout(timeId);
			}
			timeId = setTimeout(() => {
				self.textarea.value = e.target.value;
				console.log(self.textarea.value);
			}, 200);
		});
	};
	btnClickHandler = () => {
		document.getElementById("ct_bks_tt_y").addEventListener("click", () => {
			let event = new CustomEvent("save_content_bookmark_memo", {
				detail: { memo: this.textarea.value },
			});
			if (this.textarea.value === "" || this.textarea.value.replaceAll(" ", "") === "") {
				this.remove();
				return;
			}
			window.dispatchEvent(event);
			this.remove();
		});
		document.getElementById("ct_bks_tt_n").addEventListener("click", this.remove);
	};
	remove = () => {
		this.visible = false;
		this.inputBox.remove();
	};
}

class MemoBox {
	constructor({ tagName, encodedContent, top }) {
		this.memoBox;
		this.memo;
		this.createMemoBox(tagName, encodedContent, top);
	}
	createMemoBox = (tagName, encodedContent, top) => {
		let memoIdx;
		memoIdx = bookmarkList[bookmarkIdx].markList[tagName].indexOf(encodedContent);
		this.memo = bookmarkList[bookmarkIdx].memo[tagName][memoIdx];
		this.memoBox = document.createElement("div");
		document.body.append(this.memoBox);
		this.memoBox.classList.add("ct_bks_ip_box", "ct_bks_mm_box");
		this.memoBox.style.top = `${top}px`;
		if (this.memo == null) {
			this.memo = "memo...";
			this.memoBox.style.color = "darkgray";
		}
		this.memoBox.innerHTML += `<span>${this.memo}</span>`;
	};
	remove = () => {
		this.memoBox.remove();
	};
}

export { MemoInputBox, MemoBox };
