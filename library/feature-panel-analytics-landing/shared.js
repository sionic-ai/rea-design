// Shared by all pages — header dropdown mega menu (opens on hover), phone menu drawer, reveals ported from Framer appear, dotted-pattern band.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("is-reduced");

  // Header mega menu — on hover the panel is switched on (display) and the open class is added next frame so the transition runs. On leave it disappears at .333s and the panel is turned off 1s later
  const items = [...document.querySelectorAll(".mp-nav__item[data-mega]")];
  const open = (it) => {
    items.forEach((o) => o !== it && close(o));
    const m = it.querySelector(".mp-mega");
    clearTimeout(it._t);
    if (!m.classList.contains("is-shown")) { m.classList.add("is-shown"); m.getBoundingClientRect(); }
    it.classList.add("is-open");
    it.querySelector(".mp-nav__btn")?.setAttribute("aria-expanded", "true");
  };
  function close(it) {
    if (!it.classList.contains("is-open")) return;
    it.classList.remove("is-open");
    it.querySelector(".mp-nav__btn")?.setAttribute("aria-expanded", "false");
    // The board is turned off long after the disappearance ends — so the size change at that moment doesn’t mix into the closing motion
    it._t = setTimeout(() => it.querySelector(".mp-mega").classList.remove("is-shown"), 1000);
  }
  items.forEach((it) => {
    const btn = it.querySelector(".mp-nav__btn");
    it.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && open(it));
    it.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && close(it));
    // Original: pressing an open menu with the mouse makes the panel nearly transparent (.04) in place, then .15s later it floats back up over .19s — position and caret unchanged
    btn.addEventListener("click", (e) => { e.preventDefault(); if (e.pointerType !== "mouse") it.classList.contains("is-open") ? close(it) : open(it); });
    btn.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      if (!it.classList.contains("is-open")) return open(it);
      const m = it.querySelector(".mp-mega");
      m.classList.remove("is-refade");
      m.classList.add("is-snap");
      clearTimeout(it._snap);
      it._snap = setTimeout(() => { m.classList.add("is-refade"); m.classList.remove("is-snap"); setTimeout(() => m.classList.remove("is-refade"), 400); }, 115);
    });
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && items.forEach(close));

  // Phone menu
  const head = document.querySelector(".mp-head");
  const burger = document.querySelector(".mp-burger");
  burger?.addEventListener("click", () => {
    const on = head.classList.toggle("is-menu");
    // While the notice bar is visible the header sits below it — attach the drawer to the bottom edge of the header
    const drawer = document.querySelector(".mp-drawer");
    if (drawer) drawer.style.top = `${Math.max(0, head.getBoundingClientRect().bottom)}px`;
    burger.setAttribute("aria-expanded", String(on));
    document.body.style.overflow = on ? "hidden" : "";
  });


  // Dot world map — instead of the original map image, dots are placed from a rough continent table in 5° cells (used by About and Careers). data-pins="Longitude, latitude;…" Pin on the spot
  const SPANS = [
    [[27, 31], [48, 56]], [[12, 20], [25, 32], [50, 62]], [[4, 22], [25, 32], [38, 40], [42, 68]], [[2, 8], [9, 24], [26, 31], [37, 41], [41, 70]],
    [[3, 7], [9, 16], [20, 26], [28, 30], [36, 41], [41, 67]], [[9, 16], [20, 26], [34, 35], [36, 44], [44, 63], [66, 67]], [[11, 27], [34, 35], [35, 45], [45, 63]],
    [[12, 28], [35, 44], [45, 61], [64, 64]], [[12, 27], [34, 37], [38, 43], [41, 45], [45, 60], [63, 64]], [[13, 25], [34, 43], [43, 48], [48, 60], [62, 63]],
    [[14, 24], [33, 42], [43, 47], [47, 51], [52, 60]], [[15, 20], [23, 23], [32, 43], [44, 48], [49, 52], [53, 59]], [[16, 21], [22, 24], [32, 43], [44, 48], [49, 52], [54, 57]],
    [[18, 22], [32, 44], [45, 47], [50, 52], [54, 57], [60, 60]], [[20, 23], [33, 45], [51, 51], [55, 57], [60, 60]], [[21, 26], [34, 44], [55, 57], [58, 60]],
    [[20, 28], [37, 44], [55, 57], [58, 60], [61, 61]], [[20, 30], [38, 44], [57, 60], [63, 66]], [[21, 30], [38, 44], [62, 64]], [[21, 29], [38, 44], [46, 46], [59, 65]],
    [[22, 29], [38, 43], [46, 46], [58, 66]], [[23, 28], [38, 42], [58, 66]], [[23, 27], [39, 41], [59, 66]], [[23, 26], [61, 65], [70, 70]], [[23, 25], [65, 65], [69, 70]],
    [[23, 25]], [[23, 24]], [[24, 24]],
  ];
  const land = (lon, lat) => {
    const r = Math.floor((80 - lat) / 5), c = Math.floor((lon + 180) / 5);
    return (SPANS[r] || []).some(([a, b]) => c >= a && c <= b);
  };
  document.querySelectorAll("[data-worldmap]").forEach((cv) => {
    const draw = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio);
      if (!r.width) return;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      const g = cv.getContext("2d");
      g.scale(dpr, dpr);
      const css = getComputedStyle(cv);
      const step = +(cv.dataset.step || 6), mapW = r.width * 0.86, mapH = mapW * 0.47, ox = (r.width - mapW) / 2, oy = (r.height - mapH) / 2;
      g.fillStyle = css.color;
      for (let y = 0; y < mapH; y += step) for (let x = 0; x < mapW; x += step) {
        const lon = (x / mapW) * 360 - 180, lat = 80 - (y / mapH) * 135;
        if (land(lon, lat)) { g.beginPath(); g.arc(ox + x, oy + y, step * 0.28, 0, 7); g.fill(); }
      }
      (cv.dataset.pins || "").split(";").filter(Boolean).forEach((p) => {
        const [lon, lat] = p.split(",").map(Number);
        const x = ox + ((lon + 180) / 360) * mapW, y = oy + ((80 - lat) / 135) * mapH;
        g.fillStyle = css.getPropertyValue("--pin-fill") || css.backgroundColor;
        g.strokeStyle = css.getPropertyValue("--pin-ink") || css.color;
        g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(x, y); g.arc(x, y - 11, 7, Math.PI * 0.75, Math.PI * 2.25); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.arc(x, y - 11, 2.4, 0, 7); g.fillStyle = g.strokeStyle; g.fill();
        g.fillStyle = css.color;
      });
    };
    new ResizeObserver(draw).observe(cv);
  });


  // Generated blog patterns — half-card art from the original post cards (pixel blocks, stacks of horizontal bars, dots and crosses, hatching, halftone, vertical lines). Color is the canvas text color (currentColor)
  const seeded = (n) => () => ((n = (n * 16807) % 2147483647) - 1) / 2147483646;
  const PAINT = {
    pixels(g, w, h, r) { const c = 10; for (let y = 0; y < h; y += c) { let x = 0; while (x < w) { const run = 1 + Math.floor(r() * 6); if (r() < 0.5) g.fillRect(x, y + 1, run * c * 0.9, c - 3); x += run * c; } } },
    bars(g, w, h, r) { const rows = Math.floor(h / 14); for (let i = 0; i < rows; i++) { const k = Math.abs(Math.sin(i * 0.35)) * 0.8 + 0.1, bw = w * 0.45 * k * (0.6 + r() * 0.4); g.strokeRect(w * 0.42 - bw / 2, i * 14 + 3, bw, 7); } },
    dots(g, w, h, r) { const c = 22; for (let y = c / 2; y < h; y += c) for (let x = c / 2; x < w; x += c) { const v = r(); if (v < 0.45) { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } else if (v < 0.75) { g.fillRect(x - 6, y - 0.75, 12, 1.5); g.fillRect(x - 0.75, y - 6, 1.5, 12); } } },
    hatch(g, w, h) { g.lineWidth = 2; for (let x = -h; x < w; x += 9) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); } },
    halftone(g, w, h, r) { const c = 9; for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) { const f = (Math.sin(x * 0.02) + Math.cos(y * 0.025) + 2) / 4, s = c * f * (0.6 + r() * 0.5); g.fillRect(x + (c - s) / 2, y + (c - s) / 2, s, s); } },
    vlines(g, w, h, r) { g.lineWidth = 2; for (let x = 6; x < w; x += 10) { const a = r() * h * 0.6, b = a + h * (0.2 + r() * 0.5); g.beginPath(); g.moveTo(x, a); g.lineTo(x, Math.min(h, b)); g.stroke(); } },
    blocks(g, w, h, r) { const c = 46; for (let y = 0; y < h; y += c) for (let x = (y / c) % 2 ? c / 2 : 0; x < w; x += c) { if (r() < 0.3) continue; g.strokeRect(x + 4, y + 4, c - 8, c - 8); g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + c - 4, y + c - 4); g.stroke(); } },
  };
  document.querySelectorAll("canvas[data-pattern]").forEach((cv, i) => {
    const draw = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio);
      if (!r.width) return;
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      const g = cv.getContext("2d");
      g.scale(dpr, dpr);
      g.fillStyle = g.strokeStyle = getComputedStyle(cv).color;
      g.lineWidth = 1.5;
      (PAINT[cv.dataset.pattern] || PAINT.pixels)(g, r.width, r.height, seeded(97 + i * 131));
    };
    new ResizeObserver(draw).observe(cv);
  });

  // Footer links — move the position immediately and let it follow from the old spot with a spring (values the original measures: offset 4px · .4s)
  const spring = getComputedStyle(root).getPropertyValue("--site-spring").trim() || "ease-out";
  document.querySelectorAll(".mp-foot__link").forEach((a) => {
    const chev = a.querySelector(".mp-chev");
    const swap = (on) => {
      a.classList.toggle("is-hover", on);
      if (!reduce && chev) chev.animate([{ transform: `translateX(${on ? -4 : 4}px)` }, { transform: "none" }], { duration: 400, easing: spring });
    };
    a.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && swap(true));
    a.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && swap(false));
  });

  // Appear — original Framer appear: 20px below and transparent → in place, .4s cubic-bezier(.22,.61,.36,1), siblings staggered by .08s
  const els = [...document.querySelectorAll("[data-reveal]")];
  if (reduce || !window.gsap) { els.forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; }); document.querySelectorAll(".mp-hero__slates i").forEach((i) => (i.style.transform = "none", i.style.opacity = 1)); return; }
  const ease = window.CustomEase ? CustomEase.create("mpOut", "0.22,0.61,0.36,1") : "power2.out";
  window.mpEase = ease;
  // Hero bars — fill up from the bottom (in order from the front)
  gsap.to(".mp-hero__slates i", { scaleY: 1, opacity: 1, duration: 0.6, ease, stagger: 0.012 });
  const io = new IntersectionObserver((ents) => {
    const batch = ents.filter((e) => e.isIntersecting).map((e) => e.target);
    batch.forEach((el, i) => {
      io.unobserve(el);
      gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease, delay: (+el.dataset.reveal || 0) + i * 0.08 });
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach((el) => io.observe(el));
})();
