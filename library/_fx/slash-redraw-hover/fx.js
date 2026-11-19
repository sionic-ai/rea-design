(() => {
  // On hover it spins once all the way — if released while spinning (lock) it reverts after finishing, and hovering again starts from the beginning
  kfFx.register("slash-redraw-hover", (el, { options, hover }) => {
    if (!hover) return;
    const lock = +(options.lock ?? 700);
    let running = false, left = false, timer = 0;
    const enter = () => {
      left = false;
      if (running) return;
      el.classList.add("is-hover");
      running = true;
      timer = setTimeout(() => { running = false; if (left) el.classList.remove("is-hover"); }, lock);
    };
    const leave = () => { if (running) left = true; else el.classList.remove("is-hover"); };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => { clearTimeout(timer); el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); el.classList.remove("is-hover"); };
  });
})();
