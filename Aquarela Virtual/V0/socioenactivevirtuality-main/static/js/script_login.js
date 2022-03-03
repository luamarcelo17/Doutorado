var form = document.getElementById("frm_login_participante")
var nome = document.getElementById("nome");
var labelAvatares = document.getElementById("labelAvatar")
var avatares = document.getElementsByName("avatar");
var botao = document.getElementById("bntFazerLogin");

nome.addEventListener('blur', function () {
      this.classList.add("touched");
});

botao.addEventListener('click', function () {
  nome.classList.add("touched");
  for (var i = 0; i < avatares.length; i++) {
    if (avatares[i].type === 'radio' && avatares[i].checked) {
        labelAvatares.classList.remove("invalid");
        break;
    }
    labelAvatares.classList.add("invalid");
  }
});