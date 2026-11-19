// Careers — the photo strip nudges embla 1px per tick, and the benefits row advances every 4 seconds (pauses on hover).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Photo strip — embla (dragFree · loop · 16). Every frame the original pushes target by (frame length/16.7)×−1 with scrollBody friction .68 · length 50. Rests while dragging */
  const mv = document.querySelector(".rc-media__view");
  if (mv && window.EmblaCarousel) {
    const api = EmblaCarousel(mv, { dragFree: true, loop: true, axis: "x", direction: "ltr", duration: 16, skipSnaps: true, align: "start" });
    let held = false, t = 0;
    api.on("pointerDown", () => (held = true)).on("pointerUp", () => (held = false));
    const dir = -1;
    const tick = (now) => {
      if (!t) t = now;
      const dt = Math.min(now - t, 50);
      if (!reduce && !held) {
        const e = api.internalEngine();
        e.scrollBody.useFriction(0.68).useDuration(50);
        e.target.add((dt / (1000 / 60)) * dir);
        e.animation.start();
      }
      t = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* Benefits — only the active row is opacity 1, and the side photos at the table’s angle go .5→1 in .3s. The next row comes every 4s, hovering stops on that row, and 4s after release it resumes */
  const list = document.querySelector(".rc-benefits__list");
  if (list) {
    const items = [...list.querySelectorAll(".rc-benefit")];
    const mtrack = document.querySelector(".rc-benefits__mtrack");
    if (mtrack) items.forEach((n) => mtrack.appendChild(n.cloneNode(true)));
    const mitems = mtrack ? [...mtrack.children] : [];
    let on = 0, timer = null;
    const paint = () => { items.forEach((n, i) => n.classList.toggle("is-on", i === on)); mitems.forEach((n, i) => n.classList.toggle("is-on", i === on)); };
    const next = () => { on = (on + 1) % items.length; paint(); timer?.kill(); if (!reduce) timer = gsap.delayedCall(4, next); };
    items.forEach((n, i) => {
      n.querySelector(".rc-benefit__title").addEventListener("mouseenter", () => { on = i; paint(); timer?.kill(); });
      n.querySelector(".rc-benefit__title").addEventListener("mouseleave", () => { timer?.kill(); timer = gsap.delayedCall(4, next); });
    });
    paint();
    if (!reduce && items.length > 1) timer = gsap.delayedCall(4, next);
    if (mtrack && window.EmblaCarousel) {
      const api = EmblaCarousel(mtrack.parentElement, { dragFree: false, loop: false, axis: "x", duration: 20, align: "start", skipSnaps: true, containScroll: false });
      api.on("select", () => { on = api.selectedScrollSnap(); paint(); });
    }
  }

  /* Open slot — embla (left aligned · 20) */
  const rv = document.querySelector(".rc-roles__view");
  if (rv && window.EmblaCarousel) EmblaCarousel(rv, { dragFree: false, loop: false, axis: "x", duration: 20, align: "start", skipSnaps: true, containScroll: false });
})();
