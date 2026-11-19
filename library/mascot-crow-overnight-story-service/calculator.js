/* Savings calculator — changing the amount or category makes the max support (2x the amount) and the fee digits change over 0.6 seconds */
(() => {
  const { reduce } = window.CFS;
  const trip = document.querySelector("[data-trip]");
  const cover = document.querySelector("[data-cover]");
  const fee = document.querySelector("[data-fee]");
  const chips = [...document.querySelectorAll("[data-chips] button")];
  const seg = [...document.querySelectorAll("[data-seg] button")];
  let rate = 0.03;
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const state = { cover: 50000, fee: 750 };
  const update = () => {
    const v = Number(String(trip.value).replace(/[^\d]/g, "")) || 0;
    const to = { cover: v * 2, fee: v * rate };
    gsap.to(state, { ...to, duration: reduce ? 0 : 0.6, ease: "power2.out", onUpdate: () => { cover.textContent = money(state.cover); fee.textContent = money(state.fee); } });
  };
  trip.addEventListener("input", update);
  trip.addEventListener("blur", () => { trip.value = money(Number(String(trip.value).replace(/[^\d]/g, "")) || 0); });
  chips.forEach((c, i) => c.addEventListener("click", () => { chips.forEach((x) => x.classList.toggle("is-on", x === c)); rate = 0.03 + i * 0.002; update(); }));
  seg.forEach((c) => c.addEventListener("click", () => seg.forEach((x) => x.classList.toggle("is-on", x === c))));
})();
