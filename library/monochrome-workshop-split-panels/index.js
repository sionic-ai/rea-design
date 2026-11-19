// Home-page-only motion: the original Index (hero video · progress line · vertical photo) and Gallery (5s advance · thumbnail overlap) with the same values.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Every 5 seconds of video the scene number rises (0 one frame before the last), and the progress line fills at (length-0.6s) then folds to the right
  const fv = document.querySelector(".tn-fv");
  const video = fv.querySelector(".tn-fv__video video");
  const bar = fv.querySelector(".tn-fv__bar");
  const FRAME = 1 / 24;
  let last = 0;
  const nextFrame = (fn) => (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(fn) : requestAnimationFrame(fn));
  const tick = () => {
    const t = video.currentTime;
    const d = video.duration || 20;
    fv.dataset.position = t + FRAME > d ? 0 : Math.floor((t + FRAME) / 5);
    const p = t / (d - 0.6);
    bar.style.transform = "scaleX(" + Math.min(1, p) + ")";
    if (p >= 1) bar.classList.add("is-rewind");
    if (last > t) bar.classList.remove("is-rewind");
    last = t;
    nextFrame(tick);
  };
  addEventListener("tn:ready", () => {
    if (reduce) { fv.dataset.position = 0; return; }
    video.play().then(tick).catch(() => { fv.dataset.position = 0; });
  }, { once: true });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(video, { yPercent: 0 }, {
      yPercent: ((1.4 - 1) / 1.4) * 100,
      ease: "none",
      scrollTrigger: { trigger: fv, start: "top top", endTrigger: fv.querySelector(".tn-fv__video"), end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
  });

  // Gallery — when the current slide’s 5s shrink ends (animationend), the next slide. Thumbnails get position names (is-a0~4) on the five before and after to push the overlap
  document.querySelectorAll(".tn-gallery").forEach((gallery) => {
    const pages = [...gallery.querySelectorAll(".tn-gallery__img")];
    const holder = gallery.querySelector(".tn-gallery__thumbs-in");
    const n = pages.length;
    let pos = 0;
    const thumbs = pages.map((page) => {
      const t = page.cloneNode(true);
      t.className = "tn-gallery__thumb";
      holder.append(t);
      return t;
    });
    const NAMES = ["is-a0", "is-a1", "is-a2", "is-a3", "is-a4"];
    const paint = (forward) => {
      thumbs.forEach((t) => t.classList.remove(...NAMES));
      [-1, 0, 1, 2, 3].map((o) => (pos + o + n) % n).forEach((i, k) => thumbs[i].classList.add(NAMES[k]));
      holder.classList.remove("is-prev", "is-next");
      holder.classList.add(forward ? "is-next" : "is-prev");
    };
    const go = (step) => {
      pos = (pos + step + n) % n;
      gallery.dataset.position = pos;
      paint(step > 0);
    };
    gallery.querySelector(".tn-gallery__prev").addEventListener("click", () => go(-1));
    gallery.querySelector(".tn-gallery__next").addEventListener("click", () => go(1));
    pages.forEach((p) => p.addEventListener("animationend", (e) => { if (e.target === p) go(1); }));
    gallery.dataset.position = pos;
    paint(true);
    ScrollTrigger.create({ trigger: gallery, start: "top bottom", onEnter: () => gallery.classList.add("is-active") });
  });
})();
