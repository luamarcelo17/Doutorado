"use strict";

const emojiClicked = document.querySelector(".emojis");
const eAfetivo = document.querySelectorAll(".btn-emoji");
const btnConfirmar = document.querySelector(".btn-confirmar");

let cor;
btnConfirmar.disabled = true;

const changeColor = {
  feliz: () => (cor = "rgb(243, 239, 5)"),
  calmo: () => (cor = "rgb(0,194,0)"),
  triste: () => (cor = "rgb(18,170,245)"),
  medo: () => (cor = "black"),
  sonolento: () => (cor = "rgb(195, 195, 195)"),
  bravo: () => (cor = "rgb(196,0,0)"),
};

const estadoAfetivo = (event) => {
  //console.log("emoji-" + event.target.alt);
  eAfetivo.forEach((emoji) => {
    if (event.target.alt === emoji.value) {
      document
        .getElementById("emoji-" + event.target.alt)
        .classList.add("emoji-selecionado");
      changeColor[emoji.value]();
    } else {
      document
        .getElementById("emoji-" + emoji.value)
        .classList.remove("emoji-selecionado");
    }
  });
  btnConfirmar.disabled = false;
};

const registrarEstadoAfetivo = (event) => {};

const alterarHover = () => {
  if (btnConfirmar.disabled === false) {
    btnConfirmar.style.background = cor;
  }
};

const voltarPadrao = () => {
  if (btnConfirmar.disabled === false) {
    btnConfirmar.style.background = "white";
  }
};

emojiClicked.addEventListener("click", estadoAfetivo);
btnConfirmar.addEventListener("mouseover", alterarHover);
btnConfirmar.addEventListener("mouseout", voltarPadrao);
