// Work detail — photo slideshow (3.5s), icon zoom, journey panel number count-up, and scrolling further at the very bottom goes to the next work
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bot = navigator.webdriver || document.prerendering || /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i.test(navigator.userAgent);

  document.querySelectorAll("[data-slideshow]").forEach((box) => {
    const slides = [...box.querySelectorAll(".slide")];
    let i = 0, timer = 0, seen = false;
    const step = () => { slides[i].classList.remove("on"); i = (i + 1) % slides.length; slides[i].classList.add("on"); };
    const run = (on) => { clearInterval(timer); if (on && !document.hidden && !reduce) timer = setInterval(step, 3500); };
    new IntersectionObserver(([e]) => run((seen = e.isIntersecting))).observe(box);
    document.addEventListener("visibilitychange", () => run(seen));
  });

  // Pulls in on five cells of the icon cluster in turn (0.38s move · 0.62s hold, 3px blur while moving) then pulls back to the full view — the original skips this for bots
  const COLS = [146, 284, 420, 556, 691, 828, 964, 1100, 1236, 1372, 1508, 1644, 1780, 1916, 2052, 2188, 2324, 2460, 2596, 2732, 2868, 3004, 3140, 3276, 3412, 3548, 3684].map((x) => x - 78);
  const ROWS = [356, 491, 626, 763, 900, 1035, 1172, 1306, 1443, 1577, 1715, 1851, 1988].map((y) => y - 288);
  const PATH = [[7, 0], [23, 5], [25, 2], [15, 3], [2, 12]];
  if (!reduce && !bot) document.querySelectorAll("[data-icon-reel]").forEach((reel) => {
    const sheet = reel.querySelector(".sheet");
    const play = () => {
      const w = reel.clientWidth, h = reel.clientHeight, W = 27 * 136, H = 13 * 136;
      const fit = Math.max(w / W, h / H), z = h / (136 * 2.6);
      const at = (x, y) => `translate(${w / 2 - x * z}px, ${h / 2 - y * z}px) scale(${z})`;
      const total = PATH.length * 1000 + 1700;
      const frames = [], blur = [{ filter: "blur(0px)", offset: 0 }];
      let t = 0;
      PATH.forEach(([c, r], n) => {
        const tr = at(COLS[c], ROWS[r]);
        if (n > 0) frames.push({ transform: tr, offset: (t += 380) / total, easing: "cubic-bezier(0.7, 0, 0.3, 1)" });
        else frames.push({ transform: tr, offset: 0, easing: "linear" });
        frames.push({ transform: tr, offset: (t += 620) / total, easing: n === PATH.length - 1 ? "cubic-bezier(0.65, 0, 0.2, 1)" : "cubic-bezier(0.7, 0, 0.3, 1)" });
      });
      frames.push({ transform: `translate(${(w - W * fit) / 2}px, ${(h - H * fit) / 2}px) scale(${fit})`, offset: 1 });
      t = 620;
      for (let n = 1; n < PATH.length; n++) { blur.push({ filter: "blur(0px)", offset: t / total }, { filter: "blur(3px)", offset: (t + 190) / total }, { filter: "blur(0px)", offset: (t + 380) / total }); t += 1000; }
      blur.push({ filter: "blur(0px)", offset: 1 });
      sheet.animate(blur, { duration: total });
      sheet.animate(frames, { duration: total, fill: "forwards" });
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.45 });
    io.observe(reel);
  });
  // For bots and reduced motion, set everything in place
  document.querySelectorAll("[data-icon-reel]").forEach((reel) => {
    const sheet = reel.querySelector(".sheet");
    const fit = () => { if (sheet.getAnimations().length) return; const s = Math.max(reel.clientWidth / (27 * 136), reel.clientHeight / (13 * 136)); sheet.style.transform = `translate(${(reel.clientWidth - 27 * 136 * s) / 2}px, ${(reel.clientHeight - 13 * 136 * s) / 2}px) scale(${s})`; };
    fit(); new ResizeObserver(fit).observe(reel);
  });

  if (!reduce) document.querySelectorAll("[data-journey]").forEach((j) => {
    j.classList.add("armed");
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect(); j.classList.add("in");
      j.querySelectorAll("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count), pre = el.dataset.pre ?? "", post = el.dataset.post ?? "";
        const delay = (Number(el.closest(".stage")?.style.getPropertyValue("--i")) || 0) * 900 + 200;
        el.textContent = `${pre}0${post}`;
        setTimeout(() => { const t0 = performance.now(); const f = (now) => { const p = Math.min(1, (now - t0) / 900), v = to * (1 - (1 - p) ** 3); el.textContent = `${pre}${Number.isInteger(to) ? Math.round(v) : v.toFixed(1)}${post}`; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }, delay);
      });
    }, { threshold: 0.3 });
    io.observe(j);
  });

  // Next Work item — the bar fills to 70% by how much of the panel is visible, and the extra scroll past the bottom (up to 260px) is the remaining 30% — when full, move on
  const next = document.querySelector("[data-next]"), fill = document.querySelector("[data-fill]");
  if (next && fill && !reduce) {
    let extra = 0, gone = false;
    const seen = () => { const r = next.getBoundingClientRect(); return Math.min(1, Math.max(0, (innerHeight - r.top) / r.height)); };
    const atEnd = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    const draw = () => {
      const v = Math.min(1, seen() * 0.7 + (extra / 260) * 0.3);
      fill.style.transform = `scaleX(${Math.max(0.3, v)})`;
      if (v >= 1 && !gone) { gone = true; location.href = next.href; }
    };
    const push = (d) => { if (!atEnd() || d <= 0) extra = Math.max(0, extra - 20); else { extra = Math.min(260, extra + d); draw(); } };
    addEventListener("scroll", draw, { passive: true });
    addEventListener("wheel", (e) => push(e.deltaY), { passive: true });
    let ty = 0;
    addEventListener("touchstart", (e) => (ty = e.touches[0].clientY), { passive: true });
    addEventListener("touchmove", (e) => { const y = e.touches[0].clientY; push((ty - y) * 1.5); ty = y; }, { passive: true });
    addEventListener("pageshow", () => { gone = false; extra = 0; draw(); });
    draw();
  }
})();
