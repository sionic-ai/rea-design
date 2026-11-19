// Home: fill product cards · hero fade slider (Embla Fade, loop, duration 30, auto 6s) · journal horizontal slider · starts after the loader.
(() => {
  const { icons, reduced } = window.MT;

  document.querySelector(".mv__mono").innerHTML = icons.mono;
  document.querySelectorAll('[data-arrow="short"]').forEach((s) => (s.outerHTML = icons.shortArrow));

  const sets = {
    new: [
      ["Boston bag cutout · front view · light gray background · 3:4", "Product Name(M)", "₩000,000"],
      ["Boston bag cutout · front view · light gray background · 3:4", "Product Name(L)", "₩000,000"],
      ["Boston bag cutout · angled · light gray background · 3:4", "Product Name(XL)", "₩000,000"],
      ["Bifold wallet cutout · Front view · Dark navy leather · 3:4", "Wallet Name", "₩00,000"],
    ],
    rec: [
      ["Card wallet cutout · standing upright · light gray background · 3:4", "Wallet Name", "₩00,000"],
      ["Card holder cutout · light brown leather · 3:4", "Card Case Name With Long Title", "₩00,000"],
      ["Bifold wallet cutout · Front view · Black leather · 3:4", "Compact Name", "₩00,000"],
      ["Card case cutout · single color stripe · 3:4", "Case Name", "₩00,000"],
    ],
  };
  document.querySelectorAll("[data-cards]").forEach((box) => {
    box.innerHTML =
      sets[box.dataset.cards]
        .map(
          ([label, title, price]) => `<article class="product-card"><a href="#">
        <div class="product-card__image-area"><span class="wf-img mt-img--light" data-label="${label}"></span></div>
        <div class="product-card__text-area" data-label="Product English name · outer × lining leather names · price">
          <h2 class="product-card__title">${title}</h2>
          <p class="product-card__leather">Leather Name×Lining(00)</p>
          <p class="product-card__price">${price} (tax incl.)</p>
        </div></a></article>`
        )
        .join("") + `<p class="product-list__link u-pc"><a href="#"><span>View All</span>${icons.longArrow}</a></p>`;
  });

  const journal = document.querySelector(".journal__container");
  journal.querySelector(".journal__nav--next").addEventListener("click", () => journal.classList.add("is-next"));
  journal.querySelector(".journal__nav--prev").addEventListener("click", () => journal.classList.remove("is-next"));
  // Journal arrow cursor (47×8 thin line) — CSS cursor images can’t take var(), so it reads the skin’s ink color and draws it
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
  const arrow = (d, hot, fallback) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='47' height='8' viewBox='0 0 47 8' fill='none' stroke='${ink}'><path d='${d}'/></svg>`)}") ${hot}, ${fallback}`;
  journal.querySelector(".journal__nav--next").style.cursor = arrow("M0 3.7h46M42.8.4l3.3 3.3-3.3 3.3", "46 4", "e-resize");
  journal.querySelector(".journal__nav--prev").style.cursor = arrow("M47 3.7H1M4.2.4.9 3.7l3.3 3.3", "1 4", "w-resize");

  // As in the original, Embla with Fade and Autoplay (6s) — loop, duration 30, also advances by dragging
  const startSlider = () => {
    const vp = document.querySelector(".mv__slider .embla__viewport");
    if (!vp || !window.EmblaCarousel) return;
    EmblaCarousel(vp, { loop: true, duration: 30 }, [EmblaCarouselFade(), ...(reduced ? [] : [EmblaCarouselAutoplay({ delay: 6000 })])]);
  };

  window.MT.startLoaded(startSlider);
})();
