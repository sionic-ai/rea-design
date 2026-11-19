// Campaign: payment table tabs (outer housing type · inner plan), other perks slider (original l-swiper: auto width · loop · 300ms · 24px)
(() => {
  document.querySelectorAll("[data-tabs]").forEach((box) => {
    const bar = box.querySelector(":scope > [role=tablist], :scope > div > [role=tablist]");
    if (!bar) return;
    const btns = [...bar.querySelectorAll("button")];
    const panels = [...box.querySelectorAll(":scope > .cp-tab__panel")];
    if (!panels.length) return;
    btns.forEach((b, i) => b.addEventListener("click", () => {
      btns.forEach((x, j) => { x.classList.toggle("is-on", j === i); x.setAttribute("aria-selected", String(j === i)); });
      panels.forEach((p, j) => p.classList.toggle("is-on", j === i));
    }));
  });
  if (window.Swiper) {
    const el = document.querySelector(".cp-more__swiper .swiper");
    if (el) new Swiper(el, { slidesPerView: "auto", loop: true, speed: 300, spaceBetween: 24, pagination: { el: ".cp-more__pager", clickable: true } });
  }
})();
