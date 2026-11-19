// Post collection · category list — category underline, view toggle, member quote paging
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Category strip underline: measures only the text width and goes beneath it, pressing centers that category in the strip (.7s cubic in-out) ----
  const inner = document.querySelector(".n-filter__inner");
  if (inner) {
    const line = inner.querySelector(".n-filter__line");
    const textRect = (el) => { const r = document.createRange(); r.selectNodeContents(el); const b = r.getBoundingClientRect(); r.detach(); return b; };
    const place = (item, animate) => {
      if (!item) return;
      const t = textRect(item);
      const x = t.left - inner.getBoundingClientRect().left + inner.scrollLeft;
      if (!animate) line.classList.add("is-init");
      line.style.transform = `translateX(${x}px)`;
      line.style.width = t.width + "px";
      if (!animate) { void line.offsetWidth; requestAnimationFrame(() => line.classList.remove("is-init")); }
    };
    const center = (item) => {
      const start = inner.scrollLeft;
      const dist = item.offsetLeft + item.offsetWidth / 2 - inner.clientWidth / 2 - start;
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => {
        const p = reduce ? 1 : Math.min((now - t0) / 700, 1);
        inner.scrollLeft = start + dist * ease(p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const active = () => inner.querySelector(".is-active");
    const ready = () => { place(active(), false); center(active()); };
    if (document.fonts) document.fonts.ready.then(ready); else ready();
    inner.addEventListener("click", (e) => {
      const item = e.target.closest(".n-filter__item");
      if (!item) return;
      place(item, true);
      setTimeout(() => center(item), 50);
    });
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => place(active(), false), 100); });
  }

  // ---- Switch view ----
  const tabs = [...document.querySelectorAll("[data-filter]")];
  const views = [...document.querySelectorAll("[data-view]")];
  if (tabs.length && views.length) {
    const setView = async (f, animate = true) => {
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.filter === f));
      const cur = views.find((v) => v.classList.contains("is-visible"));
      const next = views.find((v) => v.dataset.view === f);
      if (!next || cur === next) return;
      if (animate && cur && !reduce) await cur.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "both" }).finished;
      views.forEach((v) => v.classList.toggle("is-visible", v === next));
      if (cur) cur.getAnimations().forEach((a) => a.cancel());
      if (animate && !reduce) next.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" });
    };
    tabs.forEach((t) => t.addEventListener("click", () => setView(t.dataset.filter)));
  }

  // ---- Member quotes: next card every 5 seconds (.7s overlapping crossfade), pressing a dot goes to that card. Runs only while visible ----
  const quote = document.querySelector(".n-quote");
  if (quote) {
    const slides = [...quote.querySelectorAll(".n-quote__slide")];
    const dots = [...quote.querySelectorAll(".n-quote__dot")];
    const count = quote.querySelector(".n-quote__count");
    const MS = +quote.dataset.autoplay || 5000;
    let i = 0, t0 = performance.now(), seen = false, pausedAt = 0;
    const show = (k) => {
      i = (k + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("is-active", j === i));
      dots.forEach((d, j) => d.style.setProperty("--fill", j < i ? "100%" : "0%"));
      count.textContent = `${i + 1} / ${slides.length}`;
      t0 = performance.now();
    };
    dots.forEach((d, j) => d.addEventListener("click", () => show(j)));
    new IntersectionObserver((en) => { seen = en[0].isIntersecting; }, { threshold: 0.2 }).observe(quote);
    show(0);
    if (!reduce) gsap.ticker.add(() => {
      const now = performance.now();
      if (!seen) { if (!pausedAt) pausedAt = now; return; }
      if (pausedAt) { t0 += now - pausedAt; pausedAt = 0; }
      const p = Math.min(1, (now - t0) / MS);
      dots[i].style.setProperty("--fill", (p * 100).toFixed(1) + "%");
      if (p >= 1) show(i + 1);
    });
  }
})();
