// Mercado: grafico referencial de BTC/USD dibujado en SVG.
// Cada parte lleva data-part para poder resaltarla durante el recorrido.
(() => {
  const LAST = 67450;
  const SPREAD = 0.0035;
  const W = 600;
  const PLOT_W = 528;
  const TOP = 18;
  const BOTTOM = 218;
  const VOL_TOP = 246;
  const VOL_BOTTOM = 306;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const PERIODS = {
    "1D": { n: 48, change: 0.028, vol: 0.006, name: "últimas 24 h", label: (i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"} h` },
    "1S": { n: 56, change: -0.019, vol: 0.012, name: "últimos 7 días", label: (i) => `${days[Math.floor(i / 8)]} ${String((i % 8) * 3).padStart(2, "0")}:00 h` },
    "1M": { n: 60, change: 0.184, vol: 0.022, name: "últimos 30 días", label: (i) => `Día ${Math.floor(i / 2) + 1}` },
    "1A": { n: 52, change: 0.62, vol: 0.05, name: "últimos 12 meses", label: (i) => `Semana ${i + 1}` },
  };

  const usd = (value) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value);
  const pct = (value) => `${value >= 0 ? "+" : ""}${(value * 100).toFixed(2).replace(".", ",")}%`;

  // Generador pseudoaleatorio con semilla: el grafico es siempre el mismo
  function random(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Caminata aleatoria "anclada": arranca en la apertura y termina en el precio actual
  function buildSeries(key) {
    const period = PERIODS[key];
    const rand = random(key.charCodeAt(0) * 97 + key.charCodeAt(1));
    const walk = [0];
    for (let i = 1; i < period.n; i++) walk.push(walk[i - 1] + (rand() - 0.5));
    const end = walk[period.n - 1];
    const open = LAST / (1 + period.change);

    return walk.map((value, i) => {
      const t = i / (period.n - 1);
      return {
        price: open + (LAST - open) * t + (value - end * t) * LAST * period.vol,
        volume: 0.3 + rand() * 0.7,
      };
    });
  }

  function shell(root) {
    root.innerHTML = `
      <div class="mk-head">
        <div class="mk-price" data-part="price">
          <span>BTC / USD</span>
          <strong data-mk="price">${usd(LAST)}</strong>
        </div>
        <span class="mk-change" data-part="change" data-mk="change"></span>
        <div class="mk-periods" data-part="period" role="group" aria-label="Período del gráfico">
          ${Object.keys(PERIODS).map((key) => `<button type="button" data-period="${key}">${key}</button>`).join("")}
        </div>
      </div>
      <div class="mk-plot">
        <svg viewBox="0 0 ${W} 320" aria-hidden="true"></svg>
        <div class="mk-tip" hidden></div>
      </div>
      <dl class="mk-stats">
        <div data-part="range"><dt>Máximo</dt><dd data-mk="high"></dd></div>
        <div data-part="range"><dt>Mínimo</dt><dd data-mk="low"></dd></div>
        <div data-part="volume"><dt>Volumen</dt><dd data-mk="volume"></dd></div>
        <div data-part="spread"><dt>Spread</dt><dd>0,35%</dd></div>
      </dl>
      <p class="mk-period-name" data-part="period" data-mk="period"></p>`;
  }

  function draw(root, key) {
    const data = buildSeries(key);
    const prices = data.map((d) => d.price);
    const open = prices[0];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const ask = LAST * (1 + SPREAD / 2);
    const bid = LAST * (1 - SPREAD / 2);
    const top = Math.max(high, ask);
    const bottom = Math.min(low, bid);
    const pad = (top - bottom) * 0.14;
    const min = bottom - pad;
    const max = top + pad;

    const x = (i) => (i / (data.length - 1)) * PLOT_W;
    const y = (p) => BOTTOM - ((p - min) / (max - min)) * (BOTTOM - TOP);
    const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.price).toFixed(1)}`).join(" ");
    const highIndex = prices.indexOf(high);
    const lowIndex = prices.indexOf(low);
    const up = LAST >= open;
    const barW = PLOT_W / data.length - 2;

    const grid = [0, 1, 2, 3].map((k) => {
      const value = min + ((max - min) * (k + 0.5)) / 4;
      return `<line x1="0" x2="${PLOT_W}" y1="${y(value)}" y2="${y(value)}"/><text x="${PLOT_W + 8}" y="${y(value) + 4}">${usd(value)}</text>`;
    }).join("");

    const bars = data.map((d, i) => {
      const height = d.volume * (VOL_BOTTOM - VOL_TOP);
      const rising = i === 0 || d.price >= data[i - 1].price;
      return `<rect class="${rising ? "is-up" : "is-down"}" style="--i:${i}" x="${(x(i) - barW / 2).toFixed(1)}" y="${(VOL_BOTTOM - height).toFixed(1)}" width="${barW.toFixed(1)}" height="${height.toFixed(1)}"/>`;
    }).join("");

    const svg = root.querySelector("svg");
    svg.innerHTML = `
      <g class="mk-grid">${grid}</g>
      <g data-part="spread" class="mk-spread">
        <rect x="0" width="${PLOT_W}" y="${y(ask)}" height="${y(bid) - y(ask)}"/>
        <line x1="0" x2="${PLOT_W}" y1="${y(ask)}" y2="${y(ask)}"/>
        <line x1="0" x2="${PLOT_W}" y1="${y(bid)}" y2="${y(bid)}"/>
        <text x="8" y="${y(ask) - 6}">Comprás a ${usd(ask)}</text>
        <text x="8" y="${y(bid) + 14}">Vendés a ${usd(bid)}</text>
      </g>
      <g data-part="change" class="mk-open ${up ? "is-up" : "is-down"}">
        <line class="mk-open-line" x1="0" x2="${PLOT_W}" y1="${y(open)}" y2="${y(open)}"/>
        <text x="8" y="${y(open) + (up ? 16 : -8)}">Apertura ${usd(open)}</text>
        <line class="mk-open-bracket" x1="${PLOT_W - 2}" x2="${PLOT_W - 2}" y1="${y(open)}" y2="${y(LAST)}"/>
      </g>
      <g data-part="price" class="mk-line-group">
        <path class="mk-area" d="${line} L${PLOT_W} ${BOTTOM} L0 ${BOTTOM}Z"/>
        <path class="mk-line" pathLength="1" d="${line}"/>
        <circle class="mk-pulse" cx="${x(data.length - 1)}" cy="${y(LAST)}" r="5"/>
        <circle class="mk-dot" cx="${x(data.length - 1)}" cy="${y(LAST)}" r="5"/>
      </g>
      <g data-part="range" class="mk-range">
        <circle cx="${x(highIndex)}" cy="${y(high)}" r="5"/>
        <text x="${Math.min(Math.max(x(highIndex), 40), PLOT_W - 40)}" y="${y(high) - 12}" text-anchor="middle">Máx ${usd(high)}</text>
        <circle cx="${x(lowIndex)}" cy="${y(low)}" r="5"/>
        <text x="${Math.min(Math.max(x(lowIndex), 40), PLOT_W - 40)}" y="${y(low) + 22}" text-anchor="middle">Mín ${usd(low)}</text>
      </g>
      <g data-part="volume" class="mk-volume">${bars}</g>
      <g class="mk-cross" hidden>
        <line y1="${TOP}" y2="${VOL_BOTTOM}"/>
        <circle r="4"/>
      </g>`;

    const change = (LAST - open) / open;
    const changeEl = root.querySelector('[data-mk="change"]');
    changeEl.textContent = `${pct(change)} ${key}`;
    changeEl.classList.toggle("is-down", change < 0);
    root.querySelector('[data-mk="high"]').textContent = usd(high);
    root.querySelector('[data-mk="low"]').textContent = usd(low);
    root.querySelector('[data-mk="volume"]').textContent = `${(data.reduce((sum, d) => sum + d.volume, 0) * (key === "1D" ? 0.68 : key === "1S" ? 4.7 : key === "1M" ? 21 : 248)).toFixed(1).replace(".", ",")}B`;
    root.querySelector('[data-mk="period"]').textContent = `Mostrando ${PERIODS[key].name} · valores referenciales`;
    root.querySelectorAll("[data-period]").forEach((button) => {
      const active = button.dataset.period === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    root.mkData = { data, x, y, key };
  }

  // Cruz y tooltip al pasar el mouse o el dedo
  function bindHover(root) {
    const plot = root.querySelector(".mk-plot");
    const tip = root.querySelector(".mk-tip");

    function move(event) {
      const { data, x, y, key } = root.mkData;
      const svg = root.querySelector("svg");
      const box = svg.getBoundingClientRect();
      const ratio = W / box.width;
      const px = (event.clientX - box.left) * ratio;
      const index = Math.round(Math.min(Math.max(px / PLOT_W, 0), 1) * (data.length - 1));
      const point = data[index];
      const cross = svg.querySelector(".mk-cross");
      cross.hidden = false;
      cross.querySelector("line").setAttribute("x1", x(index));
      cross.querySelector("line").setAttribute("x2", x(index));
      cross.querySelector("circle").setAttribute("cx", x(index));
      cross.querySelector("circle").setAttribute("cy", y(point.price));

      tip.hidden = false;
      tip.innerHTML = `<small>${PERIODS[key].label(index)}</small><strong>USD ${usd(point.price)}</strong><small>Vol. ${(point.volume * 100).toFixed(0)}%</small>`;
      const left = (x(index) / ratio);
      tip.style.left = `${Math.min(Math.max(left, 60), box.width - 60)}px`;
      tip.style.top = `${y(point.price) / (320 / box.height)}px`;
    }

    function leave() {
      tip.hidden = true;
      root.querySelector(".mk-cross").hidden = true;
    }

    plot.addEventListener("pointermove", move);
    plot.addEventListener("pointerdown", move);
    plot.addEventListener("pointerleave", leave);
  }

  const charts = [...document.querySelectorAll(".mk[data-chart]")];
  charts.forEach((root) => {
    shell(root);
    draw(root, "1D");
    bindHover(root);
    root.querySelectorAll("[data-period]").forEach((button) => {
      button.addEventListener("click", () => {
        stopCycle();
        draw(root, button.dataset.period);
      });
    });
  });

  /* Recorrido: el paso que cruza la mitad de la pantalla define el foco */
  const tour = document.querySelector('.mk[data-chart="tour"]');
  const steps = [...document.querySelectorAll(".mk-step")];
  let cycle = null;

  function stopCycle() {
    window.clearInterval(cycle);
    cycle = null;
  }

  // En el paso "Temporalidad" los periodos rotan solos para mostrar el cambio
  function startCycle() {
    if (cycle || reduceMotion.matches || !tour) return;
    const keys = Object.keys(PERIODS);
    cycle = window.setInterval(() => {
      const next = keys[(keys.indexOf(tour.mkData.key) + 1) % keys.length];
      draw(tour, next);
    }, 1800);
  }

  function setFocus(focus) {
    if (!tour || tour.dataset.focus === focus) return;
    tour.dataset.focus = focus;
    steps.forEach((step) => step.classList.toggle("is-active", step.dataset.focus === focus));
    if (focus === "period") {
      startCycle();
    } else {
      stopCycle();
      if (tour.mkData.key !== "1D") draw(tour, "1D");
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking || !steps.length) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      // En mobile el grafico ocupa la parte de arriba: la linea de activacion baja
      const line = window.innerHeight * (window.innerWidth <= 960 ? 0.8 : 0.55);
      let focus = steps[0].dataset.focus;
      steps.forEach((step) => {
        if (step.getBoundingClientRect().top <= line) focus = step.dataset.focus;
      });
      setFocus(focus);
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
