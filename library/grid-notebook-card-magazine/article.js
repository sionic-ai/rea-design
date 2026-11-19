// Article detail — related posts slider (original article.js: only at 768px and up slick slidesToShow 3·variableWidth·infinite, below that unfolded vertically), Copy URL button
(() => {
  const $ = window.jQuery;
  const rec = $ && $.fn.slick ? $('[data-slider="rec"]') : null;
  let on = false;
  const fit = () => {
    if (!rec || !rec.length) return;
    if (innerWidth >= 768 && !on) {
      rec.slick({ slidesToShow: 3, slidesToScroll: 1, infinite: true, dots: false, arrows: true, centerMode: false, variableWidth: true,
        prevArrow: '<button type="button" class="slick-prev" aria-label="Previous post">Front</button>', nextArrow: '<button type="button" class="slick-next" aria-label="Next post">Next</button>' });
      on = true;
    } else if (innerWidth < 768 && on) {
      rec.slick("unslick");
      on = false;
    }
  };
  let t = 0;
  fit();
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fit, 250); });

  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    const was = b.textContent;
    try { await navigator.clipboard.writeText(location.href); b.textContent = "Copied"; } catch { b.textContent = "Can’t copy"; }
    setTimeout(() => { b.textContent = was; }, 1500);
  }));
})();
