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
    this.create({ top, tagName, encodedContent });
  }
  create = ({ top, tagName, encodedContent }) => {
    let memoIdx = bookmarkList[bookmarkIdx].markList[tagName].indexOf(encodedContent);
    this.memo = bookmarkList[bookmarkIdx].memo[tagName][memoIdx];
    this.inputBox = document.createElement("div");
    document.body.append(this.inputBox);
    this.inputBox.innerHTML += "<textarea maxlength='150' placeholder='memo...'/>";
    this.inputBox.classList.add("ct_bks_mm_ip_box");
    this.inputBox.style.top = top;
    this.textarea = this.inputBox.getElementsByTagName("textarea")[0];
    this.textarea.value = memoIdx >= 0 && this.memo != null ? this.memo.split("<br/>").join("\n") : "";
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
    this.memoBox.classList.add("ct_bks_mm_ip_box", "ct_bks_mm_box");
    this.memoBox.style.top = `${top}px`;
    if (!Boolean(this.memo)) {
      this.memo = "memo...";
      this.memoBox.style.color = "darkgray";
    }
    this.memoBox.innerHTML += `<span style="line-height: 1rem">${this.memo}</span>`;
  };
  remove = () => {
    this.memoBox.remove();
  };
}

export { MemoInputBox, MemoBox };
