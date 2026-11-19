// Festival first page: speaker profile window (original jQuery fadeToggle 400ms swing + Swiper .6s) · schedule date tabs (fadeIn 400ms) · floor guide Swiper (centered · infinite · .6s) · drawing the bar timetable and guide map
(() => {
  const wide = matchMedia("(min-width: 768px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // jQuery swing = .5 − cos(πp)/2 = sine.inOut
  const fade = (el, show, done) => {
    if (reduce) { el.hidden = !show; el.style.opacity = ""; done?.(); return; }
    if (show) { el.hidden = false; gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "sine.inOut", onComplete: done }); }
    else gsap.to(el, { opacity: 0, duration: 0.4, ease: "sine.inOut", onComplete: () => { el.hidden = true; el.style.opacity = ""; done?.(); } });
  };

  // ── Speaker profile window ──
  const modal = document.querySelector(".fes-modal");
  if (modal) {
    if (wide.matches) {
      modal.querySelectorAll(".fes-modal__box").forEach((box) => new Swiper(box.querySelector(".swiper"), {
        slidesPerView: "auto", speed: 600, autoplay: false,
        navigation: { nextEl: box.querySelector(".swiper-button-next"), prevEl: box.querySelector(".swiper-button-prev") },
      }));
    }
    const close = () => fade(modal, false, () => modal.querySelectorAll(".fes-modal__box").forEach((b) => b.classList.remove("is-active")));
    document.querySelectorAll("[data-profile]").forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.querySelector(`#${btn.dataset.profile}`)?.classList.add("is-active");
      document.body.classList.add("is-fixed");
      fade(modal, true);
    }));
    modal.querySelectorAll(".fes-modal__close, .fes-modal__veil").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.remove("is-fixed");
      close();
    }));
  }

  // ── Timetable: color bars per floor·place (original picture timetable redrawn as bars) ──
  const DAYS = [
    { cols: [["1F", "pink", 3], ["B2F", "blue", 1], ["6F", "green", 2]], bars: [[0, 2, 16, "Work Exhibit"], [1, 2, 16, "Marketplace"], [2, 2, 16, "Food market"], [3, 2, 16, "Gift Event"], [4, 6, 8, "Lecture 01"], [4, 10, 12, "Lecture 02"], [5, 2, 18, "Photo exhibition"]] },
    { cols: [["1F", "pink", 3], ["B2F", "blue", 1], ["6F", "green", 2]], bars: [[0, 2, 16, "Work Exhibit"], [1, 2, 16, "Marketplace"], [2, 2, 16, "Stage performance"], [3, 2, 16, "Gift Event"], [4, 5, 9, "Experience 01"], [4, 10, 14, "Experience 02"], [5, 2, 18, "Photo exhibition"]] },
    { cols: [["1F", "pink", 3], ["B2F", "blue", 1], ["6F", "green", 2]], bars: [[0, 2, 16, "Work Exhibit"], [1, 2, 16, "Marketplace"], [2, 2, 16, "Stage performance"], [3, 2, 16, "Gift Event"], [4, 3, 6, "Experience 03"], [4, 9, 13, "Experience 03"], [5, 2, 18, "Photo exhibition"]] },
  ];
  const tone = { pink: "--site-pink", blue: "--site-sky", green: "--site-green" };
  document.querySelectorAll(".fes-tt__item").forEach((item) => {
    const day = DAYS[+item.dataset.day];
    const n = day.cols.reduce((s, c) => s + c[2], 0);
    const toneOf = (i) => { let k = 0; for (const c of day.cols) { k += c[2]; if (i < k) return c[1]; } return "pink"; };
    let html = `<div class="fes-tt__chart" style="--cols: ${n}; grid-template-rows: auto repeat(18, calc(22 * var(--u)))">`;
    let col = 2;
    for (const [name, t, span] of day.cols) { html += `<div class="col" style="grid-column: ${col} / span ${span}; grid-row: 1; background: var(${tone[t]})">${name}</div>`; col += span; }
    for (let h = 0; h < 18; h += 2) html += `<span class="h" style="grid-row: ${h + 2}">${String(10 + h / 2).padStart(2, "0")}:00</span>`;
    for (const [c, a, b, label] of day.bars) html += `<div class="bar" style="grid-column: ${c + 2}; grid-row: ${a + 2} / ${b + 2}; background: var(${tone[toneOf(c)]})">${label}</div>`;
    item.innerHTML = html + "</div>";
  });
  const tabs = [...document.querySelectorAll(".fes-tt__tabs button")];
  const items = [...document.querySelectorAll(".fes-tt__item")];
  tabs.forEach((tab, i) => tab.addEventListener("click", (e) => {
    e.preventDefault();
    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    items.forEach((it) => { gsap.killTweensOf(it); it.hidden = true; it.style.opacity = ""; });
    fade(items[i], true);
  }));

  // ── Floor guide map: cells, corridors, highlighted zones ──
  document.querySelectorAll("svg[data-plan]").forEach((svg) => {
    const k = +svg.dataset.plan;
    let s = `<rect x="40" y="30" width="520" height="280" rx="6" style="fill: var(--site-panel); stroke: var(--kf-ink)" stroke-width="2"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="${60 + i * 70}" y="${50 + (i % 2) * 10}" width="58" height="${70 + (i * 13) % 40}" style="fill: var(--kf-surface); stroke: var(--site-tag-ink)" stroke-width="1.5"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${70 + i * 80}" y="${210 + (i % 3) * 8}" width="66" height="70" style="fill: var(--kf-surface); stroke: var(--site-tag-ink)" stroke-width="1.5"/>`;
    s += `<path d="M40 170h520" style="stroke: var(--site-soft-line)" stroke-width="20"/>`;
    s += `<rect x="${120 + k * 90}" y="60" width="${160 - k * 10}" height="110" rx="4" style="fill: var(--site-pink)" opacity=".9"/>`;
    s += `<text x="${130 + k * 90}" y="90" style="fill: var(--kf-surface); font: italic 800 16px var(--kf-font-display)">AREA</text>`;
    svg.innerHTML = s;
  });

  // ── Floor guide Swiper ──
  const floors = [...document.querySelectorAll(".fes-map")].map((m) => m.dataset.floor);
  new Swiper(".fes-floor__slides", {
    centeredSlides: true, loop: true, slidesPerView: "auto", speed: 600, autoplay: false,
    navigation: { nextEl: ".fes-floor__slides .swiper-button-next", prevEl: ".fes-floor__slides .swiper-button-prev" },
    pagination: { el: ".fes-floor .swiper-pagination", clickable: true, renderBullet: (i, cls) => `<span class="${cls}">${floors[i]}</span>` },
  });
})();
