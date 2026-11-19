// Product detail: photo slide (Splide default .4s cubic-bezier(.25,1,.5,1)), thumbnails, bar drag, color and type selection, quantity,
// Add → a small dot flies along a curve (±30px wobble at the center) for 1.1s power2.in to the cart button and vanishes at 1.09s,
// Two-row photo strip (one cloned set + 120s flow), alternating photos for the fun points, outfit combo slider (Splide), small add bar below.
(() => {
  // ---------- Photo slider: as in the original, a Splide main photo synced with a thumbnail row (isNavigation), bottom bar in the original style ----------
  const gal = document.querySelector("[data-gal]");
  const main = new Splide(gal.querySelector("[data-gal-main]"), { type: "slide", perPage: 1, pagination: false, arrows: true, cover: true, keyboard: true, lazyLoad: "nearby", preloadPages: 2 });
  const nav = new Splide(gal.querySelector("[data-gal-thumbs]"), {
    fixedWidth: 66, height: 66, gap: 1, rewind: true, pagination: false, arrows: false, cover: true, isNavigation: true, focus: "center", keyboard: "focused",
    breakpoints: { 768: { fixedWidth: 52, height: 72, gap: 1 }, 480: { fixedWidth: 42, height: 58, gap: 1 } },
  });
  main.sync(nav);
  main.mount();
  nav.mount();
  const bar = gal.querySelector("[data-gal-bar]");
  const gutter = gal.querySelector("[data-gal-gutter]");
  const cur = gal.querySelector("[data-gal-current]");
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  // Bar width is inversely proportional to the number of sheets (min 5%), and position is divided by the count minus five sheets — the original formula as is
  const gw = (n) => Math.max((5 / n) * 100, 5);
  const fromLeft = (left, n) => clamp(Math.round(((100 - gw(n)) > 0 ? left / (100 - gw(n)) : 0) * (n - 5)), 0, n - 1);
  const placeGutter = () => {
    const n = nav.length, i = nav.index;
    if (n <= 1) { gutter.style.display = "none"; return; }
    const w = gw(n);
    gutter.style.display = "block";
    gutter.style.width = w + "%";
    gutter.style.left = clamp(n - 5 > 0 ? (i / (n - 5)) * (100 - w) : 0, 0, 100 - w) + "%";
    gutter.setAttribute("aria-valuemin", "1");
    gutter.setAttribute("aria-valuemax", String(n));
    gutter.setAttribute("aria-valuenow", String(i + 1));
  };
  const total = gal.querySelector("[data-gal-total]");
  const count = () => {
    cur.textContent = String(main.index + 1).padStart(2, "0");
    total.textContent = String(main.length).padStart(2, "0");
  };
  main.on("mounted moved", count);
  nav.on("mounted moved", placeGutter);
  count();
  placeGutter();
  let dragging = false, grab = 0;
  gutter.addEventListener("pointerdown", (e) => {
    e.preventDefault(); e.stopPropagation();
    dragging = true;
    grab = e.clientX - gutter.getBoundingClientRect().left;
    gutter.classList.add("is-dragging");
    gutter.setPointerCapture(e.pointerId);
  });
  gutter.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const r = bar.getBoundingClientRect();
    gutter.style.left = clamp(((e.clientX - grab - r.left) / r.width) * 100, 0, 100 - gw(nav.length)) + "%";
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    gutter.classList.remove("is-dragging");
    if (gutter.hasPointerCapture(e.pointerId)) gutter.releasePointerCapture(e.pointerId);
    main.go(fromLeft(parseFloat(gutter.style.left), nav.length));
  };
  gutter.addEventListener("pointerup", release);
  gutter.addEventListener("pointercancel", release);
  gutter.addEventListener("keydown", (e) => {
    const n = nav.length, i = nav.index;
    const to = { ArrowLeft: i - 1, ArrowUp: i - 1, ArrowRight: i + 1, ArrowDown: i + 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    main.go(clamp(to, 0, n - 1));
  });
  bar.addEventListener("pointerdown", (e) => {
    if (e.target === gutter) return;
    e.preventDefault();
    const n = nav.length, w = gw(n), r = bar.getBoundingClientRect();
    const left = clamp(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100) - w / 2, 0, 100 - w);
    gutter.style.left = left + "%";
    main.go(fromLeft(left, n));
  });

  // ---------- Fun-point photo cell: three photos crossfade every 3s over 1.6s (original useImageSlider) ----------
  document.querySelectorAll("[data-feat-slider]").forEach((box) => {
    const items = [...box.querySelectorAll(".feat__slide")];
    if (items.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const tick = () => {
      i = (i + 1) % items.length;
      items.forEach((it, k) => { it.classList.toggle("is-active", k === i); it.toggleAttribute("aria-hidden", k !== i); });
      setTimeout(tick, 3000);
    };
    setTimeout(tick, 3000);
  });

  // ---------- Color · type · quantity ----------
  let color = "Orange", type = "Basic", qty = 1;
  const sync = () => document.querySelectorAll("[data-current]").forEach((n) => (n.textContent = `${color} / ${type}`));
  document.querySelectorAll("[data-color]").forEach((b) => b.addEventListener("click", () => {
    color = b.dataset.color;
    document.querySelectorAll("[data-color]").forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-checked", x === b); });
    sync();
  }));
  document.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => {
    type = b.dataset.type;
    document.querySelectorAll("[data-type]").forEach((x) => x.classList.toggle("is-active", x === b));
    sync();
  }));
  document.querySelectorAll("[data-qty]").forEach((b) => b.addEventListener("click", () => {
    qty = Math.min(Math.max(qty + Number(b.dataset.qty), 1), 9);
    document.querySelectorAll("[data-qty-n]").forEach((n) => (n.textContent = qty));
  }));

  // ---------- Flying to the cart ----------
  if (window.gsap && window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
  const mm = window.gsap ? gsap.matchMedia() : null;
  let flyOn = false;
  mm?.add("(prefers-reduced-motion: no-preference)", () => { flyOn = true; return () => (flyOn = false); });
  document.querySelectorAll("[data-add]").forEach((btn) => btn.addEventListener("click", () => {
    const done = () => window.kCart.add(`Product name one · ${color} / ${type}`, `${qty}Dog`);
    const target = window.kCart.target();
    if (!flyOn || !target) return done();
    const a = btn.getBoundingClientRect(), b = target.getBoundingClientRect();
    const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
    const to = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
    const sway = 30 - 30 * Math.random() * 2;
    const dot = document.createElement("span");
    dot.className = "fly";
    document.body.append(dot);
    const p = { x: from.x, y: from.y };
    gsap.set(dot, { x: from.x, y: from.y });
    gsap.to(p, {
      duration: 1.1,
      ease: "power2.in",
      motionPath: { path: [{ x: from.x, y: from.y }, { x: from.x + (to.x - from.x) / 2, y: from.y + sway }, { x: to.x, y: to.y }], curviness: 1 },
      onUpdate: () => gsap.set(dot, { x: p.x, y: p.y }),
    });
    gsap.to(dot, { duration: 0.01, delay: 1.09, opacity: 0, ease: "none", onComplete: () => { dot.remove(); done(); } });
  }));

  // ---------- Two-row photo strip ----------
  const ribbon = document.querySelector(".ribbon");
  const lists = ribbon.querySelector("[data-ribbon]");
  const clone = lists.firstElementChild.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  lists.append(clone);
  ribbon.classList.add("is-ready");

  // ---------- Outfit combos: original Splide options (4 slides · 30px → 3 slides · 20 → 2 slides · 20 → phone is data-fixed-width one slide · 10) ----------
  const sty = document.querySelector("[data-sty]");
  const styFixed = parseInt(sty.dataset.fixedWidth, 10) || 190;
  const styling = new Splide(sty.querySelector("[data-sty-carousel]"), {
    perPage: 4, gap: 30, pagination: false,
    breakpoints: { 1000: { perPage: 3, gap: 20 }, 768: { perPage: 2, gap: 20 }, 480: { perPage: 1, fixedWidth: styFixed, gap: 10 } },
  });
  const styArrows = () => {
    const prev = sty.querySelector(".splide__arrow--prev"), next = sty.querySelector(".splide__arrow--next");
    const i = styling.index, n = styling.length, per = styling.options.perPage || 1;
    prev.disabled = i === 0;
    prev.setAttribute("aria-disabled", String(i === 0));
    next.disabled = i >= n - per;
    next.setAttribute("aria-disabled", String(i >= n - per));
  };
  styling.mount();
  styling.on("move moved", styArrows);
  styArrows();

  // ---------- Small add bar below: hidden when the footer is visible, on phones (≤640) only while scrolling up, on wide screens when the large add button is not visible ----------
  const mini = document.querySelector("[data-mini]");
  const mainBtn = document.querySelector(".pmain [data-add]");
  const footer = document.querySelector('[data-slot="footer"]');
  const narrow = matchMedia("(width <= 640px)");
  let btnSeen = true, footSeen = false, goingUp = false, lastY = scrollY, raf = 0;
  const upd = () => mini.classList.toggle("is-show", !footSeen && (narrow.matches ? goingUp : !btnSeen));
  new IntersectionObserver(([e]) => { btnSeen = e.isIntersecting; upd(); }, { threshold: 0 }).observe(mainBtn);
  new IntersectionObserver(([e]) => { footSeen = e.isIntersecting; upd(); }, { threshold: 0 }).observe(footer);
  narrow.addEventListener("change", upd);
  addEventListener("scroll", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { goingUp = scrollY < lastY; lastY = scrollY; upd(); });
  }, { passive: true });
})();
