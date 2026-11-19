// Inside the button, lay a grid of square cells dividing the height into rows lines, and on hover progress p rises linearly 0→1 (ease none) and
// Cells that cross a random threshold set per cell turn on, so the button fills dot by dot with opposite-color pixels. Duration is remaining distance × dur (.38s).
(() => {
  const hash = (n) => { const t = Math.sin(n * 127.1 + 311.7) * 43758.5453; return t - Math.floor(t); };
  let count = 0;
  kfFx.register("tile-fill-btn", (el, { options, reduce, hover }) => {
    const rows = parseInt(options.rows, 10) || 4;
    const dur = +(options.dur ?? 0.38), back = +(options.back ?? 1) || 1;
    const seed = ++count;
    const layer = document.createElement("span");
    layer.className = "fx-tfb__tiles";
    layer.setAttribute("aria-hidden", "true");
    el.prepend(layer);
    const state = { p: 0 };
    let tiles = [], marks = [], on = [], tween = null;
    const apply = () => {
      for (let i = 0; i < tiles.length; i++) {
        const v = state.p >= marks[i];
        if (v !== on[i]) { on[i] = v; tiles[i].classList.toggle("is-on", v); }
      }
    };
    const build = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const cols = Math.max(1, Math.round(width / (height / rows)));
      if (tiles.length === cols * rows) return;
      layer.textContent = "";
      layer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      layer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
      tiles = []; marks = [];
      for (let i = 0; i < cols * rows; i++) {
        const t = document.createElement("i");
        layer.appendChild(t);
        tiles.push(t);
        marks.push(0.02 + 0.96 * hash(seed * 7919 + i));
      }
      on = tiles.map(() => false);
      apply();
    };
    const go = (to) => {
      if (reduce || !window.gsap) { state.p = to; apply(); return; }
      tween?.kill();
      tween = gsap.to(state, { p: to, duration: (dur * Math.abs(to - state.p)) / (to < state.p ? back : 1), ease: "none", onUpdate: apply });
    };
    const narrow = matchMedia(`(max-width: ${parseInt(options.narrow, 10) || 1024}px)`);
    const enter = (e) => { if (narrow.matches) return; if (e.pointerType === "mouse" || (e.pointerType !== "touch" && hover)) go(1); };
    const leave = () => { if (!el.matches(":focus-visible")) go(0); };
    const focus = () => { if (el.matches(":focus-visible")) go(1); };
    const blur = () => { if (!el.matches(":hover")) go(0); };
    const ro = new ResizeObserver(build);
    ro.observe(el);
    build();
    el.classList.add("fx-tfb");
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("focus", focus);
    el.addEventListener("blur", blur);
    return () => {
      tween?.kill();
      ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focus", focus);
      el.removeEventListener("blur", blur);
      el.classList.remove("fx-tfb");
      layer.remove();
    };
  });
})();
