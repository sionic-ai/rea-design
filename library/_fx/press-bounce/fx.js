(() => {
  kfFx.register("press-bounce", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const beat = 60 / (+options.bpm || 142), release = kfFx.ease("0.1,0.6,0.3,0.9", "power2.out");
      el.addEventListener("click", () => {
        if (!reduce) gsap.fromTo(el, { scale: 0.95 }, { scale: 1, duration: beat, ease: release, overwrite: true });
        if (!(options.group === "true")) return;
        el.parentElement.querySelectorAll(':scope > [data-fx~="press-bounce"]').forEach((x) => { x.toggleAttribute("data-on", x === el); x.setAttribute("aria-pressed", String(x === el)); });
      }, { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
