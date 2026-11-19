(() => {
  // Room photo slider — clones attached at both ends to loop endlessly. One step in .4s every 4s, and pressing an arrow or dot restarts the 4s count
  const track = document.querySelector(".su-rmv__track");
  const rail = document.querySelector(".su-rmv__slides");
  const dotsBox = document.querySelector(".su-rmv__dots");
  if (!track || !rail) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const real = [...rail.children];
  const n = real.length;
  if (n < 2) return;
  rail.prepend(real[n - 1].cloneNode(true));
  rail.append(real[0].cloneNode(true));
  const dots = real.map((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `${i + 1}Photo No.`);
    d.addEventListener("click", () => { go(i + 1); restart(); });
    dotsBox?.append(d);
    return d;
  });
  let pos = 1, timer = 0;
  const place = (animate) => {
    const slide = rail.children[pos];
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const w = slide.getBoundingClientRect().width;
    const offset = (track.clientWidth - w) / 2;
    rail.style.transition = animate && !reduce ? "" : "none";
    rail.style.transform = `translateX(${offset - pos * (w + gap)}px)`;
    dots.forEach((d, k) => d.classList.toggle("is-on", k === (pos - 1 + n) % n));
  };
  const go = (p) => { pos = p; place(true); };
  rail.addEventListener("transitionend", () => {
    if (pos === 0) { pos = n; place(false); }
    if (pos === n + 1) { pos = 1; place(false); }
  });
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(pos + 1), 4000); };
  track.querySelector(".is-prev")?.addEventListener("click", () => { go(pos - 1); restart(); });
  track.querySelector(".is-next")?.addEventListener("click", () => { go(pos + 1); restart(); });
  addEventListener("resize", () => place(false));
  place(false);
  restart();
})();
