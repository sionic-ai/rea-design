// Two lines per cell (horizontal · vertical) are drawn separately so the whole grid is struck cell by cell — the board takes the top · left lines and the cells take the bottom · right ones, so they do not overlap their neighbors.
// Vertical lines start later than horizontal ones (panel .4s, cell .28s) so a line seems to bend down at the corner.
(() => {
  kfFx.register("tile-line-draw", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    const frame = /look:\s*frame/.test(el.getAttribute("data-fx-tile-line-draw") || "");
    const dur = +(options.dur ?? (frame ? 1.2 : 0.9)), lag = +(options.lag ?? (frame ? 0.4 : 0.28)), delay = +(options.delay ?? 0);
    const out = +(options.out ?? 0.4), ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const hold = options.hold || "";
    let tws = [], st = null, mo = null;
    gsap.set(el, { "--draw-x": 0, "--draw-y": 0 });
    const play = () => {
      tws = [
        gsap.to(el, { "--draw-x": 1, duration: dur, ease, delay }),
        gsap.to(el, { "--draw-y": 1, duration: dur, ease, delay: delay + lag }),
      ];
    };
    const arm = () => { st = ScrollTrigger.create({ trigger: el, start: options.start || "top 88%", once: true, scroller, onEnter: play }); };
    const root = document.documentElement;
    if (hold && root.classList.contains(hold)) {
      mo = new MutationObserver(() => { if (!root.classList.contains(hold)) { mo.disconnect(); mo = null; arm(); } });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    } else arm();
    const leave = () => {
      st?.kill(); mo?.disconnect();
      tws.forEach((t) => t.kill());
      gsap.to(el, { "--draw-x": 0, "--draw-y": 0, duration: out, ease: "power2.in" });
    };
    el.addEventListener("fx:leave", leave);
    return () => {
      st?.kill(); mo?.disconnect();
      tws.forEach((t) => t.kill());
      gsap.killTweensOf(el, "--draw-x,--draw-y");
      el.removeEventListener("fx:leave", leave);
      gsap.set(el, { clearProps: "--draw-x,--draw-y" });
    };
  });
})();
