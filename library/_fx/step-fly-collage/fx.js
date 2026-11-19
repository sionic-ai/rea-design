(() => {
  // Cutout pieces fly in from several off-screen directions in stepped (steps) motion with no in-between values to form one scene, then the title pops in and the bands and decorations enter
  kfFx.register("step-fly-collage", (el, { options, reduce }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!pieces.length) return;
    const title = el.querySelector('[data-fx-part="title"]');
    const band = el.querySelector('[data-fx-part="band"]');
    const after = [...el.querySelectorAll('[data-fx-part="after"]')];
    if (reduce) return;
    const dur = +(options.dur ?? 1.5), steps = Math.max(1, Math.round(+options.steps || 5)), each = +(options.each ?? 0.1);
    const gap = +(options.gap ?? 1), titleDur = +(options["title-dur"] ?? 1), bandDelay = +(options["band-delay"] ?? 0.5);
    const fade = kfFx.ease(options["title-ease"] || "power2.out", "power2.out");
    // data-from="x y rotation" — x is in vw, y in vh (if a unit is given, it is used as is)
    const from = (p, i) => {
      const [x = "0", y = i % 2 ? "-50" : "100", r = "0"] = (p.getAttribute("data-from") || "").trim().split(/\s+/);
      const unit = (v, u) => (/[a-z%]$/i.test(v) ? v : `${v}${u}`);
      return { x: unit(x, "vw"), y: unit(y, "vh"), rotate: +r || 0 };
    };
    const tl = gsap.timeline();
    pieces.forEach((p, i) => {
      gsap.set(p, { ...from(p, i), opacity: 0 });
      tl.to(p, { x: 0, y: 0, rotate: 0, opacity: 1, duration: dur, ease: `steps(${steps})` }, i * each);
    });
    if (title) {
      gsap.set(title, { opacity: 0 });
      tl.to(title, { opacity: 1, duration: titleDur, ease: fade }, `+=${gap}`)
        .to(title, { keyframes: { "0%": { scale: 1 }, "30%": { scale: 1.15 }, "50%": { scale: 0.95 }, "70%": { scale: 1.05 }, "100%": { scale: 1 } }, duration: 0.8, ease: "none" }, "<");
    }
    if (band) {
      gsap.set(band, { opacity: 0, xPercent: 20 });
      tl.to(band, { opacity: 1, xPercent: 0, duration: 1, ease: fade, delay: bandDelay });
    }
    if (after.length) {
      gsap.set(after, { opacity: 0 });
      tl.to(after, { opacity: 1, duration: 1, ease: fade }, band ? "<" : ">");
    }
    return () => { tl.kill(); gsap.set([...pieces, title, band, ...after].filter(Boolean), { clearProps: "transform,opacity" }); };
  });
})();
