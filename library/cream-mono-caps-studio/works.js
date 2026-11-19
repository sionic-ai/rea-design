// Work list filter — the original Bricks filter refetches the list from the server, but as a placeholder this filters directly by each card’s data-service·data-industry
(() => {
  const sels = [...document.querySelectorAll("[data-filter]")], cards = [...document.querySelectorAll(".wl__grid .pj")];
  if (!sels.length) return;
  const apply = () => {
    const want = Object.fromEntries(sels.map((s) => [s.dataset.filter, s.value]));
    cards.forEach((c) => c.classList.toggle("is-out", Object.entries(want).some(([k, v]) => v && c.dataset[k] !== v)));
    window.OS?.lenis?.resize();
  };
  // While filters change, the original dims the filter cell to .7 (time to refetch the list), and dims the clear button to 30% when nothing is chosen
  const wrap = document.querySelector(".wl__filters"), clear = document.querySelector("[data-filter-clear]");
  const busy = () => { wrap?.classList.add("is-busy"); setTimeout(() => wrap?.classList.remove("is-busy"), 2000); };
  const state = () => clear?.classList.toggle("is-off", sels.every((s) => !s.value));
  sels.forEach((s) => s.addEventListener("change", () => { busy(); apply(); state(); }));
  clear?.addEventListener("click", () => { sels.forEach((s) => (s.value = "")); busy(); apply(); state(); });
})();
