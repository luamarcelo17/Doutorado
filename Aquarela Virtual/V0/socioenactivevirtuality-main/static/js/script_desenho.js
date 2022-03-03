var audio = null;
var ids_logados = [];
var eu_logado = null
let camera = new Audio();
const intervalo_leitura = 100;
const intervalo_leitura_correta = 3000;
var qr = new QrcodeDecoder();
var sol_amarelo_element = document.getElementById("sol-amarelo");
var folha_desenho_element = document.getElementById("folha-papel");
var btn_tirar_foto = document.getElementById("tirar-foto");
var erro_webcam = document.getElementById("erro-webcam");
var lista_participantes = document.getElementById("lista_participantes");
const socket = io.connect('//' + document.domain + ':' + location.port + '/desenho');
const print = msg => {console.log(msg)};
const feedback_duration = 8000;

//Animação feedback individual
const emoji = {
  "01":"sol",
  "02":"castelo_qr",
  "03":"tinta",
  "04":"passaro",
  "05":"barco",
  "06":"aviao",
  "81":"medo",
  "82":"feliz",
  "83":"raiva",
  "84":"triste",
  "85":"entediado",
  "86":"calmo"
}

feedbackQRCODE = index =>{
  if (index > 80){
      atualizaPerfilParticipante(index);
  }
  for(var i = 0; i <= 15; i++) {
    document.body.insertAdjacentHTML('beforeend',
      '<img class="particle"' +
        'src="/static/images/designs/'+ emoji[index]+'.png" style="' +
        'top:' + Math.floor(20 + Math.random() * 31) + '%;' +
        'left:' + Math.floor(73 + Math.random() * 24) + '%;' +
        'width:' + Math.floor(10 + Math.random() * 91) + 'px;' +
        'animation-delay:' + Math.floor(Math.random() * 11) / 5 + 's;" />');
  }
  let particles = [].slice.call(document.getElementsByClassName("particle"), 0);

  [].forEach.call(particles, function(particle) {
    particle.onanimationend = () => {
      particle.remove();
    };
  });
}

var timeRemover =  null;
timeFeedback =  null;
atualizaPerfilParticipante = data => {
  if (document.getElementById("emoji-afetivo-perfil"))
  {
    document.getElementById("emoji-afetivo-perfil").remove();
  }

  document.getElementById("perfil-participante").getElementsByTagName("p")[0]
  .insertAdjacentHTML('afterbegin',
    '<img id="emoji-afetivo-perfil"' +
      'src="/static/images/designs/' + emoji[data] + '.png" ' +
      'class="animate__animated animate__fadeIn" />');
      if(timeFeedback != null) {clearTimeout(timeFeedback)}
      if(timeRemover != null) {clearTimeout(timeRemover)}
  timeFeedback = setTimeout(() => {
    if (document.getElementById("emoji-afetivo-perfil")){
     document.getElementById("emoji-afetivo-perfil").classList.replace("animate__fadeIn", "animate__fadeOut");
     timeRemover =  setTimeout(() => {
        if (document.getElementById("emoji-afetivo-perfil")){
          document.getElementById("emoji-afetivo-perfil").remove();
        }
      }, 1000);
    }
  }, feedback_duration);
}

socket.on('feedback-afetivo-social', data =>  {
  if (eu_logado.id != data.participante.id) {
    if (document.getElementById("emoji-afetivo-" + data.participante.id)){
      document.getElementById("emoji-afetivo-" + data.participante.id).remove();
    }
    document.getElementById(data.participante.id).insertAdjacentHTML('afterbegin', '<img ' +
      'src="/static/images/designs/'+ emoji[data.estadoAfetivo] + '.png" ' +
      'id="emoji-afetivo-' + data.participante.id + '"' +
      'class="emoji-afetivo-feedback animate__animated animate__fadeIn" />');

    setTimeout(() => {
      if (document.getElementById("emoji-afetivo-" + data.participante.id))
      {
        document.getElementById("emoji-afetivo-" + data.participante.id).classList.replace("animate__fadeIn", "animate__fadeOut");
        setTimeout(() => {
          if (document.getElementById("emoji-afetivo-" + data.participante.id))
          {
            document.getElementById("emoji-afetivo-" + data.participante.id).remove();
          }
        }, 1000);
      }
    }, feedback_duration);
  }
});

//Função padrão quando o socktio faz a conexão
socket.on('connect', ()=>{
    socket.emit('joined', {eu_logado});
});
socket.on('eu-presente', participante =>{
      eu_logado = participante
})
//Qualquer problema de conexão entre o browser e o backend
socket.on('disconnect', () => {
    //window.location.href = "/";
});
//Chamar por um botão para sair da oficina.
leave_room = () => {
    socket.emit('left', {}, ()=> {
        socket.disconnect();
        window.location.href = "/";
    });
}

remover_logado = id =>{
   for (let i = 0; i < ids_logados.length; i++) {
     if (id == ids_logados[i]){
      console.log('Remover....' + id)
      ids_logados.splice(i,1);
      print(ids_logados)
     }
   }
}

//Remover participante dos colaboradores
socket.on('remover', id=>{
  if (id != eu_logado.id){
    if(!naoLogado(id)){
      remover_logado(id);
      document.getElementById(id).classList.replace("animate__zoomIn", "animate__zoomOut");
      setTimeout(()=>{
        document.getElementById(id).remove();
      }, 1000);
    }
  }
});

//Inicia a lista de presentes
socket.on('inicia-presente', listaParticipantes =>{
  if (ids_logados.length == 0){
      listaParticipantes.forEach(participante=>{
            adicionaParticipanteNaLista(participante);
      });
  }
});

//Imprime o status de quem entra e sai da sala
socket.on('status', msg =>{
    print(msg)
});

Webcam.set({
    width: 300,
    height: 168,
    dest_width: 1280,
    dest_height: 720,
    image_format: "jpeg",
    jpeg_quality: 60,
    // flip_horiz: true,
    unfreeze_snap: false
});

Webcam.on( 'load', () =>{

});

Webcam.on( 'live', () => {
    btn_tirar_foto.classList.remove("escondido");
    erro_webcam.classList.add("escondido");
    setTimeout(deteccaoQRcodes, intervalo_leitura);
});

Webcam.on( 'error', err => {
    erro_webcam.classList.remove("escondido");
});

Webcam.attach("#minha-camera");

socket.on('valor-amarelo', valor => {
    print('Recebendo valor amarelo: ', valor);
    sol_amarelo_element.removeAttribute("class");
    if (valor == 0)
    {
        sol_amarelo_element.classList.add('zero');
    }
    if (valor == 1)
    {
        sol_amarelo_element.classList.add('um');
    }
    else if (valor == 2)
    {
        sol_amarelo_element.classList.add('dois');
    }
    else if (valor >= 3)
    {
        sol_amarelo_element.classList.add('tres');
        audio.play();
    }
})

naoLogado = id => {
  for(let i = 0; i < ids_logados.length; i++){
      if(ids_logados[i] ==  id){
        return false
      }
  }
  return true
}

adicionaParticipanteNaLista = participante => {
  if(naoLogado(participante.id)){
        ids_logados.push(participante.id)
        var item_participante = document.createElement("li");
        var nome_participante = document.createTextNode(participante.nome);
        var imagem = document.createElement("img");
        imagem.classList.add("avatar");
        imagem.src = participante.url_avatar;
        imagem.style.width = "32px";
        item_participante.id = participante.id
        item_participante.appendChild(imagem);
        item_participante.appendChild(nome_participante);
        lista_participantes.appendChild(item_participante);
        item_participante.classList.add("animate__animated", "animate__zoomIn");
    }
}

socket.on('participante-presente', participante => {
  if (eu_logado.id != participante.id){
    adicionaParticipanteNaLista(participante);
  }
});

btn_tirar_foto.onclick = () =>{
    btn_tirar_foto.style["visibility"] = "hidden";
    var video_webcam_element = document.getElementById('minha-camera');
    video_webcam_element.style["filter"] = "brightness(200%)";
    var laudio = new Audio();
    laudio.src = "/static/audio/obturador.mp3";
    laudio.play();
    Webcam.snap( data_uri => {
        //Webcam.upload(data_uri, '/snapshot', (code, text) =>{
            setTimeout(()=>{
              video_webcam_element.style["filter"] = "brightness(100%)";
              Webcam.freeze();
              video_webcam_element.style["transform"] = "scale(1.5)";
              socket.emit('salvar_foto',{'foto':data_uri.replace("data:image/jpeg;base64,", "")});
              //socket.emit('feedback',{tipo:'social', feedback:'snap'});
            }, 200);
            setTimeout(()=>{
              Webcam.unfreeze();
              video_webcam_element.style["transform"] = "scale(1)";
              btn_tirar_foto.style["visibility"] = "visible";
            }, 3000);
        //} );
    });
}

const tecla = {
  49:'01',
  50:'02',
  51:'03',
  52:'04',
  53:'05',
  54:'06',
  55:'07',
  56:'81',
  57:'82',
  58:'83',
  48:'84'
}

document.body.onkeydown = e => {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  {
    print(e.keyCode)
    if (e.keyCode >= 48 && e.keyCode <=58){
      e.preventDefault();
      socket.emit('qrcode', tecla[e.keyCode]);
      feedbackQRCODE(tecla[e.keyCode])
    }
  }
}

deteccaoQRcodes = () =>{
    Webcam.set({
        dest_width: 400,
        dest_height: 225
    });
    Webcam.snap(data_uri => {
        qr.decodeFromImage(data_uri).then((res) => {
            if(res.data !== undefined && res.data !== 0 && res.data !== '') {
                socket.emit('qrcode', res.data);
                var video_webcam_element = document.getElementsByTagName('video');
                video_webcam_element[0].style["filter"] = "contrast(1000%)";
                var laudio = new Audio;
                laudio.src = "/static/audio/beep.mp3";
                laudio.play();
                socket.emit('foto-leitura',{'foto':data_uri.replace("data:image/jpeg;base64,", ""),'qrc':res.data});
                feedbackQRCODE(res.data)
                setTimeout(() =>{
                  video_webcam_element[0].style["filter"] = "contrast(100%)";
                }, 400);
                setTimeout(deteccaoQRcodes, intervalo_leitura_correta);
            } else {
                setTimeout(deteccaoQRcodes, intervalo_leitura);
            }
        });
    });
    Webcam.set({
        dest_width: 1280,
        dest_height: 720
    });
}

notica_status_animacao = (_id, _status) =>{
  socket.emit('animacao-status',{'id':_id,'st':_status});
}
let feedback_Aquarela = {
  '01':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fas fa-sun"></i>',cor:'#FFE262 linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  '02':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fab fa-fort-awesome"></i>',cor:'#FFE262 linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  '03':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fas fa-tint"></i>',cor:'#71D5EE linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  '04':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fas fa-dove"></i>',cor:'#71D5EE linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  '05':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fas fa-ship"></i>',cor:'#F8A269 linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  '06':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fas fa-plane"></i>',cor:'#8296B0 linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  // '07':{mensagem:'<i class="fas fa-qrcode"></i> <i class="fas fa-cloud"></i>',cor:'#8296B0 linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'},
  '00':{mensagem:'<i class="fas fa-camera"></i> <i class="fas fa-user-alt"></i>',cor:'#CCCCCC linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.1) 100%)'}
}

socket.on('feedback-social', msg =>{
  if(parseInt(msg.feedback) < 80){
    if (eu_logado.id != msg.participante.id) {
      let feedback_element = document.getElementById(msg.participante.id + '-feedback-' + msg.feedback);
      if (feedback_element == null) {
        document.getElementById(msg.participante.id).insertAdjacentHTML('beforeend', '<span id=\"' + msg.participante.id + '-feedback-' + msg.feedback + '\" class=\"feedback animate__animated animate__fadeInLeft\">' + feedback_Aquarela[msg.feedback].mensagem + '</span>');
        feedback_element = document.getElementById(msg.participante.id + '-feedback-' + msg.feedback);
        feedback_element.style.background = feedback_Aquarela[msg.feedback].cor;
        setTimeout(() => {
          feedback_element.classList.replace("animate__fadeInLeft", "animate__fadeOutRight")
          setTimeout(() => {
            feedback_element.remove();
          }, 1000);
        }, feedback_duration);
      }
    }
  }
});

const terminarEstrofe = num_estrofe =>{
  removerElementosEstrofe(num_estrofe);
  timer_element = document.getElementById("timer");
  timer_element.remove();
  notica_status_animacao(eu_logado.id,1);
};

const iniciaEstrofe = num_estrofe => {
    musica = "/static/audio/aquarela-estrofe-"+num_estrofe+".mp3";
    notica_status_animacao(eu_logado.id,0)
    mostrarElementosEstrofe(num_estrofe);
    audio = new Audio();
    audio.src = musica;
    audio.volume = .4
    setTimeout(() =>{
      audio.play();
      const duration = audio.duration;
      print(duration)
      folha_desenho_element.insertAdjacentHTML('afterbegin', '<div id=\"timer\" style=\"--duration:' + audio.duration + ';\"><div></div></div>');
      print("Tempo da música: " + duration);
    },1000);
}

socket.on('estrofe-1', data=>{
  setTimeout(iniciaEstrofe,1000,1);
  setTimeout(terminarEstrofe,(27245 + 2000),1);
});

socket.on('estrofe-2', data =>{
  setTimeout(iniciaEstrofe,1000,2);
  setTimeout(terminarEstrofe,(27951+2000),2);
});

socket.on('estrofe-3', data =>{
  setTimeout(iniciaEstrofe,1000,3);
  setTimeout(terminarEstrofe,(26097+2000),3);
});

socket.on('estrofe-4', data =>{
  setTimeout(iniciaEstrofe,1000,4);
  setTimeout(terminarEstrofe,(28186 + 2000),4);
});

socket.on('objeto-01-estrofe-1', data =>{
  let animar_sol = anime({
    targets: '#sol',
    scale: 2,
    translateY: '-30%',
    autoplay: true,
    duration: 500,
    easing: 'linear',
    begin: anim => {
      print("Animando o sol");
    },
    complete: modificarAnimacaoSol
  });
});

modificarAnimacaoSol = () =>{
  let animar_sol = anime({
    targets: '#sol',
    delay: 5000,
    duration: 500,
    easing: 'linear',
    translateY: 0,
    scale: 1,
  });
}

socket.on('objeto-02-estrofe-1', data =>{
  print('Adicionar objeto 02 dados abaixo'  + data);
  print("animando castelo");
});

var gaivota_animada = false;
posicionarGaivota = () =>{
  print("posicionar gaivota animada" + gaivota_animada);
  if(!gaivota_animada) {
    animar_gaivota = anime({
      targets: '#gaivota',
      translateX: 0,
      translateY: 250,
      rotate: 0,
    });
  }
}

mostrarPingoTinta = () =>{
  document.getElementById('pingo-tinta').classList.remove("escondido");
  document.getElementById('splash-tinta').classList.add("escondido");
  document.getElementById('pingo-tinta').style.transform = 'none';
}

mostrarSplashTinta = () =>{
  document.getElementById('pingo-tinta').classList.add("escondido");
  document.getElementById('splash-tinta').classList.remove("escondido");
  document.getElementById('pingo-tinta').style.transform = 'none';
}

socket.on('objeto-03-estrofe-2', data =>{
  mostrarPingoTinta();
  posicionarGaivota();

  let animar_pingo = anime({
    targets: '#pingo-tinta',
    translateY: 500,
    duration: 4000,
    easing: 'easeInOutSine',
    autoplay: true,
    begin: anim => {
      print("animando pingo de tinta");
    },
    complete: anim => {
      mostrarSplashTinta();
    }
  });
});

var animar_gaivota;
socket.on('objeto-04-estrofe-2',data =>{
  gaivota_animada = false;
  mostrarPingoTinta();
  posicionarGaivota();
  const path = anime.path('#caminho-gaivota');
  animar_gaivota = anime({
    targets: ['#gaivota'],
    translateX: path('x'),
    translateY: path('y'),
    rotate: path('angle'),
    duration: 3000,
    loop: 10,
    easing: 'linear',
    begin: anim => {
      gaivota_animada = true;
      print("Animando gaivota " + gaivota_animada);
    },
    complete: anim => {
      gaivota_animada = false;
      posicionarGaivota();
      print("Animando gaivota " + gaivota_animada);
    },
  });
});

socket.on('objeto-05-estrofe-3', data =>{
  let animar_barco = anime({
    targets: '#barco-a-vela',
    translateX: [500, 10],
    duration: 5000,
    easing: 'easeInOutSine',
    autoplay: true,
    loop: 6,
    begin: anim => {
      print("animando barco a vela");
    }
  });
});

socket.on('objeto-06-estrofe-4', data =>{
  let animar_aviao = anime({
    targets: '#aviao',
    translateY: -300,
    scale: 2.25,
    duration: 20000,
    easing: 'linear',
    autoplay: true,
    begin: anim => {
      print("animando aviao");
    },
    complete: modificarAnimacaoAviao
  });
});

modificarAnimacaoAviao = () =>{
  let animar_aviao = anime({
    targets: '#aviao',
    duration: 8000,
    easing: 'linear',
    translateY: 0,
    scale: 1,
  });
}

removerEstrofes = ()=>{
  removerElementosEstrofe(1);
  removerElementosEstrofe(2);
  removerElementosEstrofe(3);
  removerElementosEstrofe(4);
}
socket.on('finalizar_estrofes',function(){
   removerEstrofes();
});

socket.on('gran_finale', retorno => {
  listaFotos = retorno.listaFotos;
  print(retorno.listaParticipantes);
  listaAvatares = retorno.listaParticipantes;

  removerEstrofes();
  document.getElementById('grand_finale').style.display = 'block';
  document.getElementById('grand_finale').classList.add("animate__animated", "animate__fadeIn");

  for (var i = 0; i < 32; i++) { //31 fotos, 8 segundos cada
    document.getElementById('grand_finale').insertAdjacentHTML('beforeend', '<img class=\"foto animate__animated animate__fadeIn\" src=\"' + listaFotos[i % listaFotos.length] + '\" alt=\"foto de um participante\" style=\"transform: rotate(' + Math.ceil(Math.random() * 10) * (Math.round(Math.random()) ? 1 : -1) + 'deg);\" />')
  }

  folha_desenho_element.insertAdjacentHTML('afterbegin', '<div id=\"timer\" style=\"--duration: 254;\"><div></div></div>');

  audio = new Audio();
  audio.src = "/static/audio/aquarela-volume-reduzido.mp3";
  audio.volume = .4;
  audio.play();
  let aplausos = true;

  audio.addEventListener("ended", function(){
    if (aplausos) {
      audio.currentTime = 0;
      audio.src = "/static/audio/aplausos.mp3";
      audio.volume = 1;
      audio.play();
      folha_desenho_element.insertAdjacentHTML('afterbegin',
        '<div class="fireworks">' +
          '<div class="before"></div>' +
          '<div class="after"></div>' +
        '</div>');
    }
    aplausos = false;
  });

  var fotos = [].slice.call(document.getElementsByClassName('foto'), 0).reverse();

  [].forEach.call(fotos, function(foto, i) {
    setTimeout(() => {
      let animacao = Math.floor(Math.random() * 4);
      if (animacao == 0) animacao = "animate__rotateOutDownLeft";
      else if (animacao == 1) animacao = "animate__rotateOutDownRight";
      else if (animacao == 2) animacao = "animate__rotateOutUpLeft";
      else if (animacao == 3) animacao = "animate__rotateOutUpRight";
      foto.classList.add("animate__animated", animacao);
    }, (i + 1) * 8000);
  });

  let div_avatares = document.getElementById('grand_finale_avatares');
  listaAvatares.forEach(avatar => {
    let img_avatar = document.createElement("img");
    img_avatar.src= avatar.url_avatar;
    img_avatar.classList.add('avatares');
    div_avatares.appendChild(img_avatar);
    div_avatares.classList.add('div-avatares');
  });
  animarAvataresFinal();
});

animarAvataresFinal = loop => {
  anime({
    targets: '.avatares',
    translateY: [-180, 20],
    direction: 'alternate',
    autoplay: true,
    duration: 800,
    delay: anime.stagger(100, {from: 'center'}),
    loop: true,
    easing: 'easeInOutSine',
    begin: anim => {
      print("Animando avatares encerramento");
    }
  });
}

animarAvatares = loop => {
  anime({
    targets: '.avatares',
    translateY: [-20, 20],
    direction: 'alternate',
    autoplay: true,
    duration: 400,
    loop: true,
    easing: 'easeInOutSine',
    begin: anim => {
      print("Animando avatares");
    }
  });
}

socket.on('adiciona-avatar-estrofe-1', participante =>{
  let div_avatares = document.getElementById('estrofe1-avatares');
  let img_avatar = document.createElement("img");
  img_avatar.id = participante.id + '-avatar';
  img_avatar.src= participante.url_avatar;
  img_avatar.classList.add('avatares');
  div_avatares.appendChild(img_avatar);
  div_avatares.classList.add('div-avatares');
  animarAvatares();
});

socket.on('adiciona-avatar-estrofe-2', participante =>{
  let div_avatares = document.getElementById('estrofe2-avatares');
  let img_avatar = document.createElement("img");
  img_avatar.id = participante.id + '-avatar';
  img_avatar.src= participante.url_avatar;
  img_avatar.classList.add('avatares');
  div_avatares.appendChild(img_avatar);
  div_avatares.classList.add('div-avatares');
  animarAvatares();

  let animar_mundo = anime.timeline({
    targets: '#mundo',
    duration: 7000,
    direction: "alternate",
    easing: 'easeInOutSine',
    autoplay: true,
    begin: anim => {
      print("Animando o mundo");
    }
  });
  animar_mundo
  .add({
    rotate: 45,
  })
  .add({
    rotate: -45,
  });
});

socket.on('adiciona-avatar-estrofe-3', participante=>{
  let div_avatares = document.getElementById('estrofe3-avatares');
  let img_avatar = document.createElement("img");
  let img_back = document.createElement("img");
  img_avatar.id = participante.id + '-avatar';
  img_avatar.src= participante.url_avatar;
  img_avatar.style.width = "60px";
  img_avatar.classList.add('avatar');
  img_back.style.width = "80px";
  img_back.classList.add('vento');
  img_back.src= "/static/images/designs/air.png";

  div_avatares.appendChild(img_avatar);
  div_avatares.appendChild(img_back);
  print("Adicionando avatares estrofe3");
});

socket.on("remover-admin",data =>{
  encerrarUsuario();
})

encerrarUsuario = () => {
  var cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  window.location.href = "/";
}

socket.on('adiciona-avatar-estrofe-4', participante=>{
  let div_avatares = document.getElementById('estrofe4-avatares');
  let img_avatar = document.createElement("img");
  img_avatar.id = participante.id + '-avatar';
  img_avatar.src= participante.url_avatar;
  img_avatar.classList.add('avatares');
  div_avatares.appendChild(img_avatar);
  animarAvatares();
});

mostrarElementosEstrofe = num_estrofe => {
  var id_estrofe = "estrofe" + num_estrofe;
  document.getElementById(id_estrofe).style.display = 'block';
  document.getElementById(id_estrofe).classList.add("animate__animated", "animate__fadeIn");
}

removerElementosEstrofe = num_estrofe => {
  var id_estrofe = "estrofe" + num_estrofe;
  document.getElementById(id_estrofe).classList.replace("animate__fadeIn", "animate__fadeOut");
  setTimeout(() =>{
    document.getElementById(id_estrofe).classList.replace("animate__fadeOut", "animate__fadeIn");
    document.getElementById(id_estrofe).style.display = 'none';
  }, 1000);
  let div_avatares = document.getElementById("estrofe" + num_estrofe + "-avatares");
  while (div_avatares.firstChild) {
      div_avatares.firstChild.remove();
  }
}

// teste para animar as ondas do oceano
var slideIndex = 0;
showSlides = () =>{
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  setTimeout(showSlides, 400); // Change image every 2 seconds
}
showSlides();
