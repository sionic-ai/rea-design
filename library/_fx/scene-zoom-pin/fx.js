// Pin the panel (scene count × screen height × step). Each scene approaches at 2.4x over a share of 1 (power1.in), then vanishes over .65 after .1,
// The next scene comes in from .88 scale after a .2 delay over .8 (sine.inOut). scrub .6. When scrolling stops, it snaps to the nearest scene position.
(() => {
  kfFx.register("scene-zoom-pin", (el, { options, reduce, scroller }) => {
    const scenes = [...el.querySelectorAll(':scope > [data-fx-part="scene"]')];
    if (scenes.length < 2 || reduce || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const step = +options.step || 1;
    const zoom = +(options.zoom ?? 2.4);
    const from = +(options.from ?? 0.88);
    const outAt = +(options["out-at"] ?? 0.1), outDur = +(options["out-dur"] ?? 0.65);
    const inAt = +(options["in-at"] ?? 0.2), inDur = +(options["in-dur"] ?? 0.8);
    const scrub = +(options.scrub ?? 0.6);
    const snapDur = +(options.snap ?? 1.2);
    const fade = [...el.querySelectorAll(':scope > [data-fx-part="head"]')];
    const n = scenes.length;
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    gsap.set(scenes.slice(1), { autoAlpha: 0, scale: from });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: el, scroller: scroller || undefined, start: "top top", end: () => `+=${n * view() * step}`, pin: true, scrub, invalidateOnRefresh: true },
    });
    scenes.forEach((s, i) => {
      tl.to(s, { scale: zoom, duration: 1, ease: "power1.in" }, i);
      tl.to(s, { autoAlpha: 0, duration: outDur, ease: "sine.inOut" }, i + outAt);
      if (scenes[i + 1]) tl.to(scenes[i + 1], { scale: 1, autoAlpha: 1, duration: inDur, ease: "sine.inOut" }, i + inAt);
    });
    if (fade.length) tl.to(fade, { autoAlpha: 0, duration: 0.6 }, n - 0.6);
    // Uses smooth scroll (lenis) if present, otherwise matches window scroll. snap: 0 means no snapping
    const snap = () => {
      const st = tl.scrollTrigger;
      if (!st || !snapDur) return;
      const y = st.scroll();
      if (y <= st.start || y >= st.end) return;
      const each = (st.end - st.start) / n, to = st.start + Math.round((y - st.start) / each) * each;
      if (Math.abs(to - y) <= 2) return;
      const lenis = window.lenis || window.qsSite?.lenis;
      if (lenis && !scroller) lenis.scrollTo(to, { duration: snapDur });
      else (scroller || window).scrollTo({ top: to, behavior: "smooth" });
    };
    ScrollTrigger.addEventListener("scrollEnd", snap);
    return () => {
      ScrollTrigger.removeEventListener("scrollEnd", snap);
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([...scenes, ...fade], { clearProps: "all" });
    };
  });
})();
