class MemoInputBox {
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
		this.inputBox.innerHTML += "<textarea maxlength='50' placeholder='memo...'/>";
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
			window.dispatchEvent(event);

			console.log(this.textarea.value);
			// chrome.tabs.sendMessage({ message: "SAVE_MEMO", memo: this.textarea.value }, (response) => {
			// 	if (chrome.runtime.lastError) {
			// 		console.error(chrome.runtime.lastError.message);
			// 	}
			// });
			this.remove();
		});
		document.getElementById("ct_bks_tt_n").addEventListener("click", this.remove);
	};
	remove = () => {
		this.visible = false;
		this.inputBox.remove();
	};
}

export default MemoInputBox;
