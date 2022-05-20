// key === 'Control or e.ctrlKey' &&
// key === 'Alt' or e.altKey
// key === 'k' or e.code === 'KeyK' or keyCode: 75
// key === 'j' or e.code === 'KeyJ' or keyCode: 74
// key === 'l' or e.code === 'KeyL' or keyCode: 76

/**
 [
    {
      markList: {
        'p': [content1, content2, ...],
        'a': [content1, content2, ...],
      }
      markList: [
        { encodedContent, type },
        { encodedContent, type },
      ],
      title,
      url,
      memo,
    },
  ];
 */

var selectedText,
  bookmarkList,
  currentURL = window.location.href,
  hasBookmark,
  bookmarkIdx,
  scrollPositions = [],
  scrollPositionIdx = -1,
  DOMScrollTop = document.documentElement.scrollTop || document.body.scrollTop;

var currentBookmarks = [],
  tag_count = {};

var contentBookmarkTimeoutId = null;

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

// get dom elements by stored bookmarks
function findDOMPositions() {
  let tagList;
  bookmarkIdx = bookmarkList.findIndex((item) => item.url === currentURL);
  tagList = bookmarkList[bookmarkIdx].markList;
  let positions = [];
  for (let key in tagList) {
    let DOMqueryList = [...document.querySelectorAll(key)];
    DOMqueryList.forEach((item) => {
      encodedContent = [encodeString(item.innerText).slice(0, 20).join(""), encodeString(item.innerText).slice(-20).join("")].join("");
      tagList[key].forEach((content) => {
        if (content === encodedContent) {
          item.style.background = "#fffdb1";
          positions.push(getOffsetTop(item));
          console.log(`${item.offsetTop}, ${DOMScrollTop}`);
        }
      });
    });
  }
  positions.sort(function (a, b) {
    return a - b;
  });
  return positions;
}

async function bookMarkInit() {
  let items = await getAllStorageLocalData();
  bookmarkList = items.bookmarkList || [];
  console.log("Get Storage Data: ", bookmarkList);
  bookmarkIdx = bookmarkList.findIndex((item) => item.url === currentURL);
  if (bookmarkIdx < 0) return;

  scrollPositions = findDOMPositions();
  console.log(scrollPositions);
}

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  let items = await getAllStorageLocalData();
  bookmarkList = items.bookmarkList || [];
  if (message.addBookMark) {
    // let tab = message.tab;
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
      let tagList = bookmarkList[bookmarkIdx].markList;
      // check if tagName exists
      if (tagList[selectedElement.tagName]) {
        // check if encoded string exists
        if (tagList[selectedElement.tagName].indexOf(encodedContent) < 0) {
          tagList[selectedElement.tagName].push(encodedContent);
        }
      } else {
        tagList[selectedElement.tagName] = [encodedContent];
      }
    } else {
      bookmarkList.push({
        title: document.querySelector("title").innerText,
        url: currentURL,
        markList: { [selectedElement.tagName]: [encodedContent] },
      });
    }
    if (scrollPositions.indexOf(getOffsetTop(selectedElement)) < 0) {
      scrollPositions.push(getOffsetTop(selectedElement));
      selectedElement.style.background = "#fffdb1";
    } else {
      alert("This content had been added already.");
      return;
    }
    scrollPositions.sort(function (a, b) {
      return a - b;
    });
    // scrollPositions = findDOMPositions();
    chrome.storage.local.set({ bookmarkList });
    console.log(scrollPositions);
    console.log("Save to Storage", bookmarkList);
  }
  sendResponse();
});

// chrome.storage.local.clear();

// if (document.activeElement.tagName == "IFRAME") {
//   document.activeElement.blur();
// }

window.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.code === "ArrowRight") {
    scrollPositionIdx++;
    if (scrollPositionIdx >= scrollPositions.length) {
      scrollPositionIdx = 0;
    }
    window.scrollTo({ top: scrollPositions[scrollPositionIdx], behavior: "instant" });
  }
  if (e.ctrlKey && e.code === "ArrowLeft") {
    scrollPositionIdx--;
    if (scrollPositionIdx < 0) {
      scrollPositionIdx = scrollPositions.length - 1;
    }
    window.scrollTo({ top: scrollPositions[scrollPositionIdx], behavior: "instant" });
  }
});

window.addEventListener("resize", function () {
  scrollPositions = [];
  if (contentBookmarkTimeoutId) {
    clearTimeout(contentBookmarkTimeoutId);
  }
  contentBookmarkTimeoutId = setTimeout(function () {
    bookMarkInit();
    console.log(scrollPositions);
  }, 200);
});

bookMarkInit();

// select iframe will lose focus
