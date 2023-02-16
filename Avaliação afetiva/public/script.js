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
const btnCadastrarAvaliacao = document.getElementById("btn-cadastrar-avaliacao");
const pergunta = document.getElementById("pergunta")
const aBtnConfirmar = document.getElementById("link-btn-confirmar")
const novaAvalicao = document.getElementById("nova-avaliacao")
const encerraAvaliacao = document.getElementById("encerrar-avaliacao")
const eGenderMasc = document.getElementById("masc")
const eGenderFem = document.getElementById("fem")

//console.log(btnCadastrarAvaliacao)
//const btnConfirmarData = document.getElementById("btn-confirmar-data")


let cor;
let eClicked;
let genderClicked;
let nomeOficina;
let localOficina;
let qtdeResposta=0
let userAge;

let logData;

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
  if (cor === "black") {
    btnConfirmar.style.color = "white"
  } else {
    btnConfirmar.style.color = "black"
  }
  btnConfirmar.style.background = cor
};

const cadastrarAvaliacao = (event) => {
  nomeOficina = document.getElementById("nome-oficina").value;
  localOficina = document.getElementById("local-oficina").value;
  socket.emit("criarLog", `${nomeOficina} - ${localOficina}`);
  btnCadastrarAvaliacao.disabled = true;
};

const confirmarEA = () => {
  if (qtdeResposta === 1) {
    qtdeResposta = 0
    aBtnConfirmar.href = "#agradecimento"
  } else {
    btnConfirmar.style.color = "gray"
    btnConfirmar.style.background = "rgb(241, 240, 240)"
    btnConfirmar.disabled = true;
    pergunta.innerText= 'Como você acha que o Instint estava se sentindo?'
    qtdeResposta++;
    document
    .getElementById("emoji-" + eClicked)
    .classList.remove("emoji-selecionado");
   
  }
}

const registrarEstadoAfetivo = () => {
  socket.emit("registrarLog", eClicked);
};


const iniciarNovaAvaliacao = () => {
  qtdeResposta = 0;
  btnConfirmar.disabled = true
  aBtnConfirmar.href = "#avaliacao1"
  btnConfirmar.style.color = "gray"
  btnConfirmar.style.background = "rgb(241, 240, 240)"
  pergunta.innerText= 'Como você está se sentindo?'
  document
  .getElementById("emoji-" + eClicked)
  .classList.remove("emoji-selecionado");
}

const emojiGenderMascSelecionado = () => {
  document.getElementById("masc").classList.add("emoji-selecionado");
  document.getElementById("fem").classList.remove("emoji-selecionado");
  genderClicked = "masc"
}

const emojiGenderFemSelecionado = () => {
  document.getElementById("fem").classList.add("emoji-selecionado");
  document.getElementById("masc").classList.remove("emoji-selecionado");
  genderClicked = "fem"
}

const confirmarDadosUsuario = () => {
  alert()
//   logData = `${genderClicked};${userAge.document.getElementById("idade").value};`
//   //console.log(logData)
  
//   socket.emit('teste', logData)
// }
}


const encerrarAvaliacao = () => {
    iniciarNovaAvaliacao();
    btnCadastrarAvaliacao.disabled = false;
    document.getElementById("nome-oficina").value = ""
    document.getElementById("local-oficina").value= ""

    
}

//------------------------

emojiClicked.addEventListener("click", estadoAfetivo);
eGenderMasc.addEventListener("click", emojiGenderMascSelecionado);
eGenderFem.addEventListener("click", emojiGenderFemSelecionado);

btnConfirmar.addEventListener("click", registrarEstadoAfetivo);
btnConfirmar.addEventListener("click", confirmarEA)
//btnConfirmarData.addEventListener("click", confirmarDadosUsuario)
//btnConfirmar.addEventListener("mouseover", alterarHover);
//btnConfirmar.addEventListener("mouseout", voltarPadrao);
btnCadastrarAvaliacao.addEventListener("click", cadastrarAvaliacao);

//btnConfirmarEA.addEventListener("click", confirmarEA)

novaAvalicao.addEventListener("click", iniciarNovaAvaliacao)
encerraAvaliacao.addEventListener("click", encerrarAvaliacao)


//---------------------------------- Não usado

// const alterarHover = () => {
//   if (btnConfirmar.disabled === false) {
//     btnConfirmar.style.background = cor;
//   }
// };

// const voltarPadrao = () => {
//   if (btnConfirmar.disabled === false) {
//     btnConfirmar.style.background = "white";
//   }
// };