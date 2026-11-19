(() => {
  kfFx.register("faq-accordion", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const beat = 60 / (+options.bpm || 142), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const items = [...el.querySelectorAll("[data-fx-part=item]")], tags = [...el.querySelectorAll("[data-fx-part=tag]")];
      const open = (item) => items.forEach((it) => {
        const on = it === item;
        it.toggleAttribute("data-open", on);
        it.querySelector("[data-fx-part=question]")?.setAttribute("aria-expanded", String(on));
        const panel = it.querySelector("[data-fx-part=answer]");
        if (panel) panel.inert = !on;
        if (on && !reduce) gsap.fromTo(panel.querySelectorAll("p"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: beat, delay: beat * 0.25, ease: out });
      });
      open(items.find((it) => it.hasAttribute("data-open")) || null);
      items.forEach((it) => it.querySelector("[data-fx-part=question]")?.addEventListener("click", () => open(it.hasAttribute("data-open") ? null : it), { signal }));
      tags.forEach((b) => b.addEventListener("click", () => {
        const tag = b.dataset.tag;
        tags.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        open(null);
        const shown = items.filter((it) => { const on = tag === "all" || it.dataset.tag === tag; it.hidden = !on; return on; });
        if (!reduce) gsap.fromTo(shown, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: beat, ease: out, stagger: beat / 4, clearProps: "transform,opacity,visibility" });
      }, { signal }));
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
