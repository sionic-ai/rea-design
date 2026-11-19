(() => {
  kfFx.register("slot-fill-pin", (el, { options, reduce, scroller }) => {
    const box = el.querySelector('[data-fx-part="box"]'), slot = el.querySelector('[data-fx-part="slot"]'), media = el.querySelector('[data-fx-part="media"]');
    if (!box || !slot || !media || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    const veil = media.querySelector('[data-fx-part="veil"]');
    const inks = [...el.querySelectorAll('[data-fx-part="ink"]')];
    const distance = +(options.distance ?? 1.1), scrub = +(options.scrub ?? 1), dim = +(options.dim ?? 0.75);
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+options.from || 992}px)`, () => {
      el.classList.add("fx-slot-fill-on");
      // Slot cell position in the plate’s inner coordinates — subtract the plate border thickness so the first look overlaps the slot
      const metrics = () => {
        const s = slot.getBoundingClientRect(), c = box.getBoundingClientRect();
        return { left: s.left - c.left - box.clientLeft, top: s.top - c.top - box.clientTop, width: s.width, height: s.height };
      };
      const tl = gsap.timeline({
        scrollTrigger: {
          scroller, trigger: el, start: "top top", end: () => "+=" + innerHeight * distance,
          pin: true, scrub, anticipatePin: 1, invalidateOnRefresh: true,
          onRefreshInit: () => gsap.set(media, { clearProps: "top,left,width,height" }),
          // Redraw the erased spot at the same progress — if progress is unchanged GSAP doesn’t redraw and the video loses its size
          onRefresh: () => { const t = tl.totalTime(); tl.invalidate().totalTime(t + 1e-4, true).totalTime(t, true); },
        },
      });
      tl.fromTo(media,
        { left: () => metrics().left, top: () => metrics().top, width: () => metrics().width, height: () => metrics().height },
        { left: 0, top: 0, width: () => box.clientWidth, height: () => box.clientHeight, ease: "none" });
      if (veil) tl.to(veil, { opacity: dim, ease: "none" }, 0);
      if (inks.length) tl.to(inks, { color: () => getComputedStyle(el).getPropertyValue("--kf-contrast-ink").trim() || getComputedStyle(el).color, ease: "none" }, 0.1);
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(box);
      return () => { ro.disconnect(); el.classList.remove("fx-slot-fill-on"); };
    });
    return () => mm.revert();
  });
})();
