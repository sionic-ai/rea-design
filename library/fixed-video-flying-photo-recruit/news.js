// Blog and notices — featured posts use the same Splide 4.1.4 fade as the original (5s interval · 1s transition · rewind), and with each slide the bar in the 「current — total」 cell fills over 5s linear
(() => {
  const root = document.querySelector("[data-pickup-slider]");
  if (!root) return;
  const cur = root.querySelector(".ky-pick__cur");
  const total = root.querySelector(".ky-pick__total");
  const bar = root.querySelector(".ky-pick__bar");
  const s = new Splide(root, { type: "fade", autoplay: true, rewind: true, interval: 5000, speed: 1000, pagination: false, arrows: false }).mount();
  const count = () => { cur.textContent = s.index + 1; total.textContent = s.length; };
  // Original: reset the bar to 0, then after 50ms go to 100% over 5000ms linear
  const run = () => {
    bar.style.transition = "none";
    bar.style.width = "0%";
    setTimeout(() => { bar.style.transition = "width 5000ms linear"; bar.style.width = "100%"; }, 50);
  };
  s.on("active", () => { count(); run(); });
  count();
  run();
})();
