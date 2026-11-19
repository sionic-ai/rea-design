/* Off-field — values read from the original off-field bundle */
(() => {
  const JJ = window.JJ, reduce = JJ.reduce;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (window.Draggable) gsap.registerPlugin(...[window.Draggable, window.InertiaPlugin].filter(Boolean));

  // ── Header entrance: delayed .15s, card y48·−2.5° → 0·2.5° 1.2s (.25), line 0→1 1.1s power2.inOut (.45), text y26 .9s with .1 stagger (.6) ──
  const sig = JJ.signature($("[data-signature]"));
  if (reduce) {
    gsap.set("[data-off-card], [data-off-meta]", { autoAlpha: 1, y: 0 });
    gsap.set("[data-off-card]", { rotate: 2.5 });
    gsap.set("[data-off-rule]", { scaleX: 1 });
    sig?.goToAndStop(152, true);
  } else {
    gsap.set("[data-off-card], [data-off-meta]", { autoAlpha: 0 });
    gsap.set("[data-off-rule]", { scaleX: 0 });
    const tl = gsap.timeline({ paused: true, delay: 0.15, defaults: { ease: "power3.out" } });
    tl.fromTo("[data-off-card]", { autoAlpha: 0, y: 48, rotate: -2.5 }, { autoAlpha: 1, y: 0, rotate: 2.5, duration: 1.2 }, 0.25)
      .fromTo("[data-off-rule]", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.45)
      .fromTo("[data-off-meta]", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.6)
      .call(() => sig?.play(), null, 0.8);
    JJ.onLift(() => tl.play());
    // Polaroids can be dragged by hand (original Draggable, inertia on release)
    if (window.Draggable && JJ.fine) Draggable.create("[data-off-card]", { type: "x,y", inertia: !!window.InertiaPlugin, cursor: "grab", activeCursor: "grabbing", zIndexBoost: false });
  }

  // ── Sentence: each word fills in with scroll — the last four words use the accent color ──
  const say = $("[data-say]"), words = say.textContent.trim().split(/\s+/);
  say.innerHTML = words.map((w, i) => `<span class="w${i >= words.length - 4 ? " is-hi" : ""}">${w}</span>`).join(" ");
  const ws = $$(".w", say);
  if (reduce) ws.forEach((w) => w.classList.add("is-on"));
  else ScrollTrigger.create({ trigger: ".ow-say", start: "top 60%", end: "bottom 80%", scrub: true, onUpdate: (s) => ws.forEach((w, i) => w.classList.toggle("is-on", i < s.progress * ws.length)) });

  // ── Section shortcuts: current section lights up, press to go to that section ──
  const tabs = $$("[data-tabs] a");
  tabs.forEach((a) => {
    const sec = document.getElementById(a.getAttribute("href").slice(1));
    ScrollTrigger.create({ trigger: sec, start: "top 45%", end: "bottom 45%", onToggle: (s) => s.isActive && tabs.forEach((t) => t.classList.toggle("is-on", t === a)) });
    a.addEventListener("click", (e) => { e.preventDefault(); JJ.lenis ? JJ.lenis.scrollTo(sec, { duration: 1.1 }) : sec.scrollIntoView({ behavior: "smooth" }); });
  });

  // Cell entrance: visible cells from the left at 18px, .7s power3.out · .07s stagger
  if (!reduce) {
    const cards = $$("[data-grid-card]");
    gsap.set(cards, { opacity: 0, y: 18 });
    const io = new IntersectionObserver((es) => {
      const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left).map((e) => e.target);
      if (!vis.length) return;
      vis.forEach((el) => io.unobserve(el));
      gsap.to(vis, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, clearProps: "opacity,transform", overwrite: "auto" });
    }, { rootMargin: "0px 0px -6% 0px" });
    cards.forEach((c) => io.observe(c));
  }

  // ── Digital row: drag to flip through (wide screens) ──
  const row = $("[data-drag-row]");
  if (window.Draggable && JJ.fine && !reduce && row) {
    const bounds = () => ({ minX: Math.min(0, row.parentElement.clientWidth - row.scrollWidth - 0.088 * innerWidth), maxX: 0 });
    Draggable.create(row, { type: "x", inertia: !!window.InertiaPlugin, bounds: bounds(), edgeResistance: 0.85, cursor: "grab", activeCursor: "grabbing", onPress() { this.applyBounds(bounds()); } });
  }
  // Each cell moves up and down in proportion to the cursor’s horizontal position by 46·−38·52·−40·44px — quickTo .7s power3.out, at 1024px and above (original digital section).
  // The intro tween uses transform, so layer it with a separately running translate
  if (row && !reduce && matchMedia("(min-width: 1024px)").matches) {
    const V = [46, -38, 52, -40, 44];
    const qs = [...row.children].map((el) => { const p = { y: 0 }; return gsap.quickTo(p, "y", { duration: 0.7, ease: "power3.out", onUpdate: () => (el.style.translate = `0 ${p.y.toFixed(2)}px`) }); });
    addEventListener("mousemove", (e) => { const t = (e.clientX / innerWidth) * 2 - 1; qs.forEach((q, i) => q(t * V[i % V.length])); });
  }

  // ── Feature: choosing from the list brings the video in from 22px · blur 8px over .8s power3.out, and the right-hand text over .65s · .07 stagger ──
  const items = $$("[data-feat-list] button"), vids = $$(".ow-feat__v"), desc = $("[data-feat-desc]");
  let cur = 0;
  items.forEach((b, i) => b.addEventListener("click", () => {
    if (i === cur) return;
    const dir = i > cur ? 22 : -22, prev = cur;
    cur = i;
    items.forEach((x, k) => x.classList.toggle("is-on", k === i));
    vids.forEach((v, k) => k !== i && k !== prev && v.classList.remove("is-on"));
    vids[i].classList.add("is-on");
    if (reduce) { vids[prev].classList.remove("is-on"); return; }
    gsap.fromTo(vids[i], { opacity: 0, y: dir, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", clearProps: "filter,transform", overwrite: "auto" });
    gsap.to(vids[prev], { opacity: 0, duration: 0.6, ease: "power2.out", overwrite: "auto", onComplete: () => cur !== prev && vids[prev].classList.remove("is-on") });
    gsap.fromTo(desc.children, { opacity: 0, y: dir, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, ease: "power3.out", stagger: 0.07, clearProps: "filter,transform", overwrite: "auto" });
  }));
})();
