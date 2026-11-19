// Pins the section to the screen, and while passing, the next section slides in from the right edge with clip and covers the previous one. The incoming section’s photo goes from 1.1 to its own size,
// Caption lines follow from the lower 60% at .08s spacing. Each section has a label, and releasing the scroll stops at the nearest section (snap).
// beam: when on, a light beam (.fx-pin-beam) stands on the revealing edge and travels with it, and the leaving section raises --fx-shade up to shade (the darkening itself is the consumer’s css).
// When the section changes, the plate emits fx:slide(detail.index) — whoever uses the dot list·next-section preview should fix it here
(() => {
  kfFx.register("pin-clip-swap", (el, { options, reduce, scroller }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2 || reduce) return;
    const scrub = options.scrub === "on" ? true : +(options.scrub ?? 0.6), zoom = +(options.zoom ?? 1.1), each = +(options.each ?? 1);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut"), beamOn = options.beam === "on", shade = +(options.shade ?? 0.5);
    const minStep = +(options.min ?? 0), top = +(options.top ?? 0);
    const snap = options.snap === "off" ? null : { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: "power1.inOut" };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("fx-pin-on");
      if (top) el.style.setProperty("--fx-pin-top", `${top}px`);
      const beam = beamOn ? document.createElement("i") : null;
      if (beam) { beam.className = "fx-pin-beam"; beam.setAttribute("aria-hidden", "true"); el.append(beam); gsap.set(beam, { autoAlpha: 0, left: "100%" }); }
      let at = -1;
      const tell = (p) => {
        const i = Math.round(p * (slides.length - 1));
        if (i === at) return;
        at = i;
        el.dataset.fxIndex = String(i);
        el.dispatchEvent(new CustomEvent("fx:slide", { bubbles: true, detail: { index: i, count: slides.length } }));
      };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el, scroller: scroller || undefined, start: `top ${top}px`, end: () => `+=${(slides.length - 1) * Math.max(minStep, each * (innerHeight - top))}`,
          pin: true, scrub, invalidateOnRefresh: true, ...(snap ? { snap } : {}), onUpdate: (st) => tell(st.progress),
        },
      });
      tl.addLabel("s1");
      slides.slice(1).forEach((s, i) => {
        const prev = slides[i];
        tl.fromTo(s, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease });
        if (beam) {
          tl.set(beam, { autoAlpha: 1 }, "<");
          tl.fromTo(beam, { left: "100%" }, { left: "0%", duration: 1, ease }, "<");
          tl.fromTo(prev, { "--fx-shade": 0 }, { "--fx-shade": shade, duration: 1, ease }, "<");
          tl.set(beam, { autoAlpha: 0 });
          tl.set(prev, { "--fx-shade": 0 });
        }
        const media = s.querySelector('[data-fx-part="media"]');
        if (media && zoom !== 1) tl.fromTo(media, { scale: zoom }, { scale: 1, duration: 1, ease: "power2.out" }, "<");
        const caps = s.querySelectorAll('[data-fx-part="caption"]');
        if (caps.length) tl.fromTo(caps, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }, "<0.5");
        tl.addLabel(`s${i + 2}`);
      });
      tell(0);
      return () => { el.classList.remove("fx-pin-on"); el.style.removeProperty("--fx-pin-top"); beam?.remove(); delete el.dataset.fxIndex; };
    });
    return () => mm.revert();
  });
})();
