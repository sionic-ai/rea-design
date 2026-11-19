// Work · inventory list — the original joins cells together to loop endlessly. Attach one more copy of the list and wrap it seamlessly with Lenis infinite.
// While the section moves from the bottom of the screen to the top, the text box comes into place from .66 of a screen below (following late), and the photo drifts from −15% → 15%. Snap pulls it in when it stops near the section top
(() => {
  const { lenis, reduce } = window.fg;
  const list = document.querySelector(".fg-slides");
  const originals = [...list.children];
  if (lenis?.options.infinite) originals.forEach((s) => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelectorAll("a, button").forEach((a) => a.setAttribute("tabindex", "-1")); list.append(c); });
  // Splits the attached set’s buttons the same way as shared.js so their letters roll too
  list.querySelectorAll('[aria-hidden="true"] .fg-btn > span').forEach((label) => {
    if (label.children.length) return;
    const t = label.textContent; label.replaceChildren(...[...t].map((c, i) => { const s = document.createElement("span"); s.textContent = c; s.style.setProperty("--i", i); return s; }));
  });
  window.fg.scene(() => {
    if (reduce) return;
    const slides = [...list.children];
    slides.forEach((s) => {
      const box = s.querySelector(".fg-slide__box");
      const ph = s.querySelector(".fg-slide__bg .fg-ph");
      if (!s.classList.contains("is-hero")) gsap.fromTo(box, { y: () => innerHeight * 0.66 }, { y: 0, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(ph, { yPercent: -12 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Cursor-side tilt — on wide screens the original list board (WebGL PLANE_CONFIG) turns the camera by the cursor (screen ratio −1~1): .0112 rad left-right and .007 rad up-down
    // (field of view 40°, 1 − .94^(dt/16.7) of the remaining distance each time, back to center when leaving the window). The same camera formula also ties in the auto-rotation share — on up-down rotation
    // .7·sin(2πt/8) is added, and the camera spot is (sin t, cos t) × .0084 (screen half height = 1) to draw the circle. A photo without a depth map just turns as a flat plate, with no parallax.
    // Stand the same camera up with CSS — perspective = Half height / tan 20°, rotation center = Camera slot (z = perspective).
    // Panel horizontally (spin to the end + circle drawing = Enlarged by half height × .04) — the original always covers at 1.16x, but the copy keeps the photo slot frame as is and only keeps the edges from going empty
    if (matchMedia("(min-width: 1024px)").matches) {
      const bgs = slides.map((s) => s.querySelector(".fg-slide__bg"));
      const aim = { x: 0, y: 0 }, at = { x: 0, y: 0 };
      let grow = 1;
      const lens = () => {
        grow = 1 + innerHeight * 0.04 / innerWidth;
        const d = innerHeight / 2 / Math.tan(Math.PI / 9);
        slides.forEach((s) => (s.style.perspective = `${d}px`));
        bgs.forEach((b) => (b.style.transformOrigin = `50% 50% ${d}px`));
      };
      lens();
      addEventListener("resize", lens);
      const clamp = gsap.utils.clamp(-1, 1);
      addEventListener("pointermove", (e) => { aim.x = clamp(e.clientX / innerWidth * 2 - 1); aim.y = clamp(e.clientY / innerHeight * 2 - 1); }, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => { aim.x = 0; aim.y = 0; });
      gsap.ticker.add((t, dt) => {
        const k = 1 - 0.94 ** (dt / (1000 / 60));
        at.x += (aim.x - at.x) * k;
        at.y += (aim.y - at.y) * k;
        const half = innerHeight / 2, pitch = 0.007 * (at.y + 0.7 * Math.sin(2 * Math.PI * t / 8));
        const tf = `rotateX(${pitch}rad) rotateY(${0.0112 * at.x}rad) translate3d(${-Math.sin(t) * 0.0084 * half}px, ${Math.cos(t) * 0.0084 * half}px, 0) scale3d(${grow}, ${grow}, 1)`;
        bgs.forEach((b) => (b.style.transform = tf));
      });
    }
    if (lenis && window.Snap && matchMedia("(pointer: fine)").matches) {
      const snap = new Snap(lenis, { type: "proximity", debounce: 300, duration: 1.2 });
      snap.addElements(slides, { align: ["start"] });
    }
  });
})();
