/* A clinic case — hero entrance and two circles (twist following the cursor with a mouse, drift slowly with a finger), intro photo · description */
(() => {
  const { reduce, fontsReady, splitLines, $, $$ } = ND;

  function hero() {
    const sec = $("[data-s-hero]");
    if (!sec) return;
    const title = $('[data-s-hero="title"]', sec), text = $('[data-s-hero="cta-text"]', sec), btn = $('[data-s-hero="cta-btn"]', sec);
    if (reduce) { gsap.set([text, btn], { y: 0, opacity: 1 }); gsap.set(title, { opacity: 1 }); return; }
    fontsReady.then(() => {
      splitLines(title, { delay: 0.4 });
      const tl = gsap.timeline({ delay: 1.1, defaults: { ease: "power3.out", duration: 0.9 } });
      tl.to(text, { y: 0, opacity: 1 }, 0).to(btn, { y: 0, opacity: 1 }, 0.1);
      tl.from(btn.querySelectorAll(":scope > span"), { yPercent: 60, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.2);
    });
    // Per circle: push (px), rotation (°), direction, stretch — original values
    const lines = $$(".nd-shero__line", sec);
    const cfg = [{ amp: 44, rot: 6, dir: 1, stretch: 0.05 }, { amp: 26, rot: -4, dir: -1, stretch: 0.035 }];
    const c = (i) => cfg[i] || cfg[cfg.length - 1];
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const S = lines.map((el, i) => ({
        c: c(i),
        x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3" }),
        r: gsap.quickTo(el, "rotation", { duration: 1.4, ease: "power3" }),
        sx: gsap.quickTo(el, "scaleX", { duration: 1.1, ease: "power3" }), sy: gsap.quickTo(el, "scaleY", { duration: 1.1, ease: "power3" }),
      }));
      // The original has even the header row inside the circle decoration panel (s-hero-box), so the circle follows over the menu too — receive from the whole window and use only the hero range
      let inside = false;
      const rest = () => S.forEach(({ x, y, r, sx, sy }) => { x(0); y(0); r(0); sx(1); sy(1); });
      addEventListener("pointermove", (e) => {
        const b = sec.getBoundingClientRect();
        if (e.clientY < b.top || e.clientY > b.bottom) { if (inside) { inside = false; rest(); } return; }
        inside = true;
        const nx = ((e.clientX - b.left) / b.width - 0.5) * 2, ny = ((e.clientY - b.top) / b.height - 0.5) * 2;
        S.forEach(({ c: k, x, y, r, sx, sy }) => { x(nx * k.amp * k.dir); y(ny * k.amp * k.dir); r(nx * k.rot); sx(1 + Math.abs(nx) * k.stretch); sy(1 + Math.abs(ny) * k.stretch); });
      });
      document.documentElement.addEventListener("pointerleave", () => { inside = false; rest(); });
      return;
    }
    lines.forEach((el, i) => {
      const k = c(i), ax = k.amp * 0.6 * k.dir, ay = k.amp * 0.45 * k.dir, O = { ease: "sine.inOut", repeat: -1, yoyo: true };
      gsap.fromTo(el, { x: -ax }, { x: ax, duration: 7 + i * 1.5, ...O });
      gsap.fromTo(el, { y: -ay }, { y: ay, duration: 9 + i * 1.5, ...O });
    });
  }

  function about() {
    const sec = $("[data-s-about]");
    if (!sec) return;
    const cap = $('[data-s-about="caption"]', sec), title = $('[data-s-about="title"]', sec), img = $('[data-s-about="img"]', sec);
    const items = $$(".nd-sitem", sec);
    if (reduce) { gsap.set([cap, img, ...$$("[data-s-about]", sec)], { opacity: 1, y: 0, scale: 1 }); return; }
    gsap.to(cap, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: cap, start: "top 85%" } });
    gsap.to(img, { scale: 1, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: img, start: "top 85%" } });
    items.forEach((it) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: it, start: "top 88%" }, defaults: { ease: "power3.out", duration: 0.8 } });
      tl.to($('[data-s-about="item-circle-icn"]', it), { opacity: 1, scale: 1 }, 0).to($('[data-s-about="item-text"]', it), { opacity: 1, y: 0 }, 0.1);
    });
    splitLines(title, { scrollTrigger: { trigger: title, start: "top 80%" } });
  }

  addEventListener("DOMContentLoaded", () => { hero(); about(); });
})();
