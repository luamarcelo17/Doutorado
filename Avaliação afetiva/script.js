const eAfetivoFeliz = document.querySelector("#emoji-feliz");
const eAfetivos = document.querySelectorAll(".btn-emoji");
// console.log(eAfetivoFeliz);

const registrar = () => console.log("Feliz");

//eAfetivoFeliz.addEventListener("click", registrar(eAfetivoFeliz));

eAfetivos.forEach((emoji) => {
  console.log(emoji.value);
});
