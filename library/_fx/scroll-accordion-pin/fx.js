// In the stuck section, as you scroll the current item folds and the next one unfolds — current item is-on, the paired photo swaps at 1.2→1
(() => {
  kfFx.register("scroll-accordion-pin", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const contents = items.map((it) => it.querySelector('[data-fx-part="content"]'));
    if (items.length < 2 || contents.some((c) => !c)) return;
    const medias = [...el.querySelectorAll('[data-fx-part="media"]')];
    const n = items.length;
    const top = +(options.top ?? 42), step = +(options.step ?? 0.5), settle = +(options.settle ?? 2.5);
    const wide = +(options.wide ?? 1024);
    let cur = -1;
    const mark = (i) => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => it.classList.toggle("is-on", k === i));
      const m = medias.find((x, k) => +(x.dataset.index ?? k) === i);
      medias.forEach((x) => x.classList.toggle("is-on", x === m));
      if (m && !reduce) gsap.fromTo(m, { scale: 1.2 }, { scale: 1, duration: settle, ease: "power2.out", overwrite: true });
    };
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${wide}px)`, () => {
      if (reduce) { gsap.set(contents, { height: "auto" }); mark(0); return; }
      let H = [];
      const measure = () => { gsap.set(contents, { height: "auto" }); H = contents.map((c) => c.getBoundingClientRect().height); };
      const set = (y) => {
        const v = Math.floor(y), w = y - v;
        contents.forEach((c, k) => {
          if (w === 0) gsap.set(c, { height: k === v ? "auto" : 0 });
          else if (k === v) gsap.set(c, { height: H[k] * (1 - w) });
          else if (k === v + 1) gsap.set(c, { height: H[k] * w });
          else gsap.set(c, { height: 0 });
        });
      };
      measure();
      set(0);
      mark(0);
      const st = ScrollTrigger.create({
        trigger: el, scroller, start: `top top+=${top}`, end: () => `+=${(n - 1) * innerHeight * step}`, pin: true, pinSpacing: true, scrub: 0,
        onRefreshInit: () => { measure(); },
        onRefresh: (self) => set(self.progress * (n - 1)),
        onUpdate(self) { const y = self.progress * (n - 1); mark(Math.min(Math.floor(y), n - 1)); set(y); },
      });
      return () => { st.kill(); gsap.set(contents, { clearProps: "height" }); };
    });
    mm.add(`(max-width: ${wide - 0.02}px)`, () => { gsap.set(contents, { height: "auto" }); mark(0); });
    return () => { mm.revert(); items.forEach((it) => it.classList.remove("is-on")); medias.forEach((x) => { x.classList.remove("is-on"); gsap.set(x, { clearProps: "scale" }); }); };
  });
})();
