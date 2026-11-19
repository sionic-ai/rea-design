(() => {
  // The grid panel turns on with .75s power1.inOut, and clicking a cell opens that photo full screen (fitted within 64px top/bottom · 40px sides) —
  // The panel turns on in .5s (quad inOut) and the photo in .5s after .333s, and on close it vanishes in .25s. Esc or pressing anywhere closes it
  const page = document.querySelector(".uv-research");
  const desc = document.querySelector(".uv-research__desc p");
  const modal = document.querySelector(".uv-modal");
  if (!page) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, d = reduce ? 0 : 1;
  const quad = "power1.inOut";
  gsap.to(page, { opacity: 1, ease: "power1.inOut", duration: 0.75 * d });
  if (desc) gsap.to(desc, { opacity: 1, ease: "power1.inOut", duration: 0.75 * d, delay: 0.75 * d });
  if (!modal) return;
  const media = modal.querySelector(".uv-modal__media");
  const box = media.querySelector(".wf-img");
  let last = null;
  const fit = (ratio) => {
    const w = innerWidth - 80, h = innerHeight - 128;
    const bw = Math.min(w, h * ratio);
    box.style.width = `${bw}px`;
    box.style.height = `${bw / ratio}px`;
  };
  page.addEventListener("click", (e) => {
    const item = e.target.closest(".uv-research__item");
    if (!item) return;
    last = item;
    box.dataset.label = item.dataset.fullLabel || "";
    box.classList.toggle("wf-video", !!item.querySelector(".wf-video"));
    fit(+item.dataset.ratio || 1);
    modal.hidden = false;
    gsap.killTweensOf([modal, media]);
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.5 * d, ease: quad });
    gsap.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 0.5 * d, delay: 0.333 * d, ease: quad });
    modal.querySelector(".uv-modal__close").focus({ preventScroll: true });
  });
  const close = () => {
    if (modal.hidden) return;
    gsap.killTweensOf([modal, media]);
    gsap.to(modal, { opacity: 0, duration: 0.25 * d, ease: quad, onComplete: () => { modal.hidden = true; last?.focus({ preventScroll: true }); } });
  };
  modal.querySelector(".uv-modal__close").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  addEventListener("resize", () => { if (!modal.hidden && last) fit(+last.dataset.ratio || 1); });
})();
