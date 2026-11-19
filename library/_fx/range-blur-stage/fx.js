// Fades the video stage pinned to the screen only between two markers. On every scroll the original 「start marker center ≤ y < Look at the pause marker ”top end”
// Only swaps classes, and the blur and cover are handled by a css transition (1.6s cubic-bezier(.19,1,.22,1)) — not tied to scroll, it spreads once when the threshold is crossed
(() => {
  kfFx.register("range-blur-stage", (el, { options, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]') || el;
    const pick = (sel) => (sel ? document.querySelector(sel) : null);
    const from = pick(options.from), to = pick(options.to);
    const at = +(options.at ?? 0.5);
    const keep = options["keep-veil"] !== "false";
    el.style.setProperty("--fx-blur", `${+(options.blur ?? 24)}px`);
    el.style.setProperty("--fx-veil", String(+(options.veil ?? 0.5)));
    el.style.setProperty("--fx-dur", `${+(options.dur ?? 1.6)}s`);
    if (options.ease) el.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    media.classList.add("fx-blur-media");
    const src = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    const topOf = (n) => n.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) + pos();
    let ticking = false;
    const check = () => {
      ticking = false;
      const y = pos();
      const view = scroller ? scroller.clientHeight : innerHeight;
      const start = from ? topOf(from) + from.offsetHeight * at : view * +(options.start ?? 1);
      const stop = to ? topOf(to) : Infinity;
      el.classList.toggle("fx-blur", y >= start && y < stop);
      el.classList.toggle("fx-veil", keep ? y >= start : y >= start && y < stop);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    src.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    check();
    return () => {
      src.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      el.classList.remove("fx-blur", "fx-veil");
      media.classList.remove("fx-blur-media");
      ["--fx-blur", "--fx-veil", "--fx-dur", "--fx-ease"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
