// Versão ajustada: renderiza catálogo, modal único e mensagem personalizada com o imóvel selecionado
(function () {
  "use strict";

  // --- configurações ---
  const WHATSAPP_NUMBER = "5511999999999"; // substitua pelo seu número (DDI+DDD+numero)
  const PLACEHOLDER_IMG = "img/placeholder.jpg"; // coloque um placeholder em img/ se quiser

  // lista de bairros (adicione/completar conforme necessário)
  const bairrosJoseBonifacio = [
    "Centro",
    "Jardim Primavera (José Bonifácio)",
    "Jardim Das Flores (José Bonifácio)",
    "Jardim José de Almeida (José Bonifácio)",
    "Jardim do Bosque (José Bonifácio)",
    "Jardim Nova Conceição (José Bonifácio)",
    "Jardim Alcy Sansone (José Bonifácio)",
    "Jardim Das Palmeiras (José Bonifácio)",
    "Vila São João",
    "Vila Maria",
    "Vila Rezende",
    "Vila Formosa",
    "Vila Industrial",
    "Vila Barbosa",
    "Vila São Pedro",
    "Vila Aparecida",
  ];

  // --- mock de imóveis (substitua por fetch/API real) ---
  const mockProperties = [
    {
      id: 1,
      title: "Casa no Centro",
      tipo: "casa",
      bairro: "Centro",
      preco: 380000,
      quartos: 3,
      img: "img/casa/01/foto1.jpeg",
    },
    {
      id: 2,
      title: "Terreno amplo",
      tipo: "terreno",
      bairro: "Jardim Brasil",
      preco: 95000,
      quartos: 0,
      img: "img/sample2.jpg",
    },
    {
      id: 3,
      title: "Barracão comercial",
      tipo: "barracao",
      bairro: "Vila Industrial",
      preco: 1200000,
      quartos: 1,
      img: "img/sample3.jpg",
    },
  ];

  // utilitários
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  // --- AUTOCOMPLETE (anexa dropdown ao body) ---
  function attachAutocomplete(input) {
    if (!input) return;
    let drop = null;
    let resizeObs = null;
    const GAP = 6;

    function createDrop() {
      drop = document.createElement("div");
      drop.className = "autocomplete-list";
      drop.style.position = "absolute";
      drop.style.zIndex = 9999;
      drop.style.visibility = "hidden";
      document.body.appendChild(drop);

      const reposition = () => {
        if (!drop) return;
        const rect = input.getBoundingClientRect();
        drop.style.left = rect.left + window.scrollX + "px";
        drop.style.top = rect.bottom + window.scrollY + GAP + "px";
        drop.style.minWidth = Math.max(180, rect.width) + "px";
        drop.style.maxWidth =
          window.innerWidth <= 560 ? window.innerWidth - 28 + "px" : "360px";
        drop.style.visibility = "visible";
      };

      window.addEventListener("resize", reposition);
      window.addEventListener("scroll", reposition, true);
      if (window.ResizeObserver) {
        resizeObs = new ResizeObserver(reposition);
        resizeObs.observe(input);
      }
      return reposition;
    }

    function removeDrop() {
      if (drop && drop.parentNode) drop.parentNode.removeChild(drop);
      drop = null;
      if (resizeObs) {
        resizeObs.disconnect();
        resizeObs = null;
      }
    }

    input.addEventListener("input", () => {
      const val = input.value.trim().toLowerCase();
      if (!val) {
        removeDrop();
        return;
      }
      const matches = bairrosJoseBonifacio
        .filter((b) => b.toLowerCase().includes(val))
        .slice(0, 8);
      if (matches.length === 0) {
        removeDrop();
        return;
      }
      const reposition = drop ? () => {} : createDrop();
      drop.innerHTML = matches
        .map((m) => `<div class="autocomplete-item" data-val="${m}">${m}</div>`)
        .join("");
      drop.querySelectorAll(".autocomplete-item").forEach((item) => {
        item.addEventListener("mousedown", function (ev) {
          ev.preventDefault();
          input.value = this.dataset.val;
          removeDrop();
          input.dispatchEvent(new Event("input"));
          input.focus();
        });
      });
      if (typeof reposition === "function") reposition();
    });

    input.addEventListener("blur", () => setTimeout(removeDrop, 120));
    document.addEventListener("click", (e) => {
      if (!drop) return;
      if (!e.target.closest(".autocomplete-list") && e.target !== input)
        removeDrop();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    attachAutocomplete(qs("#bairro"));
    attachAutocomplete(qs("#bairro2"));
  });

  // --- catálogo: renderização de cards ---
  function formatCurrency(v) {
    return v
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "-";
  }

  function safeImgAttr(src) {
    // onerror troca src por placeholder se existir
    return `${src}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'`;
  }

  function renderCards(list) {
    const results = qs("#results");
    const count = qs("#result-count");
    if (!results) return;
    results.innerHTML = "";
    if (count) count.textContent = `${list.length} imóvel(is) encontrado(s)`;
    if (list.length === 0) {
      results.innerHTML =
        "<p>Nenhum imóvel encontrado. Tente ajustar os filtros.</p>";
      return;
    }

    // grid container (garante espaçamento)
    const grid = document.createElement("div");
    grid.className = "cards-grid";
    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card property-card";

      // imagem clicável -> abre página de detalhe imovel.html?id=...
      const imgLink = document.createElement("a");
      imgLink.href = `imovel.html?id=${encodeURIComponent(p.id)}`;
      imgLink.className = "card-media-link";
      imgLink.setAttribute("aria-label", p.title);

      const media = document.createElement("div");
      media.className = "card-media";
      const img = document.createElement("img");
      img.src = p.img || "img/placeholder.jpg";
      img.alt = p.title;
      img.onerror = function () {
        this.onerror = null;
        this.src = "img/placeholder.jpg";
      };
      media.appendChild(img);
      imgLink.appendChild(media);

      // corpo
      const body = document.createElement("div");
      body.className = "card-body";
      const title = document.createElement("h3");
      title.className = "card-title";
      title.textContent = p.title;

      const location = document.createElement("div");
      location.className = "card-location";
      location.textContent = `${p.bairro || ""}`;

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${p.tipo || ""} • ${p.bairro || ""} • ${
        p.quartos
      } quartos`;

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = p.preco
        ? p.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "-";

      // ações
      const actions = document.createElement("div");
      actions.className = "card-actions";
      const btnContact = document.createElement("button");
      btnContact.className = "btn-contact btn";
      btnContact.type = "button";
      btnContact.textContent = "Ver contato";
      btnContact.dataset.id = p.id;

      const waLink = document.createElement("a");
      waLink.className = "btn-whatsapp btn-whatsapp-card";
      // mensagem rápida com o título (personalizada)
      const quickMsg = `Olá, tenho interesse no imóvel: ${p.title}. Pode me informar mais detalhes e disponibilidade?`;
      waLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        quickMsg
      )}`;
      waLink.target = "_blank";
      waLink.rel = "noopener";
      waLink.innerHTML = `<span class="wa-icon" aria-hidden="true"></span><span class="wa-text">WhatsApp</span>`;

      actions.appendChild(btnContact);
      actions.appendChild(waLink);

      // montar corpo
      body.appendChild(title);
      body.appendChild(location);
      body.appendChild(meta);
      body.appendChild(price);
      body.appendChild(actions);

      // compor card
      card.appendChild(imgLink);
      card.appendChild(body);

      grid.appendChild(card);
    });

    results.appendChild(grid);
  }

  // --- filtros simples e inicialização do catálogo ---
  function parseQuery() {
    const params = new URLSearchParams(window.location.search);
    return {
      tipo: params.get("tipo") || "",
      bairro: params.get("bairro") || "",
      preco: params.get("preco") || "",
      quartos: params.get("quartos") || "",
    };
  }

  function passesFilter(p, filters) {
    if (filters.tipo && filters.tipo !== "" && p.tipo !== filters.tipo)
      return false;
    if (
      filters.bairro &&
      filters.bairro.trim() !== "" &&
      p.bairro.toLowerCase().indexOf(filters.bairro.toLowerCase()) === -1
    )
      return false;
    if (
      filters.quartos &&
      filters.quartos !== "" &&
      Number(filters.quartos) > 0
    ) {
      if (
        !(
          p.quartos === Number(filters.quartos) ||
          (Number(filters.quartos) === 1 && p.quartos === 0)
        )
      )
        return false;
    }
    if (filters.preco && filters.preco !== "") {
      if (filters.preco.indexOf("-") > -1) {
        const [min, max] = filters.preco.split("-").map((n) => Number(n));
        if (p.preco < min || p.preco > max) return false;
      } else {
        const max = Number(filters.preco);
        if (p.preco > max) return false;
      }
    }
    return true;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const resultsEl = qs("#results");
    if (!resultsEl) return;
    const filters = parseQuery();
    const list = mockProperties.filter((p) => passesFilter(p, filters));
    renderCards(list);
  });

  // --- modal de contato (um modal único, com texto preenchido incluindo imóvel) ---
  function buildModal() {
    // remove existente (evita duplicação)
    const existing = document.querySelector(".contact-modal-overlay");
    if (existing) existing.remove();

    // cria overlay e força estilos inline para garantir comportamento modal
    const overlay = document.createElement("div");
    overlay.className = "contact-modal-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "rgba(0,0,0,0.44)",
      backdropFilter: "blur(3px)",
      zIndex: String(2147483647),
      boxSizing: "border-box",
      overflowY: "auto",
    });

    const card = document.createElement("div");
    card.className = "contact-modal-card";
    card.innerHTML = `
      <button class="contact-modal-close" aria-label="Fechar">✕</button>
      <div class="contact-modal-body"></div>
    `;

    overlay.appendChild(card);
    // append direto no body (importante)
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");

    // handlers de fechamento
    function removeModal() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", escHandler);
    }
    function escHandler(ev) {
      if (ev.key === "Escape") removeModal();
    }

    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) removeModal();
    });
    const closeBtn = card.querySelector(".contact-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", removeModal);
    window.addEventListener("keydown", escHandler);

    return { overlay, card, removeModal };
  }

  function getFiltersFromUrl() {
    const p = new URLSearchParams(window.location.search);
    return {
      tipo: p.get("tipo") || "",
      bairro: p.get("bairro") || "",
      preco: p.get("preco") || "",
      quartos: p.get("quartos") || "",
    };
  }

  function prettyPriceLabel(p) {
    if (!p) return "";
    if (p.indexOf("-") > -1) {
      const [a, b] = p.split("-").map((n) => Number(n));
      return `de ${a.toLocaleString("pt-BR")} até ${b.toLocaleString("pt-BR")}`;
    }
    return `até R$ ${Number(p).toLocaleString("pt-BR")}`;
  }

  function buildPrefilledMessage(filters, property) {
    const parts = [];
    if (property) parts.push(`Imóvel: ${property}`);
    if (filters.tipo) parts.push(`Tipo: ${filters.tipo}`);
    if (filters.bairro) parts.push(`Bairro: ${filters.bairro}`);
    if (filters.preco) parts.push(`Preço: ${prettyPriceLabel(filters.preco)}`);
    if (filters.quartos) parts.push(`Quartos: ${filters.quartos}`);
    const detail = parts.length
      ? parts.join(" • ")
      : "Tenho interesse em um imóvel.";
    return `Olá, tenho interesse. ${detail} Pode me informar mais detalhes e disponibilidade? Obrigado.`;
  }

  // delegação: abrir modal ao clicar em botão "Ver contato"
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".btn-contact");
    if (!btn) return;
    e.preventDefault();

    const cardEl = btn.closest(".card");
    const propertyTitle = cardEl
      ? (qs(".card-title", cardEl)?.textContent || "").trim()
      : "";
    const propertyTipo = cardEl
      ? qs(".meta", cardEl)?.textContent.split("•")[0]?.trim() || ""
      : "";
    const filters = getFiltersFromUrl();
    const message = buildPrefilledMessage(
      filters,
      propertyTitle || `${propertyTipo} selecionado`
    );

    const { card: modalCard } = buildModal();
    const body = qs(".contact-modal-body", modalCard);

    body.innerHTML = `
      <h3>Fale conosco</h3>
      <form id="compactContactForm" class="contact-compact-form">
        <label>Nome
          <input name="name" type="text" required class="contact-field" placeholder="Seu nome">
        </label>

        <label>Telefone ou Email
          <input name="contact" type="text" required class="contact-field" placeholder="Telefone ou email">
        </label>

        <label>Mensagem
          <textarea name="message" rows="4" required class="contact-field">${message}</textarea>
        </label>

        <div class="form-actions">
          <a class="contact-whatsapp contact-whatsapp-btn" target="_blank" rel="noopener" aria-label="Enviar via WhatsApp">
            <!-- SVG branco do WhatsApp (usa currentColor para herdar cor do botão) -->
            <svg class="wa-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="currentColor" d="M20.52 3.48A11.76 11.76 0 0012.02.25 11.79 11.79 0 00.96 12.3c0 2.07.54 4.11 1.57 5.9L.25 23.75l5.86-1.53a11.73 11.73 0 005.91 1.52h.01c6.5 0 11.81-5.28 11.81-11.79a11.8 11.8 0 00-3.27-8.95zM12.02 21.1a9 9 0 01-4.56-1.21l-.33-.2-3.48.91.93-3.38-.21-.34A9 9 0 1112.02 21.1zM17.06 14.47c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.57.13-.17.25-.66.81-.81.98-.15.17-.3.19-.55.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.48-1.38-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.03-.32-.02-.45-.05-.13-.57-1.37-.78-1.87-.21-.49-.43-.42-.58-.42-.15 0-.32 0-.5 0-.17 0-.45.06-.69.32-.24.26-.92.9-.92 2.2 0 1.3.95 2.56 1.08 2.74.13.17 1.86 2.84 4.51 3.87 2.65 1.04 2.65.69 3.12.64.47-.05 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29z"/>
            </svg>
            <span class="wa-text">Enviar via WhatsApp</span>
          </a>

          <button type="submit" class="contact-submit">Enviar</button>
        </div>
      </form>
    `;

    const compactForm = qs("#compactContactForm", modalCard);
    if (!compactForm) return;

    function updateWhatsAppLink() {
      const fd = new FormData(compactForm);
      const msg = fd.get("message") || message;
      const text = `${msg}\n\nImóvel: ${propertyTitle}\nNome: ${
        fd.get("name") || ""
      }\nContato: ${fd.get("contact") || ""}`;
      const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        text
      )}`;
      const waBtn = qs(".contact-whatsapp", modalCard);
      if (waBtn) waBtn.href = href;
    }

    updateWhatsAppLink();
    compactForm.addEventListener("input", updateWhatsAppLink);
    compactForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const params = new URLSearchParams(new FormData(compactForm)).toString();
      window.location.href = "contato.html?" + params;
    });
  });
})();
document.addEventListener("DOMContentLoaded", function () {
  // Mock de imóveis (substitua pelo seu array real)
  const properties = [
    {
      id: 1,
      title: "Casa no Centro",
      tipo: "casa",
      bairro: "Centro",
      preco: 380000,
      quartos: 3,
      vagas: 2,
      area: 175,
      img: "img/casa/01/foto1.jpeg",
      imagens: [
        "img/casa/01/foto1.jpeg",
        "img/casa/01/foto2.jpeg",
        "img/casa/01/foto3.jpeg",
        "img/casa/01/foto4.jpeg",
        "img/casa/01/foto5.jpeg",
      ],
    },
    { id: 2, img: "img/casa/01/foto1.jpeg" },
    { id: 3, img: "img/sample3.jpg" },
  ];

  // Pega o id da URL
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  // Busca o imóvel pelo id
  const property = properties.find((p) => p.id === id);

  // Atualiza a imagem principal
  if (property) {
    document.getElementById("mainPhoto").src = property.img;
    document.getElementById("propertyTitle").textContent = property.title;
    document.getElementById("propertyPreco").textContent =
      property.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    document.getElementById("propertyQuartos").textContent = property.quartos;
    document.getElementById("propertyVagas").textContent = property.vagas;
    document.getElementById("propertyArea").textContent = property.area + "m²";
    // ... outros campos
    // Miniaturas
    const thumbs = document.getElementById("thumbs");
    if (thumbs && property.imagens) {
      thumbs.innerHTML = property.imagens
        .map((src) => `<img src="${src}" alt="Foto do imóvel">`)
        .join("");
    }
  }
});
document.querySelectorAll(".dropdown-item[data-phone]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var phone = btn.getAttribute("data-phone");
    var name = btn.getAttribute("data-name") || "";
    var msg = encodeURIComponent(
      "Olá " + name + ", gostaria de informações sobre imóveis."
    );
    window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
  });
});

// Botões do menu WhatsApp (mobile)
document.querySelectorAll(".nav-wh-btn[data-phone]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    var phone = btn.getAttribute("data-phone");
    var name = btn.textContent.split("—")[0].trim();
    var msg = encodeURIComponent(
      "Olá " + name + ", gostaria de informações sobre imóveis."
    );
    window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  const header = document.querySelector(".site-header");
  if (!btn || !nav || !header) return;

  // controla abertura/fechamento
  function setNav(open) {
    const isOpen =
      typeof open === "boolean" ? open : !nav.classList.contains("open");
    nav.classList.toggle("open", isOpen);
    btn.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", String(isOpen));
    // não esconder o botão se o menu estiver aberto
    btn.classList.toggle(
      "hidden",
      !isOpen && header.getBoundingClientRect().bottom <= 0
    );
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    setNav();
  });

  // fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    if (nav.contains(e.target) || btn.contains(e.target)) return;
    setNav(false);
  });

  // fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setNav(false);
  });

  // oculta o botão quando o header sai da viewport, mas NÃO enquanto o menu estiver aberto
  let ticking = false;
  function checkHeader() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const headerHidden = header.getBoundingClientRect().bottom <= 0;
      btn.classList.toggle(
        "hidden",
        headerHidden && !nav.classList.contains("open")
      );
      ticking = false;
    });
  }
  checkHeader();
  window.addEventListener("scroll", checkHeader, { passive: true });
  window.addEventListener("resize", checkHeader);

  // mantém aria-sync se a classe mudar por outro código
  const mo = new MutationObserver(() => {
    const isOpen = nav.classList.contains("open");
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.classList.toggle("open", isOpen);
  });
  mo.observe(nav, { attributes: true, attributeFilter: ["class"] });
});
