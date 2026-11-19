// As you scroll down the section, the panel stays sticky, and each photo piece inside flies in via scrub from depth -perspective×depth to +perspective×(per-layer closeness).
// Piece length = life / speed (.75~1.35), layer opacity goes to 1 over the first .24x, disappears at .8 of the length. Art inside the pieces goes 1.075 → 1.
// The sentence (slide) has its own scrub — it holds, fades out, and the next sentence enters at 1.026x.
(() => {
  const FAR = { 1: 0.38, 2: 0.21, 3: 0.06 };
  const NEAR = { 1: 0.64, 2: 0.79, 3: 0.92 };
  const ALPHA = { 1: 0.24, 2: 0.48, 3: 0.78 };
  kfFx.register("depth-fly-pin", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector(':scope > [data-fx-part="stage"]');
    if (!stage || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const items = [...stage.querySelectorAll(':scope > [data-fx-part="item"]')];
    const slides = [...stage.querySelectorAll(':scope > [data-fx-part="slide"]')];
    if (!items.length && slides.length < 2) return;
    const scrub = +(options.scrub ?? 1.05);
    const textScrub = +(options["text-scrub"] ?? 1);
    const life = +options.life || 5.4;
    const hold = +(options.hold ?? 0.8);
    const persp = () => Math.max(1.08 * (scroller ? scroller.clientHeight : innerHeight), +(options.min ?? 900));
    const layerOf = (it) => { const n = Number(it.dataset.layer); return n === 2 || n === 3 ? n : 1; };
    const depthOf = (it, l) => (it.dataset.depth !== undefined && it.dataset.depth !== "" ? Number(it.dataset.depth) : FAR[l]);
    const inner = items.map((it) => it.firstElementChild).filter(Boolean);
    const all = [stage, ...items, ...inner, ...slides];

    if (reduce) {
      if (items.length) gsap.set(items, { xPercent: -50, yPercent: -50, autoAlpha: (i, it) => ALPHA[layerOf(it)] });
      return () => gsap.set(all, { clearProps: "all" });
    }

    gsap.set(stage, { perspective: persp() });
    if (slides.length) {
      gsap.set(slides, { autoAlpha: 0, scale: 0.96, filter: "blur(10px)", transformOrigin: "50% 50%" });
      gsap.set(slides[0], { autoAlpha: 1, scale: 1, filter: "blur(0px)" });
    }
    items.forEach((it) => {
      const l = layerOf(it);
      gsap.set(it, { xPercent: -50, yPercent: -50, x: 0, y: 0, z: -persp() * depthOf(it, l), autoAlpha: ALPHA[l], transformOrigin: "50% 50%" });
    });
    if (inner.length) gsap.set(inner, { scale: 1.075, transformOrigin: "50% 50%" });

    const base = { trigger: el, start: "top top", end: "bottom bottom", invalidateOnRefresh: true, scroller: scroller || undefined };
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { ...base, scrub, onRefreshInit: () => gsap.set(stage, { perspective: persp() }) } });
    items.forEach((it) => {
      const l = layerOf(it);
      const depth = depthOf(it, l);
      const dur = life / gsap.utils.clamp(0.75, 1.35, Number(it.dataset.speed) || 1);
      tl.fromTo(it, { z: () => -persp() * depth }, { z: () => persp() * NEAR[l], duration: dur, immediateRender: true }, 0);
      tl.fromTo(it, { autoAlpha: ALPHA[l] }, { autoAlpha: 1, duration: Math.min(1.1, 0.24 * dur), immediateRender: false }, 0);
      if (it.firstElementChild) tl.fromTo(it.firstElementChild, { scale: 1.075 }, { scale: 1, duration: dur, immediateRender: false }, 0);
      tl.to(it, { autoAlpha: 0, duration: Math.max(0.32, 0.18 * dur) }, 0.8 * dur);
    });
    tl.to({}, { duration: hold });

    let st = null;
    if (slides.length > 1) {
      st = gsap.timeline({ scrollTrigger: { ...base, scrub: textScrub } });
      for (let i = 0; i < slides.length - 1; i++) {
        st.to({}, { duration: i === 0 ? 0.55 : 0.82 });
        st.to(slides[i], { autoAlpha: 0, scale: 1, filter: "blur(0px)", duration: 1.25, ease: "power2.inOut" });
        st.fromTo(slides[i + 1], { autoAlpha: 0, scale: 1.026, filter: "blur(0px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.75, ease: "power2.out", immediateRender: false }, "-=0.38");
      }
      st.to({}, { duration: 0 });
    }
    // Re-measure if the section height changes late due to fonts or photos
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => {
      ro.disconnect();
      tl.scrollTrigger?.kill(); tl.kill();
      st?.scrollTrigger?.kill(); st?.kill();
      gsap.set(all, { clearProps: "all" });
    };
  });
})();
