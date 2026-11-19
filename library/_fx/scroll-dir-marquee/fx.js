// The band flows endlessly and reverses when scroll direction changes, and the whole band is shifted ±drift vw while the panel passes the screen.
// While scrolling up, fx-sdm-up is added to the panel so children like the arrow spin via css
(() => {
  kfFx.register("scroll-dir-marquee", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const track = el.querySelector("[data-fx-part=track]");
    const set = track && track.querySelector("[data-fx-part=set]");
    if (!set) return;
    const dir = options.dir === "right" ? 1 : -1;
    const drift = +(options.drift ?? 10);
    const clones = [];
    for (let i = 0; i < (parseInt(options.dup ?? 2, 10) || 0); i++) { const c = set.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c); clones.push(c); }
    track.style.marginLeft = `${-drift}%`;
    track.style.width = `${drift * 2 + 100}%`;
    const sets = [set, ...clones];
    const mm = gsap.matchMedia();
    if (!reduce) mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Original speed rule: one turn = speed × (width of one set ÷ screen width), ×.25 below 479 width · ×.5 below 991
      const w = innerWidth, mult = w < 479 ? 0.25 : w < 991 ? 0.5 : 1;
      const dur = (+(options.speed ?? 15) || 15) * (set.offsetWidth / w) * mult;
      const loop = gsap.to(sets, { xPercent: -100, repeat: -1, duration: dur, ease: "none" }).totalProgress(0.5);
      gsap.set(sets, { xPercent: dir === 1 ? 100 : -100 });
      loop.timeScale(dir).play();
      ScrollTrigger.create({
        trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const down = self.direction === 1;
          loop.timeScale(down ? -dir : dir);
          el.classList.toggle("fx-sdm-up", !down);
        },
      });
      const from = dir === -1 ? drift : -drift;
      gsap.fromTo(track, { x: `${from}vw` }, { x: `${-from}vw`, ease: "none", scrollTrigger: { trigger: el, ...(scroller && { scroller }), start: "0% 100%", end: "100% 0%", scrub: 0 } });
    });
    return () => { mm.revert(); clones.forEach((c) => c.remove()); track.style.marginLeft = track.style.width = ""; el.classList.remove("fx-sdm-up"); };
  });
})();
