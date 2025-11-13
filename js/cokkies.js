document.addEventListener("DOMContentLoaded", function () {
  // Cria o banner dinamicamente
  if (!document.getElementById("cookieBanner")) {
    const banner = document.createElement("div");
    banner.id = "cookieBanner";
    banner.classList.add("cookie-banner");
    banner.innerHTML = `
      <p>
        Usamos cookies para melhorar sua experiência em nosso site.
        Ao continuar navegando, você concorda com nossa
        <a href="politica-de-privacidade.html" target="_blank">Política de Privacidade</a>.
      </p>
      <button id="acceptCookies">Aceitar</button>
    `;
    document.body.appendChild(banner);
  }

  const banner = document.getElementById("cookieBanner");
  const botao = document.getElementById("acceptCookies");

  // Verifica se já aceitou
  const aceitou = localStorage.getItem("cookiesAceitos");

  if (!aceitou) {
    // Mostra o banner 1 segundo após carregar
    setTimeout(() => {
      banner.classList.add("show");
    }, 1000);
  }

  // Quando clicar em aceitar
  botao.addEventListener("click", () => {
    localStorage.setItem("cookiesAceitos", "true");
    banner.classList.remove("show");
  });
});
