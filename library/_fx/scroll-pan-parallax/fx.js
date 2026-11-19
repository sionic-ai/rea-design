(() => {
  // Push a wide picture strip horizontally with one vertical scroll: board height = Band width / ratio, call quickTo again every frame
  // As in the original, it always follows toward the start of the curve (so the 0.6s curve becomes a soft drag approaching about 5.5% per frame).
  kfFx.register("scroll-pan-parallax", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]'), strip = el.querySelector('[data-fx-part="strip"]');
    if (!stage || !strip) return;
    const ratio = +options.ratio || .6;
    const dur = +(options.dur ?? .6);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "cubic.out");
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const fit = () => { el.style.height = Math.max(strip.scrollWidth / ratio, stage.clientHeight) + "px"; };
    const ro = new ResizeObserver(fit);
    ro.observe(strip); ro.observe(stage);
    fit();
    const qx = reduce || dur === 0 ? (v) => gsap.set(strip, { x: v }) : gsap.quickTo(strip, "x", { duration: dur, ease });
    const tick = () => {
      const vh = scroller ? scroller.clientHeight : innerHeight;
      const top = el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      const span = el.offsetHeight - vh;
      const l = span > 0 ? Math.min(1, Math.max(0, -top / span)) : 0;
      qx(-(strip.scrollWidth - stage.clientWidth) * l);
      for (const ly of layers) ly.style.transform = `translateX(${l * (+ly.dataset.par || 0)}px)`;
      el.style.setProperty("--fx-progress", l.toFixed(4));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      gsap.killTweensOf(strip);
      gsap.set(strip, { clearProps: "transform" });
      layers.forEach((ly) => { ly.style.transform = ""; });
      el.style.height = "";
      el.style.removeProperty("--fx-progress");
    };
  });
})();
