// One section progress value paints the needle position and the horizontal scale of 21 ticks — the original uses CSS view-timeline, here it is ScrollTrigger progress.
(() => {
  kfFx.register("scroll-ladder", (el, { options, reduce, scroller }) => {
    let made = null;
    if (!el.querySelector("[data-fx-part=track]")) {
      made = document.createElement("div");
      made.setAttribute("data-fx-part", "track");
      let html = "";
      for (let b = 0; b <= 20; b += 5) {
        html += `<i data-fx-part="rung" data-i="${b}"></i>`;
        if (b < 20) html += `<span data-fx-part="group">${[0, 1, 2, 3].map((k) => `<i data-fx-part="rung" data-i="${b + 1 + k}" style="top:${-0.5 + k * 8}px"></i>`).join("")}</span>`;
      }
      made.innerHTML = html + '<i data-fx-part="needle"></i>';
      el.setAttribute("aria-hidden", "true");
      el.append(made);
    }
    const needle = el.querySelector("[data-fx-part=needle]");
    const rungs = [...el.querySelectorAll("[data-fx-part=rung]")].map((r, i) => ({ r, i: r.dataset.i != null ? +r.dataset.i : i }));
    const travel = +(options.travel ?? 164), wave = +(options.wave ?? 0.15) || 0.15, sq = +(options.squeeze ?? 0.45);
    const io = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const paint = (p) => {
      if (needle) needle.style.transform = `translateY(${(travel * p).toFixed(2)}px)`;
      for (const { r, i } of rungs) {
        const t = Math.min(1, Math.max(0, (p - (i * 0.05 - wave)) / (wave * 2)));
        const s = t < 0.5 ? 1 - (1 - sq) * io(t * 2) : sq + (1 - sq) * io((t - 0.5) * 2);
        r.style.transform = `scaleX(${s.toFixed(3)})`;
      }
    };
    paint(0);
    if (reduce || !window.ScrollTrigger) return () => made && made.remove();
    gsap.registerPlugin(ScrollTrigger);
    const trigger = (options.trigger && (el.closest(options.trigger) || document.querySelector(options.trigger))) || el.closest("section") || el.parentElement;
    const st = ScrollTrigger.create({
      trigger, scroller: scroller || undefined, start: options.start || "top top", end: options.end || "bottom bottom",
      onUpdate: (s) => paint(s.progress), onRefresh: (s) => paint(s.progress),
    });
    return () => { st.kill(); made && made.remove(); };
  });
})();
