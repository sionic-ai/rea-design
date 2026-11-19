(() => {
  kfFx.register("runner-scroll-bar", (el, { options, reduce, scroller }) => {
    const drag = el.querySelector('[data-fx-part="drag"]'), runner = el.querySelector('[data-fx-part="runner"]'), label = el.querySelector('[data-fx-part="label"]');
    const points = [...el.querySelectorAll('[data-fx-part="point"]')];
    if (!drag || !points.length) return;
    const sy = () => (scroller ? scroller.scrollTop : scrollY), vh = () => (scroller ? scroller.clientHeight : innerHeight);
    let metrics = [], track = 0, last = sy(), active = -1, entered = false, raf = 0;
    const measure = () => {
      track = drag.parentElement.offsetWidth;
      metrics = points.map((p) => {
        const sec = document.querySelector(p.dataset.target);
        const r = sec?.getBoundingClientRect(), top = r ? r.top + sy() : 0;
        return { p, name: p.dataset.name || "", top, center: top + (r ? r.height / 2 : 0), x: p.offsetLeft + p.offsetWidth / 2 };
      });
    };
    const setLabel = (i) => {
      if (!label) return;
      const name = metrics[i]?.name || "";
      label.textContent = name;
      label.classList.toggle("is-hidden", !name);
      // Original: each time the nameplate changes it floats up from 5px at lower left in .37s power1.out
      if (name && window.gsap && !reduce) gsap.fromTo(label, { x: -5, y: 5, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.37, ease: "power1.out", overwrite: true });
    };
    const update = () => {
      raf = 0;
      if (!metrics.length) return;
      const y = sy(), mid = y + vh() / 2, dirUp = y < last, goal = metrics[metrics.length - 1];
      last = y;
      // The bar enters when the first section’s top reaches 80% of the screen and leaves once past the bottom of the last section
      const on = mid >= metrics[0].top - vh() * 0.3;
      if (on !== entered) { entered = on; el.classList.toggle("is-enter", on); }
      let i = 0;
      for (let k = 0; k < metrics.length - 1 && mid >= metrics[k].center; k++) i = k;
      let x, seg = 0;
      if (mid >= goal.top) { x = track; i = metrics.length - 1; }
      else {
        const a = metrics[i], b = metrics[Math.min(i + 1, metrics.length - 1)];
        const from = i === 0 ? a.top : a.center, to = (b === goal ? goal.top : b.center) - from || 1;
        seg = Math.min(Math.max((mid - from) / to, 0), 1);
        x = a.x + seg * ((b === goal ? track : b.x) - a.x);
      }
      x = Math.min(Math.max(x, 0), track);
      drag.style.width = `${x}px`;
      drag.classList.toggle("is-goal", mid >= goal.top);
      if (runner) {
        runner.style.left = `${x}px`;
        // Mid-segment it jumps highest (5px) and tilts most (3°), and even segments tilt the opposite way
        const hop = seg <= 0 || seg >= 1 ? 0 : seg <= 0.5 ? seg / 0.5 : (1 - seg) / 0.5, s = i % 2 === 0 ? -1 : 1;
        runner.style.setProperty("--y", `${s * 5 * hop}px`);
        runner.style.setProperty("--deg", `${s * 3 * hop}deg`);
      }
      el.classList.toggle("is-turning", dirUp);
      if (i !== active) { active = i; points.forEach((p, k) => p.classList.toggle("is-active", k === i)); setLabel(i); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => { measure(); onScroll(); };
    measure(); update();
    (scroller || window).addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("load", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => { (scroller || window).removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); removeEventListener("load", onResize); ro.disconnect(); cancelAnimationFrame(raf); };
  });
})();
