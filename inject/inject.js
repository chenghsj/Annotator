// key === 'Control or e.ctrlKey' &&
// key === 'Alt' or e.altKey
// key === 'k' or e.code === 'KeyK' or keyCode: 75
// key === 'j' or e.code === 'KeyJ' or keyCode: 74
// key === 'l' or e.code === 'KeyL' or keyCode: 76

/**
 * @global
 */
var bookmarkList,
  bookmarkIdx,
  currentURL = window.location.href,
  scrollPositions = [],
  scrollPositionIdx = -1;

var isMac = window.navigator.platform.toLowerCase().indexOf("mac") >= 0,
  keyBinding = (e) => (isMac ? e.metaKey && e.altKey : e.ctrlKey && e.altKey);

var contentBookmarkTimeoutId = null,
  contentBookmarkScrollTimeoutId = null,
  contentBookmarkMouseenterTimeoutId = null,
  delay = 200;

var selectedText = "",
  prevSelectedText = "";

var bookmarkStyle = {
  background: "#fffdb1",
};

/**
 * @instance MemoInputBox
 */
var memoInputBox, memoBox, savedMemo;

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

/**
 * @param {Object} args
 * @param {HTMLElement} args.node
 * @param {string} args.type
 */
function detectNodeType({ node, type }) {
  while (node.parentNode) {
    if (node.tagName === type) return true;
    node = node.parentNode;
  }
  return false;
}

async function findDOMPositions(args) {
  let findDOMPositionsSrc = chrome.runtime.getURL("inject/findDOMPositions.js"),
    findDOMPositions = await import(findDOMPositionsSrc);
  return findDOMPositions.default(args);
}

async function bookMarkInit() {
  let items = await getAllStorageLocalData();
  bookmarkList = items.bookmarkList || [];
  console.log("Get Storage Data: ", bookmarkList);
  bookmarkIdx = bookmarkList.findIndex((item) => item.url === currentURL);
  if (bookmarkIdx < 0) return;
  scrollPositions = await findDOMPositions({ bookmarkList, tabUrl: currentURL });
  if (scrollPositions.length === 0) {
    setTimeout(() => {
      bookMarkInit();
    }, 200);
  }
  console.log(scrollPositions);
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === "SAVE_MEMO") {
    console.log(message.memo);
  }
  sendResponse();
  return true;
});

// remove bookmark and background color
async function removeBookMark({ tagName, encodedContent, all, url }) {
  if (all) {
    let marks = [...document.getElementsByClassName("ct_bks")];
    let bgAttrs = [...document.getElementsByClassName("ct_bks_bg")];
    marks.forEach((mark) => {
      mark.remove();
    });
    bgAttrs.forEach((attr) => {
      attr.classList.remove("ct_bks_bg");
      document.querySelectorAll("[data-encoded-content]").forEach((node) => {
        node.classList.remove("ct_bks_bg");
        delete node.dataset.encodedContent;
      });
    });
    return;
  }
  if (document.getElementById(tagName + encodedContent)) {
    document.getElementById(tagName + encodedContent).remove();
    let bgAttr = document.querySelector(`[data-encoded-content='${encodedContent}']`);
    bgAttr.classList.remove("ct_bks_bg");
    delete bgAttr.dataset.encodedContent;
  }
  scrollPositions = await findDOMPositions({ bookmarkList, tabUrl: url });
}

// remove bookmark when the current page is active
async function editBookmarkWithinPage({ tagName, encodedContent }) {
  let markList = bookmarkList[bookmarkIdx].markList;
  let memo = bookmarkList[bookmarkIdx].memo;
  // check if tagName exists
  if (markList[tagName]) {
    let encodedIdx = markList[tagName].indexOf(encodedContent);
    // check if encoded string exists
    if (encodedIdx < 0) {
      markList[tagName].push(encodedContent);
      memo[tagName].push(null);
    } else {
      markList[tagName].splice(encodedIdx, 1);
      memo[tagName].splice(encodedIdx, 1);
      removeBookMark({ tagName: tagName, encodedContent, url: currentURL });
      if (markList[tagName].length === 0) {
        delete markList[tagName];
        delete memo[tagName];
      }
      if (Object.keys(markList).length === 0) {
        bookmarkList.splice(bookmarkIdx, 1);
      }
    }
  } else {
    markList[tagName] = [encodedContent];
    memo[tagName] = [null];
  }
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  let items = await getAllStorageLocalData();
  bookmarkList = items.bookmarkList || [];
  console.log(bookmarkList);
  if (message.message === "UPDATE_TAB") {
    if (message.data == null) {
      removeBookMark({ all: true, url: message.url });
    } else {
      let { tagName, encodedContent } = message.data;
      removeBookMark({ tagName, encodedContent, url: message.url });
    }
  }
  sendResponse();
  return true;
});

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  let items = await getAllStorageLocalData();
  bookmarkList = items.bookmarkList || [];
  if (message.addBookMark) {
    let tab = message.tab;
    let encodedContent;
    let selectedString = window.getSelection().toString();
    if (!selectedString) {
      alert("Please select content outside the Iframe element");
      return;
    }
    let selectedElement = window.getSelection().anchorNode.parentElement;
    // preventing select any code element due to user may get the duplicate contents
    let isCodeTag = detectNodeType({ node: selectedElement, type: "CODE" });
    if (isCodeTag) {
      alert("Please select content outside the Code element");
      return;
    }
    let encodedSelectedContent = encodeString(selectedElement.innerText);

    encodedContent = [encodedSelectedContent.slice(0, 20).join(""), encodedSelectedContent.slice(-20).join("")].join("");
    bookmarkIdx = bookmarkList.findIndex((item) => item.url === currentURL);
    // check if url exists
    if (bookmarkIdx >= 0) {
      editBookmarkWithinPage({ tagName: selectedElement.tagName, encodedContent });
    } else {
      bookmarkList.push({
        title: document.querySelector("title").innerText,
        url: currentURL,
        iconUrl: tab.favIconUrl,
        markList: { [selectedElement.tagName]: [encodedContent] },
        memo: { [selectedElement.tagName]: [null] },
      });
    }
    scrollPositions = await findDOMPositions({ bookmarkList, tabUrl: currentURL });
    chrome.storage.local.set({ bookmarkList });
    console.log(scrollPositions);
    console.log("Save to Storage", bookmarkList);
  }
  sendResponse();
});

window.addEventListener("scroll", function (e) {
  if (!scrollPositions) return;
  if (contentBookmarkScrollTimeoutId) {
    clearTimeout(contentBookmarkScrollTimeoutId);
  }
  contentBookmarkScrollTimeoutId = setTimeout(function () {
    let DOMScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let absScrollPositions = scrollPositions.map((position) => Math.ceil(Math.abs(DOMScrollTop - position)));
    for (let value of absScrollPositions) {
      min = Math.min(min, value);
    }
    for (let value of absScrollPositions) {
      max = Math.max(max, value);
    }
    if (min > window.pageYOffset) {
      scrollPositionIdx = -1;
    } else if (max < window.pageYOffset && window.pageYOffset > scrollPositions[scrollPositions.length - 1]) {
      scrollPositionIdx = scrollPositions.length;
    } else {
      scrollPositionIdx = absScrollPositions.indexOf(min);
    }
    console.log(min, max, scrollPositionIdx, scrollPositions);
  }, delay);
});

window.addEventListener("keydown", function (e) {
  if (!scrollPositions) return;
  if (e.ctrlKey && e.shiftKey && e.code === "ArrowRight") {
    scrollPositionIdx++;
    if (scrollPositionIdx >= scrollPositions.length) {
      scrollPositionIdx = 0;
    }
    window.scrollTo({ top: scrollPositions[scrollPositionIdx], behavior: "smooth" });
  }
  if (e.ctrlKey && e.shiftKey && e.code === "ArrowLeft") {
    scrollPositionIdx--;
    if (scrollPositionIdx < 0) {
      scrollPositionIdx = scrollPositions.length - 1;
    }
    window.scrollTo({ top: scrollPositions[scrollPositionIdx], behavior: "smooth" });
  }
  if (e.code === "Enter") {
    //   memoInputBox?.remove();
  }
});

window.addEventListener("resize", function () {
  // scrollPositions = [];
  if (contentBookmarkTimeoutId) {
    clearTimeout(contentBookmarkTimeoutId);
  }
  contentBookmarkTimeoutId = setTimeout(function () {
    bookMarkInit();
    console.log(scrollPositions);
  }, delay);
});

window.addEventListener("mouseup", function (e) {
  getSelectedText();
});

window.addEventListener("click", function (e) {
  memoInputBox?.remove();
  console.log("click");
});

window.addEventListener("mouseenter", function (e) {
  memoBox?.remove();
});

window.addEventListener("save_content_bookmark_memo", function (e) {
  savedMemo = e.detail.memo;
  let { tagName, encodedContent } = memoInputBox.bookmarkMessage;
  if (bookmarkList[bookmarkIdx]) {
    let memoIdx = bookmarkList[bookmarkIdx]?.markList[tagName].indexOf(encodedContent);
    bookmarkList[bookmarkIdx].memo[tagName][memoIdx] = savedMemo;
    chrome.storage.local.set({ bookmarkList });
    console.log("Save to Storage", bookmarkList);
  }
});

function getSelectedText() {
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
    if (window.getSelection().toString().replace(/\s/g, "") && selectedText !== prevSelectedText) {
      console.log(window.getSelection().toString());
      prevSelectedText = selectedText;
    }
    return;
  } else if (document.selection) {
    return document.selection.createRange().text;
  }
  return "";
}

function logSelection(event) {
  // Get Selection
  sel = window.getSelection();
  if (sel.rangeCount && sel.getRangeAt) {
    range = sel.getRangeAt(0);
  }
  // Set design mode to on
  document.designMode = "on";
  if (range) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
  console.log(sel.anchorNode);
  // Colorize text
  document.execCommand("backColor", false, "yellow");
  // Set design mode to off
  document.designMode = "off";
}

bookMarkInit();

// chrome.storage.local.clear();

// select iframe will lose focus
