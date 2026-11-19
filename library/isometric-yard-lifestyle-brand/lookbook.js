// Photo gallery — tapping a photo turns on a blurred backdrop in .24s and slick (fade · .24s · adaptiveHeight) jumps straight to that slide (built on the first tap, as in the original).
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const modal = document.querySelector(".js-nc-gallery__modal");
  const slider = $(".js-nc-gallery__modal__slider");
  if (!modal || !slider.length) return;
  let made = false, y = 0;
  const open = (i) => {
    if (!made) {
      slider.slick({ fade: true, speed: 240, adaptiveHeight: true, prevArrow: ".js-nc-gallery__modal__btn__prev", nextArrow: ".js-nc-gallery__modal__btn__next" });
      made = true;
    }
    slider.slick("slickGoTo", i, true);
    y = scrollY;
    document.body.style.cssText += `position:fixed;top:${-y}px;width:100%`;
    modal.classList.add("--active");
    modal.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    modal.classList.remove("--active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.position = document.body.style.top = document.body.style.width = "";
    scrollTo(0, y);
  };
  document.querySelectorAll(".n-glb__item").forEach((b) => b.addEventListener("click", () => open(+b.dataset.index)));
  document.querySelector(".js-nc-gallery__modal__btn__close")?.addEventListener("click", close);
  document.querySelector(".js-nc-gallery__modal__overlay")?.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("--active")) close(); });
})();
