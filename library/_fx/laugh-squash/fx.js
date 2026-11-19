(() => {
  // The character squashes for .42s around its feet now and then, as if smiling (width 1.03·height .9 → 1 → 1.02·.94 → 1).
  // First after 1~7s, then every 4~10s — rolled separately per element so several laugh at different times
  const rand = (a, b) => Math.round(Math.random() * (b - a)) + a;
  kfFx.register("laugh-squash", (el, { options, reduce }) => {
    if (reduce) return;
    const first = String(options.first || "1-7").split("-").map((n) => +n * 1000), every = String(options.every || "4-10").split("-").map((n) => +n * 1000);
    const dur = +(options.dur ?? 0.42);
    let id = null;
    const laugh = () => {
      el.classList.remove("fx-laughing");
      void el.offsetWidth;
      el.style.setProperty("--fx-dur", `${dur}s`);
      el.classList.add("fx-laughing");
      id = setTimeout(laugh, rand(every[0], every[1] ?? every[0]));
    };
    id = setTimeout(laugh, rand(first[0], first[1] ?? first[0]));
    const end = (e) => e.animationName === "fx-laugh-squash" && el.classList.remove("fx-laughing");
    el.addEventListener("animationend", end);
    return () => { clearTimeout(id); el.removeEventListener("animationend", end); el.classList.remove("fx-laughing"); el.style.removeProperty("--fx-dur"); };
  });
})();
