// Journal — place card photo swap (same Swiper overlap as the original 1.5s · every 5.5s, the current dot’s ring fills in 5s), category picker box open and close
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".jr-swiper").forEach((el) => {
    const many = el.querySelectorAll(".swiper-slide").length > 1;
    new Swiper(el, {
      effect: "fade", fadeEffect: { crossFade: true }, loop: many, speed: reduce ? 0 : 1500,
      autoplay: reduce || !many ? false : { delay: 5500 },
      pagination: { el: el.querySelector(".swiper-pagination"), clickable: true, renderBullet: (i, cls) => `<button type="button" class="${cls}" aria-label="${i + 1}Nth photo"></button>` },
    });
  });
  const pick = document.querySelector("[data-pick]");
  if (pick) {
    const btn = pick.querySelector(".trigger");
    // The original starts with the box open on large screens (closed removed) and pressing closes it
    if (innerWidth >= 768) { pick.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
    btn.addEventListener("click", () => { const on = pick.classList.toggle("is-open"); btn.setAttribute("aria-expanded", on ? "true" : "false"); });
    // The original goes to that category’s address on pressing an item — the copy only moves the selected mark and leaves the box as is
    pick.querySelectorAll(".opts li").forEach((li) => li.addEventListener("click", () => {
      pick.querySelectorAll(".opts li").forEach((o) => o.classList.toggle("is-on", o === li));
    }));
  }
})();
