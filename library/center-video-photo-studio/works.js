// Work list — pressing a card opens a micromodal photo panel, and on wide screens the panel’s vertical scroll is turned into horizontal movement of the photo row (original: gsap.to scrollLeft from scrollTop on every scroll)
(() => {
  const modal = document.getElementById("kw-gallery");
  if (!modal || !window.MicroModal) return;
  const wrap = modal.querySelector(".kw-gallery__wrap"), content = modal.querySelector(".kw-gallery__content");
  const title = modal.querySelector("[data-gallery-title]");
  const sync = () => gsap.to(wrap, { scrollLeft: wrap.scrollTop });
  const size = () => gsap.set(wrap, { "--content-height": `${content.offsetWidth}px` });
  let mm = null;
  const side = () => {
    mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      size();
      wrap.addEventListener("scroll", sync, { passive: true });
      addEventListener("resize", size);
      return () => { wrap.removeEventListener("scroll", sync); removeEventListener("resize", size); gsap.set(wrap, { "--content-height": "auto" }); };
    });
  };
  document.querySelectorAll("[data-gallery-trigger]").forEach((b) => b.addEventListener("click", () => {
    if (title && b.dataset.title) title.textContent = b.dataset.title;
    MicroModal.show("kw-gallery", {
      disableScroll: true,
      disableFocus: true,
      awaitOpenAnimation: !KW.reduce,
      awaitCloseAnimation: !KW.reduce,
      onShow: () => {
        KW.lenis?.stop();
        wrap.scrollTo(0, 0);
        setTimeout(() => { side(); setTimeout(() => wrap.classList.add("is-opened"), 500); }, 300);
      },
      onClose: () => {
        mm?.revert();
        mm = null;
        wrap.classList.remove("is-opened");
        KW.lenis?.start();
      },
    });
  }));
})();
