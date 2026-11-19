(() => {
  // Hovering a card makes the tag (VIEW MORE) pop up from below, slightly tilted (.2s back.out(1.7) — 0→1 · 10°→6°),
  // The remaining text and gradient fade to .1 in .3s, and any video plays from the start. If released less than half open, it opens fully and then folds
  kfFx.register("badge-pop-hover", (el, { options, reduce, hover }) => {
    const badge = el.querySelector('[data-fx-part="badge"]');
    if (!badge || reduce || !hover) return;
    const dims = [...el.querySelectorAll('[data-fx-part="dim"]')], video = el.querySelector('[data-fx-part="video"]');
    const dur = +(options.dur ?? 0.2), ease = kfFx.ease(options.ease || "back.out(1.7)", "back.out(1.7)");
    const rot = +(options.rotate ?? 6), from = +(options["rotate-from"] ?? 10), x = +(options.x ?? 10), y = +(options.y ?? 20);
    const dim = +(options.dim ?? 0.1), hold = +(options.hold ?? 0.5);
    const tl = gsap.timeline({ paused: true });
    if (video) tl.call(() => { video.currentTime = 0; video.play?.().catch(() => {}); }).to(video, { opacity: 1, duration: 0.1 }, 0);
    if (dims.length) tl.to(dims, { opacity: dim, duration: +(options["dim-dur"] ?? 0.3) }, 0);
    tl.fromTo(badge, { opacity: 0, scale: 0, x, y, rotate: from }, { opacity: 1, scale: 1, x: 0, y: 0, rotate: rot, duration: dur, ease }, 0);
    let wait = null;
    const on = () => { clearTimeout(wait); tl.play(); };
    const off = () => {
      video?.pause?.();
      if (tl.reversed()) return;
      wait = setTimeout(() => tl.reverse(), tl.progress() < hold ? tl.totalDuration() * 1000 - 100 : 0);
    };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      clearTimeout(wait); tl.kill();
      el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off);
      gsap.set([badge, ...dims, video].filter(Boolean), { clearProps: "opacity,transform" });
    };
  });
})();
