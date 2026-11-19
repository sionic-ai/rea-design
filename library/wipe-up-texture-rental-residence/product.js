// Property search — open and close the phone filter drawer, picking a large area makes all districts below follow and picking all districts turns the large area on, clear all per group.
(() => {
  const body = document.body;
  const filter = document.getElementById("tr-filter");
  const open = () => { filter.classList.add("is-open"); body.classList.add("is-bk-fixed"); };
  const close = () => { filter.classList.remove("is-open"); body.classList.remove("is-bk-fixed"); };
  document.getElementById("tr-filter-open")?.addEventListener("click", open);
  document.getElementById("tr-filter-close")?.addEventListener("click", close);
  document.getElementById("tr-filter-result")?.addEventListener("click", close);
  gsap.matchMedia().add("(min-width: 576px)", close);

  document.querySelectorAll(".js-area-item").forEach((item) => {
    const parent = item.querySelector(".js-area-parent input");
    const kids = item.querySelectorAll(".js-area-child input");
    parent?.addEventListener("change", () => kids.forEach((k) => (k.checked = parent.checked)));
    kids.forEach((k) => k.addEventListener("change", () => {
      if (parent) parent.checked = item.querySelectorAll(".js-area-child input:checked").length === kids.length;
    }));
  });
  const reset = (btn, sel) => btn?.addEventListener("click", () => document.querySelectorAll(sel).forEach((i) => (i.checked = false)));
  reset(document.getElementById("tr-area-reset"), ".area input");
  reset(document.getElementById("tr-plan-reset"), ".plan input");
})();
