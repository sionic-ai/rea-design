// Subpage: the side table of contents next to Careers marks the section being read, column list tabs filter posts, and related posts below an article scroll via the same Swiper as the original.
(() => {
  const side = document.querySelectorAll(".rc-side a");
  side.forEach((a) => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", toggleClass: { targets: a, className: "is-current" } });
  });

  const tabs = document.querySelectorAll(".archive__tabs button");
  const posts = document.querySelectorAll(".archive__grid .post");
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((b) => { b.classList.toggle("is-on", b === t); b.setAttribute("aria-selected", String(b === t)); });
    posts.forEach((p) => (p.hidden = i > 0 && p.dataset.cat !== t.textContent.trim()));
  }));

  addEventListener("load", () => {
    document.querySelectorAll(".js-related").forEach((el) => {
      const wrap = el.closest(".slider__wrap");
      new Swiper(el, { slidesPerView: "auto", spaceBetween: 19, loop: false, navigation: { nextEl: wrap.querySelector(".is-next"), prevEl: wrap.querySelector(".is-prev") } });
    });
  });
})();
