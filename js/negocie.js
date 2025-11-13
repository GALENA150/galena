// Alternar botão vender/alugar
const botoes = document.querySelectorAll(".toggle-buttons button");
const inputAcao = document.querySelector("input[name='acao']");

botoes.forEach((btn) => {
  btn.addEventListener("click", () => {
    botoes.forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    inputAcao.value = btn.dataset.value;
  });
});

// Envio via EmailJS + Popup de confirmação
document.getElementById("formImovel").addEventListener("submit", function (e) {
  e.preventDefault();

  // Desabilita o botão enquanto envia
  const botao = this.querySelector(".enviar");
  botao.disabled = true;
  botao.textContent = "Enviando...";

  emailjs
    .sendForm("service_ndkuvzr", "template_cmfetdj", this)
    .then(() => {
      // Mostra o popup bonito
      Swal.fire({
        icon: "success",
        title: "Enviado com sucesso!",
        text: "Entraremos em contato em breve.",
        confirmButtonText: "OK",
        confirmButtonColor: "#000",
      });

      // Resetar formulário
      this.reset();
      botoes.forEach((b) => b.classList.remove("ativo"));
      botoes[0].classList.add("ativo");
    })
    .catch((err) => {
      console.error("Erro:", err);
      Swal.fire({
        icon: "error",
        title: "Erro ao enviar",
        text: "Por favor, tente novamente mais tarde.",
        confirmButtonText: "OK",
        confirmButtonColor: "#000",
      });
    })
    .finally(() => {
      botao.disabled = false;
      botao.textContent = "Enviar";
    });
});
