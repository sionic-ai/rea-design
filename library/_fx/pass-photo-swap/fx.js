(() => {
  // n stacked photos — each time the panel center moves down across the lines dividing the screen into n parts (three: 66% · 33%), it switches to the next one, and scrolling back up returns to the previous.
  // Not tied to scroll — plays for a fixed length the moment it crosses the line (original ScrollTrigger onEnter·onLeaveBack + gsap.to default curve)
  kfFx.register("pass-photo-swap", (el, { options, reduce, scroller }) => {
    const marked = [...el.querySelectorAll(':scope > [data-fx-part="photo"]')];
    const photos = marked.length ? marked : [...el.children];
    if (photos.length < 2) return;
    const n = photos.length;
    const at = (options.at || "").split(",").map((s) => parseFloat(s)).filter((v) => !Number.isNaN(v));
    const lines = at.length === n - 1 ? at : photos.slice(1).map((_, i) => Math.floor(100 * (1 - (i + 1) / n)));
    if (reduce) {
      gsap.set(photos, { opacity: 0 });
      gsap.set(photos[n - 1], { opacity: 1 });
      return () => gsap.set(photos, { clearProps: "opacity,zIndex" });
    }
    gsap.registerPlugin(ScrollTrigger);
    const dur = +(options.dur ?? 0.3);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    gsap.set(photos, { opacity: 0, zIndex: 0 });
    gsap.set(photos[0], { opacity: 1, zIndex: 1 });
    const swap = (from, to) => {
      gsap.to(photos[from], { opacity: 0, duration: dur, ease, overwrite: "auto" });
      gsap.to(photos[to], { opacity: 1, zIndex: 1, duration: dur, ease, overwrite: "auto" });
    };
    const sts = lines.map((line, i) => ScrollTrigger.create({
      trigger: el,
      ...(scroller && { scroller }),
      start: `center ${line}%`,
      onEnter: () => swap(i, i + 1),
      onLeaveBack: () => swap(i + 1, i),
    }));
    return () => {
      sts.forEach((st) => st.kill());
      gsap.killTweensOf(photos);
      gsap.set(photos, { clearProps: "opacity,zIndex" });
    };
  });
})();
