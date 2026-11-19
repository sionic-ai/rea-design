(() => {
  // The original list draws cards from server data — sixteen cards of the same type as placeholders
  const grid = document.querySelector(".p-grid");
  const card = (i) => `<li class="p-card"><a href="product.html">
    <span class="p-card__img wf-img" data-label="Game cover art · landscape 2:1"></span>
    <b class="p-card__name">Your software name here ${String(i + 1).padStart(2, "0")}</b>
    <span class="p-card__meta"><time>0000.0.00</time><small>Company name</small><small>Package edition / Download edition</small></span>
    <i class="p-card__age" aria-label="Age rating">A</i></a></li>`;
  grid.innerHTML = Array.from({ length: 16 }, (_, i) => card(i)).join("");
  document.querySelectorAll(".p-tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".p-tabs button").forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-selected", String(o === b)); });
  }));
  const clear = document.querySelector(".p-search i"), input = document.querySelector(".p-search input");
  clear.addEventListener("click", () => { input.value = ""; input.focus(); });
})();
