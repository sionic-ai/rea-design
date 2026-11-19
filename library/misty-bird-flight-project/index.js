// First page — original st({delay:.5}) in this order:
// Fog board 2s entrance + to color → background bird starts flying → big English text 1 (1s after .5s) → at .3 the background bird floats up
// → Hero copy floats up as the fog turns gray (2s) → .5s later two logo birds fly + wordmark letters appear in random order (1s expo.inOut)
// → color ball at .6, then language, menu button and video cell at .1s intervals.
(() => {
  const { stage, fade, modal, reduce, isSP } = window.ns;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Hero ----------
  const lines = qa(".ns-mv__line");
  const copy = q(".ns-mv__copy");
  const typo = [...qa(".ns-mv__typo-main b"), q(".ns-mv__typo-sub")].filter(Boolean);
  const introItems = qa(".ns-introitem");
  if (reduce) {
    gsap.set(lines, { opacity: isSP() ? 0.27 : 0.3 });
    gsap.set([...typo, copy, ...introItems], { opacity: 1 });
    stage?.intro(); stage?.gray({ duration: 0 }); stage?.flyMain(); stage?.ballsIn();
  } else {
    gsap.set([copy, ...introItems], { opacity: 0 });
    gsap.delayedCall(0.5, () => {
      stage?.intro();
      stage?.color();
      stage?.flyBirds();
      gsap.to(lines, { opacity: 1, duration: 1, delay: 0.5, ease: "power2.out", onComplete: () => {
        gsap.to(lines, { opacity: isSP() ? 0.27 : 0.3, duration: 1, ease: "power2.out" });
        stage?.birdsIn();
        const next = () => {
          stage?.gray();
          gsap.delayedCall(0.5, () => {
            stage?.flyMain();
            gsap.to(typo, { opacity: 1, duration: 1, ease: "expo.inOut", stagger: { amount: 0.2, from: "random" }, onComplete: () => {
              stage?.ballsIn();
              introItems.forEach((el, i) => fade(el, 1, { delay: 0.1 * i }));
            } });
          });
        };
        fade(copy, 1, { delay: 0.5, onStart: next });
      } });
    });
  }

  // ---------- News slider — Splide perPage 1 · perMove 1 · drag, on advance the number and progress bar (current/total) ----------
  const sliderEl = q(".ns-news__slider");
  if (sliderEl && window.Splide) {
    const total = qa(".splide__slide", sliderEl).length;
    const slider = new Splide(sliderEl, { perPage: 1, perMove: 1, drag: true, snap: true, arrows: false, pagination: false, autoWidth: true, breakpoints: { 768: { perPage: 1 } } });
    const now = q(".ns-ctrl__now"), bar = q(".ns-ctrl__cur");
    q(".ns-ctrl__total").textContent = String(total);
    slider.on("move", (i) => {
      now.textContent = String(i + 1);
      gsap.to(bar, { x: `${100 * (i / total)}%` });
    });
    slider.mount();
    const [prev, next] = qa(".ns-ctrl__btns .ns-circle");
    prev?.addEventListener("click", () => slider.go("<"));
    next?.addEventListener("click", () => slider.go(">"));
  }

  // ---------- Members overlay window ----------
  const mModal = modal(q(".ns-mmodal"), ".ns-mmodal__item");
  qa("[data-member-open]").forEach((card) => card.addEventListener("click", () => {
    const name = q(".ns-member__name", card)?.textContent, pos = q(".ns-member__pos", card)?.textContent;
    q(".ns-mmodal__name").textContent = name;
    q(".ns-mmodal__pos").textContent = pos;
    mModal?.open();
  }));

  // ---------- Video overlay — the dark layer lifts up (−110%) after .1s ----------
  const vRoot = q(".ns-vmodal"), vPanel = q(".ns-vmodal__panel");
  const vModal = modal(vRoot, ".ns-vmodal__item", {
    onOpen: () => gsap.fromTo(vPanel, { yPercent: 0 }, { yPercent: -110, duration: 1, ease: "expo.out", delay: 0.1 }),
    onClose: () => gsap.to(vPanel, { yPercent: 0, duration: 1, ease: "expo.out", delay: 0.2 }),
  });
  qa("[data-video-open]").forEach((b) => b.addEventListener("click", () => vModal?.open()));

  // ---------- Q&A — a white translucent layer spreads on the answer board (1s) and the answer rises (GSAP default .5s) ----------
  qa(".ns-qa").forEach((item) => {
    const inner = q(".ns-qa__inner", item), a = q(".ns-qa__a", item), btn = q(".ns-qa__btn", item), content = q(".ns-qa__content", item);
    let open = false;
    inner.addEventListener("click", (e) => {
      if (e.target.closest(".ns-qa__content a")) return;
      open = !open;
      a.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (open) gsap.to(content, { opacity: 1, display: "block", onComplete: () => ScrollTrigger.refresh() });
      else gsap.to(content, { opacity: 0, display: "none", onComplete: () => ScrollTrigger.refresh() });
    });
  });
})();
