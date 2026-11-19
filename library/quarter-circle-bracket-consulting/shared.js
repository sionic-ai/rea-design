// Shared by all pages: Lenis, quarter-ring art, appear (Framer appear), contents pill, mark/contents color flip, footer
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AB = (window.AB = { reduced, lenis: null });

  // Original Framer code part: Lenis 1.0.42 · duration 1 (intensity 10/10) · wheel 1.5x · touch 2x · expo curve — turned off on touch devices
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (!reduced && !touch && window.Lenis) {
    AB.lenis = new Lenis({
      duration: 1, smoothWheel: true, syncTouch: false, smoothTouch: false, touchMultiplier: 2, wheelMultiplier: 1.5,
      orientation: "vertical", gestureOrientation: "vertical", easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });
    AB.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => AB.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Quarter-ring band path: center cx,cy · inner r1 · outer r2 · quadrant q (0 bottom right, 1 bottom left, 2 top left, 3 top right) ── */
  AB.qring = (cx, cy, r1, r2, q) => {
    const a0 = (q * Math.PI) / 2, a1 = a0 + Math.PI / 2;
    const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    return `M${p(r2, a0)}A${r2} ${r2} 0 0 1 ${p(r2, a1)}L${p(r1, a1)}A${r1} ${r1} 0 0 0 ${p(r1, a0)}Z`;
  };
  // Placeholder mark: four quarter rings as a pinwheel — instead of the original logo
  AB.markSVG = () => `<svg viewBox="0 0 30 34" aria-hidden="true"><g fill="currentColor">
    <path d="${AB.qring(15, 17, 3.5, 12, 2)}" transform="translate(-1.2 -1.2)"/><path d="${AB.qring(15, 17, 3.5, 12, 3)}" transform="translate(1.2 -1.2)"/>
    <path d="${AB.qring(15, 17, 3.5, 12, 0)}" transform="translate(1.2 1.2)"/><path d="${AB.qring(15, 17, 3.5, 12, 1)}" transform="translate(-1.2 1.2)"/></g></svg>`;
  document.querySelectorAll("[data-mark]").forEach((el) => (el.innerHTML = AB.markSVG()));
  // Brackets: wrap the text with two thin curved lines the height of the text
  const brk = (side) => `<svg viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true"><path d="${side ? "M1 0Q11 50 1 100" : "M9 0Q-1 50 9 100"}"/></svg>`;
  document.querySelectorAll("[data-brk]").forEach((el) => el.insertAdjacentHTML("afterbegin", brk(0)) || el.insertAdjacentHTML("beforeend", brk(1)));

  /* ── Original Framer spring: springs set by duration and bounce (motion findSpring) turned into GSAP curves — bounce .2 · .4s is stiffness 505 · damping 36 ── */
  const springEase = (bounce, duration) => {
    const z = Math.min(1, Math.max(0.05, 1 - bounce));
    const env = (f) => (z < 1 ? 0.001 - (z / Math.sqrt(1 - z * z)) * Math.exp(-f * z * duration) : -0.001 + Math.exp(-f * duration) * (f * duration + 1));
    let f = 5 / duration;
    for (let i = 0; i < 40; i++) { const d = (env(f + 1e-4) - env(f)) / 1e-4; if (!d) break; f -= env(f) / d; }
    const wd = f * Math.sqrt(Math.max(0, 1 - z * z));
    const x = (t) => (z < 1 ? 1 - Math.exp(-z * f * t) * (Math.cos(wd * t) + ((z * f) / wd) * Math.sin(wd * t)) : 1 - Math.exp(-f * t) * (1 + f * t));
    let T = duration;
    while (T < duration * 4 && Math.abs(1 - x(T)) > 0.0005) T += 0.01;
    return { ease: (p) => (p >= 1 ? 1 : x(p * T)), dur: T };
  };

  AB.springEase = springEase;

  /* ── Appear (original Framer appear): from opacity .001 and 10px down with a spring (bounce 0, .4s) — text lines are delayed .075s each (starting after .2s) ──
     .001 is the original value — at 0, buttons and cards that haven’t appeared yet are counted as off the screen */
  const appearSpring = springEase(0, 0.4);
  AB.appear = (root = document) => {
    // Text as lines (<br>) wraps by unit — original text reveal tokenization: line (.075s per line)
    root.querySelectorAll("[data-chars]").forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      const lines = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = lines.map((l) => `<span class="ab-ch">${l}</span>`).join("<br>");
    });
    if (reduced) return;
    root.querySelectorAll("[data-appear]").forEach((el) => {
      gsap.set(el, { opacity: 0.001, y: 10 });
      ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: appearSpring.dur, delay: 0.075, ease: appearSpring.ease }) });
    });
    root.querySelectorAll("[data-chars]").forEach((el) => {
      const words = el.querySelectorAll(".ab-ch");
      gsap.set(words, { opacity: 0.001, y: 10 });
      ScrollTrigger.create({
        trigger: el, start: "top bottom", once: true,
        onEnter: () => gsap.to(words, { opacity: 1, y: 0, duration: appearSpring.dur, delay: 0.2, ease: appearSpring.ease, stagger: 0.075 }),
      });
    });
  };

  /* News page interaction (original Framer layout transition): the back button’s arrow line shifts 47.5px to the left (spring .4s, bounce .2),
        The list card image scales to 1.06 (exponential decay .7s). As in the original, position and size are changed first, then the transform that offset them is released ── */
  // The original layout transition moves position on the frame after the touch (probe 18~21ms) — moving it in the same frame makes the start position off by one cell
  const hoverOn = (el, enter, leave) => {
    el.addEventListener("pointerenter", () => requestAnimationFrame(enter));
    el.addEventListener("pointerleave", () => requestAnimationFrame(leave));
  };
  document.querySelectorAll(".nw-back").forEach((a) => {
    const row = a.querySelector(".nw-back__row");
    if (!row) return;
    const sp = springEase(0.2, 0.4);
    const slide = (to) => {
      const from = parseFloat(row.style.marginLeft) || 0;
      row.style.marginLeft = `${to}px`;
      if (reduced) return;
      gsap.fromTo(row, { x: from - to + (gsap.getProperty(row, "x") || 0) }, { x: 0, duration: sp.dur, ease: sp.ease, overwrite: true });
    };
    hoverOn(a, () => slide(-47.5), () => slide(0));
  });
  document.querySelectorAll(".nw-card").forEach((card) => {
    const img = card.querySelector(".nw-card__img");
    if (!img) return;
    // The original probe curve is an exponential decay with time constant .144s (1 − e^(−t/τ)), so it is solved the same way over .7s (≈ 4.86τ)
    const decay = (p) => (1 - Math.exp(-4.86 * p)) / (1 - Math.exp(-4.86));
    const grow = (on) => {
      card.classList.toggle("is-grown", on);
      if (reduced) return;
      gsap.fromTo(img, { scale: on ? 1 / 1.06 : 1.06 }, { scale: 1, duration: 0.7, ease: decay, overwrite: true });
    };
    hoverOn(card, () => grow(true), () => grow(false));
  });

  /* ── Table of contents: when a section’s center passes the screen center, that section’s pill fills · the mark and contents invert color when the section underneath is ink-black ── */
  const toc = document.querySelector(".ab-toc");
  const mark = document.querySelector(".ab-mark");
  if (toc) {
    toc.querySelectorAll("a[href^='#']").forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top center", end: "bottom center",
        onToggle: (st) => st.isActive && toc.querySelectorAll("a").forEach((x) => x.classList.toggle("is-current", x === a)),
      });
      a.addEventListener("click", (e) => {
        e.preventDefault();
        AB.lenis ? AB.lenis.scrollTo(sec, { duration: 1.2 }) : sec.scrollIntoView();
      });
    });
  }
  // Same-page links (mark, footer) also move smoothly like the table of contents
  document.querySelectorAll("a[href^='#']:not(.ab-toc a)").forEach((a) => {
    const sec = a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    a.addEventListener("click", (e) => { e.preventDefault(); AB.lenis ? AB.lenis.scrollTo(sec, { duration: 1.2 }) : sec.scrollIntoView(); });
  });
  const themeAt = (x, y) => {
    for (const el of document.elementsFromPoint(x, y)) {
      if (el.closest(".ab-toc, .ab-mark, .ab-noise, .wf-ui")) continue;
      const t = el.closest("[data-theme]");
      if (t) return t.dataset.theme;
    }
    return "light";
  };
  AB.paintChrome = () => {
    if (toc) toc.classList.toggle("is-dark", themeAt(40, 440) === "dark");
    if (mark) mark.classList.toggle("is-dark", themeAt(28, 30) === "dark");
  };
  addEventListener("scroll", AB.paintChrome, { passive: true });
  addEventListener("load", () => { AB.paintChrome(); ScrollTrigger.refresh(); });

  AB.appear();
})();
