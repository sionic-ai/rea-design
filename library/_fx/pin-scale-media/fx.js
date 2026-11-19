(() => {
  // Original brand mediaScrollScale (scaleType reduce): while the section stays pinned and scrolls section height × dur, the photo, pre-enlarged enough to fill the panel,
  // Steps back to its own size (1×) while opacity goes 1 → .5 (straight). Past progress .65 it gets is-content (text laid on top turns on), and when finished is-done. Holds still for .2 at the end.
  // look: grow does the reverse, growing from 1x until it fills the screen, and the text turns on at .35.
  kfFx.register("pin-scale-media", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.gsap || !window.ScrollTrigger) return;
    const grow = options.look === "grow";
    const fill = () => Math.max(el.clientWidth / (media.clientWidth || 1), el.clientHeight / (media.clientHeight || 1));
    const from = +(options.from ?? 1), to = +(options.to ?? 0.5), cut = grow ? 0.35 : 0.65;
    if (reduce) { el.classList.add("is-content", "is-done"); return () => el.classList.remove("is-content", "is-done"); }
    const tl = gsap.timeline({ scrollTrigger: {
      scroller, trigger: el, start: options.start || "top top", end: () => `+=${el.clientHeight * +(options.dur ?? 1)}`, pin: true, scrub: true, invalidateOnRefresh: true,
      onUpdate: (s) => { el.classList.toggle("is-content", s.progress > cut); el.classList.toggle("is-done", s.progress >= 1); },
    } });
    tl.fromTo(media, { scale: grow ? 1 : fill, opacity: from, duration: 1 }, { scale: grow ? fill : 1, opacity: to, ease: "none" }).to(media, { duration: 0.2 });
    return () => { tl.scrollTrigger?.kill(true); tl.kill(); gsap.set(media, { clearProps: "transform,opacity" }); el.classList.remove("is-content", "is-done"); };
  });
})();
