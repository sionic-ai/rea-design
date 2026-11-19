// Opens by time only at the moment the stage changes (not tied to scroll) — the original Playbook’s clip opening and front photo sinking
// corner·circle Types are step screens of the original — a triangle folded at the bottom-right corner unfolds, or a circle at the right center grows to cover the whole screen
(() => {
  const OPEN = "inset(0% 0% 0% 0%)";
  const SHAPES = {
    left: ["inset(0% 100% 0% 0%)", OPEN],
    right: ["inset(0% 0% 0% 100%)", OPEN],
    top: ["inset(0% 0% 100% 0%)", OPEN],
    bottom: ["inset(100% 0% 0% 0%)", OPEN],
    corner: ["polygon(100% 100%, 100% 100%, 100% 100%)", "polygon(100% -100%, 100% 100%, -100% 100%)"],
    "circle-right": ["circle(0% at 100% 50%)", "circle(150% at 100% 50%)"],
    "circle-bottom": ["circle(0% at 50% 100%)", "circle(150% at 50% 100%)"],
  };
  kfFx.register("step-clip-stack", (el, { options, reduce, scroller }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const steps = [...el.querySelectorAll('[data-fx-part="step"]')];
    if (!layers.length || !steps.length || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const photos = layers.map((l) => l.querySelector('[data-fx-part="photo"]'));
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const dur = +(options.dur ?? 0.45), scale = +(options.scale ?? 1.1);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    // narrow — the type used below 991px (the Brand circle opens at the right center on wide screens and at the bottom center on narrow ones)
    const narrow = options.narrow && SHAPES[options.narrow] ? matchMedia("(max-width: 991px)") : null;
    const shape = () => SHAPES[narrow?.matches ? options.narrow : options.from] || SHAPES.left;
    let cur = 0, active = -1;
    const mark = (i) => dots.forEach((d, k) => { d.classList.toggle("is-on", k === i); if (k === i) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
    const go = (i, instant) => {
      if (i === active) return;
      active = i;
      mark(i);
      const d = instant || reduce ? 0 : dur;
      const [closed, opened] = shape();
      if (i > cur) for (let k = cur + 1; k <= i; k++) {
        if (layers[k]) gsap.to(layers[k], { clipPath: opened, duration: d, ease, overwrite: "auto" });
        if (photos[k - 1]) gsap.to(photos[k - 1], { scale: 1, duration: d, ease, overwrite: "auto" });
      } else for (let k = cur; k > i; k--) {
        if (layers[k]) gsap.to(layers[k], { clipPath: closed, duration: d, ease, overwrite: "auto" });
        if (photos[k - 1]) gsap.to(photos[k - 1], { scale, duration: d, ease, overwrite: "auto" });
      }
      cur = i;
      el.dispatchEvent(new CustomEvent("fx:step", { detail: { index: i } }));
    };
    const lay = () => { const [closed, opened] = shape(); layers.forEach((l, i) => gsap.set(l, { clipPath: i <= cur ? opened : closed, zIndex: i + 1 })); };
    lay();
    narrow?.addEventListener("change", lay);
    photos.forEach((p) => p && gsap.set(p, { scale: reduce ? 1 : scale }));
    const sts = steps.map((s, i) => ScrollTrigger.create({
      trigger: s, scroller, start: options.start || "top center", end: options.end || "bottom center",
      onEnter: () => go(i), onEnterBack: () => go(i),
    }));
    const onDot = (e) => {
      const k = dots.indexOf(e.currentTarget);
      if (steps[k]) steps[k].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    };
    dots.forEach((d) => d.addEventListener("click", onDot));
    if (!sts.some((t) => t.isActive)) mark(0);
    return () => {
      narrow?.removeEventListener("change", lay);
      sts.forEach((t) => t.kill());
      dots.forEach((d) => { d.removeEventListener("click", onDot); d.classList.remove("is-on"); d.removeAttribute("aria-current"); });
      gsap.killTweensOf([...layers, ...photos.filter(Boolean)]);
      gsap.set(layers, { clearProps: "clipPath,zIndex" });
      photos.forEach((p) => p && gsap.set(p, { clearProps: "transform,scale" }));
    };
  });
})();
