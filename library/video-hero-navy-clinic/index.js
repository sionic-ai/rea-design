// First page: why slide (pinned + 5s × section-count linear progress line, interaction jumps to that section)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const why = document.querySelector(".od-why");
  if (why) {
    const items = [...why.querySelectorAll(".od-why__item")];
    const bar = why.querySelector(".od-why__bar");
    const now = why.querySelector("[data-why-now]");
    const n = items.length;
    why.querySelector("[data-why-all]").textContent = n;
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      now.textContent = i + 1;
      items.forEach((it, k) => {
        it.classList.toggle("is-on", k === i);
        const v = it.querySelector("video");
        if (v) k === i ? v.play().catch(() => {}) : v.pause();
      });
    };
    show(0);
    const run = gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1, duration: 5 * n, ease: "linear",
      onUpdate() { show(Math.min(Math.floor(this.progress() * n), n - 1)); },
      onComplete() { this.restart(); },
    });
    if (reduce) run.pause(0);
    const wide = matchMedia("(min-width: 1024px)");
    items.forEach((it, i) => it.addEventListener("mouseenter", () => { if (wide.matches) run.progress(i / n); }));
    why.addEventListener("click", () => { if (!wide.matches) run.progress(((cur + 1) % n) / n); });
    OD.whenReady(() => ScrollTrigger.create({ trigger: why.querySelector(".od-why__pin"), start: "center center", end: "+=150%", pin: true, pinSpacing: false, invalidateOnRefresh: true }));
  }

})();
