// First page: copy letter sequence (.1s apart up to the comma, next chunk 1s later), three Splide 4.1.4 sliders same as the original (hero·work·steps), option tooltip.
// Original values: Hero moves every 5.4s over 2.4s (ease-in-out, 28% at the sides · 20% between, 16px on phone), Work moves every 8.4s over 3.4s (20% between · 2% on phone), order does not advance on its own and takes 2.4s (30px between · 20px on phone).
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // First letter of the chunk is base, the second chunk starts at base + gap, then .1s each
  const stagger = (spans, base, gap, breakAt) => spans.forEach((s, i) => {
    s.style.animationDelay = `${(i < breakAt ? base + i * 0.1 : base + gap + (i - breakAt) * 0.1).toFixed(2)}s`;
  });
  const comma = (spans) => Math.max(1, spans.findIndex((s) => /[,、]/.test(s.textContent)) + 1);
  const pc = [...document.querySelectorAll(".np-v-copy span")];
  stagger(pc, 0.5, 1, comma(pc));
  const sp1 = [...document.querySelectorAll(".np-v-copy-sp .copy-1 span")], sp2 = [...document.querySelectorAll(".np-v-copy-sp .copy-2 span")];
  stagger(sp1, 0.5, 0, sp1.length);
  stagger(sp2, 1.5, 0, sp2.length);
  const cc = [...document.querySelectorAll(".np-concept-copy span")];
  stagger(cc, 0, 1, comma(cc));

  if (!window.Splide) return;
  const hero = new Splide(".np-v-splide", {
    autoplay: true, type: "loop", pauseOnHover: false, pauseOnFocus: false, interval: 5400, speed: 2400,
    arrows: false, pagination: false, padding: "28%", gap: "20%", autoHeight: true,
    reducedMotion: { autoplay: true, speed: 1400, interval: 5400 },
    breakpoints: { 768: { padding: "16px", gap: "16px" } },
  });
  hero.on("mounted", () => hero.Components.Autoplay?.pause());
  hero.mount();
  const go = () => hero.Components.Autoplay?.play();
  if (document.readyState === "complete") go(); else addEventListener("load", go);

  const caseS = new Splide(".np-case-splide", {
    autoplay: true, type: "loop", pauseOnHover: false, pauseOnFocus: false, interval: 8400, speed: 3400,
    arrows: false, pagination: false, gap: "20%", autoHeight: true,
    reducedMotion: { autoplay: true, interval: 6400, speed: 2700 },
    breakpoints: { 768: { gap: "2%" } },
  }).mount();
  const thumbs = [...document.querySelectorAll(".np-case-tn li")];
  const markThumb = (i) => thumbs.forEach((t, n) => t.classList.toggle("active", n === i));
  thumbs.forEach((t, i) => t.addEventListener("click", (e) => { e.preventDefault(); caseS.go(i); markThumb(i); }));
  caseS.on("move", (i) => markThumb(i));
  markThumb(0);

  const flow = new Splide(".np-flow-splide", {
    autoplay: false, focus: 0, pauseOnHover: false, pauseOnFocus: false, interval: 3000, speed: 2400,
    arrows: false, pagination: false, gap: "30px", trimSpace: false, autoHeight: false,
    reducedMotion: { autoplay: false, speed: 1400, interval: 3900 },
    breakpoints: { 768: { perPage: 1, gap: "20px" } },
  });
  const steps = [...document.querySelectorAll(".np-flow-step-box")];
  const markStep = (i) => steps.forEach((s, n) => s.classList.toggle("active", n === i));
  steps.forEach((s, i) => s.addEventListener("click", (e) => { e.preventDefault(); flow.go(i); markStep(i); }));
  flow.on("move", (i) => markStep(i));
  // Match card height to the tallest one
  const level = () => {
    const slides = [...document.querySelectorAll(".np-flow-splide .splide__slide")];
    slides.forEach((s) => (s.style.height = "auto"));
    const h = Math.max(...slides.map((s) => s.offsetHeight));
    slides.forEach((s) => (s.style.height = `${h}px`));
    const track = document.querySelector(".np-flow-splide .splide__track");
    if (track) track.style.height = `${h}px`;
  };
  flow.on("mounted updated moved", level);
  flow.mount();
  markStep(0);

  // Option tooltip — on wide screens it shows on hover, on phones by tapping the question mark
  const tips = [...document.querySelectorAll(".np-tip")];
  let mode = null, off = [];
  const setupTips = () => {
    const sp = matchMedia("(max-width: 767px)").matches;
    if (mode === sp) return;
    mode = sp;
    off.forEach((f) => f()); off = [];
    tips.forEach((w) => {
      const c = w.querySelector(".np-tip-c"), ic = w.querySelector(".np-tip-ic"), x = w.querySelector(".np-tip-close");
      const add = (el, ev, fn) => { el.addEventListener(ev, fn); off.push(() => el.removeEventListener(ev, fn)); };
      if (sp) {
        add(ic, "click", (e) => { e.stopPropagation(); document.querySelectorAll(".np-tip-c.open").forEach((o) => o !== c && o.classList.remove("open")); c.classList.toggle("open"); });
        add(x, "click", (e) => { e.stopPropagation(); c.classList.remove("open"); });
        add(c, "click", (e) => e.stopPropagation());
      } else {
        add(w, "mouseenter", () => c.classList.add("open"));
        add(w, "mouseleave", () => c.classList.remove("open"));
      }
    });
  };
  setupTips();
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(setupTips, 150); });
  if (reduced) document.querySelectorAll(".np-v-mask").forEach((m) => m.remove());
})();
