// Hero page scenes: sticky tabs (current tab and bar from scroll ratio), dark card stack (only one card opaque per scroll step)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original — section height (n+1)×100vh, progress = |top| / (height − window height), now = ⌊progress×n⌋, bar = Fractional part of progress×n
  document.querySelectorAll("[data-pin-tabs]").forEach((root) => {
    const desk = root.querySelector(".hm-tabs__desk");
    const tabs = [...root.querySelectorAll(".hm-tab")];
    const imgs = [...root.querySelectorAll(".hm-tabs__img")];
    const n = tabs.length;
    let cur = -2;
    const open = (i) => {
      tabs.forEach((t, k) => {
        const body = t.querySelector(".hm-tab__body");
        t.classList.toggle("is-on", k === i);
        body.style.height = k === i ? `${body.scrollHeight}px` : "0px";
      });
      imgs.forEach((im, k) => { im.classList.toggle("is-on", k === i); im.classList.toggle("is-prev", k === i - 1); });
    };
    const tick = () => {
      if (getComputedStyle(desk).display === "none") return;
      const r = desk.getBoundingClientRect();
      const span = r.height - innerHeight;
      const a = r.top > 0 ? -1 : Math.min(1, Math.abs(r.top) / span);
      const i = Math.min(n - 1, Math.max(0, Math.floor(a * n)));
      if (i !== cur) { cur = i; open(i); }
      const bar = tabs[i].querySelector(".hm-tab__bar i");
      bar.style.width = `${a <= 0 ? 0 : ((a * n) % 1) * 100}%`;
    };
    if (reduce) tabs.forEach((t) => { t.style.transition = "none"; });
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    tick();
  });

  // Original Stacked: section height is (card count+1)×50vh, and for each progress step only that card is 1 while the rest are .3 (.5s).
  document.querySelectorAll("[data-stack]").forEach((root) => {
    const cards = [...root.querySelectorAll(".hm-stack__card")];
    const dots = [...root.querySelectorAll(".hm-stack__dots i")];
    const wide = matchMedia("(min-width: 1024px)");
    root.style.height = wide.matches ? `${(cards.length + 1) * 50}vh` : "";
    const tick = () => {
      if (!wide.matches) { cards.forEach((c) => (c.style.opacity = "1")); return; }
      const r = root.getBoundingClientRect();
      const span = r.height - innerHeight;
      if (span <= 0) return;
      const i = Math.min(Math.floor(Math.min(Math.max(-r.top, 0) / span, 1) * cards.length), cards.length - 1);
      cards.forEach((c, k) => (c.style.opacity = k === i ? "1" : "0.3"));
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
    };
    addEventListener("scroll", tick, { passive: true });
    wide.addEventListener("change", () => { root.style.height = wide.matches ? `${(cards.length + 1) * 50}vh` : ""; tick(); });
    tick();
  });
})();
