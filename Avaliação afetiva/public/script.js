"use strict";

var socket = io.connect();
socket.connect("http://localhost:3000");

socket.on("connect", function () {
  console.log(socket.id + "conectado");
  //O que fazer quando conectar?
});

//socket.emit("criarLog", "Instint-1");

//--------------------------------------------------------

const emojiClicked = document.querySelector(".emojis");
const eAfetivo = document.querySelectorAll(".btn-emoji");
const btnConfirmar = document.querySelector(".btn-confirmar");
const btnCadastrarAvaliacao = document.getElementById(
  "btn-cadastrar-avaliacao"
);

let cor;
let eClicked;
let nomeOficina;
let localOficina;
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
      eClicked = emoji.value;
    } else {
      document
        .getElementById("emoji-" + emoji.value)
        .classList.remove("emoji-selecionado");
    }
  });
  btnConfirmar.disabled = false;
};

const cadastrarAvaliacao = (event) => {
  nomeOficina = document.getElementById("nome-oficina").value;
  localOficina = document.getElementById("local-oficina").value;
  socket.emit("criarLog", `${nomeOficina} - ${localOficina}`);
  btnCadastrarAvaliacao.disabled = true;
};

const registrarEstadoAfetivo = (event) => {
  socket.emit("registrarLog", eClicked);
};

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
btnConfirmar.addEventListener("click", registrarEstadoAfetivo);
btnConfirmar.addEventListener("mouseover", alterarHover);
btnConfirmar.addEventListener("mouseout", voltarPadrao);
btnCadastrarAvaliacao.addEventListener("click", cadastrarAvaliacao);
