// The progress line fills linearly over cell count × each seconds, switching the lit cell, and jumps to the hovered cell (on phones, the next cell on each press)
(() => {
  kfFx.register("progress-line-cycle", (el, { options, reduce, hover }) => {
    const bar = el.querySelector('[data-fx-part="bar"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!bar || items.length < 2) return;
    const n = items.length;
    const each = +(options.each ?? 5) || 5;
    const now = el.querySelector('[data-fx-part="now"]');
    const total = el.querySelector('[data-fx-part="total"]');
    if (total) total.textContent = n;
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      cur = i;
      if (now) now.textContent = i + 1;
      items.forEach((it, k) => {
        it.classList.toggle("is-on", k === i);
        it.querySelectorAll("video").forEach((v) => (k === i ? v.play().catch(() => {}) : v.pause()));
      });
    };
    show(0);
    const tw = gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1, duration: each * n, ease: "none",
      onUpdate() { show(Math.min(Math.floor(this.progress() * n), n - 1)); },
      onComplete() { this.restart(); },
    });
    if (reduce) tw.pause(0);
    const wide = matchMedia("(min-width: 1024px)");
    const enters = items.map((it, i) => {
      const fn = () => { if (hover && wide.matches) { tw.progress(i / n); show(i); } };
      it.addEventListener("pointerenter", fn);
      return fn;
    });
    const tap = () => { if (!hover || !wide.matches) { const next = (cur + 1) % n; tw.progress(next / n); show(next); } };
    el.addEventListener("click", tap);
    return () => {
      tw.kill();
      items.forEach((it, i) => { it.removeEventListener("pointerenter", enters[i]); it.classList.remove("is-on"); });
      el.removeEventListener("click", tap);
      gsap.set(bar, { clearProps: "transform" });
    };
  });
})();
