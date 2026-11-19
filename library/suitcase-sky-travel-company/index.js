// First page — service cards and pick-and-view cards stamped from the same frame, with pick-and-view hung on the same swiper as the original (1.8 slides, 30px, scrollbar)
(() => {
  const { ARROW, btn } = window.kkParts;
  const light = document.querySelector(".kk-entrance__btn");
  if (light) light.innerHTML = btn("Your button text here", "about.html", true);

  const pick = document.querySelector("[data-pick]");
  if (pick) {
    const items = [
      ["Fireworks night sky · Over the river · Landscape", "Your browse-by-choice title here, in about two lines. Second line"],
      ["Harbor night view · Blue evening · Landscape", "Your two-line browse title here"],
      ["Hand holding a phone screen · bright · landscape", "Your browse-by-choice title here, in about two lines. Second line"],
      ["Train station platform · daytime · landscape", "Your one-and-a-half-line Browse by Category title here"],
    ];
    pick.innerHTML = `<div class="swiper-wrapper">${items
      .map(([photo, title]) => `
<article class="swiper-slide kk-pickcard"><a href="news.html">
  <div class="kk-card"><div class="kk-card__in"><div class="kk-card__img is-bite"><div class="kk-card__ph"><div class="wf-img" data-label="${photo}"></div></div></div><div class="kk-card__icon">${ARROW}</div></div></div>
  <p class="kk-pickcard__title">${title}</p>
  <p class="kk-pickcard__ex">Your four or so line news summary here. The following text goes here. The following text goes here. The closing text here…</p>
  <div class="kk-info"><span>Category</span><time>0000.00.00</time></div>
</a></article>`)
      .join("")}<div class="swiper-slide"></div></div><div class="kk-pick__bar"></div>`;
    document.querySelectorAll(".kk-pick__arrow").forEach((b) => (b.innerHTML = b.classList.contains("is-prev") ? ARROW.replace("<svg", '<svg style="transform:scaleX(-1)"') : ARROW));
    new Swiper(pick, {
      loop: false,
      slidesPerView: 1.8,
      spaceBetween: 30,
      navigation: { nextEl: ".kk-pick__arrow.is-next", prevEl: ".kk-pick__arrow.is-prev" },
      scrollbar: { el: ".kk-pick__bar" },
    });
  }
})();
