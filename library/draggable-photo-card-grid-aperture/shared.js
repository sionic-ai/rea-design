// Photo diary — intro (eight cards stack up then scatter → grid fisheye unwinds), card open (2s grow → shutter → swup transition), drag hint 3s.
// The grid is drawn by _fx/card-tunnel-grid and the shutter by _fx/iris-shutter, and here the two are connected
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);

  // With reduced motion, card hover enlarge (cursor response) is turned off too — fx-core reads the options after the page script finishes, so changing them here is enough
  const gridEl = $(".pi-grid");
  if (reduce && gridEl) gridEl.setAttribute("data-fx-card-tunnel-grid", `${gridEl.getAttribute("data-fx-card-tunnel-grid") || ""}; hover: 1`);

  const hintFor3s = () => {
    document.body.classList.add("is-intro-done");
    setTimeout(() => document.body.classList.remove("is-intro-done"), 3000);
  };

  // Original figures: each card appears at .9s intervals over .6s power1.out → .3s later scatters in all directions over .8s power2.in → .8s later veil 1s power3.out · fisheye 1s power3.out
  function intro(skip) {
    const veil = $(".pi-intro"), grid = $(".pi-grid");
    if (!veil || !grid) return;
    const cards = [...veil.querySelectorAll(".pi-intro__card")];
    if (skip || reduce || !cards.length) {
      veil.classList.add("is-hidden");
      cards.forEach((c) => c.remove());
      grid.dispatchEvent(new CustomEvent("fx:release", { detail: { dur: 0 } }));
      return;
    }
    const tl = gsap.timeline();
    cards.forEach((c, i) => {
      c.style.zIndex = String(i + 1);
      gsap.set(c, { rotation: (Math.random() - 0.5) * 30 });
      tl.to(c, { opacity: 1, duration: 0.6, ease: "power1.out" }, i * 0.9);
    });
    tl.add(() => {
      const n = cards.length, base = Math.random() * Math.PI * 2;
      cards.forEach((c, i) => {
        const a = base + (Math.PI * 2 * i) / n + (Math.random() - 0.5) * (Math.PI / n);
        const d = innerWidth * (0.6 + (i / n) * 0.4 + (Math.random() - 0.5) * 0.2);
        gsap.to(c, { x: Math.cos(a) * d, y: Math.sin(a) * d, rotation: `+=${(Math.random() - 0.5) * 60}`, opacity: 0, duration: 0.8, ease: "power2.in" });
      });
    }, "+=0.3");
    tl.add(() => {
      gsap.to(veil, { opacity: 0, duration: 1, ease: "power3.out" });
      grid.dispatchEvent(new CustomEvent("fx:release", { detail: { dur: 1, ease: "power3.out" } }));
      gsap.delayedCall(1, () => {
        cards.forEach((c) => c.remove());
        veil.classList.add("is-hidden");
        veil.style.opacity = "";
        hintFor3s();
      });
    }, "+=0.8");
  }

  // Card open — grows from the card spot to a 90% square of the screen over 2s, moves on after the shutter closes 2s later
  function bindOpen() {
    const grid = $(".pi-grid"), shot = $(".pi-photo"), img = $(".pi-photo__img"), shutter = $(".pi-shutter");
    if (!grid || !shot || !img) return;
    grid.addEventListener("fx:open", (e) => {
      const { rect, image, href } = e.detail;
      grid.dispatchEvent(new CustomEvent("fx:busy", { detail: true }));
      img.src = image;
      Object.assign(img.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${rect.w}px`, height: `${rect.h}px` });
      img.classList.remove("is-animating");
      shot.classList.add("is-active");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        img.classList.add("is-animating");
        const s = Math.min(innerWidth * 0.9, innerHeight * 0.9);
        Object.assign(img.style, { left: `${(innerWidth - s) / 2}px`, top: `${(innerHeight - s) / 2}px`, width: `${s}px`, height: `${s}px` });
      }));
      const go = () => {
        if (window.swupApp && href) swupApp.navigate(href);
        else if (href) location.href = href;
        setTimeout(() => {
          shot.classList.remove("is-active");
          img.classList.remove("is-animating");
          grid.dispatchEvent(new CustomEvent("fx:busy", { detail: false }));
        }, 100);
      };
      setTimeout(() => {
        if (!shutter) return go();
        shutter.addEventListener("fx:closed", go, { once: true });
        shutter.dispatchEvent(new CustomEvent("fx:close"));
      }, reduce ? 0 : 2000);
    });
  }

  // Transition — swup 4.8.2 + JS plugin. If the shutter is already closed, skip the outgoing fade, on entering, lift the shutter and fade in over 250ms
  if (window.Swup && window.SwupJsPlugin && !reduce) {
    const fade = (from, to) => document.querySelector("#swup").animate([{ opacity: from }, { opacity: to }], 250).finished;
    window.swupApp = new Swup({
      containers: ["#swup"],
      animationSelector: '[class*="transition-"]',
      plugins: [new SwupJsPlugin({
        animations: [{
          from: "(.*)",
          to: "(.*)",
          out: async () => { if (!$(".pi-shutter")?.classList.contains("is-active")) await fade(1, 0); },
          in: async () => {
            const sh = $(".pi-shutter");
            if (sh?.classList.contains("is-active")) sh.dispatchEvent(new CustomEvent("fx:reset"));
            await fade(0, 1);
          },
        }],
      })],
    });
    swupApp.hooks.on("page:view", () => { intro(true); bindOpen(); });
  }

  const start = () => { intro(false); bindOpen(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
