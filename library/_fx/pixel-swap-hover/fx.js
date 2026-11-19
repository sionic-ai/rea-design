(() => {
  kfFx.register("pixel-swap-hover", (el, { options, reduce, hover }) => {
    const swap = el.querySelector(':scope > [data-fx-part="swap"]');
    if (!swap || reduce) return;
    const n = Math.max(1, Math.round(+options.grid || 8)), dur = Math.max(0, +(options.dur ?? 0.4)), step = 100 / n;
    const grid = document.createElement("div");
    grid.className = "fx-pxs-grid";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const p = document.createElement("i");
      Object.assign(p.style, { width: step + "%", height: step + "%", left: c * step + "%", top: r * step + "%" });
      grid.append(p);
    }
    el.append(grid);
    const cells = grid.children, each = dur / cells.length;
    let on = false, call = null;
    const show = (to) => { swap.style.display = to ? "block" : "none"; };
    const run = (to) => {
      on = to;
      gsap.killTweensOf(cells);
      call?.kill();
      if (!dur) { show(to); return; }
      gsap.set(cells, { display: "none" });
      gsap.to(cells, { display: "block", duration: 0, stagger: { each, from: "random" } });
      call = gsap.delayedCall(dur, () => show(to));
      gsap.to(cells, { display: "none", duration: 0, delay: dur, stagger: { each, from: "random" } });
    };
    const enter = () => !on && run(true), leave = () => on && run(false), tap = () => run(!on);
    if (hover) { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); }
    else el.addEventListener("click", tap);
    return () => {
      el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.removeEventListener("click", tap);
      call?.kill(); gsap.killTweensOf(cells); grid.remove(); swap.style.display = "";
    };
  });
})();
