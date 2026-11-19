// Draggable distance of the board = (panel − window)/2. The cross on the map follows at the same ratio
(() => {
  kfFx.register("drag-pan-map", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      gsap.registerPlugin(Draggable, InertiaPlugin);
      const board = el.querySelector("[data-fx-part=board]"), map = el.querySelector("[data-fx-part=map]"), cross = el.querySelector("[data-fx-part=cross]");
      if (!board) return;
      const bx = () => Math.max(0, (board.offsetWidth - el.offsetWidth) / 2), by = () => Math.max(0, (board.offsetHeight - el.offsetHeight) / 2);
      const kx = () => (map.clientWidth - cross.offsetWidth) / 2, ky = () => (map.clientHeight - cross.offsetHeight) / 2;
      const sync = () => {
        if (!cross) return;
        gsap.set(cross, { x: (bx() ? -gsap.getProperty(board, "x") / bx() : 0) * kx(), y: (by() ? -gsap.getProperty(board, "y") / by() : 0) * ky() });
      };
      const bounds = () => ({ minX: -bx(), maxX: bx(), minY: -by(), maxY: by() });
      const drag = Draggable.create(board, { type: "x,y", trigger: el, bounds: bounds(), inertia: true, throwResistance: +(options.throw ?? 1500), maxDuration: +(options.max ?? 1.5), edgeResistance: +(options.edge ?? 0.9), dragClickables: true, onDrag: sync, onThrowUpdate: sync })[0];
      addEventListener("resize", () => { drag.applyBounds(bounds()); sync(); }, { signal });
      signal.addEventListener("abort", () => Draggable.get(board)?.kill());
      // Arrow keys move one step at a time (keys px), and the center button returns the panel to its starting position
      const step = +(options.keys ?? 0);
      if (step) addEventListener("keydown", (e) => {
        const d = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (!d || e.target.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
        const cx = gsap.utils.clamp(-bx(), bx()), cy = gsap.utils.clamp(-by(), by());
        gsap.to(board, { x: cx(gsap.getProperty(board, "x") + d[0] * step), y: cy(gsap.getProperty(board, "y") + d[1] * step), duration: +(options["keys-dur"] ?? 0.2), ease: "power2.out", onUpdate: sync, onComplete: () => drag.update() });
      }, { signal });
      const center = el.querySelector("[data-fx-part=center]");
      center?.addEventListener("click", () => gsap.to(board, { x: 0, y: 0, duration: +(options["center-dur"] ?? 0.5), ease: options["center-ease"] ? kfFx.ease(options["center-ease"], "power1.out") : "power1.out", onUpdate: sync, onComplete: () => drag.update() }), { signal });
      center?.addEventListener("pointerdown", (e) => e.stopPropagation(), { signal });
      if (!map || !cross) return;
      const crossDrag = Draggable.create(cross, { type: "x,y", bounds: map,
        onPress(e) { e.stopPropagation(); drag.disable(); },
        onDrag() { gsap.set(board, { x: -(this.x / kx()) * bx(), y: -(this.y / ky()) * by() }); },
        onRelease() { drag.enable(); drag.update(); } })[0];
      signal.addEventListener("abort", () => crossDrag.kill());
      map.addEventListener("pointerdown", (e) => e.stopPropagation(), { signal });
      map.addEventListener("click", (e) => {
        if (e.target === cross) return;
        const r = map.getBoundingClientRect();
        const fx = ((e.clientX - r.left) / r.width) * 2 - 1, fy = ((e.clientY - r.top) / r.height) * 2 - 1;
        gsap.to(board, { x: -fx * bx(), y: -fy * by(), duration: 0.35, ease: "power3.out", onUpdate: sync, onComplete: () => drag.update() });
      }, { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
