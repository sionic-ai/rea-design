/* Business guide — draws one big town picture with pixi, and each screen of scroll zooms to the next business spot (.9s power4.out) */
(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => matchMedia("(max-width: 767px)").matches;
  const DESIGN = { width: 2780, height: 1980 };
  const BASE = { pc: { scale: 0.55, x: 0.5, y: 0.5, ofstX: 0.5, ofstY: 0.5 }, sp: { scale: 0.35, x: 0.5, y: 0.4, ofstX: 0.5, ofstY: 0.5 } };
  const FOCUS = [[1.2, 0.7, 0.6], [1, 0.43, 0.6], [1, 0.4, 0.8], [1, 0.37, 0.25], [1, 0.04, 0.75], [1, 0.55, 0.2], [1, 0.58, 0.4], [1, 0.2, 0.5]]
    .map(([scale, x, y]) => ({ pc: { scale, x, y, ofstX: 0.38, ofstY: 0.5 }, sp: { scale: 0.7, x: Math.min(0.85, x + 0.1), y: y - 0.1, ofstX: 0.38, ofstY: 0.5 } }));
  const STEPS = 11;
  const wrap = $(".sv-canvas"), track = $(".sv-track"), nav = $(".sv-nav");
  const panels = $$("[data-step]");
  const focusOf = (step) => (step >= 2 && step <= 9 ? FOCUS[step - 2] : BASE)[sp() ? "sp" : "pc"];

  // Drawing: the town is drawn in a hidden svg and baked into one image with computed colors
  const src = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  src.setAttribute("class", "sv-src");
  wrap.append(src);
  miIso.town(src, { cols: 24, rows: 24, tw: 116, seed: 23, people: 22 });

  const view = { ...BASE.pc };
  let app = null, sprite = null;
  const apply = () => {
    if (!sprite) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    sprite.anchor.set(view.x, view.y);
    sprite.width = DESIGN.width * view.scale;
    sprite.height = DESIGN.height * view.scale;
    sprite.position.set(w * view.ofstX, h * view.ofstY);
    app.render();
  };
  // On entry: once the font and map image are ready, lift the cover and raise the text lines in turn
  const reveal = () => {
    $(".sv-cover")?.classList.add("is-hide");
    $$(".sv-step").forEach((el, i) => setTimeout(() => el.classList.add("is-in"), reduce ? 0 : 300 + i * 200));
  };
  (async () => {
    if (!window.PIXI) { reveal(); return; }
    const img = await miIso.toImage(src, DESIGN.width, DESIGN.height);
    app = new PIXI.Application();
    await app.init({ resizeTo: wrap, backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(2, devicePixelRatio || 1), autoStart: false });
    wrap.append(app.canvas);
    sprite = new PIXI.Sprite(PIXI.Texture.from(img));
    app.stage.addChild(sprite);
    Object.assign(view, focusOf(current));
    apply();
    if (document.fonts) await document.fonts.ready.catch(() => {});
    reveal();
    new ResizeObserver(() => { app.renderer.resize(wrap.clientWidth, wrap.clientHeight); apply(); }).observe(wrap);
  })();

  let current = 0;
  const showPanel = (step, prev) => {
    const out = panels.filter((p) => +p.dataset.step === prev);
    const inn = panels.filter((p) => +p.dataset.step === step);
    out.forEach((p) => gsap.to(p, { autoAlpha: 0, y: -80, duration: 0.35, ease: "power2.in", overwrite: true }));
    inn.forEach((p) => {
      gsap.set(p, { autoAlpha: 1, y: 0 });
      gsap.fromTo(p.children, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: step >= 2 ? 0.9 * 0.3 : 0, overwrite: true });
    });
    nav.classList.toggle("is-show", step >= 2 && step <= 9);
    $$("button", nav).forEach((b) => b.classList.toggle("is-on", +b.dataset.go === step));
  };
  const goStep = (step) => {
    if (step === current) return;
    const prev = current;
    current = step;
    const bridge = prev <= 1 && step === 2;
    gsap.to(view, { ...focusOf(step), duration: 0.9, ease: bridge ? "power2.inOut" : "power4.out", overwrite: true, onUpdate: apply });
    showPanel(step, prev);
  };

  if (reduce) { panels.forEach((p) => gsap.set(p, { autoAlpha: 1 })); return; }
  panels.forEach((p) => gsap.set(p, { autoAlpha: +p.dataset.step === 0 ? 1 : 0 }));
  ScrollTrigger.create({
    trigger: track, start: "top top", end: "bottom bottom",
    onUpdate: (st) => goStep(Math.min(9, Math.floor(st.progress * (STEPS - 0.001)))),
  });
  $$("button", nav).forEach((b) => b.addEventListener("click", () => {
    const y = track.getBoundingClientRect().top + scrollY + (+b.dataset.go + 0.5) * innerHeight;
    window.miLenis ? window.miLenis.scrollTo(y) : scrollTo({ top: y, behavior: "smooth" });
  }));
})();
