// const confirmBtn = "<div id='ct_bks_tt_y_container'><button id='ct_bks_tt_y'><div class='ct_bks_tt_y_stem'></div><div class='ct_bks_tt_y_kick'></div></button></div>";
// const closeBtn = "<button id='ct_bks_tt_n'><span class='ct_bks_tt_n_icon'></span></button>";

// this.inputBox.innerHTML += `<div class='ct_bks_btn_container'>${confirmBtn}${closeBtn}</div>`;

//   btnClickHandler = () => {
//     document.getElementById("ct_bks_tt_y_container").addEventListener("click", () => {
//       let event = new CustomEvent("save_content_bookmark_memo", {
//         detail: { memo: this.textarea.value },
//       });
//       if (this.textarea.value === "" || this.textarea.value.replaceAll(/[\n\r\s\t]+/g, "") === "") {
//         this.remove();
//         return;
//       }
//       window.dispatchEvent(event);
//       this.remove();
//     });
//     document.getElementById("ct_bks_tt_n").addEventListener("click", this.remove);
//   };

//   --------------- CSS -----------------------------------------------

/* .ct_bks_mm_ip_box .ct_bks_btn_container {
    display: flex;
    justify-content: space-evenly;
}

.ct_bks_btn_container button, #ct_bks_tt_y_container{
    font-size: 12px;
    border: none;
    border-radius: 4px;
    margin: 0;
    color: white;
    border-radius: 20px;
    width: 60px;
    cursor: pointer;
}

#ct_bks_tt_y_container{
    background: rgb(118 134 255);
    display: flex;
    justify-content: center;
}

#ct_bks_tt_y {    
    background: transparent;
    display: inline-block;
    width: 22px;
    height: 22px;
    -ms-transform: rotate(45deg); 
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
} */

/* .ct_bks_tt_y_stem {
    position: absolute;
    width:3px;
    height:9px;
    background-color:rgb(255, 255, 255);
    left:11px;
    top:6px;
}

.ct_bks_tt_y_kick {
    position: absolute;
    width:3px;
    height:3px;
    background-color:rgb(255, 255, 255);
    left:8px;
    top:12px;
}

#ct_bks_tt_y_container:hover {
    background: rgb(92 111 255);
}

#ct_bks_tt_y_container:active {
    background:  rgb(80 97 230);
}

.ct_bks_tt_n_icon {
    position: relative;
    display: inline-block;
    width: 11px;
    height: 11px;
    overflow: hidden;
}

.ct_bks_tt_n_icon:before,  .ct_bks_tt_n_icon:after{  
    content: "";
    position: absolute;
    height: 3px;
    width: 100%;
    top: 45%;
    left: 0;
    background: white;  
}

.ct_bks_tt_n_icon:before {
    transform: rotate(45deg);
}

.ct_bks_tt_n_icon:after {
    transform: rotate(-45deg);
}

#ct_bks_tt_n {
    background: rgb(164 164 164);
}

#ct_bks_tt_n:hover {
    background: rgb(132, 132, 132);
}
#ct_bks_tt_n:active {
    background: rgb(117, 117, 117);
} */
