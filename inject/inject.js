// key === 'Control or e.ctrlKey' &&
// key === 'Alt' or e.altKey
// key === 'k' or e.code === 'KeyK' or keyCode: 75
// key === 'j' or e.code === 'KeyJ' or keyCode: 74
// key === 'l' or e.code === 'KeyL' or keyCode: 76

var selectedText, bookmarkList;

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

// async function cloneObject(args) {
//   funcSrc = chrome.runtime.getURL("helper/cloneFunction.js");
//   fun = await import(funcSrc);
//   return fun.cloneObject(args);
// }

async function bookMarkInit() {
  let items = await getAllStorageLocalData();
  bookmarkList = items.bookmarkList || [];
  console.log(bookmarkList);
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.addBookMark) {
    console.log(message.tab);
    let tab = message.tab;
    let firstTenEncodedContent, lastTenEncodedContent;
    let firstTenEncodedURL, lastTenEncodedURL;
    let encodedContent,
      encodedContents = [],
      encodedURLs = [];
    let encodedSelectedContent = encodeString(window.getSelection().anchorNode.parentElement.innerText);
    let encodedURL = [encodeString(tab.url).slice(0,10), encodeString(tab.url).slice(0,10)];

    firstTenEncodedContent = encodedSelectedContent.slice(0, 10).join("");
    lastTenEncodedContent = encodedSelectedContent.slice(-10).join("");

    firstTenEncodedURL = encodedURL.slice(0, 10).join("");
    lastTenEncodedURL = encodedURL.slice(-10).join("");

    encodedContents.push(firstTenEncodedContent, lastTenEncodedContent);
    encodedURLs.push(firstTenEncodedURL, lastTenEncodedURL);
    console.log(encodedContents);
    bookmarkList.forEach((item) => {
      if (item.encodedURL === encodedURLs.join()) {
        item.marks.indexOf(encodedContents.join(""));
      }
    });
    bookmarkList.push({
      encodedURL: encodedURLs.join(""),
      marks: [encodedContents],
    });
    // [tab.url] = encodedArr;

    chrome.storage.local.set({ bookmarkList });
  }
  sendResponse();
});

// chrome.storage.local.clear();

window.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.altKey && e.code === "KeyK") {
  }
});

bookMarkInit();
