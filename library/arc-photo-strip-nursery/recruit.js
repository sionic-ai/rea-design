// Careers page — loader (shown .5s, lifts after 3s+ since opening, ends 1s later → Hero cycle starts), circle list swiper
// The original script has a circle that follows the cursor, but its element is not on the page so it is never visible — so we do not build it
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loading = document.querySelector(".sr-loading"), mv = document.querySelector(".sr-mv");
  const finish = () => { loading?.classList.add("is-complete"); mv?.classList.add("is-active"); };
  if (!loading || reduce) finish();
  else {
    const t0 = performance.now();
    setTimeout(() => loading.classList.add("is-shown"), 500);
    const go = () => setTimeout(() => { loading.classList.add("is-loaded"); setTimeout(finish, 1000); }, Math.max(0, 3000 - (performance.now() - t0)));
    if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  }

  // Menu button — opens the same menu overlay as the first page
  const navBtn = document.querySelector(".sr-navbtn"), nav = document.querySelector(".ss-nav");
  navBtn?.addEventListener("click", () => { const on = nav.classList.toggle("is-open"); navBtn.classList.toggle("is-open", on); document.body.classList.toggle("is-open", on); });

  const info = document.querySelector(".sr-info__slider");
  if (info && window.Swiper) {
    new Swiper(info, {
      slidesPerView: "auto", spaceBetween: 80, grabCursor: true, loop: false,
      navigation: { prevEl: ".sr-info__btn.is-prev", nextEl: ".sr-info__btn.is-next" },
      pagination: { el: ".sr-info__pager" }, scrollbar: { el: ".sr-info__bar" },
    });
  }
})();
