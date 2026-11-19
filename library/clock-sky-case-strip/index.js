// Case gallery — first entrance (four stacked photos in the center open from the bottom one, top to bottom, growing from .4 to .7x, then after 2.8s fly to their places at .27s intervals
// The photo goes 1.5 → 1.2 → (1.3 pop) → 1.15, names rise over 4.5s at .15s intervals), interaction raise (cell −8px·photo +4px·name roll), and on press the photo goes to the detail hero position.
// Original curves: gallerySlowStart(.9,0,.58,1) · galleryReveal(.46,0,.09,1) · galleryZoomBump(.5,0,.5,1) · h2wMorph(.46,0,.09,1)
(() => {
  const { reduce, headIntro } = window.by;
  gsap.registerPlugin(CustomEase);
  const slow = CustomEase.create("by-slow", "0.9,0,0.58,1");
  const reveal = CustomEase.create("by-reveal", "0.46,0,0.09,1");
  const bump = CustomEase.create("by-bump", "0.5,0,0.5,1");
  const gallery = document.querySelector(".by-gallery");
  const items = [...gallery.querySelectorAll(".by-item")];
  const names = items.map((it) => it.querySelector(".by-name__in"));
  const stages = items.map((it) => it.querySelector(".by-item__stage"));
  const pics = items.map((it) => it.querySelector(".by-img__in"));
  const mobile = matchMedia("(max-width: 767px)").matches;
  const pending = new Set();

  // Video slot only plays when visible
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { root: gallery, threshold: 0.05 });
  gallery.querySelectorAll("video").forEach((v) => io.observe(v));

  const ready = () => {
    gallery.setAttribute("data-fx", "squish-loop-track");
    document.documentElement.classList.remove("by-intro");
  };

  const intro = () => {
    if (reduce) { ready(); headIntro({ instant: true }); return; }
    // Returning from detail keeps the header row and only the cells float up from below at .7x and settle in place (original in-app return 2.1s).
    // A slow-start curve leaves the screen unchanged for a long while after the new page attaches, so the transition is measured as having ended there — use power2.out, which moves right away and has a long tail
    if (sessionStorage.getItem("by-back")) {
      sessionStorage.removeItem("by-back");
      headIntro({ instant: true });
      gsap.set(gallery, { autoAlpha: 1 });
      const tl = gsap.timeline({ onComplete: ready });
      tl.fromTo(stages, { scale: 0.7, y: 120, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 2.1, ease: "power2.out", stagger: 0.15 }, 0)
        .fromTo(pics, { scale: 1.4 }, { scale: 1.15, duration: 2.1, ease: "power2.out", stagger: 0.15 }, 0);
      return;
    }
    const o = Math.min(4, items.length), s = mobile ? Math.min(2, o) : o;
    const T = 2.8, END = T + 1.65;
    const startScale = mobile ? 0.37 : 0.4, midScale = mobile ? 0.74 : 0.7;
    const at = [0, 0.27, 0.5, 0.7], bumpDur = [0, 0.27, 0.5, 0.7];
    const revealAt = [0, 0.76, 1.3, 1.58];
    gsap.set(gallery, { autoAlpha: 1, pointerEvents: "none" });
    gsap.set(names.slice(0, o).map((n) => n.children), { yPercent: 100 });
    const cx = innerWidth / 2, cy = innerHeight / 2;
    stages.slice(0, o).forEach((st, e) => {
      const r = items[e].getBoundingClientRect();
      gsap.set(st, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2), scale: startScale - e * 0.001 });
    });
    pics.slice(0, o).forEach((p, e) => gsap.set(p, { scale: e === 2 ? 1.3 : 1.5 }));
    const tl = gsap.timeline({ delay: 0.6, onStart: () => headIntro({ handAt: 0 }), onComplete: ready });
    tl.to(stages.slice(0, o), { scale: (e) => midScale - e * 0.001, duration: T, ease: slow }, 0);
    pics.slice(0, o).forEach((p, e) => tl.to(p, { scale: e === 2 ? 1 : 1.2, duration: T, ease: slow }, 0));
    stages.slice(0, o).forEach((st, e) => tl.to(st, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.3, ease: reveal, onComplete: () => gsap.set(st, { clipPath: "none" }) }, revealAt[o - 1 - e]));
    for (let e = 0; e < s; e++) {
      const t = T + at[e];
      tl.to(stages[e], { scale: 1, x: 0, y: 0, duration: END - t, ease: reveal }, t);
      const r = e === 2 ? 0.025 : bumpDur[e];
      if (at[e] > 0) tl.to(pics[e], { scale: 1.3, duration: r, ease: bump }, T);
      const i = Math.max(t, T + (at[e] > 0 ? r : 0));
      tl.to(pics[e], { scale: 1.15, duration: END - i, ease: reveal }, i);
    }
    for (let e = s; e < o; e++) tl.to(stages[e], { opacity: 0, duration: [0.15, 0.13][e - s] ?? 0.15, ease: bump, onComplete: () => { gsap.set(names[e].children, { yPercent: 0 }); gsap.set(pics[e], { scale: 1.15 }); gsap.set(stages[e], { clearProps: "all" }); } }, T);
    tl.add(() => gsap.set(gallery, { pointerEvents: "auto" }), END);
    tl.to(names.slice(0, s).map((n) => n.children), { yPercent: 0, duration: 0.8, ease: "power2.out", stagger: 0.15 }, mobile ? 4.1 : 4.5);
  };

  // Hover — two name sets roll up one line in .4s, the cell moves −8px and the photo +4px in .6s power2.out, and they return to place on leave
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    items.forEach((it, i) => {
      // Interaction is attached to the wrapper around the letters and photos that move in the first entrance (the two copies of .by-name__in and .by-img__in) — on the same element it mixes with the first entrance values
      const shift = it.querySelector(".by-img__shift");
      const tl = gsap.timeline({ paused: true }).to(names[i], { yPercent: -100, duration: 0.4, ease: "power2.out" });
      it.addEventListener("mouseenter", () => {
        tl.progress() === 1 ? tl.restart() : tl.play();
        gsap.to(it.querySelector(".by-item__wrap"), { y: -8, duration: 0.6, ease: "power2.out", overwrite: "auto" });
        gsap.to(shift, { y: 4, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      });
      it.addEventListener("mouseleave", () => {
        if (it.dataset.clicked) return;
        gsap.to(it.querySelector(".by-item__wrap"), { y: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
        gsap.to(shift, { y: 0, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      });
    });
  }

  // Press — other cells recede slowly to .7x (phone .864) over 1.27s and the photo goes 1.4x, the cloned pressed photo flies to the detail Hero photo spot in 1.26s and then navigates
  items.forEach((it, i) => it.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const href = it.getAttribute("href");
    if (reduce) { location.href = href; return; }
    it.dataset.clicked = "1";
    gsap.set(gallery, { pointerEvents: "none" });
    // The original attaches a clone of the pressed photo and aligns the video slot, then starts the exit (measured, the screen starts changing around .4s after press)
    gsap.delayedCall(0.1, () => go(it, i, href));
  }));
  const go = (it, i, href) => {
    const others = items.filter((x) => x !== it);
    const order = (k) => (k < 3 ? [0, 0.33, 0.56][k] : 0.56 + 0.23 * (k - 2));
    others.forEach((x, k) => {
      gsap.set(x, { transformOrigin: "50% 40%" });
      gsap.to(x, { scale: mobile ? 0.864 : 0.7, duration: 1.27, ease: slow, delay: 0 });
      gsap.to(x.querySelector(".by-img__in"), { scale: mobile ? 1.3 : 1.4, duration: 1.27, ease: slow });
      gsap.set(x.querySelector(".by-img"), { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
      gsap.to(x.querySelector(".by-img"), { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", duration: 1.27 - 0.2, ease: slow, delay: Math.min(order(k), 1.27 - 0.2) * 0.5 });
      gsap.to(x.querySelector(".by-name"), { autoAlpha: 0, duration: 0.4, ease: "power2.out" });
    });
    gsap.to(it.querySelector(".by-item__wrap"), { y: 0, duration: 1.27, ease: slow });
    gsap.to(names[i], { autoAlpha: 0, duration: 0.4 });
    const from = it.querySelector(".by-img").getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "by-fly";
    fly.innerHTML = it.querySelector(".by-img").innerHTML;
    document.body.append(fly);
    gsap.set(fly, { left: from.left, top: from.top, width: from.width, height: from.height });
    it.querySelector(".by-img").style.visibility = "hidden";
    // Detail Hero photo spot: right 6 of 14 cells, bottom end below the header row (bottom 1.6rem of a 100vh − 6rem box)
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const desktop = innerWidth >= 1025;
    const col = (innerWidth - 3.2 * rem - 13 * 0.8 * rem) / 14;
    const w = desktop ? col * 6 + 5 * 0.8 * rem : innerWidth - 1.6 * rem;
    const h = w * (370 / 295);
    const left = desktop ? innerWidth - 1.6 * rem - w : 0.8 * rem;
    const top = desktop ? innerHeight - 1.6 * rem - h : 10 * rem;
    sessionStorage.setItem("by-from-gallery", JSON.stringify({ i }));
    // In the original, other cells begin slowly receding, and 1.2s later the pressed photo flies to settle in the detail slot around 2.5s (measured exit 2.15s).
    // Delaying the fly-off further leaves a gap between the end of the retreat and the fly-off, so the transition looks split in two
    gsap.to(fly, { left, top, width: w, height: h, duration: 1.26, ease: reveal, delay: 1.2, onComplete: () => gsap.delayedCall(0.05, () => { location.href = href; }) });
  };

  intro();
})();
