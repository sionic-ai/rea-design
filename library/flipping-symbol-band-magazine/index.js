// Home page — when the loader starts to clear, the symbol strip’s first screen plays (fixed at its end state after 4.2s), and over the Hero the buttons turn black and the photo strip flows.
(() => {
  const fv = document.querySelector(".ik-fv");
  const mm = gsap.matchMedia();

  document.addEventListener("ik:reveal", () => {
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        fv.classList.add("is-run");
        if (ctx.conditions.still) return fv.classList.add("is-done");
        const t = setTimeout(() => fv.classList.add("is-done"), 4200);
        return () => clearTimeout(t);
      },
    );
  });

  // Circular window: the original is a 500px black and white GIF (white dot pattern on black, 12 frames · 160ms each · endless) — our canvas shimmers the dot pattern at the same tempo
  const grain = document.querySelector("[data-ik-grain]");
  if (grain) {
    const FRAMES = 12, STEP = 160, CELLS = 84;
    let frames = [], k = 0, timer = 0;
    const paint = () => {
      const r = grain.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      const css = getComputedStyle(document.documentElement);
      const bg = css.getPropertyValue("--kf-contrast-bg").trim(), ink = css.getPropertyValue("--kf-contrast-ink").trim();
      const pitch = w / CELLS, rad = pitch * 0.24;
      frames = Array.from({ length: FRAMES }, () => {
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const g = c.getContext("2d");
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.fillStyle = ink;
        for (let y = 0; y < CELLS; y++) for (let x = 0; x < CELLS; x++) {
          g.globalAlpha = 0.3 + Math.random() * 0.55;
          g.beginPath();
          g.arc((x + 0.5 + (Math.random() - 0.5) * 0.25) * pitch, (y + 0.5 + (Math.random() - 0.5) * 0.25) * (h / CELLS), rad * (0.8 + Math.random() * 0.4), 0, Math.PI * 2);
          g.fill();
        }
        return c;
      });
      grain.width = w; grain.height = h;
      grain.getContext("2d").drawImage(frames[k % FRAMES], 0, 0);
    };
    const tick = () => { if (!frames.length) return; k = (k + 1) % FRAMES; grain.getContext("2d").drawImage(frames[k], 0, 0); };
    new ResizeObserver(paint).observe(grain);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      timer = setInterval(tick, STEP);
      return () => clearInterval(timer);
    });
  }

  // Only while inside the first screen (100vh) are the menu·search buttons plain black — below that, difference blend
  let ticking = false;
  const check = () => document.body.classList.toggle("in-top-first-view", scrollY < innerHeight);
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      check();
    });
  }, { passive: true });
  document.addEventListener("ik:scroll", check);
  check();

  // Photo strip: measure the width of one set, drift left at 60px/s, and clone the set so it joins endlessly.
  // The original css hover-pause uses a selector that looks for the strip itself as a descendant, so it never actually applies — so it doesn’t pause
  const track = document.querySelector(".ik-marquee__track");
  if (track) {
    [...track.children].forEach((c) => track.append(Object.assign(c.cloneNode(true), { ariaHidden: "true" })));
    const start = () => {
      const half = [...track.children].slice(0, track.children.length / 2).reduce((w, c) => w + c.offsetWidth, 0);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const anim = track.animate([{ transform: "translateX(0)" }, { transform: `translateX(-${half}px)` }], {
          duration: (half / 60) * 1000,
          iterations: Infinity,
          easing: "linear",
        });
        return () => anim.cancel();
      });
    };
    if (document.readyState === "complete") start();
    else addEventListener("load", start);
  }
})();
