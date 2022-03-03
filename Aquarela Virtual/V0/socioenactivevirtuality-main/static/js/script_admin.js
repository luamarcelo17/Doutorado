var socketadm = io.connect('//' + document.domain + ':' + location.port + '/desenho');
const print = msg =>{console.log(msg)}
let lista_participantes = document.getElementById("lista_participantes");
let lista_fotos = document.getElementById("lista-fotos");
ids_logados = []


var numFotos = document.querySelectorAll("li").length;
var fotosMovidas = 0;
var fotosSelecionadas = 0;
var tempoFoto = 0;
let btnExcluirFotos = document.getElementById("btnExcluirSelecao");

socketadm.on('connect', function (){socketadm.emit('joined-admin', {'admim':'admin'});});
socketadm.on('status', function (msg){print(msg)});
socketadm.on('adicionar-participante', participante => {createButton(participante)} );

socketadm.on('inicia-presente-admin', listaParticipantes =>{
    listaParticipantes.forEach(participante=>{
        createButton(participante);
    });
  });

socketadm.on('remover-participante-admin', function (id){
    removeLogado(id)
});

socketadm.on('btn-encerrar', data =>{
    if (data.encerrar){
        document.getElementById("btnTerminar").style.background="#e67979";
        document.getElementById("btnTerminar").style.color="black";
        document.getElementById("btnTerminar").innerHTML="Reiniciar Oficina";
        document.getElementById("btnTerminar").setAttribute("value", "REINICIAR A OFICINA");
    }else{
        document.getElementById("btnTerminar").style.background="#34a853ff";
        document.getElementById("btnTerminar").style.color="white";
        document.getElementById("btnTerminar").innerHTML="Encerrar Oficina";
        document.getElementById("btnTerminar").setAttribute("value", "ENCERRAR A OFICINA");
    }
});

encerrarOficina = () => {socketadm.emit('terminar_oficina',{})}

var modal = document.getElementById("myModal");

function modalAcao (data) {
    modal.style.display = "block";

    if (data.acao == "btnRenomearOficina") document.getElementById("acao-modal").innerHTML = "Tem certeza que deseja RENOMEAR A OFICINA para " + data.evento + "?"
    else document.getElementById("acao-modal").innerHTML = "Tem certeza que deseja " + data.evento + "?"

    document.getElementById("btnModalConfirm").onclick = function () {
        if (data.acao == "btnTerminar") { 
            encerrarOficina()
            modal.style.display = "none";
        } else { 
            if (data.acao == "btnEstrofe") { 
                encerrarEstrofe();
                modal.style.display = "none";
            } else {
                if (data.acao == "btnExcluirSelecao") {
                    moverFotos ();
                    modal.style.display = "none";
                } else {
                    if (data.acao == "btnRenomearOficina") {
                        renomearOficina(data.evento);
                        modal.style.display = "none";
                    }
                }
            }  
         }
    }

    document.getElementById("btnModalCancel").onclick  = () =>{
        modal.style.display = "none";
    }
}

removeLogado = id => {
    for (let i = 0; i < ids_logados.length; i++) {
        if( ids_logados[i] == id){
            document.getElementById('btn'+id).remove();
            ids_logados.splice(1,i);
        }
    }
}
removerParticipante = id =>{
        var r = confirm("Remover o usuario?");
        if (r == true) {
            socketadm.emit('remove_participante_oficina',{'id':id});
        } 
}

encerrarEstrofe = () =>{socketadm.emit('encerrar_estrofe',{});}
naoLogado = id =>{
    for (let i = 0; i < ids_logados.length; i++) {
        if( ids_logados[i] == id){
             return false;
        }
    }
    return true;
}

createButton = (participante) =>{
    if (naoLogado(participante.id)){
        ids_logados.push(participante.id)
        var element = document.createElement("input");
        element.setAttribute("type", "button");
        //element.setAttribute("value", "Remove ["+participante.nome+"]");
        element.setAttribute("value", participante.nome);
        element.setAttribute("name", "btn"+participante.id);
        element.setAttribute("id", "btn"+participante.id);
        element.setAttribute("class","btnParticipante");
        element.setAttribute("onclick", "removerParticipante('"+participante.id+"')");
        //element.setAttribute("onclick", modalAcao({evento:"REMOVER o participante" + participante.nome, acao:'btnParticipante', id: participante.id}))
        //document.getElementById("btnRemover").appendChild(element);
        document.getElementById("participante-online").appendChild(element);
    }
  }
let listaRemocao = [];
function verficarMudanca(checkbox) {
    socketadm.emit('selecao_foto_server',{'id':checkbox.id,'checked':checkbox.checked})
}

socketadm.on('lista_fotos_remocao',function(lista){
    listaRemocao = lista;
    if (lista.length > 0){
       for (let i = 0; i < listaRemocao.length; i++) {
           document.getElementById(listaRemocao[i].id).checked = true;
       }
    }
})
socketadm.on('lista_fotos_remocao_fim',function(lista){
     if (lista.length == 0){
        atualizarGerenciaFotos(numFotos - (listaRemocao.length))
        atualizarExclusaoFotos (listaRemocao.length)
        for (let i = 0; i < listaRemocao.length; i++) {
            document.getElementById("id"+listaRemocao[i]).remove();
        }
     listaRemocao = lista
     }
})

atualizarGerenciaFotos = (qtde) => {
    numFotos = qtde;
     document.getElementById("qtde-fotos").innerHTML = numFotos;
        if (numFotos == 0) {
            tempoFoto = 0
        } else {
            tempoFoto = Math.floor(254 / numFotos)
        }
        ativarExluirFoto();
        document.getElementById("tempo-fotos").innerHTML = tempoFoto + 's';
}

atualizarExclusaoFotos = (numFotosMovidas) => {
    fotosMovidas += numFotosMovidas
    document.getElementById("fotos-movidas").innerHTML = fotosMovidas;
    fotosSelecionadas = 0;
    document.getElementById("fotos-selecionadas").innerHTML = fotosSelecionadas
}

ativarExluirFoto  = () => {
    if (numFotos == 0) {
        btnExcluirFotos.disabled = true;
        btnExcluirFotos.style.background = "#e2e0e0"
    } else {
        btnExcluirFotos.disabled = false;
        btnExcluirFotos.style.background = "#34a853ff"
    }
}

moverFotos = () =>{
    socketadm.emit('mover_fotos',{}); 
}
socketadm.on('selecao_foto_admin',function(checkbox){
    document.getElementById(checkbox.id).checked = checkbox.checked;
    if(document.getElementById(checkbox.id).checked){
        listaRemocao.push(checkbox.id)
        fotosSelecionadas += 1;
        document.getElementById("fotos-selecionadas").innerHTML = fotosSelecionadas;

    }else{
       if (listaRemocao.length > 0){
           for (let i = 0; i < listaRemocao.length; i++) {
               if(listaRemocao[i] == checkbox.id){
                   listaRemocao.splice(i,1)
                  
                   fotosSelecionadas -= 1;
                   document.getElementById("fotos-selecionadas").innerHTML = fotosSelecionadas;
               }
           }
       }
   }
});


socketadm.on('update_foto',data=>{
    lista_fotos.insertAdjacentHTML('afterbegin',
        '<li id="id' + data.caminho + '">' +
            '<input onchange="verficarMudanca(this)" type="checkbox" id="' + data.caminho + '">' +
            '<label class="label_foto" for="' + data.caminho + '">' +        
                '<img src="/static/oficina/' + data.caminho + '">' +
                '<div>' + data.descricao + '</div>' +
            '</label>' +
        '</li>');
        atualizarGerenciaFotos(numFotos+1);

});

socketadm.on("aquarela-action", data=>{
    print(data);
})

gerarZip=()=>{
    socketadm.emit('gerar-dados-oficina',{})
}
socketadm.on('link-dados-oficina',data=>{
    document.getElementById("btnGerarZip").disabled = true;
    document.getElementById("link-download").innerHTML = "<a href='../static/"+data+"' download> <button onclick=\"removeBTNDownload()\" class=\"btnDownload\"><i class=\"fa fa-download\"></i> Download</button></a>"
})

removeBTNDownload = ()=>{
    document.getElementById("btnGerarZip").disabled = false;
    document.getElementById("link-download").innerHTML = ""
}

renomearOficina = novo_nome => {
    if (novo_nome === undefined || novo_nome === ''){return}
    socketadm.emit('renomear_oficina',{'nome':novo_nome})
    document.getElementById("novo-nome-oficina").placeholder = "";
    document.getElementById("novo-nome-oficina").value = "";
    document.getElementById("lista-fotos").innerHTML = ""; 
    document.getElementById("nome-oficina").innerHTML = novo_nome;
}

socketadm.on('nome_oficina', data=>{
    document.getElementById("novo-nome-oficina").placeholder = "";
    document.getElementById("nome-oficina").innerHTML = data.nome;
    atualizarGerenciaFotos(numFotos);
})

//para modal
var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
