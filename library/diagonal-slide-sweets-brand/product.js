// Product list: fill the photo strip, light up group title letters as far as scroll progress, tapping a product opens a photo-flipping window.
// Original values: title progress PC .82→.34vh (phone .74→.30) · fully lit after .52 progress (phone .42) · window .12s linear · photo change Swiper .225s
(() => {
  const { reduced } = YK;
  const isSp = () => matchMedia("(max-width: 767px)").matches;

  const stripLabels = ["Product and fruit on a plate · from above", "Product between frame and flowers · from above", "Product on book stack · from above", "Product on metal tray · top view", "Product on lace fabric · top view", "Product on a slate slab · from above"];
  const strip = document.querySelector(".ph__strip-inner");
  strip.innerHTML = [...stripLabels, ...stripLabels, ...stripLabels, ...stripLabels].map((l) => `<div class="wf-img" data-label="${l} · Portrait 3:4"></div>`).join("");

  const titles = [...document.querySelectorAll("[data-col-chars]")].map((el) => ({ sec: el.closest(".cl-sec"), chars: [...YK.split(el, 0)], shown: -1 }));
  const update = () => {
    const vh = innerHeight;
    const a = vh * (isSp() ? 0.74 : 0.82), b = vh * (isSp() ? 0.3 : 0.34);
    titles.forEach((t) => {
      const p = Math.min(1, Math.max(0, (a - t.sec.getBoundingClientRect().top) / (a - b)) / (isSp() ? 0.42 : 0.52));
      const k = reduced ? t.chars.length : Math.floor(p * t.chars.length);
      if (k === t.shown) return;
      t.shown = k;
      t.chars.forEach((c, i) => c.classList.toggle("is-on", i < k));
    });
  };
  YK.onScroll = update;
  update();

  // ── Season bundle: same Swiper 11.2.10 as the original — phone 1.15 slides centered, gap 12, 4 slides with gap 15 from 768 up, drag off from 1280 up, transition .15s.
  //    On phones every group, on wide screens only the collaboration group reverses order (after 80ms), and on wide screens with 4 or fewer slots the arrows are turned off and pushed to the center (after 200ms)
  const grids = [...document.querySelectorAll(".cl-grid.swiper")].map((el) => new Swiper(el, {
    speed: 150, slidesPerView: 1.15, centeredSlides: true, spaceBetween: 12, loop: false,
    navigation: { prevEl: el.querySelector(".swiper-button-prev"), nextEl: el.querySelector(".swiper-button-next") },
    breakpoints: {
      768: { slidesPerView: 4, centeredSlides: false, spaceBetween: 15, slidesPerGroup: 1 },
      1280: { slidesPerView: 4, centeredSlides: false, spaceBetween: 15, slidesPerGroup: 1, allowTouchMove: false },
    },
  }));
  setTimeout(() => {
    grids.forEach((sw) => {
      const wrap = sw.wrapperEl;
      if (wrap.dataset.spReversed === "1" || (!isSp() && !sw.el.classList.contains("cl-grid--collab"))) return;
      [...wrap.querySelectorAll(".swiper-slide")].reverse().forEach((s) => wrap.appendChild(s));
      wrap.dataset.spReversed = "1";
      sw.update();
      sw.slideTo(0, 0);
    });
  }, 80);
  const centerFew = () => grids.forEach((sw) => {
    const few = !isSp() && sw.slides.length > 0 && sw.slides.length <= 4;
    sw.el.classList.toggle("cl-grid--nav-off", few);
    sw.params.centerInsufficientSlides = false;
    sw.update();
    if (!few) return;
    sw.slideTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const gap = parseFloat(sw.params.spaceBetween) || 0;
      const total = sw.slides.reduce((s, el, i) => s + el.offsetWidth + (i ? gap : 0), 0);
      sw.setTranslate(Math.max(0, (sw.width - total) / 2));
    }));
  });
  setTimeout(centerFew, 200);
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(centerFew, 150); });

  // ── Product window: same Swiper as the original (.225s slide, no loop, dot click) — set up fresh on each open, torn down on close
  const modal = document.querySelector(".pm");
  const slider = modal.querySelector(".pm__slider");
  const [prev, next] = modal.querySelectorAll(".pm__nav");
  let modalSwiper = null;
  const open = (item) => {
    modal.querySelector(".pm__season").textContent = item.closest(".cl-grid").dataset.season;
    modal.querySelector(".pm__en").textContent = item.querySelector(".cl-item__en").textContent;
    modal.querySelector(".pm__name").textContent = [...item.querySelectorAll(".cl-item__name span")].map((s) => s.textContent).join(" ");
    modalSwiper?.destroy(true, true);
    modalSwiper = new Swiper(slider, { loop: false, speed: 225, navigation: { nextEl: next, prevEl: prev }, pagination: { el: modal.querySelector(".pm__dots"), clickable: true } });
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    YK.lenis && YK.lenis.stop();
  };
  const close = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    YK.lenis && YK.lenis.start();
  };
  document.querySelectorAll(".cl-item__img").forEach((b) => b.addEventListener("click", () => open(b.closest(".cl-item"))));
  modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
