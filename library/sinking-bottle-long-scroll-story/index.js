// One scroll line drives every scene — the original hung a start and end for each scene on 33 hidden 100vh markers (the rail) on the left.
// Here the same range is written as how many vh from the section head (the number in the comment = vh from the top of the document).
(() => {
  const { reduce } = window.PO;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (s, a, b) => clamp((s - a) / (b - a));
  const io1 = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);          // power1.inOut
  const io3 = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);      // Original easeInOut (cubic)
  const bez = gsap.parseEase("power2.inOut");                                            // Closest named curve to the original cubic-bezier(.645,.045,.355,1)
  const mix = (a, b, t) => a + (b - a) * t;
  // Value chained from several segments: passes through [[start, end, end value], …] with power1.inOut
  const chain = (s, from, parts) => { let v = from; for (const [a, b, to] of parts) { if (s <= a) break; v = mix(v, to, io1(seg(s, a, b))); } return v; };
  const set = (el, props) => { for (const k in props) el.style.setProperty(k, props[k]); };

  const el = {
    layers: $$("[data-scale-up]"), bottle: $("[data-bottle]"), h1box: $("[data-h1]"), h1: $("[data-h1] .t-h1"), menu: $(".hero__menu"), bottom: $("[data-bottom]"), center: $("[data-center]"),
    depth: $(".depth"), counter: $("[data-counter]"), reveal: $("[data-reveal]"), stage: $("[data-reveal-stage]"), ghost: $("[data-ghost]"), ghostW: $("[data-ghost-white]"), steps: $$("[data-step]"),
    fish: $(".fish"), bubbles: $("[data-bubbles]"), blur: $("[data-blur]"), fishes: $$("[data-fish]"), whale: $("[data-whale]"), half: $("[data-half]"), halfTop: $("[data-half-top]"), grow: $("[data-grow]"), growWrap: $("[data-grow-wrap]"),
    scards: $$("[data-scard]"), plate: $(".plate"), circle: $("[data-circle]"), plateImg: $("[data-plate]"), plateText: $("[data-plate-text]"), end: $(".end"), open: $("[data-open]"),
  };

  // Sentence that fills per character: put the characters inside a word (no line break)
  const letters = [];
  {
    const words = el.plateText.textContent.trim().split(/\s+/);
    el.plateText.textContent = "";
    words.forEach((w, wi) => {
      const ws = document.createElement("span"); ws.className = "po-w";
      [...w].forEach((ch, li) => { const ls = document.createElement("span"); ls.className = "po-l"; ls.textContent = ch; ws.append(ls); letters.push({ el: ls, delay: wi * 80 + li * 25 }); });
      el.plateText.append(ws, " ");
    });
  }
  let revealed = false, revealRaf = 0;
  const revealWords = (on) => {
    if (on === revealed) return; revealed = on; cancelAnimationFrame(revealRaf);
    if (!on) { letters.forEach((l) => { l.el.style.opacity = 0.1; }); return; }
    let t0 = 0;
    const step = (ts) => { t0 ||= ts; let done = true; for (const l of letters) { const t = clamp((ts - t0 - l.delay) / 250); if (t < 1) done = false; l.el.style.opacity = 0.1 + 0.9 * (1 - Math.pow(1 - t, 3)); } if (!done) revealRaf = requestAnimationFrame(step); };
    revealRaf = requestAnimationFrame(step);
  };

  if (reduce) {
    // With reduced motion, a static state with all scenes on — keep the holes open and all text visible
    set(el.stage, { "-webkit-mask-image": "none", "mask-image": "none" }); set(el.open, { "-webkit-mask-image": "none", "mask-image": "none" });
    el.steps.forEach((s, i) => { s.style.opacity = i === el.steps.length - 1 ? 1 : 0; });
    el.center.style.opacity = 1; el.blur.style.opacity = 1; el.half.style.opacity = 1; el.halfTop.style.opacity = 1; el.whale.style.transform = "none";
    set(el.circle, { width: "150vw", height: "150vw" }); el.plateText.style.opacity = 1; letters.forEach((l) => { l.el.style.opacity = 1; });
    return;
  }

  // Sticky elements measure their in-flow place instead of the current position
  let top = {}, vh = 1, wide = true;
  const flowTop = (node) => { let y = 0; for (let n = node; n; n = n.offsetParent) y += n.offsetTop; return y; };
  const measure = () => {
    vh = innerHeight / 100; wide = innerWidth > 991;
    top = { depth: flowTop(el.depth) / vh, reveal: flowTop(el.reveal) / vh, fish: flowTop(el.fish) / vh, plate: flowTop(el.plate) / vh, end: flowTop(el.end) / vh, stack: flowTop($(".stack")) / vh };
    last = -1;
  };

  let last = -1, lastSize = -1, openSmooth = 0, openT = performance.now();
  const FISH = [[-70, 101], [45, -120], [-45, 120], [165, -28]];
  const render = (now) => {
    const s = scrollY / vh;
    // The circle hole of the last section follows at 0.2s even after scrolling stops
    const openRaw = seg(s, top.end - 105, top.end + 145), dt = Math.min(0.1, (now - openT) / 1000); openT = now;
    if (openRaw <= 0 || openRaw >= 1) openSmooth = openRaw; else { openSmooth += (openRaw - openSmooth) * (1 - Math.exp(-dt / 0.2)); if (Math.abs(openRaw - openSmooth) < 0.003) openSmooth = openRaw; }
    const size = io3(clamp(openSmooth)) * 400;
    // When at rest, nothing is rewritten — writing the mask every frame makes the screen repaint even while still
    if (size !== lastSize) set(el.open, { "-webkit-mask-size": `${size}vh ${size}vh`, "mask-size": `${size}vh ${size}vh`, "-webkit-mask-position": `center calc(100% + ${size / 2}vh)`, "mask-position": `center calc(100% + ${size / 2}vh)` });
    lastSize = size;
    if (s === last) return; last = s;

    // ── Hero (0~600)
    if (s < top.depth + 120) {
      const p = s / 10;                                                                    // Bottle: 1000vh as 100
      const rot = chain(p, 0, [[0, 9, 75], [9, 19, 25], [19, 29, -25], [29, 39, -90], [39, 59, -135]]);
      const w = chain(p, 40, [[0, 9, 71], [9, 19, 56], [29, 39, 53]]), h = chain(p, 120, [[0, 9, 232], [9, 19, 178], [29, 39, 158]]);
      const x = chain(p, 0, [[0, 9, -10]]), y = chain(p, 0, [[0, 9, 15], [9, 19, 0], [19, 39, -10]]);
      set(el.bottle, { width: `${w}%`, height: `${h}vh`, transform: `translate(${x}%, ${y}vh) rotate(${rot}deg)` });
      const grow = io1(seg(s, 0, 300));                                                    // Background layers: range matched by eye
      el.layers.forEach((l) => { l.style.transform = `scale(${mix(1, 1.7, grow)})`; });
      const shrink = io1(seg(s, 0, 50)), lift = bez(seg(s, 50, 100)) * -50;
      el.h1box.style.width = `${mix(wide ? 78.13 : 45, wide ? 25 : 30, shrink)}vw`;
      el.h1.style.fontSize = `${mix(wide ? 10.94 : 12.5, wide ? 3.33 : 9, shrink)}vw`;       // The original links font size to cell width
      el.h1box.style.transform = el.menu.style.transform = `translateY(${lift}vh)`;
      el.bottom.style.opacity = 1 - seg(s, 0, 50); el.bottom.style.transform = `translateY(${-20 * seg(s, 0, 50)}vh)`;
      el.center.style.opacity = io1(seg(s, 40, 90)); el.center.style.transform = `translateY(${-70 * io1(seg(s, 160, 200))}vh)`;
    }

    // ── Depth number (700~850) · bottle-shaped hole (850~)
    const count = Math.round(mix(+el.counter.dataset.from, +el.counter.dataset.to, seg(s, top.depth + 100, top.depth + 250))).toLocaleString("en-US");
    if (el.counter.textContent !== count) el.counter.textContent = count;
    const R = top.reveal, p = clamp((s - R) / 100, 0, 2.2);
    const mask = p <= 0.9 ? 88.5 * io3(p / 0.9) : p <= 1.1 ? 88.5 : mix(88.5, 2000, io3((p - 1.1) / 1.1));
    set(el.stage, { "-webkit-mask-size": `${mask}vh ${mask}vh`, "mask-size": `${mask}vh ${mask}vh` });
    const gone = p >= 0.9, gh = Math.min(mask, 88.5) / 0.885, px = mask / 88.5;
    const PTS = [[0.12, 0], [0.25, 0.1], [0.4, 0.2], [0.55, 0.35], [0.75, 0.6], [0.9, 0.85], [1, 1]];
    let bo = px <= 0.12 ? 0 : 1; for (let i = 0; i < PTS.length - 1; i++) if (px >= PTS[i][0] && px <= PTS[i + 1][0]) bo = mix(PTS[i][1], PTS[i + 1][1], (px - PTS[i][0]) / (PTS[i + 1][0] - PTS[i][0]));
    for (const [g, o] of [[el.ghost, bo], [el.ghostW, 1 - bo]]) set(g, { display: gone ? "none" : "flex", height: `${gh}vh`, width: `calc(${gh}vh * 1920 / 1080)`, opacity: gone ? 0 : o });
    const dimOut = (a, b) => mix(1, 0.2, io1(seg(s, a, b))), dimIn = (a, b) => mix(0.2, 1, io1(seg(s, a, b)));
    const STEP = [
      { on: [R, R + 50], dim: () => dimOut(R + 230, R + 260) },
      { on: [R + 240, R + 315], dim: () => Math.min(dimIn(R + 240, R + 270), dimOut(R + 360, R + 390)) },
      { on: [R + 370, R + 445], dim: () => Math.min(dimIn(R + 370, R + 400), dimOut(R + 490, R + 520)) },
      { on: [R + 500, R + 575], dim: () => dimIn(R + 420, R + 466) },
    ];
    el.steps.forEach((st, i) => { st.style.opacity = io1(seg(s, ...STEP[i].on)); const d = STEP[i].dim(); st.querySelectorAll("[data-dim]").forEach((n) => { n.style.opacity = d; }); });

    // ── Creatures (1450~2350): revealed as the depth field clears
    const F = top.fish;
    const fade = 1 - io1(seg(s, F, F + 50)); el.depth.style.opacity = fade; el.depth.style.visibility = fade <= 0 ? "hidden" : "visible";
    el.bubbles.style.transform = `translateY(${-120 * seg(s, F + 50, F + 650)}vh)`;
    const bp = seg(s, F + 150, F + 470), vis = bp <= 0 || bp >= 1 ? 0 : bp < 0.25 ? bp / 0.25 : bp <= 0.7 ? 1 : (1 - bp) / 0.3;
    el.blur.style.opacity = vis.toFixed(3); el.blur.style.filter = wide && 16 * (1 - vis) > 0.1 ? `blur(${(16 * (1 - vis)).toFixed(1)}px)` : "none";
    el.fishes.forEach((f, i) => { f.style.transform = `translateX(${mix(FISH[i][0], FISH[i][1], seg(s, F + 50, F + 370))}vw)`; });
    el.whale.style.transform = `translateX(${mix(100, -300, seg(s, F + 350, F + 650))}vw)`;
    const g = io1(seg(s, F + 450, F + 550)); set(el.grow, { width: `${100 * g}vw`, height: `${100 * g}vh` });
    el.half.style.opacity = s >= F + 560 ? 1 : 0;
    el.growWrap.style.height = `${mix(100, 50, io1(seg(s, F + 650, F + 750)))}vh`;
    el.halfTop.style.opacity = io1(seg(s, F + 735, F + 750));

    // ── Stacking photo cards (2650~): each card 100vh later
    el.scards.forEach((c, i) => {
      const t = top.stack + i * 100;
      c.querySelector("[data-scard-box]").style.transform = `scale(${mix(1, 0.85, io1(seg(s, t + 20, t + 101)))})`;
      c.style.backgroundColor = `color-mix(in srgb, var(--kf-contrast-bg) ${100 * (1 - io1(seg(s, t + 29, t + 65)))}%, transparent)`;
      const d = io1(seg(s, t + 5, t + 63));
      c.querySelector("[data-scard-text]").style.opacity = mix(1, 0.15, d); c.querySelector("[data-scard-veil]").style.opacity = mix(0, 0.85, d);
    });

    // ── Plate circle (2850~3050)
    const P = top.plate, c = seg(s, P, P + 200);
    set(el.circle, { width: `${150 * c}vw`, height: `${150 * c}vw` });
    el.plateImg.style.transform = `rotate(${mix(-90, 0, seg(s, P, P + 100))}deg)`;
    const to = io1(seg(s, P + 100, P + 150)); el.plateText.style.opacity = to;
    if (to >= 0.95) revealWords(true); else if (to <= 0.15) revealWords(false);
  };

  measure();
  addEventListener("resize", measure);
  new ResizeObserver(measure).observe(document.body);
  gsap.ticker.add(() => render(performance.now()));
})();
