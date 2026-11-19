// The full-bleed Hero sticks to the screen tied to scroll, and shrinks exactly to the size and position of the first cell in the list below — the moment the cell’s center reaches the screen center, the pin releases and it flows along with the list
(() => {
  const clamp = (a, b, v) => Math.min(b, Math.max(a, v));
  kfFx.register("hero-shrink-to-slot", (el, { options, reduce, scroller }) => {
    const frame = el.querySelector('[data-fx-part="frame"]');
    const box = el.querySelector('[data-fx-part="box"]') || frame?.firstElementChild;
    const slot = el.querySelector('[data-fx-part="slot"]');
    if (!frame || !box || !slot || !window.ScrollTrigger) return;
    const keep = [...el.querySelectorAll('[data-fx-part="keep"]')];
    const dim = el.querySelector('[data-fx-part="dim"]');
    const mark = el.querySelector('[data-fx-part="mark"]');
    const markTo = +(options.mark ?? 410 / 546);
    const keepY = +(options["keep-y"] ?? -0.12);
    const baseW = +(options.base ?? 575);
    const toggleEase = kfFx.ease(options["ease-in"] || "0.19,0.02,0,0.99", "expo.inOut");
    const backEase = kfFx.ease(options["ease-out"] || "0.33,1,0.68,1", "power3.out");
    const wide = options.wide || "(min-width: 960px)";
    let vh = innerHeight;
    const svh = () => { const p = document.createElement("div"); p.style.cssText = "position:fixed;top:0;height:100svh;width:1px;visibility:hidden"; document.body.append(p); const h = p.offsetHeight || innerHeight; p.remove(); return h; };
    const slotRect = () => {
      const s = slot.getBoundingClientRect();
      return { w: s.width, h: s.height };
    };
    const paint = (p) => {
      const W = innerWidth, s = slotRect();
      const K = 1 - (1 - s.w / W) * p;
      const Y = Math.floor((vh - s.h) * 0.5);
      const y = clamp(0, Y, Y * p);
      const th = baseW / (s.w / s.h);
      let wt = W - (W - baseW) * p;
      wt = W > baseW ? clamp(baseW, W, wt) : clamp(W, baseW, wt);
      let st = vh - (vh - th) * p;
      st = vh > th ? clamp(th, vh, st) : clamp(vh, th, st);
      gsap.set(box, { scale: K, y, aspectRatio: `${wt} / ${st}`, transformOrigin: "50% 0%" });
      if (keep.length) gsap.set(keep, { scale: 1 / K, y: y * keepY });
      if (dim) gsap.set(dim, { opacity: 1 - p });
      if (mark) gsap.set(mark, { scale: 1 - (1 - markTo) * p, transformOrigin: "0% 100%" });
      el.style.setProperty("--fx-p", p.toFixed(4));
      el.style.setProperty("--fx-k", K.toFixed(4));
      el.classList.toggle("is-shrinking", p > 0.006);
    };
    if (reduce) { vh = svh(); paint(0); return () => gsap.set([box, ...keep, dim, mark].filter(Boolean), { clearProps: "all" }); }

    const mm = gsap.matchMedia();
    mm.add({ wide, narrow: `not all and ${wide}` }, (ctx) => {
      vh = svh();
      if (ctx.conditions.wide) {
        paint(0);
        ScrollTrigger.create({
          trigger: frame, start: "top top", endTrigger: slot, end: "center center", pin: true, pinSpacing: false, scrub: 0, scroller,
          invalidateOnRefresh: true,
          onRefresh: () => { vh = svh(); },
          onUpdate: ({ progress }) => paint(Math.abs(progress) < 0.006 ? 0 : clamp(0, 1, progress)),
        });
        return;
      }
      const state = { p: 0 };
      gsap.set(box, { aspectRatio: `${innerWidth} / ${vh}` });
      const toSlot = () => {
        const s = slot.getBoundingClientRect(), f = frame.getBoundingClientRect();
        return { k: s.width / innerWidth, y: s.top - f.top, ar: `${s.width} / ${s.height}` };
      };
      ScrollTrigger.create({
        trigger: el.querySelector('[data-fx-part="trigger"]') || frame, start: "top top", end: "bottom top", scroller,
        onEnter: () => {
          const t = toSlot();
          gsap.to(box, { aspectRatio: t.ar, y: t.y, scale: t.k, duration: 1, ease: toggleEase, overwrite: true });
          if (keep.length) gsap.to(keep, { scale: 1 / t.k, duration: 1, ease: toggleEase, overwrite: true });
          if (dim) gsap.to(dim, { opacity: 0, duration: 1, ease: toggleEase, overwrite: true });
          if (mark) gsap.to(mark, { scale: markTo, transformOrigin: "0% 100%", duration: 1, ease: toggleEase, overwrite: true });
          gsap.to(state, { p: 1, duration: 1, ease: toggleEase, overwrite: true, onUpdate: () => { el.style.setProperty("--fx-p", state.p.toFixed(4)); el.style.setProperty("--fx-k", (1 - (1 - t.k) * state.p).toFixed(4)); } });
          el.classList.add("is-shrinking");
        },
        onLeaveBack: () => {
          gsap.to(box, { aspectRatio: `${innerWidth} / ${vh}`, y: 0, scale: 1, duration: 0.8, ease: backEase, overwrite: true });
          if (keep.length) gsap.to(keep, { scale: 1, duration: 0.8, ease: backEase, overwrite: true });
          if (dim) gsap.to(dim, { opacity: 1, duration: 0.8, ease: backEase, overwrite: true });
          if (mark) gsap.to(mark, { scale: 1, duration: 0.8, ease: backEase, overwrite: true });
          gsap.to(state, { p: 0, duration: 0.8, ease: backEase, overwrite: true, onUpdate: () => { el.style.setProperty("--fx-p", state.p.toFixed(4)); el.style.setProperty("--fx-k", (1 - (1 - (gsap.getProperty(box, "scale") || 1)) * 1).toFixed(4)); } });
          el.classList.remove("is-shrinking");
        },
      });
      return () => gsap.killTweensOf([box, ...keep, dim, mark, state].filter(Boolean));
    });
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(slot);
    return () => {
      ro.disconnect();
      mm.revert();
      gsap.set([box, ...keep, dim, mark].filter(Boolean), { clearProps: "all" });
      el.style.removeProperty("--fx-p");
      el.style.removeProperty("--fx-k");
      el.classList.remove("is-shrinking");
    };
  });
})();
