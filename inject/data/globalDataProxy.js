import globalData from "./globalData.js";

class GlobalDataProxy {
  constructor() {
    this.globalData = new globalData();
    GlobalDataProxy.instance = this;
  }

  get bookmarkList() {
    return this.globalData.bookmarkList;
  }

  set bookmarkList(value) {
    this.globalData.bookmarkList = value;
  }

  get bookmarkIdx() {
    return this.globalData.bookmarkIdx;
  }

  set bookmarkIdx(value) {
    this.globalData.bookmarkIdx = value;
  }

  get memoInputBox() {
    return this.globalData.memoInputBox;
  }

  set memoInputBox(value) {
    this.globalData.memoInputBox = value;
  }

  get memoBox() {
    return this.globalData.memoBox;
  }

  set memoBox(value) {
    this.globalData.memoBox = value;
  }

  get savedMemo() {
    return this.globalData.savedMemo;
  }

  set savedMemo(value) {
    this.globalData.savedMemo = value;
  }

  get bm_bg_color() {
    return this.globalData.bm_bg_color;
  }

  set bm_bg_color(value) {
    this.globalData.bm_bg_color = value;
  }

  get ct_bg_color() {
    return this.globalData.ct_bg_color;
  }

  set ct_bg_color(value) {
    this.globalData.ct_bg_color = value;
  }

  get mm_bg_color() {
    return this.globalData.mm_bg_color;
  }

  set mm_bg_color(value) {
    this.globalData.mm_bg_color = value;
  }

  static getInstance() {
    return (GlobalDataProxy.instance = GlobalDataProxy.instance || new GlobalDataProxy());
  }
}

export default GlobalDataProxy;
