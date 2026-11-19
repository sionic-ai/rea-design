// Subpage — work grid filter chips, the View more tag following the cursor over a photo.
(() => {
  const chips = [...document.querySelectorAll(".wk__chips button")];
  const cards = [...document.querySelectorAll(".wk__card")];
  chips.forEach((c) => c.addEventListener("click", () => {
    chips.forEach((o) => o.classList.toggle("is-on", o === c));
    const kind = c.dataset.kind;
    cards.forEach((card) => {
      card.style.opacity = "0";
      setTimeout(() => { card.classList.toggle("is-out", kind !== "all" && card.dataset.kind !== kind); card.style.opacity = ""; }, 350);
    });
  }));

  document.querySelectorAll(".rk-shot > a").forEach((a) => {
    const tag = a.querySelector(".rk-follow");
    if (!tag) return;
    a.addEventListener("pointermove", (e) => {
      const r = a.getBoundingClientRect();
      tag.style.transform = `translate(${Math.min(e.clientX - r.left + 14, r.width - tag.offsetWidth)}px, ${Math.min(e.clientY - r.top + 14, r.height - tag.offsetHeight)}px)`;
    });
  });
})();
