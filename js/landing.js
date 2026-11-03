// Landing: progreso de lectura, apariciones,
// scroll narrativo de "Como funciona" y acordeon de ayuda.
(() => {
  const mobileQuery = window.matchMedia("(max-width: 960px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const progressBar = document.querySelector(".scroll-progress");

  /* Aparicion progresiva --------------------------------------- */
  document.querySelectorAll(".l-benefit").forEach((item, index) => {
    item.style.setProperty("--delay", `${index * 90}ms`);
  });
  document.querySelectorAll(".l-sim-copy .l-reveal, .l-faq .l-reveal").forEach((item, index) => {
    item.style.setProperty("--delay", `${(index % 3) * 120}ms`);
  });

  const revealItems = document.querySelectorAll(".l-reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* Como funciona: panel sticky sincronizado con el scroll --------- */
  const steps = [...document.querySelectorAll(".l-step")];
  const stagePanel = document.querySelector(".l-stage .l-panel");
  const screens = [...document.querySelectorAll(".l-stage .l-screen")];
  const dots = [...document.querySelectorAll(".l-stage .l-panel-dots span")];
  const stageCount = document.querySelector("[data-stage-count]");
  const stageTitle = document.querySelector("[data-stage-title]");
  let activeStep = 0;

  // En mobile no hay sticky: cada paso muestra su propia pantalla
  steps.forEach((step, index) => {
    const media = step.querySelector(".l-step-media");
    if (!media || !screens[index]) return;
    const panel = document.createElement("div");
    const holder = document.createElement("div");
    panel.className = "l-panel";
    holder.className = "l-screens";
    holder.style.height = "auto";
    const clone = screens[index].cloneNode(true);
    clone.classList.remove("is-active");
    holder.append(clone);
    panel.append(holder);
    media.append(panel);
  });

  if ("IntersectionObserver" in window) {
    const mediaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelector(".l-screen")?.classList.add("is-active");
        entry.target.closest(".l-step")?.classList.add("is-active");
        mediaObserver.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll(".l-step-media").forEach((media) => mediaObserver.observe(media));
  }

  function setActiveStep(index) {
    if (index === activeStep) return;
    activeStep = index;
    steps.forEach((step, i) => step.classList.toggle("is-active", i === index));
    screens.forEach((screen, i) => screen.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    if (stageCount) stageCount.textContent = String(index + 1).padStart(2, "0");
    if (stageTitle) stageTitle.textContent = screens[index]?.dataset.title || "";
  }

  function updateSteps() {
    if (!steps.length || mobileQuery.matches) return;
    const line = window.innerHeight * 0.5;
    let index = 0;
    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top <= line) index = i;
    });
    setActiveStep(index);

    // Progreso continuo dentro de la seccion (barra del panel)
    const first = steps[0].getBoundingClientRect();
    const last = steps[steps.length - 1].getBoundingClientRect();
    const span = last.bottom - first.top;
    const progress = Math.min(Math.max((line - first.top) / span, 0), 1);
    stagePanel?.style.setProperty("--p", progress.toFixed(3));
  }

  steps[0]?.classList.add("is-active");

  /* Barra de progreso global ----------------------------------- */
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    progressBar?.style.setProperty("--progress", value.toFixed(4));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateProgress();
      updateSteps();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  mobileQuery.addEventListener?.("change", onScroll);
  onScroll();

  /* Comprar: barra fija que se oculta mientras el formulario esta a la vista */
  const buybar = document.querySelector(".l-buybar");
  const buyForm = document.querySelector("#trade-form");
  if (buybar && buyForm && "IntersectionObserver" in window) {
    const footer = document.querySelector(".footer");
    const visible = new Set();
    const buyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      buybar.classList.toggle("is-hidden", visible.size > 0);
    });
    buyObserver.observe(buyForm);
    if (footer) buyObserver.observe(footer);
  }

  /* Ayuda: acordeon accesible --------------------------------- */
  const accItems = document.querySelectorAll(".l-acc-item");
  accItems.forEach((item) => {
    const button = item.querySelector("button");
    button?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      accItems.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector("button")?.setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("is-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });
})();
