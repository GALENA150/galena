// marca o link do menu que corresponde à página atual
document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("nav a, .header-nav a, header a");
  const current = (
    location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();

  links.forEach((a) => {
    const href = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (!href) return;
    // corresponde se o href for igual ao arquivo atual ou se for index/root
    if (
      href === current ||
      (current === "" && (href === "index.html" || href === "/"))
    ) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });
});
// Menu hamburguer responsivo
document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !expanded);
      mainNav.classList.toggle("nav-open");
    });
  }
});
