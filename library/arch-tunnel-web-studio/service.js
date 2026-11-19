// Work method devices — stacking cards (the previous card scales to .92 and darkens while covered by the next), progress-pinned scene, step lines filling up
(() => {
  window.mkPage = window.mkPage || {};
  window.mkPage.service = () => {
    const { reduce } = window.mk;
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => [...document.querySelectorAll(s)];
    const mm = gsap.matchMedia();
    const cards = $$(".mk-stack__card");
    cards.forEach((c, i) => c.style.setProperty("--i", i));
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      cards.slice(0, -1).forEach((c, i) => gsap.to(c, { scale: 0.92, filter: "brightness(.82)", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 140", scrub: true } }));
      gsap.fromTo(".mk-phs__line i", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".mk-phs", start: "top 70%", end: "bottom 70%", scrub: true } });
    });
    // Progress — while the section is pinned, 000% → 100%, in quarters: grid → layout → code → finished screen
    const bs = $(".mk-bs"), pct = $("[data-bs-pct]"), layers = $$(".mk-bs__layer"), steps = $$(".mk-bs__steps p");
    if (bs) {
      const set = (p) => {
        pct.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
        const k = Math.min(3, Math.floor(p * 4));
        layers.forEach((l, i) => gsap.set(l, { opacity: i === 0 ? 1 - Math.max(0, p * 4 - 3) * 0.6 : Math.min(1, Math.max(0, p * 4 - i + 0.5) * 2) * (i === 3 || i >= k ? 1 : 0.35) }));
        steps.forEach((s, i) => s.classList.toggle("is-on", i === k));
      };
      if (reduce) set(1);
      else { set(0); ScrollTrigger.create({ trigger: bs, start: "top top", end: "bottom bottom", onUpdate: (st) => set(st.progress) }); }
    }
    return () => mm.revert();
  };
})();
