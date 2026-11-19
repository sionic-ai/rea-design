(() => {
  // Takes the media (photo)’s initial cropped face as the inner window of the reference element (ref, usually a big wordmark — or the photo itself if none) box, and expands it to full screen while the section passes.
  // Window position is recalculated on every refresh — the wordmark size changes with screen ratio
  kfFx.register("window-expand-scrub", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    const ref = el.querySelector('[data-fx-part="ref"]');
    if (!media || reduce) return;
    const trig = el.querySelector('[data-fx-part="trigger"]') || el;
    const [it, ir, ib, il] = String(options.inset ?? "16.5 51 17 16").split(/[\s,]+/).map(Number);
    const pct = (v) => +(Math.max(0, v) * 100).toFixed(2);
    const from = () => {
      const p = media.getBoundingClientRect(), g = (ref || media).getBoundingClientRect();
      if (!p.width || !p.height) return "inset(0% 0% 0% 0%)";
      const t = g.top + (g.height * it) / 100, b = g.bottom - (g.height * ib) / 100;
      const l = g.left + (g.width * il) / 100, r = g.right - (g.width * ir) / 100;
      return `inset(${pct((t - p.top) / p.height)}% ${pct((p.right - r) / p.width)}% ${pct((p.bottom - b) / p.height)}% ${pct((l - p.left) / p.width)}%)`;
    };
    const fade = +(options.fade ?? 0) ? { opacity: 0 } : {};
    const tw = gsap.fromTo(media, { clipPath: from, ...fade }, {
      clipPath: "inset(0% 0% 0% 0%)",
      ...(fade.opacity === 0 ? { opacity: 1 } : {}),
      ease: "none",
      scrollTrigger: { trigger: trig, scroller: scroller || undefined, start: options.start || "top 95%", end: options.end || "top 30%", scrub: options.scrub == null ? true : +options.scrub, invalidateOnRefresh: true },
    });
    return () => {
      tw.scrollTrigger && tw.scrollTrigger.kill();
      tw.kill();
      gsap.set(media, { clearProps: "clipPath,opacity" });
    };
  });
})();
