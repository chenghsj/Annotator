let colorList = {
  ct_bg_color: "",
  ct_text_color: "",
  ct_bg_color_alpha: "",
  bm_bg_color: "",
  bm_bg_color_alpha: "",
  mm_bg_color: "",
  mm_bg_color_alpha: "",
  mm_text_color: "",
  mm_text_color_alpha: "",
};
const contentBgColor = document.getElementById("ct_bg_color");
const contentTextColor = document.getElementById("ct_text_color");
const bookmarkBgColor = document.getElementById("bm_bg_color");
const memoBgColor = document.getElementById("mm_bg_color");
const memoTextColor = document.getElementById("mm_text_color");
const inputList = [contentBgColor, contentTextColor, bookmarkBgColor, memoBgColor, memoTextColor];

const contentBgColorAlpha = document.getElementById("ct_bg_color_alpha");
const bookmarkBgColorAlpha = document.getElementById("bm_bg_color_alpha");
const memoBgColorAlpha = document.getElementById("mm_bg_color_alpha");
const memoTextColorAlpha = document.getElementById("mm_text_color_alpha");
const inputAlphaList = [
  contentBgColorAlpha,
  bookmarkBgColorAlpha,
  memoBgColorAlpha,
  memoTextColorAlpha,
];

const reloadType = document.getElementById("reload_type");
const confirmMessage = document.getElementById("confirm_message");
const confirmPageMask = document.getElementById("confirm_page_mask");
const confirmBtn = document.getElementById("confirm_btn");
const cancelBtn = document.getElementById("cancel_btn");
const resetBtn = document.getElementById("reset_btn");
const colorStatus = document.getElementById("status");

const defaultColorList = {
  ct_bg_color: "#e5fffb",
  ct_text_color: "#000000",
  ct_bg_color_alpha: "1",
  bm_bg_color: "#808eff",
  bm_bg_color_alpha: "1",
  mm_bg_color: "#ffff8a",
  mm_bg_color_alpha: "1",
  mm_text_color: "#000000",
  mm_text_color_alpha: "1",
};

const unSavedMessage = "Press Save to save changes.";

function init() {
  inputList.forEach((el) => {
    el.addEventListener("change", function (e) {
      colorList[e.target.id] = e.target.value;
      setPreviewColor(e.target);
      if (e.target.id !== "ct_text_color") {
        document.getElementById(`${e.target.id}_alpha`).value = 1;
      }
      colorStatus.textContent = unSavedMessage;
    });
  });
  inputAlphaList.forEach((el) => {
    el.addEventListener("change", function (e) {
      colorList[e.target.id] = e.target.value;
      setPreviewColorAlpha(e.target);
      colorStatus.textContent = unSavedMessage;
    });
  });

  resetBtn.addEventListener("click", function (e) {
    const checkColorIsDefault = inputList.every((el) => el.value === defaultColorList[el.id]);
    const checkColorAlphaIsDefault = inputAlphaList.every((el) => el.value === "1");

    if (checkColorIsDefault && checkColorAlphaIsDefault) return;
    colorStatus.textContent = unSavedMessage;

    inputList.forEach((el) => {
      el.value = defaultColorList[el.id];
      setPreviewColor(el);
    });
    inputAlphaList.forEach((el) => {
      el.value = 1;
    });
    colorList = { ...defaultColorList };
  });

  document.addEventListener("DOMContentLoaded", onLoaded);
  document.getElementById("save").addEventListener("click", save_options);
  document.getElementById("reload_all").addEventListener("click", reload_tabs);
}

function setPreviewColor(element) {
  if (`${element.id}_preview` === "mm_text_color_preview") {
    document.getElementById(`${element.id}_preview`).style.color = element.value;
  } else if (`${element.id}_preview` === "ct_text_color_preview") {
    document.getElementById(`${element.id}_preview`).style.color = element.value;
  } else {
    if (`${element.id}_preview` === "bm_bg_color_preview") {
      document.getElementById(`${element.id}_preview`).children[0].style.borderRightColor =
        element.value;
    }
    document.getElementById(`${element.id}_preview`).style.background = element.value;
  }
}

function setPreviewColorAlpha(element) {
  const elementID = element.id.replace("_alpha", "");
  const el = document.getElementById(`${elementID}_preview`);

  const replaceColor = (prop) => {
    let color = prop.replace(")", "").split(",");
    color[3] = `${element.value})`;
    colorList[`${elementID}`] = color.join(",");
    return color.join(",");
  };

  if (`${elementID}_preview` === "mm_text_color_preview") {
    el.style.color = replaceColor(el.style.color);
  } else {
    if (`${elementID}_preview` === "bm_bg_color_preview") {
      el.children[0].style.borderRightColor = replaceColor(el.children[0].style.borderRightColor);
    }
    el.style.backgroundColor = replaceColor(el.style.backgroundColor);
  }
}

function onLoaded() {
  chrome.storage.local.get({ colorList: { ...defaultColorList } }, function (items) {
    inputList.forEach((el) => {
      if (items.colorList[el.id].startsWith("rgb")) {
        el.value = rgbToHex(items.colorList[el.id]);
        colorList[el.id] = rgbToHex(items.colorList[el.id]);
      } else {
        el.value = items.colorList[el.id] ? items.colorList[el.id] : 1;
        colorList[el.id] = items.colorList[el.id];
      }
      setPreviewColor(el);
    });
    inputAlphaList.forEach((el) => {
      el.value = items.colorList[`${el.id}`];
      colorList[el.id] = items.colorList[el.id];
      setPreviewColorAlpha(el);
    });
  });
}

function save_options() {
  chrome.storage.local.set(
    {
      colorList,
    },
    function () {
      colorStatus.textContent = "Options saved. Reload pages to apply changes.";
    }
  );
}

function reload_tabs() {
  if (reloadType.value == "current") {
    confirmMessage.textContent = "Are you sure you want to reload all pages of current window?";
  } else {
    confirmMessage.textContent = "Are you sure you want to reload all pages of all windows?";
  }
  confirmPageMask.style.display = "block";

  confirmBtn.addEventListener("click", function () {
    let query = reloadType.value == "current" ? { currentWindow: true } : {};
    chrome.tabs.query(query, function (tabs) {
      // console.log(tabs);
      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id);
      });
    });
  });
  cancelBtn.addEventListener("click", function () {
    confirmPageMask.style.display = "none";
  });
}

init();

// ----------------------helper---------------------------

function rgbToHex(rgba) {
  const convertToRGBArray = (rgba) => {
    let result;
    if (!rgba.includes("rgba")) {
      result = rgba.replace("rgb(", "").replace(")", "").split(",").slice(0, 3);
    } else {
      result = rgba.replace("rgba(", "").replace(")", "").split(",").slice(0, 3);
    }
    return result;
  };

  const componentToHex = (c) => {
    const hex = parseInt(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  const rgb = convertToRGBArray(rgba);
  return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}
