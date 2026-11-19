// Round face icon cells all close into circles every few seconds, then open with a different face and a different panel color, and cells nearer the cursor grow larger
(() => {
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Face and board colors are shuffled and dealt in turn, reshuffled when used up — so the same face doesn’t cluster in neighboring cells
  const dealer = (n) => { let deck = []; return () => { if (!deck.length) deck = shuffle(Array.from({ length: n }, (_, i) => i)); return deck.shift(); }; };
  kfFx.register("icon-swap-grid", (el, { options, reduce, hover }) => {
    const slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    if (!slots.length) return;
    const pool = [...el.querySelectorAll('[data-fx-part="pool"] > *')];
    const every = +options.every || 5, close = +(options.close ?? 0.3);
    const reach = +options.reach || 400, grow = +(options.grow ?? 2.5);
    const tones = Math.max(1, Math.round(+options.tones || 3));
    const face = dealer(Math.max(1, pool.length)), tone = dealer(tones);
    el.style.setProperty("--fx-swap-close", `${close}s`);
    const deal = (s) => {
      s.dataset.tone = tone() + 1;
      if (pool.length) s.innerHTML = pool[face()].outerHTML;
    };
    slots.forEach(deal);
    let loop, wait, live = true;
    const swap = () => {
      slots.forEach((s) => s.classList.add("is-shut"));
      wait = gsap.delayedCall(close, () => slots.forEach((s) => { deal(s); s.classList.remove("is-shut"); }));
    };
    const start = () => { if (reduce || loop) return; loop = gsap.delayedCall(every, function tick() { swap(); loop = gsap.delayedCall(every, tick); }); };
    const stop = () => { loop && loop.kill(); wait && wait.kill(); loop = wait = null; slots.forEach((s) => s.classList.remove("is-shut")); };
    // When the panel is off screen, pause switching and cursor response
    const io = new IntersectionObserver(([e]) => { live = e.isIntersecting; live ? start() : stop(); });
    io.observe(el);
    const move = (ev) => {
      if (!live) return;
      slots.forEach((s) => {
        const b = s.getBoundingClientRect();
        const d = Math.hypot(ev.clientX - (b.left + b.width / 2), ev.clientY - (b.top + b.height / 2));
        s.style.transform = `scale(${1 + Math.max(0, (reach - d) / reach) * grow})`;
      });
    };
    const magnify = hover && !reduce && grow !== 0;
    if (magnify) addEventListener("mousemove", move);
    return () => {
      stop(); io.disconnect();
      if (magnify) removeEventListener("mousemove", move);
      slots.forEach((s) => { s.style.transform = ""; delete s.dataset.tone; });
      el.style.removeProperty("--fx-swap-close");
    };
  });
})();
