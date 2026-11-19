(() => {
  // The original samples the mouse position after a 50ms pause (every 100ms while moving), then moves to it each frame while a CSS transition (.3s ease-out) catches up — so the circle arrives late, in a stuttering way
  kfFx.register("view-disc-cursor", (el, { options, hover }) => {
    if (!hover) return;
    let disc = el.querySelector(':scope > [data-fx-part="disc"]');
    const made = !disc;
    if (made) {
      disc = document.createElement("span");
      disc.dataset.fxPart = "disc";
      disc.setAttribute("aria-hidden", "true");
      const label = document.createElement("span");
      label.dataset.fxPart = "label";
      label.textContent = options.text || "VIEW";
      disc.append(label);
      el.append(disc);
    }
    const wait = +(options.wait ?? 50), most = +(options.most ?? 100);
    el.style.setProperty("--fx-follow", +(options.follow ?? 0.3) + "s");
    let x = +(options.x ?? 0), y = +(options.y ?? 0), px = x, py = y, firstPending = 0, timer = 0, raf = 0;
    const commit = () => { x = px; y = py; firstPending = 0; };
    const move = (e) => {
      px = e.clientX; py = e.clientY;
      const now = performance.now();
      if (!firstPending) firstPending = now;
      clearTimeout(timer);
      if (now - firstPending >= most) { commit(); return; }
      timer = setTimeout(commit, wait);
    };
    const tick = () => { disc.style.transform = `matrix(1, 0, 0, 1, ${x}, ${y})`; raf = requestAnimationFrame(tick); };
    el.addEventListener("mousemove", move);
    raf = requestAnimationFrame(tick);
    el.classList.add("is-fx-disc");
    return () => {
      el.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.classList.remove("is-fx-disc");
      el.style.removeProperty("--fx-follow");
      if (made) disc.remove(); else disc.style.removeProperty("transform");
    };
  });
})();
