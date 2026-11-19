// Subpage: original HeadingMarquee (endless 100px/s strip) · Title (split-lines 110% → 0, 1.2s reveal) · ParallaxImages (-10% → 0, 1.1x, scrub 1)
(() => {
  function parallax(box) {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      box.querySelectorAll("[data-parallax] .bp-img").forEach((img) => {
        gsap.fromTo(img, { yPercent: -10, scale: 1.1, transformOrigin: "top center" }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: 1 } });
      });
      box.querySelectorAll("[data-split-lines]").forEach((t) => {
        const lines = t.querySelectorAll(".bp-line > span");
        gsap.set(lines, { yPercent: 110 });
        ScrollTrigger.create({ trigger: t, start: "top 80%", once: true, onEnter: () => gsap.to(lines, { yPercent: 0, stagger: 0.1, duration: 1.2, ease: "reveal" }) });
      });
    });
    return () => mm.revert();
  }
  // Original HeadingMarquee: two identical text bands joined end to end, moving left at 100px per second
  function marquee(box) {
    const track = box.querySelector(".bp-marquee__track");
    if (!track || BP.reduced) return () => {};
    const w = track.firstElementChild.offsetWidth;
    const tw = gsap.fromTo(track, { x: 0 }, { x: -w, duration: w / 100, ease: "none", repeat: -1 });
    return () => tw.kill();
  }
  // News tab: keep only the chosen category and re-lay out in .4s
  function tabs(box) {
    const btns = [...box.querySelectorAll(".bp-nlist__tabs button")];
    const cards = [...box.querySelectorAll(".bp-nitem")];
    const offs = btns.map((b) => {
      const h = () => {
        btns.forEach((x) => x.classList.toggle("is-active", x === b));
        const want = b.textContent.trim();
        const st = Flip.getState(cards);
        cards.forEach((c) => (c.hidden = want !== "All" && c.querySelector(".bp-eyebrow").textContent.trim() !== want));
        Flip.from(st, { duration: BP.reduced ? 0 : 0.6, ease: "slow-out", onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.4 }), onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }) });
      };
      b.addEventListener("click", h);
      return () => b.removeEventListener("click", h);
    });
    return () => offs.forEach((f) => f());
  }

  BP.page("works", { ready: (box) => { const a = [parallax(box)]; return () => a.forEach((f) => f()); } });
  BP.page("news", { ready: (box) => { const a = [parallax(box), marquee(box), tabs(box)]; return () => a.forEach((f) => f()); } });
  BP.page("article", { ready: (box) => { const a = [parallax(box), ...[...box.querySelectorAll("[data-smooth-slider]")].map((el) => BP.smooth(el))]; return () => a.forEach((f) => f()); } });
  BP.page("detail", { ready: (box) => { const a = [parallax(box)]; return () => a.forEach((f) => f()); } });
})();
