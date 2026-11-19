(() => {
  // While the section (about panel count × screen height) scrolls by, the panel stays pinned and the text group swaps at each position of progress divided by panel count —
  // The current batch fades out piece by piece, 10px up with 4px blur, while the next batch settles in place with 0 blur (.8s, same time). The blurred background photos swap staggered over the same length,
  // If a photo group (soft-mask-cycle) exists, fx:go advances the same slide. Scrolling back up reverses it
  kfFx.register("blur-swap-pin", (el, { options, reduce, scroller }) => {
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (panels.length < 2 || !window.ScrollTrigger) return;
    const bgs = [...el.querySelectorAll('[data-fx-part="bg"]')];
    const pics = el.querySelector('[data-fx-part="pics"]');
    const dur = +(options.dur ?? 0.8), lift = +(options.y ?? -10), blur = +(options.blur ?? 4);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const items = (p) => [...p.querySelectorAll('[data-fx-part="item"]')];
    const moving = (n) => n.dataset.key !== "still";
    let now = 0;
    const show = (p, on, quick) => items(p).forEach((n) => gsap.to(n, {
      autoAlpha: on ? 1 : 0, filter: `blur(${on ? 0 : blur}px)`, ...(moving(n) ? { y: on ? 0 : lift } : {}),
      duration: quick ? 0 : dur, ease, overwrite: "auto",
    }));
    panels.forEach((p, i) => { p.classList.toggle("is-active", i === 0); if (i) items(p).forEach((n) => gsap.set(n, { autoAlpha: 0, filter: `blur(${blur}px)`, ...(moving(n) ? { y: lift } : {}) })); });
    bgs.forEach((b, i) => gsap.set(b, { autoAlpha: i === 0 ? 1 : 0 }));
    const go = (n, quick) => {
      if (n === now) return;
      const old = now; now = n;
      panels[old].classList.remove("is-active"); panels[now].classList.add("is-active");
      show(panels[old], false, quick); show(panels[now], true, quick);
      if (bgs[old]) gsap.to(bgs[old], { autoAlpha: 0, duration: quick ? 0 : dur, overwrite: "auto" });
      if (bgs[now]) gsap.to(bgs[now], { autoAlpha: 1, duration: quick ? 0 : dur, overwrite: "auto" });
      pics?.dispatchEvent(new CustomEvent("fx:go", { detail: { index: now } }));
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: now } }));
    };
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: "top top", end: "bottom bottom",
      onUpdate: (self) => go(Math.min(panels.length - 1, Math.floor(self.progress * panels.length + 1e-6)), reduce),
    });
    return () => {
      st.kill();
      gsap.set([...panels.flatMap(items), ...bgs], { clearProps: "opacity,visibility,filter,transform" });
      panels.forEach((p) => p.classList.remove("is-active"));
    };
  });
})();
