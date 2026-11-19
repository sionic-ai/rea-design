(() => {
  // Groups elements on the same row as ones entering the screen (top offset within row px) and lights them up in turn — a different row restarts the order count
  const pending = new Set();
  let io = null, ticking = false, gate = null;
  const conf = { stagger: 0.09, max: 0.45, row: 200, margin: "0px 0px -12% 0px" };
  const show = (el, delay) => {
    pending.delete(el);
    io?.unobserve(el);
    if (delay) el.style.setProperty("--fx-d", Math.round(delay * 1000) / 1000 + "s");
    el.classList.add("is-fx-in");
    const clean = () => {
      clearTimeout(t);
      el.classList.remove("is-fx-wait", "is-fx-in");
      el.style.removeProperty("--fx-d");
    };
    const t = setTimeout(clean, 2600 + delay * 1000);
    el.addEventListener("transitionend", function end(e) {
      if (e.target !== el || e.propertyName !== "opacity") return;
      el.removeEventListener("transitionend", end);
      clean();
    });
  };
  const rowOf = (el) => {
    const top = el.getBoundingClientRect().top;
    return [...pending].filter((o) => Math.abs(o.getBoundingClientRect().top - top) <= conf.row);
  };
  const sweep = () => {
    ticking = false;
    pending.forEach((el) => { if (el.getBoundingClientRect().bottom < 0) show(el, 0); });
  };
  const onScroll = () => { if (!ticking && pending.size) { ticking = true; requestAnimationFrame(sweep); } };
  const ensure = () => {
    if (io) return;
    io = new IntersectionObserver((entries) => {
      let n = 0;
      const seen = new Set();
      entries.forEach((e) => {
        if (!e.isIntersecting || seen.has(e.target) || !pending.has(e.target)) return;
        const row = rowOf(e.target);
        row.forEach((m) => seen.add(m));
        row.forEach((m) => show(m, Math.min(n++ * conf.stagger, conf.max)));
      });
    }, { rootMargin: conf.margin, threshold: 0.01 });
    addEventListener("scroll", onScroll, { passive: true });
  };
  // If a loader panel (is-fx-preload) exists, don’t measure until it lifts — so everything doesn’t finish turning on beneath the panel
  const whenReady = (fn) => {
    const root = document.documentElement;
    if (!root.classList.contains("is-fx-preload")) return requestAnimationFrame(fn);
    if (!gate) {
      gate = [];
      const mo = new MutationObserver(() => {
        if (root.classList.contains("is-fx-preload")) return;
        mo.disconnect();
        const list = gate; gate = null;
        requestAnimationFrame(() => list.forEach((f) => f()));
      });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    }
    gate.push(fn);
  };
  kfFx.register("row-fade-in", (el, { options, reduce }) => {
    if (reduce) return;
    if (options.stagger != null) conf.stagger = +options.stagger;
    if (options.max != null) conf.max = +options.max;
    if (options.row) conf.row = +options.row;
    if (options.dur != null) el.style.setProperty("--fx-dur", options.dur + "s");
    el.classList.add("is-fx-wait");
    let live = true;
    whenReady(() => {
      if (!live) return;
      ensure();
      pending.add(el);
      io.observe(el);
      sweep();
    });
    return () => {
      live = false;
      pending.delete(el);
      io?.unobserve(el);
      el.classList.remove("is-fx-wait", "is-fx-in");
      el.style.removeProperty("--fx-d");
      el.style.removeProperty("--fx-dur");
      if (!pending.size && io) { io.disconnect(); io = null; removeEventListener("scroll", onScroll); }
    };
  });
})();
