// Adicione este script ao seu projeto e inclua no HTML após o EmailJS SDK

// 1. Inclua o SDK do EmailJS no <head> ou antes do </body>:
// <script src="https://cdn.emailjs.com/dist/email.min.js"></script>
// <script>emailjs.init("SEU_USER_ID_AQUI");</script>
// Troque SEU_USER_ID_AQUI pelo seu userID do EmailJS

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("footer-form");
  const status = document.getElementById("footer-status");

  // Função para mostrar popup customizado
  function showPopup(message, success = true) {
    // Cria overlay
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    // Cria popup
    const popup = document.createElement("div");
    popup.className = "popup-message" + (success ? " success" : " error");
    popup.innerHTML = `
      <span>${message}</span>
      <button class="popup-close" aria-label="Fechar">OK</button>
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Borra o fundo
    document.body.classList.add("blur-bg");

    // Fecha popup
    popup.querySelector(".popup-close").onclick = function () {
      document.body.removeChild(overlay);
      document.body.classList.remove("blur-bg");
    };
  }

  emailjs.init("xSO0YQjWZ5dbHX4LM");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "Enviando mensagem...";

      emailjs
        .send("service_ndkuvzr", "template_vyb71os", {
          nome: form.nome.value,
          email: form.email.value,
          mensagem: form.mensagem.value,
        })
        .then(
          function () {
            status.style.color = "green";
            status.textContent = "✅ Mensagem enviada!";
            form.reset();
            showPopup(
              "Mensagem enviada com sucesso! Obrigado pelo contato.",
              true
            );
          },
          function () {
            status.style.color = "red";
            status.textContent = "❌ Erro ao enviar. Tente novamente.";
            showPopup("Erro ao enviar mensagem. Tente novamente.", false);
          }
        );
    });
  }
});
