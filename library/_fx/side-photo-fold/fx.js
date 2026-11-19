(() => {
  // Hero side vertical photo — on open the clip clears from the right edge to the left (2.8s power2.out) while the photo settles from 1.05 → 1 (7s),
  // On wide screens, scrolling folds the photo width down to 0 around the right edge (section top edge above screen → reference text center at screen center, scrub .7).
  // While folding, the photo stays attached to the bottom right at its original size so it looks cut off, and the right margin (pad) also goes to 0.
  kfFx.register("side-photo-fold", (el, { options, reduce }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    const fig = el.querySelector('[data-fx-part="figure"]') || media?.firstElementChild;
    if (!media || !fig) return;
    const anchor = el.querySelector('[data-fx-part="anchor"]') || el;
    const pic = fig.querySelector("img, video, [data-fx-part=photo]") || fig.firstElementChild;
    const dur = +(options.dur ?? 2.8), settle = +(options.settle ?? 7), pad = +(options.pad ?? 40), wide = options.wide || "(min-width: 1024px)";
    const st = { reveal: reduce || dur === 0 ? 0 : 1, fold: 0 };
    const put = () => { el.style.setProperty("--fx-reveal", st.reveal.toFixed(4)); el.style.setProperty("--fx-fold", st.fold.toFixed(4)); el.style.setProperty("--fx-pad", pad + "px"); };
    put();
    const tweens = [];
    if (!reduce && dur > 0) {
      tweens.push(gsap.to(st, { reveal: 0, duration: dur, ease: "power2.out", delay: +(options.delay ?? 0), onUpdate: put }));
      if (pic && settle > 0) tweens.push(gsap.fromTo(pic, { scale: 1.05 }, { scale: 1, duration: settle, ease: "power2.out", force3D: true }));
    }
    const mm = gsap.matchMedia();
    mm.add({ wide, ok: "(prefers-reduced-motion: no-preference)" }, (c) => {
      if (!c.conditions.wide || !c.conditions.ok) return;
      const measure = () => {
        el.removeAttribute("data-folding");
        const w = media.clientWidth, h = fig.offsetHeight;
        if (w < 50) return false;
        el.style.setProperty("--fx-start-w", w + "px");
        el.style.setProperty("--fx-start-h", h + "px");
        el.setAttribute("data-folding", "");
        return true;
      };
      if (!measure()) return;
      const tw = gsap.to(st, { fold: 1, ease: "none", onUpdate: put, scrollTrigger: { trigger: el, start: "top top", endTrigger: anchor, end: "center center", scrub: 0.7, invalidateOnRefresh: true, onRefresh: put } });
      // The initial size can only be measured when expanded, so each time the width changes it unfolds the collapse and measures again (even if the font arrives late the photo cell size doesn’t change)
      let lastW = innerWidth;
      const onResize = () => { if (innerWidth === lastW) return; lastW = innerWidth; measure(); ScrollTrigger.refresh(); };
      addEventListener("resize", onResize);
      return () => { tw.scrollTrigger?.kill(); tw.kill(); removeEventListener("resize", onResize); el.removeAttribute("data-folding"); };
    });
    return () => { tweens.forEach((t) => t.kill()); mm.revert(); ["--fx-reveal", "--fx-fold", "--fx-pad", "--fx-start-w", "--fx-start-h"].forEach((p) => el.style.removeProperty(p)); if (pic) gsap.set(pic, { clearProps: "scale,transform" }); };
  });
})();
