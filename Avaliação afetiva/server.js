const express = require("express");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + "/public"));

let nome_arquivo;
let path;

io.on("connection", (socket) => {
  //apenas para mostrar se ouve uma nova conexão
  console.log("new connection", socket.id); // mostra o id da conexão

  socket.on("criarLog", (nomeOficina, dado) => {
    nome_arquivo = `/Logs/${nomeOficina}.csv`;
    path = __dirname + `${nome_arquivo}`;
    escreverLog(path, dado);
  });

  socket.on("registrarLog", (dado) => {
    escreverLog(path, "\n" + dado);
  });

  socket.on("teste", (dado) => {
    console.log(dado);
  });
});

http.listen(3000, function () {
  console.log("Hello word: 3000");
});

//-----------------------------------------------
const fs = require("fs");

//let nome_arquivo = "/Logs/tabuada.txt";

function criarArquivo(caminho, texto) {
  fs.appendFile(caminho, texto, function (error) {
    if (error) {
      console.error("erro de escrita");
    } else {
      console.log("sucesso");
    }
  });
}

function escreverLog(caminho, texto) {
  fs.appendFileSync(caminho, texto, function (error) {
    if (error) {
      console.error("erro de escrita");
    } else {
      console.log("sucesso");
    }
  });
}

// escreverLog(path, "Tabuada do 12");
// for (let i = 1; i < 11; i++) {
//   let a = i * 12;
//   escreverLog(path, `\n${i} x 12 = ` + String(a));
// }
