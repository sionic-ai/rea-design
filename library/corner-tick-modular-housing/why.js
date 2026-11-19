/* Why us: five ”difference” cards joined as one strip and pushed horizontally (scrub, by the overflow width). Content unfolds up to the card nearest the screen center (.65s) */
(() => {
  const sec = document.querySelector(".tk-diff"), view = sec.querySelector(".tk-diff__view"), track = sec.querySelector(".tk-diff__track");
  const cards = [...track.children];
  const open = (k) => cards.forEach((c, i) => c.classList.toggle("is-open", i <= k));
  open(0);
  gsap.matchMedia().add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    const over = () => Math.max(0, track.scrollWidth - view.offsetWidth);
    gsap.set(track, { x: 0 });
    const tw = gsap.to(track, { x: () => -over(), ease: "none", paused: true });
    const pick = (st) => {
      if (!st || st.progress <= 0.01) return open(0);
      if (st.progress >= 0.98) return open(cards.length - 1);
      const mid = view.offsetWidth / 2, vr = view.getBoundingClientRect();
      let best = 0, d = Infinity;
      cards.forEach((c, i) => { const r = c.getBoundingClientRect(), x = Math.abs(r.left - vr.left + r.width / 2 - mid); if (x < d) { d = x; best = i; } });
      open(best);
    };
    const st = ScrollTrigger.create({ animation: tw, trigger: sec, start: "top top", end: () => `+=${over()}`, scrub: true, pin: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: pick, onRefresh: pick });
    return () => { st.kill(); tw.kill(); gsap.set(track, { clearProps: "transform" }); open(0); };
  });
  // Phone: drag to advance with Embla as in the original (left aligned, one at a time, no looping), and expand up to the selected card
  gsap.matchMedia().add("(max-width: 768px)", () => {
    if (!window.EmblaCarousel) return;
    view.classList.add("is-embla");
    const embla = EmblaCarousel(view, { align: "start", slidesToScroll: 1, loop: false });
    const sel = () => open(embla.selectedScrollSnap());
    embla.on("select", sel);
    sel();
    return () => { embla.destroy(); view.classList.remove("is-embla"); open(0); };
  });
})();
