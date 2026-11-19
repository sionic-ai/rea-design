// Each time the section crossing the screen center line (rootMargin −50%) changes, switch to the name of the section nearest the center
(() => {
  kfFx.register("section-name-rail", (el, { options, reduce }) => {
    const sel = options.from || "[data-name]";
    const dur = reduce ? 0 : +(options.dur ?? 0.32), shift = +(options.shift ?? 5);
    const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const ease = (t) => 0.5 * expoOut(t) + 0.5 * (1 - Math.pow(1 - t, 5));
    let secs = [], io = null;
    const hide = () => {
      if (!el.textContent) return;
      gsap.killTweensOf(el);
      gsap.fromTo(el, { opacity: 1, x: 0 }, { opacity: 0, x: -shift, duration: dur, ease, onComplete: () => { el.textContent = ""; } });
    };
    const pick = () => {
      const mid = innerHeight / 2;
      let best = null, dist = Infinity;
      secs.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { const d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < dist) { dist = d; best = s; } }
      });
      const name = best?.getAttribute("data-name")?.trim();
      if (!name) { hide(); return; }
      el.classList.toggle("fx-rail-light", best.getAttribute("data-tone") === "dark");
      const was = el.textContent;
      el.textContent = name;
      if (!was || +getComputedStyle(el).opacity < 0.01) {
        gsap.killTweensOf(el);
        gsap.fromTo(el, { opacity: 0, x: -shift }, { opacity: 1, x: 0, duration: dur, ease });
      }
    };
    const watch = () => {
      io?.disconnect();
      secs = [...document.querySelectorAll(sel)].filter((s) => s !== el);
      io = new IntersectionObserver(pick, { rootMargin: "-50% 0px", threshold: 0 });
      secs.forEach((s) => io.observe(s));
    };
    watch();
    // Rescan if a section arrives late or is removed
    const mo = new MutationObserver(() => { const now = document.querySelectorAll(sel).length; if (now !== secs.length) watch(); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io?.disconnect(); mo.disconnect(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "opacity,transform" }); el.textContent = ""; el.classList.remove("fx-rail-light"); };
  });
})();
