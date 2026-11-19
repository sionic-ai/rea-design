// About — six-section pinned story (one section = 1.5 screens), swaps the fixed number·image to match the task passing the screen center
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.body.dataset.areaIndex = "0";
  addEventListener("loaded", () => new HtStepKV({ kv: ".ab-kv", page: ".ab-kv__page", mode: "vh", ratio: 1.5, nav: ".ab-kv__nav" }));

  const items = [...document.querySelectorAll(".ab-item")];
  const heads = document.querySelectorAll(".ab-item__head.is-pc"), figs = document.querySelectorAll(".ab-item__figure.is-pc");
  let cur = -1;
  const check = () => {
    const mid = innerHeight / 2;
    const i = items.findIndex((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (i === cur) return;
    cur = i;
    heads.forEach((h, k) => h.classList.toggle("is-current", k === i));
    figs.forEach((f, k) => f.classList.toggle("is-current", k === i));
  };
  addEventListener("scroll", check, { passive: true });
  check();
})();
