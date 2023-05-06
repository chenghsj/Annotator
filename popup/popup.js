// import sendMessageList from "../inject/sendMessageList";

var storage, bookmarkList, tempBookmarkList;
var optionBtn = document.getElementById("option_btn");
var bk_container = document.getElementById("bk_container");
var ct_bk_search = document.getElementById("ct_bk_search");

var searchInputValue,
	searchTimeoutId = null;

var sendMessageList;

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

async function getSendMessageList() {
	let sendMessageListSrc = chrome.runtime.getURL("inject/sendMessageList.js"),
		sendMessageList = await import(sendMessageListSrc);
	return sendMessageList.default;
}

/**
 * addEventListener
 * @param {HTMLElement} htmlElement
 * @param {MouseEvent} event
 * @param {function} cb
 */
function ael(htmlElement, event, cb) {
	htmlElement.addEventListener(event, function () {
		cb.apply(this, arguments);
	});
}

function tabsQuery(query) {
	return new Promise(function (resolve, reject) {
		chrome.tabs.query(query, function (tabs) {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			}
			resolve(tabs);
		});
	});
}

/**
 * @param {object} args
 * @param {object[]} args.list bookmark list
 * @param {object} args.query
 * @param {string} args.url
 * @param {object | null} args.data
 */
async function setThanRemove({ list, query, url, data }) {
	chrome.storage.local.set({ bookmarkList: list });
	let tabs = await tabsQuery(query);
	let tabIdx = tabs.findIndex((tab) => tab.url === url);
	if (tabIdx >= 0) {
		chrome.tabs.sendMessage(tabs[tabIdx].id, {
			message: sendMessageList.UPDATE_TAB,
			data,
			url: tabs[tabIdx].url,
		});
	}
	if (list.length === 0) window.close();
}

async function directToTab(bookmarkList, idx, contentFromPopup) {
	let tabs = await tabsQuery({ currentWindow: true });
	let tabIdx = tabs.findIndex((tab) => tab.url === bookmarkList[idx].url);

	if (tabIdx >= 0) {
		if (tabs[tabIdx].active) {
			// window.close();
			chrome.tabs.sendMessage(
				tabs[tabIdx]?.id,
				{ message: sendMessageList.SCROLL_TO_POSITION, tab: tabs[tabIdx], contentFromPopup },
				(response) => {}
			);
		} else {
			chrome.tabs.update(tabs[tabIdx].id, { active: true }, function () {});
		}
	} else {
		chrome.tabs.create({ url: bookmarkList[idx].url });
	}
}

async function content_bookmark_popup_init() {
	sendMessageList = await getSendMessageList();
	storage = await getAllStorageLocalData();
	bookmarkList = storage.bookmarkList;
	tempBookmarkList = bookmarkList;
	if (!bookmarkList) return;
	for (let i = 0; i < bookmarkList.length; i++) {
		/**
		 * remove from page list button
		 */
		let page_rm_btn, collapse_btn;
		let ulContainer = document.createElement("div");
		let titleContainer = document.createElement("div");
		let title = bookmarkList[i].title;
		let ul = document.createElement("ul");
		let markNum = 0,
			memoNum = 0;
		ulContainer.className = "bk_ul_container";
		ulContainer.id = "bk_ul_container_" + i;
		titleContainer.className = "bk_ul_tt_container";
		titleContainer.title = title;
		for (let tagName in bookmarkList[i].memo) {
			bookmarkList[i].memo[tagName].forEach((memo, idx) => {
				let rm_memo_btn;
				let li = document.createElement("li");
				li.id = bookmarkList[i].markList[tagName][idx];
				li.style.cursor = "pointer";
				if (!Boolean(memo)) {
					memo = "memo...";
					li.style.color = "gray";
				}
				li.innerHTML += `<span class="ct_bk_memo">${memo
					.replace(/</, "&lt;")
					.replace(/>/, "&gt;")}</span>${closeBtn("rm_memo_btn_" + tagName + idx)}`;
				memoNum++;
				li.title = memo;
				rm_memo_btn = li.getElementsByTagName("svg")[0];
				rm_memo_btn.dataset.tagName = tagName;
				rm_memo_btn.dataset.encodedContent = bookmarkList[i].markList[tagName][idx];
				ael(li, "click", async function () {
					await directToTab(bookmarkList, i, this.id);
				});
				ael(li, "mouseenter", function () {
					this.getElementsByClassName("ct_bk_rm_btn")[0].classList.add("show_rm_btn");
				});
				ael(li, "mouseleave", function () {
					this.getElementsByClassName("ct_bk_rm_btn")[0].classList.remove("show_rm_btn");
				});
				ael(li, "click", function () {});
				ael(rm_memo_btn, "click", async function () {
					let self = this;
					// console.log("clicked");
					document.getElementById(li.id).remove();
					let memoIdx = tempBookmarkList[i].markList[this.dataset.tagName].indexOf(
						this.dataset.encodedContent
					);
					let tabUrl = tempBookmarkList[i].url;
					tempBookmarkList[i].markList[this.dataset.tagName].splice(memoIdx, 1);
					tempBookmarkList[i].memo[this.dataset.tagName].splice(memoIdx, 1);
					if (tempBookmarkList[i].markList[this.dataset.tagName].length === 0) {
						delete tempBookmarkList[i].markList[this.dataset.tagName];
						delete tempBookmarkList[i].memo[this.dataset.tagName];
					}
					if (Object.keys(tempBookmarkList[i].markList).length === 0) {
						tempBookmarkList.splice(i, 1);
						document.getElementById(ulContainer.id).remove();
					}
					// console.log(tempBookmarkList);
					setThanRemove({
						list: tempBookmarkList,
						query: {},
						url: tabUrl,
						data: { tagName: self.dataset.tagName, encodedContent: self.dataset.encodedContent },
					});
				});
				ul.style.display = "block";
				ul.append(li);
				markNum++;
			});
		}
		let markIcon = bookmarkList[i].iconUrl
			? `<img class="ct_bk_icon" src=${bookmarkList[i].iconUrl}></img>`
			: blankIconPath;
		titleContainer.innerHTML += `<div class='bk_mm_collapse_container'><span class='bk_mm_collapse_btn'></span></div>${markIcon}<h4>${title
			.replace(/</, "&lt;")
			.replace(/>/, "&gt;")}</h4>${closeBtn("ct_bk_rm_btn_" + i)}`;
		page_rm_btn = titleContainer.getElementsByClassName("ct_bk_rm_btn")[0];
		page_rm_btn.dataset.url = bookmarkList[i].url;
		ael(titleContainer, "mouseenter", function () {
			page_rm_btn.classList.add("show_rm_btn");
		});
		ael(titleContainer, "mouseleave", function () {
			page_rm_btn.classList.remove("show_rm_btn");
		});
		ael(page_rm_btn, "click", async function (e) {
			tempBookmarkList = tempBookmarkList.filter((item) => item.url !== this.dataset.url);
			e.stopPropagation();
			document.getElementById(ulContainer.id).remove();
			// console.log(tempBookmarkList);
			setThanRemove({ list: tempBookmarkList, query: {}, url: this.dataset.url, data: null });
		});
		collapse_btn = titleContainer.getElementsByClassName("bk_mm_collapse_container")[0];
		ael(collapse_btn, "click", function (e) {
			e.stopPropagation();
			let display = ulContainer.getElementsByTagName("ul")[0].style.display;
			if (display === "block") {
				this.classList.add("mm_collapse");
				ulContainer.getElementsByTagName("ul")[0].style.display = "none";
			} else {
				this.classList.remove("mm_collapse");
				ulContainer.getElementsByTagName("ul")[0].style.display = "block";
			}
		});
		ael(titleContainer, "click", async function (e) {
			await directToTab(bookmarkList, i);
		});
		ulContainer.append(titleContainer, ul);
		bk_container.append(ulContainer);
	}
	// console.log(bookmarkList);

	ael(ct_bk_search, "keyup", function (e) {
		if (searchTimeoutId) {
			clearTimeout(searchTimeoutId);
		}
		searchTimeoutId = setTimeout(() => {
			searchInputValue = e.target.value.toLowerCase();
			let regexp = new RegExp(searchInputValue, "i");
			document.querySelectorAll(".bk_ul_container").forEach((ul_container) => {
				if (
					searchInputValue !== "" &&
					!regexp.test(ul_container.innerText.toLowerCase()) &&
					searchInputValue !== "" &&
					!regexp.test(ul_container.getElementsByTagName("ul")[0].innerText.toLocaleLowerCase())
				) {
					ul_container.style.display = "none";
				} else {
					ul_container.style.display = "block";
				}
			});
		}, 200);
	});
}

content_bookmark_popup_init();

var blankIconPath = `<svg class='ct_bk_blank_icon' width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0,0H24V24H0Z" data-name="Path 3637"/><path fill="#7c7c7c" d="M2939.848,964.01h5.2a3.748,3.748,0,0,1,3.06.9l3.672,3.6a3.078,3.078,0,0,1,1.224,2.7v10.2a1.818,1.818,0,0,1-1.836,1.8h-11.322a1.818,1.818,0,0,1-1.836-1.8v-15.6A1.819,1.819,0,0,1,2939.848,964.01Zm6.964,2.173a1.338,1.338,0,0,0-.232-.189v3.245a1.083,1.083,0,0,0,1.093,1.071h3.311a5.233,5.233,0,0,0-.5-.527Zm-6.964,15.227h11.322v-9.3h-3.5a2.9,2.9,0,0,1-2.929-2.871V965.81h-4.9Z" data-name="Color Fill 16 copy 7" transform="translate(-2933.512 -961.61)"/></svg>`;

function closeBtn(id) {
	return `<svg id=${id} class='ct_bk_rm_btn' width="24" height="24" fill="" viewBox="0 0 24 24"><path fill="" d="M7.05022 7.05028C6.65969 7.4408 6.65969 8.07397 7.05022 8.46449L10.5858 12L7.05023 15.5356C6.6597 15.9261 6.6597 16.5593 7.05023 16.9498C7.44075 17.3403 8.07392 17.3403 8.46444 16.9498L12 13.4142L15.5355 16.9498C15.926 17.3403 16.5592 17.3403 16.9497 16.9498C17.3402 16.5592 17.3402 15.9261 16.9497 15.5356L13.4142 12L16.9497 8.46449C17.3402 8.07397 17.3402 7.4408 16.9497 7.05028C16.5592 6.65976 15.926 6.65976 15.5355 7.05028L12 10.5858L8.46443 7.05028C8.07391 6.65975 7.44074 6.65975 7.05022 7.05028Z"/></svg>`;
}
