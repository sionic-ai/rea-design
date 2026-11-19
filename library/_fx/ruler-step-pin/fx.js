// Pinned section step change + ruler push: once the body touches the screen center, it pins for steps × length%, and at every step boundary the current step moves up by −shift%
// It fades out as it leaves, and after step the next step rises from shift% below (the picture by pic%). A rest pause sits between steps. The ruler (track) moves left by (steps−1) × ruler width over the whole run — Brand timeline
(() => {
  kfFx.register("ruler-step-pin", (el, { options, reduce, scroller }) => {
    const body = el.querySelector('[data-fx-part="body"]') || el;
    // Order within the same parent is the step number — even with separate title, text and number groups, the nth items move together
    const group = (part) => {
      const steps = [];
      const byParent = new Map();
      el.querySelectorAll(`[data-fx-part="${part}"]`).forEach((n) => {
        const list = byParent.get(n.parentElement) || [];
        list.push(n);
        byParent.set(n.parentElement, list);
      });
      byParent.forEach((list) => list.forEach((n, i) => { (steps[i] = steps[i] || []).push(n); }));
      return steps;
    };
    const items = group("step"), pics = group("picture");
    const n = Math.max(items.length, pics.length);
    if (n < 2) return;
    const all = [...items.flat(), ...pics.flat()];
    const track = el.querySelector('[data-fx-part="track"]');
    const ruler = el.querySelector('[data-fx-part="ruler"]') || track?.parentElement;
    const segs = track ? [...track.querySelectorAll('[data-fx-part="seg"]')] : [];
    const at = (i, list) => list[i] || [];
    if (reduce) {
      gsap.set(all, { opacity: 0 });
      gsap.set([...at(n - 1, items), ...at(n - 1, pics)], { opacity: 1 });
      return () => gsap.set(all, { clearProps: "opacity" });
    }
    gsap.registerPlugin(ScrollTrigger, ...[window.CustomEase].filter(Boolean));
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut");
    const step = +(options.step ?? 0.25), rest = +(options.rest ?? 0.3);
    const shift = +(options.shift ?? 50), pic = +(options.pic ?? 25), length = +(options.length ?? 100);
    let tl = null;
    const build = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      gsap.set(all, { yPercent: 0, opacity: 0 });
      gsap.set([...at(0, items), ...at(0, pics)], { opacity: 1 });
      tl = gsap.timeline({
        defaults: { ease },
        scrollTrigger: { trigger: body, ...(scroller && { scroller }), start: options.start || "center center", end: `+=${n * length}%`, pin: body, scrub: true },
      });
      for (let i = 0; i < n - 1; i++) {
        const out = `s${i}`, inn = `s${i}-in`;
        tl.add(out).add(inn, `${out}+=${step}`);
        if (at(i, items).length) tl.to(at(i, items), { yPercent: -shift, opacity: 0, duration: step }, out);
        if (at(i, pics).length) tl.to(at(i, pics), { yPercent: -pic, opacity: 0, duration: step }, out);
        if (at(i + 1, items).length) tl.fromTo(at(i + 1, items), { yPercent: shift, opacity: 0 }, { yPercent: 0, opacity: 1, duration: step }, inn);
        if (at(i + 1, pics).length) tl.fromTo(at(i + 1, pics), { yPercent: pic, opacity: 0 }, { yPercent: 0, opacity: 1, duration: step }, inn);
        if (i < n - 2) tl.to({}, { duration: rest });
      }
      if (track && ruler) {
        const w = ruler.offsetWidth;
        if (segs.length) gsap.set(segs, { width: w });
        tl.fromTo(track, { x: 0 }, { x: -(n - 1) * w, duration: tl.duration(), ease: "none" }, 0);
      }
    };
    build();
    // If the ruler width changes late due to font or window size, remeasure the push distance first
    let lastW = ruler ? ruler.offsetWidth : 0;
    const ro = ruler && new ResizeObserver(() => {
      const w = ruler.offsetWidth;
      if (Math.abs(w - lastW) < 1) return;
      lastW = w;
      const p = tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
      build();
      tl.progress(p);
    });
    ro?.observe(ruler);
    return () => {
      ro?.disconnect();
      tl?.scrollTrigger?.kill(true);
      tl?.kill();
      gsap.set([...all, track, ...segs].filter(Boolean), { clearProps: "transform,opacity,width" });
    };
  });
})();
