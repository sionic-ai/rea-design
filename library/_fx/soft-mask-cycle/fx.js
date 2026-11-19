(() => {
  // Only while visible on screen, advance to the next sheet at each interval — the previous sheet stays as is-old and the new sheet wipes over it.
  // auto: when off it does not advance by itself and changes only on the fx:go(detail.index) signal (when another motion advances it, like the blur-alternating plate)
  kfFx.register("soft-mask-cycle", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const every = +(options.every || 4) * 1000;
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.ease) el.style.setProperty("--fx-ease", /^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    let now = 0, timer = 0, seen = false;
    const paint = (n) => {
      const old = now;
      now = ((n % slides.length) + slides.length) % slides.length;
      slides.forEach((s, i) => {
        s.classList.toggle("is-active", i === now);
        s.classList.toggle("is-old", i === old && i !== now);
      });
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: now } }));
    };
    slides.forEach((s, i) => s.classList.toggle("is-active", i === 0));
    el.classList.add("fx-soft-mask-on");
    const go = (e) => paint(+(e.detail?.index ?? now + 1));
    el.addEventListener("fx:go", go);
    const auto = options.auto !== "off" && !reduce && slides.length > 1;
    const start = () => { if (!timer) timer = setInterval(() => paint(now + 1), every); };
    const stop = () => { clearInterval(timer); timer = 0; };
    const io = auto ? new IntersectionObserver(([en]) => { seen = en.isIntersecting; seen ? start() : stop(); }) : null;
    io?.observe(el);
    return () => {
      stop(); io?.disconnect(); el.removeEventListener("fx:go", go);
      el.classList.remove("fx-soft-mask-on");
      slides.forEach((s) => s.classList.remove("is-active", "is-old"));
      el.style.removeProperty("--fx-dur"); el.style.removeProperty("--fx-ease");
    };
  });
})();
