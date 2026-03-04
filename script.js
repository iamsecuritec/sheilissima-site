// ==============================
// CONFIG
// ==============================
const STORE = {
  name: "Sheilissima Moda Fitness",
  whatsapp: "5511967736005", // sem + e sem espaços
  instagramUrl: "https://www.instagram.com/sheilissima_fit/?hl=en"
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// Produtos (adicione/remova quando quiser)
const PRODUCTS = [
  {
    id: "leg-01",
    category: "leggings",
    name: "Legging Cintura Alta Power",
    description: "Cintura alta, compressão confortável e caimento que valoriza.",
    price: 129.9,
    image: "assets/prod-leg-01.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Azul Marinho", "Grafite", "Rosa"],
  },
  {
    id: "leg-02",
    category: "leggings",
    name: "Legging Texturizada Premium",
    description: "Tecido encorpado e toque macio. Excelente para treino e dia a dia.",
    price: 149.9,
    image: "assets/prod-leg-02.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Vinho", "Verde"],
  },
  {
    id: "top-01",
    category: "tops",
    name: "Top Sustentação Média",
    description: "Conforto e firmeza na medida certa, com bojo removível.",
    price: 79.9,
    image: "assets/prod-top-01.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco", "Rosa", "Lilás"],
  },
  {
    id: "conj-01",
    category: "conjuntos",
    name: "Conjunto Fitness (Top + Legging)",
    description: "Look completo, estiloso e funcional. Ideal para academia e caminhada.",
    price: 219.9,
    image: "assets/prod-conj-01.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Azul", "Rosa"],
  },
  {
    id: "maca-01",
    category: "macacoes",
    name: "Macacão Fitness Slim",
    description: "Modelagem que alonga, tecido confortável e versátil.",
    price: 189.9,
    image: "assets/prod-maca-01.jpg",
    sizes: ["P", "M", "G"],
    colors: ["Preto", "Marrom", "Verde"],
  },
  {
    id: "short-01",
    category: "shorts",
    name: "Shorts Cintura Alta",
    description: "Fresquinho, não enrola e tem ótimo ajuste no corpo.",
    price: 89.9,
    image: "assets/prod-short-01.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Pink", "Azul"],
  },
  {
    id: "aces-01",
    category: "acessorios",
    name: "Kit Faixa + Scrunchie",
    description: "Acessórios para completar seu look fitness.",
    price: 39.9,
    image: "assets/prod-aces-01.jpg",
    sizes: ["Único"],
    colors: ["Preto", "Rosa", "Colorido"],
  },
];

// ==============================
// STATE (cart in localStorage)
// ==============================
const LS_KEY = "sheilissima_cart_v1";

function loadCart() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(LS_KEY, JSON.stringify(cart));
}

let cart = loadCart();

// ==============================
// HELPERS
// ==============================
function waLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${STORE.whatsapp}?text=${text}`;
}

function buildDefaultWhatsMessage() {
  return `Olá! Vim pelo site da ${STORE.name}. Quero tirar uma dúvida 🙂`;
}

function cartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return { subtotal, total: subtotal };
}

function updateCartBadges() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const c1 = document.getElementById("cartCount");
  const c2 = document.getElementById("cartCount2");
  if (c1) c1.textContent = String(count);
  if (c2) c2.textContent = String(count);
}

function findProduct(productId) {
  return PRODUCTS.find(p => p.id === productId);
}

function addToCart(product, size, color) {
  const key = `${product.id}__${size}__${color}`;
  const existing = cart.find(i => i.key === key);

  if (existing) existing.qty += 1;
  else {
    cart.push({
      key,
      productId: product.id,
      name: product.name,
      price: product.price,
      size,
      color,
      qty: 1
    });
  }

  saveCart(cart);
  updateCartBadges();
  renderCart();
}

function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart(cart);
  updateCartBadges();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart(cart);
  updateCartBadges();
  renderCart();
}

function openCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function setActiveFilter(btn) {
  document.querySelectorAll(".chip").forEach(b => b.classList.remove("is-active"));
  btn.classList.add("is-active");
}

function currentFilter() {
  const active = document.querySelector(".chip.is-active");
  return active ? active.getAttribute("data-filter") : "all";
}

// ==============================
// RENDER PRODUCTS
// ==============================
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const filter = currentFilter();
  const q = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  const sort = document.getElementById("sortSelect")?.value || "featured";

  let items = PRODUCTS.slice();

  if (filter !== "all") items = items.filter(p => p.category === filter);
  if (q) items = items.filter(p => (p.name + " " + p.description).toLowerCase().includes(q));

  if (sort === "price-asc") items.sort((a,b) => a.price - b.price);
  if (sort === "price-desc") items.sort((a,b) => b.price - a.price);
  if (sort === "name-asc") items.sort((a,b) => a.name.localeCompare(b.name));

  grid.innerHTML = items.map(p => `
    <article class="product" data-id="${p.id}">
      <div class="product__img">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
      </div>

      <div class="product__body">
        <div class="product__title">
          <h3>${p.name}</h3>
          <div class="price">${BRL.format(p.price)}</div>
        </div>

        <p class="product__desc">${p.description}</p>

        <div class="variants">
          <div class="variant">
            <label for="size-${p.id}">Tamanho</label>
            <select id="size-${p.id}">
              ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>

          <div class="variant">
            <label for="color-${p.id}">Cor</label>
            <select id="color-${p.id}">
              ${p.colors.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="product__actions">
          <button class="btn btn--primary" data-add="${p.id}">Adicionar</button>
          <button class="btn btn--ghost" data-wa="${p.id}">WhatsApp</button>
        </div>
      </div>
    </article>
  `).join("");

  // bind actions
  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-add");
      const product = findProduct(id);
      const size = document.getElementById(`size-${id}`).value;
      const color = document.getElementById(`color-${id}`).value;
      addToCart(product, size, color);
      openCart();
    });
  });

  grid.querySelectorAll("[data-wa]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-wa");
      const product = findProduct(id);
      const size = document.getElementById(`size-${id}`).value;
      const color = document.getElementById(`color-${id}`).value;

      const msg =
        `Olá! Vim pelo site da ${STORE.name}. Quero comprar:\n` +
        `- ${product.name}\n` +
        `- Tamanho: ${size}\n` +
        `- Cor: ${color}\n\n` +
        `Pode me ajudar com disponibilidade e entrega/retirada?`;

      window.open(waLink(msg), "_blank");
    });
  });
}

// ==============================
// RENDER CART
// ==============================
function renderCart() {
  const wrap = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl = document.getElementById("cartTotal");

  if (!wrap || !subtotalEl || !totalEl) return;

  if (cart.length === 0) {
    wrap.innerHTML = `
      <div class="card" style="box-shadow:none;">
        <strong>Seu carrinho está vazio</strong>
        <p class="muted" style="margin:.35rem 0 0;">Escolha um produto e clique em “Adicionar”.</p>
      </div>
    `;
  } else {
    wrap.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__top">
          <div>
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__meta">Tamanho: ${item.size} • Cor: ${item.color}</div>
          </div>
          <strong>${BRL.format(item.price * item.qty)}</strong>
        </div>

        <div class="qty">
          <button aria-label="Diminuir" data-qty="${item.key}" data-d="-1">−</button>
          <span>${item.qty}</span>
          <button aria-label="Aumentar" data-qty="${item.key}" data-d="1">+</button>
          <button class="btn btn--ghost" style="margin-left:auto; padding:.45rem .7rem;" data-remove="${item.key}">Remover</button>
        </div>
      </div>
    `).join("");
  }

  const { subtotal, total } = cartTotals();
  subtotalEl.textContent = BRL.format(subtotal);
  totalEl.textContent = BRL.format(total);

  wrap.querySelectorAll("[data-qty]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-qty");
      const delta = Number(btn.getAttribute("data-d"));
      changeQty(key, delta);
    });
  });

  wrap.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-remove");
      cart = cart.filter(i => i.key !== key);
      saveCart(cart);
      updateCartBadges();
      renderCart();
    });
  });
}

// ==============================
// CHECKOUT WHATSAPP
// ==============================
function buildCheckoutMessage() {
  const delivery = document.getElementById("deliverySelect")?.value || "pickup";
  const deliveryLabel = delivery === "pickup" ? "Retirada na loja" : "Delivery (combinar)";

  const lines = cart.map(i =>
    `• ${i.name} (Tam: ${i.size}, Cor: ${i.color}) x${i.qty} — ${BRL.format(i.price * i.qty)}`
  );

  const { subtotal } = cartTotals();

  return `Olá! Vim pelo site da ${STORE.name} e gostaria de finalizar meu pedido.\n\n` +
         `Itens:\n${lines.join("\n")}\n\n` +
         `Subtotal: ${BRL.format(subtotal)}\n` +
         `Entrega: ${deliveryLabel}\n\n` +
         `Pode confirmar disponibilidade, forma de pagamento e prazo? Obrigado(a)!`;
}

// ==============================
// CONTACT FORM TO WHATSAPP
// ==============================
function bindContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    const msg =
      `Olá! Meu nome é ${name}.\n` +
      (phone ? `Meu WhatsApp: ${phone}\n` : "") +
      `\nMensagem:\n${message}`;

    window.open(waLink(msg), "_blank");
    form.reset();
  });
}

// ==============================
// UI BINDINGS
// ==============================
function bindUI() {
  // WhatsApp buttons
  const whatsButtons = ["whatsTop","whatsMobile","whatsBuy","whatsAbout","whatsContact","stickyWhats"];
  whatsButtons.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = waLink(buildDefaultWhatsMessage());
  });

  // Instagram buttons
  const instaButtons = ["instaHero", "instaBuy", "instaContact"];
  instaButtons.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = STORE.instagramUrl;
  });

  // Cart open/close
  document.getElementById("openCart")?.addEventListener("click", openCart);
  document.getElementById("stickyCart")?.addEventListener("click", openCart);
  document.getElementById("closeCart")?.addEventListener("click", closeCart);
  document.getElementById("closeCartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("clearCart")?.addEventListener("click", clearCart);

  // Checkout WhatsApp
  document.getElementById("checkoutWhats")?.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }
    window.open(waLink(buildCheckoutMessage()), "_blank");
  });

  // Filters
  document.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      setActiveFilter(btn);
      renderProducts();
    });
  });

  // Search + Sort
  document.getElementById("searchInput")?.addEventListener("input", renderProducts);
  document.getElementById("sortSelect")?.addEventListener("change", renderProducts);

  // Burger mobile
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!isOpen));
      menu.hidden = isOpen;
    });

    menu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    });
  }

  // Search button scroll
  document.getElementById("openSearch")?.addEventListener("click", () => {
    document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => document.getElementById("searchInput")?.focus(), 300);
  });

  bindContactForm();
}

// ==============================
// INIT
// ==============================
updateCartBadges();
bindUI();
renderProducts();
renderCart();