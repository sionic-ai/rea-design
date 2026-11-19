// Moves the ‹50› pattern dots per scroll scene (original values): during the first scene they rise from -5 → 0 (easeOutQuad) · in the second scene they gather into a sphere (morph .8 · scatter -1) with opacity 1 → .04 ·
// Third section greeting + scatter -1 → 2 (easeInOutQuad) · fourth section reversal + opacity .04 → 1 · fifth and logo sections camera goes into the sphere -5 · exits from the section behind the cards · back to letters at the footer.
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const { beat, ease, reduce } = MC;
  const outQuad = (t) => 1 - (1 - t) * (1 - t);
  const inOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const C = { initialMorph: 0.7, defaultY: -5, openingY: -1, gatheredDiv: -1, gatheredMorph: 0.8, divergedDiv: 2, frameOutZ: -5, alpha: 0.04 };
  const stage = q(".mc-canvas");
  const S = { yOffset: C.defaultY, openingY: C.openingY, footerY: 0, cameraZ: 0, morph: C.initialMorph, divergence: 0 };

  // ── Graph visuals (SVGs of the same shape in place of the original’s number graphics) ──
  const ticks = (vals, x0, y0, h) => vals.map((v, i) => `<text class="chart-tick" x="${x0 - 14}" y="${y0 - (h * i) / (vals.length - 1) + 8}" text-anchor="end">${v}</text>`).join("");
  const years = (n, x0, w, y) => Array.from({ length: n }, (_, i) => `<text class="chart-small" transform="translate(${x0 + (w * i) / (n - 1)} ${y}) rotate(90)">0000</text>`).join("");
  const CHART = {
    line() {
      const n = 19, pts = Array.from({ length: n }, (_, i) => [180 + (i * 760) / (n - 1), 470 - 40 - Math.pow(i / (n - 1), 0.8) * 330]);
      return `<line class="chart-axis" x1="170" y1="470" x2="960" y2="470"/>${ticks([0, 500, 1000, 1500, 2000], 150, 470, 400)}${years(n, 180, 760, 490)}
        <polyline class="chart-line" points="${pts.map((p) => p.join(",")).join(" ")}"/>${pts.map(([x, y]) => `<circle class="chart-dot" cx="${x}" cy="${y}" r="7"/>`).join("")}
        <text class="chart-small" x="560" y="120">Number of investments (unit: cases)</text><text class="chart-hl" x="860" y="80">About 0,000 cases</text>`;
    },
    area() {
      const n = 20, xs = (i) => 180 + (i * 760) / (n - 1);
      const a = Array.from({ length: n }, (_, i) => 470 - 60 - (i / n) * 180 - (i % 3) * 10), b = a.map((y, i) => y - (i > 15 ? (i - 15) * 45 : 6));
      const path = (top, base) => `M${xs(0)},${base[0]} ${top.map((y, i) => `L${xs(i)},${y}`).join(" ")} L${xs(n - 1)},${base === null ? 470 : base[n - 1]} ${base ? base.slice().reverse().map((y, i) => `L${xs(n - 1 - i)},${y}`).join(" ") : `L${xs(0)},470`} Z`;
      return `<line class="chart-axis" x1="170" y1="470" x2="960" y2="470"/>${ticks([0, 500, 1000, 1500], 150, 470, 400)}${years(n, 180, 760, 490)}
        <path class="chart-area-b" d="${path(b, a)}"/><path class="chart-area-a" d="M${xs(0)},470 ${a.map((y, i) => `L${xs(i)},${y}`).join(" ")} L${xs(n - 1)},470 Z"/>
        <text class="chart-small" x="560" y="120">Total assets under management (in 100M won)</text><text class="chart-hl" x="880" y="200">000</text>`;
    },
    bar() {
      const n = 46;
      return `<line class="chart-axis" x1="170" y1="470" x2="960" y2="470"/>${ticks([0, 250, 500, 750, 1000], 150, 470, 400)}${years(12, 180, 760, 490)}
        ${Array.from({ length: n }, (_, i) => { const h = Math.pow(i / (n - 1), 2.2) * 330 + 2; return `<rect class="chart-bar" x="${180 + i * 16.6}" y="${470 - h}" width="9" height="${h}"/>`; }).join("")}
        <text class="chart-small" x="520" y="110">Total listings (unit: companies)</text><text class="chart-hl" x="880" y="120">000 places</text>`;
    },
    donut() {
      const ring = (cx, parts) => { let a0 = -90; return parts.map(([v, cls]) => { const a1 = a0 + v * 3.6, r = 120, R = 190, rad = (d) => (d * Math.PI) / 180, p = (rr, d) => `${cx + rr * Math.cos(rad(d))},${290 + rr * Math.sin(rad(d))}`, big = v > 50 ? 1 : 0; const d = `M${p(R, a0)} A${R},${R} 0 ${big} 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 ${big} 0 ${p(r, a0)} Z`; a0 = a1; return `<path class="${cls}" d="${d}"/>`; }).join(""); };
      return `${ring(330, [[14, "chart-area-b"], [14, "chart-area-a"], [15, "chart-bar"], [57, "chart-area-a"]])}${ring(770, [[10, "chart-bar"], [16, "chart-area-b"], [21, "chart-area-a"], [53, "chart-bar"]])}
        <text class="chart-tick" x="330" y="70" text-anchor="middle">Industry Details</text><text class="chart-tick" x="770" y="70" text-anchor="middle">Step details</text>
        <text class="chart-hl" x="330" y="305" text-anchor="middle">00%</text><text class="chart-hl" x="770" y="305" text-anchor="middle">00%</text>`;
    },
    number() {
      return `<text class="chart-tick" x="200" y="230">Connected consultation count</text><text class="chart-big" x="520" y="250">000</text><text class="chart-tick" x="760" y="230">Cases (per year)</text>
        <text class="chart-tick" x="200" y="400">Companies we can introduce</text><text class="chart-big" x="520" y="420">0,000</text><text class="chart-tick" x="820" y="400">Over … places</text>`;
    },
  };
  qa("[data-chart]").forEach((el) => (el.innerHTML = `<svg viewBox="0 0 1040 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${CHART[el.dataset.chart]()}</svg>`));

  // ── Feed values to the dot board (every frame) ──
  const apply = () => {
    const p = stage.fxPoints?.params;
    if (!p) return;
    const w = stage.fxPoints.width();
    const d = Math.max(Math.min(-(0.0033 * w) + 6.3, 5), 1.5);
    p.yOffset = S.yOffset + S.openingY * d + S.footerY;
    p.cameraZ = S.cameraZ;
    p.morph = S.morph;
    p.divergence = S.divergence;
  };
  gsap.ticker.add(apply);
  const alphaTo = (v, down = true) => {
    const r = down ? 1 - v * (1 - C.alpha) : v * (1 - C.alpha) + C.alpha;
    gsap.set(stage, { opacity: outQuad(r), overwrite: true });
  };
  if (!reduce) gsap.fromTo(stage, { autoAlpha: 0 }, { autoAlpha: 1, duration: beat, ease, delay: MC.wake });
  else { gsap.set(stage, { autoAlpha: 1 }); S.morph = 0; S.openingY = 0; }

  // Open: when the loader ends, dots gather into letters over 1.6s from where they scattered while the panel rises into place, and the title · ring · vertical greeting appear
  MC.onLoaded.push(() => {
    if (reduce) return;
    gsap.to(S, { openingY: 0, morph: 0, divergence: 0, duration: 2 * beat, ease });
    gsap.fromTo(".mv__title > span", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: beat, ease, stagger: 0.12 });
    gsap.fromTo(".mv__ring", { opacity: 0, x: -24, y: 24 }, { opacity: 1, x: 0, y: 0, delay: 0.24, duration: beat, ease: "power1.inOut" });
    setTimeout(() => q(".mv__message p").fxPlay?.(), 240);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The first scene sticks to the screen and rises while shrinking gradually down to .84x (follows at .8s power2.out)
    ScrollTrigger.create({
      trigger: ".mc-scene.is-first", start: "top top",
      onUpdate: ({ progress }) => { const s = Math.max(0.84, 1 - progress / 10); gsap.to(".mv__scene", { scale: s, y: `${-((1 - s) * 84)}vh`, duration: beat, ease }); },
    });
    const scene = (name, onScroll, extra = {}) => ScrollTrigger.create({ trigger: `[data-scene="${name}"]`, start: "top top", end: "bottom top", onUpdate: (st) => onScroll(st.progress), ...extra });
    scene("rise", (t) => (S.yOffset = C.defaultY * (1 - outQuad(t))));
    scene("gather", (t) => { const e = outQuad(t); S.morph = C.gatheredMorph * e; S.divergence = C.gatheredDiv * e; alphaTo(t, true); });
    const greet = (on) => gsap.to(".mv__greeting p", { opacity: on ? 1 : 0, duration: beat, ease });
    scene("greet", (t) => (S.divergence = (C.divergedDiv - C.gatheredDiv) * inOutQuad(t) + C.gatheredDiv), { onEnter: () => greet(1), onEnterBack: () => greet(1), onLeave: () => greet(0), onLeaveBack: () => greet(0) });
    scene("back", (t) => { S.divergence = (C.divergedDiv - C.gatheredDiv) * inOutQuad(1 - t) + C.gatheredDiv; alphaTo(t, false); });
    scene("dive", (t) => (S.cameraZ = C.frameOutZ * outQuad(0.8 * t)));
    ScrollTrigger.create({ trigger: ".mc-logos", start: "top top", end: "bottom top", onUpdate: ({ progress }) => (S.cameraZ = C.frameOutZ * outQuad(0.2 * progress + 0.8)) });
    // Behind the card panel: fades out again as it slips out of the sphere
    ScrollTrigger.create({ trigger: '[data-scene="after"]', start: "top bottom", end: "bottom top", onUpdate: ({ progress }) => { S.cameraZ = C.frameOutZ * outQuad(1 - progress); alphaTo(progress, true); } });
    // When the footer stage is fully visible, the dots gather back into text and stand at the bottom of the screen
    const footer = (on) => {
      gsap.to(S, { morph: on ? 0 : C.gatheredMorph, divergence: on ? 0 : C.gatheredDiv, footerY: on ? C.defaultY : 0, duration: 2 * beat, ease, overwrite: "auto" });
      gsap.to(stage, { opacity: on ? 1 : C.alpha, duration: beat, ease });
    };
    ScrollTrigger.create({ trigger: '[data-slot="footer-stage"]', start: "bottom bottom", end: "top top", onEnter: () => footer(true), onEnterBack: () => footer(true), onLeave: () => footer(false), onLeaveBack: () => footer(false) });

    // Progress bar — advances as you scroll past the first section (up to the logo strip)
    const bar = q(".mc-progress");
    ScrollTrigger.create({
      trigger: "#top", start: "top top", end: "bottom bottom",
      onUpdate: ({ progress }) => gsap.set(bar, { width: `${progress * 100}%` }),
      onEnter: () => gsap.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: beat, ease }), onEnterBack: () => gsap.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: beat, ease }),
      onLeave: () => gsap.to(bar, { opacity: 0, duration: beat, ease }), onLeaveBack: () => gsap.to(bar, { opacity: 0, duration: beat, ease }),
    });
    // The logo strip appears when the section comes into view
    ScrollTrigger.create({ trigger: ".mc-logos__wrap", start: "top 80%", onEnter: () => gsap.to(".mc-logos__wrap", { opacity: 1, duration: beat, ease }), onLeaveBack: () => gsap.to(".mc-logos__wrap", { opacity: 0, duration: beat, ease }) });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(".mv__greeting p", { opacity: 1 }); });

  // ── Logo row and history: the same Splide 4.1.4 + auto scroll 0.5.3 as the original ──
  const Ext = window.splide?.Extensions;
  if (window.Splide && Ext) {
    qa(".mc-logos__row").forEach((row) => new Splide(row, {
      type: "loop", fixedHeight: "14svh", fixedWidth: "auto", gap: 0, drag: false, arrows: false, pagination: false, autoplay: false, pauseOnHover: false, resetProgress: false,
      autoScroll: { pauseOnFocus: false, pauseOnHover: false, speed: reduce ? 0 : row.dataset.reverse === "1" ? -1 : 1 },
    }).mount(Ext));
    new Splide(".mc-hist__slider", {
      type: "loop", perPage: matchMedia("(max-width: 960px)").matches ? 2 : 4, drag: "free", arrows: false, pagination: false, autoplay: false, pauseOnHover: false, resetProgress: false,
      autoScroll: { pauseOnFocus: false, pauseOnHover: false, speed: reduce ? 0 : 1 },
    }).mount(Ext);
  }

  // ── Video Window ──
  const modal = q(".mc-modal"), mv = q("video", modal);
  q(".mc-play").addEventListener("click", () => {
    modal.showModal();
    MC.lenis?.stop();
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.4, ease: "power1.out" });
    mv.play().catch(() => {});
  });
  const close = () => {
    mv.pause();
    gsap.to(modal, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "power1.out", onComplete: () => { modal.close(); MC.lenis?.start(); } });
  };
  q(".mc-modal__close").addEventListener("click", close);
  modal.addEventListener("click", (e) => e.target === modal && close());
  modal.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
})();
