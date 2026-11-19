(() => {
  // bars vertical bars in the background color (width 1.1%, position i%) cover the photo, and when the plate enters the screen each bar uncovers with a different delay (0.01~0.3s)
  // Top edge falls downward (top 0 → 100%) as it clears — like blinds dropping one by one. The delay table is the original’s 100-slot values, and if bars differ the table repeats
  const TABLE = [24, 15, 23, 23, 17, 30, 14, 24, 15, 3, 21, 19, 2, 24, 7, 10, 8, 1, 27, 14, 23, 24, 8, 1, 28, 28, 8, 10, 20, 30, 28, 3, 8, 9, 12, 28, 7, 10, 13, 12, 30, 5, 12, 1, 5, 19, 4, 9, 26, 10, 13, 22, 12, 25, 1, 21, 14, 29, 30, 22, 2, 17, 25, 20, 21, 3, 4, 19, 22, 15, 22, 5, 3, 14, 24, 13, 4, 3, 25, 2, 20, 12, 6, 10, 20, 2, 7, 3, 14, 1, 10, 18, 16, 25, 1, 21, 12, 3, 17, 18];
  kfFx.register("bar-blind-reveal", (el, { options, reduce, scroller }) => {
    const n = Math.max(2, Math.round(+options.bars || 100));
    const dur = +(options.dur ?? 0.9), spread = +(options.spread ?? 1);
    const ease = options.ease || "0.645,0.045,0.355,1";
    const cover = document.createElement("span");
    cover.className = "fx-bbr";
    cover.setAttribute("aria-hidden", "true");
    const w = 100 / n;
    cover.innerHTML = Array.from({ length: n }, (_, i) => `<i style="left:${(i * w).toFixed(3)}%;width:${(w * 1.1).toFixed(3)}%;transition-delay:${((TABLE[i % 100] / 100) * spread).toFixed(3)}s"></i>`).join("");
    cover.style.setProperty("--fx-dur", `${dur}s`);
    cover.style.setProperty("--fx-ease", /^[\d.,\s-]+$/.test(ease) ? `cubic-bezier(${ease})` : ease);
    el.append(cover);
    const open = () => cover.classList.add("is-open");
    const close = () => cover.classList.remove("is-open");
    let io = null;
    if (reduce) open();
    else {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { open(); if (options.once !== "false") io.disconnect(); } else if (options.once === "false") close(); }, { root: scroller || null, threshold: +(options.threshold ?? 0) });
      io.observe(el);
    }
    el.addEventListener("fx:show", open);
    el.addEventListener("fx:hide", close);
    return () => { io?.disconnect(); el.removeEventListener("fx:show", open); el.removeEventListener("fx:hide", close); cover.remove(); };
  });
})();
