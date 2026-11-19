// Category hero: item tab classification panel · size tab (press and only that tab’s panel shows) · category rows expand on press (.35s)
(() => {
  const tabs = [...document.querySelectorAll(".nw-tabs button")];
  const panels = [...document.querySelectorAll(".nw-panel")];
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.toggle("is-on", x === t));
    panels.forEach((p, k) => p.classList.toggle("is-on", k === i));
  }));
  const drop = document.querySelector(".nw-drop");
  const dropBtn = document.querySelector("[data-drop]");
  dropBtn.addEventListener("click", () => { drop.hidden = !drop.hidden; dropBtn.classList.toggle("is-open", !drop.hidden); });
  document.querySelectorAll(".nw-cat button").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));
})();
// Banner slide and product row — same Swiper 8.4.7 settings as the original. Banner: endless · centered · .5s · 5s autoplay (4.5s from the second slide) · autoplay kept after touch · horizontal wheel.
// Product row gets free drag only on wide screens (769px and up) (inertia 1, speed .35) — on narrow screens Swiper is released and the row scrolls horizontally by finger
(() => {
  const ring = '<svg viewBox="0 0 19 19" aria-hidden="true"><circle cx="9.5" cy="9.5" r="9"></circle></svg>';
  new Swiper(".nw-car", {
    speed: 500,
    direction: "horizontal",
    mousewheel: { direction: "horizontal", sensitivity: 1, forceToAxis: true },
    autoplay: { delay: 5000, disableOnInteraction: false },
    loop: true,
    centeredSlides: true,
    slidesPerView: 1,
    breakpoints: { 768: { slidesPerView: "auto" } },
    pagination: { el: ".nw-car .swiper-pagination", clickable: true, renderBullet: (i, cls) => `<li class="${cls}">${ring}</li>` },
    navigation: { nextEl: ".nw-car .swiper-button-next", prevEl: ".nw-car .swiper-button-prev" },
    on: { slideChange() { if (this.realIndex > 0) this.params.autoplay.delay = 4500; } },
  });

  const rows = [...document.querySelectorAll(".fm-row")];
  let made = [];
  const sync = () => {
    const wide = innerWidth > 768;
    if (wide && !made.length) {
      made = rows.map((row) => {
        const wrap = document.createElement("div");
        wrap.className = "swiper-wrapper";
        [...row.children].forEach((c) => { c.classList.add("swiper-slide"); wrap.appendChild(c); });
        row.classList.add("swiper");
        row.appendChild(wrap);
        return new Swiper(row, { direction: "horizontal", mousewheel: { direction: "horizontal", forceToAxis: true }, loop: false, slidesPerView: "auto", freeMode: { enabled: true, momentumRatio: 1, momentumVelocityRatio: 0.35 } });
      });
    } else if (!wide && made.length) {
      made.forEach((sw) => {
        const row = sw.el, wrap = row.querySelector(".swiper-wrapper");
        sw.destroy(true, true);
        [...wrap.children].forEach((c) => { c.classList.remove("swiper-slide"); row.appendChild(c); });
        wrap.remove();
        row.classList.remove("swiper");
      });
      made = [];
    }
  };
  addEventListener("load", sync);
  addEventListener("resize", sync);
})();
