// CULTURES motion. Photo gather (28.5→1.8%·-3.21→-1.4° / 57→5%·3.78→1.39°, lands on the card, until 489px)·title lines (rotate 5°·120%, stagger .2, sine.out)·
// The description range (3em, transparent → in place, sine.out) is the original bundle value.
(function () {
  const { $, $$, px, lenis } = ZK;

  ZK.ready(() => {
    const mm = gsap.matchMedia();
    mm.add({ pc: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { pc, reduce } = ctx.conditions;
      if (reduce || !pc) return;
      $$(".c-card").forEach((card) => {
        const st = { trigger: card, start: "top top", end: () => `+=${px(1310) - px(489)}`, scrub: true, invalidateOnRefresh: true };
        gsap.fromTo($(".img2", card), { top: "28.5%", rotate: -3.21 }, { top: "1.8%", rotate: -1.4, ease: "none", scrollTrigger: { ...st } });
        gsap.fromTo($(".img3", card), { top: "57%", rotate: 3.782 }, { top: "5%", rotate: 1.39, ease: "none", scrollTrigger: { ...st } });
      });
      $$(".c-env__item").forEach((item) => {
        const tw = gsap.fromTo($$("h2 i", item), { rotation: 5, yPercent: 120 }, { rotation: 0, yPercent: 0, duration: 1, stagger: 0.2, ease: "sine.out", paused: true });
        ScrollTrigger.create({ trigger: $("h2", item), start: "top bottom-=6%", end: "top bottom-=60%", scrub: true, invalidateOnRefresh: true, onUpdate: (s) => tw.progress(s.progress) });
        gsap.fromTo($(".c-env__desc", item), { autoAlpha: 0, y: "3em" }, { autoAlpha: 1, y: 0, ease: "sine.out", scrollTrigger: { trigger: $(".c-env__desc", item), start: "top bottom-=30%", end: "top bottom-=50%", scrub: true, invalidateOnRefresh: true } });
      });
    });
    // On phone, as in the original, each item puts its own image on top (per-item clones instead of a fixed panel).
    if (matchMedia("(max-width: 767px)").matches) {
      const illust = $(".c-env > .c-env__illust");
      $$(".c-env__item").forEach((it, i) => {
        const w = document.createElement("div");
        w.className = "c-env c-env--sp";
        w.dataset.current = i + 1;
        w.appendChild(illust.cloneNode(true));
        it.prepend(w);
      });
    }

    // The text item passing the middle of the screen becomes the current index of the image panel.
    const env = $(".c-block--env > .c-env"), items = $$(".c-env__item");
    const pick = () => {
      const mid = innerHeight * 0.5;
      let cur = 1;
      items.forEach((it, i) => { if (it.getBoundingClientRect().top < mid) cur = i + 1; });
      if (env.dataset.current !== String(cur)) env.dataset.current = cur;
    };
    pick();
    lenis.on("scroll", pick);
  });
})();
