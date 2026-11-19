// Work list — 3D tornado cards: card i stands at a spiral spot (cylinder radius 42em) at angle i×32° and height i×(card height .4), and the progress value advances .00325 each frame so the cards rise upward.
// Wheel · drag add to the speed (up to ±.2) and each frame .1 returns it to the base speed. Cards turned to the back are .25 darker and .5em blurred, and shrink and vanish within the .5× card-height range at the top and bottom ends of the plate
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-tornado]").forEach((box) => {
    const list = box.querySelector("[data-tornado-list]");
    const originals = Array.from(list.querySelectorAll("[data-tornado-item]"));
    if (!originals.length) return;
    const ANGLE = 32, GAP = 0.4, EDGE_OFF = 2, DEPTH = 42, AUTO = 0.00325, WHEEL = 0.015, DRAG = 5, CATCH = 0.1, MAX = 0.2, EDGE = 0.5, DARK = 0.25, BLUR = 0.5;
    const edgeEase = gsap.parseEase("power2.inOut");
    const st = { amount: 0, progress: 0, v: AUTO, dir: 1, h: 0, gap: 0, em: 16, on: false, cards: [] };
    const amountFor = () => {
      const need = box.offsetHeight * 0.5 + st.h * EDGE_OFF + st.h * EDGE;
      const per = Math.ceil(need / st.gap) + 1;
      return originals.length * Math.ceil((per * 2 + 1) / originals.length);
    };
    const build = () => {
      list.innerHTML = "";
      const m = originals[0].cloneNode(true);
      list.appendChild(m);
      st.h = m.offsetHeight; st.gap = st.h * GAP; st.em = parseFloat(getComputedStyle(m).fontSize);
      st.amount = amountFor();
      list.innerHTML = "";
      for (let i = 0; i < st.amount; i++) { const c = originals[i % originals.length].cloneNode(true); c.dataset.index = i; list.appendChild(c); }
      st.cards = Array.from(list.children);
    };
    const edgeScale = (y) => {
      const start = box.offsetHeight * 0.5 + st.h * EDGE_OFF;
      return edgeEase(gsap.utils.clamp(0, 1, (start - Math.abs(y)) / (st.h * EDGE)));
    };
    const render = () => {
      const r = DEPTH * st.em;
      st.cards.forEach((card) => {
        const loop = ((+card.dataset.index + st.progress) % st.amount + st.amount) % st.amount;
        const i = loop > st.amount * 0.5 ? loop - st.amount : loop;
        const a = (i * ANGLE * Math.PI) / 180, y = i * st.gap;
        const back = gsap.utils.clamp(0, 1, (1 - Math.cos(a)) * 0.5);
        const center = 1 - Math.min(Math.abs(i) / (st.amount * 0.5), 1);
        gsap.set(card, {
          xPercent: -50, yPercent: -50, x: Math.sin(a) * r, y, z: (Math.cos(a) - 1) * r, rotateY: i * ANGLE,
          scale: edgeScale(y), filter: `brightness(${1 - back * DARK}) blur(${back * BLUR}em)`, autoAlpha: 1, zIndex: Math.round(center * 1000),
        });
      });
    };
    const tick = () => {
      if (!st.on) return;
      st.v = gsap.utils.interpolate(st.v, AUTO * st.dir, CATCH);
      st.progress += st.v;
      render();
    };
    build(); render();
    if (reduce) return;
    let obs = null;
    const setOn = (on) => { st.on = on; if (obs) on ? obs.enable() : obs.disable(); };
    ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onToggle: (self) => setOn(self.isActive) });
    setOn(ScrollTrigger.isInViewport(box));
    gsap.ticker.add(tick);
    let rT;
    addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { build(); render(); }, 150); });
    gsap.matchMedia().add("(min-width: 992px)", () => {
      obs = Observer.create({
        target: window, type: "wheel,touch,pointer", preventDefault: false, lockAxis: true,
        onChange: (self) => {
          if (!st.on) return;
          const d = self.event.type === "wheel" ? self.deltaY : Math.abs(self.deltaX) > Math.abs(self.deltaY) ? self.deltaX * DRAG : self.deltaY * DRAG;
          if (!d) return;
          st.dir = d > 0 ? 1 : -1;
          st.v = gsap.utils.clamp(-MAX, MAX, st.v + (d * WHEEL) / 100);
        },
        onPress: () => (box.style.cursor = "grabbing"),
        onRelease: () => (box.style.cursor = "grab"),
      });
      if (!st.on) obs.disable();
      return () => { obs.kill(); obs = null; box.style.cursor = ""; st.dir = 1; };
    });
  });
})();
