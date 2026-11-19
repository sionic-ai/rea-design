// Lines up shapes inside the svg by center x and assigns order from the left (the original’s heroMountain getBBox center). When it turns on:
// on: scroll (default — when the top edge reaches the screen start) · state (the nearest [data-shown] ancestor "1" When it becomes this — when it meshes with the using side’s entrance observer)
(() => {
  kfFx.register("svg-sweep-pop", (el, { options, reduce, scroller }) => {
    const shapes = [...el.querySelectorAll('svg :is(polygon, path, rect, circle, ellipse):not([data-fx-part="keep"])')];
    if (!shapes.length) return;
    const cx = (s) => { try { const b = s.getBBox(); return b.x + b.width / 2; } catch (e) { return 0; } };
    shapes.map((s) => ({ s, x: cx(s) })).sort((a, b) => a.x - b.x).forEach(({ s }, i) => s.style.setProperty("--fx-order", i));
    if (options.step != null) el.style.setProperty("--fx-step", `${+options.step}s`);
    if (options.delay != null) el.style.setProperty("--fx-delay", `${+options.delay}s`);
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    const on = () => el.classList.add("is-fx-in");
    const clear = () => { el.classList.remove("is-fx-in"); shapes.forEach((s) => s.style.removeProperty("--fx-order")); ["--fx-step", "--fx-delay", "--fx-dur"].forEach((p) => el.style.removeProperty(p)); };
    if (reduce) { on(); return clear; }
    if (options.on === "state") {
      const host = el.closest("[data-shown]") || el;
      const check = () => { if (host.getAttribute("data-shown") === "1") { on(); mo.disconnect(); } };
      const mo = new MutationObserver(check);
      mo.observe(host, { attributes: true, attributeFilter: ["data-shown"] });
      check();
      return () => { mo.disconnect(); clear(); };
    }
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: `top ${options.start ?? "85%"}`, once: true, onEnter: on });
    return () => { st.kill(); clear(); };
  });
})();
