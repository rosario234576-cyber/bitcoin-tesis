const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");

function closeMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.classList.remove("is-open");
  mobileMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

// Header compacto al hacer scroll
const topbar = document.querySelector(".topbar");

function updateTopbar() {
  topbar?.classList.toggle("is-scrolled", window.scrollY > 24);
}

updateTopbar();
window.addEventListener("scroll", updateTopbar, { passive: true });

const SESSION_KEY = "bitcoinTesisSession";
const accountMenus = document.querySelectorAll(".account-menu");

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch (error) {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getFirstName(value) {
  const cleanValue = value.trim();
  if (!cleanValue) return "Usuario";
  const withoutEmailDomain = cleanValue.split("@")[0];
  return withoutEmailDomain.split(/\s+/)[0] || "Usuario";
}

function closeAccountMenus() {
  accountMenus.forEach((menu) => {
    menu.classList.remove("is-open");
    menu.querySelector(".account-icon-link")?.setAttribute("aria-expanded", "false");
  });
}

accountMenus.forEach((menu) => {
  const button = menu.querySelector(".account-icon-link");

  button?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("is-open");

    accountMenus.forEach((item) => {
      if (item !== menu) {
        item.classList.remove("is-open");
        item.querySelector(".account-icon-link")?.setAttribute("aria-expanded", "false");
      }
    });

    button.setAttribute("aria-expanded", String(isOpen));
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".account-menu")) {
    closeAccountMenus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAccountMenus();
  }
});

document.querySelectorAll("[data-logout]").forEach((link) => {
  link.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
  });
});

function updateSessionUI() {
  const session = getStoredSession();
  const greeting = session?.name ? `Hola ${session.name}!` : "Hola!";

  document.querySelectorAll("[data-session-greeting]").forEach((item) => {
    item.textContent = greeting;
  });

  const accountHeading = document.querySelector("[data-account-heading]");
  const accountTitle = document.querySelector("[data-account-status-title]");
  const accountCopy = document.querySelector("[data-account-status-copy]") || accountTitle?.nextElementSibling;
  const guestActions = document.querySelector("[data-guest-actions]");

  if (session && accountHeading && accountTitle && accountCopy) {
    accountHeading.textContent = `Cuenta de ${session.name}`;
    accountTitle.textContent = "Sesion iniciada";
    accountCopy.textContent = `Estas viendo la sesion activa de ${session.email || session.name}.`;
    guestActions?.classList.add("is-hidden");
  }

  const profileName = document.querySelector("[data-profile-name]");
  const profileLastName = document.querySelector("[data-profile-lastname]");
  const profileEmail = document.querySelector("[data-profile-email]");

  if (session && profileName) {
    const fullName = session.fullName || session.name || "";
    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

    profileName.textContent = nameParts[0] || session.name || "Usuario";
    if (profileLastName) {
      profileLastName.textContent = nameParts.slice(1).join(" ") || "Sin completar";
    }
    if (profileEmail && session.email) {
      profileEmail.textContent = session.email;
    }
  }
}

updateSessionUI();

document.querySelectorAll('a[href*="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const url = new URL(href, window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;

    const target = document.querySelector(url.hash);
    if (!target) return;

    event.preventDefault();
    closeMenu();

    const headerHeight = document.querySelector(".topbar")?.offsetHeight || 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });

    history.pushState(null, "", url.hash);
  });
});

function scrollToCurrentHash() {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (!target) return;

  const headerHeight = document.querySelector(".topbar")?.offsetHeight || 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
}

window.addEventListener("load", () => {
  window.setTimeout(scrollToCurrentHash, 80);
});

const pageSections = document.querySelectorAll("main > section");
pageSections.forEach((section, index) => {
  if (index > 0) {
    section.classList.add("section-reveal");
  }
});

document.querySelectorAll(".feature-card").forEach((card, index) => {
  card.style.transitionDelay = `${index * 140}ms`;
});

document.querySelectorAll(".symbol-card, .flow-step").forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
});

document.querySelectorAll(".benefit-card, .benefit-strip article, .process-panel article").forEach((item, index) => {
  item.style.transitionDelay = `${index * 110}ms`;
});

document.querySelectorAll(".market-guide-card").forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
});

document.querySelectorAll(".account-condition").forEach((item, index) => {
  item.style.transitionDelay = `${index * 110}ms`;
});

document.querySelectorAll(".contact-channel").forEach((item, index) => {
  item.style.transitionDelay = `${index * 120}ms`;
});

const revealItems = document.querySelectorAll(".reveal, .section-reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -18% 0px",
      threshold: 0.16,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const tradeForm = document.querySelector("#trade-form");
const fiatInput = document.querySelector("#fiat-input");
const fiatCurrency = document.querySelector("#fiat-currency");
const btcOutput = document.querySelector("#btc-output");
const btcPrice = document.querySelector("#btc-price");
const feeOutput = document.querySelector("#fee-output");
const netOutput = document.querySelector("#net-output");
const tradeMessage = document.querySelector("#trade-message");
const tradeTabs = document.querySelectorAll(".trade-tab");
const fiatLabel = document.querySelector("#fiat-label");
const inputUnit = document.querySelector("#input-unit");
const outputUnit = document.querySelector("#output-unit");
const netLabel = document.querySelector("#net-label");
const tradeError = document.querySelector("#trade-error");
const tradeChips = document.querySelector("#trade-chips");

// El formulario puede arrancar en modo venta (data-mode="sell" en Vender)
let tradeMode = tradeForm?.dataset.mode || "buy";
const rates = {
  USD: 67450,
  ARS: 81000000,
};
const fees = {
  buy: 0.008,
  sell: 0.006,
};
// Limites de la simulacion: compra en moneda fiat, venta en BTC
const limits = {
  buy: { USD: [10, 100000], ARS: [10000, 120000000] },
  sell: [0.0001, 5],
};
const quickAmounts = {
  buy: { USD: [50, 100, 250, 500], ARS: [50000, 100000, 250000, 500000] },
  sell: [0.001, 0.005, 0.01, 0.05],
};

function moneyFormat(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(value);
}

function btcFormat(value) {
  return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 8, maximumFractionDigits: 8 }).format(value);
}

// Acepta coma o punto decimal; devuelve null si esta vacio y NaN si no es un numero
function parseAmount(raw) {
  const clean = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!clean) return null;
  if (!/^\d*\.?\d*$/.test(clean) || clean === ".") return NaN;
  return Number(clean);
}

function validateAmount(amount, currency) {
  if (amount === null) return "Ingresá un monto para simular.";
  if (Number.isNaN(amount)) return "Usá solo números (por ejemplo 250 o 0,005).";
  if (amount <= 0) return "El monto tiene que ser mayor a cero.";

  if (tradeMode === "buy") {
    const [min, max] = limits.buy[currency];
    if (amount < min) return `El mínimo de compra es ${moneyFormat(min, currency)}.`;
    if (amount > max) return `El máximo por simulación es ${moneyFormat(max, currency)}.`;
  } else {
    const [min, max] = limits.sell;
    if (amount < min) return `El mínimo de venta es ${min} BTC.`;
    if (amount > max) return `El máximo por simulación es ${max} BTC.`;
  }
  return "";
}

function renderTradeChips() {
  if (!tradeChips) return;
  const values = tradeMode === "buy" ? quickAmounts.buy[fiatCurrency.value] : quickAmounts.sell;
  const unit = tradeMode === "buy" ? fiatCurrency.value : "BTC";

  tradeChips.innerHTML = "";
  values.forEach((value) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.dataset.amount = String(value);
    chip.textContent = tradeMode === "buy"
      ? `${new Intl.NumberFormat("es-AR").format(value)} ${unit}`
      : `${String(value).replace(".", ",")} ${unit}`;
    chip.addEventListener("click", () => {
      fiatInput.value = String(value).replace(".", ",");
      updateTradeCalculator();
    });
    tradeChips.append(chip);
  });
}

function updateTradeCalculator() {
  if (!fiatInput || !fiatCurrency || !btcOutput || !btcPrice || !feeOutput || !netOutput) return;

  const currency = fiatCurrency.value;
  const amount = parseAmount(fiatInput.value);
  const fee = fees[tradeMode];
  const error = validateAmount(amount, currency);

  btcPrice.textContent = moneyFormat(rates[currency], currency);
  if (fiatLabel) fiatLabel.textContent = tradeMode === "buy" ? "Pagás" : "Vendés";
  if (inputUnit) inputUnit.textContent = tradeMode === "buy" ? currency : "BTC";
  if (outputUnit) outputUnit.textContent = tradeMode === "buy" ? "BTC" : currency;
  if (netLabel) netLabel.textContent = tradeMode === "buy" ? "Monto neto invertido" : "Total a recibir";

  tradeChips?.querySelectorAll("button").forEach((chip) => {
    chip.classList.toggle("active", Number(chip.dataset.amount) === amount);
  });

  fiatInput.closest(".l-input")?.classList.toggle("is-invalid", Boolean(error));
  fiatInput.setAttribute("aria-invalid", String(Boolean(error)));
  if (tradeError) tradeError.textContent = error;

  if (error) {
    btcOutput.value = "—";
    feeOutput.textContent = `${(fee * 100).toFixed(2).replace(".", ",")}%`;
    netOutput.textContent = "—";
    return false;
  }

  if (tradeMode === "buy") {
    const feeAmount = amount * fee;
    const netAmount = amount - feeAmount;
    btcOutput.value = btcFormat(netAmount / rates[currency]);
    feeOutput.textContent = `${(fee * 100).toFixed(2).replace(".", ",")}% · ${moneyFormat(feeAmount, currency)}`;
    netOutput.textContent = moneyFormat(netAmount, currency);
  } else {
    const gross = amount * rates[currency];
    const feeAmount = gross * fee;
    const netAmount = gross - feeAmount;
    btcOutput.value = moneyFormat(netAmount, currency).replace(/^[^\d-]+/, "");
    feeOutput.textContent = `${(fee * 100).toFixed(2).replace(".", ",")}% · ${moneyFormat(feeAmount, currency)}`;
    netOutput.textContent = moneyFormat(netAmount, currency);
  }
  return true;
}

if (tradeForm) {
  renderTradeChips();
  updateTradeCalculator();

  fiatInput.addEventListener("input", () => {
    tradeMessage?.classList.remove("is-success");
    updateTradeCalculator();
  });
  fiatCurrency.addEventListener("change", () => {
    renderTradeChips();
    updateTradeCalculator();
  });

  tradeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tradeMode === tab.dataset.mode) return;
      tradeMode = tab.dataset.mode;
      tradeTabs.forEach((item) => {
        item.classList.toggle("active", item === tab);
        item.setAttribute("aria-pressed", String(item === tab));
      });
      // Al cambiar de modo se propone un monto valido para ese modo
      fiatInput.value = tradeMode === "buy" ? String(quickAmounts.buy[fiatCurrency.value][2]) : "0,005";
      renderTradeChips();
      updateTradeCalculator();
    });
  });

  tradeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!updateTradeCalculator()) {
      fiatInput.focus();
      return;
    }
    const summary = tradeMode === "buy"
      ? `Simulación lista: recibirías ${btcOutput.value} BTC.`
      : `Simulación lista: recibirías ${netOutput.textContent}.`;
    tradeMessage.innerHTML = `<i></i> ${summary} No se realizó ninguna operación real.`;
    tradeMessage.classList.add("is-success");
  });
}

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");
    document.querySelectorAll(".faq-item").forEach((faq) => faq.classList.remove("is-open"));
    item.classList.toggle("is-open", !isOpen);
  });
});

document.querySelectorAll(".chart-periods").forEach((periodGroup) => {
  periodGroup.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      periodGroup.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
});

const heroMarketDashboard = document.querySelector(".market-dashboard");
const heroVisual = document.querySelector(".hero-visual");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroMarketDashboard && heroVisual && window.matchMedia("(min-width: 981px)").matches && !reduceMotion.matches) {
  heroVisual.addEventListener("pointermove", (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    heroMarketDashboard.style.setProperty("--tilt-x", `${relativeY * -5}deg`);
    heroMarketDashboard.style.setProperty("--tilt-y", `${relativeX * 7}deg`);
  });

  heroVisual.addEventListener("pointerleave", () => {
    heroMarketDashboard.style.setProperty("--tilt-x", "0deg");
    heroMarketDashboard.style.setProperty("--tilt-y", "0deg");
  });
}

const faqSearchInput = document.querySelector("#faq-search-input");
const faqFilters = document.querySelectorAll(".faq-filter");
const faqRows = document.querySelectorAll(".faq-row");
let activeFaqFilter = "all";

function updateFaqRows() {
  if (!faqRows.length) return;

  const query = faqSearchInput?.value.trim().toLowerCase() || "";

  faqRows.forEach((row) => {
    const category = row.dataset.category;
    const text = row.textContent.toLowerCase();
    const matchesCategory = activeFaqFilter === "all" || category === activeFaqFilter;
    const matchesQuery = !query || text.includes(query);

    row.classList.toggle("is-hidden", !(matchesCategory && matchesQuery));
  });
}

faqFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeFaqFilter = filter.dataset.filter;
    faqFilters.forEach((item) => item.classList.toggle("active", item === filter));
    updateFaqRows();
  });
});

if (faqSearchInput) {
  faqSearchInput.addEventListener("input", updateFaqRows);
}

faqRows.forEach((row) => {
  const button = row.querySelector("button");

  button?.addEventListener("click", () => {
    const isOpen = row.classList.contains("is-open");
    faqRows.forEach((item) => item.classList.remove("is-open"));
    row.classList.toggle("is-open", !isOpen);
  });
});

const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");

document.querySelectorAll(".password-toggle").forEach((passwordToggle) => {
  const passwordInput = document.querySelector(`#${passwordToggle.getAttribute("aria-controls")}`);
  if (!passwordInput) return;

  passwordToggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    passwordToggle.textContent = isHidden ? "Ocultar" : "Ver";
    passwordToggle.setAttribute("aria-label", isHidden ? "Ocultar contrasena" : "Mostrar contrasena");
  });
});

if (loginForm && loginMessage) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const user = String(formData.get("user") || "");
    const name = getFirstName(user);

    saveSession({
      name,
      fullName: name,
      email: user.includes("@") ? user : "",
    });

    loginMessage.textContent = "Sesion iniciada. Redirigiendo a tu cuenta...";
    updateSessionUI();
    window.setTimeout(() => {
      window.location.href = "mi-cuenta.html";
    }, 650);
  });
}

const registerForm = document.querySelector("#register-form");
const registerMessage = document.querySelector("#register-message");

if (registerForm && registerMessage) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const fullName = String(formData.get("name") || "");
    const name = getFirstName(fullName);
    const email = String(formData.get("email") || "");

    saveSession({
      name,
      fullName,
      email,
    });

    registerMessage.textContent = "Cuenta creada. Redirigiendo a tu cuenta...";
    updateSessionUI();
    window.setTimeout(() => {
      window.location.href = "mi-cuenta.html";
    }, 650);
  });
}

const contactForm = document.querySelector("#contact-form");
const contactMessage = document.querySelector("#contact-message");

if (contactForm && contactMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactMessage.textContent = "Mensaje simulado enviado. En produccion se conectaria con soporte.";
  });
}

document.querySelectorAll(".market-canvas").forEach((canvas) => {
  const context = canvas.getContext("2d");
  const type = canvas.dataset.chart;
  const values = type === "sell"
    ? [72, 70, 71, 68, 66, 67, 64, 65, 63, 61, 62, 60]
    : [54, 56, 55, 58, 61, 60, 64, 67, 66, 70, 72, 75];

  function drawChart() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const width = rect.width;
    const height = rect.height;
    context.clearRect(0, 0, width, height);

    context.strokeStyle = "rgba(255, 255, 255, 0.08)";
    context.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = 18;
    const points = values.map((value, index) => {
      const x = (width / (values.length - 1)) * index;
      const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
      return { x, y };
    });

    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(255, 134, 0, 0.32)");
    gradient.addColorStop(1, "rgba(255, 134, 0, 0)");

    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.strokeStyle = "#FF8600";
    context.lineWidth = 3;
    context.stroke();

    points.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, 4, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();
    });
  }

  drawChart();
  window.addEventListener("resize", drawChart);
});
