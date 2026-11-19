// Hero page — KV scene swap, rotating circular text, feature video placeholder art, number art drawing, price tag set up instantly
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // KV: each time chapter-bars changes scene, the photo card tilt, chips and orange swirl take that scene’s form
  const kv = document.querySelector(".py-kv");
  if (kv) {
    const scenes = [...kv.querySelectorAll(".py-kv__scene")];
    kv.dataset.scene = "0";
    kv.addEventListener("fx:chapter", (e) => {
      const i = e.detail.index % scenes.length;
      kv.dataset.scene = String(i);
      scenes.forEach((s, n) => s.classList.toggle("is-on", n === i));
    });
  }

  // Feature video slot — a looping SVG scene in the same place as the original mp4 (autoplay·loop)
  const art = {
    bill: '<svg viewBox="0 0 400 340"><path class="py-sv-white py-sv-a" d="M-20 130c80-40 160 40 240 0s160-30 200 0v40c-60-30-120 20-200 10s-160-60-240-10z"/><path class="py-sv-light py-sv-b" d="M-20 180c80-40 160 40 240 0s160-30 200 0v36c-60-30-120 20-200 10s-160-60-240-10z"/><path class="py-sv-warm py-sv-c" d="M-20 226c80-40 160 40 240 0s160-30 200 0v34c-60-30-120 20-200 10s-160-60-240-10z"/></svg>',
    pay: '<svg viewBox="0 0 400 340"><ellipse class="py-sv-white py-sv-bob1" cx="200" cy="90" rx="74" ry="34"/><ellipse class="py-sv-deep py-sv-bob2" cx="200" cy="170" rx="78" ry="40"/><ellipse class="py-sv-warm py-sv-bob3" cx="200" cy="252" rx="74" ry="36"/></svg>',
    photo: '<svg viewBox="0 0 400 340"><g class="py-sv-pop"><rect class="py-sv-white" x="236" y="70" width="96" height="40" rx="12"/><circle class="py-sv-ink" cx="256" cy="90" r="9"/><rect class="py-sv-light" x="272" y="84" width="46" height="12" rx="6"/></g></svg>',
    link: '<svg viewBox="0 0 400 340"><rect class="py-sv-white" x="60" y="146" width="48" height="48" rx="12"/><rect class="py-sv-light py-sv-row" x="150" y="76" width="120" height="22" rx="8"/><rect class="py-sv-white py-sv-row" style="animation-delay:-.6s" x="178" y="112" width="150" height="22" rx="8"/><rect class="py-sv-warm py-sv-row" style="animation-delay:-1.2s" x="140" y="148" width="130" height="22" rx="8"/><rect class="py-sv-deep py-sv-row" style="animation-delay:-1.8s" x="190" y="184" width="120" height="22" rx="8"/><rect class="py-sv-light py-sv-row" style="animation-delay:-2.4s" x="160" y="220" width="150" height="22" rx="8"/></svg>',
    chart: '<svg viewBox="0 0 400 340"><rect class="py-sv-white" x="70" y="70" width="260" height="200" rx="18"/><rect class="py-sv-light py-sv-grow" x="110" y="170" width="34" height="70" rx="6"/><rect class="py-sv-ink py-sv-grow" style="animation-delay:-.4s" x="164" y="140" width="34" height="100" rx="6"/><rect class="py-sv-warm py-sv-grow" style="animation-delay:-.8s" x="218" y="110" width="34" height="130" rx="6"/><rect class="py-sv-deep py-sv-grow" style="animation-delay:-1.2s" x="272" y="90" width="34" height="150" rx="6"/></svg>',
  };
  document.querySelectorAll("[data-py-scene]").forEach((v) => {
    const svg = art[v.dataset.pyScene];
    if (svg) v.insertAdjacentHTML("beforeend", svg);
    v.setAttribute("role", "img");
    v.setAttribute("aria-label", "Feature explainer video slot — autoplay, loop, landscape 558:476");
  });

  // Once on entering the screen — draws the number graphic and snaps the price tag upright from 3.06° (Framer onInView)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.3 });
  document.querySelectorAll("[data-py-draw], [data-py-pop]").forEach((el) => (reduce ? el.classList.add("is-in") : io.observe(el)));

  // Circular text band — one turn per 50s (no curve) plus an extra −240° while passing the section (Framer onScroll)
  const ring = document.querySelector("[data-py-ring] svg");
  if (ring && typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      const state = { loop: 0, scroll: 0 };
      const draw = () => gsap.set(ring, { rotation: state.loop + state.scroll, transformOrigin: "50% 50%" });
      const spin = gsap.to(state, { loop: -360, duration: 50, ease: "none", repeat: -1, onUpdate: draw });
      const st = ScrollTrigger.create({ trigger: ".py-about", start: "top bottom", end: "bottom top", onUpdate: (s) => { state.scroll = -240 * s.progress; draw(); } });
      return () => { spin.kill(); st.kill(); gsap.set(ring, { clearProps: "transform" }); };
    });
  }
})();
