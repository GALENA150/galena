document.addEventListener("DOMContentLoaded", function () {
  const fadeEls = document.querySelectorAll(".fade-in");

  function showOnScroll() {
    fadeEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", showOnScroll);
  showOnScroll(); // Executa na carga inicial
});
