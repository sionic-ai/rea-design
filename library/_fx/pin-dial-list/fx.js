(() => {
  kfFx.register("pin-dial-list", (el, { options, reduce, scroller }) => {
    const win = el.querySelector('[data-fx-part="window"]'), list = el.querySelector('[data-fx-part="list"]');
    const items = list ? [...list.querySelectorAll('[data-fx-part="item"]')] : [];
    if (!win || !list || items.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    // Panels with the same parent form one group — even if a background photo group and a description group are separate, they change in the same order
    const groups = new Map();
    for (const p of el.querySelectorAll('[data-fx-part="pane"]')) {
      if (!groups.has(p.parentElement)) groups.set(p.parentElement, []);
      groups.get(p.parentElement).push(p);
    }
    const step = +options.step || 300, scrub = +(options.scrub ?? 0.1), fade = +(options.fade ?? 0.4);
    const levels = (options.levels || "1,.5,.25,.1,.05").split(",").map(Number);
    let current = -1;
    const show = (i, instant) => {
      if (i === current) return;
      current = i;
      items.forEach((it, k) => it.classList.toggle("is-active", k === i));
      groups.forEach((g) => g.forEach((p, k) => {
        p.classList.toggle("is-active", k === i);
        if (instant) gsap.set(p, { opacity: k === i ? 1 : 0, overwrite: true });
        else gsap.to(p, { opacity: k === i ? 1 : 0, duration: fade, overwrite: true });
      }));
    };
    show(0, true);
    if (reduce) return;
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+options.from || 992}px)`, () => {
      const n = items.length;
      const render = (progress) => {
        const h = items[0].offsetHeight, center = win.offsetHeight / 2, v = progress * (n - 1);
        gsap.set(list, { y: center - (v * h + h / 2) });
        items.forEach((it, k) => {
          const d = Math.abs(k - v);
          it.style.opacity = d < 0.5 ? levels[0] : d < 1.5 ? levels[1] : d < 2.5 ? levels[2] : d < 3.5 ? levels[3] : levels[4];
        });
        const c = Math.round(v);
        if (Math.abs(v - c) < 0.15) show(c);
      };
      render(0);
      const st = ScrollTrigger.create({
        scroller, trigger: el, start: "top top", end: () => "+=" + (n - 1) * step,
        pin: true, scrub, snap: options.snap === "false" ? undefined : 1 / (n - 1), invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress), onRefresh: (self) => render(self.progress),
      });
      return () => { st.kill(); items.forEach((it) => (it.style.opacity = "")); gsap.set(list, { clearProps: "transform" }); };
    });
    return () => {
      mm.revert();
      groups.forEach((g) => g.forEach((p) => { p.classList.remove("is-active"); gsap.set(p, { clearProps: "opacity" }); }));
      items.forEach((it) => it.classList.remove("is-active"));
    };
  });
})();
