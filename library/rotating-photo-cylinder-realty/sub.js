// Attach only what each page has — strengths pinned transition (wide screens), number charts (Chart.js)·card sequential reveal, staff voices Swiper (progress bar).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Strengths — when the first row center reaches 60% of the screen, the section is pinned and stays for (rows − 1) × screen height: .7 hold · .25 change (none) · end .7
  const st = document.querySelector(".jf-strength");
  if (st) ScrollTrigger.matchMedia({
    "(min-width: 1025px)": () => {
      const list = st.querySelector(".jf-strength__list"), items = [...list.children];
      if (items.length < 2) return;
      const h = Math.max(...items.map((i) => i.offsetHeight));
      Object.assign(list.style, { position: "relative", height: `${h}px` });
      items.forEach((i) => Object.assign(i.style, { position: "absolute", inset: "0" }));
      gsap.set(items, { autoAlpha: 0 }); gsap.set(items[0], { autoAlpha: 1 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: items[0], pin: st, start: "center 60%", end: () => "+=" + (items.length - 1) * innerHeight, scrub: true, anticipatePin: 0, pinSpacing: true } });
      items.forEach((it, k) => { if (!k) return; tl.to({}, { duration: 0.7 }).to(items[k - 1], { autoAlpha: 0, duration: 0.25, ease: "none" }).to(it, { autoAlpha: 1, duration: 0.25, ease: "none" }); });
      tl.to({}, { duration: 0.7 });
      return () => { list.style.position = list.style.height = ""; items.forEach((i) => { i.style.position = i.style.inset = i.style.opacity = i.style.visibility = ""; }); };
    },
  });

  // Number chart — like the original, drawn with Chart.js when the page opens (default 1s easeOutQuart) and redrawn when the width changes. Tooltip left at the original default.
  const canvases = [...document.querySelectorAll("canvas[data-chart]")];
  if (canvases.length && window.Chart) {
    if (window.ChartDataLabels) Chart.register(ChartDataLabels);
    if (reduce) Chart.defaults.animation = false;
    // Resolve skin variables (including color-mix) into rgb values the canvas understands
    const probe = document.createElement("i"), dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.style.display = "none"; document.body.appendChild(probe);
    const color = (v) => { probe.style.color = `var(${v})`; dot.clearRect(0, 0, 1, 1); dot.fillStyle = getComputedStyle(probe).color; dot.fillRect(0, 0, 1, 1); const [r, g, b, a] = dot.getImageData(0, 0, 1, 1).data; return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`; };
    let charts = [];
    const build = () => {
      charts.forEach((c) => c.destroy()); charts = [];
      const C = ["--jf-chart-1", "--jf-chart-2", "--jf-chart-3", "--jf-chart-4", "--jf-chart-5", "--jf-chart-6"].map(color);
      const on = color("--kf-on-accent"), soft = color("--kf-ink-soft");
      // Legend text sits in Chart.js’s default gray spot, so use the skin’s faded ink, with the skin’s body typeface.
      Chart.defaults.color = soft;
      Chart.defaults.font.family = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans").trim() || Chart.defaults.font.family;
      const donut = (labels, data) => ({ type: "doughnut", data: { labels, datasets: [{ data, backgroundColor: [C[0], C[1]], borderWidth: 0 }] }, options: { responsive: true, cutout: "55%", plugins: { legend: { position: "bottom", labels: { boxWidth: 18, padding: 20 } }, datalabels: { formatter: (v) => v + "%", font: { weight: "normal", size: 14 }, color: (c) => (c.dataIndex === 0 ? on : soft) } } } });
      const cfg = {
        gender: donut(["Male", "Women"], [47, 53]),
        job: donut(["Sales position", "Office work"], [50, 50]),
        age: { type: "bar", data: { labels: ["20s", "30s", "40s", "50s", "60s", "70s"], datasets: [{ data: [13, 27, 20, 7, 27, 7], backgroundColor: C, borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", layout: { padding: { right: 20 } }, scales: { x: { display: false, min: 0, max: 25 }, y: { grid: { display: false }, ticks: { display: false } } }, plugins: { legend: { display: false }, datalabels: { anchor: "end", align: "start", offset: 10, clamp: true, color: (c) => (c.dataIndex === 1 ? C[5] : on), formatter: (v, c) => `${c.chart.data.labels[c.dataIndex]}  ${v}%`, font: { weight: "normal", size: 13 } } } } },
        experience: { type: "doughnut", data: { labels: ["No experience", "Has industry experience"], datasets: [{ data: [0, 0], backgroundColor: [C[0], C[1]], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "100%", plugins: { legend: { position: "top", labels: { boxWidth: 18, padding: 20, font: { size: 14, weight: "normal" } } }, datalabels: { display: false }, tooltip: { enabled: false } } } },
      };
      canvases.forEach((cv) => cfg[cv.dataset.chart] && charts.push(new Chart(cv, cfg[cv.dataset.chart])));
    };
    build();
    let lastW = innerWidth;
    addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; build(); } });
  }

  // Number card — when its top edge reaches 80% of the screen, it moves up 10px from below in .2s power2.out, the next card waits until the previous one finishes
  const cards = [...document.querySelectorAll(".numbers-card")];
  if (cards.length) {
    gsap.set(cards, { opacity: 0, y: 10 });
    const state = cards.map(() => ({ in: false, done: false }));
    let next = 0;
    const play = (i) => {
      if (state[i].done) return;
      gsap.to(cards[i], { opacity: 1, y: 0, duration: reduce ? 0 : 0.2, ease: "power2.out", onComplete: () => { state[i].done = true; next = i + 1; if (state[next]?.in) play(next); } });
    };
    cards.forEach((c, i) => ScrollTrigger.create({ trigger: c, start: "top 80%", onEnter: () => { state[i].in = true; if (i === next) play(i); } }));
  }

  // Staff voices — Swiper 8 free drag · gaps 25/40/70 · progress bar
  document.querySelectorAll(".voice-slider .swiper").forEach((el) => {
    const bar = el.querySelector(".swiper__progress__bar");
    if (!window.Swiper || !bar) return;
    let sw = null;
    const paint = () => { if (!sw) return; const w = sw.width || el.clientWidth || 0, max = Math.abs(sw.maxTranslate()), now = Math.abs(sw.getTranslate()), all = w + max; bar.style.width = `${(all > 0 ? Math.min(1, Math.max(0, (now + w) / all)) : 1) * 100}%`; };
    sw = new Swiper(el, { slidesPerView: "auto", freeMode: { enabled: true }, grabCursor: true, breakpoints: { 0: { spaceBetween: 25 }, 576: { spaceBetween: 40 }, 768: { spaceBetween: 70 } }, on: { init: () => requestAnimationFrame(paint), setTranslate: paint, resize: paint } });
    paint();
  });

})();
