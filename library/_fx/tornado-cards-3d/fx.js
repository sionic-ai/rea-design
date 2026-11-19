(() => {
  // Cards stand on a cylindrical spiral (32° per angle · height card height × .4 · radius 42em) and the progress value is fed in every frame so they climb upward.
  // Wheel and drag (desktop) add to speed (±max) and each frame returns .1 toward the base speed. Cards turned away are dark and blurred, and shrink and vanish at the plate’s top and bottom ends
  kfFx.register("tornado-cards-3d", (el, { options, reduce, hover, scroller }) => {
    const list = el.querySelector('[data-fx-part="list"]');
    if (!list) return;
    const originals = [...list.children].filter((c) => c.getAttribute("data-fx-part") === "card");
    if (!originals.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const ANGLE = +(options.angle ?? 32), GAP = +(options.gap ?? 0.4), DEPTH = +(options.depth ?? 42);
    const AUTO = +(options.speed ?? 0.00325), WHEEL = +(options.wheel ?? 0.015), DRAG = +(options.drag ?? 5), CATCH = +(options.catch ?? 0.1), MAX = +(options.max ?? 0.2);
    const DARK = +(options.dark ?? 0.25), BLUR = +(options.blur ?? 0.5), EDGE_OFF = 2, EDGE = 0.5;
    const edgeEase = gsap.parseEase("power2.inOut");
    const st = { amount: 0, progress: 0, v: AUTO, dir: 1, h: 0, gap: 0, em: 16, on: false, cards: [] };
    const build = () => {
      list.replaceChildren(originals[0].cloneNode(true));
      const m = list.firstElementChild;
      st.h = m.offsetHeight || 1; st.gap = st.h * GAP; st.em = parseFloat(getComputedStyle(m).fontSize) || 16;
      const need = el.offsetHeight * 0.5 + st.h * EDGE_OFF + st.h * EDGE;
      const per = Math.ceil(need / st.gap) + 1;
      st.amount = originals.length * Math.ceil((per * 2 + 1) / originals.length);
      const frag = document.createDocumentFragment();
      for (let i = 0; i < st.amount; i++) { const c = originals[i % originals.length].cloneNode(true); c.dataset.index = String(i); frag.appendChild(c); }
      list.replaceChildren(frag);
      st.cards = [...list.children];
    };
    const render = () => {
      const r = DEPTH * st.em, half = el.offsetHeight * 0.5 + st.h * EDGE_OFF;
      st.cards.forEach((card) => {
        const loop = (((+card.dataset.index + st.progress) % st.amount) + st.amount) % st.amount;
        const i = loop > st.amount * 0.5 ? loop - st.amount : loop;
        const a = (i * ANGLE * Math.PI) / 180, y = i * st.gap;
        const back = gsap.utils.clamp(0, 1, (1 - Math.cos(a)) * 0.5);
        const center = 1 - Math.min(Math.abs(i) / (st.amount * 0.5), 1);
        gsap.set(card, {
          xPercent: -50, yPercent: -50, x: Math.sin(a) * r, y, z: (Math.cos(a) - 1) * r, rotateY: i * ANGLE,
          scale: edgeEase(gsap.utils.clamp(0, 1, (half - Math.abs(y)) / (st.h * EDGE))),
          filter: `brightness(${1 - back * DARK}) blur(${back * BLUR}em)`, autoAlpha: 1, zIndex: Math.round(center * 1000),
        });
      });
    };
    build(); render();
    const restore = () => list.replaceChildren(...originals);
    if (reduce) return restore;
    const tick = () => {
      if (!st.on) return;
      st.v = gsap.utils.interpolate(st.v, AUTO * st.dir, CATCH);
      st.progress += st.v;
      render();
    };
    const onInput = (dy, dx, wheel) => {
      if (!st.on) return;
      const d = wheel ? dy : Math.abs(dx) > Math.abs(dy) ? dx * DRAG : dy * DRAG;
      if (!d) return;
      st.dir = d > 0 ? 1 : -1;
      st.v = gsap.utils.clamp(-MAX, MAX, st.v + (d * WHEEL) / 100);
    };
    const onWheel = (e) => onInput(e.deltaY, e.deltaX, true);
    let px = 0, py = 0, down = false;
    const onDown = (e) => { down = true; px = e.clientX; py = e.clientY; el.style.cursor = "grabbing"; };
    const onMove = (e) => { if (!down) return; onInput(py - e.clientY, px - e.clientX, false); px = e.clientX; py = e.clientY; };
    const onUp = () => { down = false; el.style.cursor = ""; };
    // The wheel is taken from the whole window (original) — hand response only on devices with a mouse, never hijacking phone scroll
    if (hover) {
      addEventListener("wheel", onWheel, { passive: true });
      el.addEventListener("pointerdown", onDown);
      addEventListener("pointermove", onMove);
      addEventListener("pointerup", onUp);
    }
    const trig = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top", onToggle: (self) => (st.on = self.isActive) });
    st.on = ScrollTrigger.isInViewport(el);
    gsap.ticker.add(tick);
    const ro = new ResizeObserver(() => { build(); render(); });
    ro.observe(el);
    return () => {
      gsap.ticker.remove(tick);
      trig.kill();
      ro.disconnect();
      removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      restore();
    };
  });
})();
