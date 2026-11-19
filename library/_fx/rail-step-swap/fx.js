// While the stage is pinned to the screen inside a long section, the step text, image layer and rail link for the slot (floor(progress × count), progress divided into slots) switch together.
// At the swap, the previous text and layer vanish in dur, the new text rises from rise px below and the new layer fades in overlapping — only cell picking is tied to scroll. Clicking a rail link rolls to that cell
(() => {
  kfFx.register("rail-step-swap", (el, { options, reduce, scroller }) => {
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!steps.length) return;
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const links = [...el.querySelectorAll('[data-fx-part="link"]')];
    const n = steps.length;
    el.style.setProperty("--fx-n", n);
    const dur = reduce ? 0 : +(options.dur ?? 0.4);
    const rise = +(options.rise ?? 20);
    const ease = kfFx.ease(options.ease || "0.22,0.61,0.36,1", "power2.out");
    const keyOf = (l, k) => (l.dataset.key != null ? +l.dataset.key : k % n);
    const layersOf = (i) => layers.filter((l, k) => keyOf(l, k) === i);
    let cur = -1;
    const show = (i, now) => {
      if (i === cur) return;
      const d = now ? 0 : dur;
      if (cur >= 0) {
        const out = [steps[cur], ...layersOf(cur)];
        gsap.to(out, { autoAlpha: 0, duration: d, ease, overwrite: true });
      }
      gsap.fromTo(steps[i], { autoAlpha: 0, y: rise }, { autoAlpha: 1, y: 0, duration: d, ease, overwrite: true });
      const inn = layersOf(i);
      if (inn.length) gsap.to(inn, { autoAlpha: 1, duration: d, ease, overwrite: true });
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      layers.forEach((l, k) => l.classList.toggle("is-active", keyOf(l, k) === i));
      links.forEach((l, k) => l.classList.toggle("is-active", k === i));
      cur = i;
    };
    gsap.set([...steps, ...layers], { autoAlpha: 0 });
    show(0, true);
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (self) => show(Math.min(n - 1, Math.floor(self.progress * n))),
    });
    const go = (e) => {
      const k = links.indexOf(e.currentTarget);
      if (k < 0) return;
      e.preventDefault();
      const top = st.start + ((st.end - st.start) / n) * k + 2;
      (scroller || window).scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    };
    links.forEach((l) => l.addEventListener("click", go));
    return () => {
      st.kill();
      links.forEach((l) => { l.removeEventListener("click", go); l.classList.remove("is-active"); });
      gsap.set([...steps, ...layers], { clearProps: "opacity,visibility,transform" });
      [...steps, ...layers].forEach((x) => x.classList.remove("is-active"));
      el.style.removeProperty("--fx-n");
    };
  });
})();
