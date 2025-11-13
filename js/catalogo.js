// Mostrar todos os cards (não esconder nenhum) e ocultar o botão "Carregar mais"

document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("results");
  const btn = document.getElementById("loadMore");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".card"));

  // Remove qualquer classe "hidden" que possa existir
  cards.forEach((c) => {
    c.classList.remove("hidden");
    c.style.display = ""; // garante que o card seja renderizado pelo CSS
  });

  // Se existir o botão "Carregar mais", esconda-o (não é necessário)
  if (btn) btn.style.display = "none";
});
